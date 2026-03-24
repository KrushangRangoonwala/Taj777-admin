import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useIsMobile from "../../hooks/useIsMobile";
import CasinoVideo from "./components/CasinoVideo";
import { fetchCasinoExposureApi, getDefaultParams } from "../../api/api";
import "./kk.css";
import { getExposureClass } from "../../utilies/helpers";
const lucky9Logo = "/assets/cards_new/lucky9.png";

const TwentyNineCardBaccarat = ({ isVisible, onBetSelection, exposureTrigger }) => {
  const [gameData, setGameData] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
  const [exposureData, setExposureData] = useState([]);
  const isMobileView = useIsMobile();

  const socketRef = useRef(null);

  const getCardImage = (cardCode) => {
    if (!cardCode || cardCode === "1") return "/assets/cards_new/1.png";

    let formattedCode = cardCode.toUpperCase();
    // Assets in cards_new use double suite letters (e.g., 10SS, 3CC).
    // If the server sends a single letter suite (e.g., 3C, 10S), we double it.
    // If it's already doubled (e.g., 3CC, 10SS), we leave it as is.
    if (formattedCode.length > 1) {
      const lastChar = formattedCode.slice(-1);
      const secondLastChar = formattedCode.slice(-2, -1);

      if (["S", "H", "D", "C"].includes(lastChar) && lastChar !== secondLastChar) {
        formattedCode = formattedCode + lastChar;
      }
    }

    return `/assets/cards_new/${formattedCode}.png`;
  };

  const VideoCards = () => {
    const t1 = gameData?.t1?.[0];
    if (!t1) return null;

    return (
      <div className="casino-video-cards-container">
        <div className="card-row">
          <img src={getCardImage(t1.C1)} alt="C1" />
          <img src={getCardImage(t1.C3)} alt="C3" />
          <img src={getCardImage(t1.C5)} alt="C5" />
        </div>
        <div className="card-row">
          <img src={getCardImage(t1.C2)} alt="C5" />
          <img src={getCardImage(t1.C4)} alt="C4" />
          <img src={getCardImage(t1.C6)} alt="C6" />
        </div>
        <style jsx>{`
          .casino-video-cards-container {
            display: flex;
            flex-direction: column;
            gap: 5px;
            padding: 1px;
          }
          .card-row {
            display: flex;
            gap: 4px;
            justify-content: center;
          }
          .card-row img {
            width: 22px;
            height: auto;
            border-radius: 2px;
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
      console.log("✅ TwentyNineCardBaccarat connected to socket:", socket.id);
      setIsConnected(true);
      socket.emit("Room", "teensin");
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

    socket.on("teensin", handleSocketData);
    socket.on("game", handleSocketData);
    socket.on("message", handleSocketData);

    return () => {
      socket.off("teensin", handleSocketData);
      socket.off("game", handleSocketData);
      socket.off("message", handleSocketData);
      socket.disconnect();
    };
  }, []);

  const fetchExposure = async () => {
    try {
      const response = await fetchCasinoExposureApi({
        markettype: "TEENSIN",
        main_event_id: gameData.t1?.[0]?.mid || "1",
      });
      if (response && response.status === "ok") {
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
    const market = exposureData.find((item) => item.market_id == sid);
    return market ? (market.win_loss !== undefined ? market.win_loss : market.total_exposure) : 0;
  };

  const renderExposure = (sid, className = "d-none") => {
    const exposure = getExposure(sid);
    const isDiv = className.includes("sin-khal-box-book");
    const Tag = isDiv ? "div" : "span";

    if (exposure === 0) {
      return <Tag className={className}>0</Tag>;
    }

    return (
      <Tag className={className.replace("d-none", "").trim() + " mr-2 " + getExposureClass(exposure)}>
        {exposure}
      </Tag>
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
        odds: market.b1,
        marketId: market.sid,
        eventId: gameData.t1?.[0]?.mid,
      });
    }
  };

  const renderBetBox = (nat, label) => {
    const market = gameData.t2?.find((m) => m.nat === nat);
    if (!market) return null;

    const isSuspended =
      (market
        && (market.gstatus === "SUSPENDED"
          || market.gstatus === "suspended"
          || market.gstatus === 0
          || market.gstatus === "0"))
      || !market.b1
      || market.b1 === "0"
      || market.b1 === "0.00"
      || market.b1 === 0;

    const odds = market && market.b1 ? market.b1 : "0.00";

    // Custom display for Color Plus
    let displayOdds = odds;
    if (nat === "Color Plus A" && parseFloat(odds) === 2) displayOdds = "A";
    if (nat === "Color Plus B" && parseFloat(odds) === 2) displayOdds = "B";
    const exp = getExposure(market.sid);
    return (
      <>
        <div className="casino-bl-box-item d-none-big"><span>{label}</span></div>
        <div
          className={`back casino-bl-box-item ${isSuspended ? `suspended ${exp && exp != 0 ? "lock-top" : ""}` : ""}`}
          onClick={() => !isSuspended && handleBet(market, nat)}
        >
          <span className="casino-box-odd">
            {displayOdds}
          </span>
          {market && renderExposure(market.sid)}
        </div>
      </>
    );
  };

  const renderLucky9Section = () => {
    const market = gameData.t2?.find((m) => m.sid === 9 || m.nat === "Lucky 9" || m.nat === "Lucky 9 A" || m.nat === "Lucky 9 B");
    if (!market) return null;

    const isSuspended =
      market &&
      (market.gstatus === "SUSPENDED" ||
        market.gstatus === "suspended" ||
        market.gstatus === 0 ||
        market.gstatus === "0");

    const isBackLocked = !market || !market.b1 || market.b1 === "0" || market.b1 === "0.00" || market.b1 === 0;
    const isLayLocked = !market || !market.l1 || market.l1 === "0" || market.l1 === "0.00" || market.l1 === 0;
    const exp = getExposure(market.sid);

    return (
      <div className="sin-khal-box">
        <img src={lucky9Logo} alt="Lucky 9" />
        <div className="casino-bl-box">
          <div
            className={`back casino-bl-box-item ${(isSuspended || isBackLocked) ? `suspended ${exp && exp != 0 ? "lock-top" : ""}` : ""}`}
            onClick={() => !isBackLocked && !isSuspended && handleBet(market, market?.nat || "Lucky 9")}
          >
            <span className="casino-box-odd">
              {market?.b1 || "0.00"}
            </span>
          </div>
          <div
            className={`lay casino-bl-box-item ${(isSuspended || isLayLocked) ? `suspended ${exp && exp != 0 ? "lock-top" : ""}` : ""}`}
            onClick={() => !isLayLocked && !isSuspended && handleBet({ ...market, b1: market?.l1 }, market?.nat || "Lucky 9", false)}
          >
            <span className="casino-box-odd">
              {market?.l1 || "0.00"}
            </span>
          </div>
          {market && renderExposure(market.sid, "sin-khal-box-book d-none")}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="casino-table sin-khal">
        <CasinoVideo
          gameName="29Card Baccarat"
          roundId={gameData.t1?.[0]?.mid}
          videoSrc="/mediaplayer/teensin/f3747eec-df3d-4515-b869-c9dda01202ad"
          autotime={gameData.t1?.[0]?.autotime}
          totalTime={gameData.t1?.[0]?.ft} isCardDrawerOpen={isCardDrawerOpen}
          setIsCardDrawerOpen={setIsCardDrawerOpen}
          cards={[gameData?.t1?.[0]?.C1, gameData?.t1?.[0]?.C2, gameData?.t1?.[0]?.C3, gameData?.t1?.[0]?.C4, gameData?.t1?.[0]?.C5, gameData?.t1?.[0]?.C6]}
          CardsComponent={VideoCards}
        />

        <style>{`
           /*! CSS Used from: https://wver.sprintstaticdata.com/v207/static/front/css/bootstrap.min.css */
    *,
    ::after,
    ::before {
        box-sizing: border-box;
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

    .casino-bl-box-title .playera {
        color: var(--text-red) !important;
    }

    .casino-bl-box-title .playerb {
        color: var(--text-yellow) !important;
    }

    .casino-detail .casino-nation-name.no-border {
        background-color: transparent;
        padding: 0;
    }

    .casino-bl-box {
        display: flex;
        display: -webkit-flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
    }
          `}</style>

        <style>{`
     .casino-bl-box-title .casino-bl-box-item {
        color: var(--text-table);
        height: 24px !important;
        font-size: var(--font-caption);
        flex-direction: row;
    }

    .casino-bl-box-title .casino-bl-box-item span {
        width: auto;
        flex: 1;
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

    .teen20casino-container {
        display: flex;
        display: -webkit-flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }

    .teen20left,
    .teen20right {
        width: 49%;
    }

    .teen20center {
        width: 2px;
        background-color: grey;
    }

    .sin-khal .casino-bl-box {
        position: relative;
        z-index: 9;
    }

    .sin-khal .casino-bl-box-item {
        width: calc(25% - 3px);
        height: 40px;
        text-transform: uppercase;
        position: relative;
    }

    .sin-khal-box {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 20px;
    }

    .sin-khal-box img {
        height: 100px;
        z-index: 10;
    }

    .sin-khal-box .casino-bl-box-item {
        width: 150px;
    }

    .sin-khal-box .casino-bl-box-item.back {
        margin-left: -4px;
        border-right: 0;
        border-radius: 0;
        border-left: 0;
    }

    .sin-khal-box .casino-bl-box-item.back:hover,
    .sin-khal-box .casino-bl-box-item.back:focus {
        border-right: 0;
        border-left: 0;
        border-top-width: 2px;
        border-bottom-width: 2px;
    }

    .sin-khal-box .casino-bl-box-item.lay {
        margin-left: -4px;
        border-left: 0;
        border-radius: 0;
    }

    .sin-khal-box .casino-bl-box-item.lay:focus,
    .sin-khal-box .casino-bl-box-item.lay:hover {
        border-left: 0;
        border-top-width: 2px;
        border-bottom-width: 2px;
        border-right-width: 2px;
    }

    .sin-khal-box-book {
        position: absolute;
        bottom: -25px;
        left: 50%;
        transform: translateX(-50%);
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
    }

    @media only screen and (min-width: 320px) and (max-width: 767px) {
        .d-none-small {
            display: none !important;
        }

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

        .sin-khal .casino-bl-box-item {
            width: calc(100% - 3px);
        }

        .sin-khal .casino-nation-name {
            width: 100%;
            text-align: center;
            font-size: 14px;
        }
            .sin-khal .casino-nation-name .playera,
            .sin-khal .casino-nation-name .playerb{
            font-size: 14px;
            }

        .sin-khal .casino-bl-box-item:nth-child(odd) {
            height: 26px;
            margin-top: 10px;
        }

        .sin-khal-box img {
            height: 70px;
        }

        .sin-khal-box .casino-bl-box-item {
            width: 80px !important;
            height: 40px !important;
            margin-top: 0 !important;
        }

        .sin-khal-box .casino-bl-box-item.back {
            margin-left: -4px;
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
          `}</style>

        <div className="casino-detail">
          <div className="teen20casino-container">
            <div className="teen20left">
              <div className="casino-box-row">
                <div className="casino-nation-name no-border casino-bl-box-title">
                  <div className="playera">Player A</div>
                </div>
              </div>
              <div className="casino-bl-box casino-bl-box-title d-none-small">
                <div className="casino-bl-box-item"><span>Winner</span></div>
                <div className="casino-bl-box-item"><span>High Card</span></div>
                <div className="casino-bl-box-item"><span>Pair</span></div>
                <div className="casino-bl-box-item"><span>Color Plus</span></div>
              </div>
              <div className="casino-bl-box">
                {renderBetBox("Player A", "Winner")}
                {renderBetBox("High Card A", "High Card")}
                {renderBetBox("Pair A", "Pair")}
                {renderBetBox("Color Plus A", "Color Plus")}
              </div>
            </div>
            <div className="teen20center"></div>
            <div className="teen20right">
              <div className="casino-box-row">
                <div className="casino-nation-name no-border casino-bl-box-title">
                  <div className="playerb">Player B</div>
                </div>
              </div>
              <div className="casino-bl-box casino-bl-box-title d-none-small">
                <div className="casino-bl-box-item"><span>Winner</span></div>
                <div className="casino-bl-box-item"><span>High Card</span></div>
                <div className="casino-bl-box-item"><span>Pair</span></div>
                <div className="casino-bl-box-item"><span>Color Plus</span></div>
              </div>
              <div className="casino-bl-box">
                {renderBetBox("Player B", "Winner")}
                {renderBetBox("High Card B", "High Card")}
                {renderBetBox("Pair B", "Pair")}
                {renderBetBox("Color Plus B", "Color Plus")}
              </div>
            </div>
          </div>
          {renderLucky9Section()}
        </div>
      </div>
    </>
  );
};
export default TwentyNineCardBaccarat;
