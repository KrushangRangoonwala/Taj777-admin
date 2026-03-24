import React, { useState, useEffect } from "react";
import { fetchCasinoExposureApi } from "../../api/api";
import { useSocket } from "../../components/Socket/useSocket";
import { getImage, getValueAfterDot } from "../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import { useGetFileData } from "../../hooks/useGetFileData";

const Lucky7A = ({ onBetSelection, lastBetTime, exposureTrigger }) => {
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

    const renderExposure = (marketId, className = "casino-book") => {
        const exposure = getExposure(marketId);
        if (exposure === 0) return null;
        return (
            <div className={`${className} ${exposure === 0 ? "d-none" : ""} ${exposure > 0 ? 'book-green' : 'book-red'}`}>
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
        const market = gameData?.t2?.find((m) => m.sid == sid);
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
        return gameData?.t2?.find((item) => item.sid == sid);
    };

    const VideoCards = () => {
        const t1 = gameData?.t1?.[0];
        if (!t1) return null;

        const getCardImg = (val) => getImage(val, "cards_new");

        return (
            <>
                {t1.C1 && (
                    <div>
                        <span>
                            <img src={getCardImg(Array.isArray(t1.C1) ? t1.C1[0] : t1.C1)} alt="" />
                        </span>
                    </div>
                )}
            </>
        );
    };

    const formatOdds = (value_) => {
        if (value_ === undefined || value_ === null) return "";
        const value = String(value_);
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        // Remove trailing zeros: 2.10 -> 2.1, 2.00 -> 2
        return num.toString();
    };

    const BettingBox = ({ sid, teamName, boxType = "back", customOdds, label, children, containerClass = "lucky7-extra-bets-item" }) => {
        const market = getOddsBySid(sid);
        const odds = market ? (market.b1 || market.rate || market.odds) : (customOdds || "");
        const suspended = market ? isSuspended(market.gstatus) : true;
        const isExp = Boolean(Number(getExposure(sid)));

        return (
            <div
                className={`${containerClass} ${suspended ? `suspended ${isExp ? 'lock-top' : ''}` : ""}`}
                onClick={() => !suspended && handleOddsClick(teamName, odds, sid, true)}
                style={{ cursor: suspended ? "not-allowed" : "pointer", position: "relative" }}
            >
                <div className="casino-odds">{suspended ? "0" : formatOdds(odds)}</div>
                <div className="text-center casino-buttons">
                    {label !== "" ? <span>{label || teamName}</span> : null}
                    {children || (teamName === "Black" && (
                        <>
                            <img src={getImage('spade', 'cards')} alt="spade" />
                            <img src={getImage('club', 'cards')} alt="club" />
                        </>
                    )) || (teamName === "Red" && (
                        <>
                            <img src={getImage('heart', 'cards')} alt="heart" />
                            <img src={getImage('diamond', 'cards')} alt="diamond" />
                        </>
                    ))}
                </div>
                {renderExposure(sid)}
            </div>
        );
    };

    const CardBox = ({ sid, cardVal, teamName }) => {
        const market = getOddsBySid(sid);
        const odds = market ? (market.b1 || market.rate || market.odds) : "";
        const suspended = market ? isSuspended(market.gstatus) : true;
        const getCardImg = (val) => getImage(val, "cards");

        return (
            <div
                className={`casino-card-item ${suspended ? "suspended" : ""}`}
                onClick={() => !suspended && handleOddsClick(teamName, odds || "12", sid, true)}
                style={{ cursor: suspended ? "not-allowed" : "pointer", position: "relative" }}
            >
                <div className="card-image">
                    <img src={getCardImg(cardVal)} alt={cardVal} />
                </div>
                {renderExposure(sid)}
            </div>
        );
    };

    return (
        <div className="casino-table lucky7">
            <style>
                {`
          .casino-video-cards {
            top: 80px;
            transform: unset;
            width: 45px;
            padding: 5px 10px 5px 5px;
            height: 45px;
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
                    <BettingBox sid={1} teamName="Low Card" label="Low Card" containerClass="low-odds" />
                    <div className="text-center lucky7-card">
                        <img src={getImage('7', 'cards')} alt="7" className="img-fluid" />
                    </div>
                    <BettingBox sid={2} teamName="High Card" label="High Card" containerClass="high-odds" />
                </div>

                <div className="casino-box sidebets-box">
                    <div className="lucky7-extra-bets">
                        <div className="lucky7-extra-bets-item-container">
                            <BettingBox sid={3} teamName="Even" label="Even" />
                        </div>
                        <div className="lucky7-extra-bets-item-container">
                            <BettingBox sid={4} teamName="Odd" label="Odd" />
                        </div>
                        <div className="lucky7-extra-bets-item-container">
                            <BettingBox sid={5} teamName="Black" label="" />
                        </div>
                        <div className="lucky7-extra-bets-item-container">
                            <BettingBox sid={6} teamName="Red" label="" />
                        </div>
                    </div>
                </div>

                <div className="casino-box cards-top">
                    <div className="container-fluid container-fluid-5">
                        <div className="row row5">
                            {[
                                { sid: 20, cards: ['A', '2', '3'], name: 'Line 1' },
                                { sid: 21, cards: ['4', '5', '6'], name: 'Line 2' },
                                { sid: 22, cards: ['8', '9', '10'], name: 'Line 3' },
                                { sid: 23, cards: ['J', 'Q', 'K'], name: 'Line 4' }
                            ].map((group) => {
                                const market = getOddsBySid(group.sid);
                                const odds = market ? (market.b1 ?? market.rate ?? market.odds) : "4";
                                const suspended = market ? isSuspended(market.gstatus) : true;

                                return (
                                    <div key={group.sid} className="col-6 col-md-3">
                                        <div onClick={() => !suspended && handleOddsClick(group.name, odds, group.sid, true)} style={{ cursor: suspended ? "not-allowed" : "pointer", position: "relative" }}>
                                            <div className="casino-odds">{suspended ? "0" : formatOdds(odds)}</div>
                                            <div className="casino-cards text-center mt-1">
                                                <div className={`casino-box cards-top-box ${suspended ? "suspended" : ""}`}>
                                                    {group.cards.map(c => (
                                                        <div key={c} className="casino-card-item">
                                                            <div className="card-image">
                                                                <img src={getImage(c, 'cards')} alt={c} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {renderExposure(group.sid, "w-100")}
                                                    {/* {suspended && <i className="fas fa-lock" style={{
                                                        position: "absolute",
                                                        top: "50%",
                                                        left: "50%",
                                                        transform: "translate(-50%, -50%)",
                                                        color: "#AAAFB5",
                                                        fontSize: "20px",
                                                        zIndex: 10
                                                    }}></i>} */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="casino-box cards-box">
                    <div className="w-100">
                        <div className="casino-odds">
                            {(() => {
                                // Check if any individual card market exists to show typical odds, else 12
                                const market = getOddsBySid(7);
                                const suspended = market ? isSuspended(market.gstatus) : true;
                                return suspended ? "0" : formatOdds(market?.b1 || "12");
                            })()}
                        </div>
                        <div className="casino-cards text-center mt-1">
                            {['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].map((card, idx) => (
                                <CardBox key={card} sid={7 + idx} cardVal={card} teamName={card === 'A' ? 'Card 1' : `Card ${card}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lucky7A;
