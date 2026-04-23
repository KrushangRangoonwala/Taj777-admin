import React, { useEffect, useState } from 'react';
import Collapse from 'react-bootstrap/Collapse';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { formatNumber, sanitizeNumber } from '../../../utilies/helpers';

export const OddsBox = ({ type, level, odds, size, noVal, suspended, animateColor, is_1_OddBox }) => {
    const isNoVal = (!odds || odds == "0" || odds == "0.00") && (!size || size == "0" || size == "0.00");
    const className = `bl-box ${type} ${level ? type + level : ''} ${noVal || isNoVal ? 'no-val' : ''} ${suspended && is_1_OddBox ? 'suspended' : ''}`;
    return (
        <div className={className}>
            {/* {animateColor && (<span className={`flash-overlay ${animateColor}`} />)} */}
            {isNoVal || suspended ? (
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

export const MarketTable = ({
    title,
    id,
    children,
    showBetLock = true,
    showUserBook = false,
    min,
    max,
    remark,
    marketClass = "market-6",
    column = [{ type: "back", title: "Back" }, { type: "lay", title: "Lay" }],
    isSectionOpen,
    toggleSection,
    dataLen,
}) => {
    const [isOpen, setIsOpen] = useState(true);

    if (!dataLen) return null;


    return (
        <div className={marketClass}>
            <div className="bet-table">
                <div className="bet-table-header" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
                    {/* <div className="bet-table-header" onClick={() => toggleSection(id)} style={{ cursor: 'pointer' }}> */}
                    <div className="nation-name">
                        <OverlayTrigger
                            trigger={['hover', 'focus']}
                            placement="top"
                            overlay={<Tooltip>{title}</Tooltip>}
                            container={document.body}
                            popperConfig={{ strategy: 'fixed' }}
                        >
                            <span>
                                <a role='button'>
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
                                {' '}{title}
                            </span>
                        </OverlayTrigger>
                    </div>
                    <div className="float-right">
                        {showBetLock && <a href="javascript:void(0)" className="btn btn-back">Bet Lock</a>}
                        {showUserBook && <a href="javascript:void(0)" className="btn btn-back" style={{ marginLeft: '3px' }}>User Book</a>}
                    </div>
                </div>
                <Collapse in={isOpen}>
                    {/* <Collapse in={isSectionOpen}> */}
                    <div id={id}>
                        <div className="bet-table-body">
                            <div className="bet-table-row bet-table-row-top">
                                <div className="text-right nation-name">
                                    {(min || max) && (
                                        <span className="max-bet">
                                            {(min || min == 0) && <>Min:<span>{formatNumber(sanitizeNumber(min))}</span></>}
                                            {(max || max == 0) && <> {max == 1 ? "" : "Max:"}<span>{formatNumber(sanitizeNumber(max))}</span></>}
                                        </span>
                                    )}
                                </div>
                                {column?.map((col, i) => (
                                    <div key={i} className={`${col.type} bl-title d-none-mobile`}>{col.title}</div>
                                ))}
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
