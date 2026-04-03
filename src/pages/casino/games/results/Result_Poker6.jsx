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

const Result_Poker6 = ({ winner, cardList }) => {
    const { result_image } = useGetFileData();
    const imgFolder = result_image;

    return (
        <div className={`col-12 col-lg-8`}>
            <div className="casino-result-content">

                <div className={`casino-result-content-item text-center`}>
                    <div className="casino-result-cards casino-open-result">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div className="casino-open-result-item">
                                <h4>{index + 1}</h4>
                                <div className="casino-result-cards">
                                    <div className="casino-result-cards-item-container">
                                        <div className="casino-result-cards-item">
                                            <img src={getCardImage(cardList[index], imgFolder)} />
                                        </div>
                                        <div className="casino-result-cards-item">
                                            <img src={getCardImage(cardList[index + 6], imgFolder)} />
                                        </div>
                                        {winner == index + 1 && <WinnerIcon />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="casino-result-content-diveder"></div>

                <div className="casino-result-content-item text-center">
                    <h4>Board Card</h4>
                    <div className="casino-result-cards">
                        {cardList?.slice(12)?.map((src, index) => (
                            <div className="casino-result-cards-item" key={index}>
                                <img src={getCardImage(src, imgFolder)} alt="card" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result_Poker6;
