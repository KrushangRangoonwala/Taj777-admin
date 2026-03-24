import React, { useState, useEffect, useRef } from "react";
import {
    fetchCasinoExposureApi,
    fetchTeenpattiResults,
    fetchOpenBetsApi,
    getDefaultParams,
} from "../../api/api";
import { io } from "socket.io-client";
import Modal from "react-modal";
import { toast } from "react-toastify";
import CasinoVideo from "./components/CasinoVideo";
import Result_Teen62, { formatResultData } from "./results/Result_Teen62";
const TeenPatti62 = ({ onBetSelection, lastBetTime, exposureTrigger }) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(true);
    const [gameData, setGameData] = useState(null);
    const [exposureData, setExposureData] = useState([]);
    const [isMobileView, setIsMobileView] = useState(
        window.innerWidth <= 768 && !window.location.search.includes("example1=on")
    );
    const [openBets, setOpenBets] = useState([]);
    const [isMyBetsModalOpen, setIsMyBetsModalOpen] = useState(false);
    const [lastResults, setLastResults] = useState([]);
    const [resultModalOpen, setResultModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const socketRef = useRef(null);

    const cardPairs = [1, 2, 3, 4, 5, 6];

    const getResultTxt = (win) => {
        const w = String(win).trim().toUpperCase();
        if (w === "1" || w === "A") return "A";
        if (w === "2" || w === "B") return "B";
        return "T";
    };

    const getColorClass = (win) => {
        const w = String(win).trim().toUpperCase();
        if (w === "1" || w === "A") return "resulta";
        if (w === "2" || w === "B") return "resultb";
        return "resulttie";
    };

    const currentGame = gameData?.t1?.[0];
    const communityCards = [
        currentGame?.C1,
        currentGame?.C3,
        currentGame?.C5,
        currentGame?.C2,
        currentGame?.C4,
        currentGame?.C6,
    ];

    const rows = [communityCards.slice(0, 3), communityCards.slice(3, 6)];

    function VideoCards() {
        return (
            <div className="casino-video-cards-container">
                <div>
                    <span>
                        <img src={getCardImage(currentGame?.C1)} alt="card" />
                    </span>
                    <span>
                        <img src={getCardImage(currentGame?.C3)} alt="card" />
                    </span>
                    <span>
                        <img src={getCardImage(currentGame?.C5)} alt="card" />
                    </span>
                </div>
                <div>
                    <span>
                        <img src={getCardImage(currentGame?.C2)} alt="card" />
                    </span>
                    <span>
                        <img src={getCardImage(currentGame?.C4)} alt="card" />
                    </span>
                    <span>
                        <img src={getCardImage(currentGame?.C6)} alt="card" />
                    </span>
                </div>
            </div>
        );
    }

    const handleResultClick = async (clickedIndex) => {
        const result = lastResults[clickedIndex];
        if (!result || !result.mid) return;

        try {
            const response = await fetchTeenpattiResults(result.mid, "teen62");
            if (response && response.length > 0) {
                setModalContent(response[0]);
                setResultModalOpen(true);
            } else {
                toast.error("Result not found");
            }
        } catch (error) {
            console.error("Error fetching result details:", error);
            toast.error("Failed to load result details");
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(
                window.innerWidth <= 768 && !window.location.search.includes("example1=on")
            );
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.[0]?.mid) return;
            try {
                const response = await fetchCasinoExposureApi({
                    markettype: "TEEN62",
                    main_event_id: gameData.t1[0].mid,
                    curPageName: "live_teenpatti_vip.php",
                });
                if (Array.isArray(response?.data)) {
                    setExposureData(response.data);
                }
            } catch (error) {
                console.error("Error fetching exposure:", error);
            }
        };
        fetchExposure();
    }, [gameData?.t1?.[0]?.mid, lastBetTime]);

    useEffect(() => {
        // Clear bets when round changes to avoid showing old round's bets
        setOpenBets([]);

        const loadOpenBets = async () => {
            // Use gameData mid if available, fallback to 1
            const currentEventId = gameData?.t1?.[0]?.mid || "1";
            try {
                const res = await fetchOpenBetsApi({
                    markettype: "TEEN62",
                    eventId: currentEventId,
                    curPageName: "live_teenpatti_vip.php",
                });

                if (res?.open_bet_data && Array.isArray(res.open_bet_data)) {
                    setOpenBets(res.open_bet_data);
                } else if (res?.data && Array.isArray(res.data)) {
                    setOpenBets(res.data);
                } else if (Array.isArray(res)) {
                    setOpenBets(res);
                }
            } catch (e) {
                console.error("Error loading open bets:", e);
            }
        };

        loadOpenBets();
    }, [gameData?.t1?.[0]?.mid, exposureTrigger]);

    const getExposure = (marketId) => {
        if (!Array.isArray(exposureData)) return 0;
        const market = exposureData.find((item) => item.market_id == marketId);
        return market ? market.win_loss || market.total_exposure : 0;
    };

    const renderExposure = (marketId) => {
        const exposure = getExposure(marketId);
        if (exposure === 0) return null;
        return (
            <span style={{ marginLeft: "5px", color: exposure >= 0 ? "green" : "red" }}>
                {exposure}
            </span>
        );
    };

    useEffect(() => {
        // Establish socket connection
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
            console.log("📤 Emitting Room: teen62");
            socket.emit("Room", "teen62");
            socket.emit("gameResult");
        };

        socket.on("connect", () => {
            console.log("✅ Connected to game socket:", socket.id);
            joinRoom();
        });

        socket.on("reconnect", (attempt) => {
            console.log(`🔄 Reconnected to game socket after ${attempt} attempts`);
            joinRoom();
        });

        socket.on("reconnect_attempt", (attempt) => {
            console.log(`🔄 Attempting to reconnect... (Attempt ${attempt})`);
        });

        socket.on("reconnect_error", (error) => {
            console.error("❌ Socket Reconnection Error:", error);
        });

        socket.on("reconnect_failed", () => {
            console.error("❌ Socket Reconnection Failed");
        });

        socket.on("connect_error", (error) => {
            console.error("❌ Socket Connection Error:", error);
        });

        socket.on("game", (data) => {
            const targetData = Array.isArray(data) ? data[0] : data;
            if (targetData) {
                setGameData(targetData);
            }
        });

        socket.on("gameResult", (data) => {
            setLastResults(data);
        });

        socket.onAny((event, ...args) => {
            if (event !== "game" && event !== "gameResult") {
                console.log(`🔍 Socket Event Received: ${event}`, args);
            }
        });

        socket.on("disconnect", (reason) => {
            console.log("⚠️ Disconnected from game socket, reason:", reason);
            if (reason === "io server disconnect" || reason === "transport close") {
                socket.connect();
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const getCardImage = (cardCode) => {
        if (!cardCode || cardCode === "1")
            return "https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png";
        return `https://wver.sprintstaticdata.com/v190/static/front/img/cards/${cardCode}.png`;
    };

    const getSuspendedClass = (status) => {
        return status === "SUSPENDED" || status === "suspended" ? "suspended" : "";
    };

    const getOddsByNat = (nat) => {
        return gameData?.t2?.find((item) => item.nat === nat);
    };
    // Helper function to get min/max for a market
    const getMinMax = (sid) => {
        const market = gameData?.t2?.find((m) => m.sid === sid);
        return {
            min: market?.min || 100,
            max: market?.max || 25000,
        };
    };

    // Handle odds box click
    const handleOddsClick = (teamName, odds, sid, isBack) => {
        const { min, max } = getMinMax(sid);
        if (onBetSelection) {
            onBetSelection({
                teamName,
                odds,
                minBet: min,
                maxBet: max,
                isBack,
                marketId: sid,
                eventId: gameData?.t1?.[0]?.mid,
            });
        }
    };

    const getOddsBySid = (sid) => {
        return gameData?.t2?.find((item) => item.sid === sid);
    };

    const getTimerColorClass = () => {
        const timerValue = parseInt(gameData?.t1?.[0]?.autotime) || 0;
        if (timerValue <= 5) return "red";
        if (timerValue <= 10) return "orange";
        return "green";
    };

    return (
        <>
            <style>
                {`
          .teenpatti-mobile-container {
            padding: 0 !important;
            margin: 0 !important;
            background-color: #2e3439;
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
          .mobile-section {
            background: #DDDDDD;
            padding: 5px;
            border-radius: 4px;
          }
                       .teenpatti-new .casino-video-cards {
                          position: absolute;
                          left: 0;
                          top: 55%;
                          transform: translateY(-50%);
                          width: 110px;
                          height: 105px;
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

                   /* Reduce Header Font Sizes for Mobile & Remove Background/Spacing */
                   .casino-video-title {
                       background: transparent !important;
                       padding-left: 0 !important;
                       margin-left: 0 !important;
                       left: 0 !important;
                   }
                   .casino-video-title .casino-name {
                       font-size: 12px !important;
                   }
                   .casino-video-title .casino-video-rid {
                       font-size: 10px !important;
                   }

                   /* Mobile Video Icons: Vertical & Right Aligned */
                   .casino-video-right-icons {
                       right: 2px !important; /* Right aligned */
                       top: 2px !important;
                       display: flex !important;
                       flex-direction: column !important; /* Vertical layout */
                       gap: 2px !important;
                   }
                   .casino-video-right-icons > div {
                       margin: 0 !important;
                       width: 30px !important; /* Reduced width */
                       height: 30px !important; /* Reduced height */
                       line-height: 20px !important;
                   }
                   .casino-video-right-icons i {
                       font-size: 18px !important; /* Reduced icon size */
                   }

        `}
            </style>
            <div className="casino-table teenpatti-new">
                <CasinoVideo
                    gameName="V Vip Teenpatti 1-Day"
                    roundId={gameData?.t1?.[0]?.mid || "Loading..."}
                    videoSrc="/newmediaplayer/teen62/667946cf-39ee-4f49-901e-13d5438e91ad"
                    isCardDrawerOpen={isDrawerOpen}
                    setIsCardDrawerOpen={setIsDrawerOpen}
                    autotime={gameData?.t1?.[0]?.autotime}
                    totalTime={gameData?.t1?.[0]?.ft}
                    cards={[
                        gameData?.t1?.[0]?.C1,
                        gameData?.t1?.[0]?.C2,
                        gameData?.t1?.[0]?.C3,
                        gameData?.t1?.[0]?.C4,
                        gameData?.t1?.[0]?.C5,
                        gameData?.t1?.[0]?.C6,
                    ]}
                    CardsComponent={VideoCards}
                />

                {/* Betting Section */}
                <div className="casino-detail">
                    {isMobileView ? (
                        <div className="teenpatti-mobile-container">
                            <style>
                                {`
                    .teenpatti-mobile-container {
                      padding: 0;
                      background-color: #2e3439;
                      color: #ccc;
                      font-family: sans-serif;
                    }
                    .mobile-section-container {
                      margin-bottom: 5px;
                      background-color: #3b3b3b;
                      border: 1px solid #444;
                    }
                    .mobile-section-header {
                      display: flex;
                      justify-content: space-between;
                      background-color: #2a2a2a;
                      padding: 6px 4px;
                      font-size: 11px;
                      font-weight: bold;
                      color: #aaa;
                      border-bottom: 1px solid #444;
                    }
                    .mobile-section-header > div {
                      flex: 1;
                      text-align: center;
                    }
                    .mobile-section-header > div:first-child {
                      text-align: left;
                      flex: 1.5;
                      padding-left: 5px;
                    }
                    
                    .mobile-row {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      padding: 1px 0;
                      border-bottom: 1px solid #444;
                      gap: 1px;
                    }
                    .mobile-row:last-child {
                      border-bottom: none;
                    }
                    
                    .mobile-row-label {
                      flex: 1.5;
                      height: 38px;
                      display: flex;
                      align-items: center;
                      font-size: 12px;
                      font-weight: 600;
                      padding-left: 10px;
                      color: #DDDDDD;
                    }
  
                    .mobile-odds-box {
                      flex: 1;
                      height: 38px;
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: center;
                      font-weight: bold;
                      font-size: 14px;
                      cursor: pointer;
                      position: relative;
                      border-left: 1px solid #444;
                    }
                    
                    .mobile-odds-box.back { background-color: #72bbef; color: #000; }
                    .mobile-odds-box.lay { background-color: #fca4b7; color: #000; }
  
                    .mobile-odds-box.suspended {
                        background-color: #444 !important;
                        color: #777 !important;
                        cursor: not-allowed;
                    }
                    
                    .mobile-odds-box i { font-size: 14px; }
                     
                    /* Results strip styles */
                    .mobile-results-strip {
                      display: flex;
                      align-items: center;
                      overflow-x: auto;
                      padding: 10px;
                      background: #2a2a2a;
                      gap: 8px;
                      margin-top: 5px;
                      border-top: 1px solid #444;
                    }
                    .result-circle {
                      width: 28px;
                      height: 28px;
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 14px;
                      font-weight: bold;
                      flex-shrink: 0;
                      cursor: pointer;
                      color: #DDDDDD;
                    }
                    .result-circle.resulta { background-color: #1e3a8a; } /* Blue */
                    .result-circle.resultb { background-color: #991b1b; } /* Red */
                    .result-circle.resulttie { background-color: #166534; } /* Green */
                `}
                            </style>

                            {/* SECTION: MAIN */}
                            <div className="mobile-section-container">
                                <div className="mobile-section-header">
                                    <div>MAIN</div>
                                    <div>BACK</div>
                                    <div>LAY</div>
                                </div>

                                {/* Main Player A */}
                                <div className="mobile-row">
                                    <div className="mobile-row-label">PLAYER A {renderExposure(1)}</div>
                                    <div
                                        className={`mobile-odds-box back ${getSuspendedClass(getOddsBySid(1)?.gstatus)}`}
                                        onClick={() => handleOddsClick("Player A", getOddsBySid(1)?.b1, 1, true)}
                                    >
                                        {getOddsBySid(1)?.visible === 1 ? getOddsBySid(1)?.b1 : <i className="fas fa-lock"></i>}
                                    </div>
                                    <div
                                        className={`mobile-odds-box lay ${getSuspendedClass(getOddsBySid(1)?.gstatus)}`}
                                        onClick={() => handleOddsClick("Player A", getOddsBySid(1)?.l1, 1, false)}
                                    >
                                        {getOddsBySid(1)?.visible === 1 ? getOddsBySid(1)?.l1 : <i className="fas fa-lock"></i>}
                                    </div>
                                </div>

                                {/* Main Player B */}
                                <div className="mobile-row">
                                    <div className="mobile-row-label">PLAYER B {renderExposure(2)}</div>
                                    <div
                                        className={`mobile-odds-box back ${getSuspendedClass(getOddsBySid(2)?.gstatus)}`}
                                        onClick={() => handleOddsClick("Player B", getOddsBySid(2)?.b1, 2, true)}
                                    >
                                        {getOddsBySid(2)?.visible === 1 ? getOddsBySid(2)?.b1 : <i className="fas fa-lock"></i>}
                                    </div>
                                    <div
                                        className={`mobile-odds-box lay ${getSuspendedClass(getOddsBySid(2)?.gstatus)}`}
                                        onClick={() => handleOddsClick("Player B", getOddsBySid(2)?.l1, 2, false)}
                                    >
                                        {getOddsBySid(2)?.visible === 1 ? getOddsBySid(2)?.l1 : <i className="fas fa-lock"></i>}
                                    </div>
                                </div>
                            </div>

                            {/* SECTION: CONSECUTIVE */}
                            <div className="mobile-section-container">
                                <div className="mobile-section-header">
                                    <div>CONSECUTIVE</div>
                                    <div>BACK</div>
                                    <div>LAY</div>
                                </div>

                                <div className="mobile-row">
                                    <div className="mobile-row-label">PLAYER A {renderExposure(17)}</div>
                                    <div
                                        className={`mobile-odds-box back ${getSuspendedClass(getOddsBySid(17)?.gstatus)}`}
                                        onClick={() => handleOddsClick("Player A", getOddsBySid(17)?.b1, 17, true)}
                                    >
                                        {getOddsBySid(17)?.gstatus === "OPEN" ? getOddsBySid(17)?.b1 : <i className="fas fa-lock"></i>}
                                    </div>
                                    <div
                                        className={`mobile-odds-box lay ${getSuspendedClass(getOddsBySid(17)?.gstatus)}`}
                                        onClick={() => handleOddsClick("Player A", getOddsBySid(17)?.l1, 17, false)}
                                    >
                                        {getOddsBySid(17)?.gstatus === "OPEN" ? getOddsBySid(17)?.l1 : <i className="fas fa-lock"></i>}
                                    </div>
                                </div>

                                <div className="mobile-row">
                                    <div className="mobile-row-label">PLAYER B {renderExposure(18)}</div>
                                    <div
                                        className={`mobile-odds-box back ${getSuspendedClass(getOddsBySid(18)?.gstatus)}`}
                                        onClick={() => handleOddsClick("Player B", getOddsBySid(18)?.b1, 18, true)}
                                    >
                                        {getOddsBySid(18)?.gstatus === "OPEN" ? getOddsBySid(18)?.b1 : <i className="fas fa-lock"></i>}
                                    </div>
                                    <div
                                        className={`mobile-odds-box lay ${getSuspendedClass(getOddsBySid(18)?.gstatus)}`}
                                        onClick={() => handleOddsClick("Player B", getOddsBySid(18)?.l1, 18, false)}
                                    >
                                        {getOddsBySid(18)?.gstatus === "OPEN" ? getOddsBySid(18)?.l1 : <i className="fas fa-lock"></i>}
                                    </div>
                                </div>
                            </div>

                            {/* SECTION: CARDS ODD / EVEN */}
                            <div className="mobile-section-container">
                                <div className="mobile-section-header">
                                    <div>CARDS</div>
                                    <div>ODD</div>
                                    <div>EVEN</div>
                                </div>
                                {cardPairs.map((pair, index) => {
                                    const cardSid = 11 + index;
                                    const item = getOddsBySid(cardSid);
                                    const oddData = item?.odds?.find((o) => o.nat === "Odd");
                                    const evenData = item?.odds?.find((o) => o.nat === "Even");

                                    return (
                                        <div key={index} className="mobile-row">
                                            <div className="mobile-row-label">CARD {pair}</div>
                                            <div
                                                className={`mobile-odds-box back ${getSuspendedClass(item?.gstatus)}`}
                                                onClick={() => handleOddsClick(`Card ${pair} - Odd`, oddData?.b, cardSid, true)}
                                            >
                                                {item?.visible === 1 ? oddData?.b || "0" : <i className="fas fa-lock"></i>}
                                            </div>
                                            <div
                                                className={`mobile-odds-box back ${getSuspendedClass(item?.gstatus)}`}
                                                onClick={() => handleOddsClick(`Card ${pair} - Even`, evenData?.b, cardSid, true)}
                                            >
                                                {item?.visible === 1 ? evenData?.b || "0" : <i className="fas fa-lock"></i>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* LAST RESULTS STRIP */}
                            {/* <div className="mobile-results-strip">
                <span style={{ fontSize: "11px", color: "#888", fontWeight: "bold", marginRight: "5px" }}>LAST RESULTS</span>
                {lastResults && lastResults.length > 0 ? (
                  lastResults.map((res, index) => (
                    <div
                      key={index}
                      className={`result-circle ${getColorClass(res.result)}`}
                      onClick={() => handleResultClick(index)}
                    >
                      {getResultTxt(res.result)}
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: "12px", color: "#666" }}>Wait...</div>
                )}
              </div> */}

                        </div>
                    ) : (
                        // DESKTOP VIEW (Existing preserved)
                        <div className="teen1daycasino-container">
                            {/* Player A Column */}
                            <div className="teen1dayleft">
                                <div className="casino-box-row">
                                    <div className="casino-nation-name no-border casino-bl-box-title">
                                        <div className="playera">Player A</div>
                                    </div>
                                    <div className="casino-bl-box casino-bl-box-title">
                                        <div className="casino-bl-box-item">
                                            <b>Back</b>
                                        </div>
                                        <div className="casino-bl-box-item">
                                            <b>Lay</b>
                                        </div>
                                    </div>
                                </div>

                                <div className="casino-box-row">
                                    <div className="casino-nation-name">
                                        <b>Main {renderExposure(1)}</b>
                                    </div>
                                    <div className="casino-bl-box">
                                        <div
                                            className={`back casino-bl-box-item ${getSuspendedClass(
                                                getOddsBySid(1)?.gstatus
                                            )}`}
                                            onClick={() => handleOddsClick("Player A", getOddsBySid(1)?.b1, 1, true)}
                                            style={{
                                                cursor:
                                                    getOddsBySid(1)?.visible === 1
                                                        ? "pointer"
                                                        : "default",
                                            }}
                                        >
                                            <span className="casino-box-odd">
                                                {getOddsBySid(1)?.visible === 1 ? (
                                                    getOddsBySid(1)?.b1 || "0"
                                                ) : (
                                                    <i className="fas fa-lock"></i>
                                                )}
                                            </span>
                                        </div>
                                        <div
                                            className={`lay casino-bl-box-item ${getSuspendedClass(
                                                getOddsBySid(1)?.gstatus
                                            )}`}
                                            onClick={() => handleOddsClick("Player A", getOddsBySid(1)?.l1, 1, false)}
                                            style={{
                                                cursor:
                                                    getOddsBySid(1)?.visible === 1
                                                        ? "pointer"
                                                        : "default",
                                            }}
                                        >
                                            <span className="casino-box-odd">
                                                {getOddsBySid(1)?.visible === 1 ? (
                                                    getOddsBySid(1)?.l1 || "0"
                                                ) : (
                                                    <i className="fas fa-lock"></i>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="casino-box-row">
                                    <div className="casino-nation-name">
                                        <b>Consecutive {renderExposure(17)}</b>
                                    </div>
                                    <div className="casino-bl-box">
                                        <div
                                            className={`back casino-bl-box-item ${getSuspendedClass(
                                                getOddsBySid(17)?.gstatus
                                            )}`}
                                            onClick={() => handleOddsClick("Player A", getOddsBySid(17)?.b1, 17, true)}
                                            style={{
                                                cursor:
                                                    getOddsBySid(17)?.gstatus === "OPEN"
                                                        ? "pointer"
                                                        : "default",
                                            }}
                                        >
                                            <span className="casino-box-odd">
                                                {getOddsBySid(17)?.gstatus === "OPEN" ? (
                                                    getOddsBySid(17)?.b1 || "0"
                                                ) : (
                                                    <i className="fas fa-lock"></i>
                                                )}
                                            </span>
                                        </div>
                                        <div
                                            className={`lay casino-bl-box-item ${getSuspendedClass(
                                                getOddsBySid(17)?.gstatus
                                            )}`}
                                            onClick={() => handleOddsClick("Player A", getOddsBySid(17)?.l1, 17, false)}
                                            style={{
                                                cursor:
                                                    getOddsBySid(17)?.gstatus === "OPEN"
                                                        ? "pointer"
                                                        : "default",
                                            }}
                                        >
                                            <span className="casino-box-odd">
                                                {getOddsBySid(17)?.gstatus === "OPEN" ? (
                                                    getOddsBySid(17)?.l1 || "0"
                                                ) : (
                                                    <i className="fas fa-lock"></i>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="teen1daycenter"></div>

                            {/* Player B Column */}
                            <div className="teen1dayright">
                                <div className="casino-box-row">
                                    <div className="casino-nation-name no-border casino-bl-box-title">
                                        <div className="playerb">Player B</div>
                                    </div>
                                    <div className="casino-bl-box casino-bl-box-title">
                                        <div className="casino-bl-box-item">
                                            <b>Back</b>
                                        </div>
                                        <div className="casino-bl-box-item">
                                            <b>Lay</b>
                                        </div>
                                    </div>
                                </div>

                                <div className="casino-box-row">
                                    <div className="casino-nation-name">
                                        <b>Main {renderExposure(2)}</b>
                                    </div>
                                    <div className="casino-bl-box">
                                        <div
                                            className={`back casino-bl-box-item ${getSuspendedClass(
                                                getOddsBySid(2)?.gstatus
                                            )}`}
                                            onClick={() => handleOddsClick("Player B", getOddsBySid(2)?.b1, 2, true)}
                                            style={{
                                                cursor:
                                                    getOddsBySid(2)?.visible === 1
                                                        ? "pointer"
                                                        : "default",
                                            }}
                                        >
                                            <span className="casino-box-odd">
                                                {getOddsBySid(2)?.visible === 1 ? (
                                                    getOddsBySid(2)?.b1 || "0"
                                                ) : (
                                                    <i className="fas fa-lock"></i>
                                                )}
                                            </span>
                                        </div>
                                        <div
                                            className={`lay casino-bl-box-item ${getSuspendedClass(
                                                getOddsBySid(2)?.gstatus
                                            )}`}
                                            onClick={() => handleOddsClick("Player B", getOddsBySid(2)?.l1, 2, false)}
                                            style={{
                                                cursor:
                                                    getOddsBySid(2)?.visible === 1
                                                        ? "pointer"
                                                        : "default",
                                            }}
                                        >
                                            <span className="casino-box-odd">
                                                {getOddsBySid(2)?.visible === 1 ? (
                                                    getOddsBySid(2)?.l1 || "0"
                                                ) : (
                                                    <i className="fas fa-lock"></i>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="casino-box-row">
                                    <div className="casino-nation-name">
                                        <b>Consecutive {renderExposure(18)}</b>
                                    </div>
                                    <div className="casino-bl-box">
                                        <div
                                            className={`back casino-bl-box-item ${getSuspendedClass(
                                                getOddsBySid(18)?.gstatus
                                            )}`}
                                            onClick={() => handleOddsClick("Player B", getOddsBySid(18)?.b1, 18, true)}
                                            style={{
                                                cursor:
                                                    getOddsBySid(18)?.gstatus === "OPEN"
                                                        ? "pointer"
                                                        : "default",
                                            }}
                                        >
                                            <span className="casino-box-odd">
                                                {getOddsBySid(18)?.gstatus === "OPEN" ? (
                                                    getOddsBySid(18)?.b1 || "0"
                                                ) : (
                                                    <i className="fas fa-lock"></i>
                                                )}
                                            </span>
                                        </div>
                                        <div
                                            className={`lay casino-bl-box-item ${getSuspendedClass(
                                                getOddsBySid(18)?.gstatus
                                            )}`}
                                            onClick={() => handleOddsClick("Player B", getOddsBySid(18)?.l1, 18, false)}
                                            style={{
                                                cursor:
                                                    getOddsBySid(18)?.gstatus === "OPEN"
                                                        ? "pointer"
                                                        : "default",
                                            }}
                                        >
                                            <span className="casino-box-odd">
                                                {getOddsBySid(18)?.gstatus === "OPEN" ? (
                                                    getOddsBySid(18)?.l1 || "0"
                                                ) : (
                                                    <i className="fas fa-lock"></i>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Odd/Even Grid */}
                            <div className="teen1dayother">
                                <div className="casino-box-row">
                                    <div className="casino-nation-name no-border"></div>
                                    {cardPairs.map((pair) => (
                                        <div key={pair} className="casino-bl-box">
                                            <div className="casino-bl-box-item">
                                                <b>Card {pair}</b>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="casino-box-row">
                                    <div className="casino-nation-name">
                                        <b>Odd</b>
                                    </div>
                                    {cardPairs.map((pair, index) => {
                                        const cardSid = 11 + index;
                                        const item = getOddsBySid(cardSid);
                                        const oddData = item?.odds?.find((o) => o.nat === "Odd");

                                        return (
                                            <div key={index} className="casino-bl-box">
                                                <div
                                                    className={`back casino-bl-box-item ${getSuspendedClass(
                                                        item?.gstatus
                                                    )}`}
                                                    onClick={() =>
                                                        handleOddsClick(
                                                            `Card ${pair} - Odd`,
                                                            oddData?.b,
                                                            cardSid,
                                                            true
                                                        )
                                                    }
                                                    style={{
                                                        cursor: item?.visible === 1 ? "pointer" : "default",
                                                    }}
                                                >
                                                    <span className="casino-box-odd">
                                                        {item?.visible === 1 ? (
                                                            oddData?.b || "0"
                                                        ) : (
                                                            <i className="fas fa-lock"></i>
                                                        )}
                                                    </span>
                                                    <span className="d-none">0</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="casino-box-row">
                                    <div className="casino-nation-name">
                                        <b>Even</b>
                                    </div>
                                    {cardPairs.map((pair, index) => {
                                        const cardSid = 11 + index;
                                        const item = getOddsBySid(cardSid);
                                        const evenData = item?.odds?.find((o) => o.nat === "Even");

                                        return (
                                            <div key={index} className="casino-bl-box">
                                                <div
                                                    className={`back casino-bl-box-item ${getSuspendedClass(
                                                        item?.gstatus
                                                    )}`}
                                                    onClick={() =>
                                                        handleOddsClick(
                                                            `Card ${pair} - Even`,
                                                            evenData?.b,
                                                            cardSid,
                                                            true
                                                        )
                                                    }
                                                    style={{
                                                        cursor: item?.visible === 1 ? "pointer" : "default",
                                                    }}
                                                >
                                                    <span className="casino-box-odd">
                                                        {item?.visible === 1 ? (
                                                            evenData?.b || "0"
                                                        ) : (
                                                            <i className="fas fa-lock"></i>
                                                        )}
                                                    </span>
                                                    <span className="d-none">0</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
            {/* Result Modal */}


            {/* MOBILE FAB FOR MY BETS */}
            {
                isMobileView && openBets.length > 0 && (
                    <>
                        <div
                            onClick={() => setIsMyBetsModalOpen(true)}
                            style={{
                                position: "fixed",
                                bottom: "80px",
                                right: "10px",
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                                backgroundColor: "#008080",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 1000,
                                cursor: "pointer",
                                border: "2px solid #DDDDDD",
                            }}
                        >
                            <span
                                style={{ color: "white", fontWeight: "bold", fontSize: "16px" }}
                            >
                                {openBets.length}
                            </span>
                        </div>

                        {/* My Bets Modal */}
                        <Modal
                            isOpen={isMyBetsModalOpen}
                            onRequestClose={() => setIsMyBetsModalOpen(false)}
                            style={{
                                content: {
                                    top: "40%",
                                    left: "0",
                                    right: "0",
                                    bottom: "0",
                                    marginRight: "0",
                                    transform: "none",
                                    width: "100%",
                                    maxWidth: "100%",
                                    padding: "0",
                                    backgroundColor: "transparent",
                                    border: "none",
                                    zIndex: 1100,
                                    borderRadius: "0",
                                },
                                overlay: {
                                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                                    zIndex: 1100,
                                },
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: "#2e3439",
                                    borderRadius: "4px",
                                    overflow: "hidden",
                                    fontFamily: "sans-serif",
                                }}
                            >
                                {/* Header */}
                                <div
                                    style={{
                                        backgroundColor: "#13624e",
                                        padding: "10px 15px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        color: "#FFD700",
                                        fontWeight: "bold",
                                        fontSize: "14px",
                                    }}
                                >
                                    <span>My Bets</span>
                                    <span
                                        onClick={() => setIsMyBetsModalOpen(false)}
                                        style={{
                                            color: "white",
                                            cursor: "pointer",
                                            fontSize: "16px",
                                        }}
                                    >
                                        ✕
                                    </span>
                                </div>

                                {/* Table Header */}
                                <div
                                    style={{
                                        backgroundColor: "#13624e",
                                        padding: "8px 10px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        color: "white",
                                        fontSize: "12px",
                                        borderTop: "1px solid #0f513f",
                                    }}
                                >
                                    <div style={{ flex: 2 }}>Placed Bets</div>
                                    <div style={{ flex: 1, textAlign: "center" }}>Odds</div>
                                    <div style={{ flex: 1, textAlign: "right" }}>Stake</div>
                                </div>

                                {/* Bets List */}
                                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                                    {openBets.length > 0 ? (
                                        openBets.map((bet, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    padding: "10px",
                                                    borderBottom: "1px solid #444",
                                                    backgroundColor: "#2e3439",
                                                    color: "#ccc",
                                                    fontSize: "12px",
                                                    alignItems: "center",
                                                    borderLeft: `4px solid ${(bet.bet_type || "back").toLowerCase() === "back"
                                                        ? "#72bbef"
                                                        : "#f994ba"
                                                        }`,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        flex: 2,
                                                        display: "flex",
                                                        flexDirection: "column",
                                                    }}
                                                >
                                                    <span style={{ color: "white" }}>
                                                        {bet.market_name}
                                                    </span>
                                                </div>
                                                <div style={{ flex: 1, textAlign: "center" }}>
                                                    {bet.bet_odds || bet.odds}
                                                </div>
                                                <div style={{ flex: 1, textAlign: "right" }}>
                                                    {bet.bet_stack || bet.stake}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div
                                            style={{
                                                padding: "20px",
                                                textAlign: "center",
                                                color: "#888",
                                                fontSize: "12px",
                                            }}
                                        >
                                            No Active Bets
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Modal>
                    </>

                )
            }

            <Modal
                isOpen={resultModalOpen}
                onRequestClose={() => setResultModalOpen(false)}
                className="casino-result-modal-v2" // Ensure you have this class or similar styling
                overlayClassName="casino-modal-overlay"
                style={{
                    content: {
                        padding: 0,
                        border: "none",
                        background: "transparent",
                        inset: isMobileView ? "10px" : "auto",
                        maxWidth: isMobileView ? "100%" : "800px",
                        margin: "0 auto",
                    },
                    overlay: {
                        backgroundColor: "rgba(0, 0, 0, 0.75)",
                        zIndex: 1000,
                    },
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 15px",
                        background: "#2e3439",
                        color: "#DDDDDD",
                        borderTopLeftRadius: "8px",
                        borderTopRightRadius: "8px",
                    }}
                >
                    <h3 style={{ margin: 0, fontSize: "16px" }}>VIP TeenPatti Result</h3>
                    <button
                        onClick={() => setResultModalOpen(false)}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#DDDDDD",
                            fontSize: "24px",
                            cursor: "pointer",
                        }}
                    >
                        &times;
                    </button>
                </div>
                <div style={{ background: "#2e3439", padding: "0" }}>
                    <Result_Teen62 modalContent={modalContent} />
                </div>
            </Modal>
        </>
    );
};

export default TeenPatti62;
