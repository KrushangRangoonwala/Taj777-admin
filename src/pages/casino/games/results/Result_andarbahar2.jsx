import React, { useRef } from "react";
import { getImage } from "../../../../utilies/helpers";
import { useGetFileData } from "../../../../hooks/useGetFileData";

const Result_andarbahar2 = ({ cardList = [], winner = "" }) => {
    const { result_image } = useGetFileData();
    const andarRef = useRef(null);
    const baharRef = useRef(null);

    // Common card (Joker)
    const commonCard = cardList[0];

    // First cards
    const andarFirstCard = cardList[1];
    const baharFirstCard = cardList[2];

    // Slider cards: alternating starting from index 3, filtering out closed cards (usually "1")
    const andarSliderCards = cardList.slice(3).filter((card, idx) => idx % 2 === 0 && card && card !== "1");
    const baharSliderCards = cardList.slice(3).filter((card, idx) => idx % 2 === 1 && card && card !== "1");

    const handleScroll = (ref, direction) => {
        if (ref.current) {
            const scrollAmount = 150;
            ref.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const CardItem = ({ card }) => (
        <div className="owl-item active" style={{ width: "37.008px" }}>
            <div className="casino-result-cards-item item">
                <img src={getImage(card, result_image)} alt="card" style={{ width: "37.008px" }} />
            </div>
        </div>
    );

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
                    <div className="card-inner mb-2">
                        <div className="row row5 align-items-center">
                            <div className="col-2">
                                <div className="casino-result-cards-item">
                                    <img src={getImage(andarFirstCard, result_image)} alt="andar-first" style={{ width: '37px' }} />
                                </div>
                            </div>
                            <div className="col-8">
                                <div id="andarSlider" className="ab-slider owl-carousel owl-theme owl-loaded owl-drag">
                                    <div className="owl-nav d-flex align-items-center justify-content-between">
                                        <button type="button" onClick={() => handleScroll(andarRef, 'left')} className="owl-prev border-0 bg-transparent" style={{ cursor: 'pointer', fontSize: '30px' }}><span>‹</span></button>
                                        <div className="owl-stage-outer flex-grow-1 mx-1" style={{ overflow: 'hidden' }}>
                                            <div ref={andarRef} className="owl-stage hide-scrollbar" style={{ display: 'flex', overflowX: 'auto', gap: '2px' }}>
                                                {andarSliderCards.map((card, idx) => (
                                                    <CardItem key={idx} card={card} />
                                                ))}
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => handleScroll(andarRef, 'right')} className="owl-next border-0 bg-transparent" style={{ cursor: 'pointer', fontSize: '30px' }}><span>›</span></button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-2">
                                {(winner === "A" || winner === "1") && (
                                    <div className="casino-result-cards-item">
                                        <img src={`/${import.meta.env.VITE_IMAGE_PATH}/assets/images/winner.png`} className="winner-icon" alt="winner" style={{ width: '33px' }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bahar Row */}
                    <div className="card-inner">
                        <div className="row row5 align-items-center">
                            <div className="col-2">
                                <div className="casino-result-cards-item">
                                    <img src={getImage(baharFirstCard, result_image)} alt="bahar-first" style={{ width: '37px' }} />
                                </div>
                            </div>
                            <div className="col-8">
                                <div id="baharSlider" className="ab-slider owl-carousel owl-theme owl-loaded owl-drag">
                                    <div className="owl-nav d-flex align-items-center justify-content-between">
                                        <button type="button" onClick={() => handleScroll(baharRef, 'left')} className="owl-prev border-0 bg-transparent" style={{ cursor: 'pointer', fontSize: '30px' }}><span>‹</span></button>
                                        <div className="owl-stage-outer flex-grow-1 mx-1" style={{ overflow: 'hidden' }}>
                                            <div ref={baharRef} className="owl-stage hide-scrollbar" style={{ display: 'flex', overflowX: 'auto', gap: '2px' }}>
                                                {baharSliderCards.map((card, idx) => (
                                                    <CardItem key={idx} card={card} />
                                                ))}
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => handleScroll(baharRef, 'right')} className="owl-next border-0 bg-transparent" style={{ cursor: 'pointer', fontSize: '30px' }}><span>›</span></button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-2">
                                {(winner === "B" || winner === "2") && (
                                    <div className="casino-result-cards-item">
                                        <img src={`/${import.meta.env.VITE_IMAGE_PATH}/assets/images/winner.png`} className="winner-icon" alt="winner" style={{ width: '33px' }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result_andarbahar2;
