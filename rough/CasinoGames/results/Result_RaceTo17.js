import React, { useMemo } from 'react'
import { formatId, getCardImage, trophyUrl } from '../../../utilies/helpers';

const formatResultData = (result) => {
    if (!result) return null;
    if (result.formatted) return result;

    let cards = [];
    try {
        if (result.cards) {
            cards =
                typeof result.cards === "string"
                    ? JSON.parse(result.cards)
                    : result.cards;
        } else {
            const potentialCards = [
                result.C1,
                result.C2,
                result.C3,
                result.C4,
                result.C5,
                result.C6,
                result.C7,
                result.C8,
                result.C9,
                result.C10,
                result.C11,
                result.C12,
            ].filter(Boolean);
            if (potentialCards.length > 0) {
                cards = potentialCards;
            } else if (result.desc && Array.isArray(result.desc)) {
                cards = result.desc.filter((c) => c && c !== "1");
            }
        }
    } catch (e) {
        console.warn("Failed to parse cards for RaceTo17:", e);
    }

    const getRank = (code) => {
        const r = code.replace(/[SHDC]+$/i, "");
        if (r === "A") return 1;
        if (r === "J") return 11;
        if (r === "Q") return 12;
        if (r === "K") return 13;
        return parseInt(r) || 0;
    };

    const totals = [0, 1, 2, 3].map((i) => {
        const playerCards = cards.filter((_, idx) => idx % 4 === i);
        let total = playerCards.reduce((acc, curr) => acc + getRank(curr), 0) + i;

        const hasQueen = playerCards.some((c) => c.startsWith("Q"));
        if (hasQueen) total += 10;

        return { total, cards: playerCards };
    });

    const winCode = String(result.result_status || result.win || result.result);
    let winnerName = result.winner_name || "N/A";

    if (winnerName === "N/A") {
        if (winCode === "1") winnerName = "Race to 17 (Y)";
        else if (winCode === "0") winnerName = "Zero Card (N)";
        else if (winCode === "6") winnerName = "Big Card";
        else if (winCode === "12") winnerName = "Any Zero";
    }

    let remarks = [];
    if (result.desc_remarks || result.desc_remakrs) {
        const rem = result.desc_remarks || result.desc_remakrs;
        remarks = rem.split("#").map((s) => s.trim());
    } else if (
        result.desc &&
        typeof result.desc === "string" &&
        result.desc.includes("#")
    ) {
        remarks = result.desc.split("#").map((s) => s.trim());
    }

    return {
        roundId: formatId(result.mid || result.event_id || "N/A"),
        matchTime: result.time || new Date().toLocaleString() + " (UTC+05:30)",
        winnerName: winnerName,
        win: winCode,
        cards: cards.filter((c) => c && c != "1"),
        remarks: remarks,
        formatted: true,
    };
};


const Result_RaceTo17 = ({ modalContent: response }) => {
    const modalContent = useMemo(() => {
        return formatResultData(response);
    }, [response]);

    if (!modalContent) return null;


    return (
        <>
            <div style={{ padding: "8px 10px" }}>
                {/* Totals Section */}
                <div
                    style={{
                        marginBottom: "12px",
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            gap: "6px",
                            flexWrap: "wrap",
                            justifyContent: "center",
                        }}
                    >
                        {modalContent.cards.map((card, cIdx) => (
                            <img
                                key={cIdx}
                                src={getCardImage(card)}
                                style={{
                                    width: "25px",
                                    height: "auto",
                                    borderRadius: "2px",
                                }}
                                alt={card}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Remarks Section */}
            {modalContent.remarks && modalContent.remarks.length > 0 && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                        fontSize: "13px",
                        color: "#aaa",
                        padding: "12px 10px",
                        backgroundColor: "#333",
                        margin: "0 10px 10px 10px",
                        borderRadius: "2px",
                        border: "1px solid #444",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <span
                            style={{
                                minWidth: "120px",
                                textAlign: "right",
                                marginRight: "10px",
                                color: "#787b7e",
                            }}
                        >
                            Race to 17
                        </span>
                        <span style={{ color: "#aaa" }}>{modalContent.remarks[0]}</span>
                    </div>
                    {modalContent.remarks[1] && (
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <span
                                style={{
                                    minWidth: "120px",
                                    textAlign: "right",
                                    marginRight: "10px",
                                    color: "#787b7e",
                                }}
                            >
                                Big Card
                            </span>
                            <span style={{ color: "#aaa" }}>
                                {modalContent.remarks[1]}
                            </span>
                        </div>
                    )}
                    {modalContent.remarks[2] && (
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <span
                                style={{
                                    minWidth: "120px",
                                    textAlign: "right",
                                    marginRight: "10px",
                                    color: "#787b7e",
                                }}
                            >
                                Zero Card
                            </span>
                            <span style={{ color: "#aaa" }}>
                                {modalContent.remarks[2]}
                            </span>
                        </div>
                    )}
                    {modalContent.remarks[3] && (
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <span
                                style={{
                                    minWidth: "120px",
                                    textAlign: "right",
                                    marginRight: "10px",
                                    color: "#787b7e",
                                }}
                            >
                                One Zero Card
                            </span>
                            <span style={{ color: "#aaa" }}>
                                {modalContent.remarks[3]}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

export default Result_RaceTo17