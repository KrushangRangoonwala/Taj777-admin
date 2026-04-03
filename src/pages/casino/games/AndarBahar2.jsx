import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketByNation, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import BetLimitInfo from "./components/BetLimitInfo2";
import Rules, { RulesHeader } from "./rules/Rules";
import RemarkMarquee from "./components/RemarkMarquee";

const AndarBahar2 = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url, result_image } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const getMarketByName = (marketName) => getMarketByNation(marketData, marketName, "nat");
    const getMarketBySid = (sid) => marketData.find((m) => m.sid == sid);

    // Runners mapping based on AndarBahar2.js
    const saRunner = getMarketBySid("1");
    const saFirstBet = getMarketBySid("2");
    const saSecondBet = getMarketBySid("3");
    const sbRunner = getMarketBySid("4");
    const sbFirstBet = getMarketBySid("5");
    const sbSecondBet = getMarketBySid("6");

    const oddRunner = getMarketByName("Joker Odd");
    const evenRunner = getMarketByName("Joker Even");
    const spadeRunner = getMarketByName("Joker Spade");
    const heartRunner = getMarketByName("Joker Heart");
    const clubRunner = getMarketByName("Joker Club");
    const diamondRunner = getMarketByName("Joker Diamond");

    const cardRunners = [
        "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"
    ].map(card => ({
        card,
        market: getMarketByName(`Joker ${card}`)
    }));

    // Card Parsing Logic from AndarBahar2.js
    const rawCards = currentGame?.Cards || "";
    const allCardsList = rawCards.split(",").filter((c) => c && c !== "1");
    const jokerCard = allCardsList[0];
    const andarCards = allCardsList.slice(1).filter((_, i) => i % 2 !== 0);
    const baharCards = allCardsList.slice(1).filter((_, i) => i % 2 === 0);

    const BetBox = ({ market, className = "", children }) => {
        const suspended = getIsSuspended(market);
        return (
            <div className={`${className} ${suspended ? "suspended" : ""}`}>
                {children}
            </div>
        );
    };

    const VideoCards = () => (
        <div className="casino-video-cards d-none-small">
            <div className="casino-cards-shuffle"><i className="fas fa-grip-lines-vertical"></i></div>
            <div className="casino-video-cards-container">
                <div className="row row5 align-items-center">
                    <div className="col-1">
                        <div className="row row5">
                            <div className="col-12 mb-3"><b>A</b></div>
                        </div>
                        <div className="row row5">
                            <div className="col-12"><b>B</b></div>
                        </div>
                    </div>
                    <div className="col-2">
                        <span>
                            <img src={getImage(jokerCard, result_image)} className="card-right" alt="Joker" />
                        </span>
                    </div>
                    <div className="col-9">
                        <div className="card-inner mb-1">
                            <div className="row row5">
                                <div className="col-3">
                                    <span>
                                        <img src={getImage(andarCards[0] || 1, result_image)} alt="Andar First" />
                                    </span>
                                </div>
                                <div className="col-9">
                                    <div id="andarSlider" className="ab-slider owl-carousel owl-theme owl-rtl owl-loaded owl-drag">
                                        <div className="owl-stage-outer">
                                            <div className="owl-stage" style={{ transform: "translate3d(0px, 0px, 0px)", transition: "all", width: "auto", display: "flex" }}>
                                                {andarCards.slice(1).map((card, index) => (
                                                    <div key={index} className="owl-item active" style={{ width: "23.246px", marginLeft: "10px" }}>
                                                        <div className="item">
                                                            <span><img src={getImage(card, result_image)} alt={`Andar ${index}`} /></span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card-inner">
                            <div className="row row5">
                                <div className="col-3">
                                    <span>
                                        <img src={getImage(baharCards[0] || 1, result_image)} alt="Bahar First" />
                                    </span>
                                </div>
                                <div className="col-9">
                                    <div id="baharSlider" className="ab-slider owl-carousel owl-theme owl-rtl owl-loaded owl-drag">
                                        <div className="owl-stage-outer">
                                            <div className="owl-stage" style={{ transform: "translate3d(0px, 0px, 0px)", transition: "all", width: "auto", display: "flex" }}>
                                                {baharCards.slice(1).map((card, index) => (
                                                    <div key={index} className="owl-item active" style={{ width: "23.246px", marginLeft: "10px" }}>
                                                        <div className="item">
                                                            <span><img src={getImage(card, result_image)} alt={`Bahar ${index}`} /></span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const RulesComponent = () => (
        <>
            <RulesHeader />
            <div className="card-body" style={{ padding: "10px" }}>
                <Rules title="Rules" rules={[]} />
            </div>
        </>
    );

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table andar-bahar2">
                            <CasinoVideo
                                gameName={game_name}
                                roundId={currentGame?.mid}
                                videoSrc={iframe_url}
                                results={lastResults}
                                timeLeft={currentGame?.autotime || 0}
                                totalTime={currentGame?.ft || 30}
                                CardsComponent={VideoCards}
                            />

                            <div className="casino-detail">
                                <div className="teen20casino-container">
                                    <div className="teen20left">
                                        <div className="ab2-title">A</div>
                                        <BetBox market={saRunner} className="sa-sb-box">
                                            <div>SA</div>
                                            <div>{saRunner?.b1 || 0}</div>
                                            <Exposure className="ab-book" data={exposureData} id={saRunner?.sid} />
                                        </BetBox>
                                        <BetBox market={saFirstBet} className="ab2-bet">
                                            <div>1st Bet</div>
                                            <div>{saFirstBet?.b1 || 0}</div>
                                            <Exposure className="ab-book" data={exposureData} id={saFirstBet?.sid} />
                                        </BetBox>
                                        <BetBox market={saSecondBet} className="ab2-bet">
                                            <div>2nd Bet</div>
                                            <div>{saSecondBet?.b1 || 0}</div>
                                            <Exposure className="ab-book" data={exposureData} id={saSecondBet?.sid} />
                                        </BetBox>
                                        <div className="ab2-title">A</div>
                                    </div>
                                    <div className="teen20center"></div>
                                    <div className="teen20right">
                                        <div className="ab2-title">B</div>
                                        <BetBox market={sbRunner} className="sa-sb-box">
                                            <div>SB</div>
                                            <div>{sbRunner?.b1 || 0}</div>
                                            <Exposure className="ab-book" data={exposureData} id={sbRunner?.sid} />
                                        </BetBox>
                                        <BetBox market={sbFirstBet} className="ab2-bet">
                                            <div>1st Bet</div>
                                            <div>{sbFirstBet?.b1 || 0}</div>
                                            <Exposure className="ab-book" data={exposureData} id={sbFirstBet?.sid} />
                                        </BetBox>
                                        <BetBox market={sbSecondBet} className="ab2-bet">
                                            <div>2nd Bet</div>
                                            <div>{sbSecondBet?.b1 || 0}</div>
                                            <Exposure className="ab-book" data={exposureData} id={sbSecondBet?.sid} />
                                        </BetBox>
                                        <div className="ab2-title">B</div>
                                    </div>
                                </div>

                                <div className="teen20casino-container">
                                    <div className="teen20left ab2oddeven">
                                        <div className="casino-box-row">
                                            <div className="casino-bl-box">
                                                <div className="casino-bl-box-item"><b>Odd</b></div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <div className="casino-bl-box-item"><b>Even</b></div>
                                            </div>
                                        </div>
                                        <div className="casino-box-row">
                                            <div className="casino-bl-box">
                                                <BetBox market={oddRunner} className="back casino-bl-box-item">
                                                    <span className="casino-box-odd">{oddRunner?.b1 || 0}</span>
                                                </BetBox>
                                                <div className="casino-book">
                                                    <Exposure data={exposureData} id={oddRunner?.sid} />
                                                </div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <BetBox market={evenRunner} className="back casino-bl-box-item">
                                                    <span className="casino-box-odd">{evenRunner?.b1 || 0}</span>
                                                </BetBox>
                                                <div className="casino-book">
                                                    <Exposure data={exposureData} id={evenRunner?.sid} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="teen20center"></div>
                                    <div className="teen20left ab2cards">
                                        <div className="casino-box-row">
                                            <div className="casino-bl-box">
                                                <div className="casino-bl-box-item casino-card-img"><img src="https://wver.sprintstaticdata.com/v211/static/front/img/cards/spade.png" alt="spade" /></div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <div className="casino-bl-box-item casino-card-img"><img src="https://wver.sprintstaticdata.com/v211/static/front/img/cards/heart.png" alt="heart" /></div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <div className="casino-bl-box-item casino-card-img"><img src="https://wver.sprintstaticdata.com/v211/static/front/img/cards/club.png" alt="club" /></div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <div className="casino-bl-box-item casino-card-img"><img src="https://wver.sprintstaticdata.com/v211/static/front/img/cards/diamond.png" alt="diamond" /></div>
                                            </div>
                                        </div>
                                        <div className="casino-box-row">
                                            <div className="casino-bl-box">
                                                <BetBox market={spadeRunner} className="back casino-bl-box-item">
                                                    <span className="casino-box-odd">{spadeRunner?.b1 || 0}</span>
                                                </BetBox>
                                                <div className="casino-book">
                                                    <Exposure data={exposureData} id={spadeRunner?.sid} />
                                                </div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <BetBox market={heartRunner} className="back casino-bl-box-item">
                                                    <span className="casino-box-odd">{heartRunner?.b1 || 0}</span>
                                                </BetBox>
                                                <div className="casino-book">
                                                    <Exposure data={exposureData} id={heartRunner?.sid} />
                                                </div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <BetBox market={clubRunner} className="back casino-bl-box-item">
                                                    <span className="casino-box-odd">{clubRunner?.b1 || 0}</span>
                                                </BetBox>
                                                <div className="casino-book">
                                                    <Exposure data={exposureData} id={clubRunner?.sid} />
                                                </div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <BetBox market={diamondRunner} className="back casino-bl-box-item">
                                                    <span className="casino-box-odd">{diamondRunner?.b1 || 0}</span>
                                                </BetBox>
                                                <div className="casino-book">
                                                    <Exposure data={exposureData} id={diamondRunner?.sid} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="teen20casino-container ab2allcards">
                                    <div className="text-center w-100">
                                        <div className="casino-bl-box casino-cards-odds-title">
                                            <div className="casino-bl-box-item"><b>{cardRunners[0]?.market?.b1 || 0}</b></div>
                                        </div>
                                    </div>
                                    <div className="casino-cards text-center mt-1">
                                        {cardRunners.map(({ card, market }, index) => (
                                            <div key={index} className="casino-card-item">
                                                <BetBox market={market} className="card-image">
                                                    <img src={`https://wver.sprintstaticdata.com/v211/static/front/img/cards/${card}.png`} alt={card} />
                                                </BetBox>
                                                <div className="casino-book">
                                                    <Exposure data={exposureData} id={market?.sid} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-right casino-min-max">
                                    <BetLimitInfo min={saRunner?.min} max={saRunner?.max} />
                                </div>

                                {currentGame?.remark && <RemarkMarquee remark={currentGame?.remark} />}
                            </div>
                        </div>
                    </div>
                </div>

                <CasinoRightSidebar RulesComponent={RulesComponent} />
            </div>
        </div>
    );
};

export default AndarBahar2;
