import React, { useMemo } from "react";
import useIsMobile from "../../../hooks/useIsMobile";
import Result_details from "./Result_details";
import { useSelector } from "react-redux";

const Result_TeenPattiJoker20 = ({ modalContent: response }) => {
    const isLight = useSelector(state => state.action.theme) === "light";
    const isMobile = useIsMobile();
    const modalContent = useMemo(() => {
        return formatResultData(response);
    }, [response]);

    const getCardImage = (cardCode) => {
        if (!cardCode || cardCode === "1")
            return "https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png";
        return `https://wver.sprintstaticdata.com/v190/static/front/img/cards/${cardCode}.png`;
    };

    const resultData = [
        { label: "Winner", value: modalContent?.winner || "" },
        { label: "Odd/Even", value: modalContent?.oddEven || "" },
        { label: "Color", value: modalContent?.consecutive || "" },
        { label: "Suit", value: modalContent?.suit || "" },
    ]

    if (!modalContent) return null;

    return (
        <div
            style={{
                // background: "#2e3439",
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
                {/* Joker Card Section */}
                {modalContent?.jokerCard && (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            marginBottom: "15px",
                        }}
                    >
                        <div
                            style={{
                                color: "#fdcf13",
                                fontSize: "24px",
                                marginBottom: "8px",
                                fontWeight: 500,
                            }}
                        >
                            Joker
                        </div>
                        <img
                            src={getCardImage(modalContent.jokerCard)}
                            // width="28"
                            alt="Joker"
                            style={{ width: "25px", marginRight: '2px' }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                    "https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png";
                            }}
                        />
                    </div>
                )}

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
                                    color: isLight ? "#333" : "#9ca3af",
                                    fontSize: 26,
                                    marginBottom: 14,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {modalContent?.playerA?.name || "Player A"}
                            </div>
                            <div
                                style={{ display: "flex", justifyContent: "center", gap: 6 }}
                            >
                                {modalContent?.playerA?.cards?.map((card, index) => (
                                    <img
                                        key={index}
                                        src={getCardImage(card)}
                                        // width="22"
                                        alt={card}
                                        style={{ width: "25px", marginRight: '2px' }}
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
                                                // width="25"
                                                alt="Back"
                                                style={{ width: "25px", marginRight: '2px' }}
                                            />
                                            <img
                                                src="https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png"
                                                // width="22"
                                                alt="Back"
                                                style={{ width: "25px", marginRight: '2px' }}
                                            />
                                            <img
                                                src="https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png"
                                                // width="22"
                                                alt="Back"
                                                style={{ width: "25px", marginRight: '2px' }}
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
                                    color: isLight ? "#333" : "#9ca3af",
                                    fontSize: 26,
                                    marginBottom: 14,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {modalContent?.playerB?.name || "Player B"}
                            </span>

                            <div
                                style={{ display: "flex", justifyContent: "center", gap: 6 }}
                            >
                                {modalContent?.playerB?.cards?.map((card, index) => (
                                    <img
                                        key={index}
                                        src={getCardImage(card)}
                                        // width="22"
                                        alt={card}
                                        style={{ width: "25px", marginRight: '2px' }}
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
                                                // width="22"
                                                alt="Back"
                                                style={{ width: "25px", marginRight: '2px' }}
                                            />
                                            <img
                                                src="https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png"
                                                // width="22"
                                                alt="Back"
                                                style={{ width: "25px", marginRight: '2px' }}
                                            />
                                            <img
                                                src="https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png"
                                                // width="22"
                                                alt="Back"
                                                style={{ width: "25px", marginRight: '2px' }}
                                            />
                                        </>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row row5"><Result_details resultData={resultData} /></div>
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
            suit: "",
        };
    }
    const parts = desc.split("#");
    return {
        winner: parts[0]?.trim() || "",
        oddEven: parts[1]?.trim() || "",
        consecutive: parts[2]?.trim() || "",
        suit: parts[3]?.trim() || "",
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

    let playerACards, playerBCards, jokerCard;
    // Joker index logic from original component:
    // Index 0: Joker card
    // Player A indices: 1, 3, 5
    // Player B indices: 2, 4, 6
    if (allCards.length >= 7) {
        jokerCard = allCards[0];
        playerACards = [allCards[1], allCards[3], allCards[5]].filter(Boolean);
        playerBCards = [allCards[2], allCards[4], allCards[6]].filter(Boolean);
    } else {
        playerACards = [allCards[0], allCards[2], allCards[4]].filter(Boolean);
        playerBCards = [allCards[1], allCards[3], allCards[5]].filter(Boolean);
    }

    const isPlayerAWinner = desc.winner?.includes("Player A") ?? false;
    const isPlayerBWinner = desc.winner?.includes("Player B") ?? false;

    return {
        roundId: result.event_id || result.mid || "N/A",
        matchTime: result.time ? new Date(result.time).toLocaleString() : "N/A",
        jokerCard: jokerCard || null,
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
        oddEven: desc.oddEven,
        consecutive: desc.consecutive,
        suit: desc.suit,
        formatted: true,
    };
};

export default Result_TeenPattiJoker20;
