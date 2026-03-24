import React, { useState } from 'react'
import { useGamePathName, useGetFileData } from '../../hooks/useGetFileData';
import PlaceBet_KK from './components/PlaceBet_KK';
import GameConfig from './components/CasinoMap';

const Placebet_Common = ({
    betData,
    onSubmit,
    onClose,
    gameType,
    onOpenBetUpdate,
    setPlacebet_msg,
}) => {
    const ddd = useGetFileData();
    console.log('ddd', ddd);

    const { CODE, game_type, phpFile, placeBetApi, game_name, matchName, hide_result } = ddd;
    const path = useGamePathName();

    const details = GameConfig[path] || GameConfig.DEFAULT;

    const isRulesFirst = !!details.isRulesFirst;
    const Rules = details.RulesComponent || null;
    const BetPopup = details.BetPopupComponent || null;
    const TopComp = details.TopComponent || null;
    const getResultTxt = details.getResultTxt || GameConfig.DEFAULT.getResultTxt;
    const getColorClass = details.getColorClass ?? GameConfig.DEFAULT.getColorClass;
    const isBgTransparent = details.isBgTransparent ?? GameConfig.DEFAULT.isBgTransparent;

    const isSicbo = game_type === "sicbo";

    const config = {
        marketType: CODE,
        curPageName: phpFile,
        socketRoom: game_type,
        resultApiType: game_type,

        placeBetUrl: placeBetApi,
        placeBetParams: {
            eventType: isSicbo ? game_type : CODE,
            marketOddName: CODE,
            betEventName: CODE,
            betMarketType: CODE,
        },
        modalTitle: game_name ?? CODE + " Result",
        ...(matchName ? { matchName: matchName } : {}),
    };

    return (
        <PlaceBet_KK
            betData={betData}
            onSubmit={onSubmit}
            onClose={onClose}
            hideResults={hide_result}
            gameType={gameType}
            onOpenBetUpdate={onOpenBetUpdate}

            getResultTxt={getResultTxt}
            config={config}
            isHeaderInResult={true}
            getColorClass={getColorClass}

            BetPlacePopup={BetPopup}
            RulesComponent={Rules}
            TopComponent={TopComp}

            isRulesFirst={isRulesFirst}
            isBgTransparent={isBgTransparent}
            setPlacebet_msg={setPlacebet_msg}
        />
    )
}

export default Placebet_Common

// to change url : CasinoContent.js