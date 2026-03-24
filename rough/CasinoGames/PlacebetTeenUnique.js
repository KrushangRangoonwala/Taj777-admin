import React, { useCallback } from "react";
import PlaceBet_KK from "./components/PlaceBet_KK"; 
import RulesHeader from "./components/RulesHeader";

// Custom Result Modal for Unique Teenpatti
const TeenUniqueResultModalContent = ({ modalContent }) => {
    if (!modalContent) return null;
    
    // Assuming we have cards or results for the 6 positions?
    // Or maybe it's just a Pass/Fail?
    // Without exact result structure, I'll display available data generic way.

    return (
        <div style={{ backgroundColor: '#2e3439', color: '#ccc', fontFamily: 'sans-serif', fontSize: '12px', width: '100%', padding: '10px' }}>
            <div style={{ marginBottom: '10px', backgroundColor: '#3b4146', padding: '8px 14px', borderRadius: '4px' }}>
                 <div style={{ fontSize: '13px', color: '#fdcf13', fontWeight: 'bold' }}>UNIQUE TEENPATTI</div>
                 <div style={{ fontSize: '13px', color: '#9ca3af' }}>Round ID: <span style={{color: '#fff'}}>{modalContent.roundId}</span></div>
            </div>

            {/* Displaying raw desc result if available or parsing it */}
            <div style={{ marginBottom: '10px' }}>
                <div style={{color:'#fff', fontWeight:'bold', marginBottom:'5px'}}>Result:</div>
                <div style={{fontSize:'14px', color:'#fdcf13'}}>
                    {modalContent.winnerDesc || "Waiting for result..."}
                </div>
            </div>
            
             {/* If we have cards data */}
             {modalContent.cards && (
                 <div style={{display:'flex', gap:'5px', flexWrap:'wrap'}}>
                     {modalContent.cards.map((c, i) => (
                         <img key={i} src={`https://wver.sprintstaticdata.com/v196/static/front/img/cards/${c}.png`} style={{width:'40px'}} alt={c} />
                     ))}
                 </div>
             )}

        </div>
    );
};

const PlacebetTeenUnique = ({
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

    console.log("teenunique result", result);

    // Basic Parsing
    const desc = result.desc_remakrs || (result.data && result.data.t1 && result.data.t1.rdesc) || "";
    
    // Attempt to parse cards if available
    let cards = [];
    if(result.cards) {
        try {
            cards = typeof result.cards === 'string' ? JSON.parse(result.cards) : result.cards;
        } catch(e) {}
    }

    return {
      roundId: result.event_id || result.mid || "N/A",
      winnerDesc: desc,
      cards: cards,
      formatted: true,
    };
  }, []);

  const SHORT_VAR = "teen20c"; // Using socket name as key
  const LONG_VAR = "UNIQUE_TEENPATTI";

  const config = {
    marketType: LONG_VAR,
    curPageName: "live_teenpatti_unique.php",
    socketRoom: SHORT_VAR,
    resultApiType: SHORT_VAR,
    placeBetUrl: "bet_place_unique_teenpatti.php", // Placeholder
    placeBetParams: {
      eventType: LONG_VAR,
      marketOddName: LONG_VAR,
      betEventName: LONG_VAR,
      betMarketType: LONG_VAR,
    },
    modalTitle: "Unique Teenpatti Result",
    shouldClearOpenBetsOnResult: false,
    hideHeaderInfo: true,
  };

  const getResultTxt = (win) => {
    return "R";
  };

  const getColorClass = (win) => { 
    return `result-circle player-A`; // Default
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
      ResultModal={TeenUniqueResultModalContent}
      getResultTxt={getResultTxt}
      getColorClass={getColorClass}
      RulesComponent={() => <RulesHeader />}
    />
  );
};

export default PlacebetTeenUnique;
