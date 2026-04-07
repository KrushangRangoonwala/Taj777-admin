import React from 'react';
import { getCardImage } from '../../../../utilies/helpers';
import { useGetFileData } from '../../../../hooks/useGetFileData';

const Result_Race20 = ({ cardList = [], winner = "" }) => {
    const { result_image } = useGetFileData();
    const folder = result_image || 'cards_new';

    const suits = [
        { name: "spade", suffix: ["SS", "S"], id: "1" },
        { name: "heart", suffix: ["HH", "H"], id: "2" },
        { name: "club", suffix: ["CC", "C"], id: "3" },
        { name: "diamond", suffix: ["DD", "D"], id: "4" }
    ];

    const getSuitCards = (suit) => {
        const filtered = cardList.filter(card => {
            if (!card || card === "1") return false;
            return suit.suffix.some(s => String(card).endsWith(s));
        });
        if (filtered.length > 0 && !filtered.some(c => String(c).toUpperCase().startsWith('K'))) {
            return [...filtered, `K${suit.suffix[0]}`];
        }
        return filtered;
    };

    return (
        <div className="col-12 col-lg-8">
            <div className="race-result-box">
                {suits.map((suit) => {
                    const suitCards = getSuitCards(suit);
                    return (
                        <div className="pr mb-1" key={suit.name}>
                            <span className="result-image icons">
                                <img src={`https://wver.sprintstaticdata.com/v211/static/front/img/cards/${suit.name}.png`} alt={suit.name} />
                            </span>
                            {suitCards.map((card, idx) => {
                                const isGoalCard = String(winner) === suit.id && idx === suitCards.length - 1 && String(card).toUpperCase().startsWith('K');
                                return (
                                    <span className={`result-image ${isGoalCard ? 'k-image' : ''}`} key={`${suit.name}-${idx}`}>
                                        <img src={getCardImage(card, folder)} alt="card" />
                                    </span>
                                );
                            })}
                            {String(winner) === suit.id && (
                                <div className="casino-result-cards-item">
                                    <img src="https://wver.sprintstaticdata.com/v211/static/front/img/winner.png" className="winner-icon" alt="winner" />
                                </div>
                            )}
                        </div>
                    );
                })}
                <div className="video-winner-text">
                    <div>W</div> <div>I</div> <div>N</div> <div>N</div> <div>E</div> <div>R</div>
                </div>
            </div>
        </div>
    );
};

export default Result_Race20;
