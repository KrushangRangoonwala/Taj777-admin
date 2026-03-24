import React, { useCallback } from "react";
import PlaceBet_KK, { parseDescription } from "./components/PlaceBet_KK";

const TeenTestResultModalContent = ({ modalContent }) => {
  if (!modalContent) return null;

  const { tiger, lion, dragon } = modalContent;

  // Determine winner name dynamically
  const winnerName =
    tiger?.isWinner
      ? "Tiger"
      : lion?.isWinner
        ? "Lion"
        : dragon?.isWinner
          ? "Dragon"
          : "Pending";

  return (
    <div className="row row5 dtl20-result">
      {/* Tiger */}
      <div className="col-12 col-lg-3">
        <div className="casino-result-cards">
          <div className="casino-result-cards-item">
            {tiger?.isWinner && (
              <img
                src="https://wver.sprintstaticdata.com/v196/static/front/img/winner.png"
                className="winner-icon"
                alt="Winner"
              />
            )}
          </div>
          <div className="d-inline-block">
            <h4 className="text-center" style={{ color: 'var(--text-table)' }}>Tiger</h4>
            {tiger?.cards?.map((card, idx) => (
              <div key={idx} className="casino-result-cards-item">
                <img
                  src={`https://wver.sprintstaticdata.com/v196/static/front/img/cards/${card}.png`}
                  alt={card}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://wver.sprintstaticdata.com/v196/static/front/img/cards/back.png";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lion */}
      <div className="col-12 col-lg-3">
        <div className="casino-result-cards">
          <div className="casino-result-cards-item">
            {lion?.isWinner && (
              <img
                src="https://wver.sprintstaticdata.com/v196/static/front/img/winner.png"
                className="winner-icon"
                alt="Winner"
              />
            )}
          </div>
          <div className="d-inline-block">
            <h4 className="text-center" style={{ color: 'var(--text-table)' }}>Lion</h4>
            {lion?.cards?.map((card, idx) => (
              <div key={idx} className="casino-result-cards-item">
                <img
                  src={`https://wver.sprintstaticdata.com/v196/static/front/img/cards/${card}.png`}
                  alt={card}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://wver.sprintstaticdata.com/v196/static/front/img/cards/back.png";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dragon */}
      <div className="col-12 col-lg-3">
        <div className="casino-result-cards">
          <div className="casino-result-cards-item">
            {dragon?.isWinner && (
              <img
                src="https://wver.sprintstaticdata.com/v196/static/front/img/winner.png"
                className="winner-icon"
                alt="Winner"
              />
            )}
          </div>
          <div className="d-inline-block">
            <h4 className="text-center" style={{ color: 'var(--text-table)' }}>Dragon</h4>
            {dragon?.cards?.map((card, idx) => (
              <div key={idx} className="casino-result-cards-item">
                <img
                  src={`https://wver.sprintstaticdata.com/v196/static/front/img/cards/${card}.png`}
                  alt={card}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://wver.sprintstaticdata.com/v196/static/front/img/cards/back.png";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Result / Winner info */}
      <div className="col-12 col-lg-3">
        <div className="casino-result-desc">
          <div className="casino-result-desc-item">
            <div>Winner</div>
            <div>{winnerName}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Others</div>
            <div>
              {dragon?.isWinner
                ? "D : Pair"
                : tiger?.isWinner
                  ? "T : Pair"
                  : lion?.isWinner
                    ? "L : Pair"
                    : "N/A"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const PlaceBet_teentest = ({
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

    console.log("allcards", result);

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

    const tigerCards = [allCards[0], allCards[3], allCards[6]].filter(Boolean);
    const lionCards = [allCards[1], allCards[4], allCards[7]].filter(Boolean);
    const dragonCards = [allCards[2], allCards[5], allCards[8]].filter(Boolean);

    return {
      roundId: result.event_id || result.mid || "N/A",
      matchTime: result.time
        ? new Date(result.time).toLocaleString()
        : "N/A",

      tiger: {
        name: "Tiger",
        cards: tigerCards,
        isWinner: result.result_status === "T",
      },

      lion: {
        name: "Lion",
        cards: lionCards,
        isWinner: result.result_status === "L",
      },

      dragon: {
        name: "Dragon",
        cards: dragonCards,
        isWinner: result.result_status === "D",
      },

      formatted: true,
    };
  }, []); // No dependencies needed for this version

  const SHORT_VAR = "teen9";
  const LONG_VAR = "TESTTEENPATTI";

  const config = {
    marketType: LONG_VAR,
    curPageName: "live_test_teenpatti.php",
    socketRoom: SHORT_VAR,
    resultApiType: SHORT_VAR,
    placeBetUrl: "bet_place_test_teenpatti.php",
    placeBetParams: {
      eventType: LONG_VAR,
      marketOddName: LONG_VAR,
      betEventName: LONG_VAR,
      betMarketType: LONG_VAR,
    },
    modalTitle: "Teenpatti Test Result",
    shouldClearOpenBetsOnResult: false,
  };
  function getResultTxt(win) {
    console.log("winnnnndata", win);
    return win === "11" ? "T" : win === "21" ? "L" : win === "31" ? "D" : "R";
  }
  function getColorClass(aaa) {
    return aaa === "11" ? "resulta" : aaa === "21" ? "resultb" : aaa === "31" ? "resultc" : "resulttie"
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
      ResultModal={TeenTestResultModalContent}
      getResultTxt={getResultTxt}
      getColorClass={getColorClass}
    />
  );
};

export default PlaceBet_teentest;
