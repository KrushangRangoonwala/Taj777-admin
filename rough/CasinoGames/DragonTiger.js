import React, { useState, useEffect, useRef } from "react";
// import { io } from "socket.io-client";
import { useSocket } from "../../components/Socket/useSocket";
import { fetchCasinoExposureApi } from "../../api/api";
import { getDefaultCardImage, getImage, getValueAfterDot, getValueBeforeDot, normalizeNumber } from "../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import { useGamePathName, useGetFileData } from "../../hooks/useGetFileData";
import RemarkMarquee from "./components/RemarkMarquee";

const topRow = ["Even", "Odd", "Red", "Black"];

const commonCards = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const bottomRow = [
    { name: "Even", },
    { name: "Odd", },
    { name: "Black", types: ["spade", "club"], },
    { name: "Red", types: ["heart", "diamond"], },
];

const DragonTiger = ({ isVisible, onBetSelection, lastBetTime }) => {
    const { CODE, game_type, phpFile, placeBetApi, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [exposureData, setExposureData] = useState([]);
    const socketRef = useRef(null);
    const isDT_2 = game_type === "dt202";

    useEffect(() => {
        // console.log('exposureData', exposureData);
    }, [exposureData]);

    const isDragonTiger_2 = useGamePathName() === "dragontigert202";

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

    const handleOddsClick = (marketName, odds, market, isBack) => {
        console.log(marketName, odds, market, isBack);
        console.log("handleOddsClick...............")
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
                eventId: getValueAfterDot(currentGame?.mid),
            });
        }
    };

    // Helper to get market by nation
    const getMarket = (nation) => {
        // if (isDragonTiger_2) {
        return data.find((m) => m.nat === nation);
        // }
        // return data.find((m) => m.nation === nation);
    };

    const getMarketBySid = (sid) => {
        return data.find((m) => m.sid == sid);
    };

    const isSuspended = (market) => {
        return market?.gstatus === "0" || market?.gstatus === "suspended" || market?.gstatus === "SUSPENDED";
    };

    function Cards() {
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

    const cards = isDragonTiger_2 ? ["A", ...commonCards] : ["1", ...commonCards];

    const randomMarket = getMarket("Dragon Card 2"); // TAKE RANDOM CARD TO CHECK IF IT SUSPENDED OR NOT
    const isAllCardsSuspended = isSuspended(randomMarket);


    const DragonTigerPlayerSection = ({ playerName, playerClass }) => {
        return (
            <div>
                {/* 4 BOXES */}
                <div>
                    <div className="casino-box-row justify-content-center casino-odds">
                        <div className="text-left w-100"><b className={playerClass}>{playerName}</b></div>
                    </div>
                    <div className="casino-box-row">
                        {topRow.map((nation) => {
                            const label = `${playerName} ${nation}`;
                            const market = getMarket(label);
                            const suspended = isSuspended(market);

                            return (
                                <div
                                    key={nation}
                                    className={`casino-bl-box`}
                                // onClick={() => !suspended && handleOddsClick(nation, market?.rate, market, true)}
                                >
                                    <b>{suspended ? 0 : (normalizeNumber(market?.rate) ?? "-")}</b>
                                </div>
                            );
                        })}
                    </div>
                    <div className="casino-box-row">
                        {bottomRow.map((item) => {
                            const label = `${playerName} ${item.name}`
                            const market = getMarket(label);
                            const suspended = isSuspended(market);

                            return (
                                <div
                                    key={item.sid}
                                    className={`casino-bl-box`}
                                    onClick={() => !suspended && handleOddsClick(label, market?.rate, market, true)}
                                >
                                    <div className={`back casino-bl-box-item ${item.types ? "casino-card-img" : ""} ${suspended ? "suspended" : ""}`}>
                                        {item.types ? (
                                            <span>
                                                {item.types.map(type => (
                                                    <img key={type} src={getImage(type, result_image)} alt={type} />
                                                ))}
                                            </span>
                                        ) : (
                                            <span className="casino-box-odd">{item.name}</span>
                                        )}
                                        {/* {console.log('renderExposure(item.sid)', renderExposure(item.sid))} */}
                                        {renderExposure(market?.sid)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Below are player's 13 cards  */}
                <div className="casino-box cards-box mt-3">
                    <div className="w-100">
                        <div className="casino-odds">
                            <div className="text-center w-100"><b>{isAllCardsSuspended ? 0 : 12}</b></div>
                        </div>
                        <div className="casino-cards text-center mt-1">
                            {cards.map((card, idx) => {
                                const nation = `${playerName} Card ${card}`;
                                const market = getMarket(nation);
                                const suspended = isSuspended(market);
                                const card_ = card === '1' ? 'A' : card;
                                return (
                                    <div
                                        key={idx}
                                        className="casino-card-item"
                                        onClick={() => !suspended && handleOddsClick(nation, market?.rate, market, true)}
                                    >
                                        <div className={`card-image ${suspended ? "suspended" : ""}`}>
                                            <img src={getImage(card_, "cards_new/lucky6")} alt={card} />
                                        </div>
                                        <div className="casino-book">{renderExposure(market?.sid)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const dragonMarket = getMarket("Dragon");
    const tigerMarket = getMarket("Tiger");
    const tieMarket = getMarket("Tie");
    const pairMarket = getMarket("Pair");

    return (
        <>
            <div className="casino-table dt20 kk">
                <CasinoVideo
                    gameName={game_name}
                    roundId={currentGame?.mid}
                    videoSrc={iframe_url}
                    isCardDrawerOpen={isCardDrawerOpen}
                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                    autotime={currentGame?.autotime}
                    totalTime={currentGame?.ft}
                    CardsComponent={Cards}
                    cards={[currentGame?.C1, currentGame?.C2]}
                />


                <div className="casino-detail">
                    <div className="text-right w-100 pr"></div>

                    <div className="dtobx-top">
                        <div
                            className={`dragon-box ${isSuspended(dragonMarket) ? "suspended" : ""}`}
                            onClick={() => !isSuspended(dragonMarket) && handleOddsClick("Dragon", dragonMarket?.rate, dragonMarket, true)}
                        >
                            <div className="flex-book">
                                <b>Dragon</b>
                                {renderExposure(dragonMarket?.sid) || "0"}
                            </div>
                            <div className="text-center flex-odds">
                                <span className="d-block">
                                    <b>{getValueBeforeDot(dragonMarket?.rate) || "0"}</b>
                                </span>
                            </div>
                        </div>

                        <div
                            className={`tie-box ${isSuspended(tieMarket) ? "suspended-circular" : ""}`}
                            onClick={() => !isSuspended(tieMarket) && handleOddsClick("Tie", tieMarket?.rate, tieMarket, true)}
                            style={{ lineHeight: '23px' }}
                        >
                            <div className="flex-book" style={{ textAlign: "center" }}>
                                <b style={{ fontSize: "18px" }}>Tie</b>
                            </div>
                            <span className="d-block" style={{ lineHeight: '12px' }}>
                                <b>{normalizeNumber(tieMarket?.rate) || "0"}</b>
                            </span>
                            <div className="text-center flex-odds" style={{ lineHeight: '12px' }}>
                                {renderExposure(tieMarket?.sid) || "0"}
                            </div>
                        </div>

                        <div
                            className={`tiger-box ${isSuspended(tigerMarket) ? "suspended" : ""}`}
                            onClick={() => !isSuspended(tigerMarket) && handleOddsClick("Tiger", tigerMarket?.rate, tigerMarket, true)}
                        >
                            <div className="flex-book">
                                <b>Tiger</b>
                                {renderExposure(tigerMarket?.sid) || "0"}
                            </div>
                            <div className="text-center flex-odds">
                                <span className="d-block">
                                    <b>{normalizeNumber(tigerMarket?.rate) || "0"}</b>
                                </span>
                            </div>
                        </div>

                        <div
                            className={`pair-box ${isSuspended(pairMarket) ? "suspended" : ""}`}
                            onClick={() => !isSuspended(pairMarket) && handleOddsClick("Pair", pairMarket?.rate, pairMarket, true)}
                        >
                            <div className="flex-book">
                                <b>Pair</b>
                            </div>
                            <div className="text-center flex-odds">
                                <span className="d-block">
                                    <b>{normalizeNumber(pairMarket?.rate) || "0"}</b>
                                </span>
                                {renderExposure(pairMarket?.sid) || "0"}
                            </div>
                        </div>
                    </div>

                    <div className="teen1daycasino-container mt-3">
                        <div className="teen1dayleft">
                            <DragonTigerPlayerSection playerName="Dragon" playerClass="text-playera" />
                        </div>

                        <div className="teen1daycenter"></div>

                        <div className="teen1dayright">
                            <DragonTigerPlayerSection playerName="Tiger" playerClass="text-playerb" />
                        </div>
                    </div>

                    {!isDT_2 && <RemarkMarquee remark={currentGame?.remark} />}
                </div>

                {/* {isDT_2 && <div className="casino-remark mt-1 w-100">
                    <div className="remark-icon"><img src={getImage("remark", "images")} /></div>
                    <marquee>{currentGame?.desc || " "}</marquee>
                </div>} */}
            </div>
        </>

    );
};

export default DragonTiger;
