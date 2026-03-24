import React, { useMemo } from "react";
import { parseDescription } from "../components/PlaceBet_KK";
import { getImage } from "../../../utilies/helpers";

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
    const highBaccaratDesc = (descParts[1] || "").split("~");

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
            winnerLine: descParts[0] || "",
            highBaccarat: highBaccaratDesc[0] || "",
            highBaccarat2: highBaccaratDesc[1] || "",
            totalLine: descParts[2] || "",
            pairPlus: descParts[3] || "",
            colorLine: descParts[4] || "",
        },

        formatted: true,
    };
};

const Result_Teenpatti20 = ({ modalContent: response }) => {
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
                                            src={getImage(card, 'cards_new')}
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
                                            src={getImage(card, 'cards_new')}
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
                        <div>{winnerName}</div>
                    </div>

                    <div className="casino-result-desc-item">
                        <div>3 Baccarat</div>
                        <div>{desc.highBaccarat}</div>
                    </div>
                    
                    <div className="casino-result-desc-item">
                        <div></div>
                        <div>{desc.highBaccarat2}</div>
                    </div>

                    {/* <div className="casino-result-desc-item">
                        <div></div>
                        <div>{desc.winnerLine}</div>
                    </div> */}

                    <div className="casino-result-desc-item">
                        <div>Total</div>
                        <div>{desc.totalLine}</div>
                    </div>

                    <div className="casino-result-desc-item">
                        <div>Pair Plus</div>
                        <div>{desc.pairPlus}</div>
                    </div>

                    <div className="casino-result-desc-item">
                        <div>Color</div>
                        <div>{desc.colorLine}</div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Result_Teenpatti20;
