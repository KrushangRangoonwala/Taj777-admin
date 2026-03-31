import React, { useState, useEffect } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getCardImage, getMarketByNation, getValueAfterDot, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import LastResult from "./components/LastResult";

const AAA2_DATA = {
    game_code: "aaa2",
    game_name: "Amar Akbar Anthony 2",
    game_category: "Bollywood",
    game_socket: "aaa2",
    game_image: "http://159.65.143.49/~sevennew/storage/front/img/casinoicons/aaa2.jpg",
    priority: "2",
    iframe_url: "https://casino.diamondcricketid.com/swiftdizire/?id=3090",
    result_image: "cards_new"
};

const AAA2 = ({ onBetSelection, lastBetTime }) => {
    // We use the provided metadata for core settings
    const {
        game_code: CODE,
        game_socket: game_type,
        game_name,
        iframe_url,
        result_image
    } = AAA2_DATA;

    const [gameData, setGameData] = useState(null);
    const [lastResults, setLastResults] = useState([]);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);

    const socket = useSocket("casino");
    useEffect(() => {
        if (!socket) return;

        const handleData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[1] || data[0] : data;
                if (payload) {
                    setGameData(payload);
                    if (payload.last_results) {
                        setLastResults(payload.last_results);
                    }
                }
            } catch (error) {
                console.error("Error processing AAA data:", error);
            }
        };

        const handleResult = (data) => {
            try {
                const payload = Array.isArray(data) ? data[1] || data[0] : data;
                if (payload?.res) {
                    const mappedResults = payload.res.map(r => ({
                        mid: r.mid,
                        res: r.win || r.res // Map 'win' to 'res'
                    }));
                    setLastResults(mappedResults);
                }
            } catch (error) {
                console.error("Error processing AAA result:", error);
            }
        };

        const handleConnect = () => {
            console.log(`✅ ${game_type} Connected:`, socket.id);
            socket.emit("Room", game_type);
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on("game", handleData);
        socket.on("gameResult", handleResult);
        socket.on(game_type, handleData);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleData);
            socket.off("gameResult", handleResult);
            socket.off(game_type, handleData);
        };
    }, [socket, game_type]);

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const handleOddsClick = (marketName, odds, market, isBack) => {
        const suspended = getIsSuspended(market);
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

    const getMarketBySid = (sid) => marketData.find(m => String(m.sid) === String(sid));

    const BetBox = ({ sid, marketName, className = "", children, type = "back" }) => {
        const market = getMarketBySid(sid);
        const suspended = getIsSuspended(market);
        const odds = type === "back" ? market?.b1 : market?.l1;

        return (
            <div
                className={`${className} ${suspended ? "suspended" : ""}`}
                onClick={() => handleOddsClick(marketName || market?.nat, odds, market, type === "back")}
            >
                {suspended && (
                    <img
                        src="/assets/images/lock.svg"
                        alt="lock"
                        style={{ width: "15px", height: "15px", opacity: 1, zIndex: 10, position: "absolute", filter: "brightness(0)", left: "calc(50% - 7px)", top: "calc(50% - 7px)" }}
                    />
                )}
                {children(odds)}
            </div>
        );
    };

    const Cards = () => (
        <div className="casino-video-cards-container">
            <div>
                <span data-v-b64efdfa="">
                    <img
                        data-v-b64efdfa=""
                        src={getImage(Array.isArray(currentGame?.C1) ? currentGame.C1[0] : currentGame?.C1, result_image)}
                        alt="Card"
                    />
                </span>
            </div>
        </div>
    );

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table aaa">
                            <CasinoVideo
                                gameName={game_name}
                                roundId={currentGame?.mid}
                                videoSrc={iframe_url}
                                results={lastResults}
                                timeLeft={currentGame?.autotime || 0}
                                totalTime={30}
                                isCardDrawerOpen={isCardDrawerOpen}
                                setIsCardDrawerOpen={setIsCardDrawerOpen}
                                CardsComponent={Cards}
                                resultPath="aaa2"
                            />

                            <div className="casino-detail">
                                {/* Main Market: Amar, Akbar, Anthony */}
                                <div className="row row5 d-none-small">
                                    {[
                                        { sid: "1", name: "A. Amar" },
                                        { sid: "2", name: "B. Akbar" },
                                        { sid: "3", name: "C. Anthony" }
                                    ].map((item) => (
                                        <div className="col-4" key={item.sid}>
                                            <div className="casino-box-row">
                                                <div className="casino-nation-name"><b>{item.name}</b></div>
                                                <div className="casino-bl-box">
                                                    <BetBox sid={item.sid} marketName={item.name} className="back casino-bl-box-item" type="back">
                                                        {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                    </BetBox>
                                                    <BetBox sid={item.sid} marketName={item.name} className="lay casino-bl-box-item" type="lay">
                                                        {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                    </BetBox>
                                                </div>
                                                <div className="casino-nation-name casino-book book-black">0</div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="col-12">
                                        <div className="teen1daycasino-container justify-content-end casino-min-max">
                                            <div>R:<span>100</span> - <span>3L</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Main Market (Stacked) */}
                                <div className="row row5 d-none-big">
                                    {[
                                        { sid: "1", name: "A. Amar" },
                                        { sid: "2", name: "B. Akbar" },
                                        { sid: "3", name: "C. Anthony" }
                                    ].map((item) => (
                                        <div className="casino-bl-box" key={item.sid}>
                                            <div className="casino-bl-box-item casino-odds-name">
                                                <b>{item.name}</b>
                                                <span className="float-right book-black">0</span>
                                            </div>
                                            <BetBox sid={item.sid} marketName={item.name} className="back casino-bl-box-item" type="back">
                                                {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                            </BetBox>
                                            <BetBox sid={item.sid} marketName={item.name} className="lay casino-bl-box-item" type="lay">
                                                {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                            </BetBox>
                                        </div>
                                    ))}
                                    <div className="teen1daycasino-container justify-content-end casino-min-max w-100">
                                        <div>R:<span>100</span> - <span>3L</span></div>
                                    </div>
                                </div>

                                {/* Side Markets: Even/Odd, Suits, Over/Under */}
                                <div className="row row5 aaa-oe">
                                    {/* Even/Odd */}
                                    <div className="col-lg-4 col-12">
                                        <div className="casino-box-row">
                                            <div className="casino-bl-box"><b>0</b></div>
                                            <div className="casino-bl-box"><b>0</b></div>
                                        </div>
                                        <div className="casino-box-row">
                                            <div className="casino-bl-box">
                                                <BetBox sid="4" marketName="Even" className="back casino-bl-box-item" type="back">
                                                    {(odds) => <span className="casino-box-odd">Even</span>}
                                                </BetBox>
                                                <div className="casino-book text-center book-black">0</div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <BetBox sid="5" marketName="Odd" className="back casino-bl-box-item" type="back">
                                                    {(odds) => <span className="casino-box-odd">Odd</span>}
                                                </BetBox>
                                                <div className="casino-book text-center book-black">0</div>
                                            </div>
                                        </div>
                                        <div className="teen1daycasino-container justify-content-end casino-min-max w-100">
                                            <div>R:<span>100</span>-<span>25K</span></div>
                                        </div>
                                    </div>

                                    {/* Suits: Black (Spade/Club) / Red (Heart/Diamond) */}
                                    <div className="col-lg-4 col-12">
                                        <div className="casino-box-row">
                                            <div className="casino-bl-box"><b>0</b></div>
                                            <div className="casino-bl-box"><b>0</b></div>
                                        </div>
                                        <div className="casino-box-row">
                                            <div className="casino-bl-box">
                                                <BetBox sid="6" marketName="Black" className="back casino-bl-box-item casino-card-img" type="back">
                                                    {(odds) => (
                                                        <span>
                                                            <img src="/assets/cards/spade.png" alt="S" />
                                                            <img src="/assets/cards/club.png" alt="C" />
                                                        </span>
                                                    )}
                                                </BetBox>
                                                <div className="casino-book text-center book-black">0</div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <BetBox sid="7" marketName="Red" className="back casino-bl-box-item casino-card-img" type="back">
                                                    {(odds) => (
                                                        <span>
                                                            <img src="/assets/cards/heart.png" alt="H" />
                                                            <img src="/assets/cards/diamond.png" alt="D" />
                                                        </span>
                                                    )}
                                                </BetBox>
                                                <div className="casino-book text-center book-black">0</div>
                                            </div>
                                        </div>
                                        <div className="teen1daycasino-container justify-content-end casino-min-max w-100">
                                            <div>R:<span>100</span>-<span>25K</span></div>
                                        </div>
                                    </div>

                                    {/* Under/Over 7 */}
                                    <div className="col-lg-4 col-12">
                                        <div className="casino-box-row">
                                            <div className="casino-bl-box"><b>0</b></div>
                                            <div className="casino-bl-box"><b>0</b></div>
                                        </div>
                                        <div className="casino-box-row">
                                            <div className="casino-bl-box">
                                                <BetBox sid="21" marketName="Under 7" className="back casino-bl-box-item" type="back">
                                                    {(odds) => <span className="casino-box-odd">Under 7</span>}
                                                </BetBox>
                                                <div className="casino-book text-center book-black">0</div>
                                            </div>
                                            <div className="casino-bl-box">
                                                <BetBox sid="22" marketName="Over 7" className="back casino-bl-box-item" type="back">
                                                    {(odds) => <span className="casino-box-odd">Over 7</span>}
                                                </BetBox>
                                                <div className="casino-book text-center book-black">0</div>
                                            </div>
                                        </div>
                                        <div className="teen1daycasino-container justify-content-end casino-min-max w-100">
                                            <div>R:<span>100</span>-<span>1L</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Market (A-K) */}
                                <div className="mt-2">
                                    <div className="text-center w-100">
                                        <div className="casino-bl-box">
                                            <div className="casino-bl-box-item"><b>0</b></div>
                                        </div>
                                    </div>
                                    <div className="casino-cards text-center mt-1">
                                        {[
                                            { sid: "8", val: "A" }, { sid: "9", val: "2" }, { sid: "10", val: "3" },
                                            { sid: "11", val: "4" }, { sid: "12", val: "5" }, { sid: "13", val: "6" },
                                            { sid: "14", val: "7" }, { sid: "15", val: "8" }, { sid: "16", val: "9" },
                                            { sid: "17", val: "10" }, { sid: "18", val: "J" }, { sid: "19", val: "Q" },
                                            { sid: "20", val: "K" }
                                        ].map((card) => (
                                            <div className="casino-card-item" key={card.sid}>
                                                <BetBox sid={card.sid} marketName={card.val} className="card-image" type="back">
                                                    {(odds) => <img src={getImage(card.val, "cards")} alt={card.val} />}
                                                </BetBox>
                                                <div className="casino-book text-center book-black">0</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="teen1daycasino-container justify-content-end casino-min-max w-100">
                                        <div>R:<span>100</span>-<span>5K</span></div>
                                    </div>
                                </div>

                                {/* Mobile Results (Visible only on small screens) */}
                                <LastResult
                                    results={lastResults}
                                    gameName={game_name}
                                    resultPath="aaa2"
                                    className="d-none-big"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <CasinoRightSidebar />
            </div>
        </div>
    );
};

export default AAA2;
