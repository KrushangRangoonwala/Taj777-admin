import React, { useState, useEffect, useRef } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
// import { fetchCasinoExposureApi } from "../../../api/API";
import { getImage, getMarketByNation, getValueAfterDot, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import LastResult from "./components/LastResult";
import useIsMobile from "../../../hooks/useIsMobile";

const AndarBahar50 = ({ onBetSelection, lastBetTime }) => {
    const isMobile = useIsMobile();
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [lastResults, setLastResults] = useState([]);
    // const [exposureData, setExposureData] = useState([]);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);

    const socket = useSocket("casino");
    useEffect(() => {
        if (!socket) return;

        const handleData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) {
                    setGameData(payload);
                }
            } catch (error) {
                console.error("Error processing AndarBahar50 data:", error);
            }
        };

        const handleGameResult = (data) => {
            try {
                // Socket sends: ["gameResult", { res: [{mid, win}, ...], res1: {...} }]
                const payload = Array.isArray(data) ? data[1] : data;
                if (payload?.res && Array.isArray(payload.res)) {
                    setLastResults(payload.res);
                }
            } catch (error) {
                console.error("Error processing AndarBahar50 gameResult:", error);
            }
        };

        const handleConnect = () => {
            console.log(`✅ ${game_type} Connected:`, socket.id);
            socket.emit("Room", "ab3"); // Using ab3 for Andar Bahar 50 Cards
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on("game", handleData);
        socket.on("ab3", handleData);
        socket.on("gameResult", handleGameResult);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleData);
            socket.off("ab3", handleData);
            socket.off("gameResult", handleGameResult);
        };
    }, [socket, game_type]);

    // Exposure logic commented out as requested
    /*
    useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.[0]?.mid) return;
            try {
                const response = await fetchCasinoExposureApi({
                    markettype: "AB3",
                    main_event_id: gameData.t1[0].mid,
                    curPageName: phpFile,
                });
                if (Array.isArray(response?.data)) {
                    setExposureData(response.data);
                }
            } catch (error) {
                console.error("Error fetching exposure:", error);
            }
        };
        fetchExposure();
    }, [gameData?.t1?.[0]?.mid, lastBetTime, phpFile]);
    */

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t3 || []; // Markets for Andar/Bahar 1-13
    const nextCardMarket = gameData?.t2?.[0]; // Current card count market

    const getNextCardInfo = () => {
        const rawNat = nextCardMarket?.nat || "";
        const match = rawNat.match(/(\d+)/);
        const count = match ? parseInt(match[0], 10) : 0;
        if (!count) return { text: "-", side: "", count: 0 };
        const side = count % 2 !== 0 ? "Bahar" : "Andar";
        return { text: `${count}/${side}`, count, side };
    };

    const nextCardInfo = getNextCardInfo();
    const isGameSuspended = nextCardMarket?.gstatus === "SUSPENDED" || currentGame?.gstatus === "SUSPENDED";
    const isAndarLocked = isGameSuspended || nextCardInfo.side === "Andar";
    const isBaharLocked = isGameSuspended;

    const handleBet = (market, side) => {
        if (!market || market.gstatus === "SUSPENDED" || market.b1 == 0) return;

        if (onBetSelection) {
            onBetSelection({
                teamName: `${market.nat}/${nextCardInfo.count}`,
                odds: market.b1,
                minBet: currentGame?.min || 100,
                maxBet: currentGame?.max || 300000,
                isBack: true,
                marketId: market.sid,
                eventId: getValueAfterDot(currentGame?.mid),
                side: side,
                cardCount: nextCardInfo.count,
            });
        }
    };

    const mapNatToImageIndex = (nat) => {
        if (!nat) return 1;
        const parts = nat.split(" ");
        const val = parts[parts.length - 1];
        const map = { A: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, J: 11, Q: 12, K: 13 };
        return map[val] || 1;
    };

    const [andarScrollState, setAndarScrollState] = useState({ canScrollLeft: false, canScrollRight: true });
    const [baharScrollState, setBaharScrollState] = useState({ canScrollLeft: false, canScrollRight: true });
    const [andarMobileScrollState, setAndarMobileScrollState] = useState({ canScrollLeft: false, canScrollRight: true });
    const [baharMobileScrollState, setBaharMobileScrollState] = useState({ canScrollLeft: false, canScrollRight: true });

    const andarScrollRef = useRef(null);
    const baharScrollRef = useRef(null);
    const andarMobileScrollRef = useRef(null);
    const baharMobileScrollRef = useRef(null);

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

    const cards = currentGame?.cards || [];
    const andarCards = cards.filter((c, i) => i % 2 !== 0 && c !== "1");
    const baharCards = cards.filter((c, i) => i % 2 === 0 && c !== "1");

    useEffect(() => {
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
        scrollToLatest(andarScrollRef, setAndarScrollState);
        scrollToLatest(andarMobileScrollRef, setAndarMobileScrollState);
    }, [andarCards.length]);

    useEffect(() => {
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
        scrollToLatest(baharScrollRef, setBaharScrollState);
        scrollToLatest(baharMobileScrollRef, setBaharMobileScrollState);
    }, [baharCards.length]);

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
                                {cardList.map((card, idx) => (
                                    <div key={idx} className="owl-item active" style={{ flex: '0 0 auto' }}>
                                        <div className="item">
                                            <span>
                                                <img src={getImage(card, 'cards_new')} alt={card} style={{ height: '42px', width: '30px' }} />
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
                <div className="col-1">
                    <div className="row row5">
                        <div className="col-12 mb-3"><b>A</b></div>
                    </div>
                    <div className="row row5">
                        <div className="col-12"><b>B</b></div>
                    </div>
                </div>
                <div className="col-11">
                    {renderSliderRows(andarCards, "andarSlider", andarScrollRef, andarScrollState, setAndarScrollState)}
                    {renderSliderRows(baharCards, "baharSlider", baharScrollRef, baharScrollState, setBaharScrollState)}
                </div>
            </div>
        );
    };

    const CardItem = ({ item, side }) => {
        const isSuspended = item.gstatus === "SUSPENDED" || (side === "ANDAR" ? isAndarLocked : isBaharLocked);
        const cardIndex = mapNatToImageIndex(item.nat);

        return (
            <div
                className={`casino-card-item ${item.b1 == 0 ? "card-closed" : ""}`}
                onClick={() => handleBet(item, side)}
                style={{ position: 'relative', cursor: 'pointer' }}
            >
                <div className="text-center">{item.l1 || "0"}</div>
                <div className="card-image">
                    <img
                        src={item.b1 == 0
                            ? "https://wver.sprintstaticdata.com/v193/static/front/img/andar-bahar-cards/0.png"
                            : `https://wver.sprintstaticdata.com/v66/static/front/img/andar-bahar-cards/${cardIndex}.png`
                        }
                        alt="card"
                    />
                </div>
                <div className="casino-book book-black">0</div>
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
                        <div className="casino-table andar-bahar2 ab3">
                            <CasinoVideo
                                gameName="ANDAR BAHAR 50 CARDS"
                                roundId={currentGame?.mid}
                                videoSrc={iframe_url}
                                results={lastResults}
                                timeLeft={currentGame?.autotime || 0}
                                totalTime={currentGame?.ft || 30}
                                isCardDrawerOpen={isCardDrawerOpen}
                                setIsCardDrawerOpen={setIsCardDrawerOpen}
                                CardsComponent={VideoCards}
                                resultPath={phpFile}
                            />

                            <div className="casino-video-cards-static-mobile d-none-big" style={{ backgroundColor: '#3C444B', padding: '5px', paddingRight: '10px' }}>
                                {/* <div className="text-center mb-1">
                                    <span style={{ color: '#aaa', fontSize: '10px' }}>Next Card Count: </span>
                                    <span style={{ color: '#ffc107', fontSize: '10px' }}>{nextCardInfo.text}</span>
                                </div> */}
                                <div className="d-flex align-items-center mb-1" style={{ height: '45px' }}>
                                    <div style={{ width: '50px', color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>A</div>
                                    <div className="d-flex align-items-center" style={{ width: "279px", overflow: 'hidden' }}>
                                        <div
                                            className="mr-1"
                                            onClick={() => andarMobileScrollState.canScrollLeft && scrollCards("left", andarMobileScrollRef, setAndarMobileScrollState)}
                                            style={{
                                                cursor: andarMobileScrollState.canScrollLeft ? 'pointer' : 'default',
                                                color: '#fff',
                                                opacity: andarMobileScrollState.canScrollLeft ? 1 : 0.3
                                            }}
                                        >
                                            <i className="fas fa-chevron-left" style={{ fontSize: '10px' }} />
                                        </div>
                                        <div ref={andarMobileScrollRef} onScroll={() => checkScroll(andarMobileScrollRef, setAndarMobileScrollState)} className="d-flex overflow-auto hide-scrollbar" style={{ flex: 1 }}>
                                            {andarCards.map((card, idx) => (
                                                <img key={idx} src={getImage(card, 'cards_new')} alt={card} style={{ height: '42px', width: '30px', marginRight: '4px' }} />
                                            ))}
                                        </div>
                                        <div
                                            className="ml-1"
                                            onClick={() => andarMobileScrollState.canScrollRight && scrollCards("right", andarMobileScrollRef, setAndarMobileScrollState)}
                                            style={{
                                                cursor: andarMobileScrollState.canScrollRight ? 'pointer' : 'default',
                                                color: '#fff',
                                                opacity: andarMobileScrollState.canScrollRight ? 1 : 0.3
                                            }}
                                        >
                                            <i className="fas fa-chevron-right" style={{ fontSize: '10px' }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center" style={{ height: '45px' }}>
                                    <div style={{ width: '50px', color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>B</div>
                                    <div className="d-flex align-items-center" style={{ width: "279px", overflow: 'hidden' }}>
                                        <div
                                            className="mr-1"
                                            onClick={() => baharMobileScrollState.canScrollLeft && scrollCards("left", baharMobileScrollRef, setBaharMobileScrollState)}
                                            style={{
                                                cursor: baharMobileScrollState.canScrollLeft ? 'pointer' : 'default',
                                                color: '#fff',
                                                opacity: baharMobileScrollState.canScrollLeft ? 1 : 0.3
                                            }}
                                        >
                                            <i className="fas fa-chevron-left" style={{ fontSize: '10px' }} />
                                        </div>
                                        <div ref={baharMobileScrollRef} onScroll={() => checkScroll(baharMobileScrollRef, setBaharMobileScrollState)} className="d-flex overflow-auto hide-scrollbar" style={{ flex: 1 }}>
                                            {baharCards.map((card, idx) => (
                                                <img key={idx} src={getImage(card, 'cards_new')} alt={card} style={{ height: '42px', width: '30px', marginRight: '4px' }} />
                                            ))}
                                        </div>
                                        <div
                                            className="ml-1"
                                            onClick={() => baharMobileScrollState.canScrollRight && scrollCards("right", baharMobileScrollRef, setBaharMobileScrollState)}
                                            style={{
                                                cursor: baharMobileScrollState.canScrollRight ? 'pointer' : 'default',
                                                color: '#fff',
                                                opacity: baharMobileScrollState.canScrollRight ? 1 : 0.3
                                            }}
                                        >
                                            <i className="fas fa-chevron-right" style={{ fontSize: '10px' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="casino-detail">
                                <div className="ab-bg d-flex" style={{ gap: '5px' }}>
                                    <div className={`andar-cards-box text-center ${isAndarLocked ? "suspended" : ""}`} style={{ position: 'relative', flex: 1, paddingRight: '2px', gap: '2px' }}>
                                        <h5 className="w-100 text-center text-playera" style={{ fontSize: '20px' }}>Andar</h5>
                                        {isAndarLocked && (
                                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 11 }}>
                                                <img src="/assets/images/lock.svg" alt="lock" style={{ width: '15px', height: '15px' }} />
                                            </div>
                                        )}
                                        <div className="row row5 justify-content-center">
                                            {marketData.slice(0, 13).map((item) => (
                                                <div key={item.sid} className="col-6 col-md-4 mb-2">
                                                    <CardItem item={item} side="ANDAR" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={`bahar-cards-box text-center ${isBaharLocked ? "suspended" : ""}`} style={{ position: 'relative', flex: 1, paddingLeft: '2px', gap: '2px' }}>
                                        <h5 className="w-100 text-center text-playerb" style={{ fontSize: '20px' }}>Bahar</h5>
                                        {isBaharLocked && (
                                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 11 }}>
                                                <img src="/assets/images/lock.svg" alt="lock" style={{ width: '15px', height: '15px' }} />
                                            </div>
                                        )}
                                        <div className="row row5 justify-content-center">
                                            {marketData.slice(13, 26).map((item) => (
                                                <div key={item.sid} className="col-6 col-md-4 mb-2">
                                                    <CardItem item={item} side="BAHAR" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 text-right casino-min-max">
                                    R:<span>{currentGame?.min || 100}</span>-<span>{currentGame?.max || "3L"}</span>
                                </div>
                            </div>

                            {/* Last results for mobile - outside .casino-video to bypass display:none CSS on mobile */}
                            <div className="d-none-big">
                                <LastResult
                                    results={lastResults}
                                    gameName="ANDAR BAHAR 50 CARDS"
                                    resultPath={phpFile}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <CasinoRightSidebar />
            </div>
        </div>
    );
};

export default AndarBahar50;
