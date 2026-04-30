import React, { useEffect, useState } from "react";
import { getProfitLoss } from '../../api/API';
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatNumAfterDot, getNoRecordText } from "../../utilies/helpers";
import { Link } from "react-router-dom";

const ProfitLoss = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [fromDate, setFromDate] = useState(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const perPage = 25;

  // 🔹 Fetch profit-loss
  const fetchProfitLoss = async (page = 1) => {
    setLoading(true);
    try {
      const payload = {
        client_name: selectedClient?.value,
        from_date: fromDate,
        to_date: toDate,
        search_text: search,
        page,
        per_page: perPage
      };
      const res = await getProfitLoss(payload);
      const result = res?.data || [];

      setData(result);
      setFilteredData(result);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Global search filter
  useEffect(() => {
    if (!search) {
      setFilteredData(data);
      setCurrentPage(1);
      return;
    }
    const temp = data.filter(item =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    setFilteredData(temp);
    setCurrentPage(1);
  }, [search, data]);

  // 🔹 Pagination logic
  const totalPages = Math.ceil(filteredData.length / perPage);
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);
  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 🔹 Pagination helper for limited numbers like Account Statement
  const getPageNumbers = () => {
    const totalNumbers = 5; // show 5 page numbers max
    const totalBlocks = totalNumbers + 2; // including prev and next

    if (totalPages > totalBlocks) {
      let startPage = Math.max(currentPage - 2, 1);
      let endPage = startPage + totalNumbers - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = endPage - totalNumbers + 1;
      }

      return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    }

    return Array.from({ length: totalPages }, (_, i) => i + 1);
  };

  // 🔹 Export to Excel
  const exportExcel = () => {
    if (data.length === 0) return;

    const wsData = data.map(item => ({
      "No": item.sr_no,
      "User Name": item.email,
      "Level": item.role,
      "Casino pts": item.casino_amount.toFixed(2),
      "Sport pts": item.sports_amount.toFixed(2),
      "Third Party pts": "0.00",
      "Profit/Loss": item.total_amount.toFixed(2),
      "Ptype": "-"
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ProfitLoss");
    XLSX.writeFile(wb, `ProfitLoss_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
  };

  // 🔹 Export to PDF
  const exportPDF = () => {
    if (data.length === 0) return;

    const doc = new jsPDF();
    const tableColumn = ["No", "User Name", "Level", "Casino pts", "Sport pts", "Third Party pts", "Profit/Loss", "Ptype"];
    const tableRows = data.map(item => [
      item.sr_no,
      item.email,
      item.role,
      item.casino_amount.toFixed(2),
      item.sports_amount.toFixed(2),
      "0.00",
      item.total_amount.toFixed(2),
      "-"
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 }
    });
    doc.save(`ProfitLoss_${dayjs().format("YYYYMMDD_HHmmss")}.pdf`);
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
                    <Link to="/admin/home">Home</Link>
                  </li>
                  <li className="breadcrumb-item active">
                    <span aria-current="location">Profit Loss</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
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
                        <option value="1">User</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group col-md-9">
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={loading}
                        onClick={() => fetchProfitLoss(1)}
                      >
                        Load
                      </button>{" "}
                      <button
                        type="button"
                        id="reset"
                        className="btn btn-light"
                        disabled={loading}
                        onClick={() => {
                          setSelectedClient("");
                          setFromDate(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
                          setToDate(dayjs().format("YYYY-MM-DD"));
                          setSearch("");
                          setData([]);
                          setFilteredData([]);
                          setCurrentPage(1);
                        }}
                      >
                        Reset
                      </button>{" "}
                      <div id="export_1774426765439" className="d-inline-block">
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={exportExcel}
                          disabled={loading || data.length === 0}
                        >
                          <i className="fas fa-file-excel"></i>
                        </button>
                      </div>{" "}
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={exportPDF}
                        disabled={loading || data.length === 0}
                      >
                        <i className="fas fa-file-pdf"></i>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Search */}
                <div className="row">
                  <div className="col-sm-12 col-md-12">
                    <div id="tickets-table_filter" className="dataTables_filter text-md-right">
                      <label className="d-inline-flex align-items-center">
                        Search:
                        <input
                          type="search"
                          field-type="search"
                          placeholder="Search..."
                          className="form-control form-control-sm ml-2"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          onKeyUp={(e) => {
                            if (e.key === "Enter") fetchProfitLoss(1);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Table */}
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
                      {currentData.length > 0 ? currentData.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.sr_no}</td>
                          <td>{row.email}</td>
                          <td>{row.role}</td>
                          <td className="text-right">{formatNumAfterDot(row.casino_amount)}</td>
                          <td className="text-right">{formatNumAfterDot(row.sports_amount)}</td>
                          <td className="text-right">0</td>
                          <td className="text-right">{formatNumAfterDot(row.total_amount)}</td>
                          <td>-</td>
                        </tr>
                      )) : (
                        <tr className="b-table-empty-row">
                          <td colSpan="8" className="text-center">
                            <div role="alert" aria-live="polite">
                              <div className="text-center my-2">{getNoRecordText(search)}</div>
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
                        <th className="text-right">{formatNumAfterDot(filteredData.reduce((a, b) => a + b.casino_amount, 0))}</th>
                        <th className="text-right">{formatNumAfterDot(filteredData.reduce((a, b) => a + b.sports_amount, 0))}</th>
                        <th className="text-right">0</th>
                        <th className="text-right">{formatNumAfterDot(filteredData.reduce((a, b) => a + b.total_amount, 0))}</th>
                        <th></th>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Pagination */}
                <div className="row pt-3">
                  <div className="col">
                    <ul className="pagination pagination-rounded mb-0 float-right">

                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => changePage(1)}>«</button>
                      </li>

                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => changePage(currentPage - 1)}>‹</button>
                      </li>

                      {getPageNumbers().map((page) => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => changePage(page)}>
                            {page}
                          </button>
                        </li>
                      ))}

                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => changePage(currentPage + 1)}>›</button>
                      </li>

                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
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

export default ProfitLoss;