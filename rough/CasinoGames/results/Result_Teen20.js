import React, { useMemo } from "react";
import useIsMobile from "../../../hooks/useIsMobile";

// Helper function to parse the description string into structured data
const parseDescription = (desc) => {
    if (!desc) {
        return {
            winner: "",
            baccarat: "",
            total: "",
            pairPlus: "",
            redBlack: "",
        };
    }
    const parts = desc.split("#");
    return {
        winner: parts[0]?.trim() || "",
        baccarat: parts[1]?.trim() || "",
        total: parts[2]?.trim() || "",
        pairPlus: parts[3]?.trim() || "",
        redBlack: parts[4]?.trim() || "",
    };
};

export const formatResultData = (result) => {
    if (!result) return null;
    if (result.formatted) return result;

    const remarks = result.desc_remakrs || result.desc_remarks || "";
    // Parse the description
    const desc = parseDescription(remarks);

    // Parse cards from the API response
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

    // Split cards between Player A and B
    // Interleaved cards: A, B, A, B, A, B
    const playerACards = [allCards[0], allCards[2], allCards[4]].filter(Boolean);
    const playerBCards = [allCards[1], allCards[3], allCards[5]].filter(Boolean);

    const isPlayerAWinner = desc.winner?.includes("Player A") ?? false;
    const isPlayerBWinner = desc.winner?.includes("Player B") ?? false;

    return {
        roundId: result.event_id || result.mid || "N/A",
        matchTime: result.time ? new Date(result.time).toLocaleString() : "N/A",
        playerA: {
            name: "Player A",
            cards: playerACards,
            isWinner: isPlayerAWinner,
        },
        playerB: {
            name: "Player B",
            cards: playerBCards,
            isWinner: isPlayerBWinner,
        },
        winner: desc.winner || "Unknown",
        baccarat: desc.baccarat,
        total: desc.total,
        pairPlus: desc.pairPlus,
        redBlack: desc.redBlack,
        formatted: true,
    };
};

const Result_Teen20 = ({ modalContent: response }) => {
    const isMobile = useIsMobile();
    const modalContent = useMemo(() => {
        return formatResultData(response);
    }, [response]);

    if (!modalContent) return null;

    return (
        <div style={{ padding: "10px 12px", overflowX: "auto" }}>
            <div
                style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "100%",
                }}
            >
                {/* PLAYER A */}
                <div style={{ width: isMobile ? "100%" : "30%", textAlign: "center", marginBottom: isMobile ? "15px" : "0" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 8,
                        }}
                    >
                        {modalContent.playerA.isWinner && (
                            <img
                                src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
                                width="36"
                                alt="Winner"
                                style={{
                                    filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))",
                                }}
                            />
                        )}
                        <span
                            style={{
                                color: modalContent.playerA.isWinner ? "#fff" : "#9ca3af",
                                fontSize: 26,
                            }}
                        >
                            {modalContent.playerA.name}
                        </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                        {modalContent.playerA.cards.length > 0 ? (
                            modalContent.playerA.cards.map((card, index) => (
                                <img
                                    key={index}
                                    src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${card}.png`}
                                    width="38"
                                    alt={card}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png";
                                    }}
                                />
                            ))
                        ) : (
                            <BackCards count={3} />
                        )}
                    </div>
                </div>

                {/* DIVIDER - Desktop only */}
                {!isMobile && (
                    <div
                        style={{
                            width: 1,
                            height: 90,
                            background: "#4b5563",
                            margin: "0 18px",
                        }}
                    />
                )}

                {/* PLAYER B */}
                <div style={{ width: isMobile ? "100%" : "30%", textAlign: "center", marginBottom: isMobile ? "15px" : "0" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 8,
                        }}
                    >
                        {modalContent.playerB.isWinner && (
                            <img
                                src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
                                width="36"
                                alt="Winner"
                                style={{
                                    filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))",
                                }}
                            />
                        )}
                        <span
                            style={{
                                color: modalContent.playerB.isWinner ? "#fff" : "#9ca3af",
                                fontSize: 26,
                            }}
                        >
                            {modalContent.playerB.name}
                        </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                        {modalContent.playerB.cards.length > 0 ? (
                            modalContent.playerB.cards.map((card, index) => (
                                <img
                                    key={index}
                                    src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${card}.png`}
                                    width="38"
                                    alt={card}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png";
                                    }}
                                />
                            ))
                        ) : (
                            <BackCards count={3} />
                        )}
                    </div>
                </div>

                {/* INFO BOX */}
                <div style={{ width: isMobile ? "100%" : "40%", paddingLeft: isMobile ? 0 : 14 }}>
                    <div
                        style={{
                            background: "#1f2937",
                            borderRadius: 4,
                            padding: 12,
                            fontSize: 12,
                            color: "#9ca3af",
                        }}
                    >
                        <InfoRow label="Winner" value={modalContent.winner} bold />
                        {modalContent.baccarat && (
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
                        )}
                        {modalContent.total && <InfoRow label="Total" value={modalContent.total} />}
                        {modalContent.pairPlus && <InfoRow label="Pair Plus" value={modalContent.pairPlus} />}
                        {modalContent.redBlack && <InfoRow label="Red Black" value={modalContent.redBlack} isLast />}
                    </div>
                </div>
            </div>
        </div>
    );
};

const BackCards = ({ count }) => (
    <>
        {[...Array(count)].map((_, i) => (
            <img
                key={i}
                src="https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png"
                width="38"
                alt="Back"
            />
        ))}
    </>
);

const InfoRow = ({ label, value, bold = false, isLast = false }) => (
    <div style={{ display: "flex", marginBottom: isLast ? 0 : 6 }}>
        <div style={{ width: 80, textAlign: "right", paddingRight: 8 }}>{label}</div>
        <div style={{ color: "#fff", fontWeight: bold ? "bold" : "normal" }}>{value}</div>
    </div>
);

export default Result_Teen20;
