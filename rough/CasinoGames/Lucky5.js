import React, { useState, useEffect } from "react";
import { fetchCasinoExposureApi } from "../../api/api";
import { useSocket } from "../../components/Socket/useSocket";
import { getCardImage, getValueAfterDot } from "../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import { useGetFileData } from "../../hooks/useGetFileData";

const Lucky5 = ({ onBetSelection, lastBetTime, exposureTrigger }) => {
    const { CODE, game_type, phpFile, game_name, iframe_url } = useGetFileData();
    const [isDrawerOpen, setIsDrawerOpen] = useState(true);
    const [gameData, setGameData] = useState(null);
    const [exposureData, setExposureData] = useState([]);

    useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.[0]?.mid) return;
            try {
                const response = await fetchCasinoExposureApi({
                    markettype: CODE,
                    main_event_id: gameData.t1[0].mid,
                    curPageName: phpFile,
                });
                if (Array.isArray(response?.data)) {
                    setExposureData(response.data);
                }
            } catch (error) {
                console.error("Error fetching exposure:", error);
            }
        };
        fetchExposure();
    }, [gameData?.t1?.[0]?.mid, lastBetTime, exposureTrigger, CODE, phpFile]);

    const getExposure = (marketId) => {
        if (!Array.isArray(exposureData)) return 0;
        const market = exposureData.find((item) => item.market_id == marketId);
        return market ? market.win_loss || market.total_exposure : 0;
    };

    const renderExposure = (marketId) => {
        const exposure = getExposure(marketId);
        if (exposure === 0) return null;
        return (
            <div className={`${exposure > 0 ? 'book-green' : 'book-red'}`}>
                {exposure}
            </div>
        );
    };

    const socket = useSocket("casino");
    useEffect(() => {
        if (!socket) return;

        const handleData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) {
                    setGameData(payload);
                }
            } catch (error) {
                console.error("Error processing game data:", error);
            }
        };

        const handleConnect = () => {
            socket.emit("Room", game_type);
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on(game_type, handleData);
        socket.on("game", handleData);

        return () => {
            socket.off("connect", handleConnect);
            socket.off(game_type, handleData);
            socket.off("game", handleData);
        };
    }, [socket, game_type]);

    const isSuspended = (status) => {
        if (!status) return false;
        const s = status.toString().toUpperCase();
        return s === "SUSPENDED" || s === "0" || s === "BALL RUNNING" || s === "LOCKED";
    };

    const getMinMax = (sid) => {
        const market = gameData?.t2?.find((m) => m.sid === sid);
        return {
            min: market?.min || 100,
            max: market?.max || 25000,
        };
    };

    const handleOddsClick = (teamName, odds, sid, isBack) => {
        const market = getOddsBySid(sid);
        if (!isSuspended(market?.gstatus) && onBetSelection) {
            const { min, max } = getMinMax(sid);
            onBetSelection({
                teamName,
                odds,
                minBet: min,
                maxBet: max,
                isBack,
                marketId: sid,
                eventId: getValueAfterDot(gameData?.t1?.[0]?.mid),
            });
        }
    };

    const getOddsBySid = (sid) => {
        return gameData?.t2?.find((item) => item.sid === sid);
    };

    const VideoCards = () => {
        const t1 = gameData?.t1?.[0];
        if (!t1) return null;

        // const getCardImg = (val) => {
        //     if (!val || val === "1") return "https://wver.sprintstaticdata.com/v207/static/front/img/cards/1.png";
        //     return `https://wver.sprintstaticdata.com/v207/static/front/img/cards/${val}.png`;
        // };

        return (
            <div className="lucky5-video-cards-wrapper" style={{
                display: "flex",
                flexDirection: "row",
                gap: "5px",
                padding: "5px",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <div style={{ display: "flex", gap: "5px" }}>
                    {t1.C1 && (
                        <img
                            src={getCardImage(Array.isArray(t1.C1) ? t1.C1[0] : t1.C1)}
                            style={{ width: "25px", height: "auto", borderRadius: "2px" }}
                        />
                    )}
                </div>
            </div>
        );
    };

    const BettingBox = ({ sid, teamName, boxType = "back", customOdds, label, children, className }) => {
        const market = getOddsBySid(sid);
        const odds = market ? (market.b1 ?? market.rate ?? market.odds) : (customOdds || "");
        const suspended = market ? isSuspended(market.gstatus) : true;

        const isMainBet = className === "low-odds" || className === "high-odds";

        return (
            <div
                className={`${className || ""} ${suspended ? `suspended ${Number(getExposure(sid)) ? 'lock-top' : ''}` : ""}`}
                onClick={() => !suspended && handleOddsClick(teamName, odds, sid, true)}
                style={{ cursor: suspended ? "not-allowed" : "pointer", position: "relative" }}
            >
                <div className="casino-odds">{odds}</div>
                <div className="text-center casino-buttons">{label && (isMainBet ? <span>{label}</span> : label)}{children}</div>
                {renderExposure(sid)}
            </div>
        );
    };

    const CardBox = ({ sid, cardVal, teamName }) => {
        const market = getOddsBySid(sid);
        const allCardsLocked = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].every(s => isSuspended(getOddsBySid(s)?.gstatus));
        const odds = market ? (market.b1 || market.rate || market.odds) : (allCardsLocked ? "0" : "10");
        const suspended = market ? isSuspended(market.gstatus) : true;

        const getCardImg = (val) => `https://wver.sprintstaticdata.com/v207/static/front/img/cards/${val}.png`;
        const card_ = cardVal === 'A' ? 'A' : cardVal;

        return (
            <div
                className={`casino-card-item`}
                onClick={() => !suspended && handleOddsClick(teamName, odds, sid, true)}
                style={{ cursor: suspended ? "not-allowed" : "pointer", position: "relative" }}
            >
                <div className={`card-image ${suspended ? "suspended" : ""}`}><img src={getCardImg(card_)} alt={cardVal} /></div>
                {renderExposure(sid)}
                {/* {suspended && (
                    <i className="fas fa-lock" style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "#AAAFB5",
                        fontSize: "14px",
                        zIndex: 10
                    }}></i>
                )} */}
            </div>
        );
    };

    return (
        <div className="casino-table lucky7">
            <style>
                {`
  /*! CSS Used from: https://wver.sprintstaticdata.com/v207/static/front/css/bootstrap.min.css */
*,
::after,
::before {
    box-sizing: border-box;
}

a {
    color: #007bff;
    text-decoration: none;
    background-color: transparent;
}

a:hover {
    color: #0056b3;
    text-decoration: underline;
}

img {
    vertical-align: middle;
    border-style: none;
}

.img-fluid {
    max-width: 100%;
    height: auto;
}

.d-none {
    display: none !important;
}

.w-100 {
    width: 100% !important;
}

.mt-1 {
    margin-top: .25rem !important;
}

.text-center {
    text-align: center !important;
}

@media print {

    *,
    ::after,
    ::before {
        text-shadow: none !important;
        box-shadow: none !important;
    }

    a:not(.btn) {
        text-decoration: underline;
    }

    img {
        page-break-inside: avoid;
    }
}

/*! CSS Used from: https://wver.sprintstaticdata.com/v207/static/front/css/style.css */
* {
    outline: 0 !important;
}

a,
a:hover,
a:focus {
    text-decoration: none;
}

.casino-video-last-results {
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    display: -webkit-flex;
    align-content: flex-start;
    flex-wrap: wrap;
    transition: 1s;
    overflow: hidden;
}

.casino-video-last-results span,
.casino-video-last-results a {
    width: 35px;
    margin-left: 5px;
    margin-top: 5px;
    border-radius: 0;
    height: 35px;
    text-align: center;
    line-height: 35px;
    background-color: #434343;
    color: #fff;
    cursor: pointer;
    font-weight: bold;
}

.casino-video-last-results span.resulthigh {
    color: var(--text-green);
}

.casino-video-last-results span.resultlow {
    color: var(--text-red);
}

.casino-video-last-results a.result-more {
    width: 100%;
    line-height: 1.8;
    margin-right: 5px;
    margin-bottom: 5px;
    color: var(--text-white);
}

.casino-detail {
    padding: 4px;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    -moz-transform: translateZ(0);
    -ms-transform: translateZ(0);
    -o-transform: translateZ(0);
}

.casino-cards {
    display: flex;
    display: -webkit-flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
}

.casino-card-item {
    margin-right: 5px;
    width: auto;
    margin-bottom: 5px;
    min-width: 60px;
}

.casino-card-item:last-child {
    margin-right: 0;
}

.casino-card-item .card-image {
    display: inline-block;
}

.casino-card-item .card-image img {
    width: 50px;
}

.casino-card-item .card-image {
    cursor: pointer;
}

.casino-odds {
    font-weight: var(--font-bold);
    text-align: center;
    width: 100%;
    line-height: 18px;
    position: relative;
}

.casino-buttons {
    text-align: center;
    line-height: 18px;
    margin-top: 5px;
    text-transform: uppercase;
    font-weight: bold;
}

.casino-buttons img {
    height: 25px;
}

.casino-book {
    text-align: center;
    font-size: var(--font-caption);
    line-height: 18px;
    margin-top: 2px;
}

`}
            </style>

            <style>{`

/*! CSS Used from: https://wver.sprintstaticdata.com/v207/static/front/css/responsive.css */
@media only screen and (min-width: 320px) and (max-width: 1279px) {
    .casino-cards img {
        height: 32px;
    }

    .casino-detail {
        padding: 2px;
    }
}

@media only screen and (min-width: 1280px) and (max-width: 1599px) {
    .casino-detail {
        padding: 5px;
    }

    .casino-video-last-results {
        width: 65px;
        height: 185px;
    }

    .casino-video-last-results span,
    .casino-video-last-results a {
        width: 25px;
        height: 25px;
        line-height: 25px;
    }

    .casino-buttons img {
        height: 22px;
    }

    .casino-card-item .card-image img {
        width: 40px;
    }

    .casino-card-item {
        min-width: 50px;
    }
}

@media only screen and (min-width: 320px) and (max-width: 767px) {

    .casino-card-item .card-image img {
        height: auto;
    }

    .casino-video-last-results {
        position: relative;
        top: 0;
        background-color: transparent;
        justify-content: center;
        width: 100%;
        right: 0;
        padding: 0;
        margin-top: 4px;
        height: auto;
        margin-left: 0;
    }

    .casino-video-last-results span {
        height: 30px;
        width: 30px;
        line-height: 30px;
        margin-right: 2px;
        margin-left: 0;
        background-color: #000;
        box-shadow: 0 0 2px #646464;
    }

    .casino-video-last-results a.result-more {
        width: 30px;
        height: 30px;
        margin-left: 0;
        line-height: 25px;
        margin-right: 0;
        margin-bottom: 0;
        background-color: #000;
        box-shadow: 0 0 2px #646464;
    }

    .casino-card-item {
        min-width: 50px;
        min-width: 70px;
    }

    .casino-card-item .card-image img {
        width: 35px;
    }
}

@media only screen and (min-width: 320px) and (max-width: 374px) {
    .casino-card-item {
        min-width: 55px;
    }
}

@media only screen and (min-width: 768px) and (max-width: 1279px) {
    .casino-card-item .card-image img {
        width: 45px;
        height: auto;
    }

    .casino-card-item {
        min-width: 45px;
    }

    .casino-video-last-results {
        position: relative;
        top: 0;
        background-color: transparent;
        justify-content: center;
        width: 100%;
        right: 0;
        padding: 0;
        margin-top: 10px;
        height: auto;
        margin-left: 0;
    }
}
        `}
            </style>

            <CasinoVideo
                gameName={game_name}
                roundId={gameData?.t1?.[0]?.mid}
                videoSrc={iframe_url}
                autotime={gameData?.t1?.[0]?.autotime}
                totalTime={gameData?.t1?.[0]?.ft} isCardDrawerOpen={isDrawerOpen}
                setIsCardDrawerOpen={setIsDrawerOpen}
                cards={[Array.isArray(gameData?.t1?.[0]?.C1) ? gameData?.t1?.[0]?.C1[0] : gameData?.t1?.[0]?.C1]}
                CardsComponent={VideoCards}
            />

            <div className="casino-detail">
                <div className="casino-box low-high-box">
                    <BettingBox sid={1} teamName="Low Card" label="Low Card" className="low-odds" />
                    <div className="text-center lucky7-card"><img
                        src="https://wver.sprintstaticdata.com/v207/static/front/img/cards/6.png" className="img-fluid" /></div>
                    <BettingBox sid={2} teamName="High Card" label="High Card" className="high-odds" />
                </div>
                <div className="casino-box sidebets-box">
                    <div className="lucky7-extra-bets">
                        <div className="lucky7-extra-bets-item-container">
                            <BettingBox sid={3} teamName="Even" label="Even" className="lucky7-extra-bets-item" />
                        </div>
                        <div className="lucky7-extra-bets-item-container">
                            <BettingBox sid={4} teamName="Odd" label="Odd" className="lucky7-extra-bets-item" />
                        </div>
                        <div className="lucky7-extra-bets-item-container">
                            <BettingBox sid={6} teamName="Black" className="lucky7-extra-bets-item">
                                <img src="https://wver.sprintstaticdata.com/v207/static/front/img/cards/spade.png" /> <img
                                    src="https://wver.sprintstaticdata.com/v207/static/front/img/cards/club.png" />
                            </BettingBox>
                        </div>
                        <div className="lucky7-extra-bets-item-container">
                            <BettingBox sid={5} teamName="Red" className="lucky7-extra-bets-item">
                                <img src="https://wver.sprintstaticdata.com/v207/static/front/img/cards/heart.png" /> <img
                                    src="https://wver.sprintstaticdata.com/v207/static/front/img/cards/diamond.png" />
                            </BettingBox>
                        </div>
                    </div>
                </div>
                <div className="casino-box cards-box">
                    <div className="w-100">
                        <div className="casino-odds">
                            {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].every(sid => isSuspended(getOddsBySid(sid)?.gstatus)) ? "0" : "10"}
                        </div>
                        <div className="casino-cards text-center mt-1">
                            {['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J'].map((card, idx) => (
                                <CardBox key={card} sid={7 + idx} cardVal={card} teamName={`Card ${card}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lucky5;
