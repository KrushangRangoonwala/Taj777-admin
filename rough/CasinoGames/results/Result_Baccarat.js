import React, { useMemo } from "react";
import useIsMobile from "../../../hooks/useIsMobile";

export const getRank = (card) => {
    if (!card) return "";
    const match = card.match(/^([0-9]+|[JQKA])/);
    return match ? match[0] : "";
};

export const calculateScore = (cards) => {
    if (!cards || cards.length === 0) return 0;
    let total = 0;
    cards.forEach((card) => {
        if (!card) return;
        const match = card.match(/^([0-9]+|[JQKA])/);
        if (match) {
            let rank = match[0];
            let val = 0;
            if (["10", "J", "Q", "K"].includes(rank)) val = 0;
            else if (rank === "A") val = 1;
            else val = parseInt(rank, 10);
            total += val;
        }
    });
    return total % 10;
};

export const formatResultData = (result) => {
    if (!result) return null;
    if (result.formatted) return result;

    const descRaw = result.desc_remakrs || "";
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

    const playerCards = [];
    const bankerCards = [];

    // Deal alternating: P1, B1, P2, B2, P3, B3
    if (allCards[0]) playerCards.push(allCards[0]);
    if (allCards[2]) playerCards.push(allCards[2]);
    if (allCards[4]) playerCards.push(allCards[4]);

    if (allCards[1]) bankerCards.push(allCards[1]);
    if (allCards[3]) bankerCards.push(allCards[3]);
    if (allCards[5]) bankerCards.push(allCards[5]);

    const filteredPlayerCards = playerCards.filter((c) => c && c !== "0" && c !== "1");
    const filteredBankerCards = bankerCards.filter((c) => c && c !== "0" && c !== "1");

    const playerScore = calculateScore(filteredPlayerCards);
    const bankerScore = calculateScore(filteredBankerCards);


    let pPair = false;
    let bPair = false;
    let pPerfect = false;
    let bPerfect = false;

    if (filteredPlayerCards.length >= 2) {
        if (getRank(filteredPlayerCards[0]) === getRank(filteredPlayerCards[1])) pPair = true;
        if (filteredPlayerCards[0] === filteredPlayerCards[1]) pPerfect = true;
    }
    if (filteredBankerCards.length >= 2) {
        if (getRank(filteredBankerCards[0]) === getRank(filteredBankerCards[1])) bPair = true;
        if (filteredBankerCards[0] === filteredBankerCards[1]) bPerfect = true;
    }


    const eitherPair = pPair || bPair;
    const isPerfect = pPerfect || bPerfect;
    const totalCards = filteredPlayerCards.length + filteredBankerCards.length;
    const bigSmall = totalCards === 4 ? "Small" : "Big";


    let pairStr = "-";
    if (pPair && bPair) pairStr = "Both";
    else if (pPair) pairStr = "Player";
    else if (bPair) pairStr = "Banker";

    let winner = descRaw;
    if (!winner && result.result_status) {
        if (result.result_status === "1") winner = "Player";
        else if (result.result_status === "2") winner = "Banker";
        else if (result.result_status === "3") winner = "Tie";
    }

    return {
        roundId: (() => {
            const id = (result.event_id || result.mid || "").toString();
            return id.includes(".") ? id.split(".")[1] : id;
        })() || "N/A",
        matchTime: result.time
            ? new Date(result.time).toLocaleString()
            : new Date().toLocaleString(),
        player: {
            name: "Player",
            cards: filteredPlayerCards,
            score: playerScore,
        },
        banker: {
            name: "Banker",
            cards: filteredBankerCards,
            score: bankerScore,
        },

        winner: winner || "Unknown",
        pair: pairStr,
        perfect: isPerfect ? "Yes" : "No",
        either: eitherPair ? "Yes" : "No",
        bigSmall: bigSmall,
        formatted: true,
    };
};

const getCardImage = (card) => {
    if (!card || card === "1")
        return "/assets/cards_new/1.png";

    let formattedCode = card.toUpperCase();
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

const Result_Baccarat = ({ modalContent }) => {
    const isMobile = useIsMobile();

    const details = useMemo(() => {
        return formatResultData(modalContent);
    }, [modalContent]);

    if (!details) return null;

    return (
        <>
            <div
                style={{
                    padding: isMobile ? "10px 10px 10px" : "10px 12px 0px",
                    overflowX: "auto",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: isMobile ? "stretch" : "center",
                        minWidth: isMobile ? "auto" : "500px",
                    }}
                >
                    {/* PLAYERS AREA (Left 70% or Top on Mobile) */}
                    <div
                        style={{
                            flex: isMobile ? "none" : "7",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: isMobile ? "10px" : "0",
                                }}
                            >
                                {isMobile && details?.winner === "Player" && (
                                    <img
                                        src="/assets/images/winner.png"
                                        width="50"
                                        alt="Winner"
                                    />
                                )}
                                <div style={{ textAlign: isMobile ? "left" : "center" }}>
                                    <div
                                        style={{
                                            color:
                                                details?.winner === "Player" ? "#9ca3af" : "#9ca3af",
                                            fontSize: isMobile ? 18 : 22,
                                            marginBottom: isMobile ? 4 : 8,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: isMobile ? "flex-start" : "center",
                                            gap: "8px",
                                        }}
                                    >
                                        {details?.player?.name}
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: isMobile ? "flex-start" : "center",
                                            alignItems: "center",
                                            gap: 6,
                                        }}
                                    >
                                        {details?.player?.cards?.length === 3 ? (
                                            <>
                                                <div
                                                    style={{
                                                        transform: "rotate(-90deg)",
                                                        marginRight: isMobile ? "5px" : "12px",
                                                        marginTop: "2px",
                                                    }}
                                                >
                                                    <img
                                                        src={getCardImage(details.player.cards[2])}
                                                        width={isMobile ? "28" : "38"}
                                                        alt="3rd"
                                                    />
                                                </div>
                                                <img
                                                    src={getCardImage(details.player.cards[1])}
                                                    width={isMobile ? "28" : "38"}
                                                    alt="1st"
                                                />
                                                <img
                                                    src={getCardImage(details.player.cards[0])}
                                                    width={isMobile ? "28" : "38"}
                                                    alt="2nd"
                                                />
                                            </>
                                        ) : details?.player?.cards?.length === 2 ? (
                                            <>
                                                <img
                                                    src={getCardImage(details.player.cards[1])}
                                                    width={isMobile ? "28" : "38"}
                                                    alt="1st"
                                                />
                                                <img
                                                    src={getCardImage(details.player.cards[0])}
                                                    width={isMobile ? "28" : "38"}
                                                    alt="2nd"
                                                />
                                            </>
                                        ) : (
                                            details?.player?.cards?.map((card, index) => (
                                                <img
                                                    key={index}
                                                    src={getCardImage(card)}
                                                    width={isMobile ? "28" : "38"}
                                                    alt={card}
                                                />
                                            ))
                                        )}
                                        {!isMobile && details?.winner === "Player" && (
                                            <img
                                                src="/assets/images/winner.png"
                                                width="24"
                                                alt="Winner"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                width: 1,
                                height: isMobile ? 60 : 90,
                                background: "#4b5563",
                                margin: isMobile ? "0 10px" : "0 18px",
                            }}
                        />

                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: isMobile ? "10px" : "0",
                                }}
                            >
                                {isMobile && details?.winner === "Banker" && (
                                    <img
                                        src="/assets/images/winner.png"
                                        width="50"
                                        alt="Winner"
                                    />
                                )}
                                <div style={{ textAlign: isMobile ? "left" : "center" }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: isMobile ? "flex-start" : "center",
                                            alignItems: "center",
                                            gap: 10,
                                            marginBottom: isMobile ? 4 : 8,
                                        }}
                                    >
                                        <span
                                            style={{
                                                color:
                                                    details?.winner === "Banker" ? "#9ca3af" : "#9ca3af",
                                                fontSize: isMobile ? 18 : 22,
                                            }}
                                        >
                                            {details?.banker?.name}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: isMobile ? "flex-start" : "center",
                                            alignItems: "center",
                                            gap: 6,
                                        }}
                                    >
                                        {!isMobile && details?.winner === "Banker" && (
                                            <img
                                                src="/assets/images/winner.png"
                                                width="36"
                                                alt="Winner"
                                            />
                                        )}
                                        {details?.banker?.cards?.length === 3 ? (
                                            <>
                                                <img
                                                    src={getCardImage(details.banker.cards[0])}
                                                    width={isMobile ? "28" : "38"}
                                                    alt="1st"
                                                />
                                                <img
                                                    src={getCardImage(details.banker.cards[1])}
                                                    width={isMobile ? "28" : "38"}
                                                    alt="2nd"
                                                />
                                                <div
                                                    style={{
                                                        transform: "rotate(90deg)",
                                                        marginLeft: isMobile ? "5px" : "12px",
                                                        marginTop: "2px",
                                                    }}
                                                >
                                                    <img
                                                        src={getCardImage(details.banker.cards[2])}
                                                        width={isMobile ? "28" : "38"}
                                                        alt="3rd"
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            details?.banker?.cards?.map((card, index) => (
                                                <img
                                                    key={index}
                                                    src={getCardImage(card)}
                                                    width={isMobile ? "28" : "38"}
                                                    alt={card}
                                                />
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* INFO BOX (Right 30% or Bottom on Mobile) */}
                    <div
                        style={{
                            flex: isMobile ? "none" : "3",
                            paddingLeft: isMobile ? "0" : "15px",
                            marginTop: isMobile ? "15px" : "0",
                        }}
                    >
                        <div
                            style={{
                                background: "#444444",
                                borderRadius: 4,
                                padding: "12px",
                                fontSize: 14,
                                color: "#AAAFB5",
                                height: "100%",
                            }}
                        >
                            {/* Winner */}
                            <div style={{ display: "flex", marginBottom: "4px" }}>
                                <div
                                    style={{
                                        width: isMobile ? 110 : 90,
                                        textAlign: isMobile ? "right" : "right",
                                        marginRight: 10,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Winner
                                </div>
                                <div style={{ color: "#AAAFB5", fontWeight: "bold" }}>
                                    {details?.winner}
                                </div>
                            </div>

                            {/* Pair */}
                            <div style={{ display: "flex", marginBottom: "4px" }}>
                                <div
                                    style={{
                                        width: isMobile ? 110 : 90,
                                        textAlign: "right",
                                        marginRight: 10,
                                    }}
                                >
                                    Winner Pair
                                </div>
                                <div style={{ color: "#fff" }}>{details?.pair}</div>
                            </div>

                            <div style={{ display: "flex", marginBottom: "4px" }}>
                                <div
                                    style={{
                                        width: isMobile ? 110 : 90,
                                        textAlign: "right",
                                        marginRight: 10,
                                    }}
                                >
                                    Score
                                </div>
                                <div style={{ color: "#AAAFB5" }}>{details?.score}</div>
                            </div>

                            {/* Perfect */}
                            {modalContent?.game_type === "baccarat" && (
                                <div style={{ display: "flex", marginBottom: "4px" }}>
                                    <div
                                        style={{
                                            width: isMobile ? 110 : 90,
                                            textAlign: "right",
                                            marginRight: 10,
                                        }}
                                    >
                                        Perfect
                                    </div>
                                    <div style={{ color: "#AAAFB5" }}>{details?.perfect}</div>
                                </div>
                            )}

                            {/* Either */}
                            {modalContent?.game_type === "baccarat" && (
                                <div style={{ display: "flex", marginBottom: "4px" }}>
                                    <div
                                        style={{
                                            width: isMobile ? 110 : 90,
                                            textAlign: "right",
                                            marginRight: 10,
                                        }}
                                    >
                                        Either
                                    </div>
                                    <div style={{ color: "#AAAFB5" }}>{details?.either}</div>
                                </div>
                            )}

                            {/* Big / Small */}
                            {modalContent?.game_type === "baccarat" && (
                                <div style={{ display: "flex" }}>
                                    <div
                                        style={{
                                            width: isMobile ? 110 : 90,
                                            textAlign: "right",
                                            marginRight: 10,
                                        }}
                                    >
                                        Big/Small
                                    </div>
                                    <div style={{ color: "#AAAFB5" }}>{details?.bigSmall}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Result_Baccarat;
