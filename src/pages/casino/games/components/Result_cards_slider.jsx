import React, { useRef } from "react";
import { getImage } from "../../../../utilies/helpers";
import { useGetFileData } from "../../../../hooks/useGetFileData";
import useIsMobile from "../../../../hooks/useIsMobile";

const Result_cards_slider = ({
    firstCard,
    sliderCards,
    cardList,
    cardList1,
    isWinner = false,
    hasWinnerCol,
    className = "",
    col = 7,
    sliderId = "slider",
    cardFolder,
    cardWidth = "37.008px",
    firstCardWidth = "37px",
    winnerIconWidth = "33px",
    scrollAmount = 150,
    sliderRef: externalRef,
}) => {
    const isMobile = useIsMobile();
    const { result_image } = useGetFileData();
    const imgFolder = cardFolder || result_image;
    const internalRef = useRef(null);
    const sliderRef = externalRef || internalRef;

    const cards = sliderCards || cardList || cardList1 || [];

    const handleScroll = (direction) => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    const hasFirstCard = Boolean(firstCard);
    const showWinnerColumn =
        hasWinnerCol !== undefined
            ? hasWinnerCol
            : hasFirstCard || Boolean(isWinner);

    let sliderCol = "col-12";
    if (hasFirstCard && showWinnerColumn) {
        sliderCol = "col-8";
    } else if (hasFirstCard || showWinnerColumn) {
        sliderCol = "col-10";
    }

    const content = (
        <div className={`card-inner ${className}`.trim()}>
            <div className="row row5 align-items-center">
                {hasFirstCard && (
                    <div className="col-2">
                        <div className="casino-result-cards-item">
                            <img
                                src={getImage(firstCard, imgFolder)}
                                alt="first-card"
                                style={{ width: firstCardWidth }}
                            />
                        </div>
                    </div>
                )}

                <div className={sliderCol}>
                    <div
                        id={sliderId}
                        className="ab-slider owl-carousel owl-theme owl-loaded owl-drag"
                    >
                        <div className="owl-nav d-flex align-items-center justify-content-between">
                            <button
                                type="button"
                                onClick={() => handleScroll("left")}
                                className="owl-prev border-0 bg-transparent"
                                style={{ cursor: "pointer", fontSize: "30px" }}
                            >
                                <span>‹</span>
                            </button>
                            <div
                                className="owl-stage-outer flex-grow-1 mx-1"
                                style={{ overflow: "hidden" }}
                            >
                                <div
                                    ref={sliderRef}
                                    className="owl-stage hide-scrollbar"
                                    style={{
                                        display: "flex",
                                        overflowX: "auto",
                                        gap: isMobile ? "2px" : "20px",
                                    }}
                                >
                                    {cards?.map((card, idx) => {
                                        if (!card) return null;
                                        return (
                                            <div
                                                key={idx}
                                                className="owl-item active"
                                                style={{
                                                    width: cardWidth,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <div className="casino-result-cards-item item">
                                                    <img
                                                        src={getImage(card, imgFolder)}
                                                        alt="card"
                                                        style={{ width: cardWidth }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleScroll("right")}
                                className="owl-next border-0 bg-transparent"
                                style={{ cursor: "pointer", fontSize: "30px" }}
                            >
                                <span>›</span>
                            </button>
                        </div>
                    </div>
                </div>

                {showWinnerColumn && (
                    <div className="col-2">
                        {isWinner && (
                            <div className="casino-result-cards-item">
                                <img
                                    src={`/${import.meta.env.VITE_IMAGE_PATH}/assets/images/winner.png`}
                                    className="winner-icon"
                                    alt="winner"
                                    style={{ width: winnerIconWidth }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    if (col) {
        return <div className={`col-12 col-lg-${col}`}>{content}</div>;
    }

    return content;
};

export default Result_cards_slider;
