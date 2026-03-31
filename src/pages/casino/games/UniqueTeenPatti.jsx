import React, { useState, useEffect } from "react";
import useSocket from "../../../api/Socket/useSocket";
// import { fetchCasinoExposureApi } from "../../../api/API";
import { getImage, getMarketByNation, getValueAfterDot, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import LastResult from "./components/LastResult";

const UNIQUE_TEENPATTI_DATA = {
    game_code: "teenunique",
    game_name: "Unique Teenpatti",
    game_category: "Teenpatti",
    game_socket: "teenunique",
    game_image: "http://159.65.143.49/~sevennew/storage/front/img/casinoicons/teenunique.jpg",
    priority: "11",
    iframe_url: "https://casino.diamondcricketid.com/swiftdizire/?id=3064",
    result_image: "/cards_new/"
};

const UniqueTeenPatti = ({ onBetSelection, lastBetTime }) => {
    const {
        game_code: CODE,
        game_socket: game_type,
        game_name,
        iframe_url,
        result_image
    } = UNIQUE_TEENPATTI_DATA;
    const [gameData, setGameData] = useState(null);
    const [lastResults, setLastResults] = useState([]);
    // const [exposureData, setExposureData] = useState([]);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);

    // Selection State
    const [selectedCards, setSelectedCards] = useState([]);

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
                console.error("Error processing UniqueTeenPatti data:", error);
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
        socket.on(game_type || "teenunique", handleData);
        socket.on("teenunique", handleData);
        socket.on("game", handleData);
        socket.on("gameResult", handleResults);
        socket.on(`${game_type || "teenunique"}_result`, handleResults);
        socket.on("teenunique_result", handleResults);

        return () => {
            socket.off("connect", handleConnect);
            socket.off(game_type || "teenunique", handleData);
            socket.off("teenunique", handleData);
            socket.off("game", handleData);
            socket.off("gameResult", handleResults);
            socket.off(`${game_type || "teenunique"}_result`, handleResults);
            socket.off("teenunique_result", handleResults);
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

    const handleCardClick = (cardIndex) => {
        if (selectedCards.includes(cardIndex)) {
            // Deselect
            setSelectedCards(selectedCards.filter((c) => c !== cardIndex));
        } else {
            // Select if less than 3
            if (selectedCards.length < 3) {
                setSelectedCards([...selectedCards, cardIndex]);
            }
        }
    };

    const handleReset = () => {
        setSelectedCards([]);
    };

    const handlePlaceBet = () => {
        if (selectedCards.length !== 3) return;

        const defaultOdds = "1.98";
        const marketId = gameData?.t2?.[0]?.sid || "unique_market";
        const selectionName = `Cards: ${selectedCards.sort().join(",")}`;

        if (onBetSelection) {
            onBetSelection({
                teamName: selectionName,
                odds: defaultOdds,
                minBet: currentGame?.min || 100,
                maxBet: currentGame?.max || 25000,
                isBack: true,
                marketId: marketId,
                eventId: getValueAfterDot(currentGame?.mid),
                marketType: "UNIQUE",
                selectedCards: selectedCards,
            });
        }
    };

    const getSlotCard = (slotNum) => {
        const cardKey = `C${slotNum}`;
        const val = currentGame?.[cardKey];
        return val && val !== "1" ? val : null;
    };

    const isGameSuspended = gameData?.t2?.[0]?.gstatus === "SUSPENDED";
    const isCardOpen = (slotNum) => !!getSlotCard(slotNum);

    const Cards = () => (
        <div className="casino-video-cards-container">
            {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} onClick={() => !isGameSuspended && !isCardOpen(num) && handleCardClick(num)}>
                    <span data-v-b64efdfa="">
                        <img
                            data-v-b64efdfa=""
                            src={isCardOpen(num) ? getImage(getSlotCard(num), result_image) : "https://wver.sprintstaticdata.com/v196/static/front/img/cards/1.png"}
                            style={{
                                opacity: selectedCards.includes(num) && !isCardOpen(num) ? 0.5 : 1,
                                border: selectedCards.includes(num) && !isCardOpen(num) ? "2px solid #fdcf13" : "none",

                            }}
                        />
                    </span>
                    {selectedCards.includes(num) && !isCardOpen(num) && !isGameSuspended && (
                        <div className="selection-checkmark">
                            <i className="fas fa-check"></i>
                        </div>
                    )}

                </div>
            ))}
        </div>
    );

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table unique-teenpatti">
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
                                    resultPath="teenunique"
                                    showRawLabel={false}
                                />
                                <div className="casino-detail">
                                    <LastResult
                                        results={lastResults}
                                        gameName={game_name}
                                        resultPath="teenunique"
                                        showRawLabel={false}
                                    />

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

export default UniqueTeenPatti;
