import React from "react";
import { formatInterleavedCards, InterleavedResultUI, SummaryRow } from "./results/InterleavedResultCommon";

export const formatResultData = (result) => {
    if (!result) return null;
    if (result.formatted) return result;

    const { playerACards, playerBCards } = formatInterleavedCards(result);
    const descParts = (result.desc_remakrs || result.desc_remarks || "").split("#");
    const winnerName = descParts[0]?.trim() || "N/A";
    const oddEven = descParts[2]?.split("  ").filter(Boolean).join(" ") || "";
    const consecutive = descParts[3]?.trim() || "";

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
        formatted: true,
    };
};

const OdiTeenPattiResult = ({ modalContent }) => {
    console.log("@@@ OdiTeenPattiResult.....");
    return (
        <InterleavedResultUI modalContent={modalContent}>
            <SummaryRow label="Odd/Even" value={modalContent?.oddEven} />
            <SummaryRow label="Consecutive" value={modalContent?.consecutive} />
        </InterleavedResultUI>
    );
};

export default OdiTeenPattiResult;
