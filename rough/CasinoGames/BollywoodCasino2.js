import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { fetchCasinoExposureApi, fetchOpenBetsApi } from "../../api/api";
import Modal from "react-modal";
import useIsMobile from "../../hooks/useIsMobile";
import CasinoVideo from "./components/CasinoVideo";
import BetList from "./components/BetList";

// Helper function to get card image URL
const getCardImage = (cardCode) => {
  if (!cardCode) return "/assets/cards_new/1.png";

  const baseUrl = "/assets/cards_new";
  const cardMap = {
    A: "ASS",
    J: "JSS",
    Q: "QSS",
    K: "KSS",
  };

  // Check if it's a face card or number card
  const cardValue = cardMap[cardCode] || cardCode;
  return `${baseUrl}/${cardValue}.png`;
};

const BollywoodCasino2 = ({ isVisible, onBetSelection, exposureTrigger }) => {
  const [gameData, setGameData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(false);
  const [exposureData, setExposureData] = useState([]);
  const [openBets, setOpenBets] = useState([]);
  const [isMyBetsModalOpen, setIsMyBetsModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const socketRef = useRef(null);

  useEffect(() => {
    const loadOpenBets = async () => {
      const currentEventId = gameData?.t1?.[0]?.mid || "1";
      try {
        const res = await fetchOpenBetsApi({
          markettype: "B_TABLE2",
          eventId: currentEventId,
          curPageName: "live_btable2.php",
        });

        let newBets = [];
        if (res?.open_bet_data && Array.isArray(res.open_bet_data)) {
          newBets = res.open_bet_data;
        } else if (res?.data && Array.isArray(res.data)) {
          newBets = res.data;
        } else if (Array.isArray(res)) {
          newBets = res;
        }

        setOpenBets(newBets);
      } catch (error) {
        console.error("Error fetching open bets:", error);
      }
    };

    loadOpenBets();
  }, [gameData?.t1?.[0]?.mid, exposureTrigger]);

  const fetchExposure = async () => {
    try {
      const response = await fetchCasinoExposureApi({
        markettype: "B_TABLE2",
        main_event_id: gameData?.t1?.[0]?.mid,
        curPageName: "live_btable2.php",
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
    const market = exposureData.find(
      (item) => String(item.market_id) === String(sid),
    );
    return market ? market.win_loss || market.total_exposure : 0;
  };

  const renderExposure = (sid, isAbsolute = false, customStyle = {}, className = "") => {
    const exposure = getExposure(sid);
    if (exposure === 0) return null;
    return (
      <div
        className={className}
        style={
          isAbsolute
            ? {
              position: "absolute",
              bottom: "1px",
              left: "0",
              width: "100%",
              textAlign: "center",
              color: exposure > 0 ? "#39FF39" : "#FF0000",
              fontSize: "12px",
              // fontWeight: "bold",
              lineHeight: "1",
              pointerEvents: "none",
              zIndex: 10,
              ...customStyle,
            }
            : {
              color: exposure > 0 ? "#39FF39" : "#FF0000",
              fontSize: "12px",
              // fontWeight: "bold",
              textAlign: "center",
              marginTop: "2px",
              zIndex: 10,
              ...customStyle,
            }
        }
      >
        {exposure.toLocaleString()}
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

    socket.on("connect", () => {
      console.log("✅ BTable2 Connected:", socket.id);
      socket.emit("Room", "btable2");
    });

    socket.on("btable2", handleBollywoodData);
    socket.on("game", handleBollywoodData);

    socket.on("disconnect", (reason) => {
      console.log("⚠️ BTable2 Disconnected:", reason);
      if (reason === "io server disconnect") {
        setTimeout(() => socket.connect(), 1000);
      }
    });

    socket.on("connect_error", (error) => {
      setTimeout(() => socket.connect(), 2000);
    });

    socket.on("reconnect", (attemptNumber) => {
      socket.emit("Room", "btable2");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const currentGame = gameData?.t1?.[0];
  const bettingOptions = gameData?.t2 || [];

  // Categorize betting options
  // Assuming standard order for Bollywood Table
  const mainOptions = bettingOptions.slice(0, 6); // First 6 are A-F
  const oddOption =
    bettingOptions.find((opt) => opt.nat === "Odd" || opt.nat === "ODD") ||
    bettingOptions[6];
  const dulhaOption =
    bettingOptions.find((opt) => opt.nat?.includes("Dulha")) ||
    bettingOptions[7];
  const baratiOption =
    bettingOptions.find((opt) => opt.nat?.includes("Barati")) ||
    bettingOptions[8];

  // Suits usually follow. Left (Black/SpadeClub), Right (Red/HeartDiamond)
  // Assuming next 2 are suits
  const suitOptions = bettingOptions.filter(
    (opt) =>
      opt.nat?.includes("Spade") ||
      opt.nat?.includes("Heart") ||
      opt.nat?.includes("Black") ||
      opt.nat?.includes("Red"),
  );
  // If undefined by name, fallback to index
  const suits = (suitOptions.length >= 2 ? suitOptions : bettingOptions.slice(9, 11))
    .sort((a, b) => {
      const isABlack = a.nat?.toLowerCase().includes("black") || a.nat?.toLowerCase().includes("spade") || a.nat?.toLowerCase().includes("club");
      const isBBlack = b.nat?.toLowerCase().includes("black") || b.nat?.toLowerCase().includes("spade") || b.nat?.toLowerCase().includes("club");
      if (isABlack && !isBBlack) return -1;
      if (!isABlack && isBBlack) return 1;
      return 0;
    });

  // Cards J, Q, K, A
  const cardOptions = bettingOptions.filter((opt) =>
    ["J", "Q", "K", "A"].includes(opt.nat),
  );
  const cards =
    cardOptions.length >= 4 ? cardOptions : bettingOptions.slice(11, 15);

  const getTimerColorClass = () => {
    const timerValue = parseInt(timeLeft) || 0;
    if (timerValue <= 5) return "red";
    if (timerValue <= 10) return "orange";
    return "green";
  };

  const getOddsBySid = (sid) => {
    return gameData?.t2?.find((item) => item.sid === sid);
  };

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
        eventId: currentGame?.mid,
      });
    }
  };

  useEffect(() => {
    const initialTime = currentGame?.autotime
      ? parseInt(currentGame.autotime, 10)
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
  }, [currentGame?.mid, currentGame?.autotime]);

  const renderLock = () => <img src="/assets/images/lock.svg" alt="lock" style={{ width: "15px", filter: "brightness(0) invert(1)" }} />;

  return (
    <>
      <BetList
        isMobile={isMobile}
        openBets={openBets}
        isOpen={isMyBetsModalOpen}
        onOpen={() => setIsMyBetsModalOpen(true)}
        onClose={() => setIsMyBetsModalOpen(false)}
      />

      <div className="casino-table aaa kk result-32cards-container">
        <CasinoVideo
          gameName="Bollywood Casino 2"
          roundId={currentGame?.mid}
          videoSrc="https://casino.diamondcricketid.com/swiftdizire/?id=3070"
          isCardDrawerOpen={isCardDrawerOpen}
          setIsCardDrawerOpen={setIsCardDrawerOpen}
          autotime={currentGame?.autotime}
          totalTime={currentGame?.ft}
          cards={[currentGame?.C1]}
          drawerStyle={{
            top: "80px",
            transform: "unset",
            width: "45px",
            padding: "5px 10px 5px 5px",
            height: "45px",
          }}
          CardsComponent={() => (
            <>
              {currentGame?.C1 && (
                <div>
                  <span>
                    <img src={getCardImage(currentGame.C1)} alt="" />
                  </span>
                </div>
              )}
            </>
          )}
        />

        <div className="casino-detail">
          <div className="container-fluid container-fluid-5">
            {/* Main Markets A-F */}
            <div className="row row5 d-none-small">
              {mainOptions.map((opt, idx) => (
                <div className="col-4" key={opt?.sid || idx}>
                  <div className="casino-box-row">
                    <div className="casino-nation-name" style={{ position: "relative" }}>
                      <b>
                        {idx === 0 && "A. DON"}
                        {idx === 1 && "B. AMAR AKBAR ANTHONY"}
                        {idx === 2 && "C. SAHIB BIBI AUR GHULAM"}
                        {idx === 3 && "D. DHARAM VEER"}
                        {idx === 4 && "E. KIS KIS KO PYAAR KAROON"}
                        {idx === 5 && "F. GHULAM"}
                        {!["0", "1", "2", "3", "4", "5"].includes(String(idx)) && opt?.nat}
                      </b>
                      {renderExposure(opt?.sid)}
                    </div>
                    <div className="casino-bl-box">
                      <div
                        className={`back casino-bl-box-item odds-text-theme ${!opt?.b1 || opt?.b1 === "0" || opt?.b1 === "0.00" ? "suspended" : ""}`}
                        style={{ position: "relative" }}
                        onClick={() =>
                          handleOddsClick(opt?.nat, opt?.b1, opt?.sid, true)
                        }
                      >
                        <span className="casino-box-odd">
                          {!opt?.b1 || opt?.b1 === "0" || opt?.b1 === "0.00"
                            ? ""
                            : opt?.b1}
                        </span>
                      </div>
                      <div
                        className={`lay casino-bl-box-item odds-text-theme ${!opt?.l1 || opt?.l1 === "0" || opt?.l1 === "0.00" ? "suspended" : ""}`}
                        style={{ position: "relative" }}
                        onClick={() =>
                          handleOddsClick(opt?.nat, opt?.l1, opt?.sid, false)
                        }
                      >
                        <span className="casino-box-odd">
                          {!opt?.l1 || opt?.l1 === "0" || opt?.l1 === "0.00"
                            ? ""
                            : opt?.l1}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile View for Main Markets */}
            <div className="row row5 d-none-desktop">
              {mainOptions.map((opt, idx) => (
                <div
                  className="col-12"
                  key={opt?.sid || idx}
                  style={{ marginBottom: "5px" }}
                >
                  <div className="d-flex w-100">
                    <div
                      className="info-box text-grey-light"
                      style={{
                        flex: 2,
                        padding: "2px 5px",
                        backgroundColor: "#444",
                        color: "#D7D7D7",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        flexDirection: 'column',
                      }}
                    >
                      <div style={{ fontWeight: "bold", fontSize: "10px", color: "#DDDDDD" }}>
                        {idx === 0 && "A. DON"}
                        {idx === 1 && "B. AMAR AKBAR ANTHONY"}
                        {idx === 2 && "C. SAHIB BIBI AUR GHULAM"}
                        {idx === 3 && "D. DHARAM VEER"}
                        {idx === 4 && "E. KIS KIS KO PYAAR KAROON"}
                        {idx === 5 && "F. GHULAM"}
                        {!["0", "1", "2", "3", "4", "5"].includes(String(idx)) && opt?.nat}
                      </div>
                      {renderExposure(opt?.sid, false, { textAlign: "left", fontSize: "8px", height: '8px', lineHeight: '8px' })}
                    </div>
                    <div
                      className={`back casino-bl-box-item odds-text-theme ${!opt?.b1 || opt?.b1 === "0" || opt?.b1 === "0.00" ? "suspended" : ""}`}
                      style={{ flex: 1, textAlign: "center", fontSize: "13px", color: "#D7D7D7" }}
                      onClick={() =>
                        handleOddsClick(opt?.nat, opt?.b1, opt?.sid, true)
                      }
                    >
                      {!opt?.b1 || opt?.b1 === "0" || opt?.b1 === "0.00"
                        ? ""
                        : opt?.b1}
                    </div>
                    <div
                      className={`lay casino-bl-box-item odds-text-theme ${!opt?.l1 || opt?.l1 === "0" || opt?.l1 === "0.00" ? "suspended" : ""}`}
                      style={{ flex: 1, textAlign: "center" }}
                      onClick={() =>
                        handleOddsClick(opt?.nat, opt?.l1, opt?.sid, false)
                      }
                    >
                      {!opt?.l1 || opt?.l1 === "0" || opt?.l1 === "0.00"
                        ? ""
                        : opt?.l1}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Secondary Markets (Odd, Dulha, Barati) */}
            <div className="row row5">
              {/* Odd */}
              <div className="col-lg-4 col-12 d-none-small">
                <div className="casino-box-row">
                  <div className="casino-nation-name" style={{ position: "relative" }}>
                    <b>{oddOption?.nat || "Odd"}</b>
                    {renderExposure(oddOption?.sid)}
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${!oddOption?.b1 || oddOption?.b1 === "0" || oddOption?.b1 === "0.00" ? "suspended" : ""}`}
                      onClick={() =>
                        handleOddsClick(
                          oddOption?.nat,
                          oddOption?.b1,
                          oddOption?.sid,
                          true,
                        )
                      }
                    >
                      <span className="casino-box-odd">
                        {!oddOption?.b1 ||
                          oddOption?.b1 === "0" ||
                          oddOption?.b1 === "0.00"
                          ? ""
                          : oddOption?.b1}
                      </span>
                    </div>
                    <div
                      className={`lay casino-bl-box-item ${!oddOption?.l1 || oddOption?.l1 === "0" || oddOption?.l1 === "0.00" ? "suspended" : ""}`}
                      onClick={() =>
                        handleOddsClick(
                          oddOption?.nat,
                          oddOption?.l1,
                          oddOption?.sid,
                          false,
                        )
                      }
                    >
                      <span className="casino-box-odd">
                        {!oddOption?.l1 ||
                          oddOption?.l1 === "0" ||
                          oddOption?.l1 === "0.00"
                          ? ""
                          : oddOption?.l1}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Mobile Odd */}
              <div className="col-12 d-none-desktop">
                <div className="d-flex w-100 mb-2">
                  <div
                    className="info-box text-grey-light odds-text-theme"
                    style={{
                      flex: 2,
                      padding: "8px 5px",
                      backgroundColor: "#444",
                      color: "#DDDDDD",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ fontSize: "10px" }}>ODD</div>
                    {renderExposure(oddOption?.sid, false, { textAlign: "left", fontSize: "8px", height: '8px', lineHeight: '8px' })}
                  </div>
                  <div
                    className={`back casino-bl-box-item odds-text-theme ${!oddOption?.b1 ||
                      oddOption?.b1 === "0" ||
                      oddOption?.b1 === "0.00"
                      ? "suspended"
                      : ""
                      }`}
                    style={{ flex: 1, textAlign: "center" }}
                    onClick={() =>
                      handleOddsClick(
                        "Odd",
                        oddOption?.b1,
                        oddOption?.sid,
                        true,
                      )
                    }
                  >
                    {!oddOption?.b1 ||
                      oddOption?.b1 === "0" ||
                      oddOption?.b1 === "0.00"
                      ? ""
                      : oddOption?.b1}
                  </div>
                  <div
                    className={`lay casino-bl-box-item odds-text-theme ${!oddOption?.l1 ||
                      oddOption?.l1 === "0" ||
                      oddOption?.l1 === "0.00"
                      ? "suspended"
                      : ""
                      }`}
                    style={{ flex: 1, textAlign: "center" }}
                    onClick={() =>
                      handleOddsClick(
                        "Odd",
                        oddOption?.l1,
                        oddOption?.sid,
                        false,
                      )
                    }
                  >
                    {!oddOption?.l1 ||
                      oddOption?.l1 === "0" ||
                      oddOption?.l1 === "0.00"
                      ? ""
                      : oddOption?.l1}
                  </div>
                </div>
              </div>

              {/* Dulha Dulhan */}
              <div className="col-lg-4 col-6 bc-fancy">
                <div className="casino-box-row">
                  <div className="casino-nation-name" style={{ position: "relative" }}>
                    <b className="text-black-theme">{!dulhaOption?.b1 || dulhaOption?.b1 === "0" || dulhaOption?.b1 === "0.00" ? "0" : "1.97"}</b>
                    {/* {renderExposure(dulhaOption?.sid)} */}
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item odds-text-theme ${!dulhaOption?.b1 || dulhaOption?.b1 === "0" || dulhaOption?.b1 === "0.00" ? "suspended" : ""}`}
                      style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", height: "45px", position: "relative" }}
                      onClick={() =>
                        handleOddsClick(
                          dulhaOption?.nat,
                          dulhaOption?.b1,
                          dulhaOption?.sid,
                          true,
                        )
                      }
                    >
                      <span className="casino-box-odd" style={{ fontWeight: "bold", color: "#D7D7D7", fontSize: "13px" }}>
                        {dulhaOption?.nat || "Dulha Dulhan K-Q"}
                      </span>
                      {renderExposure(dulhaOption?.sid)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Barati */}
              <div className="col-lg-4 col-6 bc-fancy">
                <div className="casino-box-row">
                  <div className="casino-nation-name" style={{ position: "relative" }}>
                    <b className="text-black-theme">{!baratiOption?.b1 || baratiOption?.b1 === "0" || baratiOption?.b1 === "0.00" ? "0" : "1.97"}</b>
                    {/* {renderExposure(baratiOption?.sid)} */}
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item odds-text-theme ${!baratiOption?.b1 || baratiOption?.b1 === "0" || baratiOption?.b1 === "0.00" ? "suspended" : ""}`}
                      style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", height: "45px", position: "relative" }}
                      onClick={() =>
                        handleOddsClick(
                          baratiOption?.nat,
                          baratiOption?.b1,
                          baratiOption?.sid,
                          true,
                        )
                      }
                    >
                      <span className="casino-box-odd" style={{ fontWeight: "bold", color: "#D7D7D7", fontSize: "13px" }}>
                        {baratiOption?.nat || "Barati J-A"}
                      </span>
                      {renderExposure(baratiOption?.sid)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Suits & Cards */}
            <div className="row row5">
              {/* Suits */}
              <div className="col-lg-6 col-12 aaa-oe">
                <div className="casino-box-row">
                  <div className="casino-bl-box">
                    <b className="text-black-theme">{!suits[0]?.b1 || suits[0]?.b1 === "0" || suits[0]?.b1 === "0.00" ? "0" : "1.97"}</b>
                  </div>
                  <div className="casino-bl-box">
                    <b className="text-black-theme">{!suits[1]?.b1 || suits[1]?.b1 === "0" || suits[1]?.b1 === "0.00" ? "0" : "1.97"}</b>
                  </div>
                </div>
                <div className="casino-box-row">
                  {suits.map((opt, idx) => (
                    <div className="casino-bl-box" key={opt?.sid || idx}>
                      <div
                        className={`back casino-bl-box-item odds-text-theme casino-card-img ${!opt?.b1 || opt?.b1 === "0" || opt?.b1 === "0.00" ? "suspended" : ""}`}
                        style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", padding: "5px", position: "relative" }}
                        onClick={() =>
                          handleOddsClick(opt?.nat, opt?.b1, opt?.sid, true)
                        }
                      >
                        <span style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                          {opt?.nat?.toLowerCase().includes("black") || opt?.nat?.toLowerCase().includes("spade") || opt?.nat?.toLowerCase().includes("club") ? (
                            <>
                              <img src="/assets/cards_new/spade.png" alt="" />
                              <img src="/assets/cards_new/club.png" alt="" />
                            </>
                          ) : (
                            <>
                              <img src="/assets/cards_new/heart.png" alt="" />
                              <img src="/assets/cards_new/diamond.png" alt="" />
                            </>
                          )}
                        </span>
                        {renderExposure(opt?.sid)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cards */}
              <div className="col-lg-6 col-12">
                <div className="text-center w-100">
                  <div className="casino-bl-box">
                    <div className="casino-bl-box-item odds-text-theme">
                      <b style={{ color: "#AAAFB5" }}>Cards {cards.every(opt => !opt || opt?.gstatus !== "OPEN" || !opt?.b1 || opt?.b1 === "0" || opt?.b1 === "0.00") ? "0" : "3.75"}</b>
                    </div>
                  </div>
                </div>
                <div className="casino-cards text-center mt-1">
                  {["J", "Q", "K", "A"].map((cardName) => {
                    const opt = bettingOptions.find(
                      (o) =>
                        o.nat === `Card ${cardName}` ||
                        o.nat === `card ${cardName}` ||
                        o.nat === cardName,
                    );

                    return (
                      <div
                        className="casino-card-item"
                        key={cardName}
                        style={{ padding: "5px" }}
                        onClick={() =>
                          opt &&
                          handleOddsClick(opt?.nat, opt?.b1, opt?.sid, true)
                        }
                      >
                        <div
                          className="card-image"
                          style={{
                            padding: "2px",
                            position: "relative",
                          }}
                        >
                          <img
                            src={`/assets/cards_new/lucky6/${cardName}.png`}
                            alt={cardName}
                            style={{ display: "block" }}
                          />
                          {(!opt ||
                            opt?.gstatus !== "OPEN" ||
                            !opt?.b1 ||
                            opt?.b1 === "0" ||
                            opt?.b1 === "0.00") && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  background: "rgba(0,0,0,0.6)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#D7D7D7",
                                  fontSize: "20px",
                                }}
                              >
                                {renderLock()}
                              </div>
                            )}
                        </div>
                        {renderExposure(opt?.sid, false, { lineHeight: "0px" })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BollywoodCasino2;
