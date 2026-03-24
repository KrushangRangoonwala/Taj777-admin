import React, { useMemo } from "react";

const Result_TeenUnique = ({ modalContent: response }) => {
    const modalContent = useMemo(() => {
        return formatResultData(response);
    }, [response]);

    if (!modalContent) return null;

    return (
        <div style={{ backgroundColor: '#2e3439', color: '#ccc', fontFamily: 'sans-serif', fontSize: '12px', width: '100%', padding: '10px' }}>
            <div style={{ marginBottom: '10px', backgroundColor: '#3b4146', padding: '8px 14px', borderRadius: '4px' }}>
                <div style={{ fontSize: '13px', color: '#fdcf13', fontWeight: 'bold' }}>UNIQUE TEENPATTI</div>
                <div style={{ fontSize: '13px', color: '#9ca3af' }}>Round ID: <span style={{ color: '#fff' }}>{modalContent.roundId}</span></div>
            </div>

            {/* Displaying raw desc result if available or parsing it */}
            <div style={{ marginBottom: '10px' }}>
                <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '5px' }}>Result:</div>
                <div style={{ fontSize: '14px', color: '#fdcf13' }}>
                    {modalContent.winnerDesc || "Waiting for result..."}
                </div>
            </div>

            {/* If we have cards data */}
            {modalContent.cards && modalContent.cards.length > 0 && (
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {modalContent.cards.map((c, i) => (
                        <img key={i} src={`https://wver.sprintstaticdata.com/v196/static/front/img/cards/${c}.png`} style={{ width: '40px' }} alt={c} />
                    ))}
                </div>
            )}
        </div>
    );
};

export const formatResultData = (result) => {
    if (!result) return null;
    if (result.formatted) return result;

    // Basic Parsing
    const desc = result.desc_remakrs || (result.data && result.data.t1 && result.data.t1.rdesc) || "";

    // Attempt to parse cards if available
    let cards = [];
    if (result.cards) {
        try {
            cards = typeof result.cards === 'string' ? JSON.parse(result.cards) : result.cards;
        } catch (e) {
            console.warn("Failed to parse cards for unique teenpatti", result.cards);
        }
    }

    return {
        roundId: result.event_id || result.mid || "N/A",
        winnerDesc: desc,
        cards: cards,
        formatted: true,
    };
};

export default Result_TeenUnique;
