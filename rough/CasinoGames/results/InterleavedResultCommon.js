import React from "react";
import useIsMobile from "../../../hooks/useIsMobile";

export const getCardImage = (cardCode) => {
    if (!cardCode || cardCode === "1") return "/assets/cards_new/1.png";

    let formattedCode = cardCode.toUpperCase();
    if (formattedCode.length > 1) {
        const lastChar = formattedCode.slice(-1);
        const secondLastChar = formattedCode.slice(-2, -1);

        if (["S", "H", "D", "C"].includes(lastChar) && lastChar !== secondLastChar) {
            formattedCode = formattedCode + lastChar;
        }
    }
    return `/assets/cards_new/${formattedCode}.png`;
};
//
export const formatInterleavedCards = (result) => {
    let cards = [];
    try {
        if (result.cards) {
            cards = typeof result.cards === "string" ? JSON.parse(result.cards) : result.cards;
        } else {
            const potentialCards = [
                result.C1, result.C2, result.C3, result.C4, result.C5, result.C6,
            ].filter(Boolean);
            if (potentialCards.length > 0) cards = potentialCards;
        }
    } catch (e) {
        console.warn("Failed to parse cards:", e);
    }

    return {
        playerACards: [cards[0], cards[2], cards[4]].filter(Boolean),
        playerBCards: [cards[1], cards[3], cards[5]].filter(Boolean),
    };
};

export const formatSlicedCards = (result) => {
    let cards = [];
    try {
        if (result.cards) {
            cards = typeof result.cards === "string" ? JSON.parse(result.cards) : result.cards;
        } else {
            const potentialCards = [
                result.C1, result.C2, result.C3, result.C4, result.C5, result.C6,
            ].filter(Boolean);
            if (potentialCards.length > 0) cards = potentialCards;
        }
    } catch (e) {
        console.warn("Failed to parse cards:", e);
    }

    return {
        playerACards: cards.slice(0, 3).filter(Boolean),
        playerBCards: cards.slice(3, 6).filter(Boolean),
    };
};

export const PlayerSection = ({ player, isMobile }) => (
    <div style={{ width: "48%", textAlign: "center" }}>
        <div
            style={{
                color: player?.isWinner ? "#fff" : "#9ca3af",
                fontSize: 26,
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
            }}
        >
            {player?.name}
            {player?.isWinner && (
                <img
                    src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
                    width={isMobile ? "40" : "24"}
                    alt="Winner"
                    style={{ filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))" }}
                />
            )}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
            {player?.cards?.length > 0 ? (
                player.cards.map((card, index) => (
                    <img
                        key={index}
                        src={getCardImage(card)}
                        width="38"
                        alt={card}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://wver.sprintstaticdata.com/v67/static/front/img/cards/1.png";
                        }}
                    />
                ))
            ) : (
                <>
                    <img src="/assets/cards_new/1.png" width="38" alt="Back" />
                    <img src="/assets/cards_new/1.png" width="38" alt="Back" />
                    <img src="/assets/cards_new/1.png" width="38" alt="Back" />
                </>
            )}
        </div>
    </div>
);

export const SummaryRow = ({ label, value }) => (
    <div style={{ display: "flex", marginBottom: 6 }}>
        <div style={{ width: 80, textAlign: "right", paddingRight: 8 }}>{label}</div>
        <div style={{ color: "#fff" }}>{value || "N/A"}</div>
    </div>
);

export const InterleavedResultUI = ({ modalContent, children }) => {
    console.log("@@@ InterleavedResultUI");
    const isMobile = useIsMobile();
    if (!modalContent) return null;

    return (
        <div style={{ padding: isMobile ? "10px" : "10px 12px 10px", overflowX: "auto" }}>
            <div
                style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: "center",
                    minWidth: isMobile ? "100%" : "800px",
                }}
            >
                {/* PLAYERS SECTION */}
                <div style={{
                    display: "flex",
                    flex: isMobile ? "none" : "6",
                    width: isMobile ? "100%" : "auto",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: isMobile ? "15px" : "0"
                }}>
                    <PlayerSection player={modalContent.playerA} isMobile={isMobile} />
                    <div style={{ width: 1, height: 90, background: "#4b5563", margin: isMobile ? "0 5px" : "0 18px" }} />
                    <PlayerSection player={modalContent.playerB} isMobile={isMobile} />
                </div>

                {/* INFO BOX */}
                <div style={{ flex: isMobile ? "none" : "4", width: isMobile ? "100%" : "auto", paddingLeft: isMobile ? 0 : 14 }}>
                    <div
                        style={{
                            background: "#1f2937",
                            borderRadius: 4,
                            padding: 12,
                            fontSize: 12,
                            color: "#9ca3af",
                            height: "100%"
                        }}
                    >
                        <SummaryRow label="Winner" value={modalContent.winnerName} />
                        {children}
                        {!isMobile && <SummaryRow label="Result" value={modalContent.resultDesc} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
