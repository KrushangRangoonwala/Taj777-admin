import React, { useEffect, useRef, useState } from "react";
import { getCurrentBets, getClients } from '../../api/API';
import { DatePicker } from "antd";
import "antd/dist/reset.css";
import dayjs from "dayjs";
import { Table } from 'react-bootstrap';
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setIsLoading } from "../../store/slices/actionSlice";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const { RangePicker } = DatePicker;

const CurrentBets = () => {
  const isLoad = useRef(true);
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [sportType, setSportType] = useState("sport");
  const [filteredData, setFilteredData] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [fromDate, setFromDate] = useState(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [matchDeleted, setMatchDeleted] = useState("matchbet");
  const [betType, setBetType] = useState("all");

  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('none');

  const isDataAvailable = data && data.length > 0;

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


  // 🔹 Fetch profit-loss
  const fetchProfitLoss = async () => {
    dispatch(setIsLoading(true));
    try {
      const payload = {
        from_date: fromDate,
        to_date: toDate,
        sport_type: sportType,
        backlay: betType,

        page: currentPage,
        limit: perPage,

        bet_type:
          matchDeleted === "deletebet"
            ? "deleted"
            : matchDeleted === "matchbet"
              ? ""
              : ""
      };

      const res = await getCurrentBets(payload);

      if (res.result) {

        const numbered = res.result.map((item, index) => ({
          sr_no: ((currentPage - 1) * perPage) + index + 1,
          ...item
        }));

        setData(numbered);
        setFilteredData(numbered);

        setTotalPages(res.total_pages || 1);
        setTotalRecords(res.total_records || 0);

      } else{
        setData([]);
        setFilteredData([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const exportToExcel = () => {
    const formattedData = data.map((row, index) => ({
      "Sr No": row.sr_no,
      "Event Type": row.eventType || "",
      "Event Name": row.eventName || "",
      "User Name": row.userName || "",
      "M Name": row.mName || "",
      "Nation": row.nation || "",
      "U Rate": row.uRate || "",
      "Amount": row.amount || "",
      "Place Date": dayjs(row.placeDate).format("DD/MM/YYYY HH:mm:ss"),
      "IP": row.ip || "",
      "Browser": row.browser || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Current Bets");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    const file = new Blob(
      [excelBuffer],
      { type: "application/octet-stream" }
    );

    saveAs(file, "Current_Bets.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");

    const tableData = data.map((row) => ([
      row.sr_no,
      row.eventType || "",
      row.eventName || "",
      row.userName || "",
      row.mName || "",
      row.nation || "",
      row.uRate || "",
      row.amount || "",
      dayjs(row.placeDate).format("DD/MM/YYYY HH:mm:ss"),
      row.ip || "",
    ]));

    autoTable(doc, {
      head: [[
        "Sr No",
        "Event Type",
        "Event Name",
        "User",
        "M Name",
        "Nation",
        "U Rate",
        "Amount",
        "Place Date",
        "IP"
      ]],
      body: tableData,
      styles: {
        fontSize: 7
      }
    });

    doc.save("Current_Bets.pdf");
  };

  useEffect(() => {
    fetchProfitLoss();
  }, [currentPage, perPage]);

  useEffect(() => {
    isLoad.current && dispatch(setIsLoading(true));
    setTimeout(() => {
      dispatch(setIsLoading(false));
      isLoad.current = true;
    }, 400);
  }, [matchDeleted]);

  useEffect(() => {
    matchDeleted == "deletebet" && (isLoad.current = false);
    setMatchDeleted("matchbet");
    setBetType("all");
    setData([]);
    setFilteredData([]);
  }, [sportType]);

  // 🔹 Global search filter
  useEffect(() => {
    let temp = [...data];

    // 🔍 Search filter
    if (search) {
      temp = temp.filter(item =>
        Object.values(item).join(" ").toLowerCase().includes(search.toLowerCase())
      );
    }

    // 🔽 Sorting
    if (sortColumn && sortDirection !== 'none') {
      temp.sort((a, b) => {
        const valA = a[sortColumn] || '';
        const valB = b[sortColumn] || '';

        if (sortDirection === 'ascending') {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
    }

    setFilteredData(temp);
    /* setCurrentPage(1); */

  }, [search, data, sortColumn, sortDirection]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sportType, matchDeleted, betType, perPage]);

  // 🔹 Pagination
  const currentData = filteredData;
  const changePage = page => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div>
      <div>
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-flex align-items-center justify-content-between">
              <h4 className="mb-0 font-size-18">Current Bets</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <Link to="/admin/home">Home</Link>
                  </li>
                  <li className="breadcrumb-item active">
                    <span aria-current="location">Current Bets</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="casino-report-tabs">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <a
                href="javascript:void(0)"
                className={`nav-link ${sportType === "sport" ? "active" : ""}`}
                onClick={() => setSportType("sport")}
              >
                Sports
              </a>
            </li>
            <li className="nav-item">
              <a
                href="javascript:void(0)"
                className={`nav-link ${sportType === "casino" ? "active" : ""}`}
                onClick={() => setSportType("casino")}
              >
                Casino
              </a>
            </li>
          </ul>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">

                <div className="report-form mb-3 row align-items-center">

                  <div className="col-md-4 col-lg-3">
                    {sportType === "sport" && (
                      <>
                        <div className="custom-control custom-radio custom-control-inline">
                          <input
                            type="radio"
                            id="customRadio"
                            name="example"
                            value="matchbet"
                            checked={matchDeleted === "matchbet"}
                            onChange={(e) => setMatchDeleted(e.target.value)}
                            className="custom-control-input"
                          />
                          <label htmlFor="customRadio" className="custom-control-label">Matched</label>
                        </div>

                        <div className="custom-control custom-radio custom-control-inline" style={{ marginLeft: "4px" }}>
                          <input
                            type="radio"
                            id="customRadio2"
                            name="example"
                            value="deletebet"
                            checked={matchDeleted === "deletebet"}
                            onChange={(e) => setMatchDeleted(e.target.value)}
                            className="custom-control-input"
                          />
                          <label htmlFor="customRadio2" className="custom-control-label">Deleted</label>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="col-md-8 col-lg-4">
                    <div className="custom-control custom-radio custom-control-inline pl-0">

                      <div className="custom-control custom-radio custom-control-inline">
                        <input
                          type="radio"
                          id="soda-all"
                          name="bettype"
                          value="all"
                          checked={betType === "all"}
                          onChange={(e) => setBetType(e.target.value)}
                          className="custom-control-input"
                        />
                        <label htmlFor="soda-all" className="custom-control-label">All</label>
                      </div>

                      <div className="custom-control custom-radio custom-control-inline">
                        <input
                          type="radio"
                          id="soda-back"
                          name="bettype"
                          value="back"
                          checked={betType === "back"}
                          onChange={(e) => setBetType(e.target.value)}
                          className="custom-control-input"
                        />
                        <label htmlFor="soda-back" className="custom-control-label">Back</label>
                      </div>

                      <div className="custom-control custom-radio custom-control-inline">
                        <input
                          type="radio"
                          id="soda-lay"
                          name="bettype"
                          value="lay"
                          checked={betType === "lay"}
                          onChange={(e) => setBetType(e.target.value)}
                          className="custom-control-input"
                        />
                        <label htmlFor="soda-lay" className="custom-control-label">Lay</label>
                      </div>
                    </div>

                    <div className="custom-control-inline">
                      <button
                        title="Refresh Data"
                        type="button"
                        className="btn mr-2 btn-primary"
                        onClick={fetchProfitLoss}
                      >
                        Load
                      </button>

                      <div id="export_1774524830826" className="d-inline-block">

                        <button
                          type="button"
                          className="btn mr-1 btn-success"
                          disabled={!isDataAvailable}
                          onClick={exportToExcel}
                        >
                          <i className="fas fa-file-excel"></i>
                        </button>

                      </div>

                      <button
                        type="button"
                        className="btn btn-danger"
                        disabled={!isDataAvailable}
                        onClick={exportToPDF}
                      >
                        <i className="fas fa-file-pdf"></i>
                      </button>
                    </div>
                  </div>

                  <div className="col-md-12 col-lg-5 text-right">
                    <div className="custom-control-inlinemr-0 mt-1">
                      <h5>
                        Total Records: <span>{totalRecords}</span>
                      </h5>
                    </div>
                  </div>

                </div>

                <div className="row w-100">
                  <div className="col-6">
                    <div className="dataTables_length">
                      <label className="d-inline-flex align-items-center">
                        Show&nbsp;
                        <select
                            className="custom-select custom-select-sm"
                            value={perPage}
                            onChange={(e) => {
                              setPerPage(Number(e.target.value));
                              setCurrentPage(1);
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
                          field-type="search"
                          placeholder="Search..."
                          className="form-control form-control-sm ml-2 form-control"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="table-responsive mb-0">
                  <div className="table no-footer table-responsive-sm">
                    <Table id="currentBetsTable" role="table" aria-busy="false" aria-colcount={sportType === "sport" ? 11 : 9} className="b-table" bordered>
                      <colgroup>
                        {sportType === "sport"
                          ? <>
                            <col style={{ width: "auto" }} />
                            <col style={{ width: "200px" }} />
                          </>
                          : <>
                            <col style={{ width: "200px" }} />
                            <col style={{ width: "auto" }} />
                          </>}
                        <col style={{ width: "auto" }} />
                        <col style={{ width: "auto" }} />
                        <col style={{ width: "auto" }} />
                        <col style={{ width: "auto" }} />
                        <col style={{ width: "auto" }} />
                        <col style={{ width: "auto" }} />
                        <col style={{ width: "auto" }} />
                        <col style={{ width: "auto" }} />
                        <col style={{ width: "auto" }} />
                      </colgroup>
                      <thead role="rowgroup">
                        <tr role="row">
                          {sportType === "sport" && (
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'eventType' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('eventType')}>
                              <div>Event Type</div><span className="sr-only"> (Click to sort {getSortValueText('eventType')})</span>
                            </th>
                          )}
                          <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'eventName' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('eventName')}>
                            <div>Event Name</div><span className="sr-only"> (Click to sort {getSortValueText('eventName')})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'userName' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('userName')}>
                            <div>User Name</div><span className="sr-only"> (Click to sort {getSortValueText('userName')})</span>
                          </th>
                          {sportType === "sport" && (
                            <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'mName' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('mName')}>
                              <div>M Name</div><span className="sr-only"> (Click to sort {getSortValueText('mName')})</span>
                            </th>
                          )}
                          <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'nation' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('nation')}>
                            <div>Nation</div><span className="sr-only"> (Click to sort {getSortValueText('nation')})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'uRate' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('uRate')}>
                            <div>U Rate</div><span className="sr-only"> (Click to sort {getSortValueText('uRate')})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'amount' ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort('amount')}>
                            <div>Amount</div><span className="sr-only"> (Click to sort {getSortValueText('amount')})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'placeDate' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('placeDate')}>
                            <div>Place Date</div><span className="sr-only"> (Click to sort {getSortValueText('placeDate')})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'ip' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('ip')}>
                            <div>IP</div><span className="sr-only"> (Click to sort {getSortValueText('ip')})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" className="position-relative">
                            <div>Browser</div>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" className="position-relative">
                            <div>Action</div>
                          </th>
                        </tr>
                      </thead>

                      <tbody role="rowgroup">
                        {currentData.length > 0 ? (
                          currentData.map((row, index) => (
                            <tr
                                key={index}
                                role="row"
                                tabIndex="0"
                                className={`nocursor ${
                                  row.bet_type === 'Back' || row.bet_type === 'Yes'
                                    ? 'back-border'
                                    : 'lay-border'
                                }`}
                              >
                              {sportType === "sport" && <td>{row.eventType}</td>}
                              <td>{row.eventName}</td>
                              <td>{row.userName}</td>
                              {sportType === "sport" && <td>{row.mName}</td>}
                              <td>{row.nation}</td>
                              <td className="text-right">{row.uRate}</td>
                              <td className="text-right">{row.amount}</td>
                              <td>{dayjs(row.placeDate).format("DD/MM/YYYY HH:mm:ss")}</td>
                              <td>{row.ip}</td>
                              <td>
                                <span
                                  title={row.browser || "No Browser Detail"}
                                  style={{
                                    cursor: "pointer",
                                    color: "#128412"
                                  }}
                                >
                                  Detail
                                </span>
                              </td>
                              <td role="cell"></td>
                            </tr>
                          ))
                        ) : (
                          <tr role="row" className="b-table-empty-row">
                            <td colSpan={sportType === "sport" ? 11 : 9} role="cell">
                              <div role="alert" aria-live="polite">
                                <div className="text-center my-2">
                                  {search?.length ? "There are no records matching your request" : "There are no records to show"}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </div>


                <div className="row pt-3">
                  <div className="col">
                    <div className="dataTables_paginate paging_simple_numbers float-right">
                      <ul className="pagination pagination-rounded mb-0">

                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => changePage(1)}
                          >
                            «
                          </button>
                        </li>

                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => changePage(currentPage - 1)}
                          >
                            ‹
                          </button>
                        </li>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .slice(
                            Math.max(currentPage - 3, 0),
                            Math.min(currentPage + 2, totalPages)
                          )
                          .map(page => (
                            <li
                              key={page}
                              className={`page-item ${currentPage === page ? 'active' : ''}`}
                            >
                              <button
                                type="button"
                                className="page-link"
                                onClick={() => changePage(page)}
                              >
                                {page}
                              </button>
                            </li>
                          ))}

                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => changePage(currentPage + 1)}
                          >
                            ›
                          </button>
                        </li>

                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => changePage(totalPages)}
                          >
                            »
                          </button>
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

export default CurrentBets;