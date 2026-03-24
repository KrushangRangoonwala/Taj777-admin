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
import { formatIndianNumber, formatNumber } from "../../utilies/helpers";

const Goal = ({ isVisible, lastBetTime, onBetSelection }) => {
    const { CODE, game_type, phpFile, placeBetApi, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [openSections, setOpenSections] = useState({ column1: true, column2: true });

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
            <p className={`mv-0 ${exposure >= 0 ? "book-green" : "book-red"}`}>{formatIndianNumber(exposure)}</p>
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

        socket.on("connect", () => {
            console.log("✅ Superover Connected:", socket.id);
            socket.emit("Room", game_type);
        });

        socket.on("game", handleGameData);
        socket.on(game_type, handleGameData);

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
                    <span title="Who Will Goal Next?">
                        <a onClick={(e) => e.preventDefault()} title="">
                            <img
                                src="/assets/images/arrow-down.svg"
                                className="mr-1"
                                style={{ transform: openSections[sectionId] ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            />
                        </a>
                        {name}
                    </span>
                </div>
            </div>
        )
    }

    function Row_Header() {
        return (
            <div className="row row5 d-none-mobile">
                <div className="col-12 col-md-12">
                    <div className="fancy-tripple">
                        <div className="bet-table-row">
                            <div className="nation-name"></div>
                            <div className="back bl-title back-title">Back</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    function Displaydata({ player }) {
        const isSuspended = player.gstatus.toUpperCase() === "SUSPENDED"
        const min = formatNumber(sanitizeNumber(player.min))
        const max = formatNumber(sanitizeNumber(player.max))
        const odds = player.b;
        const size = formatNumber(sanitizeNumber(player.bs))

        return (
            <div className="col-12 col-md-12">
                <div className="fancy-tripple">
                    <div className="bet-table-row">
                        <div className="nation-name">
                            <p>{player.nat}</p>
                            {renderExposure(player.sid)}
                        </div>

                        <div
                            data-title={player.gstatus}
                            className={`bl-box back ${isSuspended ? 'no-val suspended' : ''}`}
                        >
                            <span
                                className="d-block odds"
                                onClick={() => handleOddsClick(player.nat, odds, player, true)}
                            >
                                {odds}
                            </span>
                            <span className="d-block">{size}</span>
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
            <div className="cricket20ballpopup bounce-enter-active bounce-enter-to">
                <img src="/assets/cards/soccer-ball.png" />
                <span>{displayRdesc}</span>
            </div>
        )
    }

    return (
        <>
            <div className={`casino-table ball-by-ball goal kk`} > {/* ${styles['cricket20']} */}
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
                            <Header name="Who Will Goal Next?" sectionId="column1" targetId="column1" />
                            <Collapse in={openSections.column1}>
                                <div
                                    id="column1"
                                    className={`bet-table-body container-fluid container-fluid-5 collapse ${openSections.column1 ? "show" : ""}`}
                                >
                                    <Row_Header />
                                    <div className="row row5">
                                        {data?.slice(0, 10).map((player) => (<Displaydata player={player} key={player.nat} />))}
                                    </div>
                                </div>
                            </Collapse>
                        </div>
                    </div>

                    <div className="market-6" id="goto-column2">
                        <div className="bet-table">
                            <Header name="Method Of Next Goal" sectionId="column2" targetId="column2" />
                            <Collapse in={openSections.column2}>
                                <div
                                    id="column2"
                                    className={`bet-table-body container-fluid container-fluid-5 collapse ${openSections.column2 ? "show" : ""}`}
                                >
                                    <Row_Header />
                                    <div className="row row5">
                                        {data?.slice(10).map((player) => (<Displaydata player={player} key={player.nat} />))}
                                    </div>
                                </div>
                            </Collapse>
                        </div>
                    </div>
                </div>


                <RemarkMarquee remark={currentGame?.remark} />
            </div>
        </>

    );
};

export default Goal;
