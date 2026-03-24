import React from "react";
import { formatSlicedCards, formatInterleavedCards, InterleavedResultUI, SummaryRow } from "./results/InterleavedResultCommon";

export const formatResultData = (result, gameType) => {
    if (!result) return null;
    if (result.formatted) return result;

    const { playerACards, playerBCards } =
        gameType === "odi_teenpatti" ? formatInterleavedCards(result) : formatSlicedCards(result);

    const desc_remarks = result.desc_remakrs || result.desc_remarks || "";
    const parts = desc_remarks.split("#");

    const winnerName = parts[0]?.trim() || "N/A";
    const oddEven = parts[2]?.split("  ").filter(Boolean).join(" ") || "";
    const consecutive = parts[3]?.trim() || "";

    return {
        roundId: result.mid || result.event_id || "N/A",
        matchTime: result.time ? new Date(result.time).toLocaleString() : "N/A",
        resultDesc: desc_remarks || result.result || "N/A",
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

const TeenPattiResult = ({ modalContent }) => {
    console.log('@@@ TeenPattiResult');
    return (
        <InterleavedResultUI modalContent={modalContent}>
            <SummaryRow label="Odd/Even" value={modalContent?.oddEven} />
            <SummaryRow label="Consecutive" value={modalContent?.consecutive} />
        </InterleavedResultUI>
    );
};

export default TeenPattiResult;
