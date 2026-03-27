import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from 'react-router-dom';
import { formatNumber, formatToUTCMinus8, getSportName } from "../../utilies/helpers";
import { MarketTable, OddsBox } from './components/MarketComponents';
import { MyBetsSidebar } from './components/Sidebars';
import './blink.css';
import useSocket from '../../api/Socket/useSocket';

const format = (num) => Number(parseFloat(num).toFixed(2)).toString();

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

const EventPage = ({ socketData, setSocketData, initialSocketData, requestOdds }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const selectedMatchRedux = useSelector(store => store.match.selectedMatch);
    const selectedMatch = location.state?.match || selectedMatchRedux;
    const livePoints = useSelector(state => state.bet?.livePoints);
    const openedBetPoint = useSelector(state => state.bet?.openedBetPoint);

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

    const socket = useSocket("mining");
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
        if (initialSocketData) {
            setMatch_Odds(initialSocketData?.find(val => val.market_name === "Match Odds"))
        }
    }, [initialSocketData]);

    useEffect(() => {
        if (socketData) {
            setNormalData(filterRecord(socketData?.body?.session[0]?.value?.session, false));
            setFancy1(filterRecord(socketData?.body?.session1[0]?.value?.session, false));
            setOddEven(filterRecord(socketData?.body?.oddEven[0]?.value?.session));
            setOverByOver(filterRecord(socketData?.body?.overByOver[0]?.value?.session));
            setBallByBall(filterRecord(socketData?.body?.ballByBall[0]?.value?.session));
            setKhado(filterRecord(socketData?.body?.khado[0]?.value?.session, false));
            setMeter(filterRecord(socketData?.body?.meter[0]?.value?.session));
            setCricketcasino(socketData?.body?.cricketcasino[0]?.value?.session);

            const bmSession = socketData?.body?.bm1?.[0]?.value?.session;
            if (bmSession) {
                setBookmakerSmall(normalizeBookmakerSmall(bmSession));
            }

            const cricketRaw_cricket = socketData?.body?.cricket;
            let cricket_cricket = cricketRaw_cricket;
            if (cricketRaw_cricket && cricketRaw_cricket[0] && !Array.isArray(cricketRaw_cricket[0])) {
                cricket_cricket = [cricketRaw_cricket];
            }

            const matchOddsMarket = cricket_cricket?.[0]?.find(
                m => m.marketName.toLowerCase() === "match odds" || m.marketName.toLowerCase() === "match_odds"
            );

            const tiedMatchMarket = cricket_cricket?.[0]?.find(
                m => m.marketName.toLowerCase() === "tied match" || m.marketName.toLowerCase() === "tied_match"
            );

            setMatch_Odds(matchOddsMarket);
            setTied_match(tiedMatchMarket);

            setBookmaker_odds(matchOddsMarket?.bookmaker || []);
            setBookmaker_tied_odds(matchOddsMarket?.bookmaker_tied || []);

            const cricketRaw = socketData?.body?.cricket;
            if (!cricketRaw) return;

            const cricket = Array.isArray(cricketRaw[0]) ? cricketRaw : [cricketRaw];
            let allMarkets = [];
            let allBookmakers = {};

            cricket.forEach((marketGroup, groupIndex) => {
                marketGroup.forEach(market => {
                    const marketNameKey = market.marketName.toLowerCase().replace(/\s+/g, "_");
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

            setCricketMarkets(allMarkets);
            setMarketBookmakers(allBookmakers);
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
            return formatToUTCMinus8(selectedMatch.matchdate);
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


    function Boxes_2({ item, isAllBackBox, isSuspended, isLayFirst, is_1_OddBox = false }) {
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

    function Boxes_6({ data }) {
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
                <OddsBox type="back" level="2" odds={formatNumber(sanitizeNumber(back[2]?.price))} size={formatNumber(sanitizeNumber(back[2]?.size))} animateColor={back_color[2]} />
                <OddsBox type="back" level="1" odds={formatNumber(sanitizeNumber(back[1]?.price))} size={formatNumber(sanitizeNumber(back[1]?.size))} animateColor={back_color[1]} />
                <OddsBox type="back" odds={formatNumber(sanitizeNumber(back[0]?.price))} size={formatNumber(sanitizeNumber(back[0]?.size))} animateColor={back_color[0]} />
                <OddsBox type="lay" odds={formatNumber(sanitizeNumber(lay[0]?.price))} size={formatNumber(sanitizeNumber(lay[0]?.size))} animateColor={lay_color[0]} />
                <OddsBox type="lay" level="1" odds={formatNumber(sanitizeNumber(lay[1]?.price))} size={formatNumber(sanitizeNumber(lay[1]?.size))} animateColor={lay_color[1]} />
                <OddsBox type="lay" level="2" odds={formatNumber(sanitizeNumber(lay[2]?.price))} size={formatNumber(sanitizeNumber(lay[2]?.size))} animateColor={lay_color[2]} />
            </>
        );
    }

    function Double_Column_Section({ title, sectionId, data, isAllBackBox, bet_market_type, isLayFirst, is_1_OddBox, min, max, marketClass = "market-6" }) {
        addSectionIfNotExist(sectionId);
        if (!data?.length) return null;

        return (
            <MarketTable
                title={title}
                id={sectionId}
                min={min}
                max={max}
                marketClass={marketClass}
                isLayFirst={isLayFirst}
                columnHeader_1={{ type: "back", title: isAllBackBox ? "Odd" : "Back" }}
                columnHeader_2={is_1_OddBox ? null : { type: isAllBackBox ? "back" : "lay", title: isAllBackBox ? "Even" : "Lay" }}
            >
                {data.map((item, index) => {
                    let exposure = getExposureByMarketId({ data: openedBetPoint, marketId: item.marketId, key: bet_market_type }) || getExposureByMarketId({ data: livePoints, marketId: item.marketId, key: bet_market_type });
                    const isSuspendedMarker = item.Active !== "";

                    return (
                        <div className="fancy-tripple" key={index}>
                            <div className="bet-table-mobile-row d-none-desktop">
                                <div className="bet-table-mobile-team-name">
                                    <span>{item.RunnerName}</span>
                                </div>
                            </div>
                            <div className="bet-table-row">
                                <div className="nation-name d-none-mobile">
                                    <p className="two-line-text">{item.RunnerName}</p>
                                    <p className="mb-0" style={{ color: "rgb(153, 153, 153)" }}>0</p>
                                    <div style={getExposureCss(exposure)}>{exposure}</div>
                                </div>
                                {isSuspendedMarker ? (
                                    <div data-title={item.Active} className="suspendedtext2">
                                        <Boxes_2 item={item} isAllBackBox={isAllBackBox} isSuspended={true} isLayFirst={isLayFirst} is_1_OddBox={is_1_OddBox} />
                                    </div>
                                ) : (
                                    <Boxes_2 item={item} isAllBackBox={isAllBackBox} isSuspended={false} isLayFirst={isLayFirst} is_1_OddBox={is_1_OddBox} />
                                )}
                                <div className="fancy-min-max">
                                    Min:<span>{formatNumber(sanitizeNumber(item.Min))}</span> Max:<span>{formatNumber(sanitizeNumber(item.Max))}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </MarketTable>
        );
    }

    function Single_Column_Section({ title, data, min, max, sectionId, isCommonMinMax, isBookMaker = false, bet_market_type, isDisplay }) {
        if (!isDisplay) return null;
        const data2 = isCommonMinMax ? data?.runners : data;
        const title_ = data2?.length > 3 ? "TOURNAMENT_WINNER" : title;
        addSectionIfNotExist(sectionId);
        if (!data2?.length) return null;

        return (
            <MarketTable
                title={title_}
                id={sectionId}
                min={min}
                max={max}
                marketClass="market-4"
                columnHeader_1={{ type: "back", title: "Back" }}
                columnHeader_2={{ type: "lay", title: "Lay" }}
            >
                {data2.map((d, idx) => {
                    let exposure = getExposureByMarketId({ data: openedBetPoint, marketId: d.id, key: bet_market_type }) || getExposureByMarketId({ data: livePoints, marketId: d.id, key: bet_market_type });
                    const isSuspendedMarker = isBookMaker ? d.status !== "ACTIVE" : (d.status !== "ACTIVE" && d.status !== "OPEN");

                    return (
                        <React.Fragment key={idx}>
                            <div className="bet-table-mobile-row d-none-desktop">
                                <div className="bet-table-mobile-team-name">
                                    <span>{d.name}</span> <span style={getExposureCss(exposure)}>{exposure}</span>
                                </div>
                            </div>
                            <div className="bet-table-row">
                                <div className="nation-name d-none-mobile">
                                    <p>{d.name}</p>
                                    <p className="mb-0" style={{ color: "rgb(153, 153, 153)" }}>0</p>
                                    <div style={getExposureCss(exposure)}>{exposure}</div>
                                </div>
                                {isSuspendedMarker ? (
                                    <div data-title={d.status} className="suspendedtext2 w-100">
                                        <Boxes_6 data={d} />
                                    </div>
                                ) : (
                                    <Boxes_6 data={d} />
                                )}
                            </div>
                        </React.Fragment>
                    );
                })}
            </MarketTable>
        );
    }

    function Bookmaker({ title, data, sectionId, min, max, isSmall = false, bet_market_type, isDisplay }) {
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
                columnHeader_1={{ type: "back", title: "Back" }}
                columnHeader_2={{ type: "lay", title: "Lay" }}
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
                                    <span style={getExposureCss(exposure)}>{exposure}</span>
                                </div>
                            </div>
                            <div className="bet-table-row">
                                <div className="nation-name d-none-mobile">
                                    <p>{item.RunnerName}</p>
                                    <p className="mb-0" style={{ color: "rgb(153, 153, 153)" }}>0</p>
                                    <div style={getExposureCss(exposure)}>{exposure}</div>
                                </div>
                                {isSuspendedMarker ? (
                                    <div data-title={status} className="suspendedtext2 w-100">
                                        <Boxes_2 item={item} isAllBackBox={false} isSuspended={true} />
                                    </div>
                                ) : (
                                    <Boxes_2 item={item} isAllBackBox={false} isSuspended={false} />
                                )}
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
            const key = market.key;
            const bookmakers = marketBookmakers[key] || {};
            const market_selectionId = `market_${key}`;
            const bookmaker_selectionId = `market_${key}_bookmaker`;
            const bookmaker_tied_selectionId = `market_${key}_bookmaker_tied`;

            return (
                <React.Fragment key={key}>
                    {selectedMatch?.SportId != 4 ? (
                        <Bookmaker title={market.marketName} data={market.runners} sectionId={market_selectionId} min={market?.min} max={market?.max} bet_market_type={getTitle(market.marketName)} isDisplay={true} />
                    ) : (
                        <Single_Column_Section sectionId={market_selectionId} title={market.marketName} data={market} isCommonMinMax={true} bet_market_type={getTitle(market.marketName)} min={market?.minBet} max={market?.maxBet} isDisplay={true} />
                    )}

                    {selectedMatch?.SportId != 4 ? (
                        <Bookmaker title="Tied Match" data={bookmakers.bookmaker_tied} sectionId={bookmaker_tied_selectionId} bet_market_type="BOOKMAKER_TIED_ODDS" isDisplay={true} />
                    ) : (
                        <Single_Column_Section sectionId={bookmaker_tied_selectionId} title="Tied Match" data={bookmakers.bookmaker_tied} isBookMaker={true} bet_market_type="BOOKMAKER_TIED_ODDS" min={market?.min_tied} max={market?.max_tied} isDisplay={true} />
                    )}

                    <Single_Column_Section title="Bookmaker" data={bookmakers.bookmaker} sectionId={bookmaker_selectionId} min={market?.min} max={market?.max} bet_market_type="BOOKMAKER_ODDS" isBookMaker={true} isDisplay={true} />
                </React.Fragment>
            );
        });
    }

    return (
        <div className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    {/* Game Header */}
                    <div className="game-header sport4">
                        <span className="game-header-name">{getHeaderName()}</span>
                        <div>
                            <span>{getHeaderDate()}</span>
                        </div>
                    </div>

                    <div className="market-container">
                        {socketData ? (
                            <>
                                {selectedMatch?.SportId != 4 && <CricketMarkets isTied={false} />}

                                <Single_Column_Section isDisplay={selectedMatch?.SportId == 4} sectionId="match_odds" title={match_Odds?.marketName} data={match_Odds} isCommonMinMax={true} bet_market_type={getTitle(match_Odds?.marketName)} min={match_Odds?.minBet} max={match_Odds?.maxBet} />

                                <Single_Column_Section isDisplay={selectedMatch?.SportId == 4} sectionId="bookmaker_odds" title="Bookmaker" data={bookmaker_odds} bet_market_type="BOOKMAKER_ODDS" min={match_Odds?.min} max={match_Odds?.max} />

                                <Bookmaker isDisplay={selectedMatch?.SportId == 4} sectionId="bookmaker_tied_odds" title="Tied Match" data={bookmaker_tied_odds} bet_market_type="BOOKMAKER_TIED_ODDS" min={match_Odds?.min_tied} max={match_Odds?.max_tied} />

                                <Bookmaker title="Bookmaker 2" data={bookmakerSmall} sectionId="market6" min={bookmakerSmall?.[0]?.Min} max={bookmakerSmall?.[0]?.Max} isSmall={true} bet_market_type="BOOKMAKERSMALL_ODDS" isDisplay={true} />

                                <Double_Column_Section title="Normal" sectionId="market2" data={normalData} isAllBackBox={false} bet_market_type="FANCY_ODDS" isLayFirst={true} />

                                <Double_Column_Section title="Oddeven" sectionId="market3" data={oddEven} isAllBackBox={true} bet_market_type="FANCY_ODDS" />

                                <Double_Column_Section title="OverByOver" sectionId="market33" data={overByOver} isAllBackBox={true} bet_market_type="FANCY_ODDS" />

                                <Double_Column_Section title="BallByBall" sectionId="market333" data={ballByBall} isAllBackBox={true} bet_market_type="FANCY_ODDS" />

                                <Double_Column_Section title="Fancy1" sectionId="market3334" data={fancy1} isAllBackBox={false} bet_market_type="FANCY_ODDS" />

                                <Double_Column_Section title="Khado" sectionId="market3333" data={khado} isAllBackBox={true} bet_market_type="KHADO_ODDS" is_1_OddBox={true} />

                                <Double_Column_Section title="Meter" sectionId="market33333" data={meter} bet_market_type="METER_ODDS" isLayFirst={true} />

                                {selectedMatch?.SportId != 4 && <CricketMarkets isTied={true} />}

                                {cricketcasino?.map((section, idx) => (
                                    <Double_Column_Section key={idx} title={section?.[0].header} sectionId={getTitle(section?.[0].header)} data={section} bet_market_type={getTitle(section?.[0].header)} is_1_OddBox={true} marketClass="market-9" />
                                ))}

                                <Single_Column_Section isDisplay={selectedMatch?.SportId == 4} sectionId="tied_match" title={tied_match?.marketName} data={tied_match} isCommonMinMax={true} bet_market_type="TIED_MATCH" min={tied_match?.minBet} max={tied_match?.maxBet} />
                            </>
                        ) : (
                            <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>Loading live data...</div>
                        )}
                    </div>
                </div>
                <MyBetsSidebar />
            </div>
        </div>
    );
};

export default EventPage;
