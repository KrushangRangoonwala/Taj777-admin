import React, { useMemo, useRef, useState, useEffect } from "react";
import { getImage } from "../../../utilies/helpers";
import { formatResultData } from "./Result_OdiTeenPatti"; // Re-using formatting logic if suitable, but likely need custom parsing

const Result_Dum10 = ({ modalContent: response }) => {
    // const [currentSlide, setCurrentSlide] = useState(0);
    const slideWidth = 60 * 4; // 62.33px + margins roughly
    const listRef = useRef(null);
    const [isPrevDisabled, setIsPrevDisabled] = useState(true);
    const [isNextDisabled, setIsNextDisabled] = useState(false);

    const checkScroll = () => {
        if (listRef.current) {
            const { scrollLeft, clientWidth, scrollWidth } = listRef.current;
            setIsPrevDisabled(scrollLeft <= 1);
            setIsNextDisabled(scrollLeft + clientWidth >= scrollWidth - 1);
        }
    };

    const handleNext = () => {
        if (listRef.current) {
            listRef.current.scrollBy({ left: slideWidth, behavior: "smooth" });
        }
    };

    const handlePrev = () => {
        if (listRef.current) {
            listRef.current.scrollBy({ left: -slideWidth, behavior: "smooth" });
        }
    };

    const modalContent = useMemo(() => {
        if (!response) return null;
        const result = response;

        // Custom parsing for Dum10 based on example:
        // "card": "KCC,ADD,10CC,5CC..."
        // "rdesc": "9 Heart#92 | Next Total 100 or More#92 + 9 = 101 | Yes#Odd#Red"

        // const cardList = result.card ? result.card.split(',') : [];
        const cardList = JSON.parse(result.cards);
        const descParts = (result.rdesc || result.desc_remakrs || "").split("#");

        // Item 0: Card (e.g., "9 Heart")
        // Item 1: Curr. Total (e.g., "92 | Next Total 100 or More")
        // Item 2: Total (e.g., "92 + 9 = 101 | Yes")
        // Item 3: Odd/Even (e.g., "Odd")
        // Item 4: Red/Black (e.g., "Red")

        const resultData = [
            { label: "Card", value: descParts[0] || "" },
            { label: "Curr. Total", value: descParts[1] || "" },
            { label: "Total", value: descParts[2] || "" },
            { label: "Odd/Even", value: descParts[3] || "" },
            { label: "Red/Black", value: descParts[4] || "" },
        ];

        const cardsLength = cardList.length;

        return {
            cardList,
            resultData,
            cardsLength
        };

    }, [response]);

    useEffect(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    }, [modalContent]);

    if (!modalContent) return null;

    const { cardList, resultData, cardsLength } = modalContent;

    return (
        <>
            <div className="row row5 dum-result mt-2">
                <div className="col-10">
                    <section tabIndex="0" className="lastCards-result hooper">
                        <div
                            className="hooper-list"
                            ref={listRef}
                            onScroll={checkScroll}
                            style={{ overflowX: "auto", scrollBehavior: "smooth", display: "flex", scrollbarWidth: "none", msOverflowStyle: "none" }}
                        >
                            <ul className="hooper-track" style={{ transform: "none", padding: 0, margin: 0 }}>
                                {cardList.map((card, index) => (
                                    <li key={index} className="hooper-slide" style={{ width: "69.3312px" }}>
                                        <div className="casino-result-cards-item">
                                            <img src={getImage(card)} alt={card} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="hooper-navigation">
                                <button
                                    type="button"
                                    className={`hooper-prev ${isPrevDisabled ? "is-disabled" : ""}`}
                                    onClick={handlePrev}
                                >
                                    <svg className="icon icon-arrowLeft" viewBox="0 0 24 24" width="24px" height="24px">
                                        <title>Arrow Left</title>
                                        <path d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"></path>
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    className={`hooper-next ${isNextDisabled ? "is-disabled" : ""}`}
                                    onClick={handleNext}
                                >
                                    <svg className="icon icon-arrowRight" viewBox="0 0 24 24" width="24px" height="24px">
                                        <title>Arrow Right</title>
                                        <path d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path>
                                    </svg>
                                </button>
                            </div>
                            <div aria-live="polite" aria-atomic="true" className="hooper-liveregion hooper-sr-only">
                                Item 1 of {cardsLength}
                            </div>
                        </div>
                    </section>
                </div>
                {/* 
                    The example HTML shows a separate col-2 with a generic card image "JDD".
                    I'm inferring this might be the LAST or WINNING card separately, 
                    but the card list has all cards. 
                    Given the example HTML had "JDD" here and "AHH" as the last in list, 
                    I'll check if I should display the last card here or something specific.
                    For now, I'll take the LAST card from the list to display here if available.
                */}
                <div className="col-2">
                    <div className="casino-result-cards-item">
                        {cardList.length > 0 && (
                            <img src={getImage(cardList[cardList.length - 1])} alt="Last Card" />
                        )}
                    </div>
                </div>
            </div>

            <div className="row row5 justify-content-center">
                <div className="col-12 col-lg-6">
                    <div className="casino-result-desc">
                        {resultData.map((item, index) => (
                            <div className="casino-result-desc-item" key={index}>
                                <div>{item.label}</div>
                                <div>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Result_Dum10;
