import React from 'react'
import styles from "./Result_Superover3.module.css";

import { getImage, getDefaultCardImage } from '../../../utilies/helpers';
import Result_details from './Result_details';

function WinnerIcon() {
    return <div className={styles["casino-result-cards-item"]}>
        <img
            src={getImage("winner", "images")}
            className={styles["winner-icon"]}
            alt="Winner"
        />
    </div>
}

const players = ['Dragon', 'Tiger', 'Lion'];
const labelArr = ["Winner", "Red/Black", "Odd/Even", "Card"];

const Result_DTL20 = ({ modalContent }) => {
    if (!modalContent) return null;


    const resultData_ = JSON.parse(modalContent.data);
    const resultData = resultData_?.t1;
    console.log("resultData", resultData);
    const cards = JSON.parse(modalContent?.cards);
    console.log("cards", cards);

    const resultDetails = resultData?.rdesc?.split("#");

    const resultData__ = [
        { label: "Winner", value: resultDetails?.[0] || "" },
        { label: "Red/Black", value: resultDetails?.[1] || "" },
        { label: "Odd/Even", value: resultDetails?.[2] || "" },
        { label: "Card", value: resultDetails?.[3] || "" },
    ]

    return (
        <div className={`${styles.row} ${styles.row5} ${styles["dtl20-result"]}`}>

            {/* Players */}
            {players.map((item, index) => (
                <div
                    key={index}
                    className={`${styles["col-12"]} ${styles["col-lg-2"]}`}
                >
                    <div className={styles["text-center"]}>
                        <div className={styles["casino-result-cards"]}>

                            {item === resultData?.winnat && <WinnerIcon />}

                            <div className={styles["d-inline-block"]}>
                                <h4>{item}</h4>
                                <div className={styles["casino-result-cards-item"]}>
                                    <img src={getImage(cards?.[index])} alt={cards?.[index]} />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            ))}

            {/* Result Description */}
            {/* <div className={`${styles["col-12"]} ${styles["col-lg-6"]}`}>
                <div className={styles["casino-result-desc"]}>
                    {labelArr.map((item, index) => (
                        <div key={index} className={styles["casino-result-desc-item"]}>
                            <div>{item}</div>
                            <div>{resultDetails?.[index]}</div>
                        </div>
                    ))}
                </div>
            </div> */}

            <Result_details resultData={resultData__} />

        </div>
    )
}

export default Result_DTL20;