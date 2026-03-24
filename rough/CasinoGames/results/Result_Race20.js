import React, { useMemo } from 'react'
import { formatId, getCardImage, suitNames, suits, trophyUrl } from '../../../utilies/helpers';
import Result_details from './Result_details';

const formatResultData = (result) => {
    if (!result) return null;
    if (result.formatted) return result;

    let cards = [];
    try {
        if (result.desc) {
            cards = result.desc.split(",").filter(c => c && c !== "1");
        } else if (result.cards) {
            cards = typeof result.cards === "string" ? JSON.parse(result.cards) : result.cards;
        }
    } catch (e) {
        console.warn("Failed to parse cards for Race20:", e);
    }

    const getRankValue = (card) => {
        if (!card || card === "1") return 0;
        const r = card.replace(/[SHDC]+$/i, "");
        if (r === "A") return 1;
        if (r === "J") return 11;
        if (r === "Q") return 12;
        if (r === "K") return 13;
        return parseInt(r) || 0;
    };

    const nonKCards = cards.filter(card => !card.startsWith("K"));
    let totalPoints = nonKCards.reduce((sum, card) => sum + getRankValue(card), 0);
    let totalCardsCount = nonKCards.length;

    const winCode = String(result.result_status || result.win || result.result);
    let winnerName = result.winner_name || "N/A";

    let remarks = [];
    const rem = result.desc_remarks || result.desc_remakrs;
    if (rem) {
        remarks = rem.split("#").map((s) => s.trim());
        if (remarks.length >= 3) {
            winnerName = remarks[0];
            totalPoints = remarks[1];
            totalCardsCount = remarks[2];
        }
    }

    return {
        roundId: formatId(result.mid || result.event_id || "N/A"),
        matchTime: result.time || new Date().toLocaleString() + " (UTC+05:30)",
        winnerName: winnerName,
        win: winCode,
        cards: cards,
        totalPoints: totalPoints,
        totalCards: totalCardsCount,
        remarks: remarks,
        formatted: true,
    };
};

const Result_Race20 = ({ modalContent: response }) => {
    const modalContent = useMemo(() => {
        return formatResultData(response);
    }, [response]);

    if (!modalContent) return null;

    const baseGroupedCards = suits.map(suit => {
        return (modalContent.cards || []).filter(card => card.endsWith(suit + suit));
    });

    const winningSuitIndex = parseInt(modalContent.win) - 1;
    const winnerCard = baseGroupedCards[winningSuitIndex]?.[baseGroupedCards[winningSuitIndex].length - 1];

    const groupedCards = baseGroupedCards.map((suitCards, index) => {
        const suit = suits[index];
        if (index !== winningSuitIndex && suitCards.length > 0 && !suitCards.some(c => c.startsWith('K'))) {
            return [...suitCards, `K${suit}${suit}`];
        }
        return suitCards;
    });

    const details = [
        { label: 'Winner', value: modalContent.winnerName },
        { label: 'Points', value: modalContent.totalPoints },
        { label: 'Cards', value: modalContent.totalCards },
    ];

    return (
        <>
            <div style={{ padding: "12px 10px" }}>
                <style>{`
                    .race-result-box .video-winner-text {
                        color: #eee;
                        position: absolute;
                        right: 0;
                        top: 0;
                        display: flex;
                        flex-wrap: wrap;
                        align-items: center;
                        justify-content: center;
                        height: calc(100% - 5px);
                        font-size: 22px;
                        width: 42px;
                        border: 1px solid #eee;
                        padding: 2px 12px;
                        z-index: 0;
                        background-color: #222;
                    }
                    // @media only screen and (min-width: 320px) and (max-width: 767px) {
                    //     .race-result-box .video-winner-text {
                    //         right: 25px;
                    //     }
                    }
                `}</style>
                {/* Main Section - Grid for perfect alignment */}
                {/* Main Section - Grid for perfect alignment */}
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "5px" }}>

                    {/* Left Side: Suits + Cards + Winner Strip */}
                    <div className="race-result-box" style={{
                        position: "relative",
                        display: "grid",
                        gridTemplateColumns: "30px auto",
                        alignItems: "center",
                        paddingRight: "50px", // Space for the absolute winner strip
                    }}>
                        {suits.map((suit, index) => (
                            <React.Fragment key={suit}>
                                {/* Col 1: Suit Icon */}
                                <div style={{ display: "flex", justifyContent: "center", height: "45px", alignItems: "center" }}>
                                    <img src={`/assets/cards_new/${suitNames[suit]}.png`} alt={suit} style={{ width: "30px" }} />
                                </div>

                                {/* Col 2: Card Row */}
                                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", minHeight: "45px", alignItems: "center", minWidth: "160px" }}>
                                    {(groupedCards[index] || []).length > 0 ? groupedCards[index].map((card, cIdx) => (
                                        <img key={cIdx} src={getCardImage(card)} alt={card} style={{ width: "30px", background: "#fff", padding: "1px", boxShadow: "0 1px 3px rgba(0,0,0,0.6)" }} />
                                    )) : (
                                        <div style={{ width: "30px", height: "45px" }}></div>
                                    )}
                                </div>
                            </React.Fragment>
                        ))}

                        {/* Winner Strip: Positioned Absolute relative to race-result-box */}
                        <div className="video-winner-text">
                            <div>W</div>
                            <div>I</div>
                            <div>N</div>
                            <div>N</div>
                            <div>E</div>
                            <div>R</div>
                        </div>
                    </div>

                    {/* Right Side: Winner Detail */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {suits.map((suit, index) => (
                            <div key={suit} style={{ height: "45px", display: "flex", alignItems: "center" }}>
                                {index === winningSuitIndex ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <img src={getCardImage(`K${suit}${suit}`)} alt="King" style={{ width: "30px", background: "#fff", padding: "1px", boxShadow: "0 4px 8px rgba(0,0,0,0.7)" }} />
                                        <img src={trophyUrl} alt="Trophy" style={{ width: "35px" }} />
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>

                </div>

                {/* Summary Box */}
                {/* <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    fontSize: "13px",
                    color: "#aaa",
                    padding: "12px 10px",
                    backgroundColor: "#232a2f",
                    margin: "0 10px 10px 10px",
                    borderRadius: "2px",
                    border: "1px solid #444",
                }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{
                            minWidth: "120px",
                            textAlign: "right",
                            marginRight: "10px",
                            color: "#787b7e"
                        }}>Winner</span>
                        <span style={{ color: "#aaa" }}>{modalContent.winnerName}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{
                            minWidth: "120px",
                            textAlign: "right",
                            marginRight: "10px",
                            color: "#787b7e"
                        }}>Points</span>
                        <span style={{ color: "#aaa" }}>{modalContent.totalPoints}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{
                            minWidth: "120px",
                            textAlign: "right",
                            marginRight: "10px",
                            color: "#787b7e"
                        }}>Cards</span>
                        <span style={{ color: "#aaa" }}>{modalContent.totalCards}</span>
                    </div>
                </div> */}
                <Result_details resultData={details} />

            </div>
        </>
    )
}

export default Result_Race20