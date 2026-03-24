import React, { useMemo } from "react";
import useIsMobile from "../../../hooks/useIsMobile";

const Result_Card32 = ({ modalContent: response }) => {
    const isMobile = useIsMobile();
    const modalContent = useMemo(() => {
        return formatResultData(response);
    }, [response]);

    if (!modalContent) return null;

    return (
        <div
            className="result-32cards-container"
            style={{
                overflowX: isMobile ? "hidden" : "auto",
                background: "#2e3439",
                padding: isMobile ? "10px" : "0",
                maxHeight: isMobile ? "calc(80vh - 80px)" : "auto",
                overflowY: isMobile ? "auto" : "hidden",
            }}
        >
            {isMobile ? (
                /* MOBILE VIEW - Matching Placebetcard32.js:994 */
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {modalContent.players.map((player, index) => (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                position: "relative",
                                paddingBottom: "0px",
                            }}
                        >
                            {/* Player Name and Score */}
                            <div
                                className="text-grey-light"
                                style={{
                                    fontSize: "20px",
                                    // color: "#AAAFB5",
                                    // fontWeight: "500",
                                    marginBottom: "2px",
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <span>
                                    {player.name} -{" "}
                                    <span className="text-yellow-bright" style={{ color: "#FDCF13" }}>
                                        {player.score}
                                    </span>
                                </span>

                                {/* Trophy on Right if Winner */}
                                {modalContent.winner === player.name && (
                                    <img
                                        src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
                                        width="40"
                                        alt="Winner"
                                        style={{
                                            filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))",
                                        }}
                                    />
                                )}
                            </div>

                            {/* Card Image */}
                            <div>
                                {Array.isArray(player.cards) && player.cards.length > 0 ? (
                                    player.cards.map((card, i) => (
                                        <img
                                            key={i}
                                            src={`/assets/cards_new/${card}.png`}
                                            width="22"
                                            alt={`Card ${card}`}
                                            style={{ marginRight: "5px" }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/assets/cards_new/1.png";
                                            }}
                                        />
                                    ))
                                ) : (
                                    <img
                                        src={`/assets/cards_new/${player.cardImage}.png`}
                                        width="22"
                                        alt={`Card ${player.cardImage}`}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/assets/cards_new/1.png";
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="casino-result-desc">
                        <div className="casino-result-desc-item">
                            <div>Winner</div>
                            <div className="text-grey-light" style={{ color: "#AAAFB5" }}>{modalContent.winner}</div>
                        </div>

                        {modalContent.isPipeFormat && (
                            <>
                                <div className="casino-result-desc-item">
                                    <div>Odd/Even</div>
                                    <div>
                                        {modalContent.oddEvenMap[0]}
                                    </div>
                                </div>
                                <div className="casino-result-desc-item">
                                    <div></div>
                                    <div>
                                        {modalContent.oddEvenMap[1]}
                                    </div>
                                </div>
                                <div className="casino-result-desc-item">
                                    <div>Black/Red</div>
                                    <div className="text-grey-light" style={{ color: "#AAAFB5" }}>{modalContent.blackRed}</div>
                                </div>
                                <div className="casino-result-desc-item">
                                    <div>Total</div>
                                    <div className="text-grey-light" style={{ color: "#AAAFB5" }}>{modalContent.total}</div>
                                </div>
                                <div className="casino-result-desc-item">
                                    <div>Single</div>
                                    <div className="text-grey-light" style={{ color: "#AAAFB5" }}>{modalContent.single}</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                /* DESKTOP VIEW - Matching Placebetcard32.js:1088 */
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        minWidth: "800px",
                    }}
                >
                    {/* PLAYERS AREA (Left 75%) */}
                    <div
                        style={{
                            flex: "3",
                            display: "flex",
                            paddingRight: "4px",
                        }}
                    >
                        {modalContent.players.map((player, index) => (
                            <div
                                key={index}
                                style={{
                                    flex: 1,
                                    padding: "0 5px",
                                }}
                            >
                                {/* Player Header: Name - Score */}
                                <div
                                    className="text-grey-light"
                                    style={{
                                        fontSize: 20,
                                        marginBottom: 8,
                                        color: "#9ca3af",
                                        fontWeight: "500",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {player.name}{" "}
                                    <span className="text-yellow-bright" style={{ color: "#ffff00", fontWeight: "bold" }}>
                                        {player.score}
                                    </span>
                                </div>

                                {/* Winner Trophy & Cards */}
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 4,
                                        minHeight: "60px",
                                    }}
                                >
                                    {player.isWinner && (
                                        <img
                                            src="https://wver.sprintstaticdata.com/v69/static/front/img/winner.png"
                                            width="30"
                                            alt="Winner"
                                            style={{
                                                filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))",
                                                marginRight: "4px",
                                            }}
                                        />
                                    )}

                                    {/* Cards */}
                                    {Array.isArray(player.cards) && player.cards.length > 0 ? (
                                        player.cards.map((card, i) => (
                                            <img
                                                key={i}
                                                src={`/assets/cards_new/${card}.png`}
                                                width="40"
                                                alt={`Card ${card}`}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/assets/cards_new/1.png";
                                                }}
                                            />
                                        ))
                                    ) : (
                                        <img
                                            src={`/assets/cards_new/${player.cardImage}.png`}
                                            width="40"
                                            alt={`Card ${player.cardImage}`}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/assets/cards_new/1.png";
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* INFO BOX (Right 25%) */}
                    <div style={{ flex: "1" }}>
                        <div
                            className="info-box"
                            style={{
                                background: "#444444",
                                borderRadius: 4,
                                padding: "10px",
                                fontSize: 14,
                                color: "#AAAFB5",
                                height: "100%",
                            }}
                        >
                            {/* Winner */}
                            <div style={{ display: "flex" }}>
                                <div style={{ width: 90, textAlign: "right", marginRight: 10, whiteSpace: "nowrap" }}>
                                    Winner
                                </div>
                                <div className="text-grey-light" style={{ color: "#AAAFB5" }}>{modalContent.winner}</div>
                            </div>

                            {modalContent.isPipeFormat ? (
                                <>
                                    {/* Odd / Even */}
                                    <div style={{ display: "flex" }}>
                                        <div style={{ width: 90, textAlign: "right", marginRight: 10, whiteSpace: "nowrap" }}>
                                            Odd/Even
                                        </div>
                                        <div className="text-grey-light" style={{ color: "#AAAFB5", fontSize: 14 }}>
                                            <div>8: {modalContent.oddEvenMap["8"]} | 9: {modalContent.oddEvenMap["9"]}</div>
                                            <div>10: {modalContent.oddEvenMap["10"]} | 11: {modalContent.oddEvenMap["11"]}</div>
                                        </div>
                                    </div>
                                    {/* Black / Red */}
                                    <div style={{ display: "flex" }}>
                                        <div style={{ width: 90, textAlign: "right", marginRight: 10 }}>Black/Red</div>
                                        <div className="text-grey-light" style={{ color: "#AAAFB5" }}>{modalContent.blackRed}</div>
                                    </div>
                                    {/* Total */}
                                    <div style={{ display: "flex" }}>
                                        <div style={{ width: 90, textAlign: "right", marginRight: 10 }}>Total</div>
                                        <div className="text-grey-light" style={{ color: "#AAAFB5" }}>{modalContent.total}</div>
                                    </div>
                                    {/* Single */}
                                    <div style={{ display: "flex" }}>
                                        <div style={{ width: 90, textAlign: "right", marginRight: 10 }}>Single</div>
                                        <div className="text-grey-light" style={{ color: "#AAAFB5" }}>{modalContent.single}</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {modalContent.extraInfo.map((info, i) => (
                                        <div key={i} style={{ display: "flex" }}>
                                            <div style={{ width: 90, textAlign: "right", marginRight: 10 }}>{info.label}</div>
                                            <div className="text-grey-light" style={{ color: "#AAAFB5" }}>{info.value}</div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export const formatResultData = (result) => {
    if (!result) return null;
    if (result.formatted) return result;
    const is32A = result.game_type === "card32";
    const desc = (result.desc_remakrs || result.desc_remarks || "");
    let parsedDesc = { winner: "", cards: [], infos: [], isPipeFormat: false };

    // Parse inner data if available (comes as JSON string)
    let innerData = null;
    if (result.data && typeof result.data === "string") {
        try {
            const parsed = JSON.parse(result.data);
            innerData = Array.isArray(parsed) ? parsed[0] : parsed;
        } catch (e) {
            console.error("Error parsing result.data:", e);
        }
    }

    if (!is32A) {
        const parts = desc.split("#");
        parsedDesc = {
            winner: parts[0]?.trim() || "",
            oddEvenStr: parts[1] || "",
            blackRedStr: parts[2] || "",
            single: parts[4] || "",
            total: parts[3] || "",
            isPipeFormat: true,
        };
    } else {
        const parts = desc.split("#");
        parsedDesc = {
            winner: parts[0]?.trim() || "",
            cards: parts[1]?.split("  ").filter(Boolean) || [],
            infos: parts.slice(2).map(p => p.trim()).filter(Boolean),
            isPipeFormat: false,
        };
    }

    let cardCodes = [];
    if (result.cards && typeof result.cards === "string") {
        try {
            cardCodes = JSON.parse(result.cards);
        } catch (e) { }
    }

    // Try to get cards from innerData if cardCodes is empty
    if ((!cardCodes || cardCodes.length === 0) && innerData?.cards) {
        if (typeof innerData.cards === "string") {
            cardCodes = innerData.cards.split(",").map(c => c.trim());
        } else if (Array.isArray(innerData.cards)) {
            cardCodes = innerData.cards;
        }
    }

    if (cardCodes.length === 0 && parsedDesc.cards.length > 0) {
        cardCodes = parsedDesc.cards;
    }

    const winCode = String(innerData?.win || result.result || result.win || "").trim();
    let derivedWinner = winCode;
    if (winCode === "1" || winCode === "8") derivedWinner = "Player 8";
    if (winCode === "2" || winCode === "9") derivedWinner = "Player 9";
    if (winCode === "3" || winCode === "10") derivedWinner = "Player 10";
    if (winCode === "4" || winCode === "11") derivedWinner = "Player 11";

    const getScoreCalculation = (playerId, card) => {
        if (!card || card === "1") return "";
        const rank = card.slice(0, -2);
        let val = 0;
        if (rank === "A") val = 1;
        else if (rank === "J") val = 11;
        else if (rank === "Q") val = 12;
        else if (rank === "K") val = 13;
        else val = parseInt(rank) || 0;
        return (playerId + val).toString();
    };

    const players = [8, 9, 10, 11].map((id, idx) => ({
        name: `Player ${id}`,
        score: getScoreCalculation(id, cardCodes[idx]),
        cards: cardCodes[idx] ? [cardCodes[idx]] : [],
        cardImage: cardCodes[idx] || "1",
        isWinner: parsedDesc.winner === `Player ${id}` || winCode === id.toString() || derivedWinner === `Player ${id}` || (innerData?.win === (idx + 1).toString()),
    }));

    let oddEvenMap = {};
    let blackRed = "";
    let extraInfo = [];

    if (parsedDesc.isPipeFormat) {
        if (parsedDesc.oddEvenStr) {
            // parsedDesc.oddEvenStr.split(",").forEach(s => {
            //     const p = s.split(":");
            //     if (p.length === 2) oddEvenMap[p[0].trim()] = p[1].trim();
            // });
            oddEvenMap = parsedDesc.oddEvenStr.split("~");
        }
        if (parsedDesc.blackRedStr) {
            const parts = parsedDesc.blackRedStr.split(",");
            const yesPart = parts.find(p => p.toLowerCase().includes("yes"));
            blackRed = yesPart ? yesPart.split(":")[0].trim() : parsedDesc.blackRedStr;
        }
    } else {
        parsedDesc.infos.forEach(infoStr => {
            const items = infoStr.split(",").map(i => {
                const p = i.split(":");
                return p.length === 2 ? { label: p[0].trim(), value: p[1].trim() } : { label: "Info", value: i };
            });
            extraInfo = [...extraInfo, ...items];
        });
    }

    return {
        roundId: result.mid || result.event_id || "N/A",
        matchTime: result.time ? new Date(result.time).toLocaleString() : "N/A",
        players,
        winner: parsedDesc.winner || derivedWinner || "Unknown",
        oddEvenMap,
        blackRed,
        single: parsedDesc.single,
        total: parsedDesc.total,
        isPipeFormat: parsedDesc.isPipeFormat,
        extraInfo,
        formatted: true,

    };
};

export default Result_Card32;
