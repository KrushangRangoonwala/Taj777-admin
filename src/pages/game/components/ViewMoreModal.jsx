import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';

const ViewMoreModal = ({ show, onHide, betList = [] }) => {
    const [activeTab, setActiveTab] = useState('matched');
    const marketTabs = [
        ...new Set(
            (betList || []).map(
                (item) => item?.market_type || "Other"
            )
        ),
    ];

    const [marketTab, setMarketTab] = useState(
        marketTabs?.[0] || ""
    );
    
    const tabs = [
        { id: 'matched', label: 'Matched Bets', bvid: '2998' },
        { id: 'deleted', label: 'Deleted Bets', bvid: '3000' }
    ];

    const [searchUsername, setSearchUsername] = useState("");
    const [amountFrom, setAmountFrom] = useState("");
    const [amountTo, setAmountTo] = useState("");
    const [searchIp, setSearchIp] = useState("");
    const [betFilter, setBetFilter] = useState("all");
    const [selectedBets, setSelectedBets] = useState([]);

    const filteredBets = betList.filter((bet) => {
        
        if (
            marketTab &&
            bet?.market_type !== marketTab
        ) {
            return false;
        }
        const usernameMatch =
            !searchUsername ||
            bet?.username
                ?.toLowerCase()
                ?.includes(searchUsername.toLowerCase());

        const ipMatch =
            !searchIp ||
            bet?.ip_address
                ?.toLowerCase()
                ?.includes(searchIp.toLowerCase());

        const stake = Number(bet?.stake || 0);

        const amountFromMatch =
            !amountFrom || stake >= Number(amountFrom);

        const amountToMatch =
            !amountTo || stake <= Number(amountTo);

        const type = bet?.bet_type?.toLowerCase();

        let typeMatch = true;

        if (betFilter === "back") {
            typeMatch = type === "back" || type === "yes";
        } else if (betFilter === "lay") {
            typeMatch = type === "lay" || type === "no";
        } else if (betFilter === "deleted") {
            typeMatch = bet?.is_deleted == 1;
        }

        return (
            usernameMatch &&
            ipMatch &&
            amountFromMatch &&
            amountToMatch &&
            typeMatch
        );
    });

    const selectedBetData = filteredBets.filter((_, index) =>
        selectedBets.includes(index)
    );

    const isAnyBetSelected = selectedBets.length > 0;

    const totalSoda = isAnyBetSelected
        ? selectedBetData.length
        : filteredBets.length;

    const totalAmount = (
        isAnyBetSelected
            ? selectedBetData
            : filteredBets
    ).reduce(
        (sum, item) => sum + Number(item?.stake || 0),
        0
    );

    const handleClose = () => {

        // reset filters
        setSearchUsername("");
        setAmountFrom("");
        setAmountTo("");
        setSearchIp("");

        // reset radios
        setBetFilter("all");

        // reset selected checkboxes
        setSelectedBets([]);

        // reset tabs
        setActiveTab("matched");

        if (marketTabs?.length > 0) {
            setMarketTab(marketTabs[0]);
        }

        // close modal
        onHide();
    };

    return (
        <>
            <style>
                {`
                    @media only screen and (min-width: 1280px) {
                        .custom-modal-padding.modal {
                            /*padding-left: 23px !important;*/
                        }
                    }
                `}
            </style>
            <Modal
                show={show}
                onHide={handleClose}
                className="custom-modal-padding"
                dialogClassName="modal-big"
                id="__BVID__2832"
                role="dialog"
                aria-labelledby="__BVID__2832___BV_modal_title_"
                aria-describedby="__BVID__2832___BV_modal_body_"
            >
                <Modal.Header id="__BVID__2832___BV_modal_header_">
                    <Modal.Title as="h5" id="__BVID__2832___BV_modal_title_">View More</Modal.Title>
                    <button type="button" aria-label="Close" className="close" onClick={handleClose}>×</button>
                </Modal.Header>
                <Modal.Body id="__BVID__2832___BV_modal_body_">
                    <ul
                        role="tablist"
                        className="nav nav-tabs d-inline-block text-uppercase"
                    >
                        {marketTabs.map((tab, index) => (
                            <li
                                key={index}
                                className="nav-item d-inline-block"
                            >
                                <a
                                    data-toggle="tab"
                                    href="javascript:void(0)"
                                    className={`nav-link ${
                                        marketTab === tab ? "active" : ""
                                    }`}
                                    onClick={() => setMarketTab(tab)}
                                >
                                    {tab}
                                </a>
                            </li>
                        ))}
                    </ul>
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
                                        <>
                                        <div>
                                            <form
                                                onSubmit={(e) => e.preventDefault()}
                                                className="ajaxFormSubmit"
                                            >
                                                <div className="row row5 align-items-center mb-3">
                                                    <div className="col-xl-2">
                                                        <label htmlFor="uname">Username</label>

                                                        <input
                                                            id="uname"
                                                            type="text"
                                                            placeholder="Search Username"
                                                            className="form-control"
                                                            value={searchUsername}
                                                            onChange={(e) =>
                                                                setSearchUsername(e.target.value)
                                                            }
                                                        />
                                                    </div>

                                                    <div className="col-xl-3">
                                                        <div className="row row5">
                                                            <div className="col-6">
                                                                <label htmlFor="amountfrom">
                                                                    Amount From
                                                                </label>

                                                                <input
                                                                    id="amountfrom"
                                                                    type="text"
                                                                    placeholder="Amount From"
                                                                    className="form-control"
                                                                    value={amountFrom}
                                                                    onChange={(e) =>
                                                                        setAmountFrom(e.target.value)
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="col-6">
                                                                <label htmlFor="amountto">
                                                                    Amount To
                                                                </label>

                                                                <input
                                                                    id="amountto"
                                                                    type="text"
                                                                    placeholder="Amount To"
                                                                    className="form-control"
                                                                    value={amountTo}
                                                                    onChange={(e) =>
                                                                        setAmountTo(e.target.value)
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-xl-2">
                                                        <label htmlFor="ipaddr">
                                                            IP Address
                                                        </label>

                                                        <input
                                                            id="ipaddr"
                                                            type="text"
                                                            placeholder="IP Address"
                                                            className="form-control"
                                                            value={searchIp}
                                                            onChange={(e) =>
                                                                setSearchIp(e.target.value)
                                                            }
                                                        />
                                                    </div>

                                                    <div className="col-xl-2 mt-4">
                                                        <button
                                                            type="submit"
                                                            className="btn btn-primary"
                                                        >
                                                            Search
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-light"
                                                            onClick={() => {
                                                                setSearchUsername("");
                                                                setAmountFrom("");
                                                                setAmountTo("");
                                                                setSearchIp("");
                                                                setBetFilter("all");
                                                            }}
                                                        >
                                                            Reset
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>

                                            <div
                                                role="radiogroup"
                                                tabIndex="-1"
                                                className="float-left bv-no-focus-ring"
                                            >
                                                {[
                                                    { label: "All", value: "all" },
                                                    { label: "Back", value: "back" },
                                                    { label: "Lay", value: "lay" },
                                                    { label: "Deleted", value: "deleted" },
                                                ].map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="custom-control custom-control-inline custom-radio"
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="radio-options"
                                                            className="custom-control-input"
                                                            id={`radio_${item.value}`}
                                                            checked={betFilter === item.value}
                                                            onChange={() =>
                                                                setBetFilter(item.value)
                                                            }
                                                        />

                                                        <label
                                                            htmlFor={`radio_${item.value}`}
                                                            className="custom-control-label"
                                                        >
                                                            <span>{item.label}</span>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="custom-control-inline float-right">
                                                <h5>
                                                    Total Soda:{" "}
                                                    <span className="text-success mr-2">
                                                        {totalSoda}
                                                    </span>

                                                    Total Amount:{" "}
                                                    <span className="text-success">
                                                        {totalAmount}
                                                    </span>
                                                </h5>
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
                                                        {betList && betList.length > 0 ? (
                                                            filteredBets.map((bet, index) => (
                                                                <tr
                                                                    key={index}
                                                                    className={
                                                                        bet?.bet_type?.toLowerCase() === "lay" ||
                                                                        bet?.bet_type?.toLowerCase() === "no"
                                                                            ? "lay-border"
                                                                            : "back-border"
                                                                    }
                                                                >
                                                                    <td className="user-name">
                                                                        <div>{bet?.username || "-"}</div>
                                                                    </td>

                                                                    <td className="event-name">
                                                                        <div>
                                                                            {bet?.market_name || "-"}
                                                                        </div>
                                                                    </td>

                                                                    <td className="text-right bet-user-rate">
                                                                        <div>{bet?.odds || 0}</div>
                                                                    </td>

                                                                    <td className="text-right bet-amount">
                                                                        <div>{bet?.stake || 0}</div>
                                                                    </td>

                                                                    <td className="bet-date">
                                                                        <div>{bet?.bet_time || "-"}</div>
                                                                    </td>

                                                                    <td>
                                                                        <a href="javascript:void(0)">
                                                                            {bet?.bet_ip_address || "-"}
                                                                        </a>
                                                                    </td>

                                                                    <td>
                                                                        <a
                                                                            href="javascript:void(0)"
                                                                            className="text-success"
                                                                            title={bet?.bet_user_agent || "Details"}
                                                                        >
                                                                            Detail
                                                                        </a>
                                                                    </td>

                                                                    <td className="text-right">
                                                                        <div className="custom-control custom-checkbox">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="custom-control-input"
                                                                                value={index}
                                                                                id={`bet_checkbox_${index}`}
                                                                                checked={selectedBets.includes(index)}
                                                                                onChange={(e) => {
                                                                                    if (e.target.checked) {
                                                                                        setSelectedBets([
                                                                                            ...selectedBets,
                                                                                            index,
                                                                                        ]);
                                                                                    } else {
                                                                                        setSelectedBets(
                                                                                            selectedBets.filter(
                                                                                                (item) => item !== index
                                                                                            )
                                                                                        );
                                                                                    }
                                                                                }}
                                                                            />

                                                                            <label
                                                                                className="custom-control-label"
                                                                                htmlFor={`bet_checkbox_${index}`}
                                                                            ></label>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="8" className="text-center">
                                                                    No records found
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
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
        </>
    );
};

export default ViewMoreModal;
