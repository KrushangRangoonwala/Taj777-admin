import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useIsMobile from "../../hooks/useIsMobile";
import CasinoVideo from "./components/CasinoVideo";
import { fetchCasinoExposureApi } from "../../api/api";
import "./kk.css";

const Race20 = ({ isVisible, onBetSelection, exposureTrigger }) => {
  const [gameData, setGameData] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
  const [exposureData, setExposureData] = useState([]);
  const isMobileView = useIsMobile();

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

  const getRankValue = (card) => {
    if (!card || card === "1") return 0;
    const r = card.replace(/[SHDC]+$/i, "");
    if (r === "A") return 1;
    if (r === "J") return 11;
    if (r === "Q") return 12;
    if (r === "K") return 13;
    return parseInt(r) || 0;
  };

  const t1Data = gameData?.t1?.[0];
  const suits = ["S", "H", "C", "D"];

  const getSuitCards = () => {
    if (!t1Data?.desc) return [[], [], [], []];
    const allCards = t1Data.desc.split(",").filter(c => c && c !== "1");

    return suits.map((suit) => {
      // Suit suffix in cards is SS, HH, CC, DD
      const suitOpenedCards = allCards.filter((card) =>
        card.endsWith(`${suit}${suit}`)
      );
      if (suitOpenedCards.length > 0) {
        // If there are cards but no King, prepend one
        if (!suitOpenedCards.some((c) => c.startsWith("K"))) {
          return [...suitOpenedCards, `K${suit}${suit}`];
        }
      }
      return suitOpenedCards;
    });
  };

  const suitCardsData = React.useMemo(() => getSuitCards(), [t1Data?.desc]);

  const nonKCards = suitCardsData.flat().filter(card => !card.startsWith("K"));
  const totalCards = nonKCards.length;
  const totalPoints = nonKCards.reduce((sum, card) => sum + getRankValue(card), 0);

  const VideoCards = () => {
    const suitNames = { S: "spade", H: "heart", C: "club", D: "diamond" };

    return (
      <div className="race20-video-cards-inner">
        <div className="suit-rows">
          {suits.map((suit, index) => (
            <div key={suit} className="suit-row">
              <div className="suit-icon-col">
                <img src={`/assets/cards_new/${suitNames[suit]}.png`} alt={suit} className="suit-card-mini" />
              </div>
              <div className="cards-col">
                {(suitCardsData[index] || []).map((card, idx) => (
                  <img key={idx} src={getCardImage(card)} alt={card} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <style jsx>{`
          .race20-video-cards-inner {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 5px 5px 5px 0px; /* Minimal padding, 0 on left */
            background: rgba(0, 0, 0, 0.8);
            border-radius: 0 4px 4px 0; /* Only right corners rounded */
            width: 185px; 
            min-width: 185px; 
            align-items: flex-start; 
          }
          .suit-rows {
            display: flex;
            flex-direction: column;
            gap: 4px;
            width: 100%;
          }
          .suit-row {
            display: flex;
            align-items: center;
            gap: 2px; /* Minimal gap */
            width: 100%;
            justify-content: flex-start;
          }
          .suit-icon-col {
            display: flex;
            justify-content: flex-start;
            padding: 0;
            margin: 0;
            min-width: 20px;
          }
          .cards-col {
            display: flex;
            gap: 2px;
            flex-wrap: wrap;
            justify-content: flex-start;
          }
          .cards-col img {
            width: 20px;
            height: auto;
            border-radius: 2px;
            margin: 0;
          }
          .suit-card-mini {
              width: 15px !important;
              margin: 0;
          }
          @media (max-width: 768px) {
            .race20-video-cards-inner {
              padding: 4px 4px 4px 0px;
            }
            .cards-col img {
              width: 15px;
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
      console.log("✅ Race20 connected to socket:", socket.id);
      setIsConnected(true);
      socket.emit("Room", "race20");
    });

    const handleSocketData = (data) => {
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      const gamePayload = parsedData?.data || parsedData;

      if (gamePayload) {
        setGameData((prev) => ({
          ...prev,
          ...gamePayload,
          ...(parsedData?.last_results && { last_results: parsedData.last_results })
        }));
      }
    };

    socket.on("race20", handleSocketData);
    socket.on("game", handleSocketData);
    socket.on("message", handleSocketData);

    return () => {
      socket.off("race20", handleSocketData);
      socket.off("game", handleSocketData);
      socket.off("message", handleSocketData);
      socket.disconnect();
    };
  }, []);

  const fetchExposure = async () => {
    if (!gameData.t1?.[0]?.mid) return;
    try {
      const response = await fetchCasinoExposureApi({
        markettype: "RACE_20",
        main_event_id: formatId(gameData.t1[0].mid),
        curPageName: "live_race20.php",
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

  const handleBet = (market, teamName, isBack = true, volume) => {
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
        runs: volume,
        marketId: market.sid,
        eventId: formatId(gameData.t1?.[0]?.mid),
      });
    }
  };

  const renderExposureByNat = (nat) => {
    const market = gameData.t2?.find((m) => m.nat === nat);
    return market ? renderExposure(market.sid) : null;
  };

  const renderMarketBox = ({ nat, type, showVolume = false, showExposure = true, volume, enableLockTop = false }) => {
    const market = gameData.t2?.find((m) => m.nat === nat);
    const isSuspended =
      market &&
      (market.gstatus === "SUSPENDED" ||
        market.gstatus === "suspended" ||
        market.gstatus === 0 ||
        market.gstatus === "0");

    const odds = type === "back" ? market?.b1 : market?.l1;
    // const volume = type === "back" ? market?.bs1 : market?.ls1;
    const isLocked = !market || !odds || odds === "0" || odds === "0.00" || odds === 0;
    const exp = getExposure(market?.sid);
    const isLocktop = enableLockTop && (isSuspended || isLocked) && exp && exp != 0 ? 'lock-top' : '';

    return (
      <div
        className={`${type} casino-bl-box-item ${isSuspended ? "suspended" : ""} ${isLocktop}`}
        onClick={() => !isSuspended && handleBet(market, nat, type === "back", volume)}
      >
        <span className="casino-box-odd">
          {isLocked || isSuspended ? 0 : odds}
        </span>
        {showVolume ? (!isLocked && !isSuspended) ? <span>{volume}</span> : <span>0</span> : null}
        {showExposure && renderExposureByNat(nat)}
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

img {
  vertical-align: middle;
  border-style: none;
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

.col-4 {
  position: relative;
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
}

.col-4 {
  -ms-flex: 0 0 33.333333%;
  flex: 0 0 33.333333%;
  max-width: 33.333333%;
}

.d-none {
  display: none !important;
}

.d-block {
  display: block !important;
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

  img {
    page-break-inside: avoid;
  }
}

/*! CSS Used from: https://wver.sprintstaticdata.com/v207/static/front/css/control.css */
.text-success {
  color: var(--book-green) !important;
}

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

.row.row5 {
  margin-left: -5px;
  margin-right: -5px;
}

.row.row5>[class*="col-"],
.row.row5>[class*="col"] {
  padding-left: 5px;
  padding-right: 5px;
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

.race20 .total-points {
  display: flex;
  margin-top: 10px;
}

        `}
      </style>

      <style>
        {`
.race20 .total-points>div {
  padding: 5px;
  margin-right: 5px;
  border: 1px solid var(--text-white);
  color: var(--text-white);
}

.race20 .casino-detail .total-points>div {
  color: var(--text-white);
}

.race20 .casino-nation-name {
  background-color: transparent;
  text-align: center;
  color: var(--text-table);
}

.race20 .col-4 {
  padding: 0 !important;
}

.race20 .col-4 .casino-box-row {
  border-right: 1px solid var(--bg-bet);
  padding-right: 10px;
  padding-left: 10px;
}

.race20 .col-4:last-child .casino-box-row {
  border-right: 0;
}

.race20 .casino-bl-box,
.race20 .casino-nation-name {
  width: 100%;
}

.race20 .casino-bl-box-item {
  width: calc(50% - 2px);
  height: 40px;
  position: relative;
}

.race20 .win-with .casino-bl-box-item {
  width: 100%;
}

.race20 .casino-video-last-results img {
  width: 35px;
}

.race20 .casino-video-last-results span {
  background-color: transparent;
  box-shadow: none;
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

  .race20 .casino-video-last-results img {
    width: 25px;
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

  .casino-odds-name img {
    height: 25px;
    max-height: 25px;
    margin-left: 3px;
    width: 25px;
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

  .race20 .casino-bl-box-item {
    width: calc(30.33% - 3px);
  }

  .race20 .casino-bl-box-item.casino-odds-name {
    width: calc(40% - 3px);
  }

  .race20 .casino-bl-box-item.casino-odds-name {
    font-weight: normal;
  }

  .race20 .casino-bl-box-title {
    height: 30px;
  }

  .race20 .casino-bl-box-title .casino-odds-name {
    height: 30px !important;
  }

  .race20 .casino-bl-box-title .casino-bl-box-item.casino-odds-name {
    background: transparent;
  }

  .race20 .casino-odds-name {
    height: 40px !important;
  }

  .race20 .casino-odds-name img {
    width: 20px;
    height: auto;
    max-height: unset;
  }

  .race20 .casino-bl-box-item>div {
    line-height: 14px;
  }

  .race20 .win-with .casino-nation-name {
    font-size: 11px;
  }

  .race20 .total-points {
    margin: 0;
    justify-content: space-between;
  }

  .race20 .total-points>div {
    padding: 2px 10px;
  }
}

@media only screen and (min-width: 768px) and (max-width: 1279px) {
  .casino-bl-box-item .casino-box-odd {
    font-size: var(--font-small);
  }

  .race20 .casino-video-last-results img {
    width: 30px;
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

      <div className="casino-table casino-queen race20">
        <CasinoVideo
          gameName="Race 20"
          roundId={formatId(gameData?.t1?.[0]?.mid)}
          videoSrc="https://casino.diamondcricketid.com/swiftdizire/?id=3036"
          autotime={gameData?.t1?.[0]?.autotime}
          totalTime={gameData?.t1?.[0]?.ft}
          isCardDrawerOpen={isCardDrawerOpen}
          setIsCardDrawerOpen={setIsCardDrawerOpen}
          cards={suitCardsData.flat()}
          CardsComponent={VideoCards}
          drawerHeight={isMobileView ? "105px" : "250px"}
          drawerStyle={{
            top: isMobileView ? "70px" : "40px",
            width: isCardDrawerOpen ? "185px" : "0px",
            minWidth: isCardDrawerOpen ? "185px" : "0px",
            left: "0",
            transform: "none",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            zIndex: "2000",
            overflow: "hidden",
            transition: "none",
          }}
        />

        <div className="casino-detail">
          {/* MOBILE VIEW */}
          <div className="d-none-big">
            <div className="total-points">
              <div>
                <span>Total Cards:</span> <span className="text-playerb">{totalCards}</span>
              </div>
              <div>
                <span>Total Points:</span> <span className="text-playerb">{totalPoints}</span>
              </div>
            </div>
            <div>
              <div className="casino-bl-box casino-bl-box-title">
                <div className="casino-bl-box-item casino-odds-name"></div>
                <div className="casino-bl-box-item">Back</div>
                <div className="casino-bl-box-item">Lay</div>
              </div>
              {[
                { nat: "K of spade", img: "KSS" },
                { nat: "K of heart", img: "KHH" },
                { nat: "K of club", img: "KCC" },
                { nat: "K of diamond", img: "KDD" },
              ].map((suit) => (
                <div key={suit.nat} className="casino-bl-box">
                  <div className="casino-bl-box-item casino-odds-name">
                    <img src={getCardImage(suit.img)} alt={suit.nat} />
                    <span className="float-right text-success">{renderExposureByNat(suit.nat)}</span>
                  </div>
                  {renderMarketBox({ nat: suit.nat, type: "back", showVolume: false, showExposure: false })}
                  {renderMarketBox({ nat: suit.nat, type: "lay", showVolume: false, showExposure: false })}
                </div>
              ))}
              <div className="casino-bl-box casino-bl-box-title">
                <div className="casino-bl-box-item casino-odds-name"></div>
                <div className="casino-bl-box-item">No</div>
                <div className="casino-bl-box-item">Yes</div>
              </div>
              {["Total points", "Total cards"].map((nat, idx) => (
                <div key={nat} className="casino-bl-box">
                  <div className="casino-bl-box-item casino-odds-name">
                    <div>
                      <span className="d-block">{nat}</span>
                      <div className="text-success">{renderExposureByNat(nat)}</div>
                    </div>
                  </div>
                  {renderMarketBox({ nat, type: "lay", showVolume: true, showExposure: false, volume: idx === 0 ? 100 : 105 })}
                  {renderMarketBox({ nat, type: "back", showVolume: true, showExposure: false, volume: idx === 0 ? 100 : 90 })}
                </div>
              ))}
            </div>
            <div className="containter container-fluid">
              <div className="row row5 win-with">
                {[
                  ["Win with 5", "Win with 15"],
                  ["Win with 6", "Win with 16"],
                  ["Win with 7", "Win with 17"],
                ].map((pair, groupIdx) => (
                  <div key={groupIdx} className="col-4">
                    {pair.map((nat) => (
                      <div key={nat} className="casino-box-row">
                        <div className="casino-nation-name">
                          <b>{nat}</b>
                        </div>
                        <div className="casino-bl-box">
                          {renderMarketBox({ nat, type: "back", enableLockTop: true })}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DESKTOP VIEW */}
          <div className="d-none-small">
            <div className="text-right d-none-big">
              Total Cards: {totalCards} | Total Points: {totalPoints}
            </div>
            <div className="row row5">
              {[
                { nat: "K of spade", img: "KSS" },
                { nat: "K of heart", img: "KHH" },
                { nat: "K of club", img: "KCC" },
                { nat: "K of diamond", img: "KDD" },
              ].map((suit) => (
                <div key={suit.nat} className="col-6 col-md-3">
                  <div className="casino-box-row">
                    <div className="casino-nation-name">
                      <img src={getCardImage(suit.img)} alt={suit.nat} />
                    </div>
                    <div className="casino-bl-box">
                      {renderMarketBox({ nat: suit.nat, type: "back", showVolume: false, showExposure: false })}
                      {renderMarketBox({ nat: suit.nat, type: "lay", showVolume: false, showExposure: false })}
                    </div>
                    <div className="casino-nation-name">{renderExposureByNat(suit.nat)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="row mt-2">
              <div className="col-12 col-md-4">
                {["Total points", "Total cards"].map((nat, idx) => (
                  <div key={nat}>
                    <div className="casino-yn">
                      <div></div>
                      <div className="casino-bl-box">
                        <div className="casino-bl-box-item">
                          <b>No</b>
                        </div>
                        <div className="casino-bl-box-item">
                          <b>Yes</b>
                        </div>
                      </div>
                    </div>
                    <div className="casino-odds-box casino-yn">
                      <div className="casino-odds-box-bhav">
                        <b>{nat}</b>
                      </div>
                      <div className="casino-bl-box">
                        {renderMarketBox({ nat, type: "lay", showVolume: true, volume: idx === 0 ? 100 : 105 })}
                        {renderMarketBox({ nat, type: "back", showVolume: true, volume: idx === 0 ? 100 : 90 })}
                      </div>
                    </div>
                    <div className="casino-yn rf-minheight">
                      <div></div>
                      <div className="casino-bl-box">
                        <div className="casino-nation-name">{renderExposureByNat(nat)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="col-12 col-md-8 win-with">
                <div className="row row5">
                  {[
                    ["Win with 5", "Win with 15"],
                    ["Win with 6", "Win with 16"],
                    ["Win with 7", "Win with 17"],
                  ].map((pair, groupIdx) => (
                    <div key={groupIdx} className="col-4">
                      {pair.map((nat) => (
                        <div key={nat} className="casino-box-row">
                          <div className="casino-nation-name">
                            <b>{nat}</b>
                          </div>
                          <div className="casino-bl-box">
                            {renderMarketBox({ nat, type: "back", enableLockTop: true })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Race20;
