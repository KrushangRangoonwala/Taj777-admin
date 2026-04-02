import React, { useEffect, useState } from "react";
import { getValueAfterDot, getImage } from "../../../../utilies/helpers";
import { useGetFileData } from "../../../../hooks/useGetFileData";
import LastResult from "./LastResult";
import { Link } from "react-router-dom";

const CasinoVideo = ({
    gameName,
    roundId,
    videoSrc,
    cards = [],
    results = [],
    timeLeft = 0,
    totalTime = 30,
    CardsComponent,
    titleExtra = null,
    Popup,

    showLastResults = true,
    showCardDrawer = true,
}) => {
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const { game_type, result_image } = useGetFileData();
    const [isLastResultOpen, setIsLastResultOpen] = useState(true);

    const getTimerColorClass = () => {
        if (timeLeft <= 5) return "red";
        if (timeLeft <= 10) return "orange";
        return "green";
    };

    const strokeDasharrayValue = ((timeLeft || 0) / (totalTime || 30)) * 283;

    const isAllClosed = cards?.every(val => !val || val == 1);

    return (
        <div className="casino-video">
            {(gameName || roundId || titleExtra) && (
                <div className="casino-video-title">
                    {gameName && <span className="casino-name">{gameName}</span>}
                    <div className="casino-video-rid">
                        Round ID: {getValueAfterDot(roundId) || "Loading..."}
                    </div>
                    {titleExtra}
                </div>
            )}

            <div className="video-box-container">
                <div className="video-box">
                    <iframe src={videoSrc} title="Casino Video" />
                    {Popup && <Popup />}
                </div>
            </div>

            {showCardDrawer && (
                <div className={`casino-video-cards ${(isCardDrawerOpen && !isAllClosed) ? "" : "hide-cards"}`}>
                    {/* hide cardDrawer when all cards are closed : ${(isCardDrawerOpen && !isAllClosed) ? "" : "hide-cards"} */}
                    <div
                        className="casino-cards-shuffle"
                        onClick={() => setIsCardDrawerOpen(!isCardDrawerOpen)}
                    >
                        <i className="fas fa-grip-lines-vertical"></i>
                    </div>
                    <div className="casino-video-cards-container">
                        {CardsComponent ? (
                            <CardsComponent />
                        ) : (
                            <div className="playerboardcards">
                                <div className="dealer-name w-100 mb-1">Board</div>
                                <div className="d-flex">
                                    {cards.map((card, index) => (
                                        <span key={index} data-v-b64efdfa="">
                                            <img
                                                data-v-b64efdfa=""
                                                src={getImage(card, result_image)}
                                                alt={`card-${index}`}
                                            />
                                        </span>
                                    ))}
                                    {Array.from({ length: 5 - cards.length }).map((_, index) => (
                                        <span key={`empty-${index}`} data-v-b64efdfa="">
                                            <img
                                                data-v-b64efdfa=""
                                                src={getImage(1, result_image)}
                                                alt="empty-card"
                                            />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* timer */}
            <div className="casino-timer">
                <div data-v-07e7cfbb="" className="base-timer">
                    <svg
                        data-v-07e7cfbb=""
                        viewBox="0 0 100 100"
                        xmlns="http://www.w3.org/2000/svg"
                        className="base-timer__svg"
                    >
                        <g data-v-07e7cfbb="" className="base-timer__circle">
                            <circle
                                data-v-07e7cfbb=""
                                cx="50"
                                cy="50"
                                r="45"
                                className="base-timer__path-elapsed"
                            ></circle>
                            <path
                                data-v-07e7cfbb=""
                                strokeDasharray={`${strokeDasharrayValue} 283`}
                                d="M 50, 50 m -45, 0 a 45,45 0 1,0 90,0 a 45,45 0 1,0 -90,0"
                                className={`base-timer__path-remaining ${getTimerColorClass()}`}
                            ></path>
                        </g>
                    </svg>
                    <span data-v-07e7cfbb="" className={`base-timer__label ${getTimerColorClass()}`}>
                        <span data-v-07e7cfbb="">{timeLeft}</span>
                    </span>
                </div>
            </div>

            <div className="casino-video-right-icons">
                <div title="Home" className="casino-video-home-icon">
                    <Link to="/admin/casino/list" className="" style={{ color: "var(--text-highlight)" }}>
                        <i className="fas fa-home"></i>
                    </Link>
                </div>
                <div title="Rules" className="casino-video-rules-icon">
                    <i className="fas fa-info-circle"></i>
                </div>
                {showLastResults &&
                    <div
                        title="Last Results"
                        className="casino-video-lr-icon"
                        onClick={() => setIsLastResultOpen(!isLastResultOpen)}
                    >
                        <i className={`fas fa-chevron-circle-${isLastResultOpen ? "up" : "down"}`}></i>
                    </div>}
            </div>

            <div></div>

            {showLastResults && (
                <LastResult results={results} isOpen={isLastResultOpen} />
            )}
        </div>
    );
};

export default CasinoVideo;
