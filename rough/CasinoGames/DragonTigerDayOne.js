import React, { useState, useEffect, useRef } from "react";
// import { io } from "socket.io-client";
import { useSocket } from "../../components/Socket/useSocket";
import { fetchCasinoExposureApi } from "../../api/api";
import { getDefaultCardImage, getImage, getMarketByNation, getValueAfterDot, getValueBeforeDot, getIsSuspended, normalizeNumber } from "../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import { useGamePathName, useGetFileData } from "../../hooks/useGetFileData";

const bottomRow = [
    { name: "Even", },
    { name: "Odd", },
    { name: "Black", types: ["spade", "club"] },
    { name: "Red", types: ["heart", "diamond"] },
];

const topRow = ["Even", "Odd", "Black", "Red"];

const cardSuits = ["Spade", "Heart", "Club", "Diamond"];

const DragonTigerDayOne = ({ isVisible, onBetSelection, lastBetTime }) => {
    const { CODE, game_type, phpFile, placeBetApi, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [exposureData, setExposureData] = useState([]);
    const socketRef = useRef(null);

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

    const socket = useSocket("casino");
    useEffect(() => {
        if (!socket) return;

        const handleBollywoodData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) {
                    setGameData(payload);
                }
            } catch (error) {
                console.error("Error processing Bollywood data:", error);
            }
        };

        const handleConnect = () => {
            console.log(`✅ ${game_type} Connected:`, socket.id);
            socket.emit("Room", game_type);
        };

        const handleDisconnect = (reason) => {
            console.log(`⚠️ ${game_type} Disconnected:`, reason);
        };

        const handleConnectError = (error) => {
            console.error("🔴 Connection Error:", error.message);
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on(game_type, handleBollywoodData);
        socket.on("game", handleBollywoodData);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        return () => {
            socket.off("connect", handleConnect);
            socket.off(game_type, handleBollywoodData);
            socket.off("game", handleBollywoodData);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
        };
    }, [socket, game_type]);

    const currentGame = gameData?.t1?.[0];
    const data = gameData?.t2 || [];

    const handleOddsClick = (marketName, odds, market, isBack, suspended) => {
        if (!market || suspended || odds == 0) return;

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

    const getMarketByName = (marketName) => getMarketByNation(data, marketName, 'nat');


    function Cards() {
        // const isCardClose
        const C1 = currentGame?.C1;
        const C2 = currentGame?.C2;
        const card_1 = C1 === '1' || !C1 ? getImage(C1, "cards_new") : getImage(C1, result_image);
        const card_2 = C2 === '1' || !C2 ? getImage(C2, "cards_new") : getImage(C2, result_image);

        return (
            <div>
                <span><img src={card_1} alt="Dragon Card" /></span>
                <span><img src={card_2} alt="Tiger Card" /></span>
            </div>
        );
    }

    const DragonTigerPlayerSection = ({ playerName, playerClass }) => {
        return (
            <div>
                <div className="casino-box-row casino-odds">
                    <div className="text-left w-100"><b className={playerClass}>{playerName}</b></div>
                </div>

                <div className="casino-box-row">
                    {topRow.map((nation) => {
                        const label = `${playerName} ${nation}`;
                        const market = getMarketByName(label);
                        const suspended = getIsSuspended(market);
                        return (
                            <div
                                key={label}
                                className={`casino-bl-box`}
                                onClick={() => handleOddsClick(label, market?.b1, market, true, suspended)}
                            >
                                <b>{suspended ? 0 : (normalizeNumber(market?.b1) ?? "-")}</b>
                            </div>
                        );
                    })}
                </div>

                <div className="casino-box-row">
                    {bottomRow.map((item) => {
                        const label = `${playerName} ${item.name}`;
                        const market = getMarketByName(label);
                        const suspended = getIsSuspended(market);

                        return (
                            <div
                                key={label}
                                className={`casino-bl-box`}
                                onClick={() => handleOddsClick(label, market?.b1, market, true, suspended)}
                            >
                                <div className={`back casino-bl-box-item ${item.types ? "casino-card-img" : ""} ${suspended ? "suspended" : ""}`}>
                                    {item.types ? (
                                        <span>
                                            {item.types.map(type => (
                                                <img key={type} src={getImage(type.toLowerCase())} alt={type} />
                                            ))}
                                        </span>
                                    ) : (
                                        <span className="casino-box-odd">{item.name}</span>
                                    )}
                                    {renderExposure(market?.sid)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Card Suits Section */}
                <div className="mt-3">
                    <div className="casino-box-row">
                        {cardSuits.map((suit) => {
                            const label = `${playerName} ${suit}`;
                            return (
                                <div key={label + '_img'} className="casino-bl-box">
                                    <div className="casino-bl-box-item casino-card-img">
                                        <img src={getImage(suit.toLowerCase())} alt={label} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="casino-box-row">
                        {cardSuits.map((suit) => {
                            const label = `${playerName} ${suit}`;
                            const market = getMarketByName(label);
                            const suspended = getIsSuspended(market);
                            return (
                                <div
                                    key={label + '_rate'}
                                    className="casino-bl-box"
                                    onClick={() => handleOddsClick(label, market?.b1, market, true, suspended)}
                                >
                                    <div className={`back casino-bl-box-item ${suspended ? "suspended" : ""}`}>
                                        <span className="casino-box-odd">{suspended ? 0 : (normalizeNumber(market?.b1) ?? "-")}</span>
                                        {renderExposure(market?.sid)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };


    return (
        <>
            <div className="casino-table dt1day">
                <CasinoVideo
                    gameName={game_name}
                    roundId={currentGame?.mid}
                    videoSrc={iframe_url}
                    isCardDrawerOpen={isCardDrawerOpen}
                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                    autotime={currentGame?.autotime}
                    totalTime={currentGame?.ft}
                    cards={[currentGame?.C1, currentGame?.C2]}
                    CardsComponent={Cards}
                />

                <div className="casino-detail">
                    <div className="dt1dayfancy">
                        {["Dragon", "Pair", "Tiger"].map(val => {
                            const class_name = val === "Dragon" ? "dragonfancy" : val === "Pair" ? "pairfancy" : "tigerfancy";
                            const market = getMarketByName(val);
                            const isSuspended = market?.gstatus.toUpperCase() === "SUSPENDED";
                            return (
                                <div className={`casino-box-row ${class_name}`}>
                                    <div className="casino-nation-name"><b>{val}</b></div>
                                    <div className="casino-bl-box">
                                        <div
                                            className={`back casino-bl-box-item ${isSuspended ? "suspended" : ""}`}
                                            onClick={() => handleOddsClick(val, market?.b1, market, true, isSuspended)}
                                        >
                                            <span className="casino-box-odd">{normalizeNumber(market?.b1)}</span>
                                        </div>
                                        {val !== 'Pair' &&
                                            <div
                                                className={`lay casino-bl-box-item ${isSuspended ? "suspended" : ""}`}
                                                onClick={() => handleOddsClick(val, market?.l1, market, false, isSuspended)}
                                            >
                                                <span className="casino-box-odd">{normalizeNumber(market?.l1)}</span>
                                            </div>
                                        }
                                    </div>

                                    <div className="casino-nation-name text-center w-100">
                                        {renderExposure(market?.sid)}
                                    </div>
                                </div>
                            )
                        })}
                    </div>


                    <div className="teen1daycasino-container mt-2">
                        <div className="teen1dayleft">
                            <DragonTigerPlayerSection playerName="Dragon" playerClass="text-playera" />
                        </div>

                        <div className="teen1daycenter"></div>

                        <div className="teen1dayright">
                            <DragonTigerPlayerSection playerName="Tiger" playerClass="text-playerb" />
                        </div>
                    </div>



                </div>

            </div>
        </>

    );
};

export default DragonTigerDayOne;
