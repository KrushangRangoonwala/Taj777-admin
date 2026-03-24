import React, { useMemo, useRef, useState, useEffect } from "react";
import useIsMobile from "../../../hooks/useIsMobile";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import Result_details from "./Result_details";

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
    if (result.cards && typeof result.cards === "string") {
        try {
            const parsedCards = JSON.parse(result.cards);
            if (Array.isArray(parsedCards)) cardCodes = parsedCards;
        } catch (e) { }
    }
    if (cardCodes.length === 0 && desc.cards.length > 0) cardCodes = desc.cards;

    const andarCards = [];
    const baharCards = [];
    cardCodes.forEach((code_, index) => {
        const code = code_ == "*" ? "1" : code_;
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
    const isLight = useSelector(state => state.action.theme) === "light";

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

    const details = useMemo(() => formatResultData(modalContent), [modalContent]);

    useEffect(() => {
        if (details) {
            const timer = setTimeout(() => {
                checkScroll(andarRowRef, "andar");
                checkScroll(baharRowRef, "bahar");
            }, 300);
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
            const scrollAmount = 320;
            ref.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    if (!details) return null;
    console.log("## details", details);

    const resultData = [{ label: "Winner", value: details.winner || "" }]

    return (
        <div style={{ padding: isMobile ? "3px" : "25px", color: "#fff" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* ANDAR Row */}
                    <div style={{ display: "flex", alignItems: "center", marginRight: "30px" }}>
                        <div style={{ width: "70px", color: isLight ? "#222" : "#AAAFB5", fontWeight: "bold", fontSize: "14px", marginTop: "25px" }}>ANDAR</div>
                        <div
                            onClick={() => scrollState.andarLeft && scrollRow(andarRowRef, "left")}
                            style={{
                                padding: "5px",
                                cursor: scrollState.andarLeft ? "pointer" : "default",
                                color: "white",
                                backgroundColor: "#00000050",
                                borderRadius: "2px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 5px",
                                marginTop: "25px",
                                opacity: scrollState.andarLeft ? 1 : 0.3
                            }}
                        >
                            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 320 512" height="14" width="14" xmlns="http://www.w3.org/2000/svg" style={{ transform: "rotate(180deg)" }}>
                                <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path>
                            </svg>
                        </div>
                        <div ref={andarRowRef} style={{ display: "flex", gap: "30px", overflowX: "hidden", scrollBehavior: "smooth", maxWidth: "295px", justifyContent: "flex-start" }}>
                            {details.andarCards.map((card, idx) => (
                                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "35px" }}>
                                    <span style={{ fontSize: "12px", color: "#aaafb5", marginBottom: "2px" }}>{card.index}</span>
                                    <img src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${card.code}.png`} width="25" alt={card.code} style={{ borderRadius: "2px" }} />
                                </div>
                            ))}
                        </div>
                        <div
                            onClick={() => scrollState.andarRight && scrollRow(andarRowRef, "right")}
                            style={{
                                padding: "5px",
                                cursor: scrollState.andarRight ? "pointer" : "default",
                                color: "white",
                                backgroundColor: "#00000050",
                                borderRadius: "2px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 5px",
                                marginTop: "25px",
                                opacity: scrollState.andarRight ? 1 : 0.3
                            }}
                        >
                            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 320 512" height="14" width="14" xmlns="http://www.w3.org/2000/svg">
                                <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path>
                            </svg>
                        </div>
                    </div>

                    {/* BAHAR Row */}
                    <div style={{ display: "flex", alignItems: "center", marginRight: "30px" }}>
                        <div style={{ width: "70px", color: isLight ? "#222" : "#AAAFB5", fontWeight: "bold", fontSize: "14px", marginTop: "25px" }}>BAHAR</div>
                        <div
                            onClick={() => scrollState.baharLeft && scrollRow(baharRowRef, "left")}
                            style={{
                                padding: "5px",
                                cursor: scrollState.baharLeft ? "pointer" : "default",
                                color: "white",
                                backgroundColor: "#00000050",
                                borderRadius: "2px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 5px",
                                marginTop: "25px",
                                opacity: scrollState.baharLeft ? 1 : 0.3
                            }}
                        >
                            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 320 512" height="14" width="14" xmlns="http://www.w3.org/2000/svg" style={{ transform: "rotate(180deg)" }}>
                                <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path>
                            </svg>
                        </div>
                        <div ref={baharRowRef} style={{ display: "flex", gap: "30px", overflowX: "hidden", scrollBehavior: "smooth", maxWidth: "295px", justifyContent: "flex-start" }}>
                            {details.baharCards.map((card, idx) => (
                                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "35px" }}>
                                    <span style={{ fontSize: "12px", color: "#aaafb5", marginBottom: "2px" }}>{card.index}</span>
                                    <img src={`https://wver.sprintstaticdata.com/v69/static/front/img/cards/${card.code}.png`} width="25" alt={card.code} style={{ borderRadius: "2px" }} />
                                </div>
                            ))}
                        </div>
                        <div
                            onClick={() => scrollState.baharRight && scrollRow(baharRowRef, "right")}
                            style={{
                                padding: "5px",
                                cursor: scrollState.baharRight ? "pointer" : "default",
                                color: "white",
                                backgroundColor: "#00000050",
                                borderRadius: "2px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 5px",
                                marginTop: "25px",
                                opacity: scrollState.baharRight ? 1 : 0.3
                            }}
                        >
                            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 320 512" height="14" width="14" xmlns="http://www.w3.org/2000/svg">
                                <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="row row5">
                    <Result_details resultData={resultData} />
                </div>
            </div>
        </div>
    );
};

export default Result_AndarBahar;
