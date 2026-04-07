import React from 'react';
import { getCardImage, getImage } from '../../../../utilies/helpers';
import { useGetFileData } from '../../../../hooks/useGetFileData';

const WinnerIcon = () => {
    return (
        <div className="casino-result-cards-item">
            <img src={getImage('winner', 'images')} className="winner-icon" />
        </div>
    );
};

const Result_Baccarat = ({ resultData, cardList }) => {
    const { result_image } = useGetFileData();
    const imgFolder = result_image || 'cards_new';

    const cards = cardList || [];

    const getCard = (index) => {
        const card = cards[index];
        if (card && card !== "1" && card !== "0") return card;
        return null;
    };

    const winners_str = String(resultData?.res_result || resultData?.result_status || "");
    const winners = winners_str ? winners_str.split(',').map(w => w.trim()) : [];

    const isWinner = (side) => {
        // side can be '1'/'P' for Player, '2'/'B' for Banker, '3'/'T' for Tie
        if (side === 'P') return winners.includes('1') || winners.includes('P');
        if (side === 'B') return winners.includes('2') || winners.includes('B');
        return false;
    };

    const p3 = getCard(4);
    const p2 = getCard(2);
    const p1 = getCard(0);

    const b1 = getCard(1);
    const b2 = getCard(3);
    const b3 = getCard(5);

    return (
        <div className="col-12 col-lg-7">
            <div className="casino-result-content">
                <div className="casino-result-content-item text-center">
                    <div className="casino-result-cards">
                        {isWinner('P') && <WinnerIcon />}
                        <div className="d-inline-block">
                            <h4>Player</h4>
                            {p3 && (
                                <div className="casino-result-cards-item l-rotate">
                                    <img src={getCardImage(p3, imgFolder)} />
                                </div>
                            )}
                            {p2 && (
                                <div className="casino-result-cards-item">
                                    <img src={getCardImage(p2, imgFolder)} />
                                </div>
                            )}
                            {p1 && (
                                <div className="casino-result-cards-item">
                                    <img src={getCardImage(p1, imgFolder)} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="casino-result-content-diveder"></div>
                <div className="casino-result-content-item text-center">
                    <div className="casino-result-cards">
                        {isWinner('B') && <WinnerIcon />}
                        <div className="d-inline-block">
                            <h4>Banker</h4>
                            {b1 && (
                                <div className="casino-result-cards-item">
                                    <img src={getCardImage(b1, imgFolder)} />
                                </div>
                            )}
                            {b2 && (
                                <div className="casino-result-cards-item">
                                    <img src={getCardImage(b2, imgFolder)} />
                                </div>
                            )}
                            {b3 && (
                                <div className="casino-result-cards-item r-rotate">
                                    <img src={getCardImage(b3, imgFolder)} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result_Baccarat;
