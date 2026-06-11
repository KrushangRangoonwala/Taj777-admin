import React, { useState } from 'react';
import PageNamePath from '../../components/PageNamePath';
import { DatePicker } from "antd";
import "antd/dist/reset.css";
import dayjs from "dayjs";
import { Table } from 'react-bootstrap';
import { getNoRecordText } from '../../utilies/helpers';

const AssignAgent = () => {
    const [perPage, setPerPage] = useState(25);
    const [search, setSearch] = useState('');
    const [data, setData] = useState([]); // Assuming data comes from an API later
    const [fromDate, setFromDate] = useState(dayjs().subtract(7, 'day'));
    const [toDate, setToDate] = useState(dayjs());

    const headers = [
        "S.No.",
        "User Name",
        "Assign Agent Settings",
        "Mobile Number",
        "Depo Mobile Number",
        "First Bonus Status"
    ];

    const entriesOptions = [25, 50, 75, 100, 125, 150];

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="">
                <PageNamePath
                    pageName="Assign Agent List"
                    pathArr={[
                        { path: "/admin/home", name: "Home" },
                        { path: "", name: "Assign Agent List" }
                    ]}
                />

                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <div className="mb-3">
                                    <div className="row row5"></div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12 col-md-6">
                                        <div id="tickets-table_length" className="dataTables_length">
                                            <label className="d-inline-flex align-items-center">
                                                Show&nbsp;
                                                <select
                                                    className="custom-select custom-select-sm"
                                                    id="__BVID__2674"
                                                    value={perPage}
                                                    onChange={(e) => setPerPage(Number(e.target.value))}
                                                >
                                                    {entriesOptions.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>&nbsp;entries
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-sm-12 col-md-6">
                                        <div id="tickets-table_filter" className="dataTables_filter text-md-right">
                                            <label className="d-inline-flex align-items-center">
                                                Search:
                                                <input
                                                    type="search"
                                                    field-type="search"
                                                    placeholder="Search..."
                                                    className="form-control form-control-sm ml-2"
                                                    id="__BVID__2675"
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="table-responsive mb-0">
                                    <div className="table no-footer table-responsive-sm">
                                        <Table
                                            id="eventsListTbl"
                                            role="table"
                                            aria-busy="false"
                                            aria-colcount="6"
                                            className="table b-table table-bordered"
                                        >
                                            <thead role="rowgroup" className="">
                                                <tr role="row" className="">
                                                    {headers.map((header, index) => (
                                                        <th
                                                            key={index}
                                                            role="columnheader"
                                                            scope="col"
                                                            tabIndex="0"
                                                            aria-colindex={index + 1}
                                                            aria-sort="none"
                                                            className="position-relative"
                                                        >
                                                            <div>{header}</div>
                                                            <span className="sr-only"> (Click to sort ascending)</span>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody role="rowgroup">
                                                {data.length > 0 ? (
                                                    data.map((row, index) => (
                                                        <tr key={index} role="row">
                                                            {/* Placeholder for actual data rows */}
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr role="row" className="b-table-empty-row">
                                                        <td colSpan="6" role="cell" className="">
                                                            <div role="alert" aria-live="polite">
                                                                <div className="text-center my-2">{getNoRecordText(search)}</div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-flex align-items-center justify-content-between">
                            <h4 className="mb-0 font-size-18">User Creation</h4>
                            <div className="page-title-right">
                                <ol className="breadcrumb m-0"></ol>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <form method="post" data-vv-scope="creation" className="ajaxFormSubmit">
                                    <div className="row row5">
                                        <div className="col-md-2">
                                            <label>From Date:</label>
                                            <div className="mx-datepicker">
                                                <div className="mx-input-wrapper">
                                                    <DatePicker
                                                        className="mx-input"
                                                        value={fromDate}
                                                        onChange={(date) => setFromDate(date)}
                                                        // format="YYYY-MM-DD"
                                                        format="DD/MM/YYYY"
                                                        placeholder=""
                                                        suffixIcon={
                                                            <i className="mx-icon-calendar">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1em" height="1em">
                                                                    <path d="M940.218182 107.054545h-209.454546V46.545455h-65.163636v60.50909H363.054545V46.545455H297.890909v60.50909H83.781818c-18.618182 0-32.581818 13.963636-32.581818 32.581819v805.236363c0 18.618182 13.963636 32.581818 32.581818 32.581818h861.090909c18.618182 0 32.581818-13.963636 32.581818-32.581818V139.636364c-4.654545-18.618182-18.618182-32.581818-37.236363-32.581819zM297.890909 172.218182V232.727273h65.163636V172.218182h307.2V232.727273h65.163637V172.218182h176.872727v204.8H116.363636V172.218182h181.527273zM116.363636 912.290909V442.181818h795.927273v470.109091H116.363636z"></path>
                                                                </svg>
                                                            </i>
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <label>To Date:</label>
                                            <div className="mx-datepicker">
                                                <div className="mx-input-wrapper custome-kk">
                                                    <DatePicker
                                                        className="mx-input"
                                                        value={toDate}
                                                        onChange={(date) => setToDate(date)}
                                                        // format="YYYY-MM-DD"
                                                        format="DD/MM/YYYY"
                                                        placeholder=""
                                                        disabled={true}
                                                        style={{ cursor: "no-drop" }}
                                                        suffixIcon={
                                                            <i className="mx-icon-calendar">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1em" height="1em">
                                                                    <path d="M940.218182 107.054545h-209.454546V46.545455h-65.163636v60.50909H363.054545V46.545455H297.890909v60.50909H83.781818c-18.618182 0-32.581818 13.963636-32.581818 32.581819v805.236363c0 18.618182 13.963636 32.581818 32.581818 32.581818h861.090909c18.618182 0 32.581818-13.963636 32.581818-32.581818V139.636364c-4.654545-18.618182-18.618182-32.581818-37.236363-32.581819zM297.890909 172.218182V232.727273h65.163636V172.218182h307.2V232.727273h65.163637V172.218182h176.872727v204.8H116.363636V172.218182h181.527273zM116.363636 912.290909V442.181818h795.927273v470.109091H116.363636z"></path>
                                                                </svg>
                                                            </i>
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-2 mt-4">
                                            <button type="submit" id="loaddata" className="btn btn-primary">
                                                Download CSV
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignAgent;