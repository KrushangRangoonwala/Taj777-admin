// parent component
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    isApiSuccess,
    getDefaultParams,
    refreshBalanceApi,
    fetchOpenBetsApi,
    placeBetCommonApi,
    apiBalanace,
    fetchResultById,
} from "../../../api/api";
import { io } from "socket.io-client";
import Modal from "react-modal";
import { useDispatch } from "react-redux";
import useIsMobile from "../../../hooks/useIsMobile";
import BetPlacePopup from "./BetPlacePopup";
import BetList from "./BetList";
import LastResults from "../results/LastResult";
import { useGamePathName } from "../../../hooks/useGetFileData";
import { formatNumber, getValueAfterDot } from "../../../utilies/helpers";
import BetPopupNew from "./BetPopupNew";
import showToast from "../../../utilies/toaster";

// Helper function to parse the description string into structured data
export const parseDescription = (desc) => {
    if (!desc) {
        return {
            winner: "",
            cards: [],
            oddEven: [],
            consecutive: "",
        };
    }
    const parts = desc.split("#");
    return {
        winner: parts[0]?.trim() || "",
        cards: parts[1]?.split("  ").filter(Boolean) || [],
        oddEven: parts[2]?.split("  ").filter(Boolean) || [],
        consecutive: parts[3]?.trim() || "",
    };
};


const PlaceBet_KK = ({
    betData,
    onSubmit: triggerExposure,
    onClose,
    hideResults,
    gameType,

    getResultTxt,
    getColorClass,

    BetPlacePopup: CustomBetPlacePopup,
    onOpenBetUpdate,
    isHeaderInResult = true,
    isUpdatedResultModal = false,

    isSuperover = false,
    formatResultFn,
    ResultModal,
    TopComponent,

    config = {
        marketType: "", // For open bets
        curPageName: "", // For open bets
        socketRoom: "",
        resultApiType: "", // For fetchResultById
        // placeBetApi: null, // Function
        placeBetUrl: "",
        placeBetParams: { // Static params for placeBet
            eventType: "",
            marketOddName: "",
            betEventName: "",
            betMarketType: "",
        },
        modalTitle: "",
    },
    RulesComponent,
    isRulesFirst = false,
    setPlacebet_msg,
    isBgTransparent,
    isHeaderNon = false,
}) => {
    // console.log("$$$ betData", betData);
    const path = useGamePathName();
    // const BetPlacePopupComp = CustomBetPlacePopup || BetPlacePopup;
    const BetPlacePopupComp = CustomBetPlacePopup || BetPopupNew;
    const [amount, setAmount] = useState("");
    const [profit, setProfit] = useState(0);
    const [lastResults, setLastResults] = useState([]);
    const [isMyBetsModalOpen, setIsMyBetsModalOpen] = useState(false);
    const dispatch = useDispatch();
    const isMobile = useIsMobile();
    const [triggerRoundIdChange, setTriggerRoundIdChange] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [selectedResult, setSelectedResult] = useState(null);
    const [t2, setT2] = useState();
    const [mId, setMId] = useState();
    // const roundIdRef = useRef(null);

    // const size_1 = useIsMobile(991);
    // const size_2 = useIsMobile(1199);
    // const size_3 = !useIsMobile(1200);
    // const aa = useMedia
    const [isBetLoading, setIsBetLoading] = useState(false);
    const [openBets, setOpenBets] = useState([]);
    const [socketData, setSocketData] = useState(null);

    useEffect(() => {
        console.log('@@ useEffect openBets', openBets);
    }, [openBets]);

    useEffect(() => {
        console.log('@@ useEffect config', config);
    }, [config]);

    // useEffect(() => {
    //     console.log('@@ useEffect lastResults', lastResults);
    // }, [lastResults]);

    async function loadOpenBets() {
        if (!config.marketType) return;
        try {
            const data = await fetchOpenBetsApi({
                markettype: config.marketType,
                eventId: mId || "1", // Default to "1" if undefined, as seen in Poker
                // curPageName: config.curPageName,
            });

            if (data?.open_bet_data && Array.isArray(data.open_bet_data)) {
                setOpenBets(JSON.parse(JSON.stringify(data.open_bet_data)));
            }
            // else if (data?.data && Array.isArray(data.data)) {
            //     setOpenBets([...data.data]);
            // } else if (Array.isArray(data)) {
            //     setOpenBets([...data]);
            // }
        } catch (e) {
            console.error("Error loading open bets:", e);
        }
    }

    useEffect(() => {
        if (!!triggerRoundIdChange) {
            // console.log('triggerRoundIdChange  ........... ', triggerRoundIdChange);
            setTimeout(() => {
                loadOpenBets();
                refreshBalanceApi(dispatch, { curPageName: config.curPageName });
            }, 500);
        }
    }, [triggerRoundIdChange]);

    const socketRef = useRef({ socket: null, });

    useEffect(() => {
        if (amount && betData?.odds) {
            const calculatedProfit = amount * (parseFloat(betData.odds) - 1);
            setProfit(calculatedProfit.toFixed(2));
        } else {
            setProfit(0);
        }
    }, [amount, betData]);

    useEffect(() => {
        if (!betData) {
            setAmount("")
        }
    }, [betData]);

    useEffect(() => {
        const socket = io("https://trubet9.bet:2053", {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        socketRef.current.socket = socket;

        socket.on("connect", () => {
            socket.emit("Room", config.socketRoom);
            socket.emit("gameResult");
        });

        socket.on("gameResult", (data) => {
            setSocketData(data);
            const results = data?.res || data?.data || [];
            setLastResults(results.slice(0, 10));
        });

        socket.on("game", (data) => {
            let mid;
            if (data?.t1 && 'mid' in data?.t1) {
                mid = data?.t1?.mid;
            } else {
                mid = data?.t1?.[0]?.mid;
            }
            setTriggerRoundIdChange(mid);
            setT2(data?.t2);
            setMId(mid);
        });

        return () => {
            if (socketRef.current?.socket) {
                console.log("🔌 Disconnecting socket...");
                socketRef.current.socket.disconnect();
            }
        };
    }, [config.socketRoom]);

    const handleQuickBet = (value) => {
        const current = parseInt(amount) || 0;
        setAmount((current + value).toString());
    };

    const handleClear = () => {
        setAmount("");
        setProfit(0);
    };


    if (config.placeBetParams.eventType === 'CASINO_METER') {
        const market_runner_name = betData?.market_name_api_value ?? betData?.teamName ?? null;
        setPlacebet_msg(market_runner_name);
    }

    const handleSubmit = async () => {
        if (!betData || !config.placeBetUrl) {
            console.error("placeBetUrl function is missing in config");
            return;
        }

        const betAmount = parseInt(amount);
        const { minBet, maxBet, odds, isBack, teamName, market_name_api_value, runs } = betData;

        // if (gameType !== "teen62") {
        //     if (betAmount < minBet || betAmount > maxBet) {
        //         showToast({ isSuccess: false, message: `Bet amount must be between ${formatNumber(minBet)} and ${formatNumber(maxBet)}` });
        //         return;
        //     }
        // }

        const params = new URLSearchParams();
        const market_runner_name = market_name_api_value ?? teamName;

        params.append("eventId", getValueAfterDot(betData.eventId));
        // params.append("event_id", getValueAfterDot(betData.eventId));
        params.append("eventType", config.placeBetParams.eventType);
        params.append("marketId", betData.marketId);
        params.append("stack", betAmount);
        params.append("type", isBack ? "Yes" : "No");
        params.append("odds", odds);
        params.append("runs", runs ?? odds);
        params.append("bet_market_type", config.placeBetParams.betMarketType);
        params.append("oddsmarketId", betData.marketId);
        params.append("eventManualType", "Auto");
        params.append("market_runner_name", market_runner_name);
        params.append("market_odd_name", config.placeBetParams.marketOddName);
        params.append("bet_event_name", config.placeBetParams.betEventName);
        params.append("bet_type", isBack ? "Back" : "Lay");

        // params.append("gtype", config.gtype || ""); // NOT PASSED IN `SAFFARON`

        if (gameType !== "teen62") {
            const qq = betData?.other_keyVal;
            if (qq) {
                Object.keys(qq).forEach((key) => params.append(key, qq[key]));
            }
        }


        const defaultParams = getDefaultParams();
        Object.keys(defaultParams).forEach((key) => params.append(key, defaultParams[key]));

        try {
            setIsBetLoading(true);
            const response = await placeBetCommonApi(config.placeBetUrl, params);
            if (isApiSuccess(response)) {
                // toast.success(response?.message || "Bet placed successfully!");
                showToast({ isSuccess: true, message: response?.message || "Bet placed successfully!" });

                refreshBalanceApi(dispatch, { curPageName: config.curPageName });
                triggerExposure();
                loadOpenBets();
                handleClear();
                onOpenBetUpdate();

                if (config.placeBetParams.eventType === '2020_CRICKET_MATCH') {
                    setPlacebet_msg(market_runner_name);
                }
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
        }
    };

    const isValidAmount = () => {
        if (!betData) return false;
        const betAmount = parseInt(amount);
        return amount && betAmount >= betData.minBet && betAmount <= betData.maxBet;
    };


    const handleSpanClick = async (clickedIndex, e) => {
        e.stopPropagation();
        const resultItem = lastResults[clickedIndex];
        if (!resultItem) return;

        try {
            const mid = resultItem.mid || resultItem.event_id || resultItem.roundId;
            if (!mid) {
                showToast({ isSuccess: false, message: "Result ID missing" });
                return;
            }

            const midToPass = mid == 0 ? 0 : String(mid).includes(".") ? String(mid).split(".")[1] : mid;

            const response = await fetchResultById(midToPass, config.resultApiType);
            const data = response.data;

            if (data) {
                const formatted = formatResultFn ? formatResultFn(data) : data;
                setModalContent(formatted);
                setSelectedResult(resultItem);
                setIsModalOpen(true);
            } else {
                showToast({ isSuccess: false, message: response.message || "Details not available" });
            }

        } catch (error) {
            console.error("Result click error:", error);
            showToast({ isSuccess: false, message: "Failed to fetch result details" });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
    };

    return (
        <>
            {TopComponent && <TopComponent socketData={socketData} lastResults={lastResults} />}

            {isRulesFirst && RulesComponent && <RulesComponent />}

            <LastResults
                hideResults={hideResults}
                lastResults={lastResults}
                getResultTxt={getResultTxt}
                getColorClass={getColorClass}
                isBgTransparent={isBgTransparent}
                config={config}
                onResultClick={ResultModal ? handleSpanClick : false}
            />

            {betData && (
                <BetPlacePopupComp
                    key={openBets.length}
                    isMobile={isMobile}
                    betData={betData}
                    amount={amount}
                    setAmount={setAmount}
                    onClose={onClose}
                    handleQuickBet={handleQuickBet}
                    handleClear={handleClear}
                    handleSubmit={handleSubmit}
                    isValidAmount={isValidAmount}
                    isLoading={isBetLoading}
                />
            )}

            <BetList
                isMobile={isMobile}
                openBets={openBets}
                isOpen={isMyBetsModalOpen}
                onOpen={() => setIsMyBetsModalOpen(true)}
                onClose={() => setIsMyBetsModalOpen(false)}
                gameType={gameType}

            // placedBets={placedBets}
            // hasPlacedBet={hasPlacedBet}
            />

            {!isRulesFirst && RulesComponent && <RulesComponent superover_title={`${t2?.[0]?.nat} vs ${t2?.[1]?.nat}`} />}

            {/* RESULT MODAL */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel={config.modalTitle}
                style={{
                    content: {
                        top: isMobile ? "50px" : "35px",
                        // bottom: "24%",
                        left: "50%",
                        transform: "translateX(-50%)", // ✅ only horizontal centering
                        width: isMobile ? "100%" : "95%",
                        margin: "0 auto",
                        maxWidth: "1140px",
                        // maxHeight: "230px",
                        height: "min-content",
                        padding: 0,
                        background: "transparent",
                        border: "none",
                        borderRadius: "4px",
                        overflow: "hidden",
                    },
                    overlay: {
                        backgroundColor: "rgba(0,0,0,0.55)",
                        zIndex: 9999,
                    },
                }}
            >
                {!isSuperover
                    ? <>
                        {isHeaderInResult && <div
                            style={{
                                background: "#1a6a48",
                                padding: "4px 12px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                minHeight: "32px",
                            }}
                        >
                            <span
                                style={{
                                    color: "rgba(251, 191, 36, 1)",
                                    fontSize: 17,
                                    lineHeight: "1",
                                }}
                            >
                                {config.modalTitle}
                            </span>

                            <span
                                onClick={closeModal}
                                style={{
                                    color: "#fff",
                                    fontSize: 20,
                                    lineHeight: "1",
                                    cursor: "pointer",
                                }}
                            >
                                ×
                            </span>
                        </div>}

                        {!config.hideHeaderInfo && (
                            <div
                                style={{
                                    background: "#1f2937",
                                    padding: "8px 14px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: 13,
                                    color: "#9ca3af",
                                }}
                            >
                                <span>Round ID: {modalContent?.roundId || "Loading..."}</span>
                                <span>Match Time: {modalContent?.matchTime || "Loading..."}</span>
                            </div>
                        )}

                        <div style={{ padding: config.isNotPadding ? "0px" : "10px 12px 0px", overflowX: "auto" }}>
                            {ResultModal && <ResultModal modalContent={modalContent} onClose={closeModal} />}
                        </div>
                    </>
                    : modalContent && ResultModal && <ResultModal modalContent={modalContent} onClose={closeModal} />}
            </Modal>
        </>
    );
};

export default PlaceBet_KK;
