import React, { useState, useEffect } from "react";
import { fetchCasinoExposureApi } from "../../api/api";
import { useSocket } from "../../components/Socket/useSocket";
import { getValueAfterDot } from "../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import { useGetFileData } from "../../hooks/useGetFileData";

const Trio = ({ onBetSelection, lastBetTime, exposureTrigger }) => {
    const { CODE, game_type, phpFile, game_name, iframe_url } = useGetFileData();
    const [isDrawerOpen, setIsDrawerOpen] = useState(true);
    const [gameData, setGameData] = useState(null);
    const [exposureData, setExposureData] = useState([]);

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

    const renderExposure = (marketId, isSession = false) => {
        const exposure = getExposure(marketId);
        if (exposure === 0) return null;
        const color = exposure >= 0 ? "#39FF39" : "#F7505E";

        if (isSession) {
            return (
                <span style={{ color, fontSize: "14px", }}>{exposure}</span>
            );
        }

        return (
            <div style={{
                color,
                fontSize: "13px",
                fontWeight: "bold",
                textAlign: "center",
                marginTop: "2px",
                width: "100%"
            }}>
                {exposure}
            </div>
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
            socket.disconnect();
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
                ...(runs ? { runs } : {}),
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

        const getCardImg = (val) => {
            if (!val || val === "1") return "https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png";
            return `https://wver.sprintstaticdata.com/v190/static/front/img/cards/${val}.png`;
        };

        return (
            <div className="trio-video-cards-wrapper" style={{
                display: "flex",
                flexDirection: "row",
                gap: "5px",
                padding: "5px",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <div style={{ display: "flex", gap: "5px" }}>
                    {[t1.C1, t1.C2, t1.C3].map((card, idx) => (
                        <img
                            key={idx}
                            src={getCardImg(card)}
                            alt={`card-${idx}`}
                            style={{ width: "25px", height: "auto", borderRadius: "2px" }}
                        />
                    ))}
                </div>
            </div>
        );
    };

    const BettingBox = ({ sid, oddsKey, teamName, boxType = "back", customOdds, isSession = false }) => {
        const market = getOddsBySid(sid);
        const odds = market ? market[oddsKey] : (customOdds || "");
        const suspended = market ? isSuspended(market.gstatus) : true;

        const isLay = boxType === "lay";
        const borderColor = isLay ? "#fca4b7" : "#72bbef";
        const bgColor = isLay ? "#f994ba40" : "rgba(114, 187, 239, 0.1)";

        return (
            <div
                className={`betting-box ${suspended ? "suspended" : ""}`}
                style={{
                    border: isSession ? `2px solid ${borderColor}` : `1.5px solid ${borderColor}`,
                    backgroundColor: suspended ? "rgba(0,0,0,0.6)" : bgColor,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: isSession ? "55px" : "45px",
                    width: "100%",
                    cursor: suspended ? "not-allowed" : "pointer",
                    position: "relative",
                    borderRadius: "2px",
                    transition: "all 0.2s"
                }}
                onClick={() => !suspended && handleOddsClick(teamName, odds, sid, !isLay)}
            >
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    opacity: suspended ? 0.3 : 1,
                    width: "100%"
                }}>
                    {((isSession && (market?.l1 || market?.b1)) || (!isSession && !isLay && market?.v1)) && (
                        <span style={{
                            // color: isSession ? "#DDDDDD" : "#72bbef",
                            fontSize: isSession ? "14px" : "11px",
                            fontWeight: isSession ? "500" : "bold",
                            marginBottom: isSession ? "1px" : "0",
                            position: isSession ? "static" : "absolute",
                            top: isSession ? "auto" : "2px",
                            lineHeight: "1"
                        }}>
                            {isSession ? (isLay ? market?.l1 : market?.b1) : market?.v1}
                        </span>
                    )}
                    <span style={{
                        // color: "#fff",
                        fontSize: isSession ? "18px" : "14px",
                        fontWeight: "bold",
                        lineHeight: "1.5"
                    }}>
                        {odds}
                    </span>
                </div>
                {suspended && (
                    <i className="fas fa-lock" style={{
                        position: "absolute",
                        // color: "#fff",
                        fontSize: "14px",
                        zIndex: 10
                    }}></i>
                )}
            </div>
        );
    };

    const MarketRow = ({ title, sid, isSession = false }) => {
        if (isSession) {
            return (
                <div className="market-row-container session-row">
                    <div className="session-title-box" style={{ justifyContent: "space-between" }}>
                        <span>{title}</span>
                        {renderExposure(sid, true)}
                    </div>
                    <div className="market-boxes">
                        <BettingBox sid={sid} oddsKey="ls1" teamName={`${title}`} boxType="lay" isSession={true} />
                        <BettingBox sid={sid} oddsKey="bs1" teamName={`${title}`} boxType="back" isSession={true} />
                    </div>
                </div>
            );
        }

        return (
            <div className="market-row-container">
                <div className="market-title">{title}</div>
                <div className="market-boxes">
                    <BettingBox sid={sid} oddsKey="b1" teamName={`${title}`} boxType="back" />
                    <BettingBox sid={sid} oddsKey="l1" teamName={`${title}`} boxType="lay" />
                </div>
                {renderExposure(sid)}
            </div>
        );
    };

    return (
        <div className="casino-table pasa">
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

.row {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
}

.col-12,
.col-6,
.col-md-3,
.col-md-6 {
  position: relative;
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
}

.col-6 {
  -ms-flex: 0 0 50%;
  flex: 0 0 50%;
  max-width: 50%;
}

.col-12 {
  -ms-flex: 0 0 100%;
  flex: 0 0 100%;
  max-width: 100%;
}

@media (min-width:768px) {
  .col-md-3 {
    -ms-flex: 0 0 25%;
    flex: 0 0 25%;
    max-width: 25%;
  }

  .col-md-6 {
    -ms-flex: 0 0 50%;
    flex: 0 0 50%;
    max-width: 50%;
  }
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

.casino-nation-name {
  background-color: #444;
  color: #ddd;
  padding: 4px;
  position: relative;
}

.pasa .casino-nation-name {
  width: 100%;
  text-align: center;
}

.pasa .casino-bl-box {
  width: 100%;
}

.pasa .casino-bl-box-item {
  height: 48px;
}

.pasa .casino-bl-box-item {
  width: calc(50% - 2px);
  height: 48px;
}

.pasa .pasa-fancy .casino-nation-name {
  background-color: transparent;
}

.pasa .pasa-sesssion .casino-nation-name {
  width: 50%;
  padding-right: 10px;
  position: relative;
  text-align: left;
}

.pasa .pasa-sesssion .casino-bl-box {
  width: 50%;
}

.pasa .pasa-sesssion .casino-bl-box-item {
  height: 48px;
}

.pasa .pasa-sesssion .casino-box-odd {
  font-size: 18px;
  margin-top: 3px;
}

.pasa .pasa-cards .casino-nation-name {
  background-color: transparent;
}

.pasa .pasa-other-bets {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  align-items: flex-start;
}

.pasa .pasa-other-bet {
  width: 19%;
}

.pasa .pasa-other-bet .casino-nation-name {
  width: 100%;
  background-color: transparent;
}

.pasa .pasa-other-bet .casino-bl-box {
  width: 100%;
}

.pasa .pasa-other-bet .casino-bl-box-item {
  height: 48px;
  width: 100%;
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

  .casino-bl-box {
    margin-bottom: 4px;
  }

  .casino-bl-box-item .casino-box-odd {
    font-size: var(--font-13);
  }

  .pasa .casino-bl-box-item {
    height: 50px;
  }

  .pasa .pasa-other-bets {
    justify-content: center;
  }

  .pasa .pasa-other-bet {
    width: 31%;
    margin-right: 2%;
  }

  .pasa .casino-nation-name {
    line-height: 1;
  }
}

@media only screen and (min-width: 768px) and (max-width: 1279px) {
  .casino-bl-box-item .casino-box-odd {
    font-size: var(--font-small);
  }
}
        `}
            </style>

            <CasinoVideo
                gameName={game_name}
                roundId={gameData?.t1?.[0]?.mid}
                videoSrc={iframe_url}
                autotime={gameData?.t1?.[0]?.autotime}
                totalTime={gameData?.t1?.[0]?.ft} isCardDrawerOpen={isDrawerOpen}
                setIsCardDrawerOpen={setIsDrawerOpen}
                cards={[gameData?.t1?.[0]?.C1, gameData?.t1?.[0]?.C2, gameData?.t1?.[0]?.C3]}
                CardsComponent={VideoCards}
            />

            <div className="casino-detail">
                <div className="row row5">
                    <div className="col-12 col-md-6">
                        <div className="casino-box-row d-none-small" style={{ height: "30px" }}></div>
                        <div className="casino-box-row pasa-sesssion">
                            <div className="casino-nation-name">
                                <b className="pointer">Session</b>
                                <div className="float-right">
                                    <span className="mr-2">
                                        {renderExposure(1, true)}
                                    </span>
                                </div>
                            </div>
                            <div className="casino-bl-box">
                                <div
                                    className={`lay casino-bl-box-item ${isSuspended(getOddsBySid(1)?.gstatus) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick("Session", getOddsBySid(1)?.l1, 1, false, getOddsBySid(1)?.l1)}
                                >
                                    <span>{getOddsBySid(1)?.l1 || "0"}</span>
                                    <span className="casino-box-odd">{getOddsBySid(1)?.l1 || "100"}</span>
                                </div>
                                <div
                                    className={`back casino-bl-box-item ${isSuspended(getOddsBySid(1)?.gstatus) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick("Session", getOddsBySid(1)?.b1, 1, true, getOddsBySid(1)?.b1)}
                                >
                                    <span>{getOddsBySid(1)?.b1 || "0"}</span>
                                    <span className="casino-box-odd">{getOddsBySid(1)?.b1 || "100"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="casino-box-row d-none-small" style={{ height: "30px" }}></div>
                    </div>
                    <div className="col-6 col-md-3 pasa-fancy">
                        <div className="casino-box-row">
                            <div className="casino-nation-name">
                                <b>3 Card Judgement(1 2 4)</b>
                            </div>
                            <div className="casino-bl-box">
                                <div
                                    className={`back casino-bl-box-item ${isSuspended(getOddsBySid(2)?.gstatus) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick("3 Card Judgement(1 2 4)", getOddsBySid(2)?.b1, 2, true)}
                                >
                                    <span className="casino-box-odd">{getOddsBySid(2)?.b1 || "0"}</span>
                                </div>
                                <div
                                    className={`lay casino-bl-box-item ${isSuspended(getOddsBySid(2)?.gstatus) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick("3 Card Judgement(1 2 4)", getOddsBySid(2)?.l1, 2, false)}
                                >
                                    <span className="casino-box-odd">{getOddsBySid(2)?.l1 || "0"}</span>
                                </div>
                            </div>
                            <div className="casino-nation-name" style={{ display: getExposure(2) ? "" : "none" }}>
                                {renderExposure(2)}
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3 pasa-fancy">
                        <div className="casino-box-row">
                            <div className="casino-nation-name">
                                <b>3 Card Judgement(J Q K)</b>
                            </div>
                            <div className="casino-bl-box">
                                <div
                                    className={`back casino-bl-box-item ${isSuspended(getOddsBySid(3)?.gstatus) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick("3 Card Judgement(J Q K)", getOddsBySid(3)?.b1, 3, true)}
                                >
                                    <span className="casino-box-odd">{getOddsBySid(3)?.b1 || "0"}</span>
                                </div>
                                <div
                                    className={`lay casino-bl-box-item ${isSuspended(getOddsBySid(3)?.gstatus) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick("3 Card Judgement(J Q K)", getOddsBySid(3)?.l1, 3, false)}
                                >
                                    <span className="casino-box-odd">{getOddsBySid(3)?.l1 || "0"}</span>
                                </div>
                            </div>
                            <div className="casino-nation-name" style={{ display: getExposure(3) ? "" : "none" }}>
                                {renderExposure(3)}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row row5 mt-2 pasa-cards">
                    <div className="col-6 col-md-3">
                        <div className="casino-box-row">
                            <div className="casino-nation-name">
                                <b>Two Red Only</b>
                            </div>
                            <div className="casino-bl-box">
                                <div
                                    className={`back casino-bl-box-item ${isSuspended(getOddsBySid(4)?.gstatus) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick("Two Red Only", getOddsBySid(4)?.b1, 4, true)}
                                >
                                    <span className="casino-box-odd">{getOddsBySid(4)?.b1 || "0"}</span>
                                </div>
                                <div
                                    className={`lay casino-bl-box-item ${isSuspended(getOddsBySid(4)?.gstatus) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick("Two Red Only", getOddsBySid(4)?.l1, 4, false)}
                                >
                                    <span className="casino-box-odd">{getOddsBySid(4)?.l1 || "0"}</span>
                                </div>
                            </div>
                            <div className="casino-nation-name" style={{ display: getExposure(4) ? "" : "none" }}>
                                {renderExposure(4)}
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="casino-box-row">
                            <div className="casino-nation-name">
                                <b>Two Black Only</b>
                            </div>
                            <div className="casino-bl-box">
                                <div
                                    className={`back casino-bl-box-item ${isSuspended(getOddsBySid(5)?.gstatus) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick("Two Black Only", getOddsBySid(5)?.b1, 5, true)}
                                >
                                    <span className="casino-box-odd">{getOddsBySid(5)?.b1 || "0"}</span>
                                </div>
                                <div
                                    className={`lay casino-bl-box-item ${isSuspended(getOddsBySid(5)?.gstatus) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick("Two Black Only", getOddsBySid(5)?.l1, 5, false)}
                                >
                                    <span className="casino-box-odd">{getOddsBySid(5)?.l1 || "0"}</span>
                                </div>
                            </div>
                            <div className="casino-nation-name" style={{ display: getExposure(5) ? "" : "none" }}>
                                {renderExposure(5)}
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="casino-box-row">
                            <div className="casino-nation-name">
                                <b>Two Odd Only</b>
                            </div>
                            <div className="casino-bl-box">
                                <div
                                    className={`back casino-bl-box-item ${isSuspended(getOddsBySid(6)?.gstatus) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick("Two Odd Only", getOddsBySid(6)?.b1, 6, true)}
                                >
                                    <span className="casino-box-odd">{getOddsBySid(6)?.b1 || "0"}</span>
                                </div>
                                <div
                                    className={`lay casino-bl-box-item ${isSuspended(getOddsBySid(6)?.gstatus) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick("Two Odd Only", getOddsBySid(6)?.l1, 6, false)}
                                >
                                    <span className="casino-box-odd">{getOddsBySid(6)?.l1 || "0"}</span>
                                </div>
                            </div>
                            <div className="casino-nation-name" style={{ display: getExposure(6) ? "" : "none" }}>
                                {renderExposure(6)}
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="casino-box-row">
                            <div className="casino-nation-name">
                                <b>Two Even Only</b>
                            </div>
                            <div className="casino-bl-box">
                                <div
                                    className={`back casino-bl-box-item ${isSuspended(getOddsBySid(7)?.gstatus) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick("Two Even Only", getOddsBySid(7)?.b1, 7, true)}
                                >
                                    <span className="casino-box-odd">{getOddsBySid(7)?.b1 || "0"}</span>
                                </div>
                                <div
                                    className={`lay casino-bl-box-item ${isSuspended(getOddsBySid(7)?.gstatus) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick("Two Even Only", getOddsBySid(7)?.l1, 7, false)}
                                >
                                    <span className="casino-box-odd">{getOddsBySid(7)?.l1 || "0"}</span>
                                </div>
                            </div>
                            <div className="casino-nation-name" style={{ display: getExposure(7) ? "" : "none" }}>
                                {renderExposure(7)}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="casino-box-row pasa-other-bets">
                    <div className="casino-box-row pasa-other-bet">
                        <div className="casino-nation-name">
                            <b>Pair</b>
                        </div>
                        <div className="casino-bl-box">
                            <div
                                className={`back casino-bl-box-item ${isSuspended(getOddsBySid(8)?.gstatus) ? "suspended" : ""}`}
                                onClick={() => handleOddsClick("Pair", getOddsBySid(8)?.b1 || "5.5", 8, true)}
                            >
                                <span className="casino-box-odd">{getOddsBySid(8)?.b1 || "5.5"}</span>
                            </div>
                        </div>
                        <div className="casino-nation-name" style={{ display: getExposure(8) ? "" : "none" }}>
                            {renderExposure(8)}
                        </div>
                    </div>
                    <div className="casino-box-row pasa-other-bet">
                        <div className="casino-nation-name">
                            <b>Flush</b>
                        </div>
                        <div className="casino-bl-box">
                            <div
                                className={`back casino-bl-box-item ${isSuspended(getOddsBySid(9)?.gstatus) ? "suspended" : ""}`}
                                onClick={() => handleOddsClick("Flush", getOddsBySid(9)?.b1 || "12", 9, true)}
                            >
                                <span className="casino-box-odd">{getOddsBySid(9)?.b1 || "12"}</span>
                            </div>
                        </div>
                        <div className="casino-nation-name" style={{ display: getExposure(9) ? "" : "none" }}>
                            {renderExposure(9)}
                        </div>
                    </div>
                    <div className="casino-box-row pasa-other-bet">
                        <div className="casino-nation-name">
                            <b>Straight</b>
                        </div>
                        <div className="casino-bl-box">
                            <div
                                className={`back casino-bl-box-item ${isSuspended(getOddsBySid(10)?.gstatus) ? "suspended" : ""}`}
                                onClick={() => handleOddsClick("Straight", getOddsBySid(10)?.b1 || "25", 10, true)}
                            >
                                <span className="casino-box-odd">{getOddsBySid(10)?.b1 || "25"}</span>
                            </div>
                        </div>
                        <div className="casino-nation-name" style={{ display: getExposure(10) ? "" : "none" }}>
                            {renderExposure(10)}
                        </div>
                    </div>
                    <div className="casino-box-row pasa-other-bet">
                        <div className="casino-nation-name">
                            <b>Trio</b>
                        </div>
                        <div className="casino-bl-box">
                            <div
                                className={`back casino-bl-box-item ${isSuspended(getOddsBySid(11)?.gstatus) ? "suspended" : ""}`}
                                onClick={() => handleOddsClick("Trio", getOddsBySid(11)?.b1 || "101", 11, true)}
                            >
                                <span className="casino-box-odd">{getOddsBySid(11)?.b1 || "101"}</span>
                            </div>
                        </div>
                        <div className="casino-nation-name" style={{ display: getExposure(11) ? "" : "none" }}>
                            {renderExposure(11)}
                        </div>
                    </div>
                    <div className="casino-box-row pasa-other-bet">
                        <div className="casino-nation-name">
                            <b>Straight Flush</b>
                        </div>
                        <div className="casino-bl-box">
                            <div
                                className={`back casino-bl-box-item ${isSuspended(getOddsBySid(12)?.gstatus) ? "suspended" : ""}`}
                                onClick={() => handleOddsClick("Straight Flush", getOddsBySid(12)?.b1 || "251", 12, true)}
                            >
                                <span className="casino-box-odd">{getOddsBySid(12)?.b1 || "251"}</span>
                            </div>
                        </div>
                        <div className="casino-nation-name" style={{ display: getExposure(12) ? "" : "none" }}>
                            {renderExposure(12)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Trio;
