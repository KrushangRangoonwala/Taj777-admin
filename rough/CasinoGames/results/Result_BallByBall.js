import React from 'react'

const Result_BallByBall = ({ modalContent }) => {
    return (
        <div className="d-flex justify-content-center">
            <div className="cricket20ballpopup cricket20ballresult">
                <img src="/assets/cards_new/ball-blank.png" />
                <span>{modalContent?.result_status} </span>
            </div>
        </div>
    )
}

export default Result_BallByBall