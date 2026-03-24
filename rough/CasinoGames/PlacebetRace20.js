import React, { useCallback } from "react";
import PlaceBet_KK from "./components/PlaceBet_KK";

const formatId = (id) => {
  if (!id) return "";
  const strId = String(id);
  return strId.includes(".") ? strId.split(".")[1] : strId;
};

const RACE_20ResultModalContent = ({ modalContent, onClose }) => {
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

  const trophyUrl = "https://wver.sprintstaticdata.com/v69/static/front/img/winner.png";
  const suits = ["S", "H", "C", "D"];
  const suitNames = { S: "spade", H: "heart", C: "club", D: "diamond" };

  const groupedCards = suits.map(suit => {
    return (modalContent.cards || []).filter(card => card.endsWith(suit + suit));
  });

  // Winning card is the one matching result_status (1:S, 2:H, 3:C, 4:D)
  const winningSuitIndex = parseInt(modalContent.win) - 1;
  const winnerCard = groupedCards[winningSuitIndex]?.[groupedCards[winningSuitIndex].length - 1];

  return (
    <div
      style={{
        backgroundColor: "#2e3439",
        borderRadius: "0",
        overflow: "hidden",
        fontFamily: "sans-serif",
        color: "#ddd",
        width: "100%",
        paddingBottom: "10px"
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
          fontWeight: "bold"
        }}
      >
        <span>Race 20 Result</span>
        <span
          onClick={onClose}
          style={{ color: "white", cursor: "pointer", fontSize: "16px" }}
        >
          ✕
        </span>
      </div>

      <div style={{ padding: "12px 10px" }}>
        {/* Round Info */}
        <div style={{ marginBottom: "15px", fontSize: "13px", color: "#ccc" }}>
          <div style={{ marginBottom: "4px" }}>Round ID: {modalContent.roundId}</div>
          <div>Match Time: {modalContent.matchTime}</div>
        </div>

        {/* Main Section - Grid for perfect alignment */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "30px auto 35px auto", // "auto" for col 2 to keep it compact (left-aligned)
          gap: "8px 10px",
          marginBottom: "20px",
          alignItems: "center"
        }}>
          {suits.map((suit, index) => (
            <React.Fragment key={suit}>
              {/* Col 1: Suit Icon */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <img src={`/assets/cards_new/${suitNames[suit]}.png`} alt={suit} style={{ width: "24px" }} />
              </div>

              {/* Col 2: Card Row */}
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", minHeight: "45px", alignItems: "center", minWidth: "160px" }}>
                {(groupedCards[index] || []).length > 0 ? groupedCards[index].map((card, cIdx) => (
                  <img key={cIdx} src={getCardImage(card)} alt={card} style={{ width: "35px", background: "#fff", padding: "1px", borderRadius: "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.6)" }} />
                )) : (
                  <div style={{ width: "35px", height: "45px" }}></div>
                )}
              </div>

              {/* Col 3: Vertical WINNER strip (Spans all rows) */}
              {index === 0 && (
                <div className="video-winner-text" style={{
                  gridRow: "1 / 5",
                  gridColumn: "3",
                  height: "100%", // Covers whole height
                }}>
                  <div>W</div>
                  <div>I</div>
                  <div>N</div>
                  <div>N</div>
                  <div>E</div>
                  <div>R</div>
                </div>
              )}

              {/* Col 4: Winner Detail (Only on the winning row) */}
              <div style={{ gridColumn: "4", gridRow: index + 1 }}>
                {index === winningSuitIndex && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingRight: "10px" }}>
                    {winnerCard && (
                      <img src={getCardImage(winnerCard)} alt="Winner" style={{ width: "35px", background: "#fff", padding: "1px", borderRadius: "2px", boxShadow: "0 4px 8px rgba(0,0,0,0.7)" }} />
                    )}
                    <img src={trophyUrl} alt="Trophy" style={{ width: "35px" }} />
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Summary Box */}


        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          fontSize: "13px",
          color: "#aaa",
          padding: "12px 10px",
          backgroundColor: "#232a2f",
          margin: "0 10px 10px 10px",
          borderRadius: "2px",
          border: "1px solid #444",
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{
              minWidth: "120px",
              textAlign: "right",
              marginRight: "10px",
              color: "#787b7e"
            }}>Winner</span>
            <span style={{ color: "#aaa" }}>{modalContent.winnerName}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{
              minWidth: "120px",
              textAlign: "right",
              marginRight: "10px",
              color: "#787b7e"
            }}>Points</span>
            <span style={{ color: "#aaa" }}>{modalContent.totalPoints}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{
              minWidth: "120px",
              textAlign: "right",
              marginRight: "10px",
              color: "#787b7e"
            }}>Cards</span>
            <span style={{ color: "#aaa" }}>{modalContent.totalCards}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlacebetRACE_20 = ({
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
      if (result.desc) {
        cards = result.desc.split(",").filter(c => c && c !== "1");
      } else if (result.cards) {
        cards = typeof result.cards === "string" ? JSON.parse(result.cards) : result.cards;
      }
    } catch (e) {
      console.warn("Failed to parse cards for RACE_20:", e);
    }

    const getRankValue = (card) => {
      if (!card || card === "1") return 0;
      const r = card.replace(/[SHDC]+$/i, "");
      if (r === "A") return 1;
      if (r === "J") return 11;
      if (r === "Q") return 12;
      if (r === "K") return 13;
      return parseInt(r) || 0;
    };

    let totalPoints = cards.reduce((sum, card) => sum + getRankValue(card), 0);
    let totalCardsCount = cards.length;

    const winCode = String(result.result_status || result.win || result.result);
    let winnerName = result.winner_name || "N/A";

    let remarks = [];
    const rem = result.desc_remarks || result.desc_remakrs;
    if (rem) {
      remarks = rem.split("#").map((s) => s.trim());
      if (remarks.length >= 3) {
        winnerName = remarks[0];
        totalPoints = remarks[1];
        totalCardsCount = remarks[2];
      }
    }

    return {
      roundId: formatId(result.mid || result.event_id || "N/A"),
      matchTime: result.time || new Date().toLocaleString() + " (UTC+05:30)",
      winnerName: winnerName === "Tie" ? "RRRRRR" : winnerName,
      win: winCode,
      cards: cards,
      totalPoints: totalPoints,
      totalCards: totalCardsCount,
      remarks: remarks,
      formatted: true,
    };
  }, []);

  const config = {
    marketType: "RACE_20",
    curPageName: "live_RACE_20.php",
    socketRoom: "RACE_20",
    resultApiType: "RACE_20",
    gtype: "RACE_20",
    placeBetUrl: "bet_place_RACE_20.php",
    placeBetParams: {
      eventType: "RACE_20",
      marketOddName: "RACE_20",
      betEventName: "Race 20",
      betMarketType: "RACE_20",
    },
    modalTitle: "Race 20 Result",
    shouldClearOpenBetsOnResult: true,
  };

  const getResultTxt = (win) => {
    const suitMap = {
      "1": "spade",
      "2": "heart",
      "3": "club",
      "4": "diamond",
    };

    if (suitMap[win]) {
      return (
        <img
          src={`/assets/cards_new/${suitMap[win]}.png`}
          alt={suitMap[win]}
          style={{ width: "24px", height: "auto" }}
        />
      );
    }
    return win;
  };

  const getColorClass = (win) => {
    return "result-black";
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
        .casino-video-last-results span.result-black, 
        .casino-video-last-results a.result-black {
          flex: none !important;
          width: 30px !important;
          height: 30px !important;
          line-height: 30px !important;
          background-color: transparent !important;
          box-shadow: 0 0 0px #646464 !important;
          color: #fdcf13 !important;
          border: none !important;
          border-radius: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-weight: bold !important;
          font-size: 14px !important;
          margin-right: 2px !important;
          margin-left: 0 !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }
        }
        .casino-video-last-results a {
          color: #fff !important;
        }
        .casino-place-bet-title {
          padding: 4px 8px !important;
        }
        .video-winner-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          background: #1e2327;
          border: 1px solid #aaa;
          color: #fff;
          font-size: 16px;
          border-radius: 2px;
          width: 32px;
          padding: 10px 0;
        }
        .video-winner-text div {
          width: 100%;
          text-align: center;
          font-weight: bold;
          line-height: normal;
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
        ResultModal={RACE_20ResultModalContent}
        getResultTxt={getResultTxt}
        getColorClass={getColorClass}
        isHeaderInResult={true}
      />
    </>
  );
};

export default PlacebetRACE_20;
