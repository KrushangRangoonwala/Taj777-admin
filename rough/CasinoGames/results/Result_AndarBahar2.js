import React, { useRef, useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useSelector } from 'react-redux';

// Helper function to parse the description string into structured data
const parseDescription = (desc) => {
    if (!desc) return { winner: "", cards: [], infos: [] };

    // Check for pipe delimiter (new format)
    if (desc.includes("|")) {
        const parts = desc.split("|");
        // Format assumption: Winner | Odd/Even Info | Extra Info | Single | Total

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

    // Fallback to old hash format
    const parts = desc.split("#");
    return {
        winner: parts[0]?.trim() || "",
        cards: parts[1]?.split("  ").filter(Boolean) || [],
        infos: parts
            .slice(2)
            .map((p) => p.trim())
            .filter(Boolean),
        isPipeFormat: false,
    };
};

const formatResultData = (result) => {
    if (!result) return null;

    // Parse the description
    const desc = parseDescription(result.desc_remakrs || "");

    // Parse cards from the API response (JSON string)
    const cardCodes = result.cards.split(",");
    // if (result.cards && typeof result.cards === "string") {
    //     try {
    //         const parsedCards = JSON.parse(result.cards);
    //         if (Array.isArray(parsedCards)) {
    //             cardCodes = parsedCards;
    //         }
    //     } catch (e) {
    //         console.error("Error parsing cards JSON:", e);
    //     }
    // }

    // console.log("@@ cardCodes", cardCodes);
    // if (cardCodes.length === 0 && desc.cards.length > 0) {
    //     cardCodes = desc.cards;
    // }

    // Extract Joker
    const jokerCard = cardCodes[0] || "";
    const gameCards = cardCodes.slice(1).filter(c => c && c.trim() !== "" && c !== "0" && c !== "1");

    const andarCards = [];
    const baharCards = [];

    // ABJ logic: 1st card goes to Bahar, 2nd to Andar...
    gameCards.forEach((code, index) => {
        if (index % 2 === 0) {
            baharCards.push({ code, index: index + 1 });
        } else {
            andarCards.push({ code, index: index + 1 });
        }
    });

    const getCardInfo = (code) => {
        if (!code) return { rank: "-", suit: "-" };
        const rankMatch = code.match(/^[0-9]+|^[A-Z]/);
        const rank = rankMatch ? rankMatch[0] : "-";
        const suitPart = code.replace(rank, "");
        const suitCode = suitPart ? suitPart[0] : "";
        const suitNames = { 'S': 'Spade', 'C': 'Club', 'H': 'Heart', 'D': 'Diamond' };
        return { rank, suit: suitNames[suitCode] || "-" };
    };

    const jokerInfo = getCardInfo(jokerCard);
    const isOdd = ["A", "3", "5", "7", "9", "J", "K"].includes(jokerInfo.rank);

    const winCode = result.result || result.win || result.result_status;
    let derivedWinner = winCode;
    if (winCode === "1") derivedWinner = "Andar";
    if (winCode === "2") derivedWinner = "Bahar";

    return {
        // roundId: result.event_id || result.mid || "N/A", // Handled by Result_Common
        // matchTime: result.time // Handled by Result_Common
        //     ? new Date(result.time).toLocaleString()
        //     : new Date().toLocaleString(),
        jokerCard,
        jokerRank: jokerInfo.rank,
        jokerSuit: jokerInfo.suit,
        jokerOddEven: isOdd ? "Odd" : "Even",
        andarCards,
        baharCards,
        winner: desc.winner || derivedWinner || "Unknown",
    };
};

const Result_AndarBahar2 = ({ modalContent }) => {
    const isLight = useSelector(state => state.action.theme) === "light";
    // Custom scroll logic for Result Modal
    const andarRowRef = useRef(null);
    const baharRowRef = useRef(null);

    const [scrollState, setScrollState] = useState({
        andarLeft: false,
        andarRight: false,
        baharLeft: false,
        baharRight: false,
    });

    const checkScroll = (ref, side) => {
        if (ref.current) {
            const { scrollLeft, scrollWidth, clientWidth } = ref.current;
            setScrollState(prev => ({
                ...prev,
                [`${side}Left`]: scrollLeft > 5,
                [`${side}Right`]: scrollLeft < scrollWidth - clientWidth - 5,
            }));
        }
    };

    const scrollRow = (ref, direction) => {
        if (ref.current) {
            const scrollAmount = 200;
            ref.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    let parsedData = null;
    if (modalContent) {
        try {
            const parsed = JSON.parse(modalContent.data);
            if (Array.isArray(parsed) && parsed.length > 0) {
                parsedData = parsed[0];
            }
        } catch (e) {
            console.error("Error parsing modalContent.data", e);
        }
    }

    const content = parsedData ? formatResultData(parsedData) : null;

    useEffect(() => {
        if (content) {
            const timer = setTimeout(() => {
                checkScroll(andarRowRef, "andar");
                checkScroll(baharRowRef, "bahar");
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [content]);

    useEffect(() => {
        const andar = andarRowRef.current;
        const bahar = baharRowRef.current;
        const onAndarScroll = () => checkScroll(andarRowRef, "andar");
        const onBaharScroll = () => checkScroll(baharRowRef, "bahar");

        if (andar) andar.addEventListener("scroll", onAndarScroll);
        if (bahar) bahar.addEventListener("scroll", onBaharScroll);

        return () => {
            if (andar) andar.removeEventListener("scroll", onAndarScroll);
            if (bahar) bahar.removeEventListener("scroll", onBaharScroll);
        };
    }, []);

    if (!modalContent) return null;
    if (!parsedData) return <div style={{ textAlign: "center", padding: "20px" }}>No data available</div>;
    if (!content) return null;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* GAME AREA */}
            <div style={{ display: "flex", alignItems: "center", padding: "15px", gap: "15px" }}>
                {/* Labels */}
                <div style={{ display: "flex", flexDirection: "column", gap: "25px", fontWeight: "bold", fontSize: "18px", color: "#aaa" }}>
                    <div>A</div>
                    <div style={{ color: "#aaa" }}>B</div>
                </div>

                {/* Joker */}
                <div style={{ textAlign: "center", marginRight: "15px" }}>
                    <img
                        src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${content.jokerCard || "1"}.png`}
                        alt="Joker"
                        style={{ width: "35px", height: "auto", borderRadius: "4px", background: "white" }}
                        onError={(e) => { e.target.src = "https://wver.sprintstaticdata.com/v69/static/front/img/cards/1.png"; }}
                    />
                </div>

                {/* Cards Rows */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", overflow: "hidden" }}>
                    {/* Andar Row */}
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        {/* Fixed first card */}
                        {content.andarCards?.length > 0 && (
                            <img
                                src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${content.andarCards[0].code}.png`}
                                width="40"
                                alt="A1"
                                style={{ borderRadius: "2px", border: "1px solid transparent", flexShrink: 0, marginRight: "10px" }}
                            />
                        )}
                        <div
                            onClick={() => scrollState.andarLeft && scrollRow(andarRowRef, "left")}
                            style={{
                                cursor: scrollState.andarLeft ? "pointer" : "default",
                                color: "#666",
                                flexShrink: 0,
                                margin: "0 18px",
                                opacity: scrollState.andarLeft ? 1 : 0.3
                            }}
                        >
                            <FaChevronLeft size={12} />
                        </div>
                        <div ref={andarRowRef} style={{ width: "130px", display: "flex", gap: "35px", overflow: "hidden", scrollBehavior: "smooth", marginLeft: "0px" }}>
                            {content.andarCards?.slice(1).map((c, idx) => (
                                c.code && (
                                    <img
                                        key={idx}
                                        src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${c.code}.png`}
                                        width="40"
                                        alt={c.code}
                                        style={{ borderRadius: "2px", border: "1px solid transparent", flexShrink: 0 }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                )
                            ))}
                        </div>
                        <div
                            onClick={() => scrollState.andarRight && scrollRow(andarRowRef, "right")}
                            style={{
                                cursor: scrollState.andarRight ? "pointer" : "default",
                                color: "#666",
                                flexShrink: 0,
                                margin: "0 8px",
                                opacity: scrollState.andarRight ? 1 : 0.3
                            }}
                        >
                            <FaChevronRight size={12} />
                        </div>
                        {content.winner === "Andar" && (
                            <img
                                src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
                                alt="Winner"
                                style={{ height: "40px", width: "auto", marginLeft: "5px", flexShrink: 0, filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))" }}
                            />
                        )}
                    </div>

                    {/* Bahar Row */}
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        {/* Fixed first card */}
                        {content.baharCards?.length > 0 && (
                            <img
                                src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${content.baharCards[0].code}.png`}
                                width="40"
                                alt="B1"
                                style={{ borderRadius: "2px", border: "1px solid transparent", flexShrink: 0, marginRight: "10px" }}
                            />
                        )}
                        <div
                            onClick={() => scrollState.baharLeft && scrollRow(baharRowRef, "left")}
                            style={{
                                cursor: scrollState.baharLeft ? "pointer" : "default",
                                color: "#666",
                                flexShrink: 0,
                                margin: "0 18px",
                                opacity: scrollState.baharLeft ? 1 : 0.3
                            }}
                        >
                            <FaChevronLeft size={12} />
                        </div>
                        <div ref={baharRowRef} style={{ width: "130px", display: "flex", gap: "35px", overflow: "hidden", scrollBehavior: "smooth", marginLeft: "0px" }}>
                            {content.baharCards?.slice(1).map((c, idx) => (
                                c.code && (
                                    <img
                                        key={idx}
                                        src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${c.code}.png`}
                                        width="40"
                                        alt={c.code}
                                        style={{ borderRadius: "2px", border: "1px solid transparent", flexShrink: 0 }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                )
                            ))}
                        </div>
                        <div
                            onClick={() => scrollState.baharRight && scrollRow(baharRowRef, "right")}
                            style={{
                                cursor: scrollState.baharRight ? "pointer" : "default",
                                color: "#666",
                                flexShrink: 0,
                                margin: "0 8px",
                                opacity: scrollState.baharRight ? 1 : 0.3
                            }}
                        >
                            <FaChevronRight size={12} />
                        </div>
                        {content.winner === "Bahar" && (
                            <img
                                src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
                                alt="Winner"
                                style={{ height: "40px", width: "auto", marginLeft: "5px", flexShrink: 0, filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))" }}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* FOOTER INFO BOX */}
            <div style={{ margin: "10px", padding: "10px", background: isLight ? "#ccc" : "#3a4146", borderRadius: "4px", border: isLight ? "1px solid #aaa" : "1px solid #444", fontSize: "14px", color: isLight ? "#222" : "#ccc" }}>
                {[
                    { label: "Winner", value: content.winner, color: content.winner === "Andar" ? "#aaa" : "#aaa" },
                    { label: "Suit", value: content.jokerSuit },
                    { label: "Odd/Even", value: content.jokerOddEven },
                    { label: "Joker", value: content.jokerRank },
                ].map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
                        <div style={{ width: "45%", textAlign: "right", color: "#888", marginRight: "10px" }}>{item.label}</div>
                        <div style={{ width: "45%", textAlign: "left", fontWeight: "bold", color: item.color || "#aaa" }}>{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Result_AndarBahar2;
