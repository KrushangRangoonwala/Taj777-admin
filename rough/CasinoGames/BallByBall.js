import React, { useState, useEffect, useRef } from "react";
import "./kk.css"
import useIsMobile from "../../hooks/useIsMobile";
import { io } from "socket.io-client";
import CasinoVideo from "./components/CasinoVideo";
import { fetchCasinoExposureApi } from "../../api/api";
import Collapse from "react-bootstrap/Collapse";
import { useGetFileData } from "../../hooks/useGetFileData";
import RemarkMarquee from "./components/RemarkMarquee";
import { sanitizeNumber } from "../SportsCenterContainer";
import { formatNumber } from "../../utilies/helpers";
import { useSocket } from "../Socket/useSocket";

const BallByBall = ({ isVisible, lastBetTime, onBetSelection }) => {
    const { CODE, game_type, phpFile, placeBetApi, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [openSections, setOpenSections] = useState({ column1: true });
    const isLucky15 = game_type === "lucky15";

    const isMobile = useIsMobile();
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(false);
    const socketRef = useRef(null);
    const [exposureData, setExposureData] = useState([]);
    const [displayRdesc, setDisplayRdesc] = useState("");
    const rdescTimerRef = useRef(null);

    useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.mid) return;
            try {
                const response = await fetchCasinoExposureApi({
                    markettype: CODE,
                    main_event_id: gameData.t1.mid,
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
    }, [gameData?.t1?.mid, lastBetTime]);

    const getExposure = (marketId) => {
        if (!Array.isArray(exposureData)) return 0;
        const market = exposureData.find((item) => item.market_id == marketId);
        return market ? market.win_loss || market.total_exposure : 0;
    };

    const renderExposure = (marketId) => {
        const exposure = getExposure(marketId);
        if (exposure === 0) return null;
        return (
            <span style={{ marginLeft: "5px", color: exposure >= 0 ? "green" : "red" }}>
                {exposure}
            </span>
        );
    };

    const handleOddsClick = (marketName, odds, market, isBack) => {
        if (!market) return;

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
                eventId: currentGame?.mid,
            });
        }
    };

    const socket = useSocket("casino");
    useEffect(() => {
        console.log("### socket", socket);
        if (!socket) return;
        console.log("Next");
        const handleBollywoodData = (data) => {
            console.log('### data', data);
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
        console.log("#######");
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        return () => {
            socket.off("connect", handleConnect);
            socket.off(game_type, handleBollywoodData);
            socket.off("game", handleBollywoodData);
            console.log("### OFF");
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
        };
    }, [socket, game_type]);

    console.log('### gameData?.t1', gameData?.t1)
    const currentGame = gameData?.t1;

    const data = currentGame?.sub;

    const toggleSection = (section) => {
        // console.log('!openSections[', section, ']', !openSections[section]);
        setOpenSections((prevState) => ({
            ...prevState,
            [section]: !prevState[section],
        }));
    };

    function Header({ name, sectionId, targetId }) {
        return (
            <div
                data-toggle="collapse"
                data-target={targetId}
                className={`bet-table-header ${openSections[sectionId] ? "" : "collapsed"}`}
                onClick={() => toggleSection(sectionId)}
                aria-expanded={openSections[sectionId]}
            >
                <div className="nation-name">
                    <span title="Who Will Goal Next?" style={{ position: 'relative', }}>
                        <a onClick={(e) => e.preventDefault()} title="">
                            <img
                                src="https://wver.sprintstaticdata.com/v196/static/front/img/arrow-down.svg"
                                className="mr-1"
                                alt=""
                            />
                        </a>
                        {name}
                    </span>
                </div>
            </div>
        )
    }

    function SingleHeader() {
        return (
            <div className="col-6 col-md-4">
                <div className="fancy-tripple">
                    <div className="bet-table-row">
                        <div className="nation-name"></div>
                        <div className="back bl-title back-title">Back</div>
                    </div>
                </div>
            </div>
        )
    }

    function Row_Header() {
        return (
            <div className="row row5 d-none-mobile">
                <SingleHeader />
                <SingleHeader />
                <SingleHeader />
            </div>
        )
    }

    function Displaydata({ player }) {
        console.log('@@@ player', player);
        const isSuspended = player.gstatus.toUpperCase() === "SUSPENDED"
        const min = formatNumber(sanitizeNumber(player.min))
        const max = formatNumber(sanitizeNumber(player.max))
        const odds = player.b;
        const size = formatNumber(sanitizeNumber(player.bs))

        return (
            <div className="col-6 col-md-4">
                <div className="fancy-tripple">

                    <div className="bet-table-mobile-row d-none-desktop">
                        <div className="bet-table-mobile-team-name">
                            <span>{player.nat}</span>
                            {renderExposure(player?.sid)}
                        </div>
                    </div>

                    <div className="bet-table-row">
                        <div className="nation-name d-none-mobile">
                            <p>{player.nat}</p>
                            <p className="mb-0">{renderExposure(player?.sid)}</p>
                        </div>

                        <div
                            data-title={player.gstatus}
                            className={`bl-box back ${isSuspended ? 'no-val suspended' : ''}`}
                        >
                            {odds != 0
                                ? <>
                                    <span
                                        className="d-block odds"
                                        onClick={() => handleOddsClick(player.nat, odds, player, true)}
                                    >
                                        {odds}
                                    </span>
                                    <span className="d-block">{size}</span>
                                </>
                                : <span className="dash-odd">—</span>}
                        </div>

                        <div className="fancy-min-max">
                            Min:<span>{min}</span> Max:<span>{max}</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    useEffect(() => {
        if (currentGame?.rdesc) {
            if (rdescTimerRef.current) {
                clearTimeout(rdescTimerRef.current);
                rdescTimerRef.current = null;
            }
            setDisplayRdesc(currentGame.rdesc);
        } else if (displayRdesc) {
            if (!rdescTimerRef.current) {
                rdescTimerRef.current = setTimeout(() => {
                    setDisplayRdesc("");
                    rdescTimerRef.current = null;
                }, 2000);
            }
        }
    }, [currentGame?.rdesc, displayRdesc]);

    const ResultPopup = () => {
        if (!displayRdesc) return null;

        return (
            <div className="cricket20ballpopup">
                <img src="/assets/cards_new/ball-blank.png" />
                <span>{displayRdesc}</span>
            </div>
        )
    }

    return (
        <>
            <div className={`casino-table ball-by-ball kk`} > {/* ${styles['cricket20']} */}
                <CasinoVideo
                    gameName={game_name}
                    roundId={currentGame?.mid}
                    videoSrc={iframe_url}
                    isCardDrawerOpen={isCardDrawerOpen}
                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                    autotime={currentGame?.lt}
                    totalTime={currentGame?.ft}// CardsComponent={VideoCards}
                    // OtherComponent={CasinoVideoBanner}
                    Popup={ResultPopup}
                />

                <div className="detail-page-container">
                    <div className="market-6" id="goto-column1">
                        <div className="bet-table">
                            <Header name="Runs" sectionId="column1" targetId="column1" />
                            <Collapse in={openSections.column1}>
                                <div
                                    id="column1"
                                    className={`bet-table-body container-fluid container-fluid-5 collapse ${openSections.column1 ? "show" : ""}`}
                                >
                                    <Row_Header />
                                    <div className="row row5">
                                        {data?.map((player) => (<Displaydata player={player} key={player.nat} />))}
                                    </div>
                                </div>
                            </Collapse>
                        </div>
                    </div>
                </div>

                {!isLucky15 && <RemarkMarquee remark={currentGame?.remark} />}
            </div>
        </>

    );
};

export default BallByBall;
