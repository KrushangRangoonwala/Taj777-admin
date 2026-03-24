import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  placeBetApi,
  placeBetAAA2Api,
  isApiSuccess,
  getDefaultParams,
  fetchTeenpattiResults,
  refreshBalanceApi,
  fetchOpenBetsApi,
  fetchCasinoExposureApi,
} from "../../api/api";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import Modal from "react-modal";
import { useDispatch } from "react-redux";
import useIsMobile from "../../hooks/useIsMobile";

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
    color: parts[4]?.trim() || "",
    underOver: parts[5]?.trim() || "",
  };
};

// Helper to parse AAA specific description format
const parseAAADescription = (desc) => {
  if (!desc) return null;

  if (desc.includes("|")) {
    const parts = desc.split("|").map((p) => p.trim());
    const cardPart = parts[4] || "";
    const cardValue = cardPart.toLowerCase().startsWith("card")
      ? cardPart.substring(4).trim()
      : cardPart;

    return {
      winner: parts[0] || "",
      color: parts[1] || "",
      oddEven: parts[2] || "",
      underOver: parts[3] || "",
      cardDesc: cardValue,
      isPipeFormat: true,
    };
  }
  return null;
};

const PlacebetAAA2 = ({
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

  const loadOpenBets = useCallback(async () => {
    if (gameType !== "aaa2" && gameType !== "odi_teenpatti") return;

    try {
      const res = await fetchOpenBetsApi({
        markettype: "AMAR_AKBAR_ANTHONY2",
        eventId: "1",
        curPageName: "live_odi_teenpatti.php",
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
  }, [gameType]);

  useEffect(() => {
    loadOpenBets();
  }, [loadOpenBets, hasPlacedBet]);
  const socketRef = useRef({
    socket: null,
    eventData: null,
  });

  // Format result data for the modal
  const formatResultData = useCallback((result) => {
    if (!result) return null;

    // If result is already formatted, use it directly
    if (result.formatted) {
      return result;
    }

    // Parse the description
    const desc = parseDescription(result.desc_remakrs || "");

    // Parse cards from the API response
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

    // For AAA, we expect a single card result
    const mainCard = allCards.length > 0 ? allCards[0] : null;

    // Try AAA specific parsing first
    const aaaDesc = parseAAADescription(result.desc_remakrs || "");

    let finalWinner = "N/A";
    let finalOddEven = "N/A";
    let finalColor = "N/A";
    let finalUnderOver = "N/A";
    let finalCardDisplay = mainCard;

    if (aaaDesc && aaaDesc.isPipeFormat) {
      finalWinner = aaaDesc.winner;
      finalOddEven = aaaDesc.oddEven;
      finalColor = aaaDesc.color;
      finalUnderOver = aaaDesc.underOver;
      if (aaaDesc.cardDesc) finalCardDisplay = aaaDesc.cardDesc;
    } else {
      // Fallback to standard parsing
      const desc = parseDescription(result.desc_remakrs || "");
      finalWinner = desc.winner || "N/A";
      finalOddEven = desc.oddEven.join(" ") || "N/A";
      finalColor = desc.color || "N/A";
      finalUnderOver = desc.underOver || "N/A";
    }

    return {
      roundId: result.event_id || result.mid || "N/A",
      matchTime: result.time ? new Date(result.time).toLocaleString() : "N/A",
      winner: finalWinner,
      oddEven: finalOddEven,
      color: finalColor,
      underOver: finalUnderOver,
      mainCard: mainCard,
      cardDisplay: finalCardDisplay,
      formatted: true,
    };
  }, []);

  // Handle result data from API or WebSocket
  const handleResultData = useCallback(
    (data) => {
      if (!data) return;

      // Handle WebSocket data format
      if (data.res && Array.isArray(data.res)) {
        const formattedResults = data.res.map((result) => {
          const formatted = formatResultData(result);
          return {
            ...result,
            ...formatted,
          };
        });
        setLastResults((prev) => [...prev, ...formattedResults].slice(-10));
        return;
      }

      // Handle single result (from API)
      const formatted = formatResultData(data);
      if (formatted) {
        setModalContent(formatted);
        setIsModalOpen(true);
      }
    },
    [formatResultData]
  );

  useEffect(() => {
    if (amount && betData?.odds) {
      const calculatedProfit =
        parseFloat(amount) * (parseFloat(betData.odds) - 1);
      setProfit(calculatedProfit.toFixed(2));
    } else {
      setProfit(0);
    }
  }, [amount, betData]);

  // Fetch initial results from API
  useEffect(() => {
    const loadResults = async () => {
      try {
        setIsLoading(true);

        const eventId =
          socketRef.current?.eventData?.mid ||
          betData?.eventId ||
          betData?.roundId;

        if (!eventId) return;

        const formattedEventId = eventId.toString().split(".").pop();

        const response = await fetchTeenpattiResults(formattedEventId, "aaa2");
        const apiData = response?.data;
        if (!apiData?.cards || apiData.cards === "") return;

        // Use formatResultData to ensure consistency
        const formattedResult = formatResultData({
          ...apiData,
          // Ensure compatibility with formatResultData expectation
          cards: apiData.cards, // formatResultData handles string parsing
          desc_remakrs: apiData.desc_remakrs,
        });

        setLastResults((prev) => {
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
    // Establish socket connection for real-time updates
    const socket = io("https://trubet9.bet:2053", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current.socket = socket;

    socket.on("connect", () => {
      console.log("✅ PlaceBet connected to result socket:", socket.id);
      socket.emit("Room", "aaa2");
      // Request initial results history
      console.log("📤 Emitting 'lastResult' to request history...");
      socket.emit("lastResult");
    });

    socket.on("gameResult", (data) => {
      console.log(
        "📥 Received 'gameResult' event in PlaceBet:",
        JSON.stringify(data, null, 2)
      );

      // Clear placed bets when a new round result is received
      setPlacedBets([]);
      setHasPlacedBet(false);
      if (gameType === "odi_teenpatti") {
        setOpenBets([]);
      }

      if (data?.res?.length > 0) {
        // Get the most recent result (first item in the array)
        const latestResult = data.res[0];

        socketRef.current.eventData = {
          ...socketRef.current.eventData,
          mid: latestResult.mid.toString(),
          event_id: latestResult.mid.toString(),
          gtype: latestResult.gtype || "teen",
        };
      } else if (data?.event_id || data?.mid) {
        socketRef.current.eventData = {
          ...socketRef.current.eventData,
          mid: (data.mid || data.event_id).toString(),
          event_id: (data.event_id || data.mid).toString(),
          gtype: data.gtype || data.game_type || "teen",
        };
      }

      // Handle results list
      let results = [];
      if (data && data.res && Array.isArray(data.res)) {
        results = data.res;
      } else if (data && data.data && Array.isArray(data.data)) {
        results = data.data; // Fallback for some endpoints
      }

      if (results.length > 0) {
        // Format results immediately to ensure consistency
        const formattedResults = results.map((result) => {
          try {
            const formatted = formatResultData(result);
            return { ...result, ...formatted };
          } catch (e) {
            console.error("Error formatting individual result:", e, result);
            return result;
          }
        });

        setLastResults((prev) => {
          // If we received a bulk list (e.g. >= 5 items), assume it's history and replace
          // Otherwise, treat as update
          if (formattedResults.length >= 5) {
            return formattedResults.slice(0, 10);
          }
          // Merge and keep last 10
          const updated = [...prev, ...formattedResults];
          return updated.slice(-10);
        });
      }
    });

    return () => {
      if (socketRef.current?.socket) {
        console.log("🔌 Disconnecting socket...");
        socketRef.current.socket.disconnect();
      }
    };
  }, [gameType]);

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

      const formattedMid = mid.toString().split(".").pop();

      // Fetch details from API
      const { login_user_id, auth_key } = getDefaultParams();
      const response = await fetchTeenpattiResults(
        formattedMid,
        "aaa2",
        1,
        login_user_id,
        auth_key
      );

      if (response && response.length > 0 && response[0]) {
        const apiData = response[0];
        const formatted = formatResultData(apiData);
        setModalContent(formatted);
        setSelectedResult(resultItem);
        setIsModalOpen(true);
      } else {
        toast.error("Details not available");
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
      // Get event ID - prioritize betData from live game
      let eventId = null;

      // First try from betData (live data snapshot)
      if (betData?.eventId) {
        eventId = betData.eventId;
        console.log("✅ Using eventId from betData:", eventId);
      } else if (betData?.roundId) {
        eventId = betData.roundId;
        console.log("✅ Using roundId from betData:", eventId);
      } else if (betData?.id) {
        eventId = betData.id;
        console.log("✅ Using id from betData:", eventId);
      }
      // Fallback to socket data (CAUTION: this is usually the last RESULT mid, not current round)
      else if (socketRef.current?.eventData?.mid) {
        eventId = socketRef.current.eventData.mid;
        console.log("⚠️ Using mid from socket data (fallback):", eventId);
      } else if (socketRef.current?.eventData?.event_id) {
        eventId = socketRef.current.eventData.event_id;
        console.log("ℹ️ Using event_id from socket data (fallback):", eventId);
      } else {
        console.warn("⚠️ No valid event ID found in betData or socket");
      }

      // Adjust eventId to take only the part after the "." if present
      let processedEventId = eventId;
      if (eventId && eventId.toString().includes(".")) {
        processedEventId = eventId.toString().split(".")[1];
        console.log("✂️ Processed eventId (removed prefix):", processedEventId);
      }

      const params = new URLSearchParams();
      params.append("eventId", processedEventId || betData.eventId); // Use processed eventId, fallback to betData
      params.append("eventType", "AMAR_AKBAR_ANTHONY2");
      params.append("marketId", betData.marketId);
      params.append("stack", betAmount);
      params.append("type", isBack ? "Yes" : "No");
      params.append("odds", odds);
      params.append("runs", odds);
      params.append("bet_market_type", "AMAR_AKBAR_ANTHONY2");
      params.append("oddsmarketId", betData.marketId);
      params.append("eventManualType", "Auto");
      params.append("market_runner_name", teamName);
      params.append("market_odd_name", "AMAR_AKBAR_ANTHONY2");
      params.append("bet_event_name", "AMAR_AKBAR_ANTHONY2");
      params.append("bet_type", isBack ? "Back" : "Lay");

      // Log current socket data for debugging - using a safe serialization method
      const getCircularReplacer = () => {
        const seen = new WeakSet();
        return (key, value) => {
          if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
              return "[Circular]";
            }
            seen.add(value);
          }
          // Handle special cases for socket.io objects
          if (
            value &&
            value.constructor &&
            value.constructor.name === "Socket"
          ) {
            return {
              _type: "Socket",
              id: value.id,
              connected: value.connected,
              disconnected: value.disconnected,
            };
          }
          if (
            value &&
            value.constructor &&
            value.constructor.name === "Manager"
          ) {
            return {
              _type: "SocketManager",
              nsps: Object.keys(value.nsps || {}),
            };
          }
          return value;
        };
      };

      console.log(
        "🔍 Current socketRef.current:",
        JSON.stringify(
          {
            socket: socketRef.current.socket
              ? {
                id: socketRef.current.socket.id,
                connected: socketRef.current.socket.connected,
                disconnected: socketRef.current.socket.disconnected,
              }
              : null,
            eventData: socketRef.current.eventData,
          },
          getCircularReplacer(),
          2
        )
      );

      // Add event_id to params if found
      if (processedEventId) {
        params.append("event_id", processedEventId);
      }

      // Add game type as gtype
      const gameType = socketRef.current?.eventData?.gtype || "teen";
      params.append("gtype", gameType);
      console.log("🎮 Game type being sent:", gameType);

      // Log all params being sent
      console.log("📤 All API params:", Object.fromEntries(params.entries()));

      // Add default params
      const defaultParams = getDefaultParams();
      Object.keys(defaultParams).forEach((key) => {
        params.append(key, defaultParams[key]);
      });

      try {
        const response = await placeBetAAA2Api(params);
        if (isApiSuccess(response)) {
          console.log("✅ Bet placed successfully:", response);
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

          // Update local state with the new bet and set flag
          setPlacedBets((prev) => [...prev, newBet]);
          setHasPlacedBet(true);

          toast.success(response?.message || "Bet placed successfully!");

          if (gameType === "odi_teenpatti") {
            refreshBalanceApi(dispatch, {
              curPageName: "live_odi_teenpatti.php",
            });
            // Add a small delay to ensure server has processed the bet
            setTimeout(() => {
              loadOpenBets();
            }, 500);
          }

          if (onOpenBetUpdate) {
            setTimeout(() => {
              onOpenBetUpdate();
            }, 500);
          }

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

  const isMobile = useIsMobile();

  if (betData && isMobile) {
    return (
      <div
        style={{
          backgroundColor: betData.isBack ? "#72BBEF" : "#f994ba", // Dynamic background
          border: "1px solid #005f5f",
          borderRadius: "0",
          fontFamily: "sans-serif",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#13624e", // Dark Green Header
            color: "#FFD700", // Yellowish text
            padding: "8px 10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          <span>
            Place Bet{" "}
            <span
              style={{
                color: "white",
                fontSize: "11px",
                fontWeight: "normal",
                marginLeft: "5px",
              }}
            >
              Range:{betData.minBet}-{betData.maxBet / 1000}L
            </span>
          </span>
          <span
            onClick={onClose}
            style={{ cursor: "pointer", color: "white", fontSize: "16px" }}
          >
            ✕
          </span>
        </div>

        {/* Info Row: Selection & Odds */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "5px 10px",
            backgroundColor: betData.isBack ? "#72BBEF" : "#f994ba",
            fontWeight: "bold",
            fontSize: "14px",
            borderBottom: "1px solid #999",
          }}
        >
          <span>{betData.teamName}</span>
          <span>{betData.odds}</span>
        </div>

        {/* Amount Input */}
        <div style={{ padding: "15px 10px 5px 10px" }}>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "2px",
              border: "1px solid #ccc",
              backgroundColor: "#eee",
              fontSize: "14px",
              boxSizing: "border-box",
              color: "#333",
            }}
          />
        </div>

        {/* Quick Stakes */}
        <div
          style={{
            padding: "10px 10px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px",
          }}
        >
          {[25, 50, 100, 200, 500, 1000].map((stake) => (
            <button
              key={stake}
              onClick={() => handleQuickBet(stake)}
              style={{
                backgroundColor: "#13624e", // Green buttons
                color: "white",
                border: "none",
                padding: "8px",
                fontSize: "13px",
                fontWeight: "bold",
                borderRadius: "2px",
                cursor: "pointer",
              }}
            >
              +{stake}
            </button>
          ))}
        </div>

        {/* Clear Button */}
        <div style={{ textAlign: "right", padding: "5px 10px" }}>
          <button
            onClick={handleClear}
            style={{
              background: "transparent",
              border: "none",
              color: "#333",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>

        {/* Submit Button */}
        <div style={{ padding: "10px" }}>
          <button
            onClick={handleSubmit}
            disabled={!isValidAmount() || isLoading}
            style={{
              width: "100%",
              backgroundColor: "#3c8b87", // Teal submit button
              color: "white",
              border: "none",
              padding: "12px",
              fontSize: "16px",
              fontWeight: "bold",
              borderRadius: "2px",
              cursor: isValidAmount() ? "pointer" : "not-allowed",
              opacity: isValidAmount() ? 1 : 0.7,
            }}
          >
            {isLoading ? "Submit" : "Submit"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {!hideResults && (
        <div className="casino-place-bet">
          {!isMobile && (
            <div className="casino-place-bet-title">
              <span>Last Results</span>
            </div>
          )}
          <div className="casino-video-last-results">
            {isLoading ? (
              <span className="text-white text-center w-100">
                Loading results...
              </span>
            ) : lastResults && lastResults.length > 0 ? (
              lastResults.map((result, index) => {
                const win = result.win || result.result;
                let bg = "#333";
                let color = "#fff";
                let text = "?";

                if (win === "1" || win === "A") {
                  bg = "#000"; // Black Background
                  color = "#d9534f"; // Red Text
                  text = "A";
                } else if (win === "2" || win === "B") {
                  bg = "#000"; // Black Background
                  color = "#f0ad4e"; // Yellow Text
                  text = "B";
                } else if (win === "3" || win === "C") {
                  bg = "#000"; // Black Background
                  color = "#5cb85c"; // Green Text
                  text = "C";
                }

                return (
                  <span
                    key={index}
                    className="result-circle"
                    style={{
                      background: bg,
                      color: color,
                      display: "inline-flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "30px",
                      height: "30px",
                      borderRadius: "4px",
                      margin: "2px",
                      fontWeight: "bold",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                    onClick={(e) => handleSpanClick(index, e)}
                  >
                    {text}
                  </span>
                );
              })
            ) : (
              <span className="text-white text-center w-100">
                No results available
              </span>
            )}
            <a
              href="/report/casinoresult/teen33"
              className="result-more"
              style={{
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                width: "30px",
                height: "30px",
                borderRadius: "4px",
                margin: "2px",
                fontWeight: "bold",
                fontSize: "14px",
                color: "white",
                textDecoration: "none",
                background: "#333", // Optional: Match generic background or keep transparent if preferred
                verticalAlign: "middle", // Ensure it sits on the same line if flex isn't controlling it parent-side
              }}
            >
              ...
            </a>
          </div>
        </div>
      )}

      {betData && (
        <div className="mt-2">
          {/* ===== OUTSIDE HEADER (NO BACKGROUND) ===== */}
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

          {/* ===== MAIN BET BOX ===== */}
          <div
            style={{
              backgroundColor: "#1a202c",
              borderRadius: "4px",
              maxWidth: "375px",
              margin: "0 auto",
              overflow: "hidden",
            }}
          >
            {/* ===== TABLE (NO SPACING) ===== */}
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
                      {`${betData.teamName} - ${betData.isBack ? "Back" : "Lay"
                        }`}
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

              {/* ===== BUTTON AREA (WITH SPACING) ===== */}
              <div style={{ padding: "8px" }}>
                {/* Quick Bets */}
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

                {/* Clear */}
                <div
                  style={{
                    textAlign: "right",
                    marginTop: "6px",
                  }}
                >
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

                {/* Actions */}
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

      {/* MY BETS SECTION */}
      {openBets.length > 0 && (
        <div className="mt-2">
          <div
            style={{
              maxWidth: "375px",
              margin: "16px auto 6px",
              fontWeight: "600",
              color: "#aaafb5",
              fontSize: "13px",
            }}
          >
            MY BETS
          </div>
          <div
            style={{
              maxWidth: "375px",
              marginLeft: "auto",
              marginRight: "auto",
              backgroundColor: "#1a202c",
              borderRadius: "4px",
              overflow: "hidden",
              border: "1px solid #2d3748",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "3fr 1fr 1fr",
                backgroundColor: "#1a6a48",
                color: "#ffffff",
                fontSize: "12px",
                padding: "6px 8px",
                borderBottom: "1px solid #2d3748",
              }}
            >
              <div>Matched Bets</div>
              <div style={{ textAlign: "right" }}>Odds</div>
              <div style={{ textAlign: "right" }}>Stake</div>
            </div>
            <div
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "#4a5568 #2d3748",
              }}
            >
              {openBets.length > 0 ? (
                openBets.map((bet, index) => (
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
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div
                        style={{
                          color: "#ffffff",
                          fontWeight: "500",
                          fontSize: "14px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {bet.market_name} -{" "}
                        <span style={{ fontWeight: "600" }}>
                          {bet.bet_type || "Back"}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>{bet.bet_odds}</div>
                    <div style={{ textAlign: "right" }}>{bet.bet_stack}</div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    color: "#a0aec0",
                    padding: "16px 0",
                    fontSize: "13px",
                  }}
                >
                  No bets placed
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Teenpatti Result"
        style={{
          content: {
            top: isMobile ? "20%" : "24%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "100%" : "95%",
            maxWidth: "1040px",
            maxHeight: isMobile ? "285px" : "230px",
            padding: 0,
            background: "#2e3439",
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
        {/* HEADER */}
        <div
          style={{
            background: "#1a6a48",
            padding: "4px 12px", // ⬅ reduced height
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: "32px", // ⬅ keeps it thin & consistent
          }}
        >
          <span
            style={{
              color: "rgba(251, 191, 36, 1)",
              fontSize: 15,
              lineHeight: "1",
            }}
          >
            Amar Akbar Anthony Result 2
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

        {/* SUB HEADER */}
        <div
          style={{
            background: "#2e3439",
            padding: "8px 14px",
            display: isMobile ? "flex" : "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: isMobile ? "center" : "space-between",
            gap: isMobile ? "5px" : "0",
            fontSize: 13,
            color: "#9ca3af",
          }}
        >
          <span>Round ID: {modalContent?.roundId || "Loading..."}</span>
          <span>Match Time: {modalContent?.matchTime || "Loading..."}</span>
        </div>

        {/* BODY */}
        <div style={{ padding: "10px 12px", overflowX: "auto" }}>
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row", // Mobile: Column, Desktop: Row
              alignItems: "center",
              justifyContent: "center",
              minWidth: "100%",
            }}
          >
            {/* CENTER CARD */}
            <div
              style={{
                width: isMobile ? "100%" : "30%",
                textAlign: "center",
                marginBottom: isMobile ? "15px" : "0",
              }}
            >
              {modalContent?.mainCard ? (
                <img
                  src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${modalContent.mainCard}.png`}
                  width={isMobile ? "25" : "50"} // Slightly larger on mobile
                  alt={modalContent.mainCard}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png";
                  }}
                />
              ) : (
                <img
                  src="https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png"
                  width={isMobile ? "60" : "50"}
                  alt="Back"
                />
              )}
            </div>

            <div
              style={{
                width: isMobile ? "100%" : "70%",
                paddingLeft: isMobile ? 0 : 10,
              }}
            >
              <div
                style={{
                  background: "#444444",
                  borderRadius: 4,
                  padding: "8px 12px",
                  fontSize: 13,
                  color: "#9ca3af",
                }}
              >
                <div style={{ display: "flex", marginBottom: 4 }}>
                  <div
                    style={{
                      width: "40%",
                      textAlign: "right",
                      paddingRight: "10px",
                      color: "#aaafb5",
                    }}
                  >
                    Winner
                  </div>
                  <div
                    style={{
                      width: "60%",
                      textAlign: "left",
                      paddingLeft: "10px",
                      color: "#9ca3af",
                      fontWeight: "bold",
                    }}
                  >
                    {modalContent?.winner}
                  </div>
                </div>
                <div style={{ display: "flex", marginBottom: 4 }}>
                  <div
                    style={{
                      width: "40%",
                      textAlign: "right",
                      paddingRight: "10px",
                      color: "#aaafb5",
                    }}
                  >
                    Odd/Even
                  </div>
                  <div
                    style={{
                      width: "60%",
                      textAlign: "left",
                      paddingLeft: "10px",
                      color: "#9ca3af",
                    }}
                  >
                    {modalContent?.oddEven}
                  </div>
                </div>
                <div style={{ display: "flex", marginBottom: 4 }}>
                  <div
                    style={{
                      width: "40%",
                      textAlign: "right",
                      paddingRight: "10px",
                      color: "#aaafb5",
                    }}
                  >
                    Color
                  </div>
                  <div
                    style={{
                      width: "60%",
                      textAlign: "left",
                      paddingLeft: "10px",
                      color: "#9ca3af",
                    }}
                  >
                    {modalContent?.color}
                  </div>
                </div>
                <div style={{ display: "flex", marginBottom: 4 }}>
                  <div
                    style={{
                      width: "40%",
                      textAlign: "right",
                      paddingRight: "10px",
                      color: "#aaafb5",
                    }}
                  >
                    Under/Over
                  </div>
                  <div
                    style={{
                      width: "60%",
                      textAlign: "left",
                      paddingLeft: "10px",
                      color: "#9ca3af",
                    }}
                  >
                    {modalContent?.underOver}
                  </div>
                </div>
                <div style={{ display: "flex" }}>
                  <div
                    style={{
                      width: "40%",
                      textAlign: "right",
                      paddingRight: "10px",
                      color: "#aaafb5",
                    }}
                  >
                    Card
                  </div>
                  <div
                    style={{
                      width: "60%",
                      textAlign: "left",
                      paddingLeft: "10px",
                      color: "#9ca3af",
                    }}
                  >
                    {modalContent?.cardDisplay || modalContent?.mainCard}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Bet List - Only show after placing first bet */}
      {hasPlacedBet && (
        <>
          {/* Heading OUTSIDE the card */}
          <div
            style={{
              maxWidth: "375px",
              margin: "16px auto 6px",
              fontWeight: "600",
              color: "#aaafb5",
              fontSize: "13px",
            }}
          >
            MY BETS
          </div>

          {/* Card */}
          <div
            style={{
              maxWidth: "375px",
              marginLeft: "auto",
              marginRight: "auto",
              backgroundColor: "#1a202c",
              borderRadius: "4px",
              overflow: "hidden",
              border: "1px solid #2d3748",
              animation: "fadeIn 0.3s ease-in-out",
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "3fr 1fr 1fr",
                backgroundColor: "#1a6a48",
                color: "#ffffff",
                fontSize: "12px",
                padding: "6px 8px",
                borderBottom: "1px solid #2d3748",
              }}
            >
              <div>Matched Bets</div>
              <div style={{ textAlign: "right" }}>Odds</div>
              <div style={{ textAlign: "right" }}>Stake</div>
            </div>

            {/* Bet Rows */}
            <div
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "#4a5568 #2d3748",
              }}
            >
              {/* Generic Placed Bets - Hide for ODI Teenpatti */}
              {gameType !== "odi_teenpatti" && placedBets.length > 0 ? (
                placedBets.map((bet, index) => (
                  <div
                    key={`${bet.id || index}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "3fr 1fr 1fr",
                      fontSize: "13px",
                      padding: "8px",
                      borderBottom: "1px solid #2d3748",
                      backgroundColor: index % 2 === 0 ? "#1a202c" : "#1f2937",
                      color: "#e2e8f0",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div
                        style={{
                          color: "#ffffff",
                          fontWeight: "500",
                          fontSize: "14px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {bet.market_name.split(" - ").slice(0, 2).join(" - ")} -{" "}
                        <span style={{ fontWeight: "600" }}>
                          {bet.bet_type === "back" ? "Back" : "Lay"}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>{bet.odds}</div>
                    <div style={{ textAlign: "right" }}>{bet.stake}</div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    color: "#a0aec0",
                    padding: "16px 0",
                    fontSize: "13px",
                  }}
                >
                  No bets placed
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default PlacebetAAA2;
