import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import RemarkMarquee from "./components/RemarkMarquee";
import { Exposure } from "../CasinoCenter";
import BetLimitInfo2 from "./components/BetLimitInfo2";

const BallBox = ({ market, currentGame, exposureData }) => {
    const suspended = getIsSuspended(market);
    const ball_ = market?.nat?.split(" ")[1];
    const ball = Number(ball_);

    return (
        <div className="score-box">
            <div className="team-score">
                <div>
                    <div className="text-center">
                        <b>Team A</b>
                    </div>
                    <div className="text-center">
                        <span className="ml-1">{currentGame?.C2}/{currentGame?.C3}</span>
                        <span className="ml-1">{currentGame?.C4} Overs</span>
                    </div>
                </div>
                <div>
                    <div className="text-center">
                        <b>Team B</b>
                    </div>
                    <div className="text-center">
                        <span className="ml-1">{currentGame?.C5}/{currentGame?.C6}</span>
                        <span className="ml-1">{currentGame?.C7} Overs</span>
                    </div>
                </div>
            </div>
            <div className="ball-icon">
                <img 
                    src={`https://wver.sprintstaticdata.com/v211/static/admin/img/balls/ball${ball}.png`} 
                    alt={`Ball ${ball}`} 
                />
            </div>
            <div className={`blbox ${suspended ? "suspended" : ""}`}>
                <div className="back">
                    <Exposure className="up-down-book" data={exposureData} id={market?.sid} />
                    <span className="odds d-block">{market?.b1 || 0}</span>
                </div>
                <div className="lay">
                    <span className="odds d-block">{market?.l1 || 0}</span>
                </div>
            </div>
            <div className="c20minmax">
                <BetLimitInfo2 min={market?.min} max={market?.max} />
            </div>
        </div>
    );
};

const Cricket20 = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url, result_image } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const Cards = () => (
        <>
            <span data-v-b64efdfa="">
                <img
                    data-v-b64efdfa=""
                    src={getImage(currentGame?.C1, result_image)}
                    alt="Dealer Card"
                />
            </span>
        </>
    );

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table cricket20">
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
                                <div className="teen20casino-container">
                                    <div className="teen20left">
                                        {marketData.slice(0, 5).map((market, index) => (
                                            <BallBox 
                                                key={market.sid || index} 
                                                market={market} 
                                                currentGame={currentGame} 
                                                exposureData={exposureData}
                                            />
                                        ))}
                                    </div>
                                    <div className="teen20right">
                                        {marketData.slice(5).map((market, index) => (
                                            <BallBox 
                                                key={market.sid || index} 
                                                market={market} 
                                                currentGame={currentGame} 
                                                exposureData={exposureData}
                                            />
                                        ))}
                                    </div>
                                </div>
                                
                                <RemarkMarquee remark={currentGame?.remark} />
                            </div>
                        </div>
                    </div>
                </div>
                
                <CasinoRightSidebar />
            </div>
        </div>
    );
};

export default Cricket20;