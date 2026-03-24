import React, { useMemo, useState } from "react";
import { getImage } from "../../../utilies/helpers";
import Result_details from "./Result_details";
import Result_cards from "./Result_cards";

const Result_Poison = ({ modalContent: response }) => {
    const [desc, setDesc] = useState();
    const modalContent = useMemo(() => {
        if (!response) return null;

        const cardList = JSON.parse(response.cards || "[]");

        const descParts = (response.desc_remakrs || response.desc_remarks || "").split("#");
        setDesc(descParts);

        const resultData =
            response.game_type === "poker20"
                ? [
                    { label: "Winner", value: descParts[0] || "" },
                    { label: "Other", value: descParts[1] || "" },
                ]
                : [
                    { label: "Winner", value: descParts[0] || "" },
                    { label: "2 Card", value: descParts[1] || "" },
                    { label: "7 Card", value: descParts[2] || "" },
                ]

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
                    <div className="casino-result-content-diveder d-none"></div>

                    <div className="casino-result-content-item text-center">
                        <div className="casino-result-cards">
                            {desc?.[0] === 'Player A' &&
                                <div className="casino-result-cards-item">
                                    <img src="/assets/images/winner.png" className="winner-icon" alt="Winner" />
                                </div>}
                            <div className="d-inline-block">
                                <h4>Player A</h4>
                                {cardList?.slice(0, 2).map((card, index) => (
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
                                {cardList?.slice(2, 4).map((card, index) => (
                                    <div className="casino-result-cards-item" key={index}>
                                        <img src={getImage(card, 'cards_new')} alt={card} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <h4 className="text-center" style={{ marginBottom: '0px' }}>Board</h4>
            <Result_cards cardList={cardList?.slice(4)} />
            <Result_details resultData={resultData} />
        </div>
    );
};

export default Result_Poison;
