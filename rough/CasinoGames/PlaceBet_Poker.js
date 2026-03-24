import React, { useCallback } from "react";
import { placeBetPokerApi } from "../../api/api";
import PlaceBet_KK, { parseDescription } from "./components/PlaceBet_KK";

const PokerResultModalContent = ({ modalContent }) => {
  return (
    <div
      style={{ display: "flex", alignItems: "center", minWidth: "800px" }}
    >
      {/* PLAYER A */}
      <div
        style={{
          width: "30%",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          height: "100%",
        }}
      >
        {modalContent?.playerA?.isWinner && (
          <img
            src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
            alt="Winner"
            style={{
              height: "80px",
              width: "auto",
              filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))",
            }}
          />
        )}
        <div>
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
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png";
                }}
              />
            )) || (
                <>
                  <img
                    src="https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png"
                    width="38"
                    alt="Back"
                  />
                  <img
                    src="https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png"
                    width="38"
                    alt="Back"
                  />
                  <img
                    src="https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png"
                    width="38"
                    alt="Back"
                  />
                </>
              )}
          </div>
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
      <div
        style={{
          width: "30%",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          height: "100%",
        }}
      >
        {modalContent?.playerB?.isWinner && (
          <img
            src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
            alt="Winner"
            style={{
              height: "80px",
              width: "auto",
              filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))",
            }}
          />
        )}
        <div>
          <div
            style={{
              color: modalContent?.playerB?.isWinner ? "#fff" : "#9ca3af",
              fontSize: 26,
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {modalContent?.playerB?.name || "Player B"}
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
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png";
                }}
              />
            )) || (
                <>
                  <img
                    src="https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png"
                    width="38"
                    alt="Back"
                  />
                  <img
                    src="https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png"
                    width="38"
                    alt="Back"
                  />
                  <img
                    src="https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png"
                    width="38"
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
          margin: "0 18px",
        }}
      />

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
            <div style={{ color: "#fff" }}>
              {modalContent?.playerA?.isWinner
                ? "Player A"
                : modalContent?.playerB?.isWinner
                  ? "Player B"
                  : "Loading..."}
            </div>
          </div>

          <div style={{ display: "flex", marginBottom: 6 }}>
            <div
              style={{ width: 80, textAlign: "right", paddingRight: 8 }}
            >
              Odd/Even
            </div>
            <div style={{ color: "#fff" }}>
              {modalContent?.oddEven || "Loading..."}
            </div>
          </div>

          <div style={{ display: "flex" }}>
            <div
              style={{ width: 80, textAlign: "right", paddingRight: 8 }}
            >
              Consecutive
            </div>
            <div style={{ color: "#fff" }}>
              A: {modalContent?.playerA?.consecutive ? "Yes" : "No"} | B:{" "}
              {modalContent?.playerB?.consecutive ? "Yes" : "No"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlaceBet_Poker = ({
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

    if (gameType === "2020_POKER") {
      playerACards = [allCards[0], allCards[2], allCards[4]].filter(Boolean);
      playerBCards = [allCards[1], allCards[3], allCards[5]].filter(Boolean);
    } else {
      playerACards = allCards.slice(0, 3);
      playerBCards = allCards.slice(3, 6);
    }

    const isPlayerAWinner = desc.winner?.includes("Player A") ?? false;
    const isPlayerBWinner = desc.winner?.includes("Player B") ?? false;

    return {
      roundId: result.event_id || result.mid || "N/A",
      matchTime: result.time ? new Date(result.time).toLocaleString() : "N/A",
      playerA: {
        name: "Player A",
        cards: playerACards,
        isWinner: isPlayerAWinner,
        consecutive: desc.consecutive?.includes("A : Yes") || false,
      },
      playerB: {
        name: "Player B",
        cards: playerBCards,
        isWinner: isPlayerBWinner,
        consecutive: desc.consecutive?.includes("B : Yes") || false,
      },
      oddEven: desc.oddEven.join(" "),
      consecutive: desc.consecutive,
      formatted: true,
    };
  }, [gameType]);

  const SHORT_VAR = "poker20";
  const LONG_VAR = "2020_POKER";

  const config = {
    marketType: LONG_VAR,
    curPageName: "live_20poker.php",
    socketRoom: SHORT_VAR,
    resultApiType: SHORT_VAR,
    // placeBetApi: placeBetPokerApi,
    placeBetUrl: "bet_place_20_poker.php",
    placeBetParams: {
      eventType: LONG_VAR,
      marketOddName: LONG_VAR,
      betEventName: LONG_VAR,
      betMarketType: LONG_VAR,
    },
    modalTitle: "Poker 20-20 Result",
    shouldClearOpenBetsOnResult: gameType === LONG_VAR,
  };

  function getResultTxt(win) {
    return win === "1" ? "A" : "B";
  }

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
      getResultTxt={getResultTxt}
      ResultModal={PokerResultModalContent}
    />
  );
};

export default PlaceBet_Poker;
