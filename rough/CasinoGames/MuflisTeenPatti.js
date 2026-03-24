import React, { useState, useEffect, useRef } from "react";
import { fetchCasinoExposureApi } from "../../api/api";
import { io } from "socket.io-client";
import useIsMobile from "../../hooks/useIsMobile";
import CasinoVideo from "./components/CasinoVideo";
import lockSvg from "../../assets/images/lock.svg";

const MuflisTeenPatti = ({ onBetSelection, lastBetTime, exposureTrigger }) => {
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [gameData, setGameData] = useState(null);
  const [exposureData, setExposureData] = useState([]);
  const socketRef = useRef(null);

  const cardPairs = [1, 2, 3, 4, 5, 6];

  useEffect(() => {
    const fetchExposure = async () => {
      if (!gameData?.t1?.[0]?.mid) return;
      try {
        const response = await fetchCasinoExposureApi({
          markettype: "TEENMUF",
          main_event_id: gameData.t1[0].mid,
          curPageName: "live_teenmuf.php",
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
      <div
        style={{
          fontSize: "12px",
          fontWeight: "bold",
          // marginTop: "2px",
          color: exposure >= 0 ? "#39FF39" : "#F7505E",
        }}
      >
        {exposure}
      </div>
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
      console.log("📤 Emitting Room: teenmuf");
      socket.emit("Room", "teenmuf");
    };

    socket.on("connect", () => {
      console.log("✅ Connected to game socket (teenmuf):", socket.id);
      joinRoom();
    });

    socket.on("reconnect", (attempt) => {
      console.log(
        `🔄 Reconnected to game socket (teenmuf) after ${attempt} attempts`
      );
      joinRoom();
    });

    socket.on("reconnect_attempt", (attempt) => {
      console.log(`🔄 Attempting to reconnect... (Attempt ${attempt})`);
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
    return status === "SUSPENDED" || status === "suspended" ? "muflis-suspended" : "";
  };

  const getMinMax = (sid) => {
    const market = gameData?.t2?.find((m) => m.sid == sid);
    return {
      min: market?.min || 100,
      max: market?.max || 25000,
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

  const getOddsBySid = (sid) => {
    return gameData?.t2?.find((item) => item.sid == sid);
  };

  const getTimerColorClass = () => {
    const timerValue = parseInt(gameData?.t1?.[0]?.autotime) || 0;
    if (timerValue <= 5) return "red";
    if (timerValue <= 10) return "orange";
    return "green";
  };

  const VideoCards = () => {
    return (
      <div className="casino-video-cards-container">
        <div>
          <span>
            <img src={getCardImage(gameData?.t1?.[0]?.C1)} alt="card" />
          </span>
          <span>
            <img src={getCardImage(gameData?.t1?.[0]?.C3)} alt="card" />
          </span>
          <span>
            <img src={getCardImage(gameData?.t1?.[0]?.C5)} alt="card" />
          </span>
        </div>
        <div>
          <span>
            <img src={getCardImage(gameData?.t1?.[0]?.C2)} alt="card" />
          </span>
          <span>
            <img src={getCardImage(gameData?.t1?.[0]?.C4)} alt="card" />
          </span>
          <span>
            <img src={getCardImage(gameData?.t1?.[0]?.C6)} alt="card" />
          </span>
        </div>
      </div>
    );
  };

  const renderMobileBetBox = (label, marketId, type, displayValue = null) => {
    const market = getOddsBySid(marketId);
    const isSuspended =
      market?.gstatus === "SUSPENDED" || market?.gstatus === "suspended";
    const odds = market?.b1 || "0.00";
    const isLocked = !market?.b1 || market?.b1 === "0" || market?.b1 === "0.00";

    return (
      <div className="mobile-bet-row">
        <div className="mobile-bet-label">{label}</div>
        <div
          className={`mobile-bet-button ${isSuspended || isLocked ? "muflis-suspended" : ""
            }`}
          onClick={() =>
            !isLocked &&
            !isSuspended &&
            handleOddsClick(type, odds, marketId, true)
          }
          style={{ flexDirection: "column" }}
        >
          {isLocked || isSuspended ? (
            <img src={lockSvg} className="muflis-lock-icon" alt="lock" />
          ) : (
            <div>{displayValue || odds}</div>
          )}
          {renderExposure(marketId)}
        </div>
      </div>
    );
  };

  const cards = [gameData?.t1?.[0]?.C1, gameData?.t1?.[0]?.C2, gameData?.t1?.[0]?.C3, gameData?.t1?.[0]?.C4, gameData?.t1?.[0]?.C5, gameData?.t1?.[0]?.C6]

  return (
    <>
      <style>{`
        .muflis-redesign-container {
          background-color: #2c323a;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 10px;
          font-family: Arial, sans-serif;
        }
        .muflis-markets-grid {
          display: flex;
          background-color: #2c323a;
          padding: 8px 0;
        }
        .player-markets-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 5px 10px;
        }
        .player-title-row {
          margin-bottom: 8px;
        }
        .player-title-label {
          font-size: 14px;
          font-weight: 500;
        }
        .player-a-label {
          color: #ff4d4d;
        }
        .player-b-label {
          color: #fdcf13;
        }
        .markets-row {
          display: flex;
          gap: 10px;
        }
        .market-column-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .market-title-label {
          color: #e0e0e0;
          font-size: 11px;
          font-weight: bold;
          margin-bottom: 5px;
          text-align: center;
          height: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .market-bet-box {
          width: 100%;
          height: 48px;
          border: 1px solid #4a9df3;
          border-radius: 2px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          background-color: rgba(74, 157, 243, 0.05);
          transition: all 0.2s;
        }
        .market-bet-box:hover {
          background-color: rgba(74, 157, 243, 0.15);
        }
        .market-bet-box.muflis-suspended {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .muflis-odd-value {
          color: #fff;
          font-weight: bold;
          font-size: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        :root[data-theme="light"] .muflis-lock-icon {
          filter: brightness(0) invert(0);
        }
        .muflis-lock-icon {
          height: 14px;
          margin-bottom: 2px;
          filter: brightness(0) invert(1);
        }
        .muflis-header-divider {
          width: 1px;
          background-color: #555;
          margin: 10px 0;
        }
        .muflis-exposure-label {
          display: block;
          font-size: 10px;
          margin-left: 3px;
          font-weight: bold;
        }
        
        /* Card Drawer Styling - matching TeenPatti41 */
        .muflis-tp .casino-video-cards {
          position: absolute;
          left: 0;
          top: 55%;
          transform: translateY(-50%);
          width: 100px;
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
        
        @media (max-width: 768px) {
          .muflis-markets-grid {
             display: none; /* Hide desktop layout on mobile */
          }
          .muflis-header-divider {
             display: none;
          }
        }
      `}</style>

      <div className="casino-table muflis-tp kk">
        {/* Video Section */}
        <CasinoVideo
          gameName="Muflis Teenpatti"
          roundId={gameData?.t1?.[0]?.mid}
          videoSrc="/newmediaplayer/teen62/667946cf-39ee-4f49-901e-13d5438e91ad"
          autotime={gameData?.t1?.[0]?.autotime}
          totalTime={gameData?.t1?.[0]?.ft} isCardDrawerOpen={isDrawerOpen}
          setIsCardDrawerOpen={setIsDrawerOpen}
          cards={cards}
          CardsComponent={VideoCards}
        />

        <div className="muflis-redesign-container">
          <div className="muflis-markets-grid">
            {/* Player A Section */}
            <div className="player-markets-section">
              <div className="player-title-row">
                <span className="player-title-label player-a-label">
                  Player A
                </span>
              </div>

              <div className="markets-row">
                {/* Winner A */}
                <div className="market-column-item">
                  <div className="market-title-label">Winner</div>
                  <div
                    className={`market-bet-box ${getSuspendedClass(
                      getOddsBySid(1)?.gstatus
                    )}`}
                    onClick={() =>
                      getOddsBySid(1)?.b1 &&
                      handleOddsClick("Player A", getOddsBySid(1)?.b1, 1, true)
                    }
                  >
                    <span className="muflis-odd-value">
                      {getOddsBySid(1)?.b1 ? (
                        <div>{getOddsBySid(1)?.b1}</div>
                      ) : (
                        <img src={lockSvg} className="muflis-lock-icon" alt="lock" />
                      )}
                      {renderExposure(1)}
                    </span>
                  </div>
                </div>

                {/* Top 9 A */}
                <div className="market-column-item">
                  <div className="market-title-label">Top 9</div>
                  <div
                    className={`market-bet-box ${getSuspendedClass(
                      getOddsBySid(3)?.gstatus
                    )}`}
                    onClick={() =>
                      getOddsBySid(3)?.b1 &&
                      handleOddsClick("Top 9 A", getOddsBySid(3)?.b1, 3, true)
                    }
                  >
                    <span className="muflis-odd-value">
                      {getOddsBySid(3)?.b1 ? (
                        <div>A</div>
                      ) : (
                        <img src={lockSvg} className="muflis-lock-icon" alt="lock" />
                      )}
                      {renderExposure(3)}
                    </span>
                  </div>
                </div>

                {/* M Baccarat A */}
                <div className="market-column-item">
                  <div className="market-title-label">M Baccarat A</div>
                  <div
                    className={`market-bet-box ${getSuspendedClass(
                      getOddsBySid(5)?.gstatus
                    )}`}
                    onClick={() =>
                      getOddsBySid(5)?.b1 &&
                      handleOddsClick(
                        "M Baccarat A",
                        getOddsBySid(5)?.b1,
                        5,
                        true
                      )
                    }
                  >
                    <span className="muflis-odd-value">
                      {getOddsBySid(5)?.b1 ? (
                        <div>{getOddsBySid(5)?.b1}</div>
                      ) : (
                        <img src={lockSvg} className="muflis-lock-icon" alt="lock" />
                      )}
                      {renderExposure(5)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="muflis-header-divider"></div>

            {/* Player B Section */}
            <div className="player-markets-section">
              <div className="player-title-row">
                <span className="player-title-label player-b-label">
                  Player B
                </span>
              </div>

              <div className="markets-row">
                {/* Winner B */}
                <div className="market-column-item">
                  <div className="market-title-label">Winner</div>
                  <div
                    className={`market-bet-box ${getSuspendedClass(
                      getOddsBySid(2)?.gstatus
                    )}`}
                    onClick={() =>
                      getOddsBySid(2)?.b1 &&
                      handleOddsClick("Player B", getOddsBySid(2)?.b1, 2, true)
                    }
                  >
                    <span className="muflis-odd-value">
                      {getOddsBySid(2)?.b1 ? (
                        <div>{getOddsBySid(2)?.b1}</div>
                      ) : (
                        <img src={lockSvg} className="muflis-lock-icon" alt="lock" />
                      )}
                      {renderExposure(2)}
                    </span>
                  </div>
                </div>

                {/* Top 9 B */}
                <div className="market-column-item">
                  <div className="market-title-label">Top 9</div>
                  <div
                    className={`market-bet-box ${getSuspendedClass(
                      getOddsBySid(4)?.gstatus
                    )}`}
                    onClick={() =>
                      getOddsBySid(4)?.b1 &&
                      handleOddsClick("Top 9 B", getOddsBySid(4)?.b1, 4, true)
                    }
                  >
                    <span className="muflis-odd-value">
                      {getOddsBySid(4)?.b1 ? (
                        <div>B</div>
                      ) : (
                        <img src={lockSvg} className="muflis-lock-icon" alt="lock" />
                      )}
                      {renderExposure(4)}
                    </span>
                  </div>
                </div>

                {/* M Baccarat B */}
                <div className="market-column-item">
                  <div className="market-title-label">M Baccarat B</div>
                  <div
                    className={`market-bet-box ${getSuspendedClass(
                      getOddsBySid(6)?.gstatus
                    )}`}
                    onClick={() =>
                      getOddsBySid(6)?.b1 &&
                      handleOddsClick(
                        "M Baccarat B",
                        getOddsBySid(6)?.b1,
                        6,
                        true
                      )
                    }
                  >
                    <span className="muflis-odd-value">
                      {getOddsBySid(6)?.b1 ? (
                        <div>{getOddsBySid(6)?.b1}</div>
                      ) : (
                        <img src={lockSvg} className="muflis-lock-icon" alt="lock" />
                      )}
                      {renderExposure(6)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isMobile && (
        <div className="mobile-casino-war-layout">
          <style jsx>{`
            .mobile-casino-war-layout {
              // background: #2d373c;
              padding: 10px;
              font-family: "Roboto", sans-serif;
            }
            .mobile-betting-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px; /* Increased gap for better separation */
              position: relative;
            }
            .mobile-betting-grid::after {
              content: "";
              position: absolute;
              top: 0;
              bottom: 0;
              left: 50%;
              width: 2px;
              background: grey;
              transform: translateX(-50%);
            }
            .mobile-grid-col {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            .mobile-header-label {
              font-size: 12px;
              // font-weight: bold;
              margin-bottom: 5px;
              // text-transform: uppercase;
            }
            :root[data-theme="light"] .player-a-header {
              color: #fc4242;
            }
            :root[data-theme="light"] .player-b-header {
              color: #aa880d;
            }
            .player-a-header {
              color: #ff4d4d;
            }
            .player-b-header {
              color: #fdcf13;
            }

            :root[data-theme="light"] .mobile-bet-row {
              background-color: #ddd;
            }
            .mobile-bet-row {
              display: flex;
              flex-direction: column; /* Stack label and button */
              width: 100%;
              background-color: transparent;
            }
            :root[data-theme="light"] .mobile-bet-label {
              color: #333;
            }
            .mobile-bet-label {
              text-align: center;
              font-size: 12px;
              color: #DDDDDD;
              font-weight: bold;
              margin-bottom: 4px;
              background: transparent;
              padding: 0;
            }
            .mobile-bet-button {
              width: 100%;
              height: 40px;
              background-color: #3d4e5a;
              border: 2px solid #72bbef;
              // border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #D7D7D7;
              font-weight: bold;
              font-size: 13px;
              cursor: pointer;
            }
            .mobile-bet-button.muflis-suspended {
              background: rgba(0, 0, 0, 0.2);
              opacity: 0.7;
            }
          `}</style>

          <div className="mobile-betting-grid">
            {/* Player A Column */}
            <div className="mobile-grid-col">
              <div className="mobile-header-label player-a-header">
                Player A
              </div>
              {renderMobileBetBox("Winner", 1, "Player A")}
              {renderMobileBetBox("Top 9", 3, "Top 9 A", "A")}
              {renderMobileBetBox("M Baccarat A", 5, "M Baccarat A")}
            </div>

            {/* Player B Column */}
            <div className="mobile-grid-col">
              <div className="mobile-header-label player-b-header">
                Player B
              </div>
              {renderMobileBetBox("Winner", 2, "Player B")}
              {renderMobileBetBox("Top 9", 4, "Top 9 B", "B")}
              {renderMobileBetBox("M Baccarat B", 6, "M Baccarat B")}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MuflisTeenPatti;
