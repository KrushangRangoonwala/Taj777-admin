import React, { useMemo } from "react";
import useIsMobile from "../../../hooks/useIsMobile";

const formatResultData = (result) => {
    if (!result) return null;
    if (result.formatted) return result;

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

    const playersData = {};
    for (let i = 1; i <= 8; i++) {
        const c1 = allCards[i - 1];
        const c2 = allCards[i - 1 + 9];
        const c3 = allCards[i - 1 + 18];
        const pCards = [c1, c2, c3].filter(Boolean);

        const winStr = (result.result || result.result_status || "").toString();
        const isWinner = winStr.split(',').includes(i.toString());

        playersData[`p${i}`] = {
            name: `${i}`,
            cards: pCards,
            isWinner: isWinner,
        };
    }

    const d1 = allCards[8];
    const d2 = allCards[17];
    const d3 = allCards[26];
    playersData['dealer'] = {
        name: 'Dealer',
        cards: [d1, d2, d3].filter(Boolean),
    };

    const desc = result.desc_remakrs || (result.data && result.data.t1 && result.data.t1.rdesc) || "";
    const parts = desc.split('#');

    const winnerDesc = parts[0] || "";
    const pairPlusDesc = parts[1] || "";
    const totalPart = parts[2] || "";
    let totalDesc = "";
    let dealerTotal = "";

    if (totalPart) {
        const dealerSplit = totalPart.split('~Dealer :');
        if (dealerSplit.length > 1) {
            dealerTotal = dealerSplit[1].trim();
            totalDesc = dealerSplit[0].trim();
        } else {
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
};

const Result_TeenPattiOpen = ({ modalContent: response }) => {
    const isMobile = useIsMobile();
    const modalContent = useMemo(() => {
        return formatResultData(response);
    }, [response]);

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
                padding: isMobile ? "0px" : "10px 12px 10px",
                overflowX: "auto",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    minWidth: isMobile ? "100%" : "800px",
                    color: "#ccc",
                    fontFamily: "sans-serif",
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
                                        <img key={i} src={getCardImage(c)} style={{ width: '22px', display: 'block', marginBlock: '5px' }} alt={c}
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
                                <img key={i} src={getCardImage(c)} style={{ width: '22px', display: 'block', marginBlock: '5px' }} alt={c}
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
                                {pData.isWinner && <img src="https://wver.sprintstaticdata.com/v196/static/front/img/winner.png" style={{ width: '40px', height: '46px' }} alt="Win" />}
                            </div>
                        )
                    })}
                    <div style={{ width: '11.11%' }}></div>
                </div>

                {/* Details Section */}
                <div style={{ width: "100%", marginTop: '15px' }}>
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

export default Result_TeenPattiOpen;
