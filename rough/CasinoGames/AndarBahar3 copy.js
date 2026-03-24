// video cards are proper aligned
import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Modal from "react-modal";
import { fetchOpenBetsApi, fetchCasinoExposureApi } from "../../api/api";
import useIsMobile from "../../hooks/useIsMobile";
import CasinoVideo from "./components/CasinoVideo";
import { useSelector } from "react-redux";

const AndarBahar3 = ({ isVisible, onBetSelection, exposureTrigger }) => {
  const [gameData, setGameData] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [openBets, setOpenBets] = useState([]);
  const [exposureData, setExposureData] = useState([]);
  const [isMyBetsModalOpen, setIsMyBetsModalOpen] = useState(false);
  const [andarScrollState, setAndarScrollState] = useState({ canScrollLeft: false, canScrollRight: true });
  const [baharScrollState, setBaharScrollState] = useState({ canScrollLeft: false, canScrollRight: true });
  const socketRef = useRef(null);
  const andarScrollRef = useRef(null);
  const baharScrollRef = useRef(null);
  const isMobileView = useIsMobile();
  const isLight = useSelector(state => state.action.theme) === "light";

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

  useEffect(() => {
    const socket = io("https://trubet9.bet:2053", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ AndarBahar3 Connected:", socket.id);
      socket.emit("Room", "ab3");
    });

    const handleGameData = (data) => {
      // console.log("AndarBahar3 Game Data:", data);
      const payload = Array.isArray(data) ? data[0] : data;
      if (payload) setGameData(payload);
    };

    socket.on("game", handleGameData);
    socket.on("ab3", handleGameData);

    socket.on("disconnect", (reason) => {
      console.log("⚠️ AndarBahar3 Disconnected:", reason);
      if (reason === "io server disconnect") socket.connect();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    // Load Open Bets
    const loadOpenBets = async () => {
      const currentEventId = gameData?.t1?.[0]?.mid || "1";
      const cleanedEventId =
        currentEventId.toString().split(".")[1] || currentEventId;

      try {
        const res = await fetchOpenBetsApi({
          markettype: "AB3",
          eventId: cleanedEventId,
          curPageName: "live_ab3.php",
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

  useEffect(() => {
    const fetchExposure = async () => {
      if (!gameData?.t1?.[0]?.mid) return;
      try {
        const response = await fetchCasinoExposureApi({
          markettype: "AB3",
          main_event_id: gameData.t1[0].mid,
          curPageName: "live_ab3.php",
        });
        if (Array.isArray(response?.data)) {
          setExposureData(response.data);
        }
      } catch (error) {
        console.error("Error fetching exposure:", error);
      }
    };
    fetchExposure();
  }, [gameData?.t1?.[0]?.mid, exposureTrigger]);

  const checkScroll = (ref, setState) => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      setState({
        canScrollLeft: scrollLeft > 0,
        canScrollRight: Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2 // small buffer for pixel rounding
      });
    }
  };

  // Auto-scroll to latest card when new cards appear, ONLY if the user hasn't scrolled away from the right edge
  useEffect(() => {
    if (andarScrollRef.current && !andarScrollState.canScrollRight) {
      andarScrollRef.current.scrollLeft = andarScrollRef.current.scrollWidth;
      checkScroll(andarScrollRef, setAndarScrollState);
    }
  }, [gameData?.t1?.[0]?.cards]);

  useEffect(() => {
    if (baharScrollRef.current && !baharScrollState.canScrollRight) {
      baharScrollRef.current.scrollLeft = baharScrollRef.current.scrollWidth;
      checkScroll(baharScrollRef, setBaharScrollState);
    }
  }, [gameData?.t1?.[0]?.cards]);

  const getExposure = (marketId) => {
    if (!Array.isArray(exposureData)) return 0;
    const market = exposureData.find((item) => item.market_id == marketId);
    return market ? market.win_loss || market.total_exposure : 0;
  };

  const renderExposure = (marketId) => {
    const exposure = getExposure(marketId);
    if (exposure === 0) return null;
    return (
      <div className="casino-book" style={{ color: exposure >= 0 ? "#1eb404" : "red", fontSize: '10px', fontWeight: 'bold' }}>
        {exposure}
      </div>
    );
  };

  useEffect(() => {
    // Clear open bets when mid changes (round end)
    setOpenBets([]);
  }, [gameData?.t1?.[0]?.mid]);

  const getCardImage = (cardCode) => {
    if (!cardCode || cardCode === "1")
      return "https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png";
    return `https://wver.sprintstaticdata.com/v190/static/front/img/cards/${cardCode}.png`;
  };

  const getSuspendedClass = (status) =>
    status === "SUSPENDED" || status === "suspended" ? "suspended" : "";

  const getTimerColorClass = () => {
    const timerValue = parseInt(gameData?.t1?.[0]?.autotime) || 0;
    if (timerValue <= 5) return "red";
    if (timerValue <= 10) return "orange";
    return "green";
  };

  const getNextCardInfo = () => {
    const rawNat = gameData?.t2?.[0]?.nat || "";
    // Extract number from "Card 23" -> 23
    const match = rawNat.match(/(\d+)/);
    const count = match ? parseInt(match[0], 10) : 0;

    // Default fallback
    if (!count) return { text: "-", showAndar: true, showBahar: true };

    const isOdd = count % 2 !== 0;
    // Odd -> Bahar, Even -> Andar
    const side = isOdd ? "Bahar" : "Andar";

    return {
      text: `${count}/${side}`,
      count: count,
      side: side, // Expose side for locking logic
      showAndar: isOdd, // Show Andar only if it's Bahar (Odd)
      showBahar: true, // Always show Bahar
    };
  };

  const nextCardInfo = getNextCardInfo();
  const isGameSuspended = gameData?.t2?.[0]?.gstatus === "SUSPENDED";

  // Lock Logic: content locked if game suspended OR if next card side matches
  // User update: Bahar always open unless suspended. Andar locked if side is Andar.
  const isAndarLocked = isGameSuspended || nextCardInfo.side === "Andar";
  const isBaharLocked = isGameSuspended;

  const mapNatToImageIndex = (nat) => {
    if (!nat) return 1;
    const parts = nat.split(" ");
    const val = parts[parts.length - 1];
    const map = {
      A: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      10: 10,
      J: 11,
      Q: 12,
      K: 13,
    };
    return map[val] || 1;
  };

  const scrollCards = (direction, ref, setState) => {
    if (ref.current) {
      const scrollAmount = 100;
      if (direction === "left") {
        ref.current.scrollLeft -= scrollAmount;
      } else {
        ref.current.scrollLeft += scrollAmount;
      }
      setTimeout(() => checkScroll(ref, setState), 350);
    }
  };

  const handleBet = (item, side) => {
    if (item.gstatus === "SUSPENDED" || item.b1 == 0 || item.b1 === "0.00")
      return;

    if (onBetSelection) {
      onBetSelection({
        ...item,
        odds: item.b1,
        name: `${item.nat}/${nextCardInfo.count}`,
        teamName: `${item.nat}/${nextCardInfo.count}`,
        eventId: gameData?.t1?.[0]?.mid,
        marketId: item.sid,
        minBet: gameData?.t1?.[0]?.min,
        maxBet: gameData?.t1?.[0]?.max,
        isBack: true, // Default to back for these cards
        side: side, // Add side information
        cardCount: nextCardInfo.count, // Pass card count for title
      });
    }
  };

  return (
    <>
      <style>{`
        @media only screen and (max-width: 767px) {
          .andar-bahar-3 .casino-video {
            // min-height: 250px !important;
          }
          .casino-video-right-icons {
            flex-direction: column !important;
            right: 3px !important;
            top: 5px !important;
          }
          .casino-video-home-icon,
          .casino-video-rules-icon {
            height: 25px !important;
            width: 25px !important;
            margin-right: 0 !important;
            margin-bottom: 5px !important;
          }
          .casino-video-home-icon i,
          .casino-video-rules-icon i {
            font-size: 16px !important;
          }
        }
      `}</style>
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
                    <span style={{ color: "white" }}>{bet.market_name}</span>
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

      {isMobileView && openBets.length > 0 && (
        <div
          onClick={() => setIsMyBetsModalOpen(true)}

        >
          <span
            style={{ color: "white", fontWeight: "bold", fontSize: "16px" }}
          >
            {openBets.length}
          </span>
        </div>
      )}

      <div className="casino-table andar-bahar andar-bahar-3">
        {/* VIDEO SECTION */}
        <CasinoVideo
          gameName="ANDAR BAHAR 50 CARDS"
          roundId={currentGame?.mid}
          videoSrc="https://casino.diamondcricketid.com/swiftdizire/?id=3079"
          // isCardDrawerOpen={isDrawerOpen}
          // setIsCardDrawerOpen={setIsDrawerOpen}
          autotime={currentGame?.autotime}
          totalTime={currentGame?.ft}
        // cards={[currentGame?.C1, currentGame?.C2, currentGame?.C3, currentGame?.C4, currentGame?.C5, currentGame?.C6]}
        // CardsComponent={VideoCards}
        // isRuleIcon={false}
        />
        {/* REFACTORED STATIC CARD DISPLAY (Moved Below Video) */}
        <div className="casino-detail">
          {isMobileView && (
            <div className="casino-video-cards d-none-big">
              <style>
                {`
.andar-bahar-3 .lastCards img, .andar-bahar-4 .lastCards img {
    width: 27px;
}
    
  [type=button],
button {
    -webkit-appearance: button;
}

[type=button]:not(:disabled),
button:not(:disabled) {
    cursor: pointer;
}

.row {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    margin-right: -15px;
    margin-left: -15px;
}

.col-12,
.col-2,
.col-6 {
    position: relative;
    width: 100%;
    padding-right: 15px;
    padding-left: 15px;
}

.col-2 {
    -ms-flex: 0 0 16.666667%;
    flex: 0 0 16.666667%;
    max-width: 16.666667%;
}

.col-6 {
    -ms-flex: 0 0 50%;
    flex: 0 0 50%;
    max-width: 50%;
}

.col-12 {
    -ms-flex: 0 0 100%;
    flex: 0 0 100%;
    max-width: 100%;
}

.justify-content-center {
    -ms-flex-pack: center !important;
    justify-content: center !important;
}

.align-items-center {
    -ms-flex-align: center !important;
    align-items: center !important;
}

.mt-1 {
    margin-top: .25rem !important;
}

.text-center {
    text-align: center !important;
}

.text-warning {
    color: #ffc107 !important;
}

.row.row5 {
    margin-left: -5px;
    margin-right: -5px;
}

.row.row5>[class*="col-"],
.row.row5>[class*="col"] {
    padding-left: 5px;
    padding-right: 5px;
}

.casino-video-cards {
    display: inline-block;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    display: -webkit-flex;
    flex-wrap: wrap;
    background-color: rgba(0, 0, 0, 0.6);
    padding: 5px 20px 5px 5px;
    display: inline-block;
    height: 155px;
    overflow: hidden;
    transition: all 1s;
    width: 195px;
    border-radius: 0 8px 8px 0;
    display: flex;
    align-items: center;
}

.casino-video-cards-container {
    width: 100%;
    overflow: hidden;
    display: flex;
    display: -webkit-flex;
    flex-wrap: wrap;
    flex-direction: column;
}

.casino-video-cards-container>div {
    display: flex;
    display: -webkit-flex;
    flex-wrap: nowrap;
    width: 100%;
    margin-bottom: 5px;
}

.casino-video-cards-container>div:last-child {
    margin-bottom: 0;
}

.andar-bahar .casino-video-cards {
    width: 230px;
    height: 130px;
}

.andar-bahar .casino-video-cards-container>div {
    flex-wrap: wrap;
}

.andar-bahar-3 .casino-video-cards-container>div {
    flex-wrap: nowrap;
}

.lastCards-container {
    width: 60% !important;
    margin: 0 auto;
}

.lastCards .hooper-track {
    margin: 0 auto;
}

.lastCards .hooper-next {
    left: -35px !important;
    padding: 5px !important;
}

.lastCards .hooper-prev {
    right: -35px !important;
    padding: 5px !important;
}

.lastCards img {
    height: auto;
    width: 32px;
}

.andar-bahar-3 .lastCards img {
    width: 27px;
}

.next-count {
    font-size: 12px;
}

@media only screen and (min-width: 1280px) and (max-width: 1599px) {
    .casino-video-cards {
        width: 172px;
        height: 135px;
    }
}

@media only screen and (min-width: 320px) and (max-width: 767px) {
    .casino-video-cards span {
        line-height: 16px;
    }

    .casino-video-cards {
        top: 80px;
        transform: unset;
        width: 95px;
        padding: 5px 10px 5px 5px;
        height: 75px;
    }

    .andar-bahar .casino-video-cards {
        height: 80px;
        width: 140px;
    }

    .andar-bahar .casino-video-cards .next-count {
        font-size: 10px;
    }

    .andar-bahar-3 .casino-detail .casino-video-cards {
        height: auto;
        position: relative;
        top: 0;
        width: 100%;
        background-color: #444;
    }

    .lastCards img {
        height: auto;
        width: 22px;
    }

    .lastCards .hooper-next {
        left: -26px !important;
        padding: 0px !important;
    }

    .lastCards .hooper-prev {
        right: -26px !important;
        padding: 0px !important;
    }
}

@media only screen and (min-width: 768px) and (max-width: 1279px) {
    .casino-video-cards {
        width: 172px;
        height: 135px;
    }
}

@media only screen and (min-width: 768px) {
    .d-none-big {
        display: none !important;
    }
}

@media only screen and (min-width: 1280px) {
    .d-none-big {
        display: none !important;
    }
}

.hooper-navigation button {
    background-color: #00000050;
}

.hooper-navigation button svg {
    fill: #fff;
}

.hooper {
    height: auto !important;
}

.hooper-slide {
    flex-shrink: 0;
    height: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
}

.hooper-next,
.hooper-prev {
    background-color: transparent;
    border: none;
    padding: 1em;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
}

.hooper-prev.is-disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.hooper-next {
    right: 0;
}

.hooper-prev {
    left: 0;
}

.hooper-navigation.is-rtl .hooper-prev {
    left: auto;
    right: 0;
}

.hooper-navigation.is-rtl .hooper-next {
    right: auto;
    left: 0;
}

.hooper {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 200px;
}

.hooper * {
    box-sizing: border-box;
}

.hooper-list {
    overflow: hidden;
    width: 100%;
    height: 100%;
}

.hooper-track {
    display: flex;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
}

.hooper.is-rtl {
    direction: rtl;
}

.hooper-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}
              `}
              </style>
              <div className="casino-video-cards-container">
                <div className="row row5">
                  <div className="col-12 text-center next-count">
                    Next Card Count:
                    <span className="text-warning"> {nextCardInfo.text}</span>
                  </div>
                </div>
                <div className="row row5 align-items-center justify-content-center">
                  <div className="col-2">
                    <div className="row row5">
                      <div className="col-12"><b>ANDAR</b></div>
                    </div>
                    <div className="row row5">
                      <div className="col-12"><b>BAHAR</b></div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card-inner" style={{ display: nextCardInfo.showAndar ? "block" : "none" }}>
                      <div className="row row5">
                        <div className="col-12">
                          <div className="lastCards-container">
                            <section tabIndex="0" className="lastCards hooper is-rtl">
                              <div className="hooper-list">
                                <ul
                                  className="hooper-track"
                                  style={{
                                    transform: "translate(0px, 0px)",
                                    display: "flex",
                                    overflowX: "hidden",
                                    scrollBehavior: "smooth",
                                    margin: 0,
                                    padding: 0,
                                    listStyleType: "none"
                                  }}
                                  ref={andarScrollRef}
                                  onScroll={() => checkScroll(andarScrollRef, setAndarScrollState)}
                                >
                                  {gameData?.t1?.[0]?.cards?.filter(
                                    (cardCode, i) => i % 2 !== 0 && cardCode !== "1"
                                  ).length > 0 ? (
                                    gameData.t1[0].cards
                                      .filter((cardCode, i) => i % 2 !== 0 && cardCode !== "1")
                                      .map((cardCode, idx) => (
                                        <li key={idx} className="hooper-slide is-active" style={{ width: "37.2969px", flexShrink: 0 }}>
                                          <img src={getCardImage(cardCode)} alt={cardCode} />
                                        </li>
                                      ))
                                  ) : (
                                    <li style={{ height: "38px", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: "10px", width: "100%" }}>
                                      No Cards
                                    </li>
                                  )}
                                </ul>
                                {gameData?.t1?.[0]?.cards?.filter((cardCode, i) => i % 2 !== 0 && cardCode !== "1").length > 3 && (
                                  <div className="hooper-navigation is-rtl">
                                    <button
                                      type="button"
                                      className={`hooper-prev ${!andarScrollState.canScrollRight ? 'is-disabled' : ''}`}
                                      onClick={() => andarScrollState.canScrollRight && scrollCards("right", andarScrollRef, setAndarScrollState)}
                                    >
                                      <svg className="icon icon-arrowRight" viewBox="0 0 24 24" width="24px" height="24px">
                                        <title>Arrow Right</title>
                                        <path d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path>
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      className={`hooper-next ${!andarScrollState.canScrollLeft ? 'is-disabled' : ''}`}
                                      onClick={() => andarScrollState.canScrollLeft && scrollCards("left", andarScrollRef, setAndarScrollState)}
                                    >
                                      <svg className="icon icon-arrowLeft" viewBox="0 0 24 24" width="24px" height="24px">
                                        <title>Arrow Left</title>
                                        <path d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"></path>
                                      </svg>
                                    </button>
                                  </div>
                                )}
                                <div aria-live="polite" aria-atomic="true" className="hooper-liveregion hooper-sr-only">
                                  Item 1 of {gameData?.t1?.[0]?.cards?.filter((cardCode, i) => i % 2 !== 0 && cardCode !== "1").length || 0}
                                </div>
                              </div>
                            </section>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-inner">
                      <div className="row row5 mt-1">
                        <div className="col-12">
                          <div className="lastCards-container">
                            <section tabIndex="0" className="lastCards hooper is-rtl">
                              <div className="hooper-list">
                                <ul
                                  className="hooper-track"
                                  style={{
                                    transform: "translate(0px, 0px)",
                                    display: "flex",
                                    overflowX: "hidden",
                                    scrollBehavior: "smooth",
                                    margin: 0,
                                    padding: 0,
                                    listStyleType: "none"
                                  }}
                                  ref={baharScrollRef}
                                  onScroll={() => checkScroll(baharScrollRef, setBaharScrollState)}
                                >
                                  {gameData?.t1?.[0]?.cards?.filter(
                                    (cardCode, i) => i % 2 === 0 && cardCode !== "1"
                                  ).length > 0 ? (
                                    gameData.t1[0].cards
                                      .filter((cardCode, i) => i % 2 === 0 && cardCode !== "1")
                                      .map((cardCode, idx) => (
                                        <li key={idx} className="hooper-slide is-active" style={{ width: "37.2969px", flexShrink: 0 }}>
                                          <img
                                            src={getCardImage(cardCode)}
                                            alt={cardCode}
                                            style={{ borderBottom: cardCode === "1" ? "2px solid red" : "none" }}
                                          />
                                        </li>
                                      ))
                                  ) : (
                                    <li style={{ height: "38px", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: "10px", width: "100%" }}>
                                      No Cards
                                    </li>
                                  )}
                                </ul>
                                {gameData?.t1?.[0]?.cards?.filter((cardCode, i) => i % 2 === 0 && cardCode !== "1").length > 3 && (
                                  <div className="hooper-navigation is-rtl">
                                    <button
                                      type="button"
                                      className={`hooper-prev ${!baharScrollState.canScrollRight ? 'is-disabled' : ''}`}
                                      onClick={() => baharScrollState.canScrollRight && scrollCards("right", baharScrollRef, setBaharScrollState)}
                                    >
                                      <svg className="icon icon-arrowRight" viewBox="0 0 24 24" width="24px" height="24px">
                                        <title>Arrow Right</title>
                                        <path d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path>
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      className={`hooper-next ${!baharScrollState.canScrollLeft ? 'is-disabled' : ''}`}
                                      onClick={() => baharScrollState.canScrollLeft && scrollCards("left", baharScrollRef, setBaharScrollState)}
                                    >
                                      <svg className="icon icon-arrowLeft" viewBox="0 0 24 24" width="24px" height="24px">
                                        <title>Arrow Left</title>
                                        <path d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"></path>
                                      </svg>
                                    </button>
                                  </div>
                                )}
                                <div aria-live="polite" aria-atomic="true" className="hooper-liveregion hooper-sr-only">
                                  Item 1 of {gameData?.t1?.[0]?.cards?.filter((cardCode, i) => i % 2 === 0 && cardCode !== "1").length || 0}
                                </div>
                              </div>
                            </section>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          )}

          <div
            className="casino-video-cards d-none-big"
            style={{ display: "none" }}
          >
            {/* Mobile cards view - hidden for now as per design */}
          </div>

          <div>
            <div className="ab-bg" style={{ position: "relative" }}>
              {/* Andar Section */}
              <div
                className="andar-cards-box text-center"
                style={{ position: "relative" }}
              >
                {isAndarLocked && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background: isLight ? "#d6dedbd6" : "rgba(0,0,0,0.6)",
                      zIndex: 10,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "8px",
                    }}
                  >
                    <img
                      src="/assets/images/lock.svg"
                      alt="Locked"
                      className="ab-lock-icon"
                      style={{ width: "20px", height: "20px", filter: isLight ? "" : "brightness(0) invert(1)" }}
                    />
                  </div>
                )}
                <h5
                  className="w-100 text-center text-playera"
                  style={{
                    fontSize: isMobileView ? "16px" : "18px",
                    fontWeight: 400,
                    margin: "5px 0",
                  }}
                >
                  Andar
                </h5>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "4px",
                    maxWidth: "100%",
                    margin: "0 auto",
                  }}
                >
                  {gameData?.t3?.slice(0, 13).map((item) => (
                    <div
                      key={item.sid}
                      onClick={() => handleBet(item, "ANDAR")}
                      className={`casino-card-item ${getSuspendedClass(
                        item.gstatus
                      )} ${item.b1 == 0 || item.b1 === "0.00" ? "card-closed" : ""
                        }`}
                      style={{ flex: isMobileView ? "0 0 14%" : "0 0 16.2%", cursor: "pointer" }}
                    >
                      <div className="card-odds" style={{ fontSize: isMobileView ? "13px" : "14px", color: isLight ? "#333" : "#aaafb5" }}>{item.l1}</div>
                      <div className="card-image">
                        <img
                          src={
                            item.b1 == 0 || item.b1 === "0.00"
                              ? "https://wver.sprintstaticdata.com/v193/static/front/img/andar-bahar-cards/0.png"
                              : `https://wver.sprintstaticdata.com/v66/static/front/img/andar-bahar-cards/${mapNatToImageIndex(
                                item.nat
                              )}.png`
                          }
                          alt="card"
                          style={{ height: isMobileView ? "40px" : "60px", width: "auto" }}
                        />
                      </div>
                      {renderExposure(item.sid)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bahar Section */}
              <div
                className="bahar-cards-box text-center"
                style={{ position: "relative" }}
              >
                {isBaharLocked && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background: isLight ? "#d6dedbd6" : "rgba(0,0,0,0.6)",
                      zIndex: 10,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "8px",
                    }}
                  >
                    <img
                      src="/assets/images/lock.svg"
                      alt="Locked"
                      className="ab-lock-icon"
                      style={{ width: "20px", height: "20px", filter: isLight ? "" : "brightness(0) invert(1)" }}
                    />
                  </div>
                )}
                <h5
                  className="w-100 text-center text-playerb"
                  style={{
                    fontSize: isMobileView ? "16px" : "18px",
                    fontWeight: 400,
                    margin: "5px 0",
                  }}
                >
                  Bahar
                </h5>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "4px",
                    maxWidth: "100%",
                    margin: "0 auto",
                  }}
                >
                  {gameData?.t3?.slice(13, 26).map((item) => (
                    <div
                      key={item.sid}
                      onClick={() => handleBet(item, "BAHAR")}
                      className={`casino-card-item ${getSuspendedClass(
                        item.gstatus
                      )} ${item.b1 == 0 || item.b1 === "0.00" ? "card-closed" : ""
                        }`}
                      style={{ flex: isMobileView ? "0 0 14%" : "0 0 16.2%", cursor: "pointer" }}
                    >
                      <div className="card-odds" style={{ fontSize: isMobileView ? "13px" : "14px", color: isLight ? "#333" : "#aaafb5" }}>{item.l1}</div>
                      <div className="card-image">
                        <img
                          src={
                            item.b1 == 0 || item.b1 === "0.00"
                              ? "https://wver.sprintstaticdata.com/v193/static/front/img/andar-bahar-cards/0.png"
                              : `https://wver.sprintstaticdata.com/v66/static/front/img/andar-bahar-cards/${mapNatToImageIndex(
                                item.nat
                              )}.png`
                          }
                          alt="card"
                          style={{ height: isMobileView ? "40px" : "60px", width: "auto" }}
                        />
                      </div>
                      {renderExposure(item.sid)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    </>
  );
};

export default AndarBahar3;
