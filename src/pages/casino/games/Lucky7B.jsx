import React, { useState, useEffect } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
// import { fetchCasinoExposureApi } from "../../../api/API";
import { getImage, getValueAfterDot, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import LastResult from "./components/LastResult";
import { Exposure } from "../CasinoCenter";

const Lucky7A = ({ onBetSelection, lastBetTime, exposureData, lastResults: propsLastResults }) => {
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
                console.error("Error processing Lucky7A data:", error);
            }
        };

        const handleConnect = () => {
            // console.log(`✅ ${game_type} Connected:`, socket.id);
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
                console.error("Error processing Lucky7A results:", error);
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

    // useEffect(() => {
    //     const fetchExposure = async () => {
    //         if (!gameData?.t1?.[0]?.mid) return;
    //         try {
    //             const response = await fetchCasinoExposureApi({
    //                 markettype: CODE,
    //                 main_event_id: getValueAfterDot(gameData.t1[0].mid),
    //                 curPageName: phpFile,
    //             });
    //             if (Array.isArray(response?.data)) {
    //                 setExposureData(response.data);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching Lucky7A exposure:", error);
    //         }
    //     };
    //     fetchExposure();
    // }, [gameData?.t1?.[0]?.mid, lastBetTime, CODE, phpFile]);

    // const getExposure = (marketId) => {
    //     if (!Array.isArray(exposureData)) return 0;
    //     const market = exposureData.find((item) => String(item.market_id) === String(marketId));
    //     return market ? market.win_loss || market.total_exposure : 0;
    // };

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const getMarketBySid = (sid) => marketData.find((item) => String(item.sid) === String(sid));

    const handleOddsClick = (marketName, odds, market, isBack, suspended) => {
        if (!market || suspended || odds == 0) return;

        const min = market?.min || 100;
        const max = market?.max || 25000; // Default max from old_game_file

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

    const BetBox = ({ sid, marketName, label, children, isBack = true }) => {
        const market = getMarketBySid(sid);
        const suspended = getIsSuspended(market);
        const getOdds = (m) => m?.b1 || m?.rate || m?.odds || "0";
        const odds = suspended ? "0" : isBack ? getOdds(market) : (market?.l1 || "0");

        return (
            <div
                className="text-center casino-buttons"
                onClick={() => handleOddsClick(marketName, odds, market, isBack, suspended)}
                style={{ position: 'relative' }}
            >
                {suspended && (
                    <img
                        src="/assets/images/lock.svg"
                        alt="lock"
                        style={{
                            position: 'absolute',
                            top: '20%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '15px',
                            height: '15px',
                            zIndex: 10
                        }}
                    />
                )}
                {children || <span>{label || marketName}</span>}
            </div>
        );
    };

    const getOdds = (m) => m?.b1 || m?.rate || m?.odds || "0";

    const formatBetLimit = (value) => {
        if (!value) return "0";
        const num = Number(value);
        if (num >= 100000) return (num / 100000) + "L";
        if (num >= 1000) return (num / 1000) + "K";
        return num.toString();
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

    const groups = [
        { sid: 7, name: 'Line 1', cards: ['A', '2', '3'] },
        { sid: 8, name: 'Line 2', cards: ['4', '5', '6'] },
        { sid: 9, name: 'Line 3', cards: ['8', '9', '10'] },
        { sid: 10, name: 'Line 4', cards: ['J', 'Q', 'K'] }
    ];

    const cards_individual = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

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
                                        <div className={`low-odds ${getIsSuspended(getMarketBySid(1)) ? "suspended" : ""}`}>
                                            <div className="casino-odds">{getIsSuspended(getMarketBySid(1)) ? "0" : getOdds(getMarketBySid(1))}</div>
                                            <BetBox sid={1} marketName="Low Card" label="Low Card" />
                                            <Exposure className="casino-book" data={exposureData} id={1} />
                                        </div>
                                        <div className="text-center lucky7-card">
                                            <img
                                                src={getImage('7', 'cards_new/lucky6')}
                                                className="img-fluid"
                                                alt="7"
                                            />
                                        </div>
                                        <div className={`high-odds ${getIsSuspended(getMarketBySid(2)) ? "suspended" : ""}`}>
                                            <div className="casino-odds">{getIsSuspended(getMarketBySid(2)) ? "0" : getOdds(getMarketBySid(2))}</div>
                                            <BetBox sid={2} marketName="High Card" label="High Card" />
                                            <Exposure className="casino-book" data={exposureData} id={2} />
                                        </div>
                                        <div className="casino-min-max text-right">
                                            R:<span>{getMarketBySid(1)?.min || 100}</span>-<span>{formatBetLimit(getMarketBySid(1)?.max) || "1L"}</span>
                                        </div>
                                    </div>
                                    <div className="casino-box sidebets-box">
                                        <div className="lucky7-extra-bets">
                                            <div className="lucky7-extra-bets-item-container">
                                                <div className={`lucky7-extra-bets-item ${getIsSuspended(getMarketBySid(3)) ? "suspended" : ""}`}>
                                                    <div className="casino-odds">{getIsSuspended(getMarketBySid(3)) ? "0" : getOdds(getMarketBySid(3))}</div>
                                                    <BetBox sid={3} marketName="Even" label="Even" />
                                                    <Exposure className="casino-book" data={exposureData} id={3} />
                                                </div>
                                                <div className="casino-min-max text-right">
                                                    R:<span>{getMarketBySid(3)?.min || 100}</span>-<span>{formatBetLimit(getMarketBySid(3)?.max) || "25K"}</span>
                                                </div>
                                            </div>
                                            <div className="lucky7-extra-bets-item-container">
                                                <div className={`lucky7-extra-bets-item ${getIsSuspended(getMarketBySid(4)) ? "suspended" : ""}`}>
                                                    <div className="casino-odds">{getIsSuspended(getMarketBySid(4)) ? "0" : getOdds(getMarketBySid(4))}</div>
                                                    <BetBox sid={4} marketName="Odd" label="Odd" />
                                                    <Exposure className="casino-book" data={exposureData} id={4} />
                                                </div>
                                                <div className="casino-min-max text-right">
                                                    R:<span>{getMarketBySid(4)?.min || 100}</span>-<span>{formatBetLimit(getMarketBySid(4)?.max) || "25K"}</span>
                                                </div>
                                            </div>
                                            <div className="lucky7-extra-bets-item-container">
                                                <div className={`lucky7-extra-bets-item ${getIsSuspended(getMarketBySid(5)) ? "suspended" : ""}`}>
                                                    <div className="casino-odds">{getIsSuspended(getMarketBySid(5)) ? "0" : getOdds(getMarketBySid(5))}</div>
                                                    <BetBox sid={5} marketName="Black">
                                                        <img src={getImage('spade', 'cards_new')} alt="spade" />
                                                        <img src={getImage('club', 'cards_new')} alt="club" />
                                                    </BetBox>
                                                    <Exposure className="casino-book" data={exposureData} id={5} />
                                                </div>
                                                <div className="casino-min-max text-right">
                                                    R:<span>{getMarketBySid(5)?.min || 100}</span>-<span>{formatBetLimit(getMarketBySid(5)?.max) || "25K"}</span>
                                                </div>
                                            </div>
                                            <div className="lucky7-extra-bets-item-container">
                                                <div className={`lucky7-extra-bets-item ${getIsSuspended(getMarketBySid(6)) ? "suspended" : ""}`}>
                                                    <div className="casino-odds">{getIsSuspended(getMarketBySid(6)) ? "0" : getOdds(getMarketBySid(6))}</div>
                                                    <BetBox sid={6} marketName="Red">
                                                        <img src={getImage('heart', 'cards_new')} alt="heart" />
                                                        <img src={getImage('diamond', 'cards_new')} alt="diamond" />
                                                    </BetBox>
                                                    <Exposure className="casino-book" data={exposureData} id={6} />
                                                </div>
                                                <div className="casino-min-max text-right">
                                                    R:<span>{getMarketBySid(6)?.min || 100}</span>-<span>{formatBetLimit(getMarketBySid(6)?.max) || "25K"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="casino-box cards-top">
                                        <div className="container-fluid container-fluid-5">
                                            <div className="row row5">
                                                {groups.map((group) => {
                                                    const market = getMarketBySid(group.sid);
                                                    return (
                                                        <div className="col-6 col-md-3" key={group.sid}>
                                                            <div className="casino-cards-group">
                                                                <div className="casino-odds">{getIsSuspended(market) ? "0" : (market?.b1 || "4")}</div>
                                                                <div className="casino-cards text-center mt-1">
                                                                    <div
                                                                        className={`casino-box cards-top-box ${getIsSuspended(market) ? "suspended" : ""}`}
                                                                        onClick={() => handleOddsClick(group.name, market?.b1 || 4, market, true, getIsSuspended(market))}
                                                                        style={{ position: 'relative' }}
                                                                    >
                                                                        {getIsSuspended(market) && (
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
                                                                        {group.cards.map(card => (
                                                                            <div className="casino-card-item" key={card}>
                                                                                <div className="card-image">
                                                                                    <img src={getImage(card, 'cards_new/lucky6')} alt={card} />
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    {/* <div className="w-100 casino-book book-black">{getExposure(group.sid)}</div> */}
                                                                    <Exposure className="w-100 casino-book" data={exposureData} id={group.sid} />
                                                                </div>
                                                                <div className="casino-min-max text-center">
                                                                    R:<span>{market?.min || 100}</span>-<span>{formatBetLimit(market?.max) || "5K"}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="casino-box cards-box">
                                        <div className="w-100">
                                            <div className="casino-odds">{getIsSuspended(getMarketBySid(11)) ? "0" : getOdds(getMarketBySid(11))}</div>
                                            <div className="casino-cards text-center mt-1">
                                                {cards_individual.map((card, idx) => {
                                                    const sid = 11 + idx; // Re-mapped starting from 11 to avoid overlap
                                                    const market = getMarketBySid(sid);
                                                    const suspended = getIsSuspended(market);
                                                    return (
                                                        <div
                                                            className="casino-card-item"
                                                            key={card}
                                                            onClick={() => handleOddsClick(`Card ${card}`, market?.b1 || 12, market, true, suspended)}
                                                        >
                                                            <div className={`card-image ${suspended ? "suspended" : ""}`} style={{ position: 'relative' }}>
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
                                                                <img src={getImage(card, 'cards_new/lucky6')} alt={card} />
                                                            </div>
                                                            {/* <div className="casino-book book-black">{getExposure(sid)}</div> */}
                                                            <Exposure className="casino-book" data={exposureData} id={sid} />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="casino-min-max text-right">
                                            R:<span>{getMarketBySid(11)?.min || 100}</span>-<span>{formatBetLimit(getMarketBySid(11)?.max) || "5K"}</span>
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

export default Lucky7A;
