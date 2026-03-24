import React, { useEffect, useState } from 'react'
import styles from "./Result_Superover3.module.css";

import { isLow } from '../Cmeter';
import Result_details from './Result_details';

const cardUrl = (card) => `/assets/cards_new/${card}.png`;

const Result_cmeter = ({ modalContent }) => {
    const [lowCards, setLowCards] = useState([]);
    const [highCards, setHighCards] = useState([]);
    const [cards, setCards] = useState([]);
    const [winner, setWinner] = useState(null)

    useEffect(() => {
        const resultData_ = JSON.parse(modalContent.data);
        const data = resultData_.t1;
        console.log('resultData', data)

        const cards_ = data?.card?.split(",");
        const cardsArr = cards_?.filter(val => val !== '1');
        setCards(cardsArr);
        setWinner(data?.winnat)
    }, [modalContent]);

    useEffect(() => {
        let low = [];
        let high = [];
        cards?.forEach((card) => {
            if (isLow(card)) {
                low.push(card);
            } else {
                high.push(card);
            }
        });
        // console.log('$$ cards', cards);
        // console.log('$$ low', low);
        // console.log('$$ high', high);
        setLowCards(low);
        setHighCards(high);
    }, [cards])

    if (!modalContent) return null;

    const resultDetails = [
        { label: "Winner", value: winner },
    ]

    return (
        <div className={`${styles.row} ${styles.row5}`}>
            <div className={`${styles['col-12']} ${styles['col-lg-9']}`}>
                <div className={`${styles.row} ${styles['align-items-center']}`}>
                    <div className={styles['col-10']}>
                        {/* Low Cards */}
                        <div className={`${styles.row} ${styles['align-items-center']}`}>
                            <div className={styles['col-2']}>
                                <b>Low Cards</b>
                            </div>

                            <div className={styles['col-10']}>
                                {lowCards.map((card) => (
                                    <div
                                        key={card}
                                        className={styles['casino-result-cards-item']}
                                    >
                                        <img
                                            src={cardUrl(card)}
                                            alt={card}
                                            className={styles['mr-2']}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* High Cards */}
                        <div
                            className={`${styles.row} ${styles['align-items-center']} ${styles['mt-3']}`}
                        >
                            <div className={styles['col-2']}>
                                <b>High Cards</b>
                            </div>

                            <div className={styles['col-10']}>
                                {highCards.map((card) => (
                                    <div
                                        key={card}
                                        className={styles['casino-result-cards-item']}
                                    >
                                        <img
                                            src={cardUrl(card)}
                                            alt={card}
                                            className={styles['mr-2']}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Center Empty Column */}
                    <div
                        className={`${styles['col-2']} ${styles['text-center']}`}
                    >
                        <div className={styles['casino-result-cards-item']} />
                    </div>
                </div>
            </div>

            <Result_details resultData={resultDetails} />
        </div>
    )
}

export default Result_cmeter;