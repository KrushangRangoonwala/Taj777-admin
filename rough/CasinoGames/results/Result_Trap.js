import React, { useMemo } from "react";
import { getImage } from "../../../utilies/helpers";
import Result_details from "./Result_details";

const Result_Trap = ({ modalContent: response }) => {
    const modalContent = useMemo(() => {
        if (!response) return null;

        // Parse cards from JSON string
        const cardList = JSON.parse(response.cards || "[]");

        // Parse desc_remakrs: "Red#Even#Up#A  2  3#Diamond"
        const descParts = (response.desc_remakrs || response.desc_remarks || "").split("#");

        // Map the 5 questions to their results
        const resultData = [
            { label: "Main", value: descParts[0] || "" },
            { label: "Seven", value: descParts[1] || "" },
            { label: "Picture Card", value: descParts[2] || "" },
            // { label: "Suit", value: descParts[3] || "" },
        ];

        return {
            cardList,
            resultData,
        };
    }, [response]);

    if (!modalContent) return null;
    console.log('$$$$ modalContent', modalContent)
    const { cardList, resultData } = modalContent;

    if (!cardList || cardList?.length === 0) return null;
    const winner = JSON.parse(response?.data)?.t1?.winnat;
    const WinnerImg = (<img src="/assets/images/winner.png" className="winner-icon" alt="Winner" />)

    const ss = resultData?.[0]?.value?.split(':');
    console.log('ss', ss);
    const playeA_point = ss?.[1]?.split(',')?.[0]?.trim();
    const playeB_point = ss?.[2]?.trim()?.split(')')?.[0];

    return (
        <div className="row row5 worli-result">

            <div className="col-12 col-lg-7">
                <div className="casino-result-content trap-result">

                    <div className="casino-result-content-diveder d-none"></div>

                    <div className="casino-result-content-item text-center">
                        <div className="casino-result-cards">
                            {winner === 'Player A' && WinnerImg}
                            <div className="d-inline-block">
                                <h4>Player zz A ({playeA_point})</h4>
                                {[cardList[0], cardList[2], cardList[4]].map((card, index) => (
                                    <div className="casino-result-cards-item" key={index}>
                                        {card != 1 && <img src={getImage(card, 'cards_new')} alt={card} />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="casino-result-content-diveder"></div>

                    <div className="casino-result-content-item text-center">
                        <div className="casino-result-cards">
                            {winner === 'Player B' && WinnerImg}
                            <div className="d-inline-block">
                                <h4>Player B ({playeB_point})</h4>
                                {[cardList[1], cardList[3], cardList[5]].map((card, index) => (
                                    <div className="casino-result-cards-item" key={index}>
                                        {card != 1 && <img src={getImage(card, 'cards_new')} alt={card} />}
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

export default Result_Trap;
