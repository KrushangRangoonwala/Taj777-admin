import React from 'react'
import CasinoVideo from './components/CasinoVideo'
import { useGetFileData } from '../../../hooks/useGetFileData'
import { getCardImage, getValueAfterDot } from '../../../utilies/helpers'
import CasinoRightSidebar from './components/CasinoRightSidebar'

const tabsData = [
    { name: "Taj Close", timeLeft: "00:40:37", gameTime: "21 Apr 26 06:00 PM" },
    { name: "Gulf Open", timeLeft: "01:40:37", gameTime: "21 Apr 26 07:00 PM" },
    { name: "Gulf Close", timeLeft: "02:40:37", gameTime: "21 Apr 26 08:00 PM" },
    { name: "Diamond Open", timeLeft: "03:40:37", gameTime: "21 Apr 26 09:00 PM" },
    { name: "Diamond Close", timeLeft: "04:40:37", gameTime: "21 Apr 26 10:00 PM" },
    { name: "World Open", timeLeft: "05:40:37", gameTime: "21 Apr 26 11:00 PM" },
    { name: "World Close", timeLeft: "06:35:37", gameTime: "21 Apr 26 11:55 PM" },
    { name: "Lords Open", timeLeft: "17:40:37", gameTime: "22 Apr 26 11:00 AM" },
    { name: "Lords Close", timeLeft: "18:40:37", gameTime: "22 Apr 26 12:00 PM" },
    { name: "Riga Open", timeLeft: "19:40:37", gameTime: "22 Apr 26 01:00 PM" },
    { name: "Riga Close", timeLeft: "20:40:37", gameTime: "22 Apr 26 02:00 PM" },
    { name: "Asia Open", timeLeft: "21:40:37", gameTime: "22 Apr 26 03:00 PM" },
    { name: "Asia Close", timeLeft: "22:40:37", gameTime: "22 Apr 26 04:00 PM" },
    { name: "Taj Open", timeLeft: "23:40:37", gameTime: "22 Apr 26 05:00 PM" }
];

const Matka = ({ gameData, lastResults, exposureData }) => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const currentGame = gameData?.t1?.[0];
    const communityCards = [
        currentGame?.C1 || "1",
        currentGame?.C2 || "1",
        currentGame?.C3 || "1",
    ];

    function VideoCards() {
        return (
            <>
                <div>
                    {communityCards.map((card, idx) => (
                        <span key={`community-${idx}`}>
                            <img src={getCardImage(card)} alt="card" />
                        </span>
                    ))}
                </div>
            </>
        )
    }

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table worli matka">
                                <div className="matka-tabs">
                                    <ul className="nav nav-pills">
                                        {tabsData.map((tab, index) => (
                                            <li className="nav-item pointer" key={index}>
                                                <a className={`nav-link ${index === 0 ? "active" : ""}`}>
                                                    {tab.name}

                                                    <div className="remaining-time">
                                                        <img
                                                            src="https://wver.sprintstaticdata.com/v216/static/front/img/clock.png"
                                                            alt=""
                                                        />
                                                        <span>{tab.timeLeft}</span>
                                                    </div>

                                                    <div className="game-time">
                                                        <span>{tab.gameTime}</span>
                                                    </div>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="container-fluid container-fluid-5">
                                    <div className="row row5">
                                        <div className="col-xl-12">
                                            <CasinoVideo
                                                // gameName={game_name}
                                                // roundId={getValueAfterDot(currentGame?.mid)}
                                                videoSrc={iframe_url}
                                                results={lastResults}
                                                timeLeft={currentGame?.lt || 0}
                                                totalTime={currentGame?.ft || 30}
                                                resultPath={phpFile}
                                                showCardDrawer={false}
                                            // CardsComponent={VideoCards}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <CasinoRightSidebar />
                </div>
            </div>
        </div>
    )
}

export default Matka;