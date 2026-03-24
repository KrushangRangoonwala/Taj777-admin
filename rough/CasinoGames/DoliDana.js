import React, { useState, useEffect } from "react";
import { fetchCasinoExposureApi } from "../../api/api";
import { getImage, getValueAfterDot, getIsSuspended } from "../../utilies/helpers";
import { useGetFileData } from "../../hooks/useGetFileData";
import CasinoVideo from "./components/CasinoVideo";
import useIsMobile from "../../hooks/useIsMobile";
import { useSocket } from "../Socket/useSocket";
import RemarkMarquee from "./components/RemarkMarquee";

const DoliDana = ({ isVisible, onBetSelection, lastBetTime }) => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [exposureData, setExposureData] = useState([]);
    const isMobile = useIsMobile(767);

    useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.[0]?.mid) return;
            try {
                const [res1, res2] = await Promise.all([
                    fetchCasinoExposureApi({
                        markettype: CODE,
                        main_event_id: gameData.t1[0].mid,
                        curPageName: phpFile,
                    }),
                    fetchCasinoExposureApi({
                        markettype: CODE,
                        main_event_id: gameData.t1[0].mainMid,
                        curPageName: phpFile,
                    }),
                ])
                const aaa = [...res2?.data, ...res1?.data]
                const bbb = Array.isArray(aaa) ? aaa : Object.values(aaa || {});
                setExposureData(bbb);
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

    const socket = useSocket("casino");
    useEffect(() => {
        if (!socket) return;

        const handleGameData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) {
                    setGameData(payload);
                }
            } catch (error) {
                console.error("Error processing DoliDana data:", error);
            }
        };

        const handleConnect = () => {
            socket.emit("Room", game_type);
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on("game", handleGameData);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleGameData);
        };
    }, [socket, game_type]);

    const currentGame = gameData?.t1?.[0];
    const data = gameData?.t2 || [];

    const handleOddsClick = (marketName, odds, market, isBack, suspended, marketId) => {
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
                marketId: marketId ?? market.sid,
                eventId: (market.sid == 1 || market.sid == 2) ? getValueAfterDot(currentGame?.mainMid) : getValueAfterDot(currentGame?.mid),
            });
        }
    };

    const isSuspended = (market) => getIsSuspended(market);

    const cardsString = currentGame?.C1 || "";
    const dice = cardsString.split(",").filter(c => c !== "");

    const c1 = currentGame?.C1 || "";
    const c2 = currentGame?.C2 || "";

    const CardsComponent = () => (
        <div>
            <span>
                {/* {dice.map((d, i) => (
                    <img key={i} src={`/assets/cards_new/dice${d}.png`} alt={`dice${d}`} />
                    ))} */}
                <img src={`/assets/cards_new/dolidana-dice/dice${c1}.png`} alt={`dice${c1}`} />
                <img src={`/assets/cards_new/dolidana-dice/dice${c2}.png`} alt={`dice${c2}`} />
            </span>
        </div>
    );

    const getMarket = (nat) => data.find(m => m.nat === nat);

    const renderBetBox = (nat, displayName = null) => {
        const market = getMarket(nat);
        const name = displayName || nat;
        const exposure = getExposure(market?.sid);

        const exp = getExposure(market?.sid);
        const isLocktop = isSuspended(market) && exp && exp != 0 ? 'lock-top' : '';
        return (
            <div className="doli-odds-box">
                <div className="odd-name">{name}</div>
                <div className="casino-bl-box">
                    <div
                        className={`back casino-bl-box-item ${isSuspended(market) ? "suspended" : ""} ${isLocktop}`}
                        onClick={() => handleOddsClick(name, market?.b1, market, true, isSuspended(market))}
                    >
                        <span className="casino-box-odd">{market?.b1 || "0"}</span>
                        <span className={`${exposure !== 0 ? "d-block" : "d-none"} ${exposure > 0 ? "book-green" : "book-red"}`}>
                            {exposure}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const playerA = getMarket("Player A");
    const playerB = getMarket("Player B");
    const expA = getExposure(playerA?.sid);
    const expB = getExposure(playerB?.sid);

    return (
        <div className="casino-table doli-dana">
            <CasinoVideo
                gameName={game_name}
                roundId={currentGame?.mid}
                videoSrc={iframe_url}
                isCardDrawerOpen={isCardDrawerOpen}
                setIsCardDrawerOpen={setIsCardDrawerOpen}
                autotime={currentGame?.autotime}
                totalTime={currentGame?.ft}
                CardsComponent={CardsComponent}
                cards={dice}
                isShuffleIcon={false}
            />

            <div className="casino-detail">
                <div className="doli-main">
                    <div className="players-bet">
                        <div className="casino-box-row">
                            <div className="casino-nation-name"><b>Player A</b>
                                <div className="float-right">
                                    <span className={`mr-2 ${expA === 0 ? "d-none" : ""} ${expA > 0 ? "book-green" : "book-red"}`}>
                                        {expA}
                                    </span>
                                </div>
                            </div>
                            <div className="casino-bl-box">
                                <div
                                    className={`back casino-bl-box-item ${isSuspended(playerA) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick("Player A", playerA?.b1, playerA, true, isSuspended(playerA))}
                                >
                                    <span className="casino-box-odd">{playerA?.b1 || "0"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="casino-box-row">
                            <div className="casino-nation-name"><b>Player B</b>
                                <div className="float-right">
                                    <span className={`mr-2 ${expB === 0 ? "d-none" : ""} ${expB > 0 ? "book-green" : "book-red"}`}>
                                        {expB}
                                    </span>
                                </div>
                            </div>
                            <div className="casino-bl-box">
                                <div
                                    className={`back casino-bl-box-item ${isSuspended(playerB) ? "suspended" : ""}`}
                                    onClick={() => handleOddsClick("Player B", playerB?.b1, playerB, true, isSuspended(playerB))}
                                >
                                    <span className="casino-box-odd">{playerB?.b1 || "0"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="side-bets">
                        <div className="any-pair">
                            {renderBetBox("Any Pair")}
                        </div>
                        <div className="odd-even-pair">
                            <div className="bets-box">
                                {renderBetBox("Odd")}
                                {renderBetBox("Even")}
                            </div>
                        </div>
                        <div className="lucky7-pair">
                            <div className="bets-box">
                                {renderBetBox("Less than 7")}
                                <div className="doli-odds-box">
                                    <div className="seven-box"><img src="/assets/cards_new/trape-seven.png" alt="seven" /></div>
                                </div>
                                {renderBetBox("Greater than 7")}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="doli-other-bets">
                    <div className="particular-pair">
                        <h4>Particular Pair</h4>
                        <div className="bets-box">
                            {renderBetBox("1-1 Pair")}
                            {renderBetBox("2-2 Pair")}
                            {renderBetBox("3-3 Pair")}
                            {renderBetBox("4-4 Pair")}
                            {renderBetBox("5-5 Pair")}
                            {renderBetBox("6-6 Pair")}
                        </div>
                    </div>
                    <div className="sum-odds">
                        <h4>Odds of Sum Total</h4>
                        <div className="bets-box">
                            {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(sum => (
                                renderBetBox(`Sum Total ${sum}`)
                            ))}
                        </div>
                    </div>
                </div>

                {/* <RemarkMarquee remark={currentGame?.remark} /> */}
            </div>
        </div>
    );
};

export default DoliDana;
