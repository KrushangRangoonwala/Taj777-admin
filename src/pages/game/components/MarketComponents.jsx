import React, { useState } from 'react';
import Collapse from 'react-bootstrap/Collapse';
import { formatNumber, sanitizeNumber } from '../../../utilies/helpers';

export const OddsBox = ({ type, level, odds, size, noVal, suspended, animateColor }) => {
    const isNoVal = (!odds || odds == "0" || odds == "0.00") && (!size || size == "0" || size == "0.00");
    const className = `bl-box ${type} ${level ? type + level : ''} ${noVal || isNoVal ? 'no-val' : ''} ${suspended ? 'suspended' : ''}`;
    return (
        <div className={className}>
            {/* {animateColor && (<span className={`flash-overlay ${animateColor}`} />)} */}
            {isNoVal && !suspended ? (
                <span className="d-block odds aqa">—</span>
            ) : (
                <>
                    <span className="d-block odds" style={{ color: "black", position: 'relative', zIndex: 2 }}>{odds || '—'}</span>
                    {size && <span className="d-block" style={{ position: 'relative', zIndex: 2 }}>{size}</span>}
                </>
            )}
        </div>
    );
};

export const MarketTable = ({ title, id, children, showBetLock = true, showUserBook = false, min, max, remark, marketClass = "market-6", columnHeader_1 = false, columnHeader_2 = false, isLayFirst }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className={marketClass}>
            <div className="bet-table">
                <div className="bet-table-header" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
                    <div className="nation-name">
                        <span title={title}>
                            <a href="javascript:void(0)" title="">
                                <img
                                    src="https://wver.sprintstaticdata.com/v208/static/front/img/arrow-down.svg"
                                    className="mr-1"
                                    // style={{
                                    //     transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                                    //     transition: 'transform 0.3s ease-in-out'
                                    // }}
                                    alt=""
                                />
                            </a>
                            {title}
                        </span>
                    </div>
                    <div className="float-right">
                        {showBetLock && <a href="javascript:void(0)" className="btn btn-back">Bet Lock</a>}
                        {showUserBook && <a href="javascript:void(0)" className="btn btn-back" style={{ marginLeft: '3px' }}>User Book</a>}
                    </div>
                </div>
                <Collapse in={isOpen}>
                    <div id={id}>
                        <div className="bet-table-body">
                            <div className="bet-table-row bet-table-row-top">
                                <div className="text-right nation-name">
                                    {(min || max) && (
                                        <span className="max-bet">
                                            {(min || min == 0) && <>Min:<span>{formatNumber(sanitizeNumber(min))}</span></>}
                                            {(max || max == 0) && <> Max:<span>{formatNumber(sanitizeNumber(max))}</span></>}
                                        </span>
                                    )}
                                </div>
                                {isLayFirst ?
                                    <>
                                        {columnHeader_2 && <div className={`${columnHeader_2.type} bl-title d-none-mobile`}>{columnHeader_2.title}</div>}
                                        {columnHeader_1 && <div className={`${columnHeader_1.type} bl-title d-none-mobile`}>{columnHeader_1.title}</div>}
                                    </>
                                    : <>
                                        {columnHeader_1 && <div className={`${columnHeader_1.type} bl-title d-none-mobile`}>{columnHeader_1.title}</div>}
                                        {columnHeader_2 && <div className={`${columnHeader_2.type} bl-title d-none-mobile`}>{columnHeader_2.title}</div>}
                                    </>}
                            </div>
                            {children}
                        </div>
                    </div>
                </Collapse>
            </div>
            {remark && <small className="remark">{remark}</small>}
        </div>
    );
};
