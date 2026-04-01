import React from 'react'

const BetCountMob = ({ betCount }) => {
    return (
        <div className="market-show-icon d-none-desktop">
            <div className="bet-cnt">{betCount || 0}</div>
            <div className="bet-title">Bets</div>
        </div>
    )
}

export default BetCountMob