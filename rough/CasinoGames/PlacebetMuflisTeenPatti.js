import React, { useCallback } from "react";
import PlaceBet_KK from "./components/PlaceBet_KK";
import useIsMobile from "../../hooks/useIsMobile";
import Rules from "./components/Rules";
import RulesHeader from "./components/RulesHeader";

const ruleList = [
  { label: "Card 9", value: "1 TO 3" },
  { label: "Card 8", value: "1 TO 4" },
  { label: "Card 7", value: "1 TO 5" },
  { label: "Card 6", value: "1 TO 8" },
  { label: "Card 5", value: "1 TO 30" },
];

const MuflisResultModalContent = ({ modalContent, onClose }) => {
  const isMobile = useIsMobile();
  const getCardImage = (cardCode) => {
    if (!cardCode || cardCode === "1")
      return "https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png";
    return `https://wver.sprintstaticdata.com/v190/static/front/img/cards/${cardCode}.png`;
  };

  if (!modalContent) return null;

  return (
    <div
      style={{
        padding: isMobile ? "10px" : "10px 12px 0px",
        overflowX: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          minWidth: isMobile ? "100%" : "800px",
        }}
      >
        {/* PLAYERS SECTION */}
        <div
          style={{
            display: "flex",
            width: isMobile ? "100%" : "60%",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: isMobile ? "15px" : "0",
          }}
        >
          {/* PLAYER A */}
          <div style={{ width: "48%", textAlign: "center" }}>
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
                  width={isMobile ? "40" : "24"}
                  alt="Winner"
                  style={{
                    filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))",
                  }}
                />
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
              {modalContent?.playerA?.cards?.map((card, index) => (
                <img
                  key={index}
                  src={getCardImage(card)}
                  width="38"
                  alt={card}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png";
                  }}
                />
              )) || (
                  <>
                    <img
                      src="https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png"
                      width="38"
                      alt="Back"
                    />
                    <img
                      src="https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png"
                      width="38"
                      alt="Back"
                    />
                    <img
                      src="https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png"
                      width="38"
                      alt="Back"
                    />
                  </>
                )}
            </div>
          </div>

          {/* DIVIDER */}
          <div
            style={{
              width: 1,
              height: 90,
              background: "#4b5563",
              margin: isMobile ? "0 5px" : "0 18px",
            }}
          />

          {/* PLAYER B */}
          <div style={{ width: "48%", textAlign: "center" }}>
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
                  width={isMobile ? "40" : "36"}
                  alt="Winner"
                  style={{
                    filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))",
                  }}
                />
              )}
              <span
                style={{
                  color: modalContent?.playerB?.isWinner ? "#fff" : "#9ca3af",
                  fontSize: 26,
                }}
              >
                {modalContent?.playerB?.name || "Player B"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
              {modalContent?.playerB?.cards?.map((card, index) => (
                <img
                  key={index}
                  src={getCardImage(card)}
                  width="38"
                  alt={card}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png";
                  }}
                />
              )) || (
                  <>
                    <img
                      src="https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png"
                      width="38"
                      alt="Back"
                    />
                    <img
                      src="https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png"
                      width="38"
                      alt="Back"
                    />
                    <img
                      src="https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png"
                      width="38"
                      alt="Back"
                    />
                  </>
                )}
            </div>
          </div>
        </div>

        {/* INFO BOX */}
        <div
          style={{
            width: isMobile ? "100%" : "40%",
            paddingLeft: isMobile ? 0 : 14,
          }}
        >
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
              <div style={{ width: 80, textAlign: "right", paddingRight: 8 }}>
                Winner
              </div>
              <div style={{ color: "#fff" }}>
                {modalContent?.winner || "N/A"}
              </div>
            </div>

            {(modalContent?.baccarat ||
              modalContent?.total ||
              modalContent?.pairPlus ||
              modalContent?.redBlack) && (
                <>
                  <div style={{ display: "flex", marginBottom: 6 }}>
                    <div
                      style={{ width: 80, textAlign: "right", paddingRight: 8 }}
                    >
                      Baccarat
                    </div>
                    <div style={{ color: "#fff" }}>
                      {modalContent.baccarat || "-"}
                    </div>
                  </div>
                  <div style={{ display: "flex", marginBottom: 6 }}>
                    <div
                      style={{ width: 80, textAlign: "right", paddingRight: 8 }}
                    >
                      Total
                    </div>
                    <div style={{ color: "#fff" }}>
                      {modalContent.total || "-"}
                    </div>
                  </div>
                  <div style={{ display: "flex", marginBottom: 6 }}>
                    <div
                      style={{ width: 80, textAlign: "right", paddingRight: 8 }}
                    >
                      Pair Plus
                    </div>
                    <div style={{ color: "#fff" }}>
                      {modalContent.pairPlus || "-"}
                    </div>
                  </div>
                  <div style={{ display: "flex", marginBottom: 6 }}>
                    <div
                      style={{ width: 80, textAlign: "right", paddingRight: 8 }}
                    >
                      Red/Black
                    </div>
                    <div style={{ color: "#fff" }}>
                      {modalContent.redBlack || "-"}
                    </div>
                  </div>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

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

const PlacebetMuflisTeenPatti = ({
  betData,
  onSubmit,
  onClose,
  hideResults,
  gameType,
  onOpenBetUpdate,
}) => {
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

  const config = {
    marketType: "2020MUFLISTEENPATTI",
    curPageName: "live_teenmuf.php",
    socketRoom: "teenmuf",
    resultApiType: "teenmuf",
    placeBetUrl: "bet_place_teenmuf.php",
    gtype: "teenmuf",
    placeBetParams: {
      eventType: "2020MUFLISTEENPATTI",
      marketOddName: "2020MUFLISTEENPATTI",
      betEventName: "2020MUFLISTEENPATTI",
      betMarketType: "2020MUFLISTEENPATTI",
    },
    modalTitle: "Muflis Teenpatti Result",
    shouldClearOpenBetsOnResult: true,
  };

  const getResultTxt = (win) => {
    const w = String(win).trim().toUpperCase();
    const n = Number(w);
    if (n === 1 || w === "A") return "A";
    if (n === 2 || w === "B") return "B";
    return "R";
  };

  const getColorClass = (win) => {
    const w = String(win).trim().toUpperCase();
    const n = Number(w);
    if (n === 1 || w === "A") return "resulta";
    if (n === 2 || w === "B") return "resultb";
    return "resulttie";
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
      ResultModal={MuflisResultModalContent}
      getResultTxt={getResultTxt}
      getColorClass={getColorClass}
      RulesComponent={() => (
        <>
          <RulesHeader />
          <Rules header="Top 9" rules={ruleList} />
        </>
      )}
    />
  );
};

export default PlacebetMuflisTeenPatti;
