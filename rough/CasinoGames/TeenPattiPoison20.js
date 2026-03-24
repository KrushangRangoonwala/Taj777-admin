import React, { useState, useEffect, useRef } from "react";
import { fetchCasinoExposureApi } from "../../api/api";
import { useSocket } from "../../components/Socket/useSocket";
import { getImage, getValueAfterDot, getValueBeforeDot } from "../../utilies/helpers";
import useIsMobile from "../../hooks/useIsMobile";
import CasinoVideo from "./components/CasinoVideo";
import { useGetFileData } from "../../hooks/useGetFileData";

const TeenPattiPoison20 = ({ onBetSelection, lastBetTime, exposureTrigger }) => {
  const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
  const isJoker20 = game_type === 'joker20';
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [gameData, setGameData] = useState(null);
  const [exposureData, setExposureData] = useState([]);
  const isMobile = useIsMobile();

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
      <span className={`mr-1 ${exposure > 0 ? 'book-green' : 'book-red'}`}>
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

  const getSuspendedClass = (status, sid) => {
    if (!isSuspended(status)) return "";
    const isExp = sid ? getExposure(sid) : null;
    return isExp ? "suspended lock-top" : "suspended";
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
    if (odds === 0 || odds === "0") return;
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
      <>
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
              // textShadow: "0 0 1px var(--text-yellow)",
              letterSpacing: '0.4px',
              lineHeight: 'normal',
            }}
          >
            {isJoker20 ? 'JOKER' : 'POISON'}
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
      </>
    );
  };
  console.log('getOddsBySid(1)', getOddsBySid(1));
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

a {
  color: #007bff;
  text-decoration: none;
  background-color: transparent;
}

a:hover {
  color: #0056b3;
  text-decoration: underline;
}

img {
  vertical-align: middle;
  border-style: none;
}

.d-none {
  display: none !important;
}

.float-right {
  float: right !important;
}

.w-100 {
  width: 100% !important;
}

.mt-1 {
  margin-top: .25rem !important;
}

.mt-2 {
  margin-top: .5rem !important;
}

.mr-2 {
  margin-right: .5rem !important;
}

.text-center {
  text-align: center !important;
}

@media print {

  *,
  ::after,
  ::before {
    text-shadow: none !important;
    box-shadow: none !important;
  }

  a:not(.btn) {
    text-decoration: underline;
  }

  img {
    page-break-inside: avoid;
  }
}

/*! CSS Used from: https://wver.sprintstaticdata.com/v207/static/front/css/control.css */
.text-playerb {
  color: var(--text-yellow);
}

/*! CSS Used from: https://wver.sprintstaticdata.com/v207/static/front/css/style.css */
* {
  outline: 0 !important;
}

a,
a:hover,
a:focus {
  text-decoration: none;
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

.casino-video-last-results {
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  display: -webkit-flex;
  align-content: flex-start;
  flex-wrap: wrap;
  transition: 1s;
  overflow: hidden;
}

.casino-video-last-results span,
.casino-video-last-results a {
  width: 35px;
  margin-left: 5px;
  margin-top: 5px;
  border-radius: 0;
  height: 35px;
  text-align: center;
  line-height: 35px;
  background-color: #434343;
  color: #fff;
  cursor: pointer;
  font-weight: bold;
}

.casino-video-last-results span.resulta {
  color: var(--text-red);
}

.casino-video-last-results span.resultb {
  color: var(--text-yellow);
}

.casino-video-last-results a.result-more {
  width: 100%;
  line-height: 1.8;
  margin-right: 5px;
  margin-bottom: 5px;
  color: var(--text-white);
}

.casino-detail {
  padding: 4px;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  -moz-transform: translateZ(0);
  -ms-transform: translateZ(0);
  -o-transform: translateZ(0);
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

.casino-card-img img {
  width: 30px;
  height: auto;
  margin-left: 5px;
}

.casino-card-img img:last-child {
  margin-left: 0;
}

.casino-odds {
  font-weight: var(--font-bold);
  text-align: center;
  width: 100%;
  line-height: 18px;
  position: relative;
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

.teen1dayleft,
.teen1dayright {
  width: 49%;
}

.teen1daycenter {
  width: 2px;
  background-color: grey;
}

.casino-card-img img {
  width: 30px;
}

.teenpatti-joker .teen1dayleft {
  align-self: center;
}

.teenpatti-joker .casino-nation-name {
  width: 50%;
  padding-right: 10px;
  position: relative;
}

.teenpatti-joker .casino-bl-box {
  width: 50%;
}

.teenpatti-joker .casino-bl-box-item {
  width: calc(50% - 2px);
}

.teenpatti-joker .joker-other .casino-bl-box-item {
  width: 100%;
  height: 40px;
}

.teenpatti-joker .joker-other .casino-bl-box {
  width: calc(25% - 3px);
  margin-right: 4px;
}

.teenpatti-joker .joker-other .casino-bl-box:last-child {
  margin-right: 0;
}

.teenpatti-joker .casino-card-img img {
  width: 20px;
}

/*! CSS Used from: https://wver.sprintstaticdata.com/v207/static/front/css/responsive.css */
@media only screen and (min-width: 320px) and (max-width: 1279px) {
  .casino-detail {
    padding: 2px;
  }
}

@media only screen and (min-width: 1280px) and (max-width: 1365px) {
  .casino-nation-name {
    font-size: var(--font-caption);
  }
}
`}
      </style>

      <style>
        {`
@media only screen and (min-width: 1280px) and (max-width: 1599px) {
  .casino-bl-box-item span {
    font-size: var(--font-small);
  }

  .casino-bl-box-item .casino-box-odd {
    font-size: var(--font-caption);
  }

  .casino-detail {
    padding: 5px;
  }

  .casino-video-last-results {
    width: 65px;
    height: 185px;
  }

  .casino-video-last-results span,
  .casino-video-last-results a {
    width: 25px;
    height: 25px;
    line-height: 25px;
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

  .casino-bl-box {
    margin-bottom: 4px;
  }

  .casino-bl-box-item .casino-box-odd {
    font-size: var(--font-13);
  }

  .casino-video-last-results {
    position: relative;
    top: 0;
    background-color: transparent;
    justify-content: center;
    width: 100%;
    right: 0;
    padding: 0;
    margin-top: 4px;
    height: auto;
    margin-left: 0;
  }

  .casino-video-last-results span {
    height: 30px;
    width: 30px;
    line-height: 30px;
    margin-right: 2px;
    margin-left: 0;
    background-color: #000;
    box-shadow: 0 0 2px #646464;
  }

  .casino-video-last-results a.result-more {
    width: 30px;
    height: 30px;
    margin-left: 0;
    line-height: 25px;
    margin-right: 0;
    margin-bottom: 0;
    background-color: #000;
    box-shadow: 0 0 2px #646464;
  }

  .teen1daycasino-container .casino-box-row {
    width: 100%;
  }

  .teenpatti-joker .teen1dayleft,
  .teenpatti-joker .teen1dayright {
    width: 100%;
  }
}

@media only screen and (min-width: 768px) and (max-width: 1279px) {
  .casino-bl-box-item .casino-box-odd {
    font-size: var(--font-small);
  }

  .casino-video-last-results {
    position: relative;
    top: 0;
    background-color: transparent;
    justify-content: center;
    width: 100%;
    right: 0;
    padding: 0;
    margin-top: 10px;
    height: auto;
    margin-left: 0;
  }
}
        `}
      </style>

      <div className="casino-table teenpatti-joker">
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
          drawerHeight="165px"
        />

        {/* Betting Sections */}
        <div className="casino-detail">
          <div className="teen1daycasino-container mt-2">
            <div className="teen1dayleft">
              <div className="casino-box-row">
                <div className="casino-nation-name">
                  <b>Player A</b>
                  <div className="float-right">
                    {renderExposure(1)}
                  </div>
                </div>
                <div className="casino-bl-box">
                  <div
                    className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(1)?.gstatus, 1)}`}
                    onClick={() => handleOddsClick("Player A", getOddsBySid(1)?.b1, 1, true)}
                  >
                    <span className="casino-box-odd">{getOddsBySid(1)?.b1 || "0"}</span>
                  </div>
                  <div
                    className={`lay casino-bl-box-item ${getSuspendedClass(getOddsBySid(1)?.gstatus, 1)}`}
                    onClick={() => handleOddsClick("Player A", getOddsBySid(1)?.l1, 1, false)}
                  >
                    <span className="casino-box-odd">{getOddsBySid(1)?.l1 || "0"}</span>
                  </div>
                </div>
              </div>
              <div className="casino-box-row">
                <div className="casino-nation-name">
                  <b>Player B</b>
                  <div className="float-right">
                    {renderExposure(2)}
                  </div>
                </div>
                <div className="casino-bl-box">
                  <div
                    className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(2)?.gstatus, 2)}`}
                    onClick={() => handleOddsClick("Player B", getOddsBySid(2)?.b1, 2, true)}
                  >
                    <span className="casino-box-odd">{getOddsBySid(2)?.b1 || "0"}</span>
                  </div>
                  <div
                    className={`lay casino-bl-box-item ${getSuspendedClass(getOddsBySid(2)?.gstatus, 2)}`}
                    onClick={() => handleOddsClick("Player B", getOddsBySid(2)?.l1, 2, false)}
                  >
                    <span className="casino-box-odd">{getOddsBySid(2)?.l1 || "0"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="teen1daycenter"></div>
            <div className="teen1dayright joker-other">
              <div>
                <div className="casino-box-row casino-odds">
                  <div className="text-center w-100"><b className="text-playerb">{isJoker20 ? 'Joker' : 'Poison'}</b></div>
                </div>
                <div className="casino-box-row">
                  <div className="casino-bl-box"><b>{getOddsBySid(3)?.b1 || "0"}</b></div>
                  <div className="casino-bl-box"><b>{getOddsBySid(4)?.b1 || "0"}</b></div>
                  <div className="casino-bl-box"><b>{getOddsBySid(5)?.b1 || "0"}</b></div>
                  <div className="casino-bl-box"><b>{getOddsBySid(6)?.b1 || "0"}</b></div>
                </div>
                <div className="casino-box-row">
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(3)?.gstatus, 3)}`}
                      onClick={() => handleOddsClick("Poison Even", getOddsBySid(3)?.b1, 3, true)}
                    >
                      <span className="casino-box-odd">Even</span>
                      {renderExposure(3)}
                    </div>
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(4)?.gstatus, 4)}`}
                      onClick={() => handleOddsClick("Poison Odd", getOddsBySid(4)?.b1, 4, true)}
                    >
                      <span className="casino-box-odd">Odd</span>
                      {renderExposure(4)}
                    </div>
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item casino-card-img ${getSuspendedClass(getOddsBySid(5)?.gstatus, 5)}`}
                      onClick={() => handleOddsClick("Poison Red", getOddsBySid(5)?.b1, 5, true)}
                    >
                      <span>
                        <img src="https://wver.sprintstaticdata.com/v207/static/front/img/cards/heart.png" alt="heart" />
                        <img src="https://wver.sprintstaticdata.com/v207/static/front/img/cards/diamond.png" alt="diamond" />
                      </span>
                      {renderExposure(5)}
                    </div>
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item casino-card-img ${getSuspendedClass(getOddsBySid(6)?.gstatus, 6)}`}
                      onClick={() => handleOddsClick("Poison Black", getOddsBySid(6)?.b1, 6, true)}
                    >
                      <span>
                        <img src="https://wver.sprintstaticdata.com/v207/static/front/img/cards/spade.png" alt="spade" />
                        <img src="https://wver.sprintstaticdata.com/v207/static/front/img/cards/club.png" alt="club" />
                      </span>
                      {renderExposure(6)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-1">
                <div className="casino-box-row">
                  <div className="casino-bl-box">
                    <div className="casino-bl-box-item casino-card-img"><img src="https://wver.sprintstaticdata.com/v207/static/front/img/cards/spade.png" alt="spade" /></div>
                  </div>
                  <div className="casino-bl-box">
                    <div className="casino-bl-box-item casino-card-img"><img src="https://wver.sprintstaticdata.com/v207/static/front/img/cards/heart.png" alt="heart" /></div>
                  </div>
                  <div className="casino-bl-box">
                    <div className="casino-bl-box-item casino-card-img"><img src="https://wver.sprintstaticdata.com/v207/static/front/img/cards/diamond.png" alt="diamond" /></div>
                  </div>
                  <div className="casino-bl-box">
                    <div className="casino-bl-box-item casino-card-img"><img src="https://wver.sprintstaticdata.com/v207/static/front/img/cards/club.png" alt="club" /></div>
                  </div>
                </div>
                <div className="casino-box-row">
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(7)?.gstatus, 7)}`}
                      onClick={() => handleOddsClick("Poison Spade", getOddsBySid(7)?.b1, 7, true)}
                    >
                      <span className="casino-box-odd">{getOddsBySid(7)?.b1 || "0"}</span>
                      {renderExposure(7)}
                    </div>
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(8)?.gstatus, 8)}`}
                      onClick={() => handleOddsClick("Poison Heart", getOddsBySid(8)?.b1, 8, true)}
                    >
                      <span className="casino-box-odd">{getOddsBySid(8)?.b1 || "0"}</span>
                      {renderExposure(8)}
                    </div>
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(9)?.gstatus, 9)}`}
                      onClick={() => handleOddsClick("Poison Diamond", getOddsBySid(9)?.b1, 9, true)}
                    >
                      <span className="casino-box-odd">{getOddsBySid(9)?.b1 || "0"}</span>
                      {renderExposure(9)}
                    </div>
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(10)?.gstatus, 10)}`}
                      onClick={() => handleOddsClick("Poison Club", getOddsBySid(10)?.b1, 10, true)}
                    >
                      <span className="casino-box-odd">{getOddsBySid(10)?.b1 || "0"}</span>
                      {renderExposure(10)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    </>
  );
};

export default TeenPattiPoison20;
