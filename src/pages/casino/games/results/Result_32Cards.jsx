import React from 'react';
import { getCardImage, getImage, getCardValue } from '../../../../utilies/helpers';
import { useGetFileData } from '../../../../hooks/useGetFileData';

const WinnerIcon = () => {
    return (
        <div className="casino-result-cards-item">
            <img src={getImage('winner', 'images')} className="winner-icon" style={{ width: '35px' }} />
        </div>
    )
}

const Result_32Cards = ({ resultData, cardList, winner, gameType = "card32", col = 8 }) => {
    const { result_image } = useGetFileData();
    const imgFolder = result_image || 'cards_new';

    const cards = cardList || [];
    const isQueen = gameType === "queen";

    const desc = resultData?.desc || resultData?.res_desc || "";
    const winners_str = Array.isArray(winner) ? winner.join(',').toLowerCase() : String(winner || resultData?.res_result || resultData?.result_status || "").toLowerCase();
    const winners = winners_str ? winners_str.split(',').map(w => w.trim()).filter(w => w) : [];
    
    // Also include labels from description if available
    const descParts = desc ? desc.split('#').map(s => s.trim().toLowerCase()) : [];
    if (descParts[0]) winners.push(descParts[0]);

    const getPlayersConfig = () => {
        if (isQueen) {
            return [
                { name: "Total 0", initial: 0, sid: "0" },
                { name: "Total 1", initial: 1, sid: "1" },
                { name: "Total 2", initial: 2, sid: "2" },
                { name: "Total 3", initial: 3, sid: "3" },
            ];
        }
        if (gameType === "race2") {
            return [
                { name: "Player A", initial: 0, sid: "0" },
                { name: "Player B", initial: 0, sid: "1" },
                { name: "Player C", initial: 0, sid: "2" },
                { name: "Player D", initial: 0, sid: "3" },
            ];
        }
        return [
            { name: "Player 8", initial: 8, sid: "1" },
            { name: "Player 9", initial: 9, sid: "2" },
            { name: "Player 10", initial: 10, sid: "3" },
            { name: "Player 11", initial: 11, sid: "4" },
        ];
    };

    const players = getPlayersConfig();

    const isWinner = (player) => {
        const playerName = player.name.toLowerCase();
        return winners.some(w => 
            w === String(player.sid) || 
            w === String(player.initial) || 
            playerName.includes(w) ||
            w.includes(playerName)
        );
    };

    const getPlayerCards = (index) => {
        const playerCardList = [];
        if (isQueen) {
            // Queen uses pos + i*4 distribution
            for (let i = 0; i < 4; i++) {
                const cardIndex = index + i * 4;
                if (cards[cardIndex] && cards[cardIndex] !== "1") {
                    playerCardList.push(cards[cardIndex]);
                }
            }
        } else if (gameType === "race2") {
            // Race to 2nd uses single cards at direct index
            if (cards[index] && cards[index] !== "1") {
                playerCardList.push(cards[index]);
            }
        } else {
            // Classic 32 Cards distribution (maintained from earlier request)
            if (index < 2) {
                if (cards[index] && cards[index] !== "1") playerCardList.push(cards[index]);
            } else {
                let i = index;
                while (cards[i] && cards[i] !== "1") {
                    playerCardList.push(cards[i]);
                    i += 2;
                }
            }
        }
        return playerCardList;
    };

    const calculateScore = (playerCards, initial) => {
        if (isQueen) {
            const hasQueen = playerCards.some((c) => c.toLowerCase().startsWith("q"));
            if (hasQueen) return "Q";
            const sum = playerCards.reduce((s, c) => s + getCardValue(c), 0);
            return sum + initial;
        }
        const cardSum = playerCards.reduce((sum, card) => sum + getCardValue(card), 0);
        return initial + cardSum;
    };

    return (
        <div className={`col-12 col-lg-${col}`}>
            <div className="row row5">
                {players.map((player, idx) => {
                    const playerCards = getPlayerCards(idx);
                    const score = calculateScore(playerCards, player.initial);

                    return (
                        <div className="col-12 col-lg-12" key={player.name}>
                            <div className="casino-result-cards">
                                <h4 className="text-center d-inline-block" style={{ fontSize: '14px', minWidth: '120px' }}>
                                    {player.name}
                                    {gameType !== "race2" && (
                                        <> -<span className="badge badge-success font14" style={{ width: '20px', height: '20px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', padding: 0 }}>{score}</span></>
                                    )}
                                </h4>
                                {playerCards.map((card, cIdx) => (
                                    <div className="casino-result-cards-item" key={`${player.name}-card-${cIdx}`}>
                                        <img src={getCardImage(card, imgFolder)} style={{ width: '35px' }} />
                                    </div>
                                ))}
                                {isWinner(player) && <WinnerIcon />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Result_32Cards;
