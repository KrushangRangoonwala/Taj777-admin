import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketByNation, getIsSuspended, formatNumber } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import RemarkMarquee from "./components/RemarkMarquee";

const cardNames = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const ThreeCardsJudgement = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url, result_image } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const getMarketByName = (marketName) => getMarketByNation(marketData, marketName, "nat");

    const markets = {
        YES: getMarketByName("Yes") || marketData.find((m) => m.sid == 1),
        NO: getMarketByName("No") || marketData.find((m) => m.sid == 2),
    };

    const CardsComponent = () => {
        const cards = [currentGame?.C1, currentGame?.C2, currentGame?.C3].filter((c) => c && c !== "0");
        return (
            <div>
                {cards.map((c, i) => (
                    <span key={i}>
                        <img
                            src={getImage(c, c == 1 ? "cards_new" : result_image)}
                            alt={`card-${i}`}
                        />
                    </span>
                ))}
            </div>
        );
    };

    const remarkText = currentGame?.remark || "";

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table threecardj">
                                <CasinoVideo
                                    gameName={game_name}
                                    roundId={currentGame?.mid}
                                    videoSrc={iframe_url}
                                    results={lastResults}
                                    timeLeft={currentGame?.autotime || 0}
                                    totalTime={currentGame?.ft || 30}
                                    CardsComponent={CardsComponent}
                                />
                                <div className="casino-detail">
                                    <div className="threecardj-container">
                                        <div className="threecardj-bl-box back">
                                            <div className="threecardj-title">
                                                <b>Yes</b>{" "}
                                                <Exposure
                                                    className="casino-book"
                                                    data={exposureData}
                                                    id={markets.YES?.sid}
                                                />
                                            </div>
                                            <div className={`threecardj-cards ${getIsSuspended(markets.YES) ? "suspended" : ""}`}>
                                                <div className="threecardj-odds text-center">
                                                    <b>{markets.YES?.b1 || 0}</b>
                                                </div>
                                                <div className="casino-cards text-center mt-1">
                                                    {cardNames.map((name, index) => (
                                                        <div key={index} className="casino-card-item">
                                                            <div className="card-image">
                                                                <span data-v-b64efdfa="">
                                                                    <img
                                                                        data-v-b64efdfa=""
                                                                        src={getImage(name, "cards")}
                                                                        alt={name}
                                                                    />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="casino-min-max text-right">
                                                    <span>
                                                        Select any 3 card and you will win if you will get at least 1 card from the 3 cards you have selected.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="threecardj-bl-box lay">
                                            <div className="threecardj-title">
                                                <b>No</b>{" "}
                                                <Exposure
                                                    className="casino-book"
                                                    data={exposureData}
                                                    id={markets.NO?.sid}
                                                />
                                            </div>
                                            <div className={`threecardj-cards ${getIsSuspended(markets.NO) ? "suspended" : ""}`}>
                                                <div className="threecardj-odds text-center">
                                                    <b>{markets.NO?.b1 || 0}</b>
                                                </div>
                                                <div className="casino-cards text-center mt-1">
                                                    {cardNames.map((name, index) => (
                                                        <div key={index} className="casino-card-item">
                                                            <div className="card-image">
                                                                <span data-v-b64efdfa="">
                                                                    <img
                                                                        data-v-b64efdfa=""
                                                                        src={getImage(name, "cards")}
                                                                        alt={name}
                                                                    />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="casino-min-max text-right">
                                                    <span>
                                                        Select any 3 card and you will win If you do not get any card from the 3 cards you have selected.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right casino-min-max">
                                        R:<span>{formatNumber(markets.YES?.min) || 100}</span>-
                                        <span>{formatNumber(markets.YES?.max) || "2L"}</span>
                                    </div>

                                    <RemarkMarquee remark={remarkText} />
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

export default ThreeCardsJudgement;