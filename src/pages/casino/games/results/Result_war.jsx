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

const Result_war = ({ winner, cardList }) => {
    const { result_image } = useGetFileData();
    const imgFolder = result_image;
    const winArr = winner?.split(",")?.map(Number);

    return (
        <div class="col-12 col-lg-6">
            <div class="casino-open-result">

                {Array.from({ length: 7 }).map((_, i) => (
                    <div className="casino-open-result-item">
                        <h4 className={i === 6 ? "text-warning" : ""}>{i === 6 ? "D" : i + 1}</h4>
                        <div className="casino-result-cards">
                            <div className="casino-result-cards-item-container">
                                <div className="casino-result-cards-item">
                                    <img src={getCardImage(cardList[i], imgFolder)} alt="card" />
                                </div>
                                {winArr?.includes(i + 1) && <WinnerIcon />}
                            </div>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
};

export default Result_war;
