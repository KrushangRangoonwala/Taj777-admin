import React, { useMemo } from "react";
import useIsMobile from "../../../hooks/useIsMobile";

const Result_MuflisTeenPatti = ({ modalContent: response }) => {
    const isMobile = useIsMobile();
    const modalContent = useMemo(() => {
        return formatResultData(response);
    }, [response]);

    const getCardImage = (cardCode) => {
        if (!cardCode || cardCode === "1")
            return "https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png";
        return `https://wver.sprintstaticdata.com/v190/static/front/img/cards/${cardCode}.png`;
    };

    if (!modalContent) return null;

    return (
        <div
            style={{
                background: "#2e3439",
                padding: isMobile ? "0px" : "10px 2px 10px",
                overflowX: "auto",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    minWidth: isMobile ? "100%" : "800px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: "15px",
                        width: "100%",
                    }}
                >
                    <div
                        style={{
                            width: "45%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        {modalContent?.playerA?.isWinner && (
                            <img
                                src="https://wver.sprintstaticdata.com/v199/static/front/img/winner.png"
                                width={isMobile ? "60" : "50"}
                                alt="Winner"

                            />
                        )}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <div
                                style={{
                                    color: "#9ca3af",
                                    fontSize: 26,
                                    marginBottom: 4,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {modalContent?.playerA?.name || "Player A"}
                            </div>
                            <div
                                style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 6 }}
                            >
                                {modalContent?.playerA?.cards?.map((card, index) => (
                                    <img
                                        key={index}
                                        src={getCardImage(card)}
                                        width="25"
                                        alt={card}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                                "https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png";
                                        }}
                                    />
                                )) || (
                                        <>
                                            <img
                                                src="https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png"
                                                width="25"
                                                alt="Back"
                                            />
                                            <img
                                                src="https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png"
                                                width="25"
                                                alt="Back"
                                            />
                                            <img
                                                src="https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png"
                                                width="25"
                                                alt="Back"
                                            />
                                        </>
                                    )}
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            width: 1,
                            height: 90,
                            background: "#4b5563",
                            margin: isMobile ? "0 2px" : "0 30px",
                        }}
                    />

                    <div
                        style={{
                            width: "45%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        {modalContent?.playerB?.isWinner && (
                            <img
                                src="https://wver.sprintstaticdata.com/v199/static/front/img/winner.png"
                                width={isMobile ? "60" : "50"}
                                alt="Winner"

                            />
                        )}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <span
                                style={{
                                    color: "#9ca3af",
                                    fontSize: 26,
                                    marginBottom: 4,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {modalContent?.playerB?.name || "Player B"}
                            </span>

                            <div
                                style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 6 }}
                            >
                                {modalContent?.playerB?.cards?.map((card, index) => (
                                    <img
                                        key={index}
                                        src={getCardImage(card)}
                                        width="25"
                                        alt={card}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                                "https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png";
                                        }}
                                    />
                                )) || (
                                        <>
                                            <img
                                                src="https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png"
                                                width="25"
                                                alt="Back"
                                            />
                                            <img
                                                src="https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png"
                                                width="25"
                                                alt="Back"
                                            />
                                            <img
                                                src="https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png"
                                                width="25"
                                                alt="Back"
                                            />
                                        </>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ width: "100%" }}>
                    <div
                        style={{
                            background: "#444444",
                            borderRadius: 4,
                            padding: 12,
                            fontSize: 12,
                            color: "#9ca3af",
                        }}
                    >
                        <div style={{ display: "flex", marginBottom: 6, marginLeft: "55px" }}>
                            <div style={{ width: 80, textAlign: "right", paddingRight: 8, opacity: 0.6 }}>
                                Winner
                            </div>
                            <div style={{ color: "#aaafb5" }}>
                                {modalContent?.winner || "N/A"}
                            </div>
                        </div>

                        <div style={{ display: "flex", marginBottom: 6, marginLeft: "65px" }}>
                            <div style={{ width: 80, textAlign: "right", paddingRight: 8, opacity: 0.6 }}>
                                Top 9
                            </div>
                            <div style={{ color: "#aaafb5" }}>
                                {modalContent?.top9 || "-"}
                            </div>
                        </div>

                        <div style={{ display: "flex", marginBottom: 6, marginLeft: "45px" }}>
                            <div style={{ width: 80, textAlign: "right", paddingRight: 8, opacity: 0.6 }}>
                                M Baccarat
                            </div>
                            <div style={{ color: "#aaafb5" }}>
                                {modalContent?.baccarat || "-"}
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
            top9: "",
            baccarat: "",
        };
    }
    const parts = desc.split("#");
    return {
        winner: parts[0]?.trim() || "",
        top9: parts[1]?.trim() || "",
        baccarat: parts[2]?.trim() || "",
    };
};

export const formatResultData = (result) => {
    if (!result) return null;

    if (result.formatted) {
        return result;
    }

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
        },
        playerB: {
            name: "Player B",
            cards: playerBCards,
            isWinner: isPlayerBWinner,
        },
        winner: desc.winner || "Unknown",
        top9: desc.top9,
        baccarat: desc.baccarat,
        formatted: true,
    };
};

export default Result_MuflisTeenPatti;
