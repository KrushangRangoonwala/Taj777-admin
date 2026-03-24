import React from "react";
import PlaceBet_KK from "./components/PlaceBet_KK";
import Rules from "./components/Rules";
import RulesHeader from "./components/RulesHeader";
import { placeBetPatti2Api, fetchTeenpattiResults } from "../../api/api";
import useIsMobile from "../../hooks/useIsMobile";

const Patti2ResultModalContent = ({ modalContent }) => {
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
        background: "#2e3439",
        padding: isMobile ? "10px" : "10px 12px 10px",
        overflowX: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minWidth: isMobile ? "100%" : "800px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "15px",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "45%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
            }}
          >
            {modalContent?.playerA?.isWinner && (
              <img
                src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
                width={isMobile ? "60" : "50"}
                alt="Winner"
                style={{
                  filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))",
                }}
              />
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  color: "#9ca3af",
                  fontSize: 26,
                  marginBottom: 4,
                  whiteSpace: "nowrap",
                }}
              >
                {modalContent?.playerA?.name || "Player A"}
              </div>
              <div
                style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 6 }}
              >
                {modalContent?.playerA?.cards?.map((card, index) => (
                  <img
                    key={index}
                    src={getCardImage(card)}
                    width="22"
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
                        width="22"
                        alt="Back"
                      />
                      <img
                        src="https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png"
                        width="22"
                        alt="Back"
                      />
                    </>
                  )}
              </div>
            </div>
          </div>

          <div
            style={{
              width: 1,
              height: 90,
              background: "#4b5563",
              margin: isMobile ? "0 10px" : "0 30px",
            }}
          />

          <div
            style={{
              width: "45%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
            }}
          >
            {modalContent?.playerB?.isWinner && (
              <img
                src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
                width={isMobile ? "60" : "50"}
                alt="Winner"
                style={{
                  filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))",
                }}
              />
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#9ca3af",
                  fontSize: 26,
                  marginBottom: 4,
                  whiteSpace: "nowrap",
                }}
              >
                {modalContent?.playerB?.name || "Player B"}
              </span>

              <div
                style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 6 }}
              >
                {modalContent?.playerB?.cards?.map((card, index) => (
                  <img
                    key={index}
                    src={getCardImage(card)}
                    width="22"
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
                        width="22"
                        alt="Back"
                      />
                      <img
                        src="https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png"
                        width="22"
                        alt="Back"
                      />
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ width: "100%" }}>
          <div
            style={{
              background: "#444444",
              borderRadius: 4,
              padding: 12,
              fontSize: 12,
              color: "#9ca3af",
            }}
          >
            <div style={{ display: "flex", marginBottom: 6 }}>
              <div style={{ width: 100, textAlign: "right", paddingRight: 8 }}>
                Winner
              </div>
              <div style={{ color: "#aaafb5" }}>
                {modalContent?.winner || "N/A"}
              </div>
            </div>

            <div style={{ display: "flex", marginBottom: 6 }}>
              <div style={{ width: 100, textAlign: "right", paddingRight: 8 }}>
                Mini Baccarat
              </div>
              <div style={{ color: "#aaafb5" }}>
                {modalContent?.miniBaccarat || "-"}
              </div>
            </div>

            <div style={{ display: "flex", marginBottom: 6 }}>
              <div style={{ width: 100, textAlign: "right", paddingRight: 8 }}>
                Total
              </div>
              <div style={{ color: "#aaafb5" }}>
                {modalContent?.total || "-"}
              </div>
            </div>

            <div style={{ display: "flex", marginBottom: 6 }}>
              <div style={{ width: 100, textAlign: "right", paddingRight: 8 }}>
                Color plus
              </div>
              <div style={{ color: "#aaafb5" }}>
                {modalContent?.colorPlus || "-"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ruleList = [
  { label: "Three card Sequence", value: "1 TO 3" },
  { label: "Four card color", value: "1 TO 9" },
  { label: "Four card Sequence", value: "1 TO 9" },
  { label: "Three of a kind", value: "1 TO 12" },
  { label: "Three card pure Sequence", value: "1 TO 15" },
  { label: "Four card pure Sequence", value: "1 TO 150" },
  { label: "Four of a kind", value: "1 TO 200" },
];

const PlacebetTeenPatti2Cards = (props) => {
  const config = {
    marketType: "PATTI2",
    curPageName: "teenpatti2cards.php",
    socketRoom: "patti2",
    resultApiType: "patti2",
    placeBetUrl: "bet_place_patti2.php",
    gtype: "patti2",
    placeBetParams: {
      eventType: "PATTI2",
      marketOddName: "PATTI2",
      betEventName: "PATTI2",
      betMarketType: "PATTI2",
    },
    modalTitle: "2 Cards Teenpatti Result",
    shouldClearOpenBetsOnResult: false,
  };

  const formatResultData = (result) => {
    if (!result) return null;
    if (result.formatted) return result;

    const desc = result.desc_remakrs || "";
    if (!desc) {
      return {
        winner: "",
        miniBaccarat: "",
        total: "",
        colorPlus: "",
      };
    }

    const parts = desc.split("#");
    const parsed = {
      winner: parts[0]?.trim() || "",
      miniBaccarat: parts[1]?.trim() || "",
      total: parts[2]?.trim() || "",
      colorPlus: parts[3]?.trim() || "",
    };

    let allCards = [];
    try {
      allCards = Array.isArray(result.cards)
        ? result.cards
        : typeof result.cards === "string"
          ? JSON.parse(result.cards)
          : [];
    } catch (e) {
      allCards = [];
    }

    let playerACards = [allCards[0], allCards[2]].filter(Boolean);
    let playerBCards = [allCards[1], allCards[3]].filter(Boolean);

    const isPlayerAWinner = parsed.winner?.includes("Player A") ?? false;
    const isPlayerBWinner = parsed.winner?.includes("Player B") ?? false;

    return {
      roundId: result.event_id || result.mid || "N/A",
      matchTime: result.time ? new Date(result.time).toLocaleString() : "N/A",
      ...parsed,
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
      formatted: true,
    };
  };

  const getResultTxt = (win) => {
    const w = String(win).trim();
    if (w === "1") return "A";
    if (w === "2") return "B";
    return "R";
  };

  const getColorClass = (win) => {
    const w = String(win).trim();
    if (w === "1") return "resulta";
    if (w === "2") return "resultb";
    return "resulttie";
  };

  return (
    <PlaceBet_KK
      {...props}
      config={config}
      formatResultFn={formatResultData}
      ResultModal={Patti2ResultModalContent}
      getResultTxt={getResultTxt}
      getColorClass={getColorClass}
      RulesComponent={() => (
        <>
          <RulesHeader />
          <Rules header="Color Plus Rules" rules={ruleList} />
        </>
      )}
    />
  );
};

export default PlacebetTeenPatti2Cards;
