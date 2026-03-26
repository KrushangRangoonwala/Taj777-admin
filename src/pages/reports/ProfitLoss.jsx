import React, { useEffect, useState } from "react";
import { getProfitLoss, getClients } from '../../api/API';
import { DatePicker } from "antd";
import "antd/dist/reset.css";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const ProfitLoss = () => {
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

      const res = await getProfitLoss(payload);

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
    <div data-v-5a10e370="">
      <div data-v-5a10e370="">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-flex align-items-center justify-content-between">
              <h4 className="mb-0 font-size-18">Party Win Loss</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <a href="/admin/home" target="_self">Home</a>
                  </li>
                  <li className="breadcrumb-item active">
                    <span aria-current="location">Profit Loss</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* 🔹 Filters */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <form>
                  <div className="row row5">
                    <div className="form-group col-md-3">
                      <select
                        className="custom-select"
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                      >
                        <option value="">All</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group col-md-9">
                      <button type="button" className="btn btn-primary" onClick={fetchProfitLoss}>
                        Load
                      </button>{" "}
                      <button
                        type="button"
                        id="reset"
                        className="btn btn-light"
                        onClick={() => {
                          setSelectedClient("");
                          setFromDate(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
                          setToDate(dayjs().format("YYYY-MM-DD"));
                          setSearch("");
                          fetchProfitLoss();
                        }}
                      >
                        Reset
                      </button>
                        <div id="export_1774426765439" class="d-inline-block">
                            <button type="button" className="btn btn-success">
                            <i className="fas fa-file-excel"></i>
                            </button>
                        </div>
                        <button type="button" className="btn btn-danger">
                            <i className="fas fa-file-pdf"></i>
                        </button>
                    </div>
                  </div>
                </form>

                <div className="row">
                  <div className="col-sm-12 col-md-12">
                    <div id="tickets-table_filter" className="dataTables_filter text-md-right">
                      <label className="d-inline-flex align-items-center">
                        Search:
                        <input
                          type="search"
                          placeholder="Search..."
                          className="form-control form-control-sm ml-2"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="table-responsive mb-0">
                  <table className="table b-table table-hover table-bordered">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>User Name</th>
                        <th>Level</th>
                        <th className="text-right">Casino pts</th>
                        <th className="text-right">Sport pts</th>
                        <th className="text-right">Third Party pts</th>
                        <th className="text-right">Profit/Loss</th>
                        <th>Ptype</th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentData.length > 0 ? (
                        currentData.map((row, idx) => (
                          <tr key={idx}>
                            <td>{row.sr_no}</td>
                            <td>{row.Email_ID}</td>
                            <td>{row.role_name}</td>
                            <td className="text-right">{row.casino_amount.toFixed(2)}</td>
                            <td className="text-right">{row.sports_amount.toFixed(2)}</td>
                            <td className="text-right">0.00</td>
                            <td className="text-right">{row.total_amount.toFixed(2)}</td>
                            <td>-</td>
                          </tr>
                        ))
                      ) : (
                        <tr className="b-table-empty-row">
                          <td colSpan="8" className="text-center">
                            <div role="alert" aria-live="polite">
                              <div className="text-center my-2">There are no records to show</div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>

                    <tfoot>
                      <tr>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th className="text-right">{filteredData.reduce((a,b)=>a+b.casino_amount,0).toFixed(2)}</th>
                        <th className="text-right">{filteredData.reduce((a,b)=>a+b.sports_amount,0).toFixed(2)}</th>
                        <th className="text-right">0.00</th>
                        <th className="text-right">{filteredData.reduce((a,b)=>a+b.total_amount,0).toFixed(2)}</th>
                        <th></th>
                      </tr>
                    </tfoot>
                  </table>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLoss;