import React, { useState, useEffect, useRef } from "react";
import "./kk.css"
import useIsMobile from "../../hooks/useIsMobile";
import { io } from "socket.io-client";
import CasinoVideo from "./components/CasinoVideo";
import { formatNumber } from "../../utilies/helpers";
import { sanitizeNumber } from "../SportsCenterContainer";
import { fetchCasinoExposureApi } from "../../api/api";
import Collapse from "react-bootstrap/Collapse";
import { useLocation } from "react-router-dom";
import { useGetFileData } from "../../hooks/useGetFileData";


const getCardImage = (cardCode) => {
    if (!cardCode || cardCode === "1")
        return "/assets/cards_new/1.png";
    return `/assets/cards_new/${cardCode}.png`;
};

const getBallImage = (ballCode) => {
    if (!ballCode || ballCode === "1")
        return "https://wver.sprintstaticdata.com/v194/static/front/img/superOver/balls/A.png";
    if (ballCode === "0")
        return "https://wver.sprintstaticdata.com/v194/static/front/img/superOver/balls/10.png";
    if (ballCode === "W")
        return "https://wver.sprintstaticdata.com/v194/static/front/img/superOver/balls/wicket.png";
    return `https://wver.sprintstaticdata.com/v194/static/front/img/superOver/balls/${ballCode}.png`;
};

const Superover = ({ isVisible, lastBetTime, onBetSelection }) => {
    const { CODE, game_type, phpFile, placeBetApi, matchName, iframe_url } = useGetFileData();
    const is2 = game_type === "superover2";
    const isCricket5 = CODE === "FIVE_5_CRICKET";

    const isTab = useIsMobile(991);
    const isMobile = useIsMobile();
    const isMinMaxBreak = useIsMobile(416);
    const [gameData, setGameData] = useState(null);
    const [liveScoreData, setLiveScoreData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(false);
    const socketRef = useRef(null);
    const [exposureData, setExposureData] = useState([]);
    const prevSocketData = useRef([]);

    const [openSections, setOpenSections] = useState({ market6: true, market1: true, market2: true, market3: true });

    const team_1 = gameData?.t2?.[0]?.nat;
    const team_2 = gameData?.t2?.[1]?.nat;

    useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.[0]?.mid) return;
            try {
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
        if (!Array.isArray(exposureData)) return null;
        const market = exposureData.find((item) => item.market_id == marketId);
        return market ? market.win_loss || market.total_exposure : null;
    };

    const renderExposure = (marketId) => {
        const exposure = getExposure(marketId);
        if (exposure === null || exposure === undefined) return null;
        return (
            <span style={{ marginLeft: "5px", color: exposure > 0 ? "green" : exposure < 0 ? "red" : "" }}>
                {exposure}
            </span>
        );
    };

    const toggleSection = (section) => {
        // console.log('!openSections[', section, ']', !openSections[section]);
        setOpenSections((prevState) => ({
            ...prevState,
            [section]: !prevState[section],
        }));
    };

    function Header({ title, sectionId, min, max, isCashout }) {
        return (
            <div
                onClick={() => toggleSection(sectionId)}
                aria-expanded={openSections[sectionId]}
                className="bet-table-header"
            >
                <div className="nation-name">
                    <span title={title}>
                        <a onClick={(e) => e.preventDefault()} title="">
                            <img
                                src="/assets/images/arrow-down.svg"
                                className="mr-1"
                                style={{ transform: openSections[sectionId] ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            />
                        </a>
                        {title}
                    </span>
                    {isCashout &&
                        <button
                            disabled="disabled"
                            className="btn btn-success btn-sm"
                        >
                            Cashout
                        </button>}
                    {max && min && <MinMax min={min} max={max} none_class={"d-none-desktop"} />}
                </div>
            </div>
        )
    }

    function MinMax({ min, max, none_class }) {
        const m_in = formatNumber(sanitizeNumber(min))
        const m_ax = formatNumber(sanitizeNumber(max))
        return (
            <>
                <span className={`${none_class ? none_class : ''}`} style={{ color: '#eee', lineHeight: '0px', fontWeight: 'bold' }}>
                    {m_in && <>Min:<span style={{ marginRight: '6px' }}>{formatNumber(m_in)}</span></>}
                    {m_ax && <>Max:<span>{formatNumber(m_ax)}</span></>}
                </span>
            </>
        )
    }

    function BoxContent({ price, size, animateColor, isSuspended }) {
        const safePrice = sanitizeNumber(price);
        const safeSize = sanitizeNumber(size);

        // const animateColor2 = "red";
        // console.log("animateColor", animateColor);

        return (
            <>
                {animateColor && (<span className={`flash-overlay ${animateColor}`} />)}

                {safePrice ? (
                    <>
                        <span className="d-block odds" style={{ color: "black" }}>
                            {formatNumber(safePrice)}
                        </span>
                        <span className="d-block">
                            {formatNumber(safeSize)}
                        </span>
                    </>
                ) : (
                    <span
                        className="d-block odds no-val"
                        style={{ color: "var(--text-table)" }} // #aaafb5
                    >
                        {isSuspended ? "" : "—"}
                    </span>
                )}
            </>
        );
    }

    const handleOddsClick = (marketTitle, marketName_, odds, market, isBack, ss, isBookmaker) => {
        if (!market || !odds) return;
        // console.log('market', odds);
        // console.log('marketTitle', marketTitle);
        const isFancy = marketTitle === "Fancy";
        const marketName = isFancy ? `${marketName_} - ${ss}` : marketName_;

        if (onBetSelection) {
            onBetSelection({
                teamName: marketName,
                marketTitle: marketTitle === "Tie" ? "Fancy1" : marketTitle,
                odds: odds,
                minBet: market?.min || 100,
                maxBet: market?.max || 300000,
                isBack,
                marketId: market.sid,
                eventId: currentGame?.mid,
                isBottomShown: Boolean(isBookmaker),
                team_1: team_1,
                team_2: team_2,
                game_name: currentGame?.ename,
            });
        }
    };

    function Boxes_2({ isAllBackBox, item, title, bet_market_type, market_odd_name, isSuspended, isLayFirst, marketTitle, isBookmaker }) {
        // blink color logic
        let back_color = false;
        let lay_color = false;

        if (prevSocketData.current) {
            const idx = prevSocketData.current.findIndex(
                val => val.sid === item.sid
            );

            if (idx !== -1) {
                const prevData = prevSocketData.current[idx];

                const currB1 = Number(item.b1);
                const prevB1 = Number(prevData.b1);
                const currL1 = Number(item.l1);
                const prevL1 = Number(prevData.l1);

                if (currB1 > prevB1) back_color = "green";
                else if (currB1 < prevB1) back_color = "red";

                if (currL1 > prevL1) lay_color = "green";
                else if (currL1 < prevL1) lay_color = "red";

                prevSocketData.current[idx] = { ...item };

                // console.log('item.b1', item.b1)
                // console.log('prevData.b1', prevData.b1)
                // console.log('back_color', back_color);
            } else {
                prevSocketData.current.push({ ...item });
            }
        }

        function Back() {
            return (
                <div
                    className="bl-box back"
                    style={{ width: isSuspended && isMobile && "49%" }}
                    onClick={() => handleOddsClick(marketTitle, item.nat, item.b1, item, true, item.bs1, isBookmaker)}
                >
                    <BoxContent
                        price={item.b1}
                        size={item.bs1}
                        // animateColor={back_color}
                        isSuspended={isSuspended}
                    />
                </div>
            )
        }

        function Lay() {
            return (
                <div
                    className={`bl-box ${isAllBackBox ? "back" : "lay"} no-val`}
                    style={{ width: isSuspended && isMobile && "49%" }}
                    onClick={() => handleOddsClick(marketTitle, item.nat, item.l1, item, false, item.ls1, isBookmaker)}
                >
                    <BoxContent
                        price={item.l1}
                        size={item.ls1}
                        // animateColor={lay_color}
                        isSuspended={isSuspended}
                    />
                </div>
            )
        }

        return (
            <>
                {isLayFirst
                    ? <>
                        <Lay />
                        <Back />
                    </>
                    : <>
                        <Back />
                        <Lay />
                    </>}
            </>
        )
    }

    function ColumnName({ isAllBackBox }) {
        if (isAllBackBox) {
            return (<>
                <div className="back bl-title back-title">Odd</div>
                <div className="back bl-title back-title">Even</div>
            </>)
        } else {
            return (<>
                <div className="back bl-title back-title">Back</div>
                <div className="lay bl-title lay-title">Lay</div>
            </>)
        }
    }

    function Double_Column_Section({ title, sectionId, data, isAllBackBox, bet_market_type, market_odd_name, isLayFirst }) {
        const isFancy = title === "Fancy";
        // console.log("## ", title, 'data', data);
        if (data?.length) {
            return (
                <div className="market-6" id={`goto-${sectionId}`}>
                    <div className="bet-table">

                        <Header
                            isCashout={false}
                            title={title}
                            sectionId={sectionId}
                        />

                        {/* <div data-title="SUSPENDED" className="bet-table-row suspendedtext"> */}
                        <Collapse in={openSections[sectionId]}>
                            <div id="market33" data-title="OPEN" className="bet-table-body container-fluid container-fluid-5">
                                <div className="row row5 d-none-mobile">
                                    <div className="col-12 col-md-6 ">
                                        <div className="fancy-tripple">
                                            <div className="bet-table-row">
                                                <div className="nation-name"></div>
                                                <ColumnName isAllBackBox={isAllBackBox} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row row5">
                                    {data?.map((item, index) => {
                                        const status = item.status;

                                        let isSuspended = false;
                                        if (status !== "ACTIVE" && status !== "OPEN") {
                                            isSuspended = true;
                                        }


                                        return (
                                            <div className="col-12 col-md-6 " key={index}>
                                                <div className="fancy-tripple">

                                                    {/* Mobile Row */}
                                                    <div className="bet-table-mobile-row d-none-desktop">
                                                        <div className="bet-table-mobile-team-name">
                                                            <span>{item.nat}</span>
                                                            <span></span>
                                                        </div>
                                                    </div>

                                                    {/* Main Row */}
                                                    {/* <div data-title="" className="bet-table-row"> */}
                                                    <div
                                                        // data-title={isSuspended ? statusLabel : ""}
                                                        // className={`bet-table-row ${isSuspended ? "suspendedtext2" : ""}`}
                                                        className={`bet-table-row`}
                                                    >
                                                        <div className="nation-name d-none-mobile">
                                                            <div className="two-line-text">
                                                                {item.nat}-{item.sid}
                                                                {/* <div style={{ marginLeft: '7px' }}>{renderExposure(item.sid)}</div> */}
                                                                {renderExposure(item.sid)}
                                                            </div>
                                                            {/* <div
                                                                className="mb-0"
                                                            // style={{ ...getExposureCss(exposure) }}
                                                            >
                                                            </div> */}
                                                        </div>

                                                        {isSuspended ? (
                                                            <div data-title={status} className="suspendedtext2">
                                                                <Boxes_2
                                                                    item={item}
                                                                    isAllBackBox={isAllBackBox}
                                                                    title={title}
                                                                    bet_market_type={bet_market_type}
                                                                    market_odd_name={market_odd_name}
                                                                    isSuspended={isSuspended}
                                                                    isLayFirst={isLayFirst}
                                                                    marketTitle={title}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <Boxes_2
                                                                item={item}
                                                                isAllBackBox={isAllBackBox}
                                                                title={title}
                                                                bet_market_type={bet_market_type}
                                                                market_odd_name={market_odd_name}
                                                                isSuspended={isSuspended}
                                                                isLayFirst={isLayFirst}
                                                                marketTitle={title}
                                                            />
                                                        )}

                                                        {/* Min Max */}
                                                        <div
                                                            className="fancy-min-max"
                                                            style={{
                                                                position: 'relative',
                                                                marginLeft: 'auto',
                                                                // minWidth: isFancy ? '95px' : ''
                                                                minWidth: isMinMaxBreak ? '95px' : 'fit-content',
                                                            }}
                                                        >
                                                            <span
                                                                className="mobile-point2 d-none-desktop"
                                                            //  style={{ ...getExposureCss(exposure) }}
                                                            >   {renderExposure(item.sid)}
                                                            </span>
                                                            Min:<span>{formatNumber(sanitizeNumber(item.min))}</span> Max:<span>{formatNumber(sanitizeNumber(item.max))}</span>
                                                        </div>
                                                    </div>
                                                    {/* <div className="remark">{item.Remark}</div> */}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </Collapse>
                    </div>
                </div>
            )
        } else {
            return <></>;
        }
    }

    function Bookmaker({ title, data, sectionId, min, max, market_odd_name, bet_market_type }) {
        if (data?.length) {
            return (
                <div className="market-2" id={`goto-${sectionId}`}>
                    <div className="bet-table">
                        <Header
                            min={min}
                            max={max}
                            title={title}
                            sectionId={sectionId}
                        />
                        <Collapse in={openSections[sectionId]}>
                            <div
                                id={sectionId}
                                data-title="OPEN"
                                className="bet-table-body"
                            >
                                <div className="bet-table-row d-none-mobile">
                                    <div className="nation-name">
                                        <MinMax
                                            min={min}
                                            max={max}
                                        />
                                    </div>
                                    <div className="back bl-title back-title">Back</div>
                                    <div className="lay bl-title lay-title">Lay</div>
                                </div>

                                {data?.map((b, idx) => {
                                    const status = b.status;

                                    let isSuspended = false;
                                    if (status !== "ACTIVE" && status !== "OPEN") {
                                        isSuspended = true;
                                    }

                                    return (
                                        <React.Fragment key={idx}>
                                            {/* Mobile Row */}
                                            <div className="bet-table-mobile-row d-none-desktop">
                                                <div className="bet-table-mobile-team-name">
                                                    <span>{b.nat}</span> <span>{renderExposure(b.sid)}</span>
                                                </div>
                                            </div>

                                            {/* Main Row */}
                                            <div
                                                // data-title={status}
                                                // className={`bet-table-row ${isSuspended ? "suspendedtext w-100" : ""}`}
                                                className={`bet-table-row`}
                                            >
                                                <div className="nation-name d-none-mobile">
                                                    <p>
                                                        <span>{b.nat}</span>
                                                        <span className="float-right"></span>
                                                    </p>
                                                    <div
                                                        className="mb-0 point2"
                                                    // style={{ ...getExposureCss(exposure) }}
                                                    >{renderExposure(b.sid)}</div>
                                                </div>

                                                {isSuspended ? (
                                                    <div data-title={status} className="suspendedtext2" style={{ width: isMobile ? '100%' : '' }}>
                                                        <Boxes_2
                                                            title={title}
                                                            isAllBackBox={false}
                                                            // item={{
                                                            //     nat: b.nat,
                                                            //     sid: b.sid,
                                                            //     l1: b.l1,
                                                            //     ls1: b.ls1,
                                                            //     b1: b.b1,
                                                            //     bs1: b.bs1,
                                                            //     status: status,
                                                            // }}
                                                            item={b}
                                                            bet_market_type={bet_market_type}
                                                            market_odd_name={market_odd_name}
                                                            isSuspended={isSuspended}
                                                            marketTitle={title}
                                                            isBookmaker={true}
                                                        />
                                                    </div>
                                                ) : (
                                                    <Boxes_2
                                                        title={title}
                                                        isAllBackBox={false}
                                                        // item={{
                                                        //     nat: b.nat,
                                                        //     sid: b.sid,
                                                        //     l1: b.l1,
                                                        //     ls1: b.ls1,
                                                        //     b1: b.b1,
                                                        //     bs1: b.bs1,
                                                        //     status: status,
                                                        // }}
                                                        item={b}
                                                        bet_market_type={bet_market_type}
                                                        market_odd_name={market_odd_name}
                                                        isSuspended={isSuspended}
                                                        marketTitle={title}
                                                        isBookmaker={true}
                                                    />
                                                )}
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </Collapse>
                    </div>
                </div>
            )
        }
    }


    useEffect(() => {
        const socket = io("https://trubet9.bet:2053", {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        const handleGameData = (data) => {
            const payload = Array.isArray(data) ? data[0] : data;
            if (payload) {
                setGameData(payload);
            }
        };

        const handleLiveScoreData = (data) => {
            if (data?.data) {
                setLiveScoreData(data.data);
            }
        };

        socket.on("connect", () => {
            console.log("✅ Superover Connected:", socket.id);
            socket.emit("Room", game_type);
        });

        socket.on("game", handleGameData);
        socket.on(game_type, handleGameData);
        socket.on("liveScoreGameIn", handleLiveScoreData);

        socket.on("disconnect", (reason) => {
            console.log("⚠️ Superover Disconnected:", reason);
            if (reason === "io server disconnect") socket.connect();
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const currentGame = gameData?.t1?.[0];
    let cards = [];
    if (currentGame) {
        const { C1, C2, C3, C4, C5, C6 } = currentGame;
        cards = [C1, C2, C3, C4, C5, C6];
    }

    const balls = liveScoreData?.balls || ["", "", "", ""];

    function VideoCards() {
        if (isCricket5) {
            return (
                <>
                    {cards.map((card, i) => (
                        <div key={i}>
                            <span>
                                <img
                                    style={{ width: !isMobile ? "30px" : "" }}
                                    src={getCardImage(card)}
                                    alt={card}
                                />
                            </span>
                        </div>
                    ))}
                </>
            );
        }


        return (
            <>
                {balls.map((ball, idx) => (
                    <div key={idx}>
                        <span>
                            {ball ? (<img src={getBallImage(ball)} alt={`ball-${idx}`} />) : null}
                        </span>
                    </div>
                ))}
            </>
        );
    }


    function getColor(_ball) {
        const ball = String(_ball).toLocaleLowerCase();
        if (ball === "w" || ball === "ww") {
            if (isCricket5) return "red";
            else return "white";
        }
        if (ball === "4") return "yellow";
        if (ball === "6") return "green";
        return "";
    }

    function ScoreCard() {
        const aa = liveScoreData?.balls || [];
        const balls = aa.filter(ball => ball != "");

        return (
            <div className="scorecard-row mt-1">
                <div className="scorecard-box-left">
                    <div>{liveScoreData?.spnmessage}</div>
                </div>

                <div className="scorecard-box-left">
                    {/* <div className="score-runs">
                        <div className="ball">4</div>
                        <div className="ball">5</div>
                        <div className="ball">6</div>
                    </div> */}
                </div>

                <div className="scorecard-box-right">
                    <div className="score-runs">
                        {balls.map((ball, idx) => <div className="ball" key={idx} style={{ color: getColor(ball) }}>{ball}</div>)}
                    </div>
                </div>
            </div>
        )
    }

    const score1_total = liveScoreData?.score1?.split(" ")[0] || "0-0";
    const score1_over = liveScoreData?.score1?.split(" ")[1] || "(0.0)";
    const score2_total = liveScoreData?.score2?.split(" ")[0] || "0-0";
    const score2_over = liveScoreData?.score2?.split(" ")[1] || "(0.0)";

    const runRate = liveScoreData?.spnrunrate1 || liveScoreData?.spnrunrate2 || "0.00";
    const reqRunRate = liveScoreData?.spnreqrate1 || liveScoreData?.spnreqrate2 || "";
    // console.log('$$ runRate', runRate);

    const tie_data = gameData?.t4?.filter(val => val.nat === "Tie");
    const fancy1_data = gameData?.t4?.filter(val => val.nat !== "Tie");

    return (
        <>
            <div
                className={`casino-table detail-page-container super-over kk 
                ${isCricket5 ? "five-cricket-casino" : ""}`}
                style={{ width: isMobile ? '100vw' : 'auto' }}
            >
                <div className="game-header sport4">
                    <span className="game-header-name">{currentGame?.ename}</span>
                    <span className="game-header-date">Round ID: {currentGame?.mid || "Loading..."}</span>
                </div>

                {/* <div class="game-header sport4">
                    <span class="game-header-name">Mini SuperOver</span>
                    <span class="game-header-date">Round ID: 7926259040</span>
                </div> */}



                <div className="container-fluid container-fluid-5">
                    <div className="row row5">

                        {!is2 &&
                            <div className="col-12 col-lg-2 banner d-flex align-items-center p-0" >
                                {/* MOBILE SCORECARD */}
                                {isTab && <div className="scorecard scorecard-new d-none-desktop mt-1 mb-1">
                                    <div className="scorecard-row">
                                        <div className="scorecard-box-left">
                                            <div className="team team1">
                                                <div className="team-img">
                                                    {reqRunRate
                                                        ? <img src="/assets/images/ball-icon.png" alt="ball" />
                                                        : <img src="/assets/images/bat-icon.png" alt="bat" />}
                                                </div>
                                                <div className="team-score">
                                                    <span className="score">
                                                        <span className="score-total">{score1_total}</span>
                                                        <span className="score-overs">{score1_over}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="scorecard-box-right">
                                            <div className="team team2">
                                                <div className="team-score">
                                                    <span className="score">
                                                        <span className="score-total">{score2_total}</span>
                                                        <span className="score-overs">{score2_over}</span>
                                                    </span>
                                                </div>
                                                <div className="team-img">
                                                    {reqRunRate
                                                        ? <img src="/assets/images/bat-icon.png" alt="bat" />
                                                        : <img src="/assets/images/ball-icon.png" alt="ball" />
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="scorecard-row team-name-row">
                                        <div className="team-name">{liveScoreData?.spnnation1 || team_1}</div>
                                        <div className="team-rr">
                                            <span>CRR {runRate}</span>
                                            {reqRunRate ? <span style={{ marginLeft: "6px" }}>RR {reqRunRate}</span> : null}
                                        </div>
                                        <div className="team-name">{liveScoreData?.spnnation2 || team_2}</div>
                                    </div>

                                    <ScoreCard />
                                </div>}

                                {/* DESKTOP SCORECARD */}
                                {!isTab && <div className="scorecard scorecard-new d-none d-md-block">
                                    <div className="scorecard-row">
                                        <div className="scorecard-box-left">
                                            <div className="team team1">
                                                <div className="team-img">
                                                    {reqRunRate
                                                        ? <img src="/assets/images/ball-icon.png" alt="ball" />
                                                        : <img src="/assets/images/bat-icon.png" alt="bat" />
                                                    }
                                                </div>
                                                <div className="team-score">
                                                    <span className="score">
                                                        <span className="score-total">{score1_total}</span>
                                                        <span className="score-overs">{score1_over}</span>
                                                    </span>
                                                    <div className="team-name">{liveScoreData?.spnnation1 || "IND"}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="team-rr">
                                            <span>CRR {runRate}</span>
                                        </div>

                                        {reqRunRate &&
                                            <div className="team-rr">
                                                <span>RR {reqRunRate}</span>
                                            </div>}

                                        <div className="scorecard-box-left">
                                            <div className="team team1">
                                                <div className="team-img">
                                                    {reqRunRate
                                                        ? <img src="/assets/images/bat-icon.png" alt="bat" />
                                                        : <img src="/assets/images/ball-icon.png" alt="ball" />
                                                    }
                                                </div>
                                                <div className="team-score">
                                                    <span className="score">
                                                        <span className="score-total">{score2_total}</span>
                                                        <span className="score-overs">{score2_over}</span>
                                                    </span>
                                                    <div className="team-name">{liveScoreData?.spnnation2 || "AUS"}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <ScoreCard />
                                </div>}
                            </div>}

                        {/* VIDEO SECTION */}
                        <div className="col-lg-10 col-12">
                            <CasinoVideo
                                gameName={currentGame?.ename.split(" ").slice(-2).join(" ")}
                                videoSrc={iframe_url}
                                isCardDrawerOpen={isCardDrawerOpen}
                                setIsCardDrawerOpen={setIsCardDrawerOpen}
                                autotime={currentGame?.autotime}
                                totalTime={currentGame?.ft} CardsComponent={is2 ? null : VideoCards}
                                cards={isCricket5 ? cards : balls}
                            />
                        </div>
                    </div>
                </div>

                <Bookmaker
                    title={"Bookmaker"}
                    data={gameData?.t2}
                    sectionId="market6"
                    min={gameData?.t1?.[0]?.min}
                    max={gameData?.t1?.[0]?.max}
                    bet_market_type="BOOKMAKERSMALL_ODDS"
                    market_odd_name="BOOKMAKERSMALL_ODDS"
                />

                <Double_Column_Section
                    title={"Fancy"}
                    sectionId="market1"
                    data={gameData?.t3}
                    isAllBackBox={false}
                    bet_market_type="FANCY_ODDS"
                    market_odd_name="FANCY_ODDS"
                    isLayFirst={true}
                />

                <Double_Column_Section
                    title={"Tie"}
                    sectionId="market2"
                    data={tie_data}
                    isAllBackBox={false}
                    bet_market_type="FANCY_ODDS"
                    market_odd_name="FANCY_ODDS"
                />

                <Double_Column_Section
                    title={"Fancy1"}
                    sectionId="market3"
                    data={fancy1_data}
                    isAllBackBox={false}
                    bet_market_type="FANCY_ODDS"
                    market_odd_name="FANCY_ODDS"
                />
            </div>
        </>

    );
};

export default Superover;
