import React, { useState, useEffect } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getValueAfterDot, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import LastResult from "./components/LastResult";


const RaceTo2nd = ({ onBetSelection }) => {
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
            socket.emit("Room", game_type || "race2");
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
        socket.on(game_type || "race2", handleData);
        socket.on("gameResult", handleResults);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleData);
            socket.off(game_type || "race2", handleData);
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
        const descArray = currentGame?.desc || [];

        return (
            <div className="casino-video-cards-container">
                {[0, 1, 2, 3].map((pos) => {
                    const card = descArray[pos];
                    return (
                        <div key={pos} style={{ flexDirection: 'column' }}>
                            <div className="dealer-name w-100 mb-1">
                                <span>{["PLAYER A", "PLAYER B", "PLAYER C", "PLAYER D"][pos]}</span>
                            </div>
                            <div>
                                {card && card !== "1" && (
                                    <span data-v-b64efdfa="">
                                        <img data-v-b64efdfa="" src={getImage(card, 'cards_new')} alt={card} />
                                    </span>
                                )}
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
                                    gameName={game_name || "Race to 2nd"}
                                    roundId={currentGame?.mid}
                                    videoSrc={iframe_url || "https://casino.diamondcricketid.com/swiftdizire/?id=3092"}
                                    results={lastResults}
                                    timeLeft={currentGame?.autotime || 0}
                                    totalTime={currentGame?.ft || 30}
                                    isCardDrawerOpen={isCardDrawerOpen}
                                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                                    cards={(currentGame?.rdesc || "").split(",").filter(c => c && c !== "")}
                                    CardsComponent={VideoCards}
                                    resultPath={phpFile || "race2"}
                                />
                                <div className="casino-detail">
                                    {/* Desktop View */}
                                    <div className="row d-none-small">
                                        {[0, 1, 2, 3].map(num => {
                                            const displayName = ["Player A", "Player B", "Player C", "Player D"][num];
                                            const market = getMarketByNat(displayName);
                                            const suspended = getIsSuspended(market);
                                            return (
                                                <div className="col-3" key={num}>
                                                    <div className="casino-box-row">
                                                        <div className="casino-nation-name"><b>{displayName}</b></div>
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
                                                            <RenderBetBox nat={displayName} type="back" />
                                                            <RenderBetBox nat={displayName} type="lay" />
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
                                            const displayName = ["Player A", "Player B", "Player C", "Player D"][num];
                                            const market = getMarketByNat(displayName);
                                            const suspended = getIsSuspended(market);
                                            return (
                                                <div className="casino-bl-box" key={num} style={{ position: 'relative' }}>
                                                    <div className="casino-bl-box-item casino-odds-name">
                                                        <b>{displayName.toUpperCase()}</b> <span className="float-right book-black">0</span>
                                                    </div>
                                                    <RenderBetBox nat={displayName} type="back" showLock={true} />
                                                    <RenderBetBox nat={displayName} type="lay" showLock={true} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="col-12 text-right casino-min-max">
                                        R:<span>{getMarketByNat("Player A")?.min || 100}</span>-<span>{formatBetLimit(getMarketByNat("Player A")?.max) || "3L"}</span>
                                    </div>



                                    <LastResult
                                        results={lastResults}
                                        gameName={game_name || "Race to 2nd"}
                                        resultPath={phpFile || "race2"}
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

export default RaceTo2nd;
