import React from "react";
import { getImage } from "../../../../utilies/helpers";
import { useGetFileData } from "../../../../hooks/useGetFileData";

const Result_andarbahar = ({ cardList = [] }) => {
    const { result_image } = useGetFileData();

    // Standard AB20: 
    // Andar cards: indices 0, 2, 4...
    // Bahar cards: indices 1, 3, 5...
    const andarCards = cardList.filter((_, idx) => idx % 2 === 0);
    const baharCards = cardList.filter((_, idx) => idx % 2 === 1);

    const CardItem = ({ card }) => (
        <div className="casino-result-cards-item item">
            <img src={getImage(card, result_image)} alt="card" />
        </div>
    );

    return (
        <div className="row row5 ab20-result">
            <div className="col-12">
                <h5 className="text-center">Andar</h5>
                <div className="text-center">
                    {andarCards.map((card, idx) => (
                        <CardItem key={idx} card={card} />
                    ))}
                </div>
            </div>
            <div className="col-12 mt-2">
                <h5 className="text-center">Bahar</h5>
                <div className="text-center">
                    {baharCards.map((card, idx) => (
                        <CardItem key={idx} card={card} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Result_andarbahar;
