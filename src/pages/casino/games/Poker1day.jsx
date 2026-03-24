import React, { useState, useEffect } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
// import { fetchCasinoExposureApi } from "../../../api/API";
import { getImage, getMarketByNation, getValueAfterDot, getIsSuspended } from "../../../utilies/helpers";
import OneCardVideo from "./components/OneCardVideo";

const OneCard1day = ({ onBetSelection, lastBetTime }) => {
    const { CODE, game_type, phpFile, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    // const [exposureData, setExposureData] = useState([]);
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
                console.error("Error processing OneCard1day data:", error);
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

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleData);
            socket.off(game_type, handleData);
        };
    }, [socket, game_type]);

    // useEffect(() => {
    //     const fetchExposure = async () => {
    //         if (!gameData?.t1?.[0]?.mid) return;
    //         try {
    //             const response = await fetchCasinoExposureApi({
    //                 markettype: CODE,
    //                 main_event_id: gameData.t1[0].mid,
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

    // const renderExposure = (marketId) => {
    //     const exposure = getExposure(marketId);
    //     if (exposure === 0) return 0;
    //     return (
    //         <span className={`casino-book ${exposure >= 0 ? "book-black" : "book-red"}`}>
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

    const BetBox = ({ marketName, className = "", children, type = "back" }) => {
        const market = getMarketByName(marketName);
        const suspended = getIsSuspended(market);
        const odds = type === "back" ? market?.b1 : market?.l1;

        return (
            <div
                className={`${className} ${suspended ? "suspended" : ""}`}
                onClick={() => handleOddsClick(marketName, odds, market, type === "back", suspended)}
            >
                {children(odds)}
            </div>
        );
    };

    const BonusBetBox = ({ marketName, label, id1, id2 }) => {
        const market = getMarketByName(marketName);
        const suspended = getIsSuspended(market);
        const odds = market?.b1 || 0;

        return (
            <div className="casino-box poker1dayother mt-2">
                <div className="casino-bl-box">
                    <div className="odds-min-max">
                        <span className="float-right casino-min-max pr-2">
                            <i data-toggle="collapse" data-target={`#${id1}`} className="fas fa-info-circle"></i>
                            <div id={id1} className="collapse icon-range">
                                R:<span>{market?.min || 100}</span>-<span>{market?.max || "50K"}</span>
                            </div>
                        </span>
                    </div>
                    <div className="odds-min-max pl-2">
                        <span className="float-right casino-min-max">
                            {/* Typically there might be another icon for max, but structure shows two boxes */}
                        </span>
                    </div>
                </div>
                <div className="casino-bl-box">
                    <BetBox marketName={marketName} className="casino-bl-box-item back" type="back">
                        {(odds) => <span className="casino-box-odd">{label}</span>}
                    </BetBox>
                </div>
                <div className="casino-bl-box">
                    <div className="odds-min-max">
                        {/* {renderExposure(market?.sid)} */}
                    </div>
                </div>
            </div>
        );
    };

    // board cards array
    const boardCards = [
        currentGame?.BC1,
        currentGame?.BC2,
        currentGame?.BC3,
        currentGame?.BC4,
        currentGame?.BC5,
    ].filter(Boolean);

    const playerACards = [currentGame?.C1, currentGame?.C2].filter(Boolean);
    const playerBCards = [currentGame?.C3, currentGame?.C4].filter(Boolean);

    return (
        <div className="casino-container">
            <div className="casino-table poker1day">
                <OneCardVideo
                    roundId={currentGame?.mid}
                    videoSrc={iframe_url}
                    cards={boardCards}
                    results={gameData?.last_results || []}
                    timeLeft={currentGame?.autotime || 0}
                    totalTime={currentGame?.ft || 30}
                    isCardDrawerOpen={isCardDrawerOpen}
                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                />

                <div className="casino-detail">
                    {/* Player A Box */}
                    <div className="playerabox">
                        <div className="casino-box-row playerafabcy">
                            <div className="casino-nation-name">
                                <div className="float-left mr-2">
                                    <i data-toggle="collapse" data-target="#demo1" className="fas fa-info-circle"></i>
                                    <div id="demo1" class="collapse icon-range">
                                        R:<span>100</span>-<span>3L</span>
                                    </div>
                                </div>
                                <b>Player A</b>
                            </div>
                            <div className="casino-bl-box">
                                <BetBox marketName="Player A" className="back casino-bl-box-item" type="back">
                                    {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                </BetBox>
                                <BetBox marketName="Player A" className="lay casino-bl-box-item" type="lay">
                                    {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                </BetBox>
                            </div>
                        </div>
                        <div className="casino-nation-name text-center w-100">
                            {/* {renderExposure(getMarketByName("Player A")?.sid)} */}
                        </div>

                        {/* Bonus Section for Player A */}
                        <div className="casino-box poker1dayother mt-2">
                            <div className="casino-bl-box">
                                <div className="odds-min-max">
                                    <span className="float-right casino-min-max pr-2">
                                        <i data-toggle="collapse" data-target="#demo2" className="fas fa-info-circle"></i>
                                        <div id="demo2" className="collapse icon-range">
                                            R:<span>100</span>-<span>50K</span>
                                        </div>
                                    </span>
                                </div>
                                <div className="odds-min-max pl-2">
                                    <span className="float-right casino-min-max">
                                        <i data-toggle="collapse" data-target="#demo3" className="fas fa-info-circle"></i>
                                        <div id="demo3" className="collapse icon-range">
                                            R:<span>100</span>-<span>50K</span>
                                        </div>
                                    </span>
                                </div>
                            </div>
                            <div className="casino-bl-box">
                                <BetBox marketName="2 Cards Bonus A" className="casino-bl-box-item back" type="back">
                                    {() => <span className="casino-box-odd">
                                        2 Cards Bonus
                                    </span>}
                                </BetBox>
                                <BetBox marketName="7 Cards Bonus A" className="casino-bl-box-item back" type="back">
                                    {() => <span className="casino-box-odd">7 Cards Bonus</span>}
                                </BetBox>
                            </div>
                            <div className="casino-bl-box">
                                <div className="odds-min-max">
                                    {/* {renderExposure(getMarketByName("2 Cards Bonus A")?.sid)} */}
                                </div>
                                <div className="odds-min-max">
                                    {/* {renderExposure(getMarketByName("7 Cards Bonus A")?.sid)} */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card box between Player A and B */}
                    <div className="playerabcardbox">
                        <div className="poker-icon">
                            <img src="https://wver.sprintstaticdata.com/v208/static/front/img/poker.png" alt="poker-icon" />
                        </div>
                        <div className="row row5 w-100">
                            <div className="col-12 col-md-6">
                                <div className="dealer-name playera">Player A</div>
                                <div className="mt-1">
                                    {playerACards.map((card, index) => (
                                        <span key={index} data-v-b64efdfa="">
                                            <img
                                                data-v-b64efdfa=""
                                                src={getImage(card, result_image)}
                                                alt={`player-a-card-${index}`}
                                            />
                                        </span>
                                    ))}
                                    {Array.from({ length: Math.max(0, 2 - playerACards.length) }).map((_, index) => (
                                        <span key={`empty-a-${index}`} data-v-b64efdfa="">
                                            <img data-v-b64efdfa="" src={getImage(1, result_image)} alt="empty" />
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="col-12 col-md-6 text-right">
                                <div className="dealer-name playerb">Player B</div>
                                <div className="mt-1">
                                    {playerBCards.map((card, index) => (
                                        <span key={index} data-v-b64efdfa="">
                                            <img
                                                data-v-b64efdfa=""
                                                src={getImage(card, result_image)}
                                                alt={`player-b-card-${index}`}
                                            />
                                        </span>
                                    ))}
                                    {Array.from({ length: Math.max(0, 2 - playerBCards.length) }).map((_, index) => (
                                        <span key={`empty-b-${index}`} data-v-b64efdfa="">
                                            <img data-v-b64efdfa="" src={getImage(1, result_image)} alt="empty" />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Player B Box */}
                    <div className="playerbbox">
                        <div className="casino-box-row playerbfabcy">
                            <div className="casino-nation-name">
                                <div className="float-left mr-2">
                                    <i data-toggle="collapse" data-target="#demo4" className="fas fa-info-circle"></i>
                                    <div id="demo4" className="collapse icon-range">
                                        R:<span>100</span>-<span>3L</span>
                                    </div>
                                </div>
                                <b>Player B</b>
                            </div>
                            <div className="casino-bl-box">
                                <BetBox marketName="Player B" className="back casino-bl-box-item" type="back">
                                    {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                </BetBox>
                                <BetBox marketName="Player B" className="lay casino-bl-box-item" type="lay">
                                    {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                </BetBox>
                            </div>
                        </div>
                        <div className="casino-nation-name text-center w-100">
                            {/* {renderExposure(getMarketByName("Player B")?.sid)} */}
                        </div>

                        {/* Bonus Section for Player B */}
                        <div className="casino-box poker1dayother mt-2">
                            <div className="casino-bl-box">
                                <div className="odds-min-max">
                                    <span className="float-right casino-min-max pr-2">
                                        <i data-toggle="collapse" data-target="#demo5" className="fas fa-info-circle"></i>
                                        <div id="demo5" className="collapse icon-range">
                                            R:<span>100</span>-<span>50K</span>
                                        </div>
                                    </span>
                                </div>
                                <div className="odds-min-max pl-2">
                                    <span className="float-right casino-min-max">
                                        <i data-toggle="collapse" data-target="#demo6" className="fas fa-info-circle"></i>
                                        <div id="demo6" className="collapse icon-range">
                                            R:<span>100</span>-<span>50K</span>
                                        </div>
                                    </span>
                                </div>
                            </div>
                            <div className="casino-bl-box">
                                <BetBox marketName="2 Cards Bonus B" className="casino-bl-box-item back" type="back">
                                    {() => <span className="casino-box-odd">2 Cards Bonus</span>}
                                </BetBox>
                                <BetBox marketName="7 Cards Bonus B" className="casino-bl-box-item back" type="back">
                                    {() => <span className="casino-box-odd">7 Cards Bonus</span>}
                                </BetBox>
                            </div>
                            <div className="casino-bl-box">
                                <div className="odds-min-max">
                                    {/* {renderExposure(getMarketByName("2 Cards Bonus B")?.sid)} */}
                                </div>
                                <div className="odds-min-max">
                                    {/* {renderExposure(getMarketByName("7 Cards Bonus B")?.sid)} */}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="casino-remark mt-3">
                        <div className="remark-icon">
                            <img src="https://wver.sprintstaticdata.com/v208/static/front/img/icons/remark.png" alt="remark-icon" />
                        </div>
                        <marquee>Play Our New Game Premium Teenpatti 1 Day</marquee>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OneCard1day;