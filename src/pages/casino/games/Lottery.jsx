import React, { useState, memo } from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getIsSuspended, getCardImage, getImage } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import RemarkMarquee from "./components/RemarkMarquee";
import { Exposure } from "../CasinoCenter";

const imgPath = "/cards/lottery/";

const getBallImg = (card) => {
    const ball = card === "A" ? "1" : card === "10" ? "0" : card;
    return `ball${ball}`;
};

const Tab = ({ activeTab, title, min, max, tab, setActiveTab }) => (
    <li className="nav-item">
        <a
            href={`#${tab}`}
            className={`nav-link ${activeTab === tab ? "active" : ""}`}
            onClick={(e) => {
                e.preventDefault();
                setActiveTab(tab);
            }}
        >
            {title}
            <div className="casino-min-max w-100">
                R:<span>{min}</span>-<span>{max}</span>
            </div>
        </a>
    </li>
);

const LotteryBox = memo(({ market }) => {
    const isSuspended = getIsSuspended(market);
    const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

    return (
        <div className={`lottery-box ${isSuspended ? "suspended" : ""}`}>
            {cards.map((c) => (
                <div key={c} className="lottery-card">
                    <img src={getCardImage(c, imgPath)} alt={c} />
                </div>
            ))}
        </div>
    );
});

const SelectedCard = memo(({ selectedCard }) => (
    <div>
        {selectedCard?.map((card, index) => (
            <span key={index}>
                <img src={getImage(getBallImg(card), imgPath)} alt={card} />
            </span>
        ))}
    </div>
));

const RandomBets = memo(({ market, selectedCard, isRandomBets = true }) => {
    const isSuspended = getIsSuspended(market);
    const bets = [5, 10, 15, 20, 25, 50, 75];

    return (
        <div className="lottery-place-balls">
            <SelectedCard selectedCard={selectedCard} />
            {isRandomBets && (
                <div className={`random-bets ${isSuspended ? "suspended" : ""}`}>
                    <h4 className="w-100 text-center">Random Bets</h4>
                    {bets.map((n) => (
                        <button key={n} className="lottery-btn active">
                            {n}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
});

const BetBtns = ({ betBtn }) => {
    const betRate = [25, 50, 100, 200, 500, 1000];
    return (
        <div className="lottery-left">
            <div className="lottery-bet-buttons">
                {betRate.map((rate) => (
                    <div
                        key={rate}
                        style={{ backgroundImage: "url(/assets/images/coin.png)" }}
                        className={betBtn === rate ? "active" : ""}
                    >
                        <span>{rate}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ActionBtns = () => (
    <div className="lottery-buttons d-none-big w-100 mb-3">
        <div className="lottery-buttons-top">
            <button className="lottery-btn active">Repeat</button>
            <button className="lottery-btn active">Clear</button>
            <button className="lottery-btn active">Remove</button>
        </div>
    </div>
);

const LotteryTabs = memo(({ single, double, triple, activeTab, setActiveTab }) => (
    <div className="lottery-right">
        <div className="casino-tabs">
            <ul className="nav nav-tabs">
                <Tab title="Single(0)" min="10" max="20K" tab="single" activeTab={activeTab} setActiveTab={setActiveTab} />
                <Tab title="Double(0)" min="10" max="5K" tab="double" activeTab={activeTab} setActiveTab={setActiveTab} />
                <Tab title="Triple(0)" min="10" max="3K" tab="triple" activeTab={activeTab} setActiveTab={setActiveTab} />
            </ul>
        </div>

        <div className="tab-content" style={{ position: "relative" }}>
            <div id="single" className={`tab-pane ${activeTab === "single" ? "active" : ""}`}>
                <div className="single">
                    <LotteryBox market={single} />
                    <RandomBets market={single} isRandomBets={false} />
                </div>
            </div>

            <div id="double" className={`tab-pane fade ${activeTab === "double" ? "active show" : ""}`}>
                <div className="double">
                    <LotteryBox market={double} />
                    <RandomBets market={double} />
                </div>
            </div>

            <div id="triple" className={`tab-pane fade ${activeTab === "triple" ? "active show" : ""}`}>
                <div className="tripple">
                    <LotteryBox market={triple} />
                    <RandomBets market={triple} />
                </div>
            </div>
        </div>
    </div>
));

const Lottery = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url } = useGetFileData();
    const [activeTab, setActiveTab] = useState("single");

    const currentGame = gameData?.t1?.[0];
    const data = gameData?.t2 || [];

    const getDDD_cards = (card) => (card?.length > 2 ? `${card.slice(0, -2)}DD` : card);

    const currentCards = [
        getDDD_cards(currentGame?.C1),
        getDDD_cards(currentGame?.C2),
        getDDD_cards(currentGame?.C3),
    ].filter(Boolean);

    const single = data.find((item) => item.nat === "Single");
    const double = data.find((item) => item.nat === "Double");
    const triple = data.find((item) => item.nat === "Triple");

    const Cards = () => (
        <div className="casino-video-cards">
            <div className="casino-cards-shuffle">
                <i className="fas fa-grip-lines-vertical"></i>
            </div>
            <div className="casino-video-cards-container">
                <div>
                    {currentCards.map((card, idx) => (
                        <span key={idx} data-v-b64efdfa="">
                            <img
                                data-v-b64efdfa=""
                                src={getCardImage(card, imgPath + "cards")}
                                alt={`card-${idx}`}
                            />
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table lottery">
                                <CasinoVideo
                                    gameName={game_name}
                                    roundId={currentGame?.mid}
                                    videoSrc={iframe_url}
                                    WholeCardDrawer={Cards}
                                    timeLeft={currentGame?.autotime || 0}
                                    totalTime={currentGame?.ft || 30}
                                    showLastResults={false}
                                />

                                <div className="casino-remark mt-1">
                                    <RemarkMarquee remark={currentGame?.remark} />
                                </div>

                                <div className="mb-3">
                                    <div className="casino-video-last-results">
                                        {lastResults?.slice(0, 10).map((result, index) => (
                                            <span key={index} className="resultb">
                                                {result.win}
                                            </span>
                                        ))}
                                        <a href="/admin/reports/casinoresult/lottcard" className="result-more">
                                            ...
                                        </a>
                                    </div>
                                </div>

                                {/* <div className="casino-details">
                                    <BetBtns betBtn={25} />
                                    <LotteryTabs
                                        single={single}
                                        double={double}
                                        triple={triple}
                                        activeTab={activeTab}
                                        setActiveTab={setActiveTab}
                                    />
                                    <ActionBtns />
                                </div> */}
                            </div>
                        </div>
                    </div>
                    <CasinoRightSidebar />
                </div>
            </div>
        </div>
    );
};

export default Lottery;