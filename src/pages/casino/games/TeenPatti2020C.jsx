import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketBySid, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import LastResult from "./components/LastResult";
import Rules, { RulesHeader } from "./rules/Rules";

const ruleList = [
    { label: "Pair", value: "1 TO 1" },
    { label: "Flush", value: "1 TO 4" },
    { label: "Straight", value: "1 TO 6" },
    { label: "Trio", value: "1 TO 30" },
    { label: "Straight Flush", value: "1 TO 40" },
];

function RulesComponent() {
    return (
        <>
            <RulesHeader />
            <div className="card-body" style={{ padding: "10px" }}>
                <Rules title="Pair Plus" rules={ruleList} />
            </div>
        </>
    );
}

const TeenPatti2020C = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url, result_image } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const getMarket = (sid) => getMarketBySid(marketData, sid);

    const MarketTitle = ({ sid, label, id }) => {
        const market = getMarket(sid);
        return (
            <div className="casino-bl-box-item">
                <span>{label}</span>
                <div className="ml-1">
                    <i
                        data-toggle="collapse"
                        data-target={`#range${id}`}
                        className="fas fa-info-circle float-right"
                    ></i>
                    <div id={`range${id}`} className="collapse icon-range">
                        R:<span>{market?.min || 100}</span>-<span>{market?.max || "1L"}</span>
                    </div>
                </div>
            </div>
        );
    };

    const BetBox = ({ sid, className = "", isMobile = false }) => {
        const market = getMarket(sid);
        const suspended = getIsSuspended(market);
        const odds = market?.b1 || "0";
        const isLocked = !market?.b1 || market?.b1 === "0" || market?.b1 === "0.00";

        // Custom display for Pair Plus
        let displayOdds = odds;
        if ((sid === 3 || sid === 4) && parseFloat(odds) === 2) displayOdds = sid === 3 ? "A" : "B";

        return (
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
                <Exposure className={isMobile ? "" : "casino-book"} data={exposureData} id={market?.sid} isInlineColor={isMobile} />
            </div>
        );
    };

    const SuitBox = ({ sid, type, rangeId }) => {
        const market = getMarket(sid);
        const suspended = getIsSuspended(market);
        const odds = market?.b1 || "0";
        const isLocked = !market?.b1 || market?.b1 === "0" || market?.b1 === "0.00";

        const isBlack = type === "black";

        return (
            <div className={`casino-rb-box ${isBlack ? 'blackcontainer' : 'redcontainer'}`}>
                <div className={`casino-rb-box-player ${isBlack ? 'blackbox' : 'redbox'} back ${suspended || isLocked ? "suspended" : ""}`}>
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
                    <div className={isBlack ? "text-right" : ""}>
                        <img src={`https://wver.sprintstaticdata.com/v211/static/front/img/cards/${isBlack ? 'spade' : 'heart'}.png`} alt={isBlack ? "spade" : "heart"} />
                        <img src={`https://wver.sprintstaticdata.com/v211/static/front/img/cards/${isBlack ? 'club' : 'diamond'}.png`} className={isBlack ? "" : "diamond-icon"} alt={isBlack ? "club" : "diamond"} />
                    </div>
                    <div className="text-right">
                        <span className="d-block casino-box-odd">{odds}</span>
                        <Exposure className="casino-book" data={exposureData} id={market?.sid} />
                    </div>
                </div>
                <div className="text-right casino-rb-box-player-range">
                    <i data-toggle="collapse" data-target={`#range${rangeId}`} className="fas fa-info-circle float-right"></i>
                    <div id={`range${rangeId}`} className="collapse icon-range">
                        R:<span>{market?.min || 100}</span>-<span>{market?.max || "25K"}</span>
                    </div>
                </div>
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
                        <div className="casino-table teenpatti20">
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
                                {/* Desktop View */}
                                <div className="teen20casino-container d-none-small">
                                    <div className="teen20left">
                                        <div className="casino-box-row">
                                            <div className="casino-nation-name no-border casino-bl-box-title">
                                                <div className="playera">Player A</div>
                                            </div>
                                        </div>
                                        <div className="casino-bl-box casino-bl-box-title">
                                            <MarketTitle sid={1} label="Player" id={1} />
                                            <MarketTitle sid={5} label="3 Baccarat" id={2} />
                                            <MarketTitle sid={11} label="Total" id={3} />
                                            <MarketTitle sid={3} label="Pair Plus" id={4} />
                                        </div>
                                        <div className="casino-bl-box mb-4">
                                            <BetBox sid={1} />
                                            <BetBox sid={5} />
                                            <BetBox sid={11} />
                                            <BetBox sid={3} />
                                        </div>
                                        <div className="casino-rb-box-container mb-3">
                                            <SuitBox sid={7} type="black" rangeId={5} />
                                            <SuitBox sid={8} type="red" rangeId={6} />
                                        </div>
                                    </div>

                                    <div className="teen20center"></div>

                                    <div className="teen20right">
                                        <div className="casino-box-row">
                                            <div className="casino-nation-name no-border casino-bl-box-title">
                                                <div className="playerb">Player B</div>
                                            </div>
                                        </div>
                                        <div className="casino-bl-box casino-bl-box-title">
                                            <MarketTitle sid={2} label="Player" id={7} />
                                            <MarketTitle sid={6} label="3 Baccarat" id={8} />
                                            <MarketTitle sid={12} label="Total" id={9} />
                                            <MarketTitle sid={4} label="Pair Plus" id={10} />
                                        </div>
                                        <div className="casino-bl-box mb-4">
                                            <BetBox sid={2} />
                                            <BetBox sid={6} />
                                            <BetBox sid={12} />
                                            <BetBox sid={4} />
                                        </div>
                                        <div className="casino-rb-box-container mb-3">
                                            <SuitBox sid={9} type="black" rangeId={11} />
                                            <SuitBox sid={10} type="red" rangeId={12} />
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile View */}
                                <div className="teen20casino-container d-none-big">
                                    <div className="casino-bl-box casino-bl-box-title">
                                        <div className="casino-bl-box-item"></div>
                                        <div className="casino-bl-box-item playera text-center">Player A</div>
                                        <div className="casino-bl-box-item playerb text-center">Player B</div>
                                    </div>

                                    {/* Markets Grid for Mobile */}
                                    {[
                                        { label: "Player", sids: [1, 2] },
                                        { label: "3 Baccarat", sids: [5, 6] },
                                        { label: "Total", sids: [11, 12] },
                                        { label: "Pair Plus", sids: [3, 4] },
                                    ].map((row, idx) => (
                                        <div key={idx} className="casino-bl-box">
                                            <div className="casino-bl-box-item casino-odds-name casino-nation-name">
                                                <span>{row.label}</span>
                                                <div className="ml-1">
                                                    <i data-toggle="collapse" data-target={`#m-range${idx}`} className="fas fa-info-circle float-right"></i>
                                                    <div id={`m-range${idx}`} className="collapse icon-range">
                                                        R:<span>{getMarket(row.sids[0])?.min || 100}</span>-<span>{getMarket(row.sids[0])?.max || "1L"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <BetBox sid={row.sids[0]} isMobile={true} />
                                            <BetBox sid={row.sids[1]} isMobile={true} />
                                        </div>
                                    ))}

                                    {/* Suits for Mobile */}
                                    <div className="casino-bl-box">
                                        <div className="casino-bl-box-item casino-odds-name casino-nation-name">
                                            <div>
                                                <img src="https://wver.sprintstaticdata.com/v211/static/front/img/cards/spade.png" alt="spade" />
                                                <img src="https://wver.sprintstaticdata.com/v211/static/front/img/cards/club.png" alt="club" />
                                            </div>
                                            <div className="ml-1">
                                                <i data-toggle="collapse" data-target="#m-range-black" className="fas fa-info-circle float-right"></i>
                                                <div id="m-range-black" className="collapse icon-range">
                                                    R:<span>{getMarket(7)?.min || 100}</span>-<span>{getMarket(7)?.max || "25K"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <BetBox sid={7} isMobile={true} />
                                        <BetBox sid={9} isMobile={true} />
                                    </div>
                                    <div className="casino-bl-box">
                                        <div className="casino-bl-box-item casino-odds-name casino-nation-name">
                                            <div>
                                                <img src="https://wver.sprintstaticdata.com/v211/static/front/img/cards/heart.png" alt="heart" />
                                                <img src="https://wver.sprintstaticdata.com/v211/static/front/img/cards/diamond.png" className="diamond-icon" alt="diamond" />
                                            </div>
                                            <div className="ml-1">
                                                <i data-toggle="collapse" data-target="#m-range-red" className="fas fa-info-circle float-right"></i>
                                                <div id="m-range-red" className="collapse icon-range">
                                                    R:<span>{getMarket(8)?.min || 100}</span>-<span>{getMarket(8)?.max || "25K"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <BetBox sid={8} isMobile={true} />
                                        <BetBox sid={10} isMobile={true} />
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

export default TeenPatti2020C;
