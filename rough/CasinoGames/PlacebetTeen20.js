import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  placeBetTeen20Api,
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
import useIsMobile from "../../hooks/useIsMobile";
import { useDispatch } from "react-redux";

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

const PlacebetTeen20 = ({
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
  const [placedBets, setPlacedBets] = useState([]);
  const [hasPlacedBet, setHasPlacedBet] = useState(false);
  const [openBets, setOpenBets] = useState([]);
  const isMobile = useIsMobile();
  const dispatch = useDispatch();

  const loadOpenBets = useCallback(async () => {
    try {
      const res = await fetchOpenBetsApi({
        markettype: "2020TEENPATTI",
        eventId: "1",
        curPageName: "live_teenpattit20.php",
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
    // 20-20 Teenpatti have interleaved cards: A, B, A, B, A, B
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
      console.log("✅ PlacebetTeen20 connected to result socket:", socket.id);
      socket.emit("Room", "teen20");
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
          gtype: latestResult.gtype || "teen",
        };
      }

      let results = [];
      if (data && data.res && Array.isArray(data.res)) {
        results = data.res;
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
      const response = await fetchTeenpattiResults(
        mid,
        resultItem.gtype || "teen20",
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
    const betAmount = parseInt(amount);
    if (!betData) return;
    const { minBet, maxBet, odds, isBack, teamName } = betData;

    if (betAmount >= minBet && betAmount <= maxBet) {
      const params = new URLSearchParams();
      params.append("eventId", betData.eventId);
      params.append("eventType", "2020TEENPATTI");
      params.append("marketId", betData.marketId);
      params.append("stack", betAmount);
      params.append("type", "Yes");
      params.append("odds", odds);
      params.append("runs", odds);
      params.append("bet_market_type", "2020TEENPATTI");
      params.append("oddsmarketId", betData.marketId);
      params.append("eventManualType", "Auto");
      params.append("market_runner_name", teamName);
      params.append("market_odd_name", "2020TEENPATTI");
      params.append("bet_event_name", "2020TEENPATTI");
      params.append("bet_type", "Back");

      let eventId =
        socketRef.current?.eventData?.mid ||
        betData?.roundId ||
        betData?.eventId;
      if (eventId) {
        params.append("event_id", eventId);
      }

      params.append("gtype", "teen20");

      const defaultParams = getDefaultParams();
      Object.keys(defaultParams).forEach((key) => {
        params.append(key, defaultParams[key]);
      });

      try {
        const response = await placeBetTeen20Api(params);
        if (isApiSuccess(response)) {
          toast.success(response?.message || "Bet placed successfully!");
          refreshBalanceApi(dispatch, { curPageName: "live_teenpattit20.php" });
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
          {!isMobile && (
            <div className="casino-place-bet-title">
              <span>Last Results</span>
            </div>
          )}
          <div className="casino-video-last-results">
            {lastResults && lastResults.length > 0 ? (
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
                Loading results...
              </span>
            )}
            <a href="/report/casinoresult/teen33" className="result-more">
              ...
            </a>
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
              backgroundColor: "#2e3439",
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
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {openBets.map((bet, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "3fr 1fr 1fr",
                    fontSize: "13px",
                    padding: "8px",
                    borderBottom: "1px solid #4b5563",
                    backgroundColor: "#2e3439",
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

      <div className="mt-2">
        <div
          style={{
            maxWidth: "375px",
            margin: "16px auto 6px",
            fontWeight: "750",
            color: "#aaafb5",
            fontSize: "14px",
          }}
        >
          RULES
        </div>
        <div
          style={{
            maxWidth: "375px",
            marginLeft: "auto",
            marginRight: "auto",
            backgroundColor: "#2e3439",
            borderRadius: "4px",
            overflow: "hidden",
            border: "1px solid #2d3748",
          }}
        >
          <div
            style={{
              backgroundColor: "#1a6a48",
              color: "#ffffff",
              fontSize: "14px",
              padding: "5.5px",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            Pair Plus
          </div>
          <div>
            {[
              { label: "Pair", value: "1 TO 1" },
              { label: "Flush", value: "1 TO 4" },
              { label: "Straight", value: "1 TO 6" },
              { label: "Trio", value: "1 TO 30" },
              { label: "Straight Flush", value: "1 TO 40" },
            ].map((rule, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  padding: "8px 12px",
                  borderBottom: index === 4 ? "none" : "1px solid #4b5563",
                  backgroundColor: "#2e3439",
                  color: "#a4a8ae",
                }}
              >
                <span>{rule.label}</span>
                <span
                  style={{
                    fontWeight: "300",
                    width: "200px",
                    display: "inline-block",
                    textAlign: "left",
                    paddingLeft: "40px",
                  }}
                >
                  {rule.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>
        {`
          @media only screen and (min-width: 320px) and (max-width: 1279px) {
            .modal-body {
              padding: 8px 6px;
            }

            .modal-sm {
              max-width: 388px;
              width: 100%;
              margin-left: auto;
              margin-right: auto;
            }

            .modal {
              top: 50px;
            }

            .modal-content {
              max-height: calc(100vh - 108px);
            }

            #betSodaModal .modal-body {
              min-height: calc(100vh - 140px);
            }

            .modal-header {
              padding: 8px;
            }

            .modal-title {
              font-size: var(--font-caption);
            }

            .modal-title .casino-min-max {
              color: var(--text-highlight);
            }

            .modal-body {
              max-height: calc(100vh - 40px);
            }

            .modal.home-modal {
              top: 0;
            }

            .modal-login-new .form-group.regi-uname {
              order: 1;
            }

            .modal-login-new .form-group.regi-curr {
              order: 4;
            }

            .modal-login-new .form-group.regi-pass {
              order: 2;
            }

            .modal-login-new .form-group.regi-cpass {
              order: 3;
            }

            .modal-login-new .form-group.regi-mob {
              order: 5;
            }

            .modal-login-new .form-group.regi-refc {
              order: 6;
            }
          }
        `}
      </style>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
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
            Teenpatti 20-20 C Result
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
        <div
          style={{
            overflowX: isMobile ? "hidden" : "auto",
            background: "#2e3439",
            padding: isMobile ? "10px" : "0",
            maxHeight: isMobile ? "calc(80vh - 80px)" : "auto", // Scrollable body on mobile
            overflowY: isMobile ? "auto" : "hidden",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", minWidth: "800px" }}
          >
            {/* PLAYERS AREA (Left 70%) */}
            <div style={{ flex: "7", display: "flex", alignItems: "center" }}>
              <div style={{ flex: 1, textAlign: "center" }}>
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
                  {modalContent?.playerA?.isWinner && (
                    <img
                      src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
                      width="24"
                      alt="Winner"
                    />
                  )}
                </div>
                <div
                  style={{ display: "flex", justifyContent: "center", gap: 6 }}
                >
                  {modalContent?.playerA?.cards?.map((card, index) => (
                    <img
                      key={index}
                      src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${card}.png`}
                      width="38"
                      alt={card}
                    />
                  ))}
                </div>
              </div>

              <div
                style={{
                  width: 1,
                  height: 90,
                  background: "#4b5563",
                  margin: "0 18px",
                }}
              />

              <div style={{ flex: 1, textAlign: "center" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  {modalContent?.playerB?.isWinner && (
                    <img
                      src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
                      width="36"
                      alt="Winner"
                    />
                  )}
                  <span
                    style={{
                      color: modalContent?.playerB?.isWinner
                        ? "#fff"
                        : "#9ca3af",
                      fontSize: 26,
                    }}
                  >
                    {modalContent?.playerB?.name || "Player B"}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "center", gap: 6 }}
                >
                  {modalContent?.playerB?.cards?.map((card, index) => (
                    <img
                      key={index}
                      src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${card}.png`}
                      width="38"
                      alt={card}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* INFO BOX (Right 30%) */}
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
                      width: 90,
                      textAlign: "right",
                      marginRight: 10,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Winner
                  </div>
                  <div style={{ color: "#fff", fontWeight: "bold" }}>
                    {modalContent?.winner}
                  </div>
                </div>

                {modalContent?.baccarat && (
                  <div style={{ display: "flex", marginBottom: "8px" }}>
                    <div
                      style={{
                        width: 90,
                        textAlign: "right",
                        marginRight: 10,
                        whiteSpace: "nowrap",
                      }}
                    >
                      3 Baccarat
                    </div>
                    <div style={{ color: "#fff" }}>
                      <div>{modalContent.baccarat.split("~")[0]}</div>
                      {modalContent.baccarat.split("~")[1] && (
                        <div style={{ fontSize: "12px", color: "#AAAFB5" }}>
                          {modalContent.baccarat.split("~")[1]}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {modalContent?.total && (
                  <div style={{ display: "flex", marginBottom: "8px" }}>
                    <div
                      style={{
                        width: 90,
                        textAlign: "right",
                        marginRight: 10,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Total
                    </div>
                    <div style={{ color: "#fff" }}>{modalContent?.total}</div>
                  </div>
                )}

                {modalContent?.pairPlus && (
                  <div style={{ display: "flex", marginBottom: "8px" }}>
                    <div
                      style={{
                        width: 90,
                        textAlign: "right",
                        marginRight: 10,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Pair Plus
                    </div>
                    <div style={{ color: "#fff" }}>
                      {modalContent?.pairPlus}
                    </div>
                  </div>
                )}

                {modalContent?.redBlack && (
                  <div style={{ display: "flex" }}>
                    <div
                      style={{
                        width: 90,
                        textAlign: "right",
                        marginRight: 10,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Red Black
                    </div>
                    <div style={{ color: "#fff" }}>
                      {modalContent?.redBlack}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PlacebetTeen20;
