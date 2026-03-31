import React, { useState, useEffect } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
// import { fetchCasinoExposureApi } from "../../../api/API";
import { getImage, getMarketByNation, getValueAfterDot, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import BetLimitInfo from "./components/BetLimitInfo2";

const OneCard1day = ({ gameData, exposureData, lastResults }) => {
    const { CODE, game_type, phpFile, game_name, iframe_url, result_image } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const getMarketByName = (marketName) => getMarketByNation(marketData, marketName, "nat");

    const BetBox = ({ market, text, className = "" }) => {
        const suspended = getIsSuspended(market);

        return (
            <div className={`casino-bl-box-item ${suspended ? "suspended" : ""} ${className}`}>
                <span className="casino-box-odd">{text}</span>
            </div>
        );
    };

    const boardCards = [
        currentGame?.BC1,
        currentGame?.BC2,
        currentGame?.BC3,
        currentGame?.BC4,
        currentGame?.BC5,
    ].filter(Boolean);

    const playerACards = [currentGame?.C1, currentGame?.C2].filter(Boolean);
    const playerBCards = [currentGame?.C3, currentGame?.C4].filter(Boolean);

    const playerA = getMarketByName("Player A");
    const playerB = getMarketByName("Player B");
    const playerABonus2 = getMarketByName("2 Cards Bonus A");
    const playerBBonus2 = getMarketByName("2 Cards Bonus B");
    const playerABonus7 = getMarketByName("7 Cards Bonus A");
    const playerBBonus7 = getMarketByName("7 Cards Bonus B");

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table poker1day">
                            <CasinoVideo
                                gameName={game_name}
                                roundId={currentGame?.mid}
                                videoSrc={iframe_url}
                                cards={boardCards}
                                results={lastResults}
                                timeLeft={currentGame?.autotime || 0}
                                totalTime={currentGame?.ft || 30}
                            />

                            <div className="casino-detail">
                                {/* Player A Box */}
                                <div className="playerabox">
                                    <div className="casino-box-row playerafabcy">
                                        <div className="casino-nation-name">
                                            <div className="float-left mr-2">
                                                <BetLimitInfo min={playerA?.min} max={playerA?.max} />
                                            </div>
                                            <b>Player A</b>
                                        </div>
                                        <div className="casino-bl-box">
                                            <BetBox market={playerA} className="back" text={playerA?.b1 || 0} />
                                            <BetBox market={playerA} className="lay" text={playerA?.l1 || 0} />
                                        </div>
                                    </div>
                                    <div className="casino-nation-name text-center w-100">
                                        <Exposure id={playerA?.sid} className="casino-book" data={exposureData} />
                                    </div>

                                    {/* Bonus Section for Player A */}
                                    <div className="casino-box poker1dayother mt-2">
                                        <div className="casino-bl-box">
                                            <div className="odds-min-max">
                                                <span className="float-right casino-min-max pr-2">
                                                    <BetLimitInfo min={playerABonus2?.min} max={playerABonus2?.max} />
                                                </span>
                                            </div>
                                            <div className="odds-min-max pl-2">
                                                <span className="float-right casino-min-max">
                                                    <BetLimitInfo min={playerABonus7?.min} max={playerABonus7?.max} />
                                                </span>
                                            </div>
                                        </div>
                                        <div className="casino-bl-box">
                                            <BetBox market={playerABonus2} className="back" text="2 Cards Bonus" />
                                            <BetBox market={playerABonus7} className="back" text="7 Cards Bonus" />
                                        </div>
                                        <div className="casino-bl-box">
                                            <div className="odds-min-max">
                                                <Exposure id={playerABonus2?.sid} className="casino-book" data={exposureData} />
                                            </div>
                                            <div className="odds-min-max">
                                                <Exposure id={playerABonus7?.sid} className="casino-book" data={exposureData} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card box between Player A and B */}
                                <div className="playerabcardbox">
                                    <div className="poker-icon">
                                        <img src="https://wver.sprintstaticdata.com/v208/static/front/img/poker.png" alt="poker-icon" />
                                    </div>
                                    <div className="row row5 w-100">
                                        <div className="col-12 col-md-6">
                                            <div className="dealer-name playera">Player A</div>
                                            <div className="mt-1">
                                                {playerACards.map((card, index) => (
                                                    <span key={index} data-v-b64efdfa="">
                                                        <img
                                                            data-v-b64efdfa=""
                                                            src={getImage(card, result_image)}
                                                            alt={`player-a-card-${index}`}
                                                        />
                                                    </span>
                                                ))}
                                                {Array.from({ length: Math.max(0, 2 - playerACards.length) }).map((_, index) => (
                                                    <span key={`empty-a-${index}`} data-v-b64efdfa="">
                                                        <img data-v-b64efdfa="" src={getImage(1, result_image)} alt="empty" />
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6 text-right">
                                            <div className="dealer-name playerb">Player B</div>
                                            <div className="mt-1">
                                                {playerBCards.map((card, index) => (
                                                    <span key={index} data-v-b64efdfa="">
                                                        <img
                                                            data-v-b64efdfa=""
                                                            src={getImage(card, result_image)}
                                                            alt={`player-b-card-${index}`}
                                                        />
                                                    </span>
                                                ))}
                                                {Array.from({ length: Math.max(0, 2 - playerBCards.length) }).map((_, index) => (
                                                    <span key={`empty-b-${index}`} data-v-b64efdfa="">
                                                        <img data-v-b64efdfa="" src={getImage(1, result_image)} alt="empty" />
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Player B Box */}
                                <div className="playerbbox">
                                    <div className="casino-box-row playerbfabcy">
                                        <div className="casino-nation-name">
                                            <div className="float-left mr-2">
                                                <BetLimitInfo min={playerB?.min} max={playerB?.max} />
                                            </div>
                                            <b>Player B</b>
                                        </div>
                                        <div className="casino-bl-box">
                                            <BetBox market={playerB} className="back" text={playerB?.b1 || 0} />
                                            <BetBox market={playerB} className="lay" text={playerB?.l1 || 0} />
                                        </div>
                                    </div>
                                    <div className="casino-nation-name text-center w-100">
                                        <Exposure id={playerB?.sid} className="casino-book" data={exposureData} />
                                    </div>

                                    {/* Bonus Section for Player B */}
                                    <div className="casino-box poker1dayother mt-2">
                                        <div className="casino-bl-box">
                                            <div className="odds-min-max">
                                                <span className="float-right casino-min-max pr-2">
                                                    <BetLimitInfo min={playerBBonus2?.min} max={playerBBonus2?.max} />
                                                </span>
                                            </div>
                                            <div className="odds-min-max pl-2">
                                                <span className="float-right casino-min-max">
                                                    <BetLimitInfo min={playerBBonus7?.min} max={playerBBonus7?.max} />
                                                </span>
                                            </div>
                                        </div>
                                        <div className="casino-bl-box">
                                            <BetBox market={playerBBonus2} className="back" text="2 Cards Bonus" />
                                            <BetBox market={playerBBonus7} className="back" text="7 Cards Bonus" />
                                        </div>
                                        <div className="casino-bl-box">
                                            <div className="odds-min-max">
                                                <Exposure id={playerBBonus2?.sid} className="casino-book" data={exposureData} />
                                            </div>
                                            <div className="odds-min-max">
                                                <Exposure id={playerBBonus7?.sid} className="casino-book" data={exposureData} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="casino-remark mt-3">
                                    <div className="remark-icon">
                                        <img src="https://wver.sprintstaticdata.com/v208/static/front/img/icons/remark.png" alt="remark-icon" />
                                    </div>
                                    <marquee>Play Our New Game Premium Teenpatti 1 Day</marquee>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <CasinoRightSidebar />
            </div>
        </div>
    );
};

export default OneCard1day;