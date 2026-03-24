import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { fetchCasinoExposureApi } from "../../api/api";
import useIsMobile from "../../hooks/useIsMobile";
import "./kk.css";
import CasinoVideo from "./components/CasinoVideo";

const getCardImage = (cardCode) => {
    const baseUrl = "https://wver.sprintstaticdata.com/v67/static/front/img/cards";
    if (!cardCode || cardCode === "1")
        return "https://wver.sprintstaticdata.com/v67/static/front/img/cards/1.png";

    return `${baseUrl}/${cardCode}.png`;
};

const Poker6Player = ({ isVisible, onBetSelection, lastBetTime }) => {
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [exposureData, setExposureData] = useState([]);
    const socketRef = useRef(null);
    const isMobile = useIsMobile();
    const isLargerMobile = useIsMobile(767);
    const [tabIdx, setTabIdx] = useState(0);

    useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.[0]?.mid) return;
            try {
                const response = await fetchCasinoExposureApi({
                    markettype: "6_PLAYER_POKER",
                    main_event_id: gameData.t1[0].mid,
                    curPageName: "live_6player_poker.php",
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
        const market = exposureData.find((item) => item.market_id == marketId);
        return market ? market.win_loss || market.total_exposure : 0;
    };

    const renderExposure = (marketId) => {
        const exposure = getExposure(marketId);
        if (exposure === 0) return null;
        return (<span className={`w-100 ${exposure >= 0 ? "book-green" : "book-red"}`}>{exposure}</span>)
    };

    useEffect(() => {
        const socket = io("https://trubet9.bet:2053", {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

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

        socket.on("connect", () => {
            console.log("✅ Poker6 Connected:", socket.id);
            socket.emit("Room", "poker6");
        });

        socket.on("poker6", handleBollywoodData);
        socket.on("game", handleBollywoodData);

        socket.on("disconnect", (reason) => {
            console.log("⚠️ Poker6 Disconnected:", reason);
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
    const data = gameData?.t2 || [];

    const winner = currentGame?.desc?.split("||");
    // const winner = "Player 6 Won  ||  Pattern : Two pairs".split("||");

    const handleOddsClick = (marketName, odds, market, isBack) => {
        if (!market) return;

        const min = market?.min || 100;
        const max = market?.max || 300000;

        if (onBetSelection) {
            onBetSelection({
                teamName: marketName,
                odds: odds,
                minBet: min,
                maxBet: max,
                isBack,
                marketId: market.sid,
                eventId: currentGame?.mid,
            });
        }
    };

    // Card Mappings for Players
    const playerCards = [
        { name: "Player 1", c1: currentGame?.C1, c2: currentGame?.C7, sid: 11 },
        { name: "Player 2", c2: currentGame?.C2, c2_2: currentGame?.C8, sid: 12 },
        { name: "Player 3", c3: currentGame?.C3, c3_2: currentGame?.C9, sid: 13 },
        { name: "Player 4", c4: currentGame?.C4, c4_2: currentGame?.C10, sid: 14 },
        { name: "Player 5", c5: currentGame?.C5, c5_2: currentGame?.C11, sid: 15 },
        { name: "Player 6", c6: currentGame?.C6, c6_2: currentGame?.C12, sid: 16 },
    ];

    // Helper to get card info for a specific player index (0-indexed)
    const getPlayerCardInfo = (index) => {
        const p1 = currentGame?.[`C${index + 1}`];
        const p2 = currentGame?.[`C${index + 7}`];
        const market = data.find(m => m.sid === (11 + index));
        return { p1, p2, market };
    };

    const communityCards = [
        currentGame?.C13,
        currentGame?.C14,
        currentGame?.C15,
        currentGame?.C16,
        currentGame?.C17,
    ];

    const getPatternMarket = (sid) => data.find(m => m.sid === sid);

    function VideoCards() {
        return (
            <div>
                {communityCards.map((card, idx) => (
                    <span key={`community-${idx}`}>
                        <img src={getCardImage(card)} alt="card" />
                    </span>
                ))}
            </div>
        )
    }

    return (
        <>
            <div className="casino-table poker6player kk">

                <CasinoVideo
                    gameName="Poker 6 Players"
                    roundId={currentGame?.mid}
                    videoSrc="/mediaplayer/poker6/95bba40e-0623-4fe3-a007-0b71f467e211"
                    isCardDrawerOpen={isCardDrawerOpen}
                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                    autotime={currentGame?.autotime}
                    totalTime={currentGame?.ft} CardsComponent={VideoCards}
                    cards={communityCards}
                />


                <div className="casino-detail">

                    {winner?.length > 1 &&
                        < div className="poker-result-board">
                            <div className="d-inline-block">
                                <div className="d-inline-block"><span>{winner[0]}</span></div>
                            </div>
                            <div className="d-inline-block ml-2"><b>{winner[1]}</b></div>
                        </div>}

                    {isLargerMobile &&
                        <div className="casino-tabs">
                            <ul className="nav nav-tabs">
                                <li className="nav-item">
                                    <a data-toggle="tab" onClick={() => setTabIdx(0)} className={`nav-link ${tabIdx === 0 ? 'active' : ''}`}>Hands</a>
                                </li>
                                <li className="nav-item">
                                    <a data-toggle="tab" onClick={() => setTabIdx(1)} className={`nav-link ${tabIdx === 1 ? 'active' : ''}`}>Pattern</a>
                                </li>
                            </ul>
                        </div>}

                    <div className="">
                        <div className="casino-box">
                            <div className="teen1daycasino-container">
                                {(!isLargerMobile || tabIdx === 0) && (
                                    <div className="teen1dayleft hands">
                                        {!isLargerMobile && <h4 className="playera">Hands</h4>}
                                        <div className="casino-row-container2">
                                            {[...Array(6)].map((_, i) => {
                                                const { p1, p2, market } = getPlayerCardInfo(i);
                                                const isSuspended = market?.gstatus === "SUSPENDED" || market?.gstatus === "suspended";
                                                return (
                                                    <div key={`player-${i + 1}`} className="casino-col-container">
                                                        <div className="casino-box-row">
                                                            <div className="w-100 mb-1 pr"><b>Player {i + 1}</b></div>
                                                            <div
                                                                className={`poker6box ${isSuspended ? "suspended" : ""}`}
                                                                onClick={() => !isSuspended && handleOddsClick(`Player ${i + 1}`, market?.rate, market, true)}
                                                            >
                                                                <div className="casino-nation-name">
                                                                    <div>
                                                                        <span className="player-card">
                                                                            <span><img src={getCardImage(p1)} alt="card" /></span>
                                                                        </span>
                                                                        <span className="player-card">
                                                                            <span><img src={getCardImage(p2)} alt="card" /></span>
                                                                        </span>
                                                                    </div>
                                                                    <span className="float-right mr-1 flex-odds">
                                                                        <b className="d-block text-right">
                                                                            {market?.rate || 0}
                                                                        </b>
                                                                        {renderExposure(market?.sid)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="teen1daycenter"></div>

                                {(!isLargerMobile || tabIdx === 1) && (
                                    <div className="teen1dayright pattern">
                                        {!isLargerMobile && <h4>Pattern</h4>}
                                        <div className="casino-row-container2 pattern">
                                            {[
                                                { name: "High Card", sid: 21 },
                                                { name: "Pair", sid: 22 },
                                                { name: "Two Pair", sid: 23 },
                                                { name: "Three of a Kind", sid: 24 },
                                                { name: "Straight", sid: 25 },
                                                { name: "Flush", sid: 26 },
                                                { name: "Full House", sid: 27 },
                                                { name: "Four of a Kind", sid: 28 },
                                                { name: "Straight Flush", sid: 29 },
                                            ].map((pattern) => {
                                                const market = getPatternMarket(pattern.sid);
                                                const isSuspended = market?.gstatus === "SUSPENDED" || market?.gstatus === "suspended";
                                                const isFullBox = [27, 28, 29].includes(pattern.sid);
                                                return (
                                                    <div key={`pattern-${pattern.sid}`} className={`casino-col-container ${isFullBox ? "fullbox" : ""}`}>
                                                        <div className="casino-box-row">
                                                            <div
                                                                className={`poker6box ${isSuspended ? "suspended" : ""}`}
                                                                onClick={() => !isSuspended && handleOddsClick(pattern.name, market?.rate, market, true)}
                                                            >
                                                                <div className="casino-nation-name">
                                                                    <div><b>{pattern.name}</b></div>
                                                                    <div className="flex-odds">
                                                                        <span className="d-block text-right">
                                                                            <b className="d-block w-100">{market?.rate || 0}</b>
                                                                            {renderExposure(pattern.sid)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="casino-remark mt-1">
                        <div className="remark-icon"><img src="https://wver.sprintstaticdata.com/v65/static/front/img/icons/remark.png" /></div>
                        <marquee>{currentGame?.remark || " "}</marquee>
                    </div>
                </div>
            </div >
        </>
    );
};

export default Poker6Player;
