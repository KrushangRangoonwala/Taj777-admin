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
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SelectBootStrap from '../../components/SelectBootStrap';


const UserRegisterDetail = () => {
  const [data, setData] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');

  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const [filterType, setFilterType] = useState("1");
  const [dateRange, setDateRange] = useState([]);

  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('none');

  const handleSort = (colKey) => {
    if (sortColumn === colKey) {
      if (sortDirection === 'none') {
        setSortDirection('ascending');
      } else if (sortDirection === 'ascending') {
        setSortDirection('descending');
      } else {
        setSortDirection('ascending');
      }
    } else {
      setSortColumn(colKey);
      setSortDirection('ascending');
    }
  };

  const getSortValueText = (colKey) => {
    const currentDirection = sortColumn === colKey ? sortDirection : 'none';
    if (currentDirection === 'none') return 'ascending';
    if (currentDirection === 'ascending') return 'descending';
    if (currentDirection === 'descending') return 'ascending';
    return 'ascending';
  };


  const totalPages = Math.ceil(totalRecords / perPage) || 1;

  const getColor = (value) => (Number(value) < 0 ? "#bb2834" : "#128412");

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

    return pages?.length ? pages : [1];
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
                    <Link to="/admin/home">Home</Link>
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
                <div className="report-form mb-3 mb-3px-plus">
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

                      {/* TYPE */}
                      <div className="col-12 col-md-6 col-lg-2">
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
                        <div className="col-12 col-md-6 col-lg-3">
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
                      <div className="col-12 col-lg-3">
                        <label className="d-none d-lg-block" style={{ width: "100%" }}>&nbsp;</label>

                        <div className="d-flex flex-wrap">
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
                          field-type="search"
                          placeholder="Search..."
                          className="form-control form-control-sm ml-2 dark-placeholder"
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
                  <div className="table no-footer table-responsive-sm">
                    <Table role="table" aria-busy="false" aria-colcount="11" className="b-table" bordered hover>
                      <thead role="rowgroup">
                        <tr role="row">
                          <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'userName' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('userName')}>
                            <div>User Name</div><span className="sr-only"> (Click to sort {getSortValueText('userName')})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'agentName' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('agentName')}>
                            <div>Agent Name</div><span className="sr-only"> (Click to sort {getSortValueText('agentName')})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'phone' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('phone')}>
                            <div>Mobile</div><span className="sr-only"> (Click to sort {getSortValueText('phone')})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'createdDate' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('createdDate')}>
                            <div>Created Date</div><span className="sr-only"> (Click to sort {getSortValueText('createdDate')})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'lastLogin' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('lastLogin')}>
                            <div>Last Login</div><span className="sr-only"> (Click to sort {getSortValueText('lastLogin')})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'firstDepositDate' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('firstDepositDate')}>
                            <div>First Deposit Date</div><span className="sr-only"> (Click to sort {getSortValueText('firstDepositDate')})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'lastDepositDate' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('lastDepositDate')}>
                            <div>Last Deposit Date</div><span className="sr-only"> (Click to sort {getSortValueText('lastDepositDate')})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'deposit' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('deposit')}>
                            <div>Deposit</div><span className="sr-only"> (Click to sort {getSortValueText('deposit')})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'sportsBalance' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('sportsBalance')}>
                            <div>Sports Balance</div><span className="sr-only"> (Click to sort {getSortValueText('sportsBalance')})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'casinoBalance' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('casinoBalance')}>
                            <div>Casino Balance</div><span className="sr-only"> (Click to sort {getSortValueText('casinoBalance')})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'thirdPartyBalance' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('thirdPartyBalance')}>
                            <div>Third Party Credit Balance</div><span className="sr-only"> (Click to sort {getSortValueText('thirdPartyBalance')})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'sportBookBalance' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('sportBookBalance')}>
                            <div>Sport Book Balance</div><span className="sr-only"> (Click to sort {getSortValueText('sportBookBalance')})</span>
                          </th>
                        </tr>
                      </thead>

                      <tbody role="rowgroup">
                        {data.length > 0 ? (
                          data.map((row, i) => (
                            <tr key={i} role="row" tabIndex="0" className="nocursor">
                              <td role="cell">{row.name || "-"}</td>
                              <td role="cell">{row.parent_name || "-"}</td>
                              <td role="cell">{row.phone || "-"}</td>
                              <td role="cell">
                                {
                                  row.join_date && dayjs(row.join_date).isValid()
                                    ? dayjs(row.join_date).format("DD/MM/YYYY HH:mm:ss")
                                    : "-"
                                }
                              </td>
                              <td role="cell">
                                {
                                  row.last_login && dayjs(row.last_login).isValid()
                                    ? dayjs(row.last_login).format("DD/MM/YYYY HH:mm:ss")
                                    : "-"
                                }
                              </td>
                              <td role="cell">
                                {
                                  row.first_entry && dayjs(row.first_entry).isValid()
                                    ? dayjs(row.first_entry).format("DD/MM/YYYY HH:mm:ss")
                                    : "-"
                                }
                              </td>
                              <td role="cell">
                                {
                                  row.last_entry && dayjs(row.last_entry).isValid()
                                    ? dayjs(row.last_entry).format("DD/MM/YYYY HH:mm:ss")
                                    : "-"
                                }
                              </td>
                              <td role="cell">{row.total_deposit || 0}</td>
                              <td role="cell" className="text-right" style={{ color: getColor(row.total_game_0) }}>
                                {row.total_game_0 || 0}
                              </td>
                              <td role="cell" className="text-right" style={{ color: getColor(row.total_game_1) }}>
                                {row.total_game_1 || 0}
                              </td>
                              <td role="cell" className="text-right" style={{ color: getColor(0) }}>
                                0
                              </td>
                              <td role="cell" className="text-right" style={{ color: getColor(0) }}>
                                0
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr role="row" className="b-table-empty-row">
                            <td colSpan="12" role="cell">
                              <div role="alert" aria-live="polite">
                                <div className="text-center my-2">
                                  {loading
                                    ? "Loading..."
                                    : search.length > 0
                                      ? "There are no records matching your request"
                                      : "There are no records to show"
                                  }
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
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