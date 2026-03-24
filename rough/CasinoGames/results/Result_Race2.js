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
        console.warn("Failed to parse cards for Race2:", e);
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
    let winnerName = "N/A";
    if (winCode === "1") winnerName = "Player A";
    else if (winCode === "2") winnerName = "Player B";
    else if (winCode === "3") winnerName = "Player C";
    else if (winCode === "4") winnerName = "Player D";

    return {
        roundId: formatId(result.mid || result.event_id || "N/A"),
        matchTime: result.time || new Date().toLocaleString() + " (UTC+05:30)",
        winnerName: winnerName,
        win: winCode,
        cards: cards,
        totals: totals,
        formatted: true,
    };
};

const Result_Race2 = ({ modalContent: response }) => {
    const modalContent = useMemo(() => {
        return formatResultData(response);
    }, [response]);

    if (!modalContent) return null;

    return (
        <>
            <div style={{ padding: "8px 10px" }}>
                {/* Totals Section */}
                {[0, 1, 2, 3].map((num) => {
                    const totalObj = modalContent.totals[num];
                    const isWinner =
                        modalContent.winnerName === `Player ${["A", "B", "C", "D"][num]}`;
                    const visibleCards = totalObj.cards.filter(
                        (c) => c !== "1" && c !== ""
                    );

                    return (
                        <div
                            key={num}
                            style={{ marginBottom: "8px", position: "relative" }}
                        >
                            <div
                                style={{
                                    fontSize: "20px",
                                    // fontWeight: "bold",
                                    marginBottom: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <span style={{ color: "#AAAFB5" }}>
                                    Player {["A", "B", "C", "D"][num]} {" "}
                                </span>
                                {/* <span style={{ color: "#ffc107", marginLeft: "5px" }}>
                                    {totalObj.total}
                                </span> */}

                                {isWinner && (
                                    <img
                                        src={trophyUrl}
                                        alt="Winner"
                                        style={{
                                            height: "46px",
                                            position: "absolute",
                                            right: "5px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                        }}
                                    />
                                )}
                            </div>

                            <div style={{ display: "flex", gap: "4px" }}>
                                {visibleCards.map((card, cIdx) => (
                                    <img
                                        key={cIdx}
                                        src={getCardImage(card, "cards_new")}
                                        style={{
                                            width: "20px",
                                            height: "auto",
                                            borderRadius: "1px",
                                        }}
                                        alt={card}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Bar */}
            <div
                style={{
                    backgroundColor: "#444",
                    padding: "6px",
                    display: "flex",
                    // justifyContent: "center",
                    alignItems: "center",
                    fontSize: "12px",
                    borderTop: "1px solid #48525a",
                }}
            >
                <span style={{ color: "#aaa", marginLeft: "80px", opacity: "0.5" }}>Winner </span>
                <span style={{ color: "#aaa", marginLeft: "5px" }}>
                    {modalContent.winnerName}
                </span>
            </div>
        </>
    )
}

export default Result_Race2