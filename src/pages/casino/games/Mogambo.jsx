import React, { useState, useEffect } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
// import { fetchCasinoExposureApi } from "../../../api/API";
import { getImage, getMarketByNation, getValueAfterDot, getIsSuspended, getCards_Sum, formatNumber } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import LastResult from "./components/LastResult";

const Mogambo = ({ onBetSelection, lastBetTime }) => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [lastResults, setLastResults] = useState([]);
    // const [exposureData, setExposureData] = useState([]);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);

    const socket = useSocket("casino");
    useEffect(() => {
        if (!socket) return;

        const handleData = (data) => {
            try {
                const payload = Array.isArray(data) ? (data[1] || data[0]) : data;
                if (payload) {
                    setGameData(payload);
                }
            } catch (error) {
                console.error("Error processing Mogambo data:", error);
            }
        };

        const handleResults = (data) => {
            const payload = Array.isArray(data) ? (data[1] || data[0]) : data;
            let results = [];
            if (payload && payload.res && Array.isArray(payload.res)) {
                results = payload.res;
            } else if (payload && payload.data && Array.isArray(payload.data)) {
                results = payload.data;
            }
            if (results.length > 0) {
                setLastResults(results);
            }
        };

        const handleConnect = () => {
            console.log(`✅ ${game_type} Connected:`, socket.id);
            socket.emit("Room", game_type);
            socket.emit("gameResult");
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on("game", handleData);
        socket.on(game_type, handleData);
        socket.on("gameResult", handleResults);
        socket.on(`${game_type}_result`, handleResults);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleData);
            socket.off(game_type, handleData);
            socket.off("gameResult", handleResults);
            socket.off(`${game_type}_result`, handleResults);
        };
    }, [socket, game_type]);

    // useEffect(() => {
    //     const fetchExposure = async () => {
    //         if (!gameData?.t1?.[0]?.mid) return;
    //         try {
    //             const response = await fetchCasinoExposureApi({
    //                 markettype: CODE,
    //                 main_event_id: gameData.t1[0].mid,
    //                 curPageName: phpFile,
    //             });
    //             if (Array.isArray(response?.data)) {
    //                 setExposureData(response.data);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching exposure:", error);
    //         }
    //     };
    //     fetchExposure();
    // }, [gameData?.t1?.[0]?.mid, lastBetTime, CODE, phpFile]);

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const handleOddsClick = (marketName, odds, market, isBack, suspended, runs) => {
        if (!market || suspended || odds == 0) return;

        const min = market?.min || 100;
        const max = market?.max || 300000;

        if (onBetSelection) {
            onBetSelection({
                teamName: marketName,
                odds: odds,
                runs: runs ?? null,
                shown_odds: runs ?? null,
                minBet: min,
                maxBet: max,
                isBack,
                marketId: market.sid,
                eventId: getValueAfterDot(currentGame?.mid),
            });
        }
    };

    const getMarketByName = (marketName) => getMarketByNation(marketData, marketName, "nat");
    const getMarketBySid = (sid) => marketData.find(m => m.sid == sid);

    const BetBox = ({ marketName, sid, className = "", children, type = "back" }) => {
        const market = sid ? getMarketBySid(sid) : getMarketByName(marketName);
        const suspended = getIsSuspended(market);
        const odds = type === "back" ? market?.b1 : market?.l1;
        const runs = type === "back" ? market?.bs1 : market?.ls1;

        return (
            <div
                className={`${className} ${suspended ? "suspended" : ""}`}
                onClick={() => handleOddsClick(marketName || market?.nat, odds, market, type === "back", suspended, runs)}
            >
                {suspended ? (
                    <img src="/assets/images/lock.svg" alt="lock" style={{ width: "15px", height: "15px", opacity: 1, zIndex: 10, position: "relative" }} />
                ) : (
                    children(odds, runs)
                )}
            </div>
        );
    };

    const Cards = () => (
        <div className="casino-video-cards-container">
            <h5 className="text-white">Total: {getCards_Sum([currentGame?.C1, currentGame?.C2, currentGame?.C3])}</h5>
            <h5 className="text-white">Daga / Teja</h5>
            <div>
                <span data-v-b64efdfa="">
                    <img data-v-b64efdfa="" src={getImage(currentGame?.C1, result_image)} />
                </span>
                <span className="card-devider"></span>
                <span data-v-b64efdfa="">
                    <img data-v-b64efdfa="" src={getImage(currentGame?.C2, result_image)} />
                </span>
            </div>
            <h5 className="text-white">Mogambo</h5>
            <div className="text-center">
                <span data-v-b64efdfa="">
                    <img data-v-b64efdfa="" src={getImage(currentGame?.C3, result_image)} />
                </span>
            </div>
        </div>
    );

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table mogambo teenpatti2cards">
                                <CasinoVideo
                                    gameName={game_name}
                                    roundId={currentGame?.mid}
                                    videoSrc={iframe_url}
                                    results={lastResults}
                                    timeLeft={currentGame?.autotime || 0}
                                    totalTime={currentGame?.ft || 30}
                                    isCardDrawerOpen={isCardDrawerOpen}
                                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                                    CardsComponent={Cards}
                                    resultPath="mogambo"
                                />
                                <div className="casino-detail">
                                    <div className="d-none-small">
                                        <div className="teen1daycasino-container">
                                            <div className="teen1dayleft">
                                                <div className="casino-box-row">
                                                    <div className="casino-nation-name">
                                                        <b>Daaga / Teja</b>
                                                        <div className="float-right">
                                                            <span className="mr-2 book-black">0</span>
                                                        </div>
                                                    </div>
                                                    <div className="casino-bl-box casino-bl-boxfull">
                                                        <BetBox sid="2" className="back casino-bl-box-item" type="back">
                                                            {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                        </BetBox>
                                                    </div>
                                                </div>
                                                <div className="text-right casino-min-max">
                                                    R:<span>{formatNumber(getMarketBySid("2")?.min || 100)}</span>-<span>{formatNumber(getMarketBySid("2")?.max || 300000)}</span>
                                                </div>
                                            </div>
                                            <div className="teen1dayright">
                                                <div className="casino-box-row">
                                                    <div className="casino-nation-name">
                                                        <b>Mogambo</b>
                                                        <div className="float-right">
                                                            <span className="mr-2 book-black">0</span>
                                                        </div>
                                                    </div>
                                                    <div className="casino-bl-box casino-bl-boxfull">
                                                        <BetBox sid="1" className="back casino-bl-box-item" type="back">
                                                            {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                        </BetBox>
                                                    </div>
                                                </div>
                                                <div className="text-right casino-min-max">
                                                    R:<span>{formatNumber(getMarketBySid("1")?.min || 100)}</span>-<span>{formatNumber(getMarketBySid("1")?.max || 300000)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="casino-box-row three-card-total">
                                            <div className="casino-nation-name">
                                                <b className="pointer">3 Card Total</b>
                                                <div className="float-right">
                                                    <span className="mr-2 book-black">0</span>
                                                </div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <BetBox sid="3" className="lay casino-bl-box-item" type="lay">
                                                    {(odds, runs) => (
                                                        <>
                                                            <span className="casino-box-odd">{odds || 0}</span>
                                                            <span>{runs || 0}</span>
                                                        </>
                                                    )}
                                                </BetBox>
                                                <BetBox sid="3" className="back casino-bl-box-item" type="back">
                                                    {(odds, runs) => (
                                                        <>
                                                            <span className="casino-box-odd">{odds || 0}</span>
                                                            <span>{runs || 0}</span>
                                                        </>
                                                    )}
                                                </BetBox>
                                            </div>
                                            <div className="text-right casino-min-max w-100">
                                                R:<span>{formatNumber(getMarketBySid("3")?.min || 100)}</span>-<span>{formatNumber(getMarketBySid("3")?.max || 100000)}</span>
                                            </div>
                                        </div>
                                        <LastResult
                                            results={lastResults}
                                            gameName={game_name}
                                            resultPath="mogambo"
                                            className="d-none-big"
                                        />
                                    </div>
                                    <div className="d-none-big">
                                        <div className="casino-box-row">
                                            <div className="casino-nation-name">
                                                <b>Daga / Teja</b>
                                                <div className="float-right">
                                                    <span className="mr-2 book-black">0</span>
                                                </div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <BetBox sid="2" className="back casino-bl-box-item" type="back">
                                                    {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                </BetBox>
                                            </div>
                                        </div>
                                        <div className="casino-box-row">
                                            <div className="casino-nation-name">
                                                <b>Mogambo</b>
                                                <div className="float-right">
                                                    <span className="mr-2 book-black">0</span>
                                                </div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <BetBox sid="1" className="back casino-bl-box-item" type="back">
                                                    {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                </BetBox>
                                            </div>
                                        </div>
                                        <div className="casino-box-row">
                                            <div className="casino-nation-name">
                                                <b className="pointer">3 Card Total</b>
                                                <div className="float-right">
                                                    <span className="mr-2 book-black">0</span>
                                                </div>
                                            </div>
                                            <div className="casino-bl-box total-odds">
                                                <BetBox sid="3" className="lay casino-bl-box-item" type="lay">
                                                    {(odds, runs) => (
                                                        <>
                                                            <span>{odds || 0}</span>
                                                            <span className="casino-box-odd">{runs || 0}</span>
                                                        </>
                                                    )}
                                                </BetBox>
                                                <BetBox sid="3" className="back casino-bl-box-item" type="back">
                                                    {(odds, runs) => (
                                                        <>
                                                            <span>{odds || 0}</span>
                                                            <span className="casino-box-odd">{runs || 0}</span>
                                                        </>
                                                    )}
                                                </BetBox>
                                            </div>
                                        </div>
                                        <LastResult
                                            results={lastResults}
                                            gameName={game_name}
                                            resultPath="mogambo"
                                            className="d-none-big"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="right-sidebar">
                        <CasinoRightSidebar />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Mogambo;
