import React, { useMemo } from 'react'
import Result_details from './Result_details';

const parseDescription = (desc) => {
    if (!desc) return { winner: "N/A", color: [], oddEven: [], suit: [] };

    // Format: "Winner#ColorRow1~ColorRow2#OddEvenRow1~OddEvenRow2#SuitRow1~SuitRow2"
    const categories = desc.split("#").map(p => p.trim());

    const getRows = (str) => {
        if (!str) return [];
        return str.split("~").map(row => row.trim());
    };

    return {
        winner: categories[0] || "N/A",
        color: getRows(categories[1]),
        oddEven: getRows(categories[2]),
        suit: getRows(categories[3]),
    };
};

const formatResultData = (result) => {
    if (!result) return null;
    if (result.formatted) return result;

    let cards = [];
    try {
        if (result.cards) {
            cards = typeof result.cards === 'string' ? JSON.parse(result.cards) : result.cards;
        } else {
            // Include C1-C7 for the 7 slots in the UI
            cards = [result.C1, result.C2, result.C3, result.C4, result.C5, result.C6, result.C7];
        }
    } catch (e) {
        console.warn("Failed to parse cards for Casino War Result:", e);
    }

    const desc = parseDescription(result.desc_remakrs || "");
    // Use result_status if available, otherwise fallback to parsed winner
    const rawWinner = (result.result_status || desc.winner || "").replace(/\./g, "");
    const winnerName = rawWinner.replace(/,/g, " ").replace(/\s+/g, " ").trim();
    const winnerSeat = rawWinner;


    return {
        roundId: result.mid || result.event_id || "N/A",
        matchTime: result.time ? new Date(result.time).toLocaleString() : "N/A",
        winnerName: winnerName,
        winnerSeat: winnerSeat,

        color: desc.color,
        oddEven: desc.oddEven,
        suit: desc.suit,
        win: result.win,
        cards: cards,
        formatted: true,
    };
};

const Result_Casinowars = ({ modalContent: response }) => {

    const modalContent = useMemo(() => {
        return formatResultData(response);
    }, [response]);

    if (!modalContent) return null;

    const cards = modalContent.cards || [];

    const renderDetailRow = (label, rows) => {
        if (!rows || rows.length === 0) return null;
        return (
            <div className="casino-result-desc-item">
                <div>{label}</div>
                <div style={{ color: "#666" }}>
                    {rows.map((row, idx) => (
                        <div key={idx} style={{ marginBottom: idx === rows.length - 1 ? 0 : 4 }}>
                            {row}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const resultData = [
        { label: "Winner", value: modalContent.winnerName, },
        { label: "Color", value: modalContent.color[0], },
        { label: "", value: modalContent.color[1], },
        { label: "Odd/Even", value: modalContent.oddEven[0], },
        { label: "", value: modalContent.oddEven[1], },
        { label: "Suit", value: modalContent.suit[0], },
        { label: "", value: modalContent.suit[1], },
    ]

    return (
        <div className="modal-body">
            <style jsx>{`
                .modal-body {
                    position: relative;
                    flex: 1 1 auto;
                    padding: 8px;
                    max-height: calc(100vh - 60px);
                    overflow-x: hidden;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    scrollbar-color: #666 #222;
                    color: white;
                }
                .modal-body::-webkit-scrollbar { width: 8px; }
                .modal-body::-webkit-scrollbar-track { background: #666; }
                .modal-body::-webkit-scrollbar-thumb { background-color: #222; }

                .casino-open-result { display: flex; flex-wrap: wrap; }
                .casino-open-result-item { text-align: center; }
                .war-result .casino-open-result-item { width: 14.2%; }
                
                .casino-open-result-item h4 { 
                    margin-top: 0; 
                    margin-bottom: .5rem; 
                    font-weight: 500; 
                    line-height: 1.2; 
                    font-size: 13px !important; 
                }

                .casino-result-cards { 
                    display: flex; 
                    flex-wrap: wrap; 
                    justify-content: center; 
                    align-items: center; 
                    position: relative; 
                    height: auto;
                    min-height: 45px;
                }
                
                .casino-open-result .casino-result-cards-item {
                    margin-right: 10px;
                    margin-bottom: 5px;
                }
                .casino-open-result .casino-result-cards-item:last-child {
                    margin-right: 10px;
                }
                
                .casino-result-cards-item { margin-right: 5px; display: inline-block; }
                .casino-result-cards-item:last-child { margin-right: 0; }
                
                .casino-result-cards-item img { 
                    width: 35px; 
                    margin-bottom: 5px; 
                    vertical-align: middle; 
                    border-style: none;
                    height: auto;
                }
                
                .war-result .casino-open-result-item .casino-result-cards-item img { 
                    width: 30px; 
                    height: auto;
                }

                .winner-icon {
                    width: 60px;
                    height: auto;
                    transition: 1.2s ease-in;
                    animation-iteration-count: infinite;
                    -webkit-transition: 1.2s ease-in;
                    -moz-transition: 1.2s ease-in;
                    -ms-transition: 1.2s ease-in;
                    -o-transition: 1.2s ease-in;
                }
                .war-result .casino-open-result-item .casino-result-cards-item .winner-icon {
                    width: 50px;
                    height: auto;
                }
                .casino-open-result-item .casino-result-cards-item .winner-icon {
                    width: 40px;
                    height: auto;
                }

                .casino-result-desc { 
                    display: flex; 
                    flex-wrap: wrap; 
                    padding: 8px; 
                    background-color: #444; 
                    border: 1px solid #555; 
                    margin-top: 15px; 
                }

                @media only screen and (max-width: 767px) {
                    .casino-result-cards-item .winner-icon { height: auto; }
                    .casino-result-cards-item img { width: 25px; margin-bottom: 5px; }
                    .modal-body { max-height: calc(100vh - 146px); padding: 8px 6px; }
                }
            `}</style>

            <div className="casino-open-result war-result">
                {[1, 2, 3, 4, 5, 6, 7].map((pos, idx) => {
                    const card = cards[idx];
                    const winners = String(modalContent.winnerSeat || "").split(',').map(s => s.trim());
                    const isWinner = modalContent.win === '2' ? pos === 7 : winners.includes(String(pos));

                    return (
                        <div key={pos} className="casino-open-result-item">
                            <h4 style={{ color: pos === 7 ? "#fdcf13" : "" }}>{pos === 7 ? "D" : pos}</h4>
                            <div className="casino-result-cards">
                                <div className="casino-result-cards-item">
                                    <img
                                        src={card && card !== "1" ? `https://wver.sprintstaticdata.com/v67/static/front/img/cards/${card}.png` : "https://wver.sprintstaticdata.com/v67/static/front/img/cards/1.png"}
                                        alt={card || "Back"}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://wver.sprintstaticdata.com/v67/static/front/img/cards/1.png";
                                        }}
                                    />
                                </div>
                                {isWinner && (
                                    <div className="casino-result-cards-item">
                                        <img
                                            src="https://wver.sprintstaticdata.com/v199/static/front/img/winner.png"
                                            className="winner-icon"
                                            alt="Winner"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className='row row5'><Result_details resultData={resultData} /></div>
        </div>
    )
}

export default Result_Casinowars;