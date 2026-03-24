import React, { useMemo } from "react";
import { parseDescription } from "../components/PlaceBet_KK";

export const formatResultData = (result) => {
    if (!result) return null;
    if (result.formatted) return result;

    const desc = parseDescription(result.desc_remakrs || "");

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
    playerACards = [allCards[0], allCards[2], allCards[4]].filter(Boolean);
    playerBCards = [allCards[1], allCards[3], allCards[5]].filter(Boolean);

    const isPlayerAWinner = desc.winner?.includes("Player A") ?? false;
    const isPlayerBWinner = desc.winner?.includes("Player B") ?? false;

    return {
        roundId: result.event_id || result.mid || "N/A",
        matchTime: result.time ? new Date(result.time).toLocaleString() : "N/A",
        playerA: {
            name: "Player A",
            cards: playerACards,
            isWinner: isPlayerAWinner,
            consecutive: desc.consecutive?.includes("A : Yes") || false,
        },
        playerB: {
            name: "Player B",
            cards: playerBCards,
            isWinner: isPlayerBWinner,
            consecutive: desc.consecutive?.includes("B : Yes") || false,
        },
        oddEven: desc.oddEven.join(" "),
        consecutive: desc.consecutive,
        formatted: true,
    };
};

const Result_PokerT20 = ({ modalContent }) => {
    const data = useMemo(() => {
        return formatResultData(modalContent);
    }, [modalContent]);

    if (!data) return null;

    return (
        <div style={{ display: "flex", alignItems: "center", minWidth: "800px", padding: "10px 0" }}>
            {/* PLAYER A */}
            <div style={{ width: "30%", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", height: "100%" }}>
                {data.playerA.isWinner && (
                    <img
                        src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
                        alt="Winner"
                        style={{ height: "80px", width: "auto", filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))" }}
                    />
                )}
                <div>
                    <div style={{ color: data.playerA.isWinner ? "#fff" : "#9ca3af", fontSize: 26, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        {data.playerA.name}
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                        {data.playerA.cards.map((card, index) => (
                            <img
                                key={index}
                                src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${card}.png`}
                                width="38"
                                alt={card}
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png"; }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* DIVIDER */}
            <div style={{ width: 1, height: 90, background: "#4b5563", margin: "0 18px" }} />

            {/* PLAYER B */}
            <div style={{ width: "30%", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", height: "100%" }}>
                {data.playerB.isWinner && (
                    <img
                        src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
                        alt="Winner"
                        style={{ height: "80px", width: "auto", filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))" }}
                    />
                )}
                <div>
                    <div style={{ color: data.playerB.isWinner ? "#fff" : "#9ca3af", fontSize: 26, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        {data.playerB.name}
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                        {data.playerB.cards.map((card, index) => (
                            <img
                                key={index}
                                src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${card}.png`}
                                width="38"
                                alt={card}
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://wver.sprintstaticdata.com/v69/static/front/img/cards/back.png"; }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ width: 1, height: 90, background: "#4b5563", margin: "0 18px" }} />

            {/* INFO BOX */}
            <div style={{ width: "40%", paddingLeft: 14 }}>
                <div style={{ background: "#1f2937", borderRadius: 4, padding: 12, fontSize: 12, color: "#9ca3af" }}>
                    <div style={{ display: "flex", marginBottom: 6 }}>
                        <div style={{ width: 80, textAlign: "right", paddingRight: 8 }}>Winner</div>
                        <div style={{ color: "#fff" }}>{data.playerA.isWinner ? "Player A" : data.playerB.isWinner ? "Player B" : "N/A"}</div>
                    </div>
                    <div style={{ display: "flex", marginBottom: 6 }}>
                        <div style={{ width: 80, textAlign: "right", paddingRight: 8 }}>Odd/Even</div>
                        <div style={{ color: "#fff" }}>{data.oddEven || "N/A"}</div>
                    </div>
                    <div style={{ display: "flex" }}>
                        <div style={{ width: 80, textAlign: "right", paddingRight: 8 }}>Consecutive</div>
                        <div style={{ color: "#fff" }}>A: {data.playerA.consecutive ? "Yes" : "No"} | B: {data.playerB.consecutive ? "Yes" : "No"}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result_PokerT20;
