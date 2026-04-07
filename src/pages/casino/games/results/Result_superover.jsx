import React, { useState } from 'react'

const resultDetails = {
    'superover': { balls: 6, overs: 1 },
    'superover2': { balls: 6, overs: 1 },
    'superover3': { balls: 4, overs: 1 },
    'cricketv3': { balls: 6, overs: 5 }, // 5fivecricket
}

function formatScoreData(scoreList, totalNoOver = 1, totalNoBalls = 6) {
    if (!scoreList) return null;
    const formatted = {};

    // STEP 1: Existing logic (unchanged)
    for (const ball of scoreList) {
        const { ing, oc, run, wkt, nat } = ball;

        const ingKey = `ing_${ing}`;
        const overKey = `over_${oc}`;
        const ballScore = wkt ? "ww" : run;

        if (!formatted[ingKey]) {
            formatted[ingKey] = {
                nat: nat || ""
            };
        }

        if (!formatted[ingKey][overKey]) {
            formatted[ingKey][overKey] = [];
        }

        formatted[ingKey][overKey].push(ballScore);
    }

    // STEP 2: Normalize overs & balls
    for (const ingKey in formatted) {
        for (let o = 1; o <= totalNoOver; o++) {
            const overKey = `over_${o}`;

            // If over missing → create empty over
            if (!formatted[ingKey][overKey]) {
                formatted[ingKey][overKey] = Array(totalNoBalls).fill("");
            } else if (overKey !== 'nat') {
                // If over exists but balls are less → pad it
                const currentBalls = formatted[ingKey][overKey].length;
                if (currentBalls < totalNoBalls) {
                    formatted[ingKey][overKey].push(
                        ...Array(totalNoBalls - currentBalls).fill("")
                    );
                }
            }
        }
    }

    return formatted;
}

const InningsTable = ({ ingKey, inningsData, totalBalls, totalOvers }) => {
    console.log('inningsData', inningsData);
    const inningNo = ingKey === "ing_1" ? "First" : "Second";
    const nat = inningsData.nat || "";

    let totalRuns = 0;
    let totalWickets = 0;

    return (
        <>
            <h4 className='mb-0'>{inningNo} Inning</h4>

            <div className={`table-responsive ${ingKey === "ing_1" ? "mb-0" : ""}`}>
                <table className='table'>
                    <thead>
                        <tr>
                            <th className='text-center'><b><span className='text-success'>{nat}</span></b></th>

                            {Array.from({ length: totalBalls }).map((_, idx) => (
                                <th
                                    key={idx}
                                    className='text-center'
                                >
                                    <b>{idx + 1}</b>
                                </th>
                            ))}

                            <th className='text-center'><b>Run/Over</b></th>
                            <th className='text-center'><b>Score</b></th>
                        </tr>
                    </thead>

                    <tbody>
                        {Object.entries(inningsData).filter(([key]) => key !== 'nat').map(
                            ([overKey, balls], oIdx) => {
                                const totalOverRuns = balls?.reduce((sum, ball) => sum + (ball === "ww" ? 0 : Number(ball)), 0);
                                const totalOverWickets = balls?.filter(ball => ball === "ww").length;

                                totalRuns += totalOverRuns;
                                totalWickets += totalOverWickets;

                                const score = `${totalRuns}/${totalWickets}`;

                                return (
                                    <tr key={overKey}>
                                        <td className='text-center'><b>Over {oIdx + 1}</b></td>

                                        {balls.map((ball, bIdx) => (
                                            <td
                                                key={bIdx}
                                                className={`text-center ${ball === "ww" ? "text-playerb" : ""}`}
                                            >
                                                <span>{ball}</span>
                                            </td>
                                        ))}

                                        <td className='text-center nationcard'>{totalOverRuns}</td>
                                        <td className='text-center nationcard'>{score}</td>
                                    </tr>
                                )
                            }
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default function Result_superover({ response }) {
    console.log("222222222222 modalContent", response)
    if (!response) return;
    const game_type = response?.game_type;
    console.log("gameTypeeeeeee", game_type)
    const { balls: totalBalls, overs: totalOvers } = resultDetails[game_type];


    const cc = JSON.parse(response?.data);
    const content = cc?.t1;

    console.log("content", content);
    if (!content) return;
    const score = content?.score;



    const formattedScore = formatScoreData(score, totalOvers, totalBalls);
    console.log("formattedScore", formattedScore);

    return (
        <div className='col-12'>
            <div className="text-right mt-3 score-head">
                Winner:
                <span className='text-success'> {content?.winnat} | </span>
                {content?.rdesc}
            </div>

            {Object.entries(formattedScore).map(
                ([ingKey, inningsData], idx) => (
                    <InningsTable
                        key={ingKey}
                        ingKey={ingKey}
                        inningsData={inningsData}
                        totalBalls={totalBalls}
                        totalOvers={totalOvers}
                    />
                )
            )}
        </div>
    )
}