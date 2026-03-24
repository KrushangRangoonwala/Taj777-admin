import React, { useState, useEffect, useRef } from "react";
import { fetchCasinoExposureApi } from "../../api/api";
import { useSocket } from "../../components/Socket/useSocket";
import { getExposureClass, getImage, getValueAfterDot, getValueBeforeDot } from "../../utilies/helpers";
import useIsMobile from "../../hooks/useIsMobile";
import CasinoVideo from "./components/CasinoVideo";
import { useGetFileData } from "../../hooks/useGetFileData";

const TeenPatti41 = ({ onBetSelection, lastBetTime, exposureTrigger }) => {
  const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
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

  const renderExposure = (marketId) => {
    const exposure = getExposure(marketId);
    if (exposure === 0) return null;
    return (
      <span className={`mr-2 ${getExposureClass(exposure)}`}>
        {exposure}
      </span>
    );
  };

  const socket = useSocket("casino");
  useEffect(() => {
    if (!socket) return;

    const handleBollywoodData = (data) => {
      try {
        const payload = Array.isArray(data) ? data[0] : data;
        if (payload) {
          setGameData(payload);
        }
      } catch (error) {
        console.error("Error processing Bollywood data:", error);
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
    socket.on(game_type, handleBollywoodData);
    socket.on("game", handleBollywoodData);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off(game_type, handleBollywoodData);
      socket.off("game", handleBollywoodData);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [socket, game_type]);


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
        <div>
          <span>
            <img src={getImage(gameData?.t1?.[0]?.C1, result_image)} alt="card" />
          </span>
          <span>
            <img src={getImage(gameData?.t1?.[0]?.C3, result_image)} alt="card" />
          </span>
          <span>
            <img src={getImage(gameData?.t1?.[0]?.C5, result_image)} alt="card" />
          </span>
        </div>
        <div>
          <span>
            <img src={getImage(gameData?.t1?.[0]?.C2, result_image)} alt="card" />
          </span>
          <span>
            <img src={getImage(gameData?.t1?.[0]?.C4, result_image)} alt="card" />
          </span>
          <span>
            <img src={getImage(gameData?.t1?.[0]?.C6, result_image)} alt="card" />
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          .teenpatti-mobile-container {
            padding: 0 !important;
            margin: 0 !important;
            background-color: #2e3439;
            color: #ccc;
            // font-family: sans-serif;
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


           .teenpatti-new .casino-video-cards {
              position: absolute;
              left: 0;
              top: 55%;
              transform: translateY(-50%);
              width: 110px;
              height: 105px;
              background: rgba(0, 0, 0, 0.7);
              border-radius: 0 8px 8px 0;
              z-index: 100;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              will-change: transform, width;
              backface-visibility: hidden;
              transform-origin: left center;
              overflow: hidden !important;
              box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
            }
         `}
      </style>

      <div className="casino-table kk">
        {/* Video Section */}
        <CasinoVideo
          gameName={game_name}
          roundId={gameData?.t1?.[0]?.mid}
          videoSrc={iframe_url}
          autotime={gameData?.t1?.[0]?.autotime}
          totalTime={gameData?.t1?.[0]?.ft} isCardDrawerOpen={isDrawerOpen}
          setIsCardDrawerOpen={setIsDrawerOpen}
          cards={[gameData?.t1?.[0]?.C1, gameData?.t1?.[0]?.C2, gameData?.t1?.[0]?.C3, gameData?.t1?.[0]?.C4, gameData?.t1?.[0]?.C5, gameData?.t1?.[0]?.C6]}
          CardsComponent={VideoCards}
        />

        {/* Betting Section */}
        <div className="casino-detail">
          {isMobileView ? (
            <div className="teenpatti-mobile-container">
              <style>
                {`
                  .teenpatti-mobile-container {
                    padding: 0;
                    background-color: #2e3439;
                    color: #ccc;
                    // font-family: sans-serif;
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
                    // padding-left: 5px;
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
                  
                  .mobile-row-label {
                    flex: 1;
                    height: 35px;
                    display: flex;
                    align-items: center;
                    background-color: #444;
                    font-size: 12px;
                    font-weight: bold;
                    text-transform: uppercase;
                    padding-left: 8px;
                    color: #eee;
                    margin-right: 0 !important;
                    border-radius: 0 !important;
                    justify-content: space-between;
                    padding-right: 5px;
                  }

                  .mobile-odds-box {
                    flex: 1.1;
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
                        font-weight: 400;
                        padding: 5px;
                        // background: #2a2a2a;
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
                <div className="mobile-section-header">
                  <div>MAIN</div>
                  <div style={{ position: 'relative', left: '-12px' }}>BACK</div>
                  <div style={{ position: 'relative', left: '-5px' }}>LAY</div>
                </div>

                {/* Player A */}
                <div className="mobile-row">
                  <div className="mobile-row-label aaa"><span>Player A</span> {renderExposure(1)}</div>
                  <div className={`mobile-odds-box back ${getSuspendedClass(getOddsBySid(1)?.gstatus)}`}
                    onClick={() => handleOddsClick("Player A Main", getOddsBySid(1)?.b1, 1, true)}>
                    {!isSuspended(getOddsBySid(1)?.gstatus) ? getOddsBySid(1)?.b1 : <i className="fas fa-lock"></i>}
                  </div>
                  <div className={`mobile-odds-box lay ${getSuspendedClass(getOddsBySid(1)?.gstatus)}`}
                    onClick={() => handleOddsClick("Player A Main", getOddsBySid(1)?.l1, 1, false)}>
                    {!isSuspended(getOddsBySid(1)?.gstatus) ? getOddsBySid(1)?.l1 : <i className="fas fa-lock"></i>}
                  </div>
                </div>

                {/* Player B */}
                <div className="mobile-row">
                  <div className="mobile-row-label aaa"><span>Player B</span> {renderExposure(2)}</div>
                  <div className={`mobile-odds-box back ${getSuspendedClass(getOddsBySid(2)?.gstatus)}`}
                    onClick={() => handleOddsClick("Player B Main", getOddsBySid(2)?.b1, 2, true)}>
                    {!isSuspended(getOddsBySid(2)?.gstatus) ? getOddsBySid(2)?.b1 : <i className="fas fa-lock"></i>}
                  </div>
                  <div className={`mobile-odds-box lay ${getSuspendedClass(getOddsBySid(2)?.gstatus)}`}
                    onClick={() => handleOddsClick("Player B Main", getOddsBySid(2)?.l1, 2, false)}>
                    {!isSuspended(getOddsBySid(2)?.gstatus) ? getOddsBySid(2)?.l1 : <i className="fas fa-lock"></i>}
                  </div>
                </div>
              </div>

              {/* Top 9 SECTION */}
              <div className="mobile-section-container">
                <div className="market-section-title">Player B</div>
                {/* Top 9 A */}
                <div className="mobile-row">
                  <div className="mobile-row-label" style={{ textTransform: "none" }}><span>Under 21</span> {renderExposure(3)}</div>
                  <div className={`mobile-odds-box back ${getSuspendedClass(getOddsBySid(3)?.gstatus)}`}
                    onClick={() => handleOddsClick("Player B Under 21", getOddsBySid(3)?.b1, 3, true)}>
                    {!isSuspended(getOddsBySid(3)?.gstatus) ? getOddsBySid(3)?.b1 : <i className="fas fa-lock"></i>}
                  </div>

                </div>
                {/* Top 9 B */}
                <div className="mobile-row">
                  <div className="mobile-row-label" style={{ textTransform: "none" }}><span>Over 22</span> {renderExposure(4)}</div>
                  <div className={`mobile-odds-box back ${getSuspendedClass(getOddsBySid(4)?.gstatus)}`}
                    onClick={() => handleOddsClick("Player B Over 21", getOddsBySid(4)?.b1, 4, true)}>
                    {!isSuspended(getOddsBySid(4)?.gstatus) ? getOddsBySid(4)?.b1 : <i className="fas fa-lock"></i>}
                  </div>

                </div>
              </div>


              {/* Disclaimer Marquee */}
              <div className="remark-container" style={{ marginTop: "8px", marginBottom: "0" }}>
                <div className="remark-icon">
                  <img
                    src={getImage("remark", "images")}
                    style={{ width: "20px", height: "20px" }}
                    alt="remark"
                  />
                </div>
                <marquee>
                  {gameData?.t1?.[0]?.ramark ||
                    "Play Our New Game Premium Teenpatti 1 Day"}
                </marquee>
              </div>
            </div>
          ) : (
            <div className="teen1daycasino-container">
              {/* Left Column */}
              <div className="teen1dayleft">
                {/* Main A */}
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
                  <div className="casino-nation-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 5 }}><b>Main</b> {renderExposure(1)}</div>
                  <div className="casino-bl-box">
                    <div className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(1)?.gstatus)}`}
                      onClick={() => handleOddsClick("Player A Main", getOddsBySid(1)?.b1, 1, true)}>
                      <span className="casino-box-odd">{!isSuspended(getOddsBySid(1)?.gstatus) ? getOddsBySid(1)?.b1 : <i className="fas fa-lock" />}</span>
                    </div>
                    <div className={`lay casino-bl-box-item ${getSuspendedClass(getOddsBySid(1)?.gstatus)}`}
                      onClick={() => handleOddsClick("Player A Main", getOddsBySid(1)?.l1, 1, false)}>
                      <span className="casino-box-odd">{!isSuspended(getOddsBySid(1)?.gstatus) ? getOddsBySid(1)?.l1 : <i className="fas fa-lock" />}</span>
                    </div>
                  </div>
                </div>

                {/* Top 9 A */}
                <div className="casino-box-row">
                  <div className="casino-nation-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 5 }}><b>Top 9 A</b> {renderExposure(3)}</div>
                  <div className="casino-bl-box">
                    <div className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(3)?.gstatus)}`}
                      onClick={() => handleOddsClick("Player B Under 21", getOddsBySid(3)?.b1, 3, true)}>
                      <span className="casino-box-odd">{!isSuspended(getOddsBySid(3)?.gstatus) ? getOddsBySid(3)?.b1 : <i className="fas fa-lock" />}</span>
                    </div>

                  </div>
                </div>

                {/* M Baccarat A */}
                <div className="casino-box-row">
                  <div className="casino-nation-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 5 }}><b>M Baccarat A</b> {renderExposure(5)}</div>
                  <div className="casino-bl-box">
                    <div className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(5)?.gstatus)}`}
                      onClick={() => handleOddsClick("M Baccarat A", getOddsBySid(5)?.b1, 5, true)}>
                      <span className="casino-box-odd">{!isSuspended(getOddsBySid(5)?.gstatus) ? getOddsBySid(5)?.b1 : <i className="fas fa-lock" />}</span>
                    </div>
                    <div className={`lay casino-bl-box-item ${getSuspendedClass(getOddsBySid(5)?.gstatus)}`}
                      onClick={() => handleOddsClick("M Baccarat A", getOddsBySid(5)?.l1, 5, false)}>
                      <span className="casino-box-odd">{!isSuspended(getOddsBySid(5)?.gstatus) ? getOddsBySid(5)?.l1 : <i className="fas fa-lock" />}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="teen1daycenter"></div>

              {/* Right Column */}
              <div className="teen1dayright">
                {/* Main B */}
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
                  <div className="casino-nation-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 5 }}><b>Main</b> {renderExposure(2)}</div>
                  <div className="casino-bl-box">
                    <div className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(2)?.gstatus)}`}
                      onClick={() => handleOddsClick("Player B Main", getOddsBySid(2)?.b1, 2, true)}>
                      <span className="casino-box-odd">{!isSuspended(getOddsBySid(2)?.gstatus) ? getOddsBySid(2)?.b1 : <i className="fas fa-lock" />}</span>
                    </div>
                    <div className={`lay casino-bl-box-item ${getSuspendedClass(getOddsBySid(2)?.gstatus)}`}
                      onClick={() => handleOddsClick("Player B Main", getOddsBySid(2)?.l1, 2, false)}>
                      <span className="casino-box-odd">{!isSuspended(getOddsBySid(2)?.gstatus) ? getOddsBySid(2)?.l1 : <i className="fas fa-lock" />}</span>
                    </div>
                  </div>
                </div>

                {/* Top 9 B */}
                <div className="casino-box-row">
                  <div className="casino-nation-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 5 }}><b>Top 9 B</b> {renderExposure(4)}</div>
                  <div className="casino-bl-box">
                    <div className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(4)?.gstatus)}`}
                      onClick={() => handleOddsClick("Player B Over 21", getOddsBySid(4)?.b1, 4, true)}>
                      <span className="casino-box-odd">{!isSuspended(getOddsBySid(4)?.gstatus) ? getOddsBySid(4)?.b1 : <i className="fas fa-lock" />}</span>
                    </div>

                  </div>
                </div>

                {/* M Baccarat B */}
                <div className="casino-box-row">
                  <div className="casino-nation-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 5 }}><b>M Baccarat B</b> {renderExposure(6)}</div>
                  <div className="casino-bl-box">
                    <div className={`back casino-bl-box-item ${getSuspendedClass(getOddsBySid(6)?.gstatus)}`}
                      onClick={() => handleOddsClick("M Baccarat B", getOddsBySid(6)?.b1, 6, true)}>
                      <span className="casino-box-odd">{!isSuspended(getOddsBySid(6)?.gstatus) ? getOddsBySid(6)?.b1 : <i className="fas fa-lock" />}</span>
                    </div>
                    <div className={`lay casino-bl-box-item ${getSuspendedClass(getOddsBySid(6)?.gstatus)}`}
                      onClick={() => handleOddsClick("M Baccarat B", getOddsBySid(6)?.l1, 6, false)}>
                      <span className="casino-box-odd">{!isSuspended(getOddsBySid(6)?.gstatus) ? getOddsBySid(6)?.l1 : <i className="fas fa-lock" />}</span>
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

export default TeenPatti41;
