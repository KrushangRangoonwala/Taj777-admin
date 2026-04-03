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

const Result_DTL20 = ({ winner, cardList }) => {
    const { result_image } = useGetFileData();
    const imgFolder = result_image;

    return (
        <>
            <div className="col-12 col-lg-2">
                <div className="casino-result-cards">
                    {winner == "D" && <WinnerIcon />}
                    <div className="d-inline-block">
                        <h4>Dragon</h4>
                        <div className="casino-result-cards-item">
                            <img src={getCardImage(cardList[0], imgFolder)} alt="card" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 col-lg-2">
                <div className="casino-result-cards">
                    {winner == "T" && <WinnerIcon />}
                    <div className="d-inline-block">
                        <h4>Tiger</h4>
                        <div className="casino-result-cards-item">
                            <img src={getCardImage(cardList[1], imgFolder)} alt="card" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 col-lg-2">
                <div className="casino-result-cards">
                    {winner == "L" && <WinnerIcon />}
                    <div className="d-inline-block">
                        <h4>Lion</h4>
                        <div className="casino-result-cards-item">
                            <img src={getCardImage(cardList[2], imgFolder)} alt="card" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Result_DTL20;
