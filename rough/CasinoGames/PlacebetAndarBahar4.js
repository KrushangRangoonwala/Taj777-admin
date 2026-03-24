import React, { useState, useEffect, useRef } from "react";
import {
  placeBetApi,
  placeBetAb4Api,
  isApiSuccess,
  getDefaultParams,
  fetchOpenBetsApi,
  refreshBalanceApi,
  fetchTeenpattiResults,
} from "../../api/api";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import Modal from "react-modal";
import useIsMobile from "../../hooks/useIsMobile";
import { useDispatch } from "react-redux";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Result_AndarBaharJoker from "./results/Result_AndarBaharJoker";



// Helper function to format the bet title dynamically
const formatBetTitle = (teamName, side, denominator) => {
  if (!teamName) return "";
  if (!side) return teamName;

  const formattedSide =
    side.charAt(0).toUpperCase() + side.slice(1).toLowerCase();

  let rank = teamName;
  // If teamName already contains side info (e.g. "Andar A"), extract the rank ("A")
  if (teamName.toLowerCase().includes(side.toLowerCase())) {
    rank = teamName.toLowerCase().replace(side.toLowerCase(), "").trim();
    rank = rank.toUpperCase(); // Ensure "A", "J", etc. are uppercase
  }

  if (!denominator) return `${formattedSide} ${rank}`;

  return `${formattedSide} ${rank}/${denominator}`;
};

const PlaceBet = ({
  betData,
  onSubmit,
  onClose,
  hideResults,
  onOpenBetUpdate,
}) => {
  const [amount, setAmount] = useState("");
  const [profit, setProfit] = useState(0);
  const [lastResults, setLastResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [placedBets, setPlacedBets] = useState([]);

  const [hasPlacedBet, setHasPlacedBet] = useState(false);
  const socketRef = useRef(null);
  const [openBets, setOpenBets] = useState([]);
  const isMobile = useIsMobile();
  const dispatch = useDispatch();

  /* ================= LOAD OPEN BETS ================= */
  const loadOpenBets = async () => {
    try {
      const res = await fetchOpenBetsApi({
        markettype: "AB4",
        eventId: "1",
        curPageName: "live_ab4.php",
      });
      if (res?.open_bet_data && Array.isArray(res.open_bet_data)) {
        setOpenBets(res.open_bet_data);
      } else if (res?.data && Array.isArray(res.data)) {
        setOpenBets(res.data);
      } else if (Array.isArray(res)) {
        setOpenBets(res);
      }

      if (onOpenBetUpdate) {
        onOpenBetUpdate();
      }
    } catch (e) {
      console.error("Error loading open bets:", e);
    }
  };

  useEffect(() => {
    loadOpenBets();
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
    // Establish socket connection for last results
    const socket = io("https://trubet9.bet:2053", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected to socket server with ID:", socket.id);
      console.log("🎮 Joining 'ab4' room...");
      socket.emit("Room", "ab4");
      console.log("📤 Emitting 'ab4' to request data...");
      socket.emit("ab4");
    });

    // Listen for game results
    socket.on("ab4", (data) => {
      console.log("📥 Andar Bahar 4 Game Result Data:", data);

      // Refresh open bets when a round finishes
      setTimeout(() => {
        loadOpenBets();
      }, 2000);

      // Clear local open bets immediately to reflect round end
      setOpenBets([]);
      setPlacedBets([]);

      let results = [];
      if (data && data.data && Array.isArray(data.data)) {
        results = data.data;
      } else if (data && data.res && Array.isArray(data.res)) {
        results = data.res;
      }

      if (results.length > 0) {
        setLastResults(results);
      }
    });

    // Also listen for gameResult as fallback or if used
    socket.on("gameResult", (data) => {
      console.log("📥 Game Result Data (fallback):", data);
      let results = [];
      if (data && data.data && Array.isArray(data.data)) {
        results = data.data;
      } else if (data && data.res && Array.isArray(data.res)) {
        results = data.res;
      }
      if (results.length > 0) {
        setLastResults(results);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const getPlayerName = (result) => {
    // Check both 'result' (new format) and 'win' (old format) properties
    const winCode = result.result || result.win;

    if (winCode === "1") return "A";
    if (winCode === "2") return "B";

    return winCode === "1" ? "A" : winCode === "2" ? "B" : winCode;
  };

  const handleSpanClick = async (item) => {
    try {
      let mid = item.mid || item.event_id || item.roundId;
      mid = mid?.toString().split(".")[1] || mid;

      if (!mid) {
        toast.error("Result ID missing");
        return;
      }

      const midNumber = Number(mid);

      setIsLoading(true);
      const { login_user_id, auth_key } = getDefaultParams();
      // Fetch details with type ab3
      const response = await fetchTeenpattiResults(
        midNumber,
        "ab4",
        1,
        login_user_id,
        auth_key
      );

      if (response && response.length > 0) {
        setModalContent(response[0]);
        setIsModalOpen(true);
      } else {
        toast.error("Details not available");
      }
    } catch (e) {
      console.error("Error fetching Andar Bahar result:", e);
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

      // Required Payload structure
      params.append("eventId", String(betData.eventId).replace(/^\d+\./, ""));
      params.append("eventType", "AB4");
      params.append("marketId", betData.marketId);
      params.append("stack", betAmount);
      params.append("type", isBack ? "Yes" : "No"); // Assuming isBack means 'Yes' (Back)
      params.append("odds", odds);
      params.append("runs", odds);
      params.append("bet_market_type", "AB4");
      params.append("oddsmarketId", betData.marketId);
      params.append("eventManualType", "Auto");
      params.append("market_runner_name", teamName);
      params.append("market_odd_name", "AB4");
      params.append("bet_event_name", "AB4");
      params.append("bet_type", isBack ? "Back" : "Lay");

      // Add default params (is_app, login_user_id, auth_key)
      const defaultParams = getDefaultParams();
      Object.keys(defaultParams).forEach((key) => {
        params.append(key, defaultParams[key]);
      });

      try {
        // Use the new API
        const response = await placeBetAb4Api(params);
        if (isApiSuccess(response)) {
          // Add to local bets list (optional if we reload, but keeps UI snappy)
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

          refreshBalanceApi(dispatch, { curPageName: "live_ab4.php" });

          onSubmit({ ...betData, amount: betAmount, profit });

          // Refresh Open Bets
          setTimeout(() => loadOpenBets(), 500);

          if (onOpenBetUpdate) {
            onOpenBetUpdate();
          }
          handleClear();
        } else {
          toast.error(response?.message || "Failed to place bet");
        }
      } catch (error) {
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
          {!isMobile && (
            <div className="casino-place-bet-title">
              <span>Last Results</span>
            </div>
          )}
          <div className="casino-video-last-results">
            {lastResults && lastResults.length > 0 ? (
              lastResults.slice(0, 10).map((result, index) => (
                <span
                  key={index}
                  className={`result-circle player-${getPlayerName(result)}`}
                  style={{ color: "#FFD700", fontWeight: "bold" }}
                  onClick={() => handleSpanClick(result)}
                >
                  R
                </span>
              ))
            ) : (
              <span className="text-white text-center w-100">No data</span>
            )}
            <a href="/report/casinoresult/ab4" className="result-more">
              ...
            </a>
          </div>
        </div>
      )}

      {betData && !isMobile && (
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
                backgroundColor:
                  betData.side === "ANDAR"
                    ? "#953b3d"
                    : betData.side === "BAHAR"
                      ? "#968226"
                      : betData.isBack
                        ? "#72bbef"
                        : "#f994ba",
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
                      {formatBetTitle(betData.teamName, betData.side, betData.l1)}
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
                {isMobile ? (
                  <></>
                ) : (
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
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE PLACE BET DIALOG OVERRIDE */}
      {betData && isMobile ? (
        <div
          style={{
            backgroundColor:
              betData.side === "ANDAR"
                ? "#953b3d"
                : betData.side === "BAHAR"
                  ? "#968226"
                  : betData.isBack
                    ? "#72bbef"
                    : "#f994ba",
            borderTop: "1px solid #ccc",
            fontFamily: "sans-serif",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#13624e",
              color: "#FFD700",
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
              backgroundColor:
                betData.side === "ANDAR"
                  ? "#953b3d"
                  : betData.side === "BAHAR"
                    ? "#968226"
                    : betData.isBack
                      ? "#72bbef"
                      : "#f994ba",
              fontWeight: "bold",
              fontSize: "14px",
              borderBottom: "1px solid #999",
            }}
          >
            <span>{formatBetTitle(betData.teamName, betData.side, betData.l1)}</span>
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

          {/* Clear & Submit */}
          <div
            style={{
              padding: "5px 10px 15px 10px",
            }}
          >
            <div style={{ textAlign: "right", marginTop: "6px" }}>
              <button
                onClick={handleClear}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#333", // Maintaining dark text for light mobile modal bg
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            </div>
            <div style={{ marginTop: "8px" }}>
              <button
                onClick={handleSubmit}
                disabled={!isValidAmount()}
                style={{
                  width: "100%",
                  backgroundColor: "#3c8b87",
                  color: "white",
                  border: "none",
                  padding: "12px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  borderRadius: "4px",
                  cursor: isValidAmount() ? "pointer" : "not-allowed",
                  opacity: isValidAmount() ? 1 : 0.7,
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Result Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Andar Bahar Result"
        style={{
          content: {
            top: isMobile ? "5%" : "50%",
            left: "50%",
            transform: isMobile ? "translateX(-50%)" : "translate(-50%, -50%)",
            width: isMobile ? "100%" : "600px",
            height: "auto",
            maxHeight: isMobile ? "100vh" : "90vh",
            padding: 0,
            background: "#2e3439",
            border: "none",
            borderRadius: isMobile ? "0" : "4px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            margin: 0,
            inset: isMobile ? "0px auto auto 50%" : "50% auto auto 50%"
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
            background: "#13624e",
            padding: "8px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: "32px",
            borderBottom: "1px solid #1a6a48",
          }}
        >
          <span
            style={{
              color: "#FFD700",
              fontSize: isMobile ? 14 : 17,
              fontWeight: "bold",
              lineHeight: "1",
              textTransform: "uppercase",
            }}
          >
            Andar Bahar 4 Result
          </span>

          <span
            onClick={closeModal}
            style={{
              color: "#fff",
              fontSize: 20,
              lineHeight: "1",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ×
          </span>
        </div>

        {/* SUB HEADER (Round ID/Time) */}
        <div
          style={{
            background: "#2e3439",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            padding: "10px",
            fontSize: isMobile ? 12 : 13,
            color: "#9ca3af",
            gap: isMobile ? "5px" : "0",
          }}
        >
          <span>Round ID: {modalContent?.event_id || modalContent?.mid || "Loading..."}</span>
          <span>Match Time: {modalContent?.time ? new Date(modalContent.time).toLocaleString() : "Loading..."}</span>
        </div>

        {/* BODY (Component) */}
        <div
          style={{
            flex: "1",
            background: "#2e3439",
            overflowY: "auto",
            paddingBottom: "10px"
          }}
        >
          <Result_AndarBaharJoker modalContent={modalContent} />
        </div>
      </Modal>

      {/* MY BETS SECTION */}
      {openBets.length > 0 && !isMobile && (
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
                  key={`${bet.bet_id || index}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "3fr 1fr 1fr",
                    fontSize: "13px",
                    padding: "8px",
                    borderBottom: "1px solid #2d3748",
                    backgroundColor: index % 2 === 0 ? "#1a202c" : "#1f2937",
                    color: "#e2e8f0",
                    borderLeft: `5px solid ${(bet.bet_type || "back").toLowerCase() === "back"
                      ? "#72bbef"
                      : "#f994ba"
                      }`,
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
                  <div style={{ textAlign: "right" }}>
                    {bet.bet_odds || bet.odds}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {bet.bet_stack || bet.stake}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlaceBet;
