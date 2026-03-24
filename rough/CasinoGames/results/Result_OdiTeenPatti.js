import React, { useMemo } from "react";
import { formatInterleavedCards, InterleavedResultUI, SummaryRow } from "./InterleavedResultCommon";

const Result_OdiTeenPatti = ({ modalContent: response }) => {
    const modalContent = useMemo(() => {
        return formatResultData(response);
    }, [response]);

    if (!modalContent) return null;

    return (
        <InterleavedResultUI modalContent={modalContent}>
            {modalContent?.baccarat ? (
                <div style={{ display: "flex", marginBottom: 6 }}>
                    <div style={{ width: 80, textAlign: "right", paddingRight: 8 }}>3 Baccarat</div>
                    <div style={{ color: "#fff" }}>
                        <div>{modalContent.baccarat.split("~")[0]}</div>
                        {modalContent.baccarat.split("~")[1] && (
                            <div style={{ fontSize: 10, color: "#9ca3af" }}>
                                {modalContent.baccarat.split("~")[1]}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <SummaryRow label="Odd/Even" value={modalContent?.oddEven} />
            )}

            {modalContent?.total ? (
                <SummaryRow label="Total" value={modalContent?.total} />
            ) : (
                <SummaryRow label="Consecutive" value={modalContent?.consecutive} />
            )}

            {modalContent?.pairPlus && <SummaryRow label="Pair Plus" value={modalContent?.pairPlus} />}
            {modalContent?.redBlack && <SummaryRow label="Red Black" value={modalContent?.redBlack} />}
        </InterleavedResultUI>
    );
};

export const formatResultData = (result) => {
    if (!result) return null;
    if (result.formatted) return result;

    const { playerACards, playerBCards } = formatInterleavedCards(result);
    const descParts = (result.desc_remakrs || result.desc_remarks || "").split("#");
    const winnerName = descParts[0]?.trim() || "N/A";

    // Fields for both game types (some overlap in indices)
    const baccarat = descParts[1]?.trim() || "";
    const total = baccarat ? descParts[2]?.trim() || "" : ""; // total is only for teen20 (where baccarat is present)
    const pairPlus = descParts[3]?.trim() || ""; // might be pairPlus or consecutive
    const redBlack = descParts[4]?.trim() || "";

    const oddEven = !baccarat ? (descParts[2]?.split("  ").filter(Boolean).join(" ") || "") : "";
    const consecutive = !baccarat ? (descParts[3]?.trim() || "") : "";

    return {
        roundId: result.mid || result.event_id || "N/A",
        matchTime: result.time ? new Date(result.time).toLocaleString() : "N/A",
        resultDesc: result.desc_remakrs || result.desc_remarks || result.result || "N/A",
        winnerName: winnerName,
        playerA: {
            name: "Player A",
            cards: playerACards,
            isWinner: winnerName.includes("Player A"),
        },
        playerB: {
            name: "Player B",
            cards: playerBCards,
            isWinner: winnerName.includes("Player B"),
        },
        oddEven,
        consecutive,
        baccarat,
        total,
        pairPlus: baccarat ? pairPlus : "",
        redBlack,
        formatted: true,
    };
};

export default Result_OdiTeenPatti;
