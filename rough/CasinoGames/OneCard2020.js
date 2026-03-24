import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { fetchCasinoExposureApi } from "../../api/api";
import { getImage, getMarketByNation, getValueAfterDot, getIsSuspended, getValueBeforeDot, normalizeNumber } from "../../utilies/helpers";
import { useGetFileData } from "../../hooks/useGetFileData";
import CasinoVideo from "./components/CasinoVideo";
import useIsMobile from "../../hooks/useIsMobile";

const OneCard2020 = ({ isVisible, onBetSelection, lastBetTime }) => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [exposureData, setExposureData] = useState([]);
    const socketRef = useRef(null);
    const isMobile = useIsMobile(767);

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
    }, [gameData?.t1?.[0]?.mid, lastBetTime, CODE, phpFile]);

    const getExposure = (marketId) => {
        if (!Array.isArray(exposureData)) return 0;
        const market = exposureData.find((item) => item.market_id == marketId);
        return market ? market.win_loss || market.total_exposure : 0;
    };

    const renderExposure = (marketId) => {
        const exposure = getExposure(marketId);
        if (exposure === 0) return null;
        return (
            <span className={`mr-1 ${exposure > 0 ? 'book-green' : 'book-red'}`}>
                {exposure}
            </span>
        );
    };

    useEffect(() => {
        const socket = io("https://trubet9.bet:2053", {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        const handleData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) {
                    setGameData(payload);
                }
            } catch (error) {
                console.error("Error processing 1card2020 data:", error);
            }
        };

        socket.on("connect", () => {
            console.log(`✅ ${game_type} Connected:`, socket.id);
            socket.emit("Room", game_type);
        });

        socket.on(game_type, handleData);
        socket.on("game", handleData);

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [game_type]);

    const currentGame = gameData?.t1?.[0];
    const data = gameData?.t2 || [];

    const handleOddsClick = (marketName, odds, market, isBack) => {
        if (!market || odds == 0) return;

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
                eventId: getValueAfterDot(currentGame?.mid),
            });
        }
    };

    const getMarket = (nation) => {
        return data.find((m) => m.nat === nation);
    };

    const isSuspended = (market) => {
        return market?.gstatus === "0" || market?.gstatus === "suspended" || market?.gstatus === "SUSPENDED";
    };

    const Cards = () => {
        const C1 = currentGame?.C1;
        const C2 = currentGame?.C2;
        const card_1 = getImage(C1, result_image);
        const card_2 = getImage(C2, result_image);

        return (
            <>
                <div>
                    <div className="dealer-name w-100 mb-1">Player</div>
                    <div><span><span><img src={card_1} alt="Player Card" /></span></span></div>
                </div>
                <div>
                    <div className="dealer-name w-100 mb-1">Dealer</div>
                    <div><span><span><img src={card_2} alt="Dealer Card" /></span></span></div>
                </div>
            </>
        );
    };

    return (
        <div className="casino-table teen1oneday teen1t20 dt20">
            <CasinoVideo
                gameName={game_name}
                roundId={currentGame?.mid}
                videoSrc={iframe_url}
                isCardDrawerOpen={isCardDrawerOpen}
                setIsCardDrawerOpen={setIsCardDrawerOpen}
                autotime={currentGame?.autotime}
                totalTime={currentGame?.ft} cards={[currentGame?.C1, currentGame?.C2]}
                CardsComponent={Cards}
            />

            <div className="casino-detail">
                <div className="dtobx-top">
                    {(() => {
                        const nation = "Player";
                        const market = getMarket(nation);
                        const suspended = isSuspended(market);
                        const class_name = "dragon-box";

                        return (
                            <div
                                className={` ${class_name} ${suspended ? "suspended" : ""} `}
                                onClick={() => !suspended && handleOddsClick(nation, market?.b1, market, true)}
                            >
                                <div className="flex-book">
                                    <b>{nation}</b>
                                    {renderExposure(market?.sid) || "0"}
                                </div>
                                <div className="text-center flex-odds">
                                    <span className="d-block">
                                        <b>{getValueBeforeDot(market?.b1) || "0"}</b>
                                    </span>
                                </div>
                            </div>
                        );
                    })()}

                    {(() => {
                        const nation = "Tie";
                        const market = getMarket(nation);
                        const suspended = isSuspended(market);
                        const class_name = "tie-box";

                        return (
                            <div
                                className={` ${class_name} ${suspended ? "suspended-circular" : ""} `}
                                onClick={() => !suspended && handleOddsClick(nation, market?.b1, market, true)}
                            >
                                <div className="flex-book" style={{ textAlign: "center" }}>
                                    <b>{nation}</b>
                                    <span className="d-block">
                                        <b>{getValueBeforeDot(market?.b1) || "0"}</b>
                                    </span>
                                </div>
                                <div className="text-center flex-odds">
                                    {renderExposure(market?.sid) || "0"}
                                </div>
                            </div>
                        );
                    })()}

                    {(() => {
                        const nation = "Dealer";
                        const market = getMarket(nation);
                        const suspended = isSuspended(market);
                        const class_name = "tiger-box";

                        return (
                            <div
                                className={` ${class_name} ${suspended ? "suspended" : ""} `}
                                onClick={() => !suspended && handleOddsClick(nation, market?.b1, market, true)}
                            >
                                <div className="flex-book">
                                    <b>{nation}</b>
                                    {renderExposure(market?.sid) || "0"}
                                </div>
                                <div className="text-center flex-odds">
                                    <span className="d-block">
                                        <b>{getValueBeforeDot(market?.b1) || "0"}</b>
                                    </span>
                                </div>
                            </div>
                        );
                    })()}

                    {(() => {
                        const nation = "Pair";
                        const market = getMarket(nation);
                        const suspended = isSuspended(market);
                        const class_name = "pair-box";

                        return (
                            <div
                                className={` ${class_name} ${suspended ? "suspended" : ""} `}
                                onClick={() => !suspended && handleOddsClick(nation, market?.b1, market, true)}
                            >
                                <div className="flex-book">
                                    <b>{nation}</b>
                                </div>
                                <div className="text-center flex-odds">
                                    <span className="d-block">
                                        <b>{normalizeNumber(market?.b1) || "0"}</b>
                                    </span>
                                    {renderExposure(market?.sid) || "0"}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};

export default OneCard2020;
