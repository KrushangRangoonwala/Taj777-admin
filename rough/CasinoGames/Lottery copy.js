import React, { useState, useEffect, memo, useMemo, useCallback } from "react";
import { fetchCasinoExposureApi } from "../../api/api";
import { getImage, getValueAfterDot, getIsSuspended, getCardImage } from "../../utilies/helpers";
import { useGetFileData } from "../../hooks/useGetFileData";
import CasinoVideo from "./components/CasinoVideo";
import useIsMobile from "../../hooks/useIsMobile";
import { useSocket } from "../Socket/useSocket";
import RemarkMarquee from "./components/RemarkMarquee";


import SelectedCard from "./lottery 2/SelectedCard";
import Tab from "./lottery 2/Tab";
import LotteryBox from "./lottery 2/LotteryBox";
import RandomBets from "./lottery 2/RandomBets";
import LastResults from "./lottery 2/LastResults";
import BetBtns from "./lottery 2/BetBtns";
import ActionBtns from "./lottery 2/ActionBtns";
import CardsMobile from "./lottery 2/CardsMobile";
import CardsDesktop from "./lottery 2/CardsDesktop";
import Remark from "./lottery 2/Remark";

const Lottery = ({ isVisible, onBetSelection, lastBetTime }) => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const [gameData, setGameData] = useState(null);
    const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
    const [exposureData, setExposureData] = useState([]);
    const isMobile = useIsMobile(767);
    const isSuspended = (market) => getIsSuspended(market);
    const [activeTab, setActiveTab] = useState("single");

    useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.[0]?.mid) return;
            try {
                const response = await fetchCasinoExposureApi({
                    markettype: CODE,
                    main_event_id: gameData.t1[0].mid,
                    curPageName: phpFile,
                });
                const aaa = response?.data
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

    const renderExposure = (marketId, className = "") => {
        const exposure = getExposure(marketId?.toString());
        if (exposure === 0) return null;
        return (
            <span className={`mr-2 ${className} ${exposure > 0 ? 'book-green' : 'book-red'}`}>
                {exposure}
            </span>
        );
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
                console.error("Error processing Trap data:", error);
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

    const sinlge_ = data.find((item) => item.nat === "Single");
    const double_ = data.find((item) => item.nat === "Double");
    const triple_ = data.find((item) => item.nat === "Triple");

    const sinlge = useMemo(() => sinlge_, [sinlge_]);
    const double = useMemo(() => double_, [double_]);
    const triple = useMemo(() => triple_, [triple_]);

    const handleOddsClick = useCallback((marketName, odds, market, isBack, suspended, marketId) => {
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
                eventId: getValueAfterDot(currentGame?.mid),
            });
        }
    }, [onBetSelection, currentGame?.mid]);

    const LotteryTabs = memo(function LotteryTabs({ sinlge, double, triple }) {
        return (
            <div className="lottery-right">
                <div className="casino-tabs">
                    <ul className="nav nav-tabs">
                        <Tab title="Single(0)" min="10" max="20K" tab="single" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <Tab title="Double(0)" min="10" max="5K" tab="double" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <Tab title="Triple(0)" min="10" max="3K" tab="triple" activeTab={activeTab} setActiveTab={setActiveTab} />
                    </ul>
                </div>

                <div className="tab-content">
                    <div id="single" className={`tab-pane ${activeTab === "single" ? "active" : ""}`}>
                        <div className="single">
                            <LotteryBox market={sinlge} handleOddsClick={handleOddsClick} />
                        </div>
                    </div>

                    <div id="double" className={`tab-pane fade ${activeTab === "double" ? "active show" : ""}`}>
                        <div className="double">
                            <LotteryBox market={double} handleOddsClick={handleOddsClick} />
                            <RandomBets market={double} handleOddsClick={handleOddsClick} />
                        </div>
                    </div>

                    <div id="triple" className={`tab-pane fade ${activeTab === "triple" ? "active show" : ""}`}>
                        <div className="tripple">
                            <LotteryBox market={triple} handleOddsClick={handleOddsClick} />
                            <RandomBets market={triple} handleOddsClick={handleOddsClick} />
                        </div>
                    </div>
                </div>
            </div>
        );
    });

    return (
        <>
            <div className="casino-table lottery">
                <CasinoVideo
                    gameName={game_name}
                    roundId={currentGame?.mid}
                    videoSrc={iframe_url}
                    // isCardDrawerOpen={isCardDrawerOpen}
                    // setIsCardDrawerOpen={setIsCardDrawerOpen}
                    autotime={currentGame?.autotime}
                    totalTime={currentGame?.ft}WholeCardDrawer={CardsMobile}
                // CardsComponent={CardsComponent}
                // cards={allCards}
                />

                <div className="casino-details lottery">
                    {isMobile ? (
                        <>
                            <LotteryTabs sinlge={sinlge} double={double} triple={triple} />
                            <BetBtns />
                            <ActionBtns />
                            <Remark />
                            {/* <LastResults /> */}
                        </>
                    ) : (
                        <>
                            <BetBtns />
                            <LotteryTabs sinlge={sinlge} double={double} triple={triple} />
                            <Remark />
                            <ActionBtns />
                            {/* <LastResults /> */}
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default Lottery

// .random-bets