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
import { getImage } from "../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";

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

const InstantTeenPatti3 = ({
  onBetSelection,
  lastBetTime,
  exposureTrigger,
}) => {
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

  const cardPairs = [1, 2, 3, 4, 5, 6];

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

    if (!allCards || allCards.length === 0) {
      allCards = desc.cards;
    }

    let playerACards, playerBCards;
    // ODI Teenpatti has interleaved cards: A, B, A, B, A, B
    // Instant Teenpatti 3 might follow same? Assuming yes based on similar structure
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
        "teen33",
        1,
        login_user_id,
        auth_key
      );

      if (response && response.length > 0 && response[0]) {
        const apiData = response[0];
        const formatted = formatResultData(apiData);
        setModalContent(formatted);
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
          markettype: "TEEN33",
          main_event_id: gameData.t1[0].mid,
          curPageName: "live_instant_teenpatti3.php",
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
      <span
        style={{ marginLeft: "40px", color: exposure >= 0 ? "#39FF39" : "#FF0000" }}
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
      console.log("📤 Emitting Room: teen33");
      socket.emit("Room", "teen33");
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

    socket.onAny((event, ...args) => {
      if (event !== "game") {
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

  useEffect(() => {
    // Clear bets when round changes to avoid showing old round's bets
    setOpenBets([]);

    const loadOpenBets = async () => {
      // Use gameData mid if available, fallback to 1
      const currentEventId = gameData?.t1?.[0]?.mid || "1";
      try {
        const res = await fetchOpenBetsApi({
          markettype: "TEEN33",
          eventId: currentEventId,
          curPageName: "live_instant_teenpatti3.php",
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

  const getCardImage = (cardCode) => {
    if (!cardCode || cardCode === "1")
      return "https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png";
    return `https://wver.sprintstaticdata.com/v190/static/front/img/cards/${cardCode}.png`;
  };

  // Helper function to check if market is suspended
  const isSuspended = (status) => {
    if (!status) return false; // If undefined, assume open (or check logic?) Usually safe to assume strictly closed if not sure, but 'visible' absence in snippet implies we depend on status.
    const s = status.toString().toUpperCase();
    return s === "SUSPENDED" || s === "0" || s === "BALL RUNNING"; // encompass common suspended states
  };

  const getSuspendedClass = (status) => {
    return isSuspended(status) ? "suspended" : "";
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
          .mobile-section {
            background: #fff;
            padding: 5px;
            border-radius: 4px;
          }
                      .casino-video-cards {
                        /* Transition handled by specific views */
                      }
                      .teenpatti-new .casino-video-cards.mobile-small {
                       height: auto !important;
                       width: 130px !important; /* 95px cards + 25px grip */
                       top: 120px !important;
                       left: 0 !important; 
                       position: absolute !important;
                       z-index: 2000 !important; 
                       background-color: #111 !important; 
                       padding: 0 !important;
                       border-top-right-radius: 20px !important; 
                       border-bottom-right-radius: 20px !important; 
                       display: flex !important;
                       flex-direction: row-reverse !important; 
                       align-items: center !important; 
                       transition: left 0.3s ease-in-out;
                       pointer-events: auto !important;
                       overflow: hidden !important; 
                       box-shadow: 2px 0 10px rgba(0,0,0,0.5);
                    }
                    .teenpatti-new .casino-video-cards.mobile-small.closed {
                        left: -115px !important; /* Hide 95px cards */
                    }


                     .teenpatti-new .casino-video-cards {
    position: absolute;
    left: 0;
    top: 55%;
    transform: translateY(-50%);
    width: 100px;
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
                    
                    /* Integrated Grip Style (Matched to Image) */
                    .teenpatti-new .casino-video-cards.mobile-small .casino-cards-shuffle {
                        position: relative !important;
                        right: 0 !important;
                        top: 0 !important;
                        transform: none !important;
                        background: transparent !important;
                        width: 25px !important;
                        align-self: stretch; 
                        display: flex !important;
                        align-items: center;
                        justify-content: center;
                        gap: 2px; /* Gap between the two bars */
                        cursor: pointer;
                        pointer-events: auto !important;
                        z-index: 2001 !important;
                        padding: 0 5px !important;
                    }
                    /* The two vertical lines from the image */
                    .teenpatti-new .casino-video-cards.mobile-small .casino-cards-shuffle .grip-line {
                        width: 3px;
                        height: 25px;
                        background: #999; /* Light blue like the image lines */
                        border-radius: 2px;
                    }
                   .teenpatti-new .casino-video-cards.mobile-small .casino-video-cards-container {
                      display: flex !important;
                      flex-direction: column !important;
                      width: 95px !important; /* Increased to prevent card wrapping */
                      padding: 10px 5px !important;
                      gap: 8px;
                   }
                   .teenpatti-new .casino-video-cards.mobile-small .casino-video-cards-container > div {
                      display: flex !important;
                      flex-direction: row !important;
                      gap: 4px;
                   }
                   .casino-video-cards.mobile-small .casino-video-cards-container > div > span {
                       width: 25px !important;
                       height: 35px !important;
                       margin: 0 !important;
                       display: block;
                   }
                   .casino-video-cards.mobile-small .casino-video-cards-container > div > span img {
                       width: 100%;
                       height: 100%;
                       object-fit: contain;
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
                       font-size: 16px !important; /* Reduced icon size */
                   }

        `}
      </style>
      <div className="casino-table teenpatti-new">
        {/* VIDEO SECTION */}
        <CasinoVideo
          gameName="Instant Teenpatti 3.0"
          roundId={currentGame?.mid}
          videoSrc="http://159.65.143.49/~sevennew/storage/front/img/casinoicons/teen33.jpg"
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
                    color: #ccc; /* Changed to grey */
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
                    // flex: 1.2;
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
                    background-color: #ddd; /* Grey bar for label */
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
                    text-transform: uppercase;
                    padding-left: 8px;
                    color: #DDDDDD;
                    margin-right: 0 !important;
                    border-radius: 0 !important; /* No border radius */
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
                   
                   .mobile-odds-box i {
                       font-size: 12px;
                   }
                   
                   /* Increase Video Box Height in Mobile */
                   .video-box-container .video-box {
                       height: 250px !important; /* Increased height */
                   }

                   .mobile-last-results-container {
                    display: flex;
                    justify-content: center; /* Centered */
                    gap: 2px;
                    padding: 8px 5px;
                    background: transparent;
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
                  // .casino-place-bet {
                  //     display: none !important;
                  // }

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
                  .remark-icon {
                      display: flex;
                      align-items: center;
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
                      getOddsBySid(1)?.gstatus
                    )}`}
                    onClick={() =>
                      !isSuspended(getOddsBySid(1)?.gstatus) &&
                      handleOddsClick("Player A Main", getOddsBySid(1)?.b1, 1, true)
                    }
                  >
                    {!isSuspended(getOddsBySid(1)?.gstatus) ? (
                      getOddsBySid(1)?.b1
                    ) : (
                      <i className="fas fa-lock"></i>
                    )}
                  </div>
                  <div
                    className={`mobile-odds-box lay ${getSuspendedClass(
                      getOddsBySid(1)?.gstatus
                    )}`}
                    onClick={() =>
                      !isSuspended(getOddsBySid(1)?.gstatus) &&
                      handleOddsClick("Player A Main", getOddsBySid(1)?.l1, 1, false)
                    }
                  >
                    {!isSuspended(getOddsBySid(1)?.gstatus) ? (
                      getOddsBySid(1)?.l1
                    ) : (
                      <i className="fas fa-lock"></i>
                    )}
                  </div>
                </div>

                {/* Main Player B */}
                <div className="mobile-row">
                  <div className="mobile-row-label">
                    PLAYER B {renderExposure(2)}
                  </div>
                  <div
                    className={`mobile-odds-box back ${getSuspendedClass(
                      getOddsBySid(2)?.gstatus
                    )}`}
                    onClick={() =>
                      !isSuspended(getOddsBySid(2)?.gstatus) &&
                      handleOddsClick("Player B Main", getOddsBySid(2)?.b1, 2, true)
                    }
                  >
                    {!isSuspended(getOddsBySid(2)?.gstatus) ? (
                      getOddsBySid(2)?.b1
                    ) : (
                      <i className="fas fa-lock"></i>
                    )}
                  </div>
                  <div
                    className={`mobile-odds-box lay ${getSuspendedClass(
                      getOddsBySid(2)?.gstatus
                    )}`}
                    onClick={() =>
                      !isSuspended(getOddsBySid(2)?.gstatus) &&
                      handleOddsClick("Player B Main", getOddsBySid(2)?.l1, 2, false)
                    }
                  >
                    {!isSuspended(getOddsBySid(2)?.gstatus) ? (
                      getOddsBySid(2)?.l1
                    ) : (
                      <i className="fas fa-lock"></i>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION: LAST RESULTS */}
              <div className="mobile-section-container">
                {/* <div className="mobile-last-results-container">
                  {lastResults && lastResults.length > 0 ? (
                    <>
                      {lastResults.map((result, i) => {
                        let res = "-";
                        if (result.win == "1") res = "A";
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
                </div> */}
              </div>

              {/* Disclaimer Marquee */}
              <div className="remark-container" style={{ marginTop: "8px", marginBottom: "0" }}>
                <div className="remark-icon">
                  <img
                    src={getImage("remark", "images")}
                    style={{ width: "20px", height: "20px" }}
                    alt="remark"
                  />
                </div>
                <marquee>
                  {gameData?.t1?.[0]?.ramark ||
                    "Play Our New Game Premium Teenpatti 1 Day"}
                </marquee>
              </div>
            </div>
          ) : (
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
                      onClick={() =>
                        !isSuspended(getOddsBySid(1)?.gstatus) &&
                        handleOddsClick(
                          "Player A Main",
                          getOddsBySid(1)?.b1,
                          1,
                          true
                        )
                      }
                      style={{
                        cursor: !isSuspended(getOddsBySid(1)?.gstatus)
                          ? "pointer"
                          : "default",
                      }}
                    >
                      <span className="casino-box-odd">
                        {isSuspended(getOddsBySid(1)?.gstatus) ? (
                          <i className="fas fa-lock"></i>
                        ) : (
                          getOddsBySid(1)?.b1 || "0"
                        )}
                      </span>
                    </div>
                    <div
                      className={`lay casino-bl-box-item ${getSuspendedClass(
                        getOddsBySid(1)?.gstatus
                      )}`}
                      onClick={() =>
                        !isSuspended(getOddsBySid(1)?.gstatus) &&
                        handleOddsClick(
                          "Player A Main",
                          getOddsBySid(1)?.l1,
                          1,
                          false
                        )
                      }
                      style={{
                        cursor: !isSuspended(getOddsBySid(1)?.gstatus)
                          ? "pointer"
                          : "default",
                      }}
                    >
                      <span className="casino-box-odd">
                        {isSuspended(getOddsBySid(1)?.gstatus) ? (
                          <i className="fas fa-lock"></i>
                        ) : (
                          getOddsBySid(1)?.l1 || "0"
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
                      onClick={() =>
                        !isSuspended(getOddsBySid(2)?.gstatus) &&
                        handleOddsClick(
                          "Player B Main",
                          getOddsBySid(2)?.b1,
                          2,
                          true
                        )
                      }
                      style={{
                        cursor: !isSuspended(getOddsBySid(2)?.gstatus)
                          ? "pointer"
                          : "default",
                      }}
                    >
                      <span className="casino-box-odd">
                        {isSuspended(getOddsBySid(2)?.gstatus) ? (
                          <i className="fas fa-lock"></i>
                        ) : (
                          getOddsBySid(2)?.b1 || "0"
                        )}
                      </span>
                    </div>
                    <div
                      className={`lay casino-bl-box-item ${getSuspendedClass(
                        getOddsBySid(2)?.gstatus
                      )}`}
                      onClick={() =>
                        !isSuspended(getOddsBySid(2)?.gstatus) &&
                        handleOddsClick(
                          "Player B Main",
                          getOddsBySid(2)?.l1,
                          2,
                          false
                        )
                      }
                      style={{
                        cursor: !isSuspended(getOddsBySid(2)?.gstatus)
                          ? "pointer"
                          : "default",
                      }}
                    >
                      <span className="casino-box-odd">
                        {isSuspended(getOddsBySid(2)?.gstatus) ? (
                          <i className="fas fa-lock"></i>
                        ) : (
                          getOddsBySid(2)?.l1 || "0"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Result Modal */}
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
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 15px",
                borderBottom: "1px solid #444",
                backgroundColor: "#13624e",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontWeight: "bold",
                  color: "#FFD700",
                  fontSize: "16px",
                }}
              >
                Instant Teenpatti 3.0 Result
              </span>
              <span
                onClick={() => setResultModalOpen(false)}
                style={{
                  cursor: "pointer",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                ✕
              </span>
            </div>

            {/* Content */}
            <div style={{ padding: "15px", backgroundColor: "#333b41" }}>
              {/* Round Info */}
              <div
                style={{ fontSize: "12px", color: "#ccc", marginBottom: "5px" }}
              >
                <div style={{ marginBottom: "3px" }}>
                  Round ID: {modalContent.roundId}
                </div>
                <div>Match Time: {modalContent.matchTime}</div>
              </div>

              <hr style={{ borderColor: "#444", margin: "10px 0" }} />

              {/* Players Split View */}
              <div
                style={{
                  display: "flex",
                  position: "relative",
                  padding: "10px 0",
                }}
              >
                {/* Vertical Divider */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "0",
                    bottom: "0",
                    width: "1px",
                    backgroundColor: "#666",
                    transform: "translateX(-50%)",
                  }}
                ></div>

                {/* Player A */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingRight: "5px",
                  }}
                >
                  {modalContent.playerA.isWinner && (
                    <img
                      src="https://wver.sprintstaticdata.com/v193/static/front/img/winner.png"
                      alt="winner"
                      width="50"
                      style={{ marginRight: "5px" }}
                    />
                  )}
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "16px",
                        color: "#ccc",
                        marginBottom: "5px",
                      }}
                    >
                      Player A
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "3px",
                      }}
                    >
                      {modalContent.playerA.cards.map((c, i) => (
                        <div
                          key={i}
                          style={{
                            width: "25px",
                            backgroundColor: "white",
                            borderRadius: "2px",
                          }}
                        >
                          <img
                            src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${c}.png`}
                            width="100%"
                            alt={c}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Player B */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingLeft: "5px",
                  }}
                >
                  {modalContent.playerB.isWinner && (
                    <img
                      src="https://wver.sprintstaticdata.com/v193/static/front/img/winner.png"
                      alt="winner"
                      width="50"
                      style={{ marginRight: "5px" }}
                    />
                  )}
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "16px",
                        color: "#ccc",
                        marginBottom: "5px",
                      }}
                    >
                      Player B
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "3px",
                      }}
                    >
                      {modalContent.playerB.cards.map((c, i) => (
                        <div
                          key={i}
                          style={{
                            width: "25px",
                            backgroundColor: "white",
                            borderRadius: "2px",
                          }}
                        >
                          <img
                            src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${c}.png`}
                            width="100%"
                            alt={c}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Footer */}
              <div
                style={{
                  marginTop: "15px",
                  backgroundColor: "#2a2a2a",
                  padding: "10px",
                  borderRadius: "0",
                  fontSize: "12px",
                  borderTop: "1px solid #444",
                }}
              >
                <div style={{ display: "flex", marginBottom: "5px" }}>
                  <span
                    style={{
                      width: "100px",
                      color: "#888",
                      textAlign: "right",
                      paddingRight: "10px",
                    }}
                  >
                    Winner
                  </span>
                  <span style={{ color: "#ccc", fontWeight: "bold" }}>
                    {modalContent.playerA.isWinner ? "Player A" : "Player B"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default InstantTeenPatti3;
