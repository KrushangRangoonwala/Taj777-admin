import React, { useState, useEffect } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getValueAfterDot, formatNumber, sanitizeNumber } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
// import { fetchCasinoExposureApi } from "../../../api/api";

const getCardImage = (cardCode) => {
    if (!cardCode) return "/assets/cards_new/1.png";
    const code = cardCode.toString().replace(/DD/g, "");
    if (code === "1") return "/assets/cards_new/1.png";
    if (["A", "K", "W", "2", "3", "4", "6", "10"].includes(code)) return `/assets/cards_new/cricket/${code === "0" ? "10" : code === "W" ? "wicket" : code}.png`;
    return `/assets/cards_new/${code}.png`;
};

const getBallImage = (ballCode) => {
    if (!ballCode) return "/assets/cards_new/1.png";
    const code = ballCode.toString().replace(/DD/g, "");
    if (code === "1") return "/assets/cards_new/1.png";
    const ballName = code === "0" ? "10" : code === "W" ? "wicket" : code;
    return `/assets/cards_new/cricket/${ballName}.png`;
};

const SuperOver = ({ onBetSelection, lastBetTime }) => {
    const { CODE, game_type, phpFile, iframe_url } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [liveScoreData, setLiveScoreData] = useState(null);
    const [results, setResults] = useState([]);
    // const [exposureData, setExposureData] = useState([]);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);

    const is2 = game_type === "superover2";
    const isCricket5 = CODE === "FIVE_5_CRICKET";

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
            if (data) {
                setLiveScoreData(data);
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
                        <div key={i}>
                            <span>
                                <img
                                    style={{ width: "30px" }}
                                    src={getCardImage(card)}
                                    alt={card}
                                />
                            </span>
                        </div>
                    ))}
                </>
            ) : (
                <>
                    {balls.map((ball, idx) => (
                        <div key={idx}>
                            <span>
                                {ball ? (<img src={getBallImage(ball)} alt={`ball-${idx}`} />) : null}
                            </span>
                        </div>
                    ))}
                </>
            )}
        </>
    );

    const handleOddsClick = (marketTitle, runnerName, odds, market, isBack, status) => {
        if (!market || status !== "ACTIVE" && status !== "OPEN" || odds == 0) return;

        if (onBetSelection) {
            onBetSelection({
                teamName: runnerName,
                marketTitle: marketTitle,
                odds: odds,
                minBet: market?.min || 100,
                maxBet: market?.max || 300000,
                isBack,
                marketId: market.sid,
                eventId: getValueAfterDot(currentGame?.mid),
            });
        }
    };

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
                                        {!is2 && (
                                            <div className="col-xl-2 banner d-flex">
                                                <div className="scorecard">
                                                    <div className="scorecard-row">
                                                        <div className="score-top-row">
                                                            <div className="score-team">
                                                                <b>{liveScoreData?.data?.spnnation1 || "ENG"}</b> {liveScoreData?.data?.score1 || "0-0 (0.0)"}
                                                            </div>
                                                            <div>
                                                                <span>
                                                                    CRR {liveScoreData?.data?.spnrunrate1 || liveScoreData?.data?.spnrunrate2 || "0.00"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="scorecard-row">
                                                        <div className="score-top-row">
                                                            <div className="score-team">
                                                                <b>{liveScoreData?.data?.spnnation2 || "RSA"}</b> {liveScoreData?.data?.score2 || "0-0 (0.0)"}
                                                            </div>
                                                            <div></div>
                                                            <div className="score-message">
                                                                {liveScoreData?.data?.spnmessage && <span className="mr-2">{liveScoreData.data.spnmessage}</span>}
                                                                {liveScoreData?.balls?.filter(b => b !== "").map((ball, bidx) => (
                                                                    <span key={bidx} className="ball-runs mr-1">{ball}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className={is2 ? "col-xl-12" : "col-xl-10"}>
                                            <CasinoVideo
                                                // gameName={currentGame?.ename?.split(" ").slice(-2).join(" ") || "Super Over"}
                                                roundId={null}
                                                videoSrc={iframe_url}
                                                results={results}
                                                timeLeft={currentGame?.autotime || 0}
                                                totalTime={currentGame?.ft || 30}
                                                isCardDrawerOpen={isCardDrawerOpen}
                                                setIsCardDrawerOpen={setIsCardDrawerOpen}
                                                CardsComponent={is2 ? null : Cards}
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
                                                <div className="bet-table-header">
                                                    <div className="nation-name">
                                                        <span title="Bookmaker">
                                                            <a href="javascript:void(0)" title="">
                                                                <img src="https://wver.sprintstaticdata.com/v210/static/admin/img/arrow-down.svg" className="mr-1" alt="" />
                                                            </a>
                                                            Bookmaker
                                                        </span>
                                                    </div>
                                                </div>
                                                <div id="market0" className="bet-table-body collapse show">
                                                    <div className="bet-table-row">
                                                        <div className="text-right nation-name">
                                                            <span className="max-bet">
                                                                Min:<span>{formatNumber(sanitizeNumber(currentGame?.min || 100))}</span>
                                                                Max:<span>{formatNumber(sanitizeNumber(currentGame?.max || '3L'))}</span>
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
                                                                        <span style={{ color: "rgb(153, 153, 153)" }}>0</span>
                                                                    </div>
                                                                </div>
                                                                <div className={`bet-table-row ${isSuspended ? 'suspendedtext' : ''}`} data-title={isSuspended ? runner.status : ""}>
                                                                    <div className="nation-name d-none-mobile">
                                                                        <p>{runner.nat}</p>
                                                                        <p className="mb-0 float-left" style={{ color: "rgb(153, 153, 153)" }}>0</p>
                                                                    </div>
                                                                    <div className="bl-box back back" onClick={() => handleOddsClick("Bookmaker", runner.nat, runner.b1, runner, true, runner.status)}>
                                                                        <span className="d-block odds">{runner.b1 || "—"}</span>
                                                                        <span className="d-block">{runner.bs1}</span>
                                                                    </div>
                                                                    <div className="bl-box lay lay" onClick={() => handleOddsClick("Bookmaker", runner.nat, runner.l1, runner, false, runner.status)}>
                                                                        <span className="d-block odds">{runner.l1 || "—"}</span>
                                                                        <span className="d-block">{runner.ls1}</span>
                                                                    </div>
                                                                </div>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Fancy/Fancy1 Markets */}
                                    {[
                                        { title: "Fancy", data: fancyData },
                                        { title: "Tie", data: tieData },
                                        { title: "Fancy1", data: fancy1Data }
                                    ].map((section, sidx) => (
                                        section.data.length > 0 && (
                                            <div className="market-6" key={sidx}>
                                                <div className="bet-table">
                                                    <div className="bet-table-header">
                                                        <div className="nation-name">
                                                            <span title={section.title}>
                                                                <a href="javascript:void(0)" title="">
                                                                    <img src="https://wver.sprintstaticdata.com/v210/static/front/img/arrow-down.svg" className="mr-1" alt="" />
                                                                </a>
                                                                {section.title}
                                                            </span>
                                                        </div>
                                                        {section.title === "Fancy1" && (
                                                            <div className="float-right"><a href="javascript:void(0)" className="btn btn-back">Bet Lock</a></div>
                                                        )}
                                                    </div>
                                                    <div className="bet-table-body collapse show">
                                                        <div className="bet-table-row">
                                                            <div className="text-right nation-name"></div>
                                                            <div className="back bl-title d-none-mobile">Back</div>
                                                            <div className="lay bl-title d-none-mobile">Lay</div>
                                                        </div>
                                                        {section.data.map((item, idx) => {
                                                            const isSuspended = item.status !== "ACTIVE" && item.status !== "OPEN";
                                                            return (
                                                                <div className="fancy-tripple" key={idx}>
                                                                    <div className="bet-table-mobile-row d-none-desktop">
                                                                        <div className="bet-table-mobile-team-name">
                                                                            <span>{item.nat}</span>
                                                                            <span style={{ color: "rgb(153, 153, 153)" }}>0</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className={`bet-table-row ${isSuspended ? 'suspendedtext' : ''}`} data-title={isSuspended ? item.status : ""}>
                                                                        <div className="nation-name d-none-mobile">
                                                                            <p>{item.nat}</p>
                                                                            <p className="mb-0" style={{ color: "rgb(153, 153, 153)" }}>0</p>
                                                                        </div>
                                                                        <div className="bl-box back" onClick={() => handleOddsClick(section.title, item.nat, item.b1, item, true, item.status)}>
                                                                            <span className="d-block odds" style={{ color: item.b1 > 0 ? "black" : "#AAAFB5" }}>
                                                                                {item.b1 > 0 ? item.b1 : "-"}
                                                                            </span>
                                                                            <span className="d-block" style={{ color: item.bs1 > 0 ? "black" : "#AAAFB5" }}>
                                                                                {item.bs1 > 0 ? formatNumber(item.bs1) : "-"}
                                                                            </span>
                                                                        </div>
                                                                        <div className="bl-box lay no-val" onClick={() => handleOddsClick(section.title, item.nat, item.l1, item, false, item.status)}>
                                                                            <span className="d-block odds" style={{ color: item.l1 > 0 ? "black" : "#AAAFB5" }}>
                                                                                {item.l1 > 0 ? item.l1 : "-"}
                                                                            </span>
                                                                            <span className="d-block" style={{ color: item.ls1 > 0 ? "black" : "#AAAFB5" }}>
                                                                                {item.ls1 > 0 ? formatNumber(item.ls1) : "-"}
                                                                            </span>
                                                                        </div>
                                                                        <div className="fancy-min-max">
                                                                            Min:<span>{formatNumber(sanitizeNumber(item.min))}</span> Max:<span>{formatNumber(sanitizeNumber(item.max))}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="right-sidebar">
                        <CasinoRightSidebar />
                        <div className="card mb-2 my-bet cricket-rule">
                            <div className="card-header text-center">
                                <span>{liveScoreData?.spnnation1 || "ENG"} vs {liveScoreData?.spnnation2 || "RSA"}<br />Inning's Card Rules</span>
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperOver;
