import React, { useState, useEffect, useRef } from "react";
import "./kk.css"
import useIsMobile from "../../hooks/useIsMobile";
import { io } from "socket.io-client";
import CasinoVideo from "./components/CasinoVideo";
import { fetchCasinoExposureApi } from "../../api/api";
import Collapse from "react-bootstrap/Collapse";
import { useGetFileData } from "../../hooks/useGetFileData";
import styles from "./Cricket2020.module.css"
import RemarkMarquee from "./components/RemarkMarquee";
import { sanitizeNumber } from "../SportsCenterContainer";
import { formatNumber } from "../../utilies/helpers";

const Cmeter_1card = ({ isVisible, lastBetTime, onBetSelection }) => {
    const { CODE, game_type, phpFile, placeBetApi, matchName, game_name, iframe_url, result_image } = useGetFileData();

    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(false);
    const socketRef = useRef(null);
    const [exposureData, setExposureData] = useState([]);

    useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.mid) return;
            try {
                const response = await fetchCasinoExposureApi({
                    markettype: CODE,
                    main_event_id: gameData.t1.mid,
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
    }, [gameData?.t1?.mid, lastBetTime]);

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
    const cards = [currentGame?.C1, currentGame?.C2];

    const t2 = gameData?.t2;

    const fightImg = "/assets/cards_new/fight.png";

    const cardUrl = (card) => `https://wver.sprintstaticdata.com/v196/static/front/img/cards/${card}.png`;

    function VideoCards() {
        return (
            <div>
                {cards.map((card, index) => (
                    <span key={index}>
                        <img src={cardUrl(card)} alt={`Card ${card}`} />
                    </span>
                ))}
            </div>
        );
    }

    return (
        <>
            <div className={`casino-table one-card-meter kk`} > {/* ${styles['cricket20']} */}
                <CasinoVideo
                    gameName={game_name}
                    roundId={currentGame?.mid}
                    videoSrc={iframe_url}
                    isCardDrawerOpen={isCardDrawerOpen}
                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                    autotime={currentGame?.autotime}
                    totalTime={currentGame?.ft}
                    CardsComponent={VideoCards}
                    cards={cards}
                // OtherComponent={CasinoVideoBanner}
                />

                <div className="casino-detail">
                    <div className="text-right w-100 pr">
                        <div className="meter-btns">
                            {t2?.map((fighter, idx) => {
                                const isSuspended = fighter.gstatus === 'SUSPENDED';
                                return (
                                    <div
                                        key={fighter.nat}
                                        className="meter-btn"
                                        onClick={() => handleOddsClick(fighter.nat, fighter.b1, fighter, true)}
                                    >
                                        <div className={`meter-btn-box ${isSuspended ? 'suspended' : ''}`}>
                                            <button className={`btn btn-fighter-${fighter.sid}`}>
                                                {idx === 1 && (
                                                    <img src={fightImg} alt="Fight" />
                                                )}
                                                {fighter.nat}
                                                {idx === 0 && (
                                                    <img src={fightImg} alt="Fight" />
                                                )}
                                            </button>
                                        </div>

                                        <div className="text-center d-none">0</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

            </div>
        </>

    );
};

export default Cmeter_1card;
