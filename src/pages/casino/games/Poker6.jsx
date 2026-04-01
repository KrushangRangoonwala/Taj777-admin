import React, { useState } from 'react';
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketByNation, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import RemarkMarquee from "./components/RemarkMarquee";
import BetLimitInfo from "./components/BetLimitInfo2";
import LastResult from './components/LastResult';

const handsData = [
    { name: "Player 1", id: "hands-0", sid: 11, c1: "C1", c2: "C7" },
    { name: "Player 2", id: "hands-1", sid: 12, c1: "C2", c2: "C8" },
    { name: "Player 3", id: "hands-2", sid: 13, c1: "C3", c2: "C9" },
    { name: "Player 4", id: "hands-3", sid: 14, c1: "C4", c2: "C10" },
    { name: "Player 5", id: "hands-4", sid: 15, c1: "C5", c2: "C11" },
    { name: "Player 6", id: "hands-5", sid: 16, c1: "C6", c2: "C12" },
];

const patternsData = [
    { name: "High Card", id: "pattern-6", sid: 21 },
    { name: "Pair", id: "pattern-7", sid: 22 },
    { name: "Two Pair", id: "pattern-8", sid: 23 },
    { name: "Three of a Kind", id: "pattern-9", sid: 24 },
    { name: "Straight", id: "pattern-10", sid: 25 },
    { name: "Flush", id: "pattern-11", sid: 26 },
    { name: "Full House", id: "pattern-12", sid: 27, fullbox: true },
    { name: "Four of a Kind", id: "pattern-13", sid: 28, fullbox: true },
    { name: "Straight Flush", id: "pattern-14", sid: 29, fullbox: true },
];

const Poker6 = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url, result_image } = useGetFileData();
    const [tabIdx, setTabIdx] = useState(0); // 0 for Hands, 1 for Pattern

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const communityCards = [
        currentGame?.C13,
        currentGame?.C14,
        currentGame?.C15,
        currentGame?.C16,
        currentGame?.C17,
    ];

    const getMarketById = (sid) => marketData.find(m => m.sid == sid);

    const Cards = () => (
        <div>
            {communityCards.map((card, idx) => (
                <span key={idx}>
                    <span data-v-b64efdfa="">
                        <img data-v-b64efdfa="" src={getImage(card, result_image)} alt="card" />
                    </span>
                </span>
            ))}
        </div>
    );

    const HandItem = ({ hand }) => {
        const market = getMarketById(hand.sid);
        const suspended = getIsSuspended(market);
        const p1 = currentGame?.[hand.c1];
        const p2 = currentGame?.[hand.c2];

        return (
            <div className="casino-col-container">
                <div className="casino-box-row">
                    <div className="w-100 mb-1 pr">
                        <b>{hand.name}</b>
                        <div className="float-right">
                            <BetLimitInfo min={market?.min} max={market?.max} />
                        </div>
                    </div>
                    <div className={`poker6box ${suspended ? "suspended" : ""}`}>
                        <div className="casino-nation-name">
                            <div>
                                <span className="player-card">
                                    <span data-v-b64efdfa="">
                                        <img data-v-b64efdfa="" src={getImage(p1, result_image)} />
                                    </span>
                                </span>
                                <span className="player-card">
                                    <span data-v-b64efdfa="">
                                        <img data-v-b64efdfa="" src={getImage(p2, result_image)} />
                                    </span>
                                </span>
                            </div>
                            <span className="float-right mr-1">
                                <b className="d-block text-right">{market?.rate || 0}</b>
                            </span>
                        </div>
                    </div>
                    <div className="casino-book text-center w-100 book-black">
                        <Exposure data={exposureData} id={hand.sid} />
                    </div>
                </div>
            </div>
        );
    };

    const HandItemMobile = ({ hand }) => {
        const market = getMarketById(hand.sid);
        const suspended = getIsSuspended(market);
        const p1 = currentGame?.[hand.c1];
        const p2 = currentGame?.[hand.c2];

        return (
            <div className="casino-col-container">
                <div className="casino-box-row">
                    <div className="w-100 mb-1 pr">
                        <b>{hand.name}</b>
                        <div className="float-right">
                            <BetLimitInfo min={market?.min} max={market?.max} />
                        </div>
                    </div>
                    <div className={`poker6box ${suspended ? "suspended" : ""}`}>
                        <div className="casino-nation-name">
                            <div>
                                <span className="player-card">
                                    <span data-v-b64efdfa="">
                                        <img data-v-b64efdfa="" src={getImage(p1, result_image)} />
                                    </span>
                                </span>
                                <span className="player-card">
                                    <span data-v-b64efdfa="">
                                        <img data-v-b64efdfa="" src={getImage(p2, result_image)} />
                                    </span>
                                </span>
                            </div>
                            <span className="text-right mr-1 flex-odds">
                                <b className="d-block w-100">{market?.rate || 0}</b>
                                <Exposure className="w-100" data={exposureData} id={hand.sid} />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const PatternItem = ({ pattern }) => {
        const market = getMarketById(pattern.sid);
        const suspended = getIsSuspended(market);

        return (
            <div className={`casino-col-container ${pattern.fullbox ? "fullbox" : ""}`}>
                <div className="casino-box-row">
                    <div className="w-100 mb-1 pr">
                        <div className="float-right">
                            <BetLimitInfo min={market?.min} max={market?.max} />
                        </div>
                    </div>
                    <div className={`poker6box ${suspended ? "suspended" : ""}`}>
                        <div className="casino-nation-name">
                            <b>{pattern.name}</b>
                            <span className="d-block text-right">
                                <b>{market?.rate || 0}</b>
                            </span>
                        </div>
                    </div>
                    <div className="casino-book text-center w-100 book-black">
                        <Exposure data={exposureData} id={pattern.sid} />
                    </div>
                </div>
            </div>
        );
    };

    const PatternItemMobile = ({ pattern }) => {
        const market = getMarketById(pattern.sid);
        const suspended = getIsSuspended(market);

        return (
            <div className="casino-col-container">
                <div className="casino-box-row">
                    <div className="w-100 mb-1 pr">
                        <div className="float-right">
                            <BetLimitInfo min={market?.min} max={market?.max} />
                        </div>
                    </div>
                    <div className={`poker6box ${suspended ? "suspended" : ""}`}>
                        <div className="casino-nation-name">
                            <div><b>{pattern.name}</b></div>
                            <span className="text-right mr-1 flex-odds">
                                <b className="d-block w-100">{market?.rate || 0}</b>
                                <Exposure className="w-100" data={exposureData} id={pattern.sid} />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table poker6player">
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
                                    {/* Desktop View */}
                                    <div className="d-none-small">
                                        <div className="casino-box">
                                            <div className="teen1daycasino-container">
                                                <div className="teen1dayleft">
                                                    <h4 className="playera">Hands</h4>
                                                    <div className="casino-row-container">
                                                        {handsData.map(hand => <HandItem key={hand.sid} hand={hand} />)}
                                                    </div>
                                                </div>
                                                <div className="teen1daycenter"></div>
                                                <div className="teen1dayright pattern">
                                                    <h4>Pattern</h4>
                                                    <div className="casino-row-container">
                                                        {patternsData.map(pattern => <PatternItem key={pattern.sid} pattern={pattern} />)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile View */}
                                    <div className="d-block-small">
                                        <div className="casino-tabs">
                                            <ul className="nav nav-tabs">
                                                <li className="nav-item">
                                                    <a href="javascript:void(0)" onClick={() => setTabIdx(0)} className={`nav-link ${tabIdx === 0 ? 'active' : ''}`}>Hands</a>
                                                </li>
                                                <li className="nav-item">
                                                    <a href="javascript:void(0)" onClick={() => setTabIdx(1)} className={`nav-link ${tabIdx === 1 ? 'active' : ''}`}>Pattern</a>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="casino-box mb-2 tab-content">
                                            {tabIdx === 0 && (
                                                <div className="tab-pane hands active">
                                                    <div className="casino-row-container">
                                                        {handsData.map(hand => <HandItemMobile key={hand.sid} hand={hand} />)}
                                                    </div>
                                                </div>
                                            )}
                                            {tabIdx === 1 && (
                                                <div className="tab-pane active pattern">
                                                    <div className="casino-row-container">
                                                        {patternsData.map(pattern => <PatternItemMobile key={pattern.sid} pattern={pattern} />)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <RemarkMarquee remark={currentGame?.remark} />
                                    <LastResult lastResults={lastResults} />
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

export default Poker6;