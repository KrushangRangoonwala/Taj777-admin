import React, { useMemo } from "react";
import useIsMobile from "../../../hooks/useIsMobile";
import Result_details from "./Result_details";
import Result_cards_divided from "./Result_cards_divided";

const Result_29CardBaccarat = ({ modalContent: response }) => {
    const isMobile = useIsMobile();
    const modalContent_ = useMemo(() => {
        const cards = response?.cards ? JSON.parse(response?.cards) : [];

        const playerA = {
            title: 'Player A',
            // cards: cards?.slice(0, 3),
            cards: [cards?.[0], cards?.[2], cards?.[4]],
            isWin: response?.result_status == 1,
        };
        const playerB = {
            title: 'Player B',
            // cards: cards?.slice(3, 6),
            cards: [cards?.[1], cards?.[3], cards?.[5]],
            isWin: response?.result_status == 2
        };

        const desc = response?.desc_remakrs || response?.desc_remarks || ""
        const descArr = desc.split("#");

        return {
            playerA,
            playerB,
            descArr,
        };
    }, [response]);

    if (!response?.event_id) return null;

    const resultData = [
        { label: "Winner", value: modalContent_?.descArr?.[0] || "" },
        { label: "High Card", value: modalContent_?.descArr?.[1] || "" },
        { label: "Pair", value: modalContent_?.descArr?.[2] || "" },
        { label: "Color Plus", value: modalContent_?.descArr?.[3] || "" },
        { label: "Lucky 9", value: modalContent_?.descArr?.[4] || "" },
    ]

    return (
        <div className="row row5 worli-result">
            <Result_cards_divided
                leftTitle={modalContent_?.playerA?.title}
                rightTitle={modalContent_?.playerB?.title}
                leftCardList={modalContent_?.playerA?.cards}
                rightCardList={modalContent_?.playerB?.cards}
                isLeftWinner={modalContent_?.playerA?.isWin}
                isRightWinner={modalContent_?.playerB?.isWin}
            />
            <Result_details resultData={resultData} />
        </div>
    );
};

const parseDescription = (desc) => {
    if (!desc) {
        return {
            winnerDesc: "",
            highCard: "",
            pair: "",
            colorPlus: "",
            lucky9: ""
        };
    }
    const parts = desc.split("#");
    // Format: WinnerDesc # HighCard # Pair # ColorPlus # Lucky9

    return {
        winnerDesc: parts[0]?.trim() || "",
        highCard: parts[1]?.trim() || "-",
        pair: parts[2]?.trim() || "-",
        colorPlus: parts[3]?.trim() || "-",
        lucky9: parts[4]?.trim() || "No",
    };
};

export const formatResultData = (result) => {
    if (!result) return null;

    if (result.formatted) {
        return result;
    }

    const desc = parseDescription(result.desc_remakrs || result.desc_remarks || "");
    const rawWin = result.win || result.result || "";
    let winCode = String(rawWin).trim().toUpperCase();
    const winNum = parseInt(winCode, 10);

    let winnerName = "N/A";
    let isPlayerA = false;
    let isPlayerB = false;

    if (winNum === 1 || winCode === "A" || winCode === "PLAYER A" || winCode === "PLAYERA") {
        winnerName = "Player A";
        isPlayerA = true;
    } else if (winNum === 2 || winCode === "B" || winCode === "PLAYER B" || winCode === "PLAYERB") {
        winnerName = "Player B";
        isPlayerB = true;
    }

    let allCards = [];
    try {
        allCards = Array.isArray(result.cards)
            ? result.cards
            : typeof result.cards === "string"
                ? JSON.parse(result.cards)
                : [];
    } catch (e) {
        allCards = [];
    }

    let playerACards, playerBCards;
    // Interleaved logic: A, B, A, B, A, B
    playerACards = [allCards[0], allCards[2], allCards[4]].filter(Boolean);
    playerBCards = [allCards[1], allCards[3], allCards[5]].filter(Boolean);

    return {
        roundId: result.event_id || result.mid || "N/A",
        matchTime: result.time ? new Date(result.time).toLocaleString() : "N/A",
        playerA: {
            name: "Player A",
            cards: playerACards,
            isWinner: isPlayerA,
        },
        playerB: {
            name: "Player B",
            cards: playerBCards,
            isWinner: isPlayerB,
        },
        winner: winnerName,
        desc: desc,
        formatted: true,
    };
};

export default Result_29CardBaccarat;
