import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  placeBetApi,
  isApiSuccess,
  getDefaultParams,
  fetchTeenpattiResults,
  refreshBalanceApi,
  fetchOpenBetsApi,
  fetchCasinoExposureApi,
  placeBetTeen32Api,
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
  };
};

const PlacebetInstantTeenPatti2 = ({
  betData,
  onSubmit,
  onClose,
  hideResults,
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
  const isMobile = useIsMobile();

  const loadOpenBets = useCallback(async () => {
    try {
      const res = await fetchOpenBetsApi({
        markettype: "TEEN32",
        eventId: "1",
        curPageName: "live_instant_teenpatti2.php",
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
  }, [loadOpenBets]);

  const socketRef = useRef({
    socket: null,
    eventData: null,
    lastMid: null,
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

    // Interleaved cards assumption for Instant Teenpatti (like ODI/VIP)
    playerACards = [allCards[0], allCards[2], allCards[4]].filter(Boolean);
    playerBCards = [allCards[1], allCards[3], allCards[5]].filter(Boolean);

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
      oddEven: desc.oddEven.join(" "),
      consecutive: desc.consecutive,
      formatted: true,
    };
  }, []);

  // Handle result data from API or WebSocket
  const handleResultData = useCallback(
    (data) => {
      if (!data) return;

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

        const response = await fetchTeenpattiResults(eventId, "teen32");
        const apiData = response?.data;
        if (!apiData?.cards || apiData.cards === "") return;

        const formattedResult = formatResultData({
          ...apiData,
          cards: apiData.cards,
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
    const socket = io("https://trubet9.bet:2053", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current.socket = socket;

    socket.on("connect", () => {
      console.log("✅ PlaceBet connected to result socket:", socket.id);
      socket.emit("Room", "teen32");
      socket.emit("gameResult");
    });

    socket.on("game", (data) => {
      const mid = data?.t1?.[0]?.mid;
      if (mid && socketRef.current.lastMid !== mid) {
        if (socketRef.current.lastMid) {
          console.log(
            "🔄 Round changed (mid: " + mid + "), requesting gameResult..."
          );
          socket.emit("gameResult");
        }
        socketRef.current.lastMid = mid;
      }
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

      let results = [];
      if (data && data.res && Array.isArray(data.res)) {
        results = data.res;
      } else if (data && data.data && Array.isArray(data.data)) {
        results = data.data;
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

        setLastResults((prev) => {
          if (formattedResults.length >= 5) {
            return formattedResults.slice(0, 10);
          }
          const updated = [...prev, ...formattedResults];
          return updated.slice(-10);
        });
      }
    });

    return () => {
      if (socketRef.current?.socket) {
        socketRef.current.socket.disconnect();
      }
    };
  }, []);

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

      const { login_user_id, auth_key } = getDefaultParams();
      const response = await fetchTeenpattiResults(
        mid,
        "teen32",
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
      const params = new URLSearchParams();
      params.append("eventId", betData.eventId);
      params.append("eventType", "TEEN32");
      params.append("marketId", betData.marketId);
      params.append("stack", betAmount);
      params.append("type", isBack ? "Yes" : "No");
      params.append("odds", odds);
      params.append("runs", odds);
      params.append("bet_market_type", "TEEN32");
      params.append("oddsmarketId", betData.marketId);
      params.append("eventManualType", "Auto");
      params.append("market_runner_name", teamName);
      params.append("market_odd_name", "TEEN32");
      params.append("bet_event_name", "TEEN32");
      params.append("bet_type", isBack ? "Back" : "Lay");

      let eventId = null;
      if (socketRef.current?.eventData?.mid) {
        eventId = socketRef.current.eventData.mid;
      } else if (socketRef.current?.eventData?.event_id) {
        eventId = socketRef.current.eventData.event_id;
      } else if (betData?.roundId) {
        eventId = betData.roundId;
      } else if (betData?.eventId) {
        eventId = betData.eventId;
      } else if (betData?.id) {
        eventId = betData.id;
      }

      if (eventId) {
        params.append("event_id", eventId);
      }

      const socketGameType = "teen32";
      params.append("gtype", socketGameType);

      const defaultParams = getDefaultParams();
      Object.keys(defaultParams).forEach((key) => {
        params.append(key, defaultParams[key]);
      });

      try {
        const response = await placeBetTeen32Api(params);
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

          refreshBalanceApi(dispatch, { curPageName: "live_instant_teenpatti2.php" });
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

  if (betData && isMobile) {
    return (
      <div style={{
        backgroundColor: betData.isBack ? "#72BBEF" : "#f994ba",
        border: "1px solid #005f5f",
        borderRadius: "0",
        fontFamily: "sans-serif",
        maxHeight: "90vh",
        overflowY: "auto"
      }}>
        <div style={{
          backgroundColor: "#13624e",
          color: "#FFD700",
          padding: "8px 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "14px",
          fontWeight: "bold"
        }}>
          <span>Place Bet <span style={{ color: "white", fontSize: "11px", fontWeight: "normal", marginLeft: "5px" }}>Range:{betData.minBet}-{betData.maxBet / 1000}L</span></span>
          <span onClick={onClose} style={{ cursor: "pointer", color: "white", fontSize: "16px" }}>✕</span>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "5px 10px",
          backgroundColor: betData.isBack ? "#72BBEF" : "#f994ba",
          fontWeight: "bold",
          fontSize: "14px",
          borderBottom: "1px solid #999"
        }}>
          <span>{betData.teamName}</span>
          <span>{betData.odds}</span>
        </div>

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
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{
          padding: "10px 10px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px"
        }}>
          {[25, 50, 100, 200, 500, 1000].map(stake => (
            <button
              key={stake}
              onClick={() => handleQuickBet(stake)}
              style={{
                backgroundColor: "#13624e",
                color: "white",
                border: "none",
                padding: "8px",
                fontSize: "13px",
                fontWeight: "bold",
                borderRadius: "2px",
                cursor: "pointer"
              }}
            >
              +{stake}
            </button>
          ))}
        </div>

        <div style={{ textAlign: "right", padding: "5px 10px" }}>
          <button
            onClick={handleClear}
            style={{
              background: "transparent",
              border: "none",
              color: "#333",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            Clear
          </button>
        </div>

        <div style={{ padding: "10px" }}>
          <button
            onClick={handleSubmit}
            disabled={!isValidAmount() || isLoading}
            style={{
              width: "100%",
              backgroundColor: "#3c8b87",
              color: "white",
              border: "none",
              padding: "12px",
              fontSize: "16px",
              fontWeight: "bold",
              borderRadius: "2px",
              cursor: isValidAmount() ? "pointer" : "not-allowed",
              opacity: isValidAmount() ? 1 : 0.7
            }}
          >
            {isLoading ? "Placing..." : "Submit"}
          </button>
        </div>
      </div>
    );
  }

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
                  key={index}
                  className={result.win === "1" ? "resulta" : "resultb"}
                  onClick={(e) => handleSpanClick(index, e)}
                >
                  {result.win === "1" ? "A" : "B"}
                </span>
              ))
            ) : (
              <span className="text-white text-center w-100">
                No results available
              </span>
            )}
            <a href="/report/casinoresult/teen32" className="result-more">
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
                  fontWeight: "600",
                  fontSize: "12px",
                  color: "#aaafb5",
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
      {!isMobile && openBets.length > 0 && (
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
              {openBets.map((bet, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "3fr 1fr 1fr",
                    padding: "6px 8px",
                    fontSize: "12px",
                    color: "#e2e8f0",
                    borderBottom: "1px solid #2d3748",
                    backgroundColor:
                      bet.bet_type?.toLowerCase() === "back"
                        ? "rgba(114, 187, 239, 0.1)"
                        : "rgba(249, 148, 186, 0.1)",
                  }}
                >
                  <div>{bet.market_name || bet.market_runner_name}</div>
                  <div style={{ textAlign: "right" }}>{bet.odds}</div>
                  <div style={{ textAlign: "right" }}>{bet.stake}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlacebetInstantTeenPatti2;
