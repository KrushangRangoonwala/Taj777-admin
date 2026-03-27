import React, { useState, useEffect } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getValueAfterDot, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import LastResult from "./components/LastResult";

const BetBox = ({ market, marketName, nation, className = "", children, type = "back", handleOddsClick }) => {
    const suspended = getIsSuspended(market);
    let odds = 0;

    if (nation) {
        const nationData = market?.odds?.find((o) => o.nat === nation);
        odds = type === "back" ? nationData?.b : nationData?.l;
    } else {
        odds = type === "back" ? market?.b1 : market?.l1;
    }

    return (
        <div
            className={`${className} ${suspended ? "suspended" : ""}`}
            onClick={() => handleOddsClick(marketName, odds, market, type === "back", suspended)}
        >
            {suspended ? <img src="/assets/images/lock.svg" alt="lock" style={{ width: "15px", height: "15px", opacity: 1, zIndex: 10, position: "relative" }} /> : children(odds)}
        </div>
    );
};

const Cards = ({ currentGame, result_image }) => (
    <div className="casino-video-cards-container">
        <div>
            <span data-v-b64efdfa="">
                <img data-v-b64efdfa="" src={getImage(currentGame?.C1, result_image)} alt="C1" />
            </span>
            <span data-v-b64efdfa="">
                <img data-v-b64efdfa="" src={getImage(currentGame?.C3, result_image)} alt="C3" />
            </span>
            <span data-v-b64efdfa="">
                <img data-v-b64efdfa="" src={getImage(currentGame?.C5, result_image)} alt="C5" />
            </span>
        </div>
        <div>
            <span data-v-b64efdfa="">
                <img data-v-b64efdfa="" src={getImage(currentGame?.C2, result_image)} alt="C2" />
            </span>
            <span data-v-b64efdfa="">
                <img data-v-b64efdfa="" src={getImage(currentGame?.C4, result_image)} alt="C4" />
            </span>
            <span data-v-b64efdfa="">
                <img data-v-b64efdfa="" src={getImage(currentGame?.C6, result_image)} alt="C6" />
            </span>
        </div>
    </div>
);

const VIPTeenPatti1Day = ({ onBetSelection }) => {
    const { game_type: raw_game_type, phpFile, game_name, iframe_url, result_image } = useGetFileData();
    const game_type = raw_game_type || "teen62";
    const [gameData, setGameData] = useState(null);
    const [lastResults, setLastResults] = useState([]);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);

    const socket = useSocket("casino");

    useEffect(() => {
        if (!socket) return;

        const handleData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) {
                    setGameData(payload);
                }
            } catch (error) {
                console.error("Error processing TeenPatti1Day data:", error);
            }
        };

        const handleConnect = () => {
            console.log(`✅ ${game_type} Connected:`, socket.id);
            socket.emit("Room", game_type || "teen");
        };

        const handleResults = (data) => {
            try {
                const payload = Array.isArray(data) ? data[1] : data;
                if (payload?.res) {
                    const formattedResults = payload.res.map(r => ({
                        mid: r.mid,
                        res: r.win === "1" ? "A" : r.win === "2" ? "B" : r.win === "0" ? "T" : r.win
                    }));
                    setLastResults(formattedResults);
                }
            } catch (error) {
                console.error("Error processing gameResult data:", error);
            }
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on("game", handleData);
        socket.on(game_type, handleData);
        socket.on("gameResult", handleResults);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleData);
            socket.off(game_type, handleData);
            socket.off("gameResult", handleResults);
        };
    }, [socket, game_type]);

    // useEffect(() => {
    //     const fetchExposure = async () => {
    //         if (!gameData?.t1?.[0]?.mid) return;
    //         try {
    //             const response = await fetchCasinoExposureApi({
    //                 markettype: CODE,
    //                 main_event_id: gameData.t1[0].mid,
    //                 curPageName: phpFile,
    //             });
    //             if (Array.isArray(response?.data)) {
    //                 setExposureData(response.data);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching exposure:", error);
    //         }
    //     };
    //     fetchExposure();
    // }, [gameData?.t1?.[0]?.mid, lastBetTime, CODE, phpFile]);

    // const getExposure = (marketId) => {
    //     if (!Array.isArray(exposureData)) return 0;
    //     const market = exposureData.find((item) => item.market_id == marketId);
    //     return market ? market.win_loss || market.total_exposure : 0;
    // };

    // const renderExposure = (marketId, isUpDown = false) => {
    //     const exposure = getExposure(marketId);
    //     if (exposure === 0) return 0;
    //     return (
    //         <span className={`${isUpDown ? "up-down-book" : "mr-2"} ${exposure >= 0 ? "book-black" : "book-red"}`}>
    //             {exposure}
    //         </span>
    //     );
    // };

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

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

    const getMarketBySid = (sid) => marketData.find((item) => item.sid == sid);

    const renderResultClass = (res) => {
        if (res === "B") return "resultb";
        if (res === "A") return "resulta";
        return "";
    };

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table teenpatti1day">
                                <CasinoVideo
                                    gameName={"V VIP Teenpatti 1-Day"}
                                    roundId={currentGame?.mid}
                                    videoSrc={iframe_url}
                                    results={lastResults}
                                    timeLeft={currentGame?.autotime || 0}
                                    totalTime={currentGame?.ft || 30}
                                    isCardDrawerOpen={isCardDrawerOpen}
                                    setIsCardDrawerOpen={setIsCardDrawerOpen}
                                    CardsComponent={() => <Cards currentGame={currentGame} result_image={result_image} />}
                                    resultPath={phpFile}
                                    showResults={false}
                                />

                                <div className="casino-detail">
                                    <div className="teen1daycasino-container d-none-small">
                                        <div className="teen1dayleft">
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name no-border casino-bl-box-title">
                                                    <div className="playera">Player A</div>
                                                </div>
                                                <div className="casino-bl-box casino-bl-box-title">
                                                    <div className="casino-bl-box-item"><b>Back</b></div>
                                                    <div className="casino-bl-box-item"><b>Lay</b></div>
                                                </div>
                                            </div>
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name">
                                                    <b>Main</b>
                                                    <div className="float-right">
                                                        <span className="mr-2 casino-book book-black">0</span>
                                                        <i data-toggle="collapse" data-target="#range1" aria-expanded="false" className="fas fa-info-circle collapsed"></i>
                                                        <div id="range1" className="icon-range collapse">
                                                            R:<span>100</span>-<span>5L</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <BetBox market={getMarketBySid("1")} marketName="Player A Main" className="back casino-bl-box-item" type="back" handleOddsClick={handleOddsClick}>
                                                        {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                    </BetBox>
                                                    <BetBox market={getMarketBySid("1")} marketName="Player A Main" className="lay casino-bl-box-item" type="lay" handleOddsClick={handleOddsClick}>
                                                        {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                    </BetBox>
                                                </div>
                                            </div>
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name casino-card-img">
                                                    <b>Consecutive</b>
                                                    <div className="float-right">
                                                        <span className="mr-2 casino-book book-black">0</span>
                                                        <i data-toggle="collapse" data-target="#range6" aria-expanded="false" className="fas fa-info-circle collapsed"></i>
                                                        <div id="range6" className="icon-range collapse">
                                                            R:<span>100</span>-<span>1L</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <BetBox market={getMarketBySid("17")} marketName="Player A Consecutive" className="back casino-bl-box-item" type="back" handleOddsClick={handleOddsClick}>
                                                        {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                    </BetBox>
                                                    <BetBox market={getMarketBySid("17")} marketName="Player A Consecutive" className="lay casino-bl-box-item" type="lay" handleOddsClick={handleOddsClick}>
                                                        {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                    </BetBox>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="teen1daycenter"></div>
                                        <div className="teen1dayright">
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name no-border casino-bl-box-title">
                                                    <div className="playerb">Player B</div>
                                                </div>
                                                <div className="casino-bl-box casino-bl-box-title">
                                                    <div className="casino-bl-box-item"><b>Back</b></div>
                                                    <div className="casino-bl-box-item"><b>Lay</b></div>
                                                </div>
                                            </div>
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name">
                                                    <b>Main</b>
                                                    <div className="float-right">
                                                        <span className="mr-2 casino-book book-black">0</span>
                                                        <i data-toggle="collapse" data-target="#range7" aria-expanded="false" className="fas fa-info-circle collapsed"></i>
                                                        <div id="range7" className="icon-range collapse">
                                                            R:<span>100</span>-<span>5L</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <BetBox market={getMarketBySid("2")} marketName="Player B Main" className="back casino-bl-box-item" type="back" handleOddsClick={handleOddsClick}>
                                                        {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                    </BetBox>
                                                    <BetBox market={getMarketBySid("2")} marketName="Player B Main" className="lay casino-bl-box-item" type="lay" handleOddsClick={handleOddsClick}>
                                                        {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                    </BetBox>
                                                </div>
                                            </div>
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name casino-card-img">
                                                    <b>Consecutive</b>
                                                    <div className="float-right">
                                                        <span className="mr-2 casino-book book-black">0</span>
                                                        <i data-toggle="collapse" data-target="#range12" aria-expanded="false" className="fas fa-info-circle collapsed"></i>
                                                        <div id="range12" className="icon-range collapse">
                                                            R:<span>100</span>-<span>1L</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box">
                                                    <BetBox market={getMarketBySid("18")} marketName="Player B Consecutive" className="back casino-bl-box-item" type="back" handleOddsClick={handleOddsClick}>
                                                        {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                    </BetBox>
                                                    <BetBox market={getMarketBySid("18")} marketName="Player B Consecutive" className="lay casino-bl-box-item" type="lay" handleOddsClick={handleOddsClick}>
                                                        {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                    </BetBox>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="teen1dayother">
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name no-border"></div>
                                                {[1, 2, 3, 4, 5, 6].map((num) => (
                                                    <div className="casino-bl-box" key={num}>
                                                        <div className="casino-bl-box-item"><b>Card {num}</b></div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="casino-box-row mb-3">
                                                <div className="casino-nation-name mb-4">
                                                    <b>Odd</b>
                                                    <div className="float-right">
                                                        <i data-toggle="collapse" data-target="#range13" className="fas fa-info-circle"></i>
                                                        <div id="range13" className="collapse icon-range">
                                                            R:<span>100</span>-<span>25K</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {[11, 12, 13, 14, 15, 16].map((sid, index) => (
                                                    <div className="casino-bl-box" key={sid}>
                                                        <BetBox market={getMarketBySid(sid)} marketName={`Card ${index + 1} Odd`} nation="Odd" className="back casino-bl-box-item" type="back" handleOddsClick={handleOddsClick}>
                                                            {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                        </BetBox>
                                                        <div className="casino-book book-black">0</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name mb-4">
                                                    <b>Even</b>
                                                    <div className="float-right">
                                                        <i data-toggle="collapse" data-target="#range14" className="fas fa-info-circle"></i>
                                                        <div id="range14" className="collapse icon-range">
                                                            R:<span>100</span>-<span>25K</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {[11, 12, 13, 14, 15, 16].map((sid, index) => (
                                                    <div className="casino-bl-box" key={sid}>
                                                        <BetBox market={getMarketBySid(sid)} marketName={`Card ${index + 1} Even`} nation="Even" className="back casino-bl-box-item" type="back" handleOddsClick={handleOddsClick}>
                                                            {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                        </BetBox>
                                                        <div className="casino-book book-black">0</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile View */}
                                    <div className="teen1daycasino-container d-none-big">
                                        <div className="casino-box-row">
                                            <div className="casino-bl-box casino-bl-box-title">
                                                <div className="casino-bl-box-item">
                                                    <b>Main</b>
                                                    <div className="float-right">
                                                        <i data-toggle="collapse" data-target="#range1" className="fas fa-info-circle float-right"></i>
                                                        <div id="range1" className="collapse icon-range">
                                                            R:<span>100</span>-<span>5L</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box-item"><b>Back</b></div>
                                                <div className="casino-bl-box-item"><b>Lay</b></div>
                                            </div>
                                            {[
                                                { sid: "1", name: "Player A" },
                                                { sid: "2", name: "Player B" }
                                            ].map((player) => (
                                                <div className="casino-bl-box" key={player.sid}>
                                                    <div className="casino-bl-box-item casino-odds-name">
                                                        <span>{player.name}</span>
                                                        <span className="float-right book-black">0</span>
                                                    </div>
                                                    <BetBox market={getMarketBySid(player.sid)} marketName={`${player.name} Main`} className="back casino-bl-box-item" type="back" handleOddsClick={handleOddsClick}>
                                                        {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                    </BetBox>
                                                    <BetBox market={getMarketBySid(player.sid)} marketName={`${player.name} Main`} className="lay casino-bl-box-item" type="lay" handleOddsClick={handleOddsClick}>
                                                        {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                    </BetBox>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="casino-box-row">
                                            <div className="casino-bl-box casino-bl-box-title">
                                                <div className="casino-bl-box-item casino-card-img">
                                                    <b>Consecutive</b>
                                                    <div className="float-right">
                                                        <i data-toggle="collapse" data-target="#range6" className="fas fa-info-circle float-right"></i>
                                                        <div id="range6" className="collapse icon-range">
                                                            R:<span>100</span>-<span>1L</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box-item"><b>Back</b></div>
                                                <div className="casino-bl-box-item"><b>Lay</b></div>
                                            </div>
                                            {[
                                                { sid: "17", name: "Player A" },
                                                { sid: "18", name: "Player B" }
                                            ].map((player) => (
                                                <div className="casino-bl-box" key={player.sid}>
                                                    <div className="casino-bl-box-item casino-odds-name">
                                                        <span>{player.name}</span>
                                                        <span className="float-right book-black">0</span>
                                                    </div>
                                                    <BetBox market={getMarketBySid(player.sid)} marketName={`${player.name} Consecutive`} className="back casino-bl-box-item" type="back" handleOddsClick={handleOddsClick}>
                                                        {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                    </BetBox>
                                                    <BetBox market={getMarketBySid(player.sid)} marketName={`${player.name} Consecutive`} className="lay casino-bl-box-item" type="lay" handleOddsClick={handleOddsClick}>
                                                        {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                    </BetBox>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="casino-box-row teen1dayodev">
                                            <div className="casino-bl-box casino-bl-box-title">
                                                <div className="casino-bl-box-item casino-card-img">
                                                    <b>Cards</b>
                                                    <div className="float-right">
                                                        <i data-toggle="collapse" data-target="#range7" className="fas fa-info-circle float-right"></i>
                                                        <div id="range7" className="collapse icon-range">
                                                            R:<span>100</span>-<span>25K</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="casino-bl-box-item"><b>Odd</b></div>
                                                <div className="casino-bl-box-item"><b>Even</b></div>
                                            </div>
                                            {[11, 12, 13, 14, 15, 16].map((sid, index) => (
                                                <div className="casino-bl-box" key={sid}>
                                                    <div className="casino-bl-box-item casino-odds-name"><span>Card {index + 1}</span></div>
                                                    <BetBox market={getMarketBySid(sid)} marketName={`Card ${index + 1} Odd`} nation="Odd" className="back casino-bl-box-item" type="back" handleOddsClick={handleOddsClick}>
                                                        {(odds) => (
                                                            <>
                                                                <span className="casino-box-odd">{odds || 0}</span>
                                                                <span className="book-black">0</span>
                                                            </>
                                                        )}
                                                    </BetBox>
                                                    <BetBox market={getMarketBySid(sid)} marketName={`Card ${index + 1} Even`} nation="Even" className="back casino-bl-box-item" type="back" handleOddsClick={handleOddsClick}>
                                                        {(odds) => (
                                                            <>
                                                                <span className="casino-box-odd">{odds || 0}</span>
                                                                <span className="book-black">0</span>
                                                            </>
                                                        )}
                                                    </BetBox>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <LastResult results={lastResults} gameName={game_name} resultPath={phpFile} showRawLabel={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <CasinoRightSidebar />
                </div>
            </div>
        </div>
    );
};

export default VIPTeenPatti1Day;

