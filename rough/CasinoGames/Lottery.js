import React, { useState, useEffect, memo, useMemo, useCallback } from "react";
import { fetchCasinoExposureApi, fetchOpenBetsApi, getDefaultParams, isApiSuccess, placeBetCommonApi, refreshBalanceApi } from "../../api/api";
import { getImage, getValueAfterDot, getIsSuspended, getCardImage, formatNumber } from "../../utilies/helpers";
import { useGetFileData } from "../../hooks/useGetFileData";
import CasinoVideo from "./components/CasinoVideo";
import useIsMobile from "../../hooks/useIsMobile";
import { useSocket } from "../Socket/useSocket";
import RemarkMarquee from "./components/RemarkMarquee";
import showToast from "../../utilies/toaster";
import { useDispatch } from "react-redux";
import Loader from "../Loader/Loader";
import BetList from "./components/BetList";

const imgPath = "/cards/lottery/";

function getBallImg(card) {
    const ball = card === "A" ? "1" : card === "10" ? "0" : card;
    return `ball${ball}`
}

function Tab({ activeTab, title, min, max, tab, setActiveTab }) {
    const handleTabClick = (tab, e) => {
        e.preventDefault();
        setActiveTab(tab);
    };
    return (
        <li className="nav-item">
            <a
                href={`#${tab}`}
                className={`nav-link ${activeTab === tab ? "active" : ""}`}
                onClick={(e) => handleTabClick(tab, e)}
            >
                {title}
                <div className="casino-min-max w-100">
                    R:<span>{min}</span>-<span>{max}</span>
                </div>
            </a>
        </li>
    );
}

const LotteryBox = memo(
    ({ market, handleClick }) => {
        const isSuspended = getIsSuspended(market);
        const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

        return (
            <div className={`lottery-box ${isSuspended ? "suspended" : ""}`}>
                {cards.map((c) => (
                    <div
                        key={c}
                        className="lottery-card"
                        onClick={() => handleClick(c === "A" ? "1" : c)}
                    >
                        <img src={getCardImage(c, imgPath)} alt={c} />
                    </div>
                ))}
            </div>
        );
    },
    (prev, next) => prev.market === next.market
);

const SelectedCard = memo(({ selectedCard, clearSelectedCards, hideClear }) => {
    console.log("&&&&&&&&&&& SelectedCard......");

    return (
        <div>
            {selectedCard?.map((card) => {
                return (
                    <span key={card}><img src={getImage(getBallImg(card), imgPath)} /></span>
                )
            })}

            {selectedCard?.length > 0 && !hideClear &&
                <button className="lottery-btn active p-2" onClick={clearSelectedCards}>
                    Clear
                </button>
            }
        </div>
    )
})

const RandomBets = memo(
    ({ market, handleClick, selectedCard, clearSelectedCards, isRandomBets = true }) => {
        // ({ }) => {
        // console.log("RandomBets......");

        // const isSuspended = false;
        const isSuspended = getIsSuspended(market);
        const bets = [5, 10, 15, 20, 25, 50, 75];

        return (
            <div className="lottery-place-balls">
                <SelectedCard selectedCard={selectedCard} clearSelectedCards={clearSelectedCards} hideClear={!isRandomBets} />

                {isRandomBets &&
                    <div className={`random-bets ${isSuspended ? "suspended" : ""}`}>
                        <h4 className="w-100 text-center">Random Bets</h4>
                        {bets.map((n) => (
                            <button key={n} className="lottery-btn active" onClick={() => handleClick(n)}>
                                {n}
                            </button>
                        ))}
                    </div>}
            </div>
        );
    },
    // (prev, next) => JSON.stringify(prev.market) === JSON.stringify(next.market)
);

function BetBtns({ setBetBtn, betBtn }) {
    const betRate = [25, 50, 100, 200, 500, 1000];
    return (
        <div className="lottery-left">
            <div className="lottery-bet-buttons">
                {betRate.map((rate) => (
                    <div
                        key={rate}
                        style={{ backgroundImage: "url(/assets/images/coin.png)" }}
                        className={betBtn === rate ? "active" : ""}
                        onClick={() => setBetBtn(rate)}
                    >
                        <span>{rate}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function ActionBtns() {
    return (
        <div className="lottery-buttons d-none-big w-100 mb-3">
            <div className="lottery-buttons-top">
                <button className="lottery-btn active">Repeat</button>
                <button className="lottery-btn active">Clear</button>
                <button className="lottery-btn active">Remove</button>
            </div>
        </div>
    )
}

function CurrentCrads({ currentCards }) {
    return (
        <>
            {currentCards?.map((card, idx) => {
                return (
                    <span key={idx}><img src={getCardImage(card, imgPath + 'cards')} /></span>
                )
            })}
        </>
    )
}

function Cards_Mobile({ currentCards }) {
    return (
        <div className="casino-video-cards d-none-desktop">
            <div className="casino-video-cards-container">
                <div>
                    <CurrentCrads currentCards={currentCards} />
                </div>
            </div>
        </div>
    )
}

export function Cards_Desktop({ currentCards }) {
    return (
        <div className="lottery-cards">
            <CurrentCrads currentCards={currentCards} />
        </div>
    )
}

function getDDD_cards(card) {
    return card?.length > 2 ? `${card.slice(0, -2)}DD` : card
}

const LotteryTabs = memo(({ single, double, triple, activeTab, setActiveTab, isBetLoading, handleCardClicked, handleRandomBetClicked, clickedCards, clearSelectedCards }) => {
    return (
        <div className="lottery-right">
            <div className="casino-tabs">
                <ul className="nav nav-tabs">
                    <Tab title="Single(0)" min="10" max="20K" tab="single" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <Tab title="Double(0)" min="10" max="5K" tab="double" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <Tab title="Triple(0)" min="10" max="3K" tab="triple" activeTab={activeTab} setActiveTab={setActiveTab} />
                </ul>
            </div>

            <div className="tab-content" style={{ position: "relative" }}>
                {isBetLoading && <Loader position="absolute" />}

                <div id="single" className={`tab-pane ${activeTab === "single" ? "active" : ""}`}>
                    <div className="single">
                        <LotteryBox market={single} handleClick={handleCardClicked} />
                        <RandomBets market={single} handleClick={handleRandomBetClicked} selectedCard={clickedCards} clearSelectedCards={clearSelectedCards} isRandomBets={false} />
                    </div>
                </div>

                <div id="double" className={`tab-pane fade ${activeTab === "double" ? "active show" : ""}`}>
                    <div className="double">
                        <LotteryBox market={double} handleClick={handleCardClicked} />
                        <RandomBets market={double} handleClick={handleRandomBetClicked} selectedCard={clickedCards} clearSelectedCards={clearSelectedCards} />
                    </div>
                </div>

                <div id="triple" className={`tab-pane fade ${activeTab === "triple" ? "active show" : ""}`}>
                    <div className="tripple">
                        <LotteryBox market={triple} handleClick={handleCardClicked} />
                        <RandomBets market={triple} handleClick={handleRandomBetClicked} selectedCard={clickedCards} clearSelectedCards={clearSelectedCards} />
                    </div>
                </div>
            </div>
        </div>
    );
});

const Lottery = ({ isVisible, onBetSelection, lastBetTime }) => {
    const dispatch = useDispatch();
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image, placeBetApi } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [exposureData, setExposureData] = useState([]);
    const isMobile = useIsMobile(767);
    const [activeTab, setActiveTab] = useState("single");
    const [betBtn, setBetBtn] = useState(25);
    const [isBetLoading, setIsBetLoading] = useState(false);

    const [triggerRoundIdChange, setTriggerRoundIdChange] = useState(0);
    const [openBets, setOpenBets] = useState([]);
    const [isMyBetsModalOpen, setIsMyBetsModalOpen] = useState(false);

    const [clickedCards, setClickedCards] = useState([]);
    const [clickedRandomBet, setClickedRandomBet] = useState(null);

    const [single, setSingle] = useState(false);
    const [double, setDouble] = useState(false);
    const [triple, setTriple] = useState(false);

    // const handleCardClicked = (c) => setClickedCards(prev => [...new Set([...prev, c])]); // Prevent duplicate cards
    // const handleRandomBetClicked = (c) => setClickedRandomBet(c);

    const handleCardClicked = useCallback((c) => setClickedCards(prev => [...new Set([...prev, c])]), []);
    const handleRandomBetClicked = useCallback((c) => setClickedRandomBet(c), []);
    const handleClearSelectedCards = useCallback(() => setClickedCards([]), []);

    useEffect(() => {
        if (activeTab === "single" && clickedCards?.length == 1) {
            handlePlacebet(single, clickedCards);
        } else if (activeTab === "double" && clickedCards?.length == 2) {
            handlePlacebet(double, clickedCards);
        } else if (activeTab === "triple" && clickedCards?.length == 3) {
            handlePlacebet(triple, clickedCards);
        }
        console.log("223344 clickedCards......", clickedCards)
    }, [clickedCards])

    useEffect(() => {
        if (activeTab === "double" && clickedRandomBet) {
            handlePlacebet(double, clickedRandomBet, true);
        } else if (activeTab === "triple" && clickedRandomBet) {
            handlePlacebet(triple, clickedRandomBet, true);
        }
        console.log("223344 clickedRandomBet......", clickedRandomBet)
    }, [clickedRandomBet])

    useEffect(() => {
        setClickedCards([]);
        setClickedRandomBet(null);
    }, [activeTab])


    useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.[0]?.mid) return;
            try {
                const response = await fetchCasinoExposureApi({
                    markettype: CODE,
                    main_event_id: gameData.t1[0].mid,
                    curPageName: phpFile,
                });
                const aaa = response?.data
                const bbb = Array.isArray(aaa) ? aaa : Object.values(aaa || {});
                setExposureData(bbb);
            } catch (error) {
                console.error("Error fetching exposure:", error);
            }
        };
        fetchExposure();
    }, [gameData?.t1?.[0]?.mid, lastBetTime, CODE, phpFile]);

    const getExposure = (marketId) => {
        if (!Array.isArray(exposureData)) return 0;
        const market = exposureData.find((item) => item.market_id == marketId);
        return market ? market.win_loss || market.total_exposure : 0;
    };

    const renderExposure = (marketId, className = "") => {
        const exposure = getExposure(marketId?.toString());
        if (exposure === 0) return null;
        return (
            <span className={`mr-2 ${className} ${exposure > 0 ? 'book-green' : 'book-red'}`}>
                {exposure}
            </span>
        );
    };

    const socket = useSocket("casino");
    useEffect(() => {
        if (!socket) return;

        const handleGameData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) {
                    setGameData(payload);
                    setTriggerRoundIdChange(payload?.t1?.[0]?.mid);
                }
            } catch (error) {
                console.error("Error processing Trap data:", error);
            }
        };

        const handleConnect = () => {
            socket.emit("Room", game_type);
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on("game", handleGameData);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleGameData);
        };
    }, [socket, game_type]);

    const currentGame = gameData?.t1?.[0];
    const data = gameData?.t2 || [];
    const currentCards = [getDDD_cards(currentGame?.C1), getDDD_cards(currentGame?.C2), getDDD_cards(currentGame?.C3)];
    // console.log('&&&&&&&&&&& currentGame', currentGame);
    // in this game, world 777 have omnly 'DD' postfixed cards, from backend we get 'HH' ,'SS', etc cards also so convert them to DD cards

    const sinlge_ = data.find((item) => item.nat === "Single");
    const double_ = data.find((item) => item.nat === "Double");
    const triple_ = data.find((item) => item.nat === "Triple");

    useEffect(() => setSingle(sinlge_), [sinlge_])
    useEffect(() => setDouble(double_), [double_])
    useEffect(() => setTriple(triple_), [triple_])

    async function loadOpenBets() {
        if (!CODE) return;
        try {
            const data = await fetchOpenBetsApi({
                markettype: CODE,
                eventId: currentGame?.mid || "1", // Default to "1" if undefined, as seen in Poker
                // curPageName: config.curPageName,
            });

            if (data?.open_bet_data && Array.isArray(data.open_bet_data)) {
                setOpenBets(JSON.parse(JSON.stringify(data.open_bet_data)));
            }
            // else if (data?.data && Array.isArray(data.data)) {
            //     console.log("@@ bb")
            //     setOpenBets([...data.data]);
            // } else if (Array.isArray(data)) {
            //     console.log("@@ cc")
            //     setOpenBets([...data]);
            // }
        } catch (e) {
            console.error("Error loading open bets:", e);
        }
    }

    useEffect(() => {
        if (!!triggerRoundIdChange) {
            loadOpenBets();
            refreshBalanceApi(dispatch, { curPageName: phpFile });
        }
    }, [triggerRoundIdChange]);

    const handlePlacebet = async (market, selected_, isRandom = false) => {
        const { nat, b1: odds, sid: marketId } = market;
        const isSuspended = getIsSuspended(market);
        const eventId = getValueAfterDot(currentGame?.mid);

        const selected = (selected_).toString();
        const teamName = `${nat} ${selected}`;

        if (!market || isSuspended || odds == 0) return;

        if (!marketId) {
            console.error("marketId is missing");
            return;
        }
        if (!eventId) {
            console.error("eventId is missing");
            return;
        }
        if (!placeBetApi) {
            console.error("placeBetApi is missing");
            return;
        }

        const betAmount = parseInt(betBtn);

        const params = new URLSearchParams();

        params.append("eventId", getValueAfterDot(eventId));
        params.append("event_id", getValueAfterDot(eventId));
        params.append("eventType", CODE);
        params.append("marketId", marketId);
        params.append("stack", betAmount);
        params.append("type", "Yes"); // isBack
        params.append("odds", odds);
        params.append("runs", odds);
        params.append("bet_market_type", CODE);
        params.append("oddsmarketId", marketId);
        params.append("eventManualType", "Auto");

        params.append("market_runner_name", teamName);
        params.append("market_odd_name", CODE);
        params.append("bet_event_name", CODE);
        params.append("bet_type", "Back");
        params.append("random", isRandom ? 1 : 0); // 0 or 1

        const defaultParams = getDefaultParams();
        Object.keys(defaultParams).forEach((key) => params.append(key, defaultParams[key]));

        try {
            setIsBetLoading(true);
            const response = await placeBetCommonApi(placeBetApi, params);
            if (isApiSuccess(response)) {
                // toast.success(response?.message || "Bet placed successfully!");
                showToast({ isSuccess: true, message: response?.message || "Bet placed successfully!" });

                refreshBalanceApi(dispatch, { curPageName: phpFile });
                loadOpenBets();
                // triggerExposure();
                // onOpenBetUpdate();`
            } else {
                // toast.error(response?.message || "Failed to place bet");
                showToast({ isSuccess: false, message: response?.message || "Failed to place bet" });
            }
        } catch (error) {
            console.error("Error placing bet:", error);
            // toast.error("Error placing bet. Please try again.");
            showToast({ isSuccess: false, message: "Error placing bet. Please try again." });
        } finally {
            setIsBetLoading(false);
            setClickedCards([]);
            setClickedRandomBet(null);
        }
    };




    return (
        <>
            <div className="casino-table lottery">
                <CasinoVideo
                    gameName={game_name}
                    roundId={currentGame?.mid}
                    videoSrc={iframe_url}
                    autotime={currentGame?.autotime}
                    totalTime={currentGame?.ft}
                    WholeCardDrawer={() => <Cards_Mobile currentCards={currentCards} />}
                />

                <div className="casino-details">
                    {isMobile ? (
                        <>
                            <LotteryTabs
                                single={single}
                                double={double}
                                triple={triple}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                isBetLoading={isBetLoading}
                                handleCardClicked={handleCardClicked}
                                handleRandomBetClicked={handleRandomBetClicked}
                                clickedCards={clickedCards}
                                clearSelectedCards={handleClearSelectedCards}
                            />
                            <BetBtns setBetBtn={setBetBtn} betBtn={betBtn} />
                            <ActionBtns />
                            <RemarkMarquee remark={currentGame?.remark} />
                        </>
                    ) : (
                        <>
                            <BetBtns setBetBtn={setBetBtn} betBtn={betBtn} />
                            <LotteryTabs
                                single={single}
                                double={double}
                                triple={triple}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                isBetLoading={isBetLoading}
                                handleCardClicked={handleCardClicked}
                                handleRandomBetClicked={handleRandomBetClicked}
                                clickedCards={clickedCards}
                                clearSelectedCards={handleClearSelectedCards}
                            />
                            <RemarkMarquee remark={currentGame?.remark} />
                            <ActionBtns />
                        </>
                    )}
                </div>

                <BetList
                    isMobile={isMobile}
                    openBets={openBets}
                    isOpen={isMyBetsModalOpen}
                    onOpen={() => setIsMyBetsModalOpen(true)}
                    onClose={() => setIsMyBetsModalOpen(false)}
                    gameType={game_type}

                // placedBets={placedBets}
                // hasPlacedBet={hasPlacedBet}
                />
            </div>
        </>
    )
}

export default Lottery

// .random-bets