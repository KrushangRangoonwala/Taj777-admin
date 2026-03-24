import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useIsMobile from "../../hooks/useIsMobile";
import CasinoVideo from "./components/CasinoVideo";
import { fetchCasinoExposureApi } from "../../api/api";
import "./kk.css";

const Race2 = ({ isVisible, onBetSelection, exposureTrigger }) => {
  const [gameData, setGameData] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
  const [exposureData, setExposureData] = useState([]);
  const isMobileView = useIsMobile();
  const [allCards, setAllCards] = useState([]);

  const socketRef = useRef(null);
  const formatId = (id) => {
    if (!id) return "";
    const strId = String(id);
    return strId.includes(".") ? strId.split(".")[1] : strId;
  };

  const getCardImage = (cardCode) => {
    if (!cardCode || cardCode === "1") return "/assets/cards_new/1.png";

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

  const rowData = React.useMemo(() => {
    const t1 = gameData?.t1?.[0];
    if (!t1) return [];

    const rdesc = t1.rdesc || "";
    const parsedCards = rdesc.split(",").filter((c) => c && c !== "");

    const getCardValue = (card) => {
      if (!card || card === "1") return 0;
      const rank = card.replace(/[SHDC]+$/i, "");
      if (rank === "Q") return 0;
      const val = parseInt(rank);
      return isNaN(val) ? 0 : val;
    };

    const getCardsForPosition = (pos) => {
      const cards = [];
      const descCards = t1.desc || [];

      for (let i = 0; i < 4; i++) {
        const cardIndex = pos + i * 4;
        if (parsedCards[cardIndex] && parsedCards[cardIndex] !== "1") {
          cards.push(parsedCards[cardIndex]);
        }
      }

      if (
        descCards[pos] &&
        descCards[pos] !== "1" &&
        !cards.includes(descCards[pos])
      ) {
        cards.push(descCards[pos]);
      }

      return cards;
    };

    return [0, 1, 2, 3].map((pos) => {
      const cards = getCardsForPosition(pos);
      const sum = cards.reduce((s, c) => s + getCardValue(c), 0);
      const hasQueen = cards.some((c) => c.toUpperCase().startsWith("Q"));
      const calculatedTotal = sum + pos;
      return {
        pos,
        cards,
        hasQueen,
        calculatedTotal,
        winPriority: hasQueen ? 1000 : calculatedTotal,
      };
    });
  }, [gameData]);

  useEffect(() => {
    if (rowData.length > 0) {
      setAllCards(rowData.map((r) => r.cards).flat());
    } else {
      setAllCards([]);
    }
  }, [rowData]);

  const VideoCards = () => {
    if (!rowData || rowData.length === 0) return null;

    const maxPriority = Math.max(...rowData.map((r) => r.winPriority));

    return (
      <div className="queen-video-cards-inner">
        {rowData.map((row) => {
          const isMax =
            row.winPriority === maxPriority &&
            (maxPriority > 0 || row.pos === 0);
          const labelColor = isMax ? "#fff" : "#fff";

          return (
            <div key={row.pos} className="card-total-group">
              <div className="total-label" style={{ color: labelColor, textTransform: "uppercase", marginBottom: row.cards.length > 0 ? "-6px" : "-13px" }}>
                Player {["A", "B", "C", "D"][row.pos]}
              </div>
              {row.cards.length > 0 && (
                <div className="card-row" style={{ marginTop: "2px", marginBottom: "-8px" }}>
                  {row.cards.map((card, idx) => (
                    <img key={idx} src={getCardImage(card)} alt={card} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <style jsx>{`
          .queen-video-cards-inner {
            width: 100%;
            height: 130px;
            overflow: hidden;
            display: flex;
            display: -webkit-flex;
            flex-wrap: wrap;
            flex-direction: column;
            gap: 4px;
            padding: 5px 5px 0px 5px;
            background: rgba(0, 0, 0, 0.6);
            border-radius: 4px;
          }
          .card-total-group {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
          }
          .total-label {
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
            text-align: left;
            width: 100%;
          }
          .card-row {
            display: flex;
            gap: 1px;
            flex-wrap: wrap;
            justify-content: flex-start;
            width: 100%;
          }
          .card-row img {
            width: 12px;
            height: auto;
            border-radius: 1px;
          }
          @media (max-width: 768px) {
            .queen-video-cards-inner {
              gap: 4px;
              padding: 4px 2px 0px 2px;
            }
            .total-label {
              font-size: 10px;
            }
          }
        `}</style>
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

    socket.on("connect", () => {
      console.log("✅ Race2 connected to socket:", socket.id);
      setIsConnected(true);
      socket.emit("Room", "race2");
    });

    const handleSocketData = (data) => {
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      const gamePayload = parsedData?.data || parsedData;

      if (gamePayload) {
        setGameData((prev) => ({
          ...prev,
          ...gamePayload,
        }));
      }
    };

    socket.on("race2", handleSocketData);
    socket.on("game", handleSocketData);
    socket.on("message", handleSocketData);

    return () => {
      socket.off("race2", handleSocketData);
      socket.off("game", handleSocketData);
      socket.off("message", handleSocketData);
      socket.disconnect();
    };
  }, []);

  const fetchExposure = async () => {
    if (!gameData.t1?.[0]?.mid) return;
    try {
      const response = await fetchCasinoExposureApi({
        markettype: "RACE2",
        main_event_id: formatId(gameData.t1[0].mid),
        curPageName: "live_race2.php",
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
  }, [exposureTrigger, gameData.t1?.[0]?.mid]);

  const getExposure = (sid) => {
    if (!Array.isArray(exposureData)) return 0;
    const market = exposureData.find(
      (item) => String(item.market_id) === String(sid)
    );
    return market ? market.win_loss || market.total_exposure : 0;
  };

  const renderExposure = (sid) => {
    const exposure = getExposure(sid);
    if (exposure === 0) return null;
    return (
      <span className={`mr-1 ${exposure > 0 ? "book-green" : "book-red"}`}>
        {exposure}
      </span>
    );
  };

  const handleBet = (market, teamName, isBack = true) => {
    const globalStatus = gameData?.gstatus ?? gameData?.t1?.[0]?.gstatus;
    const isGlobalSuspended =
      globalStatus === "SUSPENDED" ||
      globalStatus === "suspended" ||
      globalStatus === 0 ||
      globalStatus === "0";
    if (isGlobalSuspended) return;

    if (
      !market ||
      market.gstatus === "SUSPENDED" ||
      market.gstatus === "suspended" ||
      market.gstatus === 0 ||
      market.gstatus === "0"
    ) {
      return;
    }

    if (onBetSelection) {
      onBetSelection({
        ...market,
        teamName,
        isBack,
        minBet: market.min || 100,
        maxBet: market.max || 100000,
        odds: isBack ? market.b1 : market.l1,
        marketId: market.sid,
        eventId: formatId(gameData.t1?.[0]?.mid),
      });
    }
  };

  const renderExposureByNat = (nat) => {
    const market = gameData.t2?.find((m) => m?.nat?.toLowerCase() === nat?.toLowerCase());
    return market ? renderExposure(market.sid) : null;
  };

  const renderMarketBox = (nat, type) => {
    const market = gameData.t2?.find((m) => m?.nat?.toLowerCase() === nat?.toLowerCase());
    const isSuspended =
      market &&
      (market.gstatus === "SUSPENDED" ||
        market.gstatus === "suspended" ||
        market.gstatus === 0 ||
        market.gstatus === "0");

    const odds = type === "back" ? market?.b1 : market?.l1;
    const isLocked = !market || !odds || odds === "0" || odds === "0.00" || odds === 0;

    return (
      <div
        className={`${type} casino-bl-box-item ${isSuspended || isLocked ? "suspended" : ""}`}
        onClick={() => !isLocked && !isSuspended && handleBet(market, nat, type === "back")}
      >
        <span className="casino-box-odd">
          {isLocked || isSuspended ? <i className="fas fa-lock"></i> : odds}
        </span>
      </div>
    );
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

a {
  color: #007bff;
  text-decoration: none;
  background-color: transparent;
}

a:hover {
  color: #0056b3;
  text-decoration: underline;
}

.container-fluid {
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}

.row {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
}

.d-none {
  display: none !important;
}

.float-right {
  float: right !important;
}

.text-success {
  color: #28a745 !important;
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
}

/*! CSS Used from: https://wver.sprintstaticdata.com/v207/static/front/css/control.css */
.text-success {
  color: var(--book-green) !important;
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

.container-fluid-5 {
  padding-left: 5px !important;
  padding-right: 5px !important;
}

.row.row5 {
  margin-left: -5px;
  margin-right: -5px;
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

.casino-queen .casino-bl-box {
  width: 100%;
}

.casino-queen .casino-bl-box-item {
  width: calc(50% - 2px);
  height: 48px;
}

/*! CSS Used from: https://wver.sprintstaticdata.com/v207/static/front/css/responsive.css */
@media only screen and (min-width: 320px) and (max-width: 1279px) {
  .casino-detail {
    padding: 2px;
  }
}

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

  .casino-queen .casino-bl-box {
    width: 100%;
  }

  .casino-queen .casino-bl-box-item.casino-odds-name {
    width: calc(50% - 2px);
    font-size: 10px;
  }

  .casino-queen .casino-bl-box-item {
    width: calc(25% - 2px);
  }

  .casino-queen .casino-bl-box-item {
    height: 36px;
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
      <div className="casino-table casino-queen race2">
        <CasinoVideo
          gameName="Race to 2nd"
          roundId={formatId(gameData.t1?.[0]?.mid)}
          videoSrc="https://casino.diamondcricketid.com/swiftdizire/?id=3092"
          autotime={gameData.t1?.[0]?.autotime}
          totalTime={gameData.t1?.[0]?.ft}
          isCardDrawerOpen={isCardDrawerOpen}
          setIsCardDrawerOpen={setIsCardDrawerOpen}
          cards={allCards}
          CardsComponent={VideoCards}
          drawerHeight="auto"
          drawerStyle={{
            top: isMobileView ? "90px" : "20px",
            width: "80px",
            left: "0",
            transform: "none",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            zIndex: "2000",
          }}
        />

        <div className="casino-detail">
          <div className="container-fluid container-fluid-5">
            {/* Desktop View */}
            <div className="row d-none-small">
              {["Player A", "Player B", "Player C", "Player D"].map((nat) => (
                <div key={nat} className="col-3">
                  <div className="casino-box-row">
                    <div className="casino-nation-name">
                      <b>{nat}</b>
                    </div>
                    <div className="casino-bl-box">
                      {renderMarketBox(nat, "back")}
                      {renderMarketBox(nat, "lay")}
                    </div>
                    <div className="casino-nation-name d-none-refactor">
                      {renderExposureByNat(nat)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile View */}
            <div className="row row5 d-none-big">
              {["Player A", "Player B", "Player C", "Player D"].map((nat) => (
                <div key={nat} className="casino-bl-box" style={{ paddingLeft: "0px", paddingRight: "0px" }}>
                  <div className="casino-bl-box-item casino-odds-name">
                    <b>{nat}</b>
                    <span className="float-right text-success">
                      {renderExposureByNat(nat)}
                    </span>
                  </div>
                  {renderMarketBox(nat, "back")}
                  {renderMarketBox(nat, "lay")}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2">
            {gameData?.t3 && gameData.t3.length > 0 && (
              <div className="d-flex flex-row overflow-auto pb-2" style={{ gap: "5px" }}>
                {gameData.t3.map((res, index) => (
                  <div key={index} className="result-circle">
                    {res.result || res.win}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Race2;
