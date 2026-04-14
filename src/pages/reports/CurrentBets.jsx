import React, { useEffect, useState } from "react";
import { getCurrentBets, getClients } from '../../api/API';
import { DatePicker } from "antd";
import "antd/dist/reset.css";
import dayjs from "dayjs";
import { Table } from 'react-bootstrap';


const { RangePicker } = DatePicker;

const CurrentBets = () => {
  const [data, setData] = useState([]);
  const [sportType, setSportType] = useState("sport");
  const [filteredData, setFilteredData] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [fromDate, setFromDate] = useState(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 25;

  const [matchDeleted, setMatchDeleted] = useState("matchbet");
  const [betType, setBetType] = useState("all");

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


  // 🔹 Fetch profit-loss
  const fetchProfitLoss = async () => {
    try {
      const payload = {
        from_date: fromDate,
        to_date: toDate,
        sport_type: sportType,
        backlay: betType, // back / lay / all
        bet_type:
          matchDeleted === "deletebet"
            ? "deleted"
            : matchDeleted === "matchbet"
            ? ""
            : ""
      };

      const res = await getCurrentBets(payload);

      if (res.result) {
        // Add serial numbers for table
        const numbered = res.result.map((item, index) => ({
          sr_no: index + 1,
          ...item
        }));
        setData(numbered);
        setFilteredData(numbered);
        setCurrentPage(1);
      } else {
        setData([]);
        setFilteredData([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    /* fetchProfitLoss(); */
  }, []);

  useEffect(() => {
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
    setCurrentPage(1);

  }, [search, data, sortColumn, sortDirection]);

  // 🔹 Pagination
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / perPage);
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
                    <a href="/admin/home" target="_self">Home</a>
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
                            name="example"
                            value="matchbet"
                            checked={matchDeleted === "matchbet"}
                            onChange={(e) => setMatchDeleted(e.target.value)}
                            className="custom-control-input"
                          />
                          <label htmlFor="customRadio" className="custom-control-label">Matched</label>
                        </div>

                        <div className="custom-control custom-radio custom-control-inline">
                          <input
                            type="radio"
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

                  <div className="col-md-8 col-lg-4 d-flex">
                    <div className="custom-control custom-radio custom-control-inline pl-0">

                      <div className="custom-control custom-radio custom-control-inline">
                        <input
                          type="radio"
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

                      <div id="export_1774524830826" className="d-inline-block disabled">
                        <button type="button" disabled className="btn mr-1 btn-success disabled">
                          <i className="fas fa-file-excel"></i>
                        </button>
                      </div>

                      <button type="button" disabled className="btn btn-danger disabled">
                        <i className="fas fa-file-pdf"></i>
                      </button>
                    </div>
                  </div>

                  <div className="col-md-12 col-lg-5 text-right">
                    <div className="custom-control-inlinemr-0 mt-1">
                      <h5>
                        Total Soda: <span className="mr-2">0</span> Total Amount: <span>0</span>
                      </h5>
                    </div>
                  </div>

                </div>

                <div className="row w-100">
                  <div className="col-6">
                    <div className="dataTables_length">
                      <label className="d-inline-flex align-items-center">
                        Show&nbsp;
                        <select className="custom-select custom-select-sm">
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
                        <input type="search" placeholder="Search..." className="form-control form-control-sm ml-2 form-control" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="table-responsive mb-0">
                  <div className="table no-footer table-responsive-sm">
                    <Table id="currentBetsTable" role="table" aria-busy="false" aria-colcount={sportType === "sport" ? 11 : 9} className="b-table" bordered>
                      <colgroup>
                        <col style={{ width: "auto" }} />
                        <col style={{ width: "200px" }} />
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
                            <tr key={index} role="row" tabIndex="0" className="nocursor">
                              {sportType === "sport" && <td>{row.eventType}</td>}
                              <td>{row.event_name}</td>
                              <td>{row.user_name}</td>
                              {sportType === "sport" && <td>{row.market_name}</td>}
                              <td>{row.nation}</td>
                              <td className="text-right">{row.user_rate}</td>
                              <td className="text-right">{row.amount}</td>
                              <td>{dayjs(row.created_at).format("DD/MM/YYYY HH:mm:ss")}</td>
                              <td>{row.ip}</td>
                              <td>{row.browser}</td>
                              <td role="cell"></td>
                            </tr>
                          ))
                        ) : (
                          <tr role="row" className="b-table-empty-row">
                            <td colSpan={sportType === "sport" ? 11 : 9} role="cell">
                              <div role="alert" aria-live="polite">
                                <div className="text-center my-2">There are no records to show</div>
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
                        <li className="page-item disabled">
                          <span className="page-link">«</span>
                        </li>
                        <li className="page-item disabled">
                          <span className="page-link">‹</span>
                        </li>
                        <li className="page-item active">
                          <button type="button" className="page-link">1</button>
                        </li>
                        <li className="page-item disabled">
                          <span className="page-link">›</span>
                        </li>
                        <li className="page-item disabled">
                          <span className="page-link">»</span>
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