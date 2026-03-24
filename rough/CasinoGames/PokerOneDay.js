import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { fetchCasinoExposureApi } from "../../api/api";
import useIsMobile from "../../hooks/useIsMobile";
import "./kk.css";
import "./PokerOneDay.css";
import CasinoVideo from "./components/CasinoVideo";
import { getExposureClass, getIsSuspended } from "../../utilies/helpers";
import { useGetFileData } from "../../hooks/useGetFileData";

const getCardImage = (cardCode) => {
    if (!cardCode || cardCode === "1")
        return "https://wver.sprintstaticdata.com/v67/static/front/img/cards/1.png";

    const baseUrl = "https://wver.sprintstaticdata.com/v67/static/front/img/cards";
    return `${baseUrl}/${cardCode}.png`;
};

function removeFirstTwoWords(str) {
    return str.trim().split(/\s+/).slice(2).join(' ');
}

function getCardsBonusName(idx) {
    return idx === 0 ? "2 Cards Bonus" : "7 Cards Bonus";
}

const PokerOneDay = ({ isVisible, onBetSelection, lastBetTime }) => {
    const { CODE, game_type, phpFile, placeBetApi, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [exposureData, setExposureData] = useState([]);
    const socketRef = useRef(null);
    const isMobile = useIsMobile();

    // Fetch Exposure
    useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.[0]?.mid) return;
            try {
                const response = await fetchCasinoExposureApi({
                    markettype: "ODI_POKER", // Correct market type per user
                    main_event_id: gameData.t1[0].mid,
                    curPageName: "live_1day_poker.php",
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
        const market = exposureData.find((item) => item.market_id == marketId && Boolean(Number(item.total_exposure)));
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

    useEffect(() => {
        const socket = io("https://trubet9.bet:2053", {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        const handleGameData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) {
                    setGameData(payload);
                }
            } catch (error) {
                console.error("Error processing Poker data:", error);
            }
        };

        socket.on("connect", () => {
            console.log("✅ PokerOneDay Connected:", socket.id);
            socket.emit("Room", "poker");
        });

        socket.on("poker", handleGameData);
        socket.on("game", handleGameData);

        socket.on("disconnect", (reason) => {
            console.log("⚠️ PokerOneDay Disconnected:", reason);
            if (reason === "io server disconnect") {
                setTimeout(() => socket.connect(), 1000);
            }
        });

        socket.on("connect_error", (error) => {
            console.error("🔴 Connection Error:", error.message);
            setTimeout(() => socket.connect(), 2000);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const currentGame = gameData?.t1?.[0];
    const markets = gameData?.t2 || [];

    // Filter Markets
    const playerAMain = markets.find(m => m.sid === 1) || {};
    const playerBMain = markets.find(m => m.sid === 2) || {};

    const playerABonus = markets.filter(m => m.sid === 3 || m.sid === 4);
    const playerBBonus = markets.filter(m => m.sid === 5 || m.sid === 6);

    const cards = {
        playerA: [currentGame?.C1, currentGame?.C2],
        playerB: [currentGame?.C3, currentGame?.C4],
        board: [currentGame?.C5, currentGame?.C6, currentGame?.C7, currentGame?.C8, currentGame?.C9]
    };

    const handleOddsClick = (marketName, odds, market, isBack, market_name_api_value) => {
        if (!Number(odds)) return;
        if (!market || market.gstatus === "SUSPENDED" || market.gstatus === "suspended") return;

        const min = market?.min || 100;
        const max = market?.max || 300000;

        const betDataVal = {
            teamName: marketName,
            odds: odds,
            minBet: min,
            maxBet: max,
            isBack,
            marketId: market.sid,
            eventId: currentGame?.mid,
            ...(market_name_api_value ? { market_name_api_value } : {}),
        };

        onBetSelection(betDataVal);
    };

    const renderOddBox = (market, isBack, namePrefix) => {
        const rate = isBack ? market.b1 : market.l1;
        // Check if actually suspended or rate is 0
        // const isSuspended = market.gstatus === "SUSPENDED";
        const isSuspended = getIsSuspended(market?.gstatus);

        return (
            <div
                className={`${isBack ? "back" : "lay"} casino-bl-box-item ${isSuspended ? "suspended" : ""}`}
                onClick={() => !isSuspended && handleOddsClick(namePrefix || market.nat, rate, market, isBack, namePrefix ? market.nat : null)}
            >
                <span className="casino-box-odd">{isSuspended ? "0" : rate}</span>
                {!isSuspended && <span className="d-none">0</span>}
            </div>
        );
    };

    // Bonus render (usually just Back?)
    const renderBonusBox = (market) => {
        // Bonus usually just back? JSON shows b1/l1. Assuming Back.
        const rate = market.b1;
        const isSuspended = getIsSuspended(market?.gstatus);

        return (
            <div
                key={market.sid}
                className={`casino-bl-box-item back ${isSuspended ? "suspended" : ""}`}
                onClick={() => !isSuspended && handleOddsClick(market.nat, rate, market, true)}
            >
                <span className="casino-box-odd">{market.nat}</span>
                <span className="d-none">{isSuspended ? "0" : rate}</span>
                <span className="casino-box-odd">{market.nat} {isSuspended ? "" : rate}</span>
                <span className="d-none">0</span>
            </div>
        );
    };

    return (
        <>
            <div className="casino-table poker1day kk-game kk">
                <CasinoVideo
                    gameName="Poker 1-Day"
                    roundId={currentGame?.mid}
                    videoSrc={iframe_url}
                    isCardDrawerOpen={isCardDrawerOpen}
                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                    autotime={currentGame?.autotime}
                    totalTime={currentGame?.ft} cards={[...cards.board]}
                    CardsComponent={() => (
                        <div className="playerboardcards">
                            <div className="dealer-name w-100 mb-1">Board</div>
                            <div className="d-flex">
                                {cards.board.map((card, idx) => (
                                    <span key={`board-${idx}`}><img src={getCardImage(card)} alt="card" /></span>
                                ))}
                            </div>
                        </div>
                    )}
                />

                <div className="casino-detail d-flex" style={{ justifyContent: "space-between" }}>
                    {/* PLAYER A BOX */}
                    <div className="playerabox">
                        <div className="casino-box-row playerafabcy">
                            <div className="casino-nation-name">
                                <b>Player A</b>
                            </div>
                            <div className="casino-bl-box">
                                {renderOddBox(playerAMain, true, "Player A Main")}
                                {renderOddBox(playerAMain, false, "Player A Main")}
                            </div>
                            <div className="casino-nation-name text-center w-100">{renderExposure(playerAMain.sid)}</div>
                        </div>

                        {/* Player A Bonus */}
                        <div className="casino-box poker1dayother mt-2">
                            <div className="casino-bl-box">
                                {playerABonus.map((m, idx) => (
                                    <div
                                        key={m.sid}
                                        className={`casino-bl-box-item back ${m.gstatus === "SUSPENDED" ? "suspended" : ""}`}
                                        onClick={() => handleOddsClick(m.nat, m.b1, m, true)}
                                    >
                                        <span className="casino-box-odd">{getCardsBonusName(idx)}</span>
                                        {renderExposure(m.sid)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="playerabcardbox">
                        <div className="poker-icon"><img src="https://wver.sprintstaticdata.com/v65/static/front/img/poker.png" /></div>
                        <div className="row row5 w-100">
                            <div className="col-12 col-md-6">
                                <div className={`dealer-name playera`}>Player A</div>
                                <div className="mt-1">
                                    {cards.playerA.map((c, i) => <span key={i}><img src={getCardImage(c)} /></span>)}
                                </div>
                            </div>
                            <div className="col-12 col-md-6 text-right">
                                <div className={`dealer-name playerb`}>Player B</div>
                                <div className="mt-1">
                                    {cards.playerB.map((c, i) => <span key={i}><img src={getCardImage(c)} /></span>)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PLAYER B BOX */}
                    <div className="playerbbox">
                        <div className="casino-box-row playerbfabcy">
                            <div className="casino-nation-name">
                                <b>Player B</b>
                            </div>
                            <div className="casino-bl-box">
                                {renderOddBox(playerBMain, true, "Player B Main")}
                                {renderOddBox(playerBMain, false, "Player B Main")}
                            </div>
                            <div className="casino-nation-name text-center w-100">{renderExposure(playerBMain.sid)}</div>
                        </div>
                        {/* Player B Bonus */}
                        <div className="casino-box poker1dayother mt-2">
                            <div className="casino-bl-box">
                                {playerBBonus.map((m, idx) => (
                                    <div
                                        key={m.sid}
                                        className={`casino-bl-box-item back ${m.gstatus === "SUSPENDED" ? "suspended" : ""}`}
                                        onClick={() => handleOddsClick(m.nat, m.b1, m, true)}
                                    >
                                        <span className="casino-box-odd">{getCardsBonusName(idx)}</span>
                                        {renderExposure(m.sid)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>


                <div className="casino-remark mt-1">
                    <div className="remark-icon"><img src="https://wver.sprintstaticdata.com/v65/static/front/img/icons/remark.png" /></div>
                    <marquee>{currentGame?.remark || "Play & Win"}</marquee>
                </div>

            </div>
        </>
    );
};

export default PokerOneDay;
