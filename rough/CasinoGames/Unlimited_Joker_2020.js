import React, { useState, useEffect, useRef } from "react";
import { fetchCasinoExposureApi } from "../../api/api";
import { io } from "socket.io-client";
import useIsMobile from "../../hooks/useIsMobile";
import CasinoVideo from "./components/CasinoVideo";
import { useSelector } from "react-redux";
import { getExposureClass } from "../../utilies/helpers";

const A_to_10 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const JQK = ["11", "12", "13"];

const Unlimited_Joker_2020 = ({
    onBetSelection,
    lastBetTime,
    exposureTrigger,
}) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(true);
    const [gameData, setGameData] = useState(null);
    const [exposureData, setExposureData] = useState([]);
    const isMobile = useIsMobile();
    const socketRef = useRef(null);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
    const [selectedJokerSid, setSelectedJokerSid] = useState(null);
    const isLight = useSelector(state => state.action.theme) === "light";

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.[0]?.mid) return;
            try {
                const response = await fetchCasinoExposureApi({
                    markettype: "JOKER120",
                    main_event_id: gameData.t1[0].mid,
                    curPageName: "live_joker1.php",
                });
                if (Array.isArray(response?.data)) {
                    setExposureData(response.data);
                }
            } catch (error) {
                console.error("Error fetching exposure:", error);
            }
        };
        fetchExposure();
        setSelectedJokerSid(null);
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

    const renderExposureByNat = (nat) => {
        const market = gameData?.t2?.find((m) => m.nat.includes(nat));
        return market ? renderExposure(market.sid) : null;
    };

    useEffect(() => {
        console.log("Attempting to connect to socket: https://trubet9.bet:2053");
        const socket = io("https://trubet9.bet:2053", {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });

        socketRef.current = socket;

        const joinRoom = () => {
            console.log("📤 Emitting Room: joker1 & joker120");
            socket.emit("Room", "joker120");
        };

        socket.on("connect", () => {
            console.log("✅ Connected to game socket:", socket.id);
            joinRoom();
        });

        socket.on("reconnect", (attempt) => {
            console.log(`🔄 Reconnected after ${attempt} attempts`);
            joinRoom();
        });

        socket.on("game", (data) => {
            const payload = Array.isArray(data)
                ? data[1]
                    ? data[1]
                    : data[0]
                : data;

            if (payload && (payload.t1 || payload.t2)) {
                setGameData({ ...payload, serverTime: payload.serverTime });
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const getCardImage = (cardCode) => {
        if (!cardCode)
            return "/assets/cards_new/joker.png";
        return `/assets/cards_new/four-color-card/${cardCode}.png`;
    };

    const isSuspended = (status) => {
        if (!status) return false;
        const s = status.toString().toUpperCase();
        return s === "SUSPENDED" || s === "0" || s === "BALL RUNNING";
    };

    const getSuspendedClass = (status) => {
        return isSuspended(status) ? "suspended" : "";
    };

    const getOddsBySid = (sid) => {
        return gameData?.t2?.find((item) => item.sid == sid);
    };

    const getMarketByNat = (nat) => {
        return gameData?.t2?.find((item) => item.nat === nat);
    };

    const handleOddsClick = (teamName, odds, sid, isBack) => {
        const market = getOddsBySid(sid);
        const min = market?.min || 100;
        const max = market?.max || 25000;

        if (!isSuspended(market?.gstatus) && onBetSelection) {
            onBetSelection({
                teamName,
                odds,
                minBet: min,
                maxBet: max,
                isBack,
                marketId: sid,
                eventId: gameData?.t1?.[0]?.mid,
                selectedCard_Url: getCardImage(selectedJokerSid),
            });
        }
    };

    // --- Helper for Joker Selection ---
    // Checking if any of the joker card markets exist to decide visibility of the section
    // AND ensure no cards are open (C1 === "1")
    const isFirstCardOpen =
        gameData?.t1?.[0]?.C1 && gameData?.t1?.[0]?.C1 !== "1";

    const hasJokerData =
        !isFirstCardOpen &&
        gameData?.t2?.some(
            (item) => item.sid >= 3 && item.sid <= 15 && item.gstatus === "OPEN",
        );

    const getDrawerCardImage = (cardCode) => {
        if (!cardCode || cardCode === "1") return "/assets/cards_new/1.png";
        return `/assets/cards_new/${cardCode}.png`;
    };

    /* Restored JokerDisplay Component */
    const JokerDisplay = () => (
        <div className="joker-card">
            <h4 className="text-playerb">Joker</h4>
            <span>
                <img
                    src={
                        "/assets/cards_new/joker.png"
                    }
                    alt="Joker"
                />
            </span>
        </div>
    );

    const VideoCards = () => {
        return (
            <div className="casino-video-cards-container">
                <div>
                    <span>
                        <img src={getDrawerCardImage(gameData?.t1?.[0]?.C1)} alt="card" />
                    </span>
                    <span>
                        <img src={getDrawerCardImage(gameData?.t1?.[0]?.C3)} alt="card" />
                    </span>
                    <span>
                        <img src={getDrawerCardImage(gameData?.t1?.[0]?.C5)} alt="card" />
                    </span>
                </div>
                <div>
                    <span>
                        <img src={getDrawerCardImage(gameData?.t1?.[0]?.C2)} alt="card" />
                    </span>
                    <span>
                        <img src={getDrawerCardImage(gameData?.t1?.[0]?.C4)} alt="card" />
                    </span>
                    <span>
                        <img src={getDrawerCardImage(gameData?.t1?.[0]?.C6)} alt="card" />
                    </span>
                </div>
            </div>
        );
    };

    const isJoker2020 = gameData?.t2?.some(
        (item) => item.sid == 14 || item.sid == 140,
    );
    const gameTitle = isJoker2020
        ? "Unlimited Joker 20-20"
        : "Unlimited Joker 20-20";
    const videoUrl = isJoker2020
        ? "/newmediaplayer/JOKER120"
        : "https://shivetv.pw/live/joker1.m3u8";

    return (
        <>
            <style>
                {`
          .teenpatti-mobile-container {
            padding: 0 !important;
            margin: 0 !important;
            // background-color: #2e3439;
            color: #ccc;
            font-family: sans-serif;
            width: 100% !important;
            max-width: 100% !important;
          }
           /* Force parent overrides */
          .casino-table.teenpatti-new, 
          .casino-detail {
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
          }
          
          /* Joker Selection Styles */
          .joker-selection-header {
              background-color: #126E51;
              color: white;
              text-align: center;
              padding: 8px;
              font-size: 18px;
            //   font-weight: bold;
              border-radius: 4px;
              margin-bottom: 5px;
              width: fit-content;
              margin: 0 auto 5px auto;
          }
          .joker-card-grid {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 11px;
              margin-bottom: 10px;
          }
          .joker-card-item {
              border: 1px solid #d4af37;
              border-radius: 4px;
              background-color: #222;
              width: 30px;
              height: 40px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              cursor: pointer;
          }
          .joker-card-val { font-weight: bold; color: white; font-size: 14px; line-height: 1; }
          .joker-card-val { font-weight: bold; color: white; font-size: 14px; line-height: 1; }
          .joker-card-suit { font-size: 10px; display: flex; gap: 1px; }

          .joker-card {
            position: absolute;
            // bottom: 125px; /* Moved up to clear drawer */
            left: 5px;
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 100;
            margin-bottom: 0;
          }
          .joker-card h4 { font-weight: bold;
    margin-bottom: 4px;
    text-transform: uppercase;
    font-size: 20px;
    font-family: antonio;
    text-shadow: 0 0 1px var(--text-yellow);}
          .joker-card img { width: 30px; } 

          .game-market-title-box {
              background: #333;
              color: #fff;
              padding: 5px 10px;
              font-weight: bold;
              display: flex;
              justify-content: space-between;
              align-items: center;
          }
          
           .mobile-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: transparent;
            padding: 0;
            margin-bottom: 5px;
            gap: 2px;
          }
          .mobile-row-label {
            flex: 1;
            height: 35px;
            display: flex;
            align-items: center;
            background-color: #444;
            font-size: 18px;
            font-weight: bold;
            padding-left: 8px;
            color: #eee;
            margin-right: 0 !important;
            border-radius: 0 !important;
            justify-content: space-between;
            padding-right: 5px;
          }
          .mobile-odds-box {
            flex: 0.7;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 !important;
            border-radius: 0 !important;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            background-color: #2a2a2a;
            color: #fff;
          }
            .mobile-odds-box.back { border: 2px solid #72bbef; background-color: transparent; color: #ccc; }
            .mobile-odds-box.lay { border: 2px solid #fca4b7; background-color: transparent; color: #ccc; }
            .mobile-odds-box.suspended { background-color: #222; border-color: #555; color: #555; cursor: not-allowed; }
            
             /* Desktop Layout */
             .desktop-container { display: flex; width: 100%; gap: 10px; }
             .desktop-col { flex: 1; }
             .desktop-row { display: flex; margin-bottom: 5px; background: #eee; border-bottom: 1px solid #ccc;  }
             .desktop-label { flex: 2; padding: 5px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; background: #e0e0e0; }
             .desktop-odds { flex: 1; padding: 5px; text-align: center; cursor: pointer; border-left: 1px solid #fff; font-weight: bold;}
             .desktop-odds.back { background-color: #a5d4f2; }
             .desktop-odds.lay { background-color: #f9c9d4; }
             .desktop-header { background: #333; color: white; padding: 5px; text-align: center; font-weight: bold; }
             
             .teenpatti-new .casino-video-cards {
                position: absolute;
                left: 0;
                top: 75%;
                transform: translateY(-50%);
                width: 120px;
                height: 153px;
                background: rgba(0, 0, 0, 0.7);
                border-radius: 0 8px 8px 0;
                z-index: 100;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                will-change: transform, width;
                backface-visibility: hidden;
                transform-origin: left center;
                overflow: hidden !important;
                box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
            }
        `}
            </style>

            <div className="casino-table kk teenpatti-joker1" style={{ marginTop: 0 }}>
                <CasinoVideo
                    gameName={gameTitle}
                    roundId={gameData?.t1?.[0]?.mid || "Loading..."}
                    videoSrc={videoUrl}
                    autotime={gameData?.t1?.[0]?.autotime}
                    totalTime={gameData?.t1?.[0]?.ft} isCardDrawerOpen={isDrawerOpen}
                    setIsCardDrawerOpen={setIsDrawerOpen}
                    cards={[gameData?.t1?.[0]?.C1, gameData?.t1?.[0]?.C2, gameData?.t1?.[0]?.C3, gameData?.t1?.[0]?.C4, gameData?.t1?.[0]?.C5, gameData?.t1?.[0]?.C6]}
                    CardsComponent={VideoCards}
                    // drawerHeight="103px"
                    OtherComponent={JokerDisplay}
                />

                <div className="casino-detail" style={{ padding: "0 5px" }}>
                    {/* Joker Selection - Conditional */}
                    {hasJokerData ? (
                        <div style={{ padding: "10px 0", background: isLight ? "var(--bg-body)" : "#2e3439" }}>
                            <div className="joker-selection-header">Select your Joker</div>
                            {/* Row 1: A-10 */}
                            <div className="joker-card-grid">
                                {A_to_10.map((card) => {
                                    const isSelected = selectedJokerSid === card;
                                    return (
                                        <div
                                            key={card}
                                            className="joker-card-item"
                                            onClick={() =>
                                                setSelectedJokerSid(isSelected ? null : card)
                                            }
                                            style={{
                                                background: "transparent",
                                                border: "none",
                                                height: "auto",
                                                transform: isSelected
                                                    ? "scale(1.2) translateY(-5px)"
                                                    : "scale(1)",
                                                transition: "transform 0.2s ease",
                                                zIndex: isSelected ? 10 : 1,
                                            }}
                                        >
                                            <img
                                                src={getCardImage(card)}
                                                alt={card}
                                                style={{ width: "35px", borderRadius: "4px" }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Row 2: J, Q, K */}
                            <div className="joker-card-grid">
                                {JQK.map((card) => {
                                    const isSelected = selectedJokerSid === card;
                                    return (
                                        <div
                                            key={card}
                                            className="joker-card-item"
                                            onClick={() =>
                                                setSelectedJokerSid(isSelected ? null : card)
                                            }
                                            style={{
                                                background: "transparent",
                                                border: "none",
                                                height: "auto",
                                                transform: isSelected
                                                    ? "scale(1.2) translateY(-5px)"
                                                    : "scale(1)",
                                                transition: "transform 0.2s ease",
                                                zIndex: isSelected ? 10 : 1,
                                            }}
                                        >
                                            <img
                                                src={getCardImage(card)}
                                                alt={card}
                                                style={{ width: "35px", borderRadius: "4px" }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}

                    {isMobileView ? (
                        <div className="teenpatti-mobile-container">
                            {/* Player A */}
                            <div className="mobile-row">
                                <div className="mobile-row-label">
                                    <span>Player A</span> {renderExposureByNat("Player A")}
                                </div>
                                <div
                                    className={`mobile-odds-box back ${getSuspendedClass(
                                        getMarketByNat("Player A")?.gstatus,
                                    )}`}
                                    onClick={() =>
                                        handleOddsClick(
                                            "Player A",
                                            getMarketByNat("Player A")?.b1,
                                            getMarketByNat("Player A")?.sid,
                                            true,
                                        )
                                    }
                                >
                                    {!isSuspended(getMarketByNat("Player A")?.gstatus) ? (
                                        getMarketByNat("Player A")?.b1
                                    ) : (
                                        <i className="fas fa-lock"></i>
                                    )}
                                </div>
                                <div
                                    className={`mobile-odds-box lay ${getSuspendedClass(
                                        getMarketByNat("Player A")?.gstatus,
                                    )}`}
                                    onClick={() =>
                                        handleOddsClick(
                                            "Player A",
                                            getMarketByNat("Player A")?.l1,
                                            getMarketByNat("Player A")?.sid,
                                            false,
                                        )
                                    }
                                >
                                    {!isSuspended(getMarketByNat("Player A")?.gstatus) ? (
                                        getMarketByNat("Player A")?.l1
                                    ) : (
                                        <i className="fas fa-lock"></i>
                                    )}
                                </div>
                            </div>

                            {/* Player B */}
                            <div className="mobile-row">
                                <div className="mobile-row-label">
                                    <span>Player B</span> {renderExposureByNat("Player B")}
                                </div>
                                <div
                                    className={`mobile-odds-box back ${getSuspendedClass(
                                        getMarketByNat("Player B")?.gstatus,
                                    )}`}
                                    onClick={() =>
                                        handleOddsClick(
                                            "Player B",
                                            getMarketByNat("Player B")?.b1,
                                            getMarketByNat("Player B")?.sid,
                                            true,
                                        )
                                    }
                                >
                                    {!isSuspended(getMarketByNat("Player B")?.gstatus) ? (
                                        getMarketByNat("Player B")?.b1
                                    ) : (
                                        <i className="fas fa-lock"></i>
                                    )}
                                </div>
                                <div
                                    className={`mobile-odds-box lay ${getSuspendedClass(
                                        getMarketByNat("Player B")?.gstatus,
                                    )}`}
                                    onClick={() =>
                                        handleOddsClick(
                                            "Player B",
                                            getMarketByNat("Player B")?.l1,
                                            getMarketByNat("Player B")?.sid,
                                            false,
                                        )
                                    }
                                >
                                    {!isSuspended(getMarketByNat("Player B")?.gstatus) ? (
                                        getMarketByNat("Player B")?.l1
                                    ) : (
                                        <i className="fas fa-lock"></i>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="desktop-container">
                            {/* Desktop View - Player A and B side by side */}
                            <div className="desktop-col">
                                <div className="desktop-header">Player A</div>
                                <div className="desktop-row">
                                    <div className="desktop-label">Main {renderExposureByNat("Player A")}</div>
                                    <div
                                        className={`desktop-odds back ${getSuspendedClass(
                                            getMarketByNat("Player A")?.gstatus,
                                        )}`}
                                        onClick={() =>
                                            handleOddsClick(
                                                "Player A",
                                                getMarketByNat("Player A")?.b1,
                                                getMarketByNat("Player A")?.sid,
                                                true,
                                            )
                                        }
                                    >
                                        {!isSuspended(getMarketByNat("Player A")?.gstatus) ? (
                                            getMarketByNat("Player A")?.b1
                                        ) : (
                                            <i className="fas fa-lock"></i>
                                        )}
                                    </div>
                                    <div
                                        className={`desktop-odds lay ${getSuspendedClass(
                                            getMarketByNat("Player A")?.gstatus,
                                        )}`}
                                        onClick={() =>
                                            handleOddsClick(
                                                "Player A",
                                                getMarketByNat("Player A")?.l1,
                                                getMarketByNat("Player A")?.sid,
                                                false,
                                            )
                                        }
                                    >
                                        {!isSuspended(getMarketByNat("Player A")?.gstatus) ? (
                                            getMarketByNat("Player A")?.l1
                                        ) : (
                                            <i className="fas fa-lock"></i>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="desktop-col">
                                <div className="desktop-header">Player B</div>
                                <div className="desktop-row">
                                    <div className="desktop-label">Main {renderExposureByNat("Player B")}</div>
                                    <div
                                        className={`desktop-odds back ${getSuspendedClass(
                                            getMarketByNat("Player B")?.gstatus,
                                        )}`}
                                        onClick={() =>
                                            handleOddsClick(
                                                "Player B",
                                                getMarketByNat("Player B")?.b1,
                                                getMarketByNat("Player B")?.sid,
                                                true,
                                            )
                                        }
                                    >
                                        {!isSuspended(getMarketByNat("Player B")?.gstatus) ? (
                                            getMarketByNat("Player B")?.b1
                                        ) : (
                                            <i className="fas fa-lock"></i>
                                        )}
                                    </div>
                                    <div
                                        className={`desktop-odds lay ${getSuspendedClass(
                                            getMarketByNat("Player B")?.gstatus,
                                        )}`}
                                        onClick={() =>
                                            handleOddsClick(
                                                "Player B",
                                                getMarketByNat("Player B")?.l1,
                                                getMarketByNat("Player B")?.sid,
                                                false,
                                            )
                                        }
                                    >
                                        {!isSuspended(getMarketByNat("Player B")?.gstatus) ? (
                                            getMarketByNat("Player B")?.l1
                                        ) : (
                                            <i className="fas fa-lock"></i>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Unlimited_Joker_2020;
