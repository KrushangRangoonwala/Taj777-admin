import React from 'react';

const Result_cards_3x3Divided = ({ title1 = "Player A", title2 = "Player B", cardList1 = [], cardList2 = [] }) => {
    return (
        <div className="col-12 col-lg-7">
            <div className="casino-result-content">

                <div className="casino-result-content-item text-center">
                    <h4>{title1}</h4>
                    <div className="casino-result-cards">
                        {cardList1?.map((src, index) => (
                            <div className="casino-result-cards-item" key={index}>
                                <img
                                    src={src}
                                    className={src.includes('winner.png') ? 'winner-icon' : ''}
                                    alt="card"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="casino-result-content-diveder"></div>


                <div className="casino-result-content-item text-center">
                    <h4>{title2}</h4>
                    <div className="casino-result-cards">
                        {cardList2?.map((src, index) => (
                            <div className="casino-result-cards-item" key={index}>
                                <img
                                    src={src}
                                    className={src.includes('winner.png') ? 'winner-icon' : ''}
                                    alt="card"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="casino-result-content-diveder"></div>

            </div>
        </div>
    );
};

export default Result_cards_3x3Divided;
