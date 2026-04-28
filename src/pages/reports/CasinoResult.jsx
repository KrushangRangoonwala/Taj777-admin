import React, { useState } from "react";
import { DatePicker } from "antd";
import "antd/dist/reset.css";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Table } from 'react-bootstrap';


// 👉 Replace with your API
import { getCasinoResult } from "../../api/API";
import { casino_list } from "../../utilies/casino_list";
import Result_parent from "../casino/games/components/Result_parent";
import PageNamePath from "../../components/PageNamePath";

const casinoOptions = [
  { value: "", label: "Select Casino" },
  { value: "teen", label: "Teenpatti 1-day" },
  { value: "poker", label: "Poker 1-Day" },
  { value: "3cardj", label: "3 Cards Judgement" },
  { value: "aaa", label: "Amar Akbar Anthony" },
  { value: "ab20", label: "Andar Bahar" },
  { value: "abj", label: "Andar Bahar 2" },
  { value: "baccarat", label: "Baccarat" },
  { value: "baccarat2", label: "Baccarat 2" },
  { value: "btable", label: "Bollywood Casino" },
  { value: "card32", label: "32 Cards A" },
  { value: "card32eu", label: "32 Cards B" },
  { value: "cmatch20", label: "Cricket Match 20-20" },
  { value: "cmeter", label: "Casino Meter" },
  // { value: "cricketv", label: "Cricket V" },
  // { value: "cricketv2", label: "Cricket V2" },
  { value: "cricketv3", label: "5Five Cricket" },
  { value: "dt20", label: "20-20 Dragon Tiger" },
  { value: "dt202", label: "20-20 Dragon Tiger 2" },
  { value: "dt6", label: "1 Day Dragon Tiger" },
  { value: "dtl20", label: "20-20 D T L" },
  { value: "lottcard", label: "lottcard" },
  { value: "lucky7", label: "Lucky 7 - A" },
  { value: "lucky7eu", label: "Lucky 7 - B" },
  { value: "poker20", label: "20-20 Poker" },
  { value: "poker6", label: "Poker 6 Players" },
  { value: "teen20", label: "20-20 Teenpatti" },
  { value: "teen8", label: "Teenpatti Open" },
  { value: "teen9", label: "Teenpatti Test" },
  { value: "war", label: "Casino War" },
  { value: "worli", label: "Worli Matka" },
  { value: "worli2", label: "Instant Worli" },
  { value: "teen6", label: "Teenpatti - 2.0" },
  { value: "queen", label: "Queen" },
  { value: "race20", label: "Race20" },
  { value: "lucky7eu2", label: "Lucky 7 - C" },
  { value: "superover", label: "Super Over" },
  { value: "trap", label: "The Trap" },
  { value: "patti2", label: "2 Cards Teenpatti" },
  { value: "teensin", label: "29Card Baccarat" },
  { value: "teenmuf", label: "Muflis Teenpatti" },
  { value: "race17", label: "Race to 17" },
  { value: "teen20b", label: "20-20 Teenpatti B" },
  { value: "trio", label: "Trio" },
  { value: "notenum", label: "Note Number" },
  // { value: "teen2024", label: "Teen 20 24" },
  { value: "kbc", label: "K.B.C" },
  { value: "teen120", label: "1 CARD 20-20" },
  { value: "teen1", label: "1 CARD ONE-DAY" },
  // { value: "vteen20", label: "V-20-20 Teenpatti" },
  // { value: "vteen", label: "V-Teenpatti 1-day" },
  // { value: "vdt6", label: "V-1 Day Dragon Tiger" },
  // { value: "vdt20", label: "V-20-20 Dragon Tiger" },
  // { value: "vlucky7", label: "V-Lucky 7 - A" },
  // { value: "vrace17", label: "V-Race to 17" },
  // { value: "vteenmuf", label: "V-Muflis Teenpatti" },
  // { value: "vaaa", label: "V-Amar Akbar Anthony" },
  // { value: "vbtable", label: "V-Bollywood Casino" },
  // { value: "vbaccarat", label: "V-Baccarat" },
  // { value: "vtrio", label: "V-Trio" },
  // { value: "vtrap", label: "V-The Trap" },
  { value: "ab3", label: "ANDAR BAHAR 50 CARDS" },
  // { value: "vdtl20", label: "V-20-20 D T L" },
  { value: "aaa2", label: "Amar Akbar Anthony 2" },
  // { value: "roulette", label: "roulette" },
  { value: "race2", label: "Race to 2nd" },
  { value: "teen3", label: "Instant Teenpatti" },
  { value: "dum10", label: "Dus ka Dum" },
  { value: "cmeter1", label: "1 Card Meter" },
  { value: "teen32", label: "Instant Teenpatti 2.0" },
  { value: "sicbo", label: "Sic Bo" },
  { value: "ballbyball", label: "Ball by ball" },
  // { value: "roulette1", label: "roulette1" },
  { value: "teen33", label: "Instant Teenpatti 3.0" },
  // { value: "roulette2", label: "roulette2" },
  { value: "superover2", label: "Super Over2" },
  // { value: "roulette3", label: "roulette3" },
  { value: "sicbo2", label: "Sic Bo 2" },
  { value: "teen41", label: "Queen top open teenpatti" },
  { value: "teen42", label: "Jack top open teenpatti" },
  { value: "lucky15", label: "Lucky 15" },
  { value: "goal", label: "Goal" },
  { value: "ab4", label: "Andar-Bahar 150 card" },
  { value: "superover3", label: "Mini SuperOver" },
  { value: "ourroullete", label: "Unique Roulette" },
  { value: "teen20c", label: "20-20 Teenpatti C" },
  { value: "btable2", label: "Bollywood Casino 2" },
  { value: "teenjoker", label: "Teenpatti Joker" },
  { value: "joker1", label: "Unlimited Joker One Day" },
  { value: "joker20", label: "Teenpatti Joker 20-20" },
  { value: "joker120", label: "Unlimited Joker 20-20" },
  { value: "poison20", label: "Teenpatti Poison 20-20" },
  { value: "teenunique", label: "Unique Teenpatti" },
  { value: "poison", label: "Teenpatti Poison One Day" },
  { value: "roulette11", label: "Golden Roulette" },
  { value: "roulette12", label: "Beach Roulette" },
  { value: "roulette13", label: "Regular Roulette" },
  // { value: "pteen", label: "Premium Teenpatti 1-day" },
  // { value: "pteen20", label: "Premium 20-20 Teenpatti" },
  // { value: "pdt6", label: "Premium 1 Day Dragon Tiger" },
  // { value: "pdt20", label: "Premium 20-20 Dragon Tiger" },
  // { value: "plucky7", label: "Premium Lucky 7" },
  // { value: "pcard32", label: "Premium 32 Cards" },
  // { value: "pbaccarat", label: "Premium Baccarat" },
  // { value: "tteen", label: "Tembo Teenpatti 1-day" },
  // { value: "tteen20", label: "Tembo 20-20 Teenpatti" },
  // { value: "tdt6", label: "Tembo 1 Day Dragon Tiger" },
  // { value: "tdt20", label: "Tembo 20-20 Dragon Tiger" },
  // { value: "tlucky7", label: "Tembo Lucky 7" },
  // { value: "tcard32", label: "Tembo 32 Cards" },
  // { value: "tbaccarat", label: "Tembo Baccarat" },
  { value: "lucky5", label: "Lucky 6" },
  { value: "mogambo", label: "Mogambo" },
  { value: "dolidana", label: "Dolidana" },
  { value: "teen20v", label: "20-20 Teenpatti VIP" },
  { value: "worli3", label: "Matka" },
  { value: "teen62", label: "V VIP Teenpatti 1-day" }
];

const casinoTypes = [
  { value: "", label: "Select Casino" },   // ✅ static first option
  ...(casino_list?.map(val => ({
    value: val.game_socket,
    label: val.game_name,
  })) || [])
];

const CasinoResult = () => {
  const [mid, setMid] = useState(false);
  const [date, setDate] = useState(dayjs());
  const [casinoType, setCasinoType] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

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

              {casinoOptions.map((t) => (
                <option key={t.value} value={t.value}>
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
                      <td role="cell">{row.winner}</td>
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