import React from 'react'
import styles from "./Result_Superover3.module.css";


const Result_Cricket2020 = ({ modalContent }) => {
    // console.log("const Result_Cricket2020 = ({ modalContent }) => {");
    if (!modalContent) return null;

    const resultData_ = JSON.parse(modalContent.data);
    const resultData = resultData_.t1;
    console.log('resultData', resultData);
    const cardsArr = JSON.parse(modalContent.cards);

    return (
        <div className={`${styles.row} ${styles.row5} ${styles['align-items-center']}`}>
            <div className={`${styles['col-12']} ${styles['col-lg-7']}`}>
                <div className={styles['casino-result-content']}>
                    <div
                        className={`${styles['casino-result-content-item']} ${styles['text-center']}`}
                        style={{ alignItems: "flex-end" }}
                    >
                        <div className={styles['casino-result-cards']}>
                            <div className={styles['casino-result-cards-item']}>
                                <img src={`/assets/cards_new/${cardsArr[0]}.png`} alt="Card" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`${styles['col-12']} ${styles['col-lg-5']}`}>
                <div className={styles['casino-result-desc']}>
                    <div className={styles['casino-result-desc-item']}>
                        <div>Run</div>
                        <div>{resultData.win}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Result_Cricket2020