import React from 'react'
import styles from './Superover_Rules.module.css'

const cardsData = [
    {
        cardImg: 'cardA.png',
        cardAlt: 'Card A',
        valueImg: 'ball1.png',
        valueAlt: 'Ball 1',
        isWicket: false
    },
    {
        cardImg: 'card2.png',
        cardAlt: 'Card 2',
        valueImg: 'ball2.png',
        valueAlt: 'Ball 2',
        isWicket: false
    },
    {
        cardImg: 'card3.png',
        cardAlt: 'Card 3',
        valueImg: 'ball3.png',
        valueAlt: 'Ball 3',
        isWicket: false
    },
    {
        cardImg: 'card4.png',
        cardAlt: 'Card 4',
        valueImg: 'ball4.png',
        valueAlt: 'Ball 4',
        isWicket: false
    },
    {
        cardImg: 'card6.png',
        cardAlt: 'Card 6',
        valueImg: 'ball6.png',
        valueAlt: 'Ball 6',
        isWicket: false
    },
    {
        cardImg: 'card10.png',
        cardAlt: 'Card 10',
        valueImg: 'ball0.png',
        valueAlt: 'Ball 0',
        isWicket: false
    },
    {
        cardImg: 'cardK.png',
        cardAlt: 'Card K',
        valueImg: 'wicket.png',
        valueAlt: 'Wicket',
        isWicket: true
    }
];


const Superover_Rules = ({ superover_title }) => {
    return (
        <div className={`${styles['mt-2']} ${styles['cricket-rule']} ${styles['casino-place-bet']}`}>
            <div className={`${styles['casino-place-bet-title']} ${styles['text-center']}`} style={{ color: "var(--text-table)" }}>
                {superover_title}
                <br />
                Inning&apos;s Card Rules
            </div>

            <div className={styles['card']}>
                <div className={styles['card-header']}>
                    <div className={`${styles['row']} ${styles['row5']} ${styles['mt-1']}`}>
                        <div className={styles['col-4']} style={{ textAlign: 'left' }}>Cards</div>
                        <div className={`${styles['col-3']} ${styles['text-center']}`}>Count</div>
                        <div className={`${styles['col-5']} ${styles['text-right']}`}>Value</div>
                    </div>
                </div>

                <div className={styles['card-body']}>
                    {cardsData.map((item, index) => (
                        <div
                            key={index}
                            className={`${styles['row']} ${styles['row5']} ${styles['mt-1']}`}
                        >
                            <div className={styles['col-4']} style={{ textAlign: 'left' }}>
                                <img
                                    src={`https://wver.sprintstaticdata.com/v194/static/front/img/superOver/cards/${item.cardImg}`}
                                    alt={item.cardAlt}
                                />
                                <span className={styles['ml-2']}>X</span>
                            </div>

                            <div className={`${styles['col-3']} ${styles['text-center']}`}>
                                5
                            </div>

                            <div className={`${styles['col-5']} ${styles['text-right']} ${styles['value']}`}>
                                {item.isWicket && 'WICKET '}
                                <img
                                    src={`https://wver.sprintstaticdata.com/v194/static/front/img/superOver/balls/${item.valueImg}`}
                                    alt={item.valueAlt}
                                />
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}

export default Superover_Rules