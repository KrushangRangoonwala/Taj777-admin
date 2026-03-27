import React, { useState, useEffect } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
// import { fetchCasinoExposureApi } from "../../../api/API";
import { getImage, getMarketByNation, getValueAfterDot, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";

const OneCard1day = ({ onBetSelection, lastBetTime }) => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
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

    // const renderExposure = (marketId, isUpDown = false) => {
    //     const exposure = getExposure(marketId);
    //     if (exposure === 0) return 0;
    //     return (
    //         <span className={`${isUpDown ? "up-down-book" : "mr-2"} ${exposure >= 0 ? "book-black" : "book-red"}`}>
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
                {suspended ? <img src="/assets/images/lock.svg" alt="lock" style={{ width: "15px", height: "15px", opacity: 1, zIndex: 10, position: "relative" }} /> : children(odds)}
            </div>
        );
    };

    const UpDownBox = ({ marketName, label, className }) => {
        const market = getMarketByName(marketName);
        const suspended = getIsSuspended(market);
        const odds = market?.b1 || 0;
        const isLeft = marketName.includes("Dealer"); // Based on OneCardOneDay.js logic

        return (
            <div
                className={`${className} ${suspended ? "suspended" : ""}`}
                onClick={() => handleOddsClick(marketName, odds, market, true, suspended)}
            >
                {/* {renderExposure(market?.sid, true)} */}
                <div className="up-down-book book-black">0</div>
                <div className={isLeft ? "text-left" : "text-right"}>
                    <div className="up-down-odds">{odds}</div>
                    <span>{label}</span>
                </div>
            </div>
        );
    };

    const Cards = () => (
        <>
            <div>
                <div className="dealer-name w-100 mb-1">Player</div>
                <div>
                    <span>
                        <span data-v-b64efdfa="">
                            <img
                                data-v-b64efdfa=""
                                src={getImage(currentGame?.C1, result_image)}
                                alt="Player Card"
                            />
                        </span>
                    </span>
                </div>
            </div>
            <div>
                <div className="dealer-name w-100 mb-1">Dealer</div>
                <div>
                    <span>
                        <span data-v-b64efdfa="">
                            <img
                                data-v-b64efdfa=""
                                src={getImage(currentGame?.C2, result_image)}
                                alt="Dealer Card"
                            />
                        </span>
                    </span>
                </div>
            </div>
        </>
    );

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table teen1oneday">
                            <CasinoVideo
                                gameName={game_name}
                                roundId={currentGame?.mid}
                                videoSrc={iframe_url}
                                results={gameData?.last_results || []}
                                timeLeft={currentGame?.autotime || 0}
                                totalTime={currentGame?.ft || 30}
                                isCardDrawerOpen={isCardDrawerOpen}
                                setIsCardDrawerOpen={setIsCardDrawerOpen}
                                CardsComponent={Cards}
                                resultPath={phpFile}
                            />

                            <div className="casino-detail">
                                <div className="teen1daycasino-container">
                                    <div className="teen1dayleft">
                                        <div className="casino-box-row">
                                            <div className="casino-nation-name">
                                                <b>Player</b>
                                                <div className="float-right">
                                                    {/* <span className="mr-2 book-black">{getExposure(getMarketByName("Player")?.sid)}</span> */}
                                                    <span className="mr-2 book-black">0</span>
                                                </div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <BetBox marketName="Player" className="back casino-bl-box-item" type="back">
                                                    {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                </BetBox>
                                                <BetBox marketName="Player" className="lay casino-bl-box-item" type="lay">
                                                    {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                </BetBox>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="teen1daycenter"></div>
                                    <div className="teen1dayright">
                                        <div className="casino-box-row">
                                            <div className="casino-nation-name">
                                                <b>Dealer</b>
                                                <div className="float-right">
                                                    {/* <span className="mr-2 book-black">{getExposure(getMarketByName("Dealer")?.sid)}</span> */}
                                                    <span className="mr-2 book-black">0</span>
                                                </div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <BetBox marketName="Dealer" className="back casino-bl-box-item" type="back">
                                                    {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                </BetBox>
                                                <BetBox marketName="Dealer" className="lay casino-bl-box-item" type="lay">
                                                    {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                </BetBox>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="teen1daycasino-container">
                                    <div className="teen1dayleft">
                                        <div className="seven-up-down-box">
                                            <UpDownBox marketName="7 Up Player" label="DOWN" className="up-box" />
                                            <UpDownBox marketName="7 Up Dealer" label="UP" className="down-box" />
                                            <div className="seven-box">
                                                <img
                                                    src="https://wver.sprintstaticdata.com/v208/static/front/img/trape-seven.png"
                                                    alt="7-icon"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="teen1daycenter"></div>
                                    <div className="teen1dayright">
                                        <div className="seven-up-down-box">
                                            <UpDownBox marketName="7 Down Player" label="DOWN" className="up-box" />
                                            <UpDownBox marketName="7 Down Dealer" label="UP" className="down-box" />
                                            <div className="seven-box">
                                                <img
                                                    src="https://wver.sprintstaticdata.com/v208/static/front/img/trape-seven.png"
                                                    alt="7-icon"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <CasinoRightSidebar />
            </div>
        </div>
    );
};

export default OneCard1day;