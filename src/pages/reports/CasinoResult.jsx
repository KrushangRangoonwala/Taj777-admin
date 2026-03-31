import React, { useState } from "react";
import { DatePicker } from "antd";
import "antd/dist/reset.css";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// 👉 Replace with your API
import { getCasinoResult } from "../../api/API";
import { casino_list } from "../../utilies/casino_list";

const casinoTypes = [
    { value: "", label: "Select Type" },   // ✅ static first option
    ...(casino_list?.map(val => ({
        value: val.game_socket,
        label: val.game_name,
    })) || [])
];

const CasinoResult = () => {
  const [date, setDate] = useState(dayjs());
  const [casinoType, setCasinoType] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const totalPages = Math.ceil(totalRecords / perPage);

  // 🔹 FETCH DATA (ONLY ON LOAD)
  const fetchCasinoResult = async (page = 1) => {
    setLoading(true);
    try {
      const payload = {
        game_date: dayjs(date).format("YYYY-MM-DD"),
        casino_type: casinoType,
        iDisplayStart: (page - 1) * perPage,
        iDisplayLength: perPage,
        sSearch: search,
        sEcho: 1
    };

      const res = await getCasinoResult(payload);

      setData(res?.data || []);
      setTotalRecords(res?.recordsTotal || 0);
      setCurrentPage(page);

    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 RESET
  const handleReset = () => {
    setDate(dayjs());
    setCasinoType("");
    setSearch("");
    setData([]);
    setCurrentPage(1);
    setTotalRecords(0);
  };

  // 🔹 PAGINATION
  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchCasinoResult(page);
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

  // 🔹 EXPORT EXCEL
  const exportExcel = () => {
    if (data.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CasinoResult");

    XLSX.writeFile(wb, `Casino_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
  };

  // 🔹 EXPORT PDF
  const exportPDF = () => {
    if (data.length === 0) return;

    const doc = new jsPDF();

    const tableRows = data.map(item => [
        item.round,
        item.winner
    ]);

    autoTable(doc, {
      head: [["Market Id", "Winner"]],
      body: tableRows,
    });

    doc.save(`Casino_${dayjs().format("YYYYMMDD_HHmmss")}.pdf`);
  };

  return (
    <div>
      {/* HEADER */}
      <div className="page-title-box d-flex justify-content-between">
        <h4>Our Casino Result</h4>
      </div>

      {/* FILTER */}
      <div className="card p-3">
        <div className="row mb-3">

          {/* DATE */}
          <div className="col-md-3">
            <DatePicker
              value={date}
              onChange={(d) => setDate(d)}
              style={{ width: "100%" }}
            />
          </div>

          {/* CASINO TYPE */}
          <div className="col-md-3">
            <select
              className="form-control"
              value={casinoType}
              onChange={(e) => setCasinoType(e.target.value)}
            >
                {casinoTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                        {t.label}
                    </option>
                ))}
            </select>
          </div>

          {/* BUTTONS */}
          <div className="col-md-6">
            <button className="btn btn-primary" onClick={() => fetchCasinoResult(1)}>
              Load
            </button>

            <button className="btn btn-light ml-2" onClick={handleReset}>
              Reset
            </button>
                &nbsp;
            <button type="button" className="btn btn-success" onClick={exportExcel} disabled={data.length === 0}>
                <i className="fas fa-file-excel"></i>
            </button>
            &nbsp;
            <button type="button" className="btn btn-danger" onClick={exportPDF} disabled={data.length === 0}>
                <i className="fas fa-file-pdf"></i>
            </button>
          </div>
        </div>

        {/* TOP BAR */}
        <div className="row">
            <div className="col-6">
            <label className="d-inline-flex align-items-center">
                Show&nbsp;
                <select
                className="custom-select custom-select-sm"
                value={perPage}
                onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    fetchCasinoResult(1);
                }}
                >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="75">75</option>
                <option value="100">100</option>
                </select>
                &nbsp;entries
            </label>
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
                    onKeyUp={(e) => {fetchCasinoResult(1)}}
                />
                </label>
            </div>
            </div>
        </div>

        {/* TABLE */}
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>Market Id</th>
              <th>Winner</th>
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((row, i) => (
                <tr key={i}>
                  <td style={{color: "#1f3dd0"}}>{row.round}</td>
                  <td>{row.winner}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center">
                  {loading ? "Loading..." : "No records"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
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
  );
};

export default CasinoResult;