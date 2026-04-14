import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import Select from "react-select";
import "antd/dist/reset.css";
import { getClients, getCasinoResult } from "../../api/API";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { customSelectStyles } from "../../components/Header";
import { Table } from 'react-bootstrap';


const { RangePicker } = DatePicker;

const LiveCasinoResult = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [clientList, setClientList] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [clientSearch, setClientSearch] = useState('');
  const [date, setDate] = useState(dayjs());
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
    setClientSearch("");
    setClientList([]);
    setDate(dayjs());
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
      const fromDate = dayjs(date).format("YYYY-MM-DD");
      const toDate = dayjs(date).format("YYYY-MM-DD");

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
                    className={`nav-link ${activeTab === "login" ? "active tab-bg-primary" : "bg-white"}`}
                    onClick={() => handleTabChange("login")}
                  >
                    Settled Bets
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "password" ? "active tab-bg-primary" : "bg-white"}`}
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
                        {/* <input
                          type="text"
                          className="form-control"
                          placeholder="Select option"
                          value={clientSearch}
                          onChange={(e) => {
                            setClientSearch(e.target.value);
                            fetchClients(e.target.value);
                          }}
                        /> */}
                        <Select
                          options={[]}
                          placeholder="Select option"
                          value={clientSearch}
                          onChange={(e) => {
                            setClientSearch(e.target.value);
                            fetchClients(e.target.value);
                          }}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          components={{
                            DropdownIndicator: () => null,
                            IndicatorSeparator: () => null
                          }}
                          noOptionsMessage={() => "List is empty."}
                          styles={customSelectStyles}
                        />
                      </div>

                      {/* DATE */}
                      <div className="col-xl-2">
                        {/* <RangePicker
                          style={{ width: "100%" }}
                          value={dateRange}
                          onChange={handleDateChange}
                          format="DD/MM/YYYY"
                        /> */}
                        <DatePicker
                          value={date}
                          onChange={(d) => setDate(d)}
                          format="DD/MM/YYYY"
                          style={{ width: "100%" }}
                        />
                      </div>

                      {/* TYPE */}
                      <div className="col-xl-2">
                        <select className="form-control">
                          <option value="">Select</option>
                          {/* <option value="ezugi">Ezugi</option>
                          <option value="ss">Super Spade</option>
                          <option value="qt">Slot 3 | Holi</option>
                          <option value="evo">Evolution</option> */}
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
                    <div className="table no-footer table-responsive-sm">
                      <Table role="table" aria-busy="false" aria-colcount="7" className="b-table" bordered>
                        <thead role="rowgroup">
                          <tr role="row">
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'gameName' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('gameName')}>
                              <div>Game Name</div><span className="sr-only"> (Click to sort {getSortValueText('gameName')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'type' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('type')}>
                              <div>Type</div><span className="sr-only"> (Click to sort {getSortValueText('type')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'amount' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('amount')}>
                              <div>Amount</div><span className="sr-only"> (Click to sort {getSortValueText('amount')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'total' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('total')}>
                              <div>Total</div><span className="sr-only"> (Click to sort {getSortValueText('total')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'date' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('date')}>
                              <div>Date</div><span className="sr-only"> (Click to sort {getSortValueText('date')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'roundId' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('roundId')}>
                              <div>Round Id</div><span className="sr-only"> (Click to sort {getSortValueText('roundId')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'transactionId' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('transactionId')}>
                              <div>Transaction Id</div><span className="sr-only"> (Click to sort {getSortValueText('transactionId')})</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody role="rowgroup">
                          {data.length > 0 ? (
                            data.map((row, i) => (
                              <tr key={i} role="row" tabIndex="0" className="nocursor">
                                <td role="cell">{row.game_name || "-"}</td>
                                <td role="cell">{row.type || "-"}</td>
                                <td role="cell" className="text-right">{row.amount || "-"}</td>
                                <td role="cell" className="text-right">{row.total || "-"}</td>
                                <td role="cell">{row.date || "-"}</td>
                                <td role="cell">{row.round_id || "-"}</td>
                                <td role="cell">{row.transaction_id || "-"}</td>
                              </tr>
                            ))
                          ) : (
                            <tr role="row" className="b-table-empty-row">
                              <td colSpan="7" role="cell">
                                <div role="alert" aria-live="polite">
                                  <div className="text-center my-2">
                                    {loading ? "Loading..." : "There are no records to show"}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </div>

                </div>

                {/* ================= UNSETTLED ================= */}
                <div className={`tab-pane ${activeTab === "password" ? "active" : ""}`}>

                  <form>
                    <div className="row row5 mb-3">

                      <div className="col-xl-2">
                        {/* <input
                          type="text"
                          className="form-control"
                          placeholder="Select option"
                        /> */}
                        <Select
                          options={[]}
                          placeholder="Select option"
                          className="react-select-container"
                          classNamePrefix="react-select"
                          components={{
                            DropdownIndicator: () => null,
                            IndicatorSeparator: () => null
                          }}
                          noOptionsMessage={() => "List is empty."}
                          styles={customSelectStyles}
                        />
                      </div>

                      <div className="col-xl-2">
                        <select className="form-control">
                          <option value="">Select</option>
                          {/* <option value="ezugi">Ezugi</option>
                          <option value="ss">Super Spade</option>
                          <option value="qt">Slot 3 | Holi</option>
                          <option value="evo">Evolution</option>
                          <option value="cockfight">CockFight</option> */}
                        </select>
                      </div>

                      <div className="col-xl-5">
                        <button className="btn btn-primary">Load</button>{" "}
                        <button className="btn btn-light">Reset</button>
                      </div>

                    </div>
                  </form>

                  <div className="table-responsive mb-0">
                    <div className="table no-footer table-responsive-sm">
                      <Table role="table" aria-busy="false" aria-colcount="7" className="b-table" bordered>
                        <thead role="rowgroup">
                          <tr role="row">
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'gameName' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('gameName')}>
                              <div>Game Name</div><span className="sr-only"> (Click to sort {getSortValueText('gameName')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'type' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('type')}>
                              <div>Type</div><span className="sr-only"> (Click to sort {getSortValueText('type')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'amount' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('amount')}>
                              <div>Amount</div><span className="sr-only"> (Click to sort {getSortValueText('amount')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'total' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('total')}>
                              <div>Total</div><span className="sr-only"> (Click to sort {getSortValueText('total')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'date' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('date')}>
                              <div>Date</div><span className="sr-only"> (Click to sort {getSortValueText('date')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'roundId' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('roundId')}>
                              <div>Round Id</div><span className="sr-only"> (Click to sort {getSortValueText('roundId')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'transactionId' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('transactionId')}>
                              <div>Transaction Id</div><span className="sr-only"> (Click to sort {getSortValueText('transactionId')})</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody role="rowgroup">
                          <tr role="row" className="b-table-empty-row">
                            <td colSpan="7" role="cell">
                              <div role="alert" aria-live="polite">
                                <div className="text-center my-2">There are no records to show</div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
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

export default LiveCasinoResult;