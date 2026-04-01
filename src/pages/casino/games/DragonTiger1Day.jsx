import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketByNation, getIsSuspended, normalizeNumber, formatNumber } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import BetLimitInfo from "./components/BetLimitInfo2";
import LastResult from "./components/LastResult";

const topRowSuffixes = ["Even", "Odd", "Black", "Red"];
const bottomRow = [
    { name: "Even", },
    { name: "Odd", },
    { name: "Black", iconPrefixes: ["spade", "club"] },
    { name: "Red", iconPrefixes: ["heart", "diamond"] },
];
const cardSuits = ["Spade", "Heart", "Club", "Diamond"];

const DragonTiger1Day = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url, result_image, game_type } = useGetFileData();
    const [mid, setMid] = React.useState(null);

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const getMarketByName = (marketName) => getMarketByNation(marketData, marketName, "nat");

    const Cards = () => (
        <div>
            <span data-v-b64efdfa="">
                <img
                    data-v-b64efdfa=""
                    src={getImage(currentGame?.C1, result_image)}
                    alt="Dragon"
                />
            </span>
            <span data-v-b64efdfa="">
                <img
                    data-v-b64efdfa=""
                    src={getImage(currentGame?.C2, result_image)}
                    alt="Tiger"
                />
            </span>
        </div>
    );

    const PlayerSection = ({ playerName, playerClass }) => {
        return (
            <div>
                <div className="casino-box-row casino-odds casino-title">
                    <div className="text-left w-100"><b className={playerClass}>{playerName}</b></div>
                </div>
                <div className="casino-box-row">
                    {topRowSuffixes.map((suffix) => {
                        const label = `${playerName} ${suffix}`;
                        const market = getMarketByName(label);
                        const suspended = getIsSuspended(market);
                        return (
                            <div key={label} className="casino-bl-box">
                                <b>{suspended ? 0 : (normalizeNumber(market?.b1) ?? "-")}</b>
                            </div>
                        );
                    })}
                </div>
                <div className="casino-box-row">
                    {bottomRow.map((item) => {
                        const label = `${playerName} ${item.name}`;
                        const market = getMarketByName(label);
                        const suspended = getIsSuspended(market);
                        return (
                            <div key={label} className="casino-bl-box">
                                <div className={`back casino-bl-box-item ${item.iconPrefixes ? "casino-card-img" : ""} ${suspended ? "suspended" : ""}`}>
                                    {item.iconPrefixes ? (
                                        <span>
                                            {item.iconPrefixes.map((prefix) => (
                                                <img key={prefix} src={getImage(prefix)} alt={prefix} />
                                            ))}
                                        </span>
                                    ) : (
                                        <span className="casino-box-odd">{item.name}</span>
                                    )}
                                </div>
                                <div className="odds-min-max">
                                    <Exposure className="casino-book" data={exposureData} id={market?.sid} />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="casino-box-row casino-odds">
                    <div className="text-center w-100">
                        <span className="float-right casino-min-max">
                            <BetLimitInfo min={getMarketByName(`${playerName} Even`)?.min} max={getMarketByName(`${playerName} Even`)?.max} />
                        </span>
                    </div>
                </div>
                <div className="mt-3">
                    <div className="casino-box-row">
                        {cardSuits.map((suit) => (
                            <div key={suit} className="casino-bl-box">
                                <div className="casino-bl-box-item casino-card-img">
                                    <img src={getImage(suit.toLowerCase())} alt={suit} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="casino-box-row">
                        {cardSuits.map((suit) => {
                            const label = `${playerName} ${suit}`;
                            const market = getMarketByName(label);
                            const suspended = getIsSuspended(market);
                            return (
                                <div key={label} className="casino-bl-box">
                                    <div className={`back casino-bl-box-item ${suspended ? "suspended" : ""}`}>
                                        <span className="casino-box-odd">{suspended ? 0 : (normalizeNumber(market?.b1) ?? "-")}</span>
                                    </div>
                                    <div className="odds-min-max">
                                        <Exposure className="casino-book" data={exposureData} id={market?.sid} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="casino-box-row casino-odds">
                        <div className="text-center w-100">
                            <span className="float-right casino-min-max">
                                <BetLimitInfo min={getMarketByName(`${playerName} Spade`)?.min} max={getMarketByName(`${playerName} Spade`)?.max} />
                            </span>
                        </div>
                    </div>
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
                            <div className="casino-table dt1day">
                                <CasinoVideo
                                    gameName={game_name}
                                    roundId={currentGame?.mid}
                                    videoSrc={iframe_url}
                                    cards={[currentGame?.C1, currentGame?.C2]}
                                    results={lastResults}
                                    timeLeft={currentGame?.autotime || 0}
                                    totalTime={currentGame?.ft || 30}
                                    CardsComponent={Cards}
                                />
                                <div className="casino-detail">
                                    <div className="dt1dayfancy">
                                        {["Dragon", "Pair", "Tiger"].map((val) => {
                                            const class_name = val === "Dragon" ? "dragonfancy" : val === "Pair" ? "pairfancy" : "tigerfancy";
                                            const market = getMarketByName(val);
                                            const suspended = getIsSuspended(market);
                                            return (
                                                <div key={val} className={`casino-box-row ${class_name}`}>
                                                    <div className="casino-nation-name">
                                                        <div className="float-left mr-2">
                                                            <BetLimitInfo min={market?.min} max={market?.max} />
                                                        </div>
                                                        <b>{val}</b>
                                                    </div>
                                                    <div className="casino-bl-box">
                                                        <div className={`back casino-bl-box-item ${suspended ? "suspended" : ""}`}>
                                                            <span className="casino-box-odd">{suspended ? 0 : normalizeNumber(market?.b1)}</span>
                                                        </div>
                                                        {val !== "Pair" && (
                                                            <div className={`lay casino-bl-box-item ${suspended ? "suspended" : ""}`}>
                                                                <span className="casino-box-odd">{suspended ? 0 : normalizeNumber(market?.l1)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="casino-nation-name text-center w-100">
                                                        <Exposure className="casino-book" data={exposureData} id={market?.sid} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="teen1daycasino-container mt-2">
                                        <div className="teen1dayleft">
                                            <PlayerSection playerName="Dragon" playerClass="text-playera" />
                                        </div>
                                        <div className="teen1daycenter"></div>
                                        <div className="teen1dayright">
                                            <PlayerSection playerName="Tiger" playerClass="text-playerb" />
                                        </div>
                                    </div>
                                    <LastResult results={lastResults} />
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

export default DragonTiger1Day;
