import React, { useMemo } from "react";
import { parseDescription } from "../components/PlaceBet_KK";

const formatResultData = (result) => {
    if (!result) return null;
    if (result.formatted) return result;

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

    const playerACards = [allCards[0], allCards[2], allCards[4]].filter(Boolean);
    const playerBCards = [allCards[1], allCards[3], allCards[5]].filter(Boolean);

    const descParts = (result.desc_remakrs || "").split("#");

    return {
        roundId: result.event_id || result.mid || "N/A",
        matchTime: result.time
            ? new Date(result.time).toLocaleString()
            : "N/A",

        playerA: {
            name: "Player A",
            cards: playerACards,
            isWinner: result.result_status === "1",
        },

        playerB: {
            name: "Player B",
            cards: playerBCards,
            isWinner: result.result_status === "2",
        },

        desc: {
            winner: descParts[0] || "",
            suit: descParts[1] || "",
            oddeven: descParts[2] || "",
            consecutive: descParts[3] || "",
            cards: descParts[3] || "",
            underover: descParts[4] || "",
        },

        formatted: true,
    };
};

const Result_TeenPatti2 = ({ modalContent: response }) => {
    const modalContent = useMemo(() => {
        return formatResultData(response);
    }, [response]);

    if (!modalContent) return null;

    const { playerA, playerB, desc } = modalContent;

    const winnerName =
        playerA?.isWinner
            ? "Player A"
            : playerB?.isWinner
                ? "Player B"
                : "Pending";

    return (
        <div className="row row5">
            <div className="col-12 col-lg-8">
                <div className="casino-result-content">

                    {/* Player A */}
                    <div className="casino-result-content-item text-center">
                        <div className="casino-result-cards">
                            <div className="casino-result-cards-item">
                                {playerA?.isWinner && (
                                    <img
                                        src="https://wver.sprintstaticdata.com/v199/static/front/img/winner.png"
                                        className="winner-icon"
                                        alt="Winner"
                                    />
                                )}
                            </div>

                            <div className="d-inline-block">
                                <h4>Player A</h4>
                                {playerA?.cards?.map((card, idx) => (
                                    <div key={idx} className="casino-result-cards-item">
                                        <img
                                            src={`/assets/cards_new/${card}.png`}
                                            alt={card}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src =
                                                    "https://wver.sprintstaticdata.com/v199/static/front/img/cards/back.png";
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="casino-result-content-diveder"></div>

                    {/* Player B */}
                    <div className="casino-result-content-item text-center">
                        <div className="casino-result-cards">
                            <div className="casino-result-cards-item">
                                {playerB?.isWinner && (
                                    <img
                                        src="https://wver.sprintstaticdata.com/v199/static/front/img/winner.png"
                                        className="winner-icon"
                                        alt="Winner"
                                    />
                                )}
                            </div>

                            <div className="d-inline-block">
                                <h4>Player B</h4>
                                {playerB?.cards?.map((card, idx) => (
                                    <div key={idx} className="casino-result-cards-item">
                                        <img
                                            src={`/assets/cards_new/${card}.png`}
                                            alt={card}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src =
                                                    "https://wver.sprintstaticdata.com/v199/static/front/img/cards/back.png";
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Right Side Description */}
            <div className="col-12 col-lg-4">
                <div className="casino-result-desc">

                    <div className="casino-result-desc-item">
                        <div>Winner</div>
                        <div>{desc.winner}</div>
                    </div>

                    <div className="casino-result-desc-item">
                        <div>Suit</div>
                        <div>{desc.suit}</div>
                    </div>

                    <div className="casino-result-desc-item">
                        <div>Odd/Even</div>
                        <div>{desc.oddeven}</div>
                    </div>

                    <div className="casino-result-desc-item">
                        <div>Consecutive</div>
                        <div>{desc.consecutive}</div>
                    </div>

                    <div className="casino-result-desc-item">
                        <div>Cards</div>
                        <div>{desc.cards}</div>
                    </div>

                    <div className="casino-result-desc-item">
                        <div>Under/Over</div>
                        <div>{desc.underover}</div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Result_TeenPatti2;
