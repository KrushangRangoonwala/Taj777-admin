import React, { useCallback } from "react";
import { placeBetSuperOver3Api } from "../../api/api";
import PlaceBet_KK, { parseDescription } from "./components/PlaceBet_KK";
import BetPlacePopup_Superover from "./components/BetPlacePopup_Superover";
import SuperOverModal from "./components/Result_Superover3";
import Superover_Rules from "./components/Superover_Rules";
import { useLocation } from "react-router-dom";
import { useGetFileData } from "../../hooks/useGetFileData";

const PlaceBet_Superover = ({
    betData,
    onSubmit,
    onClose,
    hideResults,
    gameType,
    onOpenBetUpdate,
}) => {
    const location = useLocation().pathname;
    const path = location.split('/').pop();
    console.log("path", path);

    const { CODE, game_type, phpFile, placeBetApi, matchName } = useGetFileData();
    const is2 = game_type === "superover2";
    const is1 = game_type === "superover";
    const isCricket5 = CODE === "FIVE_5_CRICKET";

    const config = {
        marketType: CODE,
        curPageName: phpFile,
        socketRoom: game_type,
        resultApiType: game_type,
        // placeBetApi: placeBetSuperOver3Api,
        placeBetUrl: placeBetApi,
        placeBetParams: {
            eventType: CODE,
            marketOddName: CODE,
            betEventName: CODE,
            betMarketType: CODE,
        },
        modalTitle: "Superover Result",
        shouldClearOpenBetsOnResult: false,
        ...(!is2 && !isCricket5 ? { matchName: matchName } : {}),
    };

    function getResultTxt(win) {
        if (is2)
            return win === "1" ? "I" : win === "2" ? "E" : "T"; // I for IND, A for AUS (typical for this game)
        if (is1)
            return win === "1" ? "E" : win === "2" ? "R" : "T"; // I for IND, A for AUS (typical for this game)
        if (isCricket5)
            return win === "1" ? "A" : win === "2" ? "I" : "T"; // I for IND, A for AUS (typical for this game)
        else
            return win === "1" ? "I" : win === "2" ? "A" : "T"; // I for IND, A for AUS (typical for this game)
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
            // formatResultFn={formatResultData}
            // ResultModal={SuperoverResultModalContent}
            ResultModal={SuperOverModal}
            getResultTxt={getResultTxt}
            BetPlacePopup={BetPlacePopup_Superover}
            isHeaderInResult={true}
            RulesComponent={is2 || isCricket5 ? null : Superover_Rules}
        />
    );
};

export default PlaceBet_Superover;
