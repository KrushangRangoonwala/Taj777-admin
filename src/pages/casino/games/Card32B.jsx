import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getIsSuspended, getCardValue, getMarketByNation } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import BetLimitInfo from "./components/BetLimitInfo2";
import Rules, { RulesHeader } from "./rules/Rules";
import LastResult from "./components/LastResult";

const ruleList = [
    { label: "Player 8", value: "8, 9, 10, J, Q, K, A, 2, 3, 4, 5, 6, 7" },
    { label: "Player 9", value: "9, 10, J, Q, K, A, 2, 3, 4, 5, 6, 7, 8" },
    { label: "Player 10", value: "10, J, Q, K, A, 2, 3, 4, 5, 6, 7, 8, 9" },
    { label: "Player 11", value: "11, J, Q, K, A, 2, 3, 4, 5, 6, 7, 8, 9, 10" },
];

function RulesComponent() {
    return (
        <>
            <RulesHeader />
            <div className="card-body" style={{ padding: "10px" }}>
                <Rules title="32 Cards Rules" rules={ruleList} />
            </div>
        </>
    );
}

const Card32B = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url, result_image } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const marketData = [
        ...(gameData?.t2 || []),
        ...(gameData?.t3 || []),
        ...(gameData?.t4 || [])
    ];

    const getMarket = (name) => getMarketByNation(marketData, name, "nat");

    const winners = [
        { name: "Player 8", cardKey: "C1", initial: 8, id: "winner-0" },
        { name: "Player 9", cardKey: "C2", initial: 9, id: "winner-1" },
        { name: "Player 10", cardKey: "C3", initial: 10, id: "winner-2" },
        { name: "Player 11", cardKey: "C4", initial: 11, id: "winner-3" },
    ];

    const oddEvens = [
        { name: "Player 8", odd: "Player 8 Odd", even: "Player 8 Even", id: "odd-evan-1" },
        { name: "Player 9", odd: "Player 9 Odd", even: "Player 9 Even", id: "odd-evan-2" },
        { name: "Player 10", odd: "Player 10 Odd", even: "Player 10 Even", id: "odd-evan-3" },
        { name: "Player 11", odd: "Player 11 Odd", even: "Player 11 Even", id: "odd-evan-4" },
    ];

    const fancies = [
        { name: "Any 3 Card Black", id: "fancy1-0" },
        { name: "Any 3 Card Red", id: "fancy1-1" },
        { name: "Two Black Two Red", id: "fancy1-2" },
    ];

    const totals = [
        { name: "8 & 9 Total", id: "fancy-18" },
        { name: "10 & 11 Total", id: "fancy-19" },
    ];

    const singles = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

    const Cards = () => (
        <>
            {winners.map((player, idx) => {
                const card = currentGame?.[player.cardKey];
                if (!card || card === "1") return null;
                const score = getCardValue(card) + player.initial;
                return (
                    <div key={idx} className="w-100">
                        <div className="dealer-name w-100">
                            <span>{player.name}:</span>
                            <span className="text-warning ml-1">{score}</span>
                        </div>
                        <div className="mt-1">
                            <span>
                                <img
                                    src={getImage(card, result_image)}
                                    alt={player.name}
                                    style={{ width: "25px" }}
                                />
                            </span>
                        </div>
                    </div>
                );
            })}
        </>
    );

    const BetBox = ({ market, className = "", isBack = true, children, isRate = true }) => {
        const suspended = getIsSuspended(market);
        const odds = isBack ? market?.b1 : market?.l1;
        const displayOdds = (suspended || parseFloat(odds || 0) === 0) ? "0" : odds;

        return (
            <div className={`${className} ${suspended || displayOdds === "0" ? "suspended" : ""}`} style={{ position: 'relative' }}>
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
                {isRate && (
                    <span className="casino-box-odd" style={{ fontSize: (suspended || displayOdds === "0") ? '16px' : '' }}>
                        {displayOdds}
                    </span>
                )}
                {children}
            </div>
        );
    };

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table cards32b">
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
                                {/* Winner Section */}
                                <div className="teen1daycasino-container d-none-small">
                                    <div className="teen1dayleft">
                                        <div className="casino-box-row mb-0">
                                            <div className="casino-nation-name no-border casino-bl-box-title">
                                                <div className="playerb"></div>
                                            </div>
                                            <div className="casino-bl-box casino-bl-box-title">
                                                <div className="casino-bl-box-item"><b>Back</b></div>
                                                <div className="casino-bl-box-item"><b>Lay</b></div>
                                            </div>
                                        </div>
                                        {winners.map((player, idx) => {
                                            const market = getMarket(player.name);
                                            return (
                                                <div className="casino-box-row" key={idx}>
                                                    <div className="casino-nation-name">
                                                        <b>{player.name}</b>
                                                        <div className="float-right">
                                                            <Exposure className="mr-2 casino-book" data={exposureData} id={market?.sid} />
                                                            <BetLimitInfo min={market?.min} max={market?.max} />
                                                        </div>
                                                    </div>
                                                    <div className="casino-bl-box">
                                                        <BetBox market={market} className="back casino-bl-box-item" isBack={true} />
                                                        <BetBox market={market} className="lay casino-bl-box-item" isBack={false} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="teen1daycenter"></div>

                                    {/* Odd/Even Section */}
                                    <div className="teen1dayright">
                                        <div className="casino-box-row mb-0">
                                            <div className="casino-nation-name no-border casino-bl-box-title">
                                                <div className="playerb"></div>
                                            </div>
                                            <div className="casino-bl-box casino-bl-box-title">
                                                <div className="casino-bl-box-item"><b>Odd</b></div>
                                                <div className="casino-bl-box-item"><b>Even</b></div>
                                            </div>
                                        </div>
                                        {oddEvens.map((player, idx) => {
                                            const oddMarket = getMarket(player.odd);
                                            const evenMarket = getMarket(player.even);
                                            return (
                                                <div className="casino-box-row" key={idx}>
                                                    <div className="casino-nation-name">
                                                        <b>{player.name}</b>
                                                        <div className="float-right">
                                                            <BetLimitInfo min={oddMarket?.min || evenMarket?.min} max={oddMarket?.max || evenMarket?.max} />
                                                        </div>
                                                    </div>
                                                    <div className="casino-bl-box">
                                                        <BetBox market={oddMarket} className="back casino-bl-box-item" isBack={true}>
                                                            <Exposure className="casino-book" data={exposureData} id={oddMarket?.sid} />
                                                        </BetBox>
                                                        <BetBox market={evenMarket} className="back casino-bl-box-item" isBack={true}>
                                                            <Exposure className="casino-book" data={exposureData} id={evenMarket?.sid} />
                                                        </BetBox>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Fancy & Totals Section */}
                                <div className="teen1daycasino-container mt-4 d-none-small">
                                    <div className="teen1dayleft">
                                        <div className="casino-box-row mb-0">
                                            <div className="casino-nation-name no-border casino-bl-box-title">
                                                <div className="playerb"></div>
                                            </div>
                                            <div className="casino-bl-box casino-bl-box-title">
                                                <div className="casino-bl-box-item"><b>Back</b></div>
                                                <div className="casino-bl-box-item"><b>Lay</b></div>
                                            </div>
                                        </div>
                                        {fancies.map((fancy, idx) => {
                                            const market = getMarket(fancy.name);
                                            return (
                                                <div className="casino-box-row" key={idx}>
                                                    <div className="casino-nation-name">
                                                        <b>{fancy.name}</b>
                                                        <div className="float-right">
                                                            <Exposure className="mr-2 casino-book" data={exposureData} id={market?.sid} />
                                                            <BetLimitInfo min={market?.min} max={market?.max} />
                                                        </div>
                                                    </div>
                                                    <div className="casino-bl-box">
                                                        <BetBox market={market} className="back casino-bl-box-item" isBack={true} />
                                                        <BetBox market={market} className="lay casino-bl-box-item" isBack={false} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="teen1daycenter"></div>

                                    <div className="teen1dayright right1">
                                        <div className="casino-box-row mb-0">
                                            <div className="casino-nation-name no-border casino-bl-box-title">
                                                <div className="playerb"></div>
                                            </div>
                                            <div className="casino-bl-box casino-bl-box-title">
                                                <div className="casino-bl-box-item"><b>Back</b></div>
                                            </div>
                                        </div>
                                        {totals.map((total, idx) => {
                                            const market = getMarket(total.name);
                                            return (
                                                <div className="casino-box-row" key={idx}>
                                                    <div className="casino-nation-name">
                                                        <b>{total.name}</b>
                                                        <div className="float-right">
                                                            <Exposure className="mr-2 casino-book" data={exposureData} id={market?.sid} />
                                                            <BetLimitInfo min={market?.min} max={market?.max} />
                                                        </div>
                                                    </div>
                                                    <div className="casino-bl-box">
                                                        <BetBox market={market} className="back casino-bl-box-item" isBack={true} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Single Digit Markets */}
                                <div className="text-center mt-4 d-none-small pr casino-cards-odds-title">
                                    <b>9.5</b>
                                    <div className="d-inline-block ml-1 float-right">
                                        <BetLimitInfo min={100} max="25K" />
                                    </div>
                                </div>
                                <div className="d-none-small cards32bextra mt-1">
                                    <div className="casino-bl-box">
                                        {singles.map((digit, idx) => {
                                            const market = getMarket(digit);
                                            const suspended = getIsSuspended(market);
                                            return (
                                                <BetBox key={idx} market={market} className="casino-bl-box-item back" isBack={true} isRate={false}>
                                                    <span className="casino-box-odd">{digit}</span>
                                                    <Exposure className="casino-book" data={exposureData} id={market?.sid} />
                                                </BetBox>
                                            );
                                        })}
                                    </div>
                                </div>


                                {/* Mobile View */}
                                <div className="teen1daycasino-container d-none-big">
                                    {/* Winner Section */}
                                    <div className="casino-box-row">
                                        <div className="casino-nation-name no-border casino-bl-box-title">
                                            <div className="playerb"></div>
                                        </div>
                                        <div className="casino-bl-box casino-bl-box-title">
                                            <div className="casino-bl-box-item"><b>Back</b></div>
                                            <div className="casino-bl-box-item"><b>Lay</b></div>
                                        </div>
                                    </div>
                                    {winners.map((player, idx) => {
                                        const market = getMarket(player.name);
                                        return (
                                            <div className="casino-box-row" key={idx}>
                                                <div className="casino-nation-name">
                                                    <div>
                                                        <b>{player.name}</b>
                                                        <Exposure className="d-block w-100" data={exposureData} id={market?.sid} />
                                                    </div>
                                                    <div className="float-right">
                                                        <BetLimitInfo min={market?.min} max={market?.max} />
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <BetBox market={market} className="back casino-bl-box-item" isBack={true} />
                                                    <BetBox market={market} className="lay casino-bl-box-item" isBack={false} />
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Odd/Even Section */}
                                    <div className="casino-box-row">
                                        <div className="casino-nation-name no-border casino-bl-box-title">
                                            <div className="playerb"></div>
                                        </div>
                                        <div className="casino-bl-box casino-bl-box-title">
                                            <div className="casino-bl-box-item"><b>Odd</b></div>
                                            <div className="casino-bl-box-item"><b>Even</b></div>
                                        </div>
                                    </div>
                                    {oddEvens.map((player, idx) => {
                                        const oddMarket = getMarket(player.odd);
                                        const evenMarket = getMarket(player.even);
                                        return (
                                            <div className="casino-box-row" key={idx}>
                                                <div className="casino-nation-name">
                                                    <b>{player.name}</b>
                                                    <div className="float-right">
                                                        <BetLimitInfo min={oddMarket?.min || evenMarket?.min} max={oddMarket?.max || evenMarket?.max} />
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <BetBox market={oddMarket} className="back casino-bl-box-item" isBack={true}>
                                                        <Exposure className="casino-book" data={exposureData} id={oddMarket?.sid} />
                                                    </BetBox>
                                                    <BetBox market={evenMarket} className="back casino-bl-box-item" isBack={true}>
                                                        <Exposure className="casino-book" data={exposureData} id={evenMarket?.sid} />
                                                    </BetBox>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Fancy Section */}
                                    <div className="casino-box-row">
                                        <div className="casino-nation-name no-border casino-bl-box-title">
                                            <div className="playerb"></div>
                                        </div>
                                        <div className="casino-bl-box casino-bl-box-title">
                                            <div className="casino-bl-box-item"><b>Back</b></div>
                                            <div className="casino-bl-box-item"><b>Lay</b></div>
                                        </div>
                                    </div>
                                    {fancies.map((fancy, idx) => {
                                        const market = getMarket(fancy.name);
                                        return (
                                            <div className="casino-box-row" key={idx}>
                                                <div className="casino-nation-name">
                                                    <div>
                                                        <b>{fancy.name}</b>
                                                        <Exposure className="d-block w-100" data={exposureData} id={market?.sid} />
                                                    </div>
                                                    <div className="float-right">
                                                        <BetLimitInfo min={market?.min} max={market?.max} />
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <BetBox market={market} className="back casino-bl-box-item" isBack={true} />
                                                    <BetBox market={market} className="lay casino-bl-box-item" isBack={false} />
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Total Section */}
                                    <div className="casino-box-row">
                                        <div className="casino-nation-name no-border casino-bl-box-title">
                                            <div className="playerb"></div>
                                        </div>
                                        <div className="casino-bl-box casino-bl-box-title">
                                            <div className="casino-bl-box-item"><b>Back</b></div>
                                            <div className="casino-bl-box-item"><b>Back</b></div>
                                        </div>
                                    </div>
                                    {totals.map((total, idx) => {
                                        const market = getMarket(total.name);
                                        return (
                                            <div className="casino-box-row" key={idx}>
                                                <div className="casino-nation-name">
                                                    <div>
                                                        <b>{total.name}</b>
                                                        <Exposure className="d-block w-100" data={exposureData} id={market?.sid} />
                                                    </div>
                                                    <div className="float-right">
                                                        <BetLimitInfo min={market?.min} max={market?.max} />
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <BetBox market={market} className="back casino-bl-box-item" isBack={true} />
                                                    <BetBox market={market} className="back casino-bl-box-item" isBack={true} />
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Single Digit Section */}
                                    <div className="text-center w-100 pr casino-cards-odds-title">
                                        <b>9.5</b>
                                        <div className="d-inline-block ml-1 float-right">
                                            <BetLimitInfo min={100} max="25K" />
                                        </div>
                                    </div>
                                    <div className="cards32bextra">
                                        <div className="casino-bl-box">
                                            {singles.map((digit, idx) => {
                                                const market = getMarket(digit);
                                                const suspended = getIsSuspended(market);
                                                return (
                                                    <BetBox key={idx} market={market} className="casino-bl-box-item back" isBack={true} isRate={false}>
                                                        <span className="casino-box-odd">{digit}</span>
                                                        <Exposure className="casino-book" data={exposureData} id={market?.sid} />
                                                    </BetBox>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
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

export default Card32B;
