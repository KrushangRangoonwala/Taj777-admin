import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../../components/Socket/useSocket";
import { fetchCasinoExposureApi } from "../../api/api";
import { getImage, getValueAfterDot } from "../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import { useGetFileData } from "../../hooks/useGetFileData";

const initialSelections = {
    q1: null, // Red-Black
    q2: null, // Odd-Even
    q3: null, // 7 Up-Down
    q4: null, // 3 Card Judgement
    q5: null  // Suits
};

const KBC = ({ isVisible, onBetSelection, lastBetTime }) => {
    const { CODE, game_type, phpFile, placeBetApi, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [exposureData, setExposureData] = useState([]);
    const roundIdRef = useRef(null);

    const [selections, setSelections] = useState(initialSelections);

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

    if (Boolean(roundIdRef.current) && currentGame?.mid !== roundIdRef.current) {
        roundIdRef.current = currentGame?.mid;
        setSelections(initialSelections);
    }

    const getMarketBySid = (sid) => {
        return data.find((m) => m.sid == sid);
    };

    const isSuspended = (market) => {
        return market?.gstatus === "0" || market?.gstatus === "suspended" || market?.gstatus === "SUSPENDED";
    };

    // Get markets by sid
    const redBlackMarket = getMarketBySid(1);
    const oddEvenMarket = getMarketBySid(2);
    const upDownMarket = getMarketBySid(3);
    const cardJudgementMarket = getMarketBySid(4);
    const suitsMarket = getMarketBySid(5);

    const handleSelection = (questionKey, market, odds) => {
        if (isSuspended(market)) return;

        setSelections(prev => ({
            ...prev,
            [questionKey]: odds
        }));

        const updatedSelections = { ...selections, [questionKey]: odds };
        const allSelected = Object.values(updatedSelections).every(val => val !== null && 'ssid' in val);

        if (allSelected) {
            handleOddsClick(market, odds, true, false);
        }
    };

    const handleOddsClick = (market, odds, isBack, suspended) => {
        if (suspended) return;
        const marketId = `${market.sid}_${odds.ssid}`;
        const nat_1 = {
            "1": selections.q1?.nat,
            "2": selections.q2?.nat,
            "3": selections.q3?.nat,
            "4": selections.q4?.nat,
            "5": selections.q5?.nat,
        };
        const nat_2 = {
            "1": `1_${selections.q1?.ssid}`,
            "2": `2_${selections.q2?.ssid}`,
            "3": `3_${selections.q3?.ssid}`,
            "4": `4_${selections.q4?.ssid}`,
            "5": `5_${selections.q5?.ssid}`,
        };

        if (onBetSelection) {
            onBetSelection({
                // teamName: marketName,
                odds: null,
                minBet: redBlackMarket.min,
                maxBet: redBlackMarket.max,
                isBack,
                marketId,
                eventId: getValueAfterDot(currentGame?.mid),
                other_keyVal: { nat_1: JSON.stringify(nat_1), nat_2: JSON.stringify(nat_2) },
            });
        }
    };


    const allCards = [currentGame?.C1, currentGame?.C2, currentGame?.C3, currentGame?.C4, currentGame?.C5]
    const cardArr = allCards.map((card, index) => {
        return card === '1' || !card ? getImage(card, "cards_new") : getImage(card, result_image);
    })

    function Cards() {

        return (
            <div className="casino-video-cards-container">
                {cardArr.map((card, index) => (
                    <div key={index}><span><img src={card} /></span></div>
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="casino-table kbc">
                <CasinoVideo
                    gameName={game_name}
                    roundId={currentGame?.mid}
                    videoSrc={iframe_url}
                    isCardDrawerOpen={isCardDrawerOpen}
                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                    autotime={currentGame?.autotime}
          totalTime={currentGame?.ft}CardsComponent={Cards}
                    cards={cardArr}
                />

                <div className="casino-detail">
                    <div className="row row5 kbc-btns">
                        <div className="col-12 col-md-4">
                            <div className="casino-box-row">
                                <div className="casino-nation-name"><b>[Q1] Red-Black</b></div>
                                <div data-toggle="buttons" className="btn-group btn-group-toggle">
                                    <label
                                        className={`btn 
                                            ${selections.q1?.ssid === 1 && !isSuspended(redBlackMarket) ? "active" : ""} 
                                            ${isSuspended(redBlackMarket) ? "suspended" : ""}
                                        `}
                                        onClick={() => {
                                            const odds = redBlackMarket?.odds?.[0];
                                            if (odds && !isSuspended(redBlackMarket)) {
                                                handleSelection('q1', redBlackMarket, redBlackMarket.odds[0]);
                                            }
                                        }}
                                    >
                                        <input type="radio" name="q1" id="q1_option0" autoComplete="off" value="1" />
                                        <img src="https://wver.sprintstaticdata.com/v198/static/front/img/cards/heart.png" />
                                        <img src="https://wver.sprintstaticdata.com/v198/static/front/img/cards/diamond.png" />
                                    </label>
                                    <label
                                        className={`btn ${selections.q1?.ssid === 2 && !isSuspended(redBlackMarket) ? "active" : ""} ${isSuspended(redBlackMarket) ? "suspended" : ""}`}
                                        onClick={() => {
                                            const odds = redBlackMarket?.odds?.[1];
                                            if (odds && !isSuspended(redBlackMarket)) {
                                                handleSelection('q1', redBlackMarket, redBlackMarket.odds[1]);
                                            }
                                        }}
                                    >
                                        <input type="radio" name="q1" id="q1_option1" autoComplete="off" value="2" />
                                        <img src="https://wver.sprintstaticdata.com/v198/static/front/img/cards/spade.png" />
                                        <img src="https://wver.sprintstaticdata.com/v198/static/front/img/cards/club.png" />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="casino-box-row">
                                <div className="casino-nation-name"><b>[Q2] Odd-Even</b></div>
                                <div data-toggle="buttons" className="btn-group btn-group-toggle">
                                    <label
                                        className={`btn ${selections.q2?.ssid === 1 && !isSuspended(oddEvenMarket) ? "active" : ""} ${isSuspended(oddEvenMarket) ? "suspended" : ""}`}
                                        onClick={() => {
                                            const odds = oddEvenMarket?.odds?.[0];
                                            if (odds && !isSuspended(oddEvenMarket)) {
                                                handleSelection('q2', oddEvenMarket, oddEvenMarket.odds[0]);
                                            }
                                        }}
                                    >
                                        <input type="radio" name="q2" id="q2_option0" autoComplete="off" value="1" />
                                        Odd
                                    </label>
                                    <label
                                        className={`btn ${selections.q2?.ssid === 2 && !isSuspended(oddEvenMarket) ? "active" : ""} ${isSuspended(oddEvenMarket) ? "suspended" : ""}`}
                                        onClick={() => {
                                            const odds = oddEvenMarket?.odds?.[1];
                                            if (odds && !isSuspended(oddEvenMarket)) {
                                                handleSelection('q2', oddEvenMarket, oddEvenMarket.odds[1]);
                                            }
                                        }}
                                    >
                                        <input type="radio" name="q2" id="q2_option1" autoComplete="off" value="2" />
                                        Even
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="casino-box-row">
                                <div className="casino-nation-name"><b>[Q3] 7 Up-7 Down</b></div>
                                <div data-toggle="buttons" className="btn-group btn-group-toggle">
                                    <label
                                        className={`btn ${selections.q3?.ssid === 1 && !isSuspended(upDownMarket) ? "active" : ""} ${isSuspended(upDownMarket) ? "suspended" : ""}`}
                                        onClick={() => {
                                            const odds = upDownMarket?.odds?.[0];
                                            if (odds && !isSuspended(upDownMarket)) {
                                                handleSelection('q3', upDownMarket, upDownMarket.odds[0]);
                                            }
                                        }}
                                    >
                                        <input type="radio" name="q3" id="q3_option0" autoComplete="off" value="1" />
                                        Up
                                    </label>
                                    <label
                                        className={`btn ${selections.q3?.ssid === 2 && !isSuspended(upDownMarket) ? "active" : ""} ${isSuspended(upDownMarket) ? "suspended" : ""}`}
                                        onClick={() => {
                                            const odds = upDownMarket?.odds?.[1];
                                            if (odds && !isSuspended(upDownMarket)) {
                                                handleSelection('q3', upDownMarket, upDownMarket.odds[1]);
                                            }
                                        }}
                                    >
                                        <input type="radio" name="q3" id="q3_option1" autoComplete="off" value="2" />
                                        Down
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row row5 kbc-btns kbcothers mt-2">
                        <div className="col-12 col-xl-4 col-md-6">
                            <div className="casino-box-row">
                                <div className="casino-nation-name"><b>[Q4] 3 Card Judgement</b></div>
                                <div data-toggle="buttons" className="btn-group btn-group-toggle">
                                    {cardJudgementMarket?.odds?.map((odds, index) => (
                                        <label
                                            key={index}
                                            className={`btn ${selections.q4?.ssid === index + 1 && !isSuspended(cardJudgementMarket) ? "active" : ""} ${isSuspended(cardJudgementMarket) ? "suspended" : ""}`}
                                            onClick={() => {
                                                if (!isSuspended(cardJudgementMarket)) {
                                                    handleSelection('q4', cardJudgementMarket, cardJudgementMarket.odds[index]);
                                                }
                                            }}
                                        >
                                            <input type="radio" name="q4" id={`q4_option${index}`} autoComplete="off" value={index + 1} />
                                            {odds.nat}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-xl-4 col-md-6">
                            <div className="casino-box-row">
                                <div className="casino-nation-name"><b>[Q5] Suits</b></div>
                                <div data-toggle="buttons" className="btn-group btn-group-toggle">
                                    {suitsMarket?.odds?.map((odds, index) => {
                                        const suitImages = {
                                            'Spade': 'https://wver.sprintstaticdata.com/v198/static/front/img/cards/spade.png',
                                            'Heart': 'https://wver.sprintstaticdata.com/v198/static/front/img/cards/heart.png',
                                            'Club': 'https://wver.sprintstaticdata.com/v198/static/front/img/cards/club.png',
                                            'Diamond': 'https://wver.sprintstaticdata.com/v198/static/front/img/cards/diamond.png'
                                        };
                                        return (
                                            <label
                                                key={index}
                                                className={`btn ${selections.q5?.ssid === index + 1 && !isSuspended(suitsMarket) ? "active" : ""} ${isSuspended(suitsMarket) ? "suspended" : ""}`}
                                                onClick={() => {
                                                    if (!isSuspended(suitsMarket)) {
                                                        handleSelection('q5', suitsMarket, suitsMarket.odds[index]);
                                                    }
                                                }}
                                            >
                                                <input type="radio" name="q5" id={`q5_option${index}`} autoComplete="off" value={index + 1} />
                                                <img src={suitImages[odds.nat]} />
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-xl-4 d-none-mobile"></div>
                    </div>
                </div>

                <div className="casino-remark mt-1 w-100">
                    <div className="remark-icon"><img src={getImage("remark", "images")} /></div>
                    <marquee>{currentGame?.remark || " "}</marquee>
                </div>
            </div>
        </>
    );
};

export default KBC;

// REMAINING:
// - BETPLACE
// - EXPOSURE


// "@fortawesome/fontawesome-free": "^7.1.0",
//     "@fortawesome/fontawesome-svg-core": "^7.1.0",
//         "@fortawesome/free-solid-svg-icons": "^7.1.0",
//             "@fortawesome/react-fontawesome": "^3.1.1",