import React, { useState } from 'react';
import Collapse from 'react-bootstrap/Collapse';

export const OddsBox = ({ type, level, odds, size, noVal, suspended }) => {
    const className = `bl-box ${type} ${level ? type + level : ''} ${noVal ? 'no-val' : ''} ${suspended ? 'suspended' : ''}`;
    return (
        <div className={className}>
            <span className="d-block odds">{odds || '—'}</span>
            {size && <span className="d-block">{size}</span>}
        </div>
    );
};

export const MarketTable = ({ title, id, children, showBetLock = true, showUserBook = false, min, max, remark, marketClass = "market-6", columnHeader_1 = false, columnHeader_2 = false }) => {
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
                                            {min && <>Min:<span>{min}</span></>}
                                            {max && <> Max:<span>{max}</span></>}
                                        </span>
                                    )}
                                </div>
                                {columnHeader_1 && <div className={`${columnHeader_1.type} bl-title d-none-mobile`}>{columnHeader_1.title}</div>}
                                {columnHeader_2 && <div className={`${columnHeader_2.type} bl-title d-none-mobile`}>{columnHeader_2.title}</div>}
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

export const MarketRow = ({ name, back, lay }) => {
    // back/lay are expected to be arrays of {odds, size, level, noVal}
    return (
        <React.Fragment>
            <div className="bet-table-mobile-row d-none-desktop">
                <div className="bet-table-mobile-team-name">
                    <span>{name}</span> <span style={{ color: 'rgb(153, 153, 153)' }}>0</span> <span className="d-none">0</span>
                </div>
            </div>
            <div data-title="ACTIVE" className="bet-table-row">
                <div className="nation-name d-none-mobile">
                    <p>{name}</p>
                    <p className="mb-0 float-left" style={{ color: 'rgb(153, 153, 153)' }}>0</p>
                    <p className="mb-0 float-right d-none">0</p>
                </div>
                {back.map((box, i) => (
                    <OddsBox key={`back-${i}`} type="back" {...box} />
                ))}
                {lay.map((box, i) => (
                    <OddsBox key={`lay-${i}`} type="lay" {...box} />
                ))}
            </div>
        </React.Fragment>
    );
};

export const FancyMarketRow = ({ name, boxes, min, max, type = "fancy" }) => {
    return (
        <div className="fancy-tripple">
            <div className="bet-table-mobile-row d-none-desktop">
                <div className="bet-table-mobile-team-name">
                    <span>{name}</span> <span style={{ color: 'rgb(153, 153, 153)' }}>0</span>
                </div>
            </div>
            <div data-title="" className={type === "khado" ? "bet-table-row" : "bet-table-row"}>
                <div className="nation-name d-none-mobile">
                    <p>{type === "khado" ? <span>{name}</span> : name}</p>
                    <p className="mb-0" style={{ color: 'rgb(153, 153, 153)' }}>0</p>
                </div>
                {boxes.map((box, i) => (
                    <OddsBox key={i} {...box} />
                ))}
                <div className="fancy-min-max">
                    {min && <>Min:<span>{min}</span></>}
                    {max && <> Max:<span>{max}</span></>}
                </div>
            </div>
        </div>
    );
};
