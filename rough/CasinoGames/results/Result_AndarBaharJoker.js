import React, { useMemo, useRef } from "react";
import useIsMobile from "../../../hooks/useIsMobile";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

/**
 * Enhanced formatter for Andar Bahar result data.
 * Handles different API response formats and description strings.
 */
export const formatResultData = (result) => {
    if (!result) return null;

    // Helper to parse description string (common in legacy systems)
    const parseDescription = (desc) => {
        if (!desc) return { winner: "", cards: [], infos: [] };

        // New Pipe Format: Winner | Odd/Even Info | Extra Info | Single | Total
        if (desc.includes("|")) {
            const parts = desc.split("|");
            return {
                winner: parts[0]?.trim() || "",
                cards: [],
                oddEvenStr: parts[1] || "",
                blackRedStr: parts[2] || "",
                single: parts[3] || "-",
                total: parts[4] || "-",
                isPipeFormat: true,
                infos: [],
            };
        }

        // Old Hash Format: Winner # Cards # ExtraInfo1 # ExtraInfo2...
        const parts = desc.split("#");
        return {
            winner: parts[0]?.trim() || "",
            cards: parts[1]?.split("  ").filter(Boolean) || [],
            infos: parts.slice(2).map((p) => p.trim()).filter(Boolean),
            isPipeFormat: false,
        };
    };

    const desc = parseDescription(result.desc_remakrs || "");

    // Extract Card Codes (prioritize API field, fallback to description)
    let cardCodes = [];
    if (result.cards) {
        if (typeof result.cards === "string") {
            try {
                // Handle JSON array string: "[\"JSS\",\"9DD\"]"
                if (result.cards.startsWith("[")) {
                    cardCodes = JSON.parse(result.cards);
                } else {
                    // Handle comma-separated string: "JSS,9DD"
                    cardCodes = result.cards.split(",").map(c => c.trim()).filter(Boolean);
                }
            } catch (e) {
                // Fallback split
                cardCodes = result.cards.split(",").map(c => c.trim()).filter(Boolean);
            }
        } else if (Array.isArray(result.cards)) {
            cardCodes = result.cards;
        }
    }

    // Fallback to cards found in description if API cards field is empty
    if (cardCodes.length === 0 && desc.cards.length > 0) {
        cardCodes = desc.cards;
    }

    // Process cards into Andar/Bahar rows
    const jokerCard = cardCodes[0] || "1"; // '1' is the back of card or empty placeholder
    const gameCards = cardCodes.slice(1).filter(c => c && c.trim() !== "" && c !== "0" && c !== "1");

    const andarCards = [];
    const baharCards = [];

    // In Andar Bahar Joker (ABJ/AB2), 1st card goes to Bahar, 2nd to Andar (alternating)
    gameCards.forEach((code, index) => {
        if (index % 2 === 0) {
            baharCards.push({ code, index: index + 1 });
        } else {
            andarCards.push({ code, index: index + 1 });
        }
    });

    // Extract card properties (Rank, Suit) for the Joker
    const getCardInfo = (code) => {
        if (!code || code === "1") return { rank: "-", suit: "-" };
        const rankMatch = code.match(/^[0-9]+|^[A-Z]/);
        const rank = rankMatch ? rankMatch[0] : "-";
        const suitPart = code.replace(rank, "");
        const suitCode = suitPart ? suitPart[0] : "";
        const suitNames = { 'S': 'Spade', 'C': 'Club', 'H': 'Heart', 'D': 'Diamond' };
        return { rank, suit: suitNames[suitCode] || "-" };
    };

    const jokerInfo = getCardInfo(jokerCard);
    const isOdd = ["A", "3", "5", "7", "9", "J", "K"].includes(jokerInfo.rank);

    // Determine Winner
    const winCode = result.result || result.win || result.result_status;
    let derivedWinner = winCode === "1" ? "Andar" : winCode === "2" ? "Bahar" : winCode;

    return {
        roundId: result.event_id || result.mid || "N/A",
        matchTime: result.time ? new Date(result.time).toLocaleString() : new Date().toLocaleString(),
        jokerCard,
        jokerRank: jokerInfo.rank,
        jokerSuit: jokerInfo.suit,
        jokerOddEven: isOdd ? "Odd" : "Even",
        andarCards,
        baharCards,
        winner: desc.winner || derivedWinner || "Unknown",
        formatted: true,
    };
};

const Result_AndarBaharJoker = ({ modalContent }) => {
    const isMobile = useIsMobile();
    const andarRowRef = useRef(null);
    const baharRowRef = useRef(null);

    const details = useMemo(() => {
        if (!modalContent) return null;

        // Support pre-formatted data
        if (modalContent.formatted) return modalContent;

        // Support raw structure (sometimes wrapped in an object)
        let data = modalContent;
        if (modalContent.data && typeof modalContent.data === "string") {
            try {
                const parsed = JSON.parse(modalContent.data);
                data = Array.isArray(parsed) ? parsed[0] : parsed;
            } catch (e) { }
        } else if (Array.isArray(modalContent)) {
            data = modalContent[0];
        }

        return formatResultData(data);
    }, [modalContent]);

    const scrollRow = (ref, direction) => {
        if (ref.current) {
            const scrollAmount = 200;
            ref.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    if (!details) return null;

    const winnerColor = details.winner === "Andar" ? "#72bbef" : details.winner === "Bahar" ? "#f994ba" : "#AAAFB5";

    return (
        <div style={{ padding: isMobile ? "10px" : "15px", background: "#2e3439", color: "#fff", fontFamily: "sans-serif" }}>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "15px" }}>
                {/* Visual Area (Joker & Cards) */}
                <div style={{ flex: "3", display: "flex", flexDirection: "column", gap: "12px" }}>

                    {/* Joker Display */}
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                        <div style={{ width: "80px", color: "#fdcf13", fontWeight: "bold", fontSize: "14px" }}>JOKER</div>
                        <div style={{ background: '#fff', padding: '2px', borderRadius: '4px', display: 'flex' }}>
                            <img
                                src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${details.jokerCard}.png`}
                                width="40"
                                height="56"
                                alt="Joker"
                                onError={(e) => { e.target.src = "https://wver.sprintstaticdata.com/v69/static/front/img/cards/1.png"; }}
                            />
                        </div>
                    </div>

                    {/* Andar Row Display */}
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ width: "80px", color: "#9ca3af", fontWeight: "600", fontSize: "13px" }}>ANDAR</div>
                        <div onClick={() => scrollRow(andarRowRef, "left")} style={{ cursor: "pointer", color: "#9ca3af", padding: "0 8px" }}><FaChevronLeft size={14} /></div>
                        <div ref={andarRowRef} style={{ display: "flex", gap: "10px", overflowX: "hidden", scrollBehavior: "smooth", padding: "2px 0" }}>
                            {details.andarCards.map((card, idx) => (
                                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "35px" }}>
                                    <span style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "2px" }}>{card.index}</span>
                                    <img
                                        src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${card.code}.png`}
                                        width="35"
                                        height="49"
                                        alt={card.code}
                                        style={{ borderRadius: '2px', boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div onClick={() => scrollRow(andarRowRef, "right")} style={{ cursor: "pointer", color: "#9ca3af", padding: "0 8px" }}><FaChevronRight size={14} /></div>
                    </div>

                    {/* Bahar Row Display */}
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ width: "80px", color: "#9ca3af", fontWeight: "600", fontSize: "13px" }}>BAHAR</div>
                        <div onClick={() => scrollRow(baharRowRef, "left")} style={{ cursor: "pointer", color: "#9ca3af", padding: "0 8px" }}><FaChevronLeft size={14} /></div>
                        <div ref={baharRowRef} style={{ display: "flex", gap: "10px", overflowX: "hidden", scrollBehavior: "smooth", padding: "2px 0" }}>
                            {details.baharCards.map((card, idx) => (
                                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "35px" }}>
                                    <span style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "2px" }}>{card.index}</span>
                                    <img
                                        src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${card.code}.png`}
                                        width="35"
                                        height="49"
                                        alt={card.code}
                                        style={{ borderRadius: '2px', boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div onClick={() => scrollRow(baharRowRef, "right")} style={{ cursor: "pointer", color: "#9ca3af", padding: "0 8px" }}><FaChevronRight size={14} /></div>
                    </div>
                </div>

                {/* Summary / Info Panel */}
                <div style={{ flex: "1.2", background: "#374151", padding: "12px", borderRadius: "6px", display: "flex", flexDirection: "column", justifyContent: "center", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)" }}>
                    {[
                        { label: "Winner", value: details.winner, color: winnerColor },
                        { label: "Suit", value: details.jokerSuit },
                        { label: "Odd/Even", value: details.jokerOddEven },
                        { label: "Joker", value: details.jokerRank },
                    ].map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "13px", borderBottom: i < 3 ? "1px solid #4b5563" : "none" }}>
                            <div style={{ color: "#9ca3af" }}>{item.label}</div>
                            <div style={{ fontWeight: "bold", color: item.color || "#e5e7eb" }}>{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Result_AndarBaharJoker;
