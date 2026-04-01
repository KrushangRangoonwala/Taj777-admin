import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketBySid, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import LastResult from "./components/LastResult";

const MarketTitle = ({ market, label, id, defaultMax }) => {
    return (
        <div className="casino-bl-box-item">
            <b>{label}</b>
            <div className="float-right">
                <i
                    data-toggle="collapse"
                    data-target={`#range${id}`}
                    className="fas fa-info-circle"
                ></i>
                <div id={`range${id}`} className="collapse icon-range">
                    R:<span>{market?.min || 100}</span>-<span>{market?.max || defaultMax}</span>
                </div>
            </div>
        </div>
    );
};

const BetBox = ({ rate, status, sid, exposureData, isMobile = false }) => {
    const isLocked = !rate || rate === "0" || rate === "0.00" || status === "False" || status === false;
    const suspended = isLocked ? "suspended" : "";

    return (
        <div className={`back casino-bl-box-item ${suspended}`} style={{ position: 'relative' }}>
            {isLocked && (
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
                {isLocked ? "" : rate}
            </span>
            <Exposure className={isMobile ? "" : "casino-book"} data={exposureData} id={sid} isInlineColor={isMobile} />
        </div>
    );
};

const TeenPattiTest = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url, result_image } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || []; // 6 market types

    const animals = [
        { name: "Tiger", key: "t" },
        { name: "Lion", key: "l" },
        { name: "Dragon", key: "d", sidKey: "dsectionid" },
    ];

    const marketTypes = [
        { label: "Winner", defaultMax: "3L" },
        { label: "Pair", defaultMax: "25K" },
        { label: "Flush", defaultMax: "10K" },
        { label: "Straight", defaultMax: "10K" },
        { label: "Trio", defaultMax: "5K" },
        { label: "Straight Flush", defaultMax: "5K" },
    ];

    const VideoCards = () => {
        const tigerCards = [currentGame?.C1, currentGame?.C2, currentGame?.C3].filter(Boolean);
        const lionCards = [currentGame?.C4, currentGame?.C5, currentGame?.C6].filter(Boolean);
        const dragonCards = [currentGame?.C7, currentGame?.C8, currentGame?.C9].filter(Boolean);

        const renderGroup = (name, cards) => (
            <div key={name}>
                <div className="dealer-name w-100 mb-1">{name}</div>
                {cards.map((card, i) => (
                    <span key={`${name}-${i}`} data-v-b64efdfa="">
                        <img data-v-b64efdfa="" src={getImage(card, result_image)} alt="card" />
                    </span>
                ))}
                {Array.from({ length: Math.max(0, 3 - cards.length) }).map((_, i) => (
                    <span key={`${name}-empty-${i}`} data-v-b64efdfa="">
                        <img data-v-b64efdfa="" src={getImage(1, result_image)} alt="card" />
                    </span>
                ))}
            </div>
        );

        return (
            <>
                {renderGroup("Tiger", tigerCards)}
                {renderGroup("Lion", lionCards)}
                {renderGroup("Dragon", dragonCards)}
            </>
        );
    };

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table teenpattitest">
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
                                <div className="teen1daycasino-container d-none-small">
                                    <div className="teentestother">
                                        <div className="casino-box-row">
                                            <div className="casino-nation-name no-border"></div>
                                            {marketTypes.map((type, idx) => (
                                                <div className="casino-bl-box" key={idx}>
                                                    <MarketTitle 
                                                        market={marketData?.[idx]} 
                                                        label={type.label} 
                                                        defaultMax={type.defaultMax}
                                                        id={idx + 1} 
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {animals.map((animal) => (
                                            <div className="casino-box-row mb-4" key={animal.name}>
                                                <div className="casino-nation-name"><b>{animal.name}</b></div>
                                                {marketTypes.map((_, idx) => {
                                                    const market = marketData?.[idx];
                                                    const rate = market?.[`${animal.key}rate`];
                                                    const status = market?.[`${animal.key}status`];
                                                    const sid = market?.[animal.sidKey || `${animal.key}section`];
                                                    return (
                                                        <div className="casino-bl-box" key={idx}>
                                                            <BetBox 
                                                                rate={rate} 
                                                                status={status} 
                                                                sid={sid} 
                                                                exposureData={exposureData} 
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Mobile View */}
                                <div className="teen1daycasino-container d-none-big">
                                    <div className="casino-box-row teen1dayodev">
                                        <div className="casino-bl-box casino-bl-box-title">
                                            <div className="casino-bl-box-item casino-card-img"></div>
                                            <div className="casino-bl-box-item text-center"><b>Tiger</b></div>
                                            <div className="casino-bl-box-item text-center"><b>Lion</b></div>
                                            <div className="casino-bl-box-item text-center"><b>Dragon</b></div>
                                        </div>

                                        {marketTypes.map((type, idx) => {
                                            const market = marketData?.[idx];
                                            return (
                                                <div className="casino-bl-box" key={idx}>
                                                    <div className="casino-bl-box-item casino-odds-name">
                                                        <span>{type.label}</span>
                                                        <div className="float-right mr-1">
                                                            <i data-toggle="collapse" data-target={`#m-range${idx}`} className="fas fa-info-circle"></i>
                                                            <div id={`m-range${idx}`} className="collapse icon-range">
                                                                R:<span>{market?.min || 100}</span>-<span>{market?.max || type.defaultMax}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {animals.map((animal) => (
                                                        <BetBox 
                                                            key={animal.name}
                                                            rate={market?.[`${animal.key}rate`]} 
                                                            status={market?.[`${animal.key}status`]} 
                                                            sid={market?.[animal.sidKey || `${animal.key}section`]} 
                                                            exposureData={exposureData} 
                                                            isMobile={true}
                                                        />
                                                    ))}
                                                </div>
                                            );
                                        })}
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

export default TeenPattiTest;
