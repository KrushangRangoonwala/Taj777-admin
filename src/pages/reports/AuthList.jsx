import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import "antd/dist/reset.css";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Table } from 'react-bootstrap';


// 👉 Replace with your API
import { getAuthList } from "../../api/API";
import { casino_list } from "../../utilies/casino_list";

const casinoTypes = [
  { value: "", label: "Select Type" },   // ✅ static first option
  ...(casino_list?.map(val => ({
    value: val.game_socket,
    label: val.game_name,
  })) || [])
];

const AuthList = () => {
  const [date, setDate] = useState(dayjs());
  const [casinoType, setCasinoType] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

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


  // 🔹 FETCH DATA (ONLY ON LOAD)
  const fetchAuthList = async (page = 1, customPerPage = perPage) => {
    setLoading(true);
    try {
      const payload = {
        search: search,
        iDisplayStart: (page - 1) * customPerPage,
        iDisplayLength: customPerPage,
      };

      const res = await getAuthList(payload);

      setData(res?.results || []);
      setTotalRecords(res?.recordsTotal || 0);   // ✅ FIX
      setCurrentPage(page);                      // ✅ FIX

    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthList(1);
  }, []);

  // 🔹 RESET
  const handleReset = () => {
    setDate(dayjs());
    setCasinoType("");
    setSearch("");
    setData([]);
    setCurrentPage(1);
    setTotalRecords(0);
  };

  // 🔹 PAGINATION
  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchAuthList(page);
    }
  };

  const getPageNumbers = () => {
    const totalNumbers = 5;
    let start = Math.max(currentPage - 2, 1);
    let end = start + totalNumbers - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - totalNumbers + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // 🔹 EXPORT EXCEL
  const exportExcel = () => {
    if (data.length === 0) return;


    const formattedData = data.map((row, index) => ({
      Username: row.text,
      Authentication: row.authStatus === "ENABLED" ? "authenticated" : "no authentication"
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Statement");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "AuthList.xlsx");
  };

  // 🔹 EXPORT PDF
  const exportPDF = () => {
    if (data.length === 0) return;

    const doc = new jsPDF();

    const tableRows = data.map(item => [
      item.text,
      item.authStatus === "ENABLED" ? "authenticated" : "no authentication"
    ]);

    autoTable(doc, {
      head: [["UserName", "Authentication"]],
      body: tableRows,
    });

    doc.save(`AuthList_${dayjs().format("YYYYMMDD_HHmmss")}.pdf`);
  };

  return (
    <div>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-flex align-items-center justify-content-between">
            <h4 className="mb-0 font-size-18">User Authentication</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <a href="/admin/home">Home</a>
                </li>
                <li className="breadcrumb-item active">
                  <span>User Authentication</span>
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

              {/* 🔹 EXPORT BUTTONS */}
              <div className="row mb-3">
                <div className="col-md-12">
                  <div className="d-inline-block">
                    <div className="d-inline-block">
                      <button
                        type="button"
                        className="btn mr-1 btn-success"
                        onClick={exportExcel}
                        disabled={data.length === 0}
                      >
                        <i className="fas fa-file-excel"></i>
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn btn-danger ml-3px"
                      onClick={exportPDF}
                      disabled={data.length === 0}
                    >
                      <i className="fas fa-file-pdf"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* 🔹 TOP BAR */}
              <div className="row">
                <div className="col-6">
                  <div className="dataTables_length">
                    <label className="d-inline-flex align-items-center">
                      Show&nbsp;
                      <select
                        className="custom-select custom-select-sm"
                        value={perPage}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setPerPage(value);
                          fetchAuthList(1, value);   // ✅ pass new value
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
                </div>

                <div className="col-6 text-right">
                  <div className="dataTables_filter text-md-right">
                    <label className="d-inline-flex align-items-center">
                      <input
                        type="search"
                        placeholder="Search..."
                        className="form-control form-control-sm ml-2"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyUp={() => fetchAuthList(1)}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* 🔹 TABLE */}
              <div className="table-responsive mb-0">
                <div className="table no-footer table-responsive-sm">
                  <Table role="table" aria-busy="false" aria-colcount="2" className="b-table" bordered hover>
                    <colgroup>
                      <col style={{ width: "50%" }} />
                      <col style={{ width: "50%" }} />
                    </colgroup>
                    <thead role="rowgroup">
                      <tr role="row">
                        <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'username' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('username')}>
                          <div>Username</div><span className="sr-only"> (Click to sort {getSortValueText('username')})</span>
                        </th>
                        <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'auth' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('auth')}>
                          <div>Authentication</div><span className="sr-only"> (Click to sort {getSortValueText('auth')})</span>
                        </th>
                      </tr>
                    </thead>

                    <tbody role="rowgroup">
                      {data.length > 0 ? (
                        data.map((row, i) => (
                          <tr key={i} role="row" tabIndex="0" className="nocursor">
                            <td role="cell">{row.text || "-"}</td>
                            <td role="cell">
                              {row.authStatus === "ENABLED"
                                ? "authenticated"
                                : "no authentication"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr role="row" className="b-table-empty-row">
                          <td colSpan="2" role="cell">
                            <div role="alert" aria-live="polite">
                              <div className="text-center my-2">
                                {loading
                                  ? "Loading..."
                                  : search?.length
                                    ? "There are no records matching your request"
                                    : "No records to show"}
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

                      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => changePage(1)}>«</button>
                      </li>

                      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => changePage(currentPage - 1)}>‹</button>
                      </li>

                      {getPageNumbers().map((page) => (
                        <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                          <button className="page-link" onClick={() => changePage(page)}>
                            {page}
                          </button>
                        </li>
                      ))}

                      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => changePage(currentPage + 1)}>›</button>
                      </li>

                      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
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
  );
};

export default AuthList;