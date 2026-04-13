import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from 'react-router-dom';
import { capitalize_1st_letter, formatNumber, formatWithTimezone, getSportName } from "../../utilies/helpers";
import { MarketTable, OddsBox } from './components/MarketComponents';
import EventRightSidebar from './components/EventRightSidebar';
import './blink.css';
import useSocket from '../../api/Socket/useSocket';

const format = (num) => Number(parseFloat(num).toFixed(2)).toString();

function getExposureColor(exposure = 0) {
    return exposure < 0 ? "red" : exposure > 0 ? "green" : "rgb(153, 153, 153)";
}

function Exposure({ exposure = 0, pr }) {
    return (
        <p className="mb-0 float-left" style={{ color: getExposureColor(exposure) }}>
            {exposure}
            {pr && <span className="badge badge-dark book-per">{pr}</span>}
        </p>
    )
}

function ExposureMob({ exposure = 0, pr }) {
    return (
        <span className="mb-0" style={{ color: getExposureColor(exposure) }}>
            {exposure}
            {pr && <span className="badge badge-dark book-per">{pr}</span>}
        </span>
    )
}

function normalizeBookmakerSmall(session = []) {
    return session
        .slice()
        .sort((a, b) => a.SelectionId - b.SelectionId)
        .map(item => ({
            id: item.SelectionId,
            name: item.RunnerName,
            status: item.GameStatus,
            Min: item.Min,
            Max: item.Max,

            back: [
                { price: item.BackPrice1, size: item.BackSize1 },
                { price: item.BackPrice2, size: item.BackSize2 },
                { price: item.BackPrice3, size: item.BackSize3 },
            ],

            lay: [
                { price: item.LayPrice1, size: item.LaySize1 },
                { price: item.LayPrice2, size: item.LaySize2 },
                { price: item.LayPrice3, size: item.LaySize3 },
            ],
        }));
}

function filterRecord(session, isReverse = true) {
    if (!session) return [];
    const data =
        session
            .filter(item =>
                item.SelectionId &&
                !["OFFLINE", "CLOSED"].includes(
                    (item.GameStatus || "").toUpperCase()
                )
            )
    return isReverse ? data.reverse() : data;
}

export function sanitizeNumber(val) {
    return isNaN(val) || val === null ? 0 : Number(val);
}

function findExposureValue(marketObj, targetId) {
    if (!marketObj?.market_ids || !marketObj?.exposure) return null;
    const targetIdStr = String(targetId);
    for (const teamKey in marketObj.market_ids) {
        if (String(marketObj.market_ids[teamKey]) === targetIdStr) {
            return marketObj.exposure[teamKey] ?? null;
        }
    }
    return null;
}

export function getExposureByMarketId({ data, marketId, key }) {
    const marketType = data?.[key];
    const targetId = String(marketId);

    if (Array.isArray(marketType)) {
        for (const item of marketType) {
            const exposure = findExposureValue(item, targetId);
            if (exposure !== null) return format(exposure);
        }
    }

    else {
        const exposure = findExposureValue(marketType, targetId);
        if (exposure !== null) return format(exposure);
    }
}

function getExposureCss(exposure) {
    return {
        color: exposure < 0 ? "rgb(247, 80, 94)" : "rgb(57, 255, 57)",
        fontWeight: 132,
    }
}

const getTitle = (name) => {
    if (!name) return "";
    return name.toUpperCase().replace(/\s+/g, "_");
};

/**
 * Processes main match data (Match Odds and Tied Match).
 * @param {Array} rawData - The raw market data from the socket.
 * @returns {Object} { matchOdds, tiedMatch }
 */
function processMainMarketData(rawData) {
    if (!rawData) return { matchOdds: null, tiedMatch: null };
    const groups = Array.isArray(rawData[0]) ? rawData : [rawData];
    const firstGroup = groups?.[0] || [];

    const matchOdds = firstGroup.find(
        m => m.marketName?.toLowerCase() === "match odds"
            || m.marketName?.toLowerCase() === "match_odds"
            || m.market_name?.toLowerCase() === "match odds"
            || m.market_name?.toLowerCase() === "match_odds"
    );

    const tiedMatch = firstGroup.find(
        m => m.marketName?.toLowerCase() === "tied match"
            || m.marketName?.toLowerCase() === "tied_match"
            || m.market_name?.toLowerCase() === "tied match"
            || m.market_name?.toLowerCase() === "tied_match"
    );

    return { matchOdds, tiedMatch };
}

/**
 * Processes other markets data (all markets and bookmakers map).
 * @param {Array} rawData - The raw market data from the socket.
 * @returns {Object} { allMarkets, allBookmakers }
 */
function processOtherMarketData(rawData) {
    if (!rawData) return { allMarkets: [], allBookmakers: {} };
    const groups = Array.isArray(rawData[0]) ? rawData : [rawData];

    let allMarkets = [];
    let allBookmakers = {};

    groups.forEach((marketGroup, groupIndex) => {
        marketGroup.forEach(market => {
            const key = market.marketName ? "marketName" : "market_name";
            const marketNameKey = market[key]?.toLowerCase()?.replace(/\s+/g, "_");

            allMarkets.push({
                ...market,
                key: marketNameKey + "_" + groupIndex
            });

            if (marketNameKey === "match_odds") {
                allBookmakers[marketNameKey + "_" + groupIndex] = {
                    bookmaker: market.bookmaker || [],
                    bookmaker_tied: market.bookmaker_tied || []
                };
            }
        });
    });

    return { allMarkets, allBookmakers };
}

const EventPage = ({ socketData, setSocketData, initialSocketData, requestOdds }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const selectedMatchRedux = useSelector(store => store.match.selectedMatch);
    const selectedMatch = location.state?.match || selectedMatchRedux;
    const livePoints = useSelector(state => state.bet?.livePoints);
    const openedBetPoint = useSelector(state => state.bet?.openedBetPoint);
    const isCricket = selectedMatch?.SportId == 4;

    const isLeague = selectedMatch?.matchName?.toLowerCase()?.includes("league");
    const leagueName = selectedMatch?.cname?.split(" ")?.map((item) => item[0]?.toUpperCase())?.join("");

    const [bookmaker_odds, setBookmaker_odds] = useState();
    const [bookmaker_tied_odds, setBookmaker_tied_odds] = useState();
    const [normalData, setNormalData] = useState();
    const [fancy1, setFancy1] = useState();
    const [oddEven, setOddEven] = useState();
    const [overByOver, setOverByOver] = useState();
    const [ballByBall, setBallByBall] = useState();
    const [khado, setKhado] = useState();
    const [meter, setMeter] = useState();
    const [cricketcasino, setCricketcasino] = useState();
    const [match_Odds, setMatch_Odds] = useState();
    const [tied_match, setTied_match] = useState();
    const [bookmakerSmall, setBookmakerSmall] = useState()

    const [cricketMarkets, setCricketMarkets] = useState([]);
    const [marketBookmakers, setMarketBookmakers] = useState({});

    const prevSocketData = useRef([]);
    const [openSections, setOpenSections] = useState({
        match_odds: true,
        bookmaker_odds: true,
        bookmaker_tied_odds: true,
        market2: true,
        market3: true,
        market33: true,
        market333: true,
        market3334: true,
        market3333: true,
        market33333: true,
        market6: true
    });

    const [liveScoreData, setLiveScoreData] = useState(null);

    const socket = useSocket("casino");
    useEffect(() => {
        if (selectedMatch?.marketid) {
            requestOdds(selectedMatch?.marketid)
        } else {
            // navigate('/');
        }

        return () => {
            setSocketData(null);
        };
    }, [selectedMatch, socket]);

    useEffect(() => {
        if (!socket || !selectedMatch?.inPlay || selectedMatch?.SportId != 4) return;

        const handleLiveScore = (data) => {
            // data is ["liveScore", { type: 1, data: { ... } }]
            console.log('22 data', data)
            if (data?.data) {
                setLiveScoreData(data.data);
            }
        };

        socket.on("liveScore", handleLiveScore);

        return () => {
            socket.off("liveScore", handleLiveScore);
        };
    }, [socket, selectedMatch?.inPlay, selectedMatch?.SportId]);

    useEffect(() => {
        if (initialSocketData) {
            const mainData = processMainMarketData(initialSocketData);
            setMatch_Odds(mainData.matchOdds);
            setTied_match(mainData.tiedMatch);
            setBookmaker_odds(mainData.matchOdds?.bookmaker || []);
            setBookmaker_tied_odds(mainData.matchOdds?.bookmaker_tied || []);

            const otherData = processOtherMarketData(initialSocketData);
            setCricketMarkets(otherData.allMarkets);
            setMarketBookmakers(otherData.allBookmakers);
        }
    }, [initialSocketData]);

    useEffect(() => {
        if (socketData) {
            setNormalData(filterRecord(socketData?.body?.session?.[0]?.value?.session, false));
            setFancy1(filterRecord(socketData?.body?.session1?.[0]?.value?.session, false));
            setOddEven(filterRecord(socketData?.body?.oddEven?.[0]?.value?.session, false));
            setOverByOver(filterRecord(socketData?.body?.overByOver?.[0]?.value?.session, false));
            setBallByBall(filterRecord(socketData?.body?.ballByBall?.[0]?.value?.session, false));
            setKhado(filterRecord(socketData?.body?.khado?.[0]?.value?.session, false));
            setMeter(filterRecord(socketData?.body?.meter?.[0]?.value?.session, false));
            setCricketcasino(socketData?.body?.cricketcasino?.[0]?.value?.session, false);

            const bmSession = socketData?.body?.bm1?.[0]?.value?.session;
            if (bmSession) {
                setBookmakerSmall(normalizeBookmakerSmall(bmSession));
            }

            const cricketRaw = socketData?.body?.cricket;
            const mainData = processMainMarketData(cricketRaw);
            setMatch_Odds(mainData.matchOdds);
            setTied_match(mainData.tiedMatch);
            setBookmaker_odds(mainData.matchOdds?.bookmaker || []);
            setBookmaker_tied_odds(mainData.matchOdds?.bookmaker_tied || []);

            const otherData = processOtherMarketData(cricketRaw);
            setCricketMarkets(otherData.allMarkets);
            setMarketBookmakers(otherData.allBookmakers);
        }
    }, [socketData]);

    const getHeaderName = () => {
        if (selectedMatch) {
            if (selectedMatch.cname) return `${selectedMatch.cname} > ${selectedMatch.matchName}`;
            else return `${selectedMatch.matchName}`;
        }
        return "Loading Match Details...";
    };

    const getHeaderDate = () => {
        if (selectedMatch && selectedMatch.matchdate) {
            return formatWithTimezone(selectedMatch.matchdate, false);
        }
        return "Date Not Available";
    };

    const toggleSection = (section) => {
        setOpenSections((prevState) => ({
            ...prevState,
            [section]: !prevState[section],
        }));
    };

    function addSectionIfNotExist(sectionId) {
        if (sectionId in openSections) return;
        setOpenSections(prev => ({ ...prev, [sectionId]: true }));
    }

    function MinMax({ min, max, none_class }) {
        const m_in = formatNumber(sanitizeNumber(min))
        const m_ax = formatNumber(sanitizeNumber(max))
        return (
            <span className={`max-bet ${none_class ? none_class : ''}`} style={{ color: 'var(--text-table-header-new)' }}>
                {(min || min == 0) && <>Min:<span style={{ marginRight: '10px' }}>{m_in}</span></>}
                {(max || max == 0) && <>Max:<span>{m_ax}</span></>}
            </span>
        )
    }


    function Boxes_2({ item, isAllBackBox, isSuspended, isLayFirst, is_1_OddBox = false, bet_market_type, market_odd_name }) {
        let back_color = false;
        let lay_color = false;

        const selectionId = item.id || item.SelectionId;
        if (prevSocketData.current) {
            const idx = prevSocketData.current.findIndex(val => (val.id || val.SelectionId) === selectionId);
            if (idx !== -1) {
                const prevData = prevSocketData.current[idx];
                if (Number(item.BackPrice1) > Number(prevData.BackPrice1)) back_color = 'green';
                else if (Number(item.BackPrice1) < Number(prevData.BackPrice1)) back_color = 'red';

                if (Number(item.LayPrice1) > Number(prevData.LayPrice1)) lay_color = 'green';
                else if (Number(item.LayPrice1) < Number(prevData.LayPrice1)) lay_color = 'red';

                prevSocketData.current[idx] = { ...item };
            } else {
                prevSocketData.current.push({ ...item });
            }
        }

        function BackBox() {
            return (
                <OddsBox
                    type="back"
                    level={is_1_OddBox ? "" : ""}
                    odds={formatNumber(sanitizeNumber(item.BackPrice1))}
                    size={formatNumber(sanitizeNumber(item.BackSize1))}
                    animateColor={back_color}
                    suspended={isSuspended}
                    is_1_OddBox={is_1_OddBox}
                />
            )
        }

        function LayBox() {
            if (!is_1_OddBox) {
                return (
                    <OddsBox
                        type={isAllBackBox ? "back" : "lay"}
                        odds={formatNumber(sanitizeNumber(item.LayPrice1))}
                        size={formatNumber(sanitizeNumber(item.LaySize1))}
                        animateColor={lay_color}
                        suspended={isSuspended}
                    />
                )
            }
            return null;
        }

        if (isLayFirst) return <><LayBox /><BackBox /></>;
        return <><BackBox /><LayBox /></>;
    }

    function Boxes_6({ data, bet_market_type, market_odd_name }) {
        const back = data?.back || [];
        const lay = data?.lay || [];

        let back_color = [false, false, false];
        let lay_color = [false, false, false];

        const selectionId = data.id || data.selectionId || data.SelectionId;
        if (prevSocketData.current) {
            const idx = prevSocketData.current.findIndex(val => (val.id || val.selectionId || val.SelectionId) === selectionId);
            if (idx !== -1) {
                const prevData = prevSocketData.current[idx];
                prevSocketData.current[idx] = data;

                const prevBack = prevData.back || [];
                const prevLay = prevData.lay || [];

                back.forEach((v, i) => {
                    if (v?.price > prevBack[i]?.price) back_color[i] = 'green';
                    else if (v?.price < prevBack[i]?.price) back_color[i] = 'red';
                });
                lay.forEach((v, i) => {
                    if (v?.price > prevLay[i]?.price) lay_color[i] = 'green';
                    else if (v?.price < prevLay[i]?.price) lay_color[i] = 'red';
                });
            } else {
                prevSocketData.current.push(data);
            }
        }

        return (
            <>
                <OddsBox type="back" level="2" odds={formatNumber(sanitizeNumber(back[2]?.price), 2)} size={formatNumber(sanitizeNumber(back[2]?.size), 2)} animateColor={back_color[2]} />
                <OddsBox type="back" level="1" odds={formatNumber(sanitizeNumber(back[1]?.price), 2)} size={formatNumber(sanitizeNumber(back[1]?.size), 2)} animateColor={back_color[1]} />
                <OddsBox type="back" odds={formatNumber(sanitizeNumber(back[0]?.price), 2)} size={formatNumber(sanitizeNumber(back[0]?.size), 2)} animateColor={back_color[0]} />
                <OddsBox type="lay" odds={formatNumber(sanitizeNumber(lay[0]?.price), 2)} size={formatNumber(sanitizeNumber(lay[0]?.size), 2)} animateColor={lay_color[0]} />
                <OddsBox type="lay" level="1" odds={formatNumber(sanitizeNumber(lay[1]?.price), 2)} size={formatNumber(sanitizeNumber(lay[1]?.size), 2)} animateColor={lay_color[1]} />
                <OddsBox type="lay" level="2" odds={formatNumber(sanitizeNumber(lay[2]?.price), 2)} size={formatNumber(sanitizeNumber(lay[2]?.size), 2)} animateColor={lay_color[2]} />
            </>
        );
    }

    function Double_Column_Section({
        title,
        sectionId,
        data,
        isAllBackBox,
        isLayFirst,
        is_1_OddBox,
        min,
        max,
        bet_market_type,
        market_odd_name,
        marketClass = "market-6",
        column = [{ type: "back", title: "Back" }, { type: "lay", title: "Lay" }],
        inMinMax = true,
        suspendClass = "suspendedtext",
        isMarketNameHaveNum = false,
    }) {
        addSectionIfNotExist(sectionId);
        if (!data?.length) return null;
        const isLay1st = isLayFirst ?? column[0].type === "lay";

        return (
            <MarketTable
                title={title}
                id={sectionId}
                min={min}
                max={max}
                marketClass={marketClass}
                column={column}
            >
                {data.map((item, index) => {
                    let exposure = getExposureByMarketId({ data: openedBetPoint, marketId: item.marketId, key: bet_market_type }) || getExposureByMarketId({ data: livePoints, marketId: item.marketId, key: bet_market_type });
                    const isSuspendedMarker = item.Active !== "";

                    return (
                        <div className="fancy-tripple" key={index}>
                            <div className="bet-table-mobile-row d-none-desktop">
                                <div className="bet-table-mobile-team-name">
                                    <span>{item.RunnerName} {isMarketNameHaveNum ? ` - ${item.LayPrice1}` : ""}</span>
                                    <ExposureMob />
                                </div>
                            </div>
                            <div className={`bet-table-row ${isSuspendedMarker ? suspendClass : ""}`} data-title={item.Active}>
                                <div className="nation-name d-none-mobile">
                                    <p className="two-line-text">{item.RunnerName} {isMarketNameHaveNum ? ` - ${item.LayPrice1}` : ""}</p>
                                    <Exposure />
                                </div>

                                <Boxes_2 item={item} isAllBackBox={isAllBackBox} isSuspended={isSuspendedMarker} isLayFirst={isLay1st} is_1_OddBox={is_1_OddBox} bet_market_type={bet_market_type} market_odd_name={market_odd_name} />

                                {inMinMax && <div className="fancy-min-max">
                                    Min:<span>{formatNumber(sanitizeNumber(item.Min))}</span> Max:<span>{formatNumber(sanitizeNumber(item.Max))}</span>
                                </div>}
                            </div>
                        </div>
                    );
                })}
            </MarketTable>
        );
    }

    function Single_Column_Section({ title, data, min, max, sectionId, isCommonMinMax, isBookMaker = false, bet_market_type, market_odd_name, isDisplay, showUserBook = false, remark }) {
        if (!isDisplay) return null;
        const data2 = isCommonMinMax ? data?.runners : data;
        const title_ = data2?.length > 3 ? "TOURNAMENT_WINNER" : title ?? data?.market_name ?? data?.marketName;
        addSectionIfNotExist(sectionId);
        if (!data2?.length) return null;

        return (
            <MarketTable
                title={title_}
                id={sectionId}
                min={min}
                max={max}
                marketClass="market-4"
                showUserBook={showUserBook}
                remark={remark}
            >
                {data2.map((d, idx) => {
                    let exposure = getExposureByMarketId({ data: openedBetPoint, marketId: d.id, key: bet_market_type }) || getExposureByMarketId({ data: livePoints, marketId: d.id, key: bet_market_type });
                    const isSuspendedMarker = isBookMaker ? d.status !== "ACTIVE" : (d.status !== "ACTIVE" && d.status !== "OPEN");

                    return (
                        <React.Fragment key={idx}>
                            <div className="bet-table-mobile-row d-none-desktop">
                                <div className="bet-table-mobile-team-name">
                                    <span>{d.name}</span> <ExposureMob />
                                </div>
                            </div>
                            <div className={`bet-table-row ${isSuspendedMarker ? "suspendedtext" : ""}`} data-title={d.status}>
                                <div className="nation-name d-none-mobile">
                                    <p>{d.name}</p>
                                    <Exposure />
                                    <div className='mb-0 float-right d-none'>0</div>
                                </div>
                                <Boxes_6 data={d} bet_market_type={bet_market_type} market_odd_name={market_odd_name} />
                            </div>
                        </React.Fragment>
                    );
                })}
            </MarketTable>
        );
    }

    function Bookmaker({ title, data, sectionId, min, max, isSmall = false, bet_market_type, market_odd_name, isDisplay, showUserBook = false, remark }) {
        if (!isDisplay) return null;
        addSectionIfNotExist(sectionId);
        if (!data?.length) return null;

        return (
            <MarketTable
                title={title}
                id={sectionId}
                min={min}
                max={max}
                marketClass="market-2"
                showUserBook={showUserBook}
                remark={remark}
            >
                {data.map((b, idx) => {
                    const status = b.status || b.Active;
                    let isSuspendedMarker = false;
                    if (isSmall) {
                        const backPrice = b.back?.[0]?.price || 0;
                        const layPrice = b.lay?.[0]?.price || 0;
                        if ((status !== "ACTIVE" && status !== "OPEN") || (backPrice == 0 && layPrice == 0)) isSuspendedMarker = true;
                    } else {
                        if (status !== "ACTIVE" && status !== "OPEN") isSuspendedMarker = true;
                    }

                    const selectionId = b.id || b.selectionId || b.SelectionId;
                    let exposure = getExposureByMarketId({ data: openedBetPoint, marketId: selectionId, key: bet_market_type }) || getExposureByMarketId({ data: livePoints, marketId: selectionId, key: bet_market_type });

                    const item = {
                        RunnerName: b.name || b.RunnerName,
                        SelectionId: selectionId,
                        LayPrice1: b.lay?.[0]?.price,
                        LaySize1: b.lay?.[0]?.size,
                        BackPrice1: b.back?.[0]?.price,
                        BackSize1: b.back?.[0]?.size,
                        GameStatus: status,
                    };

                    return (
                        <React.Fragment key={idx}>
                            <div className="bet-table-mobile-row d-none-desktop">
                                <div className="bet-table-mobile-team-name">
                                    <span>{item.RunnerName}</span>
                                    <ExposureMob />
                                </div>
                            </div>
                            <div className={`bet-table-row ${isSuspendedMarker ? "suspendedtext" : ""}`} data-title={status}>
                                <div className="nation-name d-none-mobile">
                                    <p>{item.RunnerName}</p>
                                    <Exposure />
                                </div>
                                <Boxes_2 item={item} isAllBackBox={false} isSuspended={isSuspendedMarker} bet_market_type={bet_market_type} market_odd_name={market_odd_name} />
                            </div>
                        </React.Fragment>
                    );
                })}
            </MarketTable>
        );
    }

    function CricketMarkets({ isTied = false }) {
        const aa = isTied ? cricketMarkets.filter((market) => market.marketName === "Tied Match") : cricketMarkets.filter((market) => market.marketName !== "Tied Match");

        return aa.map((market) => {
            const key_ = market.marketName ? "marketName" : "market_name"
            const key = market.key;
            const bookmakers = marketBookmakers[key] || {};
            const market_selectionId = `market_${key}`;
            const bookmaker_selectionId = `market_${key}_bookmaker`;
            const bookmaker_tied_selectionId = `market_${key}_bookmaker_tied`;

            addSectionIfNotExist(market_selectionId);
            addSectionIfNotExist(bookmaker_selectionId);
            addSectionIfNotExist(bookmaker_tied_selectionId);

            return (
                <React.Fragment key={key}>
                    <Bookmaker
                        title={market[key_] === "Match Odds" ? "MATCH_ODDS" : capitalize_1st_letter(market[key_])}
                        isSmall={true}
                        data={market.runners}
                        sectionId={market_selectionId}
                        min={market?.minBet}
                        max={market?.maxBet}
                        bet_market_type={getTitle(market[key_])}
                        market_odd_name={getTitle(market[key_])}
                        isDisplay={true}
                    />

                    <Bookmaker
                        title="Tied Match"
                        data={bookmakers.bookmaker_tied}
                        sectionId={bookmaker_tied_selectionId}
                        bet_market_type="BOOKMAKER_TIED_ODDS"
                        market_odd_name="BOOKMAKER_TIED_ODDS"
                        isDisplay={true}
                    />

                    <Single_Column_Section
                        title="Bookmaker"
                        data={bookmakers.bookmaker}
                        sectionId={bookmaker_selectionId}
                        min={market?.min}
                        max={market?.max}
                        bet_market_type="BOOKMAKER_ODDS"
                        market_odd_name="BOOKMAKER_ODDS"
                        isBookMaker={true}
                        isSmall={true}
                        isCashout={true}
                        isDisplay={true}
                    />
                </React.Fragment>
            );
        });
    }

    const oldgameId = initialSocketData?.[0]?.oldGameId;
    const scoreCardUrl = `https://e765432.diamondcricketid.com/anm.php?type=scorecard&eventid=${oldgameId}&sportid=${selectedMatch?.SportId}`
    const tvUrl = `https://e765432.diamondcricketid.com/tvd247.php?1=1&sportid=${selectedMatch?.SportId}&gmid=${oldgameId}`

    return (
        <div className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    {/* Game Header */}
                    <div className={`game-header sport${selectedMatch?.SportId}`}>
                        <span className="game-header-name">{getHeaderName()}</span>
                        <div>
                            <span>{getHeaderDate()}</span>
                        </div>
                    </div>

                    {selectedMatch?.inPlay && !isCricket && !isLeague &&
                        <div
                            className="banner scorestats mb-1"
                            style={{ backgroundImage: `url('/admin/images/events-banner/${selectedMatch?.SportId}.png')` }}
                        >
                            <iframe src={scoreCardUrl} frameborder="0" />
                        </div>
                    }

                    <div className="market-container">
                        {socketData ? (
                            <>
                                {selectedMatch?.SportId != 4 && <CricketMarkets isTied={false} />}

                                <Single_Column_Section
                                    isDisplay={selectedMatch?.SportId == 4}
                                    sectionId="match_odds"
                                    title="MATCH_ODDS"
                                    data={match_Odds}
                                    isCommonMinMax={true}
                                    bet_market_type={getTitle(match_Odds?.marketName)}
                                    market_odd_name={getTitle(match_Odds?.marketName)}
                                    min={match_Odds?.minBet}
                                    max={match_Odds?.maxBet}
                                    showUserBook={true}
                                />

                                <Single_Column_Section
                                    isDisplay={selectedMatch?.SportId == 4 && !isLeague}
                                    sectionId="bookmaker_odds"
                                    title="Bookmaker"
                                    data={bookmaker_odds}
                                    bet_market_type="BOOKMAKER_ODDS"
                                    market_odd_name="BOOKMAKER_ODDS"
                                    min={match_Odds?.min}
                                    max={match_Odds?.max}
                                    showUserBook={true}
                                    remark={match_Odds?.remark}
                                />

                                <Bookmaker
                                    isDisplay={selectedMatch?.SportId == 4 && isLeague}
                                    sectionId="league_bookmaker_odds"
                                    title={`${leagueName} Cup Winner Bookmaker`}
                                    data={bookmaker_odds}
                                    bet_market_type="BOOKMAKER_ODDS"
                                    market_odd_name="BOOKMAKER_ODDS"
                                    min={match_Odds?.min}
                                    max={match_Odds?.max}
                                    showUserBook={true}
                                    remark={match_Odds?.remark}
                                />

                                <Bookmaker
                                    isDisplay={selectedMatch?.SportId == 4}
                                    sectionId="bookmaker_tied_odds"
                                    title="Tied Match"
                                    data={bookmaker_tied_odds}
                                    bet_market_type="BOOKMAKER_TIED_ODDS"
                                    min={match_Odds?.min_tied}
                                    max={match_Odds?.max_tied}
                                    showUserBook={true}
                                />

                                <Bookmaker
                                    title="Bookmaker 2"
                                    data={bookmakerSmall}
                                    sectionId="market6"
                                    min={bookmakerSmall?.[0]?.Min}
                                    max={bookmakerSmall?.[0]?.Max}
                                    isSmall={true}
                                    bet_market_type="BOOKMAKERSMALL_ODDS"
                                    isDisplay={true}
                                />

                                <Double_Column_Section
                                    title="Normal"
                                    sectionId="market2"
                                    data={normalData}
                                    isAllBackBox={false}
                                    bet_market_type="FANCY_ODDS"
                                    market_odd_name="FANCY_ODDS"
                                    isLayFirst={true}
                                    column={[{ type: "lay", title: "No" }, { type: "back", title: "Yes" }]}
                                />

                                <Double_Column_Section
                                    title="Over By Over"
                                    sectionId="market33"
                                    data={overByOver}
                                    // isAllBackBox={true}
                                    bet_market_type="FANCY_ODDS"
                                    market_odd_name="FANCY_ODDS"
                                    column={[{ type: "lay", title: "No" }, { type: "back", title: "Yes" }]}
                                />

                                <Double_Column_Section
                                    title="BallByBall"
                                    sectionId="market333"
                                    data={ballByBall}
                                    isAllBackBox={true}
                                    bet_market_type="FANCY_ODDS"
                                    market_odd_name="FANCY_ODDS"
                                />

                                <Double_Column_Section
                                    title="fancy1"
                                    sectionId="market3334"
                                    data={fancy1}
                                    isAllBackBox={false}
                                    bet_market_type="FANCY_ODDS"
                                    market_odd_name="FANCY_ODDS"
                                    column={[{ type: "back", title: "Back" }, { type: "lay", title: "Lay" }]}
                                />

                                <Double_Column_Section
                                    title="oddeven"
                                    sectionId="market3"
                                    data={oddEven}
                                    isAllBackBox={true}
                                    bet_market_type="FANCY_ODDS"
                                    market_odd_name="ODDEVEN_ODDS"
                                    column={[{ type: "back", title: "Odd" }, { type: "back", title: "Even" }]}
                                />

                                <Double_Column_Section
                                    title="khado"
                                    sectionId="market3333"
                                    data={khado}
                                    isAllBackBox={true}
                                    bet_market_type="KHADO_ODDS"
                                    market_odd_name="KHADO_ODDS"
                                    is_1_OddBox={true}
                                    column={[{ type: "back", title: "Back" }]}
                                    suspendClass=" "
                                    marketClass="market-10"
                                    isMarketNameHaveNum={true}
                                />

                                <Double_Column_Section
                                    title="meter"
                                    sectionId="market33333"
                                    data={meter}
                                    bet_market_type="METER_ODDS"
                                    market_odd_name="METER_ODDS"
                                    isLayFirst={true}
                                    column={[{ type: "lay", title: "No" }, { type: "back", title: "Yes" }]}
                                />

                                {selectedMatch?.SportId != 4 && <CricketMarkets isTied={true} />}

                                {cricketcasino?.map((section, idx) => (
                                    <Double_Column_Section
                                        key={idx}
                                        title={section?.[0].header}
                                        sectionId={getTitle(section?.[0].header)}
                                        data={section}
                                        bet_market_type={getTitle(section?.[0].header)}
                                        market_odd_name={getTitle(section?.[0].header)}
                                        is_1_OddBox={true}
                                        marketClass="market-9"
                                        column={[{ type: "back", title: "Back" }]}
                                        inMinMax={false}
                                    />
                                ))}

                                <Single_Column_Section
                                    isDisplay={selectedMatch?.SportId == 4}
                                    sectionId="tied_match"
                                    title={tied_match?.marketName}
                                    data={tied_match}
                                    isCommonMinMax={true}
                                    bet_market_type="TIED_MATCH"
                                    market_odd_name="TIED_MATCH"
                                    min={tied_match?.minBet}
                                    max={tied_match?.maxBet}
                                    showUserBook={true}
                                />
                            </>
                        ) : (
                            <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>Loading live data...</div>
                        )}
                    </div>
                </div>
                <EventRightSidebar tvUrl={tvUrl} liveScoreData={liveScoreData} isLive={selectedMatch?.inPlay && !isLeague} />
            </div>
        </div>
    );
};

export default EventPage;
