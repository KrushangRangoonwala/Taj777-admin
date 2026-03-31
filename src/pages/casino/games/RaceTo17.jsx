import React, { useState, useEffect } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
// import { fetchCasinoExposureApi } from "../../../api/api";
import { getImage, getMarketByNation, getValueAfterDot, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import LastResult from "./components/LastResult";

const RaceTo17 = ({ onBetSelection, lastBetTime }) => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [lastResults, setLastResults] = useState([]);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);

    const socket = useSocket("casino");
    useEffect(() => {
        if (!socket) return;

        const handleData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) {
                    setGameData(payload);
                }
            } catch (error) {
                console.error("Error processing RaceTo17 data:", error);
            }
        };

        const handleGameResult = (data) => {
            try {
                const results = data?.res || data;
                if (Array.isArray(results)) {
                    setLastResults(results);
                }
            } catch (error) {
                console.error("Error processing RaceTo17 gameResult:", error);
            }
        };

        const handleConnect = () => {
            console.log(`✅ ${game_type} Connected:`, socket.id);
            socket.emit("Room", game_type);
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on("game", handleData);
        socket.on(game_type, handleData);
        socket.on("gameResult", handleGameResult);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleData);
            socket.off(game_type, handleData);
            socket.off("gameResult", handleGameResult);
        };
    }, [socket, game_type]);

    // useEffect(() => {
    //     const fetchExposure = async () => {
    //         if (!gameData?.t1?.[0]?.mid) return;
    //         try {
    //             const response = await fetchCasinoExposureApi({
    //                 markettype: CODE,
    //                 main_event_id: getValueAfterDot(gameData.t1[0].mid),
    //                 curPageName: phpFile,
    //             });
    //             if (Array.isArray(response?.data)) {
    //                 setExposureData(response.data);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching exposure:", error);
    //         }
    //     };
    //     fetchExposure();
    // }, [gameData?.t1?.[0]?.mid, lastBetTime, CODE, phpFile]);

    // const getExposure = (marketId) => {
    //     if (!Array.isArray(exposureData)) return 0;
    //     const market = exposureData.find((item) => item.market_id == marketId);
    //     return market ? market.win_loss || market.total_exposure : 0;
    // };

    // const renderExposureByNat = (nat) => {
    //     const market = getMarketByNation(marketData, nat, "nat");
    //     if (!market) return 0;
    //     const exposure = getExposure(market.sid);
    //     if (exposure === 0) return 0;
    //     return (
    //         <span className={exposure >= 0 ? "book-black" : "book-red"}>
    //             {exposure}
    //         </span>
    //     );
    // };

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

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

    const getMarketByName = (marketName) => getMarketByNation(marketData, marketName, "nat");
    const getMarketBySubtype = (subtype) => marketData.find((m) => m.subtype === subtype);

    const BetBox = ({ marketName, className = "", children, type = "back", subtype = null }) => {
        const market = subtype ? getMarketBySubtype(subtype) : getMarketByName(marketName);
        const name = market?.nat || marketName;
        const suspended = getIsSuspended(market);
        const odds = type === "back" ? market?.b1 : market?.l1;

        return (
            <div
                className={`${className} ${suspended ? "suspended" : ""}`}
                onClick={() => handleOddsClick(name, odds, market, type === "back", suspended)}
            >
                {suspended || odds == 0 || odds === "0" ? (
                    <img src="/assets/images/lock.svg" alt="lock" style={{ width: "15px", height: "15px", opacity: 1, zIndex: 10, position: "relative" }} />
                ) : (
                    children(odds)
                )}
            </div>
        );
    };

    const getRankValue = (card) => {
        if (!card || card === "1") return 0;
        const r = card.replace(/[SHDC]+$/i, "");
        if (r === "A") return 1;
        if (["10", "J", "Q", "K"].includes(r)) return 0;
        return parseInt(r) || 0;
    };

    const allCards = [
        currentGame?.C1, currentGame?.C2, currentGame?.C3, currentGame?.C4,
        currentGame?.C5, currentGame?.C6, currentGame?.C7, currentGame?.C8,
        currentGame?.C9, currentGame?.C10, currentGame?.C11, currentGame?.C12,
    ].filter((c) => c !== undefined && c !== "" && c !== null);

    const total = allCards.reduce((sum, card) => sum + getRankValue(card), 0);

    const Cards = () => {
        const displayCards = [...allCards];
        while (displayCards.length < 5) {
            displayCards.push("1");
        }

        return (
            <>
                <div className="race-total">Total: {total}</div>
                {displayCards.map((card, idx) => (
                    <div key={idx}>
                        <span data-v-b64efdfa="">
                            <img
                                data-v-b64efdfa=""
                                src={getImage(card, result_image)}
                                alt={`Card ${idx + 1}`}
                            />
                        </span>
                    </div>
                ))}
            </>
        );
    };

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table raceto17">
                                <CasinoVideo
                                    gameName={game_name}
                                    roundId={currentGame?.mid}
                                    videoSrc={iframe_url}
                                    results={lastResults}
                                    timeLeft={currentGame?.autotime || 0}
                                    totalTime={currentGame?.ft || 30}
                                    isCardDrawerOpen={isCardDrawerOpen}
                                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                                    CardsComponent={Cards}
                                    resultPath={phpFile}
                                />

                                <div className="casino-detail">
                                    {/* MOBILE VIEW */}
                                    <div className="row row5 d-none-big">
                                        {[
                                            { label: "Main Bet", nat: "Race to 17", subtype: null },
                                            { label: "Big Card", subtype: "bigcard" },
                                            { label: "Zero Card", subtype: "zerocard" },
                                            { label: "Any Zero Card", nat: "Any Zero", subtype: "anyzero" },
                                        ].map((item, index) => {
                                            const market = item.subtype ? getMarketBySubtype(item.subtype) : getMarketByName(item.nat);
                                            const label = market?.nat || item.label;
                                            return (
                                                <div key={index} className="casino-bl-box">
                                                    <div className="casino-bl-box-item casino-odds-name">
                                                        <b>{item.label}</b>
                                                        <span className="float-right text-success book-black">0</span>
                                                    </div>
                                                    <BetBox marketName={item.nat} subtype={item.subtype} className="back casino-bl-box-item" type="back">
                                                        {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                    </BetBox>
                                                    <BetBox marketName={item.nat} subtype={item.subtype} className="lay casino-bl-box-item" type="lay">
                                                        {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                    </BetBox>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* DESKTOP VIEW */}
                                    <div className="row row5 d-none-small">
                                        {[
                                            { label: "Race to 17", nat: "Race to 17", subtype: null },
                                            { label: "Big Card", subtype: "bigcard" },
                                            { label: "Zero Card", subtype: "zerocard" },
                                            { label: "Any Zero", subtype: "anyzero" },
                                        ].map((item, index) => {
                                            const market = item.subtype ? getMarketBySubtype(item.subtype) : getMarketByName(item.nat);
                                            const label = market?.nat || item.label;
                                            return (
                                                <div key={index} className="col-3">
                                                    <div className="casino-box-row">
                                                        <div className="casino-nation-name">
                                                            <b>{label}</b>
                                                        </div>
                                                        <div className="casino-bl-box">
                                                            <BetBox marketName={item.nat} subtype={item.subtype} className="back casino-bl-box-item" type="back">
                                                                {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                            </BetBox>
                                                            <BetBox marketName={item.nat} subtype={item.subtype} className="lay casino-bl-box-item" type="lay">
                                                                {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                            </BetBox>
                                                        </div>
                                                        <div className="casino-nation-name book-black">
                                                            {/* {renderExposureByNat(item.nat)} */}
                                                            0
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <LastResult
                                        results={lastResults}
                                        gameName={game_name}
                                        resultPath={phpFile}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <CasinoRightSidebar />
                </div>
            </div>
        </div>
    );
};

export default RaceTo17;
