import React, { useState, useEffect } from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketByNation, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";

const OneCard1day = ({ gameData, exposureData, lastResults }) => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const getMarketByName = (marketName) => getMarketByNation(marketData, marketName, "nat");

    const BetBox = ({ marketName, className = "", children }) => {
        const market = getMarketByName(marketName);
        const suspended = getIsSuspended(market);

        return (
            <div className={`${className} ${suspended ? "suspended" : ""}`}>
                {children}
            </div>
        );
    };

    const UpDownBox = ({ marketName, label, className }) => {
        const market = getMarketByName(marketName);
        const suspended = getIsSuspended(market);
        const odds = market?.b1 || 0;
        const isLeft = marketName.includes("Dealer"); // Based on OneCardOneDay.js logic

        return (
            <div className={`${className} ${suspended ? "suspended" : ""}`}>
                <Exposure className="up-down-book" data={exposureData} id={market?.sid} />
                <div className={isLeft ? "text-left" : "text-right"}>
                    <div className="up-down-odds">{odds}</div>
                    <span>{label}</span>
                </div>
            </div>
        );
    };

    const Cards = () => (
        <>
            <div>
                <div className="dealer-name w-100 mb-1">Player</div>
                <div>
                    <span>
                        <span data-v-b64efdfa="">
                            <img
                                data-v-b64efdfa=""
                                src={getImage(currentGame?.C1, result_image)}
                                alt="Player Card"
                            />
                        </span>
                    </span>
                </div>
            </div>
            <div>
                <div className="dealer-name w-100 mb-1">Dealer</div>
                <div>
                    <span>
                        <span data-v-b64efdfa="">
                            <img
                                data-v-b64efdfa=""
                                src={getImage(currentGame?.C2, result_image)}
                                alt="Dealer Card"
                            />
                        </span>
                    </span>
                </div>
            </div>
        </>
    );

    const dealerMarket = getMarketByName("Dealer");
    const playerMarket = getMarketByName("Player");



    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table teen1oneday">
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
                                                <b>Player</b>
                                                <div className="float-right">
                                                    <Exposure className="mr-2" data={exposureData} id={playerMarket?.sid} />
                                                </div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <BetBox marketName="Player" className="back casino-bl-box-item">
                                                    <span className="casino-box-odd">{playerMarket?.b1 || 0}</span>
                                                </BetBox>
                                                <BetBox marketName="Player" className="lay casino-bl-box-item">
                                                    <span className="casino-box-odd">{playerMarket?.l1 || 0}</span>
                                                </BetBox>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="teen1daycenter"></div>
                                    <div className="teen1dayright">
                                        <div className="casino-box-row">
                                            <div className="casino-nation-name">
                                                <b>Dealer</b>
                                                <div className="float-right">
                                                    <Exposure className="mr-2" data={exposureData} id={dealerMarket?.sid} />
                                                </div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <BetBox marketName="Dealer" className="back casino-bl-box-item">
                                                    <span className="casino-box-odd">{dealerMarket?.b1 || 0}</span>
                                                </BetBox>
                                                <BetBox marketName="Dealer" className="lay casino-bl-box-item">
                                                    <span className="casino-box-odd">{dealerMarket?.l1 || 0}</span>
                                                </BetBox>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="teen1daycasino-container">
                                    <div className="teen1dayleft">
                                        <div className="seven-up-down-box">
                                            <UpDownBox marketName="7 Up Player" label="DOWN" className="up-box" />
                                            <UpDownBox marketName="7 Up Dealer" label="UP" className="down-box" />
                                            <div className="seven-box">
                                                <img
                                                    src="https://wver.sprintstaticdata.com/v208/static/front/img/trape-seven.png"
                                                    alt="7-icon"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="teen1daycenter"></div>
                                    <div className="teen1dayright">
                                        <div className="seven-up-down-box">
                                            <UpDownBox marketName="7 Down Player" label="DOWN" className="up-box" />
                                            <UpDownBox marketName="7 Down Dealer" label="UP" className="down-box" />
                                            <div className="seven-box">
                                                <img
                                                    src="https://wver.sprintstaticdata.com/v208/static/front/img/trape-seven.png"
                                                    alt="7-icon"
                                                />
                                            </div>
                                        </div>
                                    </div>
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