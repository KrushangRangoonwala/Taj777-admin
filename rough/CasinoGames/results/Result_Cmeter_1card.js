import React from 'react'
import styles from "./Result_Superover3.module.css";
import Result_details from './Result_details';


const Result_Cmeter_1card = ({ modalContent }) => {
    // console.log("const Result_Cricket2020 = ({ modalContent }) => {");
    if (!modalContent) return null;
    const resultData_ = JSON.parse(modalContent.data);
    const resultData = resultData_.t1;
    console.log('resultData', resultData)
    // const cardsArr = JSON.parse(modalContent.cards);
    const cardArr = resultData.card.split(',');

    function WinnerImage() {
        return (
            <div className={styles['casino-result-cards-item']}>
                <img src="/assets/images/winner.png" className={styles['winner-icon']} alt="Winner" />
            </div>
        )
    }

    const resultDetails = [
        { label: "Winner", value: resultData.winnat },
        { label: "Points", value: resultData.rdesc.split('#')[1] },
    ]

    return (
        <>
            {/* Result Section */}
            <div className={`${styles.row} ${styles.row5}`}>
                <div className={`${styles['col-12']} ${styles['col-lg-7']}`}>
                    <div className={styles['casino-result-content']}>
                        <div className={`${styles['casino-result-content-item']} ${styles['text-center']}`}>
                            <div className={styles['casino-result-cards']}>
                                {resultData.win === '1' && <WinnerImage />}

                                <div className={styles['d-inline-block']}>
                                    <h4>Fighter A</h4>
                                    <div className={styles['casino-result-cards-item']}>
                                        <img
                                            src={`/assets/cards_new/${cardArr[0]}.png`}
                                            alt="Card"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles['casino-result-content-diveder']} />

                        <div className={`${styles['casino-result-content-item']} ${styles['text-center']}`}>
                            <div className={styles['casino-result-cards']}>
                                {resultData.win === '2' && <WinnerImage />}

                                <div className={styles['d-inline-block']}>
                                    <h4>Fighter B</h4>
                                    <div className={styles['casino-result-cards-item']}>
                                        <img
                                            src={`/assets/cards_new/${cardArr[1]}.png`}
                                            alt="Card"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Result_details resultData={resultDetails} />
            </div >
        </>
    )
}

export default Result_Cmeter_1card;