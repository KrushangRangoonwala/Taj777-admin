import React from 'react'
import styles from "./Result_Superover3.module.css";


const Result_Goal = ({ modalContent }) => {
    console.log('modalContent', modalContent);
    const [playerName, goalType] = modalContent?.desc_remakrs?.split("#");
    const txt = goalType.toLowerCase() === "no goal" ? goalType : `${goalType} by ${playerName}`;
    return (
        <div className={`${styles["d-flex"]} ${styles["justify-content-center"]}`}>
            <div className={`${styles["goal-result"]} ${styles["cricket20ballpopup"]} ${styles["cricket20ballresult"]}`}>
                <img src="https://wver.sprintstaticdata.com/v196/static/front/img/balls/soccer-ball.png" alt="Soccer Ball" />
                <span style={{ lineHeight: "22px" }}>{txt}</span>
            </div>
        </div>
    )
}

export default Result_Goal