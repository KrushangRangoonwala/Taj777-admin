import React from 'react';
import ResultDesc from '../components/Result_details';

const Result_teenJoker20 = ({ resultData }) => {
    // For now, we are using static data as requested, ignoring resultData
    const data = [
        { name: "Winner", value: "Player B" },
        { name: "Odd/Even", value: "Odd" },
        { name: "Color", value: "Red" },
        { name: "Suit", value: "Heart" },
    ];

    return (
        <div className="row row5">
            <div className="col-12 col-lg-7">
                <div className="casino-result-content joker-result">
                    {/* Joker Section */}
                    <div className="casino-result-content-item text-center">
                        <div className="casino-result-cards">
                            <div className="d-inline-block">
                                <h4 className="text-playerb">Joker</h4>
                                <div className="casino-result-cards-item">
                                    <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/9HH.png" alt="Joker" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="casino-result-content-diveder d-none-mobile"></div>

                    {/* Player A Section */}
                    <div className="casino-result-content-item text-center">
                        <div className="casino-result-cards">
                            <div className="d-inline-block">
                                <h4>Player A</h4>
                                <div className="casino-result-cards-item">
                                    <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/6CC.png" alt="Card" />
                                </div>
                                <div className="casino-result-cards-item">
                                    <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/7CC.png" alt="Card" />
                                </div>
                                <div className="casino-result-cards-item">
                                    <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/JDD.png" alt="Card" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="casino-result-content-diveder"></div>

                    {/* Player B Section */}
                    <div className="casino-result-content-item text-center">
                        <div className="casino-result-cards">
                            <div className="casino-result-cards-item">
                                <img
                                    src="https://wver.sprintstaticdata.com/v209/static/front/img/winner.png"
                                    className="winner-icon"
                                    alt="Winner"
                                />
                            </div>
                            <div className="d-inline-block">
                                <h4>Player B</h4>
                                <div className="casino-result-cards-item">
                                    <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/6HH.png" alt="Card" />
                                </div>
                                <div className="casino-result-cards-item">
                                    <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/7SS.png" alt="Card" />
                                </div>
                                <div className="casino-result-cards-item">
                                    <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/5HH.png" alt="Card" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ResultDesc data={data} />
        </div>
    );
};

export default Result_teenJoker20;
