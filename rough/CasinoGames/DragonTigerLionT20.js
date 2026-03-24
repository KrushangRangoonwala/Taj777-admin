import React, { useState, useEffect, useRef } from "react";
// import { io } from "socket.io-client";
import { useSocket } from "../../components/Socket/useSocket";
import { fetchCasinoExposureApi } from "../../api/api";
import { getImage, getMarketByNation, getValueAfterDot, getIsSuspended } from "../../utilies/helpers";
import { useGetFileData } from "../../hooks/useGetFileData";
import CasinoVideo from "./components/CasinoVideo";
import useIsMobile from "../../hooks/useIsMobile";

const HEADER_COLUMNS = ['D', 'T', 'L'];

const DIFF_LABELS = ['Winner', 'Black', 'Red', 'Odd', 'Even']

const LEFT_ITEMS = [
    { label: 'Winner', type: 'text' },
    {
        label: 'Black',
        type: 'icons',
        icons: ['spade', 'club'],
    },
    {
        label: 'Red',
        type: 'icons',
        icons: ['heart', 'diamond'],
    },
    { label: 'Odd', type: 'text' },
    { label: 'Even', type: 'text' },
    ...['A', '2', '3', '4'].map(v => ({ label: v, type: 'card', value: v })),
];

const RIGHT_ITEMS = ['5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].map(v => ({
    label: v,
    type: 'card',
    value: v,
}));

const TABS = ['dragon', 'tiger', 'lion'];

const DragonTigerLionT20 = ({ isVisible, onBetSelection, lastBetTime }) => {
    const isMobile = useIsMobile(768);
    const { CODE, game_type, phpFile, placeBetApi, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [exposureData, setExposureData] = useState([]);
    const socketRef = useRef(null);
    const [tabIdx, setTabIdx] = useState(0);

    useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.[0]?.mid) return;
            try {
                console.log("### aaaaa");
                const response = await fetchCasinoExposureApi({
                    markettype: CODE,
                    main_event_id: gameData.t1[0].mid,
                    curPageName: phpFile,
                });
                if (Array.isArray(response?.data)) {
                    setExposureData(response.data);
                }
            } catch (error) {
                console.error("Error fetching exposure:", error);
            }
        };
        fetchExposure();
    }, [gameData?.t1?.[0]?.mid, lastBetTime]);

    const getExposure = (marketId) => {
        if (!Array.isArray(exposureData)) return 0;
        const market = exposureData.find((item) => item.market_id == marketId);
        return market ? market.win_loss || market.total_exposure : 0;
    };

    const renderExposure = (exposure) => {
        if (exposure === 0) return null;
        return (
            <span style={{ marginLeft: "5px", color: exposure >= 0 ? "green" : "red", zIndex: 9 }}>
                {exposure}
            </span>
        );
    };

    const socket = useSocket("casino");
    useEffect(() => {
        if (!socket) return;

        const handleBollywoodData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) {
                    setGameData(payload);
                }
            } catch (error) {
                console.error("Error processing Bollywood data:", error);
            }
        };

        const handleConnect = () => {
            console.log(`✅ ${game_type} Connected:`, socket.id);
            socket.emit("Room", game_type);
        };

        const handleDisconnect = (reason) => {
            console.log(`⚠️ ${game_type} Disconnected:`, reason);
        };

        const handleConnectError = (error) => {
            console.error("🔴 Connection Error:", error.message);
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on(game_type, handleBollywoodData);
        socket.on("game", handleBollywoodData);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        return () => {
            socket.off("connect", handleConnect);
            socket.off(game_type, handleBollywoodData);
            socket.off("game", handleBollywoodData);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
        };
    }, [socket, game_type]);

    const currentGame = gameData?.t1?.[0];
    const data = gameData?.t2 || [];

    const handleOddsClick = (marketName, odds, market, isBack, suspended) => {
        if (!market || suspended || odds == 0) return;

        const min = market?.min || 100;
        const max = market?.max || 300000;

        if (onBetSelection) {
            onBetSelection({
                teamName: marketName,
                odds: odds,
                minBet: min,
                maxBet: max,
                isBack,
                marketId: market.sid,
                eventId: getValueAfterDot(currentGame?.mid),
            });
        }
    };

    const getMarketByName = (marketName) => getMarketByNation(data, marketName, 'nat');


    function Cards() {
        const C1 = currentGame?.C1;
        const C2 = currentGame?.C2;
        const C3 = currentGame?.C3;
        const card_1 = C1 === '1' || !C1 ? getImage(C1, "cards_new") : getImage(C1, result_image);
        const card_2 = C2 === '1' || !C2 ? getImage(C2, "cards_new") : getImage(C2, result_image);
        const card_3 = C3 === '1' || !C3 ? getImage(C3, "cards_new") : getImage(C3, result_image);

        return (
            <div>
                <span><img src={card_1} alt="Dragon Card" /></span>
                <span><img src={card_2} alt="Tiger Card" /></span>
                <span><img src={card_3} alt="Lion Card" /></span>
            </div>
        );
    }


    const HeaderRow = () => (
        <div className="casino-box-row">
            <div className="casino-nation-name no-border"><div /></div>
            {HEADER_COLUMNS.map(col => (
                <div key={col} className="casino-bl-box"><b>{col}</b></div>
            ))}
        </div>
    );

    function get_player(player) {
        return player === 'T' ? 'Tiger' : player === 'D' ? 'Dragon' : 'Lion';
    }

    function getMarketName(player_, label) {
        const is_diff = DIFF_LABELS.includes(label);
        const player = is_diff ? player_ : get_player(player_);
        const marketName = is_diff ? `${label} ${player}` : `${player} ${label}`;
        return marketName;
    }

    const OddsBox = ({ player, label }) => {
        const marketName = getMarketName(player, label);
        const market = getMarketByName(marketName);
        const isSuspended = getIsSuspended(market);
        const exposure = getExposure(market?.sid);
        const isExposure = exposure && exposure != 0;

        return (
            <div
                className="casino-bl-box"
                onClick={() => handleOddsClick(marketName, market?.b1, market, true, isSuspended)}
            >
                <div className={`back casino-bl-box-item ${isSuspended ? 'suspended' : ''} ${isExposure ? 'lock-top' : ''}`}>
                    <span className="casino-box-odd">{market?.b1 || 0}</span>
                    {renderExposure(exposure)}
                </div>
            </div>
        );
    }

    const CasinoRow = ({ item, columns = 3 }) => {
        const label = tabIdx == 0 ? 'D' : tabIdx == 1 ? 'T' : 'L';
        const arr = columns == 3 ? ['D', 'T', 'L'] : [label];

        return (
            <div className="casino-box-row">
                <div className={`casino-nation-name ${item.type !== 'text' ? 'casino-card-img' : ''}`}>
                    {item.type === 'text' && <b>{item.label}</b>}

                    {item.type === 'icons' && (
                        <span>
                            {item.icons.map(icon => (
                                <img
                                    key={icon}
                                    src={`https://wver.sprintstaticdata.com/v65/static/front/img/cards/${icon}.png`}
                                    alt={icon}
                                />
                            ))}
                        </span>
                    )}

                    {item.type === 'card' && (
                        <span>
                            <img
                                src={`https://wver.sprintstaticdata.com/v65/static/front/img/cards/${item.value}.png`}
                                alt={item.value}
                            />
                        </span>
                    )}
                </div>

                {arr.map((player, i) => (
                    <OddsBox key={i} player={player} label={item.label} />
                ))}
            </div>
        );
    };

    return (
        <>
            <div className="casino-table dtl20">
                <CasinoVideo
                    gameName={game_name}
                    roundId={currentGame?.mid}
                    videoSrc={iframe_url}
                    isCardDrawerOpen={isCardDrawerOpen}
                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                    autotime={currentGame?.autotime}
                    totalTime={currentGame?.ft}
                    cards={[currentGame?.C1, currentGame?.C2, currentGame?.C3]}
                    CardsComponent={Cards}
                />


                <div className="casino-detail">
                    {isMobile ? (
                        <div className="d-none-big">
                            <div className="casino-tabs"> {/* TAB_BAR */}
                                <ul className="nav nav-tabs">
                                    {TABS.map((tab, i) => (
                                        <li key={tab} className="nav-item" onClick={() => setTabIdx(i)}>
                                            <a className={`nav-link ${i === tabIdx ? 'active' : ''}`} data-toggle="tab">
                                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="tab-content"> {/* TAB_CONTENT */}
                                {TABS.map((tab, i) => (
                                    <div key={tab} id={tab} className={`tab-pane ${i === tabIdx ? 'active' : ''}`}>
                                        <div className="teen1daycasino-container">
                                            <div className="teen1dayleft">
                                                {LEFT_ITEMS.map((item, i) => (
                                                    <CasinoRow key={i} item={item} columns={1} />
                                                ))}
                                            </div>

                                            <div className="teen1daycenter" />

                                            <div className="teen1dayright">
                                                {RIGHT_ITEMS.map((item, i) => (
                                                    <CasinoRow key={i} item={item} columns={1} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="teen1daycasino-container">

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

                    )}

                </div>

            </div>
        </>

    );
};

export default DragonTigerLionT20;
