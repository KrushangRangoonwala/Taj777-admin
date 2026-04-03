import React from 'react';
import { getCardImage, getImage } from '../../../../utilies/helpers';
import { useGetFileData } from '../../../../hooks/useGetFileData';
import Result_cards from '../components/Result_cards';

function WinnerIcon() {
    return (
        <div className="casino-result-cards-item">
            <img src={getImage('winner', 'images')} className="winner-icon" alt="winner" />
        </div>
    )
}

const Result_poker1day = ({
    title1,
    title2,
    title3,
    cardList1 = [],
    cardList2 = [],
    cardList3 = [],
    winner,
    cardFolder,
}) => {
    let colNo = 1;
    const { result_image } = useGetFileData();
    const imgFolder = cardFolder || result_image;

    if (cardList3?.length > 0) colNo = 3;
    else if (cardList2?.length > 0) colNo = 2;

    return (
        <>
            <Result_cards
                cardList1={cardList1}
                cardList2={cardList2}
                title1={title1}
                title2={title2}
                winner={winner}
                col={5}
            />

            <div className="col-12 col-lg-4 d-flex align-items-center">
                <div className="casino-result-cards d-block w-100">
                    <div className="text-center">
                        {title3 && <h4>{title3}</h4>}
                        {cardList3?.map((src, index) => (
                            <div className="casino-result-cards-item" key={index}>
                                <img src={getCardImage(src, imgFolder)} alt="card" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Result_poker1day;
