import React, { useState } from "react";
import { getValueAfterDot, getImage } from "../../../../utilies/helpers";
import { useGetFileData } from "../../../../hooks/useGetFileData";
import LastResult from "./LastResult";
import Result_parent from "./Result_parent";

const CasinoVideo = ({
    gameName,
    roundId,
    videoSrc,
    cards = [],
    results = [],
    timeLeft = 0,
    totalTime = 30,
    isCardDrawerOpen,
    setIsCardDrawerOpen,
    CardsComponent,
    resultPath = "",
    showResults = true,
    showRawLabel = false,
    showImage = false,
    imagePath = "cards",
    showCardDrawer = true,
    titleExtra = null,
    timerClassName = "",
    isLastResultOpen: isLastResultOpenProp,
    setIsLastResultOpen: setIsLastResultOpenProp,
}) => {
    // const [isLastResultOpen, setIsLastResultOpen] = useState(false);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const { game_type, result_image } = useGetFileData();
    const [isLastResultOpenInternal, setIsLastResultOpenInternal] = useState(true);

    console.log('isLastResultOpenProp !== undefined', isLastResultOpenProp !== undefined);
    const isLastResultOpen = isLastResultOpenProp !== undefined ? isLastResultOpenProp : isLastResultOpenInternal;
    const setIsLastResultOpen = setIsLastResultOpenProp !== undefined ? setIsLastResultOpenProp : setIsLastResultOpenInternal;

    const getTimerColorClass = () => {
        if (timeLeft <= 5) return "red";
        if (timeLeft <= 10) return "orange";
        return "green";
    };

    const strokeDasharrayValue = ((timeLeft || 0) / (totalTime || 30)) * 283;


    return (
        <div className="casino-video">
            {/* video */}
            {(gameName || roundId || titleExtra) && (
                <div className="casino-video-title">
                    {gameName && <span className="casino-name">{gameName}</span>}
                    {/* {roundId && ( */}
                    <div className="casino-video-rid">
                        Round ID: {getValueAfterDot(roundId) || "Loading..."}
                    </div>
                    {/* )} */}
                    {titleExtra}
                </div>
            )}

            <div className="video-box-container">
                <div className="video-box">
                    <iframe src={videoSrc} title="Casino Video" />
                </div>
            </div>

            {showCardDrawer && (
                <div className={`casino-video-cards ${isCardDrawerOpen ? "" : "hide-cards"}`}>
                    {/* cards */}
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
                                    {/* Fill up to 5 cards if less are provided initially */}
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
            <div className={`casino-timer ${timerClassName}`}>
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
                    <a href="/admin/casino/list" className="" style={{ color: "var(--text-highlight)" }}>
                        <i className="fas fa-home"></i>
                    </a>
                </div>
                <div title="Rules" className="casino-video-rules-icon">
                    <i className="fas fa-info-circle"></i>
                </div>
                <div
                    title="Last Results"
                    className="casino-video-lr-icon"
                    onClick={() => setIsLastResultOpen(!isLastResultOpen)}
                >
                    <i className={`fas fa-chevron-circle-${isLastResultOpen ? "up" : "down"}`}></i>
                </div>
            </div>

            <div></div>

            {/* last results */}
            {showResults && (
                <LastResult
                    results={results}
                    gameName={gameName}
                    resultPath={resultPath}
                    showRawLabel={showRawLabel}
                    showImage={showImage}
                    imagePath={imagePath}
                    className={isLastResultOpen ? "" : "hide-lr"}
                    isResultModalOpen={isResultModalOpen}
                    setIsResultModalOpen={setIsResultModalOpen}
                />
            )}

            <Result_parent show={isResultModalOpen} onClose={() => setIsResultModalOpen(false)} result={[]} game_type={game_type} />
        </div>
    );
};

export default CasinoVideo;
