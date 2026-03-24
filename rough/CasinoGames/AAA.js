import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { fetchCasinoExposureApi, fetchOpenBetsApi } from "../../api/api";
import Modal from "react-modal";
import useIsMobile from "../../hooks/useIsMobile";
import CasinoVideo from "./components/CasinoVideo";
import { getCardImage, getImage } from "../../utilies/helpers";


const AAA = ({ isVisible, onBetSelection, exposureTrigger }) => {
  const theme = useSelector((state) => state.action.theme);
  const isLight = theme === "light";
  const [gameData, setGameData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(false);
  const [exposureData, setExposureData] = useState([]);
  const [openBets, setOpenBets] = useState([]);
  const [isMyBetsModalOpen, setIsMyBetsModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const socketRef = useRef(null);
  const [isOpen, setIsOpen] = useState(true); // IS CARD DROWER OPEN 1ST TIME 


  function renderLock() {
    return (
      <></>
    )
  }

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const currentRound = gameData?.t1?.[0];

  const communityCards = [
    currentRound?.C1,
  ];

  useEffect(() => {
    const isAllClosed = communityCards?.every(val => !val || val == 1);
    console.log('isAllClosed', isAllClosed);
    if (isAllClosed) {
      setIsCardDrawerOpen(false);
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [communityCards]);

  useEffect(() => {
    if (isOpen) { // isOpen changes its value from FALSE to TRUE then only this will run
      setIsCardDrawerOpen(true);
    }
  }, [isOpen])

  const rows = [communityCards.slice(0, 3), communityCards.slice(3, 6)];

  useEffect(() => {
    // setOpenBets([]); // Removed to preventing flickering/clearing
    const loadOpenBets = async () => {
      const currentEventId = gameData?.t1?.[0]?.mid || "1";
      // console.log("AAA: Fetching open bets for mid:", currentEventId);
      try {
        const res = await fetchOpenBetsApi({
          markettype: "AMAR_AKBAR_ANTHONY",
          eventId: currentEventId,
          curPageName: "live_aaa.php",
        });

        console.log("AAA: Open Bets API response:", res);

        let newBets = [];
        if (res?.open_bet_data && Array.isArray(res.open_bet_data)) {
          newBets = res.open_bet_data;
        } else if (res?.data && Array.isArray(res.data)) {
          newBets = res.data;
        } else if (Array.isArray(res)) {
          newBets = res;
        }

        console.log("AAA: Parsed open bets:", newBets);
        setOpenBets(newBets);

      } catch (error) {
        console.error("Error fetching open bets:", error);
      }
    };

    loadOpenBets();
  }, [gameData?.t1?.[0]?.mid, exposureTrigger]);

  console.log("AAA: Render - isMobile:", isMobile, "OpenBets count:", openBets?.length);

  const fetchExposure = async () => {
    try {
      const response = await fetchCasinoExposureApi({
        markettype: "AMAR_AKBAR_ANTHONY",
        main_event_id: gameData?.t1?.[0]?.mid,
        curPageName: "live_aaa.php",
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
  }, [exposureTrigger, gameData?.t1?.[0]?.mid]);

  const getExposure = (sid) => {
    if (!Array.isArray(exposureData)) return 0;
    const market = exposureData.find((item) => String(item.market_id) === String(sid));
    return market ? market.win_loss || market.total_exposure : 0;
  };

  const renderExposure = (sid, isAbsolute = true, customStyle = {}, className = "") => {
    const exposure = getExposure(sid);
    if (exposure === 0) return null;
    return (
      <div className={className} style={isAbsolute ? {
        position: "absolute",
        bottom: "1px",
        left: "0",
        width: "100%",
        textAlign: "center",
        color: exposure > 0 ? "#21d375" : "red",
        fontSize: "10px",
        fontWeight: "bold",
        lineHeight: "1",
        pointerEvents: "none",
        ...customStyle
      } : {
        color: exposure > 0 ? "#21d375" : "red",
        fontSize: "10px",
        fontWeight: "bold",
        textAlign: "center",
        marginTop: "2px",
        ...customStyle
      }}>
        {exposure}
      </div>
    );
  };

  useEffect(() => {
    const socket = io("https://trubet9.bet:2053", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    const handleBollywoodData = (data) => {
      try {
        console.log("🔵 Bollywood Data Received:", data);
        const payload = Array.isArray(data) ? data[0] : data;
        if (payload) {
          setGameData((prevData) => ({
            ...prevData,
            ...payload,
            lastUpdated: new Date().toISOString(),
          }));
        }
      } catch (error) {
        console.error("Error processing Bollywood data:", error);
      }
    };

    // Connection established
    socket.on("connect", () => {
      console.log("✅ AAA Connected:", socket.id);
      // Join the AAA room
      socket.emit("Room", "aaa");
    });

    // Handle incoming data
    socket.on("aaa", handleBollywoodData);
    socket.on("game", handleBollywoodData);

    // Handle disconnections and reconnections
    socket.on("disconnect", (reason) => {
      console.log("⚠️ AAA Disconnected:", reason);
      if (reason === "io server disconnect") {
        // Try to reconnect after a short delay
        setTimeout(() => socket.connect(), 1000);
      }
    });

    // Handle connection errors
    socket.on("connect_error", (error) => {
      console.error("🔴 Connection Error:", error.message);
      // Attempt to reconnect after a delay
      setTimeout(() => socket.connect(), 2000);
    });

    // Handle reconnection attempts
    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
    });

    // Handle successful reconnection
    socket.on("reconnect", (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      // Resubscribe to data stream
      socket.emit("Bollywood", { type: "resubscribe" });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Extract game data from Bollywood structure
  // const currentRound = gameData?.t1?.[0];
  const bettingOptions = gameData?.t2 || [];

  // Get the card value from Bollywood data structure
  const cardValue = currentRound?.C1;

  // Group betting options by their types
  const mainOptions = bettingOptions.filter((opt) =>
    ["1", "2", "3"].includes(opt.sid)
  );
  const evenOddOptions = bettingOptions.filter((opt) =>
    ["4", "5"].includes(opt.sid)
  );
  const colorOptions = bettingOptions.filter((opt) =>
    ["6", "7"].includes(opt.sid)
  );
  const cardOptions = bettingOptions.filter(
    (opt) => parseInt(opt.sid) >= 8 && parseInt(opt.sid) <= 20
  );
  const underOverOptions = bettingOptions.filter((opt) =>
    ["21", "22"].includes(opt.sid)
  );

  // Get the card image URL using the card value
  const cardImageUrl = getCardImage(cardValue?.[0], 'cards');

  // Get timer color class based on time left
  const getTimerColorClass = () => {
    const timerValue = parseInt(timeLeft) || 0;
    if (timerValue <= 5) return "red";
    if (timerValue <= 10) return "orange";
    return "green";
  };

  // Get odds by sid
  const getOddsBySid = (sid) => {
    return gameData?.t2?.find((item) => item.sid === sid);
  };

  // Handle odds click with market data
  const handleOddsClick = (marketName, odds, sid, isBack) => {
    const market = getOddsBySid(sid);
    if (!market) return;

    if (
      !odds ||
      odds === "0" ||
      odds === "0.00" ||
      odds === 0 ||
      market.gstatus === "SUSPENDED" ||
      market.gstatus === "suspended"
    ) {
      return;
    }

    const min = market?.min || 100;
    const max = market?.max || 25000;

    if (onBetSelection) {
      onBetSelection({
        teamName: marketName,
        odds: isBack ? market.b1 : market.l1,
        minBet: min,
        maxBet: max,
        isBack,
        marketId: sid,
        eventId: currentRound?.mid,
      });
    }
  };

  // Timer countdown based on t1[0].autotime
  const isSuspended = (status) => {
    if (!status) return false;
    const s = status.toString().toUpperCase();
    return (
      s === "SUSPENDED" || s === "0" || s === "BALL RUNNING" || s === "LOCKED"
    );
  };
  useEffect(() => {
    const initialTime = currentRound?.autotime
      ? parseInt(currentRound.autotime, 10)
      : 0;
    if (!initialTime || isNaN(initialTime)) {
      setTimeLeft(0);
      return;
    }

    setTimeLeft(initialTime);

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRound?.mid, currentRound?.autotime]);


  const CardBox = ({ sid, cardVal, teamName }) => {
    const market = getOddsBySid(sid);
    const odds = market ? market.b1 || market.rate || market.odds : "";
    const suspended = market ? isSuspended(market.gstatus) : true;
    const getCardImg = (val) => getImage(val, "cards");

    return (
      <div
        className="card-item-click"
        onClick={() =>
          !suspended && handleOddsClick(teamName, odds || "12", sid, true)
        }
        style={{
          cursor: suspended ? "not-allowed" : "pointer",
          position: "relative"
        }}
      >
        <div className={`card-with-border ${suspended ? "suspended" : ""}`}>
          <img src={getCardImage(cardVal)} alt={cardVal} />
          {renderExposure(sid, true, {}, "card-exposure-mini")}
        </div>
        {/* {suspended && <img src={getImage('lock', 'images', 'svg')} alt="lock" className="lock-mini" />} */}
      </div>
    );
  };

  function WholeCardDrawer() {
    return (
      <>
        <div
          className={`casino-video-cards ${isCardDrawerOpen ? "open" : "closed"
            }`}
        >
          <div
            className="casino-cards-shuffle"
            onClick={() => setIsCardDrawerOpen(!isCardDrawerOpen)}
          >
            <i className="fas fa-grip-lines-vertical"></i>
          </div>
          <div className="casino-video-cards-container">
            <div>
              <span>
                <img
                  src={cardImageUrl}
                  alt={cardValue || "Card"}
                  style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "contain",
                    borderRadius: "4px",
                  }}
                />
              </span>
            </div>
          </div>
        </div>
      </>
    );
  }


  return (
    <>
      <style jsx>{`
        .casino-video-cards.open {
          width: 45px !important; /* Reduced from default width */
          height: 90px !important;
        }
        .casino-video-cards.closed {
          width: 35px !important; /* Reduced from default width */
          height: 90px !important;
        }
        .casino-video-cards.open .casino-video-cards-container {
          padding: 5px 5px !important; /* Adjusted padding for the smaller width */
        }
        .casino-video-cards.open img {
          width: 22px !important; /* Slightly smaller card image */
          height: 70px !important;
        }
        /* Mobile specific adjustments ensuring properly logic */
        @media (max-width: 768px) {
           .aaa-oe-mobile-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 6px;
              width: 100%;
              margin-top: 15px;
              margin-bottom: 20px;
              padding: 0 5px;
           }
           .aaa-oe-mobile-wrapper {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-end;
           }
           .aaa-oe-odds-label {
              color: var(--text-highlight);
              // font-weight: bold;
              font-size: 14px;
              margin-bottom: 5px;
           }
           .aaa-oe-mobile-btn {
              background-color: transparent;
              border: 1px solid #72bbef; /* Match Back Box Border */
              background: "#3f5667"; /* Bollywood style constant dark */
              border-radius: 0px;
              width: 100%;
              padding: 12px 5px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--text-highlight);
              font-weight: bold;
              text-transform: capitalize;
              min-height: 50px;
              box-shadow: none;
           }
           .aaa-mobile-main-row {
              display: flex;
              align-items: center;
              margin-bottom: 6px;
              /* Removing background-color from container to allow gaps to show background */
           }
           .aaa-card-grid {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 5px 2px; /* Reduced gap for compact layout */
              width: 100%;
              margin-top: 15px;
              padding-bottom: 20px; /* Add bottom padding for scrolling */
           }
           .aaa-card-cell {
              position: relative;
              background-color: transparent;
              border: none;
              height: 70px; /* Increased height */
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              flex: 0 0 calc(20% - 3px);
              width: calc(20% - 3px);
           }
        }
        }
          .individual-cards-container {
             border: none;
             margin-top: 15px;
             display: flex;
             flex-direction: column;
             align-items: center;
           }
           .cards-grid {
             display: flex;
             flex-wrap: wrap;
             gap: 35px 10px;
             justify-content: center;
             width: 100%;
             align-items: flex-start;
           }
            .card-item-click { flex: 0 0 18%; display: flex; justify-content: center; }
             .card-item-click .card-with-border { width: 100%; max-width: 38px; }
           .card-with-border {
              border-radius: 0px;
              overflow: hidden;
              display: flex;
              background: #fff;
              width: 45px;
           }
           .lock-mini {
             position: absolute;
             top: 50%;
             left: 50%;
             transform: translate(-50%, -50%);
             color: #fff;
             font-size: 14px;
             z-index: 5;
           }
            .card-exposure-mini {
              position: absolute !important;
              bottom: -9px !important;
              left: 0;
              width: 100%;
              text-align: center;
              font-size: 10px !important;
              font-weight: bold;
              pointer-events: none;
              z-index: 10;
            }
           @media (max-width: 767px) {
             .cards-grid { gap: 5px 3px; }
             .card-item-click { flex: 0 0 18%; display: flex; justify-content: center; }
             .card-item-click .card-with-border { width: 100%; max-width: 38px; }
           }

        /* ADDED CSS FOR LOCKED BOXES */
        *{outline:0!important;}
        .back{background-color:var(--back);}
        .back:hover{background-color:var(--back-hover);}
        .suspended{position:relative;pointer-events:none;}
        .suspended:before{content:"";background-image:url("https://wver.sprintstaticdata.com/v202/static/front/img/lock.svg");background-size:17px 17px;filter:invert(1);background-repeat:no-repeat;position:absolute;z-index:100;width:100%;height:100%;left:0;top:0;background-position:center;pointer-events:none;}
        .suspended:after{content:"";background-color:#373636d6;position:absolute;height:100%;width:100%;left:0;top:0;cursor:not-allowed;border-radius:0;display:flex;justify-content:center;align-items:center;pointer-events:none;}
        .casino-table .casino-detail .back{background-color:${isLight ? "var(--back-title)" : "#72bbef40"};border:2px solid var(--back);color:var(--text-highlight);}
        .casino-table .casino-detail .back:hover{border:1px solid var(--back);}
        .casino-bl-box{display:flex;display:-webkit-flex;justify-content:center;align-items:center;flex-wrap:wrap;}
        .casino-bl-box-item{width:72px;margin-right:4px;border-radius:0;color:var(--text-table);text-align:center;height:32px;display:flex;display:-webkit-flex;flex-wrap:wrap;justify-content:center;align-items:center;cursor:pointer;flex-direction:column;}
        .casino-bl-box-item>span{display:block;width:100%;line-height:14px;font-size:16px;font-weight:bold;}
        .casino-bl-box-item:last-child{margin-right:0;}
        .casino-card-img img{width:30px;height:auto;margin-left:5px;}
        .casino-card-img img:last-child{margin-left:0;}
        .casino-card-img img{width:30px;}
        .aaa .casino-bl-box{width:100%;}
        .aaa .casino-bl-box-item{width:calc(50% - 2px);height:40px;}
        .aaa-oe .casino-bl-box{width:50%;margin-bottom:0;}
        .aaa-oe .casino-bl-box-item{width:calc(100% - 4px);height:56px;}

        @media only screen and (min-width: 1280px) and (max-width: 1599px){
        .casino-bl-box-item span{font-size:var(--font-small);}
        }
        @media only screen and (min-width: 320px) and (max-width: 767px){
        .casino-bl-box-item span{font-size:var(--font-small);width:auto;}
        .casino-bl-box{margin-bottom:4px;}
        .aaa .casino-bl-box-item{width:calc(25% - 2px);}
        .aaa-oe .casino-bl-box .casino-bl-box-item{width:96%;}
        }

      `}</style>





      <div className="casino-table aaa">
        {/* VIDEO SECTION */}
        <CasinoVideo
          gameName="AMAR AKBAR ANTHONY"
          roundId={currentRound?.mid}
          videoSrc="https://casino.diamondcricketid.com/swiftdizire/?id=3056"
          isCardDrawerOpen={isDrawerOpen}
          setIsCardDrawerOpen={setIsDrawerOpen}
          autotime={currentRound?.autotime}
          cards={[currentRound?.C1]}
          WholeCardDrawer={WholeCardDrawer}
        />

        <div className="casino-detail" style={isMobile ? { padding: 0, marginTop: "10px" } : {}}>
          <div className={isMobile ? "w-100 p-0" : "container-fluid container-fluid-5"}>
            <div className={`row row5 ${isMobile ? "m-0" : "d-none-small"}`}>
              {mainOptions.map((option, index) => (
                isMobile ? (
                  // Mobile Main Market Row
                  <div className="col-12" key={option.sid} style={{ marginBottom: "6px" }}>
                    <div className="d-flex w-100" style={{ height: "35px", gap: "2px" }}>
                      <div style={{ flex: "2", backgroundColor: "#444444", display: "flex", alignItems: "center", paddingLeft: "10px", color: "white", fontWeight: "bold", borderRadius: "0px", fontSize: "12px", position: "relative", textTransform: "uppercase" }}>
                        <span style={{ marginRight: "4px", color: "#ddd" }}>{String.fromCharCode(65 + index)}.</span>
                        {option.nat}
                        {renderExposure(option.sid, true, { textAlign: "left", paddingLeft: "24px", bottom: "2px", color: "white" })}
                      </div>
                      <div className={`casino-bl-box-item back ${option.b1 === "0.00" || option.b1 === 0 || option.gstatus === "SUSPENDED" ? "suspended" : ""}`} style={{
                        flex: "1",
                        borderRadius: "0px",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "1px solid #72bbef",
                        color: "#D7D7D7",
                        backgroundColor: (option.b1 === "0.00" || option.b1 === 0) ? "#363636" : "#3f5667"
                      }}
                        onClick={() => handleOddsClick(option.nat, option.b1, option.sid, true)}>
                        {option.b1 === "0.00" || option.b1 === 0 ? (
                          <img src={getImage('lock', 'images', 'svg')} alt="lock" style={{ width: '15px', filter: 'brightness(0) invert(1)' }} />
                        ) : (
                          <>
                            <span className="casino-box-odd" style={{ color: "#D7D7D7", fontWeight: "bold" }}>{option.b1}</span>
                          </>
                        )}
                      </div>
                      <div className={`casino-bl-box-item lay ${option.l1 === "0.00" || option.l1 === 0 || option.gstatus === "SUSPENDED" ? "suspended" : ""}`} style={{
                        flex: "1",
                        borderRadius: "0px",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "1px solid #f994ba",
                        color: isLight ? "#222" : "#D7D7D7",
                        backgroundColor: (option.l1 === "0.00" || option.l1 === 0) ? (isLight ? "#d6dedbd6" : "#363636") : (isLight ? "#eef6fb" : undefined)
                      }}
                        onClick={() => handleOddsClick(option.nat, option.l1, option.sid, false)}>
                        {option.l1 === "0.00" || option.l1 === 0 ? (
                          <img src={getImage('lock', 'images', 'svg')} alt="lock" style={{ width: '15px', filter: isLight ? 'none' : 'brightness(0) invert(1)' }} />
                        ) : (
                          <>
                            <span className="casino-box-odd" style={{ color: isLight ? "#222" : "#D7D7D7", fontWeight: "bold" }}>{option.l1}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="col-4" key={option.sid}>
                    <div className="casino-box-row">
                      <div className="casino-nation-name" style={{ position: "relative" }}>
                        <b>
                          {String.fromCharCode(65 + index)}. {option.nat}
                        </b>
                        {renderExposure(option.sid)}
                      </div>
                      <div className="casino-bl-box">
                        <div
                          className={`back casino-bl-box-item ${option.b1 === "0.00" || option.b1 === 0 || option.gstatus === "SUSPENDED" || option.gstatus === "suspended" ? "suspended" : ""}`}
                          onClick={() =>
                            handleOddsClick(
                              option.nat,
                              option.b1,
                              option.sid,
                              true
                            )
                          }
                          style={{
                            cursor: "pointer",
                            backgroundColor: isLight ? "#eef6fb" : undefined
                          }}
                        >
                          <span className="casino-box-odd">
                            {!option.b1 || option.b1 === "0.00" ? (
                              <img src={getImage('lock', 'images', 'svg')} alt="lock" style={{ width: '15px', filter: isLight ? 'none' : 'brightness(0) invert(1)' }} />
                            ) : (
                              option.b1
                            )}
                          </span>
                        </div>
                        <div
                          className={`lay casino-bl-box-item ${option.l1 === "0.00" || option.l1 === 0 || option.gstatus === "SUSPENDED" || option.gstatus === "suspended" ? "suspended" : ""}`}
                          onClick={() =>
                            handleOddsClick(
                              option.nat,
                              option.l1,
                              option.sid,
                              false
                            )
                          }
                          style={{
                            cursor: "pointer",
                            backgroundColor: isLight ? "#eef6fb" : undefined
                          }}
                        >
                          <span className="casino-box-odd">
                            {!option.l1 || option.l1 === "0.00" ? (
                              <img src={getImage('lock', 'images', 'svg')} alt="lock" style={{ width: '15px', filter: isLight ? 'none' : 'brightness(0) invert(1)' }} />
                            ) : (
                              option.l1
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="casino-nation-name d-none"></div>
                    </div>
                  </div>
                )
              ))}
            </div>

            {isMobile ? (
              <div className="aaa-oe-mobile-grid">
                {/* Even */}
                <div className="aaa-oe-mobile-wrapper" onClick={() => handleOddsClick(evenOddOptions[0]?.nat, evenOddOptions[0]?.b1, evenOddOptions[0]?.sid, true)}>
                  <div className="aaa-oe-odds-label">
                    {evenOddOptions[0]?.b1 === "0.00" || evenOddOptions[0]?.b1 === 0 ? "0" : (evenOddOptions[0]?.b1 || "-")}
                  </div>
                  <div className="aaa-oe-mobile-btn"
                    style={{ backgroundColor: (evenOddOptions[0]?.b1 === "0.00" || evenOddOptions[0]?.b1 === 0) ? (isLight ? "#d6dedbd6" : "#363636") : (isLight ? "#eef6fb" : "#3f5667"), position: "relative" }}>
                    {evenOddOptions[0]?.b1 === "0.00" || evenOddOptions[0]?.b1 === 0 ? <img src={getImage('lock', 'images', 'svg')} alt="lock" style={{ width: '15px', filter: isLight ? 'none' : 'brightness(0) invert(1)' }} /> : <span>Even</span>}
                    {renderExposure(evenOddOptions[0]?.sid, true)}
                  </div>
                </div>
                {/* Odd */}
                <div className="aaa-oe-mobile-wrapper" onClick={() => handleOddsClick(evenOddOptions[1]?.nat, evenOddOptions[1]?.b1, evenOddOptions[1]?.sid, true)}>
                  <div className="aaa-oe-odds-label">
                    {evenOddOptions[1]?.b1 === "0.00" || evenOddOptions[1]?.b1 === 0 ? "0" : (evenOddOptions[1]?.b1 || "-")}
                  </div>
                  <div className="aaa-oe-mobile-btn"
                    style={{ backgroundColor: (evenOddOptions[1]?.b1 === "0.00" || evenOddOptions[1]?.b1 === 0) ? (isLight ? "#d6dedbd6" : "#363636") : (isLight ? "#eef6fb" : "#3f5667"), position: "relative" }}>
                    {evenOddOptions[1]?.b1 === "0.00" || evenOddOptions[1]?.b1 === 0 ? <img src={getImage('lock', 'images', 'svg')} alt="lock" style={{ width: '15px', filter: isLight ? 'none' : 'brightness(0) invert(1)' }} /> : <span>Odd</span>}
                    {renderExposure(evenOddOptions[1]?.sid, true)}
                  </div>
                </div>

                {/* Black (Spade/Club) */}
                <div className="aaa-oe-mobile-wrapper" onClick={() => handleOddsClick("Black", colorOptions[0]?.b1, colorOptions[0]?.sid, true)}>
                  <div className="aaa-oe-odds-label">
                    {colorOptions[0]?.b1 === "0.00" || colorOptions[0]?.b1 === 0 ? "0" : (colorOptions[0]?.b1 || "-")}
                  </div>
                  <div className="aaa-oe-mobile-btn"
                    style={{ backgroundColor: (colorOptions[0]?.b1 === "0.00" || colorOptions[0]?.b1 === 0) ? (isLight ? "#d6dedbd6" : "#363636") : (isLight ? "#eef6fb" : "#3f5667"), position: "relative" }}>
                    {colorOptions[0]?.b1 === "0.00" || colorOptions[0]?.b1 === 0 ? <img src={getImage('lock', 'images', 'svg')} alt="lock" style={{ width: '15px', filter: isLight ? 'none' : 'brightness(0) invert(1)' }} /> : (
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <img src={getImage('spade', 'cards')} alt="S" style={{ width: "20px" }} />
                        <img src={getImage('club', 'cards')} alt="C" style={{ width: "20px" }} />
                      </div>
                    )}
                    {renderExposure(colorOptions[0]?.sid, true)}
                  </div>
                </div>
                {/* Red (Heart/Diamond) */}
                <div className="aaa-oe-mobile-wrapper" onClick={() => handleOddsClick("Red", colorOptions[1]?.b1, colorOptions[1]?.sid, true)}>
                  <div className="aaa-oe-odds-label">
                    {colorOptions[1]?.b1 === "0.00" || colorOptions[1]?.b1 === 0 ? "0" : (colorOptions[1]?.b1 || "-")}
                  </div>
                  <div className="aaa-oe-mobile-btn"
                    style={{ backgroundColor: (colorOptions[1]?.b1 === "0.00" || colorOptions[1]?.b1 === 0) ? (isLight ? "#d6dedbd6" : "#363636") : (isLight ? "#eef6fb" : "#3f5667"), position: "relative" }}>
                    {colorOptions[1]?.b1 === "0.00" || colorOptions[1]?.b1 === 0 ? <img src={getImage('lock', 'images', 'svg')} alt="lock" style={{ width: '15px', filter: isLight ? 'none' : 'brightness(0) invert(1)' }} /> : (
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <img src={getImage('heart', 'cards')} alt="H" style={{ width: "20px" }} />
                        <img src={getImage('diamond', 'cards')} alt="D" style={{ width: "20px" }} />
                      </div>
                    )}
                    {renderExposure(colorOptions[1]?.sid, true)}
                  </div>
                </div>

                {/* Under 7 */}
                <div className="aaa-oe-mobile-wrapper" onClick={() => handleOddsClick(underOverOptions[0]?.nat, underOverOptions[0]?.b1, underOverOptions[0]?.sid, true)}>
                  <div className="aaa-oe-odds-label">
                    {underOverOptions[0]?.b1 === "0.00" || underOverOptions[0]?.b1 === 0 ? "0" : (String(underOverOptions[0]?.b1 || "-").replace(".00", ""))}
                  </div>
                  <div className="aaa-oe-mobile-btn"
                    style={{ backgroundColor: (underOverOptions[0]?.b1 === "0.00" || underOverOptions[0]?.b1 === 0) ? (isLight ? "#d6dedbd6" : "#363636") : (isLight ? "#eef6fb" : "#3f5667"), position: "relative" }}>
                    {underOverOptions[0]?.b1 === "0.00" || underOverOptions[0]?.b1 === 0 ? <img src={getImage('lock', 'images', 'svg')} alt="lock" style={{ width: '15px', filter: isLight ? 'none' : 'brightness(0) invert(1)' }} /> : <span>Under 7</span>}
                    {renderExposure(underOverOptions[0]?.sid, true)}
                  </div>
                </div>
                {/* Over 7 */}
                <div className="aaa-oe-mobile-wrapper" onClick={() => handleOddsClick(underOverOptions[1]?.nat, underOverOptions[1]?.b1, underOverOptions[1]?.sid, true)}>
                  <div className="aaa-oe-odds-label">
                    {underOverOptions[1]?.b1 === "0.00" || underOverOptions[1]?.b1 === 0 ? "0" : (String(underOverOptions[1]?.b1 || "-").replace(".00", ""))}
                  </div>
                  <div className="aaa-oe-mobile-btn"
                    style={{ backgroundColor: (underOverOptions[1]?.b1 === "0.00" || underOverOptions[1]?.b1 === 0) ? (isLight ? "#d6dedbd6" : "#363636") : (isLight ? "#eef6fb" : "#3f5667"), position: "relative" }}>
                    {underOverOptions[1]?.b1 === "0.00" || underOverOptions[1]?.b1 === 0 ? <img src={getImage('lock', 'images', 'svg')} alt="lock" style={{ width: '15px', filter: isLight ? 'none' : 'brightness(0) invert(1)' }} /> : <span>Over 7</span>}
                    {renderExposure(underOverOptions[1]?.sid, true)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="row row5 aaa-oe">
                <div className="col-lg-4 col-12">
                  <div className="casino-box-row">
                    <div className="casino-bl-box"
                      onClick={() =>
                        handleOddsClick(
                          evenOddOptions[0]?.nat,
                          evenOddOptions[0]?.b1,
                          evenOddOptions[0]?.sid,
                          true
                        )
                      }
                      style={{
                        cursor: "pointer",
                        position: "relative"
                      }}
                    >
                      <b>{evenOddOptions[0]?.b1 || "0.00"}</b>
                      {renderExposure(evenOddOptions[0]?.sid)}
                    </div>
                    <div className="casino-bl-box"
                      onClick={() =>
                        handleOddsClick(
                          evenOddOptions[1]?.nat,
                          evenOddOptions[1]?.b1,
                          evenOddOptions[1]?.sid,
                          true
                        )
                      }
                      style={{
                        cursor: "pointer",
                        position: "relative"
                      }}
                    >
                      <b>{evenOddOptions[1]?.b1 || "0.00"}</b>
                      {renderExposure(evenOddOptions[1]?.sid)}
                    </div>
                  </div>
                  <div className="casino-box-row">
                    {evenOddOptions.map((option) => (
                      <div className="casino-bl-box" key={option.sid}>
                        <div
                          className={`back casino-bl-box-item ${option.b1 === "0.00" || option.b1 === 0 || option.gstatus === "SUSPENDED" || option.gstatus === "suspended" ? "suspended" : ""}`}
                          onClick={() =>
                            handleOddsClick(
                              option.nat,
                              option.b1,
                              option.sid,
                              true
                            )
                          }
                          style={{
                            cursor: "pointer",
                            backgroundColor: (option.b1 === "0.00" || option.b1 === 0) ? (isLight ? "#d6dedbd6" : undefined) : (isLight ? "#eef6fb" : undefined)
                          }}
                        >
                          <span className="casino-box-odd">
                            {!option.b1 || option.b1 === "0.00" ? (
                              <img src={getImage('lock', 'images', 'svg')} alt="lock" style={{ width: '15px', filter: isLight ? 'none' : 'brightness(0) invert(1)' }} />
                            ) : (
                              option.nat
                            )}
                          </span>
                          <span className="d-none">0</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-lg-4 col-12">
                  <div className="casino-box-row">
                    <div className="casino-bl-box"
                      onClick={() =>
                        handleOddsClick(
                          "Black",
                          colorOptions[0]?.b1,
                          colorOptions[0]?.sid,
                          true
                        )
                      }
                      style={{
                        cursor: "pointer",
                        position: "relative"
                      }}
                    >
                      <b>{colorOptions[0]?.b1 || "0.00"}</b>
                      {renderExposure(colorOptions[0]?.sid)}
                    </div>
                    <div className="casino-bl-box"
                      onClick={() =>
                        handleOddsClick(
                          "Red",
                          colorOptions[1]?.b1,
                          colorOptions[1]?.sid,
                          true
                        )
                      }
                      style={{
                        cursor: "pointer",
                        position: "relative"
                      }}
                    >
                      <b>{colorOptions[1]?.b1 || "0.00"}</b>
                      {renderExposure(colorOptions[1]?.sid)}
                    </div>
                  </div>
                  <div className="casino-box-row">
                    <div className="casino-bl-box">
                      <div
                        className={`back casino-bl-box-item casino-card-img ${colorOptions[0]?.b1 === "0.00" || colorOptions[0]?.b1 === 0 || colorOptions[0]?.gstatus === "SUSPENDED" || colorOptions[0]?.gstatus === "suspended" ? "suspended" : ""}`}
                        onClick={() =>
                          handleOddsClick(
                            "Black",
                            colorOptions[0]?.b1,
                            colorOptions[0]?.sid,
                            true
                          )
                        }
                        style={{
                          cursor: "pointer",
                        }}
                      >
                        <span>
                          <img
                            src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/spade.png"
                            alt="Spade"
                          />
                          <img
                            src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/club.png"
                            alt="Club"
                          />
                        </span>
                        <span className="d-none">0</span>
                      </div>
                    </div>
                    <div className="casino-bl-box">
                      <div
                        className={`back casino-bl-box-item casino-card-img ${colorOptions[1]?.b1 === "0.00" || colorOptions[1]?.b1 === 0 || colorOptions[1]?.gstatus === "SUSPENDED" || colorOptions[1]?.gstatus === "suspended" ? "suspended" : ""}`}
                        onClick={() =>
                          handleOddsClick(
                            "Red",
                            colorOptions[1]?.b1,
                            colorOptions[1]?.sid,
                            true
                          )
                        }
                        style={{
                          cursor: "pointer",
                        }}
                      >
                        <span className="casino-box-odd">
                          {colorOptions[1]?.b1 === "0.00" || colorOptions[1]?.b1 === 0 ? (
                            <img src={getImage('lock', 'images', 'svg')} alt="lock" style={{ width: '15px', filter: isLight ? 'none' : 'brightness(0) invert(1)' }} />
                          ) : (
                            <>
                              <img
                                src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/heart.png"
                                alt="Heart"
                              />
                              <img
                                src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/diamond.png"
                                alt="Diamond"
                              />
                            </>
                          )}
                        </span>
                        <span className="d-none">0</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-12">
                  <div className="casino-box-row">
                    <div className="casino-bl-box"
                      onClick={() =>
                        handleOddsClick(
                          underOverOptions[0]?.nat,
                          underOverOptions[0]?.b1,
                          underOverOptions[0]?.sid,
                          true
                        )
                      }
                      style={{
                        cursor: "pointer",
                        position: "relative"
                      }}
                    >
                      <b>{(underOverOptions[0]?.b1 || "0").toString().replace(".00", "")}</b>
                      {renderExposure(underOverOptions[0]?.sid)}
                    </div>
                    <div className="casino-bl-box"
                      onClick={() =>
                        handleOddsClick(
                          underOverOptions[1]?.nat,
                          underOverOptions[1]?.b1,
                          underOverOptions[1]?.sid,
                          true
                        )
                      }
                      style={{
                        cursor: "pointer",
                        position: "relative"
                      }}
                    >
                      <b>{(underOverOptions[1]?.b1 || "0").toString().replace(".00", "")}</b>
                      {renderExposure(underOverOptions[1]?.sid)}
                    </div>
                  </div>
                  <div className="casino-box-row">
                    {underOverOptions.map((option) => (
                      <div className="casino-bl-box" key={option.sid}>
                        <div
                          className={`back casino-bl-box-item ${option.b1 === "0.00" || option.b1 === 0 || option.gstatus === "SUSPENDED" || option.gstatus === "suspended" ? "suspended" : ""}`}
                          onClick={() =>
                            handleOddsClick(
                              option.nat,
                              option.b1,
                              option.sid,
                              true
                            )
                          }
                          style={{
                            cursor: "pointer",
                            backgroundColor: (option.b1 === "0.00" || option.b1 === 0) ? (isLight ? "#d6dedbd6" : undefined) : (isLight ? "#eef6fb" : undefined)
                          }}
                        >
                          <span className="casino-box-odd">
                            {!option.b1 || option.b1 === "0.00" ? (
                              <img src={getImage('lock', 'images', 'svg')} alt="lock" style={{ width: '15px', filter: isLight ? 'none' : 'brightness(0) invert(1)' }} />
                            ) : (
                              option.nat
                            )}
                          </span>
                          <span className="d-none">0</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="mt-2">
              <div className="individual-cards-container">
                <div
                  className="group-odds-label"
                  style={{
                    marginBottom: 10,
                    display: "block",
                    backgroundColor: isLight ? "#ccc" : "#444",
                    color: isLight ? "#000" : "#ddd",
                    fontWeight: "bold",
                    textAlign: "center",
                    paddingTop: 5,
                    paddingBottom: 5,
                    width: "98vw"
                  }}
                >
                  {cardOptions.length > 0 && isSuspended(getOddsBySid(cardOptions[0].sid)?.gstatus) ? "0" : "12"}
                </div>
                <div className="cards-grid">
                  {cardOptions.map((card, idx) => {
                    const cardCode = card.nat.split(" ")[1] || card.nat;
                    return (
                      <CardBox key={card.sid} sid={card.sid} cardVal={cardCode} teamName={card.nat} />
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    </>
  );
};

export default AAA;
