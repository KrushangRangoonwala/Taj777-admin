import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketBySid, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";

const BetBox = ({ market, className = "", children, exposureData, hideExposure = false }) => {
    const suspended = getIsSuspended(market);
    return (
        <div className={`${className} ${suspended ? "suspended" : ""}`}>
            {children}
            {!hideExposure && market?.sid && (
                <Exposure 
                    data={exposureData} 
                    id={market.sid} 
                    isInlineColor={true} 
                    className="casino-book"
                />
            )}
        </div>
    );
};

const BetLimitIcon = ({ id, min, max }) => (
    <div className="float-right">
        <i 
            data-toggle="collapse" 
            data-target={`#range${id}`} 
            aria-expanded="false" 
            className="fas fa-info-circle collapsed"
        ></i>
        <div id={`range${id}`} className="icon-range collapse">
            R:<span>{min}</span>-<span>{max}</span>
        </div>
    </div>
);

const TeenPatti20 = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url, result_image } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const getMarket = (sid) => getMarketBySid(marketData, sid);

    const VideoCards = () => (
        <div className="casino-video-cards-container">
            <div>
                <span data-v-b64efdfa=""><img data-v-b64efdfa="" src={getImage(currentGame?.C1, result_image)} /></span>
                <span data-v-b64efdfa=""><img data-v-b64efdfa="" src={getImage(currentGame?.C3, result_image)} /></span>
                <span data-v-b64efdfa=""><img data-v-b64efdfa="" src={getImage(currentGame?.C5, result_image)} /></span>
            </div>
            <div>
                <span data-v-b64efdfa=""><img data-v-b64efdfa="" src={getImage(currentGame?.C2, result_image)} /></span>
                <span data-v-b64efdfa=""><img data-v-b64efdfa="" src={getImage(currentGame?.C4, result_image)} /></span>
                <span data-v-b64efdfa=""><img data-v-b64efdfa="" src={getImage(currentGame?.C6, result_image)} /></span>
            </div>
        </div>
    );

    const cardsAtoK = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const suits = [
        { name: "spade", sid: 13 },
        { name: "heart", sid: 14 },
        { name: "club", sid: 15 },
        { name: "diamond", sid: 16 }
    ];

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table teenpatti2">
                            <CasinoVideo
                                gameName={game_name}
                                roundId={currentGame?.mid}
                                videoSrc={iframe_url}
                                results={lastResults}
                                showLastResults={true}
                                showCardDrawer={true}
                                CardsComponent={VideoCards}
                            />

                            <div className="casino-detail">
                                <div className="teen1daycasino-container">
                                    <div className="teen1dayleft">
                                        <div className="casino-box-row d-none-small">
                                            <div className="casino-nation-name no-border casino-bl-box-title">
                                                <div className="playera">Player A</div>
                                            </div>
                                            <div className="casino-bl-box casino-bl-box-title">
                                                <div className="casino-bl-box-item"><b>Back</b></div>
                                                <div className="casino-bl-box-item"><b>Lay</b></div>
                                            </div>
                                        </div>
                                        <div className="casino-box-row">
                                            <div className="casino-nation-name">
                                                <b className="d-none-small">Main</b> <b className="d-none-big">Player A</b>
                                                <div className="float-right">
                                                    <Exposure data={exposureData} id={getMarket(1)?.sid} className="mr-2 casino-book book-black" isInlineColor={true} />
                                                    <BetLimitIcon id="1" min="50" max="2L" />
                                                </div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <BetBox market={getMarket(1)} className="back casino-bl-box-item" exposureData={exposureData} hideExposure={true}>
                                                    <span className="casino-box-odd">{getMarket(1)?.b1 || 0}</span>
                                                </BetBox>
                                                <BetBox market={getMarket(1)} className="lay casino-bl-box-item" exposureData={exposureData} hideExposure={true}>
                                                    <span className="casino-box-odd">{getMarket(1)?.l1 || 0}</span>
                                                </BetBox>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="teen1daycenter"></div>

                                    <div className="teen1dayright">
                                        <div className="casino-box-row d-none-small">
                                            <div className="casino-nation-name no-border casino-bl-box-title">
                                                <div className="playerb">Player B</div>
                                            </div>
                                            <div className="casino-bl-box casino-bl-box-title">
                                                <div data-toggle="modal" className="casino-bl-box-item"><b>Back</b></div>
                                                <div className="casino-bl-box-item"><b>Lay</b></div>
                                            </div>
                                        </div>
                                        <div className="casino-box-row">
                                            <div className="casino-nation-name">
                                                <b className="d-none-small">Main</b> <b className="d-none-big">Player B</b>
                                                <div className="float-right">
                                                    <Exposure data={exposureData} id={getMarket(3)?.sid} className="mr-2 casino-book book-black" isInlineColor={true} />
                                                    <BetLimitIcon id="2" min="50" max="2L" />
                                                </div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <BetBox market={getMarket(3)} className="back casino-bl-box-item" exposureData={exposureData} hideExposure={true}>
                                                    <span className="casino-box-odd">{getMarket(3)?.b1 || 0}</span>
                                                </BetBox>
                                                <BetBox market={getMarket(3)} className="lay casino-bl-box-item" exposureData={exposureData} hideExposure={true}>
                                                    <span className="casino-box-odd">{getMarket(3)?.l1 || 0}</span>
                                                </BetBox>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="teen2uo">
                                        <div className="teen1dayleft">
                                            <div className="casino-box-row d-none-big">
                                                <div className="casino-nation-name no-border casino-bl-box-title">
                                                    <div className="playera">Player A</div>
                                                </div>
                                                <div className="casino-bl-box casino-bl-box-title"></div>
                                            </div>
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name"><b>Under 21</b>
                                                    <div className="float-right">
                                                        <Exposure data={exposureData} id={getMarket(9)?.sid} className="mr-2 casino-book book-black" isInlineColor={true} />
                                                        <BetLimitIcon id="3" min="100" max="50K" />
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <BetBox market={getMarket(9)} className="back casino-bl-box-item" exposureData={exposureData} hideExposure={true}>
                                                        <span className="casino-box-odd">{getMarket(9)?.b1 || 0}</span>
                                                    </BetBox>
                                                </div>
                                                <div className="casino-nation-name"><b>Over 22</b>
                                                    <div className="float-right">
                                                        <Exposure data={exposureData} id={getMarket(10)?.sid} className="mr-2 casino-book book-black" isInlineColor={true} />
                                                        <BetLimitIcon id="4" min="100" max="50K" />
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <BetBox market={getMarket(10)} className="back casino-bl-box-item" exposureData={exposureData} hideExposure={true}>
                                                        <span className="casino-box-odd">{getMarket(10)?.b1 || 0}</span>
                                                    </BetBox>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="teen1daycenter"></div>
                                        <div className="teen1dayright">
                                            <div className="casino-box-row d-none-big">
                                                <div className="casino-nation-name no-border casino-bl-box-title">
                                                    <div className="playerb">Player B</div>
                                                </div>
                                                <div className="casino-bl-box casino-bl-box-title"></div>
                                            </div>
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name"><b>Under 21</b>
                                                    <div className="float-right">
                                                        <Exposure data={exposureData} id={getMarket(11)?.sid} className="mr-2 casino-book book-black" isInlineColor={true} />
                                                        <BetLimitIcon id="5" min="100" max="50K" />
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <BetBox market={getMarket(11)} className="back casino-bl-box-item" exposureData={exposureData} hideExposure={true}>
                                                        <span className="casino-box-odd">{getMarket(11)?.b1 || 0}</span>
                                                    </BetBox>
                                                </div>
                                                <div className="casino-nation-name"><b>Over 22</b>
                                                    <div className="float-right">
                                                        <Exposure data={exposureData} id={getMarket(12)?.sid} className="mr-2 casino-book book-black" isInlineColor={true} />
                                                        <BetLimitIcon id="6" min="100" max="50K" />
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <BetBox market={getMarket(12)} className="back casino-bl-box-item" exposureData={exposureData} hideExposure={true}>
                                                        <span className="casino-box-odd">{getMarket(12)?.b1 || 0}</span>
                                                    </BetBox>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="tee2suit mt-1">
                                    <div className="casino-bl-box tee2suitheader">
                                        {suits.map((suit) => (
                                            <div key={suit.sid} className="casino-bl-box-item casino-card-img">
                                                <span className="casino-box-odd">{getMarket(suit.sid)?.b1 || 0}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="casino-bl-box">
                                        {suits.map((suit) => {
                                            const market = getMarket(suit.sid);
                                            const suspended = getIsSuspended(market);
                                            return (
                                                <div key={suit.sid} className="casino-bl-box-item back casino-card-img">
                                                    <img 
                                                        className={suspended ? "suspended" : ""} 
                                                        src={`https://wver.sprintstaticdata.com/v211/static/front/img/cards/${suit.name}.png`} 
                                                    />
                                                    <div className="casino-book book-black">
                                                        <Exposure data={exposureData} id={market?.sid} isInlineColor={true} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="casino-min-max text-right mt-4">
                                        R:<span>100</span>-<span>5K</span>
                                    </div>
                                </div>

                                <div className="row row5 mt-3">
                                    <div className="col-12 col-lg-4">
                                        <div className="teen2eo">
                                            <div className="casino-bl-box tee2eoheader">
                                                <div className="casino-bl-box-item casino-card-img">
                                                    <span className="casino-box-odd">{getMarket(17)?.b1 || 0}</span>
                                                </div>
                                                <div className="casino-bl-box-item casino-card-img">
                                                    <span className="casino-box-odd">{getMarket(18)?.b1 || 0}</span>
                                                </div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <BetBox market={getMarket(17)} className="casino-bl-box-item back" exposureData={exposureData} hideExposure={true}>
                                                    <span className="casino-box-odd">Odd</span>
                                                    <div className="casino-book book-black">
                                                        <Exposure data={exposureData} id={getMarket(17)?.sid} isInlineColor={true} />
                                                    </div>
                                                </BetBox>
                                                <BetBox market={getMarket(18)} className="casino-bl-box-item back" exposureData={exposureData} hideExposure={true}>
                                                    <span className="casino-box-odd">Even</span>
                                                    <div className="casino-book book-black">
                                                        <Exposure data={exposureData} id={getMarket(18)?.sid} isInlineColor={true} />
                                                    </div>
                                                </BetBox>
                                            </div>
                                        </div>
                                        <div className="casino-min-max text-right mt-3">
                                            R:<span>100</span>-<span>5K</span>
                                        </div>
                                    </div>
                                    <div className="col-12 col-lg-8">
                                        <div className="teen2cards">
                                            <div className="casino-cards text-center mt-1">
                                                {cardsAtoK.map((card, index) => {
                                                    const sid = 19 + index;
                                                    const market = getMarket(sid);
                                                    const suspended = getIsSuspended(market);
                                                    return (
                                                        <div key={sid} className="casino-card-item">
                                                            <div className="casino-box-odd">{market?.b1 || 0}</div>
                                                            <div className={`card-image ${suspended ? 'suspended' : ''}`}>
                                                                <img src={`https://wver.sprintstaticdata.com/v211/static/front/img/cards/${card}.png`} />
                                                            </div>
                                                            <div className="casino-book book-black">
                                                                <Exposure data={exposureData} id={market?.sid} isInlineColor={true} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="casino-min-max text-right">
                                                R:<span>100</span>-<span>5K</span>
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
    );
};

export default TeenPatti20;
