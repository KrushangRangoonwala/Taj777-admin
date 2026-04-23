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
import { Table } from 'react-bootstrap';
import { errorToast, successToast } from '../../utils/toast';


const TotalProfitLoss = () => {

  const [loading, setLoading] = useState(false);

  const [clientSearch, setClientSearch] = useState('');
  const [clientList, setClientList] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');

  const [fromDate, setFromDate] = useState(dayjs().subtract(7, "day"));
  const [toDate, setToDate] = useState(dayjs());
  const [search, setSearch] = useState('');

  const [type, setType] = useState("0");

  const [data, setData] = useState({
    sports: [],
    casino: [],
    third_party: [],
    sportbook: []
  });

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
        per_page: 1000,
        search: search,
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
                    errorToast("Sorry for inconvenience! You will see statement of 10 days date range in 3 months timeslot.");
                    return;
                  }

                  fetchData();

                }}>

                  <div className="row row5">

                    {/* CLIENT SEARCH */}
                    <div className="col-lg-3">
                      <div className="form-group user-lock-search mb-4px-plus" style={{ position: "relative" }}>
                        <label>Search By Client Name</label>
                        <input
                          type="search"
                          className="form-control"
                          placeholder="Select option"
                          value={clientSearch}
                          onChange={(e) => {
                            setClientSearch(e.target.value);
                            fetchClients(e.target.value);
                          }}
                        />
                        {/* <Select
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
                          onInputChange={(value) => {
                            setClientSearch(value);
                            fetchClients(value);
                          }}
                          styles={customSelectStyles}
                        /> */}


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
                        className="date-input ant_custom_date"
                        value={[fromDate, toDate]}
                        format="DD/MM/YYYY"
                        style={{ width: "100%" }}

                        onCalendarChange={(dates) => {
                          if (dates && dates[0]) {
                            const start = dates[0];

                            let autoEnd = start.add(10, "day");

                            // ❌ prevent future date
                            if (autoEnd.isAfter(dayjs())) {
                              autoEnd = dayjs();
                            }

                            setFromDate(start);
                            setToDate(autoEnd);
                          }
                        }}

                        onChange={(dates) => {
                          if (dates) {
                            setFromDate(dates[0]);
                            setToDate(dates[1]);
                          } else {
                            setFromDate(null);
                            setToDate(null);
                          }
                        }}

                        disabledDate={(current) => {
                          return current.isAfter(dayjs(), "day");
                        }}
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
                    <div className="col-lg-3 ml-3px-child">
                      <button type="submit" className="btn btn-primary">Load</button>

                      <button type="button" className="btn btn-light" onClick={handleReset}>
                        Reset
                      </button>

                      <button type="button" className="btn btn-success" disabled={!isDataAvailable} onClick={exportToExcel} style={{ marginLeft: "4px" }}>
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

              {/* TOP BAR */}
              <div className="row">
                <div className="col-6">

                </div>

                <div className="col-6 text-right">
                  <div id="tickets-table_filter" className="dataTables_filter text-md-right">
                    <label className="d-inline-flex align-items-center">
                      <input
                        type="search"
                        placeholder="Search..."
                        className="form-control form-control-sm ml-2"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyUp={(e) => { fetchData(1) }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* ================= TABLES ================= */}

              {/* SPORTS */}
              {(type === "0" || type === "2") && (
                <>
                  <h4>Sports Report</h4>
                  <div className="table-responsive">
                    <div className="table no-footer table-responsive-sm">
                      <Table role="table" aria-busy="false" aria-colcount="5" className="b-table" bordered hover>
                        <thead role="rowgroup">
                          <tr role="row">
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'eventName' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('eventName')}>
                              <div>Event Name</div><span className="sr-only"> (Click to sort {getSortValueText('eventName')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'gameType' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('gameType')}>
                              <div>Game Type</div><span className="sr-only"> (Click to sort {getSortValueText('gameType')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'opening' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('opening')}>
                              <div>Opening</div><span className="sr-only"> (Click to sort {getSortValueText('opening')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'closing' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('closing')}>
                              <div>Closing</div><span className="sr-only"> (Click to sort {getSortValueText('closing')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'pl' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('pl')}>
                              <div>Profit/Loss</div><span className="sr-only"> (Click to sort {getSortValueText('pl')})</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody role="rowgroup">
                          {data.sports.length > 0 ? (
                            data.sports.map((row, i) => (
                              <tr key={i} role="row" tabIndex="0" className="nocursor">
                                <td role="cell">{row.event_name}</td>
                                <td role="cell">{row.game_type}</td>
                                <td role="cell" className="text-right">{row.opening}</td>
                                <td role="cell" className="text-right">{row.closing}</td>
                                <td role="cell" className="text-right">{row.pl}</td>
                              </tr>
                            ))
                          ) : (
                            <tr role="row" className="b-table-empty-row">
                              <td colSpan="5" role="cell">
                                <div role="alert" aria-live="polite">
                                  <div className="text-center my-2">There are no records to show</div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot>
                          <tr role="row">
                            <td colSpan="4" className="text-right" role="cell"><strong>Total Profit/Loss</strong></td>
                            <td className="text-right" role="cell"><strong>{getTotalPL(data.sports)}</strong></td>
                          </tr>
                        </tfoot>
                      </Table>
                    </div>
                  </div>
                </>

              )}

              {/* CASINO */}
              {(type === "0" || type === "3") && (
                <>
                  <h4>Casino Report</h4>
                  <div className="table-responsive">
                    <div className="table no-footer table-responsive-sm">
                      <Table role="table" aria-busy="false" aria-colcount="4" className="b-table" bordered hover>
                        <thead role="rowgroup">
                          <tr role="row">
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'casinoName' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('casinoName')}>
                              <div>Casino Name</div><span className="sr-only"> (Click to sort {getSortValueText('casinoName')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'casinoOpening' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('casinoOpening')}>
                              <div>Opening</div><span className="sr-only"> (Click to sort {getSortValueText('casinoOpening')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'casinoClosing' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('casinoClosing')}>
                              <div>Closing</div><span className="sr-only"> (Click to sort {getSortValueText('casinoClosing')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'casinoPL' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('casinoPL')}>
                              <div>Profit/Loss</div><span className="sr-only"> (Click to sort {getSortValueText('casinoPL')})</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody role="rowgroup">
                          {data.casino.length > 0 ? (
                            data.casino.map((row, i) => (
                              <tr key={i} role="row" tabIndex="0" className="nocursor">
                                <td role="cell">{row.name}</td>
                                <td role="cell" className="text-right">{row.opening}</td>
                                <td role="cell" className="text-right">{row.closing}</td>
                                <td role="cell" className="text-right">{row.pl}</td>
                              </tr>
                            ))
                          ) : (
                            <tr role="row" className="b-table-empty-row">
                              <td colSpan="4" role="cell">
                                <div role="alert" aria-live="polite">
                                  <div className="text-center my-2">There are no records to show</div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot>
                          <tr role="row">
                            <td colSpan="3" className="text-right" role="cell"><strong>Total Profit/Loss</strong></td>
                            <td className="text-right" role="cell"><strong>{getTotalPL(data.casino)}</strong></td>
                          </tr>
                        </tfoot>
                      </Table>
                    </div>
                  </div>

                </>
              )}

              {/* THIRD PARTY */}
              {(type === "0" || type === "4") && (
                <>
                  <h4>Third Party Report</h4>
                  <div className="table-responsive">
                    <div className="table no-footer table-responsive-sm">
                      <Table role="table" aria-busy="false" aria-colcount="4" className="b-table" bordered hover>
                        <thead role="rowgroup">
                          <tr role="row">
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'ThirdPartyName' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('ThirdPartyName')}>
                              <div>Third Party Name</div><span className="sr-only"> (Click to sort {getSortValueText('ThirdPartyName')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'ThirdPartyOpening' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('ThirdPartyOpening')}>
                              <div>Opening</div><span className="sr-only"> (Click to sort {getSortValueText('ThirdPartyOpening')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'ThirdPartyClosing' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('ThirdPartyClosing')}>
                              <div>Closing</div><span className="sr-only"> (Click to sort {getSortValueText('ThirdPartyClosing')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'ThirdPartyPL' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('ThirdPartyPL')}>
                              <div>Profit/Loss</div><span className="sr-only"> (Click to sort {getSortValueText('ThirdPartyPL')})</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody role="rowgroup">
                          {data.third_party.length > 0 ? (
                            data.third_party.map((row, i) => (
                              <tr key={i} role="row" tabIndex="0" className="nocursor">
                                <td role="cell">{row.name}</td>
                                <td role="cell" className="text-right">{row.opening}</td>
                                <td role="cell" className="text-right">{row.closing}</td>
                                <td role="cell" className="text-right">{row.pl}</td>
                              </tr>
                            ))
                          ) : (
                            <tr role="row" className="b-table-empty-row">
                              <td colSpan="4" role="cell">
                                <div role="alert" aria-live="polite">
                                  <div className="text-center my-2">There are no records to show</div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot>
                          <tr role="row">
                            <td colSpan="3" className="text-right" role="cell"><strong>Total Profit/Loss</strong></td>
                            <td className="text-right" role="cell"><strong>{getTotalPL(data.third_party)}</strong></td>
                          </tr>
                        </tfoot>
                      </Table>
                    </div>
                  </div>

                </>
              )}

              {/* THIRD PARTY */}
              {(type === "0" || type === "5") && (
                <>
                  <h4>Sportbook Report</h4>
                  <div className="table-responsive">
                    <div className="table no-footer table-responsive-sm">
                      <Table role="table" aria-busy="false" aria-colcount="4" className="b-table" bordered hover>
                        <thead role="rowgroup">
                          <tr role="row">
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'SportbookName' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('SportbookName')}>
                              <div>Sportbook Name</div><span className="sr-only"> (Click to sort {getSortValueText('SportbookName')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'SportbookOpening' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('SportbookOpening')}>
                              <div>Opening</div><span className="sr-only"> (Click to sort {getSortValueText('SportbookOpening')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'SportbookClosing' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('SportbookClosing')}>
                              <div>Closing</div><span className="sr-only"> (Click to sort {getSortValueText('SportbookClosing')})</span>
                            </th>
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'SportbookPL' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('SportbookPL')}>
                              <div>Profit/Loss</div><span className="sr-only"> (Click to sort {getSortValueText('SportbookPL')})</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody role="rowgroup">
                          {data.sportbook.length > 0 ? (
                            data.sportbook.map((row, i) => (
                              <tr key={i} role="row" tabIndex="0" className="nocursor">
                                <td role="cell">{row.name}</td>
                                <td role="cell" className="text-right">{row.opening}</td>
                                <td role="cell" className="text-right">{row.closing}</td>
                                <td role="cell" className="text-right">{row.pl}</td>
                              </tr>
                            ))
                          ) : (
                            <tr role="row" className="b-table-empty-row">
                              <td colSpan="4" role="cell">
                                <div role="alert" aria-live="polite">
                                  <div className="text-center my-2">There are no records to show</div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot>
                          <tr role="row">
                            <td colSpan="3" className="text-right" role="cell"><strong>Total Profit/Loss</strong></td>
                            <td className="text-right" role="cell"><strong>{getTotalPL(data.sportbook)}</strong></td>
                          </tr>
                        </tfoot>
                      </Table>
                    </div>
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