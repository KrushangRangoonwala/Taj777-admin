import React, { useState, useEffect } from "react";
import { fetchCasinoExposureApi } from "../../api/api";
import { getImage, getMarketByNation, getValueAfterDot, getIsSuspended } from "../../utilies/helpers";
import { useGetFileData } from "../../hooks/useGetFileData";
import CasinoVideo from "./components/CasinoVideo";
import useIsMobile from "../../hooks/useIsMobile";
import { useSocket } from "../Socket/useSocket";

const NoteNum = ({ isVisible, onBetSelection, lastBetTime }) => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [exposureData, setExposureData] = useState([]);
    const isMobile = useIsMobile(767);

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

    const renderExposure = (marketId, className = "") => {
        const exposure = getExposure(marketId);
        if (exposure === 0) return null;
        return (
            <span className={`mr-1 ${className} ${exposure > 0 ? 'book-green' : 'book-red'}`}>
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
                if (payload) {
                    setGameData(payload);
                }
            } catch (error) {
                console.error("Error processing NoteNum data:", error);
            }
        };

        const handleConnect = () => {
            socket.emit("Room", game_type);
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on("game", handleGameData);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleGameData);
        };
    }, [socket, game_type]);

    const currentGame = gameData?.t1?.[0];
    const data = gameData?.t2 || [];

    const cardList = [currentGame?.C1, currentGame?.C2, currentGame?.C3, currentGame?.C4, currentGame?.C5, currentGame?.C6];

    const handleOddsClick = (marketName, odds, market, isBack, suspended, marketId, marketNameApiValue) => {
        if (!market || suspended || odds == 0) return;

        const min = market?.min || 100;
        const max = market?.max || 300000;

        if (onBetSelection) {
            onBetSelection({
                teamName: marketName,
                market_name_api_value: marketNameApiValue,
                odds: odds,
                minBet: min,
                maxBet: max,
                isBack,
                marketId: marketId ?? market.sid,
                // marketId: marketId ? `${market.sid}_${marketId}` : market.sid,
                eventId: getValueAfterDot(currentGame?.mid),
            });
        }
    };

    const isSuspended = (market) => getIsSuspended(market);

    const filterMarkets = (subtype, nat) => {
        if (nat) return data.find(m => m.subtype === subtype && m.nat === nat);
        return data.find(m => m.subtype === subtype);
    }

    const marketOdd = filterMarkets("odd");
    const marketEven = filterMarkets("even");
    const marketLow = filterMarkets("low");
    const marketHigh = filterMarkets("high");
    const marketBlack = filterMarkets("black");
    const marketRed = filterMarkets("red");

    const marketBacc1 = filterMarkets("bacc", "Baccarat 1");
    const marketBacc2 = filterMarkets("bacc", "Baccarat 2");

    const marketCard = filterMarkets("card");

    const CardsComponent = () => (
        <>
            {cardList.map((card, index) => (
                <div key={index}><span><img src={getImage(card, result_image)} alt={card} /></span></div>
            ))}
        </>
    );

    function BackLayBox({ market }) {
        if (isMobile) {
            return (
                <>
                    <div
                        className={`back casino-bl-box-item ${isSuspended(market) ? "suspended" : ""}`}
                        onClick={() => handleOddsClick(market?.nat, market?.b1, market, true, isSuspended(market))}
                    >
                        <span className="casino-box-odd">{market?.b1 || "-"}</span>
                    </div>
                    <div
                        className={`lay casino-bl-box-item ${isSuspended(market) ? "suspended" : ""}`}
                        onClick={() => handleOddsClick(market?.nat, market?.l1, market, false, isSuspended(market))}
                    >
                        <span className="casino-box-odd">{market?.l1 || "-"}</span>
                    </div>
                </>
            )
        }

        return (
            <div className="casino-bl-box">
                <div
                    className={`back casino-bl-box-item  ${isSuspended(market) ? "suspended" : ""}`}
                    onClick={() => handleOddsClick(market?.nat, market?.b1, market, true, isSuspended(market))}
                >
                    <span className="casino-box-odd">{market?.b1 || "-"}</span>
                </div>
                <div
                    className={`lay casino-bl-box-item ${isSuspended(market) ? "suspended" : ""}`}
                    onClick={() => handleOddsClick(market?.nat, market?.l1, market, false, isSuspended(market))}
                >
                    <span className="casino-box-odd">{market?.l1 || "-"}</span>
                </div>
            </div>
        )

    }

    return (
        <div className="casino-table note">
            <CasinoVideo
                gameName={game_name}
                roundId={currentGame?.mid}
                videoSrc={iframe_url}
                isCardDrawerOpen={isCardDrawerOpen}
                setIsCardDrawerOpen={setIsCardDrawerOpen}
                autotime={currentGame?.autotime}
                totalTime={currentGame?.ft} CardsComponent={CardsComponent}
                cards={cardList}
            />

            <div className="casino-detail">
                {!isMobile &&
                    <div className="container-fluid container-fluid-5">
                        <div className="row row5">
                            <div className="col-4 oe-cards">
                                <div className="casino-box-row">
                                    <div className="casino-nation-name"><b>{marketOdd?.nat || "Odd Card 1"}</b>
                                        <div className="d-flex">
                                            {['A', '3', '5', '7', '9'].map(c => (
                                                <div key={c} className="card-image ml-1"><img src={getImage(`single/${c}`, result_image, 'jpg')} /></div>
                                            ))}
                                        </div>
                                    </div>
                                    <BackLayBox market={marketOdd} />
                                    <div className={`casino-nation-name ${getExposure(marketOdd?.sid) === 0 ? 'd-none' : ''}`}>
                                        {renderExposure(marketOdd?.sid)}
                                    </div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="casino-box-row">
                                    <div className="casino-nation-name">
                                        <div className="casino-card-img"><span>
                                            <img src={getImage("spade", result_image)} /> <img src={getImage("club", result_image)} />
                                        </span></div>
                                    </div>
                                    <BackLayBox market={marketBlack} />
                                    <div className={`casino-nation-name ${getExposure(marketBlack?.sid) === 0 ? 'd-none' : ''}`}>
                                        {renderExposure(marketBlack?.sid)}
                                    </div>
                                </div>
                            </div>
                            <div className="col-4 oe-cards">
                                <div className="casino-box-row">
                                    <div className="casino-nation-name"><b>{marketLow?.nat || "Low Card 1"}</b>
                                        <div className="d-flex">
                                            {['A', '2', '3', '4', '5'].map(c => (
                                                <div key={c} className="card-image ml-1"><img src={getImage(`single/${c}`, result_image, 'jpg')} /></div>
                                            ))}
                                        </div>
                                    </div>
                                    <BackLayBox market={marketLow} />
                                    <div className={`casino-nation-name ${getExposure(marketLow?.sid) === 0 ? 'd-none' : ''}`}>
                                        {renderExposure(marketLow?.sid)}
                                    </div>
                                </div>
                            </div>
                            <div className="col-4 oe-cards">
                                <div className="casino-box-row">
                                    <div className="casino-nation-name"><b>{marketEven?.nat || "Even Card 1"}</b>
                                        <div className="d-flex">
                                            {['2', '4', '6', '8', '10'].map(c => (
                                                <div key={c} className="card-image ml-1"><img src={getImage(`single/${c}`, result_image, 'jpg')} /></div>
                                            ))}
                                        </div>
                                    </div>
                                    <BackLayBox market={marketEven} />
                                    <div className={`casino-nation-name ${getExposure(marketEven?.sid) === 0 ? 'd-none' : ''}`}>
                                        {renderExposure(marketEven?.sid)}
                                    </div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="casino-box-row">
                                    <div className="casino-nation-name">
                                        <div className="casino-card-img"><span>
                                            <img src={getImage("heart", result_image)} /> <img src={getImage("diamond", result_image)} />
                                        </span></div>
                                    </div>
                                    <BackLayBox market={marketRed} />
                                    <div className={`casino-nation-name ${getExposure(marketRed?.sid) === 0 ? 'd-none' : ''}`}>
                                        {renderExposure(marketRed?.sid)}
                                    </div>
                                </div>
                            </div>
                            <div className="col-4 oe-cards">
                                <div className="casino-box-row">
                                    <div className="casino-nation-name"><b>{marketHigh?.nat || "High Card 1"}</b>
                                        <div className="d-flex">
                                            {['6', '7', '8', '9', '10'].map(c => (
                                                <div key={c} className="card-image ml-1"><img src={getImage(`single/${c}`, result_image, 'jpg')} /></div>
                                            ))}
                                        </div>
                                    </div>
                                    <BackLayBox market={marketHigh} />
                                    <div className={`casino-nation-name ${getExposure(marketHigh?.sid) === 0 ? 'd-none' : ''}`}>
                                        {renderExposure(marketHigh?.sid)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>}

                {/* MOBILE */}
                {isMobile &&
                    <div className="container-fluid container-fluid-5">
                        <div className="row row5">
                            <div className="casino-bl-box oe-cards">
                                <div className="casino-bl-box-item casino-odds-name"><b>{marketOdd?.nat || "Odd Card 1"}</b>
                                    <div className="d-flex">
                                        {['A', '3', '5', '7', '9'].map(c => (
                                            <div key={c} className="card-image ml-1">
                                                <img src={getImage(`single/${c}`, result_image, 'jpg')} />
                                            </div>
                                        ))}
                                    </div>
                                    <span className={`text-left w-100 ${getExposure(marketOdd?.sid) === 0 ? 'd-none' : ''}`}>
                                        {renderExposure(marketOdd?.sid)}
                                    </span>
                                </div>
                                <BackLayBox market={marketOdd} />
                            </div>
                            <div className="casino-bl-box oe-cards">
                                <div className="casino-bl-box-item casino-odds-name"><b>{marketEven?.nat || "Even Card 1"}</b>
                                    <div className="d-flex">
                                        {['2', '4', '6', '8', '10'].map(c => (
                                            <div key={c} className="card-image ml-1"><img src={getImage(`single/${c}`, result_image, 'jpg')} /></div>
                                        ))}
                                    </div>
                                    <span className={`text-left w-100 ${getExposure(marketEven?.sid) === 0 ? 'd-none' : ''}`}>
                                        {renderExposure(marketEven?.sid)}
                                    </span>
                                </div>
                                <BackLayBox market={marketEven} />
                            </div>
                            <div className="casino-bl-box">
                                <div className="casino-bl-box-item casino-odds-name">
                                    <div className="casino-card-img"><span>
                                        <img src={getImage("spade", result_image)} /> <img src={getImage("club", result_image)} />
                                    </span></div>
                                    <span className={`text-left w-100 ${getExposure(marketBlack?.sid) === 0 ? 'd-none' : ''}`}>
                                        {renderExposure(marketBlack?.sid)}
                                    </span>
                                </div>
                                <BackLayBox market={marketBlack} />
                            </div>
                            <div className="casino-bl-box">
                                <div className="casino-bl-box-item casino-odds-name">
                                    <div className="casino-card-img"><span>
                                        <img src={getImage("heart", result_image)} /> <img src={getImage("diamond", result_image)} />
                                    </span></div>
                                    <span className={`text-left w-100 ${getExposure(marketRed?.sid) === 0 ? 'd-none' : ''}`}>
                                        {renderExposure(marketRed?.sid)}
                                    </span>
                                </div>
                                <BackLayBox market={marketRed} />
                            </div>

                            <div className="casino-bl-box oe-cards">
                                <div className="casino-bl-box-item casino-odds-name"><b>{marketLow?.nat || "Low Card 1"}</b>
                                    <div className="d-flex">
                                        {['A', '2', '3', '4', '5'].map(c => (
                                            <div key={c} className="card-image ml-1"><img src={getImage(`single/${c}`, result_image, 'jpg')} /></div>
                                        ))}
                                    </div>
                                    <span className={`text-left w-100 ${getExposure(marketLow?.sid) === 0 ? 'd-none' : ''}`}>
                                        {renderExposure(marketLow?.sid)}
                                    </span>
                                </div>
                                <BackLayBox market={marketLow} />
                            </div>

                            <div className="casino-bl-box oe-cards">
                                <div className="casino-bl-box-item casino-odds-name"><b>{marketHigh?.nat || "High Card 1"}</b>
                                    <div className="d-flex">
                                        {['6', '7', '8', '9', '10'].map(c => (
                                            <div key={c} className="card-image ml-1"><img src={getImage(`single/${c}`, result_image, 'jpg')} /></div>
                                        ))}
                                    </div>
                                    <span className={`text-left w-100 ${getExposure(marketHigh?.sid) === 0 ? 'd-none' : ''}`}>
                                        {renderExposure(marketHigh?.sid)}
                                    </span>
                                </div>
                                <BackLayBox market={marketHigh} />
                            </div>
                        </div>
                    </div>}

                <div className="container-fluid container-fluid-5">
                    <div className="row row5">
                        <div className="col-md-4 col-12 note-baccarat">
                            <div className="casino-box-row">
                                <div className="casino-nation-name"><b>{marketBacc1?.nat || "Baccarat 1"}</b> <span className="text-yellow">(1st, 2nd, 3rd card)</span></div>
                                <div className="casino-bl-box">
                                    <div
                                        className={`back casino-bl-box-item
                                             ${isSuspended(marketBacc1) ? "suspended" : ""} 
                                             ${getExposure(marketBacc1?.sid) != 0 ? "lock-top" : ""}
                                             `}
                                        onClick={() => handleOddsClick(marketBacc1?.nat, marketBacc1?.b1, marketBacc1, true, isSuspended(marketBacc1))}
                                    >
                                        <span className="casino-box-odd">{marketBacc1?.b1 || "-"}</span>
                                        {renderExposure(marketBacc1?.sid)}
                                    </div>
                                </div>
                            </div>
                            <div className="casino-box-row">
                                <div className="casino-nation-name"><b>{marketBacc2?.nat || "Baccarat 2"}</b> <span className="text-yellow">(4th, 5th, 6th card)</span></div>
                                <div className="casino-bl-box">
                                    <div
                                        className={`back casino-bl-box-item 
                                             ${isSuspended(marketBacc2) ? "suspended" : ""}
                                             ${getExposure(marketBacc2?.sid) != 0 ? "lock-top" : ""}
                                             `}
                                        onClick={() => handleOddsClick(marketBacc2?.nat, marketBacc2?.b1, marketBacc2, true, isSuspended(marketBacc2))}
                                    >
                                        <span className="casino-box-odd">{marketBacc2?.b1 || "-"}</span>
                                        {renderExposure(marketBacc2?.sid)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-8 col-12 note-cards">
                            <div className="casino-cards text-center mt-1">
                                {(marketCard?.odds || []).map((o, idx) => {
                                    const marketId = `${marketCard.sid}_${idx + 1}`;
                                    return (
                                        <div
                                            key={idx}
                                            className="casino-card-item"
                                            onClick={() => handleOddsClick(o.nat, o.b, marketCard, true, isSuspended(marketCard), marketId, `${marketCard.nat} - ${o.nat}`)}
                                        >
                                            <div className="casino-book">{o.b}</div>
                                            <div className={`card-image ${isSuspended(marketCard) ? "suspended" : ""}`}>
                                                <img src={getImage(o.nat.split(' ')[1], 'cards')} />
                                            </div>
                                            <div className={`casino-book-exposure ${getExposure(marketId) === 0 ? 'd-none' : ''}`}>
                                                {renderExposure(marketId)}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default NoteNum;
