import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { fetchCasinoExposureApi } from "../../api/api";
import { getImage, getMarketByNation, getValueAfterDot, getIsSuspended } from "../../utilies/helpers";
import { useGetFileData } from "../../hooks/useGetFileData";
import CasinoVideo from "./components/CasinoVideo";
import useIsMobile from "../../hooks/useIsMobile";

// Data configurations
const TOTAL_ODDS = [
    { value: 4, odds: "50:1" },
    { value: 5, odds: "20:1" },
    { value: 6, odds: "15:1" },
    { value: 7, odds: "12:1" },
    { value: 8, odds: "8:1" },
    { value: 9, odds: "6:1" },
    { value: 10, odds: "6:1" },
    { value: 11, odds: "6:1" },
    { value: 12, odds: "6:1" },
    { value: 13, odds: "8:1" },
    { value: 14, odds: "12:1" },
    { value: 15, odds: "15:1" },
    { value: 16, odds: "20:1" },
    { value: 17, odds: "50:1" }
];

const DICE_COMBINATIONS = [
    [1, 2], [1, 3], [1, 4], [1, 5], [1, 6],
    [2, 3], [2, 4], [2, 5], [2, 6],
    [3, 4], [3, 5], [3, 6],
    [4, 5], [4, 6],
    [5, 6]
];

const DICE_NUMBERS = [1, 2, 3, 4, 5, 6];

const Sicbo = ({ isVisible, onBetSelection, lastBetTime }) => {
    const isMobile = useIsMobile(1200);
    const { CODE, game_type, phpFile, placeBetApi, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [exposureData, setExposureData] = useState([]);
    const socketRef = useRef(null);

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
        if (!Array.isArray(exposureData)) return 0;
        const market = exposureData.find((item) => item.market_id == marketId);
        return market ? market.win_loss || market.total_exposure : 0;
    };

    const renderExposure = (marketId) => {
        return null; // EXPOSURE NOT SHOWN
        // const exposure = getExposure(marketId);
        // if (exposure === 0) return null;
        // return (
        //     <span style={{ color: exposure >= 0 ? "green" : "red", fontSize: "10px", marginTop: "2px" }}>
        //         {exposure}
        //     </span>
        // );
    };

    useEffect(() => {
        const socket = io("https://trubet9.bet:2053", {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        const handleSicboData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) {
                    setGameData(payload);
                }
            } catch (error) {
                console.error("Error processing Sicbo data:", error);
            }
        };

        socket.on("connect", () => {
            console.log(`✅ ${game_type} Connected:`, socket.id);
            socket.emit("Room", game_type);
        });

        socket.on(game_type, handleSicboData);
        socket.on("game", handleSicboData);

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

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

    const BetBox = ({ marketName, className = "", children }) => {
        const market = getMarketByName(marketName);
        const suspended = getIsSuspended(market);
        return (
            <div
                className={`${className} ${suspended ? "suspended" : ""}`}
                onClick={() => handleOddsClick(marketName, market?.b1, market, true, suspended)}
            >
                {children}
                {renderExposure(market?.sid)}
            </div>
        );
    };

    const DiceImage = ({ num }) => (
        <img src={getImage('dice' + num)} alt={`Dice ${num}`} />
    );

    const MobileLayout = () => (
        <div className="d-xl-none">
            <div className="sicbo-top">
                <div className="sicbo-cube-box-container">
                    <div className="sicbo-top-box sicbo-title-box">1:1 Lose if Any Triple</div>
                    <div className="sicbo-cube-box-group">
                        <BetBox marketName="Small" className="sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd">
                            <div>SMALL</div>
                            <div className="sicbo-box-value">4-10</div>
                        </BetBox>
                        <BetBox marketName="ODD" className="sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd">
                            <div>ODD</div>
                            <div className="sicbo-box-value">1:1</div>
                        </BetBox>
                    </div>
                </div>
                <div className="sicbo-cube-box-container">
                    <div className="sicbo-top-box sicbo-title-box">30:1</div>
                    <div className="sicbo-cube-box-group">
                        <BetBox marketName="Any Triple" className="sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd">
                            <div>Any Triple</div>
                        </BetBox>
                    </div>
                </div>
                <div className="sicbo-cube-box-container">
                    <div className="sicbo-top-box sicbo-title-box">1:1 Lose if Any Triple</div>
                    <div className="sicbo-cube-box-group">
                        <BetBox marketName="Even" className="sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd">
                            <div>EVEN</div>
                            <div className="sicbo-box-value">1:1</div>
                        </BetBox>
                        <BetBox marketName="BIG" className="sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd">
                            <div>BIG</div>
                            <div className="sicbo-box-value">11-17</div>
                        </BetBox>
                    </div>
                </div>
            </div>

            <div className="sicbo-middle">
                <div className="sicbo-middle-left">
                    <div className="sicbo-cube-box-container">
                        <div className="sicbo-top-box sicbo-title-box">8:1 Each Double</div>
                        <div className="sicbo-cube-box-group">
                            {DICE_NUMBERS.map(num => (
                                <BetBox key={num} marketName={`Double ${num}`} className="sicbo-cube-box sicbo-square-box sicbo-cube-double">
                                    <DiceImage num={num} /> <DiceImage num={num} />
                                </BetBox>
                            ))}
                        </div>
                    </div>
                    <div className="sicbo-cube-box-container">
                        <div className="sicbo-top-box sicbo-title-box">150:1 Each Triple</div>
                        <div className="sicbo-cube-box-group">
                            {DICE_NUMBERS.map(num => (
                                <BetBox key={num} marketName={`Triple ${num}`} className="sicbo-cube-box sicbo-square-box sicbo-cube-tripple">
                                    <DiceImage num={num} /> <DiceImage num={num} /> <DiceImage num={num} />
                                </BetBox>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="sicbo-middle-right">
                    <div className="sicbo-middle-top-row">
                        {TOTAL_ODDS.map(item => (
                            <BetBox key={item.value} marketName={`Total ${item.value}`} className="sicbo-middle-top-box sicbo-square-box">
                                <div>{item.value}</div>
                                <div className="sicbo-box-value">{item.odds}</div>
                            </BetBox>
                        ))}
                    </div>
                    <div className="sicbo-bottom">
                        <div className="sicbo-cube-box-container">
                            <div className="sicbo-top-box sicbo-title-box">5:1 Two Dice</div>
                            <div className="sicbo-cube-box-group">
                                {DICE_COMBINATIONS.map(([d1, d2], idx) => (
                                    <BetBox
                                        key={idx}
                                        marketName={`Combination ${d1} and ${d2}`}
                                        className="sicbo-cube-box sicbo-square-box sicbo-cube-combination"
                                    >
                                        <DiceImage num={d1} /> <DiceImage num={d2} />
                                    </BetBox>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="sicbo-middle-middle-row">
                        <div className="sicbo-cube-box-container">
                            <div className="sicbo-top-box sicbo-title-box"><span>1:1 On Single</span> <span>2:1 On Double</span> <span>3:1 On Triple</span></div>
                            <div className="sicbo-cube-box-group">
                                {DICE_NUMBERS.map(num => (
                                    <BetBox key={num} marketName={`Single ${num}`} className="sicbo-cube-box sicbo-square-box sicbo-cube-single">
                                        <DiceImage num={num} />
                                    </BetBox>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const DesktopLayout = () => (
        <div className="d-none d-xl-block">
            <div className="sicbo-top">
                <div className="sicbo-top-box sicbo-title-box">1:1 Lose if Any Triple</div>
                <div className="sicbo-top-box sicbo-title-box">30:1</div>
                <div className="sicbo-top-box sicbo-title-box">1:1 Lose if Any Triple</div>
            </div>
            <div className="sicbo-middle">
                <BetBox marketName="Small" className="sicbo-middle-small sicbo-square-box">
                    <div>Small</div>
                    <div className="sicbo-box-value">4-10</div>
                </BetBox>
                <div className="sicbo-middle-midle">
                    <div className="sicbo-middle-top-row">
                        <BetBox marketName="ODD" className="sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd">
                            <div>ODD</div>
                            <div className="sicbo-box-value">1:1</div>
                        </BetBox>
                        {TOTAL_ODDS.slice(0, 7).map(item => (
                            <BetBox key={item.value} marketName={`Total ${item.value}`} className="sicbo-middle-top-box sicbo-square-box">
                                <div>{item.value}</div>
                                <div className="sicbo-box-value">{item.odds}</div>
                            </BetBox>
                        ))}
                        <BetBox marketName="Any Triple" className="sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd">
                            <div>Any Triple</div>
                        </BetBox>
                        {TOTAL_ODDS.slice(7).map(item => (
                            <BetBox key={item.value} marketName={`Total ${item.value}`} className="sicbo-middle-top-box sicbo-square-box">
                                <div>{item.value}</div>
                                <div className="sicbo-box-value">{item.odds}</div>
                            </BetBox>
                        ))}
                        {/* Note: In Desktop, Even is after the totals, but before the Big? Wait, let's check roun.html */}
                        {/* roun.html line 795: Even is after the totals. */}
                        <BetBox marketName="Even" className="sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd">
                            <div>Even</div>
                            <div className="sicbo-box-value">1:1</div>
                        </BetBox>
                    </div>
                    <div className="sicbo-middle-middle-row">
                        <div className="sicbo-cube-box-container">
                            <div className="sicbo-top-box sicbo-title-box"><span>1:1 On Single</span> <span>2:1 On Double</span> <span>3:1 On Triple</span></div>
                            <div className="sicbo-cube-box-group">
                                {DICE_NUMBERS.map(num => (
                                    <BetBox key={num} marketName={`Single ${num}`} className="sicbo-cube-box sicbo-square-box sicbo-cube-single">
                                        <DiceImage num={num} />
                                    </BetBox>
                                ))}
                            </div>
                        </div>
                        <div className="sicbo-cube-box-container">
                            <div className="sicbo-top-box sicbo-title-box">8:1 Each Double</div>
                            <div className="sicbo-cube-box-group">
                                {DICE_NUMBERS.map(num => (
                                    <BetBox key={num} marketName={`Double ${num}`} className="sicbo-cube-box sicbo-square-box sicbo-cube-double">
                                        <DiceImage num={num} /> <DiceImage num={num} />
                                    </BetBox>
                                ))}
                            </div>
                        </div>
                        <div className="sicbo-cube-box-container">
                            <div className="sicbo-top-box sicbo-title-box">150:1 Each Triple</div>
                            <div className="sicbo-cube-box-group">
                                {DICE_NUMBERS.map(num => (
                                    <BetBox key={num} marketName={`Triple ${num}`} className="sicbo-cube-box sicbo-square-box sicbo-cube-tripple">
                                        <DiceImage num={num} /> <DiceImage num={num} /> <DiceImage num={num} />
                                    </BetBox>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <BetBox marketName="BIG" className="sicbo-middle-big sicbo-square-box">
                    <div>Big</div>
                    <div className="sicbo-box-value">11-17</div>
                </BetBox>
            </div>
            <div className="sicbo-bottom">
                <div className="sicbo-cube-box-container">
                    <div className="sicbo-top-box sicbo-title-box">5:1 Two Dice</div>
                    <div className="sicbo-cube-box-group">
                        {DICE_COMBINATIONS.map(([d1, d2], idx) => (
                            <BetBox
                                key={idx}
                                marketName={`Combination ${d1} and ${d2}`}
                                className="sicbo-cube-box sicbo-square-box sicbo-cube-combination"
                            >
                                <DiceImage num={d1} /> <DiceImage num={d2} />
                            </BetBox>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="casino-table sicbo">
            <CasinoVideo
                gameName={game_name}
                roundId={currentGame?.mid}
                videoSrc={iframe_url}
                isCardDrawerOpen={isCardDrawerOpen}
                setIsCardDrawerOpen={setIsCardDrawerOpen}
                autotime={currentGame?.autotime}
          totalTime={currentGame?.ft}/>
            <div className="casino-detail">
                {isMobile ? <MobileLayout /> : <DesktopLayout />}
            </div>
        </div>
    );
};

export default Sicbo;
