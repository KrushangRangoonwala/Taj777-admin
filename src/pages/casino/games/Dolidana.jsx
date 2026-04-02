import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketByNation, getIsSuspended, formatNumber } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import RemarkMarquee from "./components/RemarkMarquee";
import Rules, { RulesHeader } from "./rules/Rules";

const Dolidana = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url } = useGetFileData();

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

    const DoliOddsBox = ({ marketName, displayName }) => {
        const market = getMarketByName(marketName);
        const name = displayName || marketName;

        return (
            <div className="doli-odds-box">
                <div className="odd-name">
                    {name}
                    <div className="float-right">
                        <i
                            data-toggle="collapse"
                            data-target={`#range-${market?.sid}`}
                            aria-expanded="false"
                            className="fas fa-info-circle collapsed"
                        ></i>
                        <div id={`#range-${market?.sid}`} className="icon-range collapse">
                            R:<span>{formatNumber(market?.min || 100)}</span>-<span>{formatNumber(market?.max || 100000)}</span>
                        </div>
                    </div>
                </div>
                <div className="casino-bl-box">
                    <BetBox marketName={marketName} className="back casino-bl-box-item">
                        <span className="casino-box-odd">{market?.b1 || 0}</span>
                        <Exposure className="book-black" data={exposureData} id={market?.sid} />
                    </BetBox>
                </div>
            </div>
        );
    };

    const lucky7Market = getMarketByName("Lucky 7");

    const ruleList = [
        { label: "Player A/B", value: "1 TO 1.95" },
        { label: "Any Pair", value: "1 TO 5.75" },
        { label: "Odd/Even", value: "1 TO 1.95" },
        { label: "7 Up/Down", value: "1 TO 2" },
        { label: "Lucky 7", value: "1 TO 15" },
        { label: "Particular Pair", value: "1 TO 29" },
        { label: "Sum Total 2 & 12", value: "1 TO 29" },
        { label: "Sum Total 3 & 11", value: "1 TO 15" },
        { label: "Sum Total 4 & 10", value: "1 TO 10" },
        { label: "Sum Total 5 & 9", value: "1 TO 8" },
        { label: "Sum Total 6 & 8", value: "1 TO 6.5" },
        { label: "Sum Total 7", value: "1 TO 5.5" },
    ];

    function RulesComponent() {
        return (
            <>
                <RulesHeader />
                <div className="card-body" style={{ padding: "10px" }}>
                    <Rules title="Doli Dana Rules" rules={ruleList} />
                </div>
            </>
        )
    }

    const Cards = () => (
        <div>
            <span>
                <img
                    src={getImage(`dice${currentGame?.C1 || 1}`, 'cards_new/dolidana-dice')}
                    alt={`dice${currentGame?.C1}`}
                />
                <img
                    src={getImage(`dice${currentGame?.C2 || 1}`, 'cards_new/dolidana-dice')}
                    alt={`dice${currentGame?.C2}`}
                />
            </span>
        </div>
    );

    const playerAMarket = getMarketByName("Player A");
    const playerBMarket = getMarketByName("Player B");

    const particularPairs = [
        "1-1 Pair", "2-2 Pair", "3-3 Pair", "4-4 Pair", "5-5 Pair", "6-6 Pair"
    ];

    const sumTotals = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table doli-dana">
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
                                    <div className="doli-main">
                                        <div className="players-bet">
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name">
                                                    <b>Player A</b>
                                                    <div className="float-right">
                                                        <Exposure className="mr-2 book-black" data={exposureData} id={playerAMarket?.sid} />
                                                        <i
                                                            data-toggle="collapse"
                                                            data-target="#range1"
                                                            aria-expanded="false"
                                                            className="fas fa-info-circle collapsed"
                                                        ></i>
                                                        <div id="range1" className="icon-range collapse">
                                                            R:<span>{formatNumber(playerAMarket?.min || 100)}</span>-<span>{formatNumber(playerAMarket?.max || 300000)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <BetBox marketName="Player A" className="back casino-bl-box-item">
                                                        <span className="casino-box-odd">{playerAMarket?.b1 || 0}</span>
                                                    </BetBox>
                                                </div>
                                            </div>
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name">
                                                    <b>Player B</b>
                                                    <div className="float-right">
                                                        <Exposure className="mr-2 book-black" data={exposureData} id={playerBMarket?.sid} />
                                                        <i
                                                            data-toggle="collapse"
                                                            data-target="#range2"
                                                            aria-expanded="false"
                                                            className="fas fa-info-circle collapsed"
                                                        ></i>
                                                        <div id="range2" className="icon-range collapse">
                                                            R:<span>{formatNumber(playerBMarket?.min || 100)}</span>-<span>{formatNumber(playerBMarket?.max || 300000)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <BetBox marketName="Player B" className="back casino-bl-box-item">
                                                        <span className="casino-box-odd">{playerBMarket?.b1 || 0}</span>
                                                    </BetBox>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="side-bets">
                                            <div className="any-pair">
                                                <DoliOddsBox marketName="Any Pair" />
                                            </div>
                                            <div className="odd-even-pair">
                                                <div className="bets-box">
                                                    <DoliOddsBox marketName="Odd" />
                                                    <DoliOddsBox marketName="Even" />
                                                </div>
                                            </div>
                                            <div className="lucky7-pair">
                                                <div className="bets-box">
                                                    <DoliOddsBox marketName="Less than 7" displayName="< 7" />
                                                    <div className="doli-odds-box">
                                                        <div className="odd-name">
                                                            Lucky 7
                                                            <div className="float-right">
                                                                <i
                                                                    data-toggle="collapse"
                                                                    data-target="#range23"
                                                                    aria-expanded="false"
                                                                    className="fas fa-info-circle collapsed"
                                                                ></i>
                                                                <div id="range23" className="icon-range collapse">
                                                                    R:<span>{formatNumber(lucky7Market?.min || 100)}</span>-<span>{formatNumber(lucky7Market?.max || 100000)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="casino-bl-box">
                                                            <BetBox marketName="Lucky 7" className="back casino-bl-box-item">
                                                                <span className="casino-box-odd">{lucky7Market?.b1 || 0}</span>
                                                                <Exposure className="book-black" data={exposureData} id={lucky7Market?.sid} />
                                                            </BetBox>
                                                        </div>
                                                    </div>
                                                    <DoliOddsBox marketName="Greater than 7" displayName="> 7" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="doli-other-bets">
                                        <div className="particular-pair">
                                            <h4>Particular Pair</h4>
                                            <div className="bets-box">
                                                {particularPairs.map((pair) => (
                                                    <DoliOddsBox key={pair} marketName={pair} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="sum-odds">
                                            <h4>Odds of Sum Total</h4>
                                            <div className="bets-box">
                                                {sumTotals.map((sum) => (
                                                    <DoliOddsBox key={sum} marketName={`Sum Total ${sum}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {currentGame?.remark && <RemarkMarquee remark={currentGame.remark} />}
                                </div>
                            </div>
                        </div>
                    </div>
                    <CasinoRightSidebar RulesComponent={RulesComponent} />
                </div>
            </div>
        </div>
    );
};

export default Dolidana;