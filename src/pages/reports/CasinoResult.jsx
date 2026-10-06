import React, { useEffect, useMemo, useState } from "react";
import { DatePicker } from "antd";
import "antd/dist/reset.css";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Table } from 'react-bootstrap';


// 👉 Replace with your API
import { getCasinoResult } from "../../api/API";
import Result_parent from "../casino/games/components/Result_parent";
import PageNamePath from "../../components/PageNamePath";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

// const casinoOptions = [
//   { value: "", label: "Select Casino" },
//   { value: "teen", label: "Teenpatti 1-day" },
//   { value: "poker", label: "Poker 1-Day" },
//   // ...
// ];


const CasinoResult = () => {
  const game_type = useParams().id;
  const [mid, setMid] = useState(false);
  const [date, setDate] = useState(dayjs());
  const [casinoType, setCasinoType] = useState(game_type || "");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const casino_list = useSelector(state => state.casino.casino_list);
  const casinoTypes = useMemo(() => {
    const games = Array.isArray(casino_list)
      ? casino_list
      : Object.values(casino_list || {});

    const options = games
      .filter((val) => val && (val.game_type || val.game_name))
      .map((val) => ({
        value: val.game_type,
        label: val.game_name,
      }));

    return [
      // { value: "", label: "Select Type" },
      ...options,
    ];
  }, [casino_list]);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('none');
  const [isSelectoptTouched, setIsSelectoptTouched] = useState(false);

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

  const totalPages = Math.ceil(totalRecords / perPage) || 1;


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

  useEffect(() => {
    if (game_type) {
      fetchCasinoResult();
    }
  }, [game_type])

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
    const aa = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    return aa?.length > 0 ? aa : [1];
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
      {/* <div className="page-title-box d-flex justify-content-between">
        <h4>Our Casino Result</h4>
      </div> */}
      <PageNamePath
        pageName="Our Casino Result"
        pathArr={[{ path: "/admin/home", name: "Home" }, { path: "", name: "Our Casino Result" }]}
      />

      {/* FILTER */}
      <div className="card" style={{ padding: "20px" }}>
        <div className="row row5 mb-3" style={{ marginBottom: "24px" }}>

          {/* DATE */}
          <div className="col-md-3 mb-2">
            <DatePicker
              value={date}
              onChange={(d) => setDate(d)}
              format="DD/MM/YYYY"
              style={{ width: "100%", height: "100%" }}
              className="ant_custom_date"
            />
          </div>

          {/* CASINO TYPE */}
          <div className="col-md-3 mb-2">
            <select
              className={`form-control ${!casinoType ? "is-invalid" : ""}`}
              value={casinoType}
              onChange={(e) => {
                setCasinoType(e.target.value)
                setIsSelectoptTouched(true)
              }}
            >
              {!isSelectoptTouched && (<option value="" style={{ display: "none" }}></option>)}

              {casinoTypes.map((t, idx) => (
                <option key={t.value || idx} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* BUTTONS */}
          <div className="col-md-6  mb-2">
            <button className="btn btn-primary" onClick={() => fetchCasinoResult(1)}>
              Load
            </button>{' '}

            <button className="btn btn-light" onClick={handleReset}>
              Reset
            </button>{' '}
            <div className="d-inline-block ml-3">
              <div id="export_1776776380804" className="d-inline-block disabled">
                <button type="button" className="btn btn-success mr-1" onClick={exportExcel} disabled={data.length === 0}>
                  <i className="fas fa-file-excel"></i>
                </button>
              </div>{' '}
              <button type="button" className="btn btn-danger" onClick={exportPDF} disabled={data.length === 0}>
                <i className="fas fa-file-pdf"></i>
              </button>{' '}
            </div>
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
                  field-type="search"
                  placeholder="Search..."
                  className="form-control form-control-sm ml-2 dark-placeholder"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyUp={(e) => { fetchCasinoResult(1) }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive mb-0">
          <div className="table no-footer table-responsive-sm">
            <Table id="casinoResultTable" role="table" aria-busy="false" aria-colcount="2" className="b-table" bordered>
              <colgroup>
                <col style={{ width: "50%" }} />
                <col style={{ width: "50%" }} />
              </colgroup>
              <thead role="rowgroup">
                <tr role="row">
                  <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'marketId' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('marketId')}>
                    <div>Market Id</div><span className="sr-only"> (Click to sort {getSortValueText('marketId')})</span>
                  </th>
                  <th role="columnheader" scope="col" tabIndex="0" aria-sort={sortColumn === 'winner' ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort('winner')}>
                    <div>Winner</div><span className="sr-only"> (Click to sort {getSortValueText('winner')})</span>
                  </th>
                </tr>
              </thead>
              <tbody role="rowgroup">
                {data.length > 0 ? (
                  data.map((row, i) => (
                    <tr key={i} role="row" tabIndex="0" className="nocursor">
                      <td
                        role="cell"
                        style={{ color: "#1f3dd0", cursor: "pointer" }}
                        onClick={() => setMid(row.round)}
                      >
                        {row.round}
                      </td>
                      <td role="cell">{(row.winner).split("#")[0]}</td>
                    </tr>
                  ))
                ) : (
                  <tr role="row" className="b-table-empty-row">
                    <td colSpan="2" role="cell">
                      <div role="alert" aria-live="polite">
                        <div className="text-center my-2">
                          {loading
                            ? "Loading..."
                            // ? "There are no records to show"
                            : search?.length
                              ? "There are no records matching your request"
                              : "There are no records to show"}
                        </div>
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

      <Result_parent mid={mid} setMid={setMid} game_type={casinoType} />
    </div>
  );
};

export default CasinoResult;