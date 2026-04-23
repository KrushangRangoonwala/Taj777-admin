import React, { useState, useEffect, useRef } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { formatNumber, sanitizeNumber, getValueAfterDot } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import Collapse from "react-bootstrap/Collapse";
import RemarkMarquee from "./components/RemarkMarquee";

// import { fetchCasinoExposureApi } from "../../../api/api";

const BallByBall = ({ exposureData, gameData, lastResults }) => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const isLucky15 = game_type === "lucky15";
    const [results, setResults] = useState([]);
    const [openSections, setOpenSections] = useState({ runs: true });
    const [displayRdesc, setDisplayRdesc] = useState("");
    const rdescTimerRef = useRef(null);

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
                <img src={`/${import.meta.env.VITE_IMAGE_PATH}/assets/cards_new/ball-blank.png`} alt="ball" data-temp-for-search />
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
                                    <span className="game-header-name">{game_name}</span>
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
                                    <div className={`market-6 ${isLucky15 ? "" : "ball-by-ball"}`}>
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
                                                                style={{ display: isLucky15 ? "none" : "" }}
                                                            />
                                                        </a>
                                                        Runs
                                                    </span>
                                                </div>
                                            </div>
                                            <Collapse in={openSections.runs}>
                                                <div id="market-runs" className="bet-table-body container-fluid container-fluid-5">
                                                    <div className="row row5 d-none-mobile">
                                                        <div className={`${isLucky15 ? "col-6" : "col-12"} col-md-6`}>
                                                            <div className="fancy-tripple">
                                                                <div className="bet-table-row">
                                                                    <div className="nation-name"></div>
                                                                    <div className="back bl-title back-title">Back</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className={`${isLucky15 ? "col-6" : "col-12"} col-md-6`}>
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
                                                                <div className={`${isLucky15 ? "col-6" : "col-12"} col-md-6`} key={runner.sid || index}>
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
                                {!isLucky15 && <RemarkMarquee remark={currentGame?.remark} />}
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
