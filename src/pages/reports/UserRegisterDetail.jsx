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

const UserRegisterDetail = () => {

  const [data, setData] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [clientList, setClientList] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');

  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const [filterType, setFilterType] = useState("1");
  const [dateRange, setDateRange] = useState([]);

  const totalPages = Math.ceil(totalRecords / perPage);

  const getColor = (value) => (Number(value) < 0 ? "#bb2834" : "#128412");

  // 🔹 Fetch Clients
  const fetchClients = async (value) => {
        try {
        const res = await getClients(value);
        setClientList(res.results || []);
        } catch (err) {
        console.log(err);
        }
    };

    // 🔹 Fetch Data
    const fetchData = async (page = 1) => {
    try {
        setLoading(true);

        const payload = {
        selected_user_id: selectedClient,

        // ✅ DATE FILTERS
        join_from:
            filterType === "2" && dateRange[0]
            ? dayjs(dateRange[0]).format("YYYY-MM-DD")
            : "",
        join_to:
            filterType === "2" && dateRange[1]
            ? dayjs(dateRange[1]).format("YYYY-MM-DD")
            : "",

        login_from:
            filterType === "3" && dateRange[0]
            ? dayjs(dateRange[0]).format("YYYY-MM-DD")
            : "",
        login_to:
            filterType === "3" && dateRange[1]
            ? dayjs(dateRange[1]).format("YYYY-MM-DD")
            : "",

        search: search,

        // ✅ PAGINATION
        page: page,
        per_page: perPage
        };

        const res = await getUserRegisterDetail(payload);

        setData(res?.data || []);
        setTotalRecords(res?.total || 0);
        setCurrentPage(page);

    } catch (err) {
        console.log(err);
        setData([]);
    } finally {
        setLoading(false);
    }
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
              <h4 className="mb-0 font-size-18">User Register Detail</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <a href="/admin/home">Home</a>
                  </li>
                  <li className="breadcrumb-item active">
                    <span>User Registration Report</span>
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
                      <div className="col-2">
                        <div className="form-group user-lock-search" style={{ position: "relative" }}>
                          <label>Search By Client Name</label>

                          <input
                            type="text"
                            className="form-control"
                            value={clientSearch}
                            placeholder="Select option"
                            onChange={(e) => {
                              setClientSearch(e.target.value);
                              fetchClients(e.target.value);
                            }}
                          />

                          {clientList.length > 0 && (
                            <div style={{
                              position: 'absolute',
                              background: '#fff',
                              border: '1px solid #ddd',
                              width: '100%',
                              zIndex: 1000
                            }}>
                              {clientList.map((c, i) => (
                                <div
                                  key={i}
                                  style={{ padding: '5px', cursor: 'pointer' }}
                                  onClick={() => {
                                    setSelectedClient(c.id);
                                    setClientSearch(c.text);
                                    setClientList([]);
                                  }}
                                >
                                  {c.text}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* TYPE */}
                      <div className="col-2">
                        <div className="form-group">
                          <label>Type</label>
                          <select
                            className="form-control"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                          >
                            <option value="1">All</option>
                            <option value="2">Created Date</option>
                            <option value="3">Last Login Date</option>
                          </select>
                        </div>
                      </div>

                      {/* DATE RANGE */}
                        {(filterType === "2" || filterType === "3") && (
                        <div className="col-3">
                            <div className="form-group">
                            <label>Select Date Range</label>
                            <RangePicker
                                value={dateRange}
                                onChange={(dates) => setDateRange(dates || [])}
                                format="DD/MM/YYYY"
                                style={{ width: "100%" }}
                            />
                            </div>
                        </div>
                        )}

                      {/* BUTTONS */}
                      <div className="col-3">
                        <label style={{ width: "100%" }}>&nbsp;</label>

                        <button type="submit" className="btn btn-primary">
                          Load
                        </button>
                        &nbsp;
                        <button type="button" className="btn btn-light"
                          onClick={() => {
                            setClientSearch('');
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
                  </form>
                </div>

                {/* 🔹 TOP BAR */}
                <div className="row">
                  <div className="col-sm-12 col-md-6">
                    <label className="d-inline-flex align-items-center">
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
                    </label>
                  </div>

                  <div className="col-sm-12 col-md-6">
                    <div className="dataTables_filter text-md-right">
                      <label className="d-inline-flex align-items-center">
                        Search:
                        <input
                          type="search"
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
                        <th>User Name</th>
                        <th>Agent Name</th>
                        {/* <th>Mobile</th> */}
                        <th>Created Date</th>
                        <th>Last Login</th>
                        <th>First Deposit Date</th>
                        <th>Last Deposit Date</th>
                        <th>Deposit</th>
                        <th className="text-right">Sports Balance</th>
                        <th className="text-right">Casino Balance</th>
                        <th className="text-right">Third Party Credit Balance</th>
                        <th className="text-right">Sport Book Balance</th>
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
                            {loading ? "Loading..." : "There are no records to show"}
                        </td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>

                {/* 🔹 PAGINATION */}
                <div className="row pt-3">
                  <div className="col">
                    <div className="dataTables_paginate paging_simple_numbers float-right">
                      <ul className="pagination pagination-rounded mb-0">

                        <li className={`page-item ${currentPage === 1 && 'disabled'}`}>
                          <button className="page-link" onClick={() => changePage(1)}>«</button>
                        </li>

                        <li className={`page-item ${currentPage === 1 && 'disabled'}`}>
                          <button className="page-link" onClick={() => changePage(currentPage - 1)}>‹</button>
                        </li>

                        {getPageNumbers().map((page) => (
                          <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => changePage(page)}>
                              {page}
                            </button>
                          </li>
                        ))}

                        <li className={`page-item ${currentPage === totalPages && 'disabled'}`}>
                          <button className="page-link" onClick={() => changePage(currentPage + 1)}>›</button>
                        </li>

                        <li className={`page-item ${currentPage === totalPages && 'disabled'}`}>
                          <button className="page-link" onClick={() => changePage(totalPages)}>»</button>
                        </li>

                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserRegisterDetail;