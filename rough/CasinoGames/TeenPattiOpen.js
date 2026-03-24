import React, { useState, useEffect, useRef } from "react";
import { fetchCasinoExposureApi } from "../../api/api";
import { io } from "socket.io-client";
import "./kk.css";
import CasinoVideo from "./components/CasinoVideo";
import { getExposureClass } from "../../utilies/helpers";

const TeenPattiOpen = ({ onBetSelection, lastBetTime, exposureTrigger }) => {
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [gameData, setGameData] = useState(null);
    const [exposureData, setExposureData] = useState([]);
    const socketRef = useRef(null);

    // Add getCardImage helper if missing, or use existing one if I copied it?
    // Checking previous file content... it was overwritten. I need to add it again.
    const getCardImage = (card) => {
        if (!card || card === "1") return "https://wver.sprintstaticdata.com/v65/static/front/img/cards/1.png";
        return `https://wver.sprintstaticdata.com/v196/static/front/img/cards/${card}.png`;
    };

    useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.[0]?.mid) return;
            try {
                const response = await fetchCasinoExposureApi({
                    markettype: "OPENTEENPATTI",
                    main_event_id: gameData.t1[0].mid,
                    curPageName: "live_teenpatti_open.php",
                });
                if (Array.isArray(response?.data)) {
                    setExposureData(response.data);
                }
            } catch (error) {
                console.error("Error fetching exposure:", error);
            }
        };
        fetchExposure();
    }, [gameData?.t1?.[0]?.mid, lastBetTime, exposureTrigger]);

    const getExposure = (marketId) => {
        if (!Array.isArray(exposureData)) return 0;
        const market = exposureData.find((item) => item.market_id == marketId);
        return market ? market.win_loss || market.total_exposure : 0;
    };

    const renderExposure = (marketId) => {
        const exposure = getExposure(marketId);
        if (exposure === 0) return null;
        return (
            <span className={`mr-2 ${getExposureClass(exposure)}`}>
                {exposure}
            </span>
        );
    };

    useEffect(() => {
        const socket = io("https://trubet9.bet:2053", {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("✅ Connected to game socket teen8:", socket.id);
            socket.emit("Room", "teen8");
        });

        socket.on("game", (data) => {
            const targetData = Array.isArray(data) ? data[0] : data;
            setGameData((prevData) => {
                const newData = { ...prevData, ...targetData };
                if (newData.t1 && newData.t1[0] && newData.t1[0].cards) {
                    newData.card = newData.t1[0].cards.split(',').map(c => c.trim());
                } else if (newData.cards && typeof newData.cards === 'string') {
                    newData.card = newData.cards.split(',').map(c => c.trim());
                }
                return newData;
            });
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const handleOddsClick = (teamName, odds, marketId, isBack, marketType) => {
        const min = gameData?.t1?.[0]?.min || 100;
        const max = gameData?.t1?.[0]?.max || 25000;
        const fullMid = (gameData?.t1?.[0]?.mid || "").toString();
        const eventId = fullMid.includes(".") ? fullMid.split(".")[1] : fullMid;

        if (onBetSelection) {
            onBetSelection({
                teamName,
                odds,
                minBet: min,
                maxBet: max,
                isBack,
                marketId: marketId,
                eventId: eventId,
                marketType: marketType, // Pass market type if needed
                hideOdds: marketType === "Pair Plus" || marketType === "Total"
            });
        }
    };

    const renderMarketBox = (odds, status, marketId, teamName, marketType, displayLabel = null) => {
        const isLocked = status === "False" || status === false || status === "SUSPENDED" || !odds || odds === "0" || odds === "0.00";
        const exp = getExposure(marketId);
        const suspended = isLocked ? `suspended ${(exp && exp != 0) ? "lock-top" : ""}` : "";

        return (
            <div
                className={`back casino-bl-box-item ${suspended}`}
                onClick={() => !isLocked && handleOddsClick(teamName, odds, marketId, true, marketType)}
                style={{ cursor: !isLocked ? "pointer" : "default", width: "100%", textAlign: "center", justifyContent: "center", display: "flex", alignItems: "center", flexDirection: "column" }}
            >
                <span className="casino-box-odd" style={{ fontSize: displayLabel ? '10px' : 'inherit', fontWeight: 'bold' }}>
                    {displayLabel || (odds ? parseFloat(odds) : "0")}
                </span>
                {renderExposure(marketId)}
            </div>
        );
    };

    function VideoCards() {
        return (
            <>
                <div className="dealer-name" style={{ color: '#fff', textAlign: 'center', marginBottom: '5px' }}>DEALER</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                    {/* Dealer cards at 8, 17, 26 (Interleaved dealing: 1-8 Players, 9 Dealer) */}
                    <span><img src={getCardImage(gameData?.card?.[8] || "1")} onError={(e) => { e.target.onerror = null; e.target.src = getCardImage("1"); }} alt="card1" /></span>
                    <span><img src={getCardImage(gameData?.card?.[17] || "1")} onError={(e) => { e.target.onerror = null; e.target.src = getCardImage("1"); }} alt="card2" /></span>
                    <span><img src={getCardImage(gameData?.card?.[26] || "1")} onError={(e) => { e.target.onerror = null; e.target.src = getCardImage("1"); }} alt="card3" /></span>
                </div>
            </>
        )
    }

    const currentGame = gameData?.t1?.[0];
    const players = Array.from({ length: 8 }, (_, i) => i + 1);

    // Helper to get rate safely - adjusting for potential data structure
    // Assuming t2[0] = Winner/Odds, t2[1] = Pair Plus, t2[2] = Total
    // And inside keys might be p1, p2... or 1, 2... or dynamic.
    // For now using placeholder logic or checking raw data if available.
    // Based on 'teen8' typically generic:
    // we use gameData.t2[marketIndex].runners[playerIndex] ??? No, usually t2[marketIndex].p<N>rate

    // Trying standard pattern: t2[0] -> Winner. Keys: p1, p2...

    return (
        <>
            <style jsx>{`
            .teenpattiopen .casino-video-cards {
                top: 95px;
                transform: unset;
                width: 95px;
                padding: 5px 10px 5px 5px;
                height: 55px;
            }
            .teenpattiopen .casino-video-cards span img { width: 20px; }
            .teenpattiopen .casino-video-cards-container .dealer-name { font-size: var(--font-16); line-height: 12px; }
            .teenpattiopen .casino-bl-box-item { justify-content: center; } 
            .teenpattiopen .casino-nation-name { 
                width: 25% !important; 
                background-color: #2e3439;
                color: #ddd;
                padding: 4px;
                position: relative;
            }
            .teenpattiopen .casino-box-row {
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
  padding: 0px 0;
  align-items: center;
  position: relative;
}
            .teenpattiopen .casino-bl-box { width: 75% !important; }
            .suspended-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
            }
            .suspended-overlay i {
                color: #fff !important;
                font-size: 14px !important;
            }
             `}</style>
            <div className="casino-table teenpattiopen kk">
                <CasinoVideo
                    gameName="Teenpatti Open"
                    roundId={currentGame?.mid}
                    videoSrc="/mediaplayer/teen8/c9678b45-92c4-4fa7-890a-4b7a41bf9531"
                    isCardDrawerOpen={isCardDrawerOpen}
                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                    autotime={currentGame?.autotime}
                    totalTime={currentGame?.ft}
                    CardsComponent={VideoCards}
                    cards={[gameData?.card?.[8], gameData?.card?.[17], gameData?.card?.[26],]}
                />

                <div className="casino-detail">
                    {/* Open Cards Section - Recreating from Step 55 but dynamic if possible */}


                    <div className="casino-box">
                        <div className="casino-box-header">
                            <div className="casino-nation-name no-border"></div>
                            <div className="casino-bl-box text-center" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
                                <div className="casino-bl-box-item" style={{ marginLeft: '35px' }}><b>Odds</b></div>
                                <div className="casino-bl-box-item" style={{ whiteSpace: 'nowrap', marginLeft: '28px' }}><b>Pair Plus</b></div>
                                <div className="casino-bl-box-item" style={{ marginLeft: '35px' }}><b>Total</b></div>
                            </div>
                        </div>

                        <div className="casino-box-content">
                            {players.map((p, idx) => (
                                <div key={p} className="casino-box-row">
                                    <div className="casino-nation-name">
                                        <b>Player {p}</b>

                                        <div className="d-block">
                                            {/* Interleaved dealing: Card 1 at (p-1), Card 2 at (p-1)+9, Card 3 at (p-1)+18 */}
                                            <span><img src={getCardImage(gameData?.card?.[(p - 1)] || "1")} style={{ width: '20px', marginRight: '2px' }} onError={(e) => { e.target.onerror = null; e.target.src = getCardImage("1"); }} alt="" /></span>
                                            <span><img src={getCardImage(gameData?.card?.[(p - 1) + 9] || "1")} style={{ width: '20px', marginRight: '2px' }} onError={(e) => { e.target.onerror = null; e.target.src = getCardImage("1"); }} alt="" /></span>
                                            <span><img src={getCardImage(gameData?.card?.[(p - 1) + 18] || "1")} style={{ width: '20px', marginRight: '2px' }} onError={(e) => { e.target.onerror = null; e.target.src = getCardImage("1"); }} alt="" /></span>
                                        </div>
                                    </div>
                                    <div className="casino-bl-box" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
                                        {/* Odds / Winner (0-7) */}
                                        {renderMarketBox(
                                            gameData?.t2?.[p - 1]?.rate || "1.98",
                                            gameData?.t2?.[p - 1]?.gstatus || "Open",
                                            gameData?.t2?.[p - 1]?.sid,
                                            `Player ${p}`,
                                            "Winner"
                                        )}
                                        {/* Pair Plus (8-15) */}
                                        {renderMarketBox(
                                            gameData?.t2?.[p + 7]?.rate || "1.98",
                                            gameData?.t2?.[p + 7]?.gstatus || "Open",
                                            gameData?.t2?.[p + 7]?.sid,
                                            `Pair Plus ${p}`,
                                            "Pair Plus",
                                            `Pair Plus ${p}`
                                        )}
                                        {/* Total (16-23) */}
                                        {renderMarketBox(
                                            gameData?.t2?.[p + 15]?.rate || "1.98",
                                            gameData?.t2?.[p + 15]?.gstatus || "Open",
                                            gameData?.t2?.[p + 15]?.sid,
                                            `Total ${p}`,
                                            "Total"
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TeenPattiOpen;
