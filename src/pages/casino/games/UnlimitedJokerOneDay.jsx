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

const UnlimitedJoker2020 = ({ onBetSelection, exposureData, lastResults: propsLastResults }) => {
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
                const payload = Array.isArray(data) ? (data[1] || data[0]) : data;
                if (payload) {
                    setGameData(payload);
                }
            } catch (error) {
                console.error("Error processing UnlimitedJoker2020 data:", error);
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
                    res: "R",
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
        <>
            <div className="mt-2">
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

    const markets = [
        { nameA: "Player A", nameB: "Player B", idA: "range1", idB: "range10", icon: "https://wver.sprintstaticdata.com/v209/static/front/img/joker1/1.png" },
        { nameA: "Player A", nameB: "Player B", idA: "range2", idB: "range20", icon: "https://wver.sprintstaticdata.com/v209/static/front/img/joker1/2.png" },
        { nameA: "Player A", nameB: "Player B", idA: "range3", idB: "range30", icon: "https://wver.sprintstaticdata.com/v209/static/front/img/joker1/3.png" },
        { nameA: "Player A", nameB: "Player B", idA: "range4", idB: "range40", icon: "https://wver.sprintstaticdata.com/v209/static/front/img/joker1/4.png" },
        { nameA: "Player A", nameB: "Player B", idA: "range5", idB: "range50", icon: "https://wver.sprintstaticdata.com/v209/static/front/img/joker1/5.png" },
        { nameA: "Player A", nameB: "Player B", idA: "range6", idB: "range60", icon: "https://wver.sprintstaticdata.com/v209/static/front/img/joker1/6.png" },
        { nameA: "Player A", nameB: "Player B", idA: "range7", idB: "range70", icon: "https://wver.sprintstaticdata.com/v209/static/front/img/joker1/7.png" },
        { nameA: "Player A", nameB: "Player B", idA: "range8", idB: "range80", icon: "https://wver.sprintstaticdata.com/v209/static/front/img/joker1/8.png" },
        { nameA: "Player A", nameB: "Player B", idA: "range9", idB: "range90", icon: "https://wver.sprintstaticdata.com/v209/static/front/img/joker1/9.png" },
        { nameA: "Player A", nameB: "Player B", idA: "range101", idB: "range100", icon: "https://wver.sprintstaticdata.com/v209/static/front/img/joker1/10.png" },
        { nameA: "Player A", nameB: "Player B", idA: "range11", idB: "range110", icon: "https://wver.sprintstaticdata.com/v209/static/front/img/joker1/11.png" },
        { nameA: "Player A", nameB: "Player B", idA: "range12", idB: "range120", icon: "https://wver.sprintstaticdata.com/v209/static/front/img/joker1/12.png" },
        { nameA: "Player A", nameB: "Player B", idA: "range13", idB: "range130", icon: "https://wver.sprintstaticdata.com/v209/static/front/img/joker1/13.png" },
        { nameA: "Player A", nameB: "Player B", idA: "range14", idB: "range140", icon: "https://wver.sprintstaticdata.com/v209/static/front/img/joker1/14.png" },
    ];

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table teenpatti-joker joker1">
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
                                    resultPath="joker120"
                                    showRawLabel={false}
                                />
                                <div className="casino-detail">
                                    <div className="teen1daycasino-container mt-2">
                                        <div className="teen1dayleft">
                                            {markets.map((m, index) => (
                                                <React.Fragment key={index}>
                                                    <div className="casino-box-row">
                                                        <div className="casino-nation-name">
                                                            {m.icon && <img src={m.icon} alt="icon" />}
                                                            <b>{m.nameA}</b>
                                                            <div className="float-right">
                                                                <Exposure className="mr-2 book-black" data={exposureData} id={getMarketByName(m.nameA)?.sid} />
                                                                <BetLimitInfo 
                                                                    id={m.idA} 
                                                                    openRanges={openRanges} 
                                                                    toggleRange={toggleRange} 
                                                                    min={getMarketByName(m.nameA)?.min} 
                                                                    max={getMarketByName(m.nameA)?.max} 
                                                                    fallbackMax={300000}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="casino-bl-box">
                                                            <BetBox marketName={m.nameA} className="back casino-bl-box-item" type="back">
                                                                {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                            </BetBox>
                                                            <BetBox marketName={m.nameA} className="lay casino-bl-box-item" type="lay">
                                                                {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                            </BetBox>
                                                        </div>
                                                    </div>
                                                    <div className="casino-box-row">
                                                        <div className="casino-nation-name">
                                                            <b>{m.nameB}</b>
                                                            <div className="float-right">
                                                                <Exposure className="mr-2 book-black" data={exposureData} id={getMarketByName(m.nameB)?.sid} />
                                                                <BetLimitInfo 
                                                                    id={m.idB} 
                                                                    openRanges={openRanges} 
                                                                    toggleRange={toggleRange} 
                                                                    min={getMarketByName(m.nameB)?.min} 
                                                                    max={getMarketByName(m.nameB)?.max} 
                                                                    fallbackMax={300000}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="casino-bl-box">
                                                            <BetBox marketName={m.nameB} className="back casino-bl-box-item" type="back">
                                                                {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                            </BetBox>
                                                            <BetBox marketName={m.nameB} className="lay casino-bl-box-item" type="lay">
                                                                {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                            </BetBox>
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        <div className="teen1daycenter"></div>
                                    </div>
                                </div>
                                <LastResult
                                    results={lastResults}
                                    gameName={game_name}
                                    resultPath="joker120"
                                    showRawLabel={false}
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

export default UnlimitedJoker2020;
