import React, { useState } from "react";
import { DatePicker } from "antd";
import Select from "react-select";
import "antd/dist/reset.css";
import { getCasinoResult } from "../../api/API";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Table } from 'react-bootstrap';
import Pagination from "../../components/Pagination";
import { Link } from "react-router-dom";
import SelectBootStrap from "../../components/SelectBootStrap";



const { RangePicker } = DatePicker;
const providerTypes = [
  { value: "", label: "Select" },
  { value: "ezugi", label: "Ezugi" },
  { value: "ss", label: "Super Spade" },
  { value: "qt", label: "Slot 3 | Holi" },
  { value: "evo", label: "Evolution" },
  { value: "cockfight", label: "CockFight" },
  { value: "ludo", label: "Ludo Classic" },
  { value: "pop-the-ball", label: "PopTheBall" },
  { value: "binary", label: "Binary" },
  { value: "tgs", label: "Slot 2" },
  { value: "slot", label: "Slot" },
  { value: "tgslive", label: "VivoGames-LuckyStreak" },
  { value: "rummy", label: "Rummy" },
  { value: "ludo-lands", label: "Ludo Lands" },
  { value: "vivo", label: "Vivo Gaming" },
  { value: "snakes-and-ladders", label: "Snakes and Ladders" },
  { value: "smart", label: "Smart Soft" },
  { value: "astar", label: "Astar Game" },
  { value: "bc", label: "Creedroomz" },
  { value: "ds", label: "Dragoon Soft" },
  { value: "bota", label: "Bota" },
  { value: "tembo", label: "Tembo" },
  { value: "lottery", label: "Lottery" },
  { value: "bcslot", label: "Pascal Game | Popok" },
  { value: "av", label: "Aviator" },
  { value: "scratch", label: "Scratch" },
  { value: "darwin", label: "Darwin" },
  { value: "pg", label: "Pocket Game" },
  { value: "jilli", label: "Jili" },
  { value: "bet", label: "Bet Core" },
  { value: "win", label: "Win" },
  { value: "gemini1", label: "Gemini" },
  { value: "amigo", label: "Amigo" },
  { value: "egt", label: "EGT" },
  { value: "studio21", label: "Studio21" },
  { value: "beon", label: "Beon Gaming" },
];

const LiveCasinoResult = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [selectedClient, setSelectedClient] = useState("");

  const [date, setDate] = useState(dayjs());
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, "day"), dayjs()]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [selectopt, setSelectopt] = useState("");
  const [selectopt2, setSelectopt2] = useState("");
  const [isSelectoptTouched, setIsSelectoptTouched] = useState(false);
  const [isSelectoptTouched2, setIsSelectoptTouched2] = useState(false);

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

    setSelectopt("");
    setSelectopt2("");
    setIsSelectoptTouched(false);
    setIsSelectoptTouched2(false);

    setSelectedClient("");
    setDate(dayjs());
    setDateRange([dayjs().subtract(7, "day"), dayjs()]);
    setSearch("");
    setData([]);
    setCurrentPage(1);
    setTotalRecords(0);
  };

  // 🔹 Fetch clients


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
        client_name: selectedClient?.value,
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
                  <Link to="/admin/home">Home</Link>
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
                    className={`nav-link fw-500 ${activeTab === "login" ? "active tab-bg-primary" : "bg-white"}`}
                    onClick={() => handleTabChange("login")}
                  >
                    Settled Bets
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link fw-500 ${activeTab === "password" ? "active tab-bg-primary" : "bg-white"}`}
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
                    <div className="row row5 mb-3 mb-20px">

                      {/* CLIENT */}
                      <div className="col-xl-2 mb-3">
                        <SelectBootStrap
                          selectedOption={selectedClient}
                          setSelectedOption={setSelectedClient}
                          fetchType="client"
                        />
                      </div>

                      {/* DATE */}
                      <div className="col-xl-2 mb-3">
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
                          style={{ width: "100%", height: "100%" }}
                          className="ant_custom_date"
                        />
                      </div>

                      {/* TYPE */}
                      <div className="col-xl-2 mb-3">
                        <select
                          className={`form-control ${isSelectoptTouched && selectopt?.length === 0 ? "is-invalid" : ""}`}
                          onBlur={() => setIsSelectoptTouched(true)}
                          value={selectopt}
                          onChange={(e) => setSelectopt(e.target.value)}
                        >
                          {/* <option value="ezugi">Ezugi</option>
                          <option value="ss">Super Spade</option>
                          <option value="qt">Slot 3 | Holi</option>
                          <option value="evo">Evolution</option> */}
                          {providerTypes.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* BUTTONS */}
                      <div className="col-xl-5 mb-3">
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
                          onClick={() => {
                            setSelectedClient("");
                            setDate(dayjs());
                            setSelectopt("");
                            setSearch("");
                            setData([]);
                            setCurrentPage(1);
                            setTotalRecords(0);
                          }}
                        >
                          Reset
                        </button>{' '}

                        <div className="d-inline-block ml-3">
                          <button
                            className="btn btn-success mr-1"
                            onClick={exportExcel}
                            disabled={data.length === 0}
                          >
                            <i className="fas fa-file-excel"></i>
                          </button>{' '}
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

                  {/* TOP BAR */}
                  <div className="row">
                    <div className="col-6">
                      <label className="d-inline-flex align-items-center">
                        Show&nbsp;
                        <select
                          className="custom-select custom-select-sm"
                          onChange={(e) => setPerPage(Number(e.target.value))}
                        >
                          <option>25</option>
                          <option>50</option>
                          <option>75</option>
                          <option>100</option>
                          <option>125</option>
                          <option>150</option>
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
                            className="form-control form-control-sm ml-2 dark-placeholder"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          // onKeyUp={(e) => { fetchStatement(1) }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

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

                </div>

                {/* ================= UNSETTLED ================= */}
                <div className={`tab-pane ${activeTab === "password" ? "active" : ""}`}>

                  <form>
                    <div className="row row5 mb-3 mb-20px">

                      <div className="col-xl-2 mb-3">
                        <SelectBootStrap
                          selectedOption={selectedClient}
                          setSelectedOption={setSelectedClient}
                          fetchType="client"
                        />
                      </div>

                      <div className="col-xl-2 mb-3">
                        <select
                          className={`form-control ${isSelectoptTouched2 && selectopt2?.length === 0 ? "is-invalid" : ""}`}
                          onBlur={() => setIsSelectoptTouched2(true)}
                          value={selectopt2}
                          onChange={(e) => setSelectopt2(e.target.value)}
                        >
                          {providerTypes.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-xl-5 mb-3">
                        <button className="btn btn-primary">Load</button>{" "}
                        <button
                          className="btn btn-light"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedClient("");
                            setDate(dayjs());
                            setSelectopt2("");
                            setSearch("");
                            setData([]);
                            setCurrentPage(1);
                            setTotalRecords(0);
                          }}
                        >
                          Reset
                        </button>
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
                <Pagination currentPage={currentPage} totalPages={totalPages} apiCallByPageNo={fetchUserHistory} />
              </div>
            </div>
          </div>
        </div>
      </div >
    </div >
  );
};

export default LiveCasinoResult;