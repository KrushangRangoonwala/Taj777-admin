import React from "react";

function BetBtns() {
    return (
        <div className="lottery-left">
            <div className="lottery-bet-buttons">
                <div style={{ backgroundImage: "url(/assets/images/coin.png)" }} className="active"><span>25</span></div>
                <div style={{ backgroundImage: "url(/assets/images/coin.png)" }} className=""><span>50</span></div>
                <div style={{ backgroundImage: "url(/assets/images/coin.png)" }} className=""><span>100</span></div>
                <div style={{ backgroundImage: "url(/assets/images/coin.png)" }} className=""><span>200</span></div>
                <div style={{ backgroundImage: "url(/assets/images/coin.png)" }} className=""><span>500</span></div>
                <div style={{ backgroundImage: "url(/assets/images/coin.png)" }} className=""><span>1000</span></div>
            </div>
        </div>
    );
}

export default BetBtns;
