import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketByNation, getIsSuspended, normalizeNumber } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import BetLimitInfo from "./components/BetLimitInfo2";
import Rules, { RulesHeader } from "./rules/Rules";
import RemarkMarquee from "./components/RemarkMarquee";

const topRow = ["Even", "Odd"];
const bottomRow = [
    { name: "Even", },
    { name: "Odd", },
    { name: "Black", types: ["spade", "club"], },
    { name: "Red", types: ["heart", "diamond"], },
];
const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const ruleList = [
    { label: "Dragon", value: "1 TO 1" },
    { label: "Tiger", value: "1 TO 1" },
    { label: "Tie", value: "1 TO 8" },
    { label: "Pair", value: "1 TO 11" },
];

function RulesComponent() {
    return (
        <>
            <RulesHeader />
            <div className="card-body" style={{ padding: "10px" }}>
                <Rules title="Dragon Tiger Rules" rules={ruleList} />
            </div>
        </>
    );
}

const DragonTiger20 = ({ gameData, exposureData, lastResults }) => {
    const { game_type, game_name, iframe_url, result_image } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const isDT_2 = game_type === "dt202";

    const getMarketByName = (marketName) => getMarketByNation(marketData, marketName, "nat");

    const Cards = () => (
        <div>
            <span data-v-b64efdfa="">
                <img
                    data-v-b64efdfa=""
                    src={getImage(currentGame?.C1, result_image)}
                    alt="Dragon Card"
                />
            </span>
            <span data-v-b64efdfa="">
                <img
                    data-v-b64efdfa=""
                    src={getImage(currentGame?.C2, result_image)}
                    alt="Tiger Card"
                />
            </span>
        </div>
    );

    const PlayerSection = ({ playerName, playerClass, rangeId }) => {
        const titleMarket = getMarketByName(playerName);
        const cardsSuspendedMarket = getMarketByName(`${playerName} Card 2`);
        const isAllCardsSuspended = getIsSuspended(cardsSuspendedMarket);

        return (
            <div className={playerClass === "text-playera" ? "teen1dayleft" : "teen1dayright"}>
                <div>
                    <div className="casino-box-row justify-content-center casino-odds casino-title">
                        <div className="text-left w-100">
                            <b className={playerClass}>{playerName}</b>
                            <div className="float-right">
                                <BetLimitInfo min={titleMarket?.min} max={titleMarket?.max} />
                            </div>
                        </div>
                    </div>
                    {/* Rate Row */}
                    <div className="casino-box-row">
                        {bottomRow.map((item, idx) => {
                            const label = `${playerName} ${item.name}`;
                            const market = getMarketByName(label);
                            const suspended = getIsSuspended(market);
                            return (
                                <div key={`rate-${idx}`} className="casino-bl-box">
                                    <b>{suspended ? 0 : (normalizeNumber(market?.rate) || "-")}</b>
                                </div>
                            );
                        })}
                    </div>
                    {/* Label/Exposure Row */}
                    <div className="casino-box-row">
                        {bottomRow.map((item, idx) => {
                            const label = `${playerName} ${item.name}`;
                            const market = getMarketByName(label);
                            const suspended = getIsSuspended(market);
                            return (
                                <div key={`label-${idx}`} className="casino-bl-box">
                                    <div className={`back casino-bl-box-item ${item.types ? "casino-card-img" : ""} ${suspended ? "suspended" : ""}`}>
                                        {item.types ? (
                                            <span>
                                                {item.types.map((type) => (
                                                    <img key={type} src={getImage(type, result_image)} alt={type} />
                                                ))}
                                            </span>
                                        ) : (
                                            <span className="casino-box-odd">{item.name}</span>
                                        )}
                                        <Exposure className="casino-book" data={exposureData} id={market?.sid} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* 13 Cards Section */}
                <div className="casino-box cards-box mt-3">
                    <div className="w-100">
                        <div className="casino-odds casino-cards-odds-title">
                            <div className="text-center w-100">
                                <b>{isAllCardsSuspended ? 0 : 12}</b>
                                <div className="float-right">
                                    <BetLimitInfo min={cardsSuspendedMarket?.min} max={cardsSuspendedMarket?.max} />
                                </div>
                            </div>
                        </div>
                        <div className="casino-cards text-center mt-1">
                            {cards.map((card, idx) => {
                                const nation = `${playerName} Card ${card}`;
                                const market = getMarketByName(nation);
                                const suspended = getIsSuspended(market);
                                const card_ = card === "1" ? "A" : card;
                                return (
                                    <div key={idx} className="casino-card-item">
                                        <div className={`card-image ${suspended ? "suspended" : ""}`}>
                                            <img src={getImage(card_, "cards_new/lucky6")} alt={card} />
                                        </div>
                                        <div className="casino-book">
                                            <Exposure data={exposureData} id={market?.sid} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const dragonMarket = getMarketByName("Dragon");
    const tigerMarket = getMarketByName("Tiger");
    const tieMarket = getMarketByName("Tie");
    const pairMarket = getMarketByName("Pair");

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table dt20">
                            <CasinoVideo
                                gameName={game_name}
                                roundId={currentGame?.mid}
                                videoSrc={iframe_url}
                                results={lastResults}
                                timeLeft={currentGame?.autotime || 0}
                                totalTime={currentGame?.ft || 30}
                                CardsComponent={Cards}
                            />

                            <div className="casino-detail">
                                <div className="text-right w-100 pr">
                                    <div className="float-right">
                                        <BetLimitInfo min={dragonMarket?.min} max={dragonMarket?.max} />
                                    </div>
                                </div>
                                <div className="dtobx-top">
                                    <div className={`dragon-box ${getIsSuspended(dragonMarket) ? "suspended" : ""}`}>
                                        <div><b>Dragon</b></div>
                                        <div className="text-center">
                                            <span className="d-block"><b>{normalizeNumber(dragonMarket?.rate) || 0}</b></span>
                                            <Exposure className="d-block casino-book" data={exposureData} id={dragonMarket?.sid} />
                                        </div>
                                    </div>
                                    <div className={`tiebox ${getIsSuspended(tieMarket) ? "suspended" : ""}`}>
                                        <div><b>Tie</b></div>
                                        <div className="text-center">
                                            <span className="d-block"><b>{normalizeNumber(tieMarket?.rate) || 0}</b></span>
                                            <Exposure className="d-block casino-book" data={exposureData} id={tieMarket?.sid} />
                                        </div>
                                    </div>
                                    <div className={`tiger-box ${getIsSuspended(tigerMarket) ? "suspended" : ""}`}>
                                        <div><b>Tiger</b></div>
                                        <div className="text-center">
                                            <span className="d-block"><b>{normalizeNumber(tigerMarket?.rate) || 0}</b></span>
                                            <Exposure className="d-block casino-book" data={exposureData} id={tigerMarket?.sid} />
                                        </div>
                                    </div>
                                    <div className={`pair-box ${getIsSuspended(pairMarket) ? "suspended" : ""}`}>
                                        <div><b>Pair</b></div>
                                        <div className="text-center">
                                            <span className="d-block"><b>{normalizeNumber(pairMarket?.rate) || 0}</b></span>
                                            <Exposure className="d-block casino-book" data={exposureData} id={pairMarket?.sid} />
                                        </div>
                                    </div>
                                </div>

                                <div className="teen1daycasino-container mt-5">
                                    <PlayerSection playerName="Dragon" playerClass="text-playera" />
                                    <div className="teen1daycenter"></div>
                                    <PlayerSection playerName="Tiger" playerClass="text-playerb" />
                                </div>

                                {!isDT_2 && <RemarkMarquee remark={currentGame?.remark} />}
                            </div>
                        </div>
                    </div>
                </div>

                <CasinoRightSidebar RulesComponent={RulesComponent} />
            </div>
        </div>
    );
};

export default DragonTiger20;