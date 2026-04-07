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

const TeenPattiOpen = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url, result_image } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];
    const allCards = currentGame?.cards ? currentGame.cards.split(',').map(c => c.trim()) : [];

    const getCard = (index) => allCards[index] || "1";

    const BetBox = ({ market, className = "", children, displayValue, teamName, isMobile = false }) => {
        const suspended = getIsSuspended(market);
        const odds = market?.rate || "0";
        const isLocked = !market?.rate || market?.rate === "0" || market?.rate === "0.00";

        return (
            <div className={`${className} casino-bl-box-item ${suspended || isLocked ? "suspended" : ""}`} style={{ position: 'relative' }}>
                {/* {(suspended || isLocked) && (
                    <i className="fas fa-lock" style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10,
                        color: '#fff'
                    }}></i>
                )} */}
                <span className="casino-box-odd">
                    {displayValue || (isLocked || suspended ? "0" : odds)}
                </span>
                {isMobile ? (
                    <Exposure data={exposureData} id={market?.sid} />
                ) : (
                    <Exposure className="casino-book" data={exposureData} id={market?.sid} />
                )}
            </div>
        );
    };

    const VideoCards = () => {
        const dealerCards = [getCard(8), getCard(17), getCard(26)];
        return (
            <div className="casino-video-cards-container">
                <div className="dealer-name">Dealer</div>
                <div>
                    {dealerCards.map((card, i) => (
                        <span key={`dealer-${i}`}><img src={getImage(card, result_image)} alt="dealer card" /></span>
                    ))}
                </div>
            </div>
        );
    };

    const players = Array.from({ length: 8 }, (_, i) => i + 1);

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table teenpattiopen">
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
                                {/* Desktop View Grid */}
                                <div className="casino-box mb-2 d-none-small">
                                    <div className="casino-open-card-box">
                                        {players.map(p => (
                                            <div key={`pcard-${p}`}>
                                                <div><b>{p}</b></div>
                                                <div>
                                                    <span data-v-b64efdfa=""><img data-v-b64efdfa="" src={getImage(getCard(p - 1), result_image)} /></span>
                                                    <span data-v-b64efdfa=""><img data-v-b64efdfa="" src={getImage(getCard((p - 1) + 9), result_image)} /></span>
                                                    <span data-v-b64efdfa=""><img data-v-b64efdfa="" src={getImage(getCard((p - 1) + 18), result_image)} /></span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="casino-box-header">
                                        <div className="casino-nation-name no-border"></div>
                                        <div className="casino-bl-box text-right">
                                            {players.map(p => (
                                                <div key={`plabel-${p}`} className="casino-bl-box-item"><span>Player {p}</span></div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="casino-box-content">
                                        {/* Odds Row */}
                                        <div className="casino-box-row mb-4">
                                            <div className="casino-nation-name">
                                                <b>Odds</b> <i data-target="#range1" data-toggle="collapse" className="fas fa-info-circle float-right"></i>
                                                <div id="range1" className="collapse icon-range">R:<span>100</span>-<span>1L</span></div>
                                            </div>
                                            <div className="casino-bl-box">
                                                {players.map(p => (
                                                    <BetBox key={`odds-${p}`} market={marketData[p - 1]} className="back" />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Pair Plus Row */}
                                        <div className="casino-box-row mb-4">
                                            <div className="casino-nation-name">
                                                <b>Pair Plus</b> <i data-target="#range3" data-toggle="collapse" className="fas fa-info-circle float-right"></i>
                                                <div id="range3" className="collapse icon-range">R:<span>100</span>-<span>10K</span></div>
                                            </div>
                                            <div className="casino-bl-box">
                                                {players.map(p => (
                                                    <BetBox key={`pair-${p}`} market={marketData[p + 7]} className="back" displayValue={`Pair Plus ${p}`} />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Total Row */}
                                        <div className="casino-box-row mb-4">
                                            <div className="casino-nation-name">
                                                <b>Total</b> <i data-target="#range2" data-toggle="collapse" className="fas fa-info-circle float-right"></i>
                                                <div id="range2" className="collapse icon-range">R:<span>100</span>-<span>10K</span></div>
                                            </div>
                                            <div className="casino-bl-box">
                                                {players.map(p => (
                                                    <BetBox key={`total-${p}`} market={marketData[p + 15]} className="back" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile View Grid */}
                                <div className="casino-box mb-2 d-none-big">
                                    <div className="casino-box-header">
                                        <div className="casino-nation-name no-border"></div>
                                        <div className="casino-bl-box text-right">
                                            <div className="casino-bl-box-item">
                                                <span>Odds</span>
                                                <i data-target="#range4" data-toggle="collapse" className="fas fa-info-circle float-right"></i>
                                                <div id="range4" className="collapse icon-range">R:<span>100</span>-<span>1L</span></div>
                                            </div>
                                            <div className="casino-bl-box-item">
                                                <span>Pair Plus</span>
                                                <i data-target="#range3" data-toggle="collapse" className="fas fa-info-circle float-right"></i>
                                                <div id="range3" className="collapse icon-range">R:<span>100</span>-<span>10K</span></div>
                                            </div>
                                            <div className="casino-bl-box-item">
                                                <span>Total</span>
                                                <i data-target="#range6" data-toggle="collapse" className="fas fa-info-circle float-right"></i>
                                                <div id="range6" className="collapse icon-range">R:<span>100</span>-<span>10K</span></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="casino-box-content">
                                        {players.map(p => (
                                            <div key={`pmobile-${p}`} className="casino-box-row">
                                                <div className="casino-nation-name">
                                                    <b>Player {p}</b>
                                                    <div className="">
                                                        <span data-v-b64efdfa=""><img data-v-b64efdfa="" src={getImage(getCard(p - 1), result_image)} /></span>
                                                        <span data-v-b64efdfa=""><img data-v-b64efdfa="" src={getImage(getCard((p - 1) + 9), result_image)} /></span>
                                                        <span data-v-b64efdfa=""><img data-v-b64efdfa="" src={getImage(getCard((p - 1) + 18), result_image)} /></span>
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <BetBox market={marketData[p - 1]} className="back" isMobile={true} />
                                                    <BetBox market={marketData[p + 7]} className="back" displayValue={`Pair Plus ${p}`} isMobile={true} />
                                                    <BetBox market={marketData[p + 15]} className="back" isMobile={true} />
                                                </div>
                                            </div>
                                        ))}
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

export default TeenPattiOpen;
