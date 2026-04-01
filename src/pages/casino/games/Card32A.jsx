import React from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { getImage, getIsSuspended, getCardValue, getMarketByNation } from "../../../utilies/helpers";
import CasinoVideo from "./components/CasinoVideo";
import CasinoRightSidebar from "./components/CasinoRightSidebar";
import { Exposure } from "../CasinoCenter";
import BetLimitInfo from "./components/BetLimitInfo2";
import Rules, { RulesHeader } from "./rules/Rules";
import LastResult from "./components/LastResult";

const ruleList = [
    { label: "Player 8", value: "8, 9, 10, J, Q, K, A, 2, 3, 4, 5, 6, 7" },
    { label: "Player 9", value: "9, 10, J, Q, K, A, 2, 3, 4, 5, 6, 7, 8" },
    { label: "Player 10", value: "10, J, Q, K, A, 2, 3, 4, 5, 6, 7, 8, 9" },
    { label: "Player 11", value: "11, J, Q, K, A, 2, 3, 4, 5, 6, 7, 8, 9, 10" },
];

function RulesComponent() {
    return (
        <>
            <RulesHeader />
            <div className="card-body" style={{ padding: "10px" }}>
                <Rules title="32 Cards Rules" rules={ruleList} />
            </div>
        </>
    );
}

const Card32A = ({ gameData, exposureData, lastResults }) => {
    const { game_name, iframe_url, result_image } = useGetFileData();

    const currentGame = gameData?.t1?.[0];
    const marketData = gameData?.t2 || [];

    const getMarketBySID = (sid) => marketData.find((m) => String(m.sid) === String(sid));

    const players = [
        { name: "Player 8", sid: 1, cardKey: "C1", initial: 8 },
        { name: "Player 9", sid: 2, cardKey: "C2", initial: 9 },
        { name: "Player 10", sid: 3, cardKey: "C3", initial: 10 },
        { name: "Player 11", sid: 4, cardKey: "C4", initial: 11 },
    ];

    const Cards = () => (
        <>
            {players.map((player) => {
                const card = currentGame?.[player.cardKey];
                if (!card || card === "1") return null;
                const score = getCardValue(card) + player.initial;
                return (
                    <div key={player.sid} className="w-100">
                        <div className="dealer-name w-100">
                            <span>{player.name}:</span>
                            <span className="text-warning ml-1">{score}</span>
                        </div>
                        <div className="mt-1">
                            <span>
                                <img
                                    src={getImage(card, result_image)}
                                    alt={player.name}
                                    style={{ width: "25px" }}
                                />
                            </span>
                        </div>
                    </div>
                );
            })}
        </>
    );


    const PlayerRow = ({ player }) => {
        const market = getMarketBySID(player.sid);
        const suspended = getIsSuspended(market);

        return (
            <div className="casino-box-row">
                <div className="casino-nation-name">
                    <b>{player.name}</b>
                    <div className="float-right">
                        <Exposure className="mr-2 casino-book" data={exposureData} id={market?.sid} />
                        <BetLimitInfo min={market?.min} max={market?.max} />
                    </div>
                </div>
                <div className={`casino-bl-box ${suspended || (parseFloat(market?.b1 || 0) === 0 && parseFloat(market?.l1 || 0) === 0) ? "suspended" : ""}`} style={{ position: 'relative' }}>
                    {(suspended || (parseFloat(market?.b1 || 0) === 0 && parseFloat(market?.l1 || 0) === 0)) && (
                        <i className="fas fa-lock" style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 10,
                            color: '#fff'
                        }}></i>
                    )}
                    <div className="back casino-bl-box-item">
                        <span className="casino-box-odd" style={{ fontSize: (suspended || (parseFloat(market?.b1 || 0) === 0 && parseFloat(market?.l1 || 0) === 0)) ? '16px' : '' }}>
                            {suspended || (parseFloat(market?.b1 || 0) === 0 && parseFloat(market?.l1 || 0) === 0) ? 0 : (market?.b1 || 0)}
                        </span>
                    </div>
                    <div className="lay casino-bl-box-item">
                        <span className="casino-box-odd" style={{ fontSize: (suspended || (parseFloat(market?.l1 || 0) === 0 && parseFloat(market?.l1 || 0) === 0)) ? '16px' : '' }}>
                            {suspended || (parseFloat(market?.l1 || 0) === 0 && parseFloat(market?.l1 || 0) === 0) ? 0 : (market?.l1 || 0)}
                        </span>
                    </div>
                </div>




            </div>
        );
    };

    return (
        <div data-v-5a10e370="" className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    <div className="casino-container">
                        <div className="casino-table cards32a">
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
                                    <div className="teen1dayleft">
                                        {players.slice(0, 2).map((player) => (
                                            <PlayerRow key={player.sid} player={player} />
                                        ))}
                                    </div>
                                    <div className="teen1daycenter"></div>
                                    <div className="teen1dayright">
                                        {players.slice(2, 4).map((player) => (
                                            <PlayerRow key={player.sid} player={player} />
                                        ))}
                                    </div>
                                </div>
                                <LastResult results={lastResults} />
                            </div>
                        </div>
                    </div>
                </div>

                <CasinoRightSidebar />
            </div>
        </div>
    );
};

export default Card32A;
