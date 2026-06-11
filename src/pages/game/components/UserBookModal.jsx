import React from 'react';
import { Modal } from 'react-bootstrap';

const UserBookModal = ({
    show,
    onHide,
    data
}) => {
    const markets = data?.markets || [];
    const userData = data?.users || [];

    return (
        <Modal
            show={show}
            onHide={onHide}
            dialogClassName="modal-xl"
            id="__BVID__2516"
            role="dialog"
            aria-labelledby="__BVID__2516___BV_modal_title_"
            aria-describedby="__BVID__2516___BV_modal_body_"
        >
            <Modal.Header id="__BVID__2516___BV_modal_header_">
                <Modal.Title as="h5" id="__BVID__2516___BV_modal_title_">User Book</Modal.Title>
                <button type="button" aria-label="Close" className="close" onClick={onHide}>×</button>
            </Modal.Header>
            <Modal.Body id="__BVID__2516___BV_modal_body_">
                <div className="user-book">
                    <ul className="mtree transit bubba mtree-header">
                        <li className="mtree-node">
                            <a href="#">
                                <table className="table m-b-0 table-striped" style={{ borderBottom: '0px' }}>
                                    <thead>
                                        <tr>
                                            <th>User Name</th>
                                            {markets.map((market, index) => (
                                                <th key={index} className="text-right">
                                                    {market.market_name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                </table>
                            </a>
                        </li>
                    </ul>
                    <ul className="mtree transit bubba user-table">
                        {userData.map((user, index) => (
                            <li key={index} className="mtree-node mtree-closed item">
                                <a href="javascript:void(0)" className="">
                                    <table className="table m-b-0">
                                        <tbody>
                                            <tr>
                                                <td data-id={user.user_id}> {user.username} </td>
                                                {markets.map((market, marketIndex) => {
                                                    const score = Number(
                                                        user.pl?.[market.market_id]?.pl || 0
                                                    );

                                                    return (
                                                        <td
                                                            key={marketIndex}
                                                            className={`text-right ${score >= 0 ? 'positive' : 'negative'}`}
                                                        >
                                                            {score}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        </tbody>
                                    </table>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default UserBookModal;
