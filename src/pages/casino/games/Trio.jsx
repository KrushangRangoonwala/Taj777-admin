import React, { useState, useEffect } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getValueAfterDot, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import LastResult from "./components/LastResult";
import { Exposure } from "../CasinoCenter";
// import { fetchCasinoExposureApi } from "../../../api/API";

const Trio = ({ onBetSelection, lastBetTime, exposureData, lastResults: propsLastResults }) => {
    const { game_type, phpFile, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [isLastResultOpen, setIsLastResultOpen] = useState(true);
    // const [exposureData, setExposureData] = useState([]);

    useEffect(() => {
        if (propsLastResults && propsLastResults.length > 0) {
            setGameData(prev => ({
                ...prev,
                last_results: propsLastResults
            }));
        }
    }, [propsLastResults]);

    const socket = useSocket("casino");
    useEffect(() => {
        if (!socket) return;

        const handleData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) {
                    setGameData((prev) => ({
                        ...prev,
                        ...payload,
                        last_results: payload.last_results || prev?.last_results || [],
                    }));
                }
            } catch (error) {
                console.error("Error processing Trio data:", error);
            }
        };

        const handleConnect = () => {
            // console.log(`✅ ${game_type} Connected:`, socket.id);
            socket.emit("Room", game_type);
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on("game", handleData);
        socket.on(game_type, handleData);
        socket.on("gameResult", (data) => {
            const payload = Array.isArray(data) ? data[1] : data;
            if (payload?.res1?.cname === "Trio" || payload?.res1?.cname === game_name) {
                setGameData((prev) => ({
                    ...prev,
                    last_results: payload.res || prev?.last_results || [],
                }));
            }
        });

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleData);
            socket.off(game_type, handleData);
            socket.off("gameResult");
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

    // const getExposure = (marketId) => {
    //     if (!Array.isArray(exposureData)) return 0;
    //     const market = exposureData.find((item) => item.market_id == marketId);
    //     return market ? market.win_loss || market.total_exposure : 0;
    // };

    // const renderExposure = (marketId, isSession = false) => {
    //     const exposure = getExposure(marketId);
    //     if (exposure === 0) return 0;
    //     return (
    //         <span className={`${isSession ? "book-black mr-2" : "casino-nation-name book-black"}`}>
    //             {exposure}
    //         </span>
    //     );
    // };

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const handleOddsClick = (teamName, odds, sid, isBack) => {
        const market = marketData.find((m) => m.sid == sid);
        const suspended = getIsSuspended(market);
        if (!suspended && onBetSelection && odds != 0) {
            const min = market?.min || 100;
            const max = market?.max || 25000;
            onBetSelection({
                teamName,
                odds,
                minBet: min,
                maxBet: max,
                isBack,
                marketId: sid,
                eventId: getValueAfterDot(currentGame?.mid),
            });
        }
    };

    const getOddsBySid = (sid) => {
        const market = marketData.find((item) => item.sid == sid);
        if (market) return market;

        // Fallback odds based on Trio.js logic
        const fallbacks = {
            1: { b1: "100", l1: "100" },
            8: { b1: "5.5" },
            9: { b1: "12" },
            10: { b1: "25" },
            11: { b1: "101" },
            12: { b1: "251" }
        };
        return fallbacks[sid] || {};
    };

    const Cards = () => (
        <div className="casino-video-cards-container">
            <div>
                {[currentGame?.C1, currentGame?.C2, currentGame?.C3].map((card, idx) => (
                    <span key={idx} data-v-b64efdfa="">
                        <img
                            data-v-b64efdfa=""
                            src={getImage(card, result_image)}
                            alt={`Card ${idx + 1}`}
                        />
                    </span>
                ))}
            </div>
        </div>
    );

    const JUDGMENT_MARKETS = [
        { sid: 2, title: "3 Card Judgement(1 2 4)" },
        { sid: 3, title: "3 Card Judgement(J Q K)" },
    ];

    const TWO_ONLY_MARKETS = [
        { sid: 4, title: "Two Red Only" },
        { sid: 5, title: "Two Black Only" },
        { sid: 6, title: "Two Odd Only" },
        { sid: 7, title: "Two Even Only" },
    ];

    const OTHER_BETS = [
        { sid: 8, title: "Pair" },
        { sid: 9, title: "Flush" },
        { sid: 10, title: "Straight" },
        { sid: 11, title: "Trio" },
        { sid: 12, title: "Straight Flush" },
    ];

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table pasa">
                                <CasinoVideo
                                    gameName={game_name}
                                    roundId={currentGame?.mid}
                                    videoSrc={iframe_url}
                                    results={gameData?.last_results || []}
                                    timeLeft={currentGame?.autotime || 0}
                                    totalTime={currentGame?.ft || 30}
                                    isCardDrawerOpen={isCardDrawerOpen}
                                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                                    CardsComponent={Cards}
                                    resultPath={phpFile}
                                    showLastResults={true}
                                    showLastResultComponent={false}
                                    isLastResultOpen={isLastResultOpen}
                                    setIsLastResultOpen={setIsLastResultOpen}
                                />
                                <LastResult
                                    results={gameData?.last_results || []}
                                    gameName={game_name}
                                    resultPath={game_type}
                                    isOpen={isLastResultOpen}
                                />
                                <div className="casino-detail">
                                    <div className="row row5">
                                        <div className="col-12 col-md-6">
                                            <div className="casino-box-row d-none-small" style={{ height: "30px" }}></div>
                                            <div className="casino-box-row pasa-sesssion">
                                                <div className="casino-nation-name">
                                                    <b className="pointer">Session</b>
                                                    <div className="float-right">
                                                        {/* <span className="mr-2 book-black">{getExposure(1)}</span> */}
                                                        <Exposure className="mr-2" data={exposureData} id={1} />
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <div
                                                        className={`lay casino-bl-box-item ${getIsSuspended(getOddsBySid(1)) ? "suspended" : ""}`}
                                                        onClick={() => handleOddsClick("Session", getOddsBySid(1)?.l1, 1, false)}
                                                    >
                                                        {getIsSuspended(getOddsBySid(1)) ? (
                                                            <img src="/assets/images/lock.svg" alt="lock" className="lock-icon" />
                                                        ) : (
                                                            <>
                                                                <span>{getOddsBySid(1)?.l1 || "0"}</span>
                                                                <span className="casino-box-odd">{getOddsBySid(1)?.ls1 || "100"}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div
                                                        className={`back casino-bl-box-item ${getIsSuspended(getOddsBySid(1)) ? "suspended" : ""}`}
                                                        onClick={() => handleOddsClick("Session", getOddsBySid(1)?.b1, 1, true)}
                                                    >
                                                        {getIsSuspended(getOddsBySid(1)) ? (
                                                            <img src="/assets/images/lock.svg" alt="lock" className="lock-icon" />
                                                        ) : (
                                                            <>
                                                                <span>{getOddsBySid(1)?.b1 || "0"}</span>
                                                                <span className="casino-box-odd">{getOddsBySid(1)?.bs1 || "100"}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="casino-box-row d-none-small" style={{ height: "30px" }}></div>
                                        </div>
                                        {JUDGMENT_MARKETS.map((market) => (
                                            <div key={market.sid} className="col-6 col-md-3 pasa-fancy">
                                                <div className="casino-box-row">
                                                    <div className="casino-nation-name"><b>{market.title}</b></div>
                                                    <div className="casino-bl-box">
                                                        <div
                                                            className={`back casino-bl-box-item ${getIsSuspended(getOddsBySid(market.sid)) ? "suspended" : ""}`}
                                                            onClick={() => handleOddsClick(market.title, getOddsBySid(market.sid)?.b1, market.sid, true)}
                                                        >
                                                            {getIsSuspended(getOddsBySid(market.sid)) ? (
                                                                <img src="/assets/images/lock.svg" alt="lock" className="lock-icon" />
                                                            ) : (
                                                                <span className="casino-box-odd">{getOddsBySid(market.sid)?.b1 || "0"}</span>
                                                            )}
                                                        </div>
                                                        <div
                                                            className={`lay casino-bl-box-item ${getIsSuspended(getOddsBySid(market.sid)) ? "suspended" : ""}`}
                                                            onClick={() => handleOddsClick(market.title, getOddsBySid(market.sid)?.l1, market.sid, false)}
                                                        >
                                                            {getIsSuspended(getOddsBySid(market.sid)) ? (
                                                                <img src="/assets/images/lock.svg" alt="lock" className="lock-icon" />
                                                            ) : (
                                                                <span className="casino-box-odd">{getOddsBySid(market.sid)?.l1 || "0"}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* {renderExposure(market.sid)} */}
                                                    <Exposure className="casino-nation-name" data={exposureData} id={market.sid} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="row row5 mt-2 pasa-cards">
                                        {TWO_ONLY_MARKETS.map((market) => (
                                            <div key={market.sid} className="col-6 col-md-3">
                                                <div className="casino-box-row">
                                                    <div className="casino-nation-name"><b>{market.title}</b></div>
                                                    <div className="casino-bl-box">
                                                        <div
                                                            className={`back casino-bl-box-item ${getIsSuspended(getOddsBySid(market.sid)) ? "suspended" : ""}`}
                                                            onClick={() => handleOddsClick(market.title, getOddsBySid(market.sid)?.b1, market.sid, true)}
                                                        >
                                                            {getIsSuspended(getOddsBySid(market.sid)) ? (
                                                                <img src="/assets/images/lock.svg" alt="lock" className="lock-icon" />
                                                            ) : (
                                                                <span className="casino-box-odd">{getOddsBySid(market.sid)?.b1 || "0"}</span>
                                                            )}
                                                        </div>
                                                        <div
                                                            className={`lay casino-bl-box-item ${getIsSuspended(getOddsBySid(market.sid)) ? "suspended" : ""}`}
                                                            onClick={() => handleOddsClick(market.title, getOddsBySid(market.sid)?.l1, market.sid, false)}
                                                        >
                                                            {getIsSuspended(getOddsBySid(market.sid)) ? (
                                                                <img src="/assets/images/lock.svg" alt="lock" className="lock-icon" />
                                                            ) : (
                                                                <span className="casino-box-odd">{getOddsBySid(market.sid)?.l1 || "0"}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* {renderExposure(market.sid)} */}
                                                    <Exposure className="casino-nation-name" data={exposureData} id={market.sid} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="casino-box-row pasa-other-bets">
                                        {OTHER_BETS.map((market) => (
                                            <div key={market.sid} className="casino-box-row pasa-other-bet">
                                                <div className="casino-nation-name"><b>{market.title}</b></div>
                                                <div className="casino-bl-box">
                                                    <div
                                                        className={`back casino-bl-box-item ${getIsSuspended(getOddsBySid(market.sid)) ? "suspended" : ""}`}
                                                        onClick={() => handleOddsClick(market.title, getOddsBySid(market.sid)?.b1, market.sid, true)}
                                                    >
                                                        {getIsSuspended(getOddsBySid(market.sid)) ? (
                                                            <img src="/assets/images/lock.svg" alt="lock" className="lock-icon" />
                                                        ) : (
                                                            <span className="casino-box-odd">{getOddsBySid(market.sid)?.b1 || "0"}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* {renderExposure(market.sid)} */}
                                                <Exposure className="casino-nation-name" data={exposureData} id={market.sid} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <CasinoRightSidebar />
                </div>
            </div>
            <style jsx>{`
                .lock-icon {
                    width: 15px;
                    height: 15px;
                    opacity: 1;
                    z-index: 10;
                    position: relative;
                }
                .casino-video-last-results {
                    overflow: hidden;
                    transition: height 0.3s ease-in-out;
                }
                .casino-video-last-results.hide-lr {
                    height: 0;
                    padding-top: 0;
                    padding-bottom: 0;
                }
                @media (max-width: 767px) {
                    .casino-table {
                        display: flex;
                        flex-direction: column;
                    }
                    .casino-video-last-results {
                        order: 10;
                    }
                    .casino-detail {
                        order: 5;
                    }
                }
            `}</style>
        </div>
    );
};

export default Trio;
