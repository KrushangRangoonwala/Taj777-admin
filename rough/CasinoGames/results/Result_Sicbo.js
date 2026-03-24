import React from 'react'
import styles from "./Result_Superover3.module.css";

import { getImage, getDefaultCardImage } from '../../../utilies/helpers';
import { useGetFileData } from '../../../hooks/useGetFileData';

const Result_Sicbo = ({ modalContent }) => {
    const { game_name } = useGetFileData();
    if (!modalContent) return null;


    const resultData_ = JSON.parse(modalContent.data);
    const resultData = resultData_?.t1;
    console.log("resultData", resultData);
    const cards = JSON.parse(modalContent?.cards);
    console.log("cards", cards);

    const resultDetails = resultData?.rdesc?.split("#");

    return (
        <div className={`${styles.row} ${styles.row5} ${styles["worli-result"]}`}>
            <div className={`${styles["col-12"]} ${styles["col-lg-7"]}`}>
                <div className={styles["casino-result-content"]}>
                    <div
                        className={`${styles["casino-result-content-item"]} ${styles["text-center"]} ${styles["w-100"]}`}
                    >
                        <div className={styles["casino-result-cards"]}>
                            {cards.map((src, index) => (
                                <div
                                    key={index}
                                    className={styles["casino-result-cards-item"]}
                                >
                                    <img src={getImage('dice' + src)} alt={`Dice ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`${styles["col-12"]} ${styles["col-lg-5"]}`}>
                <div className={styles["casino-result-desc"]}>
                    <div className={styles["casino-result-desc-item"]}>
                        <div>Desc</div>
                        <div>{modalContent?.desc_remakrs}</div>
                    </div>

                    <div className={styles["casino-result-desc-item"]}>
                        <div>Win</div>
                        <div>{modalContent?.result_status}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Result_Sicbo;