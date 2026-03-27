import React, { useEffect, useState } from "react";
import { getCurrentBets, getClients } from '../../api/API';
import { DatePicker } from "antd";
import "antd/dist/reset.css";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const CurrentBets = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [fromDate, setFromDate] = useState(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 25;

  // 🔹 Fetch profit-loss
  const fetchProfitLoss = async () => {
    try {
      const payload = {
        client_name: selectedClient,
        from_date: fromDate,
        to_date: toDate,
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

  // 🔹 Fetch clients
  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients.php");
      const json = await res.json();
      setClients(json.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfitLoss();
    fetchClients();
  }, []);

  // 🔹 Global search filter
  useEffect(() => {
    let temp = [...data];
    if (search) {
      temp = temp.filter(item =>
        Object.values(item).join(" ").toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredData(temp);
    setCurrentPage(1);
  }, [search, data]);

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
              <a href="javascript:void(0)" className="nav-link active">Sports</a>
            </li>
            <li className="nav-item">
              <a href="javascript:void(0)" className="nav-link">Casino</a>
            </li>
          </ul>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">

                <div className="report-form mb-3 row align-items-center">
                  
                  <div className="col-md-4 col-lg-3">
                    <div className="custom-control custom-radio custom-control-inline">
                      <input type="radio" id="customRadio" name="example" value="matchbet" defaultChecked className="custom-control-input" />
                      <label htmlFor="customRadio" className="custom-control-label">Matched</label>
                    </div>

                    <div className="custom-control custom-radio custom-control-inline">
                      <input type="radio" id="customRadio2" name="example" value="deletebet" className="custom-control-input" />
                      <label htmlFor="customRadio2" className="custom-control-label">Deleted</label>
                    </div>
                  </div>

                  <div className="col-md-8 col-lg-4 d-flex">
                    <div className="custom-control custom-radio custom-control-inline pl-0">
                      
                      <div className="custom-control custom-radio custom-control-inline">
                        <input type="radio" id="soda-all" name="bettype" value="all" defaultChecked className="custom-control-input" />
                        <label htmlFor="soda-all" className="custom-control-label">All</label>
                      </div>

                      <div className="custom-control custom-radio custom-control-inline">
                        <input type="radio" id="soda-back" name="bettype" value="back" className="custom-control-input" />
                        <label htmlFor="soda-back" className="custom-control-label">Back</label>
                      </div>

                      <div className="custom-control custom-radio custom-control-inline">
                        <input type="radio" id="soda-lay" name="bettype" value="lay" className="custom-control-input" />
                        <label htmlFor="soda-lay" className="custom-control-label">Lay</label>
                      </div>
                    </div>

                    <div className="custom-control-inline">
                      <button title="Refresh Data" type="button" className="btn mr-2 btn-primary">
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
                    <table className="table b-table table-bordered">
                      <thead>
                        <tr>
                          <th>Event Type</th>
                          <th>Event Name</th>
                          <th>User Name</th>
                          <th>M Name</th>
                          <th>Nation</th>
                          <th className="text-right">U Rate</th>
                          <th className="text-right">Amount</th>
                          <th>Place Date</th>
                          <th>IP</th>
                          <th>Browser</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr>
                          <td colSpan="11">
                            <div className="text-center my-2">
                              There are no records to show
                            </div>
                          </td>
                        </tr>
                      </tbody>

                    </table>
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