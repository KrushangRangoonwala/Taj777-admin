import React, { useState, useEffect } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getValueAfterDot, getIsSuspended, getImage } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import LastResult from "./components/LastResult";

const CasinoWar = ({ onBetSelection }) => {
    const { game_type, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [lastResults, setLastResults] = useState([]);
    const [activeTab, setActiveTab] = useState(1);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);

    const socket = useSocket("casino");
    // ... existing useEffect ...
    useEffect(() => {
        if (!socket) return;

        const handleData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[1] || data[0] : data;
                if (payload) {
                    setGameData(payload);
                    if (payload.res) {
                        setLastResults(payload.res);
                    } else if (payload.last_results) {
                        setLastResults(payload.last_results);
                    }
                }
            } catch (error) {
                console.error("Error processing Casino War data:", error);
            }
        };

        const handleResult = (data) => {
            try {
                const payload = Array.isArray(data) ? data[1] || data[0] : data;
                if (payload?.res) {
                    setLastResults(payload.res);
                }
            } catch (error) {
                console.error("Error processing Casino War result:", error);
            }
        };

        const handleConnect = () => {
            console.log(`✅ ${game_type} Connected:`, socket.id);
            socket.emit("Room", "war");
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on("game", handleData);
        socket.on("war", handleData);
        socket.on("gameResult", handleResult);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleData);
            socket.off("war", handleData);
            socket.off("gameResult", handleResult);
        };
    }, [socket, game_type]);

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const getMarketByNat = (nat) => marketData.find((m) => m.nat === nat);

    const handleOddsClick = (marketName, odds, market, isBack) => {
        if (!market || getIsSuspended(market) || odds == 0) return;

        const min = market?.min || 100;
        const max = market?.max || 100000;

        if (onBetSelection) {
            onBetSelection({
                teamName: marketName,
                odds: odds,
                minBet: min,
                maxBet: max,
                isBack,
                marketId: market.sid,
                eventId: getValueAfterDot(currentGame?.mid),
            });
        }
    };

    const BetBox = ({ label, colIndex, className = "", children, type = "back" }) => {
        const nat = `${label} ${colIndex}`;
        const market = getMarketByNat(nat);
        const suspended = getIsSuspended(market);
        const odds = suspended ? 0 : (type === "back" ? market?.b1 : market?.l1);

        return (
            <div className={`casino-bl-box ${suspended ? "suspended" : ""}`}>
                <div
                    className={`${className}`}
                    onClick={() => handleOddsClick(nat, odds, market, type === "back")}
                    style={{ position: "relative" }}
                >
                    {suspended && (
                        <img
                            src="/assets/images/lock.svg"
                            alt="lock"
                            style={{ width: "15px", height: "15px", filter: "brightness(0)", zIndex: 10, position: "absolute", left: "calc(50% - 7px)", top: "calc(50% - 7px)" }}
                        />
                    )}
                    {children(odds)}
                </div>
            </div>
        );
    };

    const Cards = () => (
        <>
            {currentGame?.C7 && currentGame?.C7 !== "1" && (
                <div>
                    <div className="dealer-name w-100 mb-1">Player</div>
                    <span>
                        <img src={getImage(currentGame.C7, result_image)} alt="War Card" />
                    </span>
                </div>
            )}
        </>
    );

    const renderCardRow = () => (
        <div className="casino-box-row">
            <div className="casino-nation-name no-border"></div>
            {[1, 2, 3, 4, 5, 6].map((i) => {
                const cardKey = `C${i}`;
                const card = currentGame?.[cardKey];
                return (
                    <div className="casino-bl-box" key={i}>
                        <div className="casino-bl-box-item casino-card-img">
                            <span data-v-b64efdfa="">
                                <img
                                    src={card && card !== "1" ? getImage(card, result_image) : getImage(1, result_image)}
                                    alt={`Card ${i}`}
                                />
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderHeaderRow = () => (
        <div className="casino-box-row casino-war-title">
            <div className="casino-nation-name no-border"></div>
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div className="casino-bl-box" key={i}>
                    <div className="casino-bl-box-item">
                        <b>{i}</b>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderMarketRow = (label, iconContent = null, rangeId = "0", rangeMin = "100", rangeMax = "1L") => (
        <div className="casino-box-row mb-4">
            <div className="casino-nation-name" style={{ textTransform: "none" }}>
                {iconContent || <b>{label}</b>}
                <div className="float-right">
                    <i data-toggle="collapse" data-target={`#minmaxinfo${rangeId}`} className="fas fa-info-circle"></i>
                    <div id={`minmaxinfo${rangeId}`} className="collapse icon-range">
                        R:<span>{rangeMin}</span>-<span>{rangeMax}</span>
                    </div>
                </div>
            </div>
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <BetBox key={i} label={label} colIndex={i} className="back casino-bl-box-item">
                    {(odds) => (
                        <>
                            <span className="casino-box-odd">{odds || 0}</span>
                            <span className="casino-book book-black">0</span>
                        </>
                    )}
                </BetBox>
            ))}
        </div>
    );

    const renderMobileMarketRow = (label, iconContent = null, rangeId = "0", rangeMin = "100", rangeMax = "1L") => (
        <div className="casino-box-row">
            <div className="casino-nation-name">
                {iconContent || <b>{label} {activeTab}</b>}
                <div className="float-right">
                    <i data-toggle="collapse" data-target={`#demo-${rangeId}`} className="fas fa-info-circle"></i>
                    <div id={`demo-${rangeId}`} className="collapse icon-range">
                        R:<span>{rangeMin}</span>-<span>{rangeMax}</span>
                    </div>
                </div>
            </div>
            <BetBox label={label} colIndex={activeTab} className="back casino-bl-box-item">
                {(odds) => (
                    <>
                        <span className="casino-box-odd">{odds || 0}</span>
                        <span className="book-black">0</span>
                    </>
                )}
            </BetBox>
        </div>
    );

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table casino-war">
                            <CasinoVideo
                                gameName="Casino War"
                                roundId={currentGame?.mid}
                                videoSrc={iframe_url}
                                results={lastResults}
                                timeLeft={currentGame?.autotime || 0}
                                totalTime={currentGame?.ft || 30}
                                isCardDrawerOpen={isCardDrawerOpen}
                                setIsCardDrawerOpen={setIsCardDrawerOpen}
                                CardsComponent={Cards}
                                resultPath="war"
                                drawerStyle={{
                                    top: "80px",
                                    transform: "unset",
                                    width: "45px",
                                    padding: "5px 10px 5px 5px",
                                    height: "65px",
                                }}
                            />

                            <div className="casino-detail">
                                {/* Desktop View */}
                                <div className="teen1daycasino-container d-none-small">
                                    <div className="casino-war-container">
                                        {renderCardRow()}
                                        {renderHeaderRow()}
                                        {renderMarketRow("Winner", null, "0", "100", "1L")}
                                        {renderMarketRow("Black", (
                                            <span>
                                                <img src="/assets/cards_new/spade.png" alt="S" style={{ width: "30px" }} />
                                                <img src="/assets/cards_new/club.png" alt="C" style={{ width: "30px" }} />
                                            </span>
                                        ), "1", "100", "25K")}
                                        {renderMarketRow("Red", (
                                            <span>
                                                <img src="/assets/cards_new/heart.png" alt="H" style={{ width: "30px" }} />
                                                <img src="/assets/cards_new/diamond.png" alt="D" style={{ width: "30px" }} />
                                            </span>
                                        ), "2", "100", "25K")}
                                        {renderMarketRow("Odd", null, "3", "100", "25K")}
                                        {renderMarketRow("Even", null, "4", "100", "25K")}
                                        {renderMarketRow("Spade", (
                                            <span>
                                                <img src="/assets/cards_new/spade.png" alt="S" style={{ width: "30px" }} />
                                            </span>
                                        ), "5", "100", "25K")}
                                        {renderMarketRow("Club", (
                                            <span>
                                                <img src="/assets/cards_new/club.png" alt="C" style={{ width: "30px" }} />
                                            </span>
                                        ), "6", "100", "25K")}
                                        {renderMarketRow("Heart", (
                                            <span>
                                                <img src="/assets/cards_new/heart.png" alt="H" style={{ width: "30px" }} />
                                            </span>
                                        ), "7", "100", "25K")}
                                        {renderMarketRow("Diamond", (
                                            <span>
                                                <img src="/assets/cards_new/diamond.png" alt="D" style={{ width: "30px" }} />
                                            </span>
                                        ), "8", "100", "25K")}
                                    </div>
                                </div>

                                {/* Mobile View */}
                                <div className="teen1daycasino-container d-none-big">
                                    <div className="casino-war-container casino-war-cards">
                                        <div className="casino-box-row">
                                            {[1, 2, 3, 4, 5, 6].map((i) => {
                                                const cardKey = `C${i}`;
                                                const card = currentGame?.[cardKey];
                                                return (
                                                    <div className="casino-bl-box" key={i}>
                                                        <div className="casino-bl-box-item casino-card-img">
                                                            <span data-v-b64efdfa="">
                                                                <img
                                                                    src={card && card !== "1" ? getImage(card, result_image) : getImage(1, result_image)}
                                                                    alt={`Card ${i}`}
                                                                />
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="casino-tabs">
                                        <ul className="nav nav-tabs">
                                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                                <li className="nav-item" key={i}>
                                                    <a
                                                        href={`#tab${i}`}
                                                        data-toggle="tab"
                                                        className={`nav-link ${activeTab === i ? "active" : ""}`}
                                                        onClick={() => setActiveTab(i)}
                                                    >
                                                        {i}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="tab-content w-100">
                                        <div className="tab-pane active">
                                            <div className="teen1daycasino-container">
                                                <div className="teen1dayleft">
                                                    <div className="casino-war-container">
                                                        {renderMobileMarketRow("Winner", null, "0", "100", "1L")}
                                                        {renderMobileMarketRow("Black", (
                                                            <span>
                                                                <img src="/assets/cards_new/spade.png" alt="S" style={{ width: "30px" }} />
                                                                <img src="/assets/cards_new/club.png" alt="C" style={{ width: "30px" }} />
                                                            </span>
                                                        ), "1", "100", "25K")}
                                                        {renderMobileMarketRow("Red", (
                                                            <span>
                                                                <img src="/assets/cards_new/heart.png" alt="H" style={{ width: "30px" }} />
                                                                <img src="/assets/cards_new/diamond.png" alt="D" style={{ width: "30px" }} />
                                                            </span>
                                                        ), "2", "100", "25K")}
                                                        {renderMobileMarketRow("Odd", null, "3", "100", "25K")}
                                                        {renderMobileMarketRow("Even", null, "4", "100", "25K")}
                                                    </div>
                                                </div>
                                                <div className="teen1daycenter"></div>
                                                <div className="teen1dayright">
                                                    <div className="casino-war-container">
                                                        {renderMobileMarketRow("Spade", (
                                                            <span>
                                                                <img src="/assets/cards_new/spade.png" alt="S" style={{ width: "30px" }} />
                                                            </span>
                                                        ), "5", "100", "25K")}
                                                        {renderMobileMarketRow("Heart", (
                                                            <span>
                                                                <img src="/assets/cards_new/heart.png" alt="H" style={{ width: "30px" }} />
                                                            </span>
                                                        ), "6", "100", "25K")}
                                                        {renderMobileMarketRow("Club", (
                                                            <span>
                                                                <img src="/assets/cards_new/club.png" alt="C" style={{ width: "30px" }} />
                                                            </span>
                                                        ), "7", "100", "25K")}
                                                        {renderMobileMarketRow("Diamond", (
                                                            <span>
                                                                <img src="/assets/cards_new/diamond.png" alt="D" style={{ width: "30px" }} />
                                                            </span>
                                                        ), "8", "100", "25K")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <LastResult results={lastResults} resultPath="war" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <CasinoRightSidebar />
            </div>
        </div>
    );
};

export default CasinoWar;
