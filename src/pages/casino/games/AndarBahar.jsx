import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketByNation, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import RemarkMarquee from "./components/RemarkMarquee";
import BetLimitInfo from "./components/BetLimitInfo2";
import Rules, { RulesHeader } from "./rules/Rules";

const AndarBahar = ({ gameData, exposureData, lastResults }) => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();

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

    const CardBox = ({ item, index, side }) => {
        const isClosed = hasCards ? (side === "andar" ? t3_ar[index] : t3_br[index]) === "0" : false;
        const imgIndex = isClosed ? 0 : mapNatToImageIndex(item.nat || item.nation);
        const suspended = getIsSuspended(item);

        return (
            <div className={`casino-card-item ${suspended ? "suspended" : ""}`}>
                <div className="card-image">
                    <img
                        src={`https://wver.sprintstaticdata.com/v211/static/front/img/andar-bahar-cards/${imgIndex}.png`}
                        alt="card"
                    />
                </div>
                <Exposure id={item.sid} className="casino-book book-black" data={exposureData} />
            </div>
        );
    };

    const VideoCards = () => {
        const t3_data = gameData?.t3?.[0];
        const andarCards = t3_data?.aall ? t3_data.aall.split(",") : (currentGame?.cards || []).filter((card, i) => i % 2 !== 0 && card !== "1");
        const baharCards = t3_data?.ball ? t3_data.ball.split(",") : (currentGame?.cards || []).filter((card, i) => i % 2 === 0 && card !== "1");

        const CardSlider = ({ id, cards }) => (
            <div id={id} className="ab-slider owl-carousel owl-theme owl-rtl owl-loaded owl-drag" style={{ overflowX: 'auto', display: 'flex' }}>
                <div className="owl-stage-outer">
                    <div className="owl-stage" style={{ transform: 'translate3d(0px, 0px, 0px)', transition: 'all', display: 'flex' }}>
                        {cards.filter(card => card && card !== "1").map((card, i) => (
                            <div key={i} className="owl-item active" style={{ width: '43.563px', flexShrink: 0 }}>
                                <div className="item">
                                    <span>
                                        <img src={getImage(card, result_image)} alt="card" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );

        return (
            <div className="casino-video-cards">
                <div className="casino-cards-shuffle"><i className="fas fa-grip-lines-vertical"></i></div>
                <div className="casino-video-cards-container">
                    <CardSlider id="andarSlider" cards={andarCards} />
                    <CardSlider id="baharSlider" cards={baharCards} />
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
                            <div className="casino-table andar-bahar">
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
                                    <div className="ab-bg">
                                        <div className="andar-cards-box text-center">
                                            <h5 className="w-100 text-center text-playera">
                                                Andar
                                                <div className="casino-min-max">
                                                    <BetLimitInfo min={andarItems[0]?.min} max={andarItems[0]?.max} />
                                                </div>
                                            </h5>
                                            {andarItems.map((item, index) => (
                                                <CardBox key={item.sid} item={item} index={index} side="andar" />
                                            ))}
                                        </div>
                                        <div className="bahar-cards-box text-center">
                                            <h5 className="w-100 text-center text-playerb">
                                                Bahar
                                                <div className="casino-min-max">
                                                    <BetLimitInfo min={baharItems[0]?.min} max={baharItems[0]?.max} />
                                                </div>
                                            </h5>
                                            {baharItems.map((item, index) => (
                                                <CardBox key={item.sid} item={item} index={index} side="bahar" />
                                            ))}
                                        </div>
                                    </div>
                                    <RemarkMarquee remark="Payout : Bahar 1st Card 25% and All Other Andar-Bahar Cards 100%." />
                                </div>
                            </div>
                        </div>
                    </div>
                    <CasinoRightSidebar RulesComponent={RulesComponent} />
                </div>
            </div>
        </div>
    );
};

export default AndarBahar;
