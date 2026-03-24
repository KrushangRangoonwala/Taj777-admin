import React, { useMemo } from "react";
import useIsMobile from "../../../hooks/useIsMobile";
import { useSelector } from "react-redux";

const cardCodeForImage = (card) => {
    if (!card) return null;

    const c = card.toUpperCase().trim();

    // Backend sends: ACC, AHH, KDD → image wants AC, AH, KD
    if (c.length === 3) {
        return c.slice(0, 2);
    }

    return c;
};


const Result_AAA2 = ({ modalContent: response }) => {
    const isLight = useSelector(state => state.action.theme) === "light";
    const isMobile = useIsMobile();
    const modalContent = useMemo(() => {
        return formatResultData(response);
    }, [response]);

    console.log(modalContent);

    if (!modalContent) return null;

    return (
        <div style={{ padding: "10px 12px", overflowX: "auto", backgroundColor: "#2e3439" }}>
            <div
                style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "100%",
                }}
            >
                {/* CENTER CARD */}
                <div
                    style={{
                        width: isMobile ? "100%" : "30%",
                        textAlign: "center",
                        marginBottom: isMobile ? "15px" : "0",
                    }}
                >
                    {modalContent?.mainCard ? (
                        <img
                            src={`/assets/cards_new/${modalContent.mainCard}.png`}
                            width={isMobile ? "25" : "50"}
                            alt={modalContent.mainCard}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/assets/cards_new/1.png";
                            }}
                        />
                    ) : (
                        <img
                            src="/assets/cards_new/1.png"
                            width={isMobile ? "60" : "50"}
                            alt="Back"
                        />
                    )}

                </div>

                {/* INFO BOX */}
                <div
                    style={{
                        width: isMobile ? "100%" : "70%",
                        paddingLeft: isMobile ? 0 : 10,
                    }}
                >
                    <div
                        style={{
                            background: "#444444",
                            borderRadius: 4,
                            padding: "8px 12px",
                            fontSize: 13,
                            color: isLight ? "#333" : "#9ca3af",
                        }}
                    >
                        <div style={{ display: "flex", marginBottom: 4 }}>
                            <div
                                style={{
                                    width: "40%",
                                    textAlign: "right",
                                    paddingRight: "10px",
                                    color: isLight ? "#333" : "#aaafb5",
                                }}
                            >
                                Winner
                            </div>
                            <div
                                style={{
                                    width: "60%",
                                    textAlign: "left",
                                    paddingLeft: "10px",
                                    color: isLight ? "#333" : "#AAAFB5",
                                    // fontWeight: "bold",
                                }}
                            >
                                {modalContent?.winner}
                            </div>
                        </div>
                        <div style={{ display: "flex", marginBottom: 4 }}>
                            <div
                                style={{
                                    width: "40%",
                                    textAlign: "right",
                                    paddingRight: "10px",
                                    color: isLight ? "#333" : "#aaafb5",
                                }}
                            >
                                Odd/Even
                            </div>
                            <div
                                style={{
                                    width: "60%",
                                    textAlign: "left",
                                    paddingLeft: "10px",
                                    color: isLight ? "#333" : "#AAAFB5",
                                }}
                            >
                                {modalContent?.oddEven}
                            </div>
                        </div>
                        <div style={{ display: "flex", marginBottom: 4 }}>
                            <div
                                style={{
                                    width: "40%",
                                    textAlign: "right",
                                    paddingRight: "10px",
                                    color: isLight ? "#333" : "#aaafb5",
                                }}
                            >
                                Color
                            </div>
                            <div
                                style={{
                                    width: "60%",
                                    textAlign: "left",
                                    paddingLeft: "10px",
                                    color: isLight ? "#333" : "#AAAFB5",
                                }}
                            >
                                {modalContent?.color}
                            </div>
                        </div>
                        <div style={{ display: "flex", marginBottom: 4 }}>
                            <div
                                style={{
                                    width: "40%",
                                    textAlign: "right",
                                    paddingRight: "10px",
                                    color: isLight ? "#333" : "#aaafb5",
                                }}
                            >
                                Under/Over
                            </div>
                            <div
                                style={{
                                    width: "60%",
                                    textAlign: "left",
                                    paddingLeft: "10px",
                                    color: isLight ? "#333" : "#AAAFB5",
                                }}
                            >
                                {modalContent?.underOver}
                            </div>
                        </div>
                        <div style={{ display: "flex" }}>
                            <div
                                style={{
                                    width: "40%",
                                    textAlign: "right",
                                    paddingRight: "10px",
                                    color: isLight ? "#333" : "#aaafb5",
                                }}
                            >
                                Card
                            </div>
                            <div
                                style={{
                                    width: "60%",
                                    textAlign: "left",
                                    paddingLeft: "10px",
                                    color: "#AAAFB5",
                                }}
                            >
                                {modalContent?.card}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const parseDescription = (desc) => {
    if (!desc) {
        return {
            winner: "",
            oddEven: "",
            color: "",
            underOver: "",
            card: "",
        };
    }

    const separator = desc.includes("|") ? "|" : "#";
    const parts = desc.split(separator).map(p => p.trim());

    if (separator === "|") {
        // Pipe format: "Akbar | Black | Even | Over 7 | Card 8"
        const cardPart = parts[4] || "";
        const cardValue = cardPart.toLowerCase().startsWith("card")
            ? cardPart.substring(4).trim()
            : cardPart;

        return {
            winner: parts[0] || "",
            color: parts[1] || "",
            oddEven: parts[2] || "",
            underOver: parts[3] || "",
            card: cardValue || "",
        };
    }

    // Hash format: "Akbar#Even#Black#Over 7#8"
    return {
        winner: parts[0] || "",
        oddEven: parts[1] || "",
        color: parts[2] || "",
        underOver: parts[3] || "",
        card: parts[4] || "",
    };
};



const parseAAADescription = (desc) => {
    if (!desc) return null;

    if (desc.includes("|")) {
        const parts = desc.split("|").map((p) => p.trim());
        const cardPart = parts[4] || "";
        const cardValue = cardPart.toLowerCase().startsWith("card")
            ? cardPart.substring(4).trim()
            : cardPart;

        return {
            winner: parts[0] || "",
            color: parts[1] || "",
            oddEven: parts[2] || "",
            underOver: parts[3] || "",
            cardDesc: cardValue,
            isPipeFormat: true,
        };
    }
    return null;
};

export const formatResultData = (result) => {
    if (!result) return null;
    if (result.formatted) return result;

    let allCards = [];
    try {
        allCards = typeof result.cards === "string"
            ? JSON.parse(result.cards)
            : result.cards || [];
    } catch {
        allCards = [];
    }

    const rawMainCard = allCards[0] || null;

    const desc = parseDescription(result.desc_remakrs || result.result_desc || "");

    return {
        winner: desc.winner || "N/A",
        oddEven: desc.oddEven || "N/A",
        color: desc.color || "N/A",
        underOver: desc.underOver || "N/A",
        card: desc.card || rawMainCard,

        mainCard: rawMainCard,   // 👈 9CC
        cards: allCards,
        formatted: true,
    };
};


export default Result_AAA2;
