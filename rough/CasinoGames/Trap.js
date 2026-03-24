import React, { useState, useEffect } from "react";
import { fetchCasinoExposureApi } from "../../api/api";
import { getImage, getValueAfterDot, getIsSuspended, getExposureClass } from "../../utilies/helpers";
import { useGetFileData } from "../../hooks/useGetFileData";
import CasinoVideo from "./components/CasinoVideo";
import useIsMobile from "../../hooks/useIsMobile";
import { useSocket } from "../Socket/useSocket";
import RemarkMarquee from "./components/RemarkMarquee";

const Trap = ({ isVisible, onBetSelection, lastBetTime }) => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [exposureData, setExposureData] = useState([]);
    const isMobile = useIsMobile(767);


    useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.[0]?.mid) return;
            try {
                const response = await fetchCasinoExposureApi({
                    markettype: CODE,
                    main_event_id: gameData.t1[0].mid,
                    curPageName: phpFile,
                });
                const aaa = response?.data
                const bbb = Array.isArray(aaa) ? aaa : Object.values(aaa || {});
                setExposureData(bbb);
            } catch (error) {
                console.error("Error fetching exposure:", error);
            }
        };
        fetchExposure();
    }, [gameData?.t1?.[0]?.mid, lastBetTime, CODE, phpFile]);

    const getExposure = (marketId) => {
        if (!Array.isArray(exposureData)) return 0;
        const market = exposureData.find((item) => item.market_id == marketId);
        return market ? market.win_loss || market.total_exposure : 0;
    };

    const renderExposure = (marketId, className = "") => {
        const exposure = getExposure(marketId?.toString());
        if (exposure === 0) return null; // classname : up-down-book
        return (
            <span className={`mr-2 ${className} ${getExposureClass(exposure)}`}>
                {exposure}
            </span>
        );
    };

    const socket = useSocket("casino");
    useEffect(() => {
        if (!socket) return;

        const handleGameData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) {
                    setGameData(payload);
                }
            } catch (error) {
                console.error("Error processing Trap data:", error);
            }
        };

        const handleConnect = () => {
            socket.emit("Room", game_type);
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on("game", handleGameData);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleGameData);
        };
    }, [socket, game_type]);

    const currentGame = gameData?.t1?.[0];
    const data = gameData?.t2 || [];

    const handleOddsClick = (marketName, odds, market, isBack, suspended, marketId) => {
        if (!market || suspended || odds == 0) return;

        const min = market?.min || 100;
        const max = market?.max || 300000;

        if (onBetSelection) {
            onBetSelection({
                teamName: marketName,
                odds: odds,
                minBet: min,
                maxBet: max,
                isBack,
                marketId: marketId ?? market.sid,
                eventId: getValueAfterDot(currentGame?.mid),
            });
        }
    };

    const isSuspended = (market) => getIsSuspended(market);

    const cardsString = currentGame?.cards || "";
    const allCards = cardsString.split(",").filter(c => c !== "");
    const playerACards = allCards.filter((_, idx) => idx % 2 === 0 && allCards[idx] !== "1");
    const playerBCards = allCards.filter((_, idx) => idx % 2 !== 0 && allCards[idx] !== "1");

    const getCardValue = (card) => {
        if (!card || card === "1") return 0;
        const valStr = card.replace(/[SHDCs hdc]/g, ""); // Remove suit
        if (valStr === "A") return 1;
        if (valStr === "J") return 11;
        if (valStr === "Q") return 12;
        if (valStr === "K") return 13;
        return parseInt(valStr) || 0;
    };

    const playerAScore = playerACards.reduce((acc, card) => acc + getCardValue(card), 0);
    const playerBScore = playerBCards.reduce((acc, card) => acc + getCardValue(card), 0);

    const CardsComponent = () => (
        <div className="casino-video-cards-container">
            <div className="row row5">
                <div className="col-6 text-center">
                    <span>
                        <b>A</b>
                        <div className="player-count">{playerAScore}</div>
                    </span>
                </div>
                <div className="col-6 text-center">
                    <span>
                        <b>B</b>
                        <div className="player-count">{playerBScore}</div>
                    </span>
                </div>
            </div>
            <div className="row row5">
                <div className="col-6 text-center">
                    <div className="d-inline-block w-100 v-slider">
                        <div style={{ display: "none" }}><i className="fas fa-angle-up"></i></div>
                        <div className="v-slider-outer" style={{ overflow: "hidden", height: "190px" }}>
                            {playerACards.map((card, idx) => (
                                <div key={idx} style={{ height: "47.5px" }}>
                                    <img src={getImage(card, result_image)} className="w-100" alt={card} />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: "none" }}><i className="fas fa-angle-down"></i></div>
                    </div>
                </div>
                <div className="col-6 text-center">
                    <div className="d-inline-block w-100 v-slider">
                        <div style={{ display: "none" }}><i className="fas fa-angle-up"></i></div>
                        <div className="v-slider-outer" style={{ overflow: "hidden", height: "190px" }}>
                            {playerBCards.map((card, idx) => (
                                <div key={idx} style={{ height: "47.5px" }}>
                                    <img src={getImage(card, result_image)} className="w-100" alt={card} />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: "none" }}><i className="fas fa-angle-down"></i></div>
                    </div>
                </div>
            </div>
        </div>
    );

    const marketA = data.find(m => m.nat === "Player A");
    const marketB = data.find(m => m.nat === "Player B");

    // Filter subtypes: highlow, jqk. There are 14 card slots.
    // In socket data, "Card 2" etc.
    const getCardMarket = (subtype, cardIdx) => {
        const cardNat = `Card ${cardIdx + 1}`;
        return data.find(m => m.subtype === subtype && m.nat === cardNat);
    };

    // Find current active card for high/low and jqk
    // Based on socket data, Card 2 is OPEN, Card 1 is SUSPENDED.
    // I will render the card markets that are visible or at least some of them.
    // The HTML structure shows one high/low box and one JQK box.
    // Likely these correspond to the "current" card being dealt.

    const activeHL = data.find(m => m.subtype === "highlow" && m.gstatus === "OPEN") || data.find(m => m.subtype === "highlow");
    const activeJQK = data.find(m => m.subtype === "jqk" && m.gstatus === "OPEN") || data.find(m => m.subtype === "jqk");

    return (
        <div className="casino-table trap">
            <CasinoVideo
                gameName={game_name}
                roundId={currentGame?.mid}
                videoSrc={iframe_url}
                isCardDrawerOpen={isCardDrawerOpen}
                setIsCardDrawerOpen={setIsCardDrawerOpen}
                autotime={currentGame?.autotime}
                totalTime={currentGame?.ft}
                CardsComponent={CardsComponent}
                cards={allCards}
            />

            <div className="casino-detail">
                <div className="teen1daycasino-container">
                    <div className="teen1dayleft">
                        <div className="casino-box-row">
                            <div className="casino-nation-name" style={{ backgroundImage: "url(/assets/images/trape-bg.png)" }}>
                                <b>{marketA?.nat || "Player A"}</b>
                                <div className="float-right">{renderExposure(marketA?.sid)}</div>
                            </div>
                            <div className="casino-bl-box">
                                <div
                                    className={`back casino-bl-box-item ${isSuspended(marketA) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick(marketA?.nat, marketA?.b1, marketA, true, isSuspended(marketA))}
                                >
                                    <span className="casino-box-odd">{marketA?.b1 || "0"}</span>
                                </div>
                                <div
                                    className={`lay casino-bl-box-item ${isSuspended(marketA) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick(marketA?.nat, marketA?.l1, marketA, false, isSuspended(marketA))}
                                >
                                    <span className="casino-box-odd">{marketA?.l1 || "0"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="teen1daycenter"></div>

                    <div className="teen1dayright">
                        <div className="casino-box-row">
                            <div className="casino-nation-name" style={{ backgroundImage: "url(/assets/images/trape-bg.png)" }}>
                                <b>{marketB?.nat || "Player B"}</b>
                                <div className="float-right">{renderExposure(marketB?.sid)}</div>
                            </div>
                            <div className="casino-bl-box">
                                <div
                                    className={`back casino-bl-box-item ${isSuspended(marketB) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick(marketB?.nat, marketB?.b1, marketB, true, isSuspended(marketB))}
                                >
                                    <span className="casino-box-odd">{marketB?.b1 || "0"}</span>
                                </div>
                                <div
                                    className={`lay casino-bl-box-item ${isSuspended(marketB) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick(marketB?.nat, marketB?.l1, marketB, false, isSuspended(marketB))}
                                >
                                    <span className="casino-box-odd">{marketB?.l1 || "0"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="teen1daycasino-container">
                    <div className="teen1dayleft">
                        <div className="seven-up-down-box">
                            {(() => {
                                const lowOdds = activeHL?.odds?.find(o => o.nat === "Low");
                                const highOdds = activeHL?.odds?.find(o => o.nat === "High");
                                // console.log('qqq lowOdds', lowOdds)
                                // console.log('qqq highOdds', highOdds)
                                // const exposureLow = getExposure(`${activeHL?.sid}_${lowOdds?.sid}`);
                                // const exposureHigh = getExposure(`${activeHL?.sid}_${highOdds?.sid}`);
                                return (
                                    <>
                                        <div
                                            className={`up-box ${isSuspended(activeHL) ? "suspended" : ""}`}
                                            onClick={() => handleOddsClick(`${activeHL?.nat} ${lowOdds?.nat}`, lowOdds?.b, activeHL, true, isSuspended(activeHL), `${activeHL?.sid}_${lowOdds?.sid}`)}
                                            style={{ backgroundImage: "url(/assets/images/trape-back.png)" }}
                                        >
                                            {renderExposure(`${activeHL?.sid}_${lowOdds?.sid}`, "up-down-book")}
                                            <div className="text-right">
                                                <div className="up-down-odds">{lowOdds?.b || "0"}</div> <span>LOW</span>
                                            </div>
                                        </div>

                                        <div
                                            className={`down-box ${isSuspended(activeHL) ? "suspended" : ""}`}
                                            onClick={() => handleOddsClick(`${activeHL?.nat} ${highOdds?.nat}`, highOdds?.b, activeHL, true, isSuspended(activeHL), `${activeHL?.sid}_${highOdds?.sid}`)}
                                            style={{ backgroundImage: "url(/assets/images/trape-back.png)" }}
                                        >
                                            <div className="text-left">
                                                <div className="up-down-odds">{highOdds?.b || "0"}</div> <span>HIGH</span>
                                            </div>
                                            {renderExposure(`${activeHL?.sid}_${highOdds?.sid}`, "up-down-book")}
                                        </div>
                                    </>
                                )
                            })()}
                            <div className="seven-box"><img src="https://wver.sprintstaticdata.com/v198/static/front/img/trape-seven.png" alt="7" /></div>
                        </div>
                    </div>
                    <div className="teen1daycenter"></div>
                    <div className="teen1dayright">
                        <div className="casino-box-row jqk-box">
                            <div className="casino-nation-name" style={{ backgroundImage: "url(/assets/images/trape-bg.png)" }}>
                                <span>
                                    <img src="/assets/cards/J.png" alt="J" />
                                    <img src="/assets/cards/Q.png" alt="Q" />
                                    <img src="/assets/cards/K.png" alt="K" />
                                </span>
                                <div className="float-right">{renderExposure(`${activeJQK?.sid}_${activeJQK?.odds?.[0]?.sid}`)}</div>
                            </div>
                            <div className="casino-bl-box">
                                <div
                                    className={`back casino-bl-box-item ${isSuspended(activeJQK) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick(`${activeJQK?.nat} JQK`, activeJQK?.odds?.[0]?.b, activeJQK, true, isSuspended(activeJQK), `${activeJQK?.sid}_${activeJQK?.odds?.[0]?.sid}`)}
                                >
                                    <span className="casino-box-odd">{activeJQK?.odds?.[0]?.b || "0"}</span>
                                </div>
                                <div
                                    className={`lay casino-bl-box-item ${isSuspended(activeJQK) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick(`${activeJQK?.nat} JQK`, activeJQK?.odds?.[0]?.l, activeJQK, false, isSuspended(activeJQK), `${activeJQK?.sid}_${activeJQK?.odds?.[0]?.sid}`)}
                                >
                                    <span className="casino-box-odd">{activeJQK?.odds?.[0]?.l || "0"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="teen1daycasino-container trap-number d-none-desktop">
                    <img src="/assets/cards_new/trap13.png" className="img-fluid" alt="13" />
                    <img src="/assets/cards_new/trap14.png" className="img-fluid" alt="14" />
                    <img src="/assets/cards_new/trap15.png" className="img-fluid" alt="15" />
                </div>

                <RemarkMarquee remark={currentGame?.remark} />
            </div>
        </div>
    );
};

export default Trap;
