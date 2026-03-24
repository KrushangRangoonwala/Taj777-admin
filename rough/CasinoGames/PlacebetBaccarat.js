import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  placeBetBaccaratApi,
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
import { useDispatch, useSelector } from "react-redux";
import useIsMobile from "../../hooks/useIsMobile";
import { setIsLoginModalOpen } from "../../store/slices/userSlice";
import Result_Baccarat, { formatResultData } from "./results/Result_Baccarat";


const PlacebetBaccarat = ({
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
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [openBets, setOpenBets] = useState([]);
  const [currentGameData, setCurrentGameData] = useState(null);
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);

  const loadOpenBets = useCallback(async () => {
    try {
      const res = await fetchOpenBetsApi({
        markettype: "BACCARAT",
        eventId: "1",
        curPageName: "live_baccarat.php",
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
  });


  // ... (rest of the component)

  {
    /* INFO BOX (Right 30%) */
  }
  <div style={{ flex: "3", paddingLeft: "15px" }}>
    <div
      style={{
        background: "#444444",
        borderRadius: 4,
        padding: "12px",
        fontSize: 14,
        color: "#AAAFB5",
        height: "100%",
      }}
    >
      <div style={{ display: "flex", marginBottom: "8px" }}>
        <div
          style={{
            width: 100,
            textAlign: "right",
            marginRight: 10,
            whiteSpace: "nowrap",
          }}
        >
          Winner
        </div>
        <div style={{ color: "#72bbef", fontWeight: "bold" }}>
          {modalContent?.winner}
        </div>
      </div>

      <div style={{ display: "flex", marginBottom: "8px" }}>
        <div
          style={{
            width: 100,
            textAlign: "right",
            marginRight: 10,
            whiteSpace: "nowrap",
          }}
        >
          Winner Pair
        </div>
        <div style={{ color: modalContent?.pair === "-" ? "#fff" : "#72bbef" }}>
          {modalContent?.pair}
        </div>
      </div>

      <div style={{ display: "flex", marginBottom: "8px" }}>
        <div
          style={{
            width: 100,
            textAlign: "right",
            marginRight: 10,
            whiteSpace: "nowrap",
          }}
        >
          Perfect
        </div>
        <div style={{ color: "#72bbef" }}>{modalContent?.perfect}</div>
      </div>

      <div style={{ display: "flex", marginBottom: "8px" }}>
        <div
          style={{
            width: 100,
            textAlign: "right",
            marginRight: 10,
            whiteSpace: "nowrap",
          }}
        >
          Either
        </div>
        <div style={{ color: "#72bbef" }}>{modalContent?.either}</div>
      </div>

      <div style={{ display: "flex" }}>
        <div
          style={{
            width: 100,
            textAlign: "right",
            marginRight: 10,
            whiteSpace: "nowrap",
          }}
        >
          Big/Small
        </div>
        <div style={{ color: "#72bbef" }}>{modalContent?.bigSmall}</div>
      </div>
    </div>
  </div>;

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
      socket.emit("Room", "baccarat");
      socket.emit("gameResult");
    });

    socket.on("game", (data) => {
      const targetData = Array.isArray(data) ? data[0] : data;
      if (targetData) {
        setCurrentGameData(targetData);
      }
    });

    socket.on("gameResult", (data) => {
      setOpenBets([]);

      let results = [];
      if (Array.isArray(data)) {
        results = data;
      } else if (data) {
        if (Array.isArray(data.res)) results = data.res;
        else if (Array.isArray(data.data)) results = data.data;
        else if (Array.isArray(data.result)) results = data.result;
      }

      if (results.length > 0) {
        const latestResult = results[0];
        socketRef.current.eventData = {
          ...socketRef.current.eventData,
          mid: (latestResult.mid || latestResult.event_id || "").toString(),
          event_id: (
            latestResult.mid ||
            latestResult.event_id ||
            ""
          ).toString(),
          gtype: latestResult.gtype || "baccarat",
        };

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
      let mid = resultItem.mid || resultItem.event_id || resultItem.roundId;
      if (!mid) return;

      // If mid contains a dot, take the part after the dot
      if (mid.toString().includes(".")) {
        mid = mid.toString().split(".")[1];
      }

      const { login_user_id, auth_key } = getDefaultParams();
      const response = await fetchTeenpattiResults(
        mid,
        "baccarat",
        1,
        login_user_id,
        auth_key
      );
      console.log('@@## response', response);
      if (response && response.length > 0 && response[0]) {
        const apiData = response[0];
        setModalContent(apiData);
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
    if (!betData) return;

    // Authentication check
    const { login_user_id } = getDefaultParams();
    if (!isLoggedIn && !login_user_id) {
      dispatch(setIsLoginModalOpen(true));
      return;
    }

    const betAmount = parseInt(amount);
    const {
      minBet,
      maxBet,
      odds,
      teamName,
      eventId: rawEventId,
      marketId,
      roundId,
    } = betData;

    // Validate bet amount
    if (betAmount < minBet || betAmount > maxBet) return;

    // Utility to get eventId after the decimal point
    const getEventIdAfterDot = (id) => {
      if (!id) return "";
      const idStr = id.toString();
      return idStr.includes(".") ? idStr.split(".")[1] : idStr;
    };

    const params = new URLSearchParams();

    // Use the cleaned eventId for both fields
    const cleanedEventId = getEventIdAfterDot(rawEventId);
    params.append("eventId", cleanedEventId);

    params.append("eventType", "BACCARAT");
    params.append("marketId", marketId);
    params.append("stack", betAmount);
    params.append("type", "Yes");
    params.append("odds", odds);
    params.append("runs", odds);
    params.append("bet_market_type", "BACCARAT");
    params.append("oddsmarketId", marketId);
    params.append("eventManualType", "Auto");
    params.append("market_runner_name", teamName);
    params.append("market_odd_name", "BACCARAT");
    params.append("bet_event_name", "BACCARAT");
    params.append("bet_type", "Back");

    // event_id can come from socketRef, roundId, or raw eventId
    let eventId = socketRef.current?.eventData?.mid || roundId || rawEventId;

    params.append("event_id", getEventIdAfterDot(eventId));

    params.append("gtype", "baccarat");

    // Append default parameters
    const defaultParams = getDefaultParams();
    Object.entries(defaultParams).forEach(([key, value]) => {
      params.append(key, value);
    });

    // Place bet API call
    try {
      setIsLoading(true);
      const response = await placeBetBaccaratApi(params);
      if (isApiSuccess(response)) {
        toast.success(response?.message || "Bet placed successfully!");
        refreshBalanceApi(dispatch, { curPageName: "live_baccarat.php" });

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
      toast.error("Error placing bet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidAmount = () => {
    if (!betData) return false;
    const betAmount = parseInt(amount);

    // Disable if round has changed
    if (currentGameData && betData?.eventId) {
      const currentMid = currentGameData?.t1?.[0]?.mid;
      if (currentMid && betData.eventId.toString() !== currentMid.toString()) {
        return false;
      }
    }

    return amount && betAmount >= betData.minBet && betAmount <= betData.maxBet;
  };

  const isRoundClosed = () => {
    if (!betData || !currentGameData) return false;
    const currentMid = currentGameData?.t1?.[0]?.mid;
    return currentMid && betData.eventId.toString() !== currentMid.toString();
  };


  const getPlayerName = (result) => {
    const winCode = result.result || result.win;

    if (winCode === "1")
      return <span style={{ color: "#fc4242", fontWeight: "bold" }}>P</span>;
    if (winCode === "2")
      return <span style={{ color: "#f1a53d", fontWeight: "bold" }}>B</span>;
    if (winCode === "3")
      return <span style={{ color: "white", fontWeight: "bold" }}>R</span>;

    return <span style={{ color: "white", fontWeight: "bold" }}>R</span>;
  };

  if (betData && isMobile) {
    return (
      <div
        style={{
          backgroundColor: "#72BBEF", // Light blue background
          border: "1px solid #005f5f",
          borderRadius: "0",
          fontFamily: "sans-serif",
          maxHeight: "90vh",
          overflowY: "auto",
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
            backgroundColor: "#72BBEF",
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
            }}
          />
        </div>

        {/* Quick Stakes */}
        {/* <div
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
        </div> */}

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
            disabled={
              !isLoggedIn && !getDefaultParams().login_user_id
                ? false
                : !isValidAmount() || isLoading
            }
            style={{
              width: "100%",
              backgroundColor: "#3c8b87", // Teal submit button
              color: "white",
              border: "none",
              padding: "12px",
              fontSize: "16px",
              fontWeight: "bold",
              borderRadius: "2px",
              cursor:
                isValidAmount() ||
                  (!isLoggedIn && !getDefaultParams().login_user_id)
                  ? "pointer"
                  : "not-allowed",
              opacity:
                isValidAmount() ||
                  (!isLoggedIn && !getDefaultParams().login_user_id)
                  ? 1
                  : 0.7,
            }}
          >
            {!isLoggedIn && !getDefaultParams().login_user_id
              ? "Login"
              : isLoading
                ? "Placing..."
                : isRoundClosed()
                  ? "Round Closed"
                  : "Submit"}
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
            {lastResults && lastResults.length > 0 ? (
              lastResults.slice(0, 10).map((result, index) => (
                <span
                  key={index}
                  className={`result-circle player-${getPlayerName(result)}`}
                  style={{ color: "#FFD700", fontWeight: "bold" }}
                  onClick={(e) => handleSpanClick(index, e)}
                >
                  {getPlayerName(result)}
                </span>
              ))
            ) : (
              <span className="text-white text-center w-100">No data</span>
            )}
            <a href="/report/casinoresult/baccarat" className="result-more">
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
                backgroundColor: "#72bbef",
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
                      {`${betData.teamName} - Back`}
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
                    disabled={
                      !isLoggedIn && !getDefaultParams().login_user_id
                        ? false
                        : !isValidAmount() || isLoading
                    }
                    style={{
                      backgroundColor: "#3c8b87",
                      color: "#fff",
                      width: "110px",
                      border: "none",
                      padding: "0px",
                      fontSize: "18px",
                      marginLeft: "auto",
                      cursor:
                        isValidAmount() ||
                          (!isLoggedIn && !getDefaultParams().login_user_id)
                          ? "pointer"
                          : "not-allowed",
                      opacity:
                        isValidAmount() ||
                          (!isLoggedIn && !getDefaultParams().login_user_id)
                          ? 1
                          : 0.6,
                    }}
                  >
                    {!isLoggedIn && !getDefaultParams().login_user_id
                      ? "Login"
                      : isLoading
                        ? "Placing..."
                        : isRoundClosed()
                          ? "Round Closed"
                          : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {openBets.length > 0 && (
        <div className="mt-2" style={{ paddingBottom: "10px" }}>
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
              margin: "0 auto",
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
                fontWeight: "600",
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
                    borderLeft: "5px solid #72bbef",
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

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            top: isMobile ? "50px" : "24%",
            left: isMobile ? "0" : "50%",
            right: isMobile ? "0" : "auto",
            transform: isMobile ? "none" : "translate(-50%, -50%)",
            width: isMobile ? "100%" : "95%",
            maxWidth: isMobile ? "100%" : "1040px",
            maxHeight: isMobile ? "36vh" : "230px",
            padding: 0,
            background: "#2e3439",
            border: "none",
            borderRadius: isMobile ? "0" : "4px",
            overflow: "hidden",
          },
          overlay: { backgroundColor: "rgba(0,0,0,0.85)", zIndex: 9999 },
        }}
      >
        <Result_Baccarat
          apiResponse={modalContent}
          isMobile={isMobile}
          closeModal={closeModal}
        />
      </Modal>
    </>
  );
};

export default PlacebetBaccarat;
