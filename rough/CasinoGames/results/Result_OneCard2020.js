import React from 'react'
import styles from "./Result_Superover3.module.css";

import { getImage } from '../../../utilies/helpers';
import { useGetFileData } from '../../../hooks/useGetFileData';

function WinnerIcon() {
    return (
        <div className={styles["casino-result-cards-item"]}>
            <img
                src={getImage("winner", "images")}
                className={styles["winner-icon"]}
                alt="Winner"
            />
        </div>
    );
}

const Result_OneCard2020 = ({ modalContent }) => {
    const { game_name } = useGetFileData();
    if (!modalContent) return null;

    const resultData_ = JSON.parse(modalContent.data);
    const resultData = resultData_?.t1;
    const cards = JSON.parse(modalContent?.cards);

    // Assuming rdesc format might contain additional info, but following OneCardOneDay pattern
    const resultDetails = resultData?.rdesc?.split("#") || [];

    return (
        <div className={`${styles.row} ${styles.row5}`}>
            <div className={`${styles["col-12"]} ${styles["col-lg-7"]}`}>
                <div className={styles["casino-result-content"]}>
                    {/* Player Section */}
                    <div className={`${styles["casino-result-content-item"]} ${styles["text-center"]}`}>
                        <div className={styles["casino-result-cards"]}>
                            {resultData?.winnat === "Player" && <WinnerIcon />}
                            <div className={styles["d-inline-block"]}>
                                <h4>Player</h4>
                                <div className={styles["casino-result-cards-item"]}>
                                    <img src={getImage(cards?.[0])} alt="Player Card" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles["casino-result-content-diveder"]}></div>

                    {/* Dealer Section */}
                    <div className={`${styles["casino-result-content-item"]} ${styles["text-center"]}`}>
                        <div className={styles["casino-result-cards"]}>
                            {resultData?.winnat === "Dealer" && <WinnerIcon />}
                            <div className={styles["d-inline-block"]}>
                                <h4>Dealer</h4>
                                <div className={styles["casino-result-cards-item"]}>
                                    <img src={getImage(cards?.[1])} alt="Dealer Card" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`${styles["col-12"]} ${styles["col-lg-5"]}`}>
                <div className={styles["casino-result-desc"]}>
                    <div className={styles["casino-result-desc-item"]}>
                        <div>Winner</div>
                        <div>{resultData?.winnat || "-"}</div>
                    </div>
                    {resultDetails?.[1] && (
                        <div className={styles["casino-result-desc-item"]}>
                            <div>Pair</div>
                            <div>{resultDetails?.[1] || "-"}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Result_OneCard2020;
