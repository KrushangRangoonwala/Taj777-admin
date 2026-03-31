import React from 'react';
import { formatNumber } from '../../../../utilies/helpers';

const BetLimitInfo = ({ id, openRanges, toggleRange, min, max, iconClass = "", fallbackMax = 500000 }) => {
    return (
        <>
            <i
                onClick={() => toggleRange(id)}
                className={`fas fa-info-circle ${iconClass} ${openRanges[id] ? "" : "collapsed"}`}
                style={{ cursor: "pointer" }}
            ></i>
            <div className={`icon-range collapse ${openRanges[id] ? "show" : ""}`}>
                R:<span>{formatNumber(min || 100)}</span>-<span>{formatNumber(max || fallbackMax)}</span>
            </div>
        </>
    );
};

export default BetLimitInfo;
