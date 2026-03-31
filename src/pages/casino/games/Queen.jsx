import React, { useState, useEffect } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getValueAfterDot, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import LastResult from "./components/LastResult";


const Queen = ({ onBetSelection }) => {
    const { game_type, phpFile, game_name, iframe_url } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [lastResults, setLastResults] = useState([]);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);

    const socket = useSocket("casino");
    useEffect(() => {
        if (!socket) return;

        const handleData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) {
                    setGameData(payload);
                    if (payload.last_results) {
                        const formattedResults = payload.last_results.map(r => ({
                            mid: r.mid,
                            res: r.win // Queen usually uses numbers 0-3
                        }));
                        setLastResults(formattedResults);
                    }
                }
            } catch (error) {
                console.error("Error processing Queen data:", error);
            }
        };

        const handleConnect = () => {
            socket.emit("Room", game_type || "queen");
        };

        const handleResults = (data) => {
            try {
                const payload = Array.isArray(data) ? data[1] : data;
                if (payload?.res) {
                    const formattedResults = payload.res.map(r => ({
                        mid: r.mid,
                        res: r.win
                    }));
                    setLastResults(formattedResults);
                }
            } catch (error) {
                console.error("Error processing Queen results:", error);
            }
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on("game", handleData);
        socket.on(game_type || "queen", handleData);
        socket.on("gameResult", handleResults);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleData);
            socket.off(game_type || "queen", handleData);
            socket.off("gameResult", handleResults);
        };
    }, [socket, game_type]);

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const getMarketByNat = (nat) => marketData.find((item) => item.nat === nat);

    const handleBet = (market, teamName, isBack = true) => {
        if (!market || getIsSuspended(market)) return;

        const odds = isBack ? market.b1 : market.l1;
        if (!odds || odds == 0) return;

        if (onBetSelection) {
            onBetSelection({
                teamName,
                odds,
                minBet: market.min || 100,
                maxBet: market.max || 100000,
                isBack,
                marketId: market.sid,
                eventId: getValueAfterDot(currentGame?.mid),
            });
        }
    };

    const formatBetLimit = (value) => {
        if (!value) return "0";
        const num = Number(value);
        if (num >= 100000) return (num / 100000) + "L";
        if (num >= 1000) return (num / 1000) + "K";
        return num.toString();
    };

    const VideoCards = () => {
        const rdesc = currentGame?.rdesc || "";
        const allCards = rdesc.split(",").filter((c) => c && c !== "" && c !== "1");

        const getCardValue = (card) => {
            if (!card) return 0;
            const rank = card.length === 3 ? card.slice(0, 2) : card.slice(0, 1);
            if (rank === "Q") return 0; // handled by hasQueen
            const val = parseInt(rank);
            return isNaN(val) ? 0 : val;
        };

        const getCardsForPosition = (pos) => {
            const cards = [];
            for (let i = 0; i < 4; i++) {
                const cardIndex = pos + i * 4;
                if (allCards[cardIndex]) {
                    cards.push(allCards[cardIndex]);
                }
            }
            return cards;
        };

        const rowData = [0, 1, 2, 3].map((pos) => {
            const cards = getCardsForPosition(pos);
            const sum = cards.reduce((s, c) => s + getCardValue(c), 0);
            const hasQueen = cards.some((c) => c.toUpperCase().startsWith("Q"));
            const calculatedTotal = sum + pos;
            return {
                pos,
                cards,
                hasQueen,
                calculatedTotal,
                winPriority: hasQueen ? 1000 : (cards.length > 0 ? calculatedTotal : -1),
            };
        });

        const maxPriority = Math.max(...rowData.map((r) => r.winPriority));

        return (
            <div className="casino-video-cards-container">
                {rowData.map((row) => {
                    const isMax = row.winPriority === maxPriority && maxPriority >= 0;
                    return (
                        <div key={row.pos} style={{ flexDirection: 'column' }}>
                            <div className="dealer-name w-100 mb-1">
                                <span className={isMax ? "text-success" : ""}>Total {row.pos}:</span>
                                <span className="text-warning ml-1">
                                    {row.hasQueen ? "Q" : row.cards.length > 0 ? row.calculatedTotal : "0"}
                                </span>
                            </div>
                            <div>
                                {row.cards.map((card, idx) => (
                                    <span key={idx} data-v-b64efdfa="">
                                        <img data-v-b64efdfa="" src={getImage(card, 'cards_new')} alt={card} />
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const RenderBetBox = ({ nat, type = "back", showLock = false }) => {
        const market = getMarketByNat(nat);
        const suspended = getIsSuspended(market);
        const odds = type === "back" ? market?.b1 : market?.l1;
        const isLocked = !market || !odds || odds == 0;

        return (
            <div
                className={`${type} casino-bl-box-item ${suspended || isLocked ? "suspended" : ""}`}
                onClick={() => !isLocked && !suspended && handleBet(market, nat, type === "back")}
                {...(type === "back" ? { "data-toggle": "modal", "data-target": "#casino-betslip" } : {})}
                style={{ position: 'relative' }}
            >
                {showLock && suspended && (
                    <img
                        src="/assets/images/lock.svg"
                        alt="lock"
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '15px',
                            height: '15px',
                            zIndex: 10
                        }}
                    />
                )}
                <span className="casino-box-odd">
                    {suspended || isLocked ? "0" : odds}
                </span>
            </div>
        );
    };

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table casino-queen">
                                <CasinoVideo
                                    gameName={game_name}
                                    roundId={currentGame?.mid}
                                    videoSrc={iframe_url}
                                    results={lastResults}
                                    timeLeft={currentGame?.autotime || 0}
                                    totalTime={currentGame?.ft || 30}
                                    isCardDrawerOpen={isCardDrawerOpen}
                                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                                    cards={(currentGame?.rdesc || "").split(",").filter(c => c && c !== "")}
                                    CardsComponent={VideoCards}
                                    resultPath={phpFile}
                                />
                                <div className="casino-detail">
                                    {/* Desktop View */}
                                    <div className="row d-none-small">
                                        {[0, 1, 2, 3].map(num => {
                                            const nat = `Total ${num}`;
                                            const market = getMarketByNat(nat);
                                            const suspended = getIsSuspended(market);
                                            return (
                                                <div className="col-3" key={num}>
                                                    <div className="casino-box-row">
                                                        <div className="casino-nation-name"><b>{nat}</b></div>
                                                        <div className="casino-bl-box" style={{ position: 'relative' }}>
                                                            {suspended && (
                                                                <img
                                                                    src="/assets/images/lock.svg"
                                                                    alt="lock"
                                                                    style={{
                                                                        position: 'absolute',
                                                                        top: '50%',
                                                                        left: '50%',
                                                                        transform: 'translate(-50%, -50%)',
                                                                        width: '15px',
                                                                        height: '15px',
                                                                        zIndex: 10
                                                                    }}
                                                                />
                                                            )}
                                                            <RenderBetBox nat={nat} type="back" />
                                                            <RenderBetBox nat={nat} type="lay" />
                                                        </div>
                                                        <div className="casino-nation-name">
                                                            <span className="casino-book book-black">0</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Mobile View */}
                                    <div className="row row5 d-none-big">
                                        {[0, 1, 2, 3].map(num => {
                                            const nat = `Total ${num}`;
                                            const market = getMarketByNat(nat);
                                            const suspended = getIsSuspended(market);
                                            return (
                                                <div className="casino-bl-box" key={num}>
                                                    <div className="casino-bl-box-item casino-odds-name">
                                                        <b>{nat}</b> <span className="float-right book-black">0</span>
                                                    </div>
                                                    <RenderBetBox nat={nat} type="back" showLock={true} />
                                                    <RenderBetBox nat={nat} type="lay" showLock={true} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="col-12 text-right casino-min-max">
                                        R:<span>{getMarketByNat("Total 0")?.min || 100}</span>-<span>{formatBetLimit(getMarketByNat("Total 0")?.max) || "3L"}</span>
                                    </div>

                                    <div className="casino-remark mt-3">
                                        <div className="remark-icon">
                                            <img
                                                src="https://wver.sprintstaticdata.com/v209/static/front/img/icons/remark.png"
                                                alt="remark"
                                            />
                                        </div>
                                        <marquee>{currentGame?.ramark || "This is 21 cards game 2,3,4,5,6 x 4 =20 and 1 Queen. Minimum total 10 or queen is required to win."}</marquee>
                                    </div>

                                    <LastResult
                                        results={lastResults}
                                        gameName={game_name}
                                        resultPath={phpFile}
                                        className="d-none-big"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <CasinoRightSidebar />
                </div>
            </div>
        </div>
    );
};

export default Queen;
