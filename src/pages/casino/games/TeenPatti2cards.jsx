import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketByNation, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import LastResult from "./components/LastResult";
import RemarkMarquee from "./components/RemarkMarquee";
import Rules, { RulesHeader } from "./rules/Rules";

const ruleList = [
    { label: "Three card Sequence", value: "1 TO 3" },
    { label: "Four card color", value: "1 TO 9" },
    { label: "Four card Sequence", value: "1 TO 9" },
    { label: "Three of a kind", value: "1 TO 12" },
    { label: "Three card pure Sequence", value: "1 TO 15" },
    { label: "Four card pure Sequence", value: "1 TO 150" },
    { label: "Four of a kind", value: "1 TO 200" },
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

const TeenPatti2cards = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url, result_image } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const getMarketByName = (marketName) => getMarketByNation(marketData, marketName, "nat");

    const playerA = getMarketByName("Player A");
    const playerB = getMarketByName("Player B");
    const miniBaccaratA = getMarketByName("Mini Baccarat A");
    const miniBaccaratB = getMarketByName("Mini Baccarat B");
    const totalA = getMarketByName("Total A") || getMarketByName("Under-Over A");
    const totalB = getMarketByName("Total B") || getMarketByName("Under-Over B");
    const colorPlus = getMarketByName("Color Plus") || getMarketByName("Bonus");

    const BetBox = ({ market, className = "", isBack = true, children }) => {
        const suspended = getIsSuspended(market);
        const odds = isBack ? market?.b1 : market?.l1;
        const displayOdds = (suspended || parseFloat(odds || 0) === 0) ? "0" : odds;

        return (
            <div className={`${className} casino-bl-box-item ${suspended || displayOdds === "0" ? "suspended" : ""}`} style={{ position: 'relative' }}>
                {(suspended || displayOdds === "0") && (
                    <i className="fas fa-lock" style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10,
                        color: '#fff'
                    }}></i>
                )}
                {children}
                <span className="casino-box-odd">
                    {displayOdds}
                </span>
            </div>
        );
    };

    const VideoCards = () => {
        const aCards = [currentGame?.C1, currentGame?.C2].filter(Boolean);
        const bCards = [currentGame?.C3, currentGame?.C4].filter(Boolean);
        return (
            <div className="casino-video-cards-container">
                <div>
                    {aCards.map((card, i) => (
                        <span key={`a-${i}`}><img src={getImage(card, result_image)} alt="card" /></span>
                    ))}
                    {Array.from({ length: Math.max(0, 2 - aCards.length) }).map((_, i) => (
                        <span key={`a-empty-${i}`}><img src={getImage(1, result_image)} alt="card" /></span>
                    ))}
                </div>
                <div>
                    {bCards.map((card, i) => (
                        <span key={`b-${i}`}><img src={getImage(card, result_image)} alt="card" /></span>
                    ))}
                    {Array.from({ length: Math.max(0, 2 - bCards.length) }).map((_, i) => (
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
                        <div className="casino-table teenpatti2cards">
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
                                <div className="d-none-small">
                                    <div className="teen1daycasino-container">
                                        <div className="teen1dayleft">
                                            {/* Player A Row */}
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name">
                                                    <b>Player A</b>{" "}
                                                    <div className="float-right"><Exposure data={exposureData} id={playerA?.sid} className="mr-2" /></div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <BetBox market={playerA} className="back" isBack={true} />
                                                    <BetBox market={playerA} className="lay" isBack={false} />
                                                </div>
                                            </div>
                                            {/* Mini Baccarat A Row */}
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name">
                                                    <b>Mini Baccarat A</b>{" "}
                                                    <div className="float-right"><Exposure data={exposureData} id={miniBaccaratA?.sid} className="mr-2" /></div>
                                                </div>
                                                <div className="casino-bl-box casino-bl-boxfull">
                                                    <BetBox market={miniBaccaratA} className="back" isBack={true} />
                                                </div>
                                            </div>
                                            {/* Total A Row */}
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name">
                                                    <b className="pointer">Total A</b>{" "}
                                                    <div className="float-right"><Exposure data={exposureData} id={totalA?.sid} className="mr-2" /></div>
                                                </div>
                                                <div className="casino-bl-box total-odds">
                                                    <BetBox market={totalA} className="lay" isBack={false}>
                                                        <span>{currentGame?.vunder || 0}</span>
                                                    </BetBox>
                                                    <BetBox market={totalA} className="back" isBack={true}>
                                                        <span>{currentGame?.vover || 0}</span>
                                                    </BetBox>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="teen1daycenter"></div>

                                        <div className="teen1dayright">
                                            {/* Player B Row */}
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name">
                                                    <b>Player B</b>{" "}
                                                    <div className="float-right"><Exposure data={exposureData} id={playerB?.sid} className="mr-2" /></div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <BetBox market={playerB} className="back" isBack={true} />
                                                    <BetBox market={playerB} className="lay" isBack={false} />
                                                </div>
                                            </div>
                                            {/* Mini Baccarat B Row */}
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name">
                                                    <b>Mini Baccarat B</b>{" "}
                                                    <div className="float-right"><Exposure data={exposureData} id={miniBaccaratB?.sid} className="mr-2" /></div>
                                                </div>
                                                <div className="casino-bl-box casino-bl-boxfull">
                                                    <BetBox market={miniBaccaratB} className="back" isBack={true} />
                                                </div>
                                            </div>
                                            {/* Total B Row */}
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name">
                                                    <b className="pointer">Total B</b>{" "}
                                                    <div className="float-right"><Exposure data={exposureData} id={totalB?.sid} className="mr-2" /></div>
                                                </div>
                                                <div className="casino-bl-box total-odds">
                                                    <BetBox market={totalB} className="lay" isBack={false}>
                                                        <span>{currentGame?.vunder || 0}</span>
                                                    </BetBox>
                                                    <BetBox market={totalB} className="back" isBack={true}>
                                                        <span>{currentGame?.vover || 0}</span>
                                                    </BetBox>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Color Plus Section */}
                                    <div className="teenpatti2cardsextra mt-3">
                                        <div className="casino-bl-box casino-bl-boxfull">
                                            <BetBox market={colorPlus} className="back" isBack={true} />
                                        </div>
                                        <div className="teenpatti2cardsextra-book">
                                            <Exposure data={exposureData} id={colorPlus?.sid} />
                                        </div>
                                    </div>
                                </div>

                                <div className="d-none-big">
                                    <div className="casino-box-row">
                                        <div className="casino-nation-name">
                                            <b>Player A</b>{" "}
                                            <div className="float-right"><Exposure data={exposureData} id={playerA?.sid} className="mr-2" /></div>
                                        </div>
                                        <div className="casino-bl-box">
                                            <BetBox market={playerA} className="back" isBack={true} />
                                            <BetBox market={playerA} className="lay" isBack={false} />
                                        </div>
                                    </div>
                                    <div className="casino-box-row">
                                        <div className="casino-nation-name">
                                            <b>Player B</b>{" "}
                                            <div className="float-right"><Exposure data={exposureData} id={playerB?.sid} className="mr-2" /></div>
                                        </div>
                                        <div className="casino-bl-box">
                                            <BetBox market={playerB} className="back" isBack={true} />
                                            <BetBox market={playerB} className="lay" isBack={false} />
                                        </div>
                                    </div>
                                    <div className="casino-box-row">
                                        <div className="casino-nation-name">
                                            <b>Mini Baccarat A</b>{" "}
                                            <div className="float-right"><Exposure data={exposureData} id={miniBaccaratA?.sid} className="mr-2" /></div>
                                        </div>
                                        <div className="casino-bl-box casino-bl-boxfull">
                                            <BetBox market={miniBaccaratA} className="back" isBack={true} />
                                        </div>
                                    </div>
                                    <div className="casino-box-row">
                                        <div className="casino-nation-name">
                                            <b>Mini Baccarat B</b>{" "}
                                            <div className="float-right"><Exposure data={exposureData} id={miniBaccaratB?.sid} className="mr-2" /></div>
                                        </div>
                                        <div className="casino-bl-box casino-bl-boxfull">
                                            <BetBox market={miniBaccaratB} className="back" isBack={true} />
                                        </div>
                                    </div>
                                    <div className="casino-box-row">
                                        <div className="casino-nation-name">
                                            <b className="pointer">Total A</b>{" "}
                                            <div className="float-right"><Exposure data={exposureData} id={totalA?.sid} className="mr-2" /></div>
                                        </div>
                                        <div className="casino-bl-box total-odds">
                                            <BetBox market={totalA} className="lay" isBack={false}>
                                                <span>{currentGame?.vunder || 0}</span>
                                            </BetBox>
                                            <BetBox market={totalA} className="back" isBack={true}>
                                                <span>{currentGame?.vover || 0}</span>
                                            </BetBox>
                                        </div>
                                    </div>
                                    <div className="casino-box-row">
                                        <div className="casino-nation-name">
                                            <b className="pointer">Total B</b>{" "}
                                            <div className="float-right"><Exposure data={exposureData} id={totalB?.sid} className="mr-2" /></div>
                                        </div>
                                        <div className="casino-bl-box total-odds">
                                            <BetBox market={totalB} className="lay" isBack={false}>
                                                <span>{currentGame?.vunder || 0}</span>
                                            </BetBox>
                                            <BetBox market={totalB} className="back" isBack={true}>
                                                <span>{currentGame?.vover || 0}</span>
                                            </BetBox>
                                        </div>
                                    </div>
                                    <div className="teenpatti2cardsextra mt-3">
                                        <div className="casino-bl-box casino-bl-boxfull">
                                            <BetBox market={colorPlus} className="back" isBack={true}>
                                                <span className="casino-box-odd">Color Plus</span>
                                            </BetBox>
                                        </div>
                                        <div className="teenpatti2cardsextra-book">
                                            <Exposure data={exposureData} id={colorPlus?.sid} />
                                        </div>
                                    </div>
                                </div>

                                <div className="casino-remark mt-3">
                                    <div className="remark-icon"><img src="https://wver.sprintstaticdata.com/v211/static/front/img/icons/remark.png" alt="remark" /></div>
                                    <marquee>Play Our New Game Premium Teenpatti 1 Day</marquee>
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

export default TeenPatti2cards;
