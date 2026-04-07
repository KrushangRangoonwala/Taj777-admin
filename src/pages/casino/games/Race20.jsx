import React, { useState, useEffect, useMemo } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getValueAfterDot, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import BetLimitInfo2 from "./components/BetLimitInfo2";
import Result_parent from "./components/Result_parent";

const Race20 = ({ onBetSelection }) => {
    const { game_type, phpFile, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [resultMid, setResultMid] = useState(null);

    const socket = useSocket("casino");
    useEffect(() => {
        if (!socket) return;

        const handleData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) {
                    setGameData(prev => {
                        const newResults = payload.last_results || prev?.last_results || [];
                        return { ...prev, ...payload, last_results: newResults };
                    });
                }
            } catch (error) {
                console.error("Error processing Race20 data:", error);
            }
        };

        const handleConnect = () => {
            console.log(`✅ ${game_type || "race20"} Connected:`, socket.id);
            socket.emit("Room", game_type || "race20");
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on("game", handleData);
        socket.on(game_type || "race20", handleData);
        socket.on("gameResult", (data) => {
            const payload = Array.isArray(data) ? data[1] : data;
            if (payload?.res) {
                setGameData(prev => ({
                    ...prev,
                    last_results: payload.res
                }));
            }
        });

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleData);
            socket.off(game_type || "race20", handleData);
            socket.off("gameResult");
        };
    }, [socket, game_type]);

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const getRankValue = (card) => {
        if (!card || card === "1") return 0;
        const r = card.replace(/[SHDC]+$/i, "");
        if (r === "A") return 1;
        if (r === "J") return 11;
        if (r === "Q") return 12;
        if (r === "K") return 13;
        return parseInt(r) || 0;
    };

    const suits = ["S", "H", "C", "D"];
    const suitCardsData = useMemo(() => {
        if (!currentGame?.desc) return [[], [], [], []];
        const allCards = currentGame.desc.split(",").filter(c => c && c !== "1");

        return suits.map((suit) => {
            const suitOpenedCards = allCards.filter((card) =>
                card.endsWith(`${suit}${suit}`)
            );
            if (suitOpenedCards.length > 0) {
                if (!suitOpenedCards.some((c) => c.startsWith("K"))) {
                    return [...suitOpenedCards, `K${suit}${suit}`];
                }
            }
            return suitOpenedCards;
        });
    }, [currentGame?.desc]);

    const nonKCards = suitCardsData.flat().filter(card => !card.startsWith("K"));
    const totalCards = nonKCards.length;
    const totalPoints = nonKCards.reduce((sum, card) => sum + getRankValue(card), 0);

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


    const VideoCards = () => {
        const suitIcons = { S: "spade", H: "heart", C: "club", D: "diamond" };
        return (
            <div className="casino-video-cards-container">
                {suits.map((suit, index) => (
                    <div key={suit}>
                        <span>
                            <img src={getImage(suitIcons[suit], result_image)} alt={suit} />
                        </span>
                        {suitCardsData[index].map((card, idx) => (
                            <span key={idx} className={card.startsWith("K") ? "k-margin" : ""}>
                                <img src={getImage(card, result_image)} alt={card} />
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        );
    };

    const RenderBetBox = ({ nat, type = "back", showVolume = false }) => {
        const market = getMarketByNat(nat);
        const suspended = getIsSuspended(market);
        const odds = type === "back" ? market?.b1 : market?.l1;
        const volume = type === "back" ? market?.bs1 : market?.ls1;
        const isLocked = !market || !odds || odds == 0;

        return (
            <div
                className={`${type} casino-bl-box-item ${suspended || isLocked ? "suspended" : ""}`}
                onClick={() => !isLocked && !suspended && handleBet(market, nat, type === "back")}
            >
                {(suspended || isLocked) && (
                    <img
                        src="/assets/images/lock.svg"
                        alt="lock"
                        className="lock-icon"
                    />
                )}
                <span className="casino-box-odd">
                    {suspended || isLocked ? "0" : odds}
                </span>
                {showVolume && (
                    <span>{volume || 0}</span>
                )}
                {nat.startsWith("Win with") && (
                    <span className="book-black">0</span>
                )}
            </div>
        );
    };

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table race20">
                                <CasinoVideo
                                    gameName={game_name || "Race 20"}
                                    roundId={currentGame?.mid}
                                    videoSrc={iframe_url}
                                    results={gameData?.last_results || []}
                                    timeLeft={currentGame?.autotime || 0}
                                    totalTime={currentGame?.ft || 30}
                                    isCardDrawerOpen={isCardDrawerOpen}
                                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                                    CardsComponent={VideoCards}
                                    resultPath={phpFile}
                                    showLastResults={true}
                                    showImage={false}
                                />
                                <div className="casino-detail">
                                    {/* Desktop View */}
                                    <div className="d-none-small">
                                        <div className="row row5">
                                            {suits.map((suit, index) => {
                                                const marketNat = `K${suit}${suit}`;
                                                return (
                                                    <div className="col-6 col-md-3" key={suit}>
                                                        <div className="casino-box-row">
                                                            <div className="casino-nation-name">
                                                                <img src={getImage(marketNat, result_image)} alt={suit} />
                                                                <BetLimitInfo2 min={getMarketByNat(marketNat)?.min} max={getMarketByNat(marketNat)?.max} />
                                                            </div>
                                                            <div className="casino-bl-box">
                                                                <RenderBetBox nat={marketNat} type="back" />
                                                                <RenderBetBox nat={marketNat} type="lay" />
                                                            </div>
                                                            <div className="casino-nation-name book-black">0</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="row mt-2">
                                            <div className="col-12 col-md-4">
                                                {["Total points", "Total cards"].map((label, idx) => (
                                                    <div key={label}>
                                                        <div className="casino-yn">
                                                            <div></div>
                                                            <div className="casino-bl-box">
                                                                <div className="casino-bl-box-item yn-header"><b>No</b></div>
                                                                <div className="casino-bl-box-item yn-header"><b>Yes</b></div>
                                                            </div>
                                                        </div>
                                                        <div className="casino-odds-box casino-yn">
                                                            <div className="casino-odds-box-bhav">
                                                                <b>{label}</b>
                                                                <BetLimitInfo2 min={getMarketByNat(label)?.min} max={getMarketByNat(label)?.max} />
                                                            </div>
                                                            <div className="casino-bl-box">
                                                                <RenderBetBox nat={label} type="lay" showVolume={true} />
                                                                <RenderBetBox nat={label} type="back" showVolume={true} />
                                                            </div>
                                                        </div>
                                                        <div className="casino-yn">
                                                            <div></div>
                                                            <div className="casino-bl-box">
                                                                <div className="casino-nation-name book-black">0</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="col-12 col-md-8 win-with">
                                                <div className="row row5">
                                                    {[5, 6, 7].map((base) => (
                                                        <div className="col-4" key={base}>
                                                            {[base, base + 10].map((num) => (
                                                                <div className="casino-box-row" key={num}>
                                                                    <div className="casino-nation-name">
                                                                        <b>Win with {num}</b>
                                                                        <BetLimitInfo2 min={getMarketByNat(`Win with ${num}`)?.min} max={getMarketByNat(`Win with ${num}`)?.max} />
                                                                    </div>
                                                                    <div className="casino-bl-box">
                                                                        <RenderBetBox nat={`Win with ${num}`} type="back" />
                                                                    </div>
                                                                    <div className="casino-nation-name rf-minheight book-black">0</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile View */}
                                    <div className="d-none-big">
                                        <div className="total-points">
                                            <div><span>Total Cards:</span> <span className="text-playerb">{totalCards}</span></div>
                                            <div><span>Total Points:</span> <span className="text-playerb">{totalPoints}</span></div>
                                        </div>
                                        <div>
                                            <div className="casino-bl-box casino-bl-box-title">
                                                <div className="casino-bl-box-item casino-odds-name"></div>
                                                <div className="casino-bl-box-item">Back</div>
                                                <div className="casino-bl-box-item">Lay</div>
                                            </div>
                                            {suits.map((suit, index) => {
                                                const marketNat = `K${suit}${suit}`;
                                                return (
                                                    <div className="casino-bl-box" key={suit}>
                                                        <div data-toggle="modal" className="casino-bl-box-item casino-odds-name">
                                                            <img src={getImage(marketNat, result_image)} alt={suit} />
                                                            <span className="book-black">0</span>
                                                            <BetLimitInfo2 min={getMarketByNat(marketNat)?.min} max={getMarketByNat(marketNat)?.max} />
                                                        </div>
                                                        <RenderBetBox nat={marketNat} type="back" />
                                                        <RenderBetBox nat={marketNat} type="lay" />
                                                    </div>
                                                );
                                            })}

                                            <div className="casino-bl-box casino-bl-box-title">
                                                <div className="casino-bl-box-item casino-odds-name"></div>
                                                <div className="casino-bl-box-item">No</div>
                                                <div className="casino-bl-box-item">Yes</div>
                                            </div>
                                            {["Total points", "Total cards"].map((label, idx) => (
                                                <div className="casino-bl-box" key={label}>
                                                    <div data-toggle="modal" className="casino-bl-box-item casino-odds-name">
                                                        <div>
                                                            <span className="d-block">{label}</span>
                                                            <div className="book-black">0</div>
                                                        </div>
                                                        <BetLimitInfo2 min={getMarketByNat(label)?.min} max={getMarketByNat(label)?.max} />
                                                    </div>
                                                    <RenderBetBox nat={label} type="lay" showVolume={true} />
                                                    <RenderBetBox nat={label} type="back" showVolume={true} />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="row row5 win-with">
                                            <div className="col-4">
                                                <div className="casino-box-row">
                                                    <div className="casino-nation-name"><b>Win with 5</b> <BetLimitInfo2 min={100} max={25000} /></div>
                                                    <div className="casino-bl-box">
                                                        <RenderBetBox nat="Win with 5" type="back" />
                                                    </div>
                                                </div>
                                                <div className="casino-box-row">
                                                    <div className="casino-nation-name"><b>Win with 15</b> <BetLimitInfo2 min={100} max={25000} /></div>
                                                    <div className="casino-bl-box">
                                                        <RenderBetBox nat="Win with 15" type="back" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="casino-box-row">
                                                    <div className="casino-nation-name"><b>Win with 6</b> <BetLimitInfo2 min={100} max={25000} /></div>
                                                    <div className="casino-bl-box">
                                                        <RenderBetBox nat="Win with 6" type="back" />
                                                    </div>
                                                </div>
                                                <div className="casino-box-row">
                                                    <div className="casino-nation-name"><b>Win with 16</b> <BetLimitInfo2 min={100} max={25000} /></div>
                                                    <div className="casino-bl-box">
                                                        <RenderBetBox nat="Win with 16" type="back" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="casino-box-row">
                                                    <div className="casino-nation-name"><b>Win with 7</b> <BetLimitInfo2 min={100} max={25000} /></div>
                                                    <div className="casino-bl-box">
                                                        <RenderBetBox nat="Win with 7" type="back" />
                                                    </div>
                                                </div>
                                                <div className="casino-box-row">
                                                    <div className="casino-nation-name"><b>Win with 17</b> <BetLimitInfo2 min={100} max={25000} /></div>
                                                    <div className="casino-bl-box">
                                                        <RenderBetBox nat="Win with 17" type="back" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="casino-video-last-results">
                                    {(gameData?.last_results || []).map((res, idx) => {
                                        const winVal = res.win || (res.result ? (suits.find(s => res.result.includes(s)) === 'S' ? '1' : res.result.includes('H') ? '2' : res.result.includes('C') ? '3' : '4') : '1');
                                        const resultSuitName = {
                                            "1": 'spade',
                                            "2": 'heart',
                                            "3": 'club',
                                            "4": 'diamond'
                                        }[winVal] || 'spade';
                                        return (
                                            <span key={idx} onClick={() => setResultMid(res.mid)} style={{ cursor: 'pointer' }}>
                                                <img src={getImage(resultSuitName, result_image)} alt={winVal} />
                                            </span>
                                        );
                                    })}
                                    <a href={`/admin/reports/casinoresult/${game_type || 'race20'}`} className="result-more">...</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <CasinoRightSidebar />
                    <Result_parent mid={resultMid} setMid={setResultMid} game_type={game_type || 'race20'} />
                </div>
            </div>
            <style jsx>{`
                .lock-icon {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 15px;
                    height: 15px;
                    z-index: 10;
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default Race20;
