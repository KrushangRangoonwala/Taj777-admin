import React, { useState, useEffect, useRef } from "react";
import { fetchCasinoExposureApi } from "../../api/api";
import { io } from "socket.io-client";
import useIsMobile from "../../hooks/useIsMobile";
import CasinoVideo from "./components/CasinoVideo";
import lockSvg from "../../assets/images/lock.svg";
import { useSelector } from "react-redux";

const TeenPatti2Cards = ({ onBetSelection, lastBetTime, exposureTrigger }) => {
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [gameData, setGameData] = useState(null);
  const [exposureData, setExposureData] = useState([]);
  const socketRef = useRef(null);
  const isLight = useSelector(state => state.action.theme) === "light";
  useEffect(() => {
    const fetchExposure = async () => {
      if (!gameData?.t1?.[0]?.mid) return;
      try {
        const response = await fetchCasinoExposureApi({
          markettype: "PATTI2",
          main_event_id: gameData.t1[0].mid,
          curPageName: "teenpatti2cards.php",
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

  const renderExposure = (marketId, css = {}) => {
    const exposure = getExposure(marketId);
    if (exposure === 0) return null;
    return (
      <div
        className={exposure >= 0 ? 'book-green' : 'book-red'}
        style={{ ...css, }}
      >
        {exposure}
      </div >
    );
  };

  useEffect(() => {
    // Establish socket connection
    const socket = io("https://trubet9.bet:2053", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    const joinRoom = () => {
      socket.emit("Room", "patti2");
    };

    socket.on("connect", () => {
      joinRoom();
    });

    socket.on("reconnect", (attempt) => {
      joinRoom();
    });

    socket.on("game", (data) => {
      const targetData = Array.isArray(data) ? data[0] : data;
      if (targetData) {
        setGameData(targetData);
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
    return status === "SUSPENDED" || status === "suspended" ? "patti2-suspended" : "";
  };

  const getMinMax = (sid) => {
    const market = gameData?.t2?.find((m) => m.sid == sid);
    return {
      min: market?.min || 100,
      max: market?.max || 25000,
    };
  };

  const handleOddsClick = (teamName, odds, sid, isBack, runs, displayOdds) => {
    const { min, max } = getMinMax(sid);
    if (onBetSelection) {
      onBetSelection({
        teamName,
        odds,
        runs,
        shown_odds: displayOdds,
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
      <>
        <div className="casino-video-cards-container">
          <div>
            <span>
              <img src={getCardImage(gameData?.t1?.[0]?.C1)} alt="card" />
            </span>
            <span>
              <img src={getCardImage(gameData?.t1?.[0]?.C3)} alt="card" />
            </span>
          </div>
          <div>
            <span>
              <img src={getCardImage(gameData?.t1?.[0]?.C2)} alt="card" />
            </span>
            <span>
              <img src={getCardImage(gameData?.t1?.[0]?.C4)} alt="card" />
            </span>
          </div>
        </div>
      </>
    );
  };

  const renderMobileBetButton = (
    marketId,
    type // "back" or "lay"
  ) => {
    const market = getOddsBySid(marketId);
    const isBack = type === "back";
    const odds = isBack ? market?.b1 : market?.l1;
    const volume = isBack ? market?.bs1 : market?.ls1;
    const isLocked = !odds || odds === "0" || odds === "0.00";
    const isSuspended =
      market?.gstatus === "SUSPENDED" || market?.gstatus === "suspended";
    const showVolume = marketId === 3 || marketId === 4;

    return (
      <div
        className={`mobile-bet-btn ${isBack ? "btn-back" : "btn-lay"} ${isLocked || isSuspended ? "suspended" : ""
          }`}
        onClick={() => {
          if (!isLocked && !isSuspended) {
            handleOddsClick(
              type === "back" ? "Back" : "Lay", // This name might need to be specific like "Player A"
              odds,
              marketId,
              isBack
            );
          }
        }}
        style={{ flexDirection: "column", lineHeight: "1.2" }}
      >
        {isLocked || isSuspended ? (
          <img src={lockSvg} className="muflis-lock-icon" alt="lock" />
        ) : (
          <>
            <span
              className="odds-val"
              style={{
                fontWeight: showVolume ? "normal" : "bold",
                fontSize: showVolume ? "10px" : "inherit",
              }}
            >
              {odds}
            </span>
            {showVolume && (
              <span
                className="odds-vol"
                style={{ fontSize: "14px", fontWeight: "bold" }}
              >
                {volume || 0}
              </span>
            )}
          </>
        )}
      </div>
    );
  };

  // Wrapper to pass specific team name
  const renderBtn = (label, marketId, type, isBack) => {
    const market = getOddsBySid(marketId);
    const odds = isBack ? market?.b1 : market?.l1;
    const volume = isBack ? market?.bs1 : market?.ls1;
    const isSuspended =
      market?.gstatus === "SUSPENDED" || market?.gstatus === "suspended";
    const showVolume = marketId === 3 || marketId === 4;
    const isClickable = odds && odds !== "0" && odds !== "0.00" && !isSuspended;

    return (
      <div
        className={`mobile-bet-btn ${isBack ? "btn-back" : "btn-lay"} ${!isClickable ? "suspended" : ""
          }`}
        onClick={() =>
          isClickable &&
          handleOddsClick(label, showVolume ? volume : odds, marketId, isBack, showVolume ? odds : null, showVolume ? odds : null)
        }
        style={{ flexDirection: "column", lineHeight: "1.2", position: "relative", background: isSuspended ? "transparent" : "" }}
      >
        <div style={{
          opacity: isSuspended ? 0.35 : 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%"
        }}>
          <span
            className="odds-val"
            style={{
              fontWeight: showVolume ? "normal" : "bold",
              fontSize: showVolume ? "13px" : "inherit",
              color: isLight ? "#333" : "#D7D7D7",
            }}
          >
            {odds || "0"}
          </span>
          {showVolume && (
            <span
              className="odds-vol"
              style={{ fontSize: "18px", fontWeight: "bold", color: isLight ? "#333" : "#D7D7D7" }}
            >
              {volume || 0}
            </span>
          )}
        </div>
        {isSuspended && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1 }}>
            <img src={lockSvg} className="muflis-lock-icon" alt="lock" style={{ marginBottom: 0 }} />
          </div>
        )}
      </div>
    );
  };


  const currentGame = gameData?.t1?.[0];

  return (
    <>
      <style>{`
        .mobile-2cards-container {
          padding: 8px 4px 8px 0; /* Left 0, Right 8px */
          // background-color: #2e3439; 
          font-family: 'Roboto', sans-serif;
        }
        .mobile-bet-row {
          display: flex;
          margin-bottom: 4px;
          min-height: 55px;
          /* align-items: stretch; Default, ensures betting boxes stretch */
        }
        :root[data-theme="light"] .mobile-label-col {
          background-color: #ddd;
          color: #333;
          border:1px solid #ddd;
          font-weight: bold;
        }
        .mobile-label-col {
          width: 45%;
          height: 35px;
          background-color: #444444;
          color: #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: space-between; /* Left align text */
          padding: 0 10px; /* Added padding for spacing */
          font-weight: 500;
          font-size: 13px;
          border-radius: 0;
          border: 1px solid #454d55;
          border-right: none;
          align-self: center; /* Vertically center this element within the stretched row */
        }
        .mobile-odds-col {
          width: 60%;
          flex: 1; 
          display: flex;
          gap: 4px; /* Added gap between boxes */
          padding-left: 0;
        }
        .mobile-bet-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          cursor: pointer;
          background-color: #2c3e50;
          color: white;
          font-size: 15px;
          border-width: 2px;
          border-style: solid;
        }
        .btn-back {
          border-color: #72bbef !important;
          background-color: rgba(114, 187, 239, 0.3);
        }
        .btn-lay {
          border-color: #f994ba !important;
          background-color: rgba(249, 148, 186, 0.3);
        }
        .btn-full {
          width: 100%;
        }
        .patti2-suspended {
          cursor: not-allowed;
          background: transparent !important;
        }
        :root[data-theme="light"] .muflis-lock-icon {
          filter: brightness(0) invert(0) contrast(100);
        }
        .muflis-lock-icon {
          height: 18px;
          filter: brightness(0) invert(1) contrast(100);
          display: block;
          margin-left: auto;
          margin-right: auto;
          margin-bottom: 2px;
        }
        :root[data-theme="light"] .color-plus-row {
          color: #333;
        }
        .color-plus-row {
          width: 100%;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #72bbef;
          background-color: rgba(114, 187, 239, 0.3);
          color: #D7D7D7;
          font-size: 13px;
          font-weight: bold;
          margin-top: 8px;
        }
        .remark-container {
          background: #03b37f;
          color: #fff;
          padding: 5px 10px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
        }

        .casino-video-cards {
        top: 95px;
        transform: unset;
        width: 75px;
        padding: 5px 10px 5px 5px;
        height: 75px;
    }
        .remark-icon {
            display: flex;
            align-items: center;
        }
      `}</style>
      <div className="casino-table teenpatti20b kk">
        {/* Video Section */}
        <CasinoVideo
          gameName="2 Cards Teenpatti"
          roundId={gameData?.t1?.[0]?.mid}
          videoSrc="/newmediaplayer/teen62/667946cf-39ee-4f49-901e-13d5438e91ad"
          autotime={gameData?.t1?.[0]?.autotime}
          totalTime={gameData?.t1?.[0]?.ft}
          isCardDrawerOpen={isDrawerOpen}
          setIsCardDrawerOpen={setIsDrawerOpen}
          CardsComponent={VideoCards}
          cards={[currentGame?.C1, currentGame?.C2, currentGame?.C3, currentGame?.C4]}
        />

        <div
          className="casino-detail"
          style={{ padding: "4px", display: isMobile ? "none" : "block" }}
        >
          <div
            className="teen20casino-container"
            style={{
              display: "flex",
              width: "100%",
              background: "transparent",
            }}
          >
            {/* Player A Section */}
            <div
              className="teen20left"
              style={{ flex: 1, paddingRight: "2px" }}
            >
              {/* Row 1: Player A (Winner) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  minHeight: "42px",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    background: "#333b42",
                    color: isLight ? "#333" : "#fff",
                    height: "42px",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: "8px",
                    fontSize: "12px",
                    borderRight: "1px solid #444",
                    fontWeight: "600",
                  }}
                >
                  Player A
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    gap: "4px",
                    paddingLeft: "4px",
                    height: "42px",
                  }}
                >
                  <div
                    className={`back casino-bl-box-item ${getSuspendedClass(
                      getOddsBySid(1)?.gstatus
                    )}`}
                    onClick={() => {
                      const market = getOddsBySid(1);
                      if (market?.b1 && market?.b1 !== "0" && market?.gstatus !== "SUSPENDED") {
                        handleOddsClick("Player A", market.b1, 1, true);
                      }
                    }}
                    style={{
                      flex: 1,
                      cursor: getOddsBySid(1)?.b1 && getOddsBySid(1)?.b1 !== "0" && getOddsBySid(1)?.gstatus !== "SUSPENDED" ? "pointer" : "default",
                      border: "1px solid #72bbef",
                      background: getOddsBySid(1)?.gstatus === "SUSPENDED" ? "#2e3439" : "#72bbef",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "2px",
                    }}
                  >
                    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span
                        className="casino-box-odd"
                        style={{ color: isLight ? "#333" : "#fff", fontWeight: "bold", opacity: getOddsBySid(1)?.gstatus === "SUSPENDED" ? 0.4 : 1 }}
                      >
                        {getOddsBySid(1)?.b1 || "0"}
                      </span>
                      {getOddsBySid(1)?.gstatus === "SUSPENDED" && (
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                          <img src={lockSvg} className="muflis-lock-icon" alt="lock" style={{ marginBottom: 0 }} />
                        </div>
                      )}
                    </div>
                    {renderExposure(1)}
                  </div>
                  <div
                    className={`lay casino-bl-box-item ${getSuspendedClass(
                      getOddsBySid(1)?.gstatus
                    )}`}
                    onClick={() => {
                      const market = getOddsBySid(1);
                      if (market?.l1 && market?.l1 !== "0" && market?.gstatus !== "SUSPENDED") {
                        handleOddsClick("Player A", market.l1, 1, false);
                      }
                    }}
                    style={{
                      flex: 1,
                      cursor: getOddsBySid(1)?.l1 && getOddsBySid(1)?.l1 !== "0" && getOddsBySid(1)?.gstatus !== "SUSPENDED" ? "pointer" : "default",
                      border: "1px solid #f994ba",
                      background: getOddsBySid(1)?.gstatus === "SUSPENDED" ? "#2e3439" : "#f994ba",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "2px",
                    }}
                  >
                    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span
                        className="casino-box-odd"
                        style={{ color: isLight ? "#333" : "#fff", fontWeight: "bold", opacity: getOddsBySid(1)?.gstatus === "SUSPENDED" ? 0.4 : 1 }}
                      >
                        {getOddsBySid(1)?.l1 || "0"}
                      </span>
                      {getOddsBySid(1)?.gstatus === "SUSPENDED" && (
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                          <img src={lockSvg} className="muflis-lock-icon" alt="lock" style={{ marginBottom: 0 }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Mini Baccarat A */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  minHeight: "42px",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    background: "#333b42",
                    color: isLight ? "#333" : "#fff",
                    height: "42px",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: "8px",
                    fontSize: "12px",
                    borderRight: "1px solid #444",
                    fontWeight: "600",
                  }}
                >
                  Mini Baccarat A
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    paddingLeft: "4px",
                    height: "42px",
                  }}
                >
                  <div
                    className={`back casino-bl-box-item ${getSuspendedClass(
                      getOddsBySid(5)?.gstatus
                    )}`}
                    onClick={() => {
                      const market = getOddsBySid(5);
                      if (market?.b1 && market?.b1 !== "0" && market?.gstatus !== "SUSPENDED") {
                        handleOddsClick("Mini Baccarat A", market.b1, 5, true);
                      }
                    }}
                    style={{
                      width: "100%",
                      cursor: getOddsBySid(5)?.b1 && getOddsBySid(5)?.b1 !== "0" && getOddsBySid(5)?.gstatus !== "SUSPENDED" ? "pointer" : "default",
                      border: "1px solid #72bbef",
                      background: getOddsBySid(5)?.gstatus === "SUSPENDED" ? "#2e3439" : "#72bbef",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "2px",
                    }}
                  >
                    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span
                        className="casino-box-odd"
                        style={{ color: isLight ? "#333" : "#fff", fontWeight: "bold", opacity: getOddsBySid(5)?.gstatus === "SUSPENDED" ? 0.4 : 1 }}
                      >
                        {getOddsBySid(5)?.b1 || "0"}
                      </span>
                      {getOddsBySid(5)?.gstatus === "SUSPENDED" && (
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                          <img src={lockSvg} className="muflis-lock-icon" alt="lock" style={{ marginBottom: 0 }} />
                        </div>
                      )}
                    </div>
                    {renderExposure(5)}
                  </div>
                </div>
              </div>

              {/* Row 3: Total A (Top 9) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  minHeight: "42px",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    background: "#333b42",
                    color: isLight ? "#333" : "#fff",
                    height: "42px",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: "8px",
                    fontSize: "12px",
                    borderRight: "1px solid #444",
                    fontWeight: "600",
                  }}
                >
                  Total A
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    gap: "4px",
                    paddingLeft: "4px",
                    height: "42px",
                  }}
                >
                  <div
                    className={`lay casino-bl-box-item ${getSuspendedClass(
                      getOddsBySid(3)?.gstatus
                    )}`}
                    onClick={() => {
                      const market = getOddsBySid(3);
                      if (market?.l1 && market?.l1 !== "0" && market?.gstatus !== "SUSPENDED") {
                        handleOddsClick("Total A", market.ls1, 3, false);
                      }
                    }}
                    style={{
                      flex: 1,
                      cursor: getOddsBySid(3)?.l1 && getOddsBySid(3)?.l1 !== "0" && getOddsBySid(3)?.gstatus !== "SUSPENDED" ? "pointer" : "default",
                      border: "1px solid #f994ba",
                      background: getOddsBySid(3)?.gstatus === "SUSPENDED" ? "#2e3439" : "#f994ba",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "2px",
                    }}
                  >
                    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span
                        className="casino-box-odd"
                        style={{ color: isLight ? "#333" : "#fff", fontWeight: "bold", opacity: getOddsBySid(3)?.gstatus === "SUSPENDED" ? 0.4 : 1 }}
                      >
                        {getOddsBySid(3)?.l1 || "0"}
                      </span>
                      {getOddsBySid(3)?.gstatus === "SUSPENDED" && (
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                          <img src={lockSvg} className="muflis-lock-icon" alt="lock" style={{ marginBottom: 0 }} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className={`back casino-bl-box-item ${getSuspendedClass(
                      getOddsBySid(3)?.gstatus
                    )}`}
                    onClick={() => {
                      const market = getOddsBySid(3);
                      if (market?.b1 && market?.b1 !== "0" && market?.gstatus !== "SUSPENDED") {
                        handleOddsClick("Total A", market.bs1, 3, true);
                      }
                    }}
                    style={{
                      flex: 1,
                      cursor: getOddsBySid(3)?.b1 && getOddsBySid(3)?.b1 !== "0" && getOddsBySid(3)?.gstatus !== "SUSPENDED" ? "pointer" : "default",
                      border: "1px solid #72bbef",
                      background: getOddsBySid(3)?.gstatus === "SUSPENDED" ? "#2e3439" : "#72bbef",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "2px",
                    }}
                  >
                    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span
                        className="casino-box-odd"
                        style={{ color: isLight ? "#333" : "#fff", fontWeight: "bold", opacity: getOddsBySid(3)?.gstatus === "SUSPENDED" ? 0.4 : 1 }}
                      >
                        {getOddsBySid(3)?.b1 || "0"}
                      </span>
                      {getOddsBySid(3)?.gstatus === "SUSPENDED" && (
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                          <img src={lockSvg} className="muflis-lock-icon" alt="lock" style={{ marginBottom: 0 }} />
                        </div>
                      )}
                    </div>
                    {renderExposure(3)}
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Splitter */}
            <div
              style={{ width: "1px", background: "#4b5563", margin: "0 2px" }}
            ></div>

            {/* Player B Section */}
            <div
              className="teen20right"
              style={{ flex: 1, paddingLeft: "2px" }}
            >
              {/* Row 1: Player B (Winner) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  minHeight: "42px",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    background: "#333b42",
                    color: isLight ? "#333" : "#fff",
                    height: "42px",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: "8px",
                    fontSize: "12px",
                    borderRight: "1px solid #444",
                    fontWeight: "600",
                  }}
                >
                  Player B
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    gap: "4px",
                    paddingLeft: "4px",
                    height: "42px",
                  }}
                >
                  <div
                    className={`back casino-bl-box-item ${getSuspendedClass(
                      getOddsBySid(2)?.gstatus
                    )}`}
                    onClick={() => {
                      const market = getOddsBySid(2);
                      if (market?.b1 && market?.b1 !== "0" && market?.gstatus !== "SUSPENDED") {
                        handleOddsClick("Player B", market.b1, 2, true);
                      }
                    }}
                    style={{
                      flex: 1,
                      cursor: getOddsBySid(2)?.b1 && getOddsBySid(2)?.b1 !== "0" && getOddsBySid(2)?.gstatus !== "SUSPENDED" ? "pointer" : "default",
                      border: "1px solid #72bbef",
                      background: getOddsBySid(2)?.gstatus === "SUSPENDED" ? "#2e3439" : "#72bbef",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "2px",
                    }}
                  >
                    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span
                        className="casino-box-odd"
                        style={{ color: isLight ? "#333" : "#fff", fontWeight: "bold", opacity: getOddsBySid(2)?.gstatus === "SUSPENDED" ? 0.4 : 1 }}
                      >
                        {getOddsBySid(2)?.b1 || "0"}
                      </span>
                      {getOddsBySid(2)?.gstatus === "SUSPENDED" && (
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                          <img src={lockSvg} className="muflis-lock-icon" alt="lock" style={{ marginBottom: 0 }} />
                        </div>
                      )}
                    </div>
                    {renderExposure(2)}
                  </div>
                  <div
                    className={`lay casino-bl-box-item ${getSuspendedClass(
                      getOddsBySid(2)?.gstatus
                    )}`}
                    onClick={() => {
                      const market = getOddsBySid(2);
                      if (market?.l1 && market?.l1 !== "0" && market?.gstatus !== "SUSPENDED") {
                        handleOddsClick("Player B", market.l1, 2, false);
                      }
                    }}
                    style={{
                      flex: 1,
                      cursor: getOddsBySid(2)?.l1 && getOddsBySid(2)?.l1 !== "0" && getOddsBySid(2)?.gstatus !== "SUSPENDED" ? "pointer" : "default",
                      border: "1px solid #f994ba",
                      background: getOddsBySid(2)?.gstatus === "SUSPENDED" ? "#2e3439" : "#f994ba",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "2px",
                    }}
                  >
                    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span
                        className="casino-box-odd"
                        style={{ color: isLight ? "#333" : "#fff", fontWeight: "bold", opacity: getOddsBySid(2)?.gstatus === "SUSPENDED" ? 0.4 : 1 }}
                      >
                        {getOddsBySid(2)?.l1 || "0"}
                      </span>
                      {getOddsBySid(2)?.gstatus === "SUSPENDED" && (
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                          <img src={lockSvg} className="muflis-lock-icon" alt="lock" style={{ marginBottom: 0 }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Mini Baccarat B */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  minHeight: "42px",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    background: "#333b42",
                    color: isLight ? "#333" : "#fff",
                    height: "42px",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: "8px",
                    fontSize: "12px",
                    borderRight: "1px solid #444",
                    fontWeight: "600",
                  }}
                >
                  Mini Baccarat B
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    paddingLeft: "4px",
                    height: "42px",
                  }}
                >
                  <div
                    className={`back casino-bl-box-item ${getSuspendedClass(
                      getOddsBySid(6)?.gstatus
                    )}`}
                    onClick={() => {
                      const market = getOddsBySid(6);
                      if (market?.b1 && market?.b1 !== "0" && market?.gstatus !== "SUSPENDED") {
                        handleOddsClick("Mini Baccarat B", market.b1, 6, true);
                      }
                    }}
                    style={{
                      width: "100%",
                      cursor: getOddsBySid(6)?.b1 && getOddsBySid(6)?.b1 !== "0" && getOddsBySid(6)?.gstatus !== "SUSPENDED" ? "pointer" : "default",
                      border: "1px solid #72bbef",
                      background: getOddsBySid(6)?.gstatus === "SUSPENDED" ? "#2e3439" : "#72bbef",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "2px",
                    }}
                  >
                    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span
                        className="casino-box-odd"
                        style={{ color: isLight ? "#333" : "#fff", fontWeight: "bold", opacity: getOddsBySid(6)?.gstatus === "SUSPENDED" ? 0.4 : 1 }}
                      >
                        {getOddsBySid(6)?.b1 || "0"}
                      </span>
                      {getOddsBySid(6)?.gstatus === "SUSPENDED" && (
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                          <img src={lockSvg} className="muflis-lock-icon" alt="lock" style={{ marginBottom: 0 }} />
                        </div>
                      )}
                    </div>
                    {renderExposure(6)}
                  </div>
                </div>
              </div>

              {/* Row 3: Total B (Top 9) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  minHeight: "42px",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    background: "#333b42",
                    color: isLight ? "#333" : "#fff",
                    height: "42px",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: "8px",
                    fontSize: "12px",
                    borderRight: "1px solid #444",
                    fontWeight: "600",
                  }}
                >
                  Total B
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    gap: "4px",
                    paddingLeft: "4px",
                    height: "42px",
                  }}
                >
                  <div
                    className={`lay casino-bl-box-item ${getSuspendedClass(
                      getOddsBySid(4)?.gstatus
                    )}`}
                    onClick={() => {
                      const market = getOddsBySid(4);
                      if (market?.l1 && market?.l1 !== "0" && market?.gstatus !== "SUSPENDED") {
                        handleOddsClick("Total B", market.ls1, 4, false);
                      }
                    }}
                    style={{
                      flex: 1,
                      cursor: getOddsBySid(4)?.l1 && getOddsBySid(4)?.l1 !== "0" && getOddsBySid(4)?.gstatus !== "SUSPENDED" ? "pointer" : "default",
                      border: "1px solid #f994ba",
                      background: getOddsBySid(4)?.gstatus === "SUSPENDED" ? "#2e3439" : "#f994ba",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "2px",
                    }}
                  >
                    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span
                        className="casino-box-odd"
                        style={{ color: isLight ? "#333" : "#fff", fontWeight: "bold", opacity: getOddsBySid(4)?.gstatus === "SUSPENDED" ? 0.4 : 1 }}
                      >
                        {getOddsBySid(4)?.l1 || "0"}
                      </span>
                      {getOddsBySid(4)?.gstatus === "SUSPENDED" && (
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                          <img src={lockSvg} className="muflis-lock-icon" alt="lock" style={{ marginBottom: 0 }} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className={`back casino-bl-box-item ${getSuspendedClass(
                      getOddsBySid(4)?.gstatus
                    )}`}
                    onClick={() => {
                      const market = getOddsBySid(4);
                      if (market?.b1 && market?.b1 !== "0" && market?.gstatus !== "SUSPENDED") {
                        handleOddsClick("Total B", market.bs1, 4, true);
                      }
                    }}
                    style={{
                      flex: 1,
                      cursor: getOddsBySid(4)?.b1 && getOddsBySid(4)?.b1 !== "0" && getOddsBySid(4)?.gstatus !== "SUSPENDED" ? "pointer" : "default",
                      border: "1px solid #72bbef",
                      background: getOddsBySid(4)?.gstatus === "SUSPENDED" ? "#2e3439" : "#72bbef",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "2px",
                    }}
                  >
                    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span
                        className="casino-box-odd"
                        style={{ color: isLight ? "#333" : "#fff", fontWeight: "bold", opacity: getOddsBySid(4)?.gstatus === "SUSPENDED" ? 0.4 : 1 }}
                      >
                        {getOddsBySid(4)?.b1 || "0"}
                      </span>
                      {getOddsBySid(4)?.gstatus === "SUSPENDED" && (
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                          <img src={lockSvg} className="muflis-lock-icon" alt="lock" style={{ marginBottom: 0 }} />
                        </div>
                      )}
                    </div>
                    {renderExposure(4)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Color Plus Row */}
          <div style={{ width: "100%", marginTop: "4px" }}>
            <div
              className={`back casino-bl-box-item ${getOddsBySid(7)?.gstatus === "SUSPENDED" ||
                !getOddsBySid(7)?.b1 ||
                getOddsBySid(7)?.b1 === "0"
                ? "locked"
                : ""
                }`}
              onClick={() =>
                getOddsBySid(7)?.b1 &&
                getOddsBySid(7)?.b1 !== "0" &&
                getOddsBySid(7)?.gstatus !== "SUSPENDED" &&
                handleOddsClick("Color Plus", getOddsBySid(7)?.b1, 7, true)
              }
              style={{
                width: "100%",
                height: "55px",
                border: "1px solid #72bbef",
                background: getOddsBySid(7)?.gstatus === "SUSPENDED" ? "#2e3439" : "#72bbef",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "2px",
                cursor:
                  getOddsBySid(7)?.b1 &&
                    getOddsBySid(7)?.b1 !== "0" &&
                    getOddsBySid(7)?.gstatus !== "SUSPENDED"
                    ? "pointer"
                    : "default",
              }}
            >
              <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{
                  opacity: (getOddsBySid(7)?.gstatus === "SUSPENDED" ||
                    !getOddsBySid(7)?.b1 ||
                    getOddsBySid(7)?.b1 === "0") ? 0.4 : 1,
                  textAlign: "center",
                  position: 'relative',
                }}>
                  <span
                    style={{
                      color: isLight ? "#333" : "#D7D7D7",
                      fontSize: "14px",
                      fontWeight: "bold",
                      display: "block",
                    }}
                  >
                    Color Plus
                  </span>
                  {renderExposure(7, { textAlign: 'right', width: '100%', marginRight: '10px' })}
                </div>
                {(getOddsBySid(7)?.gstatus === "SUSPENDED" ||
                  !getOddsBySid(7)?.b1 ||
                  getOddsBySid(7)?.b1 === "0") && (
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1 }}>
                      <img src={lockSvg} className="muflis-lock-icon" alt="lock" style={{ marginBottom: 0 }} />
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        {isMobile && (
          <div className="mobile-2cards-container">
            {/* Player A */}
            <div className="mobile-bet-row">
              <div className="mobile-label-col">
                Player A {renderExposure(1)}
              </div>
              <div className="mobile-odds-col">
                {renderBtn("Player A", 1, "back", true)}
                {renderBtn("Player A", 1, "lay", false)}
              </div>
            </div>

            {/* Player B */}
            <div className="mobile-bet-row">
              <div className="mobile-label-col">
                Player B {renderExposure(2)}
              </div>
              <div className="mobile-odds-col">
                {renderBtn("Player B", 2, "back", true)}
                {renderBtn("Player B", 2, "lay", false)}
              </div>
            </div>

            {/* Mini Baccarat A */}
            <div className="mobile-bet-row">
              <div className="mobile-label-col">
                Mini Baccarat A {renderExposure(5)}
              </div>
              <div className="mobile-odds-col">
                {/* Only Back button spanning full width of odds col */}
                {renderBtn("Mini Baccarat A", 5, "back", true)}
              </div>
            </div>

            {/* Mini Baccarat B */}
            <div className="mobile-bet-row">
              <div className="mobile-label-col">
                Mini Baccarat B {renderExposure(6)}
              </div>
              <div className="mobile-odds-col">
                {/* Only Back button spanning full width of odds col */}
                {renderBtn("Mini Baccarat B", 6, "back", true)}
              </div>
            </div>

            {/* Total A */}
            <div className="mobile-bet-row">
              <div className="mobile-label-col">
                Total A {renderExposure(3)}
              </div>
              <div className="mobile-odds-col">
                {/* Desktop sid=3 has Lay (Pink) then Back (Blue) */}
                {renderBtn("Total A", 3, "lay", false)}
                {renderBtn("Total A", 3, "back", true)}
              </div>
            </div>

            {/* Total B */}
            <div className="mobile-bet-row">
              <div className="mobile-label-col">
                Total B {renderExposure(4)}
              </div>
              <div className="mobile-odds-col">
                {/* Desktop sid=4 has Lay (Pink) then Back (Blue) */}
                {renderBtn("Total B", 4, "lay", false)}
                {renderBtn("Total B", 4, "back", true)}
              </div>
            </div>

            {/* Color Plus */}
            <div
              className={`color-plus-row ${(getOddsBySid(7)?.gstatus === "SUSPENDED" || !getOddsBySid(7)?.b1 || getOddsBySid(7)?.b1 === "0") ? "suspended" : ""}`}
              onClick={() => {
                const market = getOddsBySid(7);
                if (
                  market?.b1 &&
                  market?.b1 !== "0" &&
                  market?.gstatus !== "SUSPENDED"
                ) {
                  handleOddsClick("Color Plus", market.b1, 7, true);
                }
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "55px",
                padding: "4px 0",
                cursor:
                  getOddsBySid(7)?.b1 &&
                    getOddsBySid(7)?.b1 !== "0" &&
                    getOddsBySid(7)?.gstatus !== "SUSPENDED"
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              <div style={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <div style={{
                  position: "relative",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%"
                }}>
                  <div>Color Plus</div>
                  <div style={{ position: "absolute", top: "23px", right: "10px", transform: "translateY(-50%)" }}>
                    {renderExposure(7, { textAlign: 'right', width: '100%', marginRight: '10px' })}
                  </div>
                </div>
                {(getOddsBySid(7)?.gstatus === "SUSPENDED" ||
                  !getOddsBySid(7)?.b1 ||
                  getOddsBySid(7)?.b1 === "0") && (
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1 }}>
                      <img src={lockSvg} className="muflis-lock-icon" alt="lock" style={{ marginBottom: 0 }} />
                    </div>
                  )}
              </div>
            </div>

            {/* Disclaimer Marquee */}
            <div className="remark-container" style={{ marginTop: "8px", marginBottom: "0" }}>
              <div className="remark-icon">
                <img
                  src="https://wver.sprintstaticdata.com/v65/static/front/img/icons/remark.png"
                  style={{ width: "20px", height: "20px" }}
                  alt="remark"
                />
              </div>
              <marquee>
                {gameData?.t1?.[0]?.remark ||
                  "Card 9 is 9, 10, J, Q, K, A. Card 8 is 8, 9, 10, J, Q, K, A... Game Rules apply."}
              </marquee>
            </div>
          </div>
        )}
      </div >
    </>
  );
};

export default TeenPatti2Cards;
