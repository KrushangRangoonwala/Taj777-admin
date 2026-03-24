import React, { useMemo, useState } from "react";
import { getImage } from "../../../utilies/helpers";
import Result_details from "./Result_details";
import Result_cards from "./Result_cards";

const Result_Poison = ({ modalContent: response }) => {
    const [desc, setDesc] = useState();
    const modalContent = useMemo(() => {
        if (!response) return null;

        // Parse cards from JSON string
        const cardList = JSON.parse(response.cards || "[]");

        // Parse desc_remakrs: "Red#Even#Up#A  2  3#Diamond"
        const descParts = (response.desc_remakrs || response.desc_remarks || "").split("#");
        setDesc(descParts);

        // Map the 5 questions to their results
        const resultData = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd/Even", value: descParts[1] || "" },
            { label: "Color", value: descParts[2] || "" },
            { label: "Suit", value: descParts[3] || "" },
        ];

        return {
            cardList,
            resultData,
        };
    }, [response]);

    if (!modalContent) return null;

    const { cardList, resultData } = modalContent;

    return (
        <div className="row row5 worli-result">

            <div className="col-12 col-lg-7">
                <div className="casino-result-content joker-result">
                    <div className="casino-result-content-item text-center">
                        <div className="casino-result-cards">
                            <div className="d-inline-block">
                                <h4 className="text-playerb">Poison</h4>
                                <div className="casino-result-cards-item">
                                    <img
                                        src={getImage(cardList[0], 'cards_new')}
                                        alt="Poison Card"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="casino-result-content-diveder d-none"></div>

                    <div className="casino-result-content-item text-center">
                        <div className="casino-result-cards">
                            {desc?.[0] === 'Player A' &&
                                <div className="casino-result-cards-item">
                                    <img src="/assets/images/winner.png" className="winner-icon" alt="Winner" />
                                </div>}
                            <div className="d-inline-block">
                                <h4>Player A</h4>
                                {[cardList[1], cardList[3], cardList[5]].map((card, index) => (
                                    <div className="casino-result-cards-item" key={index}>
                                        <img src={getImage(card, 'cards_new')} alt={card} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="casino-result-content-diveder"></div>

                    <div className="casino-result-content-item text-center">
                        <div className="casino-result-cards">
                            {desc?.[0] === 'Player B' &&
                                <div className="casino-result-cards-item">
                                    <img src="/assets/images/winner.png" className="winner-icon" alt="Winner" />
                                </div>}
                            <div className="d-inline-block">
                                <h4>Player B</h4>
                                {[cardList[2], cardList[4], cardList[6]].map((card, index) => (
                                    <div className="casino-result-cards-item" key={index}>
                                        <img src={getImage(card, 'cards_new')} alt={card} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Result_details resultData={resultData} />
        </div>
    );
};

export default Result_Poison;
