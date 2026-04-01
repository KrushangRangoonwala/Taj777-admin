import React, { useState } from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketByNation, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import BetLimitInfo from "./components/BetLimitInfo2";
import Rules, { RulesHeader } from "./rules/Rules";
import LastResult from "./components/LastResult";

const ruleList = [
    { label: "Winner", value: "1 TO 1.95" },
    { label: "Suits / Colors", value: "1 TO 3.75" },
    { label: "Odd / Even", value: "1 TO 0.95" },
    { label: "13 Cards", value: "1 TO 12" },
];

function RulesComponent() {
    return (
        <>
            <RulesHeader />
            <div className="card-body" style={{ padding: "10px" }}>
                <Rules title="20-20 DTL Rules" rules={ruleList} />
            </div>
        </>
    );
}

const DTL20 = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url } = useGetFileData();
    const [tabIdx, setTabIdx] = useState(0);

    const currentGame = gameData?.t1?.[0] || {};
    const marketData = gameData?.t2 || [];

    const players = [
        { code: "D", name: "Dragon" },
        { code: "T", name: "Tiger" },
        { code: "L", name: "Lion" },
    ];

    const DIFF_LABELS = ["Winner", "Black", "Red", "Odd", "Even"];

    const LEFT_ITEMS = [
        { label: "Winner", type: "text", range: "100-1L", id: "demo-l-0" },
        { label: "Black", type: "icons", icons: ["spade", "club"], range: "100-5K", id: "demo-l-1" },
        { label: "Red", type: "icons", icons: ["heart", "diamond"], range: "100-5K", id: "demo-l-2" },
        { label: "Odd", type: "text", range: "100-5K", id: "demo-l-3" },
        { label: "Even", type: "text", range: "100-5K", id: "demo-l-4" },
        { label: "A", type: "card", value: "A", range: "100-5K", id: "demo-l-5" },
        { label: "2", type: "card", value: "2", range: "100-5K", id: "demo-l-6" },
        { label: "3", type: "card", value: "3", range: "100-5K", id: "demo-l-7" },
        { label: "4", type: "card", value: "4", range: "100-5K", id: "demo-l-8" },
    ];

    const RIGHT_ITEMS = [
        { label: "5", type: "card", value: "5", range: "100-5K", id: "demo-r-0" },
        { label: "6", type: "card", value: "6", range: "100-5K", id: "demo-r-1" },
        { label: "7", type: "card", value: "7", range: "100-5K", id: "demo-r-2" },
        { label: "8", type: "card", value: "8", range: "100-5K", id: "demo-r-3" },
        { label: "9", type: "card", value: "9", range: "100-5K", id: "demo-r-4" },
        { label: "10", type: "card", value: "10", range: "100-5K", id: "demo-r-5" },
        { label: "J", type: "card", value: "J", range: "100-5K", id: "demo-r-6" },
        { label: "Q", type: "card", value: "Q", range: "100-5K", id: "demo-r-7" },
        { label: "K", type: "card", value: "K", range: "100-5K", id: "demo-r-8" },
    ];

    const getMarketName = (player, label) => {
        const isDiff = DIFF_LABELS.includes(label);
        const p = isDiff ? player.code : player.name;
        return isDiff ? `${label} ${p}` : `${p} ${label}`;
    };

    const getMarket = (player, item) => {
        const name = getMarketName(player, item.label);
        return getMarketByNation(marketData, name, "nat");
    };

    const Cards = () => (
        <>
            <div>
                <span data-v-b64efdfa="">
                    <img data-v-b64efdfa="" src={getImage(currentGame?.C1, "cards_new")} alt="Dragon" />
                </span>
                <span data-v-b64efdfa="">
                    <img data-v-b64efdfa="" src={getImage(currentGame?.C2, "cards_new")} alt="Tiger" />
                </span>
                <span data-v-b64efdfa="">
                    <img data-v-b64efdfa="" src={getImage(currentGame?.C3, "cards_new")} alt="Lion" />
                </span>
            </div>
        </>
    );

    const HeaderRow = () => (
        <div className="casino-box-row mb-0">
            <div className="casino-nation-name no-border">
                <div />
            </div>
            {players.map((p) => (
                <div key={p.code} className="casino-bl-box">
                    <b>{p.code}</b>
                </div>
            ))}
        </div>
    );

    const OddsBox = ({ player, item, isMobileBox = false }) => {
        const market = getMarket(player, item);
        const suspended = getIsSuspended(market);

        return (
            <div className="casino-bl-box">
                <div className={`back casino-bl-box-item ${suspended ? "suspended" : ""}`}>
                    <span className="casino-box-odd">{market?.b1 || 0}</span>
                    {isMobileBox && <Exposure data={exposureData} id={market?.sid} className="book-black" isInlineColor={false} />}
                </div>
                {!isMobileBox && (
                    <div className="casino-book book-black">
                        <Exposure data={exposureData} id={market?.sid} isInlineColor={true} />
                    </div>
                )}
            </div>
        );
    };

    const CasinoRow = ({ item, isMobileRow = false }) => {
        const currentPlayers = isMobileRow ? [players[tabIdx]] : players;

        return (
            <div className="casino-box-row">
                <div className={`casino-nation-name ${item.type !== "text" ? "casino-card-img" : ""}`}>
                    {item.type === "text" && <b>{item.label}</b>}
                    {item.type === "icons" && (
                        <span>
                            {item.icons.map((icon) => (
                                <img
                                    key={icon}
                                    src={`https://wver.sprintstaticdata.com/v208/static/front/img/cards/${icon}.png`}
                                    alt={icon}
                                />
                            ))}
                        </span>
                    )}
                    {item.type === "card" && (
                        <span>
                            <img
                                src={`https://wver.sprintstaticdata.com/v211/static/front/img/cards/${item.value}.png`}
                                alt={item.value}
                            />
                        </span>
                    )}
                </div>
                <div className="float-right dtl20info">
                    <i data-toggle="collapse" data-target={`#${isMobileRow ? item.id + '-m' : item.id}`} className="fas fa-info-circle"></i>
                    <div id={isMobileRow ? item.id + '-m' : item.id} className="collapse icon-range">
                        R:<span>{item.range.split("-")[0]}</span>-<span>{item.range.split("-")[1]}</span>
                    </div>
                </div>
                {currentPlayers.map((p) => (
                    <OddsBox key={p.code} player={p} item={item} isMobileBox={isMobileRow} />
                ))}
            </div>
        );
    };

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table dtl20">
                            <CasinoVideo
                                gameName={game_name}
                                roundId={currentGame?.mid}
                                videoSrc={iframe_url}
                                results={lastResults}
                                timeLeft={currentGame?.autotime || 0}
                                totalTime={currentGame?.ft || 30}
                                CardsComponent={Cards}
                                isCardDrawerOpen={true}
                            />

                            <div className="casino-detail">

                                {/* Desktop Layout */}
                                <div className="teen1daycasino-container d-none-small">
                                    <div className="teen1dayleft">
                                        <HeaderRow />
                                        {LEFT_ITEMS.map((item, i) => (
                                            <CasinoRow key={i} item={item} />
                                        ))}
                                    </div>
                                    <div className="teen1daycenter" />
                                    <div className="teen1dayright">
                                        <HeaderRow />
                                        {RIGHT_ITEMS.map((item, i) => (
                                            <CasinoRow key={i} item={item} />
                                        ))}
                                    </div>
                                </div>

                                {/* Mobile Layout */}
                                <div className="d-none-big">
                                    <div className="casino-tabs">
                                        <ul className="nav nav-tabs">
                                            {players.map((p, i) => (
                                                <li key={p.code} className="nav-item" onClick={() => setTabIdx(i)}>
                                                    <a className={`nav-link ${i === tabIdx ? "active" : ""}`}>
                                                        {p.name}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="tab-content">
                                        <div className="teen1daycasino-container">
                                            <div className="teen1dayleft">
                                                {LEFT_ITEMS.map((item, i) => (
                                                    <CasinoRow key={i} item={item} isMobileRow={true} />
                                                ))}
                                            </div>
                                            <div className="teen1daycenter" />
                                            <div className="teen1dayright">
                                                {RIGHT_ITEMS.map((item, i) => (
                                                    <CasinoRow key={i} item={item} isMobileRow={true} />
                                                ))}
                                            </div>
                                        </div>
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
    );
};

export default DTL20;
