import React, { useState } from 'react';

const RadioFilter = ({ id, label, value, checked, onChange, name = "example" }) => {
    return (
        <div className="custom-control custom-radio custom-control-inline">
            <input
                type="radio"
                id={id}
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                className="custom-control-input"
            />
            <label htmlFor={id} className="custom-control-label">{label}</label>
        </div>
    );
};

const Result_BetData = ({ betData, selectedFilter, setSelectedFilter }) => {
    const filteredBets = betData.filter(bet =>
        selectedFilter === 'all' || bet.bet_type === selectedFilter
    );

    const totalBets = filteredBets.length;
    const totalWin = filteredBets.reduce((sum, bet) => sum + Number(bet.bet_result || 0), 0);

    if (!betData || betData.length === 0) return null;

    return (
        <div>
            <div className="mt-4">
                <RadioFilter
                    id="soda-all"
                    label="All"
                    value="all"
                    checked={selectedFilter === 'all'}
                    onChange={() => setSelectedFilter('all')}
                />
                <RadioFilter
                    id="soda-back"
                    label="Back"
                    value="Back"
                    checked={selectedFilter === 'Back'}
                    onChange={() => setSelectedFilter('Back')}
                />
                <RadioFilter
                    id="soda-lay"
                    label="Lay"
                    value="Lay"
                    checked={selectedFilter === 'Lay'}
                    onChange={() => setSelectedFilter('Lay')}
                />
                <RadioFilter
                    id="soda-deleted"
                    label="Deleted"
                    value="Deleted"
                    checked={selectedFilter === 'Deleted'}
                    onChange={() => setSelectedFilter('Deleted')}
                />
                <div className="custom-control-inline float-right">
                    <h5>Total Bets: <span className="text-success mr-2">{totalBets}</span> Total Win: <span
                        className={totalWin >= 0 ? "text-success" : "text-danger"}>{totalWin}</span></h5>
                </div>
            </div>
            <div className="table-responsive report-table">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="user-name">
                                <div>Username</div>
                            </th>
                            <th className="event-name">
                                <div>Nation</div>
                            </th>
                            <th className="text-right bet-user-rate">
                                <div>Rate</div>
                            </th>
                            <th className="text-right bet-amount">
                                <div>Amount</div>
                            </th>
                            <th className="text-right bet-amount">
                                <div>Win</div>
                            </th>
                            <th className="bet-date">
                                <div>Date</div>
                            </th>
                            <th>
                                <div>IP</div>
                            </th>
                            <th>
                                <div>B Details</div>
                            </th>
                            <th className="text-right">
                                <div>Action</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBets.length > 0 ? (
                            filteredBets.map((bet, index) => (
                                <tr key={index} className={bet.bet_type?.toLowerCase() === 'back' ? 'back-border' : 'lay-border'}>
                                    <td className="user-name"><span>{bet.user_name}</span></td>
                                    <td className="event-name">
                                        <div>{bet.market_name}</div>
                                    </td>
                                    <td className="text-right bet-user-rate">
                                        <div>{bet.bet_odds}</div>
                                    </td>
                                    <td className="text-right bet-amount">
                                        <div>{bet.bet_stack}</div>
                                    </td>
                                    <td className="text-right bet-amount">
                                        <div className={Number(bet.bet_result) >= 0 ? 'text-success' : 'text-danger'}>
                                            {bet.bet_result}
                                        </div>
                                    </td>
                                    <td className="bet-date">
                                        <div>{bet.bet_time}</div>
                                    </td>
                                    <td><a href="javascript:void(0)">{bet.bet_ip_address}</a></td>
                                    <td>
                                        <a
                                            href="javascript:void(0)"
                                            title={bet.bet_user_agent}
                                            className="text-success"
                                        >
                                            Detail
                                        </a>
                                    </td>
                                    <td className="text-right">
                                        <div className="custom-control custom-checkbox">
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                value="0"
                                                id={`bet-check-${index}`}
                                            />
                                            <label
                                                className="custom-control-label"
                                                htmlFor={`bet-check-${index}`}
                                            ></label>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr className="no-record">
                                <td colSpan="9">no records found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Result_BetData;
