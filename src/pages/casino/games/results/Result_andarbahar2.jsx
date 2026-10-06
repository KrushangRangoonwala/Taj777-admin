import React from "react";
import { getImage } from "../../../../utilies/helpers";
import { useGetFileData } from "../../../../hooks/useGetFileData";
import Result_cards_slider from "../components/Result_cards_slider";

const Result_andarbahar2 = ({ cardList = [], winner = "" }) => {
    const { result_image } = useGetFileData();

    // Common card (Joker)
    const commonCard = cardList[0];

    // First cards
    const andarFirstCard = cardList[2];
    const baharFirstCard = cardList[1];

    // Slider cards: alternating starting from index 3, filtering out closed cards (usually "1")
    const andarSliderCards = cardList.slice(3).filter((card, idx) => idx % 2 === 1 && card && card !== "1");
    const baharSliderCards = cardList.slice(3).filter((card, idx) => idx % 2 === 0 && card && card !== "1");

    return (
        <div className="col-12 col-lg-8">
            <div className="d-flex align-items-center">
                {/* Section 1: Labels */}
                <div className="col-1 abj-title">
                    <div className="row row5">
                        <div className="col-12"><b>A</b></div>
                    </div>
                    <div className="row row5">
                        <div className="col-12"><b>B</b></div>
                    </div>
                </div>

                {/* Section 2: Common Card */}
                <div className="abj-common-card mx-2">
                    <div className="casino-result-cards-item">
                        <img src={getImage(commonCard, result_image)} alt="joker" style={{ width: '37px' }} />
                    </div>
                </div>

                {/* Section 3: Sliders */}
                <div className="col-9">
                    {/* Andar Row */}
                    <Result_cards_slider
                        col={false}
                        firstCard={andarFirstCard}
                        sliderCards={andarSliderCards}
                        isWinner={winner === "A" || winner === "1"}
                        className="mb-2"
                        sliderId="andarSlider"
                    />

                    {/* Bahar Row */}
                    <Result_cards_slider
                        col={false}
                        firstCard={baharFirstCard}
                        sliderCards={baharSliderCards}
                        isWinner={winner === "B" || winner === "2"}
                        sliderId="baharSlider"
                    />
                </div>
            </div>
        </div>
    );
};

export default Result_andarbahar2;
