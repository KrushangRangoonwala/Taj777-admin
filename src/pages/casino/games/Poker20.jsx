import React from 'react';
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import BetLimitInfo from "./components/BetLimitInfo2";
import RemarkMarquee from "./components/RemarkMarquee";

const Poker20 = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url, result_image } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    // Filter and chunk data for Player A and Player B
    const playerAOptions = marketData.filter(opt => opt.sid >= 11 && opt.sid <= 19);
    const playerBOptions = marketData.filter(opt => opt.sid >= 21 && opt.sid <= 29);

    const chunkArray = (arr, size) => {
        const result = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    };

    const playerARows = chunkArray(playerAOptions, 3);
    const playerBRows = chunkArray(playerBOptions, 3);

    const cards = [
        currentGame?.C1, currentGame?.C2, // Player A
        currentGame?.C3, currentGame?.C4, // Player B
        currentGame?.C5, currentGame?.C6, currentGame?.C7, currentGame?.C8, currentGame?.C9 // Board
    ].filter(Boolean);

    const MarketBox = ({ market }) => {
        const suspended = getIsSuspended(market);
        return (
            <div className={`back casino-bl-box-item ${suspended ? "suspended" : ""}`}>
                <span className="casino-box-odd">
                    {suspended ? <i className="fas fa-lock"></i> : (market?.rate || market?.b1 || 0)}
                </span>
                <span className="casino-book book-black">
                    <Exposure id={market?.sid} data={exposureData} />
                </span>
            </div>
        );
    };

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table poker20">
                            <CasinoVideo
                                gameName={game_name || "20-20 Poker"}
                                roundId={currentGame?.mid}
                                videoSrc={iframe_url}
                                cards={cards}
                                results={lastResults}
                                timeLeft={currentGame?.autotime || 0}
                                totalTime={currentGame?.ft || 30}
                                CardsComponent={() => (
                                    <>
                                        <div className="playeracards">
                                            <div className="dealer-name w-100 mb-1">Player A</div>
                                            <div className="d-flex">
                                                {[currentGame?.C1, currentGame?.C2].map((card, idx) => (
                                                    <span key={`a-${idx}`} data-v-b64efdfa="">
                                                        <img data-v-b64efdfa="" src={getImage(card || 1, result_image)} alt="card" />
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="playerbcards">
                                            <div className="dealer-name w-100 mb-1">Player B</div>
                                            <div className="d-flex">
                                                {[currentGame?.C3, currentGame?.C4].map((card, idx) => (
                                                    <span key={`b-${idx}`} data-v-b64efdfa="">
                                                        <img data-v-b64efdfa="" src={getImage(card || 1, result_image)} alt="card" />
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="playerboardcards">
                                            <div className="dealer-name w-100 mb-1">Board</div>
                                            <div className="d-flex">
                                                {[currentGame?.C5, currentGame?.C6, currentGame?.C7, currentGame?.C8, currentGame?.C9].map((card, idx) => (
                                                    <span key={`board-${idx}`} data-v-b64efdfa="">
                                                        <img data-v-b64efdfa="" src={getImage(card || 1, result_image)} alt="card" />
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            />

                            <div className="casino-detail">
                                {/* Desktop Layout */}
                                <div className="poker20casino-container d-none-small">
                                    <div className="poker20left">
                                        {playerARows.map((row, rowIndex) => (
                                            <div key={`desktop-a-row-${rowIndex}`} className={rowIndex > 0 ? "mt-1" : ""}>
                                                <div className="casino-bl-box casino-bl-box-title">
                                                    {row.map(opt => (
                                                        <div key={`title-a-${opt.sid}`} className="casino-bl-box-item">
                                                            <span>{opt.nat}</span>
                                                            <div className="ml-1 float-right">
                                                                <BetLimitInfo min={opt.min} max={opt.max} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="casino-bl-box">
                                                    {row.map(opt => <MarketBox key={opt.sid} market={opt} />)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="poker20center"></div>
                                    <div className="poker20right">
                                        {playerBRows.map((row, rowIndex) => (
                                            <div key={`desktop-b-row-${rowIndex}`} className={rowIndex > 0 ? "mt-1" : ""}>
                                                <div className="casino-bl-box casino-bl-box-title">
                                                    {row.map(opt => (
                                                        <div key={`title-b-${opt.sid}`} className="casino-bl-box-item">
                                                            <span>{opt.nat}</span>
                                                            <div className="ml-1 float-right">
                                                                <BetLimitInfo min={opt.min} max={opt.max} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="casino-bl-box">
                                                    {row.map(opt => <MarketBox key={opt.sid} market={opt} />)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Mobile Layout */}
                                <div className="poker20casino-container d-none-big">
                                    <div className="casino-bl-box casino-bl-box-title">
                                        <div className="casino-bl-box-item"></div>
                                        <div className="casino-bl-box-item playera">Player A</div>
                                        <div className="casino-bl-box-item playerb">Player B</div>
                                    </div>
                                    {playerAOptions.map((optA, index) => {
                                        const optB = playerBOptions[index];
                                        return (
                                            <div key={`mobile-row-${index}`} className="casino-bl-box">
                                                <div className="casino-bl-box-item casino-odds-name">
                                                    <span>{optA?.nat}</span>
                                                    <div className="float-right">
                                                        <BetLimitInfo min={optA?.min} max={optA?.max} />
                                                    </div>
                                                </div>
                                                <MarketBox market={optA} />
                                                <MarketBox market={optB} />
                                            </div>
                                        );
                                    })}
                                </div>
                                <RemarkMarquee remark={""} />
                            </div>
                        </div>
                    </div>
                </div>
                <CasinoRightSidebar />
            </div>
        </div>
    );
};

export default Poker20;