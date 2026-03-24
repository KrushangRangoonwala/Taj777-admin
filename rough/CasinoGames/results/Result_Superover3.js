import React, { useState } from 'react'
import styles from "./Result_Superover3.module.css"
import { useGetFileData } from '../../../hooks/useGetFileData';


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
        <div className={styles['mt-2']}>
            <h4 className={styles['fw-400']} style={{ fontSize: '1.5rem' }}>{inningNo} Inning</h4>

            <div className={styles['table-responsive']}>
                <table className={styles['table']}>
                    <thead>
                        <tr>
                            <th>{nat}</th>

                            {Array.from({ length: totalBalls }).map((_, idx) => (
                                <th
                                    key={idx}
                                    className={styles['text-center']}
                                >
                                    {idx + 1}
                                </th>
                            ))}

                            <th className={styles['text-center']}>Run/Over</th>
                            <th className={styles['text-center']}>Score</th>
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
                                        <td>Over {oIdx + 1}</td>

                                        {balls.map((ball, bIdx) => (
                                            <td
                                                key={bIdx}
                                                className={`${styles['text-center']} ${ball === "ww" ? "text-playerb" : ""}`}
                                            >
                                                <span>{ball}</span>
                                            </td>
                                        ))}

                                        <td className={styles['text-center']}>{totalOverRuns}</td>
                                        <td className={styles['text-center']}>{score}</td>
                                    </tr>
                                )
                            }
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default function SuperOverModal({ modalContent }) {
    if (!modalContent) return;
    console.log("222222222222 modalContent", modalContent)
    const game_type = modalContent?.game_type;
    console.log("gameTypeeeeeee", game_type)
    const { balls: totalBalls, overs: totalOvers } = resultDetails[game_type];


    const cc = JSON.parse(modalContent?.data);
    const content = cc?.t1;

    console.log("content", content);
    if (!content) return;
    const score = content?.score;



    const formattedScore = formatScoreData(score, totalOvers, totalBalls);
    console.log("formattedScore", formattedScore);

    return (
        <div className={`${styles['row']} ${styles['row5']} ${styles['mt-2']} ${styles['five-cricket-result']}`}>
            <div className={styles['col-12']}>
                <div className={`${styles['text-right']} ${styles['mt-3']} ${styles['score-head']}`}>
                    Winner:
                    <span className={styles['text-success']} style={{ margin: "0 5px" }}>{content?.winnat}</span>
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
        </div>
    )
}