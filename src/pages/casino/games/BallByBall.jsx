import React, { useState, useEffect, useRef } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { formatNumber, sanitizeNumber, getValueAfterDot } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import Collapse from "react-bootstrap/Collapse";

// import { fetchCasinoExposureApi } from "../../../api/api";

const BallByBall = ({ onBetSelection, lastBetTime, lastResults }) => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [results, setResults] = useState([]);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(false);
    const [openSections, setOpenSections] = useState({ runs: true });
    // const [exposureData, setExposureData] = useState([]);
    const [displayRdesc, setDisplayRdesc] = useState("");
    const rdescTimerRef = useRef(null);

    const socket = useSocket("casino");
    useEffect(() => {
        if (!socket) return;

        const handleData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) {
                    setGameData(payload);
                    if (payload.last_results) {
                        setResults(payload.last_results);
                    }
                }
            } catch (error) {
                console.error("Error processing BallByBall data:", error);
            }
        };

        const handleConnect = () => {
            console.log(`✅ ${game_type} Connected:`, socket.id);
            socket.emit("Room", game_type);
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on("game", handleData);
        socket.on(game_type, handleData);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleData);
            socket.off(game_type, handleData);
        };
    }, [socket, game_type]);

    // useEffect(() => {
    //     const fetchExposure = async () => {
    //         if (!gameData?.t1?.mid) return;
    //         try {
    //             const response = await fetchCasinoExposureApi({
    //                 markettype: CODE,
    //                 main_event_id: gameData.t1.mid,
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
    // }, [gameData?.t1?.mid, lastBetTime, CODE, phpFile]);

    // const getExposure = (marketId) => {
    //     if (!Array.isArray(exposureData)) return 0;
    //     const market = exposureData.find((item) => item.market_id == marketId);
    //     return market ? market.win_loss || market.total_exposure : 0;
    // };

    const handleOddsClick = (marketName, odds, market, isBack) => {
        if (!market || odds == 0) return;

        if (onBetSelection) {
            onBetSelection({
                teamName: marketName,
                odds: odds,
                minBet: market?.min || 50,
                maxBet: market?.max || 25000,
                isBack,
                marketId: market.sid,
                eventId: getValueAfterDot(currentGame?.mid),
            });
        }
    };

    useEffect(() => {
        if (gameData?.t1?.rdesc) {
            if (rdescTimerRef.current) {
                clearTimeout(rdescTimerRef.current);
                rdescTimerRef.current = null;
            }
            setDisplayRdesc(gameData.t1.rdesc);
        } else if (displayRdesc) {
            if (!rdescTimerRef.current) {
                rdescTimerRef.current = setTimeout(() => {
                    setDisplayRdesc("");
                    rdescTimerRef.current = null;
                }, 2000);
            }
        }
    }, [gameData?.t1?.rdesc, displayRdesc]);

    const ResultPopup = () => {
        if (!displayRdesc) return null;
        return (
            <div className="cricket20ballpopup">
                <img src="/admin/assets/cards_new/ball-blank.png" alt="ball" />
                <span>{displayRdesc}</span>
            </div>
        );
    };

    const currentGame = gameData?.t1;
    const runners = currentGame?.sub || [];

    const toggleSection = (section) => {
        setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table five-cricket super-over detail-page-container">
                                <div className="game-header">
                                    <span className="game-header-name">Ball By Ball</span>
                                    <span className="float-right game-header-date">Round ID: {getValueAfterDot(currentGame?.mid) || "Loading..."}</span>
                                </div>
                                <div className="container-fluid container-fluid-5">
                                    <div className="row row5">
                                        <div className="col-xl-12">
                                            <CasinoVideo
                                                // gameName={game_name}
                                                // roundId={getValueAfterDot(currentGame?.mid)}
                                                videoSrc={iframe_url}
                                                results={lastResults}
                                                timeLeft={currentGame?.lt || 0}
                                                totalTime={currentGame?.ft || 30}
                                                // isCardDrawerOpen={isCardDrawerOpen}
                                                // setIsCardDrawerOpen={setIsCardDrawerOpen}
                                                Popup={ResultPopup}
                                                resultPath={phpFile}
                                                showCardDrawer={false}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="market-container">
                                    <div className="market-6 ball-by-ball">
                                        <div className="bet-table">
                                            <div
                                                className={`bet-table-header ${openSections.runs ? "" : "collapsed"}`}
                                                onClick={() => toggleSection("runs")}
                                                data-toggle="collapse"
                                                data-target="#market-runs"
                                                aria-expanded={openSections.runs}
                                            >
                                                <div className="nation-name">
                                                    <span title="Runs">
                                                        <a href="javascript:void(0)" onClick={(e) => e.preventDefault()}>
                                                            <img
                                                                src="https://wver.sprintstaticdata.com/v211/static/front/img/arrow-down.svg"
                                                                className="mr-1"
                                                                alt=""
                                                            />
                                                        </a>
                                                        Runs
                                                    </span>
                                                </div>
                                            </div>
                                            <Collapse in={openSections.runs}>
                                                <div id="market-runs" className="bet-table-body container-fluid container-fluid-5">
                                                    <div className="row row5 d-none-mobile">
                                                        <div className="col-12 col-md-6">
                                                            <div className="fancy-tripple">
                                                                <div className="bet-table-row">
                                                                    <div className="nation-name"></div>
                                                                    <div className="back bl-title back-title">Back</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-md-6">
                                                            <div className="fancy-tripple">
                                                                <div className="bet-table-row">
                                                                    <div className="nation-name"></div>
                                                                    <div className="back bl-title back-title">Back</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row row5">
                                                        {runners.map((runner, index) => {
                                                            const isSuspended = runner.gstatus.toUpperCase() !== "ACTIVE" && runner.gstatus.toUpperCase() !== "OPEN";
                                                            const min = formatNumber(sanitizeNumber(runner.min)) || "50";
                                                            const max = formatNumber(sanitizeNumber(runner.max)) || "25K";
                                                            const odds = runner.b || 0;
                                                            const size = formatNumber(sanitizeNumber(runner.bs)) || "0";

                                                            return (
                                                                <div className="col-12 col-md-6" key={runner.sid || index}>
                                                                    <div className="fancy-tripple">
                                                                        <div className="bet-table-mobile-row d-none-desktop">
                                                                            <div className="bet-table-mobile-team-name">
                                                                                <span>{runner.nat}</span>
                                                                                <span className="book-black">0</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="bet-table-row">
                                                                            <div className="nation-name d-none-mobile">
                                                                                <p>{runner.nat}</p>
                                                                                <p className="mb-0 book-black">0</p>
                                                                            </div>
                                                                            <div
                                                                                className={`bl-box back ${odds == 0 || isSuspended ? "no-val" : ""} ${isSuspended ? "suspended" : ""}`}
                                                                                data-title={isSuspended ? "SUSPENDED" : ""}
                                                                                onClick={() => handleOddsClick(runner.nat, odds, runner, true)}
                                                                            >
                                                                                {isSuspended ? (
                                                                                    <>
                                                                                        <span className="d-block odds">—</span>
                                                                                        <img src="/assets/images/lock.svg" style={{ width: "15px" }} />
                                                                                    </>
                                                                                ) : odds != 0 ? (
                                                                                    <>
                                                                                        <span className="d-block odds">{odds}</span>
                                                                                        <span className="d-block">{size}</span>
                                                                                    </>
                                                                                ) : (
                                                                                    <span className="dash-odd">—</span>
                                                                                )}
                                                                            </div>
                                                                            <div className="fancy-min-max">
                                                                                Min:<span>{min}</span><br></br>
                                                                                Max:<span>{max}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </Collapse>
                                        </div>
                                    </div>
                                </div>
                                <div className="casino-remark mt-3">
                                    <div className="remark-icon">
                                        <img src="https://wver.sprintstaticdata.com/v209/static/front/img/icons/remark.png" />
                                    </div>
                                    <marquee>{currentGame?.remark || "Results are based on stream only. Score board may be different or updated later."}</marquee>
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

export default BallByBall;
