import React from "react";
import { placeBetCasinoWarApi } from "../../api/api";
import PlaceBet_KK from "./components/PlaceBet_KK";
import Result_Casinowars from "./results/Result_Casinowars";

const PlacebetCasinoWar = ({
    betData,
    onSubmit,
    onClose,
    hideResults,
    gameType,
    onOpenBetUpdate,
}) => {

    const config = {
        marketType: "CASINO_WAR",
        curPageName: "live_casinowar.php",
        socketRoom: "war",
        resultApiType: "war",
        gtype: "war",
        // placeBetApi: placeBetCasinoWarApi,
        placeBetUrl: "bet_place_casino_war.php",
        placeBetParams: {
            eventType: "CASINO_WAR",
            marketOddName: "CASINO_WAR",
            betEventName: "CASINO_WAR",
            betMarketType: "CASINO_WAR",
        },
        modalTitle: "Casino War Result",
        shouldClearOpenBetsOnResult: true,
    };

    const getResultTxt = (win) => {
        return "R";
    };

    return (
        <>
            <style jsx global>{`
                .casino-video-last-results span {
                    color: #fdcf13 !important;
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
                ResultModal={Result_Casinowars}
                getResultTxt={getResultTxt}
            />
        </>
    );
};

export default PlacebetCasinoWar;
