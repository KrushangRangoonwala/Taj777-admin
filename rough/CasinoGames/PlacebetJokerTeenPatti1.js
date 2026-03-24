import React, { useCallback } from "react";
import PlaceBet_KK from "./components/PlaceBet_KK";
import useIsMobile from "../../hooks/useIsMobile";
import Rules from "./components/Rules";
import RulesHeader from "./components/RulesHeader";
import { useSelector } from "react-redux";
import GameConfig from "./components/CasinoMap";
import { useGamePathName } from "../../hooks/useGetFileData";

const ruleList = [
    { label: "Card 9", value: "1 TO 3" },
    { label: "Card 8", value: "1 TO 4" },
    { label: "Card 7", value: "1 TO 5" },
    { label: "Card 6", value: "1 TO 8" },
    { label: "Card 5", value: "1 TO 30" },
];

const TeenPattijoker1ResultModalContent = ({ modalContent, onClose }) => {
    const isLight = useSelector(state => state.action.theme) === "light";
    const isMobile = useIsMobile();
    const getCardImage = (cardCode) => {
        if (!cardCode || cardCode === "1")
            return "https://wver.sprintstaticdata.com/v190/static/front/img/cards/1.png";
        return `https://wver.sprintstaticdata.com/v190/static/front/img/cards/${cardCode}.png`;
    };

    if (!modalContent) return null;

    return (
        <>
            <div
                style={{
                    background: "#1a6a48",
                    padding: "4px 12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    minHeight: "32px",
                }}
            >
                <span
                    style={{
                        color: "rgba(251, 191, 36, 1)",
                        fontSize: 17,
                        lineHeight: "1",
                    }}
                >
                    Unlimited Joker One Day Result
                </span>
                <span
                    onClick={onClose}
                    style={{
                        color: "#fff",
                        fontSize: 20,
                        lineHeight: "1",
                        cursor: "pointer",
                    }}
                >
                    ×
                </span>
            </div>

            <div
                style={{
                    background: isLight ? "#fff" : "#2e3439",
                    padding: "8px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    fontSize: 13,
                    color: isLight ? "#333" : "#9ca3af",
                }}
            >
                <span>Round ID: {modalContent?.roundId || "Loading..."}</span>
                <span>Match Time: {modalContent?.matchTime || "Loading..."}</span>
            </div>

            <div
                style={{
                    background: isLight ? "#fff" : "#2e3439",
                    padding: isMobile ? "10px" : "10px 12px 10px",
                    overflowX: "auto",
                }}
            >
                <div className="casino-result-content-item text-center" style={{ margin: "0px auto" }}>
                    <div className="casino-result-cards">
                        <div className="d-inline-block">
                            <h4 className="text-playerb" style={{ fontSize: 24 }}>Joker</h4>
                            <div className="casino-result-cards-item"><img
                                src="https://wver.sprintstaticdata.com/v207/static/front/img/joker1/joker.png" /></div>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        minWidth: isMobile ? "100%" : "800px",
                    }}
                >
                    {/* PLAYERS ROW */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            marginBottom: "15px",
                            width: "100%",
                        }}
                    >
                        {/* PLAYER A */}
                        <div
                            style={{
                                width: "45%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}
                            >
                                <div
                                    style={{
                                        // color: modalContent?.playerA?.isWinner ? "#fff" : "#9ca3af",
                                        color: "#9ca3af",
                                        fontSize: 26,
                                        marginBottom: 4,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {modalContent?.playerA?.name || "Player A"}
                                </div>
                                <div
                                    style={{ display: "flex", justifyContent: "center", gap: 8 }}
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

                        {/* DIVIDER */}
                        <div
                            style={{
                                width: 1,
                                height: 90,
                                background: "#4b5563",
                                margin: isMobile ? "0 10px" : "0 30px",
                            }}
                        />

                        {/* PLAYER B */}
                        <div
                            style={{
                                width: "45%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}
                            >
                                <span
                                    style={{
                                        // color: modalContent?.playerB?.isWinner ? "#fff" : "#9ca3af",
                                        color: "#9ca3af",
                                        fontSize: 26,
                                        marginBottom: 4,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {modalContent?.playerB?.name || "Player B"}
                                </span>

                                <div
                                    style={{ display: "flex", justifyContent: "center", gap: 8 }}
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

                    {/* INFO BOX (BOTTOM) */}
                    {/* <div style={{ width: "100%" }}>
                        <div
                            style={{
                                background: "#444444",
                                borderRadius: 4,
                                padding: 12,
                                fontSize: 12,
                                color: "#9ca3af",
                            }}
                        >
                            <div style={{ display: "flex", marginBottom: 6 }}>
                                <div style={{ width: 80, textAlign: "right", paddingRight: 8 }}>
                                    Winner
                                </div>
                                <div style={{ color: "#fff" }}>
                                    {modalContent?.winner || "N/A"}
                                </div>
                            </div>

                            <div style={{ display: "flex", marginBottom: 6 }}>
                                <div style={{ width: 80, textAlign: "right", paddingRight: 8 }}>
                                    Odd/Even
                                </div>
                                <div style={{ color: "#fff" }}>
                                    {modalContent?.oddEven || "-"}
                                </div>
                            </div>

                            <div style={{ display: "flex", marginBottom: 6 }}>
                                <div style={{ width: 80, textAlign: "right", paddingRight: 8 }}>
                                    Consecutive
                                </div>
                                <div style={{ color: "#fff" }}>
                                    {modalContent?.consecutive || "-"}
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>
        </>
    );
};

// Helper function to parse the description string into structured data
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
        oddEven: parts[1]?.trim() || "",
        consecutive: parts[2]?.trim() || "",
    };
};

const PlacebetJokerTeenPatti1 = ({
    betData,
    onSubmit,
    onClose,
    hideResults,
    gameType,
    onOpenBetUpdate,
}) => {
    const path = useGamePathName();
    const formatResultData = useCallback((result) => {
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
            console.warn("Failed to parse cards JSON:", result.cards);
            allCards = [];
        }

        let playerACards, playerBCards;
        // 20-20 Teenpatti Joker logic:
        // allCards[0] is likely the Joker (C1)
        // Player A gets C2, C4, C6 -> indices 1, 3, 5

        // Check for array length to determine distribution
        // Unlimited Joker 20-20 often has 7 cards (C1=Joker, C2,C4,C6=P1, C3,C5,C7=P2)
        // Or similar pattern. Assuming data array corresponds to C1..C7 order.
        if (allCards.length >= 7) {
            // Index 0 = C1 (Joker usually)
            // Indices 1, 3, 5 = Player A (C2, C4, C6)
            // Indices 2, 4, 6 = Player B (C3, C5, C7)
            playerACards = [allCards[1], allCards[3], allCards[5]].filter(Boolean);
            playerBCards = [allCards[2], allCards[4], allCards[6]].filter(Boolean);
        } else {
            // Standard or fallback (Standard Teen Patti usually 6 cards for 2 players or specialized)
            // If 6 cards: P1=0,2,4; P2=1,3,5
            playerACards = [allCards[0], allCards[2], allCards[4]].filter(Boolean);
            playerBCards = [allCards[1], allCards[3], allCards[5]].filter(Boolean);
        }

        const isPlayerAWinner = desc.winner?.includes("Player A") ?? false;
        const isPlayerBWinner = desc.winner?.includes("Player B") ?? false;

        return {
            roundId: result.event_id || result.mid || "N/A",
            matchTime: result.result_time,
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
            formatted: true,
        };
    }, []);

    const config = {
        marketType: "joker1",
        curPageName: "live_joker1.php",
        socketRoom: "joker1",
        resultApiType: "joker1",
        placeBetUrl: "bet_place_joker1.php",
        gtype: "joker1",
        placeBetParams: {
            eventType: "joker1",
            marketOddName: "joker1",
            betEventName: "joker1",
            betMarketType: "joker1",
        },
        // modalTitle: "Teenpatti Joker One Day Result",
        shouldClearOpenBetsOnResult: true,
        hideHeaderInfo: true,
        isNotPadding: true,
    };


    const details = GameConfig[path] || GameConfig.DEFAULT;
    const getResultTxt = details.getResultTxt || GameConfig.DEFAULT.getResultTxt;
    const getColorClass = details.getColorClass ?? GameConfig.DEFAULT.getColorClass;

    return (
        <PlaceBet_KK
            betData={betData}
            onSubmit={onSubmit}
            onClose={onClose}
            hideResults={hideResults}
            gameType={gameType}
            onOpenBetUpdate={onOpenBetUpdate}
            config={config}
            formatResultFn={formatResultData}
            ResultModal={TeenPattijoker1ResultModalContent}
            getResultTxt={getResultTxt}
            getColorClass={getColorClass}
            isHeaderInResult={false}
        />
    );
};

export default PlacebetJokerTeenPatti1;
