import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import "antd/dist/reset.css";
import { getUserHistory } from "../../api/API";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Table } from 'react-bootstrap';
import { Link } from "react-router-dom";
import SelectBootStrap from "../../components/SelectBootStrap";
import useIsMobile from "../../hooks/useIsMobile";

const { RangePicker } = DatePicker;

const UserHistory = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("login");
  const [selectedClient, setSelectedClient] = useState("");
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, "day"), dayjs()]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

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

  // 🔹 Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // 🔹 Reset all states
    setSelectedClient("");
    setDateRange([dayjs().subtract(7, "day"), dayjs()]);
    setSearch("");
    setData([]);
    setCurrentPage(1);
    setTotalRecords(0);
  };

  // 🔹 Fetch User History API
  const fetchUserHistory = async (page = 1) => {
    setLoading(true);
    try {
      const fromDate = dateRange[0] ? dayjs(dateRange[0]).format("YYYY-MM-DD") : "";
      const toDate = dateRange[1] ? dayjs(dateRange[1]).format("YYYY-MM-DD") : "";

      const payload = {
        sEcho: 1,
        iDisplayStart: (page - 1) * perPage,
        iDisplayLength: perPage,
        sSearch: search,
        iSortCol_0: 0,
        sSortDir_0: "desc",
        from_date: fromDate,
        to_date: toDate,
        report_type: activeTab === "login" ? "endlogin" : "password",
        client_name: selectedClient?.value,
      };

      const res = await getUserHistory(payload);

      const result = res?.data || [];

      const numbered = result.map((item, index) => ({
        sr_no: (page - 1) * perPage + index + 1,
        ...item
      }));

      setData(numbered);
      setTotalRecords(res?.recordsTotal || 0);
      setCurrentPage(page);

    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 On load
  /*  useEffect(() => {
     fetchUserHistory();
   }, []); */

  // 🔹 On tab change auto reload
  /* useEffect(() => {
    fetchUserHistory();
  }, [activeTab]); */

  const totalPages = Math.ceil(totalRecords / perPage) || 1;

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchUserHistory(page);
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
    const aa = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    return aa.length ? aa : [1];
  };

  // 🔹 Date change
  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  // 🔹 EXPORT EXCEL
  const exportExcel = () => {
    if (data.length === 0) return;

    const wsData = data.map(item => ({
      "Username": item.user,
      "Date": item.date,
      "IP": item.ip,
      "Browser": item.browser
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "UserHistory");

    XLSX.writeFile(wb, `UserHistory_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
  };

  // 🔹 EXPORT PDF
  const exportPDF = () => {
    if (data.length === 0) return;

    const doc = new jsPDF();

    const tableColumn = ["Username", "Date", "IP", "Browser"];
    const tableRows = data.map(item => [
      item.user,
      item.date,
      item.ip,
      item.browser
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 }
    });

    doc.save(`UserHistory_${dayjs().format("YYYYMMDD_HHmmss")}.pdf`);
  };


  return (
    <div>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-flex align-items-center justify-content-between">
            <h4 className="mb-0 font-size-18">User History</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link to="/admin/home">Home</Link>
                </li>
                <li className="breadcrumb-item active">
                  <span>User History</span>
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
              <div className="tabs">
                <ul className="nav nav-tabs">
                  <li className="nav-item">
                    <a
                      role="button"
                      className={`nav-link ${activeTab === "login" ? "active tab-bg-primary" : "bg-white"}`}
                      onClick={() => handleTabChange("login")}
                    >
                      Login History
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      role="button"
                      className={`nav-link ${activeTab === "password" ? "active tab-bg-primary" : "bg-white"}`}
                      onClick={() => handleTabChange("password")}
                    >
                      Change Password History
                    </a>
                  </li>
                </ul>

                <div className="tab-content p-2 text-muted">

                  {/* LOGIN HISTORY */}
                  <div className={`tab-pane ${activeTab === "login" ? "active" : ""}`}>
                    <form>
                      <div className="row row5">

                        <div className="form-group col-xl-3">
                          <SelectBootStrap
                            selectedOption={selectedClient}
                            setSelectedOption={setSelectedClient}
                            fetchType="client"
                          />
                        </div>

                        <div className="form-group col-xl-3">
                          <RangePicker
                            style={{ width: "100%", height: isMobile ? "100%" : "84%" }}
                            value={dateRange}
                            onChange={handleDateChange}
                            format="DD/MM/YYYY"
                            className="ant_custom_date"
                          />
                        </div>

                        <div className="form-group col-xl-6">
                          <button type="button" className="btn btn-primary" onClick={() => fetchUserHistory(1)}>
                            Load
                          </button>
                          &nbsp;
                          <button
                            type="button"
                            className="btn btn-light"
                            onClick={() => {
                              setSelectedClient("");
                              setDateRange([dayjs().subtract(7, "day"), dayjs()]);
                              setSearch("");
                              setData([]);
                              setCurrentPage(1);
                              setTotalRecords(0);
                            }}
                          >
                            Reset
                          </button>
                          &nbsp;
                          <button type="button" className="btn btn-success" onClick={exportExcel} disabled={data.length === 0}>
                            <i className="fas fa-file-excel"></i>
                          </button>
                          &nbsp;
                          <button type="button" className="btn btn-danger" onClick={exportPDF} disabled={data.length === 0}>
                            <i className="fas fa-file-pdf"></i>
                          </button>
                        </div>
                      </div>
                    </form>

                    {/* TOP BAR */}
                    <div className="row">
                      <div className="col-6">
                        <label className="d-inline-flex align-items-center">
                          Show&nbsp;
                          <select
                            className="custom-select custom-select-sm"
                            value={perPage}
                            onChange={(e) => {
                              setPerPage(Number(e.target.value));
                              fetchUserHistory(1);
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

                      <div className="col-6 text-right">
                        <div id="tickets-table_filter" className="dataTables_filter text-md-right">
                          <label className="d-inline-flex align-items-center">
                            <input
                              type="search"
                              field-type="search"
                              placeholder="Search..."
                              className="form-control form-control-sm ml-2"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              onKeyUp={(e) => { fetchUserHistory(1) }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="table-responsive mb-0">
                      <div className="table no-footer table-responsive-sm">
                        <Table role="table" aria-busy="false" aria-colcount="4" className="b-table" hover>
                          <thead role="rowgroup">
                            <tr role="row">
                              <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'username' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('username')}>
                                <div>Username</div><span className="sr-only"> (Click to sort {getSortValueText('username')})</span>
                              </th>
                              <th role="columnheader" scope="col" tabIndex="0" className="position-relative">
                                <div>Date</div>
                              </th>
                              <th role="columnheader" scope="col" tabIndex="0" className="position-relative">
                                <div>IP</div>
                              </th>
                              <th role="columnheader" scope="col" tabIndex="0" className="position-relative">
                                <div>Detail</div>
                              </th>
                            </tr>
                          </thead>
                          <tbody role="rowgroup">
                            {data.length > 0 ? data.map((row, idx) => (
                              <tr key={idx} role="row" tabIndex="0" className="nocursor">
                                <td role="cell">{row.user}</td>
                                <td role="cell">{row.date}</td>
                                <td role="cell">{row.ip}</td>
                                <td role="cell">
                                  <p className="text-center mb-0">
                                    <i
                                      className="fas fa-eye"
                                      style={{ cursor: "pointer" }}
                                      onClick={() => {
                                        setModalData(row);
                                        setShowModal(true);
                                      }}
                                    ></i>
                                  </p>
                                </td>
                              </tr>
                            )) : (
                              <tr role="row" className="b-table-empty-row">
                                <td colSpan="4" role="cell">
                                  <div role="alert" aria-live="polite">
                                    <div className="text-center my-2">
                                      {loading
                                        ? "Loading..."
                                        : search?.length
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
                        <ul className="pagination pagination-rounded mb-0 float-right">

                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => changePage(1)}>«</button>
                          </li>

                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => changePage(currentPage - 1)}>‹</button>
                          </li>

                          {getPageNumbers().map((page) => (
                            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => changePage(page)}>
                                {page}
                              </button>
                            </li>
                          ))}

                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => changePage(currentPage + 1)}>›</button>
                          </li>

                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => changePage(totalPages)}>»</button>
                          </li>

                        </ul>
                      </div>
                    </div>

                  </div>

                  {/* PASSWORD HISTORY */}
                  <div className={`tab-pane ${activeTab === "password" ? "active" : ""}`}>

                    <form>
                      <div className="row">

                        <div className="form-group col-xl-3">
                          <SelectBootStrap
                            selectedOption={selectedClient}
                            setSelectedOption={setSelectedClient}
                            fetchType="client"
                          />
                        </div>

                        <div className="form-group col-xl-3">
                          <RangePicker
                            style={{ width: "100%", height: isMobile ? "100%" : "84%" }}
                            value={dateRange}
                            onChange={handleDateChange}
                            format="DD/MM/YYYY"
                            className="ant_custom_date"
                          />
                        </div>

                        <div className="form-group col-xl-6">
                          <button type="button" className="btn btn-primary" onClick={() => fetchUserHistory(1)}>
                            Load
                          </button>
                          &nbsp;
                          <button
                            type="button"
                            className="btn btn-light"
                            onClick={() => {
                              setSelectedClient("");
                              setDateRange([dayjs().subtract(7, "day"), dayjs()]);
                              setSearch("");
                              setData([]);
                              setCurrentPage(1);
                              setTotalRecords(0);
                            }}
                          >
                            Reset
                          </button>
                          &nbsp;
                          <button type="button" className="btn btn-success" onClick={exportExcel} disabled={data.length === 0}>
                            <i className="fas fa-file-excel"></i>
                          </button>
                          &nbsp;
                          <button type="button" className="btn btn-danger" onClick={exportPDF} disabled={data.length === 0}>
                            <i className="fas fa-file-pdf"></i>
                          </button>
                        </div>
                      </div>
                    </form>

                    {/* TOP BAR */}
                    <div className="row">
                      <div className="col-6">
                        <label className="d-inline-flex align-items-center">
                          Show&nbsp;
                          <select
                            className="custom-select custom-select-sm"
                            value={perPage}
                            onChange={(e) => {
                              setPerPage(Number(e.target.value));
                              fetchUserHistory(1);
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

                      <div className="col-6 text-right">
                        <div id="tickets-table_filter" className="dataTables_filter text-md-right">
                          <label className="d-inline-flex align-items-center">
                            <input
                              type="search"
                              field-type="search"
                              placeholder="Search..."
                              className="form-control form-control-sm ml-2"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              onKeyUp={(e) => { fetchUserHistory(1) }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="table-responsive mb-0">
                      <div className="table no-footer table-responsive-sm">
                        <Table role="table" aria-busy="false" aria-colcount="4" className="b-table" hover>
                          <thead role="rowgroup">
                            <tr role="row">
                              <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'username' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('username')}>
                                <div>Username</div><span className="sr-only"> (Click to sort {getSortValueText('username')})</span>
                              </th>
                              <th role="columnheader" scope="col" tabIndex="0" className="position-relative">
                                <div>Date</div>
                              </th>
                              <th role="columnheader" scope="col" tabIndex="0" className="position-relative">
                                <div>IP</div>
                              </th>
                              <th role="columnheader" scope="col" tabIndex="0" className="position-relative">
                                <div>Detail</div>
                              </th>
                            </tr>
                          </thead>
                          <tbody role="rowgroup">
                            {data.length > 0 ? data.map((row, idx) => (
                              <tr key={idx} role="row" tabIndex="0" className="nocursor">
                                <td role="cell">{row.user}</td>
                                <td role="cell">{row.date}</td>
                                <td role="cell">{row.ip}</td>
                                <td role="cell">
                                  <p className="text-center mb-0">
                                    <i
                                      className="fas fa-eye"
                                      style={{ cursor: "pointer" }}
                                      onClick={() => {
                                        setModalData(row);
                                        setShowModal(true);
                                      }}
                                    ></i>
                                  </p>
                                </td>
                              </tr>
                            )) : (
                              <tr role="row" className="b-table-empty-row">
                                <td colSpan="4" role="cell">
                                  <div role="alert" aria-live="polite">
                                    <div className="text-center my-2">
                                      {loading
                                        ? "Loading..."
                                        : search?.length
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
                        <ul className="pagination pagination-rounded mb-0 float-right">

                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => changePage(1)}>«</button>
                          </li>

                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => changePage(currentPage - 1)}>‹</button>
                          </li>

                          {getPageNumbers().map((page) => (
                            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => changePage(page)}>
                                {page}
                              </button>
                            </li>
                          ))}

                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => changePage(currentPage + 1)}>›</button>
                          </li>

                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
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

      {showModal && modalData && (
        <div style={{ position: "fixed", zIndex: 1040, top: 0, left: 0, width: "100%" }}>
          <div
            className="modal fade show"
            style={{ display: "block" }}
          >
            <div className="modal-dialog modal-sm">
              <div className="modal-content">

                {/* HEADER */}
                <div className="modal-header bg-success">
                  <h5 className="modal-title text-uppercase text-white">
                    Ip Detail
                  </h5>
                  <button
                    type="button"
                    className="close text-white"
                    onClick={() => setShowModal(false)}
                  >
                    ×
                  </button>
                </div>

                {/* BODY */}
                <div className="modal-body">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover table-bordered table-sm">
                      <thead className="thead-dark">
                        <tr>
                          <th>Key</th>
                          <th>Value</th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr>
                          <td><b>IP:</b></td>
                          <td>{modalData.ip}</td>
                        </tr>

                        <tr>
                          <td><b>City:</b></td>
                          <td>-</td>
                        </tr>

                        <tr>
                          <td><b>Country:</b></td>
                          <td>-</td>
                        </tr>

                        <tr>
                          <td><b>Browser:</b></td>
                          <td>{modalData.browser}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* BACKDROP */}
          <div
            className="modal-backdrop show"
            onClick={() => setShowModal(false)}
          ></div>
        </div>
      )}
    </div>
  );
};

export default UserHistory;