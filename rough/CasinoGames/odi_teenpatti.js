import React, { useState, useEffect, useRef } from "react";
import {
  fetchCasinoExposureApi,
  fetchTeenpattiResults,
  getDefaultParams,
  fetchOpenBetsApi,
} from "../../api/api";
import { io } from "socket.io-client";
import Modal from "react-modal";
import { toast } from "react-toastify";
import CasinoVideo from "./components/CasinoVideo";
import { useSelector } from "react-redux";
import Result_teenpattioneday from "./results/Result_teenpattioneday";
import styles from "./results/Result_Superover3.module.css";

// Helper function to parse the description string into structured data
const parseDescription = (desc) => {
  if (!desc) {
    return {
      winner: "",
      cards: [],
      oddEven: [],
      consecutive: "",
    };
  }
  const parts = desc.split("#");
  return {
    winner: parts[0]?.trim() || "",
    cards: parts[1]?.split("  ").filter(Boolean) || [],
    oddEven: parts[2]?.split("  ").filter(Boolean) || [],
    consecutive: parts[3]?.trim() || "",
  };
};

const OdiTeenPatti = ({ onBetSelection, lastBetTime, exposureTrigger }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [gameData, setGameData] = useState(null);
  const [exposureData, setExposureData] = useState([]);
  const [isMobileView, setIsMobileView] = useState(
    window.innerWidth <= 768 && !window.location.search.includes("example1=on")
  );
  const [lastResults, setLastResults] = useState([]);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [openBets, setOpenBets] = useState([]);
  const [isMyBetsModalOpen, setIsMyBetsModalOpen] = useState(false);
  const socketRef = useRef(null);
  const isLight = useSelector(state => state.action.theme) === "light";

  const cardPairs = [1, 2, 3, 4, 5, 6];

  const formatResultData = (result) => {
    if (!result) return null;
    if (result.formatted) return result;

    const desc = parseDescription(result.desc_remakrs || "");
    let allCards = [];
    try {
      allCards = Array.isArray(result.cards)
        ? result.cards
        : typeof result.cards === "string"
          ? JSON.parse(result.cards)
          : [];
    } catch (e) {
      allCards = [];
    }

    let playerACards, playerBCards;
    // ODI Teenpatti has interleaved cards: A, B, A, B, A, B
    playerACards = [allCards[0], allCards[2], allCards[4]].filter(Boolean);
    playerBCards = [allCards[1], allCards[3], allCards[5]].filter(Boolean);

    const isPlayerAWinner = desc.winner?.includes("Player A") ?? false;
    const isPlayerBWinner = desc.winner?.includes("Player B") ?? false;

    return {
      roundId: result.event_id || result.mid || "N/A",
      matchTime: result.time ? new Date(result.time).toLocaleString() : "N/A",
      playerA: {
        name: "Player A",
        cards: playerACards,
        isWinner: isPlayerAWinner,
        consecutive: desc.consecutive?.includes("A : Yes") || false,
      },
      playerB: {
        name: "Player B",
        cards: playerBCards,
        isWinner: isPlayerBWinner,
        consecutive: desc.consecutive?.includes("B : Yes") || false,
      },
      oddEven: desc.oddEven.join(" "),
      consecutive: desc.consecutive,
      formatted: true,
    };
  };

  const handleResultClick = async (clickedIndex) => {
    const resultItem = lastResults[clickedIndex];
    if (!resultItem) return;

    try {
      const mid = resultItem.mid || resultItem.event_id || resultItem.roundId;
      if (!mid) {
        toast.error("Result ID missing");
        return;
      }
      const { login_user_id, auth_key } = getDefaultParams();
      const response = await fetchTeenpattiResults(
        mid,
        "teen",
        1,
        login_user_id,
        auth_key
      );

      if (response && response.length > 0 && response[0]) {
        setModalContent(response[0]);
        setResultModalOpen(true);
      } else {
        toast.error("Details not available");
      }
    } catch (error) {
      console.error("Result click error:", error);
      toast.error("Failed to fetch result details");
    }
  };

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
    const fetchExposure = async () => {
      if (!gameData?.t1?.[0]?.mid) return;
      try {
        const response = await fetchCasinoExposureApi({
          markettype: "ODITEENPATTI",
          main_event_id: gameData.t1[0].mid,
          curPageName: "live_odi_teenpatti.php",
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
        style={{ marginLeft: "5px", color: exposure >= 0 ? "green" : "red" }}
      >
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
      console.log("📤 Emitting Room: teen");
      socket.emit("Room", "teen");
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

    socket.onAny((event, ...args) => {
      if (event !== "game" && event !== "gameResult") {
        console.log(`🔍 Socket Event Received: ${event}`, args);
      }
    });

    socket.on("gameResult", (data) => {
      let results = [];
      if (data && data.res && Array.isArray(data.res)) {
        results = data.res;
      } else if (data && data.data && Array.isArray(data.data)) {
        results = data.data;
      }

      if (results.length > 0) {
        const formattedResults = results.map((result) => {
          const formatted = formatResultData(result);
          return { ...result, ...formatted };
        });
        setLastResults((prev) => {
          if (formattedResults.length >= 5)
            return formattedResults.slice(0, 10);
          const updated = [...prev, ...formattedResults];
          return updated.slice(-10);
        });
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

  const getSuspendedClass = (status, visible) => {
    return status === "SUSPENDED" || status === "suspended" || visible === 0 ? "suspended" : "";
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

  useEffect(() => {
    // Clear bets when round changes to avoid showing old round's bets
    setOpenBets([]);

    const loadOpenBets = async () => {
      // Use gameData mid if available, fallback to 1
      const currentEventId = gameData?.t1?.[0]?.mid || "1";
      try {
        const res = await fetchOpenBetsApi({
          markettype: "ODITEENPATTI",
          eventId: currentEventId,
          curPageName: "live_odi_teenpatti.php",
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
      <>
        {rows.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`}>
            {row.map((card, idx) => (
              <span key={`card-${rowIndex}-${idx}`}>
                <img src={getCardImage(card)} alt="card" />
              </span>
            ))}
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      <div className="casino-table teenpatti-new">
        <CasinoVideo
          gameName="Teenpatti 1-day"
          roundId={currentGame?.mid}
          videoSrc="/newmediaplayer/teen62/667946cf-39ee-4f49-901e-13d5438e91ad"
          isCardDrawerOpen={isDrawerOpen}
          setIsCardDrawerOpen={setIsDrawerOpen}
          autotime={currentGame?.autotime}
          totalTime={currentGame?.ft} cards={[currentGame?.C1, currentGame?.C2, currentGame?.C3, currentGame?.C4, currentGame?.C5, currentGame?.C6]}
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
                    // background-color: #2e3439;
                    // color: #ccc; /* Changed to grey */
                    font-family: sans-serif;
                  }
                  .mobile-section-container {
                    margin-bottom: 5px;
                  }
                  :root[data-theme="light"] .mobile-section-header {
                    color: #333;
                  }
                  .mobile-section-header {
                    display: flex;
                    justify-content: space-between;
                    background-color: transparent;
                    padding: 5px 2px;
                    font-size: 12px;
                    font-weight: bold;
                    color: #999; /* Lighter grey for headers */
                  }
                  .mobile-section-header > div {
                    flex: 1;
                    text-align: center;
                  }
                   .mobile-section-header > div:first-child {
                    text-align: left;
                    flex: 1.2;
                    padding-left: 5px;
                  }
                  
                  .mobile-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: transparent; /* Transparent row bg */
                    padding: 0;
                    margin-bottom: 5px; /* Spacing from below */
                    border-bottom: none;
                    gap: 2px; /* Add little spacing back */
                  }
                  .mobile-row:last-child {
                    margin-bottom: 0;
                  }
                  
                  :root[data-theme="light"] .mobile-row-label {
                    background-color: #ddd;
                    color: #333;
                  }
                   .mobile-row-label {
                    flex: 1; /* Adjust width share */
                    height: 35px; /* Increased height */
                    display: flex;
                    align-items: center;
                    background-color: #444; /* Grey bar for label */
                    font-size: 12px;
                    font-weight: bold;
                    color: #fff;
                    padding-left: 8px; /* Added padding */
                    margin: 0 !important;
                    border-radius: 8px 0 0 8px; /* Rounded left only */
                   }
                   
                   .mobile-odds-box {
                    position: relative;
                    flex: 1.1; /* Increased width */
                    height: 35px; /* Increased height */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 !important;
                    border-radius: 0 !important; /* No border radius */
                    font-weight: bold;
                    font-size: 14px;
                    cursor: pointer;
                    background-color: #2a2a2a;
                    color: #fff;
                   }
                   
                   .suspended {
                    position: relative;
                    pointer-events: none;
                   }
                   
                   .suspended:before {
                    content: "";
                    background-image: url("https://wver.sprintstaticdata.com/v207/static/front/img/lock.svg");
                    background-size: 17px 17px;
                    filter: invert(1);
                    background-repeat: no-repeat;
                    position: absolute;
                    z-index: 100;
                    width: 100%;
                    height: 100%;
                    left: 0;
                    top: 0;
                    background-position: center;
                    pointer-events: none;
                   }
                   
                   .suspended:after {
                    content: "";
                    background-color: #373636d6;
                    position: absolute;
                    height: 100%;
                    width: 100%;
                    left: 0;
                    top: 0;
                    cursor: not-allowed;
                    border-radius: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    pointer-events: none;
                   }

                  .mobile-odds-box {
                    flex: 1.1; /* Increased width */
                    height: 35px; /* Increased height */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 !important;
                    border-radius: 0 !important; /* No border radius */
                    font-weight: bold;
                    font-size: 14px;
                    cursor: pointer;
                    background-color: #2a2a2a;
                    color: #fff;
                  }
                  
                  .mobile-odds-box.back {
                    border: 2px solid #3B5160;
                    background-color: transparent; 
                    color: #ccc; 
                  }
                   .mobile-odds-box.lay {
                    border: 2px solid #7F4154;
                    background-color: transparent;
                     color: #ccc;
                  }
                   .mobile-odds-box.back { border-color: #72bbef; }
                   .mobile-odds-box.lay { border-color: #fca4b7; }

                   .mobile-odds-box.suspended {
                       background-color: #222;
                        border-color: #555;
                        color: #555; /* Darker grey for suspended */
                        cursor: not-allowed;
                   }
                        .teenpatti-new .casino-video-cards {
    position: absolute;
    left: 0;
    top: 55%;
    transform: translateY(-50%);
    width: 110px;
    height: 95px;
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
                   
                   .mobile-odds-box i {
                       font-size: 12px;
                   }
                   
                   /* Increase Video Box Height in Mobile */
                   .video-box-container .video-box {
                       // height: 250px !important; /* Increased height */
                   }

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
                  <div className="mobile-row-label">
                    PLAYER A {renderExposure(1)}
                  </div>
                  <div
                    className={`mobile-odds-box back ${getSuspendedClass(
                      getOddsBySid(1)?.gstatus,
                      getOddsBySid(1)?.visible
                    )}`}
                    onClick={() =>
                      getOddsBySid(1)?.visible === 1 &&
                      handleOddsClick("Player A Main", getOddsBySid(1)?.b1, 1, true)
                    }
                  >
                    {getOddsBySid(1)?.b1 || "0"}
                  </div>
                  <div
                    className={`mobile-odds-box lay ${getSuspendedClass(
                      getOddsBySid(1)?.gstatus,
                      getOddsBySid(1)?.visible
                    )}`}
                    onClick={() =>
                      getOddsBySid(1)?.visible === 1 &&
                      handleOddsClick("Player A Main", getOddsBySid(1)?.l1, 1, false)
                    }
                  >
                    {getOddsBySid(1)?.l1 || "0"}
                  </div>
                </div>

                {/* Main Player B */}
                <div className="mobile-row">
                  <div className="mobile-row-label">
                    PLAYER B {renderExposure(2)}
                  </div>
                  <div
                    className={`mobile-odds-box back ${getSuspendedClass(
                      getOddsBySid(2)?.gstatus,
                      getOddsBySid(2)?.visible
                    )}`}
                    onClick={() =>
                      getOddsBySid(2)?.visible === 1 &&
                      handleOddsClick("Player B Main", getOddsBySid(2)?.b1, 2, true)
                    }
                  >
                    {getOddsBySid(2)?.b1 || "0"}
                  </div>
                  <div
                    className={`mobile-odds-box lay ${getSuspendedClass(
                      getOddsBySid(2)?.gstatus,
                      getOddsBySid(2)?.visible
                    )}`}
                    onClick={() =>
                      getOddsBySid(2)?.visible === 1 &&
                      handleOddsClick("Player B Main", getOddsBySid(2)?.l1, 2, false)
                    }
                  >
                    {getOddsBySid(2)?.l1 || "0"}
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

                {/* Consecutive Player A */}
                <div className="mobile-row">
                  <div className="mobile-row-label">
                    PLAYER A {renderExposure(17)}
                  </div>
                  <div
                    className={`mobile-odds-box back ${getSuspendedClass(
                      getOddsBySid(17)?.gstatus,
                      getOddsBySid(17)?.visible
                    )}`}
                    onClick={() =>
                      getOddsBySid(17)?.visible === 1 &&
                      handleOddsClick(
                        "Player A Consicutive",
                        getOddsBySid(17)?.b1,
                        17,
                        true
                      )
                    }
                  >
                    {getOddsBySid(17)?.b1 || "0"}
                  </div>
                  <div
                    className={`mobile-odds-box lay ${getSuspendedClass(
                      getOddsBySid(17)?.gstatus,
                      getOddsBySid(17)?.visible
                    )}`}
                    onClick={() =>
                      getOddsBySid(17)?.visible === 1 &&
                      handleOddsClick(
                        "Player A Consicutive",
                        getOddsBySid(17)?.l1,
                        17,
                        false
                      )
                    }
                  >
                    {getOddsBySid(17)?.l1 || "0"}
                  </div>
                </div>

                {/* Consecutive Player B */}
                <div className="mobile-row">
                  <div className="mobile-row-label">
                    PLAYER B {renderExposure(18)}
                  </div>
                  <div
                    className={`mobile-odds-box back ${getSuspendedClass(
                      getOddsBySid(18)?.gstatus,
                      getOddsBySid(18)?.visible
                    )}`}
                    onClick={() =>
                      getOddsBySid(18)?.visible === 1 &&
                      handleOddsClick(
                        "Player B Consicutive",
                        getOddsBySid(18)?.b1,
                        18,
                        true
                      )
                    }
                  >
                    {getOddsBySid(18)?.b1 || "0"}
                  </div>
                  <div
                    className={`mobile-odds-box lay ${getSuspendedClass(
                      getOddsBySid(18)?.gstatus,
                      getOddsBySid(18)?.visible
                    )}`}
                    onClick={() =>
                      getOddsBySid(18)?.visible === 1 &&
                      handleOddsClick(
                        "Player B Consicutive",
                        getOddsBySid(18)?.l1,
                        18,
                        false
                      )
                    }
                  >
                    {getOddsBySid(18)?.l1 || "0"}
                  </div>
                </div>
              </div>

              {/* SECTION: CARDS */}
              <div className="mobile-section-container">
                <div className="mobile-section-header">
                  <div>CARDS</div>
                  <div>ODD</div>
                  <div>EVEN</div>
                </div>

                {/* Cards Loop */}
                {cardPairs.map((pair, index) => {
                  const cardSid = 11 + index;
                  const item = getOddsBySid(cardSid);
                  const oddData = item?.odds?.find((o) => o.nat === "Odd");
                  const evenData = item?.odds?.find((o) => o.nat === "Even");

                  return (
                    <div className="mobile-row" key={pair}>
                      <div className="mobile-row-label">CARD {pair}</div>
                      <div
                        className={`mobile-odds-box back ${getSuspendedClass(
                          item?.gstatus,
                          item?.visible
                        )}`}
                        onClick={() =>
                          item?.visible === 1 &&
                          handleOddsClick(
                            `Card ${pair}  Odd`,
                            oddData?.b,
                            cardSid,
                            true
                          )
                        }
                      >
                        {oddData?.b || "0"}
                      </div>
                      <div
                        className={`mobile-odds-box back ${getSuspendedClass(
                          item?.gstatus,
                          item?.visible
                        )}`}
                        // Using 'back' class for same color
                        onClick={() =>
                          item?.visible === 1 &&
                          handleOddsClick(
                            `Card ${pair}  Even`,
                            evenData?.b,
                            cardSid,
                            true
                          )
                        }
                      >
                        {evenData?.b || "0"}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SECTION: LAST RESULTS */}
              <div className="mobile-section-container">
                <div className="mobile-last-results-container">
                  {lastResults && lastResults.length > 0 ? (
                    <>
                      {lastResults.map((result, i) => {
                        // Check 'win' property first (used by other components), then fallback to parser
                        let res = "-";
                        if (result.win == "1")
                          res = "A"; // Use == for loose equality (string/number)
                        else if (result.win == "2" || result.win == "0")
                          res = "B";
                        else if (result.playerA?.isWinner) res = "A";
                        else if (result.playerB?.isWinner) res = "B";

                        return (
                          <div
                            key={i}
                            className="mobile-result-box"
                            onClick={() => handleResultClick(i)}
                          >
                            <span
                              style={{
                                color:
                                  res === "A"
                                    ? "red"
                                    : res === "B"
                                      ? "#FFD700"
                                      : "white",
                                fontWeight: "bold",
                              }}
                            >
                              {res}
                            </span>
                          </div>
                        );
                      })}
                      <a
                        href="/report/casinoresult/teen33"
                        className="result-more"
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          display: "inline-block",
                          // marginLeft: "2px",
                          textDecoration: "none",
                          cursor: "pointer",
                          border: "1px solid #333",
                          background: "#000",
                          width: "30px",
                          height: "30px",
                          lineHeight: "28px",
                          textAlign: "center",
                        }}
                      >
                        ...
                      </a>
                    </>
                  ) : (
                    <div
                      style={{
                        color: "#666",
                        fontSize: "12px",
                        padding: "5px",
                      }}
                    >
                      Waiting...
                    </div>
                  )}
                </div>
              </div>

              <style>
                {`
                  .mobile-last-results-container {
                    display: flex;
                    justify-content: center; /* Centered */
                    gap: 2px;
                    padding: 8px 5px;
                    background: transparent;
                  }
                  :root[data-theme="light"] .mobile-result-box {0
                    background-color: white;
                    color: black;
                  }
                  .mobile-result-box {
                    width: 30px; /* Bigger size */
                    height: 30px; /* Bigger size */
                    background-color: black;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #333;
                  }
                  .mobile-result-box span {
                      font-weight: bold;
                      font-size: 11px; /* Bigger font */
                  }
                  /* Hide external desktop/web specific elements if they leak through */
                  .casino-place-bet {
                      display: none !important;
                  }
                `}
              </style>
            </div>
          ) : (
            <div className="teen1daycasino-container">
              <style>{`
                .casino-bl-box-item {
                  position: relative;
                }
                .suspended {
                  position: relative;
                  pointer-events: none;
                }
                .suspended:before {
                  content: "";
                  background-image: url("https://wver.sprintstaticdata.com/v207/static/front/img/lock.svg");
                  background-size: 17px 17px;
                  filter: invert(1);
                  background-repeat: no-repeat;
                  position: absolute;
                  z-index: 100;
                  width: 100%;
                  height: 100%;
                  left: 0;
                  top: 0;
                  background-position: center;
                  pointer-events: none;
                }
                .suspended:after {
                  content: "";
                  background-color: #373636d6;
                  position: absolute;
                  height: 100%;
                  width: 100%;
                  left: 0;
                  top: 0;
                  cursor: not-allowed;
                  border-radius: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  pointer-events: none;
                }
              `}</style>
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
                        getOddsBySid(1)?.gstatus,
                        getOddsBySid(1)?.visible
                      )}`}
                      onClick={() =>
                        getOddsBySid(1)?.visible === 1 &&
                        handleOddsClick(
                          "Player A Consecutive",
                          getOddsBySid(1)?.b1,
                          1,
                          true
                        )
                      }
                      style={{
                        cursor:
                          getOddsBySid(1)?.visible === 1
                            ? "pointer"
                            : "default",
                      }}
                    >
                      <span className="casino-box-odd">
                        {getOddsBySid(1)?.b1 || "0"}
                      </span>
                    </div>
                    <div
                      className={`lay casino-bl-box-item ${getSuspendedClass(
                        getOddsBySid(1)?.gstatus,
                        getOddsBySid(1)?.visible
                      )}`}
                      onClick={() =>
                        getOddsBySid(1)?.visible === 1 &&
                        handleOddsClick(
                          "Player A Consecutive",
                          getOddsBySid(1)?.l1,
                          1,
                          false
                        )
                      }
                      style={{
                        cursor:
                          getOddsBySid(1)?.visible === 1
                            ? "pointer"
                            : "default",
                      }}
                    >
                      <span className="casino-box-odd">
                        {getOddsBySid(1)?.l1 || "0"}
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
                        getOddsBySid(17)?.gstatus,
                        getOddsBySid(17)?.visible
                      )}`}
                      onClick={() =>
                        getOddsBySid(17)?.visible === 1 &&
                        handleOddsClick(
                          "Player A Consecutive",
                          getOddsBySid(17)?.b1,
                          17,
                          true
                        )
                      }
                      style={{
                        cursor:
                          getOddsBySid(17)?.visible === 1
                            ? "pointer"
                            : "default",
                      }}
                    >
                      <span className="casino-box-odd">
                        {getOddsBySid(17)?.b1 || "0"}
                      </span>
                    </div>
                    <div
                      className={`lay casino-bl-box-item ${getSuspendedClass(
                        getOddsBySid(17)?.gstatus,
                        getOddsBySid(17)?.visible
                      )}`}
                      onClick={() =>
                        getOddsBySid(17)?.visible === 1 &&
                        handleOddsClick(
                          "Player A Consecutive",
                          getOddsBySid(17)?.l1,
                          17,
                          false
                        )
                      }
                      style={{
                        cursor:
                          getOddsBySid(17)?.visible === 1
                            ? "pointer"
                            : "default",
                      }}
                    >
                      <span className="casino-box-odd">
                        {getOddsBySid(17)?.l1 || "0"}
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
                        getOddsBySid(2)?.gstatus,
                        getOddsBySid(2)?.visible
                      )}`}
                      onClick={() =>
                        getOddsBySid(2)?.visible === 1 &&
                        handleOddsClick(
                          "Player B Consecutive",
                          getOddsBySid(2)?.b1,
                          2,
                          true
                        )
                      }
                      style={{
                        cursor:
                          getOddsBySid(2)?.visible === 1
                            ? "pointer"
                            : "default",
                      }}
                    >
                      <span className="casino-box-odd">
                        {getOddsBySid(2)?.b1 || "0"}
                      </span>
                    </div>
                    <div
                      className={`lay casino-bl-box-item ${getSuspendedClass(
                        getOddsBySid(2)?.gstatus,
                        getOddsBySid(2)?.visible
                      )}`}
                      onClick={() =>
                        getOddsBySid(2)?.visible === 1 &&
                        handleOddsClick(
                          "Player B Consecutive",
                          getOddsBySid(2)?.l1,
                          2,
                          false
                        )
                      }
                      style={{
                        cursor:
                          getOddsBySid(2)?.visible === 1
                            ? "pointer"
                            : "default",
                      }}
                    >
                      <span className="casino-box-odd">
                        {getOddsBySid(2)?.l1 || "0"}
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
                        getOddsBySid(18)?.gstatus,
                        getOddsBySid(18)?.visible
                      )}`}
                      onClick={() =>
                        getOddsBySid(18)?.visible === 1 &&
                        handleOddsClick(
                          "Player B Consecutive",
                          getOddsBySid(18)?.b1,
                          18,
                          true
                        )
                      }
                      style={{
                        cursor:
                          getOddsBySid(18)?.visible === 1
                            ? "pointer"
                            : "default",
                      }}
                    >
                      <span className="casino-box-odd">
                        {getOddsBySid(18)?.b1 || "0"}
                      </span>
                    </div>
                    <div
                      className={`lay casino-bl-box-item ${getSuspendedClass(
                        getOddsBySid(18)?.gstatus,
                        getOddsBySid(18)?.visible
                      )}`}
                      onClick={() =>
                        getOddsBySid(18)?.visible === 1 &&
                        handleOddsClick(
                          "Player B Consecutive",
                          getOddsBySid(18)?.l1,
                          18,
                          false
                        )
                      }
                      style={{
                        cursor:
                          getOddsBySid(18)?.visible === 1
                            ? "pointer"
                            : "default",
                      }}
                    >
                      <span className="casino-box-odd">
                        {getOddsBySid(18)?.l1 || "0"}
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
                            item?.gstatus,
                            item?.visible
                          )}`}
                          onClick={() =>
                            item?.visible === 1 &&
                            handleOddsClick(
                              `Card ${pair}  Odd`,
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
                            {oddData?.b || "0"}
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
                            item?.gstatus,
                            item?.visible
                          )}`}
                          onClick={() =>
                            item?.visible === 1 &&
                            handleOddsClick(
                              `Card ${pair}  Even`,
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
                            {evenData?.b || "0"}
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
      {/* {console.log('@@@ resultModalOpen modalContent', resultModalOpen, modalContent)} */}
      <Modal
        isOpen={resultModalOpen}
        onRequestClose={() => setResultModalOpen(false)}
        style={{
          content: {
            top: "50px",
            left: "0",
            right: "0",
            bottom: "auto",
            marginRight: "0",
            transform: "none",
            width: "100%",
            maxWidth: "100%",
            padding: "0",
            backgroundColor: "#2e3439",
            border: "none",
            zIndex: 1100,
            borderRadius: "0",
          },
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.75)", zIndex: 1100 },
        }}
      >
        {modalContent && (
          <div style={{ color: "#fff", fontFamily: "sans-serif" }}>
            <header className={styles['modal-header']}>
              <h5 className={styles['modal-title']} >
                Teenpatti 1-day Result
              </h5>

              <button
                type="button"
                aria-label="Close"
                className={styles['close']}
                onClick={() => setResultModalOpen(false)}
                style={{ padding: '17px', fontSize: '21px' }}
              >
                ×
              </button>
            </header>
            <div style={{ background: isLight ? "white" : "#2e3439", padding: "0" }}>
              <Result_teenpattioneday modalContent={modalContent} isLight={isLight} />
            </div>
          </div>
        )}
      </Modal>


    </>
  );
};

export default OdiTeenPatti;
