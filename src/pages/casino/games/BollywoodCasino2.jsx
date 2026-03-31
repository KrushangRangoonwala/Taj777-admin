import React, { useState, useEffect } from "react";
import useSocket from "../../../api/Socket/useSocket";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getValueAfterDot, getIsSuspended } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import LastResult from "./components/LastResult";

const BollywoodCasino2 = ({ onBetSelection }) => {
    const { game_type, game_name, iframe_url } = useGetFileData();
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
                console.error("Error processing Bollywood Casino data:", error);
            }
        };

        const handleConnect = () => {
            console.log(`✅ ${game_type} Connected:`, socket.id);
            socket.emit("Room", "btable2");
        };

        const handleResults = (data) => {
            try {
                const payload = Array.isArray(data) ? data[1] : data;
                if (payload?.res) {
                    const mappedResults = payload.res.map(r => ({
                        mid: r.mid,
                        res: r.win || r.res
                    }));
                    setLastResults(mappedResults);
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
        socket.on("btable2", handleData);
        socket.on("gameResult", handleResults);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleData);
            socket.off("btable2", handleData);
            socket.off("gameResult", handleResults);
        };
    }, [socket, game_type]);

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const getMarketBySid = (sid) => marketData.find((m) => String(m.sid) === String(sid));

    const handleOddsClick = (marketName, odds, market, isBack) => {
        if (!market || getIsSuspended(market) || odds == 0) return;

        const min = market?.min || 100;
        const max = market?.max || 100000;

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

    const BetBox = ({ sid, marketName, className = "", children, type = "back" }) => {
        const market = getMarketBySid(sid);
        const suspended = getIsSuspended(market);
        const odds = suspended ? 0 : (type === "back" ? market?.b1 : market?.l1);

        return (
            <div
                className={`${className} ${suspended ? "suspended" : ""}`}
                onClick={() => handleOddsClick(marketName || market?.nat, odds, market, type === "back")}
                style={{ position: "relative" }}
            >
                {suspended && (
                    <img
                        src="/assets/images/lock.svg"
                        alt="lock"
                        style={{ width: "15px", height: "15px", filter: "brightness(0)", zIndex: 10, position: "absolute", left: "calc(50% - 7px)", top: "calc(50% - 7px)" }}
                    />
                )}
                {children(odds)}
            </div>
        );
    };

    const getCardImage = (cardCode) => {
        if (!cardCode || cardCode === "1") return "/assets/cards_new/1.png";
        let code = cardCode.toString().trim().toUpperCase();
        const cardMap = { A: "ASS", J: "JSS", Q: "QSS", K: "KSS" };
        code = cardMap[code] || code;
        return `/assets/cards_new/${code}.png`;
    };

    const Cards = () => (
        <>
            {currentGame?.C1 && (
                <div>
                    <span>
                        <img src={getCardImage(currentGame.C1)} alt="" />
                    </span>
                </div>
            )}
        </>
    );

    const MainMarketLabel = ({ idx, nat }) => {
        const labels = [
            "A. Don",
            "B. Amar Akbar Anthony",
            "C. Sahib Bibi Aur Ghulam",
            "D. Dharam Veer",
            "E. Kis Kis Ko Pyaar Karoon",
            "F. Ghulam"
        ];
        return <b>{labels[idx] || nat}</b>;
    };

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table aaa">
                            <CasinoVideo
                                gameName="Bollywood Casino 2"
                                roundId={currentGame?.mid}
                                videoSrc="https://casino.diamondcricketid.com/swiftdizire/?id=3070"
                                results={lastResults}
                                timeLeft={currentGame?.autotime || 0}
                                totalTime={currentGame?.ft || 30}
                                isCardDrawerOpen={isCardDrawerOpen}
                                setIsCardDrawerOpen={setIsCardDrawerOpen}
                                CardsComponent={Cards}
                                resultPath="btable2"
                                drawerStyle={{
                                    top: "80px",
                                    transform: "unset",
                                    width: "45px",
                                    padding: "5px 10px 5px 5px",
                                    height: "45px",
                                }}
                            />

                            <div className="casino-detail">
                                {/* Desktop Main Markets */}
                                <div className="row row5 d-none-small">
                                    {[1, 2, 3, 4, 5, 6].map((sid, idx) => {
                                        const market = getMarketBySid(sid);
                                        return (
                                            <div className="col-4" key={sid}>
                                                <div className="casino-box-row">
                                                    <div className="casino-nation-name">
                                                        <MainMarketLabel idx={idx} nat={market?.nat} />
                                                    </div>
                                                    <div className="casino-bl-box">
                                                        <BetBox sid={sid} className="back casino-bl-box-item" type="back">
                                                            {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                        </BetBox>
                                                        <BetBox sid={sid} className="lay casino-bl-box-item" type="lay">
                                                            {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                        </BetBox>
                                                    </div>
                                                    <div className="casino-book text-center book-black">0</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="col-12">
                                        <div className="teen1daycasino-container justify-content-end casino-min-max">
                                            <div>R:<span>100</span> - <span>1L</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Main Markets */}
                                <div className="row row5 d-none-big">
                                    {[1, 2, 3, 4, 5, 6].map((sid, idx) => {
                                        const market = getMarketBySid(sid);
                                        return (
                                            <div className="col-12 mb-1" key={sid}>
                                                <div className="casino-bl-box">
                                                    <div className="casino-bl-box-item casino-odds-name">
                                                        <MainMarketLabel idx={idx} nat={market?.nat} />
                                                        <span className="float-right book-black">0</span>
                                                    </div>
                                                    <BetBox sid={sid} className="back casino-bl-box-item" type="back">
                                                        {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                    </BetBox>
                                                    <BetBox sid={sid} className="lay casino-bl-box-item" type="lay">
                                                        {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                    </BetBox>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>


                                {/* Secondary Markets (Odd, Dulha, Barati) */}
                                <div className="row row5">
                                    {/* Odd */}
                                    <div className="col-lg-4 col-12 d-none-small">
                                        <div className="casino-box-row">
                                            <div className="casino-nation-name"><b>Odd</b></div>
                                            <div className="casino-bl-box">
                                                <BetBox sid={7} marketName="Odd" className="back casino-bl-box-item" type="back">
                                                    {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                </BetBox>
                                                <BetBox sid={7} marketName="Odd" className="lay casino-bl-box-item" type="lay">
                                                    {(odds) => <span className="casino-box-odd">{odds || 0}</span>}
                                                </BetBox>
                                            </div>
                                            <div className="casino-book text-center book-black">0</div>
                                            <div className="teen1daycasino-container justify-content-end casino-min-max w-100">
                                                <div>R:<span>100</span> - <span>1L</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dulha Dulhan */}
                                    <div className="col-lg-4 col-6 bc-fancy">
                                        <div className="casino-box-row">
                                            <div className="casino-nation-name">
                                                <b>{getIsSuspended(getMarketBySid(8)) ? 0 : (getMarketBySid(8)?.b1 || "1.97")}</b>
                                            </div>
                                            <div className="casino-bl-box">
                                                <BetBox sid={8} marketName="Dulha Dulhan K-Q" className="back casino-bl-box-item" type="back">
                                                    {() => <span className="casino-box-odd">Dulha Dulhan K-Q</span>}
                                                </BetBox>
                                                <span className="casino-book text-center book-black">0</span>
                                            </div>
                                        </div>
                                        <div className="teen1daycasino-container justify-content-end casino-min-max w-100">
                                            <div>R:<span>100</span> - <span>1L</span></div>
                                        </div>
                                    </div>

                                    {/* Barati */}
                                    <div className="col-lg-4 col-6 bc-fancy">
                                        <div className="casino-box-row">
                                            <div className="casino-nation-name">
                                                <b>{getIsSuspended(getMarketBySid(9)) ? 0 : (getMarketBySid(9)?.b1 || "1.97")}</b>
                                            </div>
                                            <div className="casino-bl-box">
                                                <BetBox sid={9} marketName="Barati J-A" className="back casino-bl-box-item" type="back">
                                                    {() => <span className="casino-box-odd">Barati J-A</span>}
                                                </BetBox>
                                                <span className="casino-book text-center book-black">0</span>
                                            </div>
                                        </div>
                                        <div className="teen1daycasino-container justify-content-end casino-min-max w-100">
                                            <div>R:<span>100</span> - <span>1L</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Suits & Cards */}
                                <div className="row row5">
                                    {/* Suits */}
                                    <div className="col-lg-6 col-12 aaa-oe">
                                        <div className="casino-box-row">
                                            <div className="casino-bl-box">
                                                <b className="text-black-theme">{getIsSuspended(getMarketBySid(10)) ? 0 : (getMarketBySid(10)?.b1 || "1.97")}</b>
                                            </div>
                                            <div className="casino-bl-box">
                                                <b className="text-black-theme">{getIsSuspended(getMarketBySid(11)) ? 0 : (getMarketBySid(11)?.b1 || "1.97")}</b>
                                            </div>
                                        </div>
                                        <div className="casino-box-row">
                                            <div className="casino-bl-box">
                                                <BetBox sid={11} marketName="Red" className="back casino-bl-box-item casino-card-img" type="back">
                                                    {() => (
                                                        <span>
                                                            <img src="/assets/cards_new/heart.png" alt="H" style={{ width: "22px" }} />
                                                            <img src="/assets/cards_new/diamond.png" alt="D" style={{ width: "22px" }} />
                                                        </span>
                                                    )}
                                                </BetBox>
                                                <span className="casino-book text-center book-black">0</span>
                                            </div>
                                            <div className="casino-bl-box">
                                                <BetBox sid={10} marketName="Black" className="back casino-bl-box-item casino-card-img" type="back">
                                                    {() => (
                                                        <span>
                                                            <img src="/assets/cards_new/spade.png" alt="S" style={{ width: "22px" }} />
                                                            <img src="/assets/cards_new/club.png" alt="C" style={{ width: "22px" }} />
                                                        </span>
                                                    )}
                                                </BetBox>
                                                <span className="casino-book text-center book-black">0</span>
                                            </div>
                                        </div>
                                        <div className="teen1daycasino-container justify-content-end casino-min-max w-100">
                                            <div>R:<span>100</span> - <span>1L</span></div>
                                        </div>
                                    </div>

                                    {/* Cards */}
                                    <div className="col-lg-6 col-12">
                                        <div className="text-center w-100">
                                            <div className="casino-bl-box">
                                                <div className="casino-bl-box-item">
                                                    <b>Cards {getIsSuspended(getMarketBySid(12)) ? 0 : (getMarketBySid(12)?.b1 || "3.75")}</b>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="casino-cards text-center mt-1">
                                            {["J", "Q", "K", "A"].map((card, idx) => (
                                                <div className="casino-card-item" key={card}>
                                                    <BetBox sid={12 + idx} marketName={`Card ${card}`} className="card-image" type="back">
                                                        {() => <img src={`/assets/cards_new/lucky6/${card}.png`} alt={card} />}
                                                    </BetBox>
                                                    <div className="casino-book text-center book-black">0</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="teen1daycasino-container justify-content-end casino-min-max w-100">
                                            <div>R:<span>100</span> - <span>25K</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Results for Mobile (at bottom) */}
                                <LastResult
                                    results={lastResults}
                                    gameName="Bollywood Casino 2"
                                    resultPath="btable2"
                                    className="d-none-big mt-2"
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

export default BollywoodCasino2;
