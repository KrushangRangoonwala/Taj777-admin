import React, { useState, useEffect } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
// import { fetchCasinoExposureApi } from "../../../api/API";
import { getImage, getMarketByNation, getValueAfterDot, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import LastResult from "./components/LastResult";
import BetLimitInfo from "./components/BetLimitInfo";
import { Exposure } from "../CasinoCenter";

const InstantTeenPatti2 = ({ onBetSelection, exposureData, lastResults: propsLastResults }) => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [lastResults, setLastResults] = useState([]);
    // const [exposureData, setExposureData] = useState([]);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [openRanges, setOpenRanges] = useState({});

    useEffect(() => {
        if (propsLastResults && propsLastResults.length > 0) {
            setLastResults(propsLastResults);
        }
    }, [propsLastResults]);

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
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) {
                    setGameData(payload);
                }
            } catch (error) {
                console.error("Error processing InstantTeenPatti3 data:", error);
            }
        };

        const handleResults = (data) => {
            let results = [];
            if (data && data.res && Array.isArray(data.res)) {
                results = data.res;
            } else if (data && data.data && Array.isArray(data.data)) {
                results = data.data;
            }
            if (results.length > 0) {
                const mappedResults = results.map(r => ({
                    res: r.win === "1" ? "A" : r.win === "2" ? "B" : r.win,
                    mid: r.mid
                }));
                setLastResults(mappedResults);
            }
        };

        const handleConnect = () => {
            console.log(`✅ ${game_type} Connected:`, socket.id);
            socket.emit("Room", game_type);
            socket.emit("gameResult"); // Many games in this project use this
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

    // const getExposure = (marketId) => {
    //     if (!Array.isArray(exposureData)) return 0;
    //     const market = exposureData.find((item) => item.market_id == marketId);
    //     return market ? market.win_loss || market.total_exposure : 0;
    // };

    // const renderExposure = (marketId) => {
    //     const exposure = getExposure(marketId);
    //     if (exposure === 0) return 0;
    //     return (
    //         <span className={`mr-2 ${exposure >= 0 ? "book-black" : "book-red"}`}>
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
                {children(suspended ? 0 : odds)}
            </div>
        );
    };

    const Cards = () => (
        <>
            <div>
                <span data-v-b64efdfa="">
                    <img data-v-b64efdfa="" src={getImage(currentGame?.C1, result_image)} />
                </span>
                <span data-v-b64efdfa="">
                    <img data-v-b64efdfa="" src={getImage(currentGame?.C3, result_image)} />
                </span>
                <span data-v-b64efdfa="">
                    <img data-v-b64efdfa="" src={getImage(currentGame?.C5, result_image)} />
                </span>
            </div>
            <div>
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
        </>
    );

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table teenpatti1day">
                                <CasinoVideo
                                    gameName={game_name}
                                    roundId={currentGame?.mid}
                                    videoSrc={iframe_url}
                                    results={lastResults}
                                    timeLeft={currentGame?.autotime || 0}
                                    totalTime={currentGame?.ft || 30}
                                    // isCardDrawerOpen={isCardDrawerOpen}
                                    // setIsCardDrawerOpen={setIsCardDrawerOpen}
                                    CardsComponent={Cards}
                                    resultPath={phpFile}
                                    showRawLabel={true}
                                />

                                <div className="casino-detail">
                                    {/* Desktop View */}
                                    <div className="teen1daycasino-container d-none-small">
                                        <div className="teen1dayleft">
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name no-border casino-bl-box-title">
                                                    <div className="playera">Player A</div>
                                                </div>
                                                <div className="casino-bl-box casino-bl-box-title">
                                                    <div className="casino-bl-box-item"><b>Back</b></div>
                                                    <div className="casino-bl-box-item"><b>Lay</b></div>
                                                </div>
                                            </div>
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name"><b>Main</b>
                                                    <div className="float-right">
                                                        <Exposure className="mr-2 casino-book" data={exposureData} id={getMarketByName("Player A")?.sid} />
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
                                        </div>
                                        <div className="teen1daycenter"></div>
                                        <div className="teen1dayright">
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name no-border casino-bl-box-title">
                                                    <div className="playerb">Player B</div>
                                                </div>
                                                <div className="casino-bl-box casino-bl-box-title">
                                                    <div className="casino-bl-box-item"><b>Back</b></div>
                                                    <div className="casino-bl-box-item"><b>Lay</b></div>
                                                </div>
                                            </div>
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name"><b>Main</b>
                                                    <div className="float-right">
                                                        <Exposure className="mr-2 casino-book" data={exposureData} id={getMarketByName("Player B")?.sid} />
                                                        <BetLimitInfo
                                                            id="range7"
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
                                    </div>

                                    {/* Mobile View */}
                                    <div className="teen1daycasino-container d-none-big">
                                        <div className="casino-box-row">
                                            <div className="casino-bl-box casino-bl-box-title">
                                                <div className="casino-bl-box-item"><b>Main</b>
                                                    <div className="float-right">
                                                        <BetLimitInfo
                                                            id="range1_mb"
                                                            openRanges={openRanges}
                                                            toggleRange={toggleRange}
                                                            min={getMarketByName("Player A")?.min}
                                                            max={getMarketByName("Player A")?.max}
                                                            iconClass="float-right"
                                                            fallbackMax={300000}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box-item"><b>Back</b></div>
                                                <div className="casino-bl-box-item"><b>Lay</b></div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <div className="casino-bl-box-item casino-odds-name">
                                                    <span>Player A</span>
                                                    <Exposure className="float-right" data={exposureData} id={getMarketByName("Player A")?.sid} />
                                                </div>
                                                <BetBox marketName="Player A" className="back casino-bl-box-item" type="back">
                                                    {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                </BetBox>
                                                <BetBox marketName="Player A" className="lay casino-bl-box-item" type="lay">
                                                    {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                </BetBox>
                                            </div>
                                            <div className="casino-bl-box">
                                                <div className="casino-bl-box-item casino-odds-name">
                                                    <span>Player B</span>
                                                    <Exposure className="float-right" data={exposureData} id={getMarketByName("Player B")?.sid} />
                                                </div>
                                                <BetBox marketName="Player B" className="back casino-bl-box-item" type="back">
                                                    {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                </BetBox>
                                                <BetBox marketName="Player B" className="lay casino-bl-box-item" type="lay">
                                                    {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                </BetBox>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="casino-remark mt-3">
                                        <div className="remark-icon">
                                            <img src="https://wver.sprintstaticdata.com/v209/static/front/img/icons/remark.png" />
                                        </div>
                                    </div>
                                </div>
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

export default InstantTeenPatti2;
