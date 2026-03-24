import React from "react";
import {
    fetchCasinoExposureApi,
    placeBetRoulette12Api,
    betActionRoulette12Api,
    fetchRoulette12BetsApi,
    fetchRoulette12ResultsApi,
    getDefaultParams,
    isApiSuccess,
    fetchOpenBetsApi,
    refreshBalanceApi,
} from "../../api/api";
import { io } from "socket.io-client";
import useIsMobile from "../../hooks/useIsMobile";
import Modal from "react-modal";
import { toast } from "react-toastify";
import BetList from "./components/BetList";
import { useDispatch } from "react-redux";
import "./BeachRoulette.css";

const BeachRoulette = ({ onBetSelection, lastBetTime }) => {
    const dispatch = useDispatch();
    const isMobile = useIsMobile();
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(true);
    const [selectedChip, setSelectedChip] = React.useState(25);
    const [gameData, setGameData] = React.useState(null);
    const globalStatus = gameData?.t1?.[0]?.gstatus;
    const anyMarketOpen = gameData?.t2?.some(
        (m) => m.gstatus === 1 || m.gstatus === "1"
    );
    const isLocked =
        !gameData ||
        globalStatus === "SUSPENDED" ||
        globalStatus === 0 ||
        globalStatus === "0" ||
        !anyMarketOpen;
    const [exposureData, setExposureData] = React.useState([]);
    const [betType, setBetType] = React.useState("back"); // 'back' or 'lay'
    const [placedBets, setPlacedBets] = React.useState({}); // { marketId: totalAmount }
    const [winningNumber, setWinningNumber] = React.useState(null);
    const [lastResults, setLastResults] = React.useState([]);
    const [isVideoFull, setIsVideoFull] = React.useState(false);
    const [cardResult, setCardResult] = React.useState("");
    const [isVideoLoading, setIsVideoLoading] = React.useState(true);
    const [openBets, setOpenBets] = React.useState([]);
    const [isMyBetsModalOpen, setIsMyBetsModalOpen] = React.useState(false);
    const [isStatisticsModalOpen, setIsStatisticsModalOpen] =
        React.useState(false);
    const [isResultModalOpen, setIsResultModalOpen] = React.useState(false);
    const [selectedResult, setSelectedResult] = React.useState(null);
    const [stats, setStats] = React.useState(null);
    const [oldBets, setOldBets] = React.useState([]);
    const socketRef = React.useRef(null);

    // Roulette Data
    const redNumbers = [
        1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
    ];

    // Rows for the grid (top to bottom)
    // Row 1: 3, 6, 9...
    // Row 2: 2, 5, 8...
    // Row 3: 1, 4, 7...
    const row1 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
    const row2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
    const row3 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];

    React.useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.[0]?.mid) return;
            try {
                const response = await fetchCasinoExposureApi({
                    markettype: "ROULETTE12",
                    main_event_id: gameData.t1[0].mid,
                    curPageName: "live_roulette12.php",
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

    React.useEffect(() => {
        const loadOpenBets = async () => {
            const currentEventId = gameData?.t1?.[0]?.mid || "1";
            const cleanedEventId =
                currentEventId.toString().split(".")[1] || currentEventId;

            try {
                const res = await fetchOpenBetsApi({
                    markettype: "ROULETTE12",
                    eventId: cleanedEventId,
                    curPageName: "live_roulette12.php",
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
        };

        if (gameData?.t1?.[0]?.mid) {
            loadOpenBets();
        }
    }, [gameData?.t1?.[0]?.mid, lastBetTime]);

    const getExposure = (marketId) => {
        if (!Array.isArray(exposureData)) return 0;
        // NOTE: Market ID mapping needs to be verified. Using placeholders.
        const market = exposureData.find((item) => item.market_id == marketId);
        return market ? market.win_loss || market.total_exposure : 0;
    };

    React.useEffect(() => {
        console.log("Attempting to connect to socket: https://trubet9.bet:2053");
        const socket = io("https://trubet9.bet:2053", {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });

        socketRef.current = socket;

        const joinRoom = () => {
            console.log("📤 Emitting Room: roulette12");
            socket.emit("Room", "roulette12");
        };

        socket.on("connect", () => {
            console.log("✅ Connected to game socket:", socket.id);
            joinRoom();
        });

        socket.on("reconnect", (attempt) => {
            console.log(`🔄 Reconnected to game socket after ${attempt} attempts`);
            joinRoom();
        });

        socket.on("game", (data) => {
            console.log("Beach Roulette Socket Data:", data);
            const targetData = Array.isArray(data) ? data[0] : data;
            if (targetData) {
                setGameData(targetData);

                let hasCard = false;
                // Handle Winner Highlight Logic from rouletterough.js
                if (targetData.t1?.[0]) {
                    const t1 = targetData.t1[0];
                    if (t1.C1 && t1.C1 !== "" && t1.mid !== 0) {
                        const winner = Array.isArray(t1.C1) ? t1.C1[0] : t1.C1;
                        setWinningNumber(winner);
                        setCardResult(winner);
                        hasCard = true;
                    } else {
                        setWinningNumber(null);
                        setCardResult("");
                    }
                }

                if (targetData.t2) {
                    const allSuspended = targetData.t2.every((m) => m.gstatus !== 0);
                    // In rouletterough.js: if (gstatus == "SUSPENDED" && !card_result) { videoo.addClass("full") }
                    setIsVideoFull(allSuspended && !hasCard);
                }
            }
        });

        socket.on("gameResult", (data) => {
            console.log("Beach Roulette Socket Results:", data);
            if (data && data.res && Array.isArray(data.res)) {
                setLastResults(data.res.slice(0, 10));
            }

            if (data?.g) {
                const serverStats = data.g;
                // Map server keys to our stats state keys and append %
                setStats({
                    first12: serverStats.C1st12 ? serverStats.C1st12 + "%" : "0%",
                    second12: serverStats.C2nd12 ? serverStats.C2nd12 + "%" : "0%",
                    third12: serverStats.C3rd12 ? serverStats.C3rd12 + "%" : "0%",
                    col1: serverStats.R1st ? serverStats.R1st + "%" : "0%",
                    col2: serverStats.R2nd ? serverStats.R2nd + "%" : "0%",
                    col3: serverStats.R3rd ? serverStats.R3rd + "%" : "0%",
                    red: serverStats.Red ? serverStats.Red + "%" : "0%",
                    black: serverStats.Blk ? serverStats.Blk + "%" : "0%",
                    odd: serverStats.Odd ? serverStats.Odd + "%" : "0%",
                    even: serverStats.Evn ? serverStats.Evn + "%" : "0%",
                    low: serverStats.T01to18 ? serverStats.T01to18 + "%" : "0%",
                    high: serverStats.T19to36 ? serverStats.T19to36 + "%" : "0%",
                });
            }

            fetchBets();
        });

        socket.on("disconnect", (reason) => {
            console.log("⚠️ Disconnected from game socket, reason:", reason);
            if (reason === "io server disconnect" || reason === "transport close") {
                socket.connect();
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const getCardImage = (cardCode) => {
        if (!cardCode && cardCode !== 0) return null;
        const code = cardCode.toString().trim();
        if (code === "") return null;

        try {
            const padded = code.padStart(2, "0");
            // Use local assets first
            const assetPath = `/assets/cards_new/roulette/${padded}.png`;
            return assetPath;
        } catch (e) {
            return `https://wver.sprintstaticdata.com/v190/static/front/img/cards/${cardCode}.png`;
        }
    };

    const getTimerColorClass = () => {
        const timerValue = parseInt(gameData?.t1?.[0]?.autotime) || 0;
        if (timerValue <= 5) return "red";
        if (timerValue <= 10) return "orange";
        return "green";
    };

    const fetchBets = async () => {
        const mid = gameData?.t1?.[0]?.mid;
        if (!mid) return;
        try {
            // Replicating fetch_bets from rouletterough.js
            const authParams = getDefaultParams();
            const payload = new URLSearchParams({
                ...authParams,
                eventId: mid,
                eventType: "ROULETTE12",
            });
            const data = await fetchRoulette12BetsApi(payload);
            if (isApiSuccess(data)) {
                setPlacedBets(data.open_bet_data || {});
            }
        } catch (err) {
            console.error("Error fetching bets:", err);
        }
    };

    const handleBetAction = async (actionType) => {
        const mid = gameData?.t1?.[0]?.mid;
        if (!mid) return;
        try {
            const authParams = getDefaultParams();
            const payload = new URLSearchParams({
                ...authParams,
                eventId: mid,
                eventType: "ROULETTE12",
                action_type: actionType,
            });

            if (actionType === "repeat" && oldBets.length > 0) {
                payload.append("all_old_bet", oldBets.join(","));
            }

            const data = await betActionRoulette12Api(payload);
            if (isApiSuccess(data)) {
                if (
                    (actionType === "undo" ||
                        actionType === "clear" ||
                        actionType === "repeat") &&
                    data.all_market_id
                ) {
                    setPlacedBets((prev) => {
                        const updated = { ...prev };
                        data.all_market_id.forEach((id) => {
                            delete updated[id];
                        });
                        return updated;
                    });
                }
                toast.success(data.message || `${actionType} action successful`);
                refreshBalanceApi(dispatch, { curPageName: "live_roulette12.php" });
                fetchBets();
            } else {
                toast.error(data.message || `Error performing ${actionType}`);
            }
        } catch (err) {
            console.error("Error performing bet action:", err);
            toast.error("An unexpected error occurred");
        }
    };

    React.useEffect(() => {
        if (gameData?.t1?.[0]?.mid) {
            setPlacedBets({}); // Clear chips immediately on round change
            setOpenBets([]); // Also clear open bets for modal
            fetchBets();
        }
    }, [gameData?.t1?.[0]?.mid]);

    React.useEffect(() => {
        const fetchInitialResults = async () => {
            try {
                const authParams = getDefaultParams();
                const payload = new URLSearchParams({
                    ...authParams,
                    eventType: "ROULETTE12",
                });
                const data = await fetchRoulette12ResultsApi(payload);
                if (isApiSuccess(data) && Array.isArray(data.data)) {
                    setLastResults(data.data.slice(0, 10));
                }
            } catch (err) {
                console.error("Error fetching initial results:", err);
            }
        };
        fetchInitialResults();
        // eslint-disable-next-line
    }, []);

    const handleResultClick = async (result) => {
        if (!result) return;
        try {
            const mid = result.mid || result.event_id || result.roundId;
            if (!mid) {
                setSelectedResult(result);
                setIsResultModalOpen(true);
                return;
            }

            const { login_user_id, auth_key } = getDefaultParams();
            // Using fetchRoulette12ResultsApi as a base, or similar to PlacebetBeachRoulette
            // For now, we display what we have, and we could fetch more details if needed
            setSelectedResult(result);
            setIsResultModalOpen(true);
        } catch (error) {
            console.error("Result click error:", error);
        }
    };

    // --- Betting Handlers ---
    const handleSelection = async (selectionName, sid) => {
        const mid = gameData?.t1?.[0]?.mid;
        if (!mid || !selectedChip) return;

        try {
            // One-click betting functionality from rouletterough.js
            const authParams = getDefaultParams();

            // Find market for this selection to get the rate
            const market = getMarket(sid);
            const rate = market ? parseFloat(market.rate) : 0.98;

            const params = new URLSearchParams({
                ...authParams,
                eventId: mid,
                eventType: "ROULETTE12",
                marketId: sid,
                stack: selectedChip,
                type: betType === "back" ? "Yes" : "No",
                odds: rate,
                runs: rate,
                bet_market_type: "ROULETTE12",
                oddsmarketId: sid,
                eventManualType: "Auto",
                market_runner_name: selectionName,
                market_odd_name: "ROULETTE12",
                bet_event_name: "ROULETTE12",
                bet_type: betType === "back" ? "Back" : "Lay",
            });

            // Optimistic update
            setPlacedBets((prev) => ({
                ...prev,
                [sid]: (parseFloat(prev[sid]) || 0) + selectedChip,
            }));

            const data = await placeBetRoulette12Api(params);
            if (isApiSuccess(data)) {
                if (data.last_bet_id) {
                    setOldBets((prev) => [...prev, data.last_bet_id]);
                }
                toast.success(data.message || "Bet placed successfully");
                refreshBalanceApi(dispatch, { curPageName: "live_roulette12.php" });
                fetchBets();
                // Removed onBetSelection to prevent the betting dialog from opening
            } else {
                // Rollback on error
                fetchBets();
                toast.error(data.message || "Error placing bet");
            }
        } catch (err) {
            console.error("Error placing bet:", err);
        }
    };

    const getSidByNat = (nat) => {
        if (!gameData?.t2) return null;
        return gameData.t2.find((m) => m.nat === nat)?.sid;
    };

    const handleCombinationSelection = (nums) => {
        const nat = nums.sort((a, b) => a - b).join(",");
        const sid = getSidByNat(nat);
        if (!sid) return;
        handleSelection(nat, sid);
    };

    const getAmountByNat = (nat) => {
        const sid = getSidByNat(nat);
        return placedBets[sid] || 0;
    };

    const getMarket = (sid) => {
        if (!gameData?.t2 || !Array.isArray(gameData.t2)) return null;
        return gameData.t2.find((m) => m.sid == sid);
    };

    const isMarketSuspended = (market) => {
        const globalStatus = gameData?.t1?.[0]?.gstatus;

        // User's clarification: 0 is Locked, 1 is Open
        if (
            globalStatus === "SUSPENDED" ||
            globalStatus === 0 ||
            globalStatus === "0"
        )
            return true;
        if (globalStatus === "OPEN" || globalStatus === 1 || globalStatus === "1")
            return false;

        // Fallback for individual market status
        return !market || (market.gstatus !== 1 && market.gstatus !== "1");
    };

    const getChipColor = (amt) => {
        const val = parseFloat(amt) || 0;
        // Match colors from selection menu exactly
        if (val === 25) return "#00c3e1";
        if (val === 50) return "#43d1ff";
        if (val === 100) return "#00b2ff";
        if (val === 200) return "#7ed321";
        if (val === 500) return "#b8e986";
        if (val === 1000) return "#bb9af7";

        // Range fallbacks
        if (val >= 1000) return "#bb9af7";
        if (val >= 500) return "#b8e986";
        if (val >= 200) return "#7ed321";
        if (val >= 100) return "#00b2ff";
        if (val >= 50) return "#43d1ff";
        return "#00c3e1";
    };

    const ChipVisual = ({ amount, scale = 0.85, top = "50%", left = "50%" }) => {
        if (!amount) return null;
        const color = getChipColor(amount);
        return (
            <div
                style={{
                    position: "absolute",
                    zIndex: 100, // Ensure it's above everything in the grid
                    pointerEvents: "none",
                    transform: `scale(${scale})`,
                    top: top,
                    left: left,
                    width: "40px",
                    height: "40px",
                    margin: "-20px 0 0 -20px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <div
                    style={{
                        position: "relative",
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: color,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow: "0 0 8px rgba(0,0,0,0.6)",
                        border: "4px dashed rgba(255, 255, 255, 0.8)", // Segmented look
                        boxSizing: "border-box",
                    }}
                >
                    <span
                        style={{
                            color: "#fff",
                            fontWeight: "900",
                            fontSize: "11px",
                            textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                            zIndex: 2,
                        }}
                    >
                        {amount}
                    </span>
                    {/* Inner circle to make segments look cleaner */}
                    <div
                        style={{
                            position: "absolute",
                            top: "2px",
                            left: "2px",
                            right: "2px",
                            bottom: "2px",
                            borderRadius: "50%",
                            backgroundColor: color,
                            zIndex: 1,
                        }}
                    ></div>
                </div>
            </div>
        );
    };

    const NumberBox = ({ num, isMobileBoard = false }) => {
        const isRed = redNumbers.includes(num);
        const bgColor = isRed ? "#d0021b" : "#111"; // Red or Black

        // SID Mapping: mid + 1 for numbers, 1 for Zero.
        const sid = num === 0 ? 1 : num + 1;
        // Find market for this number
        const market = getMarket(sid);
        const isSuspended = isMarketSuspended(market);
        const isWinner = winningNumber !== null && parseInt(winningNumber) === num;

        // --- Layout-aware combination logic (Look-Behind Pattern) ---
        // We render combinations in the box with the HIGHEST DOM index to ensure they are on top.

        let leftSplitNat = null;
        let topSplitNat = null;
        let cornerNat = null;
        let streetNat = null; // Used for Street (3 numbers) and First Four

        if (isMobileBoard) {
            // Mobile: Numbers are Zero -> [1,2,3] -> [4,5,6]...
            // Within street [1,2,3]: 1 then 2 then 3.

            // Split Left (n, n-1)
            if (num % 3 !== 1) leftSplitNat = `${num - 1},${num}`;
            // Split Top (n, n-3)
            if (num > 3) topSplitNat = `${num - 3},${num}`;
            // Corner (n, n-1, n-3, n-4)
            if (num > 3 && num % 3 !== 1)
                cornerNat = `${num - 4},${num - 3},${num - 1},${num}`;
            // Street combinations in mobile are harder to place with hitboxes on boxes.
            // Usually streets are bet on the statistics or street-ends.
        } else {
            // Desktop: Row 1 (1,4,7) -> Row 2 (2,5,8) -> Row 3 (3,6,9)

            // Split Left (within row: n, n-3)
            if (num > 3) leftSplitNat = `${num - 3},${num}`;
            // Split Top (n, n-1)
            if (num % 3 !== 1) topSplitNat = `${num - 1},${num}`;
            // Corner (n, n-1, n-3, n-4)
            if (num > 3 && num % 3 !== 1)
                cornerNat = `${num - 4},${num - 3},${num - 1},${num}`;

            // Street / Trio (Column): Render at bottom of Row 1 (num % 3 === 1)
            if (num % 3 === 1) streetNat = `${num},${num + 1},${num + 2}`;

            // Special: Combinations with Zero
            if (num === 1) leftSplitNat = "0,1";
            if (num === 2) {
                leftSplitNat = "0,2";
                streetNat = "0,1,2"; // Trio
            }
            if (num === 3) leftSplitNat = "0,3";
            if (num === 2) cornerNat = "0,2,3"; // Trio/Corner style
            if (num === 1) streetNat = "0,1,2,3"; // First Four (re-using streetNat slot)
        }

        return (
            <div
                onClick={() => !isSuspended && handleSelection(num.toString(), sid)}
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: isWinner ? bgColor : isSuspended ? "#333" : bgColor,
                    color: isWinner ? "#fdcf13" : isSuspended ? "#777" : "#fff",
                    fontWeight: "bold",
                    fontSize: isWinner ? (isMobileBoard ? "24px" : "32px") : (isMobileBoard ? "14px" : "16px"),
                    border: "1px solid #333",
                    cursor: isSuspended ? "not-allowed" : "pointer",
                    height: isMobileBoard ? "38px" : "75px",
                    position: "relative",
                    // Removed border clipping properties if any exist in parent
                    transition: "all 0.3s ease",
                    boxShadow: isWinner ? "0 0 15px #fdcf13" : "none",
                    zIndex: isWinner ? 10 : 1,
                }}
            >
                <span className={isWinner ? "pop-outin" : ""}>{num}</span>

                {/* --- Combination Bet Hitboxes (Look-Behind Pattern) --- */}
                {!isSuspended && (
                    <>
                        {/* Split Top (Edge) */}
                        {topSplitNat && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCombinationSelection(topSplitNat.split(","));
                                }}
                                style={{
                                    position: "absolute",
                                    top: "-15px",
                                    left: "15%",
                                    right: "15%",
                                    height: "30px",
                                    zIndex: 30,
                                    cursor: "pointer",
                                }}
                            >
                                <ChipVisual
                                    amount={getAmountByNat(topSplitNat)}
                                    scale={0.85}
                                    top="50%"
                                    left="50%"
                                />
                            </div>
                        )}

                        {/* Split Left (Edge) */}
                        {leftSplitNat && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCombinationSelection(leftSplitNat.split(","));
                                }}
                                style={{
                                    position: "absolute",
                                    left: "-15px",
                                    top: "15%",
                                    bottom: "15%",
                                    width: "30px",
                                    zIndex: 30,
                                    cursor: "pointer",
                                }}
                            >
                                <ChipVisual
                                    amount={getAmountByNat(leftSplitNat)}
                                    scale={0.85}
                                    top="50%"
                                    left="50%"
                                />
                            </div>
                        )}

                        {/* Corner (Top-Left) */}
                        {cornerNat && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCombinationSelection(cornerNat.split(","));
                                }}
                                style={{
                                    position: "absolute",
                                    top: "-15px",
                                    left: "-15px",
                                    width: "30px",
                                    height: "30px",
                                    zIndex: 35,
                                    cursor: "pointer",
                                }}
                            >
                                <ChipVisual
                                    amount={getAmountByNat(cornerNat)}
                                    scale={0.85}
                                    top="50%"
                                    left="50%"
                                />
                            </div>
                        )}

                        {/* Street / First Four (Bottom/Statistic Edge) */}
                        {!isMobileBoard && streetNat && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCombinationSelection(streetNat.split(","));
                                }}
                                style={{
                                    position: "absolute",
                                    bottom: "-6px", // Center on line
                                    left: "-6px", // Offset a bit
                                    width: "12px",
                                    height: "12px",
                                    zIndex: 35,
                                    display: "none", // Hide interaction but keep code for future
                                }}
                            ></div>
                        )}

                        {/* Standard Street chip rendering (already handled by market click usually, but for board chips:) */}
                        {!isMobileBoard && streetNat && num % 3 === 1 && (
                            <div style={{ pointerEvents: "none" }}>
                                <ChipVisual
                                    amount={getAmountByNat(streetNat)}
                                    scale={0.85}
                                    top="100%"
                                    left="50%"
                                />
                            </div>
                        )}
                    </>
                )}

                <ChipVisual amount={placedBets[sid]} />
                {isSuspended && !isWinner && (
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(0,0,0,0.6)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 2,
                        }}
                    >
                        <i
                            className="fas fa-lock"
                            style={{ fontSize: "12px", color: "#fff" }}
                        ></i>
                    </div>
                )}
            </div>
        );
    };

    const SpecialBox = ({
        label,
        color = "#fcefa1",
        textColor = "#d0021b",
        nat,
        gridArea,
        height,
        isMobileBoard = false,
    }) => {
        // Market ID Mapping
        const sidMap = {
            LOW: 139,
            EVEN: 144,
            RED: 141,
            BLACK: 142,
            ODD: 143,
            HIGH: 140,
            D1: 133,
            D2: 134,
            D3: 135,
            C1: 136,
            C2: 137,
            C3: 138,
        };
        const sid = sidMap[nat] || 0;
        const market = getMarket(sid);
        const isSuspended = isMarketSuspended(market);

        return (
            <div
                onClick={() => !isSuspended && handleSelection(label, sid)}
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: isSuspended ? "#333" : color,
                    color: isSuspended ? "#777" : textColor,
                    fontWeight: "bold",
                    fontSize: isMobileBoard ? "12px" : "16px",
                    border: "1px solid #333",
                    cursor: isSuspended ? "not-allowed" : "pointer",
                    gridArea: gridArea,
                    height: height || (isMobileBoard ? "auto" : "100%"),
                    minHeight: height || (isMobileBoard ? "38px" : "75px"),
                    position: "relative",
                    textAlign: "center",
                    lineHeight: "1",
                    padding: isMobileBoard ? "2px" : "0",
                }}
            >
                <span
                    style={{
                        transform:
                            isMobileBoard &&
                                [
                                    "1st12",
                                    "2nd12",
                                    "3rd12",
                                    "1-18",
                                    "1 - 18",
                                    "Even",
                                    "Red",
                                    "Black",
                                    "Odd",
                                    "19-36",
                                    "19 - 36",
                                ].includes(label)
                                ? "rotate(90deg)"
                                : "none",
                        display: "inline-block",
                        whiteSpace: "nowrap",
                    }}
                >
                    {label}
                </span>
                <ChipVisual amount={placedBets[sid]} />
                {isSuspended && (
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(0,0,0,0.6)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 2,
                        }}
                    >
                        <i
                            className="fas fa-lock"
                            style={{ fontSize: "12px", color: "#fff" }}
                        ></i>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <style>{`
        .casino-coin {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .bet-chip-holder_set {
            position: relative;
        }
        .bet-chip {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 0 5px rgba(0,0,0,0.5);
        }
        .pop-outin {
            animation: pop-outin 0.5s infinite alternate;
        }
        @keyframes pop-outin {
            from { transform: scale(1); }
            to { transform: scale(1.1); box-shadow: 0 0 20px #fdcf13; }
        }
        .casino-videoo.full {
            height: 100%;
            width: 100%;
            background: rgba(0,0,0,0.8);
            position: absolute;
            top: 0; left: 0;
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .casino-videoo.full .video-box-container {
            width: 95%;
            height: auto;
            position: relative;
            display: block !important;
        }
        .casino-video-cards {
            position: absolute;
            top: 20%;
            left: 0;
            right: 0;
            display: ${cardResult ? "flex" : "none"};
            justify-content: center;
            align-items: center;
            z-index: 1001;
        }
        .casino-video-cards img {
            width: 80px;
            height: auto;
            /* Removed background/shadow as per user request */
        }
        @media (max-width: 768px) {
            .video-box-container {
                display: none;
            }
            .casino-video-title {
                padding: 5px 10px;
                font-size: 11px;
                display: flex;
                gap: 5px;
                align-items: center;
            }
            .casino-name {
                color: #ffc107 !important;
                font-weight: bold;
                text-transform: uppercase;
            }
            .header-info-mobile {
                display: flex;
                flex-direction: column;
                padding: 5px 0px;
                background: transparent;
                position: relative;
            }
            .header-top-row {
               display: flex;
               align-items: center;
               gap: 10px;
               margin-bottom: 5px;
            }
            .header-bottom-row {
               display: flex;
               align-items: center;
               justify-content: space-between;
            }
        }
      `}</style>
            <div
                className="casino-container"
                style={{
                    backgroundColor: "#2e343b",
                    paddingBottom: "10px",
                    width: "100%",
                    boxSizing: "border-box",
                    position: "relative",
                }}
            >
                {isMobile ? (
                    <div>
                        {isLocked && gameData && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    zIndex: 10000,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <div
                                    style={{
                                        width: "100%",
                                        height: "auto",
                                        maxWidth: "500px",
                                        padding: "0 0px",
                                        position: "relative",
                                        backgroundColor: "transparent",
                                    }}
                                >
                                    {isVideoLoading && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: "100%",
                                                height: "250px",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                backgroundColor: "transparent",
                                                zIndex: 1,
                                            }}
                                        >
                                            <i
                                                className="fas fa-spinner fa-spin"
                                                style={{ fontSize: "30px", color: "#fff" }}
                                            ></i>
                                        </div>
                                    )}
                                    <iframe
                                        src="https://casino.diamondcricketid.com/swiftdizire/?id=3066"
                                        onLoad={() => setIsVideoLoading(false)}
                                        style={{
                                            width: "100%",
                                            height: "250px",
                                            border: "none",
                                            borderRadius: "0px",
                                            backgroundColor: "transparent",
                                            opacity: isVideoLoading ? 0 : 1,
                                        }}
                                        scrolling="no"
                                        title="Locked Video"
                                    ></iframe>
                                </div>
                            </div>
                        )}
                        <div
                            className="header-info-mobile"
                            style={{ paddingRight: "40px" }}
                        >
                            {/* Timer Progress Bar Mobile */}
                            <div
                                style={{
                                    height: "4px",
                                    width: "100%",
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    zIndex: 10,
                                }}
                            >
                                <div
                                    style={{
                                        height: "100%",
                                        width: `${((parseInt(gameData?.t1?.[0]?.autotime) || 0) / 30) *
                                            100
                                            }%`,
                                        backgroundColor:
                                            (parseInt(gameData?.t1?.[0]?.autotime) || 0) <= 5
                                                ? "#d0021b"
                                                : (parseInt(gameData?.t1?.[0]?.autotime) || 0) <= 10
                                                    ? "#f5a623"
                                                    : "#7ed321",
                                        transition: "width 1s linear, background-color 0.3s",
                                    }}
                                ></div>
                            </div>

                            <div
                                className="header-top-row"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    backgroundColor: "#000",
                                    padding: "4px 4px",
                                    borderRadius: "2px",
                                    lineHeight: "1",
                                }}
                            >
                                <span
                                    className="casino-name"
                                    style={{
                                        color: "#ffc107",
                                        fontWeight: "bold",
                                        fontSize: "12px",
                                    }}
                                >
                                    BEACH ROULETTE
                                </span>
                                <span
                                    style={{
                                        color: "#9da3a7",
                                        fontSize: "10px",
                                        fontWeight: "800",
                                    }}
                                >
                                    Round ID: {gameData?.t1?.[0]?.mid}
                                </span>
                                <span
                                    style={{
                                        color: "#9da3a7",
                                        fontSize: "10px",
                                        fontWeight: "800",
                                    }}
                                >
                                    Range: 25-1L
                                </span>
                            </div>

                            <div
                                className="header-bottom-row"
                                style={{ marginTop: "15px" }}
                            >
                                <span
                                    onClick={() => setIsStatisticsModalOpen(true)}
                                    style={{
                                        color: "#fff",
                                        textDecoration: "underline",
                                        fontSize: "13px",
                                        fontWeight: "900",
                                        textUnderlineOffset: "3px",
                                        cursor: "pointer",
                                        transform: "translateY(-15px)",
                                        display: "inline-block",
                                        marginLeft: "5px",
                                    }}
                                >
                                    STATISTICS
                                </span>

                                {/* Back / Lay Toggle Mobile (Matching Desktop UI) */}
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "0",
                                        position: "absolute",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                    }}
                                >
                                    <div
                                        onClick={() => setBetType("back")}
                                        style={{
                                            padding: "7px 33px",
                                            backgroundColor: "#72bbef",
                                            color: "#000",
                                            textAlign: "center",
                                            fontWeight: "bold",
                                            borderRadius: "25px 0 0 25px",
                                            fontSize: "16px",
                                            border: betType === "back" ? "2px solid white" : "none",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Back
                                    </div>
                                    <div
                                        onClick={() => setBetType("lay")}
                                        style={{
                                            padding: "7px 33px",
                                            backgroundColor: "#f994ba",
                                            color: "#000",
                                            textAlign: "center",
                                            fontWeight: "bold",
                                            borderRadius: "0 25px 25px 0",
                                            fontSize: "16px",
                                            border: betType === "lay" ? "2px solid white" : "none",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Lay
                                    </div>
                                </div>

                                {/* Right Icons (Vertical on absolute) */}
                                <div
                                    style={{
                                        position: "absolute",
                                        right: "8px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "5px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "28px",
                                            height: "28px",
                                            borderRadius: "50%",
                                            border: "1px solid #666",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <a href="/owncasino" style={{ display: "flex" }}>
                                            <i
                                                className="fas fa-home"
                                                style={{ color: "#fff", fontSize: "14px" }}
                                            ></i>
                                        </a>
                                    </div>
                                    <div
                                        style={{
                                            width: "28px",
                                            height: "28px",
                                            borderRadius: "50%",
                                            border: "1px solid #666",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <i
                                            className="fas fa-info-circle"
                                            style={{ color: "#fff", fontSize: "14px" }}
                                        ></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: "#2e343b",
                                padding: "10px 0",
                                display: "flex",
                                gap: "5px",
                                width: "100%",
                                boxSizing: "border-box",
                            }}
                        >
                            {/* Left Side: Layout Controls and Board */}
                            <div style={{ flex: 1, position: "relative" }}>
                                {cardResult && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "10px",
                                            left: "60%",
                                            transform: "translateX(-50%)",
                                            zIndex: 1000,
                                            pointerEvents: "none",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <img
                                            src={getCardImage(cardResult)}
                                            alt="winner"
                                            style={{ width: "90px", height: "auto" }}
                                        />
                                    </div>
                                )}
                                {/* Vertical Board Grid */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "45px 45px repeat(3, 1fr)",
                                        gap: "1px",
                                        backgroundColor: "#2e343b",
                                        // border: "1px solid #555",
                                        width: "100%",
                                    }}
                                >
                                    {/* Column 1: Outer Side Bets */}
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "1px",
                                        }}
                                    >
                                        <div style={{ height: "38px" }}></div>{" "}
                                        {/* Spacer for Zero Box */}
                                        <SpecialBox
                                            label="1 - 18"
                                            nat="LOW"
                                            isMobileBoard
                                            height="77px"
                                        />
                                        <SpecialBox
                                            label="Even"
                                            nat="EVEN"
                                            isMobileBoard
                                            height="77px"
                                        />
                                        <SpecialBox
                                            label="Red"
                                            nat="RED"
                                            isMobileBoard
                                            height="77px"
                                        />
                                        <SpecialBox
                                            label="Black"
                                            nat="BLACK"
                                            isMobileBoard
                                            height="77px"
                                        />
                                        <SpecialBox
                                            label="Odd"
                                            nat="ODD"
                                            isMobileBoard
                                            height="77px"
                                        />
                                        <SpecialBox
                                            label="19 - 36"
                                            nat="HIGH"
                                            isMobileBoard
                                            height="77px"
                                        />
                                    </div>

                                    {/* Column 2: Dozens Side Bets */}
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "1px",
                                        }}
                                    >
                                        <div style={{ height: "38px" }}></div>{" "}
                                        {/* Spacer for Zero Box */}
                                        <SpecialBox
                                            label="1st12"
                                            nat="D1"
                                            isMobileBoard
                                            height="155px"
                                        />
                                        <SpecialBox
                                            label="2nd12"
                                            nat="D2"
                                            isMobileBoard
                                            height="155px"
                                        />
                                        <SpecialBox
                                            label="3rd12"
                                            nat="D3"
                                            isMobileBoard
                                            height="155px"
                                        />
                                    </div>

                                    {/* Column 3-5: Numbers & Zero */}
                                    <div
                                        style={{
                                            gridColumn: "span 3",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "1px",
                                        }}
                                    >
                                        {/* Zero Box */}
                                        <div
                                            onClick={() => {
                                                const sid = getSidByNat("0");
                                                if (sid) handleSelection("0", sid);
                                            }}
                                            style={{
                                                height: "38px",
                                                backgroundColor:
                                                    winningNumber !== null &&
                                                        parseInt(winningNumber) === 0
                                                        ? "#1a6a48"
                                                        : isMarketSuspended(getMarket(getSidByNat("0")))
                                                            ? "#333"
                                                            : "#1a6a48",
                                                color:
                                                    winningNumber !== null &&
                                                        parseInt(winningNumber) === 0
                                                        ? "#fdcf13"
                                                        : isMarketSuspended(getMarket(getSidByNat("0")))
                                                            ? "#777"
                                                            : "#fff",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                fontWeight: "bold",
                                                fontSize: "16px",
                                                borderBottom: "1px solid #555",
                                                border: "none",
                                                position: "relative",
                                                boxShadow:
                                                    winningNumber !== null &&
                                                        parseInt(winningNumber) === 0
                                                        ? "0 0 15px #fdcf13"
                                                        : "none",
                                                zIndex:
                                                    winningNumber !== null &&
                                                        parseInt(winningNumber) === 0
                                                        ? 10
                                                        : 1,
                                            }}
                                        >
                                            0
                                            <ChipVisual amount={placedBets[getSidByNat("0")]} />
                                            {isMarketSuspended(getMarket(getSidByNat("0"))) && (
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        backgroundColor: "rgba(0,0,0,0.6)",
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        zIndex: 2,
                                                    }}
                                                >
                                                    <i
                                                        className="fas fa-lock"
                                                        style={{ fontSize: "12px", color: "#fff" }}
                                                    ></i>
                                                </div>
                                            )}
                                        </div>

                                        {/* Numbers Grid */}
                                        {(() => {
                                            const rows = [];
                                            for (let i = 0; i < 12; i++) {
                                                const base = i * 3 + 1;
                                                rows.push(
                                                    <div
                                                        key={i}
                                                        style={{
                                                            display: "grid",
                                                            gridTemplateColumns: "1fr 1fr 1fr",
                                                            gap: "1px",
                                                        }}
                                                    >
                                                        <NumberBox num={base} isMobileBoard />
                                                        <NumberBox num={base + 1} isMobileBoard />
                                                        <NumberBox num={base + 2} isMobileBoard />
                                                    </div>
                                                );
                                            }
                                            return rows;
                                        })()}

                                        {/* Bottom 2to1 row */}
                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr 1fr 1fr",
                                                gap: "1px",
                                            }}
                                        >
                                            <SpecialBox
                                                label="2to1"
                                                nat="C1"
                                                textColor="#d0021b"
                                                color="#fcefa1"
                                                isMobileBoard
                                                height="38px"
                                            />
                                            <SpecialBox
                                                label="2to1"
                                                nat="C2"
                                                textColor="#d0021b"
                                                color="#fcefa1"
                                                isMobileBoard
                                                height="38px"
                                            />
                                            <SpecialBox
                                                label="2to1"
                                                nat="C3"
                                                textColor="#d0021b"
                                                color="#fcefa1"
                                                isMobileBoard
                                                height="38px"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Timer Overlay moved to main board container */}
                                {(() => {
                                    const timeLeft =
                                        parseInt(gameData?.t1?.[0]?.autotime || "0") || 0;
                                    if (timeLeft > 0 && timeLeft <= 3) {
                                        return (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: "50%",
                                                    left: "55%", // Center over the numbers grid specifically
                                                    transform: "translate(-50%, -50%)",
                                                    fontSize: "120px",
                                                    fontWeight: "bold",
                                                    fontFamily: "timer",
                                                    color: "#d0021b",
                                                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                                                    pointerEvents: "none",
                                                    zIndex: 100,
                                                }}
                                            >
                                                {timeLeft}
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>

                            {/* Right Side: Chips & Actions */}
                            {true && (
                                <div
                                    style={{
                                        width: "60px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "10px",
                                        paddingTop: "0px",
                                        backgroundColor: "#2e3439", // Matches dark background
                                    }}
                                >
                                    {/* Chips */}
                                    {[25, 50, 100, 200, 500, 1000].map((val) => (
                                        <div
                                            key={val}
                                            onClick={() => setSelectedChip(val)}
                                            style={{
                                                width: "45px",
                                                height: "45px",
                                                borderRadius: "50%",
                                                border:
                                                    selectedChip === val
                                                        ? "3px solid #fff"
                                                        : "4px dashed rgba(255,255,255,0.3)",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                fontWeight: "bold",
                                                color: "#fff",
                                                fontSize: "14px",
                                                backgroundColor:
                                                    val === 25
                                                        ? "#00c3e1"
                                                        : val === 50
                                                            ? "#43d1ff"
                                                            : val === 100
                                                                ? "#00b2ff"
                                                                : val === 200
                                                                    ? "#7ed321"
                                                                    : val === 500
                                                                        ? "#b8e986"
                                                                        : "#bb9af7",
                                                boxShadow:
                                                    selectedChip === val
                                                        ? "0 0 15px #fff"
                                                        : "0 0 5px rgba(0,0,0,0.5)",
                                                cursor: "pointer",
                                                transform:
                                                    selectedChip === val ? "scale(1.1)" : "scale(1)",
                                                transition: "all 0.2s",
                                            }}
                                        >
                                            {val}
                                        </div>
                                    ))}

                                    {/* Action Buttons */}
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            marginTop: "10px",
                                            gap: "5px",
                                        }}
                                    >
                                        {/* Undo */}
                                        <div
                                            onClick={() => handleBetAction("undo")}
                                            style={{
                                                backgroundColor: "#d0021b",
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "50%",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <i className="fas fa-undo" style={{ color: "#fff" }}></i>
                                        </div>
                                        <span
                                            style={{
                                                fontSize: "10px",
                                                color: "#fff",
                                                textAlign: "center",
                                            }}
                                        >
                                            Undo Bet
                                        </span>

                                        {/* Repeat */}
                                        <div
                                            onClick={() => handleBetAction("repeat")}
                                            style={{
                                                backgroundColor: "#f5a623",
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "50%",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <i className="fas fa-redo" style={{ color: "#fff" }}></i>
                                        </div>
                                        <span
                                            style={{
                                                fontSize: "10px",
                                                color: "#fff",
                                                textAlign: "center",
                                            }}
                                        >
                                            Repeat
                                        </span>

                                        {/* Clear */}
                                        <div
                                            onClick={() => handleBetAction("clear")}
                                            style={{
                                                backgroundColor: "#4a4a4a", // Darker grey for clear from image ref
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "50%",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                cursor: "pointer",
                                                color: "#6c757d" // Icon specific color often dark too
                                            }}
                                        >
                                            <i
                                                className="fas fa-trash"
                                                style={{ color: "#fcefa1" }} // Yellow trash can icon color
                                            ></i>
                                        </div>
                                        <span
                                            style={{
                                                fontSize: "10px",
                                                color: "#fff",
                                                textAlign: "center",
                                            }}
                                        >
                                            clear
                                        </span>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Results Section Mobile (Far Right Corner with Side Iframe) */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: isLocked ? "flex-end" : "space-between",
                                alignItems: "flex-start",
                                // marginTop: "10px",
                                padding: "0",
                                width: "100%",
                                boxSizing: "border-box",
                            }}
                        >
                            {!isLocked && (
                                <div
                                    style={{
                                        width: "250px",
                                        height: "150px",
                                        borderRadius: "4px",
                                        overflow: "hidden",
                                        border: "1px solid #444",
                                        backgroundColor: "#000",
                                    }}
                                >
                                    <iframe
                                        src="https://casino.diamondcricketid.com/swiftdizire/?id=3066"
                                        style={{ width: "100%", height: "100%", border: "none" }}
                                        scrolling="no"
                                        title="Side Video"
                                    ></iframe>
                                </div>
                            )}

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(5, 30px)",
                                    gap: "2px",
                                }}
                            >
                                {(() => {
                                    const resultsToDisplay = lastResults.slice(0, 10);
                                    const grid = [];
                                    for (let i = 0; i < 10; i++) {
                                        const res = resultsToDisplay[i];
                                        if (res) {
                                            const num = parseInt(res.win || res.result || "0");
                                            const isRed = redNumbers.includes(num);
                                            const isZero = num === 0;
                                            const bgColor = isZero
                                                ? "#1a6a48"
                                                : isRed
                                                    ? "#d0021b"
                                                    : "#111";
                                            const displayNum =
                                                num === 0
                                                    ? "0"
                                                    : num < 10
                                                        ? `0${num}`
                                                        : num.toString();
                                            grid.push(
                                                <div
                                                    key={i}
                                                    onClick={() => handleResultClick(res)}
                                                    style={{
                                                        backgroundColor: bgColor,
                                                        color: "#fff",
                                                        height: "24px",
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        fontSize: "12px",
                                                        fontWeight: "bold",
                                                        borderRadius: "1px",
                                                        border: "1px solid #444",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {displayNum}
                                                </div>
                                            );
                                        } else {
                                            grid.push(
                                                <div
                                                    key={i}
                                                    style={{
                                                        backgroundColor: "#111",
                                                        color: "#fff",
                                                        height: "24px",
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        fontSize: "14px",
                                                        fontWeight: "bold",
                                                        borderRadius: "1px",
                                                        border: "1px solid #444",
                                                    }}
                                                >
                                                    --
                                                </div>
                                            );
                                        }
                                    }
                                    return grid;
                                })()}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="casino-video">
                        <div className="casino-video-title">
                            <span className="casino-name" style={{ color: "#fcefa1" }}>
                                BEACH ROULETTE
                            </span>
                            <span className="casino-video-rid">
                                Round ID: {gameData?.t1?.[0]?.mid || "Loading..."}
                            </span>
                        </div>
                        <div className="video-box-container">
                            <div className="video-box">
                                <iframe src="/newmediaplayer/teen62/667946cf-39ee-4f49-901e-13d5438e91ad"></iframe>
                            </div>
                        </div>

                        {/* Results Card */}
                        <div className="casino-video-cards">
                            <img src={getCardImage(cardResult)} alt="result" />
                        </div>

                        <div className="casino-timer">
                            <div className="base-timer">
                                <svg
                                    viewBox="0 0 100 100"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="base-timer__svg"
                                >
                                    <g className="base-timer__circle">
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            className="base-timer__path-elapsed"
                                        ></circle>
                                        <path
                                            strokeDasharray={`${((parseInt(gameData?.t1?.[0]?.autotime) || 0) / 30) *
                                                283
                                                } 283`}
                                            d="M 50, 50 m -45, 0 a 45,45 0 1,0 90,0 a 45,45 0 1,0 -90,0"
                                            className={`base-timer__path-remaining ${getTimerColorClass()}`}
                                        ></path>
                                    </g>
                                </svg>
                                <span className={`base-timer__label ${getTimerColorClass()}`}>
                                    <span>{gameData?.t1?.[0]?.autotime || "0"}</span>
                                </span>
                            </div>
                        </div>
                        {/* Placeholders for Right Icons */}
                        <div className="casino-video-right-icons">
                            <div className="casino-video-home-icon net-icon">
                                <i className="fas fa-video-slash"></i>
                            </div>
                            <div className="casino-video-home-icon">
                                <a href="/owncasino">
                                    <i className="fas fa-home"></i>
                                </a>
                            </div>
                            <div className="casino-video-rules-icon">
                                <i className="fas fa-info-circle"></i>
                            </div>
                        </div>
                        {/* End of desktop video section */}
                    </div>
                )}
            </div>
            {/* Betting Section */}
            {
                !isMobile && (
                    <div
                        className="casino-detail"
                        style={{ padding: "0", background: "#2e3439" }}
                    >
                        {/* Back / Lay Toggle Desktop */}
                        <div
                            style={{
                                display: "flex",
                                gap: "0",
                                marginBottom: "5px",
                                padding: "10px 10px 0 10px",
                            }}
                        >
                            <div
                                onClick={() => setBetType("back")}
                                style={{
                                    padding: "8px 24px",
                                    backgroundColor: "#72bbef",
                                    color: "#000",
                                    fontWeight: "bold",
                                    borderRadius: "20px 0 0 20px",
                                    cursor: "pointer",
                                    border: betType === "back" ? "2px solid white" : "none",
                                }}
                            >
                                Back
                            </div>
                            <div
                                onClick={() => setBetType("lay")}
                                style={{
                                    padding: "8px 24px",
                                    backgroundColor: "#f994ba",
                                    color: "#000",
                                    fontWeight: "bold",
                                    borderRadius: "0 20px 20px 0",
                                    cursor: "pointer",
                                    border: betType === "lay" ? "2px solid white" : "none",
                                }}
                            >
                                Lay
                            </div>
                        </div>

                        {/* Roulette Table Grid Desktop */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "50px repeat(12, 1fr) 50px",
                                gap: "0",
                                maxWidth: "100%",
                                padding: "10px",
                                margin: "0 auto",
                                backgroundColor: "#2e3439",
                            }}
                        >
                            {/* Zero (Left Column, Spans 3 Rows) */}
                            <div
                                onClick={() => {
                                    const sid = getSidByNat("0");
                                    if (sid) handleSelection("0", sid);
                                }}
                                style={{
                                    gridRow: "1 / span 3",
                                    backgroundColor:
                                        winningNumber !== null && parseInt(winningNumber) === 0
                                            ? "#1a6a48"
                                            : isMarketSuspended(getMarket(getSidByNat("0")))
                                                ? "#333"
                                                : "#1a6a48",
                                    color:
                                        winningNumber !== null && parseInt(winningNumber) === 0
                                            ? "#fdcf13"
                                            : isMarketSuspended(getMarket(getSidByNat("0")))
                                                ? "#777"
                                                : "#fff",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    cursor: isMarketSuspended(getMarket(getSidByNat("0")))
                                        ? "not-allowed"
                                        : "pointer",
                                    border: "1px solid #333",
                                    position: "relative",
                                    boxShadow:
                                        winningNumber !== null && parseInt(winningNumber) === 0
                                            ? "0 0 15px #fdcf13"
                                            : "none",
                                    zIndex:
                                        winningNumber !== null && parseInt(winningNumber) === 0
                                            ? 10
                                            : 1,
                                }}
                            >
                                0
                                <ChipVisual amount={placedBets[getSidByNat("0")]} />
                                {isMarketSuspended(getMarket(getSidByNat("0"))) && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: "rgba(0,0,0,0.6)",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <i
                                            className="fas fa-lock"
                                            style={{ fontSize: "12px", color: "#fff" }}
                                        ></i>
                                    </div>
                                )}
                            </div>
                            {/* Numbers Row 1 */}
                            {row1.map((num) => (
                                <NumberBox key={num} num={num} />
                            ))}
                            <SpecialBox
                                label="2to1"
                                nat="C3"
                                textColor="#fff"
                                color="#2e3439"
                            />
                            {/* Numbers Row 2 */}
                            {row2.map((num) => (
                                <NumberBox key={num} num={num} />
                            ))}
                            <SpecialBox
                                label="2to1"
                                nat="C2"
                                textColor="#fff"
                                color="#2e3439"
                            />
                            {/* Numbers Row 3 */}
                            {row3.map((num) => (
                                <NumberBox key={num} num={num} />
                            ))}
                            <SpecialBox
                                label="2to1"
                                nat="C1"
                                textColor="#fff"
                                color="#2e3439"
                            />
                            {/* Bottom Section - Dozens */}
                            <div style={{ gridColumn: "1 / span 1" }}></div>{" "}
                            {/* Spacer under 0 */}
                            <div style={{ gridColumn: "2 / span 4" }}>
                                <SpecialBox label="1st12" nat="D1" />
                            </div>
                            <div style={{ gridColumn: "6 / span 4" }}>
                                <SpecialBox label="2nd12" nat="D2" />
                            </div>
                            <div style={{ gridColumn: "10 / span 4" }}>
                                <SpecialBox label="3rd12" nat="D3" />
                            </div>
                            <div style={{ gridColumn: "14 / span 1" }}></div>{" "}
                            {/* Spacer under 2to1 */}
                            {/* Bottom Section - Simple Bets */}
                            <div style={{ gridColumn: "1 / span 1" }}></div>{" "}
                            {/* Spacer under 0 */}
                            <div style={{ gridColumn: "2 / span 2" }}>
                                <SpecialBox label="1 - 18" nat="LOW" />
                            </div>
                            <div style={{ gridColumn: "4 / span 2" }}>
                                <SpecialBox label="Even" nat="EVEN" />
                            </div>
                            <div style={{ gridColumn: "6 / span 2" }}>
                                <SpecialBox
                                    label="Red"
                                    nat="RED"
                                    color="#d0021b"
                                    textColor="#fff"
                                />
                            </div>
                            <div style={{ gridColumn: "8 / span 2" }}>
                                <SpecialBox
                                    label="Black"
                                    nat="BLACK"
                                    color="#000"
                                    textColor="#fff"
                                />
                            </div>
                            <div style={{ gridColumn: "10 / span 2" }}>
                                <SpecialBox label="Odd" nat="ODD" />
                            </div>
                            <div style={{ gridColumn: "12 / span 2" }}>
                                <SpecialBox label="19 - 36" nat="HIGH" />
                            </div>
                            <div style={{ gridColumn: "14 / span 1" }}></div>{" "}
                            {/* Spacer under 2to1 */}
                        </div>
                    </div>
                )
            }



            <Modal
                isOpen={isStatisticsModalOpen}
                onRequestClose={() => setIsStatisticsModalOpen(false)}
                style={{
                    content: {
                        top: "50px",
                        left: "0",
                        right: "0",
                        bottom: "auto",
                        marginRight: "0",
                        transform: "none",
                        width: "100%",
                        maxWidth: "100%",
                        padding: "0",
                        backgroundColor: "transparent",
                        border: "none",
                        zIndex: 1100,
                        borderRadius: "0",
                        margin: "0 auto",
                    },
                    overlay: {
                        backgroundColor: "rgba(0, 0, 0, 0.75)",
                        zIndex: 1100,
                    },
                }}
            >
                <div
                    style={{
                        backgroundColor: "#2e3439",
                        borderRadius: "4px",
                        overflow: "hidden",
                        fontFamily: "sans-serif",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            backgroundColor: "#126e51",
                            padding: "4px 15px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            color: "#f6c721",
                        }}
                    >
                        <span style={{ fontSize: "14px" }}>Statistics</span>
                        <button
                            onClick={() => setIsStatisticsModalOpen(false)}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#fff",
                                fontSize: "20px",
                                cursor: "pointer",
                            }}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* Stats Content */}
                    <div style={{ padding: "10px" }}>
                        {stats ? (
                            <div
                                style={{
                                    backgroundColor: "#2e3439",
                                    padding: "0",
                                    border: "1px solid #fff",
                                }}
                            >
                                {/* Row 1: Dozens */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr 1fr",
                                        borderBottom: "1px solid #fff",
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: "5px",
                                            color: "#a4a8ae",
                                            fontSize: "12px",
                                            borderRight: "1px solid #fff",
                                        }}
                                    >
                                        1st12:{" "}
                                        <span
                                            style={{
                                                float: "right",
                                                color: "#a4a8ae",
                                            }}
                                        >
                                            {stats.first12}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            padding: "5px",
                                            color: "#a4a8ae",
                                            fontSize: "12px",
                                            borderRight: "1px solid #fff",
                                        }}
                                    >
                                        2nd12:{" "}
                                        <span
                                            style={{
                                                float: "right",
                                                color: "#a4a8ae",
                                            }}
                                        >
                                            {stats.second12}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            padding: "5px",
                                            color: "#a4a8ae",
                                            fontSize: "12px",
                                        }}
                                    >
                                        3rd12:{" "}
                                        <span
                                            style={{
                                                float: "right",
                                                color: "#a4a8ae",
                                            }}
                                        >
                                            {stats.third12}
                                        </span>
                                    </div>
                                </div>
                                {/* Row 2: Columns */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr 1fr",
                                        borderBottom: "1px solid #fff",
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: "5px",
                                            color: "#a4a8ae",
                                            fontSize: "12px",
                                            borderRight: "1px solid #fff",
                                        }}
                                    >
                                        1-34:{" "}
                                        <span
                                            style={{
                                                float: "right",
                                                color: "#a4a8ae",
                                            }}
                                        >
                                            {stats.col1}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            padding: "5px",
                                            color: "#a4a8ae",
                                            fontSize: "12px",
                                            borderRight: "1px solid #fff",
                                        }}
                                    >
                                        2-35:{" "}
                                        <span
                                            style={{
                                                float: "right",
                                                color: "#a4a8ae",
                                            }}
                                        >
                                            {stats.col2}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            padding: "5px",
                                            color: "#a4a8ae",
                                            fontSize: "12px",
                                        }}
                                    >
                                        3-36:{" "}
                                        <span
                                            style={{
                                                float: "right",
                                                color: "#a4a8ae",
                                            }}
                                        >
                                            {stats.col3}
                                        </span>
                                    </div>
                                </div>
                                {/* Row 3: Colors */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        borderBottom: "1px solid #fff",
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: "5px",
                                            color: "#a4a8ae",
                                            fontSize: "12px",
                                            borderRight: "1px solid #fff",
                                        }}
                                    >
                                        Red:{" "}
                                        <span
                                            style={{
                                                float: "right",
                                                color: "#a4a8ae",
                                            }}
                                        >
                                            {stats.red}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            padding: "5px",
                                            color: "#a4a8ae",
                                            fontSize: "12px",
                                        }}
                                    >
                                        Black:{" "}
                                        <span
                                            style={{
                                                float: "right",
                                                color: "#a4a8ae",
                                            }}
                                        >
                                            {stats.black}
                                        </span>
                                    </div>
                                </div>
                                {/* Row 4: Odd/Even */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        borderBottom: "1px solid #fff",
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: "5px",
                                            color: "#a4a8ae",
                                            fontSize: "12px",
                                            borderRight: "1px solid #fff",
                                        }}
                                    >
                                        Odd:{" "}
                                        <span
                                            style={{
                                                float: "right",
                                                color: "#a4a8ae",
                                            }}
                                        >
                                            {stats.odd}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            padding: "5px",
                                            color: "#a4a8ae",
                                            fontSize: "12px",
                                        }}
                                    >
                                        Even:{" "}
                                        <span
                                            style={{
                                                float: "right",
                                                color: "#a4a8ae",
                                            }}
                                        >
                                            {stats.even}
                                        </span>
                                    </div>
                                </div>
                                {/* Row 5: High/Low */}
                                <div
                                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}
                                >
                                    <div
                                        style={{
                                            padding: "5px",
                                            color: "#a4a8ae",
                                            fontSize: "12px",
                                            borderRight: "1px solid #fff",
                                        }}
                                    >
                                        1to18:{" "}
                                        <span
                                            style={{
                                                float: "right",
                                                color: "#a4a8ae",
                                            }}
                                        >
                                            {stats.low}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            padding: "5px",
                                            color: "#a4a8ae",
                                            fontSize: "12px",
                                        }}
                                    >
                                        19to36:{" "}
                                        <span
                                            style={{
                                                float: "right",
                                                color: "#a4a8ae",
                                            }}
                                        >
                                            {stats.high}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                style={{ color: "white", textAlign: "center", padding: "20px" }}
                            >
                                Loading statistics...
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Result Detailed Modal */}
            <Modal
                isOpen={isResultModalOpen}
                onRequestClose={() => setIsResultModalOpen(false)}
                style={{
                    content: {
                        top: "50px",
                        left: "0",
                        right: "0",
                        bottom: "auto",
                        marginRight: "0",
                        transform: "none",
                        width: "100%",
                        maxWidth: "100%",
                        padding: "0",
                        backgroundColor: "transparent",
                        border: "none",
                        zIndex: 1101,
                        borderRadius: "0",
                    },
                    overlay: {
                        backgroundColor: "rgba(0, 0, 0, 0.75)",
                        zIndex: 1101,
                    },
                }}
            >
                <div
                    style={{
                        backgroundColor: "#2e3439",
                        borderRadius: "0",
                        overflow: "hidden",
                        fontFamily: "sans-serif",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            backgroundColor: "#13624e",
                            padding: "5px 15px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            color: "#f6c721",
                        }}
                    >
                        <span style={{ fontSize: "14px" }}>Beach Roulette Result</span>
                        <button
                            onClick={() => setIsResultModalOpen(false)}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#fff",
                                fontSize: "20px",
                                cursor: "pointer",
                            }}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* Result Content */}
                    <div
                        style={{ padding: "8px 15px", color: "#a4a8ae", fontSize: "14px" }}
                    >
                        <div style={{ marginBottom: "4px" }}>
                            Round ID:{" "}
                            {selectedResult?.mid || selectedResult?.event_id || "N/A"}
                        </div>
                        <div style={{ marginBottom: "4px" }}>
                            Match Time:{" "}
                            {selectedResult?.utime || selectedResult?.time
                                ? new Date(
                                    selectedResult?.utime || selectedResult?.time
                                ).toLocaleString() + " (UTC+05:30)"
                                : "N/A"}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                padding: "10px 0",
                            }}
                        >
                            <img
                                src={getCardImage(
                                    selectedResult?.win || selectedResult?.result
                                )}
                                alt="result"
                                style={{ width: "40px", height: "auto" }}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
            <BetList
                isMobile={isMobile}
                openBets={openBets}
                isOpen={isMyBetsModalOpen}
                onOpen={() => setIsMyBetsModalOpen(true)}
                onClose={() => setIsMyBetsModalOpen(false)}
            />
        </>
    );
};

export default BeachRoulette;
