import React, { useState, useEffect } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getValueAfterDot, getIsSuspended, getImage, getExposureClass } from "../../../utilies/helpers";
import { fetchCasinoExposureApi } from "../../../api/API";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import LastResult from "./components/LastResult";
import BetLimitInfo from "./components/BetLimitInfo";

const Baccarat2 = ({ onBetSelection, lastBetTime }) => {
    const { game_type, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [lastResults, setLastResults] = useState([]);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [exposureData, setExposureData] = useState([]);
    const [openRanges, setOpenRanges] = useState({});

    const toggleRange = (id) => {
        setOpenRanges((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const socket = useSocket("casino");

    useEffect(() => {
        if (!socket) return;

        const handleData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[1] || data[0] : data;
                if (payload) {
                    setGameData(payload);
                    if (payload.res) {
                        setLastResults(payload.res);
                    } else if (payload.last_results) {
                        setLastResults(payload.last_results);
                    }
                }
            } catch (error) {
                console.error("Error processing Baccarat data:", error);
            }
        };

        const handleResult = (data) => {
            try {
                const payload = Array.isArray(data) ? data[1] || data[0] : data;
                if (payload?.res) {
                    setLastResults(payload.res);
                }
            } catch (error) {
                console.error("Error processing Baccarat result:", error);
            }
        };

        const handleConnect = () => {
            console.log(`✅ ${game_type} Connected:`, socket.id);
            socket.emit("Room", "baccarat2");
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on("game", handleData);
        socket.on("baccarat2", handleData);
        socket.on("gameResult", handleResult);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleData);
            socket.off("baccarat2", handleData);
            socket.off("gameResult", handleResult);
        };
    }, [socket, game_type]);

    useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.[0]?.mid) return;
            try {
                const response = await fetchCasinoExposureApi({
                    markettype: "BACCARAT2",
                    main_event_id: getValueAfterDot(gameData.t1[0].mid),
                    curPageName: "live_baccarat2.php",
                });
                if (Array.isArray(response?.data)) {
                    setExposureData(response.data);
                }
            } catch (error) {
                console.error("Error fetching Baccarat exposure:", error);
            }
        };

        fetchExposure();
    }, [gameData?.t1?.[0]?.mid, lastBetTime]);

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const getMarketBySid = (sid) => marketData.find((m) => String(m.sid) === String(sid));

    const getExposure = (marketId) => {
        const market = exposureData.find((item) => String(item.market_id) === String(marketId));
        return market ? market.win_loss || market.total_exposure : 0;
    };

    const handleOddsClick = (marketName, odds, market) => {
        if (!market || getIsSuspended(market) || odds == 0) return;

        if (onBetSelection) {
            onBetSelection({
                teamName: marketName,
                odds: odds,
                minBet: market?.min || 100,
                maxBet: market?.max || 100000,
                isBack: true,
                marketId: market.sid,
                eventId: getValueAfterDot(currentGame?.mid),
            });
        }
    };

    const formatOdds = (odds) => {
        if (!odds) return "";
        let strOdds = String(odds);
        if (strOdds.includes(".00")) return strOdds.replace(".00", ":1");
        if (strOdds.includes(":00")) return strOdds.replace(":00", ":1");
        if (strOdds === "1") return "1:1";
        return strOdds.includes(":") ? strOdds : `${strOdds}:1`;
    };

    const getMarketOdds = (sid) => {
        const market = getMarketBySid(sid);
        if (!market) return "";
        return formatOdds(market.b1);
    };

    const OddBlock = ({ sid, label, oddsText, rangeId }) => {
        const market = getMarketBySid(sid);
        const suspended = getIsSuspended(market);
        const odds = suspended ? 0 : market?.b1 || 0;
        const exposure = getExposure(sid);
        const displayOdds = oddsText || formatOdds(odds);

        return (
            <div className="baccarat-odd-block">
                <div
                    className={`baccarat-odd-name ${suspended ? "suspended" : ""}`}
                    onClick={() => handleOddsClick(label, odds, market)}
                >
                    {suspended && (
                        <img
                            src="/assets/images/lock.svg"
                            alt="lock"
                            style={{ width: "12px", position: "absolute", left: "calc(50% - 6px)", top: "calc(50% - 6px)", zIndex: 100, filter: "brightness(0)" }}
                        />
                    )}
                    {label} {displayOdds}
                </div>
                <div className={`baccarat-odd-val ${getExposureClass(exposure) || "book-black"}`}>{exposure || 0}</div>
                <div className="casino-min-max">
                    <BetLimitInfo
                        id={`range${rangeId}`}
                        openRanges={openRanges}
                        toggleRange={toggleRange}
                        min={market?.min}
                        max={market?.max}
                        iconClass="float-right"
                        fallbackMax={100000}
                    />
                </div>
            </div>
        );
    };

    const BetSection = ({ sid, label, className, cards = [], rangeId }) => {
        const market = getMarketBySid(sid);
        const suspended = getIsSuspended(market);
        const odds = suspended ? 0 : market?.b1 || 0;
        const exposure = getExposure(sid);
        const displayOdds = formatOdds(odds);

        const getLockStyle = () => {
            if (className.includes("tie")) {
                return { width: "15px", position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 100, filter: "brightness(0)" };
            }
            if (className.includes("banker")) {
                return { width: "15px", position: "absolute", right: "5px", bottom: "75px", zIndex: 100, filter: "brightness(0)" };
            }
            return { width: "15px", position: "absolute", left: "5px", bottom: "75px", zIndex: 100, filter: "brightness(0)" };
        };

        return (
            <div className={className} onClick={() => handleOddsClick(label, odds, market)}>
                <div className={`baccarat-bets-name ${suspended ? "suspended" : ""}`}>
                    {suspended && (
                        <img
                            src="/assets/images/lock.svg"
                            alt="lock"
                            style={getLockStyle()}
                        />
                    )}
                    <div>{label}{cards.length > 0 ? ` ${displayOdds}` : ""}</div>
                    <div className="mb-0" style={{ position: "relative", zIndex: 100 }}>
                        {cards.length > 0 ? (
                            <>
                                {cards.map((cardKey, index) => {
                                    const card = currentGame?.[cardKey];
                                    const isOptional = cardKey === "C5" || cardKey === "C6";
                                    const isActive = card && card !== "1" && card !== "0";

                                    if (isOptional && !isActive) return null;

                                    return (
                                        <span key={index} data-v-b64efdfa="" className={isOptional ? (cardKey === "C5" ? "l-rotate" : "r-rotate") : ""}>
                                            <img data-v-b64efdfa="" src={getImage(card || '1', result_image)} alt={cardKey} />
                                        </span>
                                    );
                                })}
                            </>
                        ) : (
                            displayOdds
                        )}
                    </div>
                </div>
                <div className={`baccarat-bets-val ${getExposureClass(exposure) || "book-black"}`}>{exposure || 0}</div>
                <div className="casino-min-max">
                    <BetLimitInfo
                        id={`range${rangeId}`}
                        openRanges={openRanges}
                        toggleRange={toggleRange}
                        min={market?.min}
                        max={market?.max}
                        fallbackMax={100000}
                    />
                </div>
            </div>
        );
    };

    const Cards = () => null;

    return (
        <div className="detail-page-container">
            <style>{`
                .baccarat .baccarat-bets-odds { width: 100%; display: flex; flex-wrap: wrap; margin: 0 auto; }
                .baccarat .baccarat-odds { display: flex; width: 100%; margin-bottom: 78px; padding-top: 0; }
                .baccarat .baccarat-odd-block { flex: 1 1 auto; margin-right: 4px; position: relative; }
                .baccarat .baccarat-odd-block .baccarat-odd-name { padding: 8px 2px; text-align: center; cursor: pointer; background-color: #444; color: #ddd; text-transform: uppercase; position: relative; }
                .baccarat .baccarat-odd-block .baccarat-odd-val { position: absolute; left: 50%; transform: translateX(-50%); bottom: -25px; }
                .baccarat .baccarat-bets { display: flex; width: 100%; position: relative; padding-bottom: 15px; }
                .baccarat .player-pair, .baccarat .banker-pair { width: 15%; height: 90px; margin-top: 15px; position: relative; }
                .baccarat .player, .baccarat .banker { width: 35%; height: 120px; position: relative; }
                .baccarat .tie { position: absolute; width: 120px; height: 120px; border-radius: 50%; left: 50%; transform: translateX(-50%); top: 2px; z-index: 50; }
                .baccarat .baccarat-bets-name { height: 100%; display: flex; justify-content: center; flex-direction: column; color: #fff; text-align: center; text-transform: uppercase; cursor: pointer; position: relative; }
                .baccarat .player-pair .baccarat-bets-name, .baccarat .player .baccarat-bets-name { background-color: #509bff; }
                .baccarat .banker-pair .baccarat-bets-name, .baccarat .banker .baccarat-bets-name { background-color: #d3393d; }
                .baccarat .tie .baccarat-bets-name { background-color: #11b24b; border-radius: 50%; border: 0px solid #000; }
                .baccarat .player img, .baccarat .banker img { height: 60px; margin: 0 2px; }
                .l-rotate img { transform: rotate(-90deg); }
                .r-rotate img { transform: rotate(90deg); }
                .baccarat .baccarat-bets-val { text-align: center; line-height: 18px; }
                .suspended { position: relative; cursor: not-allowed; }
                .suspended::after { content: ''; position: absolute; inset: 0; background-color: rgba(255, 255, 255, 0.6); z-index: 10; pointer-events: none; }
                @media (max-width: 767px) {
                    .baccarat .baccarat-bets-odds { width: 100%; }
                    .baccarat .baccarat-odds { padding: 15px 5px 0; margin-bottom: 0; }
                    .baccarat .baccarat-bets { padding: 20px 5px; margin-top: 30px; height: 110px; }
                    .baccarat .player-pair, .baccarat .banker-pair { height: 60px; }
                    .baccarat .player, .baccarat .banker { height: 90px; }
                    .baccarat .tie { height: 90px; width: 90px; top: 20px; }
                    .baccarat .player img, .baccarat .banker img { height: 30px; }
                    .baccarat-bets-name img[alt="lock"] { bottom: 45px !important; }
                }
            `}</style>
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table baccarat">
                            <CasinoVideo
                                gameName="Baccarat 2"
                                roundId={currentGame?.mid}
                                videoSrc={iframe_url}
                                results={lastResults}
                                timeLeft={currentGame?.autotime || 0}
                                totalTime={currentGame?.ft || 30}
                                // isCardDrawerOpen={isCardDrawerOpen}
                                // setIsCardDrawerOpen={setIsCardDrawerOpen}
                                CardsComponent={Cards}
                                resultPath="baccarat2"
                                showCardDrawer={false}
                                showLastResults={false}
                            />

                            <div className="casino-detail">
                                <div className="baccarat-bets-odds pt-3">
                                    <div className="baccarat-odds">
                                        <OddBlock sid={6} label="Score 1-4" oddsText={getMarketOdds(6) || "7.5:1"} rangeId="1" />
                                        <OddBlock sid={7} label="Score 5-6" oddsText={getMarketOdds(7) || "4:1"} rangeId="2" />
                                        <OddBlock sid={8} label="Score 7" oddsText={getMarketOdds(8) || "4.5:1"} rangeId="3" />
                                        <OddBlock sid={9} label="Score 8" oddsText={getMarketOdds(9) || "3:1"} rangeId="4" />
                                        <OddBlock sid={10} label="Score 9" oddsText={getMarketOdds(10) || "2.5:1"} rangeId="10" />
                                    </div>

                                    <div className="baccarat-bets">
                                        <BetSection sid={4} label="Player Pair" className="player-pair" rangeId="5" />
                                        <BetSection sid={1} label="Player" className="player" cards={["C5", "C3", "C1"]} rangeId="6" />
                                        <BetSection sid={3} label="Tie" className="tie" rangeId="7" />
                                        <BetSection sid={2} label="Banker" className="banker" cards={["C2", "C4", "C6"]} rangeId="8" />
                                        <BetSection sid={5} label="Banker Pair" className="banker-pair" rangeId="9" />
                                    </div>
                                </div>
                                <LastResult results={lastResults} resultPath="baccarat2" />
                            </div>
                        </div>
                    </div>
                </div>

                <CasinoRightSidebar />
            </div>
        </div>
    );
};

export default Baccarat2;
