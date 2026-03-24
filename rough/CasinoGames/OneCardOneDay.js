import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { fetchCasinoExposureApi } from "../../api/api";
import { getImage, getMarketByNation, getValueAfterDot, getIsSuspended } from "../../utilies/helpers";
import { useGetFileData } from "../../hooks/useGetFileData";
import CasinoVideo from "./components/CasinoVideo";
import useIsMobile from "../../hooks/useIsMobile";

const OneCardOneDay = ({ isVisible, onBetSelection, lastBetTime }) => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [exposureData, setExposureData] = useState([]);
    const socketRef = useRef(null);
    const isMobile = useIsMobile(767);

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
    }, [gameData?.t1?.[0]?.mid, lastBetTime, CODE, phpFile]);

    const getExposure = (marketId) => {
        if (!Array.isArray(exposureData)) return 0;
        const market = exposureData.find((item) => item.market_id == marketId);
        return market ? market.win_loss || market.total_exposure : 0;
    };

    const renderExposure = (marketId, isUpDown = false) => {
        // if (isUpDown) {
        //     return (
        //         <div className={`mr-2 up-down-book book-green`}>
        //             100
        //         </div>
        //     )
        // }

        const exposure = getExposure(marketId);
        // console.log('exposure', exposure);
        if (exposure === 0) return null;
        return (
            <div className={`mr-2 ${isUpDown ? 'up-down-book' : ''} ${exposure > 0 ? 'book-green' : 'book-red'}`}>
                {exposure}
            </div>
        );
    };

    useEffect(() => {
        const socket = io("https://trubet9.bet:2053", {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        const handleData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) {
                    setGameData(payload);
                }
            } catch (error) {
                console.error("Error processing 1crad1day data:", error);
            }
        };

        socket.on("connect", () => {
            console.log(`✅ ${game_type} Connected:`, socket.id);
            socket.emit("Room", game_type);
        });

        socket.on(game_type, handleData);
        socket.on("game", handleData);

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [game_type]);

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

    const Cards = () => {
        const C1 = currentGame?.C1;
        const C2 = currentGame?.C2;
        const card_1 = getImage(C1, result_image);
        const card_2 = getImage(C2, result_image);

        return (
            <>
                <div>
                    <div className="dealer-name w-100 mb-1">Player</div>
                    <div><span><span><img src={card_1} alt="Player Card" /></span></span></div>
                </div>
                <div>
                    <div className="dealer-name w-100 mb-1">Dealer</div>
                    <div><span><span><img src={card_2} alt="Dealer Card" /></span></span></div>
                </div>
            </>
        );
    };

    const BetBox = ({ marketName, className = "", children, type = "back" }) => {
        const market = getMarketByName(marketName);
        const suspended = getIsSuspended(market);
        const odds = type === "back" ? market?.b1 : market?.l1;

        return (
            <div
                className={`${className} ${suspended ? "suspended" : ""}`}
                onClick={() => handleOddsClick(marketName, odds, market, type === "back", suspended)}
            >
                {children(odds)}
                {/* For standard back/lay boxes, exposure might be rendered differently if needed, 
                    but the HTML structure provided doesn't explicitly show where it goes for Player/Dealer.
                    I'll skip rendering it for the simple back/lay boxes unless I find a place.
                */}
            </div>
        );
    };

    const UpDownBox = ({ marketName, label, className }) => {
        const market = getMarketByName(marketName);
        // console.log('!!!!!! market', market);
        const suspended = getIsSuspended(market);
        const odds = market?.b1 || 0;
        const isLeft = marketName.includes("Dealer");

        return (
            <div className={`${className} ${suspended ? "suspended" : ""}`}
                onClick={() => handleOddsClick(marketName, odds, market, true, suspended)}>
                {renderExposure(market?.sid, true)}
                <div className={isLeft ? "text-left" : "text-right"}>
                    <div className="up-down-odds">{odds}</div>
                    <span>{label}</span>
                </div>
            </div>
        );
    };

    const SevenImg = () => <div className="seven-box"><img src="https://wver.sprintstaticdata.com/v197/static/front/img/trape-seven.png" alt="7" /></div>;

    return (
        <div className="casino-table teen1oneday card1day">
            <CasinoVideo
                gameName={game_name}
                roundId={currentGame?.mid}
                videoSrc={iframe_url}
                isCardDrawerOpen={isCardDrawerOpen}
                setIsCardDrawerOpen={setIsCardDrawerOpen}
                autotime={currentGame?.autotime}
                totalTime={currentGame?.ft}
                cards={[currentGame?.C1, currentGame?.C2]}
                CardsComponent={Cards}
            />
            <div className="casino-detail">
                <div className="teen1daycasino-container">
                    <div className="teen1dayleft">
                        <div className="casino-box-row">
                            <div className="casino-nation-name">
                                <b>Player</b>
                                <div className="float-right">{renderExposure(1)}</div>
                            </div>
                            <div className="casino-bl-box">
                                <BetBox marketName="Player" className="back casino-bl-box-item" type="back">
                                    {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                </BetBox>
                                <BetBox marketName="Player" className="lay casino-bl-box-item" type="lay">
                                    {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                </BetBox>
                            </div>
                        </div>
                    </div>
                    <div className="teen1daycenter"></div>
                    <div className="teen1dayright">
                        <div className="casino-box-row">
                            <div className="casino-nation-name">
                                <b>Dealer</b>
                                <div className="float-right">{renderExposure(2)}</div>
                            </div>
                            <div className="casino-bl-box">
                                <BetBox marketName="Dealer" className="back casino-bl-box-item" type="back">
                                    {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                </BetBox>
                                <BetBox marketName="Dealer" className="lay casino-bl-box-item" type="lay">
                                    {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                </BetBox>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="teen1daycasino-container">
                    <div className="teen1dayleft w-50"><b className="text-yellow">Player</b></div>
                    <div className="teen1dayright w-50 text-right"><b className="text-yellow">Dealer</b></div>
                    <div className="teen1dayleft">
                        <div className="seven-up-down-box">
                            <UpDownBox marketName="7 Up Player" label="UP" className="up-box" />
                            <UpDownBox marketName="7 Up Dealer" label="UP" className="down-box" />
                            <SevenImg />
                        </div>
                    </div>
                    <div className="teen1daycenter"></div>
                    <div className="teen1dayright">
                        <div className="seven-up-down-box">
                            <UpDownBox marketName="7 Down Player" label="DOWN" className="up-box" />
                            <UpDownBox marketName="7 Down Dealer" label="DOWN" className="down-box" />
                            {!isMobile && <SevenImg />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OneCardOneDay;
