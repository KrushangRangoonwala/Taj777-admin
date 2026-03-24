import React, { useState, useEffect, useRef } from "react";
import {
  fetchCasinoExposureApi,
  fetchTeenpattiResults,
  fetchOpenBetsApi,
  getDefaultParams,
} from "../../api/api";
import { io } from "socket.io-client";
import Modal from "react-modal";
import { toast } from "react-toastify";
import CasinoVideo from "./components/CasinoVideo";
import Result_Teen62, { formatResultData } from "./results/Result_Teen62";
const TeenPatti62_new = ({ onBetSelection, lastBetTime, exposureTrigger }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [gameData, setGameData] = useState(null);
  const [exposureData, setExposureData] = useState([]);
  const [isMobileView, setIsMobileView] = useState(
    window.innerWidth <= 768 && !window.location.search.includes("example1=on")
  );
  const [openBets, setOpenBets] = useState([]);
  const [isMyBetsModalOpen, setIsMyBetsModalOpen] = useState(false);
  const [lastResults, setLastResults] = useState([]);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const socketRef = useRef(null);

  const cardPairs = [1, 2, 3, 4, 5, 6];

  const getResultTxt = (win) => {
    const w = String(win).trim().toUpperCase();
    if (w === "1" || w === "A") return "A";
    if (w === "2" || w === "B") return "B";
    return "T";
  };

  const getColorClass = (win) => {
    const w = String(win).trim().toUpperCase();
    if (w === "1" || w === "A") return "resulta";
    if (w === "2" || w === "B") return "resultb";
    return "resulttie";
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
      <div className="casino-video-cards-container">
        <div>
          <span>
            <img src={getCardImage(currentGame?.C1)} alt="card" />
          </span>
          <span>
            <img src={getCardImage(currentGame?.C3)} alt="card" />
          </span>
          <span>
            <img src={getCardImage(currentGame?.C5)} alt="card" />
          </span>
        </div>
        <div>
          <span>
            <img src={getCardImage(currentGame?.C2)} alt="card" />
          </span>
          <span>
            <img src={getCardImage(currentGame?.C4)} alt="card" />
          </span>
          <span>
            <img src={getCardImage(currentGame?.C6)} alt="card" />
          </span>
        </div>
      </div>
    );
  }

  const handleResultClick = async (clickedIndex) => {
    const result = lastResults[clickedIndex];
    if (!result || !result.mid) return;

    try {
      const response = await fetchTeenpattiResults(result.mid, "teen62");
      if (response && response.length > 0) {
        setModalContent(response[0]);
        setResultModalOpen(true);
      } else {
        toast.error("Result not found");
      }
    } catch (error) {
      console.error("Error fetching result details:", error);
      toast.error("Failed to load result details");
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(
        window.innerWidth <= 768 && !window.location.search.includes("example1=on")
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
          markettype: "TEEN62",
          main_event_id: gameData.t1[0].mid,
          curPageName: "live_teenpatti_vip.php",
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
      <span className={`${exposure > 0 ? "book-green" : "book-red"}`} style={{ marginLeft: "5px" }}>
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
      console.log("📤 Emitting Room: teen62");
      socket.emit("Room", "teen62");
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
      setLastResults(data);
    });

    socket.onAny((event, ...args) => {
      if (event !== "game" && event !== "gameResult") {
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

  const getCardImage = (cardCode) => {
    if (!cardCode || cardCode === "1")
      return "https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png";
    return `https://wver.sprintstaticdata.com/v190/static/front/img/cards/${cardCode}.png`;
  };

  const getSuspendedClass = (status) => {
    return status === "SUSPENDED" || status === "suspended" ? "suspended" : "";
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

  return (
    <>
      <style>
        {`
        /*! CSS Used from: https://wver.sprintstaticdata.com/v207/static/front/css/bootstrap.min.css */
    *,
    ::after,
    ::before {
        box-sizing: border-box;
    }

    b {
        font-weight: bolder;
    }

    .d-none {
        display: none !important;
    }

    .float-right {
        float: right !important;
    }

    @media print {

        *,
        ::after,
        ::before {
            text-shadow: none !important;
            box-shadow: none !important;
        }
    }

    /*! CSS Used from: https://wver.sprintstaticdata.com/v207/static/front/css/style.css */
    * {
        outline: 0 !important;
    }

    .back {
        background-color: var(--back);
    }

    .back:hover {
        background-color: var(--back-hover);
    }

    .lay {
        background-color: var(--lay);
    }

    .lay:hover {
        background-color: var(--lay-hover);
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

    .casino-table .casino-detail .back {
        background-color: #72bbef40;
        border: 2px solid var(--back);
        color: #d7d7d7;
    }

    .casino-table .casino-detail .back:hover {
        border: 1px solid var(--back);
    }

    .casino-table .casino-detail .lay {
        background-color: #f994ba40;
        border: 2px solid var(--lay);
        color: #d7d7d7;
    }

    .casino-table .casino-detail .lay:hover {
        border: 1px solid var(--lay);
    }

    .casino-box-row {
        display: flex;
        display: -webkit-flex;
        flex-wrap: wrap;
        padding: 2px 0;
        align-items: center;
        position: relative;
    }

    .casino-nation-name {
        width: calc(100% - 148px);
    }

    .casino-bl-box {
        display: flex;
        display: -webkit-flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
    }

    .casino-bl-box-title .casino-bl-box-item {
        color: var(--text-table);
        height: 24px !important;
        font-size: var(--font-caption);
        flex-direction: row;
    }

    .casino-bl-box-item {
        width: 72px;
        margin-right: 4px;
        border-radius: 0;
        color: var(--text-table);
        text-align: center;
        height: 32px;
        display: flex;
        display: -webkit-flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        flex-direction: column;
    }

    .casino-bl-box-item>span {
        display: block;
        width: 100%;
        line-height: 14px;
        font-size: 16px;
        font-weight: bold;
    }

    .casino-bl-box-item .casino-box-odd {
        font-weight: var(--font-bold);
        font-size: var(--font-odds);
        height: 16px;
        line-height: 16px;
        margin-bottom: 2px;
        width: 100%;
    }

    .casino-bl-box-item:last-child {
        margin-right: 0;
    }

    .casino-nation-name {
        background-color: #444;
        color: #ddd;
        padding: 4px;
        position: relative;
    }

    .teen1daycasino-container {
        display: flex;
        display: -webkit-flex;
        flex-wrap: wrap;
        justify-content: space-between;
        width: 100%;
    }

    .teenpatti1day .casino-nation-name {
        width: 50%;
        padding-right: 10px;
        position: relative;
    }

    .teenpatti1day .casino-bl-box {
        width: 50%;
    }

    .teenpatti1day .casino-bl-box-item {
        width: calc(50% - 2px);
    }

    /*! CSS Used from: https://wver.sprintstaticdata.com/v207/static/front/css/responsive.css */
    @media only screen and (min-width: 1280px) and (max-width: 1365px) {
        .casino-nation-name {
            font-size: var(--font-caption);
        }
    }

    @media only screen and (min-width: 1280px) and (max-width: 1599px) {
        .casino-bl-box-item span {
            font-size: var(--font-small);
        }

        .casino-bl-box-item .casino-box-odd {
            font-size: var(--font-caption);
        }
    }

    @media only screen and (min-width: 320px) and (max-width: 767px) {
        .casino-bl-box-item span {
            font-size: var(--font-small);
            width: auto;
        }

        .casino-bl-box-item .casino-box-odd {
            font-size: var(--font-caption);
        }

        .casino-bl-box-title .casino-bl-box-item {
            width: calc(33.33% - 3px);
            height: 18px !important;
            text-transform: uppercase;
            font-size: var(--font-small);
        }

        .casino-odds-name {
            color: #ddd;
            text-transform: uppercase;
            font-weight: bold;
            flex-direction: row;
            justify-content: space-between;
            background-color: #444;
            padding: 0 4px 0 4px;
            border-radius: 0;
            margin-right: 0;
            height: 36px !important;
            position: relative;
        }

        .casino-bl-box {
            margin-bottom: 4px;
        }

        .casino-bl-box-item .casino-box-odd {
            font-size: var(--font-13);
        }

        .teenpatti1day .casino-bl-box {
            width: 100%;
        }

        .teenpatti1day .casino-bl-box-item {
            width: calc(33.33% - 3px);
            font-size: 11px;
        }

        .teen1daycasino-container .casino-box-row {
            width: 100%;
        }

        .teen1dayodev .casino-bl-box-item {
            height: 40px;
        }

        .teenpatti1day .casino-bl-box-title .casino-bl-box-item:first-child {
            flex-direction: row;
            justify-content: space-between;
            position: relative;
        }
    }

    @media only screen and (min-width: 768px) and (max-width: 1279px) {
        .casino-bl-box-item .casino-box-odd {
            font-size: var(--font-small);
        }
    }

    @media only screen and (min-width: 768px) {
        .d-none-big {
            display: none !important;
        }
    }

    /*! CSS Used from: https://wver.sprintstaticdata.com/v207/static/front/css/wolf-custom.css */
    @media only screen and (min-width: 1280px) {
        .d-none-big {
            display: none !important;
        }
    }
        `}
      </style>

      <div className="casino-table teenpatti1day ">
        <CasinoVideo
          gameName="V Vip Teenpatti 1-Day"
          roundId={gameData?.t1?.[0]?.mid || "Loading..."}
          videoSrc="/newmediaplayer/teen62/667946cf-39ee-4f49-901e-13d5438e91ad"
          isCardDrawerOpen={isDrawerOpen}
          setIsCardDrawerOpen={setIsDrawerOpen}
          autotime={gameData?.t1?.[0]?.autotime}
          totalTime={gameData?.t1?.[0]?.ft}
          cards={[
            gameData?.t1?.[0]?.C1,
            gameData?.t1?.[0]?.C2,
            gameData?.t1?.[0]?.C3,
            gameData?.t1?.[0]?.C4,
            gameData?.t1?.[0]?.C5,
            gameData?.t1?.[0]?.C6,
          ]}
          CardsComponent={VideoCards}
        />

        {/* Betting Section */}
        <div className="casino-detail">
          {isMobileView ? (
            <div className="teen1daycasino-container d-none-big">
              <div className="casino-box-row">
                <div className="casino-bl-box casino-bl-box-title">
                  <div className="casino-bl-box-item"><b>Main</b></div>
                  <div className="casino-bl-box-item"><b>Back</b></div>
                  <div className="casino-bl-box-item"><b>Lay</b></div>
                </div>
                <div className="casino-bl-box">
                  <div className="casino-bl-box-item casino-odds-name casino-nation-name">
                    <span>Player A</span>
                    {renderExposure(1)}
                  </div>
                  <div
                    className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(1)?.gstatus)}`}
                    onClick={() => handleOddsClick("Player A", getOddsBySid(1)?.b1, 1, true)}
                  >
                    <span className="casino-box-odd">
                      {getOddsBySid(1)?.visible === 1 ? getOddsBySid(1)?.b1 : <i className="fas fa-lock"></i>}
                    </span>
                  </div>
                  <div
                    className={`lay casino-bl-box-item ${getSuspendedClass(getOddsBySid(1)?.gstatus)}`}
                    onClick={() => handleOddsClick("Player A", getOddsBySid(1)?.l1, 1, false)}
                  >
                    <span className="casino-box-odd">
                      {getOddsBySid(1)?.visible === 1 ? getOddsBySid(1)?.l1 : <i className="fas fa-lock"></i>}
                    </span>
                  </div>
                </div>
                <div className="casino-bl-box">
                  <div className="casino-bl-box-item casino-odds-name casino-nation-name">
                    <span>Player B</span>
                    {renderExposure(2)}
                  </div>
                  <div
                    className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(2)?.gstatus)}`}
                    onClick={() => handleOddsClick("Player B", getOddsBySid(2)?.b1, 2, true)}
                  >
                    <span className="casino-box-odd">
                      {getOddsBySid(2)?.visible === 1 ? getOddsBySid(2)?.b1 : <i className="fas fa-lock"></i>}
                    </span>
                  </div>
                  <div
                    className={`lay casino-bl-box-item ${getSuspendedClass(getOddsBySid(2)?.gstatus)}`}
                    onClick={() => handleOddsClick("Player B", getOddsBySid(2)?.l1, 2, false)}
                  >
                    <span className="casino-box-odd">
                      {getOddsBySid(2)?.visible === 1 ? getOddsBySid(2)?.l1 : <i className="fas fa-lock"></i>}
                    </span>
                  </div>
                </div>
              </div>
              <div className="casino-box-row">
                <div className="casino-bl-box casino-bl-box-title">
                  <div className="casino-bl-box-item casino-card-img"><b>Consecutive</b></div>
                  <div className="casino-bl-box-item"><b>Back</b></div>
                  <div className="casino-bl-box-item"><b>Lay</b></div>
                </div>
                <div className="casino-bl-box">
                  <div className="casino-bl-box-item casino-odds-name casino-nation-name">
                    <span>Player A</span>
                    {renderExposure(17)}
                  </div>
                  <div
                    className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(17)?.gstatus)}`}
                    onClick={() => handleOddsClick("Player A", getOddsBySid(17)?.b1, 17, true)}
                  >
                    <span className="casino-box-odd">
                      {getOddsBySid(17)?.gstatus === "OPEN" ? getOddsBySid(17)?.b1 : <i className="fas fa-lock"></i>}
                    </span>
                  </div>
                  <div
                    className={`lay casino-bl-box-item ${getSuspendedClass(getOddsBySid(17)?.gstatus)}`}
                    onClick={() => handleOddsClick("Player A", getOddsBySid(17)?.l1, 17, false)}
                  >
                    <span className="casino-box-odd">
                      {getOddsBySid(17)?.gstatus === "OPEN" ? getOddsBySid(17)?.l1 : <i className="fas fa-lock"></i>}
                    </span>
                  </div>
                </div>
                <div className="casino-bl-box">
                  <div className="casino-bl-box-item casino-odds-name casino-nation-name">
                    <span>Player B</span>
                    {renderExposure(18)}
                  </div>
                  <div
                    className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(18)?.gstatus)}`}
                    onClick={() => handleOddsClick("Player B", getOddsBySid(18)?.b1, 18, true)}
                  >
                    <span className="casino-box-odd">
                      {getOddsBySid(18)?.gstatus === "OPEN" ? getOddsBySid(18)?.b1 : <i className="fas fa-lock"></i>}
                    </span>
                  </div>
                  <div
                    className={`lay casino-bl-box-item ${getSuspendedClass(getOddsBySid(18)?.gstatus)}`}
                    onClick={() => handleOddsClick("Player B", getOddsBySid(18)?.l1, 18, false)}
                  >
                    <span className="casino-box-odd">
                      {getOddsBySid(18)?.gstatus === "OPEN" ? getOddsBySid(18)?.l1 : <i className="fas fa-lock"></i>}
                    </span>
                  </div>
                </div>
              </div>
              <div className="casino-box-row teen1dayodev">
                <div className="casino-bl-box casino-bl-box-title">
                  <div className="casino-bl-box-item casino-card-img"><b>Cards</b></div>
                  <div className="casino-bl-box-item"><b>Odd</b></div>
                  <div className="casino-bl-box-item"><b>Even</b></div>
                </div>
                {cardPairs.map((pair, index) => {
                  const cardSid = 11 + index;
                  const item = getOddsBySid(cardSid);
                  const oddData = item?.odds?.find((o) => o.nat === "Odd");
                  const evenData = item?.odds?.find((o) => o.nat === "Even");
                  return (
                    <div key={index} className="casino-bl-box">
                      <div className="casino-bl-box-item casino-odds-name casino-nation-name"><span>Card {pair}</span></div>
                      <div
                        className={`back casino-bl-box-item ${getSuspendedClass(item?.gstatus)}`}
                        onClick={() => handleOddsClick(`Card ${pair} - Odd`, oddData?.b, cardSid + '_1', true)}
                      >
                        <span className="casino-box-odd">
                          {item?.visible === 1 ? oddData?.b || "0" : <i className="fas fa-lock"></i>}
                        </span>
                        {renderExposure(cardSid + '_1')}
                      </div>
                      <div
                        className={`back casino-bl-box-item ${getSuspendedClass(item?.gstatus)}`}
                        onClick={() => handleOddsClick(`Card ${pair} - Even`, evenData?.b, cardSid + '_2', true)}
                      >
                        <span className="casino-box-odd">
                          {item?.visible === 1 ? evenData?.b || "0" : <i className="fas fa-lock"></i>}
                        </span>
                        {renderExposure(cardSid + '_2')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="teen1daycasino-container d-none-small">
              <div className="teen1dayleft">
                <div className="casino-box-row">
                  <div className="casino-nation-name no-border casino-bl-box-title">
                    <div className="playera">Player A</div>
                  </div>
                  <div className="casino-bl-box casino-bl-box-title">
                    <div className="casino-bl-box-item"><b>Back</b></div>
                    <div className="casino-bl-box-item"><b>Lay</b></div>
                  </div>
                </div>
                <div className="casino-box-row">
                  <div className="casino-nation-name">
                    <b>Main</b>
                    <div className="float-right">{renderExposure(1)}</div>
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(1)?.gstatus)}`}
                      onClick={() => handleOddsClick("Player A", getOddsBySid(1)?.b1, 1, true)}
                    >
                      <span className="casino-box-odd">
                        {getOddsBySid(1)?.visible === 1 ? getOddsBySid(1)?.b1 : <i className="fas fa-lock"></i>}
                      </span>
                    </div>
                    <div
                      className={`lay casino-bl-box-item ${getSuspendedClass(getOddsBySid(1)?.gstatus)}`}
                      onClick={() => handleOddsClick("Player A", getOddsBySid(1)?.l1, 1, false)}
                    >
                      <span className="casino-box-odd">
                        {getOddsBySid(1)?.visible === 1 ? getOddsBySid(1)?.l1 : <i className="fas fa-lock"></i>}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="casino-box-row">
                  <div className="casino-nation-name casino-card-img">
                    <b>Consicutive</b>
                    <div className="float-right">{renderExposure(17)}</div>
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(17)?.gstatus)}`}
                      onClick={() => handleOddsClick("Player A", getOddsBySid(17)?.b1, 17, true)}
                    >
                      <span className="casino-box-odd">
                        {getOddsBySid(17)?.gstatus === "OPEN" ? getOddsBySid(17)?.b1 : <i className="fas fa-lock"></i>}
                      </span>
                    </div>
                    <div
                      className={`lay casino-bl-box-item ${getSuspendedClass(getOddsBySid(17)?.gstatus)}`}
                      onClick={() => handleOddsClick("Player A", getOddsBySid(17)?.l1, 17, false)}
                    >
                      <span className="casino-box-odd">
                        {getOddsBySid(17)?.gstatus === "OPEN" ? getOddsBySid(17)?.l1 : <i className="fas fa-lock"></i>}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="teen1daycenter"></div>
              <div className="teen1dayright">
                <div className="casino-box-row">
                  <div className="casino-nation-name no-border casino-bl-box-title">
                    <div className="playerb">Player B</div>
                  </div>
                  <div className="casino-bl-box casino-bl-box-title">
                    <div className="casino-bl-box-item"><b>Back</b></div>
                    <div className="casino-bl-box-item"><b>Lay</b></div>
                  </div>
                </div>
                <div className="casino-box-row">
                  <div className="casino-nation-name">
                    <b>Main</b>
                    <div className="float-right">{renderExposure(2)}</div>
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(2)?.gstatus)}`}
                      onClick={() => handleOddsClick("Player B", getOddsBySid(2)?.b1, 2, true)}
                    >
                      <span className="casino-box-odd">
                        {getOddsBySid(2)?.visible === 1 ? getOddsBySid(2)?.b1 : <i className="fas fa-lock"></i>}
                      </span>
                    </div>
                    <div
                      className={`lay casino-bl-box-item ${getSuspendedClass(getOddsBySid(2)?.gstatus)}`}
                      onClick={() => handleOddsClick("Player B", getOddsBySid(2)?.l1, 2, false)}
                    >
                      <span className="casino-box-odd">
                        {getOddsBySid(2)?.visible === 1 ? getOddsBySid(2)?.l1 : <i className="fas fa-lock"></i>}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="casino-box-row">
                  <div className="casino-nation-name casino-card-img">
                    <b>Consicutive</b>
                    <div className="float-right">{renderExposure(18)}</div>
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(18)?.gstatus)}`}
                      onClick={() => handleOddsClick("Player B", getOddsBySid(18)?.b1, 18, true)}
                    >
                      <span className="casino-box-odd">
                        {getOddsBySid(18)?.gstatus === "OPEN" ? getOddsBySid(18)?.b1 : <i className="fas fa-lock"></i>}
                      </span>
                    </div>
                    <div
                      className={`lay casino-bl-box-item ${getSuspendedClass(getOddsBySid(18)?.gstatus)}`}
                      onClick={() => handleOddsClick("Player B", getOddsBySid(18)?.l1, 18, false)}
                    >
                      <span className="casino-box-odd">
                        {getOddsBySid(18)?.gstatus === "OPEN" ? getOddsBySid(18)?.l1 : <i className="fas fa-lock"></i>}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="teen1dayother">
                <div className="casino-box-row">
                  <div className="casino-nation-name no-border"></div>
                  {cardPairs.map((pair) => (
                    <div key={pair} className="casino-bl-box">
                      <div className="casino-bl-box-item"><b>Card {pair}</b></div>
                    </div>
                  ))}
                </div>
                <div className="casino-box-row">
                  <div className="casino-nation-name"><b>Odd</b></div>
                  {cardPairs.map((pair, index) => {
                    const cardSid = 11 + index;
                    const item = getOddsBySid(cardSid);
                    const oddData = item?.odds?.find((o) => o.nat === "Odd");
                    return (
                      <div key={index} className="casino-bl-box">
                        <div
                          className={`back casino-bl-box-item ${getSuspendedClass(item?.gstatus)}`}
                          onClick={() => handleOddsClick(`Card ${pair} - Odd`, oddData?.b, cardSid, true)}
                        >
                          <span className="casino-box-odd">
                            {item?.visible === 1 ? oddData?.b || "0" : <i className="fas fa-lock"></i>}
                          </span>
                          <span className="d-none">0</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="casino-box-row">
                  <div className="casino-nation-name"><b>Even</b></div>
                  {cardPairs.map((pair, index) => {
                    const cardSid = 11 + index;
                    const item = getOddsBySid(cardSid);
                    const evenData = item?.odds?.find((o) => o.nat === "Even");
                    return (
                      <div key={index} className="casino-bl-box">
                        <div
                          className={`back casino-bl-box-item ${getSuspendedClass(item?.gstatus)}`}
                          onClick={() => handleOddsClick(`Card ${pair} - Even`, evenData?.b, cardSid, true)}
                        >
                          <span className="casino-box-odd">
                            {item?.visible === 1 ? evenData?.b || "0" : <i className="fas fa-lock"></i>}
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

      <Modal
        isOpen={resultModalOpen}
        onRequestClose={() => setResultModalOpen(false)}
        className="casino-result-modal-v2" // Ensure you have this class or similar styling
        overlayClassName="casino-modal-overlay"
        style={{
          content: {
            padding: 0,
            border: "none",
            background: "transparent",
            inset: isMobileView ? "10px" : "auto",
            maxWidth: isMobileView ? "100%" : "800px",
            margin: "0 auto",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            zIndex: 1000,
          },
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 15px",
            background: "#2e3439",
            color: "#DDDDDD",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "16px" }}>VIP TeenPatti Result</h3>
          <button
            onClick={() => setResultModalOpen(false)}
            style={{
              background: "none",
              border: "none",
              color: "#DDDDDD",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        </div>
        <div style={{ background: "#2e3439", padding: "0" }}>
          <Result_Teen62 modalContent={modalContent} />
        </div>
      </Modal>
    </>
  );
};

export default TeenPatti62_new;
