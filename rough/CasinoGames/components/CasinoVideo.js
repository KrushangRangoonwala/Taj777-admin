import { useEffect, useState } from "react";
import useIsMobile from "../../../hooks/useIsMobile";
import { getValueAfterDot } from "../../../utilies/helpers";
import RulesModal from "../../Modal/RulesModal";
import { GameRules } from "./GameRules";

const unMute = (
    <path
        d="M6.56647 12.296V15.8239C6.56647 16.3269 6.80509 16.8001 7.20955 17.0992L11.9534 20.6073C13.0004 21.3816 14.4828 20.6341 14.4828 19.3319V6.58906C14.4828 5.28689 13.0004 4.53945 11.9534 5.3137L6.98681 8.98648C6.71381 9.18837 6.38323 9.29732 6.04368 9.29732H2.58621C1.71017 9.29732 1 10.0075 1 10.8835V15.0375C1 15.9135 1.71017 16.6237 2.58621 16.6237H3.55094M21.0848 5.82257C24.9717 9.54574 24.9717 15.5822 21.0848 19.3053M18.9734 7.84499C21.6943 10.4512 21.6943 14.6767 18.9734 17.2829M16.8621 9.8674C18.4168 11.3567 18.4168 13.7712 16.8621 15.2605"
        stroke="white" stroke-linecap="round"></path>
)

const mute = (
    <path
        d="M6.56647 12.296V15.8239C6.56647 16.3269 6.80509 16.8001 7.20955 17.0992L11.9534 20.6073C13.0004 21.3816 14.4828 20.6341 14.4828 19.3319V6.58906C14.4828 5.28689 13.0004 4.53945 11.9534 5.3137L6.98681 8.98648C6.71381 9.18837 6.38323 9.29732 6.04368 9.29732H2.58621C1.71017 9.29732 1 10.0075 1 10.8835V15.0375C1 15.9135 1.71017 16.6237 2.58621 16.6237H3.55094M16.8621 9.75862L20.431 13.3276M20.431 13.3276L24 16.8966M20.431 13.3276L24 9.75862M20.431 13.3276L16.8621 16.8966"
        stroke="white" stroke-linecap="round"></path>
)

const unMute2 = (
    <path
        d="M6.56647 12.296V15.8239C6.56647 16.3269 6.80509 16.8001 7.20955 17.0992L11.9534 20.6073C13.0004 21.3816 14.4828 20.6341 14.4828 19.3319V6.58906C14.4828 5.28689 13.0004 4.53945 11.9534 5.3137L6.98681 8.98648C6.71381 9.18837 6.38323 9.29732 6.04368 9.29732H2.58621C1.71017 9.29732 1 10.0075 1 10.8835V15.0375C1 15.9135 1.71017 16.6237 2.58621 16.6237H3.55094M21.0848 5.82257C24.9717 9.54574 24.9717 15.5822 21.0848 19.3053M18.9734 7.84499C21.6943 10.4512 21.6943 14.6767 18.9734 17.2829M16.8621 9.8674C18.4168 11.3567 18.4168 13.7712 16.8621 15.2605"
        stroke="white" stroke-linecap="round"></path>
)
const CasinoVideo = ({
    gameName,
    roundId,
    videoSrc,
    isCardDrawerOpen,
    setIsCardDrawerOpen = () => { },
    communityCards,
    autotime,
    totalTime = 30,
    height,

    CardsComponent,
    WholeCardDrawer,

    drawerHeight,
    drawerStyle,
    OtherComponent,
    BelowRidComp,
    CurrentCard,
    cards,
    isRuleIcon = true,
    Popup,
    Exposure,
    VideoTitle,
    isShuffleIcon = true,
}) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const isMobile = useIsMobile();
    const [showRules, setShowRules] = useState(false);
    const [showWebRules, setShowWebRules] = useState(false);
    const [isOpen, setIsOpen] = useState(true); // IS CARD DROWER OPEN 1ST TIME 

    const [gameBegin_CountDown, setGameBegin_CountDown] = useState(false);
    // const [isCountDownStart, setIsCountDownStart] = useState(false);

    // NOTE : DONT SHOW COUNT DOWN FROM 3 TO 0 (IN MOBILE)
    const [isCountDownFrom_3, setIsCountDownFrom_3] = useState(false); // IF TRUE DONT SHOW COUNTDOWN (IN MOBILE)
    // console.log('$$ autotime', autotime);
    useEffect(() => {
        setGameBegin_CountDown(true);
    }, [roundId]);

    useEffect(() => {
        if (gameBegin_CountDown && autotime == 0) {
            setGameBegin_CountDown(false);
        }

        // AUTOTIME START : ( prev : 0 sec || now : X sec || then: X-1 sec )
        if (Number(timeLeft) == 0 && Number(autotime) > 0) {
            // setIsCountDownStart(true);

            if (Number(autotime) <= 3) {
                setIsCountDownFrom_3(true);
            } else {
                setIsCountDownFrom_3(false);
            }
        }
    }, [autotime]);

    useEffect(() => {
        const isAllClosed = cards?.every(val => !val || val == 1);
        // console.log('isAllClosed', isAllClosed);
        if (isAllClosed) {
            setIsCardDrawerOpen(false);
            setIsOpen(false);
        } else {
            setIsOpen(true);
        }
    }, [cards]);

    useEffect(() => {
        if (isOpen) { // isOpen changes its value from FALSE to TRUE then only this will run
            setIsCardDrawerOpen(true);
        }
    }, [isOpen])

    // Timer countdown based on t1[0].autotime
    useEffect(() => {
        const initialTime = autotime ? parseInt(autotime, 10) : 0;

        if (!initialTime || isNaN(initialTime)) {
            setTimeLeft(0);
            return;
        }

        setTimeLeft(initialTime);

        // const interval = setInterval(() => {
        //     setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        // }, 1000);

        // return () => clearInterval(interval);
    }, [roundId, autotime]);

    const getTimerColorClass = () => {
        const timerValue = parseInt(timeLeft) || 0;
        if (timerValue <= 5) return "red";
        if (timerValue <= 10) return "orange";
        return "green";
    };

    // console.log('roundId', roundId);
    // console.log('videoSrc', videoSrc);
    const videoSrc_ = videoSrc?.slice(0, 7).includes('http') ? videoSrc : "";

    return (
        <>

            <div className="casino-video" style={height ? { height: height } : {}}>
                {/* ===== Title ===== */}
                {gameName && roundId &&
                    <div className="casino-video-title">
                        <span className="casino-name">{gameName.toUpperCase()}</span>
                        <div className="casino-video-rid">
                            Round ID: {getValueAfterDot(roundId) || "Loading..."}
                        </div>
                        {BelowRidComp && <BelowRidComp />}
                    </div>}

                {VideoTitle && <VideoTitle />}

                {/* ===== Video ===== */}
                <div className="video-box-container">
                    <div className="video-box">
                        <iframe src={videoSrc_} title="Casino Video" />
                        {Popup && <Popup />}
                    </div>
                </div>

                {OtherComponent && <OtherComponent />}

                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "0%",
                        height: "5px",
                        backgroundColor: "rgb(255, 77, 77)",
                        zIndex: 1001,
                        transition: "width 1s linear, background-color 0.5s"
                    }}
                ></div>

                {/* Timer Progress Bar (Mobile Only) */}
                {isMobile && !isCountDownFrom_3 && (
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            backgroundColor: 'var(--bg-table-header-new)',
                            width: '100vw',
                            height: "6px",
                            zIndex: 1,
                        }}
                    >
                        <div style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: `${Math.min(((parseInt(timeLeft) || 0) / totalTime) * 100, 100)}%`,
                            height: "6px",
                            backgroundColor:
                                (parseInt(timeLeft) || 0) <= 3
                                    ? "var(--bg-danger)"
                                    : (parseInt(timeLeft) || 0) <= 5
                                        ? "var(--bg-warning)"
                                        : "var(--bg-success)",
                            zIndex: 1002,
                            transition: "width 1s linear, background-color 0.5s ease"
                        }}></div>
                    </div>
                )}

                {/* LARGE RED COUNTDOWN OVERLAY (Mobile Only) */}
                {isMobile && !isCountDownFrom_3 && (() => {
                    const timerVal = parseInt(timeLeft) || 0;
                    if (timerVal > 0 && timerVal <= 3) {
                        return (
                            <div className="casino-time-digit">
                                {timerVal}
                            </div>
                        );
                    }
                    return null;
                })()}


                {WholeCardDrawer && <WholeCardDrawer />}
                {/* ===== Cards Drawer ===== */}
                {CardsComponent && !WholeCardDrawer &&
                    <div
                        className={`casino-video-cards ${isCardDrawerOpen ? "" : "hide-cards"}`}
                        style={{
                            ...(drawerHeight ? { height: drawerHeight } : {}),
                            ...(drawerStyle || {})
                        }}
                        onClick={() => console.log("http://localhost:3214/casino/notenum")}
                    >
                        {isShuffleIcon &&
                            <div
                                className="casino-cards-shuffle"
                                onClick={() => {
                                    console.log('aaaaaaaaaaaaaaaa......');
                                    setIsCardDrawerOpen(!isCardDrawerOpen)
                                }}
                            >
                                <i className="fas fa-grip-lines-vertical"></i>
                            </div>}


                        <div className="casino-video-cards-container">
                            <CardsComponent />
                        </div>
                    </div>}

                {CurrentCard && <CurrentCard />}

                {/* ===== Timer ===== */}
                <div className="casino-timer d-none-mobile">
                    <div className="base-timer">
                        <svg
                            viewBox="0 0 100 100"
                            xmlns="http://www.w3.org/2000/svg"
                            className="base-timer__svg"
                        >
                            <g className="base-timer__circle">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    className="base-timer__path-elapsed"
                                />
                                <path
                                    strokeDasharray={`${((timeLeft || 0) / 30) * 283} 283`}
                                    d="M 50, 50 m -45, 0
                                   a 45,45 0 1,0 90,0
                                   a 45,45 0 1,0 -90,0"
                                    className={`base-timer__path-remaining ${getTimerColorClass()}`}
                                />
                            </g>
                        </svg>

                        <span
                            className={`base-timer__label ${getTimerColorClass()}`}
                        >
                            <span>{timeLeft}</span>
                        </span>
                    </div>
                </div>

                {/* ===== Right Icons ===== */}
                <div className="casino-video-right-icons">
                    <div
                        title="Home"
                        className="casino-video-home-icon"
                    >
                        <a href="/owncasino">
                            <i className="fas fa-home"></i>
                        </a>
                    </div>

                    {isRuleIcon &&
                        <div
                            title="Rules"
                            className="casino-video-rules-icon"
                            onClick={() => {
                                if (isMobile) {
                                    setShowRules(true);      // Mobile → open modal
                                } else {
                                    setShowWebRules(true);   // Web → show div
                                }
                            }}
                        >
                            <i className="fas fa-info-circle"></i>
                        </div>}


                    {/* <button id="muteBtn" style={{ display: "flex", backgroundColor: 'transparent' }}> */}
                    {/* <svg viewBox="0 0 25 25" className="voice-icon off" fill="white" xmlns="http://www.w3.org/2000/svg">
                        {unMute}
                    </svg> */}
                    {/* </button> */}
                </div>

                <div
                    id="casino-vieo-rules"
                    aria-modal="true"
                    className="casino-vieo-rules show d-none-small show-rules"
                    style={{ display: showWebRules ? "block" : "none" }}
                >
                    <div className="rules-header">
                        <div>Rules</div>
                        <i className="fas fa-times" onClick={() => setShowWebRules(false)}></i>
                    </div>

                    {(() => {
                        /* const rules = gameRules(gameName) */
                        // console.log("GAMENAMEEEE",gameName);
                        return (
                            <div className="rules-body">
                                <div>
                                    <style>
                                        {`
                                        .casino-vieo-rules {
                                            position: absolute;
                                            right: 10px;
                                            top: 50px;
                                            display: none;
                                            z-index: 10;
                                        }

                                        .casino-vieo-rules {
                                            flex-wrap: wrap;
                                            background-color: #000;
                                            color: #fff;
                                            font-size: 12px;
                                            width: 0;
                                            top: 50px;
                                            right: 0;
                                            height: calc(100% - 160px);
                                            border-radius: 0;
                                            display: none;
                                        }

                                        @media only screen and (min-width: 1280px) and (max-width: 1599px) {
                                            .casino-vieo-rules {
                                                height: calc(100% - 125px);
                                            }
                                        }

                                        .casino-vieo-rules.show-rules {
                                            display: flex;
                                            max-width: calc(100% - 200px);
                                            width: 800px;
                                            z-index: 101;
                                        }

                                        @media only screen and (min-width: 320px) and (max-width: 767px) {
                                            .casino-vieo-rules {
                                                position: relative;
                                                max-width: 100% !important;
                                                width: 100% !important;
                                                top: 0;
                                                height: 100%;
                                            }
                                        }

                                        .casino-vieo-rules .rules-header {
                                            background-color: rgb(51, 51, 51);
                                            display: flex;
                                            justify-content: center;
                                            font-size: 16px;
                                            width: 100%;
                                            padding: 2px;
                                        }

                                        .casino-vieo-rules .rules-header i {
                                            position: absolute;
                                            right: 10px;
                                            top: 6px;
                                            cursor: pointer;
                                        }

                                        .casino-vieo-rules .rules-body {
                                            padding: 10px;
                                            overflow-x: hidden;
                                            overflow-y: auto;
                                            scrollbar-width: thin;
                                            scrollbar-color: #333333 #000000;
                                            height: calc(100% - 30px);
                                            line-height: normal;
                                            width: 100%;
                                        }

                                        @media only screen and (min-width: 320px) and (max-width: 767px) {
                                            .casino-vieo-rules .rules-body {
                                                text-align: left;
                                                height: 100%;
                                            }
                                        }

                                        .table th {
                                            color: #fff;
                                        }
                                            
                                        .table td {
                                            color: #fff;
                                            border: 1px solid #444;
                                            background-color: #222;
                                            font-size: 12px;
                                        }

                                        .table > :not(caption) > * > * {
                                            padding: 4px;
                                        }

                                        .rule-inner-icon {
                                            background-color: #fff;
                                            color: #000;
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                            height: 40px;
                                            width: 40px;
                                            font-size: 24px;
                                        }

                                        .casino-vieo-rules img {
                                            max-width: 300px;
                                        }

                                        .casino-rules img {
                                            width: auto;
                                        }

                                        .casino-tabs {
                                            height: 50px;
                                            margin-top: 0;
                                            padding-top: 0;
                                            padding-bottom: 0;
                                            display: flex;
                                            display: -webkit-flex;
                                            align-items: center;
                                            position: relative;
                                            border-radius: 0 0 8px 8px;
                                        }

                                        @media only screen and (min-width: 320px) and (max-width: 767px) {
                                            .casino-tabs {
                                                height: auto;
                                            }
                                        }

                                        .lottery-rules{
                                            background-color: #2e3439;
                                            width: 100%;
                                        }

                                        .lottery-rules .casino-tabs {
                                            border-radius: 0;
                                        }

                                        .casino-tabs .nav-tabs {
                                            border: 0;
                                            margin-left: 50px;
                                            margin-right: 50px;
                                            position: relative;
                                            flex-wrap: nowrap;
                                            overflow: hidden;
                                            scroll-behavior: smooth;
                                            white-space: nowrap;
                                        }

                                        @media only screen and (min-width: 320px) and (max-width: 1279px) {
                                            .casino-tabs .nav-tabs {
                                                margin-left: 5px;
                                                margin-right: 5px;
                                                overflow-x: auto;
                                                -ms-overflow-style: none;
                                                /* scrollbar-width: none; */
                                            }
                                        }

                                        .lottery-rules .casino-tabs .nav-tabs
                                            border: 0;
                                            margin-left: 50px !important;
                                            margin-right: 50px !important;
                                            position: relative;
                                            flex-wrap: nowrap;
                                            overflow: hidden;
                                            scroll-behavior: smooth;
                                            white-space: nowrap;
                                        }

                                        .nav-tabs .nav-item {
                                            margin-bottom: -1px;
                                        }

                                        .casino-tabs .nav-tabs .nav-link {
                                            color: var(--text-body);
                                            padding-top: 0;
                                            padding-bottom: 0;
                                            padding-left: 5px;
                                            padding-right: 5px;
                                            border: 0;
                                            text-align: center;
                                            opacity: 0.7;
                                            display: flex;
                                            flex-wrap: wrap;
                                            flex-direction: column;
                                            justify-content: center;
                                            align-items: center;
                                            transition: opacity 0.2s linear;
                                            cursor: pointer;
                                            border-radius: 0;
                                        }

                                        .casino-tabs .nav-tabs .nav-item .nav-link.active {
                                            opacity: 1;
                                            background-color: transparent;
                                        }

                                        .casino-tabs .nav-tabs .nav-item .nav-link:hover, .casino-tabs .nav-tabs .nav-item .nav-link:focus {
                                            opacity: 1;
                                            background-color: transparent;
                                        }

                                        .tab-content>.active {
                                            display: block;
                                        }

                                        .lottery-rules-box {
                                            border: 1px solid #f8b737;
                                        }

                                        .lottery-rules-row {
                                            display: flex;
                                            flex-wrap: wrap;
                                            border-bottom: 1px solid #f8b737;
                                        }

                                        .lottery-rules-title-name {
                                            display: flex;
                                            flex-wrap: wrap;
                                            align-items: center;
                                            border-right: 1px solid #f8b737;
                                            width: 20%;
                                            justify-content: center;
                                            padding: 5px;
                                            color: var(--text-table);
                                        }

                                        @media only screen and (min-width: 320px) and (max-width: 767px) {
                                            .lottery-rules-title-name {
                                                width: 30%;
                                            }
                                        }

                                        .lottery-rules-title-name>div {
                                            width: 100%;
                                            text-align: center;
                                        }

                                        .lottery-rules-cards {
                                            display: flex;
                                            flex-wrap: wrap;
                                            padding: 10px;
                                            align-items: center;
                                            justify-content: center;
                                            width: 80%;
                                            color: var(--text-table);
                                            text-align: center;
                                        }

                                        @media only screen and (min-width: 320px) and (max-width: 767px) {
                                            .lottery-rules-cards {
                                                width: 70%;
                                            }
                                        }

                                        .lottery-rules-cards .lottery-card {
                                            margin-right: 5px;
                                        }

                                        .lottery-rules-cards .lottery-card img {
                                            width: 40px;
                                            height: auto;
                                            max-height: unset;
                                        }

                                        @media only screen and (min-width: 320px) and (max-width: 767px) {
                                            .lottery-rules-cards .lottery-card img {
                                                width: 30px;
                                            }
                                        }

                                        .lottery-table td {
                                            border: 0;
                                            border-bottom: 1px solid #3c444b;
                                            padding: 4px;
                                            background-color: #2E3439;
                                            color: var(--text-table);
                                        }

                                        .rules-section .baccarat-table td, .rules-section .baccarat-table th {
                                            border-bottom: 1px solid #444;
                                            border-right: 1px solid #444;
                                            vertical-align: middle;
                                            text-align: center;
                                            color: #fff;
                                        }
                                            
                                        .rules-section .duskadum-table td {
                                            color: #fff;
                                        }

                                        .table {
                                            --bs-table-color-type: initial;
                                            --bs-table-bg-type: initial;
                                            --bs-table-color-state: initial;
                                            --bs-table-bg-state: initial;
                                            --bs-table-color: var(--bs-emphasis-color);
                                            --bs-table-bg: #2E3439;
                                            --bs-table-border-color: #3c444b;
                                            --bs-table-accent-bg: transparent;
                                            --bs-table-striped-color: unset;
                                            --bs-table-striped-bg: #2E3439;
                                            --bs-table-active-color: #2E3439;
                                            --bs-table-active-bg: rgba(var(--bs-emphasis-color-rgb), 0.1);
                                            --bs-table-hover-color: #2E3439;
                                            --bs-table-hover-bg: #2E3439;
                                            width: 100%;
                                            margin-bottom: 1rem;
                                            vertical-align: top;
                                            border-color: #3c444b;
                                        }

                                        .table td {
                                            border: 0;
                                            border-bottom: 1px solid #3c444b;
                                            padding: 4px;
                                            /* background-color: #2E3439; */
                                            color: var(--text-table);
                                        }

                                        .rules-section .row.row5 {
                                            margin-left: -5px;
                                            margin-right: -5px;
                                        }
                                        .rules-section .pl-2 {
                                            padding-left: .5rem !important;
                                        }
                                        .rules-section .pr-2 {
                                            padding-right: .5rem !important;
                                        }
                                        .rules-section .row.row5 > [class*="col-"], .rules-section .row.row5 > [class*="col"] {
                                            padding-left: 5px;
                                            padding-right: 5px;
                                        }
                                        .rules-section
                                        {
                                            text-align: left;
                                            margin-bottom: 10px;
                                        }
                                        .rules-section .table
                                        {
                                            color: #fff;
                                            border:1px solid #444;
                                            background-color: #222;
                                            font-size: 12px;
                                        }
                                        .rules-section .table td, .rules-section .table th
                                        {
                                            border-bottom: 1px solid #444;
                                        }
                                        .rules-section ul li, .rules-section p
                                        {
                                            margin-bottom: 5px;
                                            display: list-item;
                                        }
                                        .rules-section::-webkit-scrollbar {
                                            width: 8px;
                                        }
                                        .rules-section::-webkit-scrollbar-track {
                                            background: #666666;
                                        }

                                        .rules-section::-webkit-scrollbar-thumb {
                                            background-color: #333333;
                                        }
                                        .rules-section .rules-highlight
                                        {
                                            color: #FDCF13;
                                            font-size: 16px;
                                        }
                                        .rules-section .rules-sub-highlight {
                                            color: #FDCF13;
                                            font-size: 14px;
                                        }
                                        .rules-section .list-style, .rules-section .list-style li
                                        {
                                            list-style: disc;
                                            /* display: list-item; */
                                        }
                                        .rules-section .rule-card
                                        {
                                            height: 20px;
                                            margin-left: 5px;
                                        }
                                        .rules-section .card-character
                                        {
                                            font-family: Card Characters;
                                        }
                                        .rules-section .red-card
                                        {
                                            color: red;
                                            font-size: 17px;
                                        }
                                        .rules-section .black-card
                                        {
                                            color: black;
                                            font-size: 17px;
                                        }
                                        .rules-section .cards-box
                                        {
                                            background: #fff;
                                            padding: 6px;
                                            display: inline-block;
                                            color: #000;
                                            min-width: 150px;
                                        }
                                        .rules-section img {
                                        max-width: 100%;
                                        }

                                        
                                        
                                    `}
                                    </style>

                                    <GameRules normalizedGame={gameName} />
                                </div>
                            </div>
                        );
                    })()}


                </div>
                {Exposure && <Exposure />}
            </div>

            <RulesModal
                isOpen={showRules}
                onClose={() => setShowRules(false)}
                gameKey={gameName}   // or gameId
            />

        </>
    );
};

export default CasinoVideo;
