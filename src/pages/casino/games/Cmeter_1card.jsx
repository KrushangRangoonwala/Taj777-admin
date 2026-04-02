import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import RemarkMarquee from "./components/RemarkMarquee";

const Cmeter_1card = ({ gameData, exposureData, lastResults }) => {
    const { CODE, game_name, iframe_url, result_image } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const t2 = gameData?.t2 || [];
    const cards = [currentGame?.C1, currentGame?.C2].filter(Boolean);

    const fightImg = "https://wver.sprintstaticdata.com/v211/static/admin/img/fight.png";

    const VideoCards = () => (
        <div>
            {cards.length > 0 ? (
                cards.map((card, index) => (
                    <span key={index} data-v-b64efdfa="">
                        <img
                            data-v-b64efdfa=""
                            src={getImage(card, result_image)}
                            alt={`Card ${card}`}
                        />
                    </span>
                ))
            ) : (
                <>
                    <span data-v-b64efdfa="">
                        <img
                            data-v-b64efdfa=""
                            src={getImage(1, result_image)}
                            alt="Card 1"
                        />
                    </span>
                    <span data-v-b64efdfa="">
                        <img
                            data-v-b64efdfa=""
                            src={getImage(1, result_image)}
                            alt="Card 2"
                        />
                    </span>
                </>
            )}
        </div>
    );

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table one-card-meter">
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
                                    <div className="meter-btns">
                                        {t2.map((fighter, idx) => {
                                            const suspended = getIsSuspended(fighter);
                                            return (
                                                <div className="meter-btn" key={idx}>
                                                    <div className="text-right min-max">
                                                        Min:<span>{fighter.min}</span>
                                                        Max:<span>{fighter.max}</span>
                                                    </div>
                                                    <div className={`meter-btn-box ${suspended ? "suspended" : ""}`}>
                                                        <button className={`btn btn-fighter-${idx + 1} ${suspended ? "suspended" : ""}`}>
                                                            {idx === 1 && (
                                                                <img src={fightImg} alt="Fight" />
                                                            )}
                                                            {fighter.nat}
                                                            {idx === 0 && (
                                                                <img src={fightImg} alt="Fight" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <div className="book-green text-center">
                                                        <b className="book-black">
                                                            <Exposure
                                                                id={fighter.sid}
                                                                data={exposureData}
                                                            />
                                                        </b>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="right-sidebar">
                        <CasinoRightSidebar />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cmeter_1card;