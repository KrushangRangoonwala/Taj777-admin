import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketByNation, getIsSuspended, getValueBeforeDot, normalizeNumber } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";

const OneCard2020 = ({ gameData, exposureData, lastResults }) => {
    const { game_type, phpFile, game_name, iframe_url, result_image } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const getMarketByName = (marketName) => getMarketByNation(marketData, marketName, "nat");

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

    const playerMarket = getMarketByName("Player");
    const tieMarket = getMarketByName("Tie");
    const dealerMarket = getMarketByName("Dealer");
    const pairMarket = getMarketByName("Pair");

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table teen1t20">
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
                                <div className="dtobx-top">
                                    <div className={`dragon-box ${getIsSuspended(playerMarket) ? "suspended" : ""}`}>
                                        <div className="flex-book">
                                            <b>Player</b>
                                            <Exposure className="d-block book-black" data={exposureData} id={playerMarket?.sid} />
                                        </div>
                                        <div className="text-center flex-odds">
                                            <span className="d-block">
                                                <b>{getValueBeforeDot(playerMarket?.b1) || "0"}</b>
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`tiebox ${getIsSuspended(tieMarket) ? "suspended" : ""}`}>
                                        <div><b>Tie</b></div>
                                        <div className="text-center flex-odds">
                                            <span className="d-block">
                                                <b>{getValueBeforeDot(tieMarket?.b1) || "0"}</b>
                                            </span>
                                            <Exposure className="d-block book-black" data={exposureData} id={tieMarket?.sid} />
                                        </div>
                                    </div>
                                    <div className={`tiger-box ${getIsSuspended(dealerMarket) ? "suspended" : ""}`}>
                                        <div className="flex-book">
                                            <b>Dealer</b>
                                            <Exposure className="d-block book-black" data={exposureData} id={dealerMarket?.sid} />
                                        </div>
                                        <div className="text-center flex-odds">
                                            <span className="d-block">
                                                <b>{getValueBeforeDot(dealerMarket?.b1) || "0"}</b>
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`pair-box ${getIsSuspended(pairMarket) ? "suspended" : ""}`}>
                                        <div><b>Pair</b></div>
                                        <div className="text-center flex-odds">
                                            <span className="d-block">
                                                <b>{normalizeNumber(pairMarket?.b1) || "0"}</b>
                                            </span>
                                            <Exposure className="d-block book-black" data={exposureData} id={pairMarket?.sid} />
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

export default OneCard2020;