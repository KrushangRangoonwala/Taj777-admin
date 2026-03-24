import React, { useCallback } from "react";
import PlaceBet_KK from "./components/PlaceBet_KK";
import Rules from "./components/Rules";
import RulesHeader from "./components/RulesHeader";

const ruleList = [
  { label: "Minimum total 10 or queen is required to win.", value: "" },
];

const formatId = (id) => {
  if (!id) return "";
  const strId = String(id);
  return strId.includes(".") ? strId.split(".")[1] : strId;
};

const QueenResultModalContent = ({ modalContent, onClose }) => {
  const getCardImage = (cardCode) => {
    if (!cardCode || cardCode === "1") return "/assets/cards/1.png";

    let formattedCode = cardCode.toUpperCase();
    if (formattedCode.length > 1) {
      const lastChar = formattedCode.slice(-1);
      const secondLastChar = formattedCode.slice(-2, -1);

      if (
        ["S", "H", "D", "C"].includes(lastChar) &&
        lastChar !== secondLastChar
      ) {
        formattedCode = formattedCode + lastChar;
      }
    }
    return `/assets/cards/${formattedCode}.png`;
  };

  if (!modalContent) return null;

  const trophyUrl =
    "https://wver.sprintstaticdata.com/v69/static/front/img/winner.png";

  return (
    <div
      style={{
        backgroundColor: "#2e3439",
        borderRadius: "0",
        overflow: "hidden",
        fontFamily: "sans-serif",
        color: "#ddd",
        width: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#13624e",
          padding: "8px 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#ffc107",
          fontSize: "16px",
        }}
      >
        <span>Queen Res</span>
        <span
          onClick={onClose}
          style={{ color: "white", cursor: "pointer", fontSize: "16px" }}
        >
          ✕
        </span>
      </div>

      <div style={{ padding: "8px 10px" }}>
        {/* Round Info */}
        <div style={{ marginBottom: "8px", fontSize: "11px", color: "#aaa" }}>
          <div>Round ID: {modalContent.roundId} </div>
        </div>
        <div style={{ marginBottom: "8px", fontSize: "11px", color: "#aaa" }}>
          <div>Match Time: {modalContent.matchTime}</div>
        </div>

        {/* Totals Section */}
        {[0, 1, 2, 3].map((num) => {
          const totalObj = modalContent.totals[num];
          const isWinner = modalContent.winnerName === `Total ${num}`;
          const visibleCards = totalObj.cards.filter(
            (c) => c !== "1" && c !== ""
          );

          return (
            <div
              key={num}
              style={{ marginBottom: "8px", position: "relative" }}
            >
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "bold",
                  marginBottom: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#aaa" }}>Total {num} - </span>
                <span style={{ color: "#ffc107", marginLeft: "5px" }}>
                  {totalObj.total}
                </span>

                {isWinner && (
                  <img
                    src={trophyUrl}
                    alt="Winner"
                    style={{
                      height: "60px",
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                )}
              </div>

              <div style={{ display: "flex", gap: "4px" }}>
                {visibleCards.map((card, cIdx) => (
                  <img
                    key={cIdx}
                    src={getCardImage(card)}
                    style={{
                      width: "28px",
                      height: "auto",
                      borderRadius: "1px",
                    }}
                    alt={card}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          backgroundColor: "#3d444b",
          padding: "6px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "12px",
          borderTop: "1px solid #48525a",
        }}
      >
        <span style={{ color: "#aaa" }}>Winner </span>
        <span style={{ color: "#aaa", fontWeight: "bold", marginLeft: "5px" }}>
          {modalContent.winnerName}
        </span>
      </div>
    </div>
  );
};

const PlacebetQueen = ({
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

    let cards = [];
    try {
      if (result.cards) {
        cards =
          typeof result.cards === "string"
            ? JSON.parse(result.cards)
            : result.cards;
      } else {
        const potentialCards = [
          result.C1,
          result.C2,
          result.C3,
          result.C4,
          result.C5,
          result.C6,
          result.C7,
          result.C8,
          result.C9,
          result.C10,
          result.C11,
          result.C12,
        ].filter(Boolean);
        if (potentialCards.length > 0) cards = potentialCards;
      }
    } catch (e) {
      console.warn("Failed to parse cards for Queen:", e);
    }

    const getRank = (code) => {
      const r = code.substring(0, code.length - 2);
      if (r === "A") return 1;
      if (r === "J") return 11;
      if (r === "Q") return 12;
      if (r === "K") return 13;
      return parseInt(r) || 0;
    };

    const totals = [0, 1, 2, 3].map((i) => {
      const playerCards = cards.filter((_, idx) => idx % 4 === i);
      let total = playerCards.reduce((acc, curr) => acc + getRank(curr), 0) + i;

      const hasQueen = playerCards.some((c) => c.startsWith("Q"));
      if (hasQueen) total += 10;

      return { total, cards: playerCards };
    });

    const winCode = String(result.result_status || result.win || result.result);
    let winnerName = "N/A";
    if (winCode === "0") winnerName = "Total 0";
    else if (winCode === "1") winnerName = "Total 1";
    else if (winCode === "2") winnerName = "Total 2";
    else if (winCode === "3") winnerName = "Total 3";

    return {
      roundId: formatId(result.mid || result.event_id || "N/A"),
      matchTime: result.time || new Date().toLocaleString() + " (UTC+05:30)",
      winnerName: winnerName === "Tie" ? "RRRRRR" : winnerName,
      win: result.result,
      cards: cards,
      totals: totals,
      formatted: true,
    };
  }, []);

  const config = {
    marketType: "QUEEN",
    curPageName: "live_queen.php",
    socketRoom: "queen",
    resultApiType: "queen",
    gtype: "queen",
    placeBetUrl: "bet_place_queen.php",
    placeBetParams: {
      eventType: "QUEEN",
      marketOddName: "QUEEN",
      betEventName: "Queen",
      betMarketType: "QUEEN",
    },
    modalTitle: "Queen Result",
    shouldClearOpenBetsOnResult: true,
  };

  const getResultTxt = (win) => {
    const val = parseInt(win);
    return <span style={{ color: "#ffc107" }}>{!isNaN(val) ? val - 1 : win}</span>;
  };

  return (
    <>
      <style jsx global>{`
        .ReactModal__Content {
          width: 100% !important;
          max-width: 100vw !important;
          // top: 20% !important;
          bottom: 0 !important;
          border-radius: 0 !important;
          left: 0 !important;
          right: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          transform: none !important;
        }

        .teen2sidebar {
          display: flex !important;
          flex-direction: column !important;
          height: calc(100vh - 40px) !important;
        }
        /* Push the BetList container to the bottom robustly */
        .teen2sidebar > .mt-2:last-of-type {
          margin-top: auto !important;
          margin-bottom: 10px !important;
        }
      `}</style>
      <PlaceBet_KK
        betData={betData}
        onSubmit={onSubmit}
        onClose={onClose}
        hideResults={hideResults}
        gameType={gameType}
        onOpenBetUpdate={onOpenBetUpdate}
        config={config}
        formatResultFn={formatResultData}
        ResultModal={QueenResultModalContent}
        getResultTxt={getResultTxt}
        isHeaderInResult={true}
        isSuperover={true}
      />
    </>
  );
};

export default PlacebetQueen;
