import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketByNation, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import useIsMobile from "../../../hooks/useIsMobile";
import BetLimitInfo2 from "./components/BetLimitInfo2";

const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10']

const Notenum = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url, result_image } = useGetFileData();
    const isMobile = useIsMobile(767);

    const currentGame = gameData?.t1?.[0];
    const data = gameData?.t2 || [];

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

    const cardList = [
        currentGame?.C1,
        currentGame?.C2,
        currentGame?.C3,
        currentGame?.C4,
        currentGame?.C5,
        currentGame?.C6
    ].filter(Boolean);

    const CardsComponent = () => (
        <>
            {cardList.map((card, index) => (
                <div key={index}>
                    <span data-v-b64efdfa="">
                        <img data-v-b64efdfa="" src={getImage(card, result_image)} alt={card} />
                    </span>
                </div>
            ))}
        </>
    );

    const SuspendedOverlay = ({ market }) => {
        if (!getIsSuspended(market)) return null;
        return <div className="suspended-overlay">Suspended</div>;
    };

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table note">
                                <CasinoVideo
                                    gameName={game_name}
                                    roundId={currentGame?.mid}
                                    videoSrc={iframe_url}
                                    timeLeft={currentGame?.autotime || 0}
                                    totalTime={currentGame?.ft || 30}
                                    CardsComponent={CardsComponent}
                                    results={lastResults}
                                />

                                <div className="casino-detail">
                                    {!isMobile ? (
                                        /* DESKTOP VIEW */
                                        <div className="container-fluid container-fluid-5">
                                            <div className="row row5 d-none-small">
                                                {/* Row 1: Odd Card 1, Spade/Club, Low Card 1 */}
                                                <div className="col-4 oe-cards">
                                                    <div className="casino-box-row">
                                                        <div className="casino-nation-name">
                                                            <b>{marketOdd?.nat || "Odd Card 1"}</b>
                                                            <div className="d-flex">
                                                                {['A', '3', '5', '7', '9'].map(c => (
                                                                    <div key={c} className="card-image ml-1">
                                                                        <img src={getImage(`single/${c}`, result_image, 'jpg')} alt={c} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="casino-bl-box">
                                                            <div className={`back casino-bl-box-item ${getIsSuspended(marketOdd) ? "suspended" : ""}`}>
                                                                <span className="casino-box-odd">{marketOdd?.b1 || "-"}</span>
                                                            </div>
                                                            <div className={`lay casino-bl-box-item ${getIsSuspended(marketOdd) ? "suspended" : ""}`}>
                                                                <span className="casino-box-odd">{marketOdd?.l1 || "-"}</span>
                                                            </div>
                                                        </div>
                                                        <div className="casino-nation-name book-black">
                                                            <Exposure data={exposureData} id={marketOdd?.sid} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="casino-box-row">
                                                        <div className="casino-nation-name">
                                                            <div className="casino-card-img">
                                                                <span>
                                                                    <img src={getImage("spade", result_image)} alt="spade" />
                                                                    <img src={getImage("club", result_image)} alt="club" />
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="casino-bl-box">
                                                            <div className={`back casino-bl-box-item ${getIsSuspended(marketBlack) ? "suspended" : ""}`}>
                                                                <span className="casino-box-odd">{marketBlack?.b1 || "-"}</span>
                                                            </div>
                                                            <div className={`lay casino-bl-box-item ${getIsSuspended(marketBlack) ? "suspended" : ""}`}>
                                                                <span className="casino-box-odd">{marketBlack?.l1 || "-"}</span>
                                                            </div>
                                                        </div>
                                                        <div className="casino-nation-name book-black">
                                                            <Exposure data={exposureData} id={marketBlack?.sid} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-4 oe-cards">
                                                    <div className="casino-box-row">
                                                        <div className="casino-nation-name">
                                                            <b>{marketLow?.nat || "Low Card 1"}</b>
                                                            <div className="d-flex">
                                                                {['A', '2', '3', '4', '5'].map(c => (
                                                                    <div key={c} className="card-image ml-1">
                                                                        <img src={getImage(`single/${c}`, result_image, 'jpg')} alt={c} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="casino-bl-box">
                                                            <div className={`back casino-bl-box-item ${getIsSuspended(marketLow) ? "suspended" : ""}`}>
                                                                <span className="casino-box-odd">{marketLow?.b1 || "-"}</span>
                                                            </div>
                                                            <div className={`lay casino-bl-box-item ${getIsSuspended(marketLow) ? "suspended" : ""}`}>
                                                                <span className="casino-box-odd">{marketLow?.l1 || "-"}</span>
                                                            </div>
                                                        </div>
                                                        <div className="casino-nation-name book-black">
                                                            <Exposure data={exposureData} id={marketLow?.sid} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Row 2: Even Card 1, Heart/Diamond, High Card 1 */}
                                                <div className="col-4 oe-cards">
                                                    <div className="casino-box-row">
                                                        <div className="casino-nation-name">
                                                            <b>{marketEven?.nat || "Even Card 1"}</b>
                                                            <div className="d-flex">
                                                                {['2', '4', '6', '8', '10'].map(c => (
                                                                    <div key={c} className="card-image ml-1">
                                                                        <img src={getImage(`single/${c}`, result_image, 'jpg')} alt={c} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="casino-bl-box">
                                                            <div className={`back casino-bl-box-item ${getIsSuspended(marketEven) ? "suspended" : ""}`}>
                                                                <span className="casino-box-odd">{marketEven?.b1 || "-"}</span>
                                                            </div>
                                                            <div className={`lay casino-bl-box-item ${getIsSuspended(marketEven) ? "suspended" : ""}`}>
                                                                <span className="casino-box-odd">{marketEven?.l1 || "-"}</span>
                                                            </div>
                                                        </div>
                                                        <div className="casino-nation-name book-black">
                                                            <Exposure data={exposureData} id={marketEven?.sid} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="casino-box-row">
                                                        <div className="casino-nation-name">
                                                            <div className="casino-card-img">
                                                                <span>
                                                                    <img src={getImage("heart", result_image)} alt="heart" />
                                                                    <img src={getImage("diamond", result_image)} alt="diamond" />
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="casino-bl-box">
                                                            <div className={`back casino-bl-box-item ${getIsSuspended(marketRed) ? "suspended" : ""}`}>
                                                                <span className="casino-box-odd">{marketRed?.b1 || "-"}</span>
                                                            </div>
                                                            <div className={`lay casino-bl-box-item ${getIsSuspended(marketRed) ? "suspended" : ""}`}>
                                                                <span className="casino-box-odd">{marketRed?.l1 || "-"}</span>
                                                            </div>
                                                        </div>
                                                        <div className="casino-nation-name book-black">
                                                            <Exposure data={exposureData} id={marketRed?.sid} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-4 oe-cards">
                                                    <div className="casino-box-row">
                                                        <div className="casino-nation-name">
                                                            <b>{marketHigh?.nat || "High Card 1"}</b>
                                                            <div className="d-flex">
                                                                {['6', '7', '8', '9', '10'].map(c => (
                                                                    <div key={c} className="card-image ml-1">
                                                                        <img src={getImage(`single/${c}`, result_image, 'jpg')} alt={c} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="casino-bl-box">
                                                            <div className={`back casino-bl-box-item ${getIsSuspended(marketHigh) ? "suspended" : ""}`}>
                                                                <span className="casino-box-odd">{marketHigh?.b1 || "-"}</span>
                                                            </div>
                                                            <div className={`lay casino-bl-box-item ${getIsSuspended(marketHigh) ? "suspended" : ""}`}>
                                                                <span className="casino-box-odd">{marketHigh?.l1 || "-"}</span>
                                                            </div>
                                                        </div>
                                                        <div className="casino-nation-name book-black">
                                                            <Exposure data={exposureData} id={marketHigh?.sid} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* MOBILE VIEW */
                                        <div className="container-fluid container-fluid-5">
                                            <div className="row row5 d-none-big">
                                                <div className="casino-bl-box oe-cards">
                                                    <div className="casino-bl-box-item casino-odds-name">
                                                        <b>{marketOdd?.nat || "Odd Card 1"}</b>
                                                        <div className="d-flex">
                                                            {['A', '3', '5', '7', '9'].map(c => (
                                                                <div key={c} className="card-image ml-1">
                                                                    <img src={getImage(`single/${c}`, result_image, 'jpg')} alt={c} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <span className="text-left w-100 book-black">
                                                            <Exposure data={exposureData} id={marketOdd?.sid} />
                                                        </span>
                                                    </div>
                                                    <div className={`back casino-bl-box-item ${getIsSuspended(marketOdd) ? "suspended" : ""}`}>
                                                        <span className="casino-box-odd">{marketOdd?.b1 || "-"}</span>
                                                    </div>
                                                    <div className={`lay casino-bl-box-item ${getIsSuspended(marketOdd) ? "suspended" : ""}`}>
                                                        <span className="casino-box-odd">{marketOdd?.l1 || "-"}</span>
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box oe-cards">
                                                    <div className="casino-bl-box-item casino-odds-name">
                                                        <b>{marketEven?.nat || "Even Card 1"}</b>
                                                        <div className="d-flex">
                                                            {['2', '4', '6', '8', '10'].map(c => (
                                                                <div key={c} className="card-image ml-1">
                                                                    <img src={getImage(`single/${c}`, result_image, 'jpg')} alt={c} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <span className="text-left w-100 book-black">
                                                            <Exposure data={exposureData} id={marketEven?.sid} />
                                                        </span>
                                                    </div>
                                                    <div className={`back casino-bl-box-item ${getIsSuspended(marketEven) ? "suspended" : ""}`}>
                                                        <span className="casino-box-odd">{marketEven?.b1 || "-"}</span>
                                                    </div>
                                                    <div className={`lay casino-bl-box-item ${getIsSuspended(marketEven) ? "suspended" : ""}`}>
                                                        <span className="casino-box-odd">{marketEven?.l1 || "-"}</span>
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <div className="casino-bl-box-item casino-odds-name">
                                                        <div className="casino-card-img">
                                                            <span>
                                                                <img src={getImage("spade", result_image)} alt="spade" />
                                                                <img src={getImage("club", result_image)} alt="club" />
                                                            </span>
                                                        </div>
                                                        <span className="text-left w-100 book-black">
                                                            <Exposure data={exposureData} id={marketBlack?.sid} />
                                                        </span>
                                                    </div>
                                                    <div className={`back casino-bl-box-item ${getIsSuspended(marketBlack) ? "suspended" : ""}`}>
                                                        <span className="casino-box-odd">{marketBlack?.b1 || "-"}</span>
                                                    </div>
                                                    <div className={`lay casino-bl-box-item ${getIsSuspended(marketBlack) ? "suspended" : ""}`}>
                                                        <span className="casino-box-odd">{marketBlack?.l1 || "-"}</span>
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <div className="casino-bl-box-item casino-odds-name">
                                                        <div className="casino-card-img">
                                                            <span>
                                                                <img src={getImage("heart", result_image)} alt="heart" />
                                                                <img src={getImage("diamond", result_image)} alt="diamond" />
                                                            </span>
                                                        </div>
                                                        <span className="text-left w-100 book-black">
                                                            <Exposure data={exposureData} id={marketRed?.sid} />
                                                        </span>
                                                    </div>
                                                    <div className={`back casino-bl-box-item ${getIsSuspended(marketRed) ? "suspended" : ""}`}>
                                                        <span className="casino-box-odd">{marketRed?.b1 || "-"}</span>
                                                    </div>
                                                    <div className={`lay casino-bl-box-item ${getIsSuspended(marketRed) ? "suspended" : ""}`}>
                                                        <span className="casino-box-odd">{marketRed?.l1 || "-"}</span>
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box oe-cards">
                                                    <div className="casino-bl-box-item casino-odds-name">
                                                        <b>{marketLow?.nat || "Low Card 1"}</b>
                                                        <div className="d-flex">
                                                            {['A', '2', '3', '4', '5'].map(c => (
                                                                <div key={c} className="card-image ml-1">
                                                                    <img src={getImage(`single/${c}`, result_image, 'jpg')} alt={c} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <span className="text-left w-100 book-black">
                                                            <Exposure data={exposureData} id={marketLow?.sid} />
                                                        </span>
                                                    </div>
                                                    <div className={`back casino-bl-box-item ${getIsSuspended(marketLow) ? "suspended" : ""}`}>
                                                        <span className="casino-box-odd">{marketLow?.b1 || "-"}</span>
                                                    </div>
                                                    <div className={`lay casino-bl-box-item ${getIsSuspended(marketLow) ? "suspended" : ""}`}>
                                                        <span className="casino-box-odd">{marketLow?.l1 || "-"}</span>
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box oe-cards">
                                                    <div className="casino-bl-box-item casino-odds-name">
                                                        <b>{marketHigh?.nat || "High Card 1"}</b>
                                                        <div className="d-flex">
                                                            {['6', '7', '8', '9', '10'].map(c => (
                                                                <div key={c} className="card-image ml-1">
                                                                    <img src={getImage(`single/${c}`, result_image, 'jpg')} alt={c} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <span className="text-left w-100 book-black">
                                                            <Exposure data={exposureData} id={marketHigh?.sid} />
                                                        </span>
                                                    </div>
                                                    <div className={`back casino-bl-box-item ${getIsSuspended(marketHigh) ? "suspended" : ""}`}>
                                                        <span className="casino-box-odd">{marketHigh?.b1 || "-"}</span>
                                                    </div>
                                                    <div className={`lay casino-bl-box-item ${getIsSuspended(marketHigh) ? "suspended" : ""}`}>
                                                        <span className="casino-box-odd">{marketHigh?.l1 || "-"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Baccarat and Cards section (shared by desktop/mobile) */}
                                    <div className="container-fluid container-fluid-5">
                                        <div className="row row5">
                                            <div className="col-md-4 col-12 note-baccarat">
                                                <div className="casino-box-row">
                                                    <div className="casino-nation-name">
                                                        <b>{marketBacc1?.nat || "Baccarat 1"}</b>{" "}
                                                        <span className="text-yellow">(1st, 2nd, 3rd card)</span>
                                                    </div>
                                                    <div className="casino-bl-box">
                                                        <div className={`back casino-bl-box-item ${getIsSuspended(marketBacc1) ? "suspended" : ""}`}>
                                                            <span className="casino-box-odd">{marketBacc1?.b1 || "-"}</span>{" "}
                                                            <span className="book-black">
                                                                <Exposure data={exposureData} id={marketBacc1?.sid} />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="casino-box-row">
                                                    <div className="casino-nation-name">
                                                        <b>{marketBacc2?.nat || "Baccarat 2"}</b>{" "}
                                                        <span className="text-yellow">(4th, 5th, 6th card)</span>
                                                    </div>
                                                    <div className="casino-bl-box">
                                                        <div className={`back casino-bl-box-item ${getIsSuspended(marketBacc2) ? "suspended" : ""}`}>
                                                            <span className="casino-box-odd">{marketBacc2?.b1 || "-"}</span>{" "}
                                                            <span className="book-black">
                                                                <Exposure data={exposureData} id={marketBacc2?.sid} />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-8 col-12 note-cards">
                                                <div className="casino-cards text-center mt-1">
                                                    {(marketCard?.odds || []).map((o, idx) => {
                                                        const marketId = `${marketCard.sid}_${idx + 1}`;
                                                        return (
                                                            <div key={idx} className="casino-card-item">
                                                                <div className="casino-book">{o.b}</div>
                                                                <div className={`card-image ${getIsSuspended(marketCard) ? "suspended" : ""}`}>
                                                                    <img src={getImage(o.nat.split(' ')[1], 'cards')} alt={o.nat} />
                                                                </div>
                                                                <div className="book-black">
                                                                    <Exposure data={exposureData} id={marketId} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <CasinoRightSidebar />
                </div>
            </div>
        </div>
    );
};

export default Notenum;