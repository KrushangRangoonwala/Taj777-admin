import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Modal from "react-modal";
import { fetchOpenBetsApi, fetchCasinoExposureApi } from "../../api/api";
import useIsMobile from "../../hooks/useIsMobile";
import CasinoVideo from "./components/CasinoVideo";

const AndarBahar1 = ({ isVisible, onBetSelection, exposureTrigger }) => {
  const [gameData, setGameData] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [openBets, setOpenBets] = useState([]);
  const [exposureData, setExposureData] = useState([]);
  const [isMyBetsModalOpen, setIsMyBetsModalOpen] = useState(false);
  const socketRef = useRef(null);
  const andarScrollRef = useRef(null);
  const baharScrollRef = useRef(null);
  const isMobileView = useIsMobile();

  useEffect(() => {
    const socket = io("https://trubet9.bet:2053", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("Room", "ab20");
    });

    const handleGameData = (data) => {
      // console.log("AndarBahar3 Game Data:", data);
      const payload = Array.isArray(data) ? data[0] : data;
      if (payload) setGameData(payload);
    };

    socket.on("game", handleGameData);
    socket.on("ab20", handleGameData);

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
          markettype: "ab20",
          eventId: cleanedEventId,
          curPageName: "live_ab20.php",
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
          markettype: "ab20",
          main_event_id: gameData.t1[0].mid,
          curPageName: "live_ab20.php",
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
    if (!cardCode || cardCode === "0" || cardCode === "1") return "/assets/cards/1.png";

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
      return `/assets/cards/${val}${suit}${suit}.png`;
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
      return `/assets/cards/${val}${suit}${suit}.png`;
    }

    // 3. Fallback for single values
    if (code === "11") code = "J";
    else if (code === "12") code = "Q";
    else if (code === "13") code = "K";
    else if (code === "1") code = "A";

    return `/assets/cards/${code}.png`;
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
      text: `${side}/${count}`,
      count: count,
      side: side, // Expose side for locking logic
      showAndar: isOdd, // Show Andar only if it's Bahar (Odd)
      showBahar: true, // Always show Bahar
    };
  };

  const nextCardInfo = getNextCardInfo();
  const isGameSuspended =
    gameData?.t1?.[0]?.gstatus === "SUSPENDED" ||
    gameData?.t1?.[0]?.gstatus === "0" ||
    gameData?.t1?.[0]?.gstatus === 0;

  // Lock Logic: content locked if game suspended OR if next card side matches
  // User update: Bahar always open unless suspended. Andar locked if side is Andar.
  const isAndarLocked = isGameSuspended || nextCardInfo.side === "Andar";
  const isBaharLocked = isGameSuspended;

  const mapNatToImageIndex = (nat) => {
    if (!nat) return 1;
    // Handle "Ander 2" or "Ander A" or just "A"
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

  const handleBet = (item, side) => {
    if (item.gstatus === "0") return;

    if (onBetSelection) {
      onBetSelection({
        ...item,
        odds: item.b1 || item.rate,
        name: item.nat || item.nation,
        teamName: item.nat || item.nation,
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


  // Auto-scroll to latest card when new cards appear
  useEffect(() => {
    if (andarScrollRef.current) {
      andarScrollRef.current.scrollLeft = andarScrollRef.current.scrollWidth;
    }
  }, [gameData?.t3?.[0]?.aall, gameData?.t1?.[0]?.cards]);

  useEffect(() => {
    if (baharScrollRef.current) {
      baharScrollRef.current.scrollLeft = baharScrollRef.current.scrollWidth;
    }
  }, [gameData?.t3?.[0]?.ball, gameData?.t1?.[0]?.cards]);

  /* VideoCards Component for CasinoVideo */
  const VideoCards = () => {
    return (
      <div
        style={{
          padding: "5px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!isMobileView && (
          <div
            style={{
              textAlign: "center",
              marginBottom: "5px",
              borderBottom: "1px solid #444",
              paddingBottom: "2px",
            }}
          >
            {/* <span
              style={{
                color: "#aaa",
                fontSize: "10px",
                fontWeight: "bold",
              }}
            >
              Next Card Count:{" "}
            </span>
            <span
              style={{
                color: "#FFD700",
                fontSize: "11px",
                fontWeight: "bold",
              }}
            >
              {nextCardInfo.text}
            </span> */}
          </div>
        )}

        {/* MOBILE JOKER ROW */}
        {/* {isMobileView &&
          gameData?.t1?.[0]?.cards?.[0] &&
          gameData.t1[0].cards[0] !== "1" && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "10px",
                gap: "8px",
              }}
            >
              <FaChevronLeft size={14} style={{ color: "#555" }} />
              <img
                src={getCardImage(gameData.t1[0].cards[0])}
                alt="Joker"
                style={{
                  width: "25px",
                  height: "auto",
                  borderRadius: "2px",
                  border: "1px solid #ffd700",
                }}
              />
              <FaChevronRight size={14} style={{ color: "#555" }} />
            </div>
          )} */}

        {/* ANDAR SECTION */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: isMobileView ? "10px" : "5px",
            justifyContent: isMobileView ? "center" : "flex-start",
          }}
        >
          {!isMobileView && (
            <div
              style={{
                color: "#aaafb5",
                fontWeight: "bold",
                fontSize: "10px",
                width: "45px",
              }}
            >
              ANDAR
            </div>
          )}

          {/* Left Arrow */}
          <div
            onClick={() => scrollCards("left", andarScrollRef)}
            style={{
              cursor: "pointer",
              padding: isMobileView ? "5px" : "0 2px",
              color: "white",
            }}
          >
            <FaChevronLeft size={isMobileView ? 14 : 10} />
          </div>

          {/* Cards Container */}
          <div
            ref={andarScrollRef}
            style={{
              display: "flex",
              gap: "4px",
              overflowX: "hidden",
              width: isMobileView ? "73px" : "80px",
              scrollBehavior: "smooth",
            }}
          >
            {(() => {
              const t3_aall = gameData?.t3?.[0]?.aall;
              const cards = t3_aall
                ? t3_aall.split(",")
                : gameData?.t1?.[0]?.cards;
              return cards?.map((card, i) => {
                if (!t3_aall && (i % 2 === 0 || card === "1"))
                  return null;
                return (
                  <img
                    key={i}
                    src={getCardImage(card)}
                    alt=""
                    style={{
                      width: isMobileView ? "22px" : "25px",
                      height: "auto",
                      borderRadius: "2px",
                      flexShrink: 0,
                    }}
                  />
                );
              });
            })()}
          </div>

          <div
            onClick={() => scrollCards("right", andarScrollRef)}
            style={{
              cursor: "pointer",
              padding: isMobileView ? "5px" : "0 2px",
              color: "white",
            }}
          >
            <FaChevronRight size={isMobileView ? 14 : 10} />
          </div>
        </div>

        {/* BAHAR SECTION */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isMobileView ? "center" : "flex-start",
          }}
        >
          {!isMobileView && (
            <div
              style={{
                color: "#aaafb5",
                fontWeight: "bold",
                fontSize: "10px",
                width: "45px",
              }}
            >
              BAHAR
            </div>
          )}

          {/* Left Arrow */}
          <div
            onClick={() => scrollCards("left", baharScrollRef)}
            style={{
              cursor: "pointer",
              padding: isMobileView ? "5px" : "0 2px",
              color: "white",
            }}
          >
            <FaChevronLeft size={isMobileView ? 14 : 10} />
          </div>

          {/* Cards Container */}
          <div
            ref={baharScrollRef}
            style={{
              display: "flex",
              gap: "4px",
              overflowX: "hidden",
              width: isMobileView ? "73px" : "80px",
              scrollBehavior: "smooth",
            }}
          >
            {(() => {
              const t3_ball = gameData?.t3?.[0]?.ball;
              const cards = t3_ball
                ? t3_ball.split(",")
                : gameData?.t1?.[0]?.cards;
              return cards?.map((card, i) => {
                if (!t3_ball && (i % 2 !== 0 || card === "1"))
                  return null;
                return (
                  <img
                    key={i}
                    src={getCardImage(card)}
                    alt=""
                    style={{
                      width: isMobileView ? "22px" : "25px",
                      height: "auto",
                      borderRadius: "2px",
                      flexShrink: 0,
                    }}
                  />
                );
              });
            })()}
          </div>

          {/* Right Arrow */}
          <div
            onClick={() => scrollCards("right", baharScrollRef)}
            style={{
              cursor: "pointer",
              padding: isMobileView ? "5px" : "0 2px",
              color: "white",
            }}
          >
            <FaChevronRight size={isMobileView ? 14 : 10} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        /*! CSS Used from: https://wver.sprintstaticdata.com/v201/static/front/css/bootstrap.min.css */
        *,::after,::before{box-sizing:border-box;}
        h5{margin-top:0;margin-bottom:0;}
        img{vertical-align:middle;border-style:none;}
        h5{margin-bottom:0;font-weight:400;line-height:1.2;font-family:'Noto Sans', sans-serif;}
        h5{font-size:20px;}
        .w-100{width:100%!important;}
        .text-center{text-align:center!important;}
        .d-none{display:none!important;}
        @media print{
        *,::after,::before{text-shadow:none!important;box-shadow:none!important;}
        img{page-break-inside:avoid;}
        }
        /*! CSS Used from: https://wver.sprintstaticdata.com/v201/static/front/css/control.css */
        .text-playera{color:var(--text-red);}
        .text-playerb{color:var(--text-yellow);}
        /*! CSS Used from: https://wver.sprintstaticdata.com/v201/static/front/css/style.css */
        *{outline:0!important;}
        .casino-card-item{margin-right:5px;width:auto;margin-bottom:5px;min-width:60px;}
        .casino-card-item:last-child{margin-right:0;}
        .casino-card-item .card-image{display:inline-block;}
        .casino-card-item .card-image img{width:50px;}
        .casino-card-item .card-image{cursor:pointer;}
        .casino-book{text-align:center;font-size:var(--font-caption);line-height:18px;margin-top:2px;}
        .ab-bg{display:flex;flex-wrap:wrap;justify-content:space-between;padding:4px;}
        .andar-cards-box{width:49.5%;display:flex;padding:4px;justify-content:center;flex-wrap:wrap;border:2px solid #fdcf1380;}
        .bahar-cards-box{width:49.5%;padding:4px;display:flex;justify-content:center;flex-wrap:wrap;border:2px solid #fdcf1380;}
        .andar-cards-box h5,.bahar-cards-box h5{position:relative;margin-bottom:0;}
        .andar-cards-box>.casino-card-item,.bahar-cards-box>.casino-card-item{width:auto;display:flex;flex-direction:column;justify-content:flex-start;height:90px;}
        /*! CSS Used from: https://wver.sprintstaticdata.com/v199/static/front/css/responsive.css */
        @media only screen and (min-width: 1280px) and (max-width: 1599px){
        .casino-card-item .card-image img{width:40px;}
        .casino-card-item{min-width:50px;}
        }
        @media only screen and (min-width: 320px) and (max-width: 767px){
        .casino-card-item .card-image img{height:auto;}
        .ab-bg{padding:5px;}
        .andar-cards-box{margin-bottom:5px;}
        .andar-cards-box,.bahar-cards-box{width:100%;}
        .casino-card-item{min-width:50px;min-width:70px;}
        .casino-card-item .card-image img{width:35px;}
        }
        @media only screen and (min-width: 320px) and (max-width: 374px){
        .casino-card-item{min-width:55px;}
        }
        @media only screen and (min-width: 768px) and (max-width: 1279px){
        .casino-card-item .card-image img{width:45px;height:auto;}
        .casino-card-item{min-width:45px;}
        }
        
        /* Retain critical video styles */
        .andar-bahar-1 .casino-video {
            min-height: 200px;
            height: auto;
            position: relative;
        }
        @media only screen and (max-width: 500px) {
           .andar-bahar-1 .casino-video {
             min-height: 220px !important;
             height: auto !important;
           }

           .mobile-card-item-v {
              display: flex;
              flex-direction: column;
              align-items: center;
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
        // style={{
        //   position: "fixed",
        //   bottom: "80px",
        //   right: "10px",
        //   width: "50px",
        //   height: "50px",
        //   borderRadius: "50%",
        //   backgroundColor: "#008080",
        //   boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
        //   display: "flex",
        //   alignItems: "center",
        //   justifyContent: "center",
        //   zIndex: 1000,
        //   cursor: "pointer",
        //   border: "2px solid #fff",
        // }}
        >
          <span
            style={{ color: "white", fontWeight: "bold", fontSize: "16px" }}
          >
            {openBets.length}
          </span>
        </div>
      )}

      <div className="casino-table andar-bahar andar-bahar-1">
        <CasinoVideo
          gameName="ANDAR BAHAR"
          roundId={gameData?.t1?.[0]?.mid}
          videoSrc="https://casino.diamondcricketid.com/swiftdizire/?id=3053"
          autotime={gameData?.t1?.[0]?.autotime}
          totalTime={gameData?.t1?.[0]?.ft}
          isCardDrawerOpen={isDrawerOpen}
          setIsCardDrawerOpen={setIsDrawerOpen}
          CardsComponent={VideoCards}
          isRuleIcon={false}
          drawerStyle={{
            left: 0,
            top: "35%",
            transform: "none",
            width: "30%",
            height: "auto",
            maxHeight: "none",
            borderRadius: "8px"
          }}
        />

        <div className="casino-detail">
          <div className="ab-bg" style={{ position: "relative" }}>
            {/* Andar Section */}
            <div className="andar-cards-box text-center" style={{ position: "relative" }}>
              {isAndarLocked && (
                <div style={{
                  position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                  background: "rgba(0,0,0,0.6)", zIndex: 10, display: "flex",
                  justifyContent: "center", alignItems: "center", borderRadius: "8px"
                }}>
                  <i className="fas fa-lock" style={{ fontSize: "20px", color: "#fff" }}></i>
                </div>
              )}
              <h5 className="w-100 text-center text-playera">Andar</h5>

              {(() => {
                const items = gameData?.t2?.length > 0 ? gameData.t2 : gameData?.t3;
                const andarItems = items?.slice(0, 13) || [];
                const t3_data = gameData?.t3?.[0];
                const t3_ar = t3_data?.ar ? t3_data.ar.split(",") : [];
                const hasCards = (t3_data?.aall && t3_data.aall.trim().length > 0) || (t3_data?.ball && t3_data.ball.trim().length > 0);

                return andarItems.map((item, idx) => {
                  const isClosed = hasCards ? (t3_ar[idx] || "0") === "0" : false;
                  return (
                    <div
                      key={item.sid}
                      onClick={() => !isClosed && handleBet(item, "ANDAR")}
                      className={`casino-card-item ${getSuspendedClass(item.gstatus)} ${isClosed ? "card-closed" : ""}`}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="card-image">
                        <img
                          src={isClosed
                            ? "https://wver.sprintstaticdata.com/v193/static/front/img/andar-bahar-cards/0.png"
                            : `https://wver.sprintstaticdata.com/v66/static/front/img/andar-bahar-cards/${mapNatToImageIndex(item.nat || item.nation)}.png`}
                          alt="card"
                        />
                      </div>
                      {renderExposure(item.sid)}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Bahar Section */}
            <div className="bahar-cards-box text-center" style={{ position: "relative" }}>
              {isBaharLocked && (
                <div style={{
                  position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                  background: "rgba(0,0,0,0.6)", zIndex: 10, display: "flex",
                  justifyContent: "center", alignItems: "center", borderRadius: "8px"
                }}>
                  <i className="fas fa-lock" style={{ fontSize: "20px", color: "#fff" }}></i>
                </div>
              )}
              <h5 className="w-100 text-center text-playerb">Bahar</h5>

              {(() => {
                const items = gameData?.t2?.length > 0 ? gameData.t2 : gameData?.t3;
                const baharItems = items?.slice(13, 26) || [];
                const t3_data = gameData?.t3?.[0];
                const t3_br = t3_data?.br ? t3_data.br.split(",") : [];
                const hasCards = (t3_data?.aall && t3_data.aall.trim().length > 0) || (t3_data?.ball && t3_data.ball.trim().length > 0);

                return baharItems.map((item, idx) => {
                  const isClosed = hasCards ? (t3_br[idx] || "0") === "0" : false;
                  return (
                    <div
                      key={item.sid}
                      onClick={() => !isClosed && handleBet(item, "BAHAR")}
                      className={`casino-card-item ${getSuspendedClass(item.gstatus)} ${isClosed ? "card-closed" : ""}`}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="card-image">
                        <img
                          src={isClosed
                            ? "https://wver.sprintstaticdata.com/v193/static/front/img/andar-bahar-cards/0.png"
                            : `https://wver.sprintstaticdata.com/v66/static/front/img/andar-bahar-cards/${mapNatToImageIndex(item.nat || item.nation)}.png`}
                          alt="card"
                        />
                      </div>
                      {renderExposure(item.sid)}
                    </div>
                  );
                });
              })()}
            </div>

            {/* MARQUEE */}
            <div className="w-100 casino-remark" style={{ marginTop: '5px' }}>
              <div className="remark-icon">
                <img src="https://wver.sprintstaticdata.com/v65/static/front/img/icons/remark.png" alt="" />
              </div>
              <marquee>
                {gameData?.t1?.[0]?.remark || "Play & Win"}
              </marquee>
            </div>
          </div>
        </div>
      </div >
    </>
  );
};

export default AndarBahar1;
