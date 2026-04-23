import React, { useState, useEffect } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getValueAfterDot, formatNumber, sanitizeNumber } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import LastResult from "./components/LastResult";
import useIsMobile from "../../../hooks/useIsMobile";
import Collapse from "react-bootstrap/Collapse";

function ScoreCard({ liveScoreData }) {
    const isN1Active = liveScoreData?.activenation1 === "1";
    const isN2Active = liveScoreData?.activenation2 === "1";

    const renderActiveInfo = (n) => {
        const crr = liveScoreData?.[`spnrunrate${n}`] || "0.00";
        const rr = liveScoreData?.[`spnreqrate${n}`];
        return (
            <div>
                <span>CRR {crr}</span>
                {rr && <span className="" style={{ display: "block" }}>RR {rr}</span>}
            </div>
        );
    };

    const renderBalls = () => (
        <div>
            {liveScoreData?.balls?.filter(b => b !== "").map((ball, bidx) => (
                <span key={bidx} className={`ball-runs mr-1 ${ball === "4" ? "four" : ball === "6" ? "six" : ball?.toLowerCase() === "ww" ? "wicket" : ""}`}>{ball}</span>
            ))}
        </div>
    );

    return (
        <div className="col-xl-2 banner d-flex align-items-center mb-1">
            <div className="scorecard">
                <div className="scorecard-row">
                    <div className="score-top-row">
                        <div className="score-team">
                            <b>{liveScoreData?.spnnation1 || "ENG"}</b> {liveScoreData?.score1 || "0-0 (0.0)"}
                        </div>
                        {isN1Active ? renderActiveInfo(1) : <div></div>}
                        {isN2Active && liveScoreData?.spnmessage && (
                            <div className="score-message">
                                <span>{liveScoreData.spnmessage}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="scorecard-row">
                    <div className="score-top-row">
                        <div className="score-team">
                            <b>{liveScoreData?.spnnation2 || "RSA"}</b> {liveScoreData?.score2 || "0-0 (0.0)"}
                        </div>
                        {isN2Active ? renderActiveInfo(2) : <div></div>}
                        <div className="score-message">
                            {isN1Active && liveScoreData?.spnmessage && <span className="mr-2">{liveScoreData.spnmessage}</span>}
                            {renderBalls()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}



const SuperOver = ({ exposureData, lastResults }) => {
    const isSmall = useIsMobile(769);
    const { CODE, game_type, phpFile, iframe_url } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [liveScoreData, setLiveScoreData] = useState(null);
    const [results, setResults] = useState([]);
    // const [exposureData, setExposureData] = useState([]);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [openSections, setOpenSections] = useState({
        bookmaker: true,
        fancy: true,
        tie: true,
        fancy1: true
    });

    const toggleSection = (section) => {
        setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const is2 = game_type === "superover2";
    const isCricket5 = game_type === "cricketv3";

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
                console.error("Error processing SuperOver game data:", error);
            }
        };

        const handleLiveScoreData = (data) => {
            const payload = Array.isArray(data) ? data[0] : data;
            if (payload) {
                setLiveScoreData(payload.data);
            }
        };

        const handleGameResult = (data) => {
            if (data?.res) {
                setResults(data.res);
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
        socket.on("liveScoreGameIn", handleLiveScoreData);
        socket.on("gameResult", handleGameResult);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleData);
            socket.off(game_type, handleData);
            socket.off("liveScoreGameIn", handleLiveScoreData);
            socket.off("gameResult", handleGameResult);
        };
    }, [socket, game_type]);

    const currentGame = gameData?.t1?.[0];
    const bookmakerData = gameData?.t2 || [];
    const fancyData = gameData?.t3 || [];
    const tieData = gameData?.t4?.filter(val => val.nat === "Tie") || [];
    const fancy1Data = gameData?.t4?.filter(val => val.nat !== "Tie") || [];

    const balls = liveScoreData?.balls || ["", "", "", "", "", ""];
    const cards = currentGame ? [currentGame.C1, currentGame.C2, currentGame.C3, currentGame.C4, currentGame.C5, currentGame.C6] : [];

    const Cards = () => (
        <>
            {isCricket5 ? (
                <>
                    {cards.map((card, i) => (
                        card ? (
                            <div key={i}>
                                <span>
                                    <img
                                        style={{ width: "30px" }}
                                        src={`/${import.meta.env.VITE_IMAGE_PATH}/assets/cards_new/${card}.png`}
                                        alt={card}
                                        data-temp-for-search
                                    />
                                </span>
                            </div>
                        ) : null
                    ))}
                </>
            ) : (
                <>
                    {balls.map((ball, idx) => (
                        ball ? (
                            <div key={idx}>
                                <span>
                                    <img src={`/${import.meta.env.VITE_IMAGE_PATH}/assets/cards_new/cricket/${ball}.png`} alt={`ball-${idx}`} data-temp-for-search />
                                </span>
                            </div>
                        ) : null
                    ))}
                </>
            )}
        </>
    );

    const RuleComp = () => <Rules team1={liveScoreData?.spnnation1} team2={liveScoreData?.spnnation2} />
    // console.log('liveScoreData', liveScoreData);
    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className={`casino-table five-cricket super-over super-over2 detail-page-container ${isCricket5 ? 'five-cricket-casino' : ''}`}>
                                <div className="game-header">
                                    <span className="game-header-name">{currentGame?.ename || "IND Vs ENG Super Over2"}</span>
                                    <span className="float-right game-header-date">Round ID: {getValueAfterDot(currentGame?.mid) || "Loading..."}</span>
                                </div>
                                <div className="container-fluid container-fluid-5">
                                    <div className="row row5">
                                        {!is2 && <ScoreCard liveScoreData={liveScoreData} />}

                                        <div className={is2 ? "col-xl-12" : "col-xl-10"}>
                                            <CasinoVideo
                                                // gameName={currentGame?.ename?.split(" ").slice(-2).join(" ") || "Super Over"}
                                                roundId={null}
                                                videoSrc={iframe_url}
                                                cards={cards}
                                                results={results}
                                                timeLeft={currentGame?.autotime || 0}
                                                totalTime={currentGame?.ft || 30}
                                                isCardDrawerOpen={isCardDrawerOpen}
                                                setIsCardDrawerOpen={setIsCardDrawerOpen}
                                                CardsComponent={Cards}
                                                resultPath={phpFile}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="market-container">
                                    {/* Bookmaker */}
                                    {bookmakerData.length > 0 && (
                                        <div className="market-2">
                                            <div className="bet-table">
                                                <div className="bet-table-header" onClick={() => toggleSection("bookmaker")} style={{ cursor: 'pointer' }}>
                                                    <div className="nation-name">
                                                        <span title="Bookmaker">
                                                            <a href="javascript:void(0)" onClick={(e) => e.preventDefault()} title="">
                                                                <img
                                                                    src="https://wver.sprintstaticdata.com/v210/static/admin/img/arrow-down.svg"
                                                                    className="mr-1"
                                                                    alt=""
                                                                    style={{ transform: openSections.bookmaker ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                                                                />
                                                            </a>
                                                            {' '}Bookmaker
                                                        </span>
                                                    </div>
                                                </div>
                                                <Collapse in={openSections.bookmaker}>
                                                    <div id="market0" className="bet-table-body">
                                                        <div className="bet-table-row">
                                                            <div className="text-right nation-name">
                                                                <span className="max-bet">
                                                                    Min:<span>{formatNumber(sanitizeNumber(currentGame?.min || 100))}</span>
                                                                    Max:<span>{currentGame?.max ? formatNumber(currentGame.max) : '5L'}</span>
                                                                </span>
                                                            </div>
                                                            <div className="back bl-title d-none-mobile">Back</div>
                                                            <div className="lay bl-title d-none-mobile">Lay</div>
                                                        </div>
                                                        {bookmakerData.map((runner, idx) => {
                                                            const isSuspended = runner.status !== "ACTIVE" && runner.status !== "OPEN";
                                                            return (
                                                                <React.Fragment key={idx}>
                                                                    <div className="bet-table-mobile-row d-none-desktop">
                                                                        <div className="bet-table-mobile-team-name">
                                                                            <span>{runner.nat}</span>
                                                                            <Exposure className="mb-0" data={exposureData} id={runner?.mid} isInlineColor={true} />
                                                                        </div>
                                                                    </div>
                                                                    <div className={`bet-table-row ${isSuspended ? 'suspendedtext' : ''}`} data-title={isSuspended ? runner.status : ""}>
                                                                        <div className="nation-name d-none-mobile">
                                                                            <p>{runner.nat}</p>
                                                                            <Exposure className="mb-0 float-left" data={exposureData} id={runner?.mid} isInlineColor={true} />
                                                                        </div>
                                                                        <div className="bl-box back back" >
                                                                            <span className="d-block odds">{runner.b1 || "—"}</span>
                                                                            <span className="d-block">{formatNumber(runner.bs1)}</span>
                                                                        </div>
                                                                        <div className="bl-box lay lay" >
                                                                            <span className="d-block odds">{runner.l1 || "—"}</span>
                                                                            <span className="d-block">{formatNumber(runner.ls1)}</span>
                                                                        </div>
                                                                    </div>
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                    </div>
                                                </Collapse>
                                            </div>
                                        </div>
                                    )}

                                    {/* Fancy/Fancy1 Markets */}
                                    {[
                                        { title: "Fancy", data: fancyData, isFancy: true, colmnName1: "", colmnName2: "", isLasyFirst: true },
                                        { title: "Tie", data: tieData },
                                        { title: "Fancy1", data: fancy1Data }
                                    ].map((section, sidx) => (
                                        section.data.length > 0 && (
                                            <div className="market-6" key={sidx}>
                                                <div className="bet-table">
                                                    <div className="bet-table-header" onClick={() => toggleSection(section.title.toLowerCase())} style={{ cursor: 'pointer' }}>
                                                        <div className="nation-name">
                                                            <span title={section.title}>
                                                                <a href="javascript:void(0)" onClick={(e) => e.preventDefault()} title="">
                                                                    <img
                                                                        src="https://wver.sprintstaticdata.com/v210/static/front/img/arrow-down.svg"
                                                                        className="mr-1"
                                                                        alt=""
                                                                        style={{ transform: openSections[section.title.toLowerCase()] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                                                                    />
                                                                </a>
                                                                {' '}{section.title}
                                                            </span>
                                                        </div>
                                                        {!section.isFancy && (
                                                            <div className="float-right"><a href="javascript:void(0)" className="btn btn-back">Bet Lock</a></div>
                                                        )}
                                                    </div>
                                                    <Collapse in={openSections[section.title.toLowerCase()]}>
                                                        <div className="bet-table-body">
                                                            <div className="bet-table-row">
                                                                <div className="text-right nation-name"></div>
                                                                {section.isFancy ?
                                                                    <>
                                                                        <div className="lay bl-title d-none-mobile">No</div>
                                                                        <div className="back bl-title d-none-mobile">Yes</div>
                                                                    </>
                                                                    : <>
                                                                        <div className="back bl-title d-none-mobile">Back</div>
                                                                        <div className="lay bl-title d-none-mobile">Lay</div>
                                                                    </>}
                                                            </div>
                                                            {section.data.map((item, idx) => {
                                                                const isSuspended = item.status !== "ACTIVE" && item.status !== "OPEN";
                                                                return (
                                                                    <div className="fancy-tripple" key={idx}>
                                                                        <div className="bet-table-mobile-row d-none-desktop">
                                                                            <div className="bet-table-mobile-team-name">
                                                                                <span>{item.nat}</span>
                                                                                <Exposure className="mb-0" data={exposureData} id={item?.sid} isInlineColor={true} />
                                                                            </div>
                                                                        </div>
                                                                        <div className={`bet-table-row ${isSuspended ? 'suspendedtext' : ''}`} data-title={isSuspended ? item.status : ""}>
                                                                            <div className="nation-name d-none-mobile">
                                                                                <p>{item.nat}</p>
                                                                                <Exposure className="mb-0" data={exposureData} id={item?.sid} isInlineColor={true} />
                                                                            </div>
                                                                            {section.isLasyFirst ?
                                                                                <>
                                                                                    <div className="bl-box lay no-val" >
                                                                                        <span className="d-block odds" style={{ color: item.l1 > 0 ? "black" : "#AAAFB5" }}>
                                                                                            {item.l1 > 0 ? item.l1 : "-"}
                                                                                        </span>
                                                                                        <span className="d-block" style={{ color: item.ls1 > 0 ? "black" : "#AAAFB5" }}>
                                                                                            {item.ls1 > 0 ? formatNumber(item.ls1) : "-"}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="bl-box back" >
                                                                                        <span className="d-block odds" style={{ color: item.b1 > 0 ? "black" : "#AAAFB5" }}>
                                                                                            {item.b1 > 0 ? item.b1 : "-"}
                                                                                        </span>
                                                                                        <span className="d-block" style={{ color: item.bs1 > 0 ? "black" : "#AAAFB5" }}>
                                                                                            {item.bs1 > 0 ? formatNumber(item.bs1) : "-"}
                                                                                        </span>
                                                                                    </div>
                                                                                </>
                                                                                : <>
                                                                                    <div className="bl-box back" >
                                                                                        <span className="d-block odds" style={{ color: item.b1 > 0 ? "black" : "#AAAFB5" }}>
                                                                                            {item.b1 > 0 ? item.b1 : "-"}
                                                                                        </span>
                                                                                        <span className="d-block" style={{ color: item.bs1 > 0 ? "black" : "#AAAFB5" }}>
                                                                                            {item.bs1 > 0 ? formatNumber(item.bs1) : "-"}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="bl-box lay no-val" >
                                                                                        <span className="d-block odds" style={{ color: item.l1 > 0 ? "black" : "#AAAFB5" }}>
                                                                                            {item.l1 > 0 ? item.l1 : "-"}
                                                                                        </span>
                                                                                        <span className="d-block" style={{ color: item.ls1 > 0 ? "black" : "#AAAFB5" }}>
                                                                                            {item.ls1 > 0 ? formatNumber(item.ls1) : "-"}
                                                                                        </span>
                                                                                    </div>
                                                                                </>}
                                                                            <div className="fancy-min-max">
                                                                                Min:<span>{formatNumber(sanitizeNumber(item.min))}</span> Max:<span>{formatNumber(sanitizeNumber(item.max))}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </Collapse>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                                {isSmall && <LastResult results={lastResults} />}
                            </div>
                        </div>
                    </div>

                    <div className="right-sidebar">
                        <CasinoRightSidebar
                            RulesComponent={isCricket5 ? null : RuleComp}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SuperOver;

function Rules({ team1, team2 }) {
    return (
        <div className="card mb-2 my-bet cricket-rule">
            <div className="card-header text-center">
                <span>{team1 || "ENG"} vs {team2 || "RSA"}<br />Inning's Card Rules</span>
            </div>
            <div className="card-body">
                <div className="card">
                    <div className="card-header">
                        <div className="row row5 mt-1">
                            <div className="col-4">Cards</div>
                            <div className="col-3 text-center">Count</div>
                            <div className="col-5 text-right">Value</div>
                        </div>
                    </div>
                    <div className="card-body">
                        {[
                            { card: "A", count: 5, ball: "1" },
                            { card: "2", count: 5, ball: "2" },
                            { card: "3", count: 5, ball: "3" },
                            { card: "4", count: 5, ball: "4" },
                            { card: "6", count: 5, ball: "6" },
                            { card: "10", count: 5, ball: "0" }
                        ].map((rule, ridx) => (
                            <div className="row row5 mt-1" key={ridx}>
                                <div className="col-4">
                                    <img src={`https://wver.sprintstaticdata.com/v210/static/front/img/superOver/cards/card${rule.card}.png`} alt="" />
                                    <span className="ml-2">X</span>
                                </div>
                                <div className="col-3 text-center">{rule.count}</div>
                                <div className="col-5 text-right value">
                                    <img src={`https://wver.sprintstaticdata.com/v210/static/front/img/superOver/balls/ball${rule.ball}.png`} alt="" />
                                </div>
                            </div>
                        ))}
                        <div className="row row5 mt-1">
                            <div className="col-4">
                                <img src="https://wver.sprintstaticdata.com/v210/static/front/img/superOver/cards/cardK.png" alt="" />
                                <span className="ml-2">X</span>
                            </div>
                            <div className="col-3 text-center">5</div>
                            <div className="col-5 text-right value">
                                WICKET
                                <img src="https://wver.sprintstaticdata.com/v210/static/front/img/superOver/balls/wicket.png" alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}