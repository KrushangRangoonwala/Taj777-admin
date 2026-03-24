import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    isApiSuccess,
    getDefaultParams,
    fetchTeenpattiResults,
    refreshBalanceApi,
    fetchOpenBetsApi,
    placeBet20DragonTigerApi,
} from "../../api/api";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import Modal from "react-modal";
import { useDispatch } from "react-redux";


const ROOM = "dt20";
const MARKET_TYPE = "2020_DRAGON_TIGER";
const PAGE_NAME = "live_20_dragon_tiger.php";

// Helper function to parse the description string into structured data
const parseDescription = (desc) => {
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

const PlaceBet_DragonTiger = ({
    betData,
    onSubmit,
    onClose,
    hideResults,
    gameType,
    onOpenBetUpdate,
}) => {
    const [amount, setAmount] = useState("");
    const [profit, setProfit] = useState(0);
    const [lastResults, setLastResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [placedBets, setPlacedBets] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);
    const [hasPlacedBet, setHasPlacedBet] = useState(false);
    const [openBets, setOpenBets] = useState([]);
    const dispatch = useDispatch();


    useEffect(() => {
        console.log('lastResults', lastResults);
    }, [lastResults]);


    const loadOpenBets = useCallback(async () => {
        try {
            const res = await fetchOpenBetsApi({
                markettype: MARKET_TYPE,
                eventId: betData?.eventId,
                curPageName: PAGE_NAME,
            });

            if (res?.open_bet_data && Array.isArray(res.open_bet_data)) {
                setOpenBets(res.open_bet_data);
            } else if (res?.data && Array.isArray(res.data)) {
                setOpenBets(res.data);
            } else if (Array.isArray(res)) {
                setOpenBets(res);
            }
        } catch (e) {
            console.error("Error loading open bets:", e);
        }
    }, [gameType, betData?.eventId]);

    useEffect(() => {
        if (betData?.eventId) {
            loadOpenBets();
        }
    }, [loadOpenBets, betData?.eventId]);

    const socketRef = useRef({
        socket: null,
        eventData: null,
    });

    const formatResultData = useCallback((result) => {
        if (!result) return null;

        if (result.formatted) {
            return result;
        }

        const desc = parseDescription(result.desc_remakrs || "");

        let allCards = [];
        try {
            allCards = Array.isArray(result.cards)
                ? result.cards
                : typeof result.cards === "string"
                    ? JSON.parse(result.cards)
                    : [];
        } catch (e) {
            console.warn("Failed to parse cards JSON:", result.cards);
            allCards = [];
        }

        let playerACards = allCards.slice(0, 2);
        let playerBCards = allCards.slice(2, 4);
        let boardCards = allCards.slice(4);

        const isPlayerAWinner = desc.winner?.includes("Player A") ?? false;
        const isPlayerBWinner = desc.winner?.includes("Player B") ?? false;

        return {
            roundId: result.event_id || result.mid || "N/A",
            matchTime: result.time ? new Date(result.time).toLocaleString() : "N/A",
            playerA: {
                name: "Player A",
                cards: playerACards,
                isWinner: isPlayerAWinner,
                consecutive: desc.consecutive?.includes("A : Yes") || false,
            },
            playerB: {
                name: "Player B",
                cards: playerBCards,
                isWinner: isPlayerBWinner,
                consecutive: desc.consecutive?.includes("B : Yes") || false,
            },
            board: boardCards,
            oddEven: desc.oddEven.join(" "),
            consecutive: desc.consecutive,
            formatted: true,
        };
    }, []);


    useEffect(() => {
        if (amount && betData?.odds) {
            const calculatedProfit =
                parseFloat(amount) * (parseFloat(betData.odds) - 1);
            setProfit(calculatedProfit.toFixed(2));
        } else {
            setProfit(0);
        }
    }, [amount, betData]);

    useEffect(() => {
        const loadResults = async () => {
            try {
                setIsLoading(true);

                const eventId =
                    socketRef.current?.eventData?.mid ||
                    betData?.eventId ||
                    betData?.roundId;

                if (!eventId) return;

                const response = await fetchTeenpattiResults(eventId, "poker");
                const apiData = response?.data;
                if (!apiData?.cards || apiData.cards === "") return;

                const formattedResult = formatResultData({
                    ...apiData,
                    cards: apiData.cards,
                    desc_remakrs: apiData.desc_remakrs
                });

                setLastResults(prev => {
                    if (prev.length === 0) {
                        return [formattedResult];
                    }
                    return prev;
                });

                setIsModalOpen(true);
            } catch (err) {
                console.error("Failed to load results", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadResults();
    }, [betData?.eventId]);

    useEffect(() => {
        const socket = io("https://trubet9.bet:2053", {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        socketRef.current.socket = socket;

        socket.on("connect", () => {
            console.log("✅ PlaceBet_PokerOneDay connected:", socket.id);
            socket.emit("Room", ROOM);
            socket.emit("gameResult");
        });

        socket.on("gameResult", (data) => {
            if (gameType === MARKET_TYPE) {
                // Logic for handling results if needed specifically or just general updates
            }

            // Update eventData for submitting bets if needed
            if (data?.res?.length > 0) {
                const latestResult = data.res[0];
                socketRef.current.eventData = {
                    ...socketRef.current.eventData,
                    mid: latestResult.mid.toString(),
                    event_id: latestResult.mid.toString(),
                    gtype: latestResult.gtype || "poker",
                };
            }

            let results = [];
            if (data && data.res && Array.isArray(data.res)) {
                results = data.res;
            } else if (data && data.data && Array.isArray(data.data)) {
                results = data.data;
            }

            if (results.length > 0) {
                const formattedResults = results.map(result => {
                    try {
                        const formatted = formatResultData(result);
                        return { ...result, ...formatted };
                    } catch (e) {
                        console.error("Error formatting result:", e);
                        return result;
                    }
                });

                setLastResults((prev) => {
                    if (formattedResults.length >= 5) {
                        return formattedResults.slice(0, 10);
                    }
                    return [...prev, ...formattedResults].slice(-10);
                });
            }
        });

        return () => {
            if (socketRef.current?.socket) {
                socketRef.current.socket.disconnect();
            }
        };
    }, [gameType, formatResultData]);

    const handleSpanClick = async (clickedIndex, e) => {
        e.stopPropagation();
        const resultItem = lastResults[clickedIndex];
        if (!resultItem) return;

        try {
            setIsLoading(true);
            const mid = resultItem.mid || resultItem.event_id || resultItem.roundId;
            if (!mid) {
                toast.error("Result ID missing");
                return;
            }
            const response = await fetchTeenpattiResults(mid, "poker");

            if (response && response.length > 0 && response[0]) {
                const apiData = response[0];
                const formatted = formatResultData(apiData);
                setModalContent(formatted);
                setSelectedResult(resultItem);
                setIsModalOpen(true);
            } else {
                // If no detail, just try showing what we have
                setModalContent(resultItem);
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error("Result click error:", error);
            toast.error("Failed to fetch result details");
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
    };

    const handleQuickBet = (value) => {
        const current = parseInt(amount) || 0;
        setAmount((current + value).toString());
    };

    const handleClear = () => {
        setAmount("");
        setProfit(0);
    };

    const handleSubmit = async () => {
        const betAmount = parseInt(amount);
        if (!betData) return;
        const { minBet, maxBet, odds, isBack, teamName } = betData;

        if (betAmount >= minBet && betAmount <= maxBet) {
            const params = new URLSearchParams();
            params.append("eventId", betData.eventId);
            params.append("eventType", MARKET_TYPE);
            params.append("marketId", betData.marketId);
            params.append("stack", betAmount);
            params.append("type", isBack ? "Yes" : "No");
            params.append("odds", odds);
            params.append("runs", odds);
            params.append("bet_market_type", MARKET_TYPE);
            params.append("oddsmarketId", betData.marketId);
            params.append("eventManualType", "Auto");
            params.append("market_runner_name", teamName);
            params.append("market_odd_name", MARKET_TYPE);
            params.append("bet_event_name", MARKET_TYPE);
            params.append("bet_type", isBack ? "Back" : "Lay");

            // Use event ID from socket if available and matching
            if (socketRef.current?.eventData?.mid) {
                // Optional: overwrite eventId if needed, but betData.eventId is usually reliable
            }

            const socketGameType = socketRef.current?.eventData?.gtype || "poker";
            params.append("gtype", socketGameType);

            const defaultParams = getDefaultParams();
            Object.keys(defaultParams).forEach((key) => {
                params.append(key, defaultParams[key]);
            });

            try {
                const response = await placeBet20DragonTigerApi(params);
                if (isApiSuccess(response)) {
                    const newBet = {
                        id: Date.now().toString(),
                        bet_type: isBack ? "back" : "lay",
                        market_name: teamName,
                        odds: parseFloat(odds).toFixed(2),
                        stake: parseFloat(betAmount).toFixed(2),
                        status: "open",
                        placed_at: new Date().toISOString(),
                        potentialWin: parseFloat(profit).toFixed(2),
                    };

                    setPlacedBets((prev) => [...prev, newBet]);
                    setHasPlacedBet(true);
                    toast.success(response?.message || "Bet placed successfully!");

                    refreshBalanceApi(dispatch, { curPageName: "live_poker_oneday.php" });
                    setTimeout(() => {
                        loadOpenBets();
                        if (typeof onOpenBetUpdate === "function") {
                            onOpenBetUpdate();
                        }
                    }, 500);

                    onSubmit({ ...betData, amount: betAmount, profit });
                    handleClear();
                } else {
                    toast.error(response?.message || "Failed to place bet");
                }
            } catch (error) {
                console.error("Error placing bet:", error);
                toast.error("Error placing bet. Please try again.");
            }
        }
    };

    const isValidAmount = () => {
        if (!betData) return false;
        const betAmount = parseInt(amount);
        return amount && betAmount >= betData.minBet && betAmount <= betData.maxBet;
    };

    return (
        <>
            {!hideResults && (
                <div className="casino-place-bet">
                    <div className="casino-place-bet-title">
                        <span>Last Results</span>
                    </div>
                    <div className="casino-video-last-results">
                        {isLoading ? (
                            <span className="text-white text-center w-100">
                                Loading results...
                            </span>
                        ) : lastResults && lastResults.length > 0 ? (
                            lastResults.map((result, index) => (
                                <span
                                    // {...(console.log(`result.win === "1"`, (result.win == "1")), {})}
                                    {...(console.log("result.win", result.win), {})}
                                    key={index}
                                    className={result.win === "1" ? "resulta" : "resultb"}
                                    onClick={(e) => handleSpanClick(index, e)}
                                >
                                    {result.win == "1" ? "D" : "T"}
                                </span>
                            ))
                        ) : (
                            <span className="text-white text-center w-100">
                                No results available
                            </span>
                        )}
                        <a href="/report/casinoresult/poker" className="result-more">...</a>
                    </div>
                </div>
            )}


            {betData && (
                <div className="mt-2">
                    <div
                        style={{
                            maxWidth: "375px",
                            margin: "0 auto 6px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontWeight: "600",
                            color: "#aaafb5",
                            fontSize: "13px",
                            background: "transparent",
                        }}
                    >
                        <span>PLACE BET</span>

                        <div style={{ display: "flex", alignItems: "center" }}>
                            <span
                                style={{
                                    fontWeight: "400",
                                    fontSize: "12px",
                                    color: "#aaafb5",
                                    fontWeight: "600",
                                }}
                            >
                                {" "}
                                Range:
                                <span style={{ color: "#aaafb5", marginLeft: "4px" }}>
                                    {betData.minBet}-{betData.maxBet / 1000}K
                                </span>
                            </span>

                            {onClose && (
                                <span
                                    onClick={onClose}
                                    style={{
                                        marginLeft: "15px",
                                        cursor: "pointer",
                                        color: "#fff",
                                        fontSize: "20px",
                                        lineHeight: "1",
                                        fontWeight: "bold",
                                        padding: "0 5px",
                                    }}
                                >
                                    ✕
                                </span>
                            )}
                        </div>
                    </div>

                    <div
                        style={{
                            backgroundColor: "#1a202c",
                            borderRadius: "4px",
                            maxWidth: "375px",
                            margin: "0 auto",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: betData.isBack ? "#72bbef" : "#f994ba",
                            }}
                        >
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            backgroundColor: "#1a6a48",
                                            color: "#fff",
                                            fontSize: "15px",
                                        }}
                                    >
                                        <th style={{ padding: "6px", textAlign: "left", fontSize: "14px", fontWeight: "400" }}>(Bet For)</th>
                                        <th style={{ padding: "6px", textAlign: "center", fontSize: "14px", fontWeight: "400" }}>Odds</th>
                                        <th style={{ padding: "6px", textAlign: "center", fontSize: "14px", fontWeight: "400" }}>Stake</th>
                                        <th style={{ padding: "6px", textAlign: "right", fontSize: "14px", fontWeight: "400" }}>Profit</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr>
                                        <td style={{ padding: "6px", fontSize: "14px", fontWeight: "500" }}>
                                            {`${betData.teamName} - ${betData.isBack ? "Back" : "Lay"}`}
                                        </td>
                                        <td style={{ padding: "6px", textAlign: "center" }}>
                                            <input
                                                type="number"
                                                value={betData.odds}
                                                readOnly
                                                style={{ width: "80px", height: "34px", fontSize: "14px", border: "none", textAlign: "center" }}
                                            />
                                        </td>
                                        <td style={{ padding: "6px", textAlign: "center" }}>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                style={{ width: "80px", height: "34px", fontSize: "14px", border: "none", textAlign: "center" }}
                                            />
                                        </td>
                                        <td style={{ padding: "6px", textAlign: "right", fontSize: "14px", fontWeight: "500" }}>
                                            {Math.floor(profit)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <div style={{ padding: "8px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}>
                                    {[25, 50, 100, 200, 500, 1000].map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => handleQuickBet(v)}
                                            style={{ backgroundColor: "#1a6a48", color: "#fff", border: "none", padding: "6px", fontSize: "18px", cursor: "pointer" }}
                                        >
                                            +{v}
                                        </button>
                                    ))}
                                </div>

                                <div style={{ textAlign: "right", marginTop: "6px" }}>
                                    <button onClick={handleClear} style={{ background: "none", border: "none", fontSize: "12px", cursor: "pointer" }}>Clear</button>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
                                    <button
                                        onClick={handleClear}
                                        style={{ backgroundColor: "#ff4d4d", color: "#fff", border: "none", padding: "8px", width: "110px", fontSize: "18px", cursor: "pointer" }}
                                    >
                                        Reset
                                    </button>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={!isValidAmount()}
                                        style={{
                                            backgroundColor: "#3c8b87",
                                            color: "#fff",
                                            width: "110px",
                                            border: "none",
                                            padding: "0px",
                                            fontSize: "18px",
                                            marginLeft: "auto",
                                            cursor: isValidAmount() ? "pointer" : "not-allowed",
                                            opacity: isValidAmount() ? 1 : 0.6,
                                        }}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* OPEN BETS */}
            {openBets.length > 0 && (
                <div className="mt-2">
                    <div style={{ maxWidth: "375px", margin: "16px auto 6px", fontWeight: "600", color: "#aaafb5", fontSize: "13px" }}>
                        MY BETS
                    </div>
                    <div style={{ maxWidth: "375px", marginLeft: "auto", marginRight: "auto", backgroundColor: "#1a202c", borderRadius: "4px", overflow: "hidden", border: "1px solid #2d3748" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr", backgroundColor: "#1a6a48", color: "#ffffff", fontSize: "12px", padding: "6px 8px", borderBottom: "1px solid #2d3748" }}>
                            <div>Matched Bets</div>
                            <div style={{ textAlign: "right" }}>Odds</div>
                            <div style={{ textAlign: "right" }}>Stake</div>
                        </div>
                        <div style={{ maxHeight: "200px", overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "#4a5568 #2d3748" }}>
                            {openBets.map((bet, index) => (
                                <div
                                    key={`${bet.bet_id || index}`}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "3fr 1fr 1fr",
                                        fontSize: "13px",
                                        padding: "8px",
                                        borderBottom: "1px solid #2d3748",
                                        backgroundColor: index % 2 === 0 ? "#1a202c" : "#1f2937",
                                        color: "#e2e8f0",
                                        borderLeft: `5px solid ${(bet.bet_type || "back").toLowerCase() === "back" ? "#72bbef" : "#f994ba"}`,
                                    }}
                                >
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <div style={{ color: "#ffffff", fontWeight: "500", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {bet.market_name} - <span style={{ fontWeight: "600" }}>{bet.bet_type || "Back"}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>{bet.bet_odds}</div>
                                    <div style={{ textAlign: "right" }}>{bet.bet_stack}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Poker Result"
                style={{
                    content: {
                        top: "24%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "95%",
                        maxWidth: "1040px",
                        maxHeight: "230px",
                        padding: 0,
                        background: "#2d3748",
                        border: "none",
                        borderRadius: "4px",
                        overflow: "hidden",
                    },
                    overlay: {
                        backgroundColor: "rgba(0,0,0,0.85)",
                        zIndex: 9999,
                    },
                }}
            >
                <div
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
                        Poker 6 Players Result
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
                </div>

                <div // Round ID: Match Time:
                    style={{
                        background: "#1f2937",
                        padding: "8px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                        color: "#9ca3af",
                    }}
                >
                    <span>
                        Round ID: {modalContent?.roundId || "Loading..."}
                    </span>
                    <span>
                        Match Time: {modalContent?.matchTime || "Loading..."}
                    </span>
                </div>

                <div style={{ padding: "10px 12px 0px", overflowX: "auto", }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            minWidth: "800px",
                        }}
                    >
                        <div // Player A
                            style={{
                                width: "30%",
                                textAlign: "center",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "10px",
                                height: "100%",
                            }}
                        >
                            {modalContent?.playerA?.isWinner && (
                                <img
                                    src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
                                    alt="Winner"
                                    style={{
                                        height: "80px",
                                        width: "auto",
                                        filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))",
                                    }}
                                />
                            )}
                            <div>
                                <div
                                    style={{
                                        color: modalContent?.playerA?.isWinner ? "#fff" : "#9ca3af",
                                        fontSize: 26,
                                        marginBottom: 8,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                    }}
                                >
                                    {modalContent?.playerA?.name || "Player A"}
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: 6,
                                    }}
                                >
                                    {modalContent?.playerA?.cards?.map(
                                        (card, index) => (
                                            <img
                                                key={index}
                                                src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${card}.png`}
                                                width="38"
                                                alt={card}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src =
                                                        "https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png";
                                                }}
                                            />
                                        )
                                    ) || (
                                            <img
                                                src="https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png"
                                                width="38"
                                                alt="Back"
                                            />
                                        )}
                                </div>
                            </div>
                        </div>

                        <div // Divider
                            style={{
                                width: 1,
                                height: 90,
                                background: "#4b5563",
                                margin: "0 18px",
                            }}
                        />

                        <div // Player B
                            style={{
                                width: "30%",
                                textAlign: "center",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "10px",
                                height: "100%",
                            }}
                        >
                            {modalContent?.playerB?.isWinner && (
                                <img
                                    src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
                                    alt="Winner"
                                    style={{
                                        height: "80px",
                                        width: "auto",
                                        filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))",
                                    }}
                                />
                            )}
                            <div>
                                <div
                                    style={{
                                        color: modalContent?.playerB?.isWinner ? "#fff" : "#9ca3af",
                                        fontSize: 26,
                                        marginBottom: 8,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                    }}
                                >
                                    {modalContent?.playerB?.name || "Player B"}
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: 6,
                                    }}
                                >
                                    {modalContent?.playerB?.cards?.map(
                                        (card, index) => (
                                            <img
                                                key={index}
                                                src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${card}.png`}
                                                width="38"
                                                alt={card}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src =
                                                        "https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png";
                                                }}
                                            />
                                        )
                                    ) || (
                                            <img
                                                src="https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png"
                                                width="38"
                                                alt="Back"
                                            />
                                        )}
                                </div>
                            </div>
                        </div>

                        <div // Divider
                            style={{
                                width: 1,
                                height: 90,
                                background: "#4b5563",
                                margin: "0 18px",
                            }}
                        />

                        <div // Board
                            style={{
                                width: "30%",
                                textAlign: "center",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "10px",
                                height: "100%",
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        color: "#9ca3af",
                                        fontSize: 26,
                                        marginBottom: 8,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                    }}
                                >
                                    Board
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: 6,
                                    }}
                                >
                                    {modalContent?.board?.map(
                                        (card, index) => (
                                            <img
                                                key={index}
                                                src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${card}.png`}
                                                width="38"
                                                alt={card}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src =
                                                        "https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png";
                                                }}
                                            />
                                        )
                                    ) || (
                                            <span style={{ color: "#fff" }}>Waiting...</span>
                                        )}
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                width: "40%",
                                paddingLeft: 14,
                            }}
                        >
                            <div
                                style={{
                                    background: "#1f2937",
                                    borderRadius: 4,
                                    padding: 12,
                                    fontSize: 12,
                                    color: "#9ca3af",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        marginBottom: 6,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 80,
                                            textAlign: "right",
                                            paddingRight: 8,
                                        }}
                                    >
                                        Winner
                                    </div>
                                    <div
                                        style={{
                                            color: "#fff",
                                        }}
                                    >
                                        {modalContent?.playerA?.isWinner
                                            ? "Player A"
                                            : modalContent?.playerB?.isWinner
                                                ? "Player B"
                                                : "Loading..."}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 80,
                                            textAlign: "right",
                                            paddingRight: 8,
                                        }}
                                    >
                                        Consecutive
                                    </div>
                                    <div
                                        style={{
                                            color: "#fff",
                                        }}
                                    >
                                        A:{" "}
                                        {modalContent?.playerA?.consecutive
                                            ? "Yes"
                                            : "No"}{" "}
                                        | B:{" "}
                                        {modalContent?.playerB?.consecutive
                                            ? "Yes"
                                            : "No"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

        </>
    );
};

export default PlaceBet_DragonTiger;
