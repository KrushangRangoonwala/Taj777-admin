import React, { useEffect, useState } from 'react';
import { getUserRegisterDetail, getClients } from '../../api/API';
import { DatePicker } from "antd";
import "antd/dist/reset.css"; // AntD 5+ reset styles
import dayjs from "dayjs";
const { RangePicker } = DatePicker;
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { customSelectStyles } from '../../components/Header';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import SelectBootStrap from '../../components/SelectBootStrap';

const UserWinLoss = () => {
    const [data, setData] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');

    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(25);

    const [filterType, setFilterType] = useState("1");
    const [dateRange, setDateRange] = useState([]);
    const [fromDate, setFromDate] = useState(
        new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]
    );
    const [toDate, setToDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const totalPages = Math.ceil(totalRecords / perPage) || 1;

    const getColor = (value) => (Number(value) < 0 ? "#bb2834" : "#128412");

    // 🔹 Fetch Data
    const fetchData = async (page = 1) => {
        // try {
        //     setLoading(true);

        //     const payload = {
        //         selected_user_id: selectedClient,

        //         // ✅ DATE FILTERS
        //         join_from:
        //             filterType === "2" && dateRange[0]
        //                 ? dayjs(dateRange[0]).format("YYYY-MM-DD")
        //                 : "",
        //         join_to:
        //             filterType === "2" && dateRange[1]
        //                 ? dayjs(dateRange[1]).format("YYYY-MM-DD")
        //                 : "",

        //         login_from:
        //             filterType === "3" && dateRange[0]
        //                 ? dayjs(dateRange[0]).format("YYYY-MM-DD")
        //                 : "",
        //         login_to:
        //             filterType === "3" && dateRange[1]
        //                 ? dayjs(dateRange[1]).format("YYYY-MM-DD")
        //                 : "",

        //         search: search,

        //         // ✅ PAGINATION
        //         page: page,
        //         per_page: perPage
        //     };

        //     const res = await getUserRegisterDetail(payload);

        //     setData(res?.data || []);
        //     setTotalRecords(res?.total || 0);
        //     setCurrentPage(page);

        // } catch (err) {
        //     console.log(err);
        //     setData([]);
        // } finally {
        //     setLoading(false);
        // }
    };

    // 🔹 Pagination
    const changePage = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchData(page);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) pages.push(i);

        return pages;
    };

    const exportToExcel = () => {
        if (!data.length) return;

        const formattedData = data.map((row, index) => ({
            "User Name": row.name || "-",
            "Agent Name": row.parent_name || "-",
            "Mobile": row.phone || "-",
            "Created Date": row.join_date || "-",
            "Last Login": row.last_login || "-",
            "First Deposit Date": row.first_entry || "-",
            "Last Deposit Date": row.last_entry || "-",
            "Deposit": row.total_deposit || 0,
            "Sports Balance": row.total_game_0 || 0,
            "Casino Balance": row.total_game_1 || 0,
            "Third Party Credit Balance": 0,
            "Sport Book Balance": 0,
        }));

        const ws = XLSX.utils.json_to_sheet(formattedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "UserRegisterDetail");

        XLSX.writeFile(
            wb,
            `UserRegister_${new Date().toISOString().slice(0, 19)}.xlsx`
        );
    };

    const exportToPDF = () => {
        if (!data.length) return;

        const doc = new jsPDF("l"); // 👉 landscape (important for many columns)

        const tableRows = data.map((row, index) => [
            row.name || "-",
            row.parent_name || "-",
            row.join_date || "-",
            row.last_login || "-",
            row.first_entry || "-",
            row.last_entry || "-",
            row.total_deposit || 0,
            row.total_game_0 || 0,
            row.total_game_1 || 0,
            0,
            0,
        ]);

        autoTable(doc, {
            head: [[
                "User Name",
                "Agent Name",
                "Created Date",
                "Last Login",
                "First Deposit",
                "Last Deposit",
                "Deposit",
                "Sports Balance",
                "Casino Balance",
                "Third Party",
                "Sport Book"
            ]],
            body: tableRows,
            styles: { fontSize: 7 }, // 👈 important for fitting
        });

        doc.save(`UserRegister_${new Date().toISOString().slice(0, 19)}.pdf`);
    };

    return (
        <div>
            <div>
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-flex align-items-center justify-content-between">
                            <h4 className="mb-0 font-size-18">User Win Loss</h4>
                            <div className="page-title-right">
                                <ol className="breadcrumb m-0">
                                    <li className="breadcrumb-item">
                                        <Link to="/admin/home">Home</Link>
                                    </li>
                                    <li className="breadcrumb-item active">
                                        <span>User Win Loss</span>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">

                                {/* 🔹 FILTER */}
                                <div className="report-form mb-3">
                                    <form onSubmit={(e) => { e.preventDefault(); fetchData(1); }}>
                                        <div className="row row5">

                                            {/* CLIENT SEARCH */}
                                            <div className="col-12 col-md-6 col-lg-2">
                                                <div className="form-group user-lock-search" style={{ position: "relative" }}>
                                                    <label>Search By Client Name</label>
                                                    <SelectBootStrap
                                                        selectedOption={selectedClient}
                                                        setSelectedOption={setSelectedClient}
                                                        fetchType="client"
                                                    />
                                                </div>
                                            </div>

                                            {/* DATE RANGE */}
                                            <div className="col-12 col-md-6 col-lg-3">
                                                <label>Select Date Range</label>
                                                <div className="mb-3">
                                                    <RangePicker
                                                        className="ant_custom_date custom-range-picker date-input"
                                                        value={
                                                            fromDate && toDate
                                                                ? [dayjs(fromDate), dayjs(toDate)]
                                                                : []
                                                        }
                                                        onChange={(dates) => {
                                                            if (dates) {
                                                                setFromDate(dates[0].toDate());
                                                                setToDate(dates[1].toDate());
                                                            } else {
                                                                setFromDate(null);
                                                                setToDate(null);
                                                            }
                                                        }}
                                                        format="DD/MM/YYYY"
                                                        style={{ width: "100%" }}
                                                        suffixIcon={
                                                            <span style={{ pointerEvents: "none" }}>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 1024 1024"
                                                                    width="1em"
                                                                    height="1em"
                                                                    fill="currentColor"
                                                                >
                                                                    <path d="M940.218182 107.054545h-209.454546V46.545455h-65.163636v60.50909H363.054545V46.545455H297.890909v60.50909H83.781818c-18.618182 0-32.581818 13.963636-32.581818 32.581819v805.236363c0 18.618182 13.963636 32.581818 32.581818 32.581818h861.090909c18.618182 0 32.581818-13.963636 32.581818-32.581818V139.636364c-4.654545-18.618182-18.618182-32.581818-37.236363-32.581819zM297.890909 172.218182V232.727273h65.163636V172.218182h307.2V232.727273h65.163637V172.218182h176.872727v204.8H116.363636V172.218182h181.527273zM116.363636 912.290909V442.181818h795.927273v470.109091H116.363636z" />
                                                                </svg>
                                                            </span>
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            {/* BUTTONS */}
                                            <div className="col-12 col-lg-3">
                                                <label className="d-none d-lg-block" style={{ width: "100%" }}>&nbsp;</label>

                                                <div className="d-flex flex-wrap gap-2">
                                                    <button type="submit" className="btn btn-primary">
                                                        Load
                                                    </button>
                                                    &nbsp;
                                                    <button type="button" className="btn btn-light"
                                                        onClick={() => {
                                                            setSelectedClient('');
                                                            setSearch('');
                                                            setDateRange([]);
                                                            setFilterType("1");
                                                            setData([]);
                                                            setTotalRecords(0);
                                                            setCurrentPage(1);
                                                        }}
                                                    >
                                                        Reset
                                                    </button>
                                                    &nbsp;
                                                    <button
                                                        type="button"
                                                        className="btn btn-success"
                                                        disabled={!data.length}
                                                        onClick={exportToExcel}
                                                    >
                                                        <i className="fas fa-file-excel"></i>
                                                    </button>
                                                    &nbsp;
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        disabled={!data.length}
                                                        onClick={exportToPDF}
                                                    >
                                                        <i className="fas fa-file-pdf"></i>
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    </form>
                                </div>

                                {/* 🔹 TOP BAR */}
                                <div className="row">
                                    <div className="col-sm-12 col-md-6">
                                        {/* <label className="d-inline-flex align-items-center">
                                            Show&nbsp;
                                            <select
                                                className="custom-select custom-select-sm"
                                                value={perPage}
                                                onChange={(e) => {
                                                    setPerPage(Number(e.target.value));
                                                    fetchData(1);
                                                }}
                                            >
                                                <option value="25">25</option>
                                                <option value="50">50</option>
                                                <option value="75">75</option>
                                                <option value="100">100</option>
                                                <option value="125">125</option>
                                                <option value="150">150</option>
                                            </select>
                                            &nbsp;entries
                                        </label> */}
                                    </div>

                                    <div className="col-sm-12 col-md-6">
                                        <div className="dataTables_filter text-md-right">
                                            <label className="d-inline-flex align-items-center">
                                                Search:
                                                <input
                                                    type="search"
                                                    field-type="search"
                                                    placeholder="Search..."
                                                    className="form-control form-control-sm ml-2"
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                    onKeyUp={() => fetchData(1)}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* 🔹 TABLE */}
                                <div className="table-responsive mb-0" style={{ whiteSpace: "nowrap" }}>
                                    <table className="table b-table table-bordered">
                                        <thead>
                                            <tr>
                                                <th aria-colindex="1">No</th>
                                                <th aria-colindex="2">User Name</th>
                                                <th aria-colindex="3" class="text-right">Casinopts</th>
                                                <th aria-colindex="4" class="text-right">Sportpts</th>
                                                <th aria-colindex="5" class="text-right">SportBookpts</th>
                                                <th aria-colindex="6" class="text-right">Third Party pts</th>
                                                <th aria-colindex="7" class="text-right">Profit/Loss</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {data.length > 0 ? (
                                                data.map((row, i) => (
                                                    <tr key={i}>
                                                        <td>{row.name || "-"}</td>
                                                        <td>{row.parent_name || "-"}</td>
                                                        {/* <td>{row.phone || "-"}</td> */}

                                                        <td>{row.join_date || "-"}</td>
                                                        <td>{row.last_login || "-"}</td>

                                                        <td>{row.first_entry || "-"}</td>
                                                        <td>{row.last_entry || "-"}</td>

                                                        <td>{row.total_deposit || 0}</td>

                                                        <td className="text-right" style={{ color: getColor(row.total_game_0) }}>
                                                            {row.total_game_0 || 0}
                                                        </td>

                                                        <td className="text-right" style={{ color: getColor(row.total_game_1) }}>
                                                            {row.total_game_1 || 0}
                                                        </td>

                                                        <td className="text-right" style={{ color: getColor(0) }}>
                                                            0
                                                        </td>

                                                        <td className="text-right" style={{ color: getColor(0) }}>
                                                            0
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="12" className="text-center">
                                                        <div className="my-2">
                                                            {loading
                                                                ? "Loading..."
                                                                : search?.length
                                                                    ? "There are no records matching your request"
                                                                    : "There are no records to show"}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <th></th>
                                                <th></th>
                                                <th className="text-right">0</th>
                                                <th className="text-right">0</th>
                                                <th className="text-right">0</th>
                                                <th className="text-right">0</th>
                                                <th className="text-right">0</th>
                                                {/* <th></th> */}
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserWinLoss;