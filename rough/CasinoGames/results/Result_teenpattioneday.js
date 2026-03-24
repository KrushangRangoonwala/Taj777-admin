import React, { useMemo } from "react";
import styles from "./Result_Superover3.module.css";
import useIsMobile from "../../../hooks/useIsMobile";

const Result_teenpattioneday = ({ modalContent: response, isLight }) => {
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
                padding: isMobile ? "10px" : "10px 12px 10px",
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
                    className={styles['casino-result-round']}
                    style={{
                        flexDirection: 'column',
                        alignItems: 'start',
                    }}
                >
                    <div>Round ID: {modalContent.roundId}</div>

                    <div>
                        Match Time:
                        <span>{' '}{modalContent.matchTime}</span>
                    </div>
                </div>
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
                                src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
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
                                    color: isLight ? "#222" : "#9ca3af",
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
                            margin: isMobile ? "0 10px" : "0 30px",
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
                                src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
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
                                    color: isLight ? "#222" : "#9ca3af",
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
                            background: isLight ? "#ddd" : "#444444",
                            borderRadius: 4,
                            padding: 12,
                            fontSize: 12,
                            color: isLight ? "#222" : "#9ca3af",
                        }}
                    >
                        <div style={{ display: "flex", marginBottom: 6 }}>
                            <div style={{ width: 80, textAlign: "right", paddingRight: 8 }}>
                                Winner
                            </div>
                            <div style={{ color: isLight ? "#000" : "#aaafb5" }}>
                                {modalContent?.winner || "N/A"}
                            </div>
                        </div>

                        <div style={{ display: "flex", marginBottom: 6 }}>
                            <div style={{ width: 80, textAlign: "right", paddingRight: 8 }}>
                                Odd/Even
                            </div>
                            <div style={{ color: isLight ? "#000" : "#aaafb5" }}>
                                {modalContent?.oddEven || "-"}
                            </div>
                        </div>

                        <div style={{ display: "flex", marginBottom: 0 }}>
                            <div style={{ width: 80, textAlign: "right", paddingRight: 8 }}>
                                Consecutive
                            </div>
                            <div style={{ color: isLight ? "#000" : "#aaafb5" }}>
                                {modalContent?.consecutive || "-"}
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
            consecutive: "",
        };
    }
    const parts = desc.split("#");
    return {
        winner: parts[0]?.trim() || "",
        oddEven: parts[2]?.trim() || "",
        consecutive: parts[3]?.trim() || "",
    };
};

export const formatResultData = (result) => {
    if (!result) return null;

    if (result.formatted) {
        return result;
    }

    const remarks = result.desc_remakrs || result.desc_remarks || "";
    const desc = parseDescription(remarks);

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
        winner: desc.winner || "N/A",
        oddEven: desc.oddEven,
        consecutive: desc.consecutive,
        formatted: true,
    };
};

export default Result_teenpattioneday;
