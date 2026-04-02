import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketByNation, getIsSuspended, formatNumber } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure, getExposure } from "../CasinoCenter";
import RemarkMarquee from "./components/RemarkMarquee";
import BetLimitInfo2 from "./components/BetLimitInfo2";
import Rules, { RulesHeader } from "./rules/Rules";
import useIsMobile from "../../../hooks/useIsMobile";

const ruleList = [
    { label: "Next Total / Back", value: "1 TO 1" },
    { label: "Next Total / Lay", value: "1 TO 1" },
    { label: "Even / Odd", value: "1 TO 1" },
    { label: "Red / Black", value: "1 TO 1" },
];

const Dum10 = ({ gameData, exposureData, lastResults }) => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const isMobile = useIsMobile(767);
    const cardsListRef = useRef(null);
    const scrollPositionRef = useRef(0);
    const cardsDataRef = useRef({ cardList: [], result_image: '', isMobile: false });
    const scrollStateRef = useRef({ isPrevDisabled: true, isNextDisabled: false });
    const [scrollTrigger, setScrollTrigger] = useState(0);

    const currentGame = gameData?.t1?.[0] || {};
    const marketData = gameData?.t2 || [];

    const getMarket = (sid) => marketData.find((m) => m.sid == sid);

    const marketNextTotal = getMarket(1);
    const marketRed = getMarket(3);
    const marketBlack = getMarket(4);
    const marketEven = getMarket(5);
    const marketOdd = getMarket(6);

    const cardList = currentGame?.lcard ? (currentGame?.lcard?.split(',').reverse() || []) : [];

    // Restore scroll position after each render
    useLayoutEffect(() => {
        if (cardsListRef.current) {
            cardsListRef.current.scrollLeft = scrollPositionRef.current;
        }
    });

    useEffect(() => {
        cardsDataRef.current = { cardList, result_image, isMobile };
    }, [cardList, result_image, isMobile]);

    const checkScroll = () => {
        if (cardsListRef.current) {
            const { scrollLeft, clientWidth, scrollWidth } = cardsListRef.current;
            const isPrevDisabled = scrollLeft >= -1;
            const isNextDisabled = Math.abs(scrollLeft) + clientWidth >= scrollWidth - 1;

            if (scrollStateRef.current.isPrevDisabled !== isPrevDisabled ||
                scrollStateRef.current.isNextDisabled !== isNextDisabled) {
                scrollStateRef.current = { isPrevDisabled, isNextDisabled };
                setScrollTrigger(prev => prev + 1);
            }
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    }, [cardList]);

    const CardsComponent = useMemo(() => {
        const slideWidth = isMobile ? 25 * 3 : 31 * 3;

        return () => {
            const { cardList, result_image, isMobile } = cardsDataRef.current;
            const { isPrevDisabled, isNextDisabled } = scrollStateRef.current;

            const handleScroll = () => {
                if (cardsListRef.current) {
                    scrollPositionRef.current = cardsListRef.current.scrollLeft;
                    checkScroll();
                }
            };

            const handleNext = () => {
                if (cardsListRef.current) {
                    cardsListRef.current.scrollBy({ left: -slideWidth, behavior: "smooth" });
                }
            };

            const handlePrev = () => {
                if (cardsListRef.current) {
                    cardsListRef.current.scrollBy({ left: slideWidth, behavior: "smooth" });
                }
            };

            return (
                <div className="casino-video-cards andar-bahar2">
                    <div className="casino-cards-shuffle"><i className="fas fa-grip-lines-vertical"></i></div>
                    <div className="casino-video-cards-container">
                        <div
                            id="andarSlider"
                            className="dum-slider ab-slider"
                            ref={cardsListRef}
                            onScroll={handleScroll}
                            style={{
                                overflowX: "auto",
                                display: "flex",
                                scrollbarWidth: "none",
                                msOverflowStyle: "none",
                                position: "relative"
                            }}
                        >
                            <div className="owl-stage-outer">
                                <div className="owl-stage" style={{ display: "flex", width: "max-content", transform: "translate3d(0px, 0px, 0px)", transition: "all 0s ease 0s" }}>
                                    {cardList.map((card, index) => (
                                        <div key={index} className="owl-item active" style={{ width: isMobile ? "23px" : "48.164px" }}>
                                            <div className="item">
                                                <span><img src={getImage(card, result_image)} alt={card} /></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="owl-nav">
                                <button type="button" className={`owl-prev ${isPrevDisabled ? 'disabled' : ''}`} onClick={handlePrev}>
                                    <span aria-label="Previous">‹</span>
                                </button>
                                <button type="button" className={`owl-next ${isNextDisabled ? 'disabled' : ''}`} onClick={handleNext}>
                                    <span aria-label="Next">›</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
    }, [isMobile]);

    function BelowRidComp() {
        return (
            <div className="dkd-total">
                <div>Current Total:</div>
                <div className="numeric text-playerb">{currentGame?.csum || 0}</div>
            </div>
        )
    }

    function CurrentCard() {
        return (
            <div className="casino-video-current-card">
                <div>
                    <span>
                        <img src={getImage(currentGame?.cards, result_image)} alt="Current Card" />
                    </span>
                </div>
            </div>
        )
    }

    const BetBox = ({ market, className = "", label = "", isCardImg = false, children }) => {
        const suspended = getIsSuspended(market);
        const odds = market?.b1 || market?.l1 || "-";

        return (
            <div className={`casino-bl-box`}>
                <div className={`${className} casino-bl-box-item ${suspended ? "suspended" : ""}`}>
                    {isCardImg ? (
                        <span>{children}</span>
                    ) : (
                        <span className="casino-box-odd">{label || odds}</span>
                    )}
                    <Exposure data={exposureData} id={market?.sid} className="casino-book book-black" isInlineColor={true} />
                </div>
            </div>
        );
    };

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table duskadum">
                                <CasinoVideo
                                    gameName={game_name}
                                    roundId={currentGame?.mid}
                                    videoSrc={iframe_url}
                                    isCardDrawerOpen={isCardDrawerOpen}
                                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                                    results={lastResults}
                                    timeLeft={currentGame?.autotime || 0}
                                    totalTime={currentGame?.ft || 30}
                                    CardsComponent={CardsComponent}
                                    BelowRidComp={BelowRidComp}
                                    CurrentCard={CurrentCard}
                                />

                                <div className="casino-detail">
                                    <div className="casino-box-row">
                                        <div className="casino-nation-name">
                                            <div className="p-relative">
                                                <b>{marketNextTotal?.nat || "Next Total 160 or More"}</b>
                                                <div className="d-inline-block">
                                                    <BetLimitInfo2 min={marketNextTotal?.min} max={marketNextTotal?.max} />
                                                </div>
                                            </div>
                                            <div className="float-right mr-2">
                                                <div className="d-block">
                                                    <Exposure data={exposureData} id={marketNextTotal?.sid} className="casino-book book-black" isInlineColor={true} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="casino-bl-box">
                                            <div className={`back casino-bl-box-item ${getIsSuspended(marketNextTotal) ? "suspended" : ""}`}>
                                                <span className="casino-box-odd">{marketNextTotal?.b1 || "-"}</span>
                                            </div>
                                            <div className={`lay casino-bl-box-item ${getIsSuspended(marketNextTotal) ? "suspended" : ""}`}>
                                                <span className="casino-box-odd">{marketNextTotal?.l1 || "-"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="dkd-other mt-2">
                                        <div className="casino-box-row">
                                            <div className="casino-bl-box"><b>{marketEven?.b1 || "0"}</b></div>
                                            <div className="casino-bl-box"><b>{marketOdd?.b1 || "0"}</b></div>
                                            <div className="casino-bl-box"><b>{marketRed?.b1 || "0"}</b></div>
                                            <div className="casino-bl-box"><b>{marketBlack?.b1 || "0"}</b></div>
                                        </div>
                                        <div className="casino-box-row">
                                            <BetBox market={marketEven} label="Even" className="back" />
                                            <BetBox market={marketOdd} label="Odd" className="back" />
                                            <BetBox market={marketRed} className="back casino-card-img" isCardImg={true}>
                                                <img src={getImage("heart", result_image)} alt="heart" />
                                                <img src={getImage("diamond", result_image)} alt="diamond" />
                                            </BetBox>
                                            <BetBox market={marketBlack} className="back casino-card-img" isCardImg={true}>
                                                <img src={getImage("spade", result_image)} alt="spade" />
                                                <img src={getImage("club", result_image)} alt="club" />
                                            </BetBox>
                                        </div>
                                        <div className="text-center w-100">
                                            <span className="float-right casino-min-max">R:<span>{formatNumber(marketEven?.min || 100)}</span>-<span>{formatNumber(marketEven?.max || 10000)}</span></span>
                                        </div>
                                    </div>
                                </div>

                                {currentGame?.remark && <RemarkMarquee remark={currentGame?.remark} />}
                            </div>
                        </div>
                    </div>
                    <CasinoRightSidebar />
                </div>
            </div>
        </div>
    );
};

export default Dum10;