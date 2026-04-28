import React from 'react';
import { Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const MoreMarketModal = ({ show, onHide, markets = [], setSelectmarket }) => {
    // Default markets if none provided, based on the provided HTML
    const displayMarkets = markets?.length > 0 ? markets : [
        { name: "Match Time Result 60:00", book: 0 },
        { name: "HALF_TIME", book: 0 },
        { name: "OVER_UNDER_05", book: 0 },
        { name: "Next Goal 9.0", book: 0 },
        { name: "OVER_UNDER_25", book: 0 },
        { name: "HT/FT", book: 0 },
        { name: "MATCH_ODDS", book: 0 },
        { name: "Next Goal 1.0", book: 0 },
        { name: "DRAW_NO_BET", book: 0 },
        { name: "Match Result/Both Teams to score", book: 0 }
    ];

    return (
        <>
            <style>
                {`
                    .custom-modal-padding.modal {
                        padding-left: 23px !important;
                    }
                `}
            </style>
            <Modal
                show={show}
                onHide={onHide}
                className="custom-modal-padding"
                dialogClassName="modal-md"
                id="__BVID__4423"
                role="dialog"
                aria-labelledby="__BVID__4423___BV_modal_title_"
                aria-describedby="__BVID__4423___BV_modal_body_"
            >
                <Modal.Header id="__BVID__4423___BV_modal_header_">
                    <Modal.Title as="h5" id="__BVID__4423___BV_modal_title_">MORE MARKET</Modal.Title>
                    <button type="button" aria-label="Close" className="close" onClick={onHide}>×</button>
                </Modal.Header>
                <Modal.Body id="__BVID__4423___BV_modal_body_">
                    <div className="table-responsive more-market">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Market Name</th>
                                    <th className="text-right">Market Book</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayMarkets?.map((market, index) => (
                                    <tr key={index}>
                                        <td>
                                            <Link
                                                to="#"
                                                onClick={() => {
                                                    setSelectmarket(market);
                                                    onHide();
                                                }}
                                            >
                                                {market?.marketName}
                                            </Link>
                                        </td>
                                        <td className="text-right">{market?.book}</td> {/* WHAT IS THIS HERE ? */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default MoreMarketModal;
