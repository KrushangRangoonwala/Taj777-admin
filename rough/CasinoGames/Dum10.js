import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { fetchCasinoExposureApi } from "../../api/api";
import { getImage, getMarketByNation, getValueAfterDot, getIsSuspended, getExposureClass, getSuspendedClass } from "../../utilies/helpers";
import { useGetFileData } from "../../hooks/useGetFileData";
import CasinoVideo from "./components/CasinoVideo";
import useIsMobile from "../../hooks/useIsMobile";
import { useSocket } from "../Socket/useSocket";

const Dum10 = ({ isVisible, onBetSelection, lastBetTime }) => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [exposureData, setExposureData] = useState([]);
    const isMobile = useIsMobile(767);
    const cardsListRef = useRef(null);
    const scrollPositionRef = useRef(0);
    const scrollAnimationRef = useRef(null);
    const cardsDataRef = useRef({ cardList: [], result_image: '', isMobile: false });

    // Restore scroll position after each render (parent-level)
    useLayoutEffect(() => {
        if (cardsListRef.current) {
            cardsListRef.current.scrollLeft = scrollPositionRef.current;
        }
    });

    useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.[0]?.mid) return;
            try {
                const response = await fetchCasinoExposureApi({
                    markettype: CODE,
                    main_event_id: gameData.t1[0].mid,
                    curPageName: phpFile,
                });
                const aaa = response?.data
                if (!aaa) return;
                const bbb = Array.isArray(aaa) ? aaa : Object.values(aaa);
                setExposureData(bbb);
            } catch (error) {
                console.error("Error fetching exposure:", error);
            }
        };
        fetchExposure();
    }, [gameData?.t1?.[0]?.mid, lastBetTime, CODE, phpFile]);

    const getExposure = (marketId) => {
        if (!Array.isArray(exposureData)) return 0;
        const market = exposureData.find((item) => item.market_id == marketId);
        return market ? market.win_loss || market.total_exposure : 0;
    };

    const renderExposure = (marketId, isUpDown = false) => {
        const exposure = getExposure(marketId);
        // exposure ? console.log('33exposure', exposure) : null;
        if (exposure === 0) return null;
        return (
            <span className={`mr-2 ${isUpDown ? 'up-down-book' : ''} ${getExposureClass(exposure)}`}>
                {exposure}
            </span>
        );
    };

    const socket = useSocket("casino");
    useEffect(() => {
        if (!socket) return;

        const handleBollywoodData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) {
                    setGameData(payload);
                }
            } catch (error) {
                console.error("Error processing Bollywood data:", error);
            }
        };

        const handleConnect = () => {
            console.log(`✅ ${game_type} Connected:`, socket.id);
            socket.emit("Room", game_type);
        };

        const handleDisconnect = (reason) => {
            console.log(`⚠️ ${game_type} Disconnected:`, reason);
        };

        const handleConnectError = (error) => {
            console.error("🔴 Connection Error:", error.message);
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        // socket.on(game_type, handleBollywoodData);
        socket.on("game", handleBollywoodData);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        return () => {
            socket.off("connect", handleConnect);
            socket.off(game_type, handleBollywoodData);
            socket.off("game", handleBollywoodData);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
        };
    }, [socket, game_type]);

    const currentGame = gameData?.t1?.[0];
    const data = gameData?.t2 || [];

    const cardList = currentGame?.lcard != "" ? (currentGame?.lcard?.split(',').reverse() || []) : [];
    // const cardList_ = s != "" ? (s?.split(',').reverse() || []) : [];
    // console.log('lcard', cardList);

    // Update the ref so the stable component always has the latest data
    useEffect(() => {
        cardsDataRef.current = { cardList, result_image, isMobile };
    }, [cardList, result_image, isMobile]);

    const handleOddsClick = (marketName, odds, market, isBack, suspended) => {
        if (!market || suspended || odds == 0) return;

        const min = market?.min || 100;
        const max = market?.max || 300000;

        if (onBetSelection) {
            onBetSelection({
                teamName: marketName,
                odds: odds,
                minBet: min,
                maxBet: max,
                isBack,
                marketId: market.sid,
                eventId: getValueAfterDot(currentGame?.mid),
            });
        }
    };

    const getMarketBySid = (sid) => data.find((m) => m.sid == sid);

    const marketNextTotal = getMarketBySid(1);
    const marketRed = getMarketBySid(3);
    const marketBlack = getMarketBySid(4);
    const marketEven = getMarketBySid(5);
    const marketOdd = getMarketBySid(6);

    const isSuspended = (market) => getIsSuspended(market);

    const [scrollTrigger, setScrollTrigger] = useState(0);
    const scrollStateRef = useRef({ isPrevDisabled: true, isNextDisabled: false });

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

    // useEffect(() => {
    //     return () => {
    //         if (scrollAnimationRef.current) {
    //             cancelAnimationFrame(scrollAnimationRef.current);
    //         }
    //     };
    // }, []);

    // Stable component using useMemo to prevent unmounting
    const CardsComponent = useMemo(() => {
        const slideWidth = 31 * 3;

        // Return a component function
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
                <div className="casino-video-cards-container">
                    <div className="lastCards-container">
                        <section tabIndex="0" className="lastCards hooper is-rtl">
                            <div
                                className="hooper-list"
                                ref={cardsListRef}
                                onScroll={handleScroll}
                                style={{
                                    overflowX: "auto",
                                    display: "flex",
                                    scrollbarWidth: "none",
                                    msOverflowStyle: "none"
                                }}
                            >
                                <ul className="hooper-track" style={{ transform: "none", padding: 0, margin: 0 }}>
                                    {cardList.map((card, index) => (
                                        <li key={index} className="hooper-slide" style={{ width: isMobile ? "23px" : "30px" }}>
                                            <img src={getImage(card, result_image)} alt={card} />
                                        </li>
                                    ))}
                                </ul>
                                <div className="hooper-navigation is-rtl">
                                    <button type="button" className={`hooper-prev ${isPrevDisabled ? 'is-disabled' : ''}`} onClick={handlePrev}>
                                        <svg className="icon icon-arrowRight" viewBox="0 0 24 24" width="24px" height="24px">
                                            <title>Arrow Right</title>
                                            <path d="M0 0h24v24H0z" fill="none"></path>
                                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path>
                                        </svg>
                                    </button>
                                    <button type="button" className={`hooper-next ${isNextDisabled ? 'is-disabled' : ''}`} onClick={handleNext}>
                                        <svg className="icon icon-arrowLeft" viewBox="0 0 24 24" width="24px" height="24px">
                                            <title>Arrow Left</title>
                                            <path d="M0 0h24v24H0z" fill="none"></path>
                                            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"></path>
                                        </svg>
                                    </button>
                                </div>
                                <div aria-live="polite" aria-atomic="true" className="hooper-liveregion hooper-sr-only">
                                    Item 1 of {cardList.length}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            );
        };
    }, []); // Empty dependencies = stable reference

    function BelowRidComp() {
        return (
            <div className="dkd-total" style={{ maxWidth: '180px' }}>
                <div>
                    <div>
                        <div>Curr. Total:</div>
                        <div className="numeric mt-1 text-playerb">{currentGame?.csum}</div>
                    </div>
                    <div>Card #: {cardList.length}</div>
                </div>
                <div>{gameData?.t2?.[0]?.nat}</div>
            </div>
        )
    }

    function CurrentCard() {
        return (
            <div className="casino-video-current-card">
                <div>
                    <span>
                        <img src={getImage(currentGame?.cards, result_image)} />
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className="casino-table duskadum">
            <CasinoVideo
                gameName={game_name}
                roundId={currentGame?.mid}
                videoSrc={iframe_url}
                isCardDrawerOpen={isCardDrawerOpen}
                setIsCardDrawerOpen={setIsCardDrawerOpen}
                autotime={currentGame?.autotime}
                totalTime={currentGame?.ft} CardsComponent={CardsComponent}
                BelowRidComp={BelowRidComp}
                CurrentCard={CurrentCard}
            />

            <div className="casino-detail">
                <div className="casino-box-row">
                    <div className="casino-nation-name">
                        <b>{marketNextTotal?.nat || "Next Total"}</b>
                        <div className="float-right mr-2">
                            <span className="d-block d-none"></span>{renderExposure(marketNextTotal?.sid)}
                        </div>
                    </div>
                    <div className="casino-bl-box">
                        <div
                            className={`back casino-bl-box-item ${isSuspended(marketNextTotal) ? "suspended" : ""}`}
                            onClick={() => !isSuspended(marketNextTotal) && handleOddsClick(marketNextTotal?.nat, marketNextTotal?.b1, marketNextTotal, true, isSuspended(marketNextTotal))}
                        >
                            <span className="casino-box-odd">{marketNextTotal?.b1 || "-"}</span>
                        </div>
                        <div
                            className={`lay casino-bl-box-item ${isSuspended(marketNextTotal) ? "suspended" : ""}`}
                            onClick={() => !isSuspended(marketNextTotal) && handleOddsClick(marketNextTotal?.nat, marketNextTotal?.l1, marketNextTotal, false, isSuspended(marketNextTotal))}
                        >
                            <span className="casino-box-odd">{marketNextTotal?.l1 || "-"}</span>
                        </div>
                    </div>
                </div>

                <div className="dkd-other mt-2">
                    <div className="casino-box-row">
                        {/* Top row showing odds of Even, Odd, Red, Black */}
                        <div className="casino-bl-box"><b>{marketEven?.b1 || "0"}</b></div>
                        <div className="casino-bl-box"><b>{marketOdd?.b1 || "0"}</b></div>
                        <div className="casino-bl-box"><b>{marketRed?.b1 || "0"}</b></div>
                        <div className="casino-bl-box"><b>{marketBlack?.b1 || "0"}</b></div>
                    </div>
                    <div className="casino-box-row">
                        {/* Even */}
                        <div className="casino-bl-box">
                            <div
                                className={`back casino-bl-box-item ${getSuspendedClass(marketEven, getExposure)}`}
                                onClick={() => !isSuspended(marketEven) && handleOddsClick("Even", marketEven?.b1, marketEven, true, isSuspended(marketEven))}
                            >
                                <span className="casino-box-odd">Even</span>
                                {renderExposure(marketEven?.sid)}
                            </div>
                        </div>
                        {/* Odd */}
                        <div className="casino-bl-box">
                            <div
                                className={`back casino-bl-box-item ${getSuspendedClass(marketOdd, getExposure)}`}
                                onClick={() => !isSuspended(marketOdd) && handleOddsClick("Odd", marketOdd?.b1, marketOdd, true, isSuspended(marketOdd))}
                            >
                                <span className="casino-box-odd">Odd</span>
                                {renderExposure(marketOdd?.sid)}
                            </div>
                        </div>
                        {/* Red (Hearts/Diamonds) */}
                        <div className="casino-bl-box">
                            <div
                                className={`back casino-bl-box-item casino-card-img ${getSuspendedClass(marketRed, getExposure)}`}
                                onClick={() => !isSuspended(marketRed) && handleOddsClick("Red", marketRed?.b1, marketRed, true, isSuspended(marketRed))}
                            >
                                <span>
                                    <img src={getImage("heart", result_image)} alt="Hearts" />
                                    <img src={getImage("diamond", result_image)} alt="Diamonds" />
                                </span>
                                {renderExposure(marketRed?.sid)}
                            </div>
                        </div>
                        {/* Black (Spades/Clubs) */}
                        <div className="casino-bl-box">
                            <div
                                className={`back casino-bl-box-item casino-card-img ${getSuspendedClass(marketBlack, getExposure)}`}
                                onClick={() => !isSuspended(marketBlack) && handleOddsClick("Black", marketBlack?.b1, marketBlack, true, isSuspended(marketBlack))}
                            >
                                <span>
                                    <img src={getImage("spade", result_image)} alt="Spades" />
                                    <img src={getImage("club", result_image)} alt="Clubs" />
                                </span>
                                {renderExposure(marketBlack?.sid)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dum10;
