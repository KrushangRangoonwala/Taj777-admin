import React, { useState } from 'react';
import { DatePicker } from "antd";
import "antd/dist/reset.css";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;
import { getClients, getTotalProfitLoss } from '../../api/API';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Select from 'react-select';
import { customSelectStyles } from '../../components/Header';

const TotalProfitLoss = () => {

  const [loading, setLoading] = useState(false);

  const [clientSearch, setClientSearch] = useState('');
  const [clientList, setClientList] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');

  const [fromDate, setFromDate] = useState(dayjs().subtract(7, "day"));
  const [toDate, setToDate] = useState(dayjs());

  const [type, setType] = useState("0");

  const [data, setData] = useState({
    sports: [],
    casino: [],
    third_party: [],
    sportbook: []
  });

  const isDataAvailable =
    data.sports.length ||
    data.casino.length ||
    data.third_party.length ||
    data.sportbook.length;

  /* ================= CLIENT SEARCH ================= */
  const fetchClients = async (value) => {
    try {
      const res = await getClients(value);
      setClientList(res.results || []);
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= TOTAL CALC ================= */
  const getTotalPL = (arr) => {
    return arr.reduce((sum, item) => sum + Number(item.pl || 0), 0).toFixed(2);
  };

  /* ================= MAIN API ================= */
  const fetchData = async () => {
    try {
      setLoading(true);

      const payload = {
        selected_user_id: selectedClient,
        selected_type:
          type === "2" ? "sports" :
            type === "3" ? "casino" :
              "all",
        from_date: fromDate.format("YYYY-MM-DD"),
        to_date: toDate.format("YYYY-MM-DD"),
        page: 1,
        per_page: 1000
      };

      const res = await getTotalProfitLoss(payload);

      const result = res?.data || [];

      /* ================= MAP DATA ================= */
      const sports = [];
      const casino = [];

      result.forEach((row) => {
        const obj = {
          event_name: row.sport_name || row.event_type,
          game_type: row.market_type,
          opening: row.opening,
          closing: row.closing,
          pl: row.profit_loss
        };

        if (row.market_type === "CASINO") {
          casino.push({
            name: obj.event_name,
            opening: obj.opening,
            closing: obj.closing,
            pl: obj.pl
          });
        } else {
          sports.push(obj);
        }
      });

      setData({
        sports,
        casino,
        third_party: [],   // API not returning yet
        sportbook: []      // API not returning yet
      });

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setClientSearch('');
    setSelectedClient('');
    setFromDate(dayjs().subtract(7, "day"));
    setToDate(dayjs());
    setType("0");
    setData({
      sports: [],
      casino: [],
      third_party: [],
      sportbook: []
    });
  };

  const exportToExcel = () => {
    let excelData = [];

    // Sports
    data.sports.forEach((row) => {
      excelData.push({
        Type: "Sports",
        Name: row.event_name,
        GameType: row.game_type,
        Opening: row.opening,
        Closing: row.closing,
        ProfitLoss: row.pl
      });
    });

    // Casino
    data.casino.forEach((row) => {
      excelData.push({
        Type: "Casino",
        Name: row.name,
        GameType: "-",
        Opening: row.opening,
        Closing: row.closing,
        ProfitLoss: row.pl
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TotalPL");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([buffer], { type: "application/octet-stream" });

    saveAs(file, "Total_Profit_Loss.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    let rows = [];

    data.sports.forEach((row) => {
      rows.push([
        "Sports",
        row.event_name,
        row.game_type,
        row.opening,
        row.closing,
        row.pl
      ]);
    });

    data.casino.forEach((row) => {
      rows.push([
        "Casino",
        row.name,
        "-",
        row.opening,
        row.closing,
        row.pl
      ]);
    });

    autoTable(doc, {
      head: [["Type", "Name", "Game Type", "Opening", "Closing", "P/L"]],
      body: rows
    });

    doc.save("Total_Profit_Loss.pdf");
  };

  return (
    <div>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-flex align-items-center justify-content-between">
            <h4 className="mb-0 font-size-18">Total Profit Loss</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <a href="/admin/home">Home</a>
                </li>
                <li className="breadcrumb-item active">
                  <span>Total Profit Loss</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* FORM */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">

              <div className="report-form mb-3">
                <form onSubmit={(e) => {
                  e.preventDefault(); if (!fromDate || !toDate) return;

                  const diffDays = toDate.diff(fromDate, "day") + 1;

                  if (diffDays > 10) {
                    alert("You can see maximum 10 days of data only");
                    return;
                  }

                  fetchData();

                }}>

                  <div className="row row5">

                    {/* CLIENT SEARCH */}
                    <div className="col-lg-3">
                      <div className="form-group user-lock-search" style={{ position: "relative" }}>
                        <label>Search By Client Name</label>

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
                          value={clientSearch}
                          onChange={(e) => {
                            setClientSearch(e.target.value);
                            fetchClients(e.target.value);
                          }}
                          styles={customSelectStyles}
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

                    {/* DATE RANGE */}
                    <div className="col-lg-3">
                      <label>Select Date Range</label>
                      <RangePicker
                        value={[fromDate, toDate]}
                        onChange={(dates) => {
                          if (dates) {
                            setFromDate(dates[0]);
                            setToDate(dates[1]);
                          }
                        }}
                        format="DD/MM/YYYY"
                        style={{ width: "100%" }}
                      />
                    </div>

                    {/* TYPE */}
                    <div className="col-lg-2">
                      <div className="form-group">
                        <label>Type</label>
                        <select
                          className="form-control"
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                        >
                          <option value="0">All</option>
                          <option value="2">Sports Report</option>
                          <option value="3">Casino Report</option>
                          <option value="4">Third Party Casino Report</option>
                          <option value="5">Sportbook</option>
                        </select>
                      </div>
                    </div>

                  </div>

                  {/* BUTTONS */}
                  <div className="row row5">
                    <div className="col-lg-3">
                      <button type="submit" className="btn btn-primary">Load</button>

                      <button type="button" className="btn btn-light" onClick={handleReset}>
                        Reset
                      </button>

                      <button type="button" className="btn btn-success" disabled={!isDataAvailable} onClick={exportToExcel}>
                        <i className="fas fa-file-excel"></i>
                      </button>

                      <button type="button" className="btn btn-danger" disabled={!isDataAvailable} onClick={exportToPDF}>
                        <i className="fas fa-file-pdf"></i>
                      </button>
                    </div>
                  </div>

                </form>
              </div>

              {loading && (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <div className="spinner-border text-primary" role="status" />
                </div>
              )}

              {/* ================= TABLES ================= */}

              {/* SPORTS */}
              {(type === "0" || type === "2") && (
                <>
                  <h4>Sports Report</h4>
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Event Name</th>
                          <th>Game Type</th>
                          <th className="text-right">Opening</th>
                          <th className="text-right">Closing</th>
                          <th className="text-right">Profit/Loss</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.sports.length > 0 ? (
                          data.sports.map((row, i) => (
                            <tr key={i}>
                              <td>{row.event_name}</td>
                              <td>{row.game_type}</td>
                              <td className="text-right">{row.opening}</td>
                              <td className="text-right">{row.closing}</td>
                              <td className="text-right">{row.pl}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center">There are no records to show</td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="4" className="text-right"><strong>Total Profit/Loss</strong></td>
                          <td className="text-right"><strong>{getTotalPL(data.sports)}</strong></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              )}

              {/* CASINO */}
              {(type === "0" || type === "3") && (
                <>
                  {/* <h4>Casino Report</h4> */}
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <tbody>
                        {data.casino.length > 0 ? (
                          data.casino.map((row, i) => (
                            <tr key={i}>
                              <td>{row.name}</td>
                              <td className="text-right">{row.opening}</td>
                              <td className="text-right">{row.closing}</td>
                              <td className="text-right">{row.pl}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center">There are no records to show</td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3" className="text-right"><strong>Total Profit/Loss</strong></td>
                          <td className="text-right"><strong>{getTotalPL(data.casino)}</strong></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalProfitLoss;