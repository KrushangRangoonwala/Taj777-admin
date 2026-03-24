import React from "react";
import PlaceBet_KK from "./components/PlaceBet_KK";
import Result_Teen62, { formatResultData as formatTeen62Result } from "./results/Result_Teen62";

const PlacebetTeen62 = (props) => {
  const getResultTxt = (win) => {
    const w = String(win).trim().toUpperCase();
    if (w === "1" || w === "A") return "A";
    if (w === "2" || w === "B") return "B";
    return "R";
  };

  const getColorClass = (win) => {
    const w = String(win).trim().toUpperCase();
    if (w === "1" || w === "A") return "resulta";
    if (w === "2" || w === "B") return "resultb";
    return "resulttie";
  };

  const config = {
    marketType: "TEEN62",
    curPageName: "live_teenpatti_vip.php",
    socketRoom: "teen62",
    resultApiType: "teen62",
    placeBetUrl: "bet_place_teen62.php",
    placeBetParams: {
      eventType: "TEEN62",
      marketOddName: "TEEN62",
      betEventName: "TEEN62",
      betMarketType: "TEEN62",
    },
    modalTitle: "Vip Teenpatti Result",
  };

  return (
    <PlaceBet_KK
      {...props}
      config={config}
      getResultTxt={getResultTxt}
      getColorClass={getColorClass}
      // formatResultFn={formatTeen62Result}
      // ResultModal={Result_Teen62}
      gameType="teen62"
    />
  );
};

export default PlacebetTeen62;
