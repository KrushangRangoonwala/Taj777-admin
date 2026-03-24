import React, { useMemo, useRef, useState, useEffect } from "react";
import useIsMobile from "../../../hooks/useIsMobile";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const parseDescription = (desc) => {
    if (!desc) return { winner: "", cards: [], infos: [] };
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
    const parts = desc.split("#");
    return {
        winner: parts[0]?.trim() || "",
        cards: parts[1]?.split("  ").filter(Boolean) || [],
        infos: parts.slice(2).map((p) => p.trim()).filter(Boolean),
        isPipeFormat: false,
    };
};

export const formatResultData = (result) => {
    if (!result) return null;
    const desc = parseDescription(result.desc_remakrs || "");
    let cardCodes = [];

    if (result.cards) {
        const rawCards = typeof result.cards === "string" ? result.cards.trim() : "";
        if (rawCards.startsWith("[") || rawCards.startsWith("{")) {
            try {
                const parsed = JSON.parse(rawCards);
                cardCodes = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
                cardCodes = rawCards.split(",").map(c => c.trim()).filter(Boolean);
            }
        } else if (typeof result.cards === "string") {
            cardCodes = result.cards.split(",").map(c => c.trim()).filter(Boolean);
        } else if (Array.isArray(result.cards)) {
            cardCodes = result.cards;
        }
    }

    if (cardCodes.length === 0 && desc.cards.length > 0) cardCodes = desc.cards;

    // Separate Joker and Game Cards
    // The first card is the Joker. Remaining are game cards.
    const gameCards = cardCodes.slice(1).filter(c => c && c.trim() !== "" && c !== "0" && c !== "1" && c !== "*");

    const andarCards = [];
    const baharCards = [];

    // Alternating logic: 1st card to Bahar, 2nd to Andar...
    gameCards.forEach((code, index) => {
        if (index % 2 === 0) baharCards.push({ code, index: index + 1 });
        else andarCards.push({ code, index: index + 1 });
    });

    const winCode = result.result || result.win || result.result_status;
    let derivedWinner = winCode === "1" ? "Andar" : winCode === "2" ? "Bahar" : winCode;

    return {
        roundId: result.event_id || result.mid || "N/A",
        matchTime: result.time ? new Date(result.time).toLocaleString() : new Date().toLocaleString(),
        andarCards,
        baharCards,
        winner: desc.winner || derivedWinner || "Unknown",
        formatted: true,
    };
};

const Result_AndarBahar = ({ modalContent }) => {
    const isMobile = useIsMobile();
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

    // Parse data from modalContent.data
    const details = useMemo(() => {
        if (!modalContent?.data) return null;
        try {
            const parsed = JSON.parse(modalContent.data);
            const resultObj = Array.isArray(parsed) ? parsed[0] : parsed;
            return formatResultData(resultObj);
        } catch (e) {
            console.error("Error parsing details:", e);
            return null;
        }
    }, [modalContent]);

    useEffect(() => {
        if (details) {
            const timer = setTimeout(() => {
                checkScroll(andarRowRef, "andar");
                checkScroll(baharRowRef, "bahar");
            }, 300); // Wait for content render
            return () => clearTimeout(timer);
        }
    }, [details]);

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

    return (
        <div style={{ padding: isMobile ? "10px" : "15px", background: "transparent", color: "#fff" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
                {/* ANDAR Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ color: "#AAAFB5", fontSize: "20px", textAlign: "center" }}>ANDAR</div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <div
                            onClick={() => scrollState.andarLeft && scrollRow(andarRowRef, "left")}
                            style={{
                                padding: "8px",
                                cursor: scrollState.andarLeft ? "pointer" : "default",
                                color: "white",
                                // backgroundColor: "rgb(34, 34, 34)",
                                backgroundColor: "#00000050",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 5px",
                                opacity: scrollState.andarLeft ? 1 : 0.3
                            }}
                        >
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="12" width="12" xmlns="http://www.w3.org/2000/svg" style={{ transform: "rotate(180deg)" }}>
                                <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path>
                            </svg>
                        </div>
                        <div ref={andarRowRef} style={{ display: "flex", gap: "50px", overflowX: "hidden", scrollBehavior: "smooth", flex: 1, padding: "5px 0" }}>
                            {details.andarCards.map((card, idx) => (
                                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "40px" }}>
                                    <img src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${card.code}.png`} width="35" alt={card.code} style={{ borderRadius: "2px", border: "1px solid transparent" }} />
                                </div>
                            ))}
                        </div>
                        <div
                            onClick={() => scrollState.andarRight && scrollRow(andarRowRef, "right")}
                            style={{
                                padding: "8px",
                                cursor: scrollState.andarRight ? "pointer" : "default",
                                color: "white",
                                // backgroundColor: "rgb(34, 34, 34)",
                                backgroundColor: "#00000050",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 5px",
                                opacity: scrollState.andarRight ? 1 : 0.3
                            }}
                        >
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="12" width="12" xmlns="http://www.w3.org/2000/svg">
                                <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* BAHAR Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ color: "#AAAFB5", fontSize: "20px", textAlign: "center" }}>BAHAR</div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <div
                            onClick={() => scrollState.baharLeft && scrollRow(baharRowRef, "left")}
                            style={{
                                padding: "8px",
                                cursor: scrollState.baharLeft ? "pointer" : "default",
                                color: "white",
                                // backgroundColor: "rgb(34, 34, 34)",
                                backgroundColor: "#00000050",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 5px",
                                opacity: scrollState.baharLeft ? 1 : 0.3
                            }}
                        >
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="12" width="12" xmlns="http://www.w3.org/2000/svg" style={{ transform: "rotate(180deg)" }}>
                                <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path>
                            </svg>
                        </div>
                        <div ref={baharRowRef} style={{ display: "flex", gap: "50px", overflowX: "hidden", scrollBehavior: "smooth", flex: 1, padding: "5px 0" }}>
                            {details.baharCards.map((card, idx) => (
                                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "40px" }}>
                                    <img src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${card.code}.png`} width="35" alt={card.code} style={{ borderRadius: "2px", border: "1px solid transparent" }} />
                                </div>
                            ))}
                        </div>
                        <div
                            onClick={() => scrollState.baharRight && scrollRow(baharRowRef, "right")}
                            style={{
                                padding: "8px",
                                cursor: scrollState.baharRight ? "pointer" : "default",
                                color: "white",
                                // backgroundColor: "rgb(34, 34, 34)",
                                backgroundColor: "#00000050",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 5px",
                                opacity: scrollState.baharRight ? 1 : 0.3
                            }}
                        >
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="12" width="12" xmlns="http://www.w3.org/2000/svg">
                                <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result_AndarBahar;
