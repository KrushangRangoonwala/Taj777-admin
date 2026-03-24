import React, { useState, useEffect, useRef } from "react";
import "./kk.css"
import useIsMobile from "../../hooks/useIsMobile";
import { io } from "socket.io-client";
import CasinoVideo from "./components/CasinoVideo";
import { fetchCasinoExposureApi } from "../../api/api";
import Collapse from "react-bootstrap/Collapse";
import { useGetFileData } from "../../hooks/useGetFileData";
import styles from "./Cricket2020.module.css"
import RemarkMarquee from "./components/RemarkMarquee";
import { sanitizeNumber } from "../SportsCenterContainer";
import { formatNumber, getExposureClass, getImage } from "../../utilies/helpers";
import { useDispatch, useSelector } from "react-redux";
import { setCmeterBetOn } from "../../store/slices/casinoSlice";

const low_cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9"];

export function isLow(card_) {
    const card = card_.slice(0, -2);
    return low_cards.includes(card);
}

const Cmeter = ({ isVisible, lastBetTime, onBetSelection, placebet_msg }) => {
    const { CODE, game_type, phpFile, placeBetApi, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const dispatch = useDispatch();

    const isSmallMobile = useIsMobile(767);
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(false);
    const socketRef = useRef(null);
    const [exposureData, setExposureData] = useState([]);
    const [displayData, setDisplayData] = useState([]);

    // const betOn = useSelector(state => state?.casino?.cmeter?.betOn);
    // const setBetOn = (val) => {
    //     dispatch(setCmeterBetOn(val));
    // }
    const [betOn, setBetOn] = useState(null);
    const [isBetOpen, setIsBetOpen] = useState(false);

    const low_common = ["A", "2", "3", "4", "5", "6", "7", "8"];
    const high_common = ["J", "Q", "K"];

    const card_9 = betOn === "low" ? "9meter" : "9";
    const card_10 = betOn === "high" ? "10meter" : "10";

    const lowCards = [...low_common, card_9];
    const highCards = [card_10, ...high_common];

    const currentGame = gameData?.t1?.[0];
    const t2 = gameData?.t2;
    const low = t2?.[0];
    const high = t2?.[1];
    const isLowSuspended = low?.gstatus === 'SUSPENDED';
    const isHighSuspended = high?.gstatus === 'SUSPENDED';

    const cards_ = currentGame?.cards?.split(",");
    const cards = cards_?.filter(val => val !== '1');
    const isNoCard = cards?.length === 0;


    useEffect(() => {
        const fetchExposure = async () => {
            if (!currentGame?.mid) return;
            try {
                const response = await fetchCasinoExposureApi({
                    markettype: CODE,
                    main_event_id: currentGame?.mid,
                    curPageName: phpFile,
                });
                const exposure = response?.data;
                if (Array.isArray(exposure)) {
                    setExposureData(exposure);
                }
            } catch (error) {
                console.error("Error fetching exposure:", error);
            }
        };
        fetchExposure();
    }, [currentGame?.mid, lastBetTime]);

    const getExposure = (marketId) => {
        if (!Array.isArray(exposureData)) return 0;
        const market = exposureData.find((item) => item.market_id == marketId);
        return market ? market.win_loss || market.total_exposure : 0;
    };

    const renderExposure = (marketId) => {
        const exposure = getExposure(marketId);
        if (exposure === 0) return null;
        return (
            <span className={getExposureClass(exposure) + ' ' + 'w-100 text-left'}>
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


    function setData() {
        let low = [];
        let high = [];
        cards?.forEach((card) => {
            if (isLow(card)) {
                low.push(card);
            } else {
                high.push(card);
            }
        });
        setDisplayData([{
            label: "Low",
            value: currentGame?.C1,
            cards: low,
        },
        {
            label: "High",
            value: currentGame?.C2,
            cards: high,
        },]);
    }

    useEffect(() => {
        setData();
    }, [currentGame]);

    useEffect(() => {
        setBetOn(null);
    }, [currentGame?.mid])

    useEffect(() => {
        if (exposureData?.length > 0) {
            setIsBetOpen(true);
            const firstExposure = exposureData?.[0];

            if (firstExposure?.total_exposure != 0) {
                if (firstExposure?.market_id == 1) {
                    setBetOn("low");
                } else if (firstExposure?.market_id == 2) {
                    setBetOn("high");
                }
            }
        } else {
            setIsBetOpen(false);
        }
    }, [exposureData])

    useEffect(() => {
        setBetOn(placebet_msg?.toLowerCase() ?? null);
    }, [placebet_msg])

    const isBetOnLow = betOn === 'low';
    const isBetOnHigh = betOn === 'high';

    console.log('rrr betOn', betOn);

    return (
        <>
            <div className={`casino-table cmeter kk`} > {/* ${styles['cricket20']} */}
                <CasinoVideo
                    gameName={game_name}
                    roundId={currentGame?.mid}
                    videoSrc={iframe_url}
                    isCardDrawerOpen={isCardDrawerOpen}
                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                    autotime={currentGame?.autotime}
                    totalTime={currentGame?.ft}// CardsComponent={VideoCards}
                // OtherComponent={CasinoVideoBanner}
                />

                <div className="casino-detail">
                    {/* Meter cards */}
                    {!isNoCard && <div className="cmeter-card-box">
                        {displayData.map((item) => {
                            // console.log('rrr item.label.toLowerCase()', item.label.toLowerCase());

                            const position =
                                isBetOnLow
                                    ? Number(displayData[0]?.value) - Number(displayData[1]?.value)
                                    : isBetOnHigh
                                        ? Number(displayData[1]?.value) - Number(displayData[0]?.value)
                                        : false;

                            console.log('position', position, isBetOnHigh, isBetOnLow)
                            return (
                                <div
                                    key={item.label}
                                    className={`cmeter-card-${item.label.toLowerCase()}`}
                                >
                                    <div className="text-playerb flex-wrap">
                                        <span>{item.label}</span>
                                        <span
                                            className="text-success ml-2 numeric"
                                        // style={{ display: isSmallMobile ? "block" : "" }}
                                        >
                                            {item.value}
                                        </span>
                                    </div>

                                    <div className="ml-2">
                                        {item.cards.map((card, index) => (
                                            <span key={index}>
                                                <img src={`/assets/cards_new/${card}.png`} alt={card} />
                                            </span>
                                        ))}

                                        {position !== false && betOn === item.label.toLowerCase() && isBetOpen &&
                                            <span className="ml-1 qqwwee">
                                                {console.log(isBetOnLow, 'rrr position', position)}
                                                Run Position:
                                                <span style={{ marginLeft: '5px' }} className={getExposureClass(position)}>{position}</span>
                                            </span>}
                                    </div>

                                </div>
                            )
                        })}
                    </div>}

                    {/* Teen 1 Day Casino */}
                    <div className="teen1daycasino-container">
                        {/* Low */}
                        <div className="teen1dayleft">
                            <div className="text-center">
                                <b className="text-playerb">Low</b>

                                {isBetOnHigh &&
                                    <div className="casino-card-item d-inline-block ml-2">
                                        <span className="card-image">
                                            <img src={getImage('10SS')} />
                                        </span>
                                    </div>}
                            </div>

                            <div className="w-100" onClick={() => !isLowSuspended && handleOddsClick("Low", low.b1, low, true)}>
                                <div className={`casino-cards text-center p-2 ${isLowSuspended ? 'suspended' : ''}`}>
                                    {lowCards.map((card, idx) => (
                                        <div
                                            key={card}
                                            className="casino-card-item"
                                            style={{ minWidth: idx === 0 && isSmallMobile ? '72px' : '' }}
                                        >
                                            <div className="card-image">
                                                <img src={getImage(card, 'cards_new/lucky6')} alt={card} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div>{renderExposure(low?.sid)}</div>
                            </div>
                        </div>

                        <div className="teen1daycenter" />

                        {/* High */}
                        <div className="teen1dayright">
                            <div className="text-center">
                                <b className="text-playerb">High</b>

                                {isBetOnLow &&
                                    <div className="casino-card-item d-inline-block ml-2">
                                        <span className="card-image">
                                            <img src={getImage('9SS')} />
                                        </span>
                                    </div>}
                            </div>

                            <div className="w-100" onClick={() => !isHighSuspended && handleOddsClick("High", high.b1, high, true)}>
                                <div className={`casino-cards text-center p-2 ${isHighSuspended ? 'suspended' : ''}`}>
                                    {highCards.map((card) => (
                                        <div key={card} className="casino-card-item">
                                            <div className="card-image">
                                                <img src={getImage(card, 'cards_new/lucky6')} alt={card} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div>{renderExposure(high?.sid)}</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>

    );
};

export default Cmeter;
