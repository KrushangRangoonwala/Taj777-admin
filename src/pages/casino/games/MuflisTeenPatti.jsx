import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketBySid, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import Rules, { RulesHeader } from "./rules/Rules";
import LastResult from "./components/LastResult";

const ruleList = [
    { label: "Card 9", value: "1 TO 3" },
    { label: "Card 8", value: "1 TO 4" },
    { label: "Card 7", value: "1 TO 5" },
    { label: "Card 6", value: "1 TO 8" },
    { label: "Card 5", value: "1 TO 30" },
];

function RulesComponent() {
    return (
        <>
            <RulesHeader />
            <div className="card-body" style={{ padding: "10px" }}>
                <Rules title="Top 9" rules={ruleList} />
            </div>
        </>
    );
}

const MuflisTeenPatti = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url, result_image } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const getMarket = (sid) => getMarketBySid(marketData, sid);

    const winnerA = getMarket(1);
    const winnerB = getMarket(2);
    const top9A = getMarket(3);
    const top9B = getMarket(4);
    const baccaratA = getMarket(5);
    const baccaratB = getMarket(6);

    const BetBox = ({ market, className = "", children, displayValue }) => {
        const suspended = getIsSuspended(market);
        const odds = market?.b1 || "0";
        const isLocked = !market?.b1 || market?.b1 === "0" || market?.b1 === "0.00";

        return (
            <div className={`${className} casino-bl-box-item ${suspended || isLocked ? "suspended" : ""}`} style={{ position: 'relative' }}>
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
                    {displayValue || (isLocked || suspended ? "0" : odds)}
                </span>
                <span className="book-black">
                    <Exposure data={exposureData} id={market?.sid} />
                </span>
            </div>
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

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table muflis">
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
                                <div className="teen1daycasino-container">
                                    {/* Player A Section */}
                                    <div className="teen1dayleft">
                                        <div className="casino-box-row">
                                            <div className="casino-nation-name no-border casino-bl-box-title">
                                                <div className="playera text-left">Player A</div>
                                            </div>
                                        </div>
                                        <div className="row row5">
                                            <div className="col-12 col-md-4">
                                                <div className="casino-box-row">
                                                    <div className="casino-nation-name"><b>Winner</b></div>
                                                    <div className="casino-bl-box">
                                                        <BetBox market={winnerA} className="back" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <div className="casino-box-row">
                                                    <div className="casino-nation-name"><b>Top 9</b></div>
                                                    <div className="casino-bl-box">
                                                        <BetBox market={top9A} className="back" displayValue="A" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <div className="casino-box-row">
                                                    <div className="casino-nation-name"><b>M Baccarat A</b></div>
                                                    <div className="casino-bl-box">
                                                        <BetBox market={baccaratA} className="back" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="teen1daycenter"></div>

                                    {/* Player B Section */}
                                    <div className="teen1dayright">
                                        <div className="casino-box-row">
                                            <div className="casino-nation-name no-border casino-bl-box-title">
                                                <div className="playerb text-left">Player B</div>
                                            </div>
                                        </div>
                                        <div className="row row5">
                                            <div className="col-12 col-md-4">
                                                <div className="casino-box-row">
                                                    <div className="casino-nation-name"><b>Winner</b></div>
                                                    <div className="casino-bl-box">
                                                        <BetBox market={winnerB} className="back" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <div className="casino-box-row">
                                                    <div className="casino-nation-name"><b>Top 9</b></div>
                                                    <div className="casino-bl-box">
                                                        <BetBox market={top9B} className="back" displayValue="B" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <div className="casino-box-row">
                                                    <div className="casino-nation-name"><b>M Baccarat B</b></div>
                                                    <div className="casino-bl-box">
                                                        <BetBox market={baccaratB} className="back" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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

export default MuflisTeenPatti;
