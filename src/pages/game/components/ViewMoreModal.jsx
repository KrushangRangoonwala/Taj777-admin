import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';

const ViewMoreModal = ({ show, onHide, betList = [] }) => {
    const [activeTab, setActiveTab] = useState('matched');

    const tabs = [
        { id: 'matched', label: 'Matched Bets', bvid: '2998' },
        { id: 'deleted', label: 'Deleted Bets', bvid: '3000' }
    ];

    return (
        <Modal
            show={show}
            onHide={onHide}
            dialogClassName="modal-big"
            id="__BVID__2832"
            role="dialog"
            aria-labelledby="__BVID__2832___BV_modal_title_"
            aria-describedby="__BVID__2832___BV_modal_body_"
        >
            <Modal.Header id="__BVID__2832___BV_modal_header_">
                <Modal.Title as="h5" id="__BVID__2832___BV_modal_title_">View More</Modal.Title>
                <button type="button" aria-label="Close" className="close" onClick={onHide}>×</button>
            </Modal.Header>
            <Modal.Body id="__BVID__2832___BV_modal_body_">
                <div className="tab-content m-t-20">
                    <div className="tabs" id="__BVID__2997">
                        <div className="card-header">
                            <ul role="tablist" className="nav nav-pills card-header-pills" id="__BVID__2997__BV_tab_controls_">
                                {tabs.map((tab, index) => (
                                    <li key={tab.id} role="presentation" className="nav-item">
                                        <a
                                            role="tab"
                                            aria-selected={activeTab === tab.id}
                                            aria-setsize={tabs.length}
                                            aria-posinset={index + 1}
                                            href="javascript:void(0)"
                                            target="_self"
                                            className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                                            id={`__BVID__${tab.bvid}___BV_tab_button__`}
                                            aria-controls={`__BVID__${tab.bvid}`}
                                            onClick={() => setActiveTab(tab.id)}
                                        >
                                            {tab.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="tab-content" id="__BVID__2997__BV_tab_container_">
                            <div
                                role="tabpanel"
                                aria-hidden={activeTab !== 'matched'}
                                className={`tab-pane ${activeTab === 'matched' ? 'active' : ''} card-body`}
                                id="__BVID__2998"
                                aria-labelledby="__BVID__2998___BV_tab_button__"
                            >
                                <div id="matched-bet2" className="tab-pane active">
                                    {betList && betList.length > 0 ? (
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
                                                    {betList.map((bet, index) => (
                                                        <React.Fragment key={index}>
                                                            <tr className="back-border">
                                                                <td colSpan="4">
                                                                    <b>{bet.marketType}</b>
                                                                    <span className="float-right">{bet.date}</span>
                                                                </td>
                                                            </tr>
                                                            <tr className="back-border">
                                                                <td className="bt0">{bet.userName}</td>
                                                                <td className="bt0">{bet.nation}</td>
                                                                <td className="text-right bt0">{bet.rate}</td>
                                                                <td className="text-right bt0">{bet.amount}</td>
                                                            </tr>
                                                            <tr>
                                                                <td colSpan="4" style={{ height: '3px', padding: '0px' }}></td>
                                                            </tr>
                                                        </React.Fragment>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : activeTab !== "deleted"
                                        ? <div className="text-center">No records found</div>
                                        : ""
                                    }
                                </div>
                            </div>

                            <div
                                role="tabpanel"
                                aria-hidden={activeTab !== 'deleted'}
                                className={`tab-pane ${activeTab === 'deleted' ? 'active' : ''} card-body`}
                                id="__BVID__3000"
                                aria-labelledby="__BVID__3000___BV_tab_button__"
                                style={{ display: activeTab === 'deleted' ? 'block' : 'none' }}
                            >
                                <div className="text-center">{activeTab !== "deleted" ? "No records found" : ""}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ViewMoreModal;
