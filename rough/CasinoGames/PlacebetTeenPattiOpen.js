import React, { useCallback } from "react";
import PlaceBet_KK, { parseDescription } from "./components/PlaceBet_KK";
import Rules from "./components/Rules";
import RulesHeader from "./components/RulesHeader";

const ruleList = [
  { label: "Pair", value: "1 TO 1" },
  { label: "Flush", value: "1 TO 4" },
  { label: "Straight", value: "1 TO 6" },
  { label: "Trio", value: "1 TO 30" },
  { label: "Straight Flush", value: "1 TO 40" },
];

const TeenOpenResultModalContent = ({ modalContent }) => {
  if (!modalContent) return null;

  const players = Array.from({ length: 8 }, (_, i) => i + 1);

  const getCardImage = (cardCode) => {
    if (!cardCode || cardCode === "1")
      return "https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png";
    return `https://wver.sprintstaticdata.com/v190/static/front/img/cards/${cardCode}.png`;
  };

  return (
    <div
      style={{
        background: "#2e3439",
        padding: "10px 12px 10px",
        overflowX: "auto",
        width: "100%",
        color: "#ccc",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minWidth: "800px",
        }}
      >
        {/* Header Row: Player Numbers and Dealer Label */}
        <div style={{ display: 'flex', borderBottom: '1px solid #444', paddingBottom: '5px', marginBottom: '5px' }}>
          {players.map(p => (
            <div key={p} style={{ width: '11.11%', textAlign: 'center', padding: '2px' }}>
              <span style={{ color: '#ccc', fontWeight: 'bold', fontSize: '14px' }}>{p}</span>
            </div>
          ))}
          <div style={{ width: '11.11%', textAlign: 'center', padding: '2px' }}>
            <span style={{ color: '#fdcf13', fontWeight: 'bold', fontSize: '14px' }}>D</span>
          </div>
        </div>

        {/* Cards Row */}
        <div style={{ display: 'flex', marginBottom: '10px' }}>
          {players.map(p => {
            const key = `p${p}`;
            const pData = modalContent[key] || {};
            return (
              <div key={p} style={{ width: '11.11%', textAlign: 'center', padding: '2px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  {pData.cards && pData.cards.map((c, i) => (
                    <img key={i} src={getCardImage(c)} style={{ width: '22px', display: 'block' }} alt={c}
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png"; }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
          <div style={{ width: '11.11%', textAlign: 'center', padding: '2px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              {modalContent.dealer && modalContent.dealer.cards && modalContent.dealer.cards.map((c, i) => (
                <img key={i} src={getCardImage(c)} style={{ width: '22px', display: 'block' }} alt={c}
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png"; }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Winners Row */}
        <div style={{ display: 'flex', marginBottom: '15px', height: '35px' }}>
          {players.map(p => {
            const key = `p${p}`;
            const pData = modalContent[key] || {};
            return (
              <div key={p} style={{ width: '11.11%', textAlign: 'center', padding: '2px', display: 'flex', justifyContent: 'center' }}>
                {pData.isWinner && <img src="https://wver.sprintstaticdata.com/v196/static/front/img/winner.png" style={{ width: '30px', objectFit: 'contain' }} alt="Win" />}
              </div>
            )
          })}
          <div style={{ width: '11.11%' }}></div>
        </div>

        {/* Details Section */}
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
            <div style={{ display: 'flex', marginBottom: '6px' }}>
              <div style={{ width: 100, textAlign: 'right', paddingRight: 10 }}>Winner</div>
              <div style={{ color: '#aaafb5' }}>
                {modalContent.winnerDesc || players.filter(p => modalContent[`p${p}`]?.isWinner).join(', ') || "N/A"}
              </div>
            </div>

            <div style={{ display: 'flex', marginBottom: '6px' }}>
              <div style={{ width: 100, textAlign: 'right', paddingRight: 10 }}>Pair Plus</div>
              <div style={{ color: '#aaafb5' }}>
                {modalContent.pairPlusDesc || " - "}
              </div>
            </div>

            <div style={{ display: 'flex', marginBottom: '6px' }}>
              <div style={{ width: 100, textAlign: 'right', paddingRight: 10 }}>Total</div>
              <div style={{ color: '#aaafb5' }}>
                {modalContent.totalDesc && modalContent.totalDesc.split('~').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
                {!modalContent.totalDesc && " - "}
              </div>
            </div>

            <div style={{ display: 'flex', marginBottom: '6px' }}>
              <div style={{ width: 100, textAlign: 'right', paddingRight: 10 }}>Dealer :</div>
              <div style={{ color: '#aaafb5' }}>
                {modalContent.dealerTotal || " - "}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const PlaceBet_teenopen = ({
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

    console.log("teenopen result", result);

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

    // Assuming flat list of cards, 3 per player? 8 * 3 = 24?
    // or generic mapping.
    // Interleaved Dealing: 8 players + Dealer. Stride 9.
    // P1: 0,9,18; P2: 1,10,19 ... P8: 7,16,25
    // Dealer: 8,17,26
    const playersData = {};
    for (let i = 1; i <= 8; i++) {
      // Interleaved logic
      const c1 = allCards[i - 1];
      const c2 = allCards[i - 1 + 9];
      const c3 = allCards[i - 1 + 18];
      const pCards = [c1, c2, c3].filter(Boolean);

      // Try to parse total/desc from result (if available) - assuming generic placebet doesn't pass special parsing logic
      // We will default isWinner check
      const winStr = (result.result || result.result_status || "").toString();
      const isWinner = winStr.split(',').includes(i.toString());

      playersData[`p${i}`] = {
        name: `${i}`,
        cards: pCards,
        isWinner: isWinner,
        // Mocking data extraction if present in desc_remarks or similar
        // descPairPlus: ...
        // total: ...
      };
    }

    // Dealer Data
    const d1 = allCards[8];
    const d2 = allCards[17];
    const d3 = allCards[26];
    playersData['dealer'] = {
      name: 'Dealer',
      cards: [d1, d2, d3].filter(Boolean),
      // total: ...
    };

    // Parse desc_remakrs for summary
    // Format: "Winners # PairPlus # Totals ~ Dealer"
    // Sample: "1  2  4  5 #1 : Pair | 2 : Pair#1 : 11 | 2 : 20 | 3 : 17 | 4 : 22~5 : 24 | 6 : 22 | 7 : 25 | 8 : 21~Dealer : 27#"
    const desc = result.desc_remakrs || (result.data && result.data.t1 && result.data.t1.rdesc) || "";
    const parts = desc.split('#');

    // Part 0: Winner (e.g. "1 2 4 5" or "1 2 | Drawn : 4")
    const winnerDesc = parts[0] || "";

    // Part 1: Pair Plus
    const pairPlusDesc = parts[1] || "";

    // Part 2: Totals + Dealer
    const totalPart = parts[2] || "";
    let totalDesc = "";
    let dealerTotal = "";

    if (totalPart) {
      const dealerSplit = totalPart.split('~Dealer :');
      if (dealerSplit.length > 1) {
        dealerTotal = dealerSplit[1].trim();
        totalDesc = dealerSplit[0].trim();
      } else {
        // Fallback
        totalDesc = totalPart;
      }
    }

    return {
      roundId: result.event_id || result.mid || "N/A",
      matchTime: result.time ? new Date(result.time).toLocaleString() : (result.data?.t1?.mtime || "N/A"),
      ...playersData,
      winnerDesc,
      pairPlusDesc,
      totalDesc,
      dealerTotal,
      formatted: true,
    };
  }, []);

  const SHORT_VAR = "teen8";
  const LONG_VAR = "OPENTEENPATTI";

  const config = {
    marketType: LONG_VAR,
    curPageName: "live_teenpatti_open.php",
    socketRoom: SHORT_VAR,
    resultApiType: SHORT_VAR,
    placeBetUrl: "bet_place_open_teenpatti.php",
    placeBetParams: {
      eventType: LONG_VAR,
      marketOddName: LONG_VAR,
      betEventName: LONG_VAR,
      betMarketType: LONG_VAR,
    },
    modalTitle: "Teenpatti Open Result",
    shouldClearOpenBetsOnResult: false,
    hideHeaderInfo: true,
  };

  const getResultTxt = (win) => {
    return "R";
  };

  const getColorClass = (win) => {
    if (!win) return "";
    let str = win.toString();
    if (str.includes(",")) str = str.split(",")[0];
    if (str.includes(" ")) str = str.split(" ")[0];
    const winner = str.trim();
    return `result-circle player-${winner}`;
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
      ResultModal={TeenOpenResultModalContent}
      getResultTxt={getResultTxt}
      getColorClass={getColorClass}
      RulesComponent={() => (
        <>
          <RulesHeader />
          <Rules header="Top 9" rules={ruleList} />
        </>
      )}
    />
  );
};

export default PlaceBet_teenopen;
