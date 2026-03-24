import React, { useMemo, useState } from "react";
import { parseDescription } from "../components/PlaceBet_KK";
import Result_cards from "./Result_cards";
import Result_details from "./Result_details";
import { getImage } from "../../../utilies/helpers";

export const formatResultData = (result) => {
    if (!result) return null;
    if (result.formatted) return result;

    const desc = parseDescription(result.desc_remakrs || "");

    let allCards = [];
    try {
        allCards = Array.isArray(result.cards)
            ? result.cards
            : typeof result.cards === "string"
                ? JSON.parse(result.cards)
                : [];
    } catch (e) {
        allCards = [];
    }

    let playerACards = allCards.slice(0, 2);
    let playerBCards = allCards.slice(2, 4);
    let boardCards = allCards.slice(4);

    const isPlayerAWinner = desc.winner?.includes("Player A") ?? false;
    const isPlayerBWinner = desc.winner?.includes("Player B") ?? false;

    return {
        roundId: result.event_id || result.mid || "N/A",
        matchTime: result.time ? new Date(result.time).toLocaleString() : "N/A",
        playerA: {
            name: "Player A",
            cards: playerACards,
            isWinner: isPlayerAWinner,
            consecutive: desc.consecutive?.includes("A : Yes") || false,
        },
        playerB: {
            name: "Player B",
            cards: playerBCards,
            isWinner: isPlayerBWinner,
            consecutive: desc.consecutive?.includes("B : Yes") || false,
        },
        board: boardCards,
        oddEven: desc.oddEven.join(" "),
        consecutive: desc.consecutive,
        formatted: true,
    };
};

const Result_Poker6Player = ({ modalContent: response }) => {
    const [desc, setDesc] = useState();
    const modalContent = useMemo(() => {
        if (!response) return null;

        const cardList = JSON.parse(response.cards || "[]");

        const descParts = (response.desc_remakrs || response.desc_remarks || "").split("#");
        // setDesc(descParts);

        const resultData = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Pattern", value: descParts[1] || "" },
        ]

        return {
            cardList,
            resultData,
        };
    }, [response]);

    if (!modalContent) return null;

    const { cardList, resultData } = modalContent;

    function Column({ player, card1, card2 }) {
        return (
            <div className="casino-open-result-item">
                <h4>{player}</h4>
                <div className="casino-result-cards">
                    <div className="casino-result-cards-item-container">
                        <div className="casino-result-cards-item"><img src={getImage(card1, 'cards_new')} /></div>
                        <div className="casino-result-cards-item"><img src={getImage(card2, 'cards_new')} /></div>

                        {player == response?.result_status &&
                            <div className="casino-result-cards-item"><img src={getImage('winner', 'images')} className="winner-icon" /></div>
                        }
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="row row5 poker6result">
            <div className="col-12 col-lg-7">
                <div className="casino-result-content">
                    <div className="casino-result-content-item text-center">
                        <div className="casino-open-result">
                            <Column player={1} card1={cardList[0]} card2={cardList[6]} />
                            <Column player={2} card1={cardList[1]} card2={cardList[7]} />
                            <Column player={3} card1={cardList[2]} card2={cardList[8]} />
                            <Column player={4} card1={cardList[3]} card2={cardList[9]} />
                            <Column player={5} card1={cardList[4]} card2={cardList[10]} />
                            <Column player={6} card1={cardList[5]} card2={cardList[11]} />
                        </div>
                    </div>

                    <div class="casino-result-content-diveder"></div>

                    <h4 className="text-center" style={{ marginBottom: '0px', textAlign: 'center', width: '100%' }}>Board</h4>
                    <Result_cards cardList={cardList?.slice(12)} />
                </div>
            </div>

            <Result_details resultData={resultData} />
        </div>
    );
};

export default Result_Poker6Player;
