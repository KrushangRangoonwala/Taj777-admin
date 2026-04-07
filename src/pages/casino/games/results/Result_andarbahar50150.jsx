import React, { useRef } from "react";
import { getImage } from "../../../../utilies/helpers";
import { useGetFileData } from "../../../../hooks/useGetFileData";

const Result_andarbahar50150 = ({ cardList = [] }) => {
    const { result_image } = useGetFileData();
    const andarRef = useRef(null);
    const baharRef = useRef(null);

    // Bahar: 1, 3, 5... (indices 0, 2, 4...)
    // Andar: 2, 4, 6... (indices 1, 3, 5...)
    const baharCards = cardList.filter((_, idx) => idx % 2 === 0);
    const andarCards = cardList.filter((_, idx) => idx % 2 === 1);

    const handleScroll = (ref, direction) => {
        if (ref.current) {
            const scrollAmount = 150; // Adjust scroll distance as needed
            ref.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const CardItem = ({ card, index }) => (
        <div className="owl-item active" style={{ flex: "0 0 35px" }}>
            <div className="casino-result-cards-item item">
                <div className="text-center" style={{ fontSize: '10px' }}>{index}</div>
                <img src={getImage(card, result_image)} alt={`card-${index}`} style={{ width: "35px" }} />
            </div>
        </div>
    );

    return (
        <div className="col-12 col-lg-8">
            <div className="card-inner mb-2">
                <div className="row row5 align-items-center">
                    <div className="col-2 abj-title text-left px-0" style={{ fontSize: '18px', fontWeight: '900' }}><b>ANDAR</b></div>
                    <div className="col-10">
                        <div id="andarSlider" className="ab-slider owl-carousel owl-theme owl-loaded owl-drag">
                            <div className="owl-nav d-flex align-items-center justify-content-start">
                                <button type="button" onClick={() => handleScroll(andarRef, 'left')} className="owl-prev border-0 bg-transparent" style={{ fontSize: '24px', cursor: 'pointer' }}><span>‹</span></button>
                                <div className="owl-stage-outer mx-2" style={{ overflow: 'hidden', maxWidth: '350px' }}>
                                    <div ref={andarRef} className="owl-stage hide-scrollbar" style={{ transition: "all", display: 'flex', overflowX: 'auto', gap: '9.5px' }}>
                                        {andarCards.map((card, idx) => (
                                            <CardItem key={idx} card={card} index={(idx + 1) * 2} />
                                        ))}
                                    </div>
                                </div>
                                <button type="button" onClick={() => handleScroll(andarRef, 'right')} className="owl-next border-0 bg-transparent" style={{ fontSize: '24px', cursor: 'pointer' }}><span>›</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-inner">
                <div className="row row5 align-items-center">
                    <div className="col-2 abj-title text-left px-0" style={{ fontSize: '18px', fontWeight: '900' }}><b>BAHAR</b></div>
                    <div className="col-10">
                        <div id="baharSlider" className="ab-slider owl-carousel owl-theme owl-loaded owl-drag">
                            <div className="owl-nav d-flex align-items-center justify-content-start">
                                <button type="button" onClick={() => handleScroll(baharRef, 'left')} className="owl-prev border-0 bg-transparent" style={{ fontSize: '24px', cursor: 'pointer' }}><span>‹</span></button>
                                <div className="owl-stage-outer mx-2" style={{ overflow: 'hidden', maxWidth: '350px' }}>
                                    <div ref={baharRef} className="owl-stage hide-scrollbar" style={{ transition: "all", display: 'flex', overflowX: 'auto', gap: '9.5px' }}>
                                        {baharCards.map((card, idx) => (
                                            <CardItem key={idx} card={card} index={idx * 2 + 1} />
                                        ))}
                                    </div>
                                </div>
                                <button type="button" onClick={() => handleScroll(baharRef, 'right')} className="owl-next border-0 bg-transparent" style={{ fontSize: '24px', cursor: 'pointer' }}><span>›</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result_andarbahar50150;
