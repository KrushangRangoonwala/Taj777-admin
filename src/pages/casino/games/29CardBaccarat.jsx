import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketBySid, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import LastResult from "./components/LastResult";
import Rules, { RulesHeader } from "./rules/Rules";

const ruleList = [
    { label: "Straight", value: "1 TO 2" },
    { label: "Flush", value: "1 TO 5" },
    { label: "Trio", value: "1 TO 20" },
    { label: "Straight Flush", value: "1 TO 30" },
];

function RulesComponent() {
    return (
        <>
            <RulesHeader />
            <div className="card-body" style={{ padding: "10px" }}>
                <Rules title="Color Plus Rules" rules={ruleList} />
            </div>
        </>
    );
}

const TwentyNineCardBaccarat = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url, result_image } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const getMarket = (sid) => getMarketBySid(marketData, sid);

    const BetBox = ({ sid, label, className = "" }) => {
        const market = getMarket(sid);
        const suspended = getIsSuspended(market);
        const odds = market?.b1 || "0";
        const isLocked = !market?.b1 || market?.b1 === "0" || market?.b1 === "0.00";

        // Custom display for Color Plus
        let displayOdds = odds;
        if (sid === 7 && parseFloat(odds) === 2) displayOdds = "A";
        if (sid === 8 && parseFloat(odds) === 2) displayOdds = "B";

        return (
            <>
                <div className="casino-bl-box-item d-none-big"><span>{label}</span></div>
                <div className={`${className} back casino-bl-box-item ${suspended || isLocked ? "suspended" : ""}`} style={{ position: 'relative' }}>
                    {(suspended || isLocked) && (
                        <i className="fas fa-lock" style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 10,
                            color: '#fff'
                        }}></i>
                    )}
                    <span className="casino-box-odd">
                        {displayOdds}
                    </span>
                    <Exposure className="casino-book" data={exposureData} id={market?.sid} />
                </div>
            </>
        );
    };

    const VideoCards = () => {
        const aCards = [currentGame?.C1, currentGame?.C3, currentGame?.C5].filter(Boolean);
        const bCards = [currentGame?.C2, currentGame?.C4, currentGame?.C6].filter(Boolean);
        return (
            <div className="casino-video-cards-container">
                <div>
                    {aCards.map((card, i) => (
                        <span key={`a-${i}`}><img src={getImage(card, result_image)} alt="card" /></span>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - aCards.length) }).map((_, i) => (
                        <span key={`a-empty-${i}`}><img src={getImage(1, result_image)} alt="card" /></span>
                    ))}
                </div>
                <div>
                    {bCards.map((card, i) => (
                        <span key={`b-${i}`}><img src={getImage(card, result_image)} alt="card" /></span>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - bCards.length) }).map((_, i) => (
                        <span key={`b-empty-${i}`}><img src={getImage(1, result_image)} alt="card" /></span>
                    ))}
                </div>
            </div>
        );
    };

    const Lucky9Section = () => {
        const market = getMarket(9);
        const suspended = getIsSuspended(market);
        const backOdds = market?.b1 || "0";
        const layOdds = market?.l1 || "0";
        const isBackLocked = !market?.b1 || market?.b1 === "0" || market?.b1 === "0.00";
        const isLayLocked = !market?.l1 || market?.l1 === "0" || market?.l1 === "0.00";

        return (
            <div className="sin-khal-box">
                <img src={getImage("lucky9", "static")} alt="Lucky 9" onError={(e) => { e.target.src = "https://wver.sprintstaticdata.com/v211/static/front/img/lucky9.png" }} />
                <div className="casino-bl-box">
                    <div className={`back casino-bl-box-item ${suspended || isBackLocked ? "suspended" : ""}`}>
                        <span className="casino-box-odd">{backOdds}</span>
                    </div>
                    <div className={`lay casino-bl-box-item ${suspended || isLayLocked ? "suspended" : ""}`}>
                        <span className="casino-box-odd">{layOdds}</span>
                    </div>
                    <div className="sin-khal-box-book book-black">
                        <Exposure data={exposureData} id={market?.sid} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table sin-khal">
                            <CasinoVideo
                                gameName={game_name}
                                roundId={currentGame?.mid}
                                videoSrc={iframe_url}
                                results={lastResults}
                                timeLeft={currentGame?.autotime || 0}
                                totalTime={currentGame?.ft || 30}
                                CardsComponent={VideoCards}
                            />

                            <div className="casino-detail">
                                <div className="teen20casino-container">
                                    {/* Player A Section */}
                                    <div className="teen20left">
                                        <div className="casino-box-row">
                                            <div className="casino-nation-name no-border casino-bl-box-title">
                                                <div className="playera">Player A</div>
                                            </div>
                                        </div>
                                        <div className="casino-bl-box casino-bl-box-title d-none-small">
                                            <div className="casino-bl-box-item"><span>Winner</span></div>
                                            <div className="casino-bl-box-item"><span>High Card</span></div>
                                            <div className="casino-bl-box-item"><span>Pair</span></div>
                                            <div className="casino-bl-box-item"><span>Color Plus</span></div>
                                        </div>
                                        <div className="casino-bl-box">
                                            <BetBox sid={1} label="Winner" />
                                            <BetBox sid={3} label="High Card" />
                                            <BetBox sid={5} label="Pair" />
                                            <BetBox sid={7} label="Color Plus" />
                                        </div>
                                    </div>

                                    <div className="teen20center"></div>

                                    {/* Player B Section */}
                                    <div className="teen20right">
                                        <div className="casino-box-row">
                                            <div className="casino-nation-name no-border casino-bl-box-title">
                                                <div className="playerb">Player B</div>
                                            </div>
                                        </div>
                                        <div className="casino-bl-box casino-bl-box-title d-none-small">
                                            <div className="casino-bl-box-item"><span>Winner</span></div>
                                            <div className="casino-bl-box-item"><span>High Card</span></div>
                                            <div className="casino-bl-box-item"><span>Pair</span></div>
                                            <div className="casino-bl-box-item"><span>Color Plus</span></div>
                                        </div>
                                        <div className="casino-bl-box">
                                            <BetBox sid={2} label="Winner" />
                                            <BetBox sid={4} label="High Card" />
                                            <BetBox sid={6} label="Pair" />
                                            <BetBox sid={8} label="Color Plus" />
                                        </div>
                                    </div>
                                </div>

                                <Lucky9Section />
                                <LastResult results={lastResults} />
                            </div>
                        </div>
                    </div>
                </div>
                <CasinoRightSidebar RulesComponent={RulesComponent} />
            </div>
        </div>
    );
};

export default TwentyNineCardBaccarat;
