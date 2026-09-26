import React, { useState, useEffect } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
// import { fetchCasinoExposureApi } from "../../../api/API";
import { getImage, getValueAfterDot, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import LastResult from "./components/LastResult";
import { Exposure } from "../CasinoCenter";

const Lucky6 = ({ onBetSelection, lastBetTime, exposureData, lastResults: propsLastResults }) => {
    const { CODE, game_type, phpFile, game_name, iframe_url } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [lastResults, setLastResults] = useState([]);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    // const [exposureData, setExposureData] = useState([]);

    useEffect(() => {
        if (propsLastResults && propsLastResults.length > 0) {
            setLastResults(propsLastResults);
        }
    }, [propsLastResults]);

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
                            res: r.win === "1" ? "L" : r.win === "2" ? "H" : r.win === "0" ? "T" : r.win
                        }));
                        setLastResults(formattedResults);
                    }
                }
            } catch (error) {
                console.error("Error processing Lucky6 data:", error);
            }
        };

        const handleConnect = () => {
            socket.emit("Room", game_type);
        };

        const handleResults = (data) => {
            try {
                const payload = Array.isArray(data) ? data[1] : data;
                if (payload?.res) {
                    const formattedResults = payload.res.map(r => ({
                        mid: r.mid,
                        res: r.win === "1" ? "L" : r.win === "2" ? "H" : r.win === "0" ? "T" : r.win
                    }));
                    setLastResults(formattedResults);
                }
            } catch (error) {
                console.error("Error processing Lucky6 results:", error);
            }
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on("game", handleData);
        socket.on(game_type, handleData);
        socket.on("gameResult", handleResults);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleData);
            socket.off(game_type, handleData);
            socket.off("gameResult", handleResults);
        };
    }, [socket, game_type]);

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const getMarketBySid = (sid) => marketData.find((item) => String(item.sid) === String(sid));

    const handleOddsClick = (marketName, odds, market, isBack, suspended) => {
        if (!market || suspended || odds == 0) return;

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

    const formatBetLimit = (value) => {
        if (!value) return "0";
        const num = Number(value);
        if (num >= 100000) return (num / 100000) + "L";
        if (num >= 1000) return (num / 1000) + "K";
        return num.toString();
    };

    const getOdds = (m) => m?.b1 || m?.rate || m?.odds || "0";

    const BettingBox = ({ sid, marketName, label, children, className }) => {
        const market = getMarketBySid(sid);
        const suspended = getIsSuspended(market);
        const odds = suspended ? "0" : getOdds(market);

        return (
            <div
                className={`${className || ""} ${suspended ? "suspended" : ""}`}
                onClick={() => handleOddsClick(marketName, odds, market, true, suspended)}
                style={{ position: 'relative' }}
            >
                <div className="casino-odds">{odds}</div>
                <div className="text-center casino-buttons">{children || <span>{label || marketName}</span>}</div>
                <Exposure className="casino-book" data={exposureData} id={sid} />
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
            </div>
        );
    };

    const VideoCards = () => {
        const cardImg = getImage(currentGame?.C1, "cards_new");
        return (
            <div className="casino-video-cards-container">
                {currentGame?.C1 && (
                    <div>
                        <span data-v-b64efdfa="">
                            <img data-v-b64efdfa="" src={cardImg} alt="Card A" />
                        </span>
                    </div>
                )}
            </div>
        );
    };

    const sideBets = [
        { sid: 3, name: "Even", label: "Even" },
        { sid: 4, name: "Odd", label: "Odd" },
        { sid: 5, name: "Black", iconNode: (
            <>
                <img src={getImage('spade', 'cards_new')} alt="spade" />
                <img src={getImage('club', 'cards_new')} alt="club" />
            </>
        )},
        { sid: 6, name: "Red", iconNode: (
            <>
                <img src={getImage('heart', 'cards_new')} alt="heart" />
                <img src={getImage('diamond', 'cards_new')} alt="diamond" />
            </>
        )}
    ];

    const individualCards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J'];

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table lucky7">
                                <CasinoVideo
                                    gameName={game_name}
                                    roundId={currentGame?.mid}
                                    videoSrc={iframe_url}
                                    results={lastResults}
                                    timeLeft={currentGame?.autotime || 0}
                                    totalTime={currentGame?.ft || 30}
                                    isCardDrawerOpen={isCardDrawerOpen}
                                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                                    cards={[currentGame?.C1]}
                                    CardsComponent={VideoCards}
                                    resultPath={phpFile}
                                />
                                <div className="casino-detail">
                                    <div className="casino-box low-high-box">
                                        <BettingBox sid={1} marketName="Low Card" label="Low Card" className="low-odds" />
                                        <div className="text-center lucky7-card">
                                            <img
                                                src={getImage('6', 'cards_new/lucky6')}
                                                className="img-fluid"
                                                alt="6"
                                            />
                                        </div>
                                        <BettingBox sid={2} marketName="High Card" label="High Card" className="high-odds" />
                                        <div className="casino-min-max text-right">
                                            R:<span>{getMarketBySid(1)?.min || 100}</span>-<span>{formatBetLimit(getMarketBySid(1)?.max) || "1L"}</span>
                                        </div>
                                    </div>

                                    <div className="casino-box sidebets-box">
                                        <div className="lucky7-extra-bets">
                                            {sideBets.map(bet => (
                                                <div className="lucky7-extra-bets-item-container" key={bet.sid}>
                                                    <BettingBox 
                                                        sid={bet.sid} 
                                                        marketName={bet.name} 
                                                        label={bet.label} 
                                                        className="lucky7-extra-bets-item"
                                                    >
                                                        {bet.iconNode}
                                                    </BettingBox>
                                                    <div className="casino-min-max text-right">
                                                        R:<span>{getMarketBySid(bet.sid)?.min || 100}</span>-<span>{formatBetLimit(getMarketBySid(bet.sid)?.max) || "25K"}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="casino-box cards-box">
                                        <div className="w-100" style={{ position: 'relative' }}>
                                            {getIsSuspended(getMarketBySid(11)) && (
                                                <img
                                                    src="/assets/images/lock.svg"
                                                    alt="lock"
                                                    style={{
                                                        position: 'absolute',
                                                        top: '10px',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        width: '15px',
                                                        height: '15px',
                                                        zIndex: 10
                                                    }}
                                                />
                                            )}
                                            <div className="casino-odds">{getIsSuspended(getMarketBySid(11)) ? "0" : getOdds(getMarketBySid(11))}</div>
                                            <div className="casino-cards text-center mt-1">
                                                {individualCards.map((card, idx) => {
                                                    const sid = 7 + idx;
                                                    const market = getMarketBySid(sid);
                                                    const suspended = getIsSuspended(market);
                                                    const oddsString = suspended ? "0" : getOdds(market);

                                                    return (
                                                        <div
                                                            className="casino-card-item"
                                                            key={card}
                                                            onClick={() => handleOddsClick(`Card ${card}`, oddsString, market, true, suspended)}
                                                            style={{ position: 'relative' }}
                                                        >
                                                            <div className={`card-image ${suspended ? "suspended" : ""}`}>
                                                                <img src={getImage(card, 'cards_new/lucky6')} alt={card} />
                                                            </div>
                                                            <Exposure className="casino-book" data={exposureData} id={sid} />
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
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="casino-min-max text-right">
                                            R:<span>{getMarketBySid(7)?.min || 100}</span>-<span>{formatBetLimit(getMarketBySid(7)?.max) || "5K"}</span>
                                        </div>
                                    </div>
                                    <LastResult
                                        results={lastResults}
                                        gameName={game_name}
                                        resultPath={phpFile}
                                        showRawLabel={true}
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

export default Lucky6;
