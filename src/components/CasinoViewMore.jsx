import React from 'react';
import { Modal } from 'react-bootstrap';

const CasinoViewMore = ({
    show,
    onHide,
    records = [
        // {
        //     userName: "Ras44",
        //     nation: "Lionel Messi",
        //     amount: "100",
        //     userRate: "5.53",
        //     placeDate: "29/04/2026 22:36:17",
        //     ip: "116.74.120.252"
        // }
    ]
}) => {
    return (
        <Modal
            show={show}
            onHide={onHide}
            dialogClassName="modal-big"
            id="__BVID__65"
            role="dialog"
            aria-labelledby="__BVID__65___BV_modal_title_"
            aria-describedby="__BVID__65___BV_modal_body_"
        >
            <Modal.Header id="__BVID__65___BV_modal_header_">
                <Modal.Title as="h5" id="__BVID__65___BV_modal_title_">View More</Modal.Title>
                <button type="button" aria-label="Close" className="close" onClick={onHide}>×</button>
            </Modal.Header>
            <Modal.Body id="__BVID__65___BV_modal_body_">
                <div className="m-t-20 view-more-modal">
                    <div id="matched-bet2" className="tab-pane active">
                        <div className="table-responsive">
                            <table className="table table-diamond table-bordered">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>UserName</th>
                                        <th>Nation</th>
                                        <th className="text-right">Amount</th>
                                        <th className="text-right">User Rate</th>
                                        <th>Place Date</th>
                                        <th>IP</th>
                                        <th>Browser Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records && records.length > 0 ? (
                                        records.map((record, index) => (
                                            <tr key={index} className="back-border">
                                                <td>{index + 1}</td>
                                                <td><span>{record.userName}</span></td>
                                                <td>{record.nation}</td>
                                                <td className="text-right">{record.amount}</td>
                                                <td className="text-right">{record.userRate}</td>
                                                <td>{record.placeDate}</td>
                                                <td>{record.ip}</td>
                                                <td><a href="javascript:void(0)" className="text-success">Detail</a></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr className="">
                                            <td colSpan="8" className="text-center">No records found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default CasinoViewMore;
