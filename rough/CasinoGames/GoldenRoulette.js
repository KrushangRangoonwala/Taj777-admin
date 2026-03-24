import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import Modal from "react-modal";
import {
  fetchCasinoExposureApi,
  placeBetRoulette11Api,
  betActionRoulette11Api,
  fetchRoulette11BetsApi,
  fetchRoulette11ResultsApi,
  getDefaultParams,
  isApiSuccess,
  fetchOpenBetsApi,
  refreshBalanceApi,
  fetchTeenpattiResults,
} from "../../api/api";
import useIsMobile from "../../hooks/useIsMobile";
import showToast from "../../utilies/toaster";
import BetList from "./components/BetList";
import RouletteChips from "./components/RouletteChips";
import "./GoldenRoulette.css";
import RulesModal from "../Modal/RulesModal";
import { GameRules } from "./components/GameRules";
import { useGetFileData } from "../../hooks/useGetFileData";

const GoldenRoulette = ({ onBetSelection, lastBetTime }) => {
  const { CODE, game_type, phpFile, game_name, iframe_url } = useGetFileData();
  const isLight = useSelector(state => state.action.theme) === "light";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(true);
  const [selectedChip, setSelectedChip] = React.useState(25);
  const [gameData, setGameData] = React.useState(null);
  const [showRules, setShowRules] = useState(false);
  const [showWebRules, setShowWebRules] = useState(false);
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
  const [roundId, setRoundId] = React.useState("");
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
          markettype: "ROULETTE11",
          main_event_id: gameData.t1[0].mid,
          curPageName: "live_roulette11.php",
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

  const loadOpenBets = async () => {
    const currentEventId = gameData?.t1?.[0]?.mid || "1";
    const cleanedEventId =
      currentEventId.toString().split(".")[1] || currentEventId;

    try {
      const res = await fetchOpenBetsApi({
        markettype: "ROULETTE11",
        eventId: cleanedEventId,
        curPageName: "live_roulette11.php",
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

  React.useEffect(() => {
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
      console.log("📤 Emitting Room: roulette11");
      socket.emit("Room", "roulette11");
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
      console.log("Golden Roulette Socket Data:", data);
      const targetData = Array.isArray(data) ? data[0] : data;
      if (targetData) {
        setGameData(targetData);

        // Handle Round ID persistence
        if (targetData.t1?.[0]?.mid && targetData.t1[0].mid !== 0 && targetData.t1[0].mid !== "0") {
          setRoundId(targetData.t1[0].mid);
        }

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
      console.log("Golden Roulette Socket Results:", data);
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
        eventType: "ROULETTE11",
      });
      const data = await fetchRoulette11BetsApi(payload);
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
        eventType: "ROULETTE11",
        action_type: actionType,
      });

      if (actionType === "repeat" && oldBets.length > 0) {
        payload.append("all_old_bet", oldBets.join(","));
      }

      const data = await betActionRoulette11Api(payload);
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
        showToast({ isSuccess: true, message: data.message || `${actionType} action successful` });
        loadOpenBets();
        refreshBalanceApi(dispatch, { curPageName: "live_roulette11.php" });
        fetchBets();
        setTimeout(loadOpenBets, 500);
      } else {
        showToast({ isSuccess: false, message: data.message || `Error performing ${actionType}` });
      }
    } catch (err) {
      console.error("Error performing bet action:", err);
      showToast({ isSuccess: false, message: "An unexpected error occurred" });
    }
  };

  React.useEffect(() => {
    if (gameData?.t1?.[0]?.mid) {
      setPlacedBets({}); // Clear chips immediately on round change
      setOpenBets([]); // Also clear open bets for modal
      refreshBalanceApi(dispatch, { curPageName: "live_roulette11.php" });
      fetchBets();
    }
  }, [gameData?.t1?.[0]?.mid]);

  React.useEffect(() => {
    const fetchInitialResults = async () => {
      try {
        const authParams = getDefaultParams();
        const payload = new URLSearchParams({
          ...authParams,
          eventType: "ROULETTE11",
        });
        const data = await fetchRoulette11ResultsApi(payload);
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
      const response = await fetchTeenpattiResults(
        mid,
        result.gtype || "ROULETTE11",
        1,
        login_user_id,
        auth_key
      );

      if (response && response.length > 0) {
        const rawData = response[0];
        let parsedData = { ...rawData };
        try {
          if (rawData.data && typeof rawData.data === "string") {
            const innerData = JSON.parse(rawData.data);
            if (innerData.t1) {
              parsedData = { ...parsedData, ...innerData.t1 };
            }
          }
          if (rawData.cards && typeof rawData.cards === "string") {
            const cards = JSON.parse(rawData.cards);
            if (Array.isArray(cards) && cards.length > 0) {
              parsedData.win = cards[0];
            }
          }
        } catch (e) {
          console.error("Error parsing teenpatti_result data:", e);
        }
        setSelectedResult(parsedData);
      } else {
        setSelectedResult(result);
      }
      setIsResultModalOpen(true);
    } catch (error) {
      console.error("Result click error:", error);
      setSelectedResult(result);
      setIsResultModalOpen(true);
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
      const rate = market
        ? (betType === "back" ? parseFloat(market.rate) : parseFloat(market.l_rate))
        : (betType === "back" ? 0.98 : 1.10);

      const params = new URLSearchParams({
        ...authParams,
        eventId: mid,
        eventType: "ROULETTE11",
        marketId: sid,
        stack: selectedChip,
        type: betType === "back" ? "Yes" : "No",
        odds: rate,
        runs: rate,
        bet_market_type: "ROULETTE11",
        oddsmarketId: sid,
        eventManualType: "Auto",
        market_runner_name: selectionName,
        market_odd_name: "ROULETTE11",
        bet_event_name: "ROULETTE11",
        bet_type: betType === "back" ? "Back" : "Lay",
      });

      // Optimistic update
      setPlacedBets((prev) => ({
        ...prev,
        [sid]: (parseFloat(prev[sid]) || 0) + selectedChip,
      }));

      const data = await placeBetRoulette11Api(params);
      if (isApiSuccess(data)) {
        if (data.last_bet_id) {
          setOldBets((prev) => [...prev, data.last_bet_id]);
        }
        if (data.last_bet_id) {
          setOldBets((prev) => [...prev, data.last_bet_id]);
        }
        showToast({ isSuccess: true, message: data.message || "Bet placed successfully" });
        refreshBalanceApi(dispatch, { curPageName: "live_roulette11.php" });
        fetchBets();
        loadOpenBets();
        setTimeout(() => loadOpenBets(), 500);
        // Removed onBetSelection to prevent the betting dialog from opening
      } else {
        // Rollback on error
        fetchBets();
        showToast({ isSuccess: false, message: data.message || "Error placing bet" });
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

  const ChipVisual = ({ amount, scale = 1, top = "50%", left = "50%" }) => {
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
          width: "50px",
          height: "50px",
          margin: "-25px 0 0 -25px",
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

    // Locked colors
    const lockedColor = isRed ? "#d1bdbd" : "#b7bdbb";

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
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isWinner ? bgColor : isSuspended ? lockedColor : bgColor,
          color: isWinner ? "#fdcf13" : isSuspended ? "#000" : "#fff",
          fontWeight: "bold",
          fontSize: isWinner ? (isMobileBoard ? "24px" : "32px") : (isMobileBoard ? "18px" : "18px"),
          border: "1px solid #333",
          cursor: isSuspended ? "not-allowed" : "pointer",
          height: isMobileBoard ? "38px" : "75px",
          position: "relative",
          transition: "all 0.3s ease",
          boxShadow: isWinner ? "0 0 15px #fdcf13" : "none",
          zIndex: isWinner ? 10 : 1,
        }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (!isSuspended) handleSelection(num.toString(), sid);
          }}
          style={{
            position: "absolute",
            top: "8px",
            bottom: "8px",
            left: "8px",
            right: "8px",
            zIndex: 20,
            cursor: isSuspended ? "not-allowed" : "pointer",
          }}
        />

        {isSuspended && !isWinner && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 10,
            }}
          />
        )}

        {(!isSuspended || isWinner) && <span className={isWinner ? "pop-outin" : ""} style={{ position: "relative", zIndex: 5 }}>{num}</span>}
        {isSuspended && !isWinner && (
          <img
            src="https://wver.sprintstaticdata.com/v197/static/front/img/lock.svg"
            style={{ width: "14px", height: "14px" }}
            alt="locked"
          />
        )}

        {/* --- Combination Bet Hitboxes (Look-Behind Pattern) --- */}
        {/* --- Combination Bet Hitboxes (Look-Behind Pattern) --- */}
        <>
          {/* Split Top (Edge) */}
          {topSplitNat && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (!isSuspended) handleCombinationSelection(topSplitNat.split(","));
              }}
              style={{
                position: "absolute",
                top: "-12px",
                left: "25%",
                right: "25%",
                height: "22px",
                zIndex: 30,
                cursor: isSuspended ? "default" : "pointer",
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
                if (!isSuspended) handleCombinationSelection(leftSplitNat.split(","));
              }}
              style={{
                position: "absolute",
                left: "-12px",
                top: "25%",
                bottom: "25%",
                width: "22px",
                zIndex: 30,
                cursor: isSuspended ? "default" : "pointer",
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
                if (!isSuspended) handleCombinationSelection(cornerNat.split(","));
              }}
              style={{
                position: "absolute",
                top: "-12px",
                left: "-12px",
                width: "24px",
                height: "24px",
                zIndex: 35,
                cursor: isSuspended ? "default" : "pointer",
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
                if (!isSuspended) handleCombinationSelection(streetNat.split(","));
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

        <ChipVisual amount={placedBets[sid]} />
      </div>
    );
  };

  const SpecialBox = ({
    label,
    color = "#fcefa1",
    textColor = "#ff0000",
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

    const isRedBox = nat === "RED" || label === "Red";
    const isBlackBox = nat === "BLACK" || label === "Black";
    const isYellowBox = ["C1", "C2", "C3", "2to1"].includes(nat) || label === "2to1" || color === "#fcefa1";

    let lockedColor = "#bfbfbf";
    if (isRedBox) lockedColor = "#d1bdbd";
    if (isBlackBox) lockedColor = "#b7bdbb";
    if (isYellowBox) lockedColor = "#dde1d3";

    return (
      <div
        onClick={() => !isSuspended && handleSelection(label, sid)}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isSuspended ? lockedColor : color,
          color: isSuspended ? "#000" : textColor,
          fontWeight: "bold",
          fontSize: isMobileBoard ? "15px" : "18px",
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
        {isSuspended && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 10,
            }}
          />
        )}
        {!isSuspended && (
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
        )}

        {isSuspended && (
          <img
            src="https://wver.sprintstaticdata.com/v197/static/front/img/lock.svg"
            style={{ width: "14px", height: "14px" }}
            alt="locked"
          />
        )}

        <ChipVisual amount={placedBets[sid]} />
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
        .casino-video.full {
            height: 100%;
            width: 100%;
            background: transparent;
            position: absolute;
            top: 0; left: 0;
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
            pointer-events: none;
        }
        .casino-video.full .video-box-container {
            width: 95%;
            height: auto;
            position: relative;
            display: block !important;
            background: rgba(0,0,0,0.8);
            padding: 8px;
            border-radius: 4px;
            pointer-events: auto;
        }
        .casino-video {
            min-height: auto !important;
        }
        .casino-container {
            min-height: auto !important;
        }
        .casino-video-cards {
            position: absolute;
            top: 5%;
            left: 20%;
            right: 0;
            display: ${cardResult ? "flex" : "none"};
            justify-content: center;
            align-items: center;
            z-index: 11000;
            pointer-events: none;
        }
        .casino-video-cards img {
            width: 80px;
            height: auto;
            filter: drop-shadow(0 0 10px rgba(253, 207, 19, 0.8));
            /* Added glow/shadow as per user request */
        }
        @media (max-width: 768px) {
            .video-box-container {
                display: none;
            }
            .casino-video-title {
                padding: 5px 10px;
                font-size: 11px;
                display: inline-flex;
                width: fit-content;
                gap: 5px;
                align-items: center;
            }
            .casino-name {
                color: #FDCF13 !important;
                font-weight: bold;
                text-transform: uppercase;
            }
            .header-info-mobile {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                padding: 5px 0px;
                background: transparent;
                position: relative;
            }
            .header-top-row {
               display: inline-flex;
               width: fit-content;
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
          paddingBottom: "0px",
          width: "100%",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {isMobile ? (
          <div>
            <div
              className="header-info-mobile"
              style={{ paddingRight: "40px" }}
            >
              {/* Timer Progress Bar Mobile */}
              <div
                style={{
                  height: "6px",
                  width: "100%",
                  backgroundColor: "var(--bg-table-header-new)",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(
                      ((parseInt(gameData?.t1?.[0]?.autotime) || 0) /
                        (parseInt(gameData?.ft || gameData?.t1?.[0]?.ft) || 20)) *
                      100,
                      100
                    )}%`,
                    backgroundColor:
                      (parseInt(gameData?.t1?.[0]?.autotime) || 0) <= 3
                        ? "var(--bg-danger)"
                        : (parseInt(gameData?.t1?.[0]?.autotime) || 0) <= 5
                          ? "var(--bg-warning)"
                          : "var(--bg-success)",
                    transition: "width 1s linear, background-color 0.5s ease",
                  }}
                ></div>
              </div>

              <div
                className="header-top-row"
                style={{
                  display: "inline-flex",
                  width: "fit-content",
                  alignItems: "center",
                  gap: "5px",
                  backgroundColor: "#000",
                  padding: "4px 1px 4px 6px",
                  borderRadius: "2px",
                  lineHeight: "1",
                }}
              >
                <span
                  className="casino-name"
                  style={{
                    color: "#FDCF13",
                    fontWeight: "bold",
                    fontSize: "12px",
                  }}
                >
                  GOLDEN ROULETTE
                </span>
                <span
                  style={{
                    color: "#AAAFB5",
                    fontSize: "10px",
                    fontWeight: "800",
                  }}
                >
                  Round ID: {roundId || gameData?.t1?.[0]?.mid}
                </span>
                <span
                  style={{
                    color: "#AAAFB5",
                    fontSize: "10px",
                    fontWeight: "800",
                  }}
                >
                  Range: 25-1L
                </span>
              </div>

              <div
                className="header-bottom-row"
                style={{ marginTop: "15px", marginBottom: "10px" }}
              >
                <span
                  onClick={() => setIsStatisticsModalOpen(true)}
                  style={{
                    color: isLight ? "#000" : "#fff",
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
                      border: betType === "back" ? `2px solid ${isLight ? 'black' : 'white'}` : "none",
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
                      border: betType === "lay" ? `2px solid ${isLight ? 'black' : 'white'}` : "none",
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
                      backgroundColor: isLight ? "rgba(0, 0, 0, 0.5)" : '',
                    }}
                  >
                    <a href="/owncasino" style={{ display: "flex", textDecoration: "none" }}>
                      <i
                        className="fas fa-home"
                        style={{ color: isLight ? "var(--text-white)" : "#fff", fontSize: "18px" }}
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
                      backgroundColor: isLight ? "rgba(0, 0, 0, 0.5)" : '',
                    }}
                  >
                    <i
                      className="fas fa-info-circle"
                      style={{ color: isLight ? "var(--text-white)" : "#fff", fontSize: "18px" }}
                      onClick={() => {
                        setShowRules(true);
                      }}
                    ></i>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                // backgroundColor: "#2e343b",
                padding: "2px 0",
                display: "flex",
                gap: "5px",
                width: "100%",
                boxSizing: "border-box",
                position: "relative",
              }}
            >
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
                    pointerEvents: "none",
                    backgroundColor: "transparent",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      pointerEvents: "auto",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
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
                      src="https://casino.diamondcricketid.com/swiftdizire/?id="
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
              {/* Left Side: Layout Controls and Board */}
              <div style={{ flex: 1, position: "relative" }}>
                {cardResult && (
                  <div
                    style={{
                      position: "absolute",
                      top: "5%",
                      left: "60%",
                      transform: "translateX(-50%)",
                      zIndex: 11000,
                      pointerEvents: "none",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={getCardImage(cardResult)}
                      alt="winner"
                      style={{
                        width: "90px",
                        height: "auto",
                        filter: "drop-shadow(0 0 8px rgba(0,0,0,0.8)) drop-shadow(0 0 4px #fdcf13)"
                      }}
                    />
                  </div>
                )}
                {/* Vertical Board Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "47px 47px repeat(3, 80px)",
                    gap: "1px",
                    // backgroundColor: "#2e343b",
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
                            ? "#17732e"
                            : isMarketSuspended(getMarket(getSidByNat("0")))
                              ? "#b8ccbf"
                              : "#17732e",
                        color:
                          winningNumber !== null &&
                            parseInt(winningNumber) === 0
                            ? "#fdcf13"
                            : isMarketSuspended(getMarket(getSidByNat("0")))
                              ? "#000"
                              : "#fff",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontWeight: "bold",
                        fontSize: "20px",
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
                      {!(
                        isMarketSuspended(getMarket(getSidByNat("0"))) &&
                        (!winningNumber || parseInt(winningNumber) !== 0)
                      ) && "0"}
                      <ChipVisual amount={placedBets[getSidByNat("0")]} />
                      {isMarketSuspended(getMarket(getSidByNat("0"))) && (!winningNumber || parseInt(winningNumber) !== 0) && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 2,
                          }}
                        >
                          <img
                            src="https://wver.sprintstaticdata.com/v197/static/front/img/lock.svg"
                            style={{ width: "14px", height: "14px" }}
                            alt="locked"
                          />
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
                        textColor="#ff0000"
                        color="#fcefa1"
                        isMobileBoard
                        height="38px"
                      />
                      <SpecialBox
                        label="2to1"
                        nat="C2"
                        textColor="#ff0000"
                        color="#fcefa1"
                        isMobileBoard
                        height="38px"
                      />
                      <SpecialBox
                        label="2to1"
                        nat="C3"
                        textColor="#ff0000"
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

              <RouletteChips
                selectedChip={selectedChip}
                setSelectedChip={setSelectedChip}
                handleBetAction={handleBetAction}
                isLocked={isLocked}
                getChipColor={getChipColor}
              />

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
                  const resultsToDisplay = lastResults.slice(0, 9);
                  const grid = [];
                  for (let i = 0; i < 10; i++) {
                    if (i === 9) {
                      grid.push(
                        <div
                          key={i}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/report/casinoresult/${game_type}`);
                          }}
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
                            cursor: "pointer",
                          }}
                        >
                          ...
                        </div>
                      );
                      continue;
                    }
                    const res = resultsToDisplay[i];
                    if (res) {
                      const num = parseInt(res.win || res.result || "0");
                      const isRed = redNumbers.includes(num);
                      const isZero = num === 0;
                      const bgColor = isZero
                        ? "#17732e"
                        : isRed
                          ? "#d0021b"
                          : "#111";
                      const displayNum =
                        num === 0
                          ? "00"
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
          <div className={`casino-video ${isVideoFull ? "full" : ""}`}>
            <div
              className="casino-video-title"
              style={{
                width: "fit-content",
                backgroundColor: "#000",
                padding: "4px 1px 4px 6px",
              }}
            >
              <span className="casino-name" style={{ color: "#fcefa1" }}>
                GOLDEN ROULETTE
              </span>
              <span className="casino-video-rid">
                Round ID: {roundId || gameData?.t1?.[0]?.mid || "Loading..."} Range: 25-1L
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
                      strokeDasharray={`${((parseInt(gameData?.t1?.[0]?.autotime) || 0) /
                        (parseInt(gameData?.ft) || 30)) *
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
                <a href="/owncasino" style={{ textDecoration: "none" }}>
                  <i className="fas fa-home"></i>
                </a>
              </div>
              <div className="casino-video-rules-icon">
                <i className="fas fa-info-circle"
                  onClick={() => { setShowWebRules(true); }}
                ></i>
              </div>
              <div
                id="casino-vieo-rules"
                aria-modal="true"
                className="casino-vieo-rules show d-none-small show-rules"
                style={{ display: showWebRules ? "block" : "none" }}
              >
                <div className="rules-header">
                  <div>Rules</div>
                  <i className="fas fa-times" onClick={() => setShowWebRules(false)}></i>
                </div>

                {(() => {
                  /* const rules = gameRules(gameName) */
                  return (
                    <div className="rules-body">
                      <div>
                        <style>
                          {`
                                      .casino-vieo-rules {
                                          position: absolute;
                                          right: 10px;
                                          top: 50px;
                                          display: none;
                                          z-index: 10;
                                      }

                                      .casino-vieo-rules {
                                          flex-wrap: wrap;
                                          background-color: #000;
                                          color: #fff;
                                          font-size: 12px;
                                          width: 0;
                                          top: 50px;
                                          right: 0;
                                          height: calc(100% - 160px);
                                          border-radius: 0;
                                          display: none;
                                      }

                                      @media only screen and (min-width: 1280px) and (max-width: 1599px) {
                                          .casino-vieo-rules {
                                              height: calc(100% - 125px);
                                          }
                                      }

                                      .casino-vieo-rules.show-rules {
                                          display: flex;
                                          /* max-width: calc(100% - 200px); */
                                          width: 550px;
                                          z-index: 101;
                                      }

                                      @media only screen and (min-width: 320px) and (max-width: 767px) {
                                          .casino-vieo-rules {
                                              position: relative;
                                              max-width: 100% !important;
                                              width: 100% !important;
                                              top: 0;
                                              height: 100%;
                                          }
                                      }

                                      .casino-vieo-rules .rules-header {
                                          background-color: rgb(51, 51, 51);
                                          display: flex;
                                          justify-content: center;
                                          font-size: 16px;
                                          width: 100%;
                                          padding: 2px;
                                      }

                                      .casino-vieo-rules .rules-header i {
                                          position: absolute;
                                          right: 10px;
                                          top: 6px;
                                          cursor: pointer;
                                      }

                                      .casino-vieo-rules .rules-body {
                                          padding: 10px;
                                          overflow-x: hidden;
                                          overflow-y: auto;
                                          scrollbar-width: thin;
                                          scrollbar-color: #333333 #000000;
                                          height: 154px;
                                          line-height: normal;
                                          width: 100%;
                                          background-color: black;
                                      }

                                      @media only screen and (min-width: 320px) and (max-width: 767px) {
                                          .casino-vieo-rules .rules-body {
                                              text-align: left;
                                              height: 100%;
                                          }
                                      }

                                      .table th {
                                          color: #fff;
                                      }
                                          
                                      .table td {
                                          color: #fff;
                                          border: 1px solid #444;
                                          background-color: #222;
                                          font-size: 12px;
                                      }

                                      .table > :not(caption) > * > * {
                                          padding: 4px;
                                      }

                                      .rule-inner-icon {
                                          background-color: #fff;
                                          color: #000;
                                          display: flex;
                                          justify-content: center;
                                          align-items: center;
                                          height: 40px;
                                          width: 40px;
                                          font-size: 24px;
                                      }

                                      .casino-vieo-rules img {
                                          max-width: 300px;
                                      }

                                      .casino-rules img {
                                          width: auto;
                                      }

                                      .casino-tabs {
                                          height: 50px;
                                          margin-top: 0;
                                          padding-top: 0;
                                          padding-bottom: 0;
                                          display: flex;
                                          display: -webkit-flex;
                                          align-items: center;
                                          position: relative;
                                          border-radius: 0 0 8px 8px;
                                      }

                                      @media only screen and (min-width: 320px) and (max-width: 767px) {
                                          .casino-tabs {
                                              height: auto;
                                          }
                                      }

                                      .lottery-rules{
                                          background-color: #2e3439;
                                          width: 100%;
                                      }

                                      .lottery-rules .casino-tabs {
                                          border-radius: 0;
                                      }

                                      .casino-tabs .nav-tabs {
                                          border: 0;
                                          margin-left: 50px;
                                          margin-right: 50px;
                                          position: relative;
                                          flex-wrap: nowrap;
                                          overflow: hidden;
                                          scroll-behavior: smooth;
                                          white-space: nowrap;
                                      }

                                      @media only screen and (min-width: 320px) and (max-width: 1279px) {
                                          .casino-tabs .nav-tabs {
                                              margin-left: 5px;
                                              margin-right: 5px;
                                              overflow-x: auto;
                                              -ms-overflow-style: none;
                                              /* scrollbar-width: none; */
                                          }
                                      }

                                      .lottery-rules .casino-tabs .nav-tabs
                                          border: 0;
                                          margin-left: 50px !important;
                                          margin-right: 50px !important;
                                          position: relative;
                                          flex-wrap: nowrap;
                                          overflow: hidden;
                                          scroll-behavior: smooth;
                                          white-space: nowrap;
                                      }

                                      .nav-tabs .nav-item {
                                          margin-bottom: -1px;
                                      }

                                      .casino-tabs .nav-tabs .nav-link {
                                          color: var(--text-body);
                                          padding-top: 0;
                                          padding-bottom: 0;
                                          padding-left: 5px;
                                          padding-right: 5px;
                                          border: 0;
                                          text-align: center;
                                          opacity: 0.7;
                                          display: flex;
                                          flex-wrap: wrap;
                                          flex-direction: column;
                                          justify-content: center;
                                          align-items: center;
                                          transition: opacity 0.2s linear;
                                          cursor: pointer;
                                          border-radius: 0;
                                      }

                                      .casino-tabs .nav-tabs .nav-item .nav-link.active {
                                          opacity: 1;
                                          background-color: transparent;
                                      }

                                      .casino-tabs .nav-tabs .nav-item .nav-link:hover, .casino-tabs .nav-tabs .nav-item .nav-link:focus {
                                          opacity: 1;
                                          background-color: transparent;
                                      }

                                      .tab-content>.active {
                                          display: block;
                                      }

                                      .lottery-rules-box {
                                          border: 1px solid #f8b737;
                                      }

                                      .lottery-rules-row {
                                          display: flex;
                                          flex-wrap: wrap;
                                          border-bottom: 1px solid #f8b737;
                                      }

                                      .lottery-rules-title-name {
                                          display: flex;
                                          flex-wrap: wrap;
                                          align-items: center;
                                          border-right: 1px solid #f8b737;
                                          width: 20%;
                                          justify-content: center;
                                          padding: 5px;
                                          color: var(--text-table);
                                      }

                                      @media only screen and (min-width: 320px) and (max-width: 767px) {
                                          .lottery-rules-title-name {
                                              width: 30%;
                                          }
                                      }

                                      .lottery-rules-title-name>div {
                                          width: 100%;
                                          text-align: center;
                                      }

                                      .lottery-rules-cards {
                                          display: flex;
                                          flex-wrap: wrap;
                                          padding: 10px;
                                          align-items: center;
                                          justify-content: center;
                                          width: 80%;
                                          color: var(--text-table);
                                          text-align: center;
                                      }

                                      @media only screen and (min-width: 320px) and (max-width: 767px) {
                                          .lottery-rules-cards {
                                              width: 70%;
                                          }
                                      }

                                      .lottery-rules-cards .lottery-card {
                                          margin-right: 5px;
                                      }

                                      .lottery-rules-cards .lottery-card img {
                                          width: 40px;
                                          height: auto;
                                          max-height: unset;
                                      }

                                      @media only screen and (min-width: 320px) and (max-width: 767px) {
                                          .lottery-rules-cards .lottery-card img {
                                              width: 30px;
                                          }
                                      }

                                      .lottery-table td {
                                          border: 0;
                                          border-bottom: 1px solid #3c444b;
                                          padding: 4px;
                                          background-color: #2E3439;
                                          color: var(--text-table);
                                      }

                                      .rules-section .baccarat-table td, .rules-section .baccarat-table th {
                                          border-bottom: 1px solid #444;
                                          border-right: 1px solid #444;
                                          vertical-align: middle;
                                          text-align: center;
                                          color: #fff;
                                      }
                                          
                                      .rules-section .duskadum-table td {
                                          color: #fff;
                                      }

                                      .table {
                                          --bs-table-color-type: initial;
                                          --bs-table-bg-type: initial;
                                          --bs-table-color-state: initial;
                                          --bs-table-bg-state: initial;
                                          --bs-table-color: var(--bs-emphasis-color);
                                          --bs-table-bg: #2E3439;
                                          --bs-table-border-color: #3c444b;
                                          --bs-table-accent-bg: transparent;
                                          --bs-table-striped-color: unset;
                                          --bs-table-striped-bg: #2E3439;
                                          --bs-table-active-color: #2E3439;
                                          --bs-table-active-bg: rgba(var(--bs-emphasis-color-rgb), 0.1);
                                          --bs-table-hover-color: #2E3439;
                                          --bs-table-hover-bg: #2E3439;
                                          width: 100%;
                                          margin-bottom: 1rem;
                                          vertical-align: top;
                                          border-color: #3c444b;
                                      }

                                      .table td {
                                          border: 0;
                                          border-bottom: 1px solid #3c444b;
                                          padding: 4px;
                                          /* background-color: #2E3439; */
                                          color: var(--text-table);
                                      }

                                      .rules-section .row.row5 {
                                          margin-left: -5px;
                                          margin-right: -5px;
                                      }
                                      .rules-section .pl-2 {
                                          padding-left: .5rem !important;
                                      }
                                      .rules-section .pr-2 {
                                          padding-right: .5rem !important;
                                      }
                                      .rules-section .row.row5 > [class*="col-"], .rules-section .row.row5 > [class*="col"] {
                                          padding-left: 5px;
                                          padding-right: 5px;
                                      }
                                      .rules-section
                                      {
                                          text-align: left;
                                          margin-bottom: 10px;
                                      }
                                      .rules-section .table
                                      {
                                          color: #fff;
                                          border:1px solid #444;
                                          background-color: #222;
                                          font-size: 12px;
                                      }
                                      .rules-section .table td, .rules-section .table th
                                      {
                                          border-bottom: 1px solid #444;
                                      }
                                      .rules-section ul li, .rules-section p
                                      {
                                          margin-bottom: 5px;
                                          display: list-item;
                                      }
                                      .rules-section::-webkit-scrollbar {
                                          width: 8px;
                                      }
                                      .rules-section::-webkit-scrollbar-track {
                                          background: #666666;
                                      }

                                      .rules-section::-webkit-scrollbar-thumb {
                                          background-color: #333333;
                                      }
                                      .rules-section .rules-highlight
                                      {
                                          color: #FDCF13;
                                          font-size: 16px;
                                      }
                                      .rules-section .rules-sub-highlight {
                                          color: #FDCF13;
                                          font-size: 14px;
                                      }
                                      .rules-section .list-style, .rules-section .list-style li
                                      {
                                          list-style: disc;
                                          /* display: list-item; */
                                      }
                                      .rules-section .rule-card
                                      {
                                          height: 20px;
                                          margin-left: 5px;
                                      }
                                      .rules-section .card-character
                                      {
                                          font-family: Card Characters;
                                      }
                                      .rules-section .red-card
                                      {
                                          color: red;
                                          font-size: 17px;
                                      }
                                      .rules-section .black-card
                                      {
                                          color: black;
                                          font-size: 17px;
                                      }
                                      .rules-section .cards-box
                                      {
                                          background: #fff;
                                          padding: 6px;
                                          display: inline-block;
                                          color: #000;
                                          min-width: 150px;
                                      }
                                      .rules-section img {
                                      max-width: 100%;
                                      }

                                      
                                      
                                  `}
                        </style>

                        <GameRules normalizedGame={'Golden Roulette'} />
                      </div>
                    </div>
                  );
                })()}


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
            style={{ padding: "0", background: "#2e3439", position: "relative" }}
          >
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
                  pointerEvents: "none",
                  backgroundColor: "rgba(0,0,0,0.5)",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    pointerEvents: "auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
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
            {/* Back / Lay Toggle Desktop */}
            <div
              style={{
                display: "flex",
                gap: "0",
                marginBottom: "15px",
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
                      ? "#17732e"
                      : isMarketSuspended(getMarket(getSidByNat("0")))
                        ? "#333"
                        : "#17732e",
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
                  fontSize: "20px",
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
                      backgroundColor: "rgba(0,0,0,0.5)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src="https://wver.sprintstaticdata.com/v197/static/front/img/lock.svg"
                      style={{ width: "12px", height: "12px" }}
                      alt="locked"
                    />
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
            zIndex: 12000,
            borderRadius: "0",
            margin: "0 auto",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            zIndex: 12000,
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
            zIndex: 12000,
            borderRadius: "0",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            zIndex: 12000,
          },
        }}
      >
        <div
          style={{
            backgroundColor: isLight ? "#fff" : "#2e3439",
            color: isLight ? '#333' : '',
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
            <span style={{ fontSize: "14px" }}>Golden Roulette Result</span>
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
              {selectedResult?.rid || selectedResult?.event_id || selectedResult?.mid || "N/A"}
            </div>
            <div style={{ marginBottom: "4px" }}>
              Match Time:{" "}
              {selectedResult?.result_time || selectedResult?.mtime || (selectedResult?.utime || selectedResult?.time
                ? new Date(
                  selectedResult?.utime || selectedResult?.time
                ).toLocaleString() + " (UTC+05:30)"
                : "N/A")}
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
                  selectedResult?.win || selectedResult?.result || selectedResult?.card
                )}
                alt="result"
                style={{ width: "40px", height: "auto" }}
              />
            </div>
          </div>
        </div>
      </Modal>
      <BetList
        isMobile={true}
        openBets={openBets}
        isOpen={isMyBetsModalOpen}
        onOpen={() => setIsMyBetsModalOpen(true)}
        onClose={() => setIsMyBetsModalOpen(false)}
      />

      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        gameKey={'Golden Roulette'}   // or gameId
      />
    </>
  );
};

export default GoldenRoulette;
