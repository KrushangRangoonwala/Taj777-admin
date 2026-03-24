import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useIsMobile from "../../hooks/useIsMobile";
import CasinoVideo from "./components/CasinoVideo";
import { fetchCasinoExposureApi } from "../../api/api";
import "./kk.css";
import { getExposureClass } from "../../utilies/helpers";

const CasinoWar = ({ isVisible, onBetSelection, exposureTrigger }) => {
  const [gameData, setGameData] = useState({});
  const [exposureData, setExposureData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const params = new URLSearchParams(window.location.search);
  const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(false);
  const isMobileView = useIsMobile();
  const [selectedPosition, setSelectedPosition] = useState(1);

  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io("https://trubet9.bet:2053", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ CasinoWar connected to socket:", socket.id);
      setIsConnected(true);
      socket.emit("Room", "war");
    });

    const handleSocketData = (data) => {
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      // Handle both Wrapped data (.data) and direct data
      const gamePayload = parsedData?.data || parsedData;

      if (gamePayload) {
        setGameData(prev => ({
          ...prev,
          ...gamePayload
        }));
      }
    };

    socket.on("war", handleSocketData);
    socket.on("game", handleSocketData);
    socket.on("message", handleSocketData);

    return () => {
      socket.off("war", handleSocketData);
      socket.off("game", handleSocketData);
      socket.off("message", handleSocketData);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchExposure = async () => {
      const mid = gameData.t1?.[0]?.mid;
      if (!mid) return;
      try {
        const response = await fetchCasinoExposureApi({
          markettype: "war",
          main_event_id: mid,
          curPageName: "live_casinowar.php",
        });
        if (Array.isArray(response?.data)) {
          setExposureData(response.data);
        }
      } catch (error) {
        console.error("Error fetching exposure:", error);
      }
    };
    fetchExposure();
  }, [gameData.t1?.[0]?.mid, exposureTrigger]);

  const getExposure = (marketId) => {
    if (!Array.isArray(exposureData)) return 0;
    const market = exposureData.find((item) => item.market_id == marketId);
    return market ? market.win_loss || market.total_exposure : 0;
  };

  const renderExposure = (marketId) => {
    const exposure = getExposure(marketId);
    if (!exposure || exposure == 0) return null;
    return (
      <span className={`mr-2 ${getExposureClass(exposure)}`}>
        {exposure}
      </span>
    );
  };

  const VideoCards = () => {
    const cardData = gameData.t1?.[0];
    const c7 = cardData?.C7;
    const showC7 = c7 && c7 !== "1";

    return (
      <div className="casino-video-cards-container">
        {showC7 && (
          <div style={{ marginBottom: '5px' }}>
            <span>
              <img
                src={`https://wver.sprintstaticdata.com/v67/static/front/img/cards/${c7}.png`}
                alt="Card 7"
                style={{
                  width: "22px",
                  height: "60px",
                  objectFit: "contain",
                  borderRadius: "4px",
                }}
              />
            </span>
          </div>
        )}
      </div>
    );
  };


  const handleBet = (market, teamName, isBack = true) => {
    const globalStatus = gameData?.gstatus ?? gameData?.t1?.[0]?.gstatus;
    const isGlobalSuspended = globalStatus === "SUSPENDED" || globalStatus === "suspended" || globalStatus === 0 || globalStatus === "0";
    if (isGlobalSuspended) return;

    if (!market || market.gstatus === "SUSPENDED" || market.gstatus === "suspended" || market.gstatus === 0 || market.gstatus === "0") {
      return;
    }

    if (onBetSelection) {
      onBetSelection({
        ...market,
        teamName,
        isBack,
        minBet: market.min || 100,
        maxBet: market.max || 10000,
        odds: market.b1,
        marketId: market.sid,
        eventId: gameData.t1?.[0]?.mid
      });
    }
  };

  const renderBetBox = (label, colIndex) => {
    const nat = `${label} ${colIndex}`;
    const market = gameData.t2?.find(m => m.nat === nat);

    // Only consider suspended if explicitly marked as such
    const isSuspended = market && (market.gstatus === "SUSPENDED" || market.gstatus === "suspended");
    const isLocked = !market || !market.b1 || market.b1 === "0" || market.b1 === "0.00" || market.b1 === 0;
    const odds = market && market.b1 ? market.b1 : "0.00";

    return (
      <div className="casino-bl-box" onClick={() => !isLocked && !isSuspended && handleBet(market, nat)}>
        <div className={`back casino-bl-box-item ${isSuspended || isLocked ? "suspended" : ""}`} style={{ flexDirection: 'column' }}>
          <span className="casino-box-odd">
            {isLocked ? <i className="fas fa-lock"></i> : odds}
          </span>
          {market && renderExposure(market.sid)}
        </div>
      </div>
    );
  };

  const renderMobileBetBox = (label, type, colIndex) => {
    const nat = `${type} ${colIndex}`;
    const market = gameData.t2?.find(m => m.nat === nat);

    const isSuspended = market && (market.gstatus === "SUSPENDED" || market.gstatus === "suspended");
    const isLocked = !market || !market.b1 || market.b1 === "0" || market.b1 === "0.00" || market.b1 === 0;
    const odds = market && market.b1 ? market.b1 : "0";
    const exp = getExposure(market?.sid);

    return (
      <div className="mobile-bet-row">
        <div className="mobile-bet-label">{label}</div>
        <div
          className={`mobile-bet-button ${isSuspended || isLocked ? `suspended ${exp && exp != 0 ? "lock-top" : ""}` : ""}`}
          onClick={() => !isLocked && !isSuspended && handleBet(market, nat)}
          style={{ flexDirection: 'column' }}
        >
          <span>{odds}</span>
          {market && renderExposure(market.sid)}
        </div>
      </div>
    );
  };

  // Cards display logic
  const renderCard = (card) => {
    if (!card) return null;
    return <div className="casino-bl-box-item casino-card-img"><span><img src={`https://wver.sprintstaticdata.com/v67/static/front/img/cards/${card}.png`} /></span></div>
  }

  const cards = gameData.t1?.[0]?.C7 && gameData.t1?.[0]?.C7 !== "1" ? [gameData.t1[0].C7] : [];

  return (
    <>
      <div className="casino-table casino-war kk">
        <CasinoVideo
          gameName="Casino War"
          roundId={gameData.t1?.[0]?.mid}
          videoSrc="/mediaplayer/war/f3747eec-df3d-4515-b869-c9dda01202ad"
          autotime={gameData.t1?.[0]?.autotime}
          totalTime={gameData.t1?.[0]?.ft} isCardDrawerOpen={isCardDrawerOpen}
          setIsCardDrawerOpen={setIsCardDrawerOpen}
          cards={cards}
          CardsComponent={VideoCards}
          drawerStyle={{ textTransform: 'none' }}
        />

        <style jsx global>{`
          .casino-name, .casino-nation-name, .mobile-bet-label {
            text-transform: none !important;
          }
        `}</style>

        {/* Betting Board */}
        <div className="casino-detail" style={{ paddingBottom: '0px' }}>
          <div className="teen1daycasino-container d-none-small">
            <div className="casino-war-container" style={{ marginTop: '15px', marginBottom: '0px' }}>
              {/* Headers + Cards Separated */}
              {/* Row 1: Cards */}
              <div className="casino-box-row" style={{ border: 'none', background: 'transparent', marginBottom: '-10px', zIndex: 1 }}>
                {[1, 2, 3, 4, 5, 6].map(i => {
                  const cardKey = `C${i}`;
                  const card = gameData.t1 && gameData.t1[0] ? gameData.t1[0][cardKey] : null;

                  return (
                    <div className="casino-bl-box" key={i} style={{ background: 'transparent', boxShadow: 'none', width: '16.66%' }}>
                      <div className="casino-bl-box-item" style={{ display: 'flex', justifyContent: 'center', background: 'transparent', border: 'none', paddingBottom: 0 }}>
                        <img
                          src={card ? `https://wver.sprintstaticdata.com/v67/static/front/img/cards/${card}.png` : "https://wver.sprintstaticdata.com/v67/static/front/img/cards/1.png"}
                          style={{ width: '30px', marginBottom: '15px' }}
                          alt={`Card ${i}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Row 2: Numbers */}
              <div className="casino-box-row casino-war-title" style={{ marginBottom: '5px' }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div className="casino-bl-box" key={i} style={{ width: '16.66%' }}>
                    <div className="casino-bl-box-item" style={{ display: 'flex', justifyContent: 'center' }}>
                      <b>{i}</b>
                    </div>
                  </div>
                ))}
              </div>

              {/* Winner Row */}
              <div className="casino-box-row">
                <div className="casino-nation-name" style={{ textTransform: 'none' }}><b>Winner</b></div>
                {[1, 2, 3, 4, 5, 6].map(i => renderBetBox("Winner", i))}
              </div>

              {/* Spades/Clubs - Black Suits */}
              <div className="casino-box-row">
                <div className="casino-nation-name casino-card-img" style={{ textTransform: 'none' }}><span><img src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/spade.png" /> <img src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/club.png" /></span></div>
                {[1, 2, 3, 4, 5, 6].map(i => renderBetBox("Black", i))}
              </div>

              {/* Hearts/Diamonds - Red Suits */}
              <div className="casino-box-row">
                <div className="casino-nation-name casino-card-img" style={{ textTransform: 'none' }}><span><img src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/heart.png" /> <img src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/diamond.png" /></span></div>
                {[1, 2, 3, 4, 5, 6].map(i => renderBetBox("Red", i))}
              </div>

              {/* Odd */}
              <div className="casino-box-row">
                <div className="casino-nation-name" style={{ textTransform: 'none' }}><b>Odd</b></div>
                {[1, 2, 3, 4, 5, 6].map(i => renderBetBox("Odd", i))}
              </div>

              {/* Even */}
              <div className="casino-box-row">
                <div className="casino-nation-name" style={{ textTransform: 'none' }}><b>Even</b></div>
                {[1, 2, 3, 4, 5, 6].map(i => renderBetBox("Even", i))}
              </div>

              {/* Spade */}
              <div className="casino-box-row">
                <div className="casino-nation-name casino-card-img" style={{ textTransform: 'none' }}><span><img src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/spade.png" /></span></div>
                {[1, 2, 3, 4, 5, 6].map(i => renderBetBox("Spade", i))}
              </div>

              {/* Heart */}
              <div className="casino-box-row">
                <div className="casino-nation-name casino-card-img" style={{ textTransform: 'none' }}><span><img src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/heart.png" /></span></div>
                {[1, 2, 3, 4, 5, 6].map(i => renderBetBox("Heart", i))}
              </div>

              {/* Club */}
              <div className="casino-box-row">
                <div className="casino-nation-name casino-card-img" style={{ textTransform: 'none' }}><span><img src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/club.png" /></span></div>
                {[1, 2, 3, 4, 5, 6].map(i => renderBetBox("Club", i))}
              </div>

              {/* Diamond */}
              <div className="casino-box-row">
                <div className="casino-nation-name casino-card-img" style={{ textTransform: 'none' }}><span><img src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/diamond.png" /></span></div>
                {[1, 2, 3, 4, 5, 6].map(i => renderBetBox("Diamond", i))}
              </div>

            </div>
          </div>
        </div>

        {isMobileView && (
          <div className="mobile-casino-war-layout">
            <style jsx>{`
              .mobile-casino-war-layout {
                background: #2d373c;
                padding-bottom: 20px;
                font-family: 'Roboto', sans-serif;
              }
              :root[data-theme="light"] .mobile-casino-war-layout {
                background: #fdfbfe;
              } 
              .mobile-pos-cards-row {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                align-items: center;
                margin-bottom: 10px;
                margin-top: 2px;
                width: 100%;
              }
              .mobile-pos-numbers-row {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                align-items: center;
                height: 36px;
                background-color: #444;
                margin-bottom: 10px;
                justify-content: flex-start;
                border-radius: 0;
                width: 100%;
              }
              .mobile-pos-card-slot {
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                height: 100%;
              }
              .mobile-pos-card-slot:last-child {
                border-right: none;
              }
              
              .mobile-pos-card-slot img {
                width: 28px;
                height: auto;
              }
              .mobile-pos-number-slot {
                text-align: center;
                color: #999;
                font-weight: bold;
                font-size: 13px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                background: transparent;
                height: 100%;
              }
              .mobile-pos-number-slot:last-child {
                border-right: none;
              }
              .mobile-pos-number-slot.active {
                color: #fff;
              }
              .mobile-betting-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0;
                border-top: 1px solid #444;
                position: relative;
              }
              .mobile-betting-grid::after {
                content: '';
                position: absolute;
                top: 0;
                bottom: 0;
                left: 50%;
                width: 2px;
                background: #DDDDDD;
                z-index: 1;
              }
              .mobile-bet-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: transparent;
                padding: 0 5px 0 0;
                margin-bottom: 5px;
                gap: 2px;
              }
              :root[data-theme="light"] .mobile-bet-label {
                background-color: #ddd;
                color: #333;
              }
              .mobile-bet-label {
                flex: 1;
                height: 38px;
                display: flex;
                align-items: center;
                background-color: #444;
                font-size: 11px;
                font-weight: bold;
                text-transform: none;
                padding-left: 8px;
                color: #DDDDDD;
              }
              .mobile-bet-label img {
                height: 18px;
                width: auto;
                margin-right: 4px;
              }
                .casino-video-cards {
        top: 80px;
        transform: unset;
        width: 45px;
        padding: 5px 10px 5px 5px;
        height: 65px;
    }
              :root[data-theme="light"] .mobile-bet-button {
              color: #333;
              }
              .mobile-bet-button {
                width: 90px;
                height: 38px;
                background-color: #3d4e5a;
                border: 2px solid #72bbef;
                border-radius: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #D7D7D7;
                font-weight: bold;
                font-size: 13px;
                cursor: pointer;
              }
              .mobile-bet-button.suspended {
                /* Keep the blue border even when suspended */
                color: #D7D7D7;
                background: rgba(0,0,0,0.1);
              }
              .mobile-bet-button i {
                font-size: 12px;
              }
            `}</style>

            {/* Cards Row */}
            <div className="mobile-pos-cards-row casino-tabs">
              {[1, 2, 3, 4, 5, 6].map(i => {
                const cardKey = `C${i}`;
                const card = gameData.t1 && gameData.t1[0] ? gameData.t1[0][cardKey] : null;
                return (
                  <div key={i} className={`mobile-pos-card-slot ${selectedPosition === i ? 'active' : ''}`} onClick={() => setSelectedPosition(i)}>
                    <img
                      src={card ? `https://wver.sprintstaticdata.com/v67/static/front/img/cards/${card}.png` : "https://wver.sprintstaticdata.com/v67/static/front/img/cards/1.png"}
                      alt={`C${i}`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Numbers Row */}
            <div className="mobile-pos-numbers-row casino-tabs">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div
                  key={i}
                  className={`mobile-pos-number-slot ${selectedPosition === i ? 'active' : ''}`}
                  onClick={() => setSelectedPosition(i)}
                >
                  {i}
                </div>
              ))}
            </div>

            {/* Betting Grid */}
            <div className="mobile-betting-grid">
              {/* Left Column */}
              <div className="mobile-grid-col">
                {renderMobileBetBox(`Winner ${selectedPosition}`, "Winner", selectedPosition)}
                {renderMobileBetBox(
                  <div className="d-flex">
                    <img src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/spade.png" alt="S" />
                    <img src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/club.png" alt="C" />
                  </div>,
                  "Black", selectedPosition
                )}
                {renderMobileBetBox(
                  <div className="d-flex">
                    <img src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/heart.png" alt="H" />
                    <img src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/diamond.png" alt="D" />
                  </div>,
                  "Red", selectedPosition
                )}
                {renderMobileBetBox(`Odd ${selectedPosition}`, "Odd", selectedPosition)}
                {renderMobileBetBox(`Even ${selectedPosition}`, "Even", selectedPosition)}
              </div>

              {/* Right Column */}
              <div className="mobile-grid-col">
                {renderMobileBetBox(
                  <img src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/spade.png" alt="S" />,
                  "Spade", selectedPosition
                )}
                {renderMobileBetBox(
                  <img src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/heart.png" alt="H" />,
                  "Heart", selectedPosition
                )}
                {renderMobileBetBox(
                  <img src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/club.png" alt="C" />,
                  "Club", selectedPosition
                )}
                {renderMobileBetBox(
                  <img src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/diamond.png" alt="D" />,
                  "Diamond", selectedPosition
                )}
                <div className="mobile-bet-row" style={{ background: 'transparent', border: 'none' }}></div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};
export default CasinoWar;
