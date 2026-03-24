import React, { useMemo } from "react";
import { getImage } from "../../../utilies/helpers";
import Result_details from "./Result_details";

const Result_cards_divided = ({
    leftTitle,
    rightTitle,
    leftCardList,
    rightCardList,
    isLeftWinner,
    isRightWinner
}) => {
    const WinnerImg = (
        <div className="casino-result-cards-item"                 >
            <img src="/assets/images/winner.png" className="winner-icon" alt="Winner" style={{ marginRight: '5px' }} />
        </div>)

    return (
        <div className="col-12 col-lg-7">
            <div className="casino-result-content mogambo-result">

                <div className="casino-result-content-diveder d-none"></div>

                <div className="casino-result-content-item text-center">
                    <div className="casino-result-cards">
                        {isLeftWinner && WinnerImg}
                        <div className="d-inline-block">
                            <h4>{leftTitle}</h4>
                            {leftCardList.map((card, i) => (
                                <div className="casino-result-cards-item">
                                    <img src={getImage(card, 'cards_new')} alt={'card'} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="casino-result-content-diveder"></div>

                <div className="casino-result-content-item text-center">
                    <div className="casino-result-cards">
                        {isRightWinner && WinnerImg}
                        <div className="d-inline-block">
                            <h4>{rightTitle}</h4>
                            {rightCardList.map((card, i) => (
                                <div className="casino-result-cards-item">
                                    <img src={getImage(card, 'cards_new')} alt={'card'} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result_cards_divided;
