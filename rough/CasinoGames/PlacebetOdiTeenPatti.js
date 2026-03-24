import React from "react";
import PlaceBet_KK from "./components/PlaceBet_KK";
import OdiTeenPattiResult, { formatResultData } from "./OdiTeenPattiResult";

const PlacebetOdiTeenPatti = ({
  betData,
  onSubmit,
  onClose,
  hideResults,
  gameType,
  onOpenBetUpdate,
}) => {
  const config = {
    marketType: "ODITEENPATTI",
    curPageName: "live_odi_teenpatti.php",
    socketRoom: "teen",
    resultApiType: "teen",
    gtype: "teen",
    placeBetUrl: "bet_place_teenpatti_odi",
    placeBetParams: {
      eventType: "ODITEENPATTI",
      marketOddName: "ODITEENPATTI",
      betEventName: "ODITEENPATTI",
      betMarketType: "ODITEENPATTI",
    },
    modalTitle: "Teenpatti 1-day Result",
    shouldClearOpenBetsOnResult: true,
  };

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
      ResultModal={OdiTeenPattiResult}
      getResultTxt={getResultTxt}
      getColorClass={getColorClass}
    />
  );
};

export default PlacebetOdiTeenPatti;
