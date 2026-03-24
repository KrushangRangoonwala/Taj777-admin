import React, { useMemo } from "react";
import useIsMobile from "../../../hooks/useIsMobile";

const cardCodeForImage = (card) => {
    if (!card) return null;

    const c = card.toUpperCase().trim();

    // Backend sends: ACC, AHH, KDD → image wants AC, AH, KD
    if (c.length === 3) {
        return c.slice(0, 2);
    }

    return c;
};


const Result_BollywoodCasino2 = ({ modalContent: response }) => {
    const isMobile = useIsMobile();
    const modalContent = useMemo(() => {
        return formatResultData(response);
    }, [response]);

    console.log(modalContent);

    if (!modalContent) return null;

    return (
        <div style={{ padding: "10px 12px", overflowX: "auto" }} className="result-32cards-container">
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
                        backgroundColor: "#444444",
                    }}
                >
                    <div
                        style={{
                            borderRadius: 4,
                            padding: "8px 12px",
                            fontSize: 13,
                        }}
                        className="info-box text-grey-light"
                    >
                        <div style={{ display: "flex", marginBottom: 4 }}>
                            <div
                                style={{
                                    width: "40%",
                                    textAlign: "right",
                                    paddingRight: "10px",
                                }}
                                className="text-grey-light"
                            >
                                Winner
                            </div>
                            <div
                                style={{
                                    width: "60%",
                                    textAlign: "left",
                                    paddingLeft: "10px",
                                    // fontWeight: "bold",
                                }}
                                className="text-grey-light"
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
                                }}
                                className="text-grey-light"
                            >
                                Odd
                            </div>
                            <div
                                style={{
                                    width: "60%",
                                    textAlign: "left",
                                    paddingLeft: "10px",
                                }}
                                className="text-grey-light"
                            >
                                {modalContent?.cardDisplay || modalContent?.mainCard}
                            </div>
                        </div>
                        <div style={{ display: "flex", marginBottom: 4 }}>
                            <div
                                style={{
                                    width: "40%",
                                    textAlign: "right",
                                    paddingRight: "10px",
                                }}
                                className="text-grey-light"
                            >
                                Dulha Dulhan/Barati
                            </div>
                            <div
                                style={{
                                    width: "60%",
                                    textAlign: "left",
                                    paddingLeft: "10px",
                                }}
                                className="text-grey-light"
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
                                }}
                                className="text-grey-light"
                            >
                                Color
                            </div>
                            <div
                                style={{
                                    width: "60%",
                                    textAlign: "left",
                                    paddingLeft: "10px",
                                }}
                                className="text-grey-light"
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
                                }}
                                className="text-grey-light"
                            >
                                Card
                            </div>
                            <div
                                style={{
                                    width: "60%",
                                    textAlign: "left",
                                    paddingLeft: "10px",
                                }}
                                className="text-grey-light"
                            >
                                {modalContent?.color}
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
            odd: "",
            dulhaBarati: "",
            color: "",
            card: "",
        };
    }

    const parts = desc.split("#").map(p => p.trim());

    return {
        winner: parts[0] || "",
        odd: parts[1] || "",
        dulhaBarati: parts[2] || "",
        color: parts[3] || "",
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

    const desc = parseDescription(result.desc_remakrs || "");

    return {
        winner: desc.winner || "N/A",
        cardDisplay: desc.odd || rawMainCard,
        oddEven: desc.dulhaBarati || "N/A",
        underOver: desc.color || "N/A",
        color: desc.card || rawMainCard,

        mainCard: rawMainCard,                 // 👈 shows ACC in UI text
        mainCardImage: cardCodeForImage(rawMainCard), // 👈 AC for image only

        cards: allCards,
        formatted: true,
    };
};



export default Result_BollywoodCasino2;
