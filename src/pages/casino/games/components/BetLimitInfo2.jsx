import React, { useState } from 'react';
import { formatNumber } from '../../../../utilies/helpers';

const BetLimitInfo = ({ min, max }) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <>
            <i
                onClick={() => setIsOpen(!isOpen)}
                className={`fas fa-info-circle ${isOpen ? "" : "collapsed"}`}
                style={{ cursor: "pointer" }}
            ></i>
            <div className={`icon-range collapse ${isOpen ? "show" : ""}`}>
                R:<span>{formatNumber(min || 100)}</span>-<span>{formatNumber(max || 500000)}</span>
            </div>
        </>
    );
};

export default BetLimitInfo;
