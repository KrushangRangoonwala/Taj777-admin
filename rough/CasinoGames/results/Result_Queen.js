import React from 'react'
import { formatId } from '../../../utilies/helpers';
import Result_details from './Result_details';

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
            if (potentialCards.length > 0) cards = potentialCards;
        }
    } catch (e) {
        console.warn("Failed to parse cards for Queen:", e);
    }

    const getRank = (code) => {
        const r = code.substring(0, code.length - 2);
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
        // if (hasQueen) total += 10;

        return { total, cards: playerCards };
    });

    const winCode = String(result.result_status || result.win || result.result);
    let winnerName = "N/A";
    if (winCode === "0") winnerName = "Total 0";
    else if (winCode === "1") winnerName = "Total 1";
    else if (winCode === "2") winnerName = "Total 2";
    else if (winCode === "3") winnerName = "Total 3";

    return {
        roundId: formatId(result.mid || result.event_id || "N/A"),
        matchTime: result.time || new Date().toLocaleString() + " (UTC+05:30)",
        winnerName: winnerName,
        win: result.result,
        cards: cards,
        totals: totals,
        formatted: true,
    };
};

const Result_Queen = ({ modalContent: response }) => {
    console.log('response', response);
    const modalContent = formatResultData(response);
    console.log('modalContent', modalContent);

    const getCardImage = (cardCode) => {
        if (!cardCode || cardCode === "1") return "/assets/cards_new/1.png";

        let formattedCode = cardCode.toUpperCase();
        if (formattedCode.length > 1) {
            const lastChar = formattedCode.slice(-1);
            const secondLastChar = formattedCode.slice(-2, -1);

            if (
                ["S", "H", "D", "C"].includes(lastChar) &&
                lastChar !== secondLastChar
            ) {
                formattedCode = formattedCode + lastChar;
            }
        }
        return `/assets/cards_new/${formattedCode}.png`;
    };

    if (!modalContent) return null;

    const trophyUrl = "https://wver.sprintstaticdata.com/v69/static/front/img/winner.png";

    const resultData = [
        { label: "Winner", value: modalContent.winnerName || "" },
    ]


    return (
        <>
            <div style={{ padding: "8px 10px" }}>

                {[0, 1, 2, 3].map((num) => {
                    const totalObj = modalContent.totals[num];
                    const isWinner = modalContent.winnerName === `Total ${num}`;
                    const visibleCards = totalObj.cards.filter(
                        (c) => c !== "1" && c !== ""
                    );
                    if (visibleCards?.length === 0) return null;
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
                                <span style={{ color: "#AAAFB5" }}>Total {num} - </span>
                                <span style={{ color: "#ffc107", marginLeft: "5px" }}>
                                    {totalObj.total}
                                </span>

                                {isWinner && (
                                    <img
                                        src={trophyUrl}
                                        alt="Winner"
                                        style={{
                                            height: "60px",
                                            position: "absolute",
                                            right: "10px",
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
                                        src={getCardImage(card)}
                                        style={{
                                            width: "28px",
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

            <div className='row row5'>
                <Result_details resultData={resultData} />
            </div>
        </>
    );
}

export default Result_Queen