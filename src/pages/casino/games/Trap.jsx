import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketByNation, getIsSuspended, getCardValue } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import RemarkMarquee from "./components/RemarkMarquee";
// import BetLimitInfo from "./components/BetLimitInfo2";

const Trap = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url, result_image } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const cardsString = currentGame?.cards || "";
    const allCards = cardsString.split(",").filter((c) => c !== "");
    const playerACards = allCards.filter((_, idx) => idx % 2 === 0 && allCards[idx] !== "1");
    const playerBCards = allCards.filter((_, idx) => idx % 2 !== 0 && allCards[idx] !== "1");

    const playerAScore = playerACards.reduce((acc, card) => acc + getCardValue(card), 0);
    const playerBScore = playerBCards.reduce((acc, card) => acc + getCardValue(card), 0);

    const playerAMarket = getMarketByNation(marketData, "Player A", "nat");
    const playerBMarket = getMarketByNation(marketData, "Player B", "nat");

    const activeHL = marketData.find((m) => m.subtype === "highlow" && m.gstatus === "OPEN") || marketData.find((m) => m.subtype === "highlow");
    const activeJQK = marketData.find((m) => m.subtype === "jqk" && m.gstatus === "OPEN") || marketData.find((m) => m.subtype === "jqk");

    const lowOdds = activeHL?.odds?.find((o) => o.nat === "Low");
    const highOdds = activeHL?.odds?.find((o) => o.nat === "High");
    const jqkOdds = activeJQK?.odds?.[0];

    const Cards = () => (
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
                <div className="col-6">
                    {playerACards.map((card, idx) => (
                        <span key={idx} data-v-b64efdfa="">
                            <img data-v-b64efdfa="" src={getImage(card, result_image)} alt={card} />
                        </span>
                    ))}
                </div>
                <div className="col-6">
                    {playerBCards.map((card, idx) => (
                        <span key={idx} data-v-b64efdfa="">
                            <img data-v-b64efdfa="" src={getImage(card, result_image)} alt={card} />
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table trap">
                                <CasinoVideo
                                    gameName={game_name}
                                    roundId={currentGame?.mid}
                                    videoSrc={iframe_url}
                                    results={lastResults}
                                    timeLeft={currentGame?.autotime || 0}
                                    totalTime={currentGame?.ft || 30}
                                    CardsComponent={Cards}
                                />

                                <div className="casino-detail">
                                    <div className="teen1daycasino-container">
                                        <div className="teen1dayleft">
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name">
                                                    <b>Player A</b>
                                                    <div className="float-right">
                                                        <Exposure className="mr-2" data={exposureData} id={playerAMarket?.sid} />
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <div className={`back casino-bl-box-item ${getIsSuspended(playerAMarket) ? "suspended" : ""}`}>
                                                        <span className="casino-box-odd">{playerAMarket?.b1 || 0}</span>
                                                    </div>
                                                    <div className={`lay casino-bl-box-item ${getIsSuspended(playerAMarket) ? "suspended" : ""}`}>
                                                        <span className="casino-box-odd">{playerAMarket?.l1 || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="teen1daycenter"></div>
                                        <div className="teen1dayright">
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name">
                                                    <b>Player B</b>
                                                    <div className="float-right">
                                                        <Exposure className="mr-2" data={exposureData} id={playerBMarket?.sid} />
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <div className={`back casino-bl-box-item ${getIsSuspended(playerBMarket) ? "suspended" : ""}`}>
                                                        <span className="casino-box-odd">{playerBMarket?.b1 || 0}</span>
                                                    </div>
                                                    <div className={`lay casino-bl-box-item ${getIsSuspended(playerBMarket) ? "suspended" : ""}`}>
                                                        <span className="casino-box-odd">{playerBMarket?.l1 || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="teen1daycasino-container">
                                        <div className="teen1dayleft">
                                            <div className="seven-up-down-box">
                                                <div className={`up-box ${getIsSuspended(activeHL) ? "suspended" : ""}`}>
                                                    <Exposure className="up-down-book" data={exposureData} id={`${activeHL?.sid}_${lowOdds?.sid}`} />
                                                    <div className="text-right">
                                                        <div className="up-down-odds">{lowOdds?.b || 0}</div> <span>LOW</span>
                                                    </div>
                                                </div>
                                                <div className={`down-box ${getIsSuspended(activeHL) ? "suspended" : ""}`}>
                                                    <div className="text-left">
                                                        <div className="up-down-odds">{highOdds?.b || 0}</div> <span>HIGH</span>
                                                    </div>
                                                    <Exposure className="up-down-book" data={exposureData} id={`${activeHL?.sid}_${highOdds?.sid}`} />
                                                </div>
                                                <div className="seven-box">
                                                    <img src={getImage("trape-seven")} alt="7" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="teen1daycenter"></div>
                                        <div className="teen1dayright">
                                            <div className="casino-box-row jqk-box">
                                                <div className="casino-nation-name">
                                                    <span>
                                                        <img src={getImage("J", "cards")} alt="J" />
                                                        <img src={getImage("Q", "cards")} alt="Q" />
                                                        <img src={getImage("K", "cards")} alt="K" />
                                                    </span>
                                                    <div className="float-right">
                                                        <Exposure className="mr-2" data={exposureData} id={`${activeJQK?.sid}_${jqkOdds?.sid}`} />
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <div className={`back casino-bl-box-item ${getIsSuspended(activeJQK) ? "suspended" : ""}`}>
                                                        <span className="casino-box-odd">{jqkOdds?.b || 0}</span>
                                                    </div>
                                                    <div className={`lay casino-bl-box-item ${getIsSuspended(activeJQK) ? "suspended" : ""}`}>
                                                        <span className="casino-box-odd">{jqkOdds?.l || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="teen1daycasino-container trap-number">
                                        <img src="https://wver.sprintstaticdata.com/v211/static/admin/img/trap-number-bg.jpg" className="img-fluid" alt="trap numbers" />
                                    </div>

                                    <RemarkMarquee remark={currentGame?.remark} />
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

export default Trap;