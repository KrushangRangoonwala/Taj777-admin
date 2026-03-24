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

const RaceTo17ResultModalContent = ({ modalContent, onClose }) => {
  const getCardImage = (cardCode) => {
    if (!cardCode || cardCode === "1") return "/assets/cards_new/1.png";

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
    return `/assets/cards_new/${formattedCode}.png`;
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
        <span>Race to 17 Result</span>
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
          <div>Match Time: {modalContent.matchTime}</div>
        </div>

        {/* Totals Section */}
        <div
          style={{
            marginBottom: "12px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {modalContent.cards.map((card, cIdx) => (
              <img
                key={cIdx}
                src={getCardImage(card)}
                style={{
                  width: "25px",
                  height: "auto",
                  borderRadius: "2px",
                }}
                alt={card}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Remarks Section */}
      {modalContent.remarks && modalContent.remarks.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            fontSize: "13px",
            color: "#aaa",
            padding: "12px 10px",
            backgroundColor: "#333",
            margin: "0 10px 10px 10px",
            borderRadius: "2px",
            border: "1px solid #444",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                minWidth: "120px",
                textAlign: "right",
                marginRight: "10px",
                color: "#787b7e",
              }}
            >
              Race to 17
            </span>
            <span style={{ color: "#aaa" }}>{modalContent.remarks[0]}</span>
          </div>
          {modalContent.remarks[1] && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  minWidth: "120px",
                  textAlign: "right",
                  marginRight: "10px",
                  color: "#787b7e",
                }}
              >
                Big Card
              </span>
              <span style={{ color: "#aaa" }}>
                {modalContent.remarks[1]}
              </span>
            </div>
          )}
          {modalContent.remarks[2] && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  minWidth: "120px",
                  textAlign: "right",
                  marginRight: "10px",
                  color: "#787b7e",
                }}
              >
                Zero Card
              </span>
              <span style={{ color: "#aaa" }}>
                {modalContent.remarks[2]}
              </span>
            </div>
          )}
          {modalContent.remarks[3] && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  minWidth: "120px",
                  textAlign: "right",
                  marginRight: "10px",
                  color: "#787b7e",
                }}
              >
                One Zero Card
              </span>
              <span style={{ color: "#aaa" }}>
                {modalContent.remarks[3]}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PlacebetRaceTo17 = ({
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
        if (potentialCards.length > 0) {
          cards = potentialCards;
        } else if (result.desc && Array.isArray(result.desc)) {
          cards = result.desc.filter((c) => c && c !== "1");
        }
      }
    } catch (e) {
      console.warn("Failed to parse cards for RaceTo17:", e);
    }

    const getRank = (code) => {
      const r = code.replace(/[SHDC]+$/i, "");
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
    let winnerName = result.winner_name || "N/A";

    if (winnerName === "N/A") {
      if (winCode === "1") winnerName = "Race to 17 (Y)";
      else if (winCode === "0") winnerName = "Zero Card (N)";
      else if (winCode === "6") winnerName = "Big Card";
      else if (winCode === "12") winnerName = "Any Zero";
    }

    let remarks = [];
    if (result.desc_remarks || result.desc_remakrs) {
      const rem = result.desc_remarks || result.desc_remakrs;
      remarks = rem.split("#").map((s) => s.trim());
    } else if (
      result.desc &&
      typeof result.desc === "string" &&
      result.desc.includes("#")
    ) {
      remarks = result.desc.split("#").map((s) => s.trim());
    }

    return {
      roundId: formatId(result.mid || result.event_id || "N/A"),
      matchTime: result.time || new Date().toLocaleString() + " (UTC+05:30)",
      winnerName: winnerName === "Tie" ? "RRRRRR" : winnerName,
      win: winCode,
      cards: cards.filter((c) => c && c !== "1"),
      remarks: remarks,
      formatted: true,
    };
  }, []);

  const config = {
    marketType: "RACE17",
    curPageName: "live_race17.php",
    socketRoom: "race17",
    resultApiType: "race17",
    gtype: "race17",
    placeBetUrl: "bet_place_race17.php",
    placeBetParams: {
      eventType: "RACE17",
      marketOddName: "RACE17",
      betEventName: "Race to 17",
      betMarketType: "RACE17",
    },
    modalTitle: "Race to 17 Result",
    shouldClearOpenBetsOnResult: true,
  };

  const getResultTxt = (win) => {
    const winStr = String(win);
    if (winStr === "1") return "Y";
    if (winStr === "0") return "N";
    return win;
  };

  const getColorClass = (win) => {
    const winStr = String(win);
    if (winStr === "1") return "result-y";
    if (winStr === "0") return "result-n";
    return "resultb";
  };

  return (
    <>
      <style>{`
        .ReactModal__Content {
          width: 100% !important;
          max-width: 100vw !important;
          bottom: 0 !important;
          border-radius: 0 !important;
          left: 0 !important;
          right: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          transform: none !important;
        }

        .teen2sidebar {
          display: flex;
          flex-direction: column;
          height: auto;
        }
        .casino-video-last-results {
          height: auto !important;
          background: transparent !important;
          gap: 4px !important;
          padding: 4px !important;
        }
        .casino-video-last-results span, 
        .casino-video-last-results a {
          flex: none !important;
          width: 32px !important;
          height: 32px !important;
          background: #000 !important;
          color: #fdcf13 !important;
          border: none !important;
          border-radius: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-weight: bold !important;
          font-size: 14px !important;
          margin: 0 !important;
        }
        .casino-video-last-results span.result-y {
          color: #fff !important;
        }
        .casino-video-last-results span.result-n {
          color: #ff4d4d !important;
        }
        .casino-video-last-results a {
          color: #fff !important;
        }
        .casino-place-bet-title {
          padding: 4px 8px !important;
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
        ResultModal={RaceTo17ResultModalContent}
        getResultTxt={getResultTxt}
        getColorClass={getColorClass}
        isHeaderInResult={true}
      />
    </>
  );
};

export default PlacebetRaceTo17;
