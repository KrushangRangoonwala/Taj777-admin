import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import "antd/dist/reset.css";
import { getClients, getCasinoResult } from "../../api/API";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const { RangePicker } = DatePicker;

const SportBookReport = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [clientList, setClientList] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [clientSearch, setClientSearch] = useState('');
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, "day"), dayjs()]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
   const [search, setSearch] = useState("");

  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  // 🔹 Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // 🔹 Reset all states
    setSelectedClient("");
    setClientSearch("");
    setClientList([]);
    setDateRange([dayjs().subtract(7, "day"), dayjs()]);
    setSearch("");
    setData([]);
    setCurrentPage(1);
    setTotalRecords(0);
  };

  // 🔹 Fetch clients
  const fetchClients = async (value) => {
    try {
      const res = await getClients(value);
      setClientList(res.results || []);
    } catch (err) {
      console.error(err);
    }
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
        client_name: selectedClient,
      };

      const res = await getCasinoResult(payload);

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

  const totalPages = Math.ceil(totalRecords / perPage);

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

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
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
    <div className="live-bets-report">
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-flex align-items-center justify-content-between">
            <h4 className="mb-0 font-size-18">Live Casino Result</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <a href="/admin/home">Home</a>
                </li>
                <li className="breadcrumb-item active">
                  <span>Casino Result</span>
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

              {/* 🔹 Tabs */}
              <ul className="nav nav-tabs">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "login" ? "active tab-bg-primary" : ""}`}
                    onClick={() => handleTabChange("login")}
                  >
                    Settled Bets
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "password" ? "active tab-bg-primary" : ""}`}
                    onClick={() => handleTabChange("password")}
                  >
                    Unsettled Bets
                  </button>
                </li>
              </ul>

              <div className="tab-content p-3 text-muted">

                {/* ================= SETTLED ================= */}
                <div className={`tab-pane ${activeTab === "login" ? "active" : ""}`}>

                  <form>
                    <div className="row row5 mb-3">

                      {/* CLIENT */}
                      <div className="col-xl-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Select option"
                          value={clientSearch}
                          onChange={(e) => {
                            setClientSearch(e.target.value);
                            fetchClients(e.target.value);
                          }}
                        />
                      </div>

                      {/* DATE */}
                      <div className="col-xl-2">
                        <RangePicker
                          style={{ width: "100%" }}
                          value={dateRange}
                          onChange={handleDateChange}
                          format="DD/MM/YYYY"
                        />
                      </div>

                      {/* TYPE */}
                      <div className="col-xl-2">
                        <select className="form-control">
                          <option value="">Select</option>
                          <option value="sportbook1">Sport Book1</option>
                        </select>
                      </div>

                      {/* BUTTONS */}
                      <div className="col-xl-5">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => fetchUserHistory(1)}
                        >
                          Load
                        </button>{" "}
                        <button
                          type="button"
                          className="btn btn-light"
                        >
                          Reset
                        </button>

                        <div className="d-inline-block ml-3">
                          <button
                            className="btn btn-success mr-1"
                            onClick={exportExcel}
                            disabled={data.length === 0}
                          >
                            <i className="fas fa-file-excel"></i>
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={exportPDF}
                            disabled={data.length === 0}
                          >
                            <i className="fas fa-file-pdf"></i>
                          </button>
                        </div>
                      </div>

                    </div>
                  </form>

                  {/* TABLE */}
                  <div className="table-responsive mb-0">
                    <table className="table b-table table-bordered">
                      <thead>
                        <tr>
                          <th>Round Id</th>
                          <th>Type</th>
                          <th className="text-right">Amount</th>
                          <th className="text-right">Total</th>
                          <th>Bet Id</th>
                          <th>Date</th>
                        </tr>
                      </thead>

                      <tbody>
                        {data.length > 0 ? (
                          data.map((row, i) => (
                            <tr key={i}>
                              <td>{row.round_id || "-"}</td>
                              <td>{row.type || "-"}</td>
                              <td className="text-right">{row.amount || "-"}</td>
                              <td className="text-right">{row.total || "-"}</td>
                              <td>{row.bet_id || "-"}</td>
                              <td>{row.date || "-"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center">
                              {loading ? "Loading..." : "There are no records to show"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ================= UNSETTLED ================= */}
                <div className={`tab-pane ${activeTab === "password" ? "active" : ""}`}>

                  <form>
                    <div className="row row5 mb-3">

                      <div className="col-xl-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Select option"
                        />
                      </div>

                      <div className="col-xl-2">
                        <select className="form-control">
                          <option value="">Select</option>
                          <option value="sportbook1">Sport Book1</option>
                        </select>
                      </div>

                      <div className="col-xl-5">
                        <button className="btn btn-primary">Load</button>{" "}
                        <button className="btn btn-light">Reset</button>
                      </div>

                    </div>
                  </form>

                  <div className="table-responsive mb-0">
                    <table className="table b-table table-bordered">
                      <thead>
                        <tr>
                          <th>Round Id</th>
                          <th>Type</th>
                          <th className="text-right">Amount</th>
                          <th>Bet Id</th>
                          <th>Date</th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr>
                          <td colSpan="6" className="text-center">
                            There are no records to show
                          </td>
                        </tr>
                      </tbody>
                    </table>
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

export default SportBookReport;