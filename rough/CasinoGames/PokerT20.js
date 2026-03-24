import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { fetchCasinoExposureApi } from "../../api/api";
import useIsMobile from "../../hooks/useIsMobile";
import "./kk.css";
import "./pokerT20.css";
import CasinoVideo from "./components/CasinoVideo";

// Helper function to get card image URL
const getCardImage = (cardCode) => {
    if (!cardCode || cardCode === "1")
        return "https://wver.sprintstaticdata.com/v67/static/front/img/cards/1.png";

    const baseUrl = "https://wver.sprintstaticdata.com/v67/static/front/img/cards";
    return `${baseUrl}/${cardCode}.png`;
};

const PokerT20 = ({ isVisible, onBetSelection, lastBetTime }) => {
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [exposureData, setExposureData] = useState([]);
    const socketRef = useRef(null);
    const isMobile = useIsMobile(768);

    useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.[0]?.mid) return;
            try {
                const response = await fetchCasinoExposureApi({
                    markettype: "2020_POKER",
                    main_event_id: gameData.t1[0].mid,
                    curPageName: "live_20poker.php",
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
        return (
            <span className={`${exposure >= 0 ? "book-green" : "book-red"} `}>
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
            console.log("✅ PokerT20 Connected:", socket.id);
            socket.emit("Room", "poker20");
        });

        socket.on("poker20", handleBollywoodData);
        socket.on("game", handleBollywoodData);

        socket.on("disconnect", (reason) => {
            console.log("⚠️ PokerT20 Disconnected:", reason);
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

    // Filter and chunk data for Player A and Player B
    const playerAOptions = data.filter(opt => opt.sid >= 11 && opt.sid <= 19);
    const playerBOptions = data.filter(opt => opt.sid >= 21 && opt.sid <= 29);

    const chunkArray = (arr, size) => {
        const result = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    };

    const playerARows = chunkArray(playerAOptions, 3);
    const playerBRows = chunkArray(playerBOptions, 3);

    const cards = {
        playerA: [currentGame?.C1, currentGame?.C2],
        playerB: [currentGame?.C3, currentGame?.C4],
        board: [currentGame?.C5, currentGame?.C6, currentGame?.C7, currentGame?.C8, currentGame?.C9]
    };



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



    const renderMarketBox = (opt, playerPrefix) => {
        if (!opt) return null;
        const rate = opt?.rate || 0;
        const isSuspended = opt?.gstatus === "SUSPENDED" || opt?.gstatus === "suspended" || rate === 0 || rate === "0";

        return (
            <div
                key={opt.sid}
                className={`back casino-bl-box-item ${isSuspended ? "suspended" : ""} ${getExposure(opt.sid) ? "lock-top" : ""}`}
                onClick={() => !isSuspended && handleOddsClick(`${opt.nat} ${playerPrefix}`, rate, opt, true)}
                style={{ cursor: isSuspended ? "default" : "pointer" }}
            >
                <span className="casino-box-odd">
                    {isSuspended ? <i className="fas fa-lock"></i> : rate}
                </span>
                <span>{renderExposure(opt.sid)}</span>
            </div>
        );
    };

    return (
        <>
            <div className="casino-table poker20 kk">
                <CasinoVideo
                    gameName="20-20 Poker"
                    roundId={currentGame?.mid}
                    videoSrc="/mediaplayer/poker20/27dfde2a-f97d-44a7-a329-bacc8aac8491"
                    isCardDrawerOpen={isCardDrawerOpen}
                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                    autotime={currentGame?.autotime}
                    totalTime={currentGame?.ft} cards={[...cards.playerA, ...cards.playerB, ...cards.board]}
                    CardsComponent={() => (
                        <>
                            <div className="playeracards">
                                <div className="dealer-name w-100 mb-1">Player A</div>
                                <div className="d-flex">
                                    {cards.playerA.map((card, idx) => (
                                        <span key={`a-${idx}`}>
                                            <img src={getCardImage(card)} alt="card" />
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="playerbcards">
                                <div className="dealer-name w-100 mb-1">Player B</div>
                                <div className="d-flex">
                                    {cards.playerB.map((card, idx) => (
                                        <span key={`b-${idx}`}>
                                            <img src={getCardImage(card)} alt="card" />
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="playerboardcards">
                                <div className="dealer-name w-100 mb-1">Board</div>
                                <div className="d-flex">
                                    {cards.board.map((card, idx) => (
                                        <span key={`board-${idx}`}>
                                            <img src={getCardImage(card)} alt="card" />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                />

                <div className="casino-detail">
                    {isMobile ? (
                        <div className="poker20casino-container d-none-big">
                            {/* HEADER */}
                            <div className="casino-bl-box casino-bl-box-title">
                                <div className="casino-bl-box-item"></div>

                                <div className="casino-bl-box-item playera">
                                    Player A
                                </div>

                                <div className="casino-bl-box-item playerb">
                                    Player B
                                </div>
                            </div>

                            {/* ROWS */}
                            {playerAOptions.map((optA, index) => {
                                const optB = playerBOptions[index];

                                return (
                                    <div key={`casino-row-${index}`} className="casino-bl-box">
                                        {/* Market Name */}
                                        <div className="casino-bl-box-item casino-odds-name">
                                            <span>{optA?.nat || ""}</span>
                                            {/* <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <span style={{ position: 'relative', top: '-7px', lineHeight: '1px' }}>{renderExposure(optA.sid)}</span>
                                                <span style={{ position: 'relative', bottom: '-7px', lineHeight: '1px' }}>{renderExposure(optB.sid)}</span>
                                            </div> */}
                                        </div>

                                        {/* Player A */}
                                        {/* <div className="back casino-bl-box-item"> */}
                                        {renderMarketBox(optA, "A")}
                                        {/* </div> */}

                                        {/* Player B */}
                                        {/* <div className="back casino-bl-box-item"> */}
                                        {renderMarketBox(optB, "B")}
                                        {/* </div> */}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="poker20casino-container">
                            {/* <div className="poker20casino-container d-none-small"> */}
                            <div className="poker20left">
                                {/* <div
                                className="dealer-name text-center w-100 mb-2"
                                style={{ background: "rgba(0,0,0,0.5)", color: "white", padding: "2px" }}
                            >
                                Player A
                            </div> */}
                                {playerARows.map((row, rowIndex) => (
                                    <div key={`row-a-${rowIndex}`} className={rowIndex > 0 ? "mt-1" : ""}>
                                        <div className="casino-bl-box casino-bl-box-title">
                                            {row.map(opt => (
                                                <div key={`title-a-${opt.sid}`} className="casino-bl-box-item">
                                                    <span>{opt.nat} {renderExposure(opt.sid)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="casino-bl-box">
                                            {row.map(opt => renderMarketBox(opt, "A"))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="poker20center"></div>

                            <div className="poker20right">
                                {/* <div
                                className="dealer-name text-center w-100 mb-2"
                                style={{ background: "rgba(0,0,0,0.5)", color: "white", padding: "2px" }}
                            >
                                Player B
                            </div> */}
                                {playerBRows.map((row, rowIndex) => (
                                    <div key={`row-b-${rowIndex}`} className={rowIndex > 0 ? "mt-1" : ""}>
                                        <div className="casino-bl-box casino-bl-box-title">
                                            {row.map(opt => (
                                                <div key={`title-b-${opt.sid}`} className="casino-bl-box-item">
                                                    <span>{opt.nat} {renderExposure(opt.sid)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="casino-bl-box">
                                            {row.map(opt => renderMarketBox(opt, "B"))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div >
        </>
    );
};

export default PokerT20;

