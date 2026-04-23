import React from 'react';
import { Modal } from 'react-bootstrap';

const MarketAnalysisModal = ({ show, onHide }) => {
    const iplTeams = [
        { name: "Mumbai Indians", value: "-100" },
        { name: "Royal Challengers Bengaluru", value: "570" },
        { name: "Chennai Super Kings", value: "-100" },
        { name: "Sunrisers Hyderabad", value: "-100" },
        { name: "Delhi Capitals", value: "-100" },
        { name: "Punjab Kings", value: "-100" },
        { name: "Gujarat Titans", value: "-100" },
        { name: "Lucknow Super Giants", value: "-100" },
        { name: "Kolkata Knight Riders", value: "-100" },
        { name: "Rajasthan Royals", value: "-100" }
    ];

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            dialogClassName="modal-big"
            contentClassName="modal-content"
            aria-labelledby="market-analysis-modal-title"
        // centered
        >
            <Modal.Header className="modal-header">
                <Modal.Title id="market-analysis-modal-title" as="h5" className="modal-title">
                    Market Analysis (DUMMY)
                </Modal.Title>
                <button type="button" aria-label="Close" className="close" onClick={onHide}>×</button>
            </Modal.Header>
            <Modal.Body className="modal-body">
                <div className="search-analysis">
                    <div className="row row5">
                        <div className="col-md-3">
                            <div className="block-title"><span>Game Detail</span></div>
                            <div className="analysis-detail">
                                <div className="row row5">
                                    <label className="col-md-6"><b>Username</b></label>
                                    <div className="col-md-6 text-right"><b title="Apapap">Ras44</b></div>
                                </div>
                                <div className="row row5">
                                    <label className="col-md-6">Account Type</label>
                                    <div className="col-md-6 text-right">User</div>
                                </div>
                                <div className="row row5">
                                    <label className="col-md-6">General</label>
                                    <div className="col-md-6 text-right">1,378.6</div>
                                </div>
                                <div className="row row5">
                                    <label className="col-md-6">Exposure</label>
                                    <div className="col-md-6 text-right">100</div>
                                </div>
                                <div className="row row5">
                                    <label className="col-md-6">Credit Reference</label>
                                    <div className="col-md-6 text-right">5,000</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="block-title"><span>User Lock</span></div>
                            <div className="search-analysis-table mb-3">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Master Name</th>
                                            <th className="text-center">User Act</th>
                                            <th className="text-center">Bet Active</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Arpit526</td>
                                            <td className="text-center"><i className="fas fa-check-square"></i></td>
                                            <td className="text-center"><i className="fas fa-check-square"></i></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="col-md-5">
                            <div className="block-title"><span>Game Lock</span></div>
                            <div className="search-analysis-table mb-3">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>S.No.</th>
                                            <th>Master Name</th>
                                            <th className="text-center">Bet Lock</th>
                                            <th>Event Name</th>
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
                    <div className="market-analysis-container">
                        <div className="market-analysis-container">
                            <div className="market-analysis-title">
                                <div><a href="javascript:void(0)"> Indian Premier League</a></div>
                                <div>28/03/2026 07:00:00</div>
                            </div>
                            <div className="market-analysis-content">
                                <div className="row row5">
                                    <div className="col-md-4">
                                        <div className="market-analysis-content-detail">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th colSpan="2">
                                                            IPL Cup Winner Bookmaker
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {iplTeams.map((team, index) => (
                                                        <tr key={index}>
                                                            <td>{team.name}</td>
                                                            <td className="text-right">{team.value}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default MarketAnalysisModal;
