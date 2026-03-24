import React, { useCallback } from "react";
import PlaceBet_KK from "./components/PlaceBet_KK";

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

const BollywoodResultModalContent = ({ modalContent, onClose }) => {
  const isMobile = window.innerWidth <= 768; // simple check or use hook if available

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        backgroundColor: "#2e3439",
        borderRadius: "4px",
        overflow: "hidden",
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
            fontSize: 15,
            lineHeight: "1",
          }}
        >
          Bollywood Casino 2 Result
        </span>

        <span
          onClick={onClose}
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
          display: "flex",
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
            flexDirection: isMobile ? "column" : "row",
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
                src={`/assets/cards_new/${modalContent.mainCard}.png`}
                width={isMobile ? "25" : "50"}
                alt={modalContent.mainCard}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/cards_new/1.png";
                }}
              />
            ) : (
              <img
                src="/assets/cards_new/1.png"
                width={isMobile ? "60" : "50"}
                alt="Back"
              />
            )}
          </div>

          {/* INFO BOX */}
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
    </div>
  );
};

const PlacebetBollywoodCasino2 = ({
  betData,
  onSubmit,
  onClose,
  hideResults,
  gameType,
  onOpenBetUpdate,
}) => {
  const formatResultData = useCallback((result) => {
    if (!result) return null;
    if (result.formatted) return result;

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
      finalOddEven = Array.isArray(desc.oddEven)
        ? desc.oddEven.join(" ")
        : desc.oddEven || "N/A";
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
      cards: allCards,
      formatted: true,
    };
  }, []);

  const config = {
    marketType: "B_TABLE2",
    curPageName: "live_btable2.php",
    socketRoom: "btable2",
    resultApiType: "btable2",
    placeBetUrl: "bet_place_btable2.php",
    placeBetParams: {
      eventType: "B_TABLE2",
      marketOddName: "B_TABLE2",
      betEventName: "B_TABLE2",
      betMarketType: "B_TABLE2",
    },
    modalTitle: "Bollywood Casino 2 Result",
    shouldClearOpenBetsOnResult: true,
  };

  const getResultTxt = (win) => {
    if (win === "1" || win === "A") return "A";
    if (win === "2" || win === "B") return "B";
    if (win === "3" || win === "C") return "C";
    if (win === "4" || win === "D") return "D";
    if (win === "5" || win === "E") return "E";
    if (win === "6" || win === "F") return "F";
    return win;
  };

  const getColorClass = (win) => {
    return "resultb";
  };

  return (
    <PlaceBet_KK
      betData={betData}
      onSubmit={onSubmit}
      onClose={onClose}
      hideResults={hideResults}
      gameType={gameType}
      onOpenBetUpdate={onOpenBetUpdate}
      config={config}
      formatResultFn={formatResultData}
      ResultModal={BollywoodResultModalContent}
      getResultTxt={getResultTxt}
      getColorClass={getColorClass}
      isHeaderInResult={true}
    />
  );
};

export default PlacebetBollywoodCasino2;
