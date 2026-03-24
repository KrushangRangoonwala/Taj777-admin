import React, { useMemo } from "react";
import useIsMobile from "../../../hooks/useIsMobile";
import { useSelector } from "react-redux";
import Result_details from "./Result_details";

const Result_TeenPatti2Cards = ({ modalContent: response }) => {
    const isLight = useSelector(state => state.action.theme) === "light";
    const isMobile = useIsMobile();
    const modalContent = useMemo(() => {
        return Result_Format_Fn(response);
    }, [response]);

    const getCardImage = (cardCode) => {
        if (!cardCode || cardCode === "1")
            return "https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png";
        return `https://wver.sprintstaticdata.com/v190/static/front/img/cards/${cardCode}.png`;
    };

    if (!modalContent) return null;

    const resultData = [
        { label: "Winner", value: modalContent?.winner || "" },
        { label: "Mini Baccarat", value: modalContent?.miniBaccarat || "" },
        { label: "Total", value: modalContent?.total || "" },
        { label: "Color plus", value: modalContent?.colorPlus || "" },
    ]

    return (
        <div
            style={{
                // background: "#2e3439",
                padding: isMobile ? "3px" : "10px 12px 10px",
                overflowX: "hidden",
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
                                        </>
                                    )}
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            width: 1,
                            height: 130,
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

export const Result_Format_Fn = (result) => {
    if (!result) return null;
    if (result.formatted) return result;

    const desc = result.desc_remakrs || "";
    if (!desc) {
        return {
            winner: "",
            miniBaccarat: "",
            total: "",
            colorPlus: "",
        };
    }

    const parts = desc.split("#");
    const parsed = {
        winner: parts[0]?.trim() || "",
        miniBaccarat: parts[1]?.trim() || "",
        total: parts[2]?.trim() || "",
        colorPlus: parts[3]?.trim() || "",
    };

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

    let playerACards = [allCards[0], allCards[2]].filter(Boolean);
    let playerBCards = [allCards[1], allCards[3]].filter(Boolean);

    const isPlayerAWinner = parsed.winner?.includes("Player A") ?? false;
    const isPlayerBWinner = parsed.winner?.includes("Player B") ?? false;

    return {
        roundId: result.event_id || result.mid || "N/A",
        matchTime: result.time ? new Date(result.time).toLocaleString() : "N/A",
        ...parsed,
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
        formatted: true,
    };
};

export default Result_TeenPatti2Cards;
