import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";


const BoardCell = ({ label, className, isNumber = false }) => {
    return (
        <div className={`board-cell ${className}`}>
            <div className="board-cell-in">
                <span className={isNumber ? "board-number" : "board-text"}>{label}</span>
            </div>
        </div>
    );
};

const BeachRoulette = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    const getNumColor = (num) => (num === 0 ? "green" : redNumbers.includes(num) ? "red" : "black");

    const numbers = Array.from({ length: 37 }, (_, i) => i);

    // Category mapping from BeachRoulette.js
    const categoryMarkets = [
        { label: "1st12", sid: 38 },
        { label: "2nd12", sid: 39 },
        { label: "3rd12", sid: 40 },
        { label: "1 - 18", sid: 48 },
        { label: "Even", sid: 44 },
        { label: "Red", sid: 46 },
        { label: "Black", sid: 47 },
        { label: "Odd", sid: 45 },
        { label: "19 - 36", sid: 49 },
    ];

    const columnMarkets = [
        { label: "2to1", sid: 41 },
        { label: "2to1", sid: 42 },
        { label: "2to1", sid: 43 },
    ];

    const VideoCards = () => null; // Roulette doesn't show cards in the drawer

    const Results = () => (
        <div className="casino-video-last-results">
            {lastResults?.map((res, i) => {
                const num = parseInt(res.res) || 0;
                return (
                    <span key={i} className={`result ${getNumColor(num)}`}>
                        {res.res?.toString().padStart(2, '0')}
                    </span>
                );
            })}
            <a href={`/admin/reports/casinoresult/roulette12`} className="result-more">...</a>
        </div>
    );

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table roulette">
                            <CasinoVideo
                                gameName={game_name}
                                roundId={currentGame?.mid}
                                videoSrc={iframe_url}
                                results={lastResults}
                                showLastResults={true}
                                showCardDrawer={false}
                                CardsComponent={VideoCards}
                            />

                            <div className="casino-detail">
                                <div className="roulette-box-container">
                                    <div className="board-in">
                                        <div className="board-right">
                                            {columnMarkets.map((col, i) => (
                                                <BoardCell
                                                    key={i}
                                                    label={col.label}
                                                    className="yellow"
                                                />
                                            ))}
                                        </div>

                                        <div className="board-bottom">
                                            {categoryMarkets.map((cat, i) => (
                                                <BoardCell
                                                    key={i}
                                                    label={cat.label}
                                                    className="yellow"
                                                />
                                            ))}
                                        </div>

                                        <div className="board-center">
                                            {numbers.map((num) => (
                                                <BoardCell
                                                    key={num}
                                                    label={num}
                                                    className={getNumColor(num)}
                                                    isNumber={true}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <CasinoRightSidebar />
            </div>

            <style jsx="true">{`

                .board-number {
                    font-size: 18px;
                    font-weight: bold;
                }
                .board-text {
                    font-size: 18px;
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
};

export default BeachRoulette;
