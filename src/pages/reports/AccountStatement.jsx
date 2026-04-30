import React, { useEffect, useState } from 'react';
import { getAccountStatement } from '../../api/API';

import { DatePicker } from "antd";
import "antd/dist/reset.css"; // AntD 5+ reset styles
import dayjs from "dayjs";
const { RangePicker } = DatePicker;
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Table } from 'react-bootstrap';
import { getNoRecordText } from '../../utilies/helpers';
import SelectBootStrap from '../../components/SelectBootStrap';
import { Link } from 'react-router-dom';


const AccountStatement = () => {

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [selectedClient, setSelectedClient] = useState('');


  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState("2");        // default selected
  const [statement, setStatement] = useState("all");

  const [fromDate, setFromDate] = useState(
    new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('none');

  const isDataAvailable = data && data.length > 0;



  // 🔹 Fetch statement
  const fetchStatement = async (page = currentPage) => {
    try {
      setLoading(true);

      const payload = {
        client_name: selectedClient?.value,
        from_date: fromDate ? new Date(fromDate).toISOString().split("T")[0] : "",
        to_date: toDate ? new Date(toDate).toISOString().split("T")[0] : "",
        report_type: type,
        game_name: statement,
        search: search,
        page: page,
        per_page: perPage
      };

      const res = await getAccountStatement(payload);

      // 🔥 Handle response safely
      const result =
        res?.data ||   // if API returns { data: [...] }
        res?.result || // fallback
        res || [];     // direct array case

      setData(result);
      setFilteredData(result);
      setTotalRecords(res?.total || 0);
      setCurrentPage(page);

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  /* useEffect(() => {
    fetchStatement();
  }, []); */

  // 🔹 Global search filter
  /* useEffect(() => {
    let temp = [...data];

    if (search) {
      temp = temp.filter((item) =>
        Object.values(item).join(' ').toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredData(temp);
    setCurrentPage(1);

  }, [search, data]); */

  // 🔹 Pagination
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(totalRecords / perPage) || 1;

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchStatement(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    // adjust start if near end
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages?.length > 0 ? pages : [1];
  };

  const handleSort = (colIndex) => {
    if (sortColumn === colIndex) {
      if (sortDirection === 'none') {
        setSortDirection('ascending');
      } else if (sortDirection === 'ascending') {
        setSortDirection('descending');
      } else {
        setSortDirection('ascending');
      }
    } else {
      setSortColumn(colIndex);
      setSortDirection('ascending');
    }
  };

  const getSortValueText = (colIndex) => {
    const currentDirection = sortColumn === colIndex ? sortDirection : 'none';
    if (currentDirection === 'none') return 'ascending';
    if (currentDirection === 'ascending') return 'descending';
    if (currentDirection === 'descending') return 'ascending';
    return 'ascending';
  };

  const exportToExcel = () => {
    const formattedData = data.map((row, index) => ({
      Date: new Date(row.created_at * 1000).toLocaleString(),
      "Sr No": index + 1,
      Credit: row.account_entryType == 1 ? row.account_amount : '',
      Debit: row.account_entryType == 2 ? row.account_amount : '',
      Balance: row.balance,
      Remark: row.remark,
      FromTo: row.from_to
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Statement");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "Account_Statement.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableData = data.map((row, index) => ([
      new Date(row.created_at * 1000).toLocaleString(),
      index + 1,
      row.account_entryType == 1 ? row.account_amount : '',
      row.account_entryType == 2 ? row.account_amount : '',
      row.balance,
      row.remark,
      row.from_to
    ]));

    autoTable(doc, {
      head: [['Date', 'Sr No', 'Credit', 'Debit', 'Balance', 'Remark', 'FromTo']],
      body: tableData,
    });

    doc.save("Account_Statement.pdf");
  };

  return (
    <div>
      <div>
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-flex align-items-center justify-content-between">
              <h4 className="mb-0 font-size-18">Account Statement</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <Link to="/admin/home">Home</Link>
                  </li>
                  <li className="breadcrumb-item active">
                    <span>Account Statement</span>
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

                {/* 🔍 FILTER */}
                <div className="report-form mb-3">
                  <form onSubmit={(e) => { e.preventDefault(); fetchStatement(); }}>
                    <div className="row row5">

                      {/* CLIENT SEARCH */}
                      <div className="col-lg-3">
                        <div className="form-group user-lock-search" style={{ position: "relative" }}>
                          <label>Search By Client Name</label>
                          <SelectBootStrap
                            selectedOption={selectedClient}
                            setSelectedOption={setSelectedClient}
                            fetchType="client"
                          />
                        </div>
                      </div>

                      {/* DATE RANGE */}
                      <div className="col-lg-3">
                        <label>Select Date Range</label>
                        <div className="mb-3">
                          <RangePicker
                            className="ant_custom_date custom-range-picker date-input"
                            value={
                              fromDate && toDate
                                ? [dayjs(fromDate), dayjs(toDate)]
                                : []
                            }
                            onChange={(dates) => {
                              if (dates) {
                                setFromDate(dates[0].toDate());
                                setToDate(dates[1].toDate());
                              } else {
                                setFromDate(null);
                                setToDate(null);
                              }
                            }}
                            format="DD/MM/YYYY"
                            style={{ width: "100%" }}
                            suffixIcon={
                              <span style={{ pointerEvents: "none" }}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 1024 1024"
                                  width="1em"
                                  height="1em"
                                  fill="currentColor"
                                >
                                  <path d="M940.218182 107.054545h-209.454546V46.545455h-65.163636v60.50909H363.054545V46.545455H297.890909v60.50909H83.781818c-18.618182 0-32.581818 13.963636-32.581818 32.581819v805.236363c0 18.618182 13.963636 32.581818 32.581818 32.581818h861.090909c18.618182 0 32.581818-13.963636 32.581818-32.581818V139.636364c-4.654545-18.618182-18.618182-32.581818-37.236363-32.581819zM297.890909 172.218182V232.727273h65.163636V172.218182h307.2V232.727273h65.163637V172.218182h176.872727v204.8H116.363636V172.218182h181.527273zM116.363636 912.290909V442.181818h795.927273v470.109091H116.363636z" />
                                </svg>
                              </span>
                            }
                          />
                        </div>
                      </div>

                      {/* KEEP SAME DROPDOWNS */}
                      <div className="col-lg-2">
                        <div className="form-group">
                          <label>Type</label>
                          <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="2">Deposit/Withdraw Report</option>
                            <option value="4">Sports Report</option>
                            <option value="5">Casino Report</option>
                            <option value="6">Third Party Casino Report</option>
                            <option value="1">Sportbook</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-lg-2">
                        <div className="form-group">
                          <label>Statement</label>
                          <select className="form-control" value={statement} onChange={(e) => setStatement(e.target.value)}>
                            <option value="all">All</option>
                            <option value="credit_all">Credit - All</option>
                            <option value="credit_upper">Credit - Upper</option>
                            <option value="credit_down">Credit - Down</option>
                            <option value="pts_all">pts - All</option>
                            <option value="pts_upper">pts - Upper</option>
                            <option value="pts_down">pts - Down</option>
                          </select>
                        </div>
                      </div>

                    </div>

                    <div className="row row5">
                      <div className="col-lg-3">
                        <button type="submit" className="btn btn-primary">Load</button>{' '}
                        <button type="button" className="btn btn-light"
                          onClick={() => {
                            setSelectedClient([]);
                            setFromDate(null);
                            setToDate(null);
                            setSearch('');
                            setData([]);
                            setFilteredData([]);
                            setTotalRecords(0);
                            setCurrentPage(1);
                          }}
                        >
                          Reset
                        </button>{' '}
                        <div id="export_1774426765439" className="d-inline-block">
                          <button
                            type="button"
                            className="btn btn-success"
                            disabled={!isDataAvailable}
                            onClick={exportToExcel}
                          >
                            <i className="fas fa-file-excel"></i>
                          </button>
                        </div>{' '}
                        <button
                          type="button"
                          className="btn btn-danger"
                          disabled={!isDataAvailable}
                          onClick={exportToPDF}
                        >
                          <i className="fas fa-file-pdf"></i>
                        </button>{' '}
                      </div>
                    </div>
                  </form>
                </div>

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
                          className="form-control form-control-sm ml-2"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          onKeyUp={(e) => { fetchStatement(1) }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* TABLE */}
                <div className="table-responsive mb-0">
                  <div className="table no-footer table-hover table-responsive-sm">
                    <Table id="accStmtTable" role="table" aria-busy="false" aria-colcount="7" className="b-table" bordered>
                      <colgroup>
                        <col style={{ width: "auto" }} />
                        <col style={{ width: "100px" }} />
                        <col style={{ width: "auto" }} />
                        <col style={{ width: "auto" }} />
                        <col style={{ width: "auto" }} />
                        <col style={{ width: "350px" }} />
                        <col style={{ width: "auto" }} />
                      </colgroup>
                      <thead role="rowgroup">
                        <tr role="row">
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="1" aria-sort={sortColumn === 1 ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort(1)}>
                            <div>Date</div><span className="sr-only"> (Click to sort {getSortValueText(1)})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="2" aria-sort={sortColumn === 2 ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort(2)}>
                            <div>Sr No</div><span className="sr-only"> (Click to sort {getSortValueText(2)})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="3" aria-sort={sortColumn === 3 ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort(3)}>
                            <div>Credit</div><span className="sr-only"> (Click to sort {getSortValueText(3)})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="4" aria-sort={sortColumn === 4 ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort(4)}>
                            <div>Debit</div><span className="sr-only"> (Click to sort {getSortValueText(4)})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="5" aria-sort={sortColumn === 5 ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort(5)}>
                            <div>pts</div><span className="sr-only"> (Click to sort {getSortValueText(5)})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="6" aria-sort={sortColumn === 6 ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort(6)}>
                            <div>Remark</div><span className="sr-only"> (Click to sort {getSortValueText(6)})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="7" aria-sort={sortColumn === 7 ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort(7)}>
                            <div>Fromto</div><span className="sr-only"> (Click to sort {getSortValueText(7)})</span>
                          </th>
                        </tr>
                      </thead>

                      <tbody role="rowgroup">
                        {data.length > 0 ? (
                          data.map((row, index) => (
                            <tr key={index} role="row" tabIndex="0" aria-rowindex={indexOfFirst + index + 1} className="nocursor">
                              <td aria-colindex="1" role="cell">
                                {new Date(row.created_at * 1000).toLocaleString()}
                              </td>
                              <td aria-colindex="2" role="cell">
                                <div className="text-right">{indexOfFirst + index + 1}</div>
                              </td>
                              <td aria-colindex="3" role="cell">
                                <div className="text-right text-success">
                                  <span>{row.account_entryType == 1 ? Number(row.account_amount).toLocaleString('en-IN') : ''}</span>
                                </div>
                              </td>
                              <td aria-colindex="4" role="cell">
                                <div className={row.account_entryType == 2 ? "text-right text-danger" : "text-right"}>
                                  <span>{row.account_entryType == 2 ? Number(row.account_amount).toLocaleString('en-IN') : ''}</span>
                                </div>
                              </td>
                              <td aria-colindex="5" role="cell">
                                <div className="text-right text-success">
                                  <span>{Number(row.balance).toLocaleString('en-IN')}</span>
                                </div>
                              </td>
                              <td aria-colindex="6" role="cell">
                                <div>{row.remark}</div>
                              </td>
                              <td aria-colindex="7" role="cell">
                                {row.from_to}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr role="row" className="b-table-empty-row">
                            <td colSpan="7" role="cell">
                              <div role="alert" aria-live="polite">
                                <div className="text-center my-2">{getNoRecordText(search)}</div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </div>


                {/* PAGINATION */}
                <div className="row pt-3">
                  <div className="col">
                    <ul className="pagination pagination-rounded mb-0 float-right">

                      <li className={`page-item ${currentPage === 1 && 'disabled'}`}>
                        <button className="page-link" onClick={() => changePage(1)}>«</button>
                      </li>

                      <li className={`page-item ${currentPage === 1 && 'disabled'}`}>
                        <button className="page-link" onClick={() => changePage(currentPage - 1)}>‹</button>
                      </li>

                      {/*  {[...Array(totalPages)].map((_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => changePage(i + 1)}>
                            {i + 1}
                          </button>
                        </li>
                      ))} */}

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
  );
};

export default AccountStatement;