import React from 'react'
import BetCountMob from './BetCountMob'
import { Link } from 'react-router-dom';
import CasinoViewMore from '../../../../components/CasinoViewMore';
import { useState } from 'react';

const CasinoRightSidebar = ({ RulesComponent }) => {
    const [isViewMoreOpen, setIsViewMoreOpen] = useState(false);

    const records = [
        // {
        //     nation: "Lionel Messi",
        //     date: "29/04/2026 22:36:17",
        //     userName: "Ras44",
        //     rate: "5.53",
        //     amount: "100"
        // }
    ];

    return (
        <div className="right-sidebar">
            <div className="right-sidebar">
                <div data-simplebar-auto-hide="true" data-simplebar="init">
                    <div className="simplebar-wrapper" style={{ margin: "0px" }}>
                        <div className="simplebar-height-auto-observer-wrapper">
                            <div className="simplebar-height-auto-observer"></div>
                        </div>
                        <div className="simplebar-mask">
                            <div className="simplebar-offset" style={{ right: "0px", bottom: "0px" }}>
                                <div
                                    className="simplebar-content-wrapper"
                                    tabIndex="0"
                                    role="region"
                                    aria-label="scrollable content"
                                    style={{ height: "auto", overflow: "hidden" }}
                                >
                                    <div className="simplebar-content" style={{ padding: "0px" }}>
                                        <div className="casino-right-sidebar">
                                            <div className="card m-b-10 my-bet">
                                                <div className="card-header">
                                                    <h6 className="card-title float-left">My Bets</h6>
                                                    <Link to="#" className="btn btn-back float-right" onClick={() => setIsViewMoreOpen(true)}>
                                                        View More
                                                    </Link>
                                                </div>
                                                <div className="card-body1">
                                                    <div className="tab-content">
                                                        <div id="matched-bet" className="tab-pane active">
                                                            <div className="table-responsive1">
                                                                <table className="table coupon-table table-striped mb-0">
                                                                    <thead>
                                                                        <tr>
                                                                            <th style={{ minWidth: "90px" }}>UserName</th>
                                                                            <th className="text-right" style={{ minWidth: "50px" }}>Rate</th>
                                                                            <th className="text-right" style={{ minWidth: "70px" }}>Amount</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {records && records.length > 0 ? (
                                                                            records.map((record, index) => (
                                                                                <React.Fragment key={index}>
                                                                                    <tr className="back-border">
                                                                                        <td colSpan="4">
                                                                                            <b>{record.nation}</b> <span className="float-right">{record.date}</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr className="back-border">
                                                                                        <td>{record.userName}</td>
                                                                                        <td className="text-right">{record.rate}</td>
                                                                                        <td className="text-right">{record.amount}</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td colSpan="4" className="" style={{ height: "3px", padding: "0px" }}></td>
                                                                                    </tr>
                                                                                </React.Fragment>
                                                                            ))
                                                                        ) : (
                                                                            <tr>
                                                                                <td colSpan="4" className="text-center">
                                                                                    No records found
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {RulesComponent
                                                ? <div className="card m-b-10"><RulesComponent /></div>
                                                : null}

                                            <BetCountMob betCount={0} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="simplebar-placeholder" style={{ width: "auto", height: "80vh" }}></div>
                    </div>
                    <div className="simplebar-track simplebar-horizontal" style={{ visibility: "hidden" }}>
                        <div className="simplebar-scrollbar" style={{ width: "0px", display: "none" }}></div>
                    </div>
                    <div className="simplebar-track simplebar-vertical" style={{ visibility: "hidden" }}>
                        <div className="simplebar-scrollbar" style={{ height: "0px", display: "none" }}></div>
                    </div>
                </div>
            </div>

            <CasinoViewMore show={isViewMoreOpen} onHide={() => setIsViewMoreOpen(false)} />
        </div>
    )
}

export default CasinoRightSidebar