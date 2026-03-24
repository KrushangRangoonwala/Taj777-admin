import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Modal from "react-modal";
import { fetchOpenBetsApi, fetchCasinoExposureApi } from "../../api/api";
import useIsMobile from "../../hooks/useIsMobile";
import CasinoVideo from "./components/CasinoVideo";
import { useSelector } from "react-redux";
import { getExposureClass } from "../../utilies/helpers";

const AndarBahar4 = ({ isVisible, onBetSelection, exposureTrigger }) => {
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
      console.log("✅ AndarBahar4 Connected:", socket.id);
      socket.emit("Room", "ab4");
    });

    const handleGameData = (data) => {
      // console.log("AndarBahar4 Game Data:", data);
      const payload = Array.isArray(data) ? data[0] : data;
      if (payload) setGameData(payload);
    };

    socket.on("game", handleGameData);
    socket.on("ab4", handleGameData);

    socket.on("disconnect", (reason) => {
      console.log("⚠️ AndarBahar4 Disconnected:", reason);
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
          markettype: "AB4",
          eventId: cleanedEventId,
          curPageName: "live_ab4.php",
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
          markettype: "AB4",
          main_event_id: gameData.t1[0].mid,
          curPageName: "live_ab4.php",
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

  // Auto-scroll to latest card when new cards appear, ensuring last card is always visible initially
  const andarCardsLength = gameData?.t1?.[0]?.cards?.filter((c, i) => i % 2 !== 0 && c !== "1").length || 0;
  useEffect(() => {
    const timer = setTimeout(() => {
      if (andarScrollRef.current) {
        andarScrollRef.current.scrollLeft = andarScrollRef.current.scrollWidth;
        checkScroll(andarScrollRef, setAndarScrollState);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [andarCardsLength]);

  const baharCardsLength = gameData?.t1?.[0]?.cards?.filter((c, i) => i % 2 === 0 && c !== "1").length || 0;
  useEffect(() => {
    const timer = setTimeout(() => {
      if (baharScrollRef.current) {
        baharScrollRef.current.scrollLeft = baharScrollRef.current.scrollWidth;
        checkScroll(baharScrollRef, setBaharScrollState);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [baharCardsLength]);

  const getExposure = (marketId) => {
    if (!Array.isArray(exposureData)) return 0;
    const market = exposureData.find((item) => item.market_id == marketId);
    return market ? market.win_loss || market.total_exposure : 0;
  };

  const renderExposure = (marketId) => {
    const exposure = getExposure(marketId);
    if (exposure === 0) return null;
    return (
      <div className={`casino-book ${getExposureClass(exposure)}`}>
        {exposure}
      </div>
    );
  };

  useEffect(() => {
    // Clear open bets when mid changes (round end)
    setOpenBets([]);
  }, [gameData?.t1?.[0]?.mid]);

  const getCardImage = (cardCode) => {
    if (!cardCode || cardCode === "0" || cardCode === "1") return "/assets/cards_new/1.png";

    let code = String(cardCode).toUpperCase();

    // 1. Mapping for IDs 1-52 (Sprints format)
    const id = parseInt(code, 10);
    if (!isNaN(id) && id >= 1 && id <= 52 && String(id) === code) {
      const suites = ["S", "H", "C", "D"];
      const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
      const suiteIndex = Math.floor((id - 1) / 13);
      const valueIndex = (id - 1) % 13;
      const suit = suites[suiteIndex];
      const val = values[valueIndex];
      return `/assets/cards_new/${val}${suit}${suit}.png`;
    }

    // 2. Mapping for codes like "1s", "10h", "AS", "11d", etc.
    const match = code.match(/^(\d+|[AJQK])([SHDC])([SHDC])?$/);
    if (match) {
      let val = match[1];
      const suit = match[2];
      if (val === "1") val = "A";
      else if (val === "11") val = "J";
      else if (val === "12") val = "Q";
      else if (val === "13") val = "K";
      return `/assets/cards_new/${val}${suit}${suit}.png`;
    }

    // 3. Fallback for single values
    if (code === "11") code = "J";
    else if (code === "12") code = "Q";
    else if (code === "13") code = "K";
    else if (code === "1") code = "A";

    return `/assets/cards_new/${code}.png`;
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
  const isAndarAllZero = gameData?.t3?.slice(0, 13).every(item => item.b1 == 0 || item.b1 === "0.00");
  const isBaharAllZero = gameData?.t3?.slice(13, 26).every(item => item.b1 == 0 || item.b1 === "0.00");

  // Lock Logic: content locked if game suspended OR if next card side matches OR all cards are 0
  // User update: Bahar always open unless suspended. Andar locked if side is Andar.
  const isAndarLocked = isGameSuspended || nextCardInfo.side === "Andar" || isAndarAllZero;
  const isBaharLocked = isGameSuspended || isBaharAllZero;

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
      const scrollAmount = ref.current.clientWidth;
      if (direction === "left") {
        ref.current.scrollLeft -= scrollAmount;
      } else {
        ref.current.scrollLeft += scrollAmount;
      }
      setTimeout(() => checkScroll(ref, setState), 400);
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
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @media only screen and (max-width: 767px) {
          .andar-bahar-4 .casino-video {
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


      <div className="casino-table andar-bahar andar-bahar-4">
        {/* VIDEO SECTION */}
        <CasinoVideo
          gameName="ANDAR BAHAR 150 CARDS"
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
        {isMobileView && (
          <div
            className="casino-video-cards-static-mobile"
            style={{
              width: "100%",
              backgroundColor: "#333",
              borderBottom: "1px solid #444",
              borderTop: "1px solid #444",
              padding: "5px 10px", // Reduced vertical padding
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "5px",
              marginBottom: "0", // Flush with betting section
            }}
          >
            {/* Note: Removed shuffle/grip icon as it is now static */}

            <div
              className="casino-video-cards-container"
              style={{ width: "100%", padding: "0" }}
            >
              {/* Next Card Count - Centered */}
              <div
                className="text-center mb-2"
                style={{
                  // borderBottom: "1px solid #444",
                  paddingBottom: "5px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "5px", // Add small gap between label and value
                }}
              >
                <span
                  style={{
                    color: "#aaa",
                    fontSize: "10px",
                    // fontWeight: "bold",
                  }}
                >
                  Next Card Count:
                </span>
                <span
                  style={{
                    color: "#ffc107",
                    fontSize: "10px",
                    // fontWeight: "bold",
                  }}
                >
                  {nextCardInfo.text}
                </span>
              </div>

              {/* ANDAR ROW */}
              <div
                className="d-flex align-items-center mb-1"
                style={{
                  height: "40px",
                  display: nextCardInfo.showAndar ? "flex" : "none",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "50px",
                    color: "#aaafb5",
                    fontWeight: "bold",
                    fontSize: "12px",
                    // textAlign removed as per user edit or keep default
                  }}
                >
                  ANDAR
                </div>

                {/* Cards Area */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    // flex: 1 removed to prevent expansion
                    justifyContent: "flex-start", // Align close to label
                    gap: "5px",
                  }}
                >
                  {/* Left Arrow */}
                  {gameData?.t1?.[0]?.cards?.filter(
                    (cardCode, i) => i % 2 !== 0 && cardCode !== "1"
                  ).length > 3 && (
                      <div
                        style={{
                          padding: "5px",
                          cursor: andarScrollState.canScrollLeft ? "pointer" : "default",
                          color: "#fff",
                          backgroundColor: "#222",
                          borderRadius: "2px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: andarScrollState.canScrollLeft ? 1 : 0.5,
                        }}
                        onClick={() => andarScrollState.canScrollLeft && scrollCards("left", andarScrollRef, setAndarScrollState)}
                      >
                        <FaChevronLeft size={10} />
                      </div>
                    )}

                  {/* Cards Container */}
                  <div
                    ref={andarScrollRef}
                    onScroll={() => checkScroll(andarScrollRef, setAndarScrollState)}
                    className="d-flex hide-scrollbar"
                    style={{
                      width: "90px", // 3 cards width
                      gap: "4px",
                      scrollBehavior: "smooth",
                      overflowX: "auto",
                      whiteSpace: "nowrap",
                      justifyContent: "flex-start", // Start from left
                      scrollSnapType: "x mandatory",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    {gameData?.t1?.[0]?.cards?.filter(
                      (cardCode, i) => i % 2 !== 0 && cardCode !== "1"
                    ).length > 0 ? (
                      gameData.t1[0].cards
                        .filter(
                          (cardCode, i) => i % 2 !== 0 && cardCode !== "1"
                        )
                        .map((cardCode, idx) => (
                          <img
                            key={idx}
                            src={getCardImage(cardCode)}
                            alt={cardCode}
                            style={{
                              height: "38px",
                              width: "auto",
                              flexShrink: 0,
                              borderRadius: "2px",
                              scrollSnapAlign: "start",
                            }}
                          />
                        ))
                    ) : (
                      // Placeholder to maintain height
                      <div
                        style={{
                          height: "38px",
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#555",
                          fontSize: "10px",
                        }}
                      >
                        No Cards
                      </div>
                    )}
                  </div>

                  {/* Right Arrow */}
                  {gameData?.t1?.[0]?.cards?.filter(
                    (cardCode, i) => i % 2 !== 0 && cardCode !== "1"
                  ).length > 3 && (
                      <div
                        style={{
                          padding: "5px",
                          cursor: andarScrollState.canScrollRight ? "pointer" : "default",
                          color: "#fff",
                          backgroundColor: "#222",
                          borderRadius: "2px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: andarScrollState.canScrollRight ? 1 : 0.5,
                        }}
                        onClick={() => andarScrollState.canScrollRight && scrollCards("right", andarScrollRef, setAndarScrollState)}
                      >
                        <FaChevronRight size={10} />
                      </div>
                    )}
                </div>
              </div>

              {/* BAHAR ROW */}
              <div
                className="d-flex align-items-center"
                style={{
                  height: "40px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "50px",
                    color: "#aaafb5",
                    fontWeight: "bold",
                    fontSize: "12px",
                    textAlign: "left",
                  }}
                >
                  BAHAR
                </div>

                {/* Cards Area */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    // flex: 1 removed
                    justifyContent: "flex-start",
                    gap: "5px",
                  }}
                >
                  {/* Left Arrow */}
                  {gameData?.t1?.[0]?.cards?.filter(
                    (cardCode, i) => i % 2 === 0 && cardCode !== "1"
                  ).length > 3 && (
                      <div
                        style={{
                          padding: "5px",
                          cursor: baharScrollState.canScrollLeft ? "pointer" : "default",
                          color: "#fff",
                          backgroundColor: "#222",
                          borderRadius: "2px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: baharScrollState.canScrollLeft ? 1 : 0.5,
                        }}
                        onClick={() => baharScrollState.canScrollLeft && scrollCards("left", baharScrollRef, setBaharScrollState)}
                      >
                        <FaChevronLeft size={10} />
                      </div>
                    )}

                  {/* Cards Container */}
                  <div
                    ref={baharScrollRef}
                    onScroll={() => checkScroll(baharScrollRef, setBaharScrollState)}
                    className="d-flex hide-scrollbar"
                    style={{
                      width: "90px", // 3 cards width
                      gap: "4px",
                      scrollBehavior: "smooth",
                      overflowX: "auto",
                      whiteSpace: "nowrap",
                      justifyContent: "flex-start",
                      scrollSnapType: "x mandatory",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    {gameData?.t1?.[0]?.cards?.filter(
                      (cardCode, i) => i % 2 === 0 && cardCode !== "1"
                    ).length > 0 ? (
                      gameData.t1[0].cards
                        .filter(
                          (cardCode, i) => i % 2 === 0 && cardCode !== "1"
                        )
                        .map((cardCode, idx) => (
                          <img
                            key={idx}
                            src={getCardImage(cardCode)}
                            alt={cardCode}
                            style={{
                              height: "38px",
                              width: "auto",
                              flexShrink: 0,
                              borderRadius: "2px",
                              borderBottom:
                                cardCode === "1" ? "2px solid red" : "none", // Keep red underline logic if needed
                              scrollSnapAlign: "start",
                            }}
                          />
                        ))
                    ) : (
                      <div
                        style={{
                          height: "38px",
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#555",
                          fontSize: "10px",
                        }}
                      >
                        No Cards
                      </div>
                    )}
                  </div>
                  {/* Right Arrow */}
                  {gameData?.t1?.[0]?.cards?.filter(
                    (cardCode, i) => i % 2 === 0 && cardCode !== "1"
                  ).length > 3 && (
                      <div
                        style={{
                          padding: "5px", // Consistent padding
                          cursor: baharScrollState.canScrollRight ? "pointer" : "default",
                          color: "#fff",
                          backgroundColor: "#222",
                          borderRadius: "2px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: baharScrollState.canScrollRight ? 1 : 0.5,
                        }}
                        onClick={() => baharScrollState.canScrollRight && scrollCards("right", baharScrollRef, setBaharScrollState)}
                      >
                        <FaChevronRight size={10} />
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="casino-detail">
          <div
            className="casino-video-cards d-none-big"
            style={{ display: "none" }}
          >
            {/* Mobile cards view - hidden for now as per design */}
          </div>

          <div>
            <div className="ab-bg" style={{ position: "relative", display: "flex", gap: "10px" }}>
              {/* Andar Section */}
              <div
                className="andar-cards-box text-center"
                style={{ position: "relative", flex: 1 }}
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
                      style={{ width: "15px", height: "15px", filter: isLight ? "" : "brightness(0) invert(1)" }}
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
                style={{ position: "relative", flex: 1 }}
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
                      style={{ width: "15px", height: "15px", filter: isLight ? "" : "brightness(0) invert(1)" }}
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
      </div>
    </>
  );
};

export default AndarBahar4;
