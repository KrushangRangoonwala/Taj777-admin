import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketByNation, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure, getExposure } from "../CasinoCenter";
// import BetLimitInfo from "./components/BetLimitInfo2";
import Rules, { RulesHeader } from "./rules/Rules";
import LastResult from "./components/LastResult";

const ruleList = [
    { label: "Small / Big", value: "1 TO 1" },
    { label: "Odd / Even", value: "1 TO 1" },
    { label: "Specific Double", value: "1 TO 8" },
    { label: "Specific Triple", value: "1 TO 150" },
    { label: "Any Triple", value: "1 TO 30" },
    { label: "Total Points", value: "1 TO 50" },
    { label: "Combination", value: "1 TO 5" },
    { label: "Single Dice", value: "1 TO 3" },
];

const TOTAL_ODDS = [
    { value: 4, odds: "50:1" },
    { value: 5, odds: "20:1" },
    { value: 6, odds: "15:1" },
    { value: 7, odds: "12:1" },
    { value: 8, odds: "8:1" },
    { value: 9, odds: "6:1" },
    { value: 10, odds: "6:1" },
    { value: 11, odds: "6:1" },
    { value: 12, odds: "6:1" },
    { value: 13, odds: "8:1" },
    { value: 14, odds: "12:1" },
    { value: 15, odds: "15:1" },
    { value: 16, odds: "20:1" },
    { value: 17, odds: "50:1" }
];

const DICE_COMBINATIONS = [
    [1, 2], [1, 3], [1, 4], [1, 5], [1, 6],
    [2, 3], [2, 4], [2, 5], [2, 6],
    [3, 4], [3, 5], [3, 6],
    [4, 5], [4, 6],
    [5, 6]
];

const DICE_NUMBERS = [1, 2, 3, 4, 5, 6];

const Sicbo = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url } = useGetFileData();

    const currentGame = gameData?.t1?.[0] || {};
    const marketData = gameData?.t2 || [];

    const getMarket = (name) => getMarketByNation(marketData, name, "nat");

    const BetBox = ({ marketName, className = "", children, isMobileBox = false }) => {
        const market = getMarket(marketName);
        const suspended = getIsSuspended(market);
        const exposure = getExposure(exposureData, market?.sid);

        return (
            <div className={`${className} ${suspended ? "suspended" : ""}`}>
                {children}
                {exposure !== 0 && (
                    isMobileBox ? (
                        <Exposure data={exposureData} id={market?.sid} className="book-black" isInlineColor={false} />
                    ) : (
                        <div className="casino-book book-black">
                            <Exposure data={exposureData} id={market?.sid} isInlineColor={true} />
                        </div>
                    )
                )}
            </div>
        );
    };

    const DiceImage = ({ num }) => (
        <img src={`https://wver.sprintstaticdata.com/v211/static/front/img/dice${num}.png`} alt={`Dice ${num}`} />
    );

    const DesktopLayout = () => (
        <div className="d-none d-xl-block">
            <div className="sicbo-top">
                <div className="sicbo-top-box sicbo-title-box">1:1 Lose if Any Triple</div>
                <div className="sicbo-top-box sicbo-title-box">30:1</div>
                <div className="sicbo-top-box sicbo-title-box">1:1 Lose if Any Triple</div>
            </div>
            <div className="sicbo-middle">
                <BetBox marketName="Small" className="sicbo-middle-small sicbo-square-box">
                    <div>Small</div>
                    <div className="sicbo-box-value">4-10</div>
                </BetBox>
                <div className="sicbo-middle-midle">
                    <div className="sicbo-middle-top-row">
                        <BetBox marketName="ODD" className="sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd">
                            <div>ODD</div>
                        </BetBox>
                        {TOTAL_ODDS.slice(0, 7).map((item) => (
                            <BetBox key={item.value} marketName={`Total ${item.value}`} className="sicbo-middle-top-box sicbo-square-box">
                                <div>{item.value}</div>
                                <div className="sicbo-box-value">{item.odds}</div>
                            </BetBox>
                        ))}
                        <BetBox marketName="Any Triple" className="sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd">
                            <div>Any Triple</div>
                        </BetBox>
                        {TOTAL_ODDS.slice(7).map((item) => (
                            <BetBox key={item.value} marketName={`Total ${item.value}`} className="sicbo-middle-top-box sicbo-square-box">
                                <div>{item.value}</div>
                                <div className="sicbo-box-value">{item.odds}</div>
                            </BetBox>
                        ))}
                        <BetBox marketName="Even" className="sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd">
                            <div>Even</div>
                        </BetBox>
                    </div>
                    <div className="sicbo-middle-middle-row">
                        <div className="sicbo-cube-box-container">
                            <div className="sicbo-top-box sicbo-title-box">
                                <span>1:1 On Single</span> <span>2:1 On Double</span> <span>3:1 On Triple</span>
                            </div>
                            <div className="sicbo-cube-box-group">
                                {DICE_NUMBERS.map((num) => (
                                    <BetBox key={num} marketName={`Single ${num}`} className="sicbo-cube-box sicbo-square-box sicbo-cube-single">
                                        <DiceImage num={num} />
                                    </BetBox>
                                ))}
                            </div>
                        </div>
                        <div className="sicbo-cube-box-container">
                            <div className="sicbo-top-box sicbo-title-box">8:1 Each Double</div>
                            <div className="sicbo-cube-box-group">
                                {DICE_NUMBERS.map((num) => (
                                    <BetBox key={num} marketName={`Double ${num}`} className="sicbo-cube-box sicbo-square-box sicbo-cube-double">
                                        <DiceImage num={num} /> <DiceImage num={num} />
                                    </BetBox>
                                ))}
                            </div>
                        </div>
                        <div className="sicbo-cube-box-container">
                            <div className="sicbo-top-box sicbo-title-box">150:1 Each Triple</div>
                            <div className="sicbo-cube-box-group">
                                {DICE_NUMBERS.map((num) => (
                                    <BetBox key={num} marketName={`Triple ${num}`} className="sicbo-cube-box sicbo-square-box sicbo-cube-tripple">
                                        <DiceImage num={num} /> <DiceImage num={num} /> <DiceImage num={num} />
                                    </BetBox>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <BetBox marketName="BIG" className="sicbo-middle-big sicbo-square-box">
                    <div>Big</div>
                    <div className="sicbo-box-value">11-17</div>
                </BetBox>
            </div>
            <div className="sicbo-bottom">
                <div className="sicbo-cube-box-container">
                    <div className="sicbo-top-box sicbo-title-box">5:1 Two Dice</div>
                    <div className="sicbo-cube-box-group">
                        {DICE_COMBINATIONS.map(([d1, d2], idx) => (
                            <BetBox key={idx} marketName={`Combination ${d1} and ${d2}`} className="sicbo-cube-box sicbo-square-box sicbo-cube-combination">
                                <DiceImage num={d1} /> <DiceImage num={d2} />
                            </BetBox>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const MobileLayout = () => (
        <div className="d-xl-none">
            <div className="sicbo-top">
                <div className="sicbo-cube-box-container">
                    <div className="sicbo-top-box sicbo-title-box">1:1 Lose if Any Triple</div>
                    <div className="sicbo-cube-box-group">
                        <BetBox marketName="Small" className="sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd" isMobileBox={true}>
                            <div>SMALL</div>
                            <div className="sicbo-box-value">4-10</div>
                        </BetBox>
                        <BetBox marketName="ODD" className="sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd" isMobileBox={true}>
                            <div>ODD</div>
                            <div className="sicbo-box-value">1:1</div>
                        </BetBox>
                    </div>
                </div>
                <div className="sicbo-cube-box-container">
                    <div className="sicbo-top-box sicbo-title-box">30:1</div>
                    <div className="sicbo-cube-box-group">
                        <BetBox marketName="Any Triple" className="sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd" isMobileBox={true}>
                            <div>Any Triple</div>
                        </BetBox>
                    </div>
                </div>
                <div className="sicbo-cube-box-container">
                    <div className="sicbo-top-box sicbo-title-box">1:1 Lose if Any Triple</div>
                    <div className="sicbo-cube-box-group">
                        <BetBox marketName="Even" className="sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd" isMobileBox={true}>
                            <div>EVEN</div>
                            <div className="sicbo-box-value">1:1</div>
                        </BetBox>
                        <BetBox marketName="BIG" className="sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd" isMobileBox={true}>
                            <div>BIG</div>
                            <div className="sicbo-box-value">11-17</div>
                        </BetBox>
                    </div>
                </div>
            </div>
            <div className="sicbo-middle">
                <div className="sicbo-middle-left">
                    <div className="sicbo-cube-box-container">
                        <div className="sicbo-top-box sicbo-title-box">8:1 Each Double</div>
                        <div className="sicbo-cube-box-group">
                            {DICE_NUMBERS.map((num) => (
                                <BetBox key={num} marketName={`Double ${num}`} className="sicbo-cube-box sicbo-square-box sicbo-cube-double" isMobileBox={true}>
                                    <DiceImage num={num} /> <DiceImage num={num} />
                                </BetBox>
                            ))}
                        </div>
                    </div>
                    <div className="sicbo-cube-box-container">
                        <div className="sicbo-top-box sicbo-title-box">150:1 Each Triple</div>
                        <div className="sicbo-cube-box-group">
                            {DICE_NUMBERS.map((num) => (
                                <BetBox key={num} marketName={`Triple ${num}`} className="sicbo-cube-box sicbo-square-box sicbo-cube-tripple" isMobileBox={true}>
                                    <DiceImage num={num} /> <DiceImage num={num} /> <DiceImage num={num} />
                                </BetBox>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="sicbo-middle-right">
                    <div className="sicbo-middle-top-row">
                        {TOTAL_ODDS.map((item) => (
                            <BetBox key={item.value} marketName={`Total ${item.value}`} className="sicbo-middle-top-box sicbo-square-box" isMobileBox={true}>
                                <div>{item.value}</div>
                                <div className="sicbo-box-value">{item.odds}</div>
                            </BetBox>
                        ))}
                    </div>
                    <div className="sicbo-bottom">
                        <div className="sicbo-cube-box-container">
                            <div className="sicbo-top-box sicbo-title-box">5:1 Two Dice</div>
                            <div className="sicbo-cube-box-group">
                                {DICE_COMBINATIONS.map(([d1, d2], idx) => (
                                    <BetBox key={idx} marketName={`Combination ${d1} and ${d2}`} className="sicbo-cube-box sicbo-square-box sicbo-cube-combination" isMobileBox={true}>
                                        <DiceImage num={d1} /> <DiceImage num={d2} />
                                    </BetBox>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="sicbo-middle-middle-row">
                        <div className="sicbo-cube-box-container">
                            <div className="sicbo-top-box sicbo-title-box">
                                <span>1:1 On Single</span> <span>2:1 On Double</span> <span>3:1 On Triple</span>
                            </div>
                            <div className="sicbo-cube-box-group">
                                {DICE_NUMBERS.map((num) => (
                                    <BetBox key={num} marketName={`Single ${num}`} className="sicbo-cube-box sicbo-square-box sicbo-cube-single" isMobileBox={true}>
                                        <DiceImage num={num} />
                                    </BetBox>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table sicbo">
                            <CasinoVideo
                                gameName={game_name}
                                roundId={currentGame?.mid}
                                videoSrc={iframe_url}
                                results={lastResults}
                                timeLeft={currentGame?.autotime || 0}
                                totalTime={currentGame?.ft || 30}
                                isCardDrawerOpen={true}
                                showCardDrawer={false}
                            />

                            <div className="casino-detail">
                                <DesktopLayout />
                                <MobileLayout />
                                <LastResult results={lastResults} />
                            </div>
                        </div>
                    </div>
                </div>
                <CasinoRightSidebar />
            </div>
        </div>
    );
};

export default Sicbo;
