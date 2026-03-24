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

    const renderExposure = (marketId, isAbsolute = false) => {
        const exposure = getExposure(marketId);
        if (exposure === 0) return null;
        return (
            <span style={{
                color: exposure >= 0 ? "#03b37f" : "#ff4d4d",
                fontWeight: "bold",
                position: isAbsolute ? "absolute" : "relative",
                bottom: isAbsolute ? "-3px" : "auto",
                left: isAbsolute ? "0" : "auto",
                width: isAbsolute ? "100%" : "auto",
                textAlign: isAbsolute ? "center" : "left",
                fontSize: isAbsolute ? "11px" : "14px",
                zIndex: 101
            }}>
                {exposure}
            </span>
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

    const formatOdds = (value) => {
        if (value === undefined || value === null) return "";
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        // Remove trailing zeros: 2.10 -> 2.1, 2.00 -> 2
        return num.toString();
    };

    const BettingBox = ({ sid, teamName, boxType = "back", customOdds, label, children, extraStyle = {}, textColor }) => {
        const market = getOddsBySid(sid);
        const odds = market ? (market.b1 || market.rate || market.odds) : (customOdds || "");
        const suspended = market ? isSuspended(market.gstatus) : true;

        const isLay = boxType === "lay";
        const borderColor = sid === 1 ? "#ff4d4d" : sid === 2 ? "#03b37f" : "#72bbef";
        const bgColor = (sid === 1 || sid === 2) ? "#444" : "#444";

        return (
            <div
                className={`betting-box ${suspended ? "suspended" : ""}`}
                style={{
                    border: label === "Low Card" || label === "High Card" ? `5px solid ${borderColor}` : "none",
                    backgroundColor: suspended ? "rgba(0,0,0,0.6)" : bgColor,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    width: "100%",
                    cursor: suspended ? "not-allowed" : "pointer",
                    position: "relative",
                    borderRadius: "2px",
                    padding: "10px 5px",
                    minHeight: "70px",
                    ...extraStyle
                }}
                onClick={() => !suspended && handleOddsClick(teamName, odds, sid, !isLay)}
            >
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    opacity: suspended ? 0.3 : 1,
                    width: "100%"
                }}>
                    <span style={{ color: textColor || "#AAAFB5", fontSize: "16px", fontWeight: "bold" }}>{suspended ? "0" : formatOdds(odds)}</span>
                    {label && <span style={{ color: textColor || "#AAAFB5", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginTop: "2px" }}>{label}</span>}
                    {children}
                </div>
                {renderExposure(sid, true)}
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
                className="card-item-click"
                onClick={() => !suspended && handleOddsClick(teamName, odds || "12", sid, true)}
                style={{ cursor: suspended ? "not-allowed" : "pointer", position: "relative" }}
            >
                <div className={`card-with-border ${suspended ? "suspended" : ""}`}>
                    <img src={getCardImg(cardVal)} alt={cardVal} style={{ width: "100%", height: "auto" }} />
                </div>
                <div className="card-exposure-mini" style={{ zIndex: 101 }}>
                    {renderExposure(sid)}
                </div>
            </div>
        );
    };

    return (
        <div className="lucky7-container">
            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap');
          
          .lucky7-container {
            width: 100%;
            font-family: 'Roboto Condensed', sans-serif;
            color: #fff;
            background-color: #2e3439;
          }
          .betting-layout {
            padding: 5px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 800px;
            margin: 10px auto 0 auto;
          }
          .row-main-bets {
            display: grid;
            grid-template-columns: 1fr 120px 1fr;
            gap: 0;
            align-items: center;
          }
              .casino-video-cards {
        top: 80px;
        transform: unset;
        width: 45px;
        padding: 5px 10px 5px 5px;
        height: 45px;
    }
          .middle-card-display {
             border-radius: 4px;
             height: 90px;
             display: flex;
             align-items: center;
             justify-content: center;
             background-color: #666;
          }
          .card-with-border {
            //  border: 2px solid #ffcc00;
            //  border-radius: 4px;
             overflow: hidden;
             display: flex;
             background: #fff;
             width: 45px;
          }
          .card-item-click .card-with-border {
             width: 42px;
          }
          .row-side-bets {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 5px;
          }
          .side-bet-blue {
            background-color: #444 !important;
            border: none !important;
          }
          .group-bets-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px 15px;
            margin-top: 10px;
          }
          .group-box {
            border: 5px solid #777;
            padding: 5px 5px 15px 5px;
            position: relative;
            display: flex;
            justify-content: center;
            gap: 4px;
            border-radius: 2px;
            background: rgba(0,0,0,0.2);
          }
          .group-odds-label {
            color: #AAAFB5;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 4px;
          }
          .group-bet-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
          }
          .group-box-lock {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #AAAFB5;
            font-size: 20px;
            z-index: 10;
            text-shadow: 0 0 5px rgba(0,0,0,0.8);
          }
          .individual-cards-container {
            border: none;
            margin-top: 15px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .cards-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 15px 10px;
            justify-content: center;
            width: 100%;
          }
          .card-suit-img {
            width: 18px;
            height: auto;
            margin: 0 2px;
          }
          .lock-mini {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #fff;
            font-size: 14px;
            z-index: 5;
          }
          .card-exposure-mini {
            position: absolute;
            bottom: -20px;
            width: 100%;
            text-align: center;
            font-size: 9px;
            font-weight: bold;
          }

          @media (max-width: 767px) {
            .betting-layout { padding: 4px; gap: 10px; }
            .row-main-bets { grid-template-columns: 1fr 100px 1fr; }
            .middle-card-display { height: 75px; }
            .row-side-bets { grid-template-columns: repeat(4, 1fr); gap: 5px; }
            .cards-grid { gap: 18px 4px; }
            .card-item-click { flex: 0 0 18%; display: flex; justify-content: center; }
            .card-item-click .card-with-border { width: 100%; max-width: 38px; }
          }

          .lucky5-result-h {
            background-color: #000 !important;
            color: #026d4d !important;
            border-radius: 0 !important;
            border: 1px solid #444 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 30px !important;
            height: 30px !important;
            font-weight: bold !important;
          }
          .lucky5-result-t {
            background-color: #000 !important;
            color: #fff !important;
            border-radius: 0 !important;
            border: 1px solid #444 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 30px !important;
            height: 30px !important;
            font-weight: bold !important;
          }
          .lucky5-result-l {
            background-color: #000 !important;
            color: #ff4d4d !important;
            border-radius: 0 !important;
            border: 1px solid #444 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 30px !important;
            height: 30px !important;
            font-weight: bold !important;
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

            <div className="betting-layout">
                {/* Row 1: Low, Card 7, High */}
                <div className="row-main-bets">
                    <BettingBox sid={1} teamName="Low Card" label="Low Card" />
                    <div className="middle-card-display">
                        <img src={getImage('7', 'cards')} alt="7" style={{ width: "45px", height: "60px" }} />
                    </div>
                    <BettingBox sid={2} teamName="High Card" label="High Card" />
                </div>

                {/* Row 2: Side Bets (Blue) */}
                <div className="row-side-bets">
                    <BettingBox sid={3} teamName="Even" label="EVEN" extraStyle={{ backgroundColor: "#444" }} textColor="#FFF" />
                    <BettingBox sid={4} teamName="Odd" label="ODD" extraStyle={{ backgroundColor: "#444" }} textColor="#FFF" />
                    <BettingBox sid={5} teamName="Black" extraStyle={{ backgroundColor: "#444" }} textColor="#FFF">
                        <div style={{ display: "flex", marginTop: "2px" }}>
                            <img src={getImage('spade', 'cards')} alt="spade" className="card-suit-img" />
                            <img src={getImage('club', 'cards')} alt="club" className="card-suit-img" />
                        </div>
                    </BettingBox>
                    <BettingBox sid={6} teamName="Red" extraStyle={{ backgroundColor: "#444" }} textColor="#FFF">
                        <div style={{ display: "flex", marginTop: "2px" }}>
                            <img src={getImage('heart', 'cards')} alt="heart" className="card-suit-img" />
                            <img src={getImage('diamond', 'cards')} alt="diamond" className="card-suit-img" />
                        </div>
                    </BettingBox>
                </div>

                {/* Row 3 & 4: Groups */}
                <div className="group-bets-container">
                    {[
                        { sid: 7, cards: ['A', '2', '3'], name: 'Line 1' },
                        { sid: 8, cards: ['4', '5', '6'], name: 'Line 2' },
                        { sid: 9, cards: ['8', '9', '10'], name: 'Line 3' },
                        { sid: 10, cards: ['J', 'Q', 'K'], name: 'Line 4' }
                    ].map((group) => {
                        const market = getOddsBySid(group.sid);
                        const suspended = market ? isSuspended(market.gstatus) : true;
                        const exposure = getExposure(group.sid);

                        return (
                            <div key={group.sid} className="group-bet-item">
                                <div className="group-odds-label" style={{ color: exposure > 0 ? "#03b37f" : exposure < 0 ? "#ff4d4d" : "#AAAFB5" }}>
                                    {suspended ? "0" : "4"}
                                </div>
                                <div
                                    className={`group-box ${suspended ? "suspended" : ""}`}
                                    onClick={() => !suspended && handleOddsClick(group.name, market?.b1 || "4", group.sid, true)}
                                    style={{ cursor: suspended ? "not-allowed" : "pointer" }}
                                >
                                    {group.cards.map(c => (
                                        <div key={c} className="card-with-border" style={{ width: "35px", opacity: suspended ? 0.6 : 1 }}>
                                            <img src={getImage(c, 'cards')} alt={c} style={{ width: "100%" }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom: Individual Cards */}
                <div className="individual-cards-container">
                    <div className="group-odds-label" style={{ marginBottom: "10px" }}>
                        {(() => {
                            // Check if all individual cards (sid 7-19) are suspended
                            const allCardsSuspended = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].every((card, idx) => {
                                const market = getOddsBySid(7 + idx);
                                return market ? isSuspended(market.gstatus) : true;
                            });
                            return allCardsSuspended ? "0" : "12";
                        })()}
                    </div>
                    <div className="cards-grid">
                        {['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].map((card, idx) => (
                            <CardBox key={card} sid={7 + idx} cardVal={card} teamName={card === 'A' ? 'Card 1' : `Card ${card}`} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lucky7A;
