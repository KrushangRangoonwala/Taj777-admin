import { io } from "socket.io-client";
import React, { useState, useEffect, useRef } from "react";
import { fetchCasinoExposureApi, fetchOpenBetsApi } from "../../api/api";
import Modal from "react-modal";
import CasinoVideo from "./components/CasinoVideo";
import "./Cards32.css";
import useIsMobile from "../../hooks/useIsMobile";
import { getExposureClass } from "../../utilies/helpers";

const Cards32B = ({ onBetSelection, exposureTrigger }) => {
  const [gameData, setGameData] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [exposureData, setExposureData] = useState([]);
  const [openBets, setOpenBets] = useState([]);
  const [isMyBetsModalOpen, setIsMyBetsModalOpen] = useState(false);
  const socketRef = useRef(null);
  const isMobileView = useIsMobile();


  const fetchExposure = async () => {
    const mid = gameData?.t1?.[0]?.mid;
    if (!mid) return;

    // Use part after decimal point if it exists, otherwise use full mid
    const cleanMid = mid.toString().split(".")[1] || mid;

    try {
      const response = await fetchCasinoExposureApi({
        markettype: "32CARDSB",
        main_event_id: cleanMid,
        curPageName: "live_32_cards.php",
      });
      if (Array.isArray(response?.data)) {
        setExposureData(response.data);
      } else {
        setExposureData([]);
      }
    } catch (error) {
      console.error("Error fetching exposure:", error);
    }
  };

  useEffect(() => {
    fetchExposure();
  }, [gameData?.t1?.[0]?.mid, exposureTrigger]);

  useEffect(() => {
    // Clear bets when round changes to avoid showing old round's bets
    setOpenBets([]);

    const loadOpenBets = async () => {
      // Use gameData mid if available, fallback to 1 
      const currentEventId = gameData?.t1?.[0]?.mid || "1";
      // Use part after decimal point if it exists, otherwise use full mid
      const cleanedEventId = currentEventId.toString().split(".")[1] || currentEventId;

      try {
        const res = await fetchOpenBetsApi({
          markettype: "32CARDSB",
          eventId: cleanedEventId,
          curPageName: "live_32_cards.php",
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

  const renderExposure = (marketId, isAbsolute = true) => {
    const exposure = getExposure(marketId);
    if (exposure === 0) return null;

    if (isAbsolute) {
      return (
        <span
          style={{
            position: "absolute",
            left: "-35px",
            color: exposure >= 0 ? "#39FF39" : "#FF0000", //
            fontSize: "12px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
          }}
          className={`mr-2 ${getExposureClass(exposure)}`}
        >
          {exposure}
          {/* 100 */}
        </span>
      );
    } else {
      return (
        <span className={`mr-2 ${getExposureClass(exposure)}`}>
          {exposure}
        </span>
      )
    }
  };

  useEffect(() => {
    // Establish socket connection
    console.log(
      "Attempting to connect to socket for Cards32B: https://trubet9.bet:2053"
    );
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
      console.log("📤 Emitting Room: card32eu");
      socket.emit("Room", "card32eu");
    };

    socket.on("connect", () => {
      console.log("✅ Cards32B connected to game socket:", socket.id);
      joinRoom();
    });

    socket.on("gameResult", (data) => {
      console.log("📥 Received 'gameResult' in Cards32B. Refreshing exposure...");
      // Refresh exposure (likely to 0 or settled) when round ends
      // We use the current gameData mid, or wait a mo?
      // Usually result means round ended. Exposure for *that* round might be settled?
      // Actually, we probably want to clear it or re-fetch.
      setTimeout(() => {
        fetchExposure();
      }, 1000);
    });

    socket.on("reconnect", (attempt) => {
      console.log(`🔄 Cards32B reconnected after ${attempt} attempts`);
      joinRoom();
    });

    socket.on("reconnect_attempt", (attempt) => {
      console.log(
        `🔄 Cards32B Attempting to reconnect... (Attempt ${attempt})`
      );
    });

    socket.on("reconnect_error", (error) => {
      console.error("❌ Cards32B Socket Reconnection Error:", error);
    });

    socket.on("reconnect_failed", () => {
      console.error("❌ Cards32B Socket Reconnection Failed");
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Cards32B Socket Connection Error:", error);
    });

    socket.on("game", (data) => {
      const targetData = Array.isArray(data) ? data[0] : data;
      if (targetData) {
        // Determine gtype safely
        const gtype = targetData.gtype || targetData?.t1?.[0]?.gtype;

        // Log the timestamp to see if data is coming continuously
        const currentTime = new Date().toLocaleTimeString();
        // console.log(
        //     `📥 [${currentTime}] Cards32B Received 'game' data (Type: ${gtype}):`,
        //     targetData
        // );
        setGameData(targetData);
      } else {
        console.warn("⚠️ Cards32B Received empty or invalid 'game' data");
      }
    });

    socket.io.on("error", (error) => {
      console.error("❌ Cards32B Transport Error:", error);
    });

    socket.onAny((event, ...args) => {
      if (event !== "game" && event !== "gameResult") {
        console.log(`🔍 Cards32B Socket Event: ${event}`, args);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("⚠️ Cards32B disconnected from game socket, reason:", reason);
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
    if (!cardCode)
      return "/assets/cards/1.png"; // Default

    let code = cardCode.toString();
    if (code === "1") code = "A";
    if (code === "11") code = "J";
    if (code === "12") code = "Q";
    if (code === "13") code = "K";

    // Handle "20" or other unknown codes by returning a default or specific image if known.
    // For now, if "20", we might assume it's a specific graphic or fallback.
    // If v190 uses standard suits, "20" is invalid.
    // For debugging, if 20 is passed, we'll try to just use default or 'back' if available?
    // But since we saw "20" in the data, let's try to map it to 'back' or similar if it fails?
    // Actually, maybe 20 IS valid in some 32 card set? But v190 is teenpatti.
    // Let's safe check:
    if (["20"].includes(code))
      return "/assets/cards/back.png"; // Fallback to avoid broken image

    return `/assets/cards/${code}.png`;
  };

  const getSuspendedClass = (status) => {
    return !isMarketOpen(status) ? "suspended" : "";
  };

  const getMinMax = (sid) => {
    const market = gameData?.t2?.find((m) => String(m.sid) === String(sid));
    return {
      min: market?.min || gameData?.t1?.[0]?.min || 100,
      max: market?.max || gameData?.t1?.[0]?.max || 50000,
    };
  };

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

  const isMarketOpen = (status) => {
    if (!status) return false;
    const s = status.toString().toUpperCase();
    return s === "ACTIVE" || s === "OPEN" || s === "0";
  };

  const isSuspended = (status) => {
    return !isMarketOpen(status);
  };

  const getOddsBySid = (sid) => {
    return gameData?.t2?.find((item) => String(item.sid) === String(sid));
  };



  const VideoCards = () => {
    return (
      <div className="casino-video-cards-container">
        <div
          className="vertical-card-box"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "2px",
            margin: "0 !important",
            padding: "0 !important",
          }}
        >
          {(() => {
            const t1 = gameData?.t1?.[0];
            // Scores from C1-C4
            const scores = [t1?.C1, t1?.C2, t1?.C3, t1?.C4];
            const numericScores = scores.map((s) => parseInt(s) || 0);
            const maxScore = Math.max(...numericScores);
            // Card images from desc (comma-separated card codes)
            const descCards = t1?.desc?.split(",") || [];

            return [8, 9, 10, 11].map((playerNum, idx) => {
              const score = scores[idx];
              const numericScore = numericScores[idx];

              // Collect ALL cards for this player (every 4th card starting from idx)
              const playerCards = [];
              for (let i = idx; i < descCards.length; i += 4) {
                const card = descCards[i];
                if (card && card !== "1") {
                  playerCards.push(card);
                }
              }

              // Only render if score is valid AND player has at least one card
              if (
                !score ||
                score === "0" ||
                playerCards.length === 0
              ) {
                return null;
              }

              const isWinner = numericScore === maxScore && maxScore > 0;
              const labelColor = isWinner ? "#22c55e" : "#fff";

              return (
                <div key={playerNum} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  <div
                    className="dealer-name w-100"
                    style={{
                      color: labelColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingLeft: "2px",
                      paddingRight: "2px",
                    }}
                  >
                    <span>PLAYER {playerNum}:</span>
                    <span style={{ color: "#fff" }}>{score}</span>
                  </div>
                  <div className="w-100" style={{ display: "flex", flexWrap: "wrap", gap: "2px" }}>
                    {playerCards.map((card, cardIdx) => (
                      <span key={cardIdx}>
                        <img
                          src={getCardImage(card)}
                          alt="card"
                          style={isMobileView ? { width: "15px" } : {}}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    );
  };

  return (
    <>
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
              style={{ color: "white", cursor: "pointer", fontSize: "16px" }}
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

      <style>
        {`
            .cards32b-mobile-container {
                padding: 0 !important;
                margin: 0 !important;
                background-color: #2e3439;
                color: #ccc;
                font-family: sans-serif;
                width: 100% !important;
                max-width: 100% !important;
            }
            /* Force parent overrides */
            .casino-table.cards32b, 
            .casino-detail {
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
            }
            .mobile-section {
                background: #fff;
                padding: 5px;
                border-radius: 4px;
            }
            .rules-section .table td, .rules-section .table th {
              border-bottom: 1px solid #444;
              border-right: 1px solid #444;
              vertical-align: middle;
              text-align: center;
          }

          .table td {
              color: #fff !important;
          }
                   /* Mobile-specific overrides for card drawer */
                   @media (max-width: 768px) {
                        .cards32b .casino-video-cards {
                           height: auto !important; /* Auto height */
                           width: 115px !important;
                           left: 0 !important; 
                           position: absolute !important;
                           z-index: 2000 !important; 
                          //  background-color: rgba(0, 0, 0, 0.7) !important; 
                           padding: 0 !important; 
                          //  border-top-right-radius: 20px !important; 
                          //  border-bottom-right-radius: 20px !important; 
                           display: flex !important;
                           flex-direction: row-reverse !important; 
                           align-items: flex-start !important; 
                           justify-content: flex-end !important; /* Content sticks to left */
                           transition: left 0.3s ease-in-out;
                           pointer-events: auto !important;
                           overflow: hidden !important; 
                           box-shadow: 2px 0 10px rgba(0,0,0,0.5);
                           transform: unset !important; /* Override external styles */
                        }

                        .cards32b .casino-video-cards.hide-cards {
                           width: 115px !important; /* Prevent width 0 from global CSS hide-cards */
                           left: -90px !important;  /* Slide left to hide content but keep grip visible */
                        }
                        .cards32b .casino-video-cards.hide-cards .casino-video-cards-container {
                            opacity: 0 !important;
                            visibility: hidden !important;
                        }
                        


                        
                        /* Integrated Grip Style */
                        .cards32b .casino-video-cards .casino-cards-shuffle {
                            // position: relative !important;
                            background: transparent !important;
                            width: 25px !important;
                            min-height: 50px; /* Reduced min-height */
                            align-self: center; 
                            display: flex !important;
                            align-items: center;
                            justify-content: center;
                            gap: 2px;
                            cursor: pointer;
                            pointer-events: auto !important;
                            z-index: 2001 !important;
                            padding: 0 5px !important;
                        }
                        /* Vertical lines */
                        .cards32b .casino-video-cards .casino-cards-shuffle .grip-line {
                            width: 3px;
                            height: 25px;
                            background: #999;
                            border-radius: 2px;
                        }
                        
                       .cards32b .casino-video-cards .casino-video-cards-container {
                          display: flex !important;
                          flex-direction: column !important;
                          width: auto !important;
                          min-width: 15px;
                          padding: 5px 5px 0 5px !important; /* Removed bottom padding */
                          gap: 2px !important;
                       }
                       .cards32b .casino-video-cards .casino-video-cards-container .vertical-card-box {
                          gap: 0 !important;
                          margin: 0 !important;
                          padding: 0 !important;
                       }
                       .cards32b .casino-video-cards .card-item {
                          display: flex !important;
                          flex-direction: column !important;
                          gap: 0px;
                          // background: rgba(255, 255, 255, 0.05);
                          // padding: 2px 4px;
                          border-radius: 4px;
                          align-items: flex-start;
                       }
                       .cards32b .casino-video-cards .card-label-row {
                          display: flex;
                          justify-content: flex-start;
                          align-items: center;
                          gap: 2px;
                          font-size: 10px !important;
                          line-height: 1.2 !important;
                          color: #fff;
                          width: 100%;
                          white-space: nowrap;
                       }
                       .cards32b .casino-video-cards .card-label-row span {
                           display: inline-block !important;
                       }
                       .cards32b .casino-video-cards .player-score {
                           font-size: 10px !important;
                       }
    
                       .cards32b .casino-video-cards .card-item img {
                           width: 15px !important;
                           max-width: 15px !important;
                           height: auto !important;
                           align-self: flex-start;
                           display: block;
                       }
                   }
                   
                   /* Override generic or newstyle.css selectors */
                   .cards32b .vertical-card-box .card-item img {
                       width: 15px !important;
                       max-width: 15px !important;
                       height: auto !important; /* Override 48px !important */
                   }
            


            /* Betting Box Mobile Styles */
            .cards32b-mobile-container {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
            }
             /* Responsive Desktop Layout for Mobile */
            @media (max-width: 768px) {
              .teen1daycasino-container {
                  display: flex !important;
                  flex-direction: column !important;
                  width: 100% !important;
                  padding: 0 5px !important;
              }
              .teen1dayleft, .teen1dayright {
                  width: 100% !important;
                  float: none !important;
                  max-width: 100% !important;
                  padding: 0 !important;
              }
              .teen1daycenter {
                  display: none !important; 
              }
              .casino-box-row {
                  width: 100% !important; 
                  padding: 0 !important;
                  margin: 0 !important;
                  display: flex !important; /* Ensure flex behavior */
              }
              .casino-nation-name {
                  font-size: 12px !important;
                  padding: 2px 5px !important;
                  flex: 0 0 40% !important; /* Fixed 40% width */
                  max-width: 40% !important;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
              }
              .casino-bl-box {
                  flex: 1 !important; /* Flexible width */
                  max-width: none !important;
                  width: auto !important;
                  display: flex !important;
                  gap: 1px;
              }
              .casino-bl-box-item {
                 font-size: 12px !important;
                 padding: 2px !important;
                 height: 30px !important;
                 display: flex !important;
                 align-items: center !important;
                 justify-content: center !important;
                 flex: 1 !important; /* Fill container */
                 width: auto !important;
              }
              .casino-bl-box-title .casino-bl-box-item {
                 padding: 0 5px !important;
                 font-size: 10px !important;
              }
              .casino-table.cards32b {
                  overflow-x: hidden !important;
              }
              
              /* 5x2 Layout for Last Cards (Extra Results) */
              .cards32bextra .casino-bl-box {
                  display: grid !important;
                  grid-template-columns: repeat(5, 1fr) !important;
                  gap: 2px !important;
              }
              .cards32bextra .casino-bl-box .casino-bl-box-item {
                  width: 100% !important;
                  margin: 0 !important;
                  flex: none !important;
                  height: 80px !important;
                  font-size: 16px !important;
              }
              
              /* Hide Last Result Heading on Mobile */
              /* Custom Hide Rule Removed */
              /* .text-center.mt-4.pr { display: none !important; } */
            }
            :root[data-theme="light"] .cards32b-mobile-container {
                background-color: transparent !important;
            }
            `}
      </style>
      <div
        className={`casino-table cards32b cards32a result-32cards-container ${isMobileView ? "cards32b-mobile-container" : ""
          }`}
      >
        <CasinoVideo
          gameName="32 Cards B"
          roundId={gameData?.t1?.[0]?.mid}
          videoSrc="/mediaplayer/card32eu/62000ac2-19e4-4685-8403-51d029305020"
          autotime={gameData?.t1?.[0]?.autotime}
          totalTime={gameData?.t1?.[0]?.ft} isCardDrawerOpen={isDrawerOpen}
          setIsCardDrawerOpen={setIsDrawerOpen}
          cards={gameData?.t1?.[0]?.desc?.split(",") || []}
          CardsComponent={VideoCards}
          drawerHeight="auto"
        />

        {/* MOBILE BETTING VIEW OVERRIDE */}
        <div className="casino-detail">
          {/* Main Betting Area */}
          <div className="teen1daycasino-container">
            <div className="teen1dayleft">
              <div className="casino-box-row">
                <div className="casino-nation-name no-border casino-bl-box-title">
                  <div className="playerb"></div>
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

              {[8, 9, 10, 11].map((playerNum, idx) => {
                const sid = idx + 1; // Players 8-11 Main
                const market = getOddsBySid(sid);
                return (
                  <div className="casino-box-row" key={playerNum}>
                    <div className="casino-nation-name">
                      <b>Player {playerNum}</b>
                      <div className="float-right">
                        <span className="mr-2 d-none"></span>
                      </div>
                    </div>
                    <div className="casino-bl-box" style={{ position: "relative" }}>
                      {renderExposure(sid)}
                      <div
                        className={`back casino-bl-box-item ${getSuspendedClass(
                          market?.gstatus
                        )}`}
                        onClick={() =>
                          handleOddsClick(
                            `Player ${playerNum}`,
                            market?.b1,
                            sid,
                            true
                          )
                        }
                      >
                        <span className="casino-box-odd">
                          {parseFloat(market?.b1 || "0")}
                        </span>
                      </div>
                      <div
                        className={`lay casino-bl-box-item ${getSuspendedClass(
                          market?.gstatus
                        )}`}
                        onClick={() =>
                          handleOddsClick(
                            `Player ${playerNum}`,
                            market?.l1,
                            sid,
                            false
                          )
                        }
                      >
                        <span className="casino-box-odd">
                          {parseFloat(market?.l1 || "0")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="teen1daycenter"></div>
            <div className="teen1dayright">
              <div className="casino-box-row">
                <div className="casino-nation-name no-border casino-bl-box-title">
                  <div className="playerb"></div>
                </div>
                <div className="casino-bl-box casino-bl-box-title">
                  <div className="casino-bl-box-item">
                    <b>Odd</b>
                  </div>
                  <div className="casino-bl-box-item">
                    <b>Even</b>
                  </div>
                </div>
              </div>
              {[8, 9, 10, 11].map((playerNum, idx) => {
                const sid = idx * 2 + 5; // Player 8: 5/6, Player 9: 7/8, Player 10: 9/10, Player 11: 11/12
                const marketOdd = getOddsBySid(sid); // Odd
                const marketEven = getOddsBySid(sid + 1); // Even

                const oddOdds = marketOdd?.b1 || "0";
                const evenOdds = marketEven?.b1 || "0";

                return (
                  <div className="casino-box-row" key={playerNum}>
                    <div className="casino-nation-name">
                      <b>Player {playerNum}</b>
                    </div>
                    <div className="casino-bl-box">
                      <div
                        style={{ position: "relative" }}
                        className={`back casino-bl-box-item ${getSuspendedClass(
                          marketOdd?.gstatus
                        )}`}
                        onClick={() =>
                          handleOddsClick(
                            `Player ${playerNum} Odd`,
                            oddOdds,
                            sid,
                            true
                          )
                        }
                      >
                        <span className="casino-box-odd">
                          {parseFloat(oddOdds)}
                        </span>
                        {renderExposure(sid, false)}
                      </div>
                      <div
                        style={{ position: "relative" }}
                        className={`back casino-bl-box-item ${getSuspendedClass(
                          marketEven?.gstatus
                        )}`}
                        onClick={() =>
                          handleOddsClick(
                            `Player ${playerNum} Even`,
                            evenOdds,
                            sid + 1,
                            true
                          )
                        }
                      >
                        <span className="casino-box-odd">
                          {parseFloat(evenOdds)}
                        </span>
                        {renderExposure(sid + 1, false)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special Bets Area */}
          <div className="teen1daycasino-container mt-1">
            <div className="teen1dayleft">
              <div className="casino-box-row">
                <div className="casino-nation-name no-border casino-bl-box-title">
                  <div className="playerb"></div>
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
              {[
                { name: "Any 3 Card Black", sid: 13 },
                { name: "Any 3 Card Red", sid: 14 },
                { name: "Two Black Two Red", sid: 27 },
              ].map((bet) => {
                const market = getOddsBySid(bet.sid);
                return (
                  <div className="casino-box-row" key={bet.sid}>
                    <div className="casino-nation-name">
                      <b>{bet.name}</b>
                      <div className="float-right">
                        <span className="mr-2 d-none">0</span>
                      </div>
                    </div>
                    <div className="casino-bl-box" style={{ position: "relative" }}>
                      {renderExposure(bet.sid)}
                      <div
                        className={`back casino-bl-box-item ${getSuspendedClass(
                          market?.gstatus
                        )}`}
                        onClick={() =>
                          handleOddsClick(bet.name, market?.b1, bet.sid, true)
                        }
                      >
                        <span className="casino-box-odd">
                          {parseFloat(market?.b1 || "0")}
                        </span>
                      </div>
                      <div
                        className={`lay casino-bl-box-item ${getSuspendedClass(
                          market?.gstatus
                        )}`}
                        onClick={() =>
                          handleOddsClick(
                            bet.name,
                            market?.l1,
                            bet.sid,
                            false
                          )
                        }
                      >
                        <span className="casino-box-odd">
                          {parseFloat(market?.l1 || "0")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="teen1daycenter"></div>
            <div className="teen1dayright">
              <div className="casino-box-row">
                <div className="casino-nation-name no-border casino-bl-box-title">
                  <div className="playerb"></div>
                </div>
                <div className="casino-bl-box casino-bl-box-title">
                  <div className="casino-bl-box-item">
                    <b>Back</b>
                  </div>
                  <div className="casino-bl-box-item">
                    <b>Back</b>
                  </div>
                </div>
              </div>
              {[
                { name: "8 & 9 Total", sid: 25 },
                { name: "10 & 11 Total", sid: 26 },
              ].map((bet) => {
                const market = getOddsBySid(bet.sid);
                return (
                  <div className="casino-box-row" key={bet.sid}>
                    <div className="casino-nation-name">
                      <b>{bet.name}</b>
                      <div className="float-right">
                        <span className="mr-2 d-none">0</span>
                      </div>
                    </div>
                    <div className="casino-bl-box" style={{ position: "relative" }}>
                      {renderExposure(bet.sid)}
                      <div
                        className={`back casino-bl-box-item ${getSuspendedClass(
                          market?.gstatus
                        )}`}
                        onClick={() =>
                          handleOddsClick(bet.name, market?.b1, bet.sid, true)
                        }
                      >
                        <span className="casino-box-odd">
                          {parseFloat(market?.b1 || "0")}
                        </span>
                      </div>
                      <div
                        className={`back casino-bl-box-item ${getSuspendedClass(
                          market?.gstatus
                        )}`}
                        onClick={() =>
                          handleOddsClick(bet.name, market?.l1, bet.sid, true)
                        } // Back/Back for totals usually
                      >
                        <span className="casino-box-odd">
                          {parseFloat(market?.l1 || "0")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Extra Results Grid (0-9) */}
          <div className="text-center mt-4 pr">
            <b>{isMarketOpen(getOddsBySid(15)?.gstatus) ? "9.5" : "0"}</b>
          </div>
          <div className="cards32bextra mt-1">
            <div className="casino-bl-box">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num, idx) => {
                const sid = 15 + idx; // SIDs 15-24 for Single 1 to Single 0
                const market = getOddsBySid(sid);
                return (
                  <div
                    key={idx}
                    style={{ position: "relative" }}
                    className={`casino-bl-box-item back ${getSuspendedClass(
                      market?.gstatus
                    )}`}
                    onClick={() =>
                      handleOddsClick(
                        `Single ${num}`,
                        market?.b1,
                        sid,
                        true
                      )
                    }
                  >
                    <span className="casino-box-odd">{num}</span>
                    {renderExposure(sid, false)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cards32B;
