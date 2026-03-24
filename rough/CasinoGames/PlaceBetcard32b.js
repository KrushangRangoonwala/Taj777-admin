import React, { useState, useEffect, useRef } from "react";
import {
  placeBetCard32Api,
  isApiSuccess,
  getDefaultParams,
} from "../../api/api";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import Modal from "react-modal";

const PlaceBet = ({ betData, onSubmit, onClose, hideResults }) => {
  const [amount, setAmount] = useState("");
  const [profit, setProfit] = useState(0);
  const [lastResults, setLastResults] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const socketRef = useRef(null);

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
      socket.emit("Room", "teen");
    });

    socket.on("gameResult", (data) => {
      console.log("📥 Received 'gameResult' event in PlaceBet:", data);
      if (data && data.res && Array.isArray(data.res)) {
        setLastResults(data.res);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleSpanClick = (content) => {
    setModalContent(content);
    setIsModalOpen(true);
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

      params.append("eventType", "32CARDS");
      params.append("marketId", betData.marketId);
      params.append("stack", betAmount);
      params.append("type", isBack ? "Yes" : "No");
      params.append("odds", odds);
      params.append("runs", odds);
      params.append("bet_market_type", "32CARDS");
      params.append("oddsmarketId", betData.marketId);
      params.append("eventManualType", "Auto");
      params.append("market_runner_name", teamName);
      params.append("market_odd_name", "32CARDS");
      params.append("bet_event_name", "32CARDS");
      params.append("bet_type", isBack ? "Back" : "Lay");

      // Add default params
      const defaultParams = getDefaultParams();
      Object.keys(defaultParams).forEach((key) => {
        params.append(key, defaultParams[key]);
      });

      try {
        const response = await placeBetCard32Api(params);
        if (isApiSuccess(response)) {
          toast.success(response?.message || "Bet placed successfully!");
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

  return (
    <>
      {!hideResults && (
        <div className="casino-place-bet">
          <div className="casino-place-bet-title">
            <span>Last Results</span>
          </div>
          <div className="casino-video-last-results">
            {lastResults && lastResults.length > 0 ? (
              lastResults.slice(0, 10).map((result, index) => (
                <span
                  key={index}
                  className={result.win === "1" ? "resulta" : "resultb"}
                  onClick={() =>
                    handleSpanClick(result.win === "1" ? "A" : "B")
                  }
                >
                  {result.win === "1" ? "A" : "B"}
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

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Teenpatti Result"
        style={{
          content: {
            top: "34%",
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
            zIndex: 1000,
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
              fontSize: 17,
              lineHeight: "1",
            }}
          >
            Teenpatti 1-day Result
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
            background: "#1f2937",
            padding: "8px 14px",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 13,
            color: "#9ca3af",
          }}
        >
          <span>Round ID: 101251223104029</span>
          <span>Match Time: 23/12/2025 10:40:29 (UTC+05:30)</span>
        </div>

        {/* BODY */}
        <div style={{ padding: "10px 12px 0px", overflowX: "auto" }}>
          <div
            style={{ display: "flex", alignItems: "center", minWidth: "800px" }}
          >
            {/* PLAYER A */}
            <div style={{ width: "30%", textAlign: "center" }}>
              <div
                style={{
                  color: "#9ca3af",
                  fontSize: 26,
                  marginBottom: 8,
                }}
              >
                Player A
              </div>
              <div
                style={{ display: "flex", justifyContent: "center", gap: 6 }}
              >
                <img
                  src="https://wver.sprintstaticdata.com/v69/static/front/img/cards/2SS.png"
                  width="38"
                  alt="2S"
                />
                <img
                  src="https://wver.sprintstaticdata.com/v69/static/front/img/cards/5HH.png"
                  width="38"
                  alt="5H"
                />
                <img
                  src="https://wver.sprintstaticdata.com/v69/static/front/img/cards/9CC.png"
                  width="38"
                  alt="9C"
                />
              </div>
            </div>

            {/* DIVIDER */}
            <div
              style={{
                width: 1,
                height: 90,
                background: "#4b5563",
                margin: "0 18px",
              }}
            />

            {/* PLAYER B */}
            <div style={{ width: "30%", textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <img
                  src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
                  width="36"
                  alt="Winner"
                  style={{ filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))" }}
                />
                <span style={{ color: "#9ca3af", fontSize: 26 }}>Player B</span>
              </div>

              <div
                style={{ display: "flex", justifyContent: "center", gap: 6 }}
              >
                <img
                  src="https://wver.sprintstaticdata.com/v69/static/front/img/cards/4HH.png"
                  width="38"
                  alt="4H"
                />
                <img
                  src="https://wver.sprintstaticdata.com/v69/static/front/img/cards/7HH.png"
                  width="38"
                  alt="7H"
                />
                <img
                  src="https://wver.sprintstaticdata.com/v69/static/front/img/cards/ACC.png"
                  width="38"
                  alt="AC"
                />
              </div>
            </div>

            {/* INFO BOX */}
            <div style={{ width: "40%", paddingLeft: 14 }}>
              <div
                style={{
                  background: "#1f2937",
                  borderRadius: 4,
                  padding: 12,
                  fontSize: 12,
                  color: "#9ca3af",
                }}
              >
                <div style={{ display: "flex", marginBottom: 6 }}>
                  <div
                    style={{ width: 80, textAlign: "right", paddingRight: 8 }}
                  >
                    Winner
                  </div>
                  <div style={{ color: "#fff" }}>Player B</div>
                </div>

                <div style={{ display: "flex", marginBottom: 6 }}>
                  <div
                    style={{ width: 80, textAlign: "right", paddingRight: 8 }}
                  >
                    Odd/Even
                  </div>
                  <div style={{ color: "#fff" }}>Even Even Odd Odd Odd Odd</div>
                </div>

                <div style={{ display: "flex" }}>
                  <div
                    style={{ width: 80, textAlign: "right", paddingRight: 8 }}
                  >
                    Consecutive
                  </div>
                  <div style={{ color: "#fff" }}>A : No | B : No</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PlaceBet;
