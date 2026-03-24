import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { fetchOpenBetsApi, fetchCasinoExposureApi } from "../../api/api";
import useIsMobile from "../../hooks/useIsMobile";
import Modal from "react-modal";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { BiSolidLock } from "react-icons/bi";
import Placebet_Common from "./Placebet_Common";
import CasinoVideo from "./components/CasinoVideo";
import { useSelector } from "react-redux";
import { getIsSuspended } from "../../utilies/helpers";


const AndarBahar2 = ({ isVisible, onBetSelection, exposureTrigger }) => {
  const [gameData, setGameData] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [openBets, setOpenBets] = useState([]);
  const [exposureData, setExposureData] = useState([]);
  const [isMyBetsModalOpen, setIsMyBetsModalOpen] = useState(false);
  const isLight = useSelector(state => state.action.theme) === "light";

  // TESTING: Result Modal trigger with sample data
  const [testResultOpen, setTestResultOpen] = useState(true);
  const testData = {
    event_id: "260801173038",
    cards: "[\"JCC\",\"8DD\",\"9DD\",\"8SS\",\"ADD\",\"2SS\",\"3CC\",\"5DD\",\"4DD\",\"9CC\",\"10SS\",\"9HH\",\"2HH\",\"ACC\",\"ASS\",\"4SS\",\"JSS\"]",
    result_status: "1"
  };

  const socketRef = useRef(null);
  const isMobileView = useIsMobile();

  const andarScrollRef = useRef(null);
  const baharScrollRef = useRef(null);
  const mobileAndarScrollRef = useRef(null);
  const mobileBaharScrollRef = useRef(null);


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
      console.log("✅ AndarBahar2 Connected:", socket.id);
      socket.emit("Room", "abj");
    });

    const handleGameData = (data) => {
      const payload = Array.isArray(data) ? data[0] : data;
      if (payload) setGameData(payload);
    };

    socket.on("game", handleGameData);
    socket.on("abj", handleGameData);

    socket.on("disconnect", (reason) => {
      console.log("⚠️ AndarBahar2 Disconnected:", reason);
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
      // For AB2, assuming the ID structure might need cleaning similar to AB4, or just use as is if not.
      // Usually mid is like "123.456"
      const cleanedEventId = currentEventId.toString().includes(".")
        ? currentEventId.toString().split(".")[1]
        : currentEventId;

      try {
        const res = await fetchOpenBetsApi({
          markettype: "ABJ",
          eventId: cleanedEventId,
          curPageName: "live_ab2.php",
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
          markettype: "ABJ",
          main_event_id: gameData?.t1?.[0]?.mid,
          curPageName: "live_ab2.php",
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

  const getExposure = (marketId) => {
    if (!Array.isArray(exposureData)) return 0;
    const market = exposureData.find((item) => item.market_id == marketId);
    return market ? market.win_loss || market.total_exposure : 0;
  };

  const renderExposure = (marketId, type = "") => {
    const exposure = getExposure(marketId);
    if (exposure === 0) return null;

    const isCenter = type === "sa-sb-box" || type === "ab2-bet";

    return (
      <span
        style={{
          color: exposure >= 0 ? "#1eb404" : "red",
          fontSize: "12px",
          display: "block",
          zIndex: '10',
          ...(isCenter
            ? {
                position: "absolute",
                bottom: "-25px",
                left: "50%",
                transform: "translateX(-50%)"
              }
            : {})
        }}
      >
        {exposure}
      </span>
    );
  };

  useEffect(() => {
    // Clear open bets when mid changes (round end)
    setOpenBets([]);
  }, [gameData?.t1?.[0]?.mid]);

  const getCardImage = (cardCode) => {
    if (!cardCode || cardCode === "1")
      return "/assets/cards_new/1.png";
    return `/assets/cards_new/${cardCode}.png`;
  };

  const getTimerColorClass = () => {
    const timerValue = parseInt(gameData?.t1?.[0]?.autotime) || 0;
    if (timerValue <= 5) return "red";
    if (timerValue <= 10) return "orange";
    return "green";
  };

  const formatOdds = (value) => {
    if (!value) return 0;
    return parseFloat(value);
  };

  const handleBet = (item, side) => {
    if (!item) return;
    if (getIsSuspended(item) || item.rate == 0) return;

    if (onBetSelection) {
      onBetSelection({
        ...item,
        odds: item.rate,
        name: item.nat,
        teamName: item.nat,
        market_name_api_value: item.nat,
        eventId: gameData?.t1?.[0]?.mid,
        marketId: item.sid,
        minBet: gameData?.t1?.[0]?.min,
        maxBet: gameData?.t1?.[0]?.max,
        isBack: true,
        // side: side,
      });
    }
  };

  // Logic to extract runners
  const getRunner = (nat) => gameData?.t2?.find((r) => r.nat === nat) || {};
  const getRunnerBySid = (sid) =>
    gameData?.t2?.find((r) => r.sid == sid) || {};

  // Andar (Side A) - IDs 1, 2, 3
  const saRunner = getRunnerBySid("1"); // SA
  const saFirstBet = getRunnerBySid("2"); // 1st Bet
  const saSecondBet = getRunnerBySid("3"); // 2nd Bet

  // Bahar (Side B) - IDs 4, 5, 6
  const sbRunner = getRunnerBySid("4"); // SB
  const sbFirstBet = getRunnerBySid("5"); // 1st Bet
  const sbSecondBet = getRunnerBySid("6"); // 2nd Bet

  // Odd/Even
  const oddRunner = getRunner("Joker Odd");
  const evenRunner = getRunner("Joker Even");

  // Card Suits
  const spadeRunner = getRunner("Joker Spade");
  const heartRunner = getRunner("Joker Heart");
  const clubRunner = getRunner("Joker Club");
  const diamondRunner = getRunner("Joker Diamond");

  // Cards 1-6 (A, 2, 3, 4, 5, 6)
  // Mapping "A" -> "Joker A", "2" -> "Joker 2", etc.
  const cardRunners = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ].map((card) => {
    return { card, data: getRunner(`Joker ${card}`) };
  });

  const scrollCards = (direction, ref) => {
    if (ref.current) {
      const scrollAmount = 100;
      if (direction === "left") {
        ref.current.scrollLeft -= scrollAmount;
      } else {
        ref.current.scrollLeft += scrollAmount;
      }
    }
  };

  const getSuspendedClass = (item) => {
    return getIsSuspended(item)
      ? "suspended"
      : "";
  };

  const renderMobileBetBox = (item, label, side, extraClass, is) => {
    // is && console.log('item', item)
    const isSuspended = getIsSuspended(item);
    const isExp = item?.sid ? getExposure(item?.sid) : null;
    return (
      <div
        className={`mobile-bet-box ${extraClass || ""} ${isSuspended ? "suspended" : ""
          } ${isExp ? "lock-top" : ""}`}
        onClick={() => !isSuspended && handleBet(item, side)}
        style={{ cursor: isSuspended ? "not-allowed" : "pointer" }}
      >
        {isSuspended ? (
          <>
            <BiSolidLock className="lock-icon" />
            {renderExposure(item?.sid)}
          </>
        ) : (
          <>
            {label && <span className="label">{label}</span>}
            <span className="value">{formatOdds(item?.rate)}</span>
            {renderExposure(item?.sid,extraClass)}
          </>
        )}
      </div>
    );
  };

  const rawCards = gameData?.t1?.[0]?.Cards || gameData?.t1?.[0]?.cards || "";
  const allCardsList = rawCards.split(",").filter((c) => c && c !== "1");
  const jokerCard = allCardsList[0];
  const andarCards = allCardsList.slice(1).filter((_, i) => i % 2 !== 0);
  const baharCards = allCardsList.slice(1).filter((_, i) => i % 2 === 0);

  // Auto-scroll to latest card when new cards appear
  useEffect(() => {
    if (mobileAndarScrollRef.current) {
      mobileAndarScrollRef.current.scrollLeft = mobileAndarScrollRef.current.scrollWidth;
    }
  }, [andarCards]);

  useEffect(() => {
    if (mobileBaharScrollRef.current) {
      mobileBaharScrollRef.current.scrollLeft = mobileBaharScrollRef.current.scrollWidth;
    }
  }, [baharCards]);

  return (
    <>
      <style>{`

        .andar-bahar2 .sa-sb-box {
            display: flex;
            flex-wrap: nowrap;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 1px solid #888;
            /* width: 20%; */
            margin-right: 2%;
            background-color: #666;
            color: #ddd;
            height: 60px;
            border-radius: 0;
            position: relative;
            cursor: pointer;
        }

        .andar-bahar2 .ab2-bet {
            display: flex;
            flex-wrap: nowrap;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            /* border: 1px solid #666; */
            /* width: 30%; */
            margin-right: 2%;
            /* background-color: #444; */
            /* color: #ddd; */
            height: 60px;
            border-radius: 0;
            position: relative;
            /* cursor: pointer; */
        }

        @media only screen and (max-width: 767px) {
          .andar-bahar2 .casino-video {
            /* min-height: 250px !important; */
          }
          .mobile-betting-layout {
            padding: 0 0 10px 0;
            /* background: #2d373c; */
            width: 100%;
          }
          .mobile-row-ab-left {
            display: grid;
            grid-template-columns: 20px 1fr 20px;
            align-items: center;
          }
          .mobile-row-ab-right {
            display: grid;
            grid-template-columns: 20px 1fr 20px;
            align-items: center;
            /* margin-bottom: 15px; */
            padding-top: 30px;
          }
          .ab-label {
            color: #ccc;
            font-weight: bold;
            font-size: 13px;
            text-align: center;
          }
          .ab-boxes-grid {
            display: grid;
            grid-template-columns: 2fr 3.5fr 3.5fr;
            gap: 2px;
            flex: 1;
          }
          .mobile-bet-box {
            text-align: center;
            border-radius: 0;
            cursor: pointer;
            padding: 8px 4px;
            position: relative;
            height: 60px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .mobile-bet-box.sa-sb-box {
            background-color: #666;
            border: 1px solid #888;
            color: #ddd;
          }
          .mobile-bet-box.ab2-bet {
            background-color: #444;
            border: 1px solid #666;
            color: #ddd;
          }
          .mobile-bet-box.back {
            background-color: #72bbef;
            color: #000;
            border: 1px solid #72bbef;
            font-weight: bold;
          }
          .mobile-bet-box.suspended {
            background: rgba(0, 0, 0, 0.4) !important;
          }
          .mobile-bet-box .label {
            font-size: 11px;
            margin-bottom: 2px;
          }
          /* .mobile-bet-box .value {
            font-size: 14px;
            font-weight: bold;
          } */
          .mobile-section-title-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            text-align: center;
            color: #ccc;
            font-size: 12px;
            margin-bottom: 5px;
            margin-top: 15px;
          }
          .mobile-row-oddeven {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px;
            margin-bottom: 15px;
          }
          .mobile-suits-icons-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            justify-items: center;
            margin-bottom: 5px;
            margin-top: 15px;
          }
          .mobile-suits-icons-row img {
            width: 30px;
            height: auto;
          }
          .mobile-row-suits {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 4px;
            margin-bottom: 15px;
          }
          .mobile-total-label {
            background: #333;
            color: #ccc;
            text-align: center;
            padding: 4px;
            font-size: 12px;
            margin-bottom: 15px;
            margin-top: 15px;
          }
          .mobile-cards-grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 2px;
            padding: 2px 0;
          }
          .mobile-card-box {
            border: none;
            border-radius: 2px;
            padding: 0;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 65px;
            justify-content: flex-start;
          }
          .mobile-card-box.suspended {
            background: rgba(0, 0, 0, 0.4);
          }
          .mobile-card-box img {
            width: 50px;
            height: auto;
            margin-bottom: 1px;
            // border: 1px solid #ffd700;
            border-radius: 0;
          }
          .lock-icon {
            color: #fff;
            font-size: 14px;
          }
          
          /* Mobile Card Drawer Styles */
          .mobile-card-drawer {
            background: #666666;
            margin: 0 5px 10px 5px;
            padding: 10px;
            border-radius: 8px;
          }
          .mobile-drawer-inner {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .mobile-labels-col {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 50px;
            padding: 5px 0;
          }
          .mobile-drawer-label {
            color: #ccc;
            font-weight: bold;
            font-size: 14px;
            line-height: 1;
          }
          .mobile-joker-col {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 30px;
          }
          .mobile-joker-card {
            /* background: #fff;
            padding: 2px;
            border-radius: 4px; */
            height: 40px;
            width: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          .mobile-joker-card img {
            width: 100%;
            height: auto;
          }
          .mobile-content-col {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .mobile-drawer-row {
            display: flex;
            align-items: center;
            gap: 40px;
            min-height: 40px;
          }
          .mobile-card-main-slot {
            width: 26px;
            height: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .mobile-card-main-slot img {
            width: 100%;
            height: auto;
            border-radius: 0;
          }
          .mobile-card-list-container {
            width: 180px;
            display: flex;
            align-items: center;
            gap: 4px;
            overflow: hidden;
            /* background: #404040; */
            padding: 4px;
            border-radius: 4px;
          }
          .mobile-card-scroll {
            flex: 1;
            display: flex;
            gap: 20px;
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
            scroll-behavior: smooth;
            justify-content: flex-end;
          }
          .mobile-card-scroll::-webkit-scrollbar {
            display: none;
          }
          .mobile-card-img-small {
            width: 26px;
            height: 36px;
            border-radius: 0;
          }
          .mobile-drawer-arrow {
            color: #888;
            font-size: 12px;
            padding: 0 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            flex-shrink: 0;
            height: 100%;
          }
          .mobile-drawer-arrow.active {
            color: #ccc;
          }

          /* Mobile Video Box Overrides */
          .casino-video-right-icons {
            flex-direction: column !important;
            top: 10px !important;
            right: 0 !important;
            gap: 5px;
          }
          .casino-video-title {
            background: none !important;
          }
          .casino-name {
            background: none !important;
            font-size: 10px !important;
            padding: 0 !important;
          }
          .casino-video-rid {
            background: none !important;
            font-size: 10px !important;
            padding: 0 !important;
          }
          .casino-video-right-icons i {
            font-size: 18px !important;
          }

        }
        :root[data-theme="light"] .casino-detail,
        :root[data-theme="light"] .casino-detail *{
          color: #222 !important;
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



      <div className="casino-table andar-bahar andar-bahar2">
        {/* VIDEO SECTION */}
        <CasinoVideo
          gameName="ANDAR BAHAR 2"
          roundId={currentGame?.mid}
          videoSrc="https://casino.diamondcricketid.com/swiftdizire/?id=3079"
          // isCardDrawerOpen={isDrawerOpen}
          // setIsCardDrawerOpen={setIsDrawerOpen}
          autotime={currentGame?.autotime}
          totalTime={currentGame?.ft}// cards={[currentGame?.C1, currentGame?.C2, currentGame?.C3, currentGame?.C4, currentGame?.C5, currentGame?.C6]}
        // CardsComponent={VideoCards}
        // isRuleIcon={false}
        />

        <div className="casino-detail">
          {isMobileView ? (
            <div className="mobile-betting-layout">
              {/* Mobile Card Drawer */}
              <div className="mobile-card-drawer">
                <div className="mobile-drawer-inner">
                  {/* Labels Column */}
                  <div className="mobile-labels-col">
                    <div className="mobile-drawer-label">A</div>
                    <div className="mobile-drawer-label">B</div>
                  </div>

                  {/* Joker Column */}
                  <div className="mobile-joker-col">
                    <div className="mobile-joker-card">
                      <img src={getCardImage(jokerCard)} alt="Joker" />
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className="mobile-content-col">
                    {/* Andar Row */}
                    <div className="mobile-drawer-row">
                      <div className="mobile-card-main-slot">
                        <img src={getCardImage(andarCards[0] || "1")} alt="A1" />
                      </div>
                      {andarCards.length > 1 && (
                        <div className="mobile-card-list-container">
                          <div className="mobile-drawer-arrow" onClick={() => scrollCards('left', mobileAndarScrollRef)}>
                            <FaChevronLeft size={10} />
                          </div>
                          <div className="mobile-card-scroll" ref={mobileAndarScrollRef}>
                            {andarCards.slice(1).map((card, i) => (
                              <img key={i} src={getCardImage(card)} alt="A" className="mobile-card-img-small" />
                            ))}
                          </div>
                          <div className="mobile-drawer-arrow" onClick={() => scrollCards('right', mobileAndarScrollRef)}>
                            <FaChevronRight size={10} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bahar Row */}
                    <div className="mobile-drawer-row">
                      <div className="mobile-card-main-slot">
                        <img src={getCardImage(baharCards[0] || "1")} alt="rate" />
                      </div>
                      {baharCards.length > 1 && (
                        <div className="mobile-card-list-container">
                          <div className="mobile-drawer-arrow" onClick={() => scrollCards('left', mobileBaharScrollRef)}>
                            <FaChevronLeft size={10} />
                          </div>
                          <div className="mobile-card-scroll" ref={mobileBaharScrollRef}>
                            {baharCards.slice(1).map((card, i) => (
                              <img key={i} src={getCardImage(card)} alt="B" className="mobile-card-img-small" />
                            ))}
                          </div>
                          <div className="mobile-drawer-arrow" onClick={() => scrollCards('right', mobileBaharScrollRef)}>
                            <FaChevronRight size={10} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row A */}
              <div className="mobile-row-ab-left">
                <div className="ab-label">A</div>
                <div className="ab-boxes-grid">
                  {renderMobileBetBox(saRunner, saRunner?.nat || "SA", "ANDAR", "sa-sb-box", true)}
                  {renderMobileBetBox(saFirstBet, "First Bet", "ANDAR", "ab2-bet")}
                  {renderMobileBetBox(saSecondBet, "Second Bet", "ANDAR", "ab2-bet")}
                </div>
                <div className="ab-label">A</div>
              </div>

              {/* Row B */}
              <div className="mobile-row-ab-right">
                <div className="ab-label">B</div>
                <div className="ab-boxes-grid">
                  {renderMobileBetBox(sbRunner, sbRunner?.nat || "SB", "BAHAR", "sa-sb-box")}
                  {renderMobileBetBox(sbFirstBet, "First Bet", "BAHAR", "ab2-bet")}
                  {renderMobileBetBox(sbSecondBet, "Second Bet", "BAHAR", "ab2-bet")}
                </div>
                <div className="ab-label">B</div>
              </div>

              {/* Odd/Even */}
              <div className="mobile-section-title-row">
                <span>Odd</span>
                <span>Even</span>
              </div>
              <div className="mobile-row-oddeven">
                {renderMobileBetBox(oddRunner, null, "ANDAR", "back")}
                {renderMobileBetBox(evenRunner, null, "ANDAR", "back")}
              </div>

              {/* Suits */}
              <div className="mobile-suits-icons-row">
                <img
                  src="https://wver.sprintstaticdata.com/v66/static/front/img/cards/spade.png"
                  alt="spade"
                />
                <img
                  src="https://wver.sprintstaticdata.com/v66/static/front/img/cards/heart.png"
                  alt="heart"
                />
                <img
                  src="https://wver.sprintstaticdata.com/v66/static/front/img/cards/club.png"
                  alt="club"
                />
                <img
                  src="https://wver.sprintstaticdata.com/v66/static/front/img/cards/diamond.png"
                  alt="diamond"
                />
              </div>
              <div className="mobile-row-suits">
                {renderMobileBetBox(spadeRunner, null, "ANDAR", "back")}
                {renderMobileBetBox(heartRunner, null, "ANDAR", "back")}
                {renderMobileBetBox(clubRunner, null, "ANDAR", "back")}
                {renderMobileBetBox(diamondRunner, null, "ANDAR", "back")}
              </div>

              {/* Total Label Bar */}
              <div className="mobile-total-label" style={{ backgroundColor: isLight ? '#ddd' : '#444', color: isLight ? '#222' : '#fff', textAlign: 'center', padding: '5px 0', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                {cardRunners.every(item => getIsSuspended(item.data)) ? 0 : (formatOdds(cardRunners[0]?.data?.rate) || 0)}
              </div>

              {/* Cards Grid */}
              <div style={{ position: 'relative' }}>
                {cardRunners.every(item => getIsSuspended(item.data)) && (
                  <div className="cards-overlay" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.2)',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(1px)',
                    borderRadius: '4px'
                  }}>
                  </div>
                )}
                <div className="mobile-cards-grid">
                  {cardRunners.map((item, i) => {
                    const isSuspended = getIsSuspended(item.data);
                    // Only show individual lock if NOT all are suspended (mixed state)
                    // But effectively if the overlay is up, we can hide individual locks or keep them behind.
                    // The overlay covers them anyway.
                    // However, to be clean, if common overlay is active, we don't need individual locks.

                    return (
                      <div
                        key={i}
                        className="mobile-card-box"
                        style={{
                          flex: "0 0 18%",
                          position: "relative",
                          cursor: isSuspended ? "not-allowed" : "pointer"
                        }}
                        onClick={() => !isSuspended && handleBet(item.data, "ANDAR")}
                      >
                        <img
                          src={`https://wver.sprintstaticdata.com/v66/static/front/img/cards/${item.card}.png`}
                          alt={item.card}
                          style={{ opacity: isSuspended ? 0.4 : 1, width: '40px', marginTop: '2px' }}
                        />
                        {isSuspended && (
                          <BiSolidLock
                            style={{
                              position: "absolute",
                              top: "40%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              color: "white",
                              fontSize: "20px",
                            }}
                          />
                        )}
                        {renderExposure(item.data?.sid)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="teen20casino-container">
                <div className="teen20left">
                  <div className="ab2-title">A</div>
                  <div
                    className={`sa-sb-box pr ${getSuspendedClass(saRunner)}`}
                    onClick={() => handleBet(saRunner, "back")}
                  >
                    <div>{saRunner?.nat || "SA"}</div>
                    <div>{formatOdds(saRunner?.rate)}</div>
                    {renderExposure(saRunner?.sid)}
                    <div className="ab-book d-none">0</div>
                  </div>
                  <div
                    className={`ab2-bet pr ${getSuspendedClass(saFirstBet)}`}
                    onClick={() => handleBet(saFirstBet, "back")}
                  >
                    <div>First Bet</div>
                    <div>{formatOdds(saFirstBet?.rate)}</div>
                    {renderExposure(saFirstBet?.sid)}
                  </div>
                  <div
                    className={`ab2-bet pr ${getSuspendedClass(saSecondBet)}`}
                    onClick={() => handleBet(saSecondBet, "back")}
                  >
                    <div>Second Bet</div>
                    <div>{formatOdds(saSecondBet?.rate)}</div>
                    {renderExposure(saSecondBet?.sid)}
                  </div>
                  <div className="ab2-title">A</div>
                </div>
                <div className="teen20center"></div>
                <div className="teen20right">
                  <div className="ab2-title">B</div>
                  <div
                    className={`sa-sb-box pr ${getSuspendedClass(sbRunner)}`}
                    onClick={() => handleBet(sbRunner, "back")}
                  >
                    <div>{sbRunner?.nat || "SB"}</div>
                    <div>{formatOdds(sbRunner?.rate)}</div>
                    {renderExposure(sbRunner?.sid)}
                    <div className="ab-book d-none">0</div>
                  </div>
                  <div
                    className={`ab2-bet pr ${getSuspendedClass(sbFirstBet)}`}
                    onClick={() => handleBet(sbFirstBet, "back")}
                  >
                    <div>First Bet</div>
                    <div>{formatOdds(sbFirstBet?.rate)}</div>
                    {renderExposure(sbFirstBet?.sid)}
                  </div>
                  <div
                    className={`ab2-bet pr ${getSuspendedClass(sbSecondBet)}`}
                    onClick={() => handleBet(sbSecondBet, "back")}
                  >
                    <div>Second Bet</div>
                    <div>{formatOdds(sbSecondBet?.rate)}</div>
                    {renderExposure(sbSecondBet?.sid)}
                  </div>
                  <div className="ab2-title">B</div>
                </div>
              </div>

              <div className="teen20casino-container">
                <div className="teen20left ab2oddeven">
                  <div className="casino-box-row">
                    <div className="casino-bl-box">
                      <div className="casino-bl-box-item">
                        <b>Odd</b>
                      </div>
                    </div>
                    <div className="casino-bl-box">
                      <div className="casino-bl-box-item">
                        <b>Even</b>
                      </div>
                    </div>
                  </div>
                  <div className="casino-box-row">
                    <div className="casino-bl-box">
                      <div
                        className={`back casino-bl-box-item ${getSuspendedClass(
                          oddRunner
                        )}`}
                        onClick={() => handleBet(oddRunner, "back")}
                      >
                        <span className="casino-box-odd">
                          {formatOdds(oddRunner?.rate)}
                        </span>
                        {renderExposure(oddRunner?.sid)}
                      </div>
                    </div>
                    <div className="casino-bl-box">
                      <div
                        className={`back casino-bl-box-item ${getSuspendedClass(
                          evenRunner
                        )}`}
                        onClick={() => handleBet(evenRunner, "back")}
                      >
                        <span className="casino-box-odd">
                          {formatOdds(evenRunner?.rate)}
                        </span>
                        {renderExposure(evenRunner?.sid)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="teen20center"></div>
                <div className="teen20left ab2cards">
                  <div className="casino-box-row">
                    <div className="casino-bl-box">
                      <div className="casino-bl-box-item casino-card-img">
                        <img
                          src="https://wver.sprintstaticdata.com/v66/static/front/img/cards/spade.png"
                          alt="spade"
                        />
                      </div>
                    </div>
                    <div className="casino-bl-box">
                      <div className="casino-bl-box-item casino-card-img">
                        <img
                          src="https://wver.sprintstaticdata.com/v66/static/front/img/cards/heart.png"
                          alt="heart"
                        />
                      </div>
                    </div>
                    <div className="casino-bl-box">
                      <div className="casino-bl-box-item casino-card-img">
                        <img
                          src="https://wver.sprintstaticdata.com/v66/static/front/img/cards/club.png"
                          alt="club"
                        />
                      </div>
                    </div>
                    <div className="casino-bl-box">
                      <div className="casino-bl-box-item casino-card-img">
                        <img
                          src="https://wver.sprintstaticdata.com/v66/static/front/img/cards/diamond.png"
                          alt="diamond"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="casino-box-row">
                    <div className="casino-bl-box">
                      <div
                        className={`back casino-bl-box-item ${getSuspendedClass(
                          spadeRunner
                        )}`}
                        onClick={() => handleBet(spadeRunner, "back")}
                      >
                        <span className="casino-box-odd">
                          {formatOdds(spadeRunner?.rate)}
                        </span>
                        {renderExposure(spadeRunner?.sid)}
                      </div>
                    </div>
                    <div className="casino-bl-box">
                      <div
                        className={`back casino-bl-box-item ${getSuspendedClass(
                          heartRunner
                        )}`}
                        onClick={() => handleBet(heartRunner, "back")}
                      >
                        <span className="casino-box-odd">
                          {formatOdds(heartRunner?.rate)}
                        </span>
                        {renderExposure(heartRunner?.sid)}
                      </div>
                    </div>
                    <div className="casino-bl-box">
                      <div
                        className={`back casino-bl-box-item ${getSuspendedClass(
                          clubRunner
                        )}`}
                        onClick={() => handleBet(clubRunner, "back")}
                      >
                        <span className="casino-box-odd">
                          {formatOdds(clubRunner?.rate)}
                        </span>
                        {renderExposure(clubRunner?.sid)}
                      </div>
                    </div>
                    <div className="casino-bl-box">
                      <div
                        className={`back casino-bl-box-item ${getSuspendedClass(
                          diamondRunner
                        )}`}
                        onClick={() => handleBet(diamondRunner, "back")}
                      >
                        <span className="casino-box-odd">
                          {formatOdds(diamondRunner?.rate)}
                        </span>
                        {renderExposure(diamondRunner?.sid)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="teen20casino-container ab2allcards">
                <div className="text-center w-100">
                  <div className="casino-bl-box casino-cards-odds-title  ">
                    <div className="casino-bl-box-item">
                      <b>Cards</b>
                    </div>
                  </div>
                </div>
                <div className="casino-cards text-center mt-1">
                  {cardRunners.map((item, i) => (
                    <div className="casino-card-item" key={i}>
                      <div
                        className={`card-image ${getSuspendedClass(item.data)}`}
                        onClick={() => handleBet(item.data, "back")}
                      >
                        <img
                          src={`https://wver.sprintstaticdata.com/v66/static/front/img/cards/${item.card}.png`}
                          alt={item.card}
                        />
                        <div
                          style={{
                            color: "black",
                            fontWeight: "bold",
                            fontSize: "10px",
                          }}
                        >
                          {formatOdds(item.data?.rate)}
                        </div>
                        {renderExposure(item.data?.sid)}
                      </div>
                      <div className="casino-book d-none">0</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div >

    </>
  );
};

export default AndarBahar2;
