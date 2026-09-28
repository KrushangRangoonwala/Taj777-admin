import React, { useState, useEffect, useRef } from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import RemarkMarquee from "./components/RemarkMarquee";
import Collapse from "react-bootstrap/Collapse";
import BetLimitInfo from "./components/BetLimitInfo2";
import { formatNumber, sanitizeNumber } from "../../../utilies/helpers";

const Goal2 = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url } = useGetFileData();
    const [openSections, setOpenSections] = useState({ column1: true, column2: true, column3: true });
    const [displayRdesc, setDisplayRdesc] = useState("");
    const rdescTimerRef = useRef(null);

    const currentGame = gameData?.t1;
    const data = currentGame?.sub || [];

    useEffect(() => {
        if (currentGame?.rdesc) {
            if (rdescTimerRef.current) {
                clearTimeout(rdescTimerRef.current);
                rdescTimerRef.current = null;
            }
            setDisplayRdesc(currentGame.rdesc);
        } else if (displayRdesc) {
            if (!rdescTimerRef.current) {
                rdescTimerRef.current = setTimeout(() => {
                    setDisplayRdesc("");
                    rdescTimerRef.current = null;
                }, 2000);
            }
        }
    }, [currentGame?.rdesc, displayRdesc]);

    const ResultPopup = () => {
        if (!displayRdesc) return null;

        return (
            <div className="cricket20ballpopup bounce-enter-active bounce-enter-to">
                <img src="/assets/cards/soccer-ball.png" alt="result ball" />
                <span>{displayRdesc}</span>
            </div>
        );
    };

    const toggleSection = (section) => {
        setOpenSections((prevState) => ({
            ...prevState,
            [section]: !prevState[section],
        }));
    };

    const PlayerRowBackLay = ({ player }) => {
        const isSuspended = player.gstatus?.toUpperCase() === "SUSPENDED";
        const odds = player.b;
        const layOdds = player.l;

        return (
            <div className="col-12 col-md-12">
                <div className="fancy-tripple">
                    <div className="bet-table-mobile-row d-none-desktop">
                        <div className="bet-table-mobile-team-name">
                            <span>{player.nat}</span>{" "}
                            <span className="book-black">
                                <Exposure data={exposureData} id={player.sid} />
                            </span>
                        </div>
                    </div>
                    <div className="bet-table-row">
                        <div className="nation-name d-none-mobile">
                            <p>{player.nat}</p>
                            <p className="mb-0 book-black">
                                <Exposure data={exposureData} id={player.sid} />
                            </p>
                        </div>
                        <div
                            data-title={isSuspended ? "SUSPENDED" : undefined}
                            className={`bl-box back ${isSuspended ? "no-val suspended" : ""}`}
                        >
                            <span className="d-block odds">{isSuspended ? "—" : (odds || "—")}</span>
                        </div>
                        <div
                            data-title={isSuspended ? "SUSPENDED" : undefined}
                            className={`bl-box lay ${isSuspended ? "no-val suspended" : ""}`}
                        >
                            <span className="d-block odds">{isSuspended ? "—" : (layOdds || "—")}</span>
                        </div>
                        <div className="fancy-min-max">
                            <BetLimitInfo min={player.min} max={player.max} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ComboPlayerRow = ({ player }) => {
        const isSuspended = player.gstatus?.toUpperCase() === "SUSPENDED";
        const odds = player.b;

        return (
            <div className="col-6 col-md-6">
                <div className="fancy-tripple">
                    <div className="bet-table-mobile-row d-none-desktop">
                        <div className="bet-table-mobile-team-name">
                            <span>{player.nat}</span>{" "}
                            <span className="book-black">
                                <Exposure data={exposureData} id={player.sid} />
                            </span>
                        </div>
                    </div>
                    <div className="bet-table-row">
                        <div className="nation-name d-none-mobile">
                            <p>{player.nat}</p>
                            <p className="mb-0 book-black">
                                <Exposure data={exposureData} id={player.sid} />
                            </p>
                        </div>
                        <div
                            data-title={isSuspended ? "SUSPENDED" : undefined}
                            className={`bl-box back ${isSuspended ? "no-val suspended" : ""}`}
                        >
                            <span className="d-block odds">{isSuspended ? "—" : (odds || "—")}</span>
                        </div>
                        <div className="fancy-min-max">
                            <BetLimitInfo min={player.min} max={player.max} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table five-cricket super-over detail-page-container goal goal2">
                                <div className="game-header">
                                    <span className="game-header-name">Goal 2</span>{" "}
                                    <span className="float-right game-header-date">
                                        Round ID: {currentGame?.mid}
                                    </span>
                                </div>
                                <div className="container-fluid container-fluid-5">
                                    <div className="row row5">
                                        <div className="col-xl-12">
                                            <CasinoVideo
                                                gameName={game_name}
                                                roundId={currentGame?.mid}
                                                videoSrc={iframe_url}
                                                results={lastResults}
                                                timeLeft={currentGame?.lt || 0}
                                                totalTime={currentGame?.ft || 30}
                                                Popup={ResultPopup}
                                                showCardDrawer={false}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="market-container">
                                    {/* Section 1: Who Will Goal Next? */}
                                    <div className="market-6" id="goto-column1">
                                        <div className="bet-table">
                                            <div
                                                data-toggle="collapse"
                                                data-target="#market-player"
                                                aria-expanded={openSections.column1}
                                                className={`bet-table-header ${openSections.column1 ? "" : "collapsed"}`}
                                                onClick={() => toggleSection("column1")}
                                            >
                                                <div className="nation-name">
                                                    <span title="Who Will Goal Next?">
                                                        Who Will Goal Next?
                                                    </span>
                                                </div>
                                            </div>
                                            <Collapse in={openSections.column1}>
                                                <div
                                                    id="market-player"
                                                    className="bet-table-body container-fluid container-fluid-5"
                                                >
                                                    <div className="row row5 d-none-mobile">
                                                        <div className="col-12 col-md-12">
                                                            <div className="fancy-tripple">
                                                                <div className="bet-table-row">
                                                                    <div className="nation-name"></div>
                                                                    <div className="back bl-title back-title">Back</div>
                                                                    <div className="lay bl-title lay-title">Lay</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row row5">
                                                        {data.slice(0, 12).map((player, index) => (
                                                            <PlayerRowBackLay key={index} player={player} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </Collapse>
                                        </div>
                                    </div>

                                    {/* Section 2: Method Of Next Goal */}
                                    <div className="market-6" id="goto-column2">
                                        <div className="bet-table">
                                            <div
                                                data-toggle="collapse"
                                                data-target="#market-goal"
                                                aria-expanded={openSections.column2}
                                                className={`bet-table-header ${openSections.column2 ? "" : "collapsed"}`}
                                                onClick={() => toggleSection("column2")}
                                            >
                                                <div className="nation-name">
                                                    <span title="Method Of Next Goal">
                                                        Method Of Next Goal
                                                    </span>
                                                </div>
                                            </div>
                                            <Collapse in={openSections.column2}>
                                                <div
                                                    id="market-goal"
                                                    className="bet-table-body container-fluid container-fluid-5"
                                                >
                                                    <div className="row row5 d-none-mobile">
                                                        <div className="col-12 col-md-12">
                                                            <div className="fancy-tripple">
                                                                <div className="bet-table-row">
                                                                    <div className="nation-name"></div>
                                                                    <div className="back bl-title back-title">Back</div>
                                                                    <div className="lay bl-title lay-title">Lay</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row row5">
                                                        {data.slice(12, 17).map((player, index) => (
                                                            <PlayerRowBackLay key={index} player={player} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </Collapse>
                                        </div>
                                    </div>

                                    {/* Section 3: Method Of Combination Goal */}
                                    <div className="market-comb" id="goto-column3">
                                        <div className="bet-table">
                                            <div
                                                data-toggle="collapse"
                                                data-target="#market-combo"
                                                aria-expanded={openSections.column3}
                                                className={`bet-table-header ${openSections.column3 ? "" : "collapsed"}`}
                                                onClick={() => toggleSection("column3")}
                                            >
                                                <div className="nation-name">
                                                    <span title="Method Of Combination Goal">
                                                        Method Of Combination Goal
                                                    </span>
                                                </div>
                                            </div>
                                            <Collapse in={openSections.column3}>
                                                <div
                                                    id="market-combo"
                                                    className="bet-table-body container-fluid container-fluid-5"
                                                >
                                                    <div className="row row5 d-none-mobile">
                                                        <div className="col-6 col-md-6">
                                                            <div className="fancy-tripple">
                                                                <div className="bet-table-row">
                                                                    <div className="nation-name"></div>
                                                                    <div className="back bl-title back-title">Back</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-6 col-md-6">
                                                            <div className="fancy-tripple">
                                                                <div className="bet-table-row">
                                                                    <div className="nation-name"></div>
                                                                    <div className="back bl-title back-title">Back</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row row5">
                                                        {data.slice(17).map((player, index) => (
                                                            <ComboPlayerRow key={index} player={player} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </Collapse>
                                        </div>
                                    </div>
                                </div>
                                <RemarkMarquee remark={currentGame?.remark} />
                            </div>
                        </div>
                    </div>
                    <CasinoRightSidebar />
                </div>
            </div>
        </div>
    );
};

export default Goal2;
