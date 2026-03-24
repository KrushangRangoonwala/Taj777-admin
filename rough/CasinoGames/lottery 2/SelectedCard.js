import React, { memo } from "react";

const SelectedCard = memo(() => {
    console.log("RandomBets......"); // chatgpt : this logs continuesly, this shouldnt heppen
    return (
        <div>
            <img src="https://wver.sprintstaticdata.com/v198/static/front/img/lottery/balls/ball2.png" alt="ball2" />
            <img src="https://wver.sprintstaticdata.com/v198/static/front/img/lottery/balls/ball3.png" alt="ball3" />

            <button className="lottery-btn active p-2">
                Clear
            </button>
        </div>
    );
});

export default SelectedCard;
