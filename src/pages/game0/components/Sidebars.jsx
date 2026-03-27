import React from 'react';
import SimpleBar from 'simplebar-react';

export const MyBetsSidebar = () => {
    return (
        <div className="right-sidebar">
            <SimpleBar style={{ maxHeight: '100%' }}>
                <div className="card m-b-10"></div>
                <div id="my-game-bets" className="card m-b-10 my-bet">
                    <div className="card-header">
                        <h6 className="card-title float-left">My Bets</h6>
                        <a href="javascript:void(0)" className="btn btn-back float-right">View More</a>
                    </div>
                    <div className="card-body">
                        <div className="tabs">
                            <ul role="tablist" class="nav nav-tabs small">
                                <li role="presentation" class="nav-item">
                                    <a role="tab" aria-selected="true" href="#" target="_self" class="nav-link active">Matched Bets</a>
                                </li>
                            </ul>
                            <div className="tab-content">
                                <div role="tabpanel" class="tab-pane active">
                                    <div className="table-responsive">
                                        <table className="table coupon-table mb-0">
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: '90px' }}>UserName</th>
                                                    <th style={{ minWidth: '90px' }}>Nation</th>
                                                    <th className="text-right" style={{ minWidth: '50px' }}>Rate</th>
                                                    <th className="text-right" style={{ minWidth: '70px' }}>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td colSpan="4" className="text-center">No records found</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleBar>
        </div>
    );
};
