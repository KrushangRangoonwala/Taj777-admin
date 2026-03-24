import React, { useState, useEffect, useRef } from "react";
import {
  placeBetCard32bApi,
  isApiSuccess,
  getDefaultParams,
  fetchTeenpattiResults,
  fetchOpenBetsApi,
  refreshBalanceApi,
  fetchCasinoExposureApi,
} from "../../api/api";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import Modal from "react-modal";
import useIsMobile from "../../hooks/useIsMobile";
import { useDispatch } from "react-redux";


// Helper function to parse the description string into structured data
// Helper function to parse the description string into structured data
const parseDescription = (desc) => {
  if (!desc) return { winner: "", cards: [], infos: [] };

  // Check for pipe delimiter (new format)
  if (desc.includes("|")) {
    const parts = desc.split("|");
    // Format assumption: Winner | Odd/Even Info | Extra Info | Single | Total

    return {
      winner: parts[0]?.trim() || "",
      cards: [],
      oddEvenStr: parts[1] || "",
      blackRedStr: parts[2] || "",
      single: parts[3] || "-",
      total: parts[4] || "-",
      isPipeFormat: true,
      infos: [],
    };
  }

  // Fallback to old hash format
  const parts = desc.split("#");
  return {
    winner: parts[0]?.trim() || "",
    cards: parts[1]?.split("  ").filter(Boolean) || [],
    infos: parts
      .slice(2)
      .map((p) => p.trim())
      .filter(Boolean),
    isPipeFormat: false,
  };
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
  const [openBets, setOpenBets] = useState([]);
  const isMobile = useIsMobile();
  const socketRef = useRef(null);
  const dispatch = useDispatch();

  const loadOpenBets = async () => {
    try {
      const res = await fetchOpenBetsApi({
        markettype: "32CARDSB",
        eventId: "1",
        curPageName: "live_32_cards.php",
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

  // Format result data for the modal
  const formatResultData = (result) => {
    if (!result) return null;

    // Parse the description
    const desc = parseDescription(result.desc_remakrs || "");

    // Parse cards from the API response (JSON string)
    let cardCodes = [];
    if (result.cards && typeof result.cards === "string") {
      try {
        // result.cards is "[\"JSS\",\"9DD\"...]"
        const parsedCards = JSON.parse(result.cards);
        if (Array.isArray(parsedCards)) {
          cardCodes = parsedCards;
        }
      } catch (e) {
        console.error("Error parsing cards JSON:", e);
      }
    }

    // Fallback if JSON parse failed or missing, try description extraction (old way)
    if (cardCodes.length === 0 && desc.cards.length > 0) {
      cardCodes = desc.cards;
    }

    const winCode = result.result || result.win || result.result_status; // '11' in example? weird.
    // Example says result_status: "11". Usually this means Player 11 won?
    // Code usually 1=Player8, 2=Player9...
    // But result_status "11" might literally mean Player 11.
    // Let's rely on 'desc.winner' ("Player 11") if available.

    const playerIds = [8, 9, 10, 11];
    const players = playerIds.map((id, idx) => {
      // Map card codes: index 0->Player8, 1->Player9, 2->Player10, 3->Player11
      // Example: JSS, 9DD, 10SS, 10CC
      return {
        name: `Player ${id}`,
        score: "-", // Score not explicitly in JSON standard fields, maybe in desc
        cardImage: cardCodes[idx] || "1",
        isWinner:
          desc.winner === `Player ${id}` ||
          winCode === id.toString() ||
          (winCode === "11" && id === 11), // robustness
      };
    });

    // Process specific sections
    let oddEvenData = {}; // {8: Odd, 9: Even...}
    let blackRedVal = ""; // "Red" or "Black" or "No"
    let extraInfo = [];

    if (desc.isPipeFormat) {
      // Odd/Even
      // "8:Odd,9:Odd,10:Even,11:Even"
      if (desc.oddEvenStr) {
        desc.oddEvenStr.split(",").forEach((s) => {
          const p = s.split(":");
          if (p.length === 2) oddEvenData[p[0].trim()] = p[1].trim();
        });
      }

      // Black/Red
      // "Black:No,Red:Yes,2-2:No" -> Find who is Yes? Or just display text?
      if (desc.blackRedStr) {
        const parts = desc.blackRedStr.split(",");
        const yesPart = parts.find((p) => p.toLowerCase().includes("yes"));
        if (yesPart) {
          blackRedVal = yesPart.split(":")[0].trim(); // "Red" from "Red:Yes"
        } else {
          // Fallback if no "Yes" found (e.g. if all No?) or just show raw string?
          // User example showed "Red".
          blackRedVal = desc.blackRedStr;
        }
      }
    } else {
      // Legacy Extra Info Processing
      if (desc.infos && desc.infos.length > 0) {
        desc.infos.forEach((infoStr) => {
          if (!infoStr) return;
          const items = infoStr.split(",").map((i) => {
            const parts = i.split(":");
            if (parts.length === 2) {
              return { label: parts[0].trim(), value: parts[1].trim() };
            }
            return { label: "Info", value: i };
          });
          extraInfo = [...extraInfo, ...items];
        });
      }
    }

    return {
      roundId: result.event_id || result.mid || "N/A",
      matchTime: result.time
        ? new Date(result.time).toLocaleString()
        : new Date().toLocaleString(),
      players: players,
      winner: desc.winner || "Unknown",
      oddEven: null,
      extraInfo: extraInfo,
      oddEvenMap: oddEvenData,
      blackRed: blackRedVal,
      single: desc.single,
      total: desc.total,
      isPipeFormat: desc.isPipeFormat,
      formatted: true,
    };
  };

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
      console.log("✅ PlaceBet connected to result socket:", socket.id);
      // Correct room for 32 cards B (EU)
      socket.emit("Room", "card32eu");
      console.log("📤 Emitting 'gameResult' to request data...");
      socket.emit("gameResult");
    });

    socket.on("gameResult", (data) => {
      console.log("📥 Received 'gameResult' event in PlaceBet:", data);

      // Refresh open bets when a round finishes (result arrives)
      // Small delay to allow backend to settle bets
      setTimeout(() => {
        loadOpenBets();
        // Also refresh exposure if possible, though exposure is handled in Cards32B.js
        // We can just rely on open bets clearing for this requirement.
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

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const getPlayerName = (result) => {
    // Check both 'result' (new format) and 'win' (old format) properties
    const winCode = result.result || result.win;

    // Default mapping for 32 cards (if 1-4 maps to 8-11)
    if (winCode === "1") return "8";
    if (winCode === "2") return "9";
    if (winCode === "3") return "10";
    if (winCode === "4") return "11";

    // Fallback if it's already 8-11 or A/B
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
      // Fetch details with type 32CARDSB
      const response = await fetchTeenpattiResults(
        midNumber,
        "card32eu",
        1,
        login_user_id,
        auth_key
      );

      if (response && response.length > 0 && response[0]) {
        const apiData = response[0];
        console.log("32 Cards API Data:", apiData);
        const formatted = formatResultData(apiData);
        setModalContent(formatted);
        setIsModalOpen(true);
      } else {
        toast.error("Details not available");
      }
    } catch (e) {
      console.error("Error fetching 32 cards result:", e);
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
      params.append("eventId", betData.eventId.replace(/^\d+\./, ""));

      params.append("eventType", "32CARDSB");
      params.append("marketId", betData.marketId);
      params.append("stack", betAmount);
      params.append("type", isBack ? "Yes" : "No");
      params.append("odds", odds);
      params.append("runs", odds);
      params.append("bet_market_type", "32CARDSB");
      params.append("oddsmarketId", betData.marketId);
      params.append("eventManualType", "Auto");
      params.append("market_runner_name", teamName);
      params.append("market_odd_name", "32CARDSB");
      params.append("bet_event_name", "32CARDSB");
      params.append("bet_type", isBack ? "Back" : "Lay");

      // Add default params
      const defaultParams = getDefaultParams();
      Object.keys(defaultParams).forEach((key) => {
        params.append(key, defaultParams[key]);
      });

      try {
        const response = await placeBetCard32bApi(params);
        if (isApiSuccess(response)) {
          // Add to local bets list
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

          // Refresh balance, open bets, and exposure
          const cleanEventId = betData.eventId.replace(/^\d+\./, "");
          const pageName = "live_32_cards.php";

          refreshBalanceApi(dispatch, { curPageName: pageName });

          fetchOpenBetsApi({
            markettype: "32CARDSB",
            eventId: cleanEventId,
            curPageName: pageName,
          }).catch((e) => console.error("Failed to refresh open bets", e));

          // Also reload local open bets state
          setTimeout(() => loadOpenBets(), 500);

          // Exposure refresh via lastBetTime prop now
          // window.dispatchEvent(new CustomEvent("updateExposure"));

          // Reload local open bets
          setTimeout(() => loadOpenBets(), 500);

          if (onSubmit) {
            onSubmit({ ...betData, amount: betAmount, profit });
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
                  {getPlayerName(result)}
                </span>
              ))
            ) : (
              <span className="text-white text-center w-100">No data</span>
            )}
            <a href="/report/casinoresult/teen33" className="result-more">
              ...
            </a>
          </div>
        </div>
      )}



      {!isMobile && betData && (
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
                  <>
                    <div style={{ textAlign: "right", marginTop: "6px" }}>
                      <button
                        onClick={handleClear}
                        style={{
                          background: "transparent",
                          border: "none",
                          fontSize: "12px",
                          cursor: "pointer",
                          color: "#ccc" // Adapted for dark mode context if needed, or stick to #333 if bg is light. 
                          // The container background is #1a202c (dark), so color should be light.
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
                          color: "#fff",
                          border: "none",
                          padding: "12px",
                          fontSize: "16px",
                          fontWeight: "bold",
                          borderRadius: "4px",
                          cursor: isValidAmount() ? "pointer" : "not-allowed",
                          opacity: isValidAmount() ? 1 : 0.6,
                        }}
                      >
                        Submit
                      </button>
                    </div>
                  </>
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

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Teenpatti Result"
        style={{
          content: {
            top: isMobile ? "50px" : "21%", // Adjusted spacing from top
            left: isMobile ? "0" : "50%",
            transform: isMobile ? "none" : "translate(-50%, -50%)",
            width: isMobile ? "100%" : "95%",
            maxWidth: isMobile ? "100%" : "1040px",
            maxHeight: isMobile ? "fit-content" : "173px", // Changed to fit-content for mobile to avoid empty space
            bottom: "auto", // Ensure it doesn't stretch to bottom
            padding: 0,
            background: "#2e3439",
            border: "none",
            borderRadius: isMobile ? "0" : "4px",
            overflow: "hidden",
            paddingBottom: isMobile ? "10px" : "0", // Small padding at bottom
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
            32 Cards B Result
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

        {/* SUB HEADER - Common */}
        <div
          style={{
            background: "#2e3439",
            display: "flex",
            justifyContent: "space-between", // Default for Desktop
            flexDirection: isMobile ? "column" : "row", // Stack on mobile
            padding: "6px 10px",
            fontSize: 13,
            color: "#9ca3af",
            borderBottom: isMobile ? "1px solid #444" : "none",
          }}
        >
          <span>Round ID: {modalContent?.roundId || "Loading..."}</span>
          <span>Match Time: {modalContent?.matchTime || "Loading..."}</span>
        </div>

        {/* BODY */}
        <div
          style={{
            overflowX: isMobile ? "hidden" : "auto",
            background: "#2e3439",
            padding: isMobile ? "10px" : "0",
            maxHeight: isMobile ? "calc(80vh - 80px)" : "auto", // Scrollable body on mobile
            overflowY: isMobile ? "auto" : "hidden",
          }}
        >
          {isMobile ? (
            /* MOBILE VIEW */
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {modalContent?.players?.map((player, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    position: "relative", // For absolute positioning of trophy if needed
                    paddingBottom: "0px",
                  }}
                >
                  {/* Player Name and Score */}
                  <div
                    style={{
                      fontSize: "26px",
                      color: "#9ca3af",
                      fontWeight: "500",
                      marginBottom: "2px",
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      {player.name} -{" "}
                      <span style={{ color: "#FFD700", fontWeight: "bold" }}>
                        {player.score}
                      </span>
                    </span>

                    {/* Trophy on Right if Winner */}
                    {player.isWinner && (
                      <img
                        src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
                        width="40"
                        alt="Winner"
                        style={{
                          filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))",
                        }}
                      />
                    )}
                  </div>

                  {/* Card Image */}
                  <div>
                    {Array.isArray(player.cards) && player.cards.length > 0 ? (
                      player.cards.map((card, i) => (
                        <img
                          key={i}
                          src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${card}.png`}
                          width="30"
                          alt={`Card ${card}`}
                          style={{ marginRight: "5px" }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://wver.sprintstaticdata.com/v69/static/front/img/cards/1.png";
                          }}
                        />
                      ))
                    ) : (
                      <img
                        src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${player.cardImage}.png`}
                        width="22"
                        alt={`Card ${player.cardImage}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://wver.sprintstaticdata.com/v69/static/front/img/cards/1.png";
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}

              {/* Winner Footer for Mobile */}
              <div style={{
                marginTop: "10px",
                backgroundColor: "#444",
                padding: "10px",
                borderRadius: "4px",
                textAlign: "center",
                color: "#aaa",
                fontSize: "14px"
              }}>
                Winner <span style={{ color: "#fff", fontWeight: "bold", marginLeft: "5px" }}>{modalContent?.winner || "Loading..."}</span>
              </div>
            </div>
          ) : (
            /* DESKTOP VIEW */
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                minWidth: "800px",
              }}
            >
              {/* PLAYERS AREA (Left 75%) */}
              <div
                style={{
                  flex: "3",
                  display: "flex",
                  paddingRight: "4px",
                }}
              >
                {modalContent?.players?.map((player, index) => (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      padding: "0 5px",
                    }}
                  >
                    {/* Player Header: Name - Score */}
                    <div
                      style={{
                        fontSize: 20,
                        marginBottom: 8,
                        color: "#9ca3af",
                        fontWeight: "500",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {player.name}{" "}
                      <span style={{ color: "#fbbf24", fontWeight: "bold" }}>
                        - {player.score}
                      </span>
                    </div>

                    {/* Winner Trophy & Cards */}
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        minHeight: "60px",
                      }}
                    >
                      {player.isWinner && (
                        <img
                          src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
                          width="30"
                          alt="Winner"
                          style={{
                            filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))",
                            marginRight: "4px",
                          }}
                        />
                      )}

                      {/* Cards - Handle single or array */}
                      {Array.isArray(player.cards) && player.cards.length > 0 ? (
                        player.cards.map((card, i) => (
                          <img
                            key={i}
                            src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${card}.png`}
                            width="40"
                            alt={`Card ${card}`}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://wver.sprintstaticdata.com/v69/static/front/img/cards/1.png";
                            }}
                          />
                        ))
                      ) : (
                        <img
                          src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${player.cardImage}.png`}
                          width="40"
                          alt={`Card ${player.cardImage}`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://wver.sprintstaticdata.com/v69/static/front/img/cards/1.png";
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* INFO BOX (Right 25%) */}
              <div style={{ flex: "1" }}>
                <div
                  style={{
                    background: "#444444",
                    borderRadius: 4,
                    padding: "10px",
                    fontSize: 14,
                    color: "#AAAFB5",
                    height: "100%",
                  }}
                >
                  {/* Winner */}
                  <div style={{ display: "flex" }}>
                    <div
                      style={{
                        width: 90,
                        textAlign: "right",
                        marginRight: 10,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Winner
                    </div>
                    <div style={{ color: "#AAAFB5" }}>
                      {modalContent?.winner || "Loading..."}
                    </div>
                  </div>

                  {modalContent?.isPipeFormat ? (
                    <>
                      {/* Odd / Even */}
                      <div style={{ display: "flex" }}>
                        <div
                          style={{
                            width: 90,
                            textAlign: "right",
                            marginRight: 10,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Odd/Even
                        </div>
                        <div style={{ color: "#AAAFB5", fontSize: 14 }}>
                          <div>
                            8: {modalContent?.oddEvenMap?.["8"]} | 9:{" "}
                            {modalContent?.oddEvenMap?.["9"]}
                          </div>
                          <div>
                            10: {modalContent?.oddEvenMap?.["10"]} | 11:{" "}
                            {modalContent?.oddEvenMap?.["11"]}
                          </div>
                        </div>
                      </div>

                      {/* Black / Red */}
                      <div style={{ display: "flex" }}>
                        <div
                          style={{
                            width: 90,
                            textAlign: "right",
                            marginRight: 10,
                          }}
                        >
                          Black/Red
                        </div>
                        <div style={{ color: "#AAAFB5" }}>
                          {modalContent?.blackRed}
                        </div>
                      </div>

                      {/* Total */}
                      <div style={{ display: "flex" }}>
                        <div
                          style={{
                            width: 90,
                            textAlign: "right",
                            marginRight: 10,
                          }}
                        >
                          Total
                        </div>
                        <div style={{ color: "#AAAFB5" }}>
                          {modalContent?.total}
                        </div>
                      </div>

                      {/* Single */}
                      <div style={{ display: "flex" }}>
                        <div
                          style={{
                            width: 90,
                            textAlign: "right",
                            marginRight: 10,
                          }}
                        >
                          Single
                        </div>
                        <div style={{ color: "#AAAFB5" }}>
                          {modalContent?.single}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Legacy Odd / Even */}
                      {modalContent?.oddEven && (
                        <div style={{ display: "flex" }}>
                          <div
                            style={{
                              width: 90,
                              textAlign: "right",
                              marginRight: 10,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Odd/Even
                          </div>
                          <div style={{ color: "#AAAFB5" }}>
                            {modalContent?.oddEven}
                          </div>
                        </div>
                      )}

                      {/* Legacy Extra Info */}
                      {modalContent?.extraInfo?.map((info, i) => (
                        <div key={i} style={{ display: "flex" }}>
                          <div
                            style={{
                              width: 90,
                              textAlign: "right",
                              marginRight: 10,
                            }}
                          >
                            {info.label}
                          </div>
                          <div style={{ color: "#AAAFB5" }}>{info.value}</div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

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
                  <div style={{ textAlign: "right" }}>{bet.bet_odds}</div>
                  <div style={{ textAlign: "right" }}>{bet.bet_stack}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bet List - Removed redundant local placedBets in favor of openBets */}
      {/* MOBILE PLACE BET DIALOG OVERRIDE */}
      {betData && isMobile ? (
        <div style={{
          // Removed fixed positioning to allow parent modal control
          backgroundColor: betData.isBack ? "#72BBEF" : "#f994ba",
          borderTop: "1px solid #ccc",
          fontFamily: "sans-serif",
          maxHeight: "90vh",
          overflowY: "auto"
        }}>
          {/* Header */}
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

          {/* Info Row: Selection & Odds */}
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
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* Quick Stakes */}
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
                  backgroundColor: "#13624e", // Green buttons
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

          {/* Clear & Submit */}
          {/* Clear & Submit */}
          <div style={{
            padding: "5px 10px 15px 10px"
          }}>
            <div style={{ textAlign: "right", marginTop: "6px" }}>
              <button
                onClick={handleClear}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#333", // Maintaining dark text for light mobile modal bg
                  fontSize: "12px",
                  cursor: "pointer"
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
                  opacity: isValidAmount() ? 1 : 0.7
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </>
  );
};

export default PlaceBet;
