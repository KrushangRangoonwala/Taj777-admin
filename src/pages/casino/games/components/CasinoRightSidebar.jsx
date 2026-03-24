import React from 'react'

const CasinoRightSidebar = () => {
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
                                                    <a href="javascript:void(0)" className="btn btn-back float-right">
                                                        View More
                                                    </a>
                                                </div>
                                                <div className="card-body1">
                                                    <div className="tab-content">
                                                        <div id="matched-bet" className="tab-pane active">
                                                            <div className="table-responsive1">
                                                                <table className="table coupon-table table-striped mb-0">
                                                                    <thead>
                                                                        <tr>
                                                                            <th style={{ minWidth: "90px" }}>UserName</th>
                                                                            <th className="text-right" style={{ minWidth: "50px" }}>
                                                                                Rate
                                                                            </th>
                                                                            <th className="text-right" style={{ minWidth: "70px" }}>
                                                                                Amount
                                                                            </th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td colSpan="4" className="text-center">
                                                                                No records found
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="simplebar-placeholder" style={{ width: "auto", height: "114px" }}></div>
                    </div>
                    <div className="simplebar-track simplebar-horizontal" style={{ visibility: "hidden" }}>
                        <div className="simplebar-scrollbar" style={{ width: "0px", display: "none" }}></div>
                    </div>
                    <div className="simplebar-track simplebar-vertical" style={{ visibility: "hidden" }}>
                        <div className="simplebar-scrollbar" style={{ height: "0px", display: "none" }}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CasinoRightSidebar