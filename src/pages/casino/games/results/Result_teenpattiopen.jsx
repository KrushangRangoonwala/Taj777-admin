import React from 'react';
import { getCardImage, getImage } from '../../../../utilies/helpers';
import { useGetFileData } from '../../../../hooks/useGetFileData';

const WinnerIcon = () => {
    return (
        <div className="casino-result-cards-item">
            <img src={getImage('winner', 'images')} className="winner-icon" alt="winner icon" />
        </div>
    )
}

const Result_teenpattiopen = ({ resultData, cardList }) => {
    const { result_image } = useGetFileData();
    const imgFolder = result_image || 'cards_new';

    const cards = cardList || resultData?.cards || [];

    const getCard = (index) => {
        if (cards[index]) return cards[index];
        return "1";
    };

    const winners_str = String(resultData?.res_result || resultData?.result_status || "");
    const winners = winners_str ? winners_str.split(',').map(w => w.trim()) : [];

    const isWinner = (hand) => {
        return winners.includes(String(hand));
    };

    const playerIndices = Array.from({ length: 8 }, (_, i) => i + 1);

    return (
        <div className="col-12 col-lg-7">
            <div className="casino-open-result">
                {playerIndices.map(p => (
                    <div className="casino-open-result-item" key={`player-${p}`}>
                        <h4>{p}</h4>
                        <div className="casino-result-cards">
                            <div className="casino-result-cards-item-container">
                                <div className="casino-result-cards-item">
                                    <img src={getCardImage(getCard(p - 1), imgFolder)} alt={`card ${p}-1`} />
                                </div>
                                <div className="casino-result-cards-item">
                                    <img src={getCardImage(getCard((p - 1) + 9), imgFolder)} alt={`card ${p}-2`} />
                                </div>
                                <div className="casino-result-cards-item">
                                    <img src={getCardImage(getCard((p - 1) + 18), imgFolder)} alt={`card ${p}-3`} />
                                </div>
                                {isWinner(p) && <WinnerIcon />}
                            </div>
                        </div>
                    </div>
                ))}
                
                <div className="casino-open-result-item">
                    <h4 className="text-warning">D</h4>
                    <div className="casino-result-cards">
                        <div className="casino-result-cards-item-container">
                            <div className="casino-result-cards-item">
                                <img src={getCardImage(getCard(8), imgFolder)} alt="dealer card 1" />
                            </div>
                            <div className="casino-result-cards-item">
                                <img src={getCardImage(getCard(17), imgFolder)} alt="dealer card 2" />
                            </div>
                            <div className="casino-result-cards-item">
                                <img src={getCardImage(getCard(26), imgFolder)} alt="dealer card 3" />
                            </div>
                            {isWinner("D") && <WinnerIcon />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result_teenpattiopen;
