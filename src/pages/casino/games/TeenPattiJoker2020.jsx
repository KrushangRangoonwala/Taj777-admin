import React, { useState, useEffect } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
// import { fetchCasinoExposureApi } from "../../../api/API";
import { getImage, getMarketByNation, getValueAfterDot, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import LastResult from "./components/LastResult";
import BetLimitInfo from "./components/BetLimitInfo";

const TeenPattiJoker2020 = ({ onBetSelection, lastBetTime }) => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [lastResults, setLastResults] = useState([]);
    // const [exposureData, setExposureData] = useState([]);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [openRanges, setOpenRanges] = useState({});

    const toggleRange = (id) => {
        setOpenRanges((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const socket = useSocket("casino");
    useEffect(() => {
        if (!socket) return;

        const handleData = (data) => {
            try {
                const payload = Array.isArray(data) ? (data[1] || data[0]) : data;
                if (payload) {
                    setGameData(payload);
                }
            } catch (error) {
                console.error("Error processing TeenPattiJoker2020 data:", error);
            }
        };

        const handleResults = (data) => {
            const payload = Array.isArray(data) ? (data[1] || data[0]) : data;
            let results = [];
            if (payload && payload.res && Array.isArray(payload.res)) {
                results = payload.res;
            } else if (payload && payload.data && Array.isArray(payload.data)) {
                results = payload.data;
            }
            if (results.length > 0) {
                const mappedResults = results.map(r => ({
                    res: r.win === "1" ? "A" : r.win === "2" ? "B" : r.win === "3" ? "T" : r.win,
                    mid: r.mid
                }));
                setLastResults(mappedResults);
            }
        };

        const handleConnect = () => {
            console.log(`✅ ${game_type} Connected:`, socket.id);
            socket.emit("Room", game_type);
            socket.emit("gameResult");
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on("game", handleData);
        socket.on(game_type, handleData);
        socket.on("gameResult", handleResults);
        socket.on(`${game_type}_result`, handleResults);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleData);
            socket.off(game_type, handleData);
            socket.off("gameResult", handleResults);
            socket.off(`${game_type}_result`, handleResults);
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
                {suspended ? (
                    <img src="/assets/images/lock.svg" alt="lock" style={{ width: "15px", height: "15px", opacity: 1, zIndex: 10, position: "relative" }} />
                ) : (
                    children(odds)
                )}
            </div>
        );
    };

    const Cards = () => (
        <div className="casino-video-cards-container">
            <div className="joker-card">
                <h4 className="text-playerb">Joker</h4>
                <span data-v-b64efdfa="">
                    <img data-v-b64efdfa="" src={getImage(currentGame?.C1, result_image)} />
                </span>
            </div>
            <div className="mt-2">
                <span data-v-b64efdfa="">
                    <img data-v-b64efdfa="" src={getImage(currentGame?.C2, result_image)} />
                </span>
                <span data-v-b64efdfa="">
                    <img data-v-b64efdfa="" src={getImage(currentGame?.C4, result_image)} />
                </span>
                <span data-v-b64efdfa="">
                    <img data-v-b64efdfa="" src={getImage(currentGame?.C6, result_image)} />
                </span>
            </div>
            <div>
                <span data-v-b64efdfa="">
                    <img data-v-b64efdfa="" src={getImage(currentGame?.C3, result_image)} />
                </span>
                <span data-v-b64efdfa="">
                    <img data-v-b64efdfa="" src={getImage(currentGame?.C5, result_image)} />
                </span>
                <span data-v-b64efdfa="">
                    <img data-v-b64efdfa="" src={getImage(currentGame?.C7, result_image)} />
                </span>
            </div>
        </div>
    );

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table teenpatti-joker">
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
                                    resultPath="joker20"
                                    showRawLabel={true}
                                />
                                <div className="casino-detail">
                                    <div className="teen1daycasino-container mt-2">
                                        <div className="teen1dayleft">
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name">
                                                    <b>Player A</b>
                                                    <div className="float-right">
                                                        <span className="mr-2 book-black">0</span>
                                                        <BetLimitInfo 
                                                            id="range1" 
                                                            openRanges={openRanges} 
                                                            toggleRange={toggleRange} 
                                                            min={getMarketByName("Player A")?.min} 
                                                            max={getMarketByName("Player A")?.max} 
                                                            fallbackMax={300000}
                                                        />
                                                    </div>
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
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name">
                                                    <b>Player B</b>
                                                    <div className="float-right">
                                                        <span className="mr-2 book-black">0</span>
                                                        <BetLimitInfo 
                                                            id="range2" 
                                                            openRanges={openRanges} 
                                                            toggleRange={toggleRange} 
                                                            min={getMarketByName("Player B")?.min} 
                                                            max={getMarketByName("Player B")?.max} 
                                                            fallbackMax={300000}
                                                        />
                                                    </div>
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
                                        </div>
                                        <div className="teen1daycenter"></div>
                                        <div className="teen1dayright joker-other">
                                            <div>
                                                <div className="casino-box-row casino-odds">
                                                    <div className="text-left w-100"><b className="text-playerb">Joker</b></div>
                                                </div>
                                                <div className="casino-box-row">
                                                    <div className="casino-bl-box"><b>0</b></div>
                                                    <div className="casino-bl-box"><b>0</b></div>
                                                    <div className="casino-bl-box"><b>0</b></div>
                                                    <div className="casino-bl-box"><b>0</b></div>
                                                </div>
                                                <div className="casino-box-row">
                                                    <div className="casino-bl-box">
                                                        <BetBox marketName="Joker Even" className="back casino-bl-box-item" type="back">
                                                            {(odds) => (
                                                                <>
                                                                    <span className="casino-box-odd">Even</span>
                                                                    <span className="book-black">0</span>
                                                                </>
                                                            )}
                                                        </BetBox>
                                                        <div className="text-right casino-rb-box-player-range w-100 mt-1">
                                                            <BetLimitInfo 
                                                                id="range3" 
                                                                openRanges={openRanges} 
                                                                toggleRange={toggleRange} 
                                                                min={getMarketByName("Joker Even")?.min} 
                                                                max={getMarketByName("Joker Even")?.max} 
                                                                iconClass="float-right"
                                                                fallbackMax={300000}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="casino-bl-box">
                                                        <BetBox marketName="Joker Odd" className="back casino-bl-box-item" type="back">
                                                            {(odds) => (
                                                                <>
                                                                    <span className="casino-box-odd">Odd</span>
                                                                    <span className="book-black">0</span>
                                                                </>
                                                            )}
                                                        </BetBox>
                                                        <div className="text-right casino-rb-box-player-range w-100 mt-1">
                                                            <BetLimitInfo 
                                                                id="range4" 
                                                                openRanges={openRanges} 
                                                                toggleRange={toggleRange} 
                                                                min={getMarketByName("Joker Odd")?.min} 
                                                                max={getMarketByName("Joker Odd")?.max} 
                                                                iconClass="float-right"
                                                                fallbackMax={300000}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="casino-bl-box">
                                                        <BetBox marketName="Joker Red" className="back casino-bl-box-item casino-card-img" type="back">
                                                            {(odds) => (
                                                                <>
                                                                    <span>
                                                                        <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/heart.png" />
                                                                        <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/diamond.png" />
                                                                    </span>
                                                                    <span className="book-black">0</span>
                                                                </>
                                                            )}
                                                        </BetBox>
                                                        <div className="text-right casino-rb-box-player-range w-100 mt-1">
                                                            <BetLimitInfo 
                                                                id="range5" 
                                                                openRanges={openRanges} 
                                                                toggleRange={toggleRange} 
                                                                min={getMarketByName("Joker Red")?.min} 
                                                                max={getMarketByName("Joker Red")?.max} 
                                                                iconClass="float-right"
                                                                fallbackMax={300000}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="casino-bl-box">
                                                        <BetBox marketName="Joker Black" className="back casino-bl-box-item casino-card-img" type="back">
                                                            {(odds) => (
                                                                <>
                                                                    <span>
                                                                        <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/spade.png" />
                                                                        <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/club.png" />
                                                                    </span>
                                                                    <span className="book-black">0</span>
                                                                </>
                                                            )}
                                                        </BetBox>
                                                        <div className="text-right casino-rb-box-player-range w-100 mt-1">
                                                            <BetLimitInfo 
                                                                id="range6" 
                                                                openRanges={openRanges} 
                                                                toggleRange={toggleRange} 
                                                                min={getMarketByName("Joker Black")?.min} 
                                                                max={getMarketByName("Joker Black")?.max} 
                                                                iconClass="float-right"
                                                                fallbackMax={300000}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-1">
                                                <div className="casino-box-row">
                                                    <div className="casino-bl-box">
                                                        <div className="casino-bl-box-item casino-card-img">
                                                            <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/spade.png" />
                                                        </div>
                                                    </div>
                                                    <div className="casino-bl-box">
                                                        <div className="casino-bl-box-item casino-card-img">
                                                            <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/heart.png" />
                                                        </div>
                                                    </div>
                                                    <div className="casino-bl-box">
                                                        <div className="casino-bl-box-item casino-card-img">
                                                            <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/diamond.png" />
                                                        </div>
                                                    </div>
                                                    <div className="casino-bl-box">
                                                        <div className="casino-bl-box-item casino-card-img">
                                                            <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/club.png" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="casino-box-row">
                                                    {[
                                                        { name: "Joker Spade", range: "range7" },
                                                        { name: "Joker Heart", range: "range8" },
                                                        { name: "Joker Diamond", range: "range9" },
                                                        { name: "Joker Club", range: "range10" }
                                                    ].map((suit, i) => (
                                                        <div className="casino-bl-box" key={i}>
                                                            <BetBox marketName={suit.name} className="back casino-bl-box-item" type="back">
                                                                {(odds) => (
                                                                    <>
                                                                        <span className="casino-box-odd">{odds || 0}</span>
                                                                        <span className="book-black">0</span>
                                                                    </>
                                                                )}
                                                            </BetBox>
                                                            <div className="text-right casino-rb-box-player-range w-100 mt-1">
                                                                <BetLimitInfo 
                                                                    id={suit.range} 
                                                                    openRanges={openRanges} 
                                                                    toggleRange={toggleRange} 
                                                                    min={getMarketByName(suit.name)?.min} 
                                                                    max={getMarketByName(suit.name)?.max} 
                                                                    iconClass="float-right"
                                                                    fallbackMax={300000}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <LastResult
                                    results={lastResults}
                                    gameName={game_name}
                                    resultPath="joker20"
                                    showRawLabel={true}
                                    className="d-none-big mt-2"
                                />
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

export default TeenPattiJoker2020;
