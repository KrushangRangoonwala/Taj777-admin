import React, { useState, useEffect } from "react";
import { fetchCasinoExposureApi } from "../../api/api";
import { useSocket } from "../../components/Socket/useSocket";
import { getCards_Sum, getValueAfterDot } from "../../utilies/helpers";
import useIsMobile from "../../hooks/useIsMobile";
import CasinoVideo from "./components/CasinoVideo";
import { useGetFileData } from "../../hooks/useGetFileData";

const Mogambo = ({ onBetSelection, lastBetTime, exposureTrigger }) => {
  const { CODE, game_type, phpFile, game_name, iframe_url } = useGetFileData();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [gameData, setGameData] = useState(null);
  const [exposureData, setExposureData] = useState([]);
  const isMobile = useIsMobile();

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
  }, [gameData?.t1?.[0]?.mid, lastBetTime, exposureTrigger, CODE, phpFile]);

  const getExposure = (marketId) => {
    if (!Array.isArray(exposureData)) return 0;
    const market = exposureData.find((item) => item.market_id == marketId);
    return market ? market.win_loss || market.total_exposure : 0;
  };

  const renderExposure = (marketId) => {
    const exposure = getExposure(marketId);
    if (exposure === 0) return null;
    return (
      <span className={`${exposure > 0 ? 'book-green' : 'book-red'}`} style={{ position: "absolute", top: "25px", right: "5px", marginRight: "15px", fontSize: "12px" }}>
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
      socket.emit("Room", game_type);
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);
    socket.on(game_type, handleData);
    socket.on("game", handleData);

    return () => {
      socket.off("connect", handleConnect);
      socket.off(game_type, handleData);
      socket.off("game", handleData);
    };
  }, [socket, game_type]);

  const isSuspended = (status) => {
    if (!status) return false;
    const s = status.toString().toUpperCase();
    return s === "SUSPENDED" || s === "0" || s === "BALL RUNNING" || s === "LOCKED";
  };

  const getMinMax = (sid) => {
    const market = gameData?.t2?.find((m) => m.sid == sid);
    return {
      min: market?.min || 100,
      max: market?.max || 25000,
    };
  };

  const handleOddsClick = (teamName, odds, sid, isBack, runs) => {
    const market = getOddsBySid(sid);
    if (!isSuspended(market?.gstatus) && onBetSelection) {
      const { min, max } = getMinMax(sid);
      onBetSelection({
        teamName,
        odds,
        runs: runs ?? null,
        shown_odds: runs ?? null,
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
    const t1 = gameData?.t1?.[0];
    if (!t1) return null;

    const getCardImg = (val) => `https://wver.sprintstaticdata.com/v207/static/front/img/cards/${val}.png`;

    return (
      <>
        <h5 className="dealer-name">Daga / Teja</h5>
        <div>
          <span><img src={getCardImg(t1.C1)} alt="C1" /></span>
          <span className="card-devider"></span>
          <span><img src={getCardImg(t1.C2)} alt="C2" /></span>
        </div>

        <h5 className="dealer-name">Mogambo</h5>
        <div>
          <span><img src={getCardImg(t1.C3)} alt="C3" /></span>
        </div>
      </>
    );
  };

  const VideoTitle = () => {
    const t1 = gameData?.t1?.[0];
    const total = getCards_Sum([t1?.C1, t1?.C2, t1?.C3]);

    return (
      <div className="casino-video-title mogambo-total">
        <span className="casino-name">Total: {total}</span>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
        
            @media only screen and (min-width: 320px) and (max-width: 767px) {
              .mogambo.teenpatti2cards .casino-video-last-results span,
              .mogambo.teenpatti2cards .casino-video-last-results a {
                flex: 1 1 0 !important;
              }
            }
        `}
      </style>
      <div className="casino-table teenpatti2cards mogambo">
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

  .mt-2 {
    margin-top: .5rem !important;
  }

  .mr-2 {
    margin-right: .5rem !important;
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

  .pointer {
    cursor: pointer;
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

  .teen1dayleft,
  .teen1dayright {
    width: 49%;
  }

  .teenpatti2cards .casino-nation-name {
    width: 50%;
    padding-right: 10px;
    position: relative;
  }
  .casino-nation-name.has-exposure {
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .teenpatti2cards .casino-bl-box {
    width: 50%;
  }

  .teenpatti2cards .casino-bl-box-item {
    width: calc(50% - 2px);
    height: 48px;
  }

  .teenpatti2cards .casino-bl-boxfull .casino-bl-box-item {
    width: 100%;
  }

  .teenpatti2cards .teenpatti2cardsextra {
    position: relative;
  }

  .mogambo .teen1dayleft,
  .mogambo .teen1dayright {
    width: 50%;
  }

  .mogambo.teenpatti2cards .teenpatti2cardsextra {
    width: 50%;
    margin: 0 auto;
    position: relative;
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

    .casino-bl-box {
      margin-bottom: 4px;
    }

    .casino-bl-box-item .casino-box-odd {
      font-size: var(--font-13);
    }

    .teen1daycasino-container .casino-box-row {
      width: 100%;
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

  .casino-video-cards-container {
      //padding: 5px;
  }

  .dealer-name {
      color: #fff;
      font-size: 14px;
      font-weight: bold;
      // margin-bottom: 5px;
      text-transform: uppercase;
      // margin-top: 5px;
  }

  .card-devider {
      display: inline-block;
      width: 20px;
  }

  .casino-video-cards-container img {
      width: 27px;
      height: auto;
      // border-radius: 3px;
      border: 1px solid #555;
  }
      
                  `}
        </style>

        <style>
          {`
      .mogambo .casino-video-cards {
          height: 225px;
      }

      .mogambo .casino-video-cards-container>div {
          position: relative;
      }

      .mogambo .casino-video-cards-container>div:last-child {
          justify-content: center;
      }

      .mogambo .casino-video-cards-container>div>span img {
          margin-right: 15px;
      }

      .mogambo .casino-video-cards-container .card-devider {
          position: absolute;
          width: 2px;
          height: 100%;
          padding: 0;
          background: #fff;
          margin-right: 0;
          left: 50%;
          transform: translateX(-50%);
      }

          @media only screen and (min-width: 1280px) and (max-width: 1599px) {
          
          .teenpatti2cards.mogambo .casino-video-cards-container h5 {
              font-size: 14px;
          }
          }

      @media only screen and (min-width: 320px) and (max-width: 767px) {
      
          .teenpatti2cards.mogambo .casino-video-cards {
              width: 80px;
              height: 120px;
          }

          .mogambo .casino-video-cards-container .card-devider {
              transform: unset;
              left: 26px;
          }

          .mogambo .casino-video-cards-container>div>span img {
              margin-right: 10px;
          }    
      }

      @media only screen and (min-width: 768px) and (max-width: 1279px) {
          .teenpatti2cards.mogambo .casino-video-cards-container h5 {
              font-size: 16px;
          }
      }
          .casino-video-title {
          position: absolute;
          left: 5px;
          top: 5px;
          background-color: #f8f9fa35;
          padding: 5px;
          z-index: 10;
          text-align: center;
          min-width: 180px;
          display: flex;
          display: -webkit-flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
      }

      .casino-video-title .casino-name {
          font-weight: bold;
          text-transform: uppercase;
          font-size: 12px;
          line-height: 1;
          color: #fdcf13;
      }

      .casino-video-title.mogambo-total {
          top: 50px;
      }

      /*! CSS Used from: https://wver.sprintstaticdata.com/v207/static/front/css/responsive.css */
      @media only screen and (min-width: 1280px) and (max-width: 1599px) {
          .casino-video-title .casino-name {
              font-size: 14px;
          }
      }

      @media only screen and (min-width: 320px) and (max-width: 767px) {
          .casino-video-title {
              padding: 5px;
              left: 0;
              top: 6px;
              min-width: unset;
          }

          .casino-video-title .casino-name {
              font-size: var(--font-small);
              line-height: 12px;
          }

          .casino-video-title {
              background-color: rgba(0, 0, 0, 0.6);
          }

          .casino-video-title .casino-name {
              font-size: 12px;
          }
      }
          `}
        </style>

        <CasinoVideo
          gameName={game_name}
          roundId={gameData?.t1?.[0]?.mid}
          videoSrc={iframe_url}
          autotime={gameData?.t1?.[0]?.autotime}
          totalTime={gameData?.t1?.[0]?.ft}
          isCardDrawerOpen={isDrawerOpen}
          setIsCardDrawerOpen={setIsDrawerOpen}
          cards={[gameData?.t1?.[0]?.C1, gameData?.t1?.[0]?.C2, gameData?.t1?.[0]?.C3]}
          CardsComponent={VideoCards}
          VideoTitle={VideoTitle}
        />

        <div className="casino-detail">
          {/* Mobile View */}
          <div className="d-none-big">
            <div className="teen1daycasino-container">
              <div className="teen1dayleft">
                <div className="casino-box-row">
                  <div className={`casino-nation-name ${getExposure(2) !== 0 ? "has-exposure" : ""}`}>
                    <b>Daga / Teja</b>
                    <div className="float-right">{renderExposure(2)}</div>
                  </div>
                  <div className="casino-bl-box casino-bl-boxfull">
                    <div
                      className={`back casino-bl-box-item ${isSuspended(getOddsBySid(2)?.gstatus) ? "suspended" : ""}`}
                      onClick={() => handleOddsClick("Daga / Teja", getOddsBySid(2)?.b1, 2, true)}
                    >
                      <span className="casino-box-odd">{getOddsBySid(2)?.b1 || "0"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="teen1dayright">
                <div className="casino-box-row">
                  <div className={`casino-nation-name ${getExposure(1) !== 0 ? "has-exposure" : ""}`}>
                    <b>Mogambo</b>
                    <div className="float-right">{renderExposure(1)}</div>
                  </div>
                  <div className="casino-bl-box casino-bl-boxfull">
                    <div
                      className={`back casino-bl-box-item ${isSuspended(getOddsBySid(1)?.gstatus) ? "suspended" : ""}`}
                      onClick={() => handleOddsClick("Mogambo", getOddsBySid(1)?.b1, 1, true)}
                    >
                      <span className="casino-box-odd">{getOddsBySid(1)?.b1 || "0"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="teenpatti2cardsextra mt-2">
              <div className="casino-box-row">
                <div className={`casino-nation-name ${getExposure(3) !== 0 ? "has-exposure" : ""}`}>
                  <b className="pointer">3 Card Total</b>
                  <div className="float-right">{renderExposure(3)}</div>
                </div>
                <div className="casino-bl-box">
                  <div
                    className={`lay casino-bl-box-item ${isSuspended(getOddsBySid(3)?.gstatus) ? "suspended" : ""}`}
                    onClick={() => handleOddsClick("3 Card Total", getOddsBySid(3)?.ls1, 3, false, getOddsBySid(3)?.l1)}
                  >
                    <span className="casino-box-odd">{getOddsBySid(3)?.l1 || "0"}</span>
                  </div>
                  <div
                    className={`back casino-bl-box-item ${isSuspended(getOddsBySid(3)?.gstatus) ? "suspended" : ""}`}
                    onClick={() => handleOddsClick("3 Card Total", getOddsBySid(3)?.bs1, 3, true, getOddsBySid(3)?.b1)}
                  >
                    <span className="casino-box-odd">{getOddsBySid(3)?.b1 || "0"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="d-none-small">
            <div className="teen1daycasino-container">
              <div className="teen1dayleft">
                <div className="casino-box-row">
                  <div className={`casino-nation-name ${getExposure(2) !== 0 ? "has-exposure" : ""}`}>
                    <b>Daga / Teja</b>
                    <div className="float-right">{renderExposure(2)}</div>
                  </div>
                  <div className="casino-bl-box casino-bl-boxfull">
                    <div
                      className={`back casino-bl-box-item ${isSuspended(getOddsBySid(2)?.gstatus) ? "suspended" : ""}`}
                      onClick={() => handleOddsClick("Daga / Teja", getOddsBySid(2)?.b1, 2, true)}
                    >
                      <span className="casino-box-odd">{getOddsBySid(2)?.b1 || "0"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="teen1dayright">
                <div className="casino-box-row">
                  <div className={`casino-nation-name ${getExposure(1) !== 0 ? "has-exposure" : ""}`}>
                    <b>Mogambo</b>
                    <div className="float-right">{renderExposure(1)}</div>
                  </div>
                  <div className="casino-bl-box casino-bl-boxfull">
                    <div
                      className={`back casino-bl-box-item ${isSuspended(getOddsBySid(1)?.gstatus) ? "suspended" : ""}`}
                      onClick={() => handleOddsClick("Mogambo", getOddsBySid(1)?.b1, 1, true)}
                    >
                      <span className="casino-box-odd">{getOddsBySid(1)?.b1 || "0"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="teenpatti2cardsextra mt-3">
              <div className="casino-box-row">
                <div className={`casino-nation-name ${getExposure(3) !== 0 ? "has-exposure" : ""}`}>
                  <b className="pointer">3 Card Total</b>
                  <div className="float-right">{renderExposure(3)}</div>
                </div>
                <div className="casino-bl-box total-odds">
                  <div
                    className={`lay casino-bl-box-item ${isSuspended(getOddsBySid(3)?.gstatus) ? "suspended" : ""}`}
                    onClick={() => handleOddsClick("3 Card Total", getOddsBySid(3)?.l1, 3, false)}
                  >
                    <span className="casino-box-odd">{getOddsBySid(3)?.v1 || getOddsBySid(3)?.l1 || "0"}</span>
                    <span>{getOddsBySid(3)?.l1 || "0"}</span>
                  </div>
                  <div
                    className={`back casino-bl-box-item ${isSuspended(getOddsBySid(3)?.gstatus) ? "suspended" : ""}`}
                    onClick={() => handleOddsClick("3 Card Total", getOddsBySid(3)?.b1, 3, true)}
                  >
                    <span className="casino-box-odd">{getOddsBySid(3)?.v1 || getOddsBySid(3)?.b1 || "0"}</span>
                    <span>{getOddsBySid(3)?.b1 || "0"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Mogambo;
