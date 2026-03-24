import React, { useState, useEffect, useRef } from "react";
import { fetchCasinoExposureApi, fetchOpenBetsApi } from "../../api/api";
import { io } from "socket.io-client";
import useIsMobile from "../../hooks/useIsMobile";
import Modal from "react-modal";
import CasinoVideo from "./components/CasinoVideo";

const Baccarat2 = ({ onBetSelection, lastBetTime, exposureTrigger }) => {
  const [gameData, setGameData] = useState(null);
  const [exposureData, setExposureData] = useState([]);
  const [openBets, setOpenBets] = useState([]);
  const [isMyBetsModalOpen, setIsMyBetsModalOpen] = useState(false);
  const [isStatsVisible, setIsStatsVisible] = useState(true);
  const isMobile = useIsMobile();
  const socketRef = useRef(null);

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
    const fetchExposure = async () => {
      if (!gameData?.t1?.[0]?.mid) return;
      try {
        const response = await fetchCasinoExposureApi({
          markettype: "BACCARAT2",
          main_event_id: gameData.t1[0].mid,
          curPageName: "live_baccarat2.php",
        });
        if (Array.isArray(response?.data)) {
          setExposureData(response.data);
        }
      } catch (error) {
        console.error("Error fetching exposure:", error);
      }
    };

    // Clear bets when round changes to avoid showing old round's bets
    setOpenBets([]);

    const loadOpenBets = async () => {
      const currentEventId = gameData?.t1?.[0]?.mid || "1";
      try {
        const res = await fetchOpenBetsApi({
          markettype: "BACCARAT2",
          eventId: currentEventId,
          curPageName: "live_baccarat2.php",
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

    fetchExposure();
    loadOpenBets();
  }, [gameData?.t1?.[0]?.mid, lastBetTime, exposureTrigger]);

  const getExposure = (marketId) => {
    if (!Array.isArray(exposureData)) return 0;
    const market = exposureData.find((item) => item.market_id == marketId);
    return market ? market.win_loss || market.total_exposure : 0;
  };

  const renderExposure = (marketId) => {
    const exposure = getExposure(marketId);
    if (exposure === 0) return null;
    // return (
    //   <span
    //     style={{
    //       marginLeft: "5px",
    //       color: exposure >= 0 ? "green" : "red",
    //       fontWeight: "bold",
    //     }}
    //   >
    //     {exposure}
    //   </span>
    // );
    return (
      <div className={`baccarat-odd-val ${exposure >= 0 ? "book-green" : "book-red"}`} style={{ textAlign: 'center' }}>
        {exposure}
      </div>
    )
  };

  useEffect(() => {
    const socket = io("https://trubet9.bet:2053", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("Room", "baccarat2");
    });

    socket.on("game", (data) => {
      const targetData = Array.isArray(data) ? data[0] : data;
      if (targetData) {
        setGameData(targetData);
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
      return "/assets/cards_new/1.png";

    let formattedCode = cardCode.toUpperCase();
    if (formattedCode.length > 1) {
      const lastChar = formattedCode.slice(-1);
      const secondLastChar = formattedCode.slice(-2, -1);

      if (
        ["S", "H", "D", "C"].includes(lastChar) &&
        lastChar !== secondLastChar
      ) {
        formattedCode = formattedCode + lastChar;
      }
    }
    return `/assets/cards_new/${formattedCode}.png`;
  };

  const handleOddsClick = (teamName, odds, sid) => {
    const market = gameData?.t2?.find((m) => m.sid == sid);
    if (onBetSelection) {
      onBetSelection({
        teamName,
        odds,
        minBet: market?.min || 100,
        maxBet: market?.max || 100000,
        marketId: sid,
        eventId: gameData?.t1?.[0]?.mid,
        isBack: true,
      });
    }
  };

  const getOddsBySid = (sid) => {
    return gameData?.t2?.find((item) => item.sid == sid);
  };

  const getSuspendedClass = (status) => {
    return status === "0" ? "suspended" : "";
  };

  const formatOdds = (odds) => {
    if (!odds) return odds;
    let strOdds = String(odds);
    if (strOdds.includes(".00")) {
      return strOdds.replace(".00", ":1");
    }
    if (strOdds.includes(":00")) {
      return strOdds.replace(":00", ":1");
    }
    // Fallback for cases like "1.00" -> "1:1"
    if (!isNaN(odds) && Number(odds) > 0) {
      return Math.floor(Number(odds)) + ":1";
    }
    return strOdds;
  };

  return (
    <>
      <style>{`
/*! CSS Used from: https://wver.sprintstaticdata.com/v207/static/front/css/bootstrap.min.css */
*,
::after,
::before {
    box-sizing: border-box;
}

img {
    vertical-align: middle;
    border-style: none;
}

.d-none {
    display: none !important;
}

.mb-0 {
    margin-bottom: 0 !important;
}

@media print {

    *,
    ::after,
    ::before {
        text-shadow: none !important;
        box-shadow: none !important;
    }

    img {
        page-break-inside: avoid;
    }
}

/*! CSS Used from: https://wver.sprintstaticdata.com/v207/static/front/css/style.css */
* {
    outline: 0 !important;
}

.baccarat .baccarat-bets-odds {
    width: 75%;
    display: flex;
    display: -webkit-flex;
    flex-wrap: wrap;
}

.baccarat .baccarat-odds {
    display: flex;
    display: -webkit-flex;
    width: 100%;
    margin-bottom: 30px;
    padding-top: 0;
}

.baccarat .baccarat-odd-block {
    flex: 1 1 auto;
    margin-right: 4px;
    position: relative;
}

.baccarat .baccarat-odd-block:last-child {
    margin-right: 0;
}

.baccarat .baccarat-odd-block .baccarat-odd-name {
    padding: 8px 2px;
    text-align: center;
    cursor: pointer;
    border-radius: 0;
    text-transform: uppercase;
    background-color: #444;
    color: #ddd;
}

.baccarat .baccarat-odd-block .baccarat-odd-name:hover {
    opacity: 0.8;
    cursor: pointer;
}

.baccarat .baccarat-odd-block .baccarat-odd-val {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -25px;
}

.baccarat .baccarat-bets {
    display: flex;
    display: -webkit-flex;
    width: 100%;
    margin-top: 0;
    position: relative;
    padding-bottom: 15px;
}

.baccarat .player-pair {
    margin-right: 2px;
    width: 15%;
    height: 90px;
    margin-top: 15px;
    position: relative;
}

.baccarat .baccarat-bets-name {
    height: 100%;
    display: flex;
    display: -webkit-flex;
    justify-content: center;
    flex-direction: column;
    color: var(--text-white);
    padding-left: 0;
    text-align: center;
    text-transform: uppercase;
    cursor: pointer;
}

.baccarat .player-pair .baccarat-bets-name {
    border-radius: 0;
    background-color: #509bff;
}

.baccarat .player-pair .baccarat-bets-name:hover,
.baccarat .player .baccarat-bets-name:hover {
    background: #509bffc9;
    cursor: pointer;
}

.baccarat .player-pair .baccarat-bets-name div {
    margin-bottom: 0;
}

.baccarat .player-pair .baccarat-bets-val {
    text-align: center;
    line-height: 18px;
}

.baccarat .player {
    width: 35%;
    height: 120px;
    position: relative;
}

.baccarat .player .baccarat-bets-name {
    background-color: #509bff;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    align-items: flex-start;
    padding-left: 20px;
}

.baccarat .player .baccarat-bets-name div {
    margin-bottom: 0;
}

.baccarat .player .baccarat-bets-val {
    text-align: center;
    line-height: 18px;
}

.baccarat .player img,
.baccarat .banker img {
    height: 60px;
}

.baccarat .tie {
    position: absolute;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    left: 50%;
    transform: translateX(-50%);
    top: 2px;
    z-index: 10;
}

.baccarat .tie .baccarat-bets-name {
    background-color: #11b24b;
    border-radius: 50%;
    border: 2px solid #000;
}

.baccarat .tie .baccarat-bets-name:hover {
    background: #0c9a1d;
    cursor: pointer;
}

.baccarat .tie .baccarat-bets-name div {
    margin-bottom: 0;
}

.baccarat .tie .baccarat-bets-val {
    text-align: center;
    line-height: 18px;
}

.baccarat .banker {
    width: 35%;
    height: 120px;
    position: relative;
}

.baccarat .banker .baccarat-bets-name {
    background-color: #d3393d;
    align-items: flex-end;
    padding-right: 20px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.baccarat .banker .baccarat-bets-name:hover,
.baccarat .banker-pair .baccarat-bets-name:hover {
    background-color: #d3393ddb;
    cursor: pointer;
}

.baccarat .banker .baccarat-bets-name div {
    margin-bottom: 0;
}

.baccarat .player span,
.baccarat .banker span {
    margin-left: 3px;
}

.baccarat .banker .baccarat-bets-val {
    text-align: center;
    line-height: 18px;
}

.baccarat .banker-pair {
    width: 15%;
    margin-left: 2px;
    height: 90px;
    margin-top: 15px;
    position: relative;
}

.baccarat .banker-pair .baccarat-bets-name {
    border-radius: 0;
    background-color: #d3393d;
}

.baccarat .banker-pair .baccarat-bets-name div {
    margin-bottom: 0;
}

.baccarat .banker-pair .baccarat-bets-val {
    text-align: center;
    line-height: 18px;
}

/*! CSS Used from: https://wver.sprintstaticdata.com/v207/static/front/css/responsive.css */
@media only screen and (min-width: 1280px) and (max-width: 1599px) {

    .baccarat .player img,
    .baccarat .banker img {
        height: 32px;
    }

    .baccarat .player .baccarat-bets-name {
        padding-left: 5px;
    }

    .baccarat .banker .baccarat-bets-name {
        padding-right: 10px;
    }
}

@media only screen and (min-width: 320px) and (max-width: 767px) {
    .baccarat .baccarat-bets-odds {
        width: 100%;
        margin-top: 6px;
    }

    .baccarat .baccarat-odds {
        padding: 15px 5px 0;
        margin-bottom: 0;
    }

    .baccarat .baccarat-odd-block .baccarat-odd-name {
        line-height: 14px;
    }

    .baccarat .baccarat-odd-block {
        margin-right: 4px;
    }

    .baccarat .baccarat-bets {
        padding: 0 5px;
        margin-top: 30px;
        height: 110px;
    }

    .baccarat .baccarat-bets-name {
        height: 100%;
        font-size: var(--font-v-small);
        padding-left: 0;
    }

    .baccarat .player .baccarat-bets-name {
        border-top-left-radius: 6px;
        border-bottom-left-radius: 6px;
        padding-left: 5px;
    }

    .baccarat .banker .baccarat-bets-name {
        border-top-right-radius: 6px;
        border-bottom-right-radius: 6px;
        padding-right: 5px;
    }

    .baccarat .player-pair .baccarat-bets-name {
        border-radius: 4px 0 0 4px;
    }

    .baccarat .banker-pair .baccarat-bets-name {
        border-radius: 0 4px 4px 0;
    }

    .baccarat .player-pair {
        margin-right: 2px;
        width: 15%;
        height: 60px;
    }

    .baccarat .player,
    .baccarat .banker {
        width: 35%;
        height: 90px;
    }

    .baccarat .tie {
        height: 90px;
        width: 90px;
        top: 0;
    }

    .baccarat .banker-pair {
        margin-right: 2px;
        width: 15%;
        height: 60px;
    }

    .baccarat .baccarat-bets-name div {
        line-height: 14px !important;
        margin-bottom: 2px !important;
    }

    .baccarat .player img,
    .baccarat .banker img {
        height: 30px;
    }

    .baccarat .player span,
    .baccarat .banker span {
        margin-left: 3px;
    }
}

@media only screen and (min-width: 320px) and (max-width: 374px) {

    .baccarat .player img,
    .baccarat .banker img {
        height: 20px;
    }

    .baccarat .player span,
    .baccarat .banker span {
        margin-left: 2px;
    }
}

@media only screen and (min-width: 768px) and (max-width: 1279px) {

    .baccarat .player img,
    .baccarat .banker img {
        height: 30px;
    }
}

@media (max-width: 768px) {
    .statistics-mobile {
        margin-top: 0px;
        padding: 0 10px;
        width: 100%;
    }
}
      `}</style>

      <div className="casino-table baccarat baccarat2">
        {/* VIDEO SECTION */}
        <CasinoVideo
          gameName="Baccarat 2"
          roundId={currentGame?.mid}
          videoSrc="https://casino.diamondcricketid.com/swiftdizire/?id=3033"
          // isCardDrawerOpen={isDrawerOpen}
          // setIsCardDrawerOpen={setIsDrawerOpen}
          autotime={currentGame?.autotime}
          totalTime={currentGame?.ft}
        // cards={[currentGame?.C1, currentGame?.C2, currentGame?.C3, currentGame?.C4, currentGame?.C5, currentGame?.C6]}
        // CardsComponent={VideoCards}
        />

        <div className="casino-detail">
          {isMobile ? (
            <>
              <div className="baccarat-bets-odds">
                <div className="baccarat-odds">
                  {[
                    { sid: 6, name: "Score 1-4" },
                    { sid: 7, name: "Score 5-6" },
                    { sid: 8, name: "Score 7" },
                    { sid: 9, name: "Score 8" },
                    { sid: 10, name: "Score 9" },
                  ].map((odd) => {
                    const market = getOddsBySid(odd.sid);
                    const isSuspended = market?.gstatus === "0";
                    return (
                      <div
                        key={odd.sid}
                        className="baccarat-odd-block"
                        onClick={() =>
                          !isSuspended &&
                          market?.b1 &&
                          handleOddsClick(odd.name, market.b1, odd.sid)
                        }
                      >
                        <div className={`baccarat-odd-name ${isSuspended ? "suspended" : ""}`}>
                          {odd.name}<br />{market?.b1 ? parseFloat(market.b1) + ":1" : "0:1"}
                        </div>
                        {renderExposure(odd.sid)}
                      </div>
                    );
                  })}
                </div>
                <div className="baccarat-bets">
                  {/* Player Pair */}
                  {(() => {
                    const bet = { sid: 4, name: "Player Pair" };
                    const market = getOddsBySid(bet.sid);
                    const isSuspended = market?.gstatus === "0";
                    return (
                      <div
                        className="player-pair"
                        onClick={() =>
                          !isSuspended &&
                          market?.b1 &&
                          handleOddsClick(bet.name, market.b1, bet.sid)
                        }
                      >
                        <div className={`baccarat-bets-name ${isSuspended ? "suspended" : ""}`}>
                          <div>{bet.name}</div>
                          <div className="mb-0">{formatOdds(market?.b1) || "11:1"}</div>
                        </div>
                        {renderExposure(bet.sid)}
                      </div>
                    );
                  })()}

                  {/* Player */}
                  {(() => {
                    const bet = { sid: 1, name: "Player" };
                    const market = getOddsBySid(bet.sid);
                    const isSuspended = market?.gstatus === "0";
                    const cardData = gameData?.t1?.[0] || {};
                    const getVal = (key) => cardData[key] || cardData[key?.toLowerCase()];
                    const isActive = (val) => val && val !== "0" && val !== "1" && val !== "";
                    const c1Val = getVal("C1");
                    const c3Val = getVal("C3");
                    const c5Val = getVal("C5");

                    return (
                      <div
                        className="player"
                        onClick={() =>
                          !isSuspended &&
                          market?.b1 &&
                          handleOddsClick(bet.name, market.b1, bet.sid)
                        }
                      >
                        <div className={`baccarat-bets-name ${isSuspended ? "suspended" : ""}`}>
                          <div>{bet.name} {formatOdds(market?.b1) || "1:1"}</div>
                          <div className="mb-0">
                            {isActive(c5Val) &&
                              <span className="l-rotate" style={{ marginRight: "2px" }}>
                                <img src={getCardImage(c5Val)} alt="C5" />
                              </span>}
                            <span><img src={getCardImage(c3Val)} alt="C3" /></span>
                            <span><img src={getCardImage(c1Val)} alt="C1" /></span>
                          </div>
                        </div>
                        {renderExposure(bet.sid)}
                      </div>
                    );
                  })()}

                  {/* Tie */}
                  {(() => {
                    const bet = { sid: 3, name: "Tie" };
                    const market = getOddsBySid(bet.sid);
                    const isSuspended = market?.gstatus === "0";
                    return (
                      <div
                        className="tie"
                        onClick={() =>
                          !isSuspended &&
                          market?.b1 &&
                          handleOddsClick(bet.name, market.b1, bet.sid)
                        }
                      >
                        <div className={`baccarat-bets-name ${isSuspended ? "suspended" : ""}`}>
                          <div>{bet.name}</div>
                          <div className="mb-0">{formatOdds(market?.b1) || "8:1"}</div>
                        </div>
                        {renderExposure(bet.sid)}
                      </div>
                    );
                  })()}

                  {/* Banker */}
                  {(() => {
                    const bet = { sid: 2, name: "Banker" };
                    const market = getOddsBySid(bet.sid);
                    const isSuspended = market?.gstatus === "0";
                    const cardData = gameData?.t1?.[0] || {};
                    const getVal = (key) => cardData[key] || cardData[key?.toLowerCase()];
                    const isActive = (val) => val && val !== "0" && val !== "1" && val !== "";
                    const c2Val = getVal("C2");
                    const c4Val = getVal("C4");
                    const c6Val = getVal("C6");

                    return (
                      <div
                        className="banker"
                        onClick={() =>
                          !isSuspended &&
                          market?.b1 &&
                          handleOddsClick(bet.name, market.b1, bet.sid)
                        }
                      >
                        <div className={`baccarat-bets-name ${isSuspended ? "suspended" : ""}`}>
                          <div>{bet.name} {formatOdds(market?.b1) || "1:1"}</div>
                          <div className="mb-0">
                            <span><img src={getCardImage(c2Val)} alt="C2" /></span>
                            <span><img src={getCardImage(c4Val)} alt="C4" /></span>
                            {isActive(c6Val) &&
                              <span className="r-rotate" style={{ marginRight: "2px" }}>
                                <img src={getCardImage(c6Val)} alt="C6" />
                              </span>}
                          </div>
                        </div>
                        {renderExposure(bet.sid)}
                      </div>
                    );
                  })()}

                  {/* Banker Pair */}
                  {(() => {
                    const bet = { sid: 5, name: "Banker Pair" };
                    const market = getOddsBySid(bet.sid);
                    const isSuspended = market?.gstatus === "0";
                    return (
                      <div
                        className="banker-pair"
                        onClick={() =>
                          !isSuspended &&
                          market?.b1 &&
                          handleOddsClick(bet.name, market.b1, bet.sid)
                        }
                      >
                        <div className={`baccarat-bets-name ${isSuspended ? "suspended" : ""}`}>
                          <div>{bet.name}</div>
                          <div className="mb-0">{formatOdds(market?.b1) || "11:1"}</div>
                        </div>
                        {renderExposure(bet.sid)}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Mobile Statistics */}
              <div className="statistics-mobile">
                <div
                  className="stats-header"
                  onClick={() => setIsStatsVisible(!isStatsVisible)}
                  style={{
                    color: "#fff",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "0px",
                    marginTop: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    cursor: "pointer",
                  }}
                >
                  <span>STATISTICS</span>
                  <i
                    className={`fas fa-angle-${isStatsVisible ? "up" : "down"}`}
                    style={{
                      fontSize: "12px",
                      marginLeft: "5px",
                      color: "#aaa",
                    }}
                  ></i>
                </div>
                {isStatsVisible && (
                  <div className="d-flex flex-column align-items-center">
                    <div dir="ltr">
                      <svg
                        width="300"
                        height="270"
                        viewBox="0 0 162 150"
                        aria-label="A chart."
                      >
                        <g transform="translate(0, 35)">
                          <g>
                            <rect
                              x="116"
                              y="3"
                              width="46"
                              height="9"
                              stroke="none"
                              stroke-width="0"
                              fill-opacity="0"
                              fill="#ffffff"
                            ></rect>
                            <g>
                              <text
                                text-anchor="start"
                                x="128"
                                y="10.65"
                                font-family="Arial"
                                font-size="5"
                                stroke="none"
                                stroke-width="0"
                                fill="#222222"
                              >
                                Player
                              </text>
                            </g>
                            <circle
                              cx="120.5"
                              cy="7.5"
                              r="3.5"
                              stroke="none"
                              stroke-width="0"
                              fill="#086cb8"
                            ></circle>
                          </g>
                          <g>
                            <rect
                              x="116"
                              y="18"
                              width="46"
                              height="5"
                              stroke="none"
                              stroke-width="0"
                              fill-opacity="0"
                              fill="#222222"
                            ></rect>
                            <g>
                              <text
                                text-anchor="start"
                                x="128"
                                y="25.65"
                                font-family="Arial"
                                font-size="5"
                                stroke="none"
                                stroke-width="0"
                                fill="#222222"
                              >
                                Banker
                              </text>
                            </g>
                            <circle
                              cx="120.5"
                              cy="22.5"
                              r="3.5"
                              stroke="none"
                              stroke-width="0"
                              fill="#ae2130"
                            ></circle>
                          </g>
                          <g>
                            <rect
                              x="116"
                              y="33"
                              width="46"
                              height="2"
                              stroke="none"
                              stroke-width="0"
                              fill-opacity="0"
                              fill="#222222"
                            ></rect>
                            <g>
                              <text
                                text-anchor="start"
                                x="128"
                                y="40.65"
                                font-family="Arial"
                                font-size="5"
                                stroke="none"
                                stroke-width="0"
                                fill="#222222"
                              >
                                Tie
                              </text>
                            </g>
                            <circle
                              cx="120.5"
                              cy="37.5"
                              r="3.5"
                              stroke="none"
                              stroke-width="0"
                              fill="#279532"
                            ></circle>
                          </g>
                        </g>
                        <g>
                          <path
                            d="M101,75.1L101,84.9A49,39.2,0,0,1,78.2,118L78.2,108.2A49,39.2,0,0,0,101,75.1"
                            fill="#06518a"
                          ></path>
                          <path
                            d="M52,84.9L78.2,118L78.2,108.2L52,75.1Z"
                            fill="#06518a"
                          ></path>
                          <path
                            d="M52,75.1L52,35.9A49,39.2,0,0,1,78.2,108.2L52,75.1"
                            fill="#086cb8"
                          ></path>
                          <text
                            text-anchor="start"
                            x="71"
                            y="72"
                            font-family="Arial"
                            font-size="9"
                            font-weight="bold"
                            fill="#ffffff"
                          >
                            41%
                          </text>
                        </g>
                        <g>
                          <path
                            d="M52,75.1L52,84.9L20.8,54.7L20.8,44.9Z"
                            fill="#1d7026"
                          ></path>
                          <path
                            d="M52,75.1L20.8,44.9A49,39.2,0,0,1,52,35.9L52,75.1"
                            fill="#279532"
                          ></path>
                        </g>
                        <g>
                          <path
                            d="M78.2,108.2L78.2,118A49,39.2,0,0,1,3,84.9L3,75.1A49,39.2,0,0,0,78.2,108.2"
                            fill="#831924"
                          ></path>
                          <path
                            d="M52,75.1L78.2,108.2A49,39.2,0,0,1,20.8,44.9L52,75.1"
                            fill="#ae2130"
                          ></path>
                          <text
                            text-anchor="start"
                            x="19"
                            y="91"
                            font-family="Arial"
                            font-size="9"
                            font-weight="bold"
                            fill="#ffffff"
                          >
                            48%
                          </text>
                        </g>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="baccarat-bets-odds">
                <div className="baccarat-odds">
                  {[
                    { sid: 6, name: "Score 1-4" },
                    { sid: 7, name: "Score 5-6" },
                    { sid: 8, name: "Score 7" },
                    { sid: 9, name: "Score 8" },
                    { sid: 10, name: "Score 9" },
                  ].map((odd) => {
                    const market = getOddsBySid(odd.sid);
                    const isSuspended = market?.gstatus === "0";
                    return (
                      <div
                        key={odd.sid}
                        className="baccarat-odd-block"
                        onClick={() =>
                          !isSuspended &&
                          market?.b1 &&
                          handleOddsClick(odd.name, market.b1, odd.sid)
                        }
                      >
                        <div
                          className={`baccarat-odd-name ${isSuspended ? "suspended" : ""
                            }`}
                        >
                          {odd.name} {formatOdds(market?.b1) || "0:1"}
                        </div>
                        {renderExposure(odd.sid)}
                      </div>
                    );
                  })}
                </div>
                <div className="baccarat-bets">
                  {[
                    {
                      sid: 4,
                      name: "Player Pair",
                      class: "player-pair",
                    },
                    {
                      sid: 1,
                      name: "Player",
                      class: "player",
                      c1: "C1",
                      c2: "C3",
                      c3: "C5",
                    },
                    { sid: 3, name: "Tie", class: "tie" },
                    {
                      sid: 2,
                      name: "Banker",
                      class: "banker",
                      c1: "C2",
                      c2: "C4",
                      c3: "C6",
                    },
                    {
                      sid: 5,
                      name: "Banker Pair",
                      class: "banker-pair",
                    },
                  ].map((bet) => {
                    const market = getOddsBySid(bet.sid);
                    const isSuspended = market?.gstatus === "0";
                    const cardData = gameData?.t1?.[0] || {};

                    const getVal = (key) =>
                      cardData[key] || cardData[key?.toLowerCase()];
                    const isActive = (val) =>
                      val && val !== "0" && val !== "1" && val !== "";

                    const c1Val = getVal(bet.c1);
                    const c2Val = getVal(bet.c2);
                    const c3Val = getVal(bet.c3);

                    return (
                      <div
                        key={bet.sid}
                        className={bet.class}
                        onClick={() =>
                          !isSuspended &&
                          market?.b1 &&
                          handleOddsClick(bet.name, market.b1, bet.sid)
                        }
                      >
                        <div
                          className={`baccarat-bets-name ${isSuspended ? "suspended" : ""
                            }`}
                        >
                          <div>
                            {bet.name} {formatOdds(market?.b1) || "0:1"}
                          </div>
                          {(bet.sid === 1 || bet.sid === 2) && (
                            <div
                              className={`mb-0 d-flex align-items-center ${bet.sid === 1 ? "justify-content-start" : "justify-content-end"
                                }`}
                              style={{ gap: "2px" }}
                            >
                              {/* Player 3rd card on left */}
                              {bet.sid === 1 && isActive(c3Val) && (
                                <span
                                  // style={{
                                  //   display: "inline-block",
                                  //   transform: "rotate(90deg)",
                                  //   marginRight: "5px",
                                  //   position: "relative",
                                  //   zIndex: 11,
                                  // }}
                                  className="l-rotate"
                                >
                                  <img
                                    src={getCardImage(c3Val)}
                                    alt="C5"
                                    style={{ height: "35px", width: "auto" }}
                                  />
                                </span>
                              )}

                              {/* Vertical cards always visible */}
                              <span>
                                <img src={getCardImage(c2Val)} alt="C2" />
                              </span>
                              <span>
                                <img src={getCardImage(c1Val)} alt="C1" />
                              </span>

                              {/* Banker 3rd card on right */}
                              {bet.sid === 2 && isActive(c3Val) && (
                                <span
                                  // style={{
                                  //   display: "inline-block",
                                  //   transform: "rotate(90deg)",
                                  //   marginLeft: "5px",
                                  //   position: "relative",
                                  //   zIndex: 11,
                                  // }}
                                  className="r-rotate"
                                >
                                  <img
                                    src={getCardImage(c3Val)}
                                    alt="C6"
                                    style={{ height: "35px", width: "auto" }}
                                  />
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {renderExposure(bet.sid)}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="statistics">
                <div className="statistics-title">
                  Statistics
                  <span>
                    <i className="fas fa-angle-up"></i>
                  </span>
                </div>
                <div className="statistics-content">
                  <div>
                    <div>
                      <div dir="ltr">
                        <div aria-label="A chart.">
                          <svg width="162" height="160" aria-label="A chart.">
                            <defs id="_ABSTRACT_RENDERER_ID_3"></defs>
                            <g>
                              <rect
                                x="116"
                                y="3"
                                width="46"
                                height="39"
                                stroke="none"
                                stroke-width="0"
                                fill-opacity="0"
                                fill="#ffffff"
                              ></rect>
                              <g column-id="Player">
                                <rect
                                  x="116"
                                  y="3"
                                  width="46"
                                  height="9"
                                  stroke="none"
                                  stroke-width="0"
                                  fill-opacity="0"
                                  fill="#ffffff"
                                ></rect>
                                <g>
                                  <text
                                    text-anchor="start"
                                    x="128"
                                    y="10.65"
                                    font-family="Arial"
                                    font-size="9"
                                    stroke="none"
                                    stroke-width="0"
                                    fill="#222222"
                                  >
                                    Player
                                  </text>
                                </g>
                                <circle
                                  cx="120.5"
                                  cy="7.5"
                                  r="4.5"
                                  stroke="none"
                                  stroke-width="0"
                                  fill="#086cb8"
                                ></circle>
                              </g>
                              <g column-id="Banker">
                                <rect
                                  x="116"
                                  y="18"
                                  width="46"
                                  height="9"
                                  stroke="none"
                                  stroke-width="0"
                                  fill-opacity="0"
                                  fill="#ffffff"
                                ></rect>
                                <g>
                                  <text
                                    text-anchor="start"
                                    x="128"
                                    y="25.65"
                                    font-family="Arial"
                                    font-size="9"
                                    stroke="none"
                                    stroke-width="0"
                                    fill="#222222"
                                  >
                                    Banker
                                  </text>
                                </g>
                                <circle
                                  cx="120.5"
                                  cy="22.5"
                                  r="4.5"
                                  stroke="none"
                                  stroke-width="0"
                                  fill="#ae2130"
                                ></circle>
                              </g>
                              <g column-id="Tie">
                                <rect
                                  x="116"
                                  y="33"
                                  width="46"
                                  height="9"
                                  stroke="none"
                                  stroke-width="0"
                                  fill-opacity="0"
                                  fill="#ffffff"
                                ></rect>
                                <g>
                                  <text
                                    text-anchor="start"
                                    x="128"
                                    y="40.65"
                                    font-family="Arial"
                                    font-size="9"
                                    stroke="none"
                                    stroke-width="0"
                                    fill="#222222"
                                  >
                                    Tie
                                  </text>
                                </g>
                                <circle
                                  cx="120.5"
                                  cy="37.5"
                                  r="4.5"
                                  stroke="none"
                                  stroke-width="0"
                                  fill="#279532"
                                ></circle>
                              </g>
                            </g>
                            <g>
                              <path
                                d="M101,75.1L101,84.89999999999999A49,39.2,0,0,1,78.25551295397085,117.99765467967899L78.25551295397085,108.19765467967898A49,39.2,0,0,0,101,75.1"
                                stroke="#06518a"
                                stroke-width="1"
                                fill="#06518a"
                              ></path>
                              <path
                                d="M52,75.1L52,84.89999999999999L78.25551295397085,117.99765467967897L78.25551295397085,108.19765467967898"
                                stroke="#06518a"
                                stroke-width="1"
                                fill="#06518a"
                              ></path>
                              <path
                                d="M52,75.1L52,35.89999999999999A49,39.2,0,0,1,78.25551295397085,108.19765467967898L52,75.1A0,0,0,0,0,52,75.1"
                                stroke="#086cb8"
                                stroke-width="1"
                                fill="#086cb8"
                              ></path>
                              <text
                                text-anchor="start"
                                x="71.3913424772058"
                                y="72.02242214633202"
                                font-family="Arial"
                                font-size="9"
                                stroke="none"
                                stroke-width="0"
                                fill="#ffffff"
                              >
                                41%
                              </text>
                            </g>
                            <g>
                              <path
                                d="M52,75.1L52,84.89999999999999L20.76622450231418,54.695880883189076L20.76622450231418,44.89588088318907"
                                stroke="#1d7026"
                                stroke-width="1"
                                fill="#1d7026"
                              ></path>
                              <path
                                d="M52,75.1L20.76622450231418,44.89588088318907A49,39.2,0,0,1,52,35.89999999999999L52,75.1A0,0,0,0,0,52,75.1"
                                stroke="#279532"
                                stroke-width="1"
                                fill="#279532"
                              ></path>
                            </g>
                            <g>
                              <path
                                d="M78.25551295397085,108.19765467967898L78.25551295397085,117.99765467967897A49,39.2,0,0,1,3,84.89999999999999L3,75.1A49,39.2,0,0,0,78.25551295397085,108.19765467967898"
                                stroke="#831924"
                                stroke-width="1"
                                fill="#831924"
                              ></path>
                              <path
                                d="M52,75.1L78.25551295397085,108.19765467967898A49,39.2,0,0,1,20.76622450231418,44.89588088318907L52,75.1A0,0,0,0,0,52,75.1"
                                stroke="#ae2130"
                                stroke-width="1"
                                fill="#ae2130"
                              ></path>
                              <text
                                text-anchor="start"
                                x="19.366387145790423"
                                y="91.21397274589306"
                                font-family="Arial"
                                font-size="9"
                                stroke="none"
                                stroke-width="0"
                                fill="#ffffff"
                              >
                                48%
                              </text>
                            </g>
                            <g></g>
                          </svg>
                          <div
                            aria-label="A tabular representation of the data in the chart."
                            className="tabular"
                          >
                            <table>
                              <thead>
                                <tr>
                                  <th>P</th>
                                  <th>Data</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>Player</td>
                                  <td>41</td>
                                </tr>
                                <tr>
                                  <td>Banker</td>
                                  <td>48</td>
                                </tr>
                                <tr>
                                  <td>Tie</td>
                                  <td>11</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      <div aria-hidden="true" className="ariahidden">
                        41 (41%)
                      </div>
                      <div></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div >

      {/* MOBILE FAB FOR MY BETS */}
      {
        isMobile && openBets.length > 0 && (
          <>


            {/* My Bets Modal */}
            <Modal
              isOpen={isMyBetsModalOpen}
              onRequestClose={() => setIsMyBetsModalOpen(false)}
              style={{
                content: {
                  top: "50%",
                  left: "50%",
                  right: "auto",
                  bottom: "auto",
                  marginRight: "-50%",
                  transform: "translate(-50%, -50%)",
                  width: "90%",
                  maxWidth: "400px",
                  padding: "0",
                  backgroundColor: "transparent",
                  border: "none",
                  zIndex: 1100,
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
                    style={{
                      color: "white",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    ✕
                  </span>
                </div>

                {/* Table Header */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "3fr 1fr 1fr",
                    backgroundColor: "#1a6a48",
                    color: "#ffffff",
                    fontSize: "12px",
                    padding: "6px 8px",
                    borderBottom: "1px solid #2d3748",
                  }}
                >
                  <div>Matched Bets</div>
                  <div style={{ textAlign: "right" }}>Odds</div>
                  <div style={{ textAlign: "right" }}>Stake</div>
                </div>

                {/* Bets List */}
                <div
                  style={{ maxHeight: "calc(100% - 80px)", overflowY: "auto" }}
                >
                  {openBets.length > 0 ? (
                    openBets.map((bet, index) => (
                      <div
                        key={index}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "3fr 1fr 1fr",
                          fontSize: "13px",
                          padding: "8px",
                          borderBottom: "1px solid #2d3748",
                          backgroundColor:
                            index % 2 === 0 ? "#1a202c" : "#1f2937",
                          color: "#e2e8f0",
                          alignItems: "center",
                          borderLeft: `5px solid ${(bet.bet_type || "back").toLowerCase() === "back"
                            ? "#72bbef"
                            : "#f994ba"
                            }`,
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <div
                            style={{
                              color: "#ffffff",
                              fontWeight: "500",
                              fontSize: "14px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {bet.market_name ||
                              (bet.market_odd_name && bet.market_runner_name
                                ? `${bet.market_odd_name} - ${bet.market_runner_name}`
                                : bet.market_runner_name) ||
                              "Market"}{" "}
                            -{" "}
                            <span style={{ fontWeight: "600" }}>
                              {bet.bet_type || "Back"}
                            </span>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          {bet.bet_odds || bet.odds}
                        </div>
                        <div style={{ textAlign: "right" }}>
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
          </>
        )
      }
    </>
  );
};

export default Baccarat2;
