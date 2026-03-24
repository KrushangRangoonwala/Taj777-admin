import React, { useState, useEffect, useRef } from "react";
// import "./kk.css"

import useIsMobile from "../../hooks/useIsMobile";
import { io } from "socket.io-client";
import CasinoVideo from "./components/CasinoVideo";
import { formatNumber } from "../../utilies/helpers";
import { sanitizeNumber } from "../SportsCenterContainer";
import { fetchCasinoExposureApi } from "../../api/api";
import Collapse from "react-bootstrap/Collapse";
import { useLocation } from "react-router-dom";
import { useGetFileData } from "../../hooks/useGetFileData";
import styles from "./Cricket2020.module.css"
import RemarkMarquee from "./components/RemarkMarquee";

const Cricket2020 = ({ isVisible, lastBetTime, onBetSelection, placebet_msg }) => {
    const { CODE, game_type, phpFile, placeBetApi, matchName, game_name, iframe_url, result_image } = useGetFileData();

    const isMobile = useIsMobile();
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(false);
    const socketRef = useRef(null);
    const [exposureData, setExposureData] = useState([]);

    const [ballPopup, setBallPopup] = useState(null);
    const [isPopupShownInThisRound, setIsPopupShownInThisRound] = useState(false);

    useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.[0]?.mid) return;
            try {
                const response = await fetchCasinoExposureApi({
                    markettype: CODE,
                    main_event_id: gameData.t1[0].mid,
                    curPageName: phpFile,
                });
                if (Array.isArray(response?.data)) {
                    setExposureData(response.data);
                }
            } catch (error) {
                console.error("Error fetching exposure:", error);
            }
        };
        fetchExposure();
    }, [gameData?.t1?.[0]?.mid, lastBetTime]);

    const getExposure = (marketId) => {
        if (!Array.isArray(exposureData)) return 0;
        const market = exposureData.find((item) => item.market_id == marketId);
        return market ? market.win_loss || market.total_exposure : 0;
    };

    const renderExposure = (marketId) => {
        const exposure = getExposure(marketId);
        if (exposure === 0) return null;
        return (
            <span style={{ marginLeft: "5px", color: exposure >= 0 ? "green" : "red" }}>
                {exposure}
            </span>
        );
    };

    const handleOddsClick = (marketName, odds, market, isBack) => {
        if (!market) return;

        const min = market?.min || 100;
        const max = market?.max || 300000;

        if (onBetSelection) {
            onBetSelection({
                teamName: marketName,
                odds: odds,
                minBet: min,
                maxBet: max,
                isBack,
                marketId: market.sid,
                eventId: currentGame?.mid,
            });
        }
    };


    useEffect(() => {
        const socket = io("https://trubet9.bet:2053", {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        const handleGameData = (data) => {
            const payload = Array.isArray(data) ? data[0] : data;
            if (payload) {
                setGameData(payload);
            }
        };

        socket.on("connect", () => {
            console.log("✅ Superover Connected:", socket.id);
            socket.emit("Room", game_type);
        });

        socket.on("game", handleGameData);
        socket.on(game_type, handleGameData);

        socket.on("disconnect", (reason) => {
            console.log("⚠️ Superover Disconnected:", reason);
            if (reason === "io server disconnect") socket.connect();
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const currentGame = gameData?.t1?.[0];
    const t1 = currentGame;
    const t2 = gameData?.t2;

    function VideoCards() {
        return (
            <>
                <div className='dealer-name'>Dealer</div>
                <div>
                    <span>
                        <img src={`/assets/cards_new/${currentGame?.C1}.png`} alt="Dealer Card" />
                    </span>
                </div>
            </>
        );
    }

    function CasinoVideoBanner() {
        return (
            <div className="cricket20videobannerbox">
                <img
                    src="https://wver.sprintstaticdata.com/v196/static/front/img/cricket20bg.jpg"
                    className="img-fluid"
                    alt="Cricket Banner"
                />

                <div className="cricket20videobanner">
                    <div>    Team A    <br />    235/4    <br />    20 OVERS</div>

                    <div>    Team A    <br />    223/3    <br />    19.4 OVERS </div>

                    <div className="w-100">
                        Team B Need 12 Runs to WIN Match. If The Score is Tie Team B will WIN.
                    </div>

                    <div className="cricket20bannertitle">
                        Cricket Match 20-20
                    </div>

                    <div className="cricket20balls">
                        <img src="https://wver.sprintstaticdata.com/v196/static/front/img/balls/ball2.png" alt="Ball 2" />
                        <img src="https://wver.sprintstaticdata.com/v196/static/front/img/balls/ball3.png" alt="Ball 3" />
                        <img src="https://wver.sprintstaticdata.com/v196/static/front/img/balls/ball4.png" alt="Ball 4" />
                        <img src="https://wver.sprintstaticdata.com/v196/static/front/img/balls/ball5.png" alt="Ball 5" />
                        <img src="https://wver.sprintstaticdata.com/v196/static/front/img/balls/ball6.png" alt="Ball 6" />
                        <img src="https://wver.sprintstaticdata.com/v196/static/front/img/balls/ball7.png" alt="Ball 7" />
                        <img src="https://wver.sprintstaticdata.com/v196/static/front/img/balls/ball8.png" alt="Ball 8" />
                        <img src="https://wver.sprintstaticdata.com/v196/static/front/img/balls/ball9.png" alt="Ball 9" />
                        <img src="https://wver.sprintstaticdata.com/v196/static/front/img/balls/ball10.png" alt="Ball 10" />
                    </div>
                </div>
            </div>
        );
    }

    function DisplayData({ data }) {
        const ball_ = data.nat.split(" ")[1];
        const ball = Number(ball_);
        const isSuspended = data.gstatus.toLowerCase() === "suspended";

        return (
            <div className={styles['score-box']}>
                <div className={styles['team-score']}>
                    <div>
                        <div className={styles['text-center']}>
                            <b>Team A</b>
                        </div>
                        <div className={styles['text-center']}>
                            <span className={styles['ml-1']}>{t1.C2}/{t1.C3}</span>
                            <span className={styles['ml-1']}>{t1.C4} Overs</span>
                        </div>
                    </div>

                    <div>
                        <div className={styles['text-center']}>
                            <b>Team B</b>
                        </div>
                        <div className={styles['text-center']}>
                            <span className={styles['ml-1']}>{t1.C5}/{t1.C6}</span>
                            <span className={styles['ml-1']}>{t1.C7} Overs</span>
                        </div>
                    </div>
                </div>

                <div className={styles['ball-icon']}>
                    <img src={`/assets/cards_new/balls/ball${ball}.png`} alt={`Ball ${ball}`} />
                </div>

                <div className={`${styles.blbox} ${isSuspended ? "suspended" : ""}`}>
                    <div className={styles.back}>
                        <span
                            className={`${styles.odds} ${styles['d-block']}`}
                            onClick={() => handleOddsClick(data.nat, data.b1, data, true)}
                        >
                            {data.b1}
                        </span>
                    </div>
                    <div className={styles.lay}>
                        <span
                            className={`${styles.odds} ${styles['d-block']}`}
                            onClick={() => handleOddsClick(data.nat, data.l1, data, false)}
                        >
                            {data.l1}
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    useEffect(() => {
        if (gameData?.t1?.[0]?.mid) {
            setIsPopupShownInThisRound(false);
        }
    }, [gameData?.t1?.[0]?.mid])

    useEffect(() => {
        if (placebet_msg) {
            setBallPopup(placebet_msg);
            setIsPopupShownInThisRound(true);
        }
    }, [placebet_msg])

    useEffect(() => {
        if (t2?.[0]?.gstatus?.toLowerCase() === "suspended" && !ballPopup && !isPopupShownInThisRound) {
            setBallPopup("RUNS 0");
            setIsPopupShownInThisRound(true);
        }
    }, [t2]);

    useEffect(() => {
        if (ballPopup) {
            setTimeout(() => {
                setBallPopup(null);
            }, 3000);
        }
    }, [ballPopup])

    function Popup() {
        const ball = ballPopup?.split(' ')[1];
        if (ballPopup) {
            return (
                <div className="cricket20ballpopup">
                    <img src={`/assets/cards_new/balls/ball${ball}.png`} />
                    {/* <span>{ballPopup}</span> */}
                </div>
            )
        }
    }

    function Exposure() {
        return (
            <div className={styles['cricket20books']}>
                <div> 2 -&gt; <span className={styles['text-danger']}>-12</span></div>
                <div> 3 -&gt; <span className={styles['text-danger']}>-12</span></div>
                <div> 4 -&gt; <span className={styles['text-danger']}>-12</span></div>
                <div> 5 -&gt; <span className={styles['text-danger']}>-12</span></div>
                <div> 6 -&gt; <span className={styles['text-danger']}>-12</span></div>
                <div> 7 -&gt; <span className={styles['text-danger']}>-12</span></div>
                <div> 8 -&gt; <span className={styles['text-danger']}>-12</span></div>
                <div> 9 -&gt; <span className={styles['text-danger']}>-12</span></div>
                <div> 10 -&gt; <span className={styles['text-danger']}>-12</span></div>
                <div> 1 -&gt; <span className={styles['text-success']}>100</span></div>
            </div>
        )
    }

    return (
        <>
            <div
                className={`casino-table ${styles['casino-table']}  cricket20 ${styles['cricket20']} kk`} // ${styles['cricket20']}
                style={{ width: isMobile ? '100vw' : 'auto' }}
            >
                {/* <div className="game-header sport4">
                    <span className="game-header-name">{currentGame?.ename}</span>
                    <span className="game-header-date">Round ID: {currentGame?.mid || "Loading..."}</span>
                </div> */}

                {/* <div className="container-fluid container-fluid-5">
                    <div className="row row5">
                        <div className="col-lg-10 col-12" style={{ width: "100%" }}> */}
                <CasinoVideo
                    gameName="Cricket Match 20-20"
                    roundId={currentGame?.mid}
                    videoSrc={iframe_url}
                    isCardDrawerOpen={isCardDrawerOpen}
                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                    autotime={currentGame?.autotime}
                    totalTime={currentGame?.ft}
                    cards={[currentGame?.C1]}
                    CardsComponent={VideoCards}
                    Popup={Popup}
                // Exposure={Exposure}
                // OtherComponent={CasinoVideoBanner}
                />
                {/* </div>
                    </div>
                </div> */}

                <div className={styles['casino-detail']}>
                    <div className={styles['teen20casino-container']}>
                        <div className={styles['teen20left']}>
                            {t2?.length > 0 && t2?.slice(0, 5).map(val => <DisplayData data={val} key={val.nat} />)}
                        </div>

                        <div className={styles['teen20right']}>
                            {t2?.length > 0 && t2?.slice(5).map(val => <DisplayData data={val} key={val.nat} />)}

                            <RemarkMarquee remark={t1?.remark} />
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
};

export default Cricket2020;
