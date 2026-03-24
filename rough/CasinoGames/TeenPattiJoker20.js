import React, { useState, useEffect, useRef } from "react";
import { fetchCasinoExposureApi } from "../../api/api";
import { useSocket } from "../../components/Socket/useSocket";
import { getExposureClass, getImage, getValueAfterDot, getValueBeforeDot } from "../../utilies/helpers";
import useIsMobile from "../../hooks/useIsMobile";
import CasinoVideo from "./components/CasinoVideo";
import { useGetFileData } from "../../hooks/useGetFileData";
import { useSelector } from "react-redux";

const TeenPattiJoker20 = ({ onBetSelection, lastBetTime, exposureTrigger }) => {
  const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [gameData, setGameData] = useState(null);
  const [exposureData, setExposureData] = useState([]);
  const isMobile = useIsMobile();
  const isLight = useSelector(state => state.action.theme) === "light";

  // State for mobile view check (consistent with InstantTeenPatti2 approach)
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchExposure = async () => {
      if (!gameData?.t1?.[0]?.mid) return;
      try {
        const response = await fetchCasinoExposureApi({
          markettype: CODE,
          main_event_id: gameData.t1[0].mid,
          curPageName: phpFile,
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

  const renderExposure = (marketId, isAbsolute = false) => {
    const exposure = getExposure(marketId);
    if (exposure === 0) return null;
    return (
      // <span
      //   style={{
      //     color: exposure >= 0 ? "green" : "red",
      //     position: isAbsolute ? "absolute" : "relative",
      //     zIndex: 101,
      //     marginTop: isAbsolute ? "0" : "18px",
      //     display: "block",
      //     bottom: isAbsolute ? "1px" : "auto",
      //     fontSize: isAbsolute ? "11px" : "inherit",
      //     width: isAbsolute ? "100%" : "auto",
      //     textAlign: "center",
      //     left: 0,
      //   }}
      // >
      <span className={`mr-2 ${getExposureClass(exposure)}`}>
        {exposure}
      </span>
    );
  };

  const socket = useSocket("casino");
  useEffect(() => {
    if (!socket) return;

    const handleData = (data) => {
      try {
        const payload = Array.isArray(data) ? data[0] : data;
        if (payload) {
          setGameData(payload);
        }
      } catch (error) {
        console.error("Error processing game data:", error);
      }
    };

    const handleConnect = () => {
      console.log(`✅ ${game_type} Connected:`, socket.id);
      socket.emit("Room", game_type);
    };

    const handleDisconnect = (reason) => {
      console.log(`⚠️ ${game_type} Disconnected:`, reason);
    };

    const handleConnectError = (error) => {
      console.error("🔴 Connection Error:", error.message);
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);
    socket.on(game_type, handleData);
    socket.on("game", handleData);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off(game_type, handleData);
      socket.off("game", handleData);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [socket, game_type]);

  const getCardImage = (cardCode) => {
    if (!cardCode || cardCode === "1")
      return "https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png";
    return `https://wver.sprintstaticdata.com/v190/static/front/img/cards/${cardCode}.png`;
  };

  const isSuspended = (status) => {
    if (!status) return false;
    const s = status.toString().toUpperCase();
    return s === "SUSPENDED" || s === "0" || s === "BALL RUNNING";
  };

  const getSuspendedClass = (status) => {
    return isSuspended(status) ? "suspended" : "";
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
    if (!isSuspended(getOddsBySid(sid)?.gstatus) && onBetSelection) {
      onBetSelection({
        teamName,
        odds,
        minBet: min,
        maxBet: max,
        isBack,
        marketId: sid,
        eventId: getValueAfterDot(gameData?.t1?.[0]?.mid),
      });
    }
  };

  const getOddsBySid = (sid) => {
    return gameData?.t2?.find((item) => item.sid == sid);
  };

  const VideoCards = () => {
    return (
      <div className="casino-video-cards-container">
        <div
          style={{
            justifyContent: "flex-start",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <span
            style={{
              color: "#fdcf13",
              fontWeight: "bold",
              marginBottom: "4px",
              textTransform: "uppercase",
              fontSize: "20px",
              fontFamily: "antonio",
              textShadow: "0 0 1px var(--text-yellow)",
            }}
          >
            JOKER
          </span>
          <span>
            <img src={getCardImage(gameData?.t1?.[0]?.C1)} alt="card" />
          </span>
        </div>
        <div style={{ justifyContent: "flex-start" }}>
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
        <div style={{ justifyContent: "flex-start" }}>
          <span>
            <img src={getCardImage(gameData?.t1?.[0]?.C3)} alt="card" />
          </span>
          <span>
            <img src={getCardImage(gameData?.t1?.[0]?.C5)} alt="card" />
          </span>
          <span>
            <img src={getCardImage(gameData?.t1?.[0]?.C7)} alt="card" />
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          :root[data-theme="light"] .teenpatti-mobile-container {
            color: #333;
          }
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

          .joker-odds-box {
            position: relative;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
          }
          .joker-odds-box.has-exposure {
            padding-bottom: 10px !important;
          }
          .joker-odds-box.suspended:before {
            background-position: center center !important;
          }
          .joker-odds-box.suspended.has-exposure:before {
            background-position: center 2px !important;
          }
        `}
      </style>

      <div className="casino-table teenpatti-new kk">
        {/* Video Section */}
        <CasinoVideo
          gameName={game_name}
          roundId={gameData?.t1?.[0]?.mid}
          videoSrc={iframe_url}
          autotime={gameData?.t1?.[0]?.autotime}
          totalTime={gameData?.t1?.[0]?.ft} isCardDrawerOpen={isDrawerOpen}
          setIsCardDrawerOpen={setIsDrawerOpen}
          cards={[gameData?.t1?.[0]?.C1, gameData?.t1?.[0]?.C2, gameData?.t1?.[0]?.C3, gameData?.t1?.[0]?.C4, gameData?.t1?.[0]?.C5, gameData?.t1?.[0]?.C6, gameData?.t1?.[0]?.C7]}
          CardsComponent={VideoCards}
          drawerHeight="170px"
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
                    color: #ccc;
                    font-family: sans-serif;
                  }
                  .mobile-section-container {
                    margin-bottom: 5px;
                  }
                  .mobile-section-header {
                    display: flex;
                    justify-content: space-between;
                    background-color: transparent;
                    padding: 5px 2px;
                    font-size: 12px;
                    font-weight: bold;
                    color: #999;
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
                    background-color: transparent;
                    padding: 0;
                    margin-bottom: 5px;
                    border-bottom: none;
                    gap: 2px;
                  }
                   .mobile-row:last-child { margin-bottom: 0; }
                  
                  :root[data-theme="light"] .mobile-row-label {
                    background-color: #00000047;
                    color: #333;
                  }
                  .mobile-row-label {
                    flex: 1.5;
                    height: 35px;
                    display: flex;
                    align-items: center;
                    background-color: #444;
                    font-size: 18px;
                    font-weight: bold;
                    padding-left: 8px;
                    color: #eee;
                    margin-right: 0 !important;
                    border-radius: 0 !important;
                    justify-content: space-between;
                    padding-right: 5px;
                  }

                  .mobile-odds-box {
                    flex: 0.7;
                    height: 35px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 !important;
                    border-radius: 0 !important;
                    font-weight: bold;
                    font-size: 14px;
                    cursor: pointer;
                    background-color: #2a2a2a;
                    color: #fff;
                  }
                  
                   .mobile-odds-box.back { border: 2px solid #72bbef; background-color: transparent; color: #ccc; }
                   .mobile-odds-box.lay { border: 2px solid #fca4b7; background-color: transparent; color: #ccc; }

                   .mobile-odds-box.suspended {
                       background-color: #222;
                        border-color: #555;
                        color: #555;
                        cursor: not-allowed;
                   }
                   .mobile-odds-box i { font-size: 12px; }

                    /* Market dividers */
                   .market-section-title {
                        color: #fdcf13;
                        font-size: 12px;
                        font-weight: bold;
                        padding: 5px;
                        // background: #2e3439;
                        margin-bottom: 4px;
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
                    .remark-icon {
                        display: flex;
                        align-items: center;
                    }
                `}
              </style>

              {/* MAIN SECTION */}
              <div className="mobile-section-container">
                {/* Player A */}
                <div className="mobile-row">
                  <div className="mobile-row-label">
                    <span>Player A</span> {renderExposure(1)}
                  </div>
                  <div
                    className={`mobile-odds-box back ${getSuspendedClass(
                      getOddsBySid(1)?.gstatus
                    )}`}
                    onClick={() =>
                      handleOddsClick("Player A", getOddsBySid(1)?.b1, 1, true)
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
                      handleOddsClick("Player A", getOddsBySid(1)?.l1, 1, false)
                    }
                  >
                    {!isSuspended(getOddsBySid(1)?.gstatus) ? (
                      getOddsBySid(1)?.l1
                    ) : (
                      <i className="fas fa-lock"></i>
                    )}
                  </div>
                </div>

                {/* Player B */}
                <div className="mobile-row">
                  <div className="mobile-row-label">
                    <span>Player B</span> {renderExposure(2)}
                  </div>
                  <div
                    className={`mobile-odds-box back ${getSuspendedClass(
                      getOddsBySid(2)?.gstatus
                    )}`}
                    onClick={() =>
                      handleOddsClick("Player B", getOddsBySid(2)?.b1, 2, true)
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
                      handleOddsClick("Player B", getOddsBySid(2)?.l1, 2, false)
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

              {/* JOKER SECTION */}
              <div className="mobile-section-container">
                <div
                  className="market-section-title"
                  style={{ textAlign: "center", color: "#fdcf13" }}
                >
                  Joker
                </div>

                {/* Joker Row 1: Even/Odd/Red/Black */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: "2px",
                    marginBottom: "5px",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      color: isLight ? "#333" : "#ccc",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {getOddsBySid(3)?.b1}
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      color: isLight ? "#333" : "#ccc",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {getOddsBySid(4)?.b1}
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      color: isLight ? "#333" : "#ccc",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {getOddsBySid(5)?.b1}
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      color: isLight ? "#333" : "#ccc",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {getOddsBySid(6)?.b1}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: "2px",
                    marginBottom: "5px",
                  }}
                >
                  {/* Even - SID 3 */}
                  <div
                    className={`mobile-odds-box back joker-odds-box ${getExposure(3) !== 0 ? "has-exposure" : ""
                      } ${getSuspendedClass(getOddsBySid(3)?.gstatus)}`}
                    style={{
                      height: "40px",
                      color: isLight ? "#333" : "#ccc",
                      fontWeight: "bold",
                    }}
                    onClick={() =>
                      handleOddsClick(
                        "Joker Even",
                        getOddsBySid(3)?.b1,
                        3,
                        true
                      )
                    }
                  >
                    Even
                    {renderExposure(3, true)}
                  </div>
                  {/* Odd - SID 4 */}
                  <div
                    className={`mobile-odds-box back joker-odds-box ${getExposure(4) !== 0 ? "has-exposure" : ""
                      } ${getSuspendedClass(getOddsBySid(4)?.gstatus)}`}
                    style={{
                      height: "40px",
                      color: isLight ? "#333" : "#ccc",
                      fontWeight: "bold",
                    }}
                    onClick={() =>
                      handleOddsClick("Joker Odd", getOddsBySid(4)?.b1, 4, true)
                    }
                  >
                    Odd
                    {renderExposure(4, true)}
                  </div>
                  {/* Red - SID 5 */}
                  <div
                    className={`mobile-odds-box back joker-odds-box ${getExposure(5) !== 0 ? "has-exposure" : ""
                      } ${getSuspendedClass(getOddsBySid(5)?.gstatus)}`}
                    style={{ height: "40px" }}
                    onClick={() =>
                      handleOddsClick("Joker Red", getOddsBySid(5)?.b1, 5, true)
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "5px",
                        padding: "5px 0",
                      }}
                    >
                      <img
                        src="/assets/cards_new/heart.png"
                        width="20"
                        alt="hrt"
                      />
                      <img
                        src="/assets/cards_new/diamond.png"
                        width="20"
                        alt="dia"
                      />
                    </div>
                    {renderExposure(5, true)}
                  </div>
                  {/* Black - SID 6 */}
                  <div
                    className={`mobile-odds-box back joker-odds-box ${getExposure(6) !== 0 ? "has-exposure" : ""
                      } ${getSuspendedClass(getOddsBySid(6)?.gstatus)}`}
                    style={{ height: "40px" }}
                    onClick={() =>
                      handleOddsClick(
                        "Joker Black",
                        getOddsBySid(6)?.b1,
                        6,
                        true
                      )
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "5px",
                        padding: "5px 0",
                      }}
                    >
                      <img
                        src="/assets/cards_new/spade.png"
                        width="20"
                        alt="spd"
                      />
                      <img
                        src="/assets/cards_new/club.png"
                        width="20"
                        alt="clb"
                      />
                    </div>
                    {renderExposure(6, true)}
                  </div>
                </div>

                {/* Joker Row 2: Suits */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: "2px",
                    marginBottom: "5px",
                  }}
                >
                  <div style={{ textAlign: "center", padding: "5px 0" }}>
                    <img
                      src="/assets/cards_new/spade.png"
                      width="20"
                      alt="spd"
                    />
                  </div>
                  <div style={{ textAlign: "center", padding: "5px 0" }}>
                    <img
                      src="/assets/cards_new/heart.png"
                      width="20"
                      alt="hrt"
                    />
                  </div>
                  <div style={{ textAlign: "center", padding: "5px 0" }}>
                    <img
                      src="/assets/cards_new/diamond.png"
                      width="20"
                      alt="dia"
                    />
                  </div>
                  <div style={{ textAlign: "center", padding: "5px 0" }}>
                    <img
                      src="/assets/cards_new/club.png"
                      width="20"
                      alt="clb"
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: "2px",
                  }}
                >
                  {/* Spade - SID 7 */}
                  <div
                    className={`mobile-odds-box back joker-odds-box ${getExposure(7) !== 0 ? "has-exposure" : ""
                      } ${getSuspendedClass(getOddsBySid(7)?.gstatus)}`}
                    style={{ height: "40px" }}
                    onClick={() =>
                      handleOddsClick(
                        "Joker Spade",
                        getOddsBySid(7)?.b1,
                        7,
                        true
                      )
                    }
                  >
                    {getOddsBySid(7)?.b1}
                    {renderExposure(7, true)}
                  </div>
                  {/* Heart - SID 8 */}
                  <div
                    className={`mobile-odds-box back joker-odds-box ${getExposure(8) !== 0 ? "has-exposure" : ""
                      } ${getSuspendedClass(getOddsBySid(8)?.gstatus)}`}
                    style={{ height: "40px" }}
                    onClick={() =>
                      handleOddsClick(
                        "Joker Heart",
                        getOddsBySid(8)?.b1,
                        8,
                        true
                      )
                    }
                  >
                    {getOddsBySid(8)?.b1}
                    {renderExposure(8, true)}
                  </div>
                  {/* Diamond - SID 9 */}
                  <div
                    className={`mobile-odds-box back joker-odds-box ${getExposure(9) !== 0 ? "has-exposure" : ""
                      } ${getSuspendedClass(getOddsBySid(9)?.gstatus)}`}
                    style={{ height: "40px" }}
                    onClick={() =>
                      handleOddsClick(
                        "Joker Diamond",
                        getOddsBySid(9)?.b1,
                        9,
                        true
                      )
                    }
                  >
                    {getOddsBySid(9)?.b1}
                    {renderExposure(9, true)}
                  </div>
                  {/* Club - SID 10 */}
                  <div
                    className={`mobile-odds-box back joker-odds-box ${getExposure(10) !== 0 ? "has-exposure" : ""
                      } ${getSuspendedClass(getOddsBySid(10)?.gstatus)}`}
                    style={{ height: "40px" }}
                    onClick={() =>
                      handleOddsClick(
                        "Joker Club",
                        getOddsBySid(10)?.b1,
                        10,
                        true
                      )
                    }
                  >
                    {getOddsBySid(10)?.b1}
                    {renderExposure(10, true)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="teen1daycasino-container">
              {/* Left Column - PLAYER A & PLAYER B */}
              <div className="teen1dayleft" style={{ width: "49%" }}>
                <div className="casino-box-row">
                  <div className="casino-nation-name no-border casino-bl-box-title">
                    <div className="playera">PLAYER A</div>
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
                  <div
                    className="casino-nation-name"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingRight: 5,
                    }}
                  >
                    <b>Main</b> {renderExposure(1)}
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${getSuspendedClass(
                        getOddsBySid(1)?.gstatus
                      )}`}
                      onClick={() =>
                        handleOddsClick(
                          "Player A",
                          getOddsBySid(1)?.b1,
                          1,
                          true
                        )
                      }
                    >
                      <span className="casino-box-odd">
                        {!isSuspended(getOddsBySid(1)?.gstatus) ? (
                          getOddsBySid(1)?.b1
                        ) : (
                          <i className="fas fa-lock" />
                        )}
                      </span>
                    </div>
                    <div
                      className={`lay casino-bl-box-item ${getSuspendedClass(
                        getOddsBySid(1)?.gstatus
                      )}`}
                      onClick={() =>
                        handleOddsClick(
                          "Player A",
                          getOddsBySid(1)?.l1,
                          1,
                          false
                        )
                      }
                    >
                      <span className="casino-box-odd">
                        {!isSuspended(getOddsBySid(1)?.gstatus) ? (
                          getOddsBySid(1)?.l1
                        ) : (
                          <i className="fas fa-lock" />
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="casino-box-row" style={{ marginTop: "15px" }}>
                  <div className="casino-nation-name no-border casino-bl-box-title">
                    <div className="playerb">PLAYER B</div>
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
                  <div
                    className="casino-nation-name"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingRight: 5,
                    }}
                  >
                    <b>Main</b> {renderExposure(2)}
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${getSuspendedClass(
                        getOddsBySid(2)?.gstatus
                      )}`}
                      onClick={() =>
                        handleOddsClick(
                          "Player B",
                          getOddsBySid(2)?.b1,
                          2,
                          true
                        )
                      }
                    >
                      <span className="casino-box-odd">
                        {!isSuspended(getOddsBySid(2)?.gstatus) ? (
                          getOddsBySid(2)?.b1
                        ) : (
                          <i className="fas fa-lock" />
                        )}
                      </span>
                    </div>
                    <div
                      className={`lay casino-bl-box-item ${getSuspendedClass(
                        getOddsBySid(2)?.gstatus
                      )}`}
                      onClick={() =>
                        handleOddsClick(
                          "Player B",
                          getOddsBySid(2)?.l1,
                          2,
                          false
                        )
                      }
                    >
                      <span className="casino-box-odd">
                        {!isSuspended(getOddsBySid(2)?.gstatus) ? (
                          getOddsBySid(2)?.l1
                        ) : (
                          <i className="fas fa-lock" />
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="teen1daycenter" style={{ width: "2%" }}></div>

              {/* Right Column - JOKER */}
              <div className="teen1dayright" style={{ width: "49%" }}>
                <div
                  style={{
                    textAlign: "center",
                    color: "#fdcf13",
                    fontWeight: "bold",
                    padding: "5px",
                    background: "#2a2a2a",
                    marginBottom: "5px",
                  }}
                >
                  Joker
                </div>

                {/* Row 1 Headers */}
                <div className="casino-box-row">
                  <div
                    className="casino-bl-box"
                    style={{ width: "100%", display: "flex", gap: "2px" }}
                  >
                    <div
                      className="casino-bl-box-item"
                      style={{ flex: 1, color: "#ccc" }}
                    >
                      <b>{getOddsBySid(3)?.b1}</b>
                    </div>
                    <div
                      className="casino-bl-box-item"
                      style={{ flex: 1, color: "#ccc" }}
                    >
                      <b>{getOddsBySid(4)?.b1}</b>
                    </div>
                    <div
                      className="casino-bl-box-item"
                      style={{ flex: 1, color: "#ccc" }}
                    >
                      <b>{getOddsBySid(5)?.b1}</b>
                    </div>
                    <div
                      className="casino-bl-box-item"
                      style={{ flex: 1, color: "#ccc" }}
                    >
                      <b>{getOddsBySid(6)?.b1}</b>
                    </div>
                  </div>
                </div>

                {/* Row 1 Data */}
                <div className="casino-box-row">
                  <div
                    className="casino-bl-box"
                    style={{ width: "100%", display: "flex", gap: "2px" }}
                  >
                    {/* Even - SID 3 */}
                    <div
                      className={`back casino-bl-box-item joker-odds-box ${getExposure(3) !== 0 ? "has-exposure" : ""
                        } ${getSuspendedClass(getOddsBySid(3)?.gstatus)}`}
                      style={{ flex: 1, height: "45px" }}
                      onClick={() =>
                        handleOddsClick(
                          "Joker Even",
                          getOddsBySid(3)?.b1,
                          3,
                          true
                        )
                      }
                    >
                      <span className="casino-box-odd">
                        Even
                      </span>
                      {renderExposure(3, true)}
                    </div>
                    {/* Odd - SID 4 */}
                    <div
                      className={`back casino-bl-box-item joker-odds-box ${getExposure(4) !== 0 ? "has-exposure" : ""
                        } ${getSuspendedClass(getOddsBySid(4)?.gstatus)}`}
                      style={{ flex: 1, height: "45px" }}
                      onClick={() =>
                        handleOddsClick(
                          "Joker Odd",
                          getOddsBySid(4)?.b1,
                          4,
                          true
                        )
                      }
                    >
                      <span className="casino-box-odd">
                        Odd
                      </span>
                      {renderExposure(4, true)}
                    </div>
                    {/* Red - SID 5 */}
                    <div
                      className={`back casino-bl-box-item joker-odds-box ${getExposure(5) !== 0 ? "has-exposure" : ""
                        } ${getSuspendedClass(getOddsBySid(5)?.gstatus)}`}
                      style={{ flex: 1, height: "45px" }}
                      onClick={() =>
                        handleOddsClick(
                          "Joker Red",
                          getOddsBySid(5)?.b1,
                          5,
                          true
                        )
                      }
                    >
                      <span className="casino-box-odd">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "5px",
                            padding: "5px 0",
                          }}
                        >
                          <img
                            src="/assets/cards_new/diamond.png"
                            width="15"
                            alt="dia"
                          />
                          <img
                            src="/assets/cards_new/heart.png"
                            width="15"
                            alt="hrt"
                          />
                        </div>
                      </span>
                      {renderExposure(5, true)}
                    </div>
                    {/* Black - SID 6 */}
                    <div
                      className={`back casino-bl-box-item joker-odds-box ${getExposure(6) !== 0 ? "has-exposure" : ""
                        } ${getSuspendedClass(getOddsBySid(6)?.gstatus)}`}
                      style={{ flex: 1, height: "45px" }}
                      onClick={() =>
                        handleOddsClick(
                          "Joker Black",
                          getOddsBySid(6)?.b1,
                          6,
                          true
                        )
                      }
                    >
                      <span className="casino-box-odd">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "5px",
                            padding: "5px 0",
                          }}
                        >
                          <img
                            src="/assets/cards_new/spade.png"
                            width="15"
                            alt="spd"
                          />
                          <img
                            src="/assets/cards_new/club.png"
                            width="15"
                            alt="clb"
                          />
                        </div>
                      </span>
                      {renderExposure(6, true)}
                    </div>
                  </div>
                </div>

                {/* Row 2 Headers */}
                <div className="casino-box-row" style={{ marginTop: "5px" }}>
                  <div
                    className="casino-bl-box"
                    style={{ width: "100%", display: "flex", gap: "2px" }}
                  >
                    <div
                      className="casino-bl-box-item"
                      style={{ flex: 1, padding: "5px 0" }}
                    >
                      <img
                        src="/assets/cards_new/spade.png"
                        width="20"
                        alt="spd"
                      />
                    </div>
                    <div
                      className="casino-bl-box-item"
                      style={{ flex: 1, padding: "5px 0" }}
                    >
                      <img
                        src="/assets/cards_new/heart.png"
                        width="20"
                        alt="hrt"
                      />
                    </div>
                    <div
                      className="casino-bl-box-item"
                      style={{ flex: 1, padding: "5px 0" }}
                    >
                      <img
                        src="/assets/cards_new/diamond.png"
                        width="20"
                        alt="dia"
                      />
                    </div>
                    <div
                      className="casino-bl-box-item"
                      style={{ flex: 1, padding: "5px 0" }}
                    >
                      <img
                        src="/assets/cards_new/club.png"
                        width="20"
                        alt="clb"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2 Data */}
                <div className="casino-box-row">
                  <div
                    className="casino-bl-box"
                    style={{ width: "100%", display: "flex", gap: "2px" }}
                  >
                    {/* Spade - SID 7 */}
                    <div
                      className={`back casino-bl-box-item joker-odds-box ${getExposure(7) !== 0 ? "has-exposure" : ""
                        } ${getSuspendedClass(getOddsBySid(7)?.gstatus)}`}
                      style={{ flex: 1, height: "45px" }}
                      onClick={() =>
                        handleOddsClick(
                          "Joker Spade",
                          getOddsBySid(7)?.b1,
                          7,
                          true
                        )
                      }
                    >
                      <span className="casino-box-odd">
                        {getOddsBySid(7)?.b1}
                      </span>
                      {renderExposure(7, true)}
                    </div>
                    {/* Heart - SID 8 */}
                    <div
                      className={`back casino-bl-box-item joker-odds-box ${getExposure(8) !== 0 ? "has-exposure" : ""
                        } ${getSuspendedClass(getOddsBySid(8)?.gstatus)}`}
                      style={{ flex: 1, height: "45px" }}
                      onClick={() =>
                        handleOddsClick(
                          "Joker Heart",
                          getOddsBySid(8)?.b1,
                          8,
                          true
                        )
                      }
                    >
                      <span className="casino-box-odd">
                        {getOddsBySid(8)?.b1}
                      </span>
                      {renderExposure(8, true)}
                    </div>
                    {/* Diamond - SID 9 */}
                    <div
                      className={`back casino-bl-box-item joker-odds-box ${getExposure(9) !== 0 ? "has-exposure" : ""
                        } ${getSuspendedClass(getOddsBySid(9)?.gstatus)}`}
                      style={{ flex: 1, height: "45px" }}
                      onClick={() =>
                        handleOddsClick(
                          "Joker Diamond",
                          getOddsBySid(9)?.b1,
                          9,
                          true
                        )
                      }
                    >
                      <span className="casino-box-odd">
                        {getOddsBySid(9)?.b1}
                      </span>
                      {renderExposure(9, true)}
                    </div>
                    {/* Club - SID 10 */}
                    <div
                      className={`back casino-bl-box-item joker-odds-box ${getExposure(10) !== 0 ? "has-exposure" : ""
                        } ${getSuspendedClass(getOddsBySid(10)?.gstatus)}`}
                      style={{ flex: 1, height: "45px" }}
                      onClick={() =>
                        handleOddsClick(
                          "Joker Club",
                          getOddsBySid(10)?.b1,
                          10,
                          true
                        )
                      }
                    >
                      <span className="casino-box-odd">
                        {getOddsBySid(10)?.b1}
                      </span>
                      {renderExposure(10, true)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TeenPattiJoker20;
