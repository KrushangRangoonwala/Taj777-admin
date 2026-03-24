import React, { useMemo } from "react";
import { getImage } from "../../../utilies/helpers";
import Result_details from "./Result_details";

const Result_Trap = ({ modalContent: response }) => {
    const modalContent = useMemo(() => {
        if (!response) return null;

        const cardList = JSON.parse(response.cards || "[]");

        const descParts = (response.desc_remakrs || response.desc_remarks || "").split("#");
        const resultData = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Total", value: descParts[1] || "" },
        ];

        return {
            cardList,
            resultData,
        };
    }, [response]);

    if (!modalContent) return null;

    const { cardList, resultData } = modalContent;

    // if (!cardList || cardList?.length === 0) return null;

    const winner = JSON.parse(response?.data)?.t1?.winnat;
    const WinnerImg = (
        <div className="casino-result-cards-item"                 >
            <img src="/assets/images/winner.png" className="winner-icon" alt="Winner" style={{ marginRight: '5px' }} />
        </div>)

    return (
        <div className="row row5 worli-result">

            <div className="col-12 col-lg-7">
                <div className="casino-result-content mogambo-result">

                    <div className="casino-result-content-diveder d-none"></div>

                    <div className="casino-result-content-item text-center">
                        <div className="casino-result-cards">
                            {winner === "Daga/Teja" && WinnerImg}
                            <div className="d-inline-block">
                                <h4>Daga / Teja</h4>
                                <div className="casino-result-cards-item">
                                    <img src={getImage(cardList[0], 'cards_new')} alt={'card'} />
                                    <img src={getImage(cardList[1], 'cards_new')} alt={'card'} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="casino-result-content-diveder"></div>

                    <div className="casino-result-content-item text-center">
                        <div className="casino-result-cards">
                            {winner === 'Mogambo' && WinnerImg}
                            <div className="d-inline-block">
                                <h4>Mogambo</h4>
                                <div className="casino-result-cards-item">
                                    <img src={getImage(cardList[2], 'cards_new')} alt={'card'} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Result_details resultData={resultData} />
        </div>
    );
};

export default Result_Trap;
