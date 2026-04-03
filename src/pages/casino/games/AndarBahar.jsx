import React, { useState, useEffect, useRef } from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketByNation, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import RemarkMarquee from "./components/RemarkMarquee";
import BetLimitInfo from "./components/BetLimitInfo2";
import LastResult from "./components/LastResult";
import Rules, { RulesHeader } from "./rules/Rules";

const AndarBahar = ({ gameData, exposureData, lastResults }) => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);

    const [andarScrollState, setAndarScrollState] = useState({ canScrollLeft: false, canScrollRight: true });
    const [baharScrollState, setBaharScrollState] = useState({ canScrollLeft: false, canScrollRight: true });

    const andarScrollRef = useRef(null);
    const baharScrollRef = useRef(null);

    const checkScroll = (ref, setState) => {
        if (ref.current) {
            const { scrollLeft, scrollWidth, clientWidth } = ref.current;
            setState({
                canScrollLeft: scrollLeft > 2,
                canScrollRight: Math.floor(scrollLeft + clientWidth) < scrollWidth - 1
            });
        }
    };

    const scrollCards = (direction, ref, setState) => {
        if (ref.current) {
            const scrollAmount = 100;
            if (direction === "left") {
                ref.current.scrollLeft -= scrollAmount;
            } else {
                ref.current.scrollLeft += scrollAmount;
            }
            setTimeout(() => checkScroll(ref, setState), 200);
        }
    };

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const getMarketByName = (marketName) => getMarketByNation(marketData, marketName, "nat");

    function RulesComponent() {
        return (
            <>
                <RulesHeader />
                <div className="card-body" style={{ padding: "10px" }}>
                    <Rules title="Andar Bahar Rules" rules={[]} />
                </div>
            </>
        )
    }

    const mapNatToImageIndex = (nat) => {
        if (!nat) return 1;
        const parts = nat.split(" ");
        const val = parts[parts.length - 1];
        const map = {
            A: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, J: 11, Q: 12, K: 13,
        };
        return map[val] || 1;
    };

    const items = gameData?.t2?.length > 0 ? gameData.t2 : [];
    const andarItems = items?.slice(0, 13) || [];
    const baharItems = items?.slice(13, 26) || [];

    const t3_data = gameData?.t3?.[0];
    const t3_ar = t3_data?.ar ? t3_data.ar.split(",") : [];
    const t3_br = t3_data?.br ? t3_data.br.split(",") : [];
    const hasCards = (t3_data?.aall && t3_data.aall.trim().length > 0) || (t3_data?.ball && t3_data.ball.trim().length > 0);

    const getCardsArray = (cards) => {
        if (!cards) return [];
        if (Array.isArray(cards)) return cards;
        if (typeof cards === "string") return cards.split(",").filter(c => c.trim().length > 0);
        return [];
    };

    const andarCards = t3_data?.aall ? t3_data.aall.split(",") : getCardsArray(currentGame?.cards).filter((card, i) => i % 2 !== 0 && card !== "1");
    const baharCards = t3_data?.ball ? t3_data.ball.split(",") : getCardsArray(currentGame?.cards).filter((card, i) => i % 2 === 0 && card !== "1");

    const scrollToLatest = (ref, setState) => {
        if (!ref.current) return;
        setTimeout(() => {
            const container = ref.current;
            container.scrollTo({
                left: container.scrollWidth,
                behavior: "smooth"
            });
            setTimeout(() => checkScroll(ref, setState), 400); // Wait for smooth scroll
        }, 400);
    };

    useEffect(() => {
        scrollToLatest(andarScrollRef, setAndarScrollState);
    }, [andarCards.length]);

    useEffect(() => {
        scrollToLatest(baharScrollRef, setBaharScrollState);
    }, [baharCards.length]);

    const CardBox = ({ item, index, side }) => {
        const isClosed = hasCards ? (side === "andar" ? t3_ar[index] : t3_br[index]) === "0" : false;
        const imgIndex = isClosed ? 0 : mapNatToImageIndex(item.nat || item.nation);
        const suspended = getIsSuspended(item);

        return (
            <div className="casino-card-item text-center">
                <div>{item.l1 || "0"}</div>
                <div className={`card-image ${suspended ? "suspended" : ""}`} style={{ position: "relative", display: "inline-block" }}>
                    {/* {suspended && (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 11 }}>
                            <img src="/assets/images/lock.svg" alt="lock" style={{ width: '15px', height: '15px' }} />
                        </div>
                    )} */}
                    <img
                        src={`https://wver.sprintstaticdata.com/v211/static/front/img/andar-bahar-cards/${imgIndex}.png`}
                        alt="card"
                    />
                </div>
                <div className="text-center w-100">
                    <Exposure id={item.sid} className="casino-book book-black" data={exposureData} />
                </div>
            </div>
        );
    };

    const VideoCards = () => {
        const renderSliderRows = (cardList, id, scrollRef, scrollState, setScrollState) => (
            <div className="card-inner mb-1">
                <div className="row row5">
                    <div className="col-12">
                        <div className="d-flex align-items-center">
                            <div
                                className="mr-1"
                                onClick={() => scrollState.canScrollLeft && scrollCards("left", scrollRef, setScrollState)}
                                style={{
                                    cursor: scrollState.canScrollLeft ? 'pointer' : 'default',
                                    color: '#fff',
                                    fontSize: '10px',
                                    opacity: scrollState.canScrollLeft ? 1 : 0.3
                                }}
                            >
                                <i className="fas fa-chevron-left" />
                            </div>
                            <div
                                id={id}
                                ref={scrollRef}
                                onScroll={() => checkScroll(scrollRef, setScrollState)}
                                className="ab-slider d-flex overflow-auto hide-scrollbar"
                                style={{ flex: 1, gap: '2px' }}
                            >
                                {cardList.filter(card => card && card !== "1").map((card, idx) => (
                                    <div key={idx} className="owl-item active" style={{ flex: '0 0 auto' }}>
                                        <div className="item">
                                            <span>
                                                <img src={getImage(card, result_image)} alt={card} style={{ height: '49px', width: '35px' }} />
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div
                                className="ml-1"
                                onClick={() => scrollState.canScrollRight && scrollCards("right", scrollRef, setScrollState)}
                                style={{
                                    cursor: scrollState.canScrollRight ? 'pointer' : 'default',
                                    color: '#fff',
                                    fontSize: '10px',
                                    opacity: scrollState.canScrollRight ? 1 : 0.3
                                }}
                            >
                                <i className="fas fa-chevron-right" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );

        return (
            <div className="row row5 align-items-center">
                {/* <div className="col-1">
                    <div className="row row5">
                        <div className="col-12 mb-3"><b>A</b></div>
                    </div>
                    <div className="row row5">
                        <div className="col-12"><b>B</b></div>
                    </div>
                </div> */}
                <div className="col-12">
                    {renderSliderRows(andarCards, "andarSlider", andarScrollRef, andarScrollState, setAndarScrollState)}
                    {renderSliderRows(baharCards, "baharSlider", baharScrollRef, baharScrollState, setBaharScrollState)}
                </div>
            </div>
        );
    };

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table andar-bahar">
                            <CasinoVideo
                                gameName={game_name}
                                roundId={currentGame?.mid}
                                videoSrc={iframe_url}
                                results={lastResults}
                                timeLeft={currentGame?.autotime || 0}
                                totalTime={currentGame?.ft || 30}
                                isCardDrawerOpen={isCardDrawerOpen}
                                setIsCardDrawerOpen={setIsCardDrawerOpen}
                                CardsComponent={VideoCards}
                            />


                            <div className="casino-detail">
                                <div className="ab-bg d-flex" style={{ gap: '5px' }}>
                                    <div className="andar-cards-box text-center" style={{ position: 'relative', flex: 1, paddingRight: '2px', gap: '2px' }}>
                                        <h5 className="w-100 text-center text-playera">
                                            Andar
                                            <div className="casino-min-max">
                                                <BetLimitInfo min={andarItems[0]?.min} max={andarItems[0]?.max} />
                                            </div>
                                        </h5>
                                        <div className="row row5 justify-content-center">
                                            {andarItems.map((item, index) => (
                                                <div key={item.sid} className="col-6 col-md-4 mb-2">
                                                    <CardBox item={item} index={index} side="andar" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bahar-cards-box text-center" style={{ position: 'relative', flex: 1, paddingLeft: '2px', gap: '2px' }}>
                                        <h5 className="w-100 text-center text-playerb">
                                            Bahar
                                            <div className="casino-min-max">
                                                <BetLimitInfo min={baharItems[0]?.min} max={baharItems[0]?.max} />
                                            </div>
                                        </h5>
                                        <div className="row row5 justify-content-center">
                                            {baharItems.map((item, index) => (
                                                <div key={item.sid} className="col-6 col-md-4 mb-2">
                                                    <CardBox item={item} index={index} side="bahar" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <RemarkMarquee remark="Payout : Bahar 1st Card 25% and All Other Andar-Bahar Cards 100%." />
                            </div>
                        </div>

                        {/* Last results for mobile - outside .casino-video to bypass display:none CSS on mobile */}
                        <div className="d-none-big">
                            <LastResult
                                results={lastResults}
                                gameName={game_name}
                                resultPath={phpFile}
                            />
                        </div>
                    </div>
                </div>
                <CasinoRightSidebar />
            </div>
        </div>
    );
};

export default AndarBahar;
