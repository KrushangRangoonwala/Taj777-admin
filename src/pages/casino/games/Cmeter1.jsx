import React, { useState, useEffect } from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getMarketByNation, getIsSuspended, getExposureClass } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import BetLimitInfo from "./components/BetLimitInfo2";
import Rules, { RulesHeader } from "./rules/Rules";

const low_cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9"];

const isLow = (card_) => {
    if (!card_) return false;
    const card = card_.slice(0, -2);
    return low_cards.includes(card);
};

const Cmeter1 = ({ gameData, exposureData, lastResults }) => {
    const { game_type, game_name, iframe_url, result_image } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const low = marketData?.[0];
    const high = marketData?.[1];

    const cards_ = currentGame?.cards?.split(",");
    const cards = cards_?.filter(val => val !== '1');
    const isNoCard = !cards || cards.length === 0;

    const [betOn, setBetOn] = useState(null);
    const [isBetOpen, setIsBetOpen] = useState(false);

    useEffect(() => {
        if (exposureData?.length > 0) {
            setIsBetOpen(true);
            const firstExposure = exposureData?.[0];

            if (firstExposure?.total_exposure !== 0) {
                if (firstExposure?.market_id == 1) {
                    setBetOn("low");
                } else if (firstExposure?.market_id == 2) {
                    setBetOn("high");
                }
            }
        } else {
            setIsBetOpen(false);
            setBetOn(null);
        }
    }, [exposureData]);

    const low_common = ["A", "2", "3", "4", "5", "6", "7", "8"];
    const high_common = ["J", "Q", "K"];

    const card_9 = betOn === "low" ? "9meter" : "9";
    const card_10 = betOn === "high" ? "10meter" : "10";

    const lowCards = [...low_common, card_9];
    const highCards = [card_10, ...high_common];

    const getDisplayData = () => {
        let lowC = [];
        let highC = [];
        cards?.forEach((card) => {
            if (isLow(card)) {
                lowC.push(card);
            } else {
                highC.push(card);
            }
        });
        return [
            {
                label: "Low",
                value: currentGame?.C1 || 0,
                cards: lowC,
            },
            {
                label: "High",
                value: currentGame?.C2 || 0,
                cards: highC,
            },
        ];
    };

    const displayData = getDisplayData();
    const isBetOnLow = betOn === 'low';
    const isBetOnHigh = betOn === 'high';

    const RulesComponent = () => (
        <>
            <RulesHeader />
            <div className="card-body" style={{ padding: "10px" }}>
                <Rules
                    title="Casino Meter"
                    rules={[
                        { label: "Low", value: "A, 2, 3, 4, 5, 6, 7, 8, 9" },
                        { label: "High", value: "10, J, Q, K" },
                    ]}
                />
            </div>
        </>
    );

    const Cards = () => (
        <div className="cmeter-card-box mt-3" style={{ background: 'none' }}>
            {displayData.map((item) => {
                const position =
                    isBetOnLow
                        ? Number(displayData[0]?.value) - Number(displayData[1]?.value)
                        : isBetOnHigh
                            ? Number(displayData[1]?.value) - Number(displayData[0]?.value)
                            : false;
                return (
                    <div key={item.label} className={`cmeter-card-${item.label.toLowerCase()}`}>
                        <div className="text-playerb flex-wrap">
                            <span>{item.label}</span>
                            <span className="text-success ml-2 numeric">{item.value}</span>
                        </div>
                        <div className="ml-2">
                            {item.cards.map((card, index) => (
                                <span key={index} data-v-b64efdfa="">
                                    <img src={getImage(card, result_image)} alt={card} />
                                </span>
                            ))}
                            {position !== false && betOn === item.label.toLowerCase() && isBetOpen && (
                                <span className="ml-1 qqwwee">
                                    Run Position:
                                    <span style={{ marginLeft: '5px' }} className={getExposureClass(position)}>{position}</span>
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table cmeter">
                            <CasinoVideo
                                gameName={game_name}
                                roundId={currentGame?.mid}
                                videoSrc={iframe_url}
                                results={lastResults}
                                timeLeft={currentGame?.autotime || 0}
                                totalTime={currentGame?.ft || 30}
                                CardsComponent={Cards}
                            />

                            <div className="casino-detail">
                                <div className="teen1daycasino-container">
                                    {/* Low Side */}
                                    <div className="teen1dayleft">
                                        <div className="text-center">
                                            <b className="text-playerb">Low</b>
                                            {isBetOnHigh && (
                                                <div className="casino-card-item d-inline-block ml-2">
                                                    <span className="card-image">
                                                        <img src={getImage('10SS', result_image)} alt="10SS" />
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-100">
                                            <div className={`casino-cards text-center mt-1 ${getIsSuspended(low) ? 'suspended' : ''}`}>
                                                {lowCards.map((card) => (
                                                    <div key={card} className="casino-card-item">
                                                        <div className="card-image">
                                                            <img src={getImage(card, 'cards_new/lucky6')} alt={card} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="casino-min-max">
                                                <Exposure className="casino-book" data={exposureData} id={low?.sid} />
                                                <span className="float-right">
                                                    <BetLimitInfo min={low?.min} max={low?.max} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="teen1daycenter" />

                                    {/* High Side */}
                                    <div className="teen1dayright">
                                        <div className="text-center">
                                            <b className="text-playerb">High</b>
                                            {isBetOnLow && (
                                                <div className="casino-card-item d-inline-block ml-2">
                                                    <span className="card-image">
                                                        <img src={getImage('9SS', result_image)} alt="9SS" />
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-100">
                                            <div className={`casino-cards text-center mt-1 ${getIsSuspended(high) ? 'suspended' : ''}`}>
                                                {highCards.map((card) => (
                                                    <div key={card} className="casino-card-item">
                                                        <div className="card-image">
                                                            <img src={getImage(card, 'cards_new/lucky6')} alt={card} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="casino-min-max">
                                                <Exposure className="casino-book" data={exposureData} id={high?.sid} />
                                                <span className="float-right">
                                                    <BetLimitInfo min={high?.min} max={high?.max} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {currentGame?.remark && <RemarkMarquee remark={currentGame.remark} />}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="right-sidebar">
                    <CasinoRightSidebar RulesComponent={RulesComponent} />
                </div>
            </div>
        </div>
    );
};

export default Cmeter1;