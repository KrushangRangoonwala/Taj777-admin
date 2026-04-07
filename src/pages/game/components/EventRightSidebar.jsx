import React, { useState } from 'react';
import { Collapse } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import SafeIframe from '../../../components/SafeIframe';

const EventRightSidebar = ({ tvUrl }) => {
    const [isTvOn, setIsTvOn] = useState(false);
    const [betList, setBetList] = useState([
        {
            marketType: 'Normal',
            date: '23/03/2026 23:10:28',
            userName: 'Ras52',
            nation: 'Fall of 1st wkt RCB(RCB vs SRH)adv / 90',
            rate: '30',
            amount: '100'
        },
        {
            marketType: 'Bookmaker',
            date: '23/03/2026 23:10:15',
            userName: 'Ras52',
            nation: 'RC Bengaluru',
            rate: '84',
            amount: '100',
        }
    ]);

    return (
        <div className="right-sidebar">
            <SimpleBar style={{ maxHeight: '100%' }}>
                <div className="card m-b-10"></div>

                <div className="card m-b-10">
                    <div data-toggle="collapse" data-target=".video-tv" aria-expanded="true" className="card-header pointer" onClick={() => setIsTvOn(!isTvOn)}>
                        <h6 className="card-title">
                            <Link to="" title="">
                                <img src="/admin/assets/images/arrow-down.svg" className="mr-1" />
                            </Link>
                            Live Match
                        </h6>
                    </div>
                    <Collapse in={isTvOn}>
                        <div className="video-tv">
                            <SafeIframe allow="autoplay" src={tvUrl} />
                        </div>
                    </Collapse>
                </div>

                <div id="my-game-bets" className="card m-b-10 my-bet">
                    <div className="card-header">
                        <h6 className="card-title float-left">My Bets</h6>
                        <a href="javascript:void(0)" className="btn btn-back float-right">View More</a>
                    </div>
                    <div className="card-body">
                        <div className="tabs">
                            <ul role="tablist" className="nav nav-tabs small">
                                <li role="presentation" className="nav-item">
                                    <a role="tab" aria-selected="true" href="#" target="_self" className="nav-link active">Matched Bets</a>
                                </li>
                            </ul>
                            <div className="tab-content">
                                <div role="tabpanel" className="tab-pane active">
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
                                                {betList.length > 0 ? (
                                                    betList.map((bet, index) => (
                                                        <React.Fragment key={index}>
                                                            <tr className="back-border">
                                                                <td colSpan="4"><b>{bet.marketType}</b> <span className="float-right">{bet.date}</span></td>
                                                            </tr>
                                                            <tr className="back-border">
                                                                <td className="bt0">{bet.userName}</td>
                                                                <td className="bt0">
                                                                    {bet.nation}
                                                                </td>
                                                                <td className="text-right bt0">{bet.rate}</td>
                                                                <td className="text-right bt0">{bet.amount}</td>
                                                            </tr>
                                                            <tr>
                                                                <td colSpan="4" style={{ height: '3px', padding: '0px' }}></td>
                                                            </tr>
                                                        </React.Fragment>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className="text-center">No records found</td>
                                                    </tr>
                                                )}
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

export default EventRightSidebar;