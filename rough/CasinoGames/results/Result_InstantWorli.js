import React, { useMemo } from "react";
import { parseDescription } from "../components/PlaceBet_KK";

const formatResultData = (result) => {
    if (!result) return null;
    if (result.formatted) return result;

    console.log("result", result);

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

    // desc_remakrs example: "780#5"
    const descParts = result.desc_remakrs
        ? result.desc_remakrs.split("#")
        : [];

    return {
        cards: allCards,
        pana: descParts[0] || "N/A",
        ocada: descParts[1] || result.result_status || "N/A",
        formatted: true,
    };
};

const Result_InstantWorli = ({ modalContent: response }) => {
    const modalContent = useMemo(() => {
        return formatResultData(response);
    }, [response]);

    if (!modalContent) return null;

    const { cards, pana, ocada } = modalContent;

    return (
        <div className="row row5 worli-result">
            <div className="col-12 col-lg-7">
                <div className="casino-result-content">
                    <div className="casino-result-content-item text-center w-100">
                        <div className="casino-result-cards">
                            {cards?.map((card, index) => (
                                <div key={index} className="casino-result-cards-item">
                                    <img
                                        src={`/assets/cards_new/${card}.png`}
                                        alt={card}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                                "https://wver.sprintstaticdata.com/v196/static/front/img/cards/back.png";
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 col-lg-5">
                <div className="casino-result-desc">
                    <div className="casino-result-desc-item">
                        <div>Pana</div>
                        <div>{pana}</div>
                    </div>
                    <div className="casino-result-desc-item">
                        <div>Ocada</div>
                        <div>{ocada}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result_InstantWorli;