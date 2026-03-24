import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  placeBetRoulette13Api,
  isApiSuccess,
  getDefaultParams,
  fetchTeenpattiResults,
  refreshBalanceApi,
  fetchOpenBetsApi,
  fetchCasinoExposureApi,
} from "../../api/api";
import showToast from "../../utilies/toaster";
import { io } from "socket.io-client";
import Modal from "react-modal";
import { useDispatch } from "react-redux";
import useIsMobile from "../../hooks/useIsMobile";
import { getValueAfterDot } from "../../utilies/helpers";

// Helper function to parse the description string into structured data
const parseDescription = (desc) => {
  if (!desc) {
    return {
      winner: "",
      baccarat: "",
      total: "",
      pairPlus: "",
      redBlack: "",
    };
  }
  const parts = desc.split("#");
  return {
    winner: parts[0]?.trim() || "",
    baccarat: parts[1]?.trim() || "",
    total: parts[2]?.trim() || "",
    pairPlus: parts[3]?.trim() || "",
    redBlack: parts[4]?.trim() || "",
  };
};

const redNumbers = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];

const calculateStats = (results) => {
  console.log("calculateStats input:", results);
  const total = results.length;
  if (total === 0) return null;

  let stats = {
    first12: 0,
    second12: 0,
    third12: 0,
    col1: 0,
    col2: 0,
    col3: 0,
    red: 0,
    black: 0,
    odd: 0,
    even: 0,
    low: 0,
    high: 0,
  };

  results.forEach((r) => {
    // Assuming 'r.result' or 'r.winner' holds the winning number string "1", "25", etc.
    // Adjust parsing logic based on actual data
    const num = parseInt(r.result || r.winner || "0");
    if (isNaN(num)) return;
    if (num === 0) return; // 0 usually strictly excluded from these side bets, though sometimes treated differently. Sticking to exclusion for percentages.

    // Dozens
    if (num >= 1 && num <= 12) stats.first12++;
    else if (num >= 13 && num <= 24) stats.second12++;
    else if (num >= 25 && num <= 36) stats.third12++;

    // Columns
    if (num % 3 === 1) stats.col1++; // 1, 4, 7...
    else if (num % 3 === 2) stats.col2++; // 2, 5, 8...
    else if (num % 3 === 0) stats.col3++; // 3, 6, 9...

    // Color
    if (redNumbers.includes(num)) stats.red++;
    else stats.black++;

    // Odd/Even
    if (num % 2 !== 0) stats.odd++;
    else stats.even++;

    // High/Low
    if (num >= 1 && num <= 18) stats.low++;
    else if (num >= 19 && num <= 36) stats.high++;
  });

  const getPct = (val) => ((val / total) * 100).toFixed(2) + "%";

  return {
    first12: getPct(stats.first12),
    second12: getPct(stats.second12),
    third12: getPct(stats.third12),
    col1: getPct(stats.col1),
    col2: getPct(stats.col2),
    col3: getPct(stats.col3),
    red: getPct(stats.red),
    black: getPct(stats.black),
    odd: getPct(stats.odd),
    even: getPct(stats.even),
    low: getPct(stats.low),
    high: getPct(stats.high),
  };
};

const PlacebetRoulette13 = ({
  betData,
  onSubmit,
  onClose,
  hideResults,
  gameType,
  onOpenBetUpdate,
}) => {
  const isMobile = useIsMobile();
  const [amount, setAmount] = useState("");
  const [profit, setProfit] = useState(0);
  const [lastResults, setLastResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [placedBets, setPlacedBets] = useState([]);
  const [hasPlacedBet, setHasPlacedBet] = useState(false);
  const [openBets, setOpenBets] = useState([]);
  const [stats, setStats] = useState(null);
  const [isBetLoading, setIsBetLoading] = useState(false);
  const dispatch = useDispatch();

  const usingServerStats = useRef(false);

  useEffect(() => {
    if (betData?.initialAmount) {
      setAmount(betData.initialAmount.toString());
    }
  }, [betData]);

  useEffect(() => {
    if (lastResults.length > 0 && !usingServerStats.current) {
      setStats(calculateStats(lastResults));
    }
  }, [lastResults, calculateStats]);

  const loadOpenBets = useCallback(async () => {
    try {
      const res = await fetchOpenBetsApi({
        markettype: "ROULETTE13", // Updated for Roulette
        eventId: "1",
        curPageName: "live_roulette13.php", // Placeholder page name
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
  }, []);

  useEffect(() => {
    loadOpenBets();

    // Fetch initial results
    const fetchInitialResults = async () => {
      try {
        const { login_user_id, auth_key } = getDefaultParams();
        const response = await fetchTeenpattiResults(
          "1", // Placeholder mid, checking if it works for list
          "ROULETTE13",
          1,
          login_user_id,
          auth_key
        );
        console.log("Initial Results Response:", response);
        if (Array.isArray(response)) {
          // Adapt keys if necessary. Usually response is the list of results.
          const formatted = response.map((r) => ({
            ...r,
            result: r.result || r.winner || "0",
          })); // Ensure 'result' field
          setLastResults(formatted.slice(0, 10));
        }
      } catch (e) {
        console.error("Error fetching initial results:", e);
      }
    };
    fetchInitialResults();
  }, [loadOpenBets]);

  const socketRef = useRef({
    socket: null,
    eventData: null,
  });

  // Format result data for the modal
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

    let playerACards, playerBCards;
    // Adapt logic for Roulette
    playerACards = [];
    playerBCards = [];

    const isPlayerAWinner = desc.winner?.includes("Player A") ?? false;
    const isPlayerBWinner = desc.winner?.includes("Player B") ?? false;

    return {
      roundId: result.event_id || result.mid || "N/A",
      matchTime: result.time ? new Date(result.time).toLocaleString() : "N/A",
      playerA: {
        name: "Player A",
        cards: playerACards,
        isWinner: isPlayerAWinner,
      },
      playerB: {
        name: "Player B",
        cards: playerBCards,
        isWinner: isPlayerBWinner,
      },
      winner: desc.winner || "Unknown",
      baccarat: desc.baccarat,
      total: desc.total,
      pairPlus: desc.pairPlus,
      redBlack: desc.redBlack,
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
    const socket = io("https://trubet9.bet:2053", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current.socket = socket;

    socket.on("connect", () => {
      console.log(
        "✅ PlacebetRoulette13 connected to result socket:",
        socket.id
      );
      socket.emit("Room", "roulette13"); // Updated room name
      socket.emit("gameResult");
    });

    socket.on("gameResult", (data) => {
      setPlacedBets([]);
      setHasPlacedBet(false);
      setOpenBets([]);

      if (data?.res?.length > 0) {
        const latestResult = data.res[0];
        socketRef.current.eventData = {
          ...socketRef.current.eventData,
          mid: latestResult.mid.toString(),
          event_id: latestResult.mid.toString(),
          gtype: latestResult.gtype || "roulette13", // Updated game type
        };
      }

      let results = [];
      if (data && data.res && Array.isArray(data.res)) {
        results = data.res;
      }

      if (data?.g) {
        usingServerStats.current = true;
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

      if (results.length > 0) {
        const formattedResults = results.map((result) => {
          try {
            const formatted = formatResultData(result);
            return { ...result, ...formatted };
          } catch (e) {
            return result;
          }
        });

        setLastResults(formattedResults.slice(0, 10));
      }
    });

    return () => {
      if (socketRef.current?.socket) {
        socketRef.current.socket.disconnect();
      }
    };
  }, [formatResultData]);

  const handleSpanClick = async (clickedIndex, e) => {
    e.stopPropagation();
    const resultItem = lastResults[clickedIndex];
    if (!resultItem) return;

    try {
      setIsLoading(true);
      const mid = resultItem.mid || resultItem.event_id || resultItem.roundId;
      if (!mid) return;

      const { login_user_id, auth_key } = getDefaultParams();
      // NOTE: Using fetchTeenpattiResults as a placeholder; might need a different API for roulette
      const response = await fetchTeenpattiResults(
        mid,
        resultItem.gtype || "roulette13", // Updated game type
        1,
        login_user_id,
        auth_key
      );

      if (response && response.length > 0 && response[0]) {
        const apiData = response[0];
        const formatted = formatResultData(apiData);
        setModalContent(formatted);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Result click error:", error);
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
    if (!betData) {
      console.error("betData is missing");
      return;
    }

    const betAmount = parseInt(amount);
    const { minBet, maxBet, odds, isBack, teamName } = betData;

    if (betAmount < minBet || betAmount > maxBet) {
      showToast({ isSuccess: false, message: `Bet amount must be between ${minBet} and ${maxBet}` });
      return;
    }

    const params = new URLSearchParams();

    params.append("eventId", getValueAfterDot(betData.eventId));
    params.append("event_id", getValueAfterDot(betData.eventId));
    params.append("eventType", "ROULETTE13");
    params.append("marketId", betData.marketId);
    params.append("stack", betAmount);
    params.append("type", isBack ? "Yes" : "No");
    params.append("odds", odds);
    params.append("runs", odds);
    params.append("bet_market_type", "ROULETTE13");
    params.append("oddsmarketId", betData.marketId);
    params.append("eventManualType", "Auto");
    params.append("market_runner_name", teamName);
    params.append("market_odd_name", "ROULETTE13");
    params.append("bet_event_name", "ROULETTE13");
    params.append("bet_type", isBack ? "Back" : "Lay");

    params.append("gtype", "roulette13");

    const defaultParams = getDefaultParams();
    Object.keys(defaultParams).forEach((key) =>
      params.append(key, defaultParams[key])
    );

    try {
      setIsBetLoading(true);
      const response = await placeBetRoulette13Api(params);
      if (isApiSuccess(response)) {
        showToast({ isSuccess: true, message: response?.message || "Bet placed successfully!" });

        refreshBalanceApi(dispatch, { curPageName: "live_roulette13.php" });
        onSubmit({ ...betData, amount: betAmount, profit });
        loadOpenBets();
        handleClear();
        if (typeof onOpenBetUpdate === "function") {
          onOpenBetUpdate();
        }
      } else {
        showToast({ isSuccess: false, message: response?.message || "Failed to place bet" });
      }
    } catch (error) {
      console.error("Error placing bet:", error);
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

  return (
    <>
      {!hideResults && !isMobile && (
        <>
          {/* Statistics Section */}
          {stats && (
            <div className="casino-place-bet" style={{ marginBottom: "10px" }}>
              <div className="casino-place-bet-title">
                <span>Statistics</span>
              </div>
              <div
                style={{
                  backgroundColor: "#2e3439",
                  padding: "0",
                  border: "1px solid #4b5563",
                  marginRight: "5px",
                  marginLeft: "5px",
                }}
              >
                {/* Row 1: Dozens */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    borderBottom: "1px solid #4b5563",
                  }}
                >
                  <div
                    style={{
                      padding: "5px",
                      color: "#a4a8ae",
                      fontSize: "12px",
                      borderRight: "1px solid #4b5563",
                    }}
                  >
                    1st12:{" "}
                    <span
                      style={{
                        float: "right",
                        color: "white",
                        fontWeight: "bold",
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
                      borderRight: "1px solid #4b5563",
                    }}
                  >
                    2nd12:{" "}
                    <span
                      style={{
                        float: "right",
                        color: "white",
                        fontWeight: "bold",
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
                        color: "white",
                        fontWeight: "bold",
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
                    borderBottom: "1px solid #4b5563",
                  }}
                >
                  <div
                    style={{
                      padding: "5px",
                      color: "#a4a8ae",
                      fontSize: "12px",
                      borderRight: "1px solid #4b5563",
                    }}
                  >
                    1-34:{" "}
                    <span
                      style={{
                        float: "right",
                        color: "white",
                        fontWeight: "bold",
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
                      borderRight: "1px solid #4b5563",
                    }}
                  >
                    2-35:{" "}
                    <span
                      style={{
                        float: "right",
                        color: "white",
                        fontWeight: "bold",
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
                        color: "white",
                        fontWeight: "bold",
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
                    borderBottom: "1px solid #4b5563",
                  }}
                >
                  <div
                    style={{
                      padding: "5px",
                      color: "#a4a8ae",
                      fontSize: "12px",
                      borderRight: "1px solid #4b5563",
                    }}
                  >
                    Red:{" "}
                    <span
                      style={{
                        float: "right",
                        color: "white",
                        fontWeight: "bold",
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
                        color: "white",
                        fontWeight: "bold",
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
                    borderBottom: "1px solid #4b5563",
                  }}
                >
                  <div
                    style={{
                      padding: "5px",
                      color: "#a4a8ae",
                      fontSize: "12px",
                      borderRight: "1px solid #4b5563",
                    }}
                  >
                    Odd:{" "}
                    <span
                      style={{
                        float: "right",
                        color: "white",
                        fontWeight: "bold",
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
                        color: "white",
                        fontWeight: "bold",
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
                      borderRight: "1px solid #4b5563",
                    }}
                  >
                    1to18:{" "}
                    <span
                      style={{
                        float: "right",
                        color: "white",
                        fontWeight: "bold",
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
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {stats.high}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="casino-place-bet">
            <div
              className="casino-place-bet-title"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                }}
              >
                STATISTICS
              </span>
            </div>
            <div
              className={`casino-video-last-results ${isMobile ? "mobile-results-grid" : ""
                }`}
              style={
                isMobile
                  ? {
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gridTemplateRows: "repeat(2, 1fr)",
                    gap: "4px",
                    padding: "5px",
                    backgroundColor: "#2e343b",
                  }
                  : {}
              }
            >
              {lastResults && lastResults.length > 0 ? (
                lastResults.map((result, index) => {
                  const num = parseInt(result.win || result.result || "0");
                  let bgColor = "#111";
                  if (num === 0) bgColor = "#1a6a48"; // Green for 0
                  else if (redNumbers.includes(num)) bgColor = "#d0021b"; // Red

                  return (
                    <span
                      key={index}
                      style={{
                        backgroundColor: bgColor,
                        color: "#fff",
                        width: isMobile ? "auto" : "32px",
                        height: "32px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "2px",
                        margin: isMobile ? "0" : "0 2px",
                        fontWeight: "bold",
                        fontSize: "14px",
                        cursor: "pointer",
                        border: "1px solid #444",
                      }}
                      onClick={(e) => handleSpanClick(index, e)}
                    >
                      {num === 0 ? "00" : (result.win || result.result)}
                    </span>
                  );
                })
              ) : (
                <span className="text-white text-center w-100">
                  Loading results...
                </span>
              )}
              {isMobile && lastResults.length < 10 && (
                <span
                  style={{
                    backgroundColor: "#111",
                    color: "#fff",
                    height: "32px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "2px",
                    border: "1px solid #444",
                  }}
                >
                  -
                </span>
              )}
            </div>
          </div>
        </>
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
                  fontWeight: "600",
                  fontSize: "12px",
                  color: "#aaafb5",
                }}
              >
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
              backgroundColor: "#2e3439",
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
                    <th
                      style={{
                        padding: "6px",
                        textAlign: "left",
                        fontSize: "14px",
                        fontWeight: "400",
                      }}
                    >
                      (Bet For)
                    </th>
                    <th
                      style={{
                        padding: "6px",
                        textAlign: "center",
                        fontSize: "14px",
                        fontWeight: "400",
                      }}
                    >
                      Odds
                    </th>
                    <th
                      style={{
                        padding: "6px",
                        textAlign: "center",
                        fontSize: "14px",
                        fontWeight: "400",
                      }}
                    >
                      Stake
                    </th>
                    <th
                      style={{
                        padding: "6px",
                        textAlign: "right",
                        fontSize: "14px",
                        fontWeight: "400",
                      }}
                    >
                      Profit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      style={{
                        padding: "6px",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      {betData.teamName}
                    </td>
                    <td style={{ padding: "6px", textAlign: "center" }}>
                      <input
                        type="number"
                        value={betData.odds}
                        readOnly
                        style={{
                          width: "80px",
                          height: "34px",
                          fontSize: "14px",
                          border: "none",
                          textAlign: "center",
                        }}
                      />
                    </td>
                    <td style={{ padding: "6px", textAlign: "center" }}>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{
                          width: "80px",
                          height: "34px",
                          fontSize: "14px",
                          border: "none",
                          textAlign: "center",
                        }}
                      />
                    </td>
                    <td
                      style={{
                        padding: "6px",
                        textAlign: "right",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      {Math.floor(profit)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ padding: "8px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "4px",
                  }}
                >
                  {[25, 50, 100, 200, 500, 1000].map((v) => (
                    <button
                      key={v}
                      onClick={() => handleQuickBet(v)}
                      style={{
                        backgroundColor: "#1a6a48",
                        color: "#fff",
                        border: "none",
                        padding: "6px",
                        fontSize: "18px",
                        cursor: "pointer",
                      }}
                    >
                      +{v}
                    </button>
                  ))}
                </div>

                <div style={{ textAlign: "right", marginTop: "6px" }}>
                  <button
                    onClick={handleClear}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Clear
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    marginTop: "8px",
                  }}
                >
                  <button
                    onClick={handleClear}
                    style={{
                      backgroundColor: "#ff4d4d",
                      color: "#fff",
                      border: "none",
                      padding: "8px",
                      width: "110px",
                      fontSize: "18px",
                      cursor: "pointer",
                    }}
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!isValidAmount() || isBetLoading}
                    style={{
                      backgroundColor: "#3c8b87",
                      color: "#fff",
                      width: "110px",
                      border: "none",
                      padding: "0px",
                      fontSize: "18px",
                      marginLeft: "auto",
                      cursor:
                        isValidAmount() && !isBetLoading
                          ? "pointer"
                          : "not-allowed",
                      opacity: isValidAmount() && !isBetLoading ? 1 : 0.6,
                    }}
                  >
                    {isBetLoading ? "..." : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            top: "24%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "95%",
            maxWidth: "1040px",
            maxHeight: "230px",
            padding: 0,
            background: "#2e3439",
            border: "none",
            borderRadius: "4px",
            overflow: "hidden",
          },
          overlay: { backgroundColor: "rgba(0,0,0,0.85)", zIndex: 9999 },
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
            Roulette Result
          </span>
          <span
            onClick={closeModal}
            style={{
              color: "#fff",
              fontSize: 20,
              // ... rest of styles
              cursor: "pointer",
            }}
          >
            ✕
          </span>
        </div>
        {/* ... Modal content for results ... */}
      </Modal>
    </>
  );
};

export default PlacebetRoulette13;
