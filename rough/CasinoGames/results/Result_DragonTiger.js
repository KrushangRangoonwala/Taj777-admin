import React from 'react'
import styles from "./Result_Superover3.module.css";

import { getImage } from '../../../utilies/helpers';
import { useGetFileData } from '../../../hooks/useGetFileData';
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

const Result_DragonTiger = ({ modalContent }) => {
    const { result_image } = useGetFileData();

    console.log('modalContent', modalContent);
    if (!modalContent) return null;

    const cards = JSON.parse(modalContent?.cards);

    const desc = modalContent?.desc_remakrs?.split("#");

    const resultData__ = [
        { label: "Winner", value: desc?.[0] || "" },
        { label: "Pair", value: desc?.[1] || "" },
        { label: "Odd/Even", value: desc?.[2] || "" },
        { label: "Color", value: desc?.[3] || "" },
        { label: modalContent?.game_type === 'dt6' ? "Suit" : "Card", value: desc?.[4] || "" },
    ];

    return (
        <div className={`${styles.row} ${styles.row5}`}>
            <div className={`${styles["col-12"]} ${styles["col-lg-7"]}`}>
                <div className={styles["casino-result-content"]}>
                    <div className={`${styles["casino-result-content-item"]} ${styles["text-center"]}`}>
                        <div className={styles["casino-result-cards"]}>
                            {modalContent?.result_status === "D" && <WinnerIcon />}

                            <div className={styles["d-inline-block"]}>
                                <h4>Dragon</h4>
                                <div className={styles["casino-result-cards-item"]}>
                                    <img src={getImage(cards[0], result_image)} alt="Dragon Card" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles["casino-result-content-diveder"]}></div>

                    <div className={`${styles["casino-result-content-item"]} ${styles["text-center"]}`}>
                        <div className={styles["casino-result-cards"]}>
                            {modalContent?.result_status === "T" && <WinnerIcon />}

                            <div className={styles["d-inline-block"]}>
                                <h4>Tiger</h4>
                                <div className={styles["casino-result-cards-item"]}>
                                    <img src={getImage(cards[1], result_image)} alt="Tiger Card" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Result_details resultData={resultData__} />
        </div>
    )
}

export default Result_DragonTiger;