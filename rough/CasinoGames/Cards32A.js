import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { fetchCasinoExposureApi, fetchOpenBetsApi } from "../../api/api";
import Modal from "react-modal";
import CasinoVideo from "./components/CasinoVideo";
import "./Cards32.css";
import { getCardValue } from "../../utilies/helpers";

const Cards32A = ({ onBetSelection, exposureTrigger }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(
    window.innerWidth <= 768 && !window.location.search.includes("example1=on")
  );
  const [gameData, setGameData] = useState(null);
  const [exposureData, setExposureData] = useState([]);
  const [openBets, setOpenBets] = useState([]);
  const [isMyBetsModalOpen, setIsMyBetsModalOpen] = useState(false);
  const socketRef = useRef(null);

  const cardPairs = [1, 2, 3, 4, 5, 6];

  /* ================= SOCKET CONNECTION ================= */

  const fetchExposure = async () => {
    const mid = gameData?.t1?.[0]?.mid;
    if (!mid) return;

    // Use part after decimal point if it exists, otherwise use full mid
    const cleanMid = mid.toString().split(".")[1] || mid;

    try {
      const response = await fetchCasinoExposureApi({
        markettype: "32CARDS", // Assuming 32CARDS for A, check if should be 32CARDSA? Usually just "32CARDS" or look at bet API. PlaceBet used "32CARDS".
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
    const handleResize = () => {
      setIsMobileView(
        window.innerWidth <= 768 &&
        !window.location.search.includes("example1=on")
      );
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Clear bets when round changes to avoid showing old round's bets
    setOpenBets([]);

    const loadOpenBets = async () => {
      // Use gameData mid if available, fallback to 1
      const currentEventId = gameData?.t1?.[0]?.mid || "1";
      // Use part after decimal point if it exists, otherwise use full mid
      const cleanedEventId =
        currentEventId.toString().split(".")[1] || currentEventId;

      try {
        const res = await fetchOpenBetsApi({
          markettype: "32CARDS",
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

  const renderExposure = (marketId) => {
    const exposure = getExposure(marketId);
    if (exposure === 0) return null;
    return (
      <span
        style={{
          position: "absolute",
          left: "-35px",
          color: exposure >= 0 ? "#39FF39" : "#FF0000",
          fontSize: "12px",
          fontWeight: "bold",
          whiteSpace: "nowrap"
        }}
      >
        {exposure}
      </span>
    );
  };

  useEffect(() => {
    const socket = io("https://trubet9.bet:2053", {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
      socket.emit("Room", "card32");
    });

    socket.on("game", (data) => {
      console.log("Cards32A Game Data:", data);
      const payload = Array.isArray(data) ? data[0] : data;
      if (payload) setGameData(payload);
    });

    socket.on("disconnect", (reason) => {
      console.log("⚠️ Disconnected:", reason);
      if (reason === "io server disconnect") socket.connect();
    });

    return () => socket.disconnect();
  }, []);

  const getCardImage = (cardCode) => {
    if (!cardCode || cardCode === "1")
      return "/assets/cards_new/1.png";
    return `/assets/cards_new/${cardCode}.png`;
  };

  const getOddsBySid = (sid) =>
    gameData?.t2?.find((item) => String(item.sid) === String(sid));

  const isMarketOpen = (status) => {
    if (!status) return false;
    const s = status.toString().toUpperCase();
    return s === "ACTIVE" || s === "OPEN" || s === "0";
  };

  const isMarketActive = (item) => isMarketOpen(item?.gstatus);

  const getSuspendedClass = (status) =>
    !isMarketOpen(status) ? "suspended" : "";

  const getMinMax = () => ({
    min: gameData?.t1?.[0]?.min || 100,
    max: gameData?.t1?.[0]?.max || 50000,
  });

  // Handle odds box click
  const handleOddsClick = (teamName, odds, sid, isBack) => {
    const market = getOddsBySid(sid);
    if (!isMarketActive(market)) return;

    const { min, max } = getMinMax();
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

  const getTimerColorClass = () => {
    const timerValue = parseInt(gameData?.t1?.[0]?.autotime) || 0;
    if (timerValue <= 5) return "red";
    if (timerValue <= 10) return "orange";
    return "green";
  };

  const t1 = gameData?.t1?.[0];
  const allCards = [t1?.C1, t1?.C2, t1?.C3, t1?.C4];

  const VideoCards = () => {
    return (
      <div className="casino-video-cards-container">
        <div
          className="vertical-card-box"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {(() => {
            // Scores from C1-C4
            const scores = allCards;
            // console.log('4444 scores', scores);
            const numericScores = scores.map((s) => parseInt(s) || 0);
            const maxScore = Math.max(...numericScores);
            // Card images from desc (comma-separated card codes)
            const descCards = t1?.desc?.split(",") || [];

            return [8, 9, 10, 11].map((playerNum, idx) => {
              const score = scores[idx];
              const numericScore = numericScores[idx];

              // Collect ALL cards for this player (every 4th card starting from idx)
              // const playerCards = [];
              // for (let i = idx; i < descCards.length; i += 4) {
              //   const card = descCards[i];
              //   if (card && card !== "1") {
              //     playerCards.push(card);
              //   }
              // }

              // Only render if score is valid AND player has at least one card
              if (
                !score || score == "1"
                //  || playerCards.length === 0
              ) {
                // console.log('4444 idx score', idx, score)
                return null;
              }

              const isWinner = numericScore === maxScore && maxScore > 0;
              const labelColor = isWinner ? "#22c55e" : "#fff";
              const sum = getCardValue(score) + playerNum;

              return (
                <div key={playerNum} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  <div
                    className="dealer-name w-100"
                    style={{
                      color: labelColor,
                      display: "flex",
                      alignItems: "center",
                      // justifyContent: "space-between",
                      paddingLeft: "2px",
                      paddingRight: "2px",
                    }}
                  >
                    <span>Player {playerNum}:</span>
                    <span style={{ color: "#ffc107" }}>{sum}</span>
                  </div>
                  <div className="w-100" style={{ display: "flex", flexWrap: "wrap", gap: "2px" }}>
                    {/* {playerCards.map((card, cardIdx) => ( */}
                    <span>
                      <img
                        src={getCardImage(score)}
                        alt="card"
                        style={isMobileView ? { width: "15px" } : {}}
                      />
                    </span>
                    {/* ))} */}
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
      <style>
        {`
          .cards32a-mobile-container {
            padding: 0 !important;
            margin: 0 !important;
            color: #ccc;
            font-family: sans-serif;
            width: 100% !important;
            max-width: 100% !important;
          }
          /* Force parent overrides */
          .casino-table.cards32a, 
          .casino-detail {
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
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
          
          /* Responsive Desktop Layout for Mobile */
          @media (max-width: 768px) {
              .teen1daycasino-container {
                  display: flex !important;
                  flex-direction: column !important;
                  width: 100% !important;
              }
              .teen1dayleft, .teen1dayright {
                  width: 100% !important;
                  float: none !important;
                  max-width: 100% !important;
              }
              .teen1daycenter {
                  display: none !important; /* Hide spacer on mobile */
              }
              .casino-box-row {
                  width: 100% !important; 
                  padding: 2px 0 !important;
              }
              .casino-nation-name {
                  font-size: 12px !important;
              }
              .casino-bl-box-item {
                 font-size: 12px !important;
                 padding: 5px !important;
              }
              /* Ensure the global container fits */
              .casino-table.cards32a {
                  overflow-x: hidden !important;
              }
          }

          .mobile-section {
            background: #fff;
            padding: 5px;
            border-radius: 4px;
          }
                       .casino-video-cards {
                        /* Transition handled by specific views */
                      }
                   /* Mobile-specific overrides for card drawer */
                   @media (max-width: 768px) {
                        .cards32a .casino-video-cards {
                           height: auto !important; /* Auto height */
                           width: 115px !important;
                           left: 0 !important; 
                           position: absolute !important;
                           z-index: 2000 !important; 
                           padding: 0 !important; /* Override 5px 10px... */ 
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
                        
                        .cards32a .casino-video-cards.hide-cards {
                            width: 115px !important; /* Prevent width 0 from global CSS hide-cards */
                            left: -90px !important;  /* Slide left to hide content but keep grip visible */
                        }
                        .cards32a .casino-video-cards.hide-cards .casino-video-cards-container {
                            opacity: 0 !important;
                            visibility: hidden !important;
                        }
                        

                            .casino-video-cards {
        top: 50px;
        transform: unset;
        width: 95px;
        padding: 5px 10px 5px 5px;
        height: 75px;
                        }
                        
                        /* Integrated Grip Style */
                        .cards32a .casino-video-cards .casino-cards-shuffle {
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
                        .cards32a .casino-video-cards .casino-cards-shuffle .grip-line {
                            width: 3px;
                            height: 25px;
                            background: #999;
                            border-radius: 2px;
                        }
                        
                       .cards32a .casino-video-cards .casino-video-cards-container {
                          display: flex !important;
                          flex-direction: column !important;
                          width: auto !important;
                          min-width: 15px;
                          padding: 5px 5px 0 5px !important; /* Removed bottom padding */
                          gap: 2px !important;
                       }
                       .cards32a .casino-video-cards .casino-video-cards-container .vertical-card-box {
                          gap: 2px !important;
                          margin: 0 !important;
                          padding: 0 !important;
                       }
                       .cards32a .casino-video-cards .card-item {
                          display: flex !important;
                          flex-direction: column !important;
                          gap: 1px;
                          padding: 2px 4px;
                          border-radius: 4px;
                          align-items: flex-start;
                       }
                       .cards32a .casino-video-cards .card-label-row {
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
                       .cards32a .casino-video-cards .card-label-row span {
                           display: inline-block !important;
                       }
                       .cards32a .casino-video-cards .player-score {
                           font-size: 10px !important;
                       }
    
                       .cards32a .casino-video-cards .card-item img {
                           width: 15px !important;
                           max-width: 15px !important;
                           height: auto !important;
                           align-self: flex-start;
                           display: block;
                       }
                   }
                   
                   /* Override generic or newstyle.css selectors */
                   .cards32a .vertical-card-box .card-item img {
                       width: 15px !important;
                       max-width: 15px !important;
                       height: auto !important;
                   }
                   
                   /* Increase Video Box Height in Mobile */
                   .video-box-container .video-box {
                       height: 250px !important; /* Increased height */
                       background-color: black !important; /* Ensure black bg */
                   }
                   
                   /* Ensure relative positioning context for absolute children and black bg */
                   .casino-video {
                       position: relative !important;
                       background-color: black !important;
                       overflow: visible !important; /* Allow drawer to slide out */
                   }
                   
                   .video-box-container {
                       background-color: black !important;
                   }

                   /* Reduce Header Font Sizes for Mobile & Remove Background/Spacing */
                   .casino-video-title {
                       background: transparent !important;
                       padding-left: 0 !important;
                       margin-left: 0 !important;
                       left: 0 !important;
                       z-index: 1005;
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
                       z-index: 1005;
                   }
                   .casino-video-right-icons > div {
                       margin: 0 !important;
                       width: 30px !important; /* Reduced width */
                       height: 30px !important; /* Reduced height */
                       line-height: 20px !important;
                   }
                   .casino-video-right-icons i {
                       font-size: 16px !important; /* Reduced icon size */
                   }

        `}
      </style>
      <div className="casino-table cards32a">
        {/* Video Section */}
        <CasinoVideo
          gameName="32 CARDS A"
          roundId={gameData?.t1?.[0]?.mid}
          videoSrc="/newmediaplayer/teen62/667946cf-39ee-4f49-901e-13d5438e91ad"
          autotime={gameData?.t1?.[0]?.autotime}
          totalTime={gameData?.t1?.[0]?.ft} isCardDrawerOpen={isDrawerOpen}
          setIsCardDrawerOpen={setIsDrawerOpen}
          cards={allCards} // Passing split array for correct auto-close logic
          CardsComponent={VideoCards}
        />

        {/* Betting Section */}
        <div className="casino-detail">
          <div className="teen1daycasino-container">
            {/* Player A Column */}
            <div className="teen1dayleft">
              <div className="casino-box-row"></div>

              <div className="casino-box-row">
                <div className="casino-nation-name">
                  <b>Player 8</b>
                </div>
                <div className="casino-bl-box" style={{ position: "relative" }}>
                  {renderExposure(1)}
                  <div
                    className={`back casino-bl-box-item ${getSuspendedClass(
                      getOddsBySid(1)?.gstatus
                    )}`}
                    onClick={() =>
                      handleOddsClick("Player 8", getOddsBySid(1)?.b1, 1, true)
                    }
                    style={{
                      cursor: isMarketActive(getOddsBySid(1))
                        ? "pointer"
                        : "default",
                    }}
                  >
                    <span className="casino-box-odd">
                      {isMarketActive(getOddsBySid(1)) ? (
                        parseFloat(getOddsBySid(1)?.b1 || "0")
                      ) : (
                        <i className="fas fa-lock"></i>
                      )}
                    </span>
                  </div>
                  <div
                    className={`lay casino-bl-box-item ${getSuspendedClass(
                      getOddsBySid(1)?.gstatus
                    )}`}
                    onClick={() =>
                      handleOddsClick("Player 8", getOddsBySid(1)?.l1, 1, false)
                    }
                    style={{
                      cursor: isMarketActive(getOddsBySid(1))
                        ? "pointer"
                        : "default",
                    }}
                  >
                    <span className="casino-box-odd">
                      {isMarketActive(getOddsBySid(1)) ? (
                        parseFloat(getOddsBySid(1)?.l1 || "0")
                      ) : (
                        <i className="fas fa-lock"></i>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="casino-box-row">
                <div className="casino-nation-name">
                  <b>Player 9</b>
                </div>
                <div className="casino-bl-box" style={{ position: "relative" }}>
                  {renderExposure(2)}
                  <div
                    className={`back casino-bl-box-item ${getSuspendedClass(
                      getOddsBySid(2)?.gstatus
                    )}`}
                    onClick={() =>
                      handleOddsClick("Player 9", getOddsBySid(2)?.b1, 2, true)
                    }
                    style={{
                      cursor: isMarketActive(getOddsBySid(2))
                        ? "pointer"
                        : "default",
                    }}
                  >
                    <span className="casino-box-odd">
                      {isMarketActive(getOddsBySid(2)) ? (
                        parseFloat(getOddsBySid(2)?.b1 || "0")
                      ) : (
                        <i className="fas fa-lock"></i>
                      )}
                    </span>
                  </div>
                  <div
                    className={`lay casino-bl-box-item ${getSuspendedClass(
                      getOddsBySid(2)?.gstatus
                    )}`}
                    onClick={() =>
                      handleOddsClick("Player 9", getOddsBySid(2)?.l1, 2, false)
                    }
                    style={{
                      cursor: isMarketActive(getOddsBySid(2))
                        ? "pointer"
                        : "default",
                    }}
                  >
                    <span className="casino-box-odd">
                      {isMarketActive(getOddsBySid(2)) ? (
                        parseFloat(getOddsBySid(2)?.l1 || "0")
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
                <div className="casino-bl-box casino-bl-box-title"></div>
              </div>

              <div className="casino-box-row">
                <div className="casino-nation-name">
                  <b>Player 10</b>
                </div>
                <div className="casino-bl-box" style={{ position: "relative" }}>
                  {renderExposure(3)}
                  <div
                    className={`back casino-bl-box-item ${getSuspendedClass(
                      getOddsBySid(3)?.gstatus
                    )}`}
                    onClick={() =>
                      handleOddsClick("Player 10", getOddsBySid(3)?.b1, 3, true)
                    }
                    style={{
                      cursor: isMarketActive(getOddsBySid(3))
                        ? "pointer"
                        : "default",
                    }}
                  >
                    <span className="casino-box-odd">
                      {isMarketActive(getOddsBySid(3)) ? (
                        parseFloat(getOddsBySid(3)?.b1 || "0")
                      ) : (
                        <i className="fas fa-lock"></i>
                      )}
                    </span>
                  </div>
                  <div
                    className={`lay casino-bl-box-item ${getSuspendedClass(
                      getOddsBySid(3)?.gstatus
                    )}`}
                    onClick={() =>
                      handleOddsClick(
                        "Player 10",
                        getOddsBySid(3)?.l1,
                        3,
                        false
                      )
                    }
                    style={{
                      cursor: isMarketActive(getOddsBySid(3))
                        ? "pointer"
                        : "default",
                    }}
                  >
                    <span className="casino-box-odd">
                      {isMarketActive(getOddsBySid(3)) ? (
                        parseFloat(getOddsBySid(3)?.l1 || "0")
                      ) : (
                        <i className="fas fa-lock"></i>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="casino-box-row">
                <div className="casino-nation-name">
                  <b>Player 11</b>
                </div>
                <div className="casino-bl-box" style={{ position: "relative" }}>
                  {renderExposure(4)}
                  <div
                    className={`back casino-bl-box-item ${getSuspendedClass(
                      getOddsBySid(4)?.gstatus
                    )}`}
                    onClick={() =>
                      handleOddsClick("Player 11", getOddsBySid(4)?.b1, 4, true)
                    }
                    style={{
                      cursor: isMarketActive(getOddsBySid(4))
                        ? "pointer"
                        : "default",
                    }}
                  >
                    <span className="casino-box-odd">
                      {isMarketActive(getOddsBySid(4)) ? (
                        parseFloat(getOddsBySid(4)?.b1 || "0")
                      ) : (
                        <i className="fas fa-lock"></i>
                      )}
                    </span>
                  </div>
                  <div
                    className={`lay casino-bl-box-item ${getSuspendedClass(
                      getOddsBySid(4)?.gstatus
                    )}`}
                    onClick={() =>
                      handleOddsClick(
                        "Player 11",
                        getOddsBySid(4)?.l1,
                        4,
                        false
                      )
                    }
                    style={{
                      cursor: isMarketActive(getOddsBySid(4))
                        ? "pointer"
                        : "default",
                    }}
                  >
                    <span className="casino-box-odd">
                      {isMarketActive(getOddsBySid(4)) ? (
                        parseFloat(getOddsBySid(4)?.l1 || "0")
                      ) : (
                        <i className="fas fa-lock"></i>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
  );
};

export default Cards32A;
