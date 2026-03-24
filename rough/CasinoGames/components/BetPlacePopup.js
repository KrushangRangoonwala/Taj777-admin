import React from "react";
import useIsMobile from "../../../hooks/useIsMobile";
import { getAndarBaharPopupBgColor } from "../../../utilies/helpers";
import { useGamePathName } from "../../../hooks/useGetFileData";

const diffBgColorGames = ["andarbahar1", "andarbahar3", "ab4"];

// Helper function to format bet titles for Andar Bahar 2
const formatBetTitle = (teamName, marketId, pathName) => {
  // Only apply custom formatting for andarbahar2
  if (pathName === "andarbahar2") {
    if (!teamName) return "";

    // Handle SA/SB (sid 1 and 4)
    if (marketId === "1") return "SA";
    if (marketId === "4") return "SB";

    // Handle First Bet (sid 2 for A, sid 5 for B)
    if (marketId === "2" || marketId === "5") return "1st Bet";

    // Handle Second Bet (sid 3 for A, sid 6 for B)
    if (marketId === "3" || marketId === "6") return "2nd Bet";

    // For all other bets (Joker cards, suits, odd/even), return the teamName as is
    return teamName;
  }

  if (pathName === "teenpattioneday62" || pathName === "teen62") {
    if (marketId === "1" && teamName === "Player A") return "Player A Main";
    if (marketId === "2" && teamName === "Player B") return "Player B Main";
    if (teamName && teamName.includes("Card")) {
      return teamName.replace("-", "");
    }
  }

  return teamName;
};

const BetPlacePopup = ({
  isMobile,
  betData,
  amount,
  setAmount,
  onClose,
  handleQuickBet,
  handleClear,
  handleSubmit,
  isLoading,
}) => {
  const pathName = useGamePathName();
  const isTab = useIsMobile(768);
  console.log("$$$ betData", betData);
  if (!betData) return null;

  const isValidAmount = () => {
    if (!betData) return false;
    const betAmount = parseInt(amount);
    return amount && betAmount >= betData.minBet && betAmount <= betData.maxBet;
  };

  const isDiffColor = diffBgColorGames.includes(pathName);
  const bgColor = getAndarBaharPopupBgColor(betData.isBack, isDiffColor ? betData.side : "");

  return isMobile ? (
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
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
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
        <span>{formatBetTitle(betData.teamName, betData.marketId, pathName)}</span>
        {!betData.hideOdds && <span>{betData.odds}</span>}
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
            disabled={!isValidAmount() || isLoading}
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
            {isLoading ? "Placing..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="mt-2">
      {/* Header */}
      <div
        style={{
          maxWidth: "375px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 600,
          color: "#fff",
          fontSize: "13px",
          background: "#232b33",
          padding: "8px 10px",
          borderTopLeftRadius: "4px",
          borderTopRightRadius: "4px",
        }}
      >
        <span>PLACE BET</span>

        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            style={{
              fontWeight: 600,
              fontSize: "12px",
              color: "#aaafb5",
              marginLeft: "4px",
            }}
          >
            Range: {betData.minBet}-{betData.maxBet / 1000}K
          </span>

          {onClose && (
            <span
              onClick={onClose}
              style={{
                marginLeft: "15px",
                cursor: "pointer",
                color: "#fff",
                fontSize: "20px",
                lineHeight: 1,
                fontWeight: "bold",
                padding: "0 5px",
              }}
            >
              ✕
            </span>
          )}
        </div>
      </div>

      {/* Bet Table */}
      <div
        style={{
          backgroundColor: "#1a202c",
          borderBottomLeftRadius: "4px",
          borderBottomRightRadius: "4px",
          maxWidth: "375px",
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        <div style={{ backgroundColor: bgColor }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                    fontWeight: 400,
                  }}
                >
                  (Bet For)
                </th>
                <th
                  style={{
                    padding: "6px",
                    textAlign: "center",
                    fontSize: "14px",
                    fontWeight: 400,
                  }}
                >
                  Odds
                </th>
                <th
                  style={{
                    padding: "6px",
                    textAlign: "center",
                    fontSize: "14px",
                    fontWeight: 400,
                  }}
                >
                  Stake
                </th>
                <th
                  style={{
                    padding: "6px",
                    textAlign: "right",
                    fontSize: "14px",
                    fontWeight: 400,
                  }}
                >
                  Profit
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  style={{ padding: "6px", fontSize: "14px", fontWeight: 500 }}
                >
                  {/* {`${betData.teamName} - ${betData.isBack ? "Back" : "Lay"}`} */}
                  {formatBetTitle(betData.teamName, betData.marketId, pathName)}
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
                    fontWeight: 500,
                  }}
                >
                  {Math.floor(betData.odds * amount - amount)}{" "}
                  {/* Or use your profit calculation */}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Quick Bet Buttons */}
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
                    border: "1px solid #145037",
                    padding: "6px",
                    fontSize: "16px",
                    fontWeight: "bold",
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
                  color: "#000",
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
                  borderRadius: "4px",
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
                  borderRadius: "4px",
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetPlacePopup;
