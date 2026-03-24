import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { fetchCasinoExposureApi } from "../../api/api";
import { getImage, getValueAfterDot, getIsSuspended } from "../../utilies/helpers";
import { useGetFileData } from "../../hooks/useGetFileData";
import CasinoVideo from "./components/CasinoVideo";
import useIsMobile from "../../hooks/useIsMobile";
import { useSocket } from "../Socket/useSocket";

const cardNames = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const BettingBox = ({ market, remark, isMobile, type, sliderRef, scrollPosRef, onOddsClick, renderExposure, suspended, selectedCards, onCardClick }) => {
    const className = type === "back" ? "back" : "lay";

    const handleScroll = () => {
        if (sliderRef.current) scrollPosRef.current = sliderRef.current.scrollLeft;
    };

    const handleNext = (e) => {
        e.stopPropagation();
        if (sliderRef.current) sliderRef.current.scrollBy({ left: 60, behavior: "smooth" });
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        if (sliderRef.current) sliderRef.current.scrollBy({ left: -60, behavior: "smooth" });
    };

    const isCardSelected = (name) => selectedCards.includes(name);
    const mName = market?.nat?.[0]?.toUpperCase() + market?.nat?.slice(1)?.toLowerCase();
    if (isMobile) {
        return (
            <div className={`threecardj-bl-box ${className}`}>
                <div className="threecardj-title">
                    <span><b>{mName}</b> <b className="ml-2">{suspended ? 0 : market?.rate || 0}</b></span>
                    {renderExposure(market?.sid, "ml-2")}
                </div>
                <div className="threecardj-cards">
                    <div className={suspended ? "suspended" : ""}>
                        <div className="lastCards-container threeCardJ mt-1">
                            <section tabIndex="0" className="lastCards hooper">
                                <div
                                    className="hooper-list"
                                    ref={sliderRef}
                                    onScroll={handleScroll}
                                    style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}
                                >
                                    <ul className="hooper-track" style={{ transform: "none", padding: 0, margin: 0, display: "flex", listStyle: "none" }}>
                                        {cardNames.map((name, index) => (
                                            <li key={index} className="hooper-slide" style={{ width: "30.7188px", flexShrink: 0 }}>
                                                <div>
                                                    <img
                                                        src={getImage(name, 'cards')}
                                                        alt={name}
                                                        className={isCardSelected(name) ? "selected" : ""}
                                                        onClick={() => onCardClick(name, type)}
                                                    /></div>
                                            </li>
                                        ))}
                                    </ul>


                                    <div className="hooper-navigation">
                                        <button type="button" className="hooper-prev" onClick={handlePrev}>
                                            <svg className="icon icon-arrowLeft" viewBox="0 0 24 24" width="24px" height="24px"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"></path></svg>
                                        </button>
                                        <button type="button" className="hooper-next" onClick={handleNext}>
                                            <svg className="icon icon-arrowRight" viewBox="0 0 24 24" width="24px" height="24px"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                    <div className="casino-min-max text-right">
                        <marquee>{remark}</marquee>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`threecardj-bl-box ${className}`}>
            <div className="threecardj-title">
                <b>{market?.nat}</b>
                {renderExposure(market?.sid, "d-block ml-2")}
            </div>
            <div className="threecardj-cards">
                <div className="threecardj-odds text-center"><b>{market?.rate || 0}</b></div>
                <div className={`casino-cards text-center mt-1 ${suspended ? "suspended" : ""}`}>
                    {cardNames.map((name, index) => (
                        <div key={index} className="casino-card-item">
                            <div className="card-image">
                                <img
                                    src={getImage(name, 'cards')}
                                    alt={name}
                                    className={isCardSelected(name) ? "selected" : ""}
                                    onClick={() => onCardClick(name, type)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="casino-min-max text-right">
                    <marquee>{remark}</marquee>
                </div>
            </div>
        </div>
    );
};

const ThreeCardJ = ({ isVisible, onBetSelection, lastBetTime }) => {
    const { CODE, game_type, phpFile, game_name, iframe_url, result_image } = useGetFileData();
    console.log('result_image', result_image);
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [exposureData, setExposureData] = useState([]);
    const isMobile = useIsMobile(767);

    const yesSliderRef = useRef(null);
    const noSliderRef = useRef(null);
    const yesScrollPos = useRef(0);
    const noScrollPos = useRef(0);

    const [selectedCards, setSelectedCards] = useState([]);
    const [selectionType, setSelectionType] = useState("");

    const handleCardClick = (cardName, cardType) => {
        if (selectionType !== cardType) {
            setSelectionType(cardType);
            setSelectedCards([cardName]);
        } else {
            // // Already in same section
            // if (selectedCards.includes(cardName)) {
            //     // Toggle off if needed, but user said "if clicked three cards" 
            //     // typically these games don't toggle back unless specified.
            //     // However, let's allow unselecting for better UX.
            //     setSelectedCards(prev => prev.filter(c => c !== cardName));
            // } else {
            if (selectedCards.length < 3) {
                const newSelection = [...selectedCards, cardName];
                setSelectedCards(newSelection);

                if (newSelection.length === 3) {
                    const currentMarket = cardType === "back" ? markets.YES : markets.NO;
                    if (currentMarket) {
                        handleOddsClick(
                            newSelection,
                            currentMarket.rate,
                            currentMarket,
                            cardType === "back",
                            isSuspended(currentMarket)
                        );
                    }
                    // Reset selection after trigger
                    setTimeout(() => {
                        setSelectedCards([]);
                        setSelectionType("");
                    }, 500); // Small delay to show visual feedback
                }
            }
            // }
        }
    };

    useLayoutEffect(() => {
        if (yesSliderRef.current) yesSliderRef.current.scrollLeft = yesScrollPos.current;
        if (noSliderRef.current) noSliderRef.current.scrollLeft = noScrollPos.current;
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
                const aaa = response?.data;
                const bbb = Array.isArray(aaa) ? aaa : Object.values(aaa || {});
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

    const renderExposure = (marketId, className = "") => {
        const exposure = getExposure(marketId);
        if (exposure === 0) return null;
        return (
            <span className={`${className} ${exposure > 0 ? 'book-green' : 'book-red'}`}>
                {exposure}
            </span>
        );
    };

    const socket = useSocket("casino");
    useEffect(() => {
        if (!socket) return;
        const handleGameData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) setGameData(payload);
            } catch (error) {
                console.error("Error processing 3cardj data:", error);
            }
        };
        const handleConnect = () => socket.emit("Room", game_type);
        if (socket.connected) handleConnect();
        socket.on("connect", handleConnect);
        socket.on("game", handleGameData);
        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleGameData);
        };
    }, [socket, game_type]);

    const currentGame = gameData?.t1?.[0];
    const data = gameData?.t2 || [];

    const markets = {
        YES: data.find(m => m.sid == 1),
        NO: data.find(m => m.sid == 2)
    };
    console.log('1234 markets', markets)

    const handleOddsClick = (selectedCards, odds, market, isBack, suspended) => {
        if (!market || suspended || odds == 0) return;
        const min = market?.min || 100;
        const max = market?.max || 300000;
        if (onBetSelection) {
            onBetSelection({
                teamName: `${market.nat} ${selectedCards.join("")}`,
                market_name_api_value: `${market.nat} ${selectedCards.join(",")}`,
                odds: odds,
                minBet: min,
                maxBet: max,
                isBack,
                marketId: market.sid,
                eventId: getValueAfterDot(currentGame?.mid),
            });
        }
    };

    const isSuspended = (market) => getIsSuspended(market) && market?.gstatus != "1";

    const CardsComponent = () => {
        const cards = [currentGame?.C1, currentGame?.C2, currentGame?.C3].filter(c => c && c !== "0");
        return (
            <div>
                {cards.map((c, i) => (
                    <span key={i}><img src={getImage(c, c == 1 ? 'cards_new' : result_image)} alt={`card-${i}`} /></span>
                ))}
            </div>
        );
    };

    const remarkArr = (currentGame?.remark || "").split('|');
    const remarks = {
        YES: remarkArr[0] || "",
        NO: remarkArr[1] || ""
    };

    // const containerClass = isMobile ? "threecardj-container d-none-big" : "threecardj-container d-none-small";
    const containerClass = isMobile ? "threecardj-container" : "threecardj-container";

    return (
        <div className="casino-table threecardj" style={{ maxWidth: '100vw' }}>
            <CasinoVideo
                gameName={game_name}
                roundId={currentGame?.mid}
                videoSrc={iframe_url}
                isCardDrawerOpen={isCardDrawerOpen}
                setIsCardDrawerOpen={setIsCardDrawerOpen}
                autotime={currentGame?.autotime}
                totalTime={currentGame?.ft}
                CardsComponent={CardsComponent}
                isRuleIcon={false}
                cards={[currentGame?.C1, currentGame?.C2, currentGame?.C3]}
            />

            <div className="casino-detail">
                <div className={containerClass}>
                    <BettingBox
                        type="back"
                        market={markets.YES}
                        remark={remarks.YES}
                        isMobile={isMobile}
                        sliderRef={yesSliderRef}
                        scrollPosRef={yesScrollPos}
                        onOddsClick={handleOddsClick}
                        renderExposure={renderExposure}
                        suspended={isSuspended(markets.YES)}
                        selectedCards={selectionType === "back" ? selectedCards : []}
                        onCardClick={handleCardClick}
                    />
                    <BettingBox
                        type="lay"
                        market={markets.NO}
                        remark={remarks.NO}
                        isMobile={isMobile}
                        sliderRef={noSliderRef}
                        scrollPosRef={noScrollPos}
                        onOddsClick={handleOddsClick}
                        renderExposure={renderExposure}
                        suspended={isSuspended(markets.NO)}
                        selectedCards={selectionType === "lay" ? selectedCards : []}
                        onCardClick={handleCardClick}
                    />
                </div>
            </div>
        </div>
    );
};

export default ThreeCardJ;
