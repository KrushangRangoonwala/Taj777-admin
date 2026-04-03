import React from 'react';
import { getCardImage, getImage } from '../../../../utilies/helpers';
import { useGetFileData } from '../../../../hooks/useGetFileData';

function WinnerIcon() {
    return (
        <div className="casino-result-cards-item">
            <img src={getImage('winner', 'images')} className="winner-icon" alt="winner" />
        </div>
    )
}

const Result_cards = ({
    title1,
    title2,
    title3,
    cardList1 = [],
    cardList2 = [],
    cardList3 = [],
    winner,
    cardFolder,
    col = 7,
}) => {
    let colNo = 1;
    const { result_image } = useGetFileData();
    const imgFolder = cardFolder || result_image;

    if (cardList3?.length > 0) colNo = 3;
    else if (cardList2?.length > 0) colNo = 2;

    return (
        <div className={`col-12 col-lg-${col}`}>
            <div className="casino-result-content">

                <div className={`casino-result-content-item text-center ${colNo == 1 ? "w-100" : ""}`}>
                    {title1 && <h4>{title1}</h4>}
                    <div className="casino-result-cards">
                        {winner == 1 && <WinnerIcon />}
                        {cardList1?.map((src, index) => (
                            <div className="casino-result-cards-item" key={index}>
                                <img src={getCardImage(src, imgFolder)} alt="card" />
                            </div>
                        ))}
                    </div>
                </div>

                {colNo > 1 && <div className="casino-result-content-diveder"></div>}

                {colNo > 1 && <div className="casino-result-content-item text-center">
                    {title2 && <h4>{title2}</h4>}
                    <div className="casino-result-cards">
                        {winner == 2 && <WinnerIcon />}
                        {cardList2?.map((src, index) => (
                            <div className="casino-result-cards-item" key={index}>
                                <img src={getCardImage(src, imgFolder)} alt="card" />
                            </div>
                        ))}
                    </div>
                </div>}

                {colNo > 2 && <div className="casino-result-content-diveder"></div>}

                {colNo > 2 && <div className="casino-result-content-item text-center">
                    {title3 && <h4>{title3}</h4>}
                    <div className="casino-result-cards">
                        {winner == 3 && <WinnerIcon />}
                        {cardList3?.map((src, index) => (
                            <div className="casino-result-cards-item" key={index}>
                                <img src={getCardImage(src, imgFolder)} alt="card" />
                            </div>
                        ))}
                    </div>
                </div>}
            </div>
        </div>
    );
};

export default Result_cards;
