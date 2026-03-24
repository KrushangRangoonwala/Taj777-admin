import React from "react";
import PlaceBet_KK from "./components/PlaceBet_KK";
import Rules from "./components/Rules";
import RulesHeader from "./components/RulesHeader";
import Result_29CardBaccarat, { formatResultData } from "./results/Result_29CardBaccarat";

const ruleList = [
  { label: "Straight", value: "1 TO 2" },
  { label: "Flush", value: "1 TO 5" },
  { label: "Trio", value: "1 TO 20" },
  { label: "Straight Flush", value: "1 TO 30" },
];

const PlacebetTwentyNineCardBaccarat = ({
  betData,
  onSubmit,
  onClose,
  hideResults,
  gameType,
  onOpenBetUpdate,
}) => {
  const config = {
    marketType: "29CARD_BACCARAT",
    curPageName: "live_29cardbaccarat.php",
    socketRoom: "teensin",
    resultApiType: "teensin",
    gtype: "teensin",
    placeBetUrl: "bet_place_teensin.php",
    placeBetParams: {
      eventType: "29CARD_BACCARAT",
      marketOddName: "29CARD_BACCARAT",
      betEventName: "29Card Baccarat",
      betMarketType: "29CARD_BACCARAT",
    },
    modalTitle: "29Card Baccarat Result",
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
      ResultModal={Result_29CardBaccarat}
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

export default PlacebetTwentyNineCardBaccarat;
