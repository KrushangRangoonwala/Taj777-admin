import React, { useEffect, useState } from "react";
import { DatePicker } from "antd";
import "antd/dist/reset.css";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { getClients, getTurnover } from "../../api/API";
import { apiGetSports, apiGetGameType } from "../../api/API_games";
import { casino_list } from "../../utilies/casino_list";
import { Link } from "react-router-dom";
import SelectBootStrap from "../../components/SelectBootStrap";

const casinoTypes = [
  { value: "", label: "Select Type" },   // ✅ static first option
  ...(casino_list?.map(val => ({
    value: val.game_name,
    label: val.game_name,
  })) || [])
];

const today = dayjs(); // today
let initialFromDate = today.subtract(7, "day");

// If subtracting 7 days goes to previous month, set fromDate to 1st of current month
if (initialFromDate.month() !== today.month()) {
  initialFromDate = today.startOf("month");
}

const Turnover = () => {
  const [isSelectoptTouched, setIsSelectoptTouched] = useState({ a: false, b: false, c: false });
  const [type, setType] = useState('');
  const [sportsList, setSportsList] = useState([]);
  const [sportsListType, setSportsListType] = useState('');
  const [gameTypeList, setGameTypeList] = useState('');
  const [gameType, setGameType] = useState('');
  const [casinoList, setCasinoList] = useState('');

  const [selectedClient, setSelectedClient] = useState("");

  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(today);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const [errors, setErrors] = useState({
    type: false,
    sportsList: false,
  });

  const isDataAvailable = data && data.length > 0;

  const fetchTurnover = async (page = currentPage) => {
    try {
      setLoading(true);

      const payload = {
        selected_user_id: selectedClient,
        selected_type: type === "2" ? "casino" : "sports",
        event_type: type === "1" ? sportsListType : casinoList,
        market_type: type === "1" ? gameType : "",
        from_date: fromDate ? fromDate.format("YYYY-MM-DD") : "",
        to_date: toDate ? toDate.format("YYYY-MM-DD") : "",
        page: page,
        per_page: perPage
      };

      const res = await getTurnover(payload); // 👉 replace with your turnover API call

      const result = res?.data || [];

      // 🔥 map API keys to your table keys
      const formatted = result.map((row) => ({
        loss_turnover: row.loss_turnover,
        loss: row.loss,
        win_turnover: row.profit_turnover,
        win: row.profit,
        total_turnover: row.total_turnover,
        total_pl: row.total_pl
      }));

      setData(formatted);
      setTotalRecords(res?.total || 0);
      setCurrentPage(page);

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };


  async function getSports() {
    const data = await apiGetSports();
    const sportArr = [{ id: "", label: "Select Sports List" }];
    data?.data?.forEach(item => {
      sportArr.push({
        id: item.sport_id,
        label: item.sport_name === "Soccer" ? "Football" : item.sport_name
      })
    })
    setSportsList(sportArr);
  };

  async function getGameType() {
    const data = await apiGetGameType();
    const gameTypeArr = [{ id: "", label: "Select Game Type" }];
    data?.data?.forEach(item => {
      gameTypeArr.push({
        id: item.market_type,
        label: item.market_type
      })
    })
    setGameTypeList(gameTypeArr);
  };

  useEffect(() => {
    getSports();
    getGameType();
  }, []);

  const totalPages = Math.ceil(totalRecords / perPage) || 1;

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchTurnover(page);
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

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handleReset = () => {
    setSelectedClient("");
    setFromDate(dayjs().subtract(7, "day"));
    setToDate(dayjs());
    setType("");
    setSportsListType("");
    setGameType("");
    setCasinoList("");
    setData([]);
    setCurrentPage(1);
  };

  const exportToExcel = () => {
    const formatted = data.map((row, i) => ({
      "Sr No": i + 1,
      "Loss Turnover": row.loss_turnover,
      "Loss": row.loss,
      "Win Turnover": row.win_turnover,
      "Win": row.win,
      "Total Turnover": row.total_turnover,
      "Total P/L": row.total_pl,
    }));

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Turnover");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "Turnover_Report.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableData = data.map((row, i) => ([
      i + 1,
      row.loss_turnover,
      row.loss,
      row.win_turnover,
      row.win,
      row.total_turnover,
      row.total_pl
    ]));

    autoTable(doc, {
      head: [['Sr No', 'Loss Turnover', 'Loss', 'Win Turnover', 'Win', 'Total Turnover', 'Total P/L']],
      body: tableData
    });

    doc.save("Turnover_Report.pdf");
  };

  return (
    <div>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-flex align-items-center justify-content-between">
            <h4 className="mb-0 font-size-18">Turnover Report</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link to="/admin/home">Home</Link>
                </li>
                <li className="breadcrumb-item active">
                  <span>Turnover Report</span>
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

              {/* 🔹 INFO ALERT */}
              <div className="alert alert-info">
                You will be able to see the data of last 7 days only.
              </div>

              {/* 🔹 FORM */}
              <form onSubmit={(e) => {
                e.preventDefault();

                let newErrors = {
                  type: false,
                  sportsList: false,
                };

                let isValid = true;

                if (!type) {
                  newErrors.type = true;
                  isValid = false;
                }

                if (type === "1" && !sportsListType) {
                  newErrors.sportsList = true;
                  isValid = false;
                }

                setErrors(newErrors);

                if (!isValid) return;

                fetchTurnover();

              }}>
                <div className="row row5">

                  {/* CLIENT SEARCH */}
                  <div className="col-md-4 col-xl-2">
                    <div className="form-group user-lock-search mb-3px-plus" style={{ position: "relative" }}>
                      <label>Search By Client Name</label>
                      <SelectBootStrap
                        selectedOption={selectedClient}
                        setSelectedOption={setSelectedClient}
                        fetchType="client"
                      />
                    </div>
                  </div>

                  {/* FROM DATE */}
                  <div className="col-md-2">
                    <label>From Date:</label>
                    <DatePicker
                      value={fromDate}
                      onChange={(d) => {
                        setFromDate(d);

                        if (!d) {
                          setToDate(null);
                          return;
                        }

                        const maxDate = d.add(7, "day");
                        const endOfMonth = d.endOf("month");

                        // choose smaller: 7th day OR end of month
                        const autoToDate = maxDate.isBefore(endOfMonth) ? maxDate : endOfMonth;

                        // also don't go beyond today
                        const finalToDate = autoToDate.isAfter(dayjs()) ? dayjs() : autoToDate;

                        setToDate(finalToDate);
                      }}
                      format="DD/MM/YYYY"
                      style={{ width: "100%" }}
                      className="ant_custom_date date-input"
                      disabledDate={(current) => {
                        return current.isAfter(dayjs(), "day"); // disable future dates
                      }}
                    />
                  </div>

                  {/* TO DATE */}
                  <div className="col-md-2">
                    <label>To Date:</label>
                    <DatePicker
                      value={toDate}
                      onChange={(d) => setToDate(d)}
                      format="DD/MM/YYYY"
                      style={{ width: "100%" }}
                      className="ant_custom_date date-input"
                      disabledDate={(current) => {
                        if (!fromDate) return current.isAfter(dayjs(), "day"); // disable all if fromDate not selected

                        const maxDate = fromDate.add(7, "day");
                        const endOfMonth = fromDate.endOf("month");

                        const limitDate = maxDate.isBefore(endOfMonth) ? maxDate : endOfMonth;

                        // disable dates before fromDate or after limitDate
                        return (
                          current.isBefore(fromDate, "day") ||
                          current.isAfter(limitDate, "day") ||
                          current.isAfter(dayjs(), "day")
                        );
                      }}
                    />
                  </div>

                  {/* TYPE */}
                  <div className="col-md-4 col-xl-2">
                    <div className="form-group">
                      <label>Type</label>
                      <select
                        // className={`form-control ${errors.type || isSelectoptTouched.a ? "is-invalid" : ""}`}
                        className={`form-control ${errors.type ? "is-invalid" : ""}`}
                        value={type}
                        onChange={(e) => {
                          setType(e.target.value);
                          setSportsListType('');
                          setGameType('');
                          setCasinoList('');
                        }}
                      // onBlur={() => setIsSelectoptTouched(prev => ({ ...prev, a: true }))}
                      >
                        <option value="">Select Type</option>
                        <option value="1">Sports</option>
                        <option value="2">Casino</option>
                      </select>
                    </div>
                  </div>

                  {type === "1" && (
                    <>
                      <div className="col-md-4 col-xl-2">
                        <div className="form-group">
                          <label>Sports List</label>
                          <select
                            className={`form-control ${errors.sportsList ? "is-invalid" : ""}`}
                            value={sportsListType}
                            onChange={(e) => setSportsListType(e.target.value)}
                          >
                            {sportsList.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="col-md-4 col-xl-2">
                        <div className="form-group">
                          <label>Game Type</label>
                          <select
                            className="form-control"
                            value={gameType}
                            onChange={(e) => setGameType(e.target.value)}
                          >
                            {gameTypeList.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {type === "2" && (
                    <div className="col-md-4 col-xl-2">
                      <div className="form-group">
                        <label>Casino List</label>
                        <select
                          className="form-control"
                          value={casinoList}
                          onChange={(e) => setCasinoList(e.target.value)}
                        >
                          {casinoTypes.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                </div>

                {/* BUTTONS */}
                <div className="row row5">
                  <div className="col-md-12 col-xl-3 ml-3px-child">
                    <button type="submit" className="btn btn-primary ">
                      Load
                    </button>

                    <button type="button" className="btn btn-light" onClick={handleReset}>
                      Reset
                    </button>

                    <div className="d-inline-block ml-1">
                      <div className={`d-inline-block ml-3px ${!isDataAvailable ? "disabled" : ""}`}>
                        <button
                          type="button"
                          className="btn mr-1 btn-success"
                          // style={{ marginLeft: "3px" }}
                          disabled={!isDataAvailable}
                          onClick={exportToExcel}
                        >
                          <i className="fas fa-file-excel"></i>
                        </button>
                      </div>

                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ marginLeft: "4px" }}
                        disabled={!isDataAvailable}
                        onClick={exportToPDF}
                      >
                        <i className="fas fa-file-pdf"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* 🔹 TABLE */}
              <div className="table-responsive mb-0 mt-3">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th className="text-right">Loss Turn Over</th>
                      <th className="text-right">Loss</th>
                      <th className="text-right">Win Turn Over</th>
                      <th className="text-right">Win</th>
                      <th className="text-right">Total Turn Over</th>
                      <th className="text-right">Total P/L</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.length > 0 ? (
                      data.map((row, i) => (
                        <tr key={i}>
                          <td className="text-right">{row.loss_turnover}</td>
                          <td className="text-right">{row.loss}</td>
                          <td className="text-right">{row.win_turnover}</td>
                          <td className="text-right">{row.win}</td>
                          <td className="text-right">{row.total_turnover}</td>
                          <td className="text-right">{row.total_pl}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          {loading ? "Loading..." : "There are no records to show"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* 🔹 PAGINATION */}
              {/* <div className="row pt-3">
                <div className="col">
                  <ul className="pagination pagination-rounded mb-0 float-right">

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
              </div> */}

            </div>
          </div>
        </div>
      </div >
    </div >
  );
};

export default Turnover;