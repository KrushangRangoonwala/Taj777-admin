import React, { useState, useEffect } from 'react';
import UserMoreModal from '../../components/UserMoreModal';
import DepositModal from '../../components/DepositModal';
import WithdrawModal from '../../components/WithdrawModal';
import { getUserList } from "../../api/API";
import { Link } from 'react-router-dom';
import { setIsLoading } from '../../store/slices/actionSlice';
import { useDispatch, useSelector } from 'react-redux';
import CRModal from '../../components/CRModal';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ActiveUsers = () => {
  const dispatch = useDispatch();
  const [showCRModal, setShowCRModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchKey, setSearchKey] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("ASC");

  const totalPages = Math.ceil(total / limit);

  const userdata = useSelector(store => store.user.userData);
  
  const canDeposit =
    userdata?.user_type != 8 ||
    userdata?.privileges?.includes("Deposit");

  const canWithdraw =
    userdata?.user_type != 8 ||
    userdata?.privileges?.includes("Withdraw");

  const changePage = (pageNo) => {
    if (pageNo >= 1 && pageNo <= totalPages) {
      fetchUserList(searchKey, pageNo);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handleCRClick = (user) => {
    setSelectedUser(user);
    setShowCRModal(true);
  };
  
  const handleMoreClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDepositClick = (user) => {
    setSelectedUser(user);
    setShowDepositModal(true);
  };

  const handleWithdrawClick = (user) => {
    setSelectedUser(user);
    setShowWithdrawModal(true);
  };

  const handleSort = (column) => {
    let direction = "ASC";

    if (sortColumn === column) {
      direction = sortDirection === "ASC" ? "DESC" : "ASC";
    }

    setSortColumn(column);
    setSortDirection(direction);

    fetchUserList(searchKey, 1, column, direction);
  };

  const fetchUserList = async (
    search = "",
    pageNo = page,
    sortCol = sortColumn,
    sortDir = sortDirection
  ) => {
    dispatch(setIsLoading(true));

    try {
      const payload = {
        user_status: "0",
        searchKey: search,
        page: pageNo,
        limit: limit,
        sortColumn: sortCol,
        sortDirection: sortDir
      };

      const res = await getUserList(payload);

      if (res.status === "ok") {
        const numbered = res.data.map((item, index) => ({
          sr_no: (pageNo - 1) * limit + index + 1,
          ...item
        }));

        setUsers(numbered);
        setTotal(res.total);
        setPage(pageNo);
      }
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  useEffect(() => {
    fetchUserList();
  }, []);

  useEffect(() => {
      fetchUserList(searchKey, 1);
  }, [limit]);

  const exportToExcel = () => {
    const formattedData = users.map((user, index) => ({
      "Sr No": index + 1,
      "User Name": user.username,
      CR: user.cr,
      PTS: user.pts,
      "Client P/L": user.clientPL,
      "Client P/L %": user.clientPLPercent,
      Exposure: user.exposure,
      "Available PTS": user.availablePts,
      "B Status": user.bst ? "ON" : "OFF",
      "U Status": user.ust ? "ON" : "OFF",
      PName: user.partnership,
      "Account Type": user.accountType,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Active Users");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(file, "Active_Users.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF("landscape");

    const tableData = users.map((user, index) => [
      index + 1,
      user.username,
      user.cr,
      user.pts,
      user.clientPL,
      user.clientPLPercent,
      user.exposure,
      user.availablePts,
      user.bst ? "ON" : "OFF",
      user.ust ? "ON" : "OFF",
      user.partnership,
      user.accountType,
    ]);

    autoTable(doc, {
      head: [[
        "Sr No",
        "User Name",
        "CR",
        "PTS",
        "Client P/L",
        "Client P/L %",
        "Exposure",
        "Available PTS",
        "B Status",
        "U Status",
        "PName",
        "Account Type",
      ]],
      body: tableData,
      styles: {
        fontSize: 8,
      },
    });

    doc.save("Active_Users.pdf");
  };
  
  return (
    <div data-v-5a10e370="">
      <div data-v-5a10e370="">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-flex align-items-center justify-content-between">
              <h4 className="mb-0 font-size-18">Account List For Active Users</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <Link to="/admin/home">Home</Link>
                  </li>
                  <li className="breadcrumb-item active">
                    <span aria-current="location">Active Users</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="row account-list">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="row row5">
                  <div className="col-md-6 mb-2 search-form">
                    <form
                      method="post"
                      onSubmit={(e) => {
                        e.preventDefault();
                        fetchUserList(searchKey, 1); // reset to page 1
                      }}
                    >
                      <div className="d-inline-block form-group form-group-feedback form-group-feedback-right" style={{ marginRight: '0.2rem' }}>
                        <input
                          type="text"
                          name="searchKey"
                          placeholder="Search User"
                          className="form-control dark-placeholder"
                          value={searchKey}
                          onChange={(e) => setSearchKey(e.target.value)}
                        />
                      </div>
                      <div className="d-inline-block">
                        <button type="submit" id="submit" className="btn btn-primary">
                          Load
                        </button>
                        <button
                          type="button"
                          id="reset"
                          className="btn btn-light ml-1"
                          onClick={() => {
                            setSearchKey("");
                            fetchUserList("", 1);
                          }}
                        >
                          Reset
                        </button>
                      </div>
                    </form>
                  </div>
                  <div className="col-md-6 text-right mb-2">
                    <div className="d-inline-block mr-2">
                      <div id="export_1774244719287" className="d-inline-block" style={{ marginRight: '0.2rem' }}>
                        <button
                          type="button"
                          className="btn mr-1 btn-success"
                          style={{ marginRight: 'calc(1rem)' }}
                          disabled={!users.length}
                          onClick={exportToExcel}
                        >
                          <i className="fas fa-file-excel"></i>
                        </button>
                      </div>
                      <button
                        type="button"
                        className="btn btn-danger"
                        disabled={!users.length}
                        onClick={exportToPDF}
                      >
                        <i className="fas fa-file-pdf"></i>
                      </button>
                    </div>{' '}
                    <div className="d-inline-block">
                      <Link to="/admin/users/insertuser" className="btn btn-success">
                        <i aria-hidden="true" className="fa fa-plus"></i> CREATE ACCOUNT
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-12 col-md-6">
                    <div id="tickets-table_length" className="dataTables_length">
                      <label className="d-inline-flex align-items-center">
                        Show&nbsp;
                        <select
                          className="custom-select custom-select-sm"
                          value={limit}
                          onChange={(e) => setLimit(Number(e.target.value))}
                        >
                          <option value="25">25</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                          <option value="250">250</option>
                          <option value="500">500</option>
                          <option value="750">750</option>
                          <option value="1000">1000</option>
                        </select>
                        &nbsp;entries
                      </label>
                    </div>
                  </div>
                </div>

                <div className="table-responsive mb-0">
                  <div className="table no-footer table-responsive-sm">
                    <table id="eventsListTbl" role="table" aria-busy="false" aria-colcount="12" className="table b-table">
                      <thead>
                        <tr role="row">
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="1" aria-sort="none" className="position-relative" onClick={() => handleSort("username")} style={{ cursor: "pointer" }}>
                            <div>User Name</div>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="2" aria-sort="none" className="position-relative text-right" onClick={() => handleSort("cr")} style={{ cursor: "pointer" }}>
                            <div>CR</div>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="3" aria-sort="none" className="position-relative text-right">
                            <div>pts</div>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="4" aria-sort="none" className="position-relative text-right">
                            <div>Client(P/L)</div>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="5" aria-sort="none" className="position-relative text-right">
                            <div>Client(P/L) %</div>
                          </th>
                          <th role="columnheader" scope="col" aria-colindex="6" className="text-right">
                            <div>Exposure</div>
                          </th>
                          <th role="columnheader" scope="col" aria-colindex="7" className="text-right">
                            <div>Available pts</div>
                          </th>
                          <th role="columnheader" scope="col" aria-colindex="8" className="">
                            <div>B st</div>
                          </th>
                          <th role="columnheader" scope="col" aria-colindex="9" className="">
                            <div>U st</div>
                          </th>
                          <th role="columnheader" scope="col" aria-colindex="10" className="">
                            <div>PName</div>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="11" aria-sort="none" className="position-relative" onClick={() => handleSort("accountType")} style={{ cursor: "pointer" }}>
                            <div>Account Type</div>
                          </th>
                          <th role="columnheader" scope="col" aria-colindex="12" className="">
                            <div>Action</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody role="rowgroup">
                        {users?.length === 0 && <td colSpan="12" role="cell" className="">
                          <div role="alert" aria-live="polite">
                            <div className="text-center my-2">There are no records to show</div>
                          </div>
                        </td>}
                        {users?.map((user) => (
                          <tr key={user.id} role="row">
                            <td aria-colindex="1" role="cell">
                              <span title={user.fullName}>{user.username}</span>
                            </td>
                            <td aria-colindex="2" role="cell">
                              <p className="text-right mb-0 cp text-warning" onClick={
                                  Number(user.parent_id) === Number(userdata?.user_id)
                                    ? () => handleCRClick(user)
                                    : undefined
                                }>
                                {user.cr}
                              </p>
                            </td>
                            <td aria-colindex="3" role="cell">
                              <p className="text-right mb-0">{user.pts}</p>
                            </td>
                            <td aria-colindex="4" role="cell">
                              <p className="text-right mb-0">{user.clientPL}</p>
                            </td>
                            <td aria-colindex="5" role="cell">
                              <p className="text-center">{user.clientPLPercent}</p>
                            </td>
                            <td aria-colindex="6" role="cell" className="text-right">
                              <p className="mb-0 text-right">{user.exposure}</p>
                            </td>
                            <td aria-colindex="7" role="cell">
                              <p className="text-right mb-0">{user.availablePts}</p>
                            </td>
                            <td aria-colindex="8" role="cell">
                              <div className="mb-1 custom-control custom-switch">
                                <input type="checkbox" disabled checked={user.bst} className="custom-control-input" id={`bst-${user.id}`} />
                                <label className="custom-control-label" htmlFor={`bst-${user.id}`}></label>
                              </div>
                            </td>
                            <td aria-colindex="9" role="cell">
                              <div className="mb-1 custom-control custom-switch">
                                <input type="checkbox" disabled checked={user.ust} className="custom-control-input" id={`ust-${user.id}`} />
                                <label className="custom-control-label" htmlFor={`ust-${user.id}`}></label>
                              </div>
                            </td>
                            <td aria-colindex="10" role="cell">
                              <p className="text-left mb-0">{user.partnership}</p>
                            </td>
                            <td aria-colindex="11" role="cell">
                              {user.accountType}
                            </td>
                            <td aria-colindex="12" role="cell">
                              <div role="group" className="btn-group">
                                {canDeposit && (<button type="button" className="btn btn-success" onClick={() => handleDepositClick(user)}>D</button>)}
                                {canWithdraw && (<button type="button" className="btn btn-danger" onClick={() => handleWithdrawClick(user)}>W</button>)}
                                <button type="button" className="btn btn-info" onClick={() => handleMoreClick(user)}>More</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="row pt-3">
                  <div className="col">
                    <div className="dataTables_paginate paging_simple_numbers float-right">
                      <ul className="pagination pagination-rounded mb-0 float-right">

                        {/* FIRST */}
                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => changePage(1)}>«</button>
                        </li>

                        {/* PREV */}
                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => changePage(page - 1)}>‹</button>
                        </li>

                        {/* CURRENT PAGE ONLY (since your UI shows 1 only) */}
                        {getPageNumbers().map((p) => (
                          <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => changePage(p)}>
                              {p}
                            </button>
                          </li>
                        ))}

                        {/* NEXT */}
                        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => changePage(page + 1)}>›</button>
                        </li>

                        {/* LAST */}
                        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
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
      {showModal && (
        <UserMoreModal
          user={selectedUser}
          onClose={() => setShowModal(false)}
          userdata={userdata}
          onSuccess={() => {
            fetchUserList();
          }}
        />
      )}
      {showCRModal && (
        <CRModal
          user={selectedUser}
          onClose={() => setShowCRModal(false)}
          onSuccess={() => {
            fetchUserList();
          }}
        />
      )}
      {showDepositModal && (
        <DepositModal
          user={selectedUser}
          onClose={() => setShowDepositModal(false)}
          onSuccess={() => {
            fetchUserList();
          }}
        />
      )}
      {showWithdrawModal && (
        <WithdrawModal
          user={selectedUser}
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={() => {
            fetchUserList();
          }}
        />
      )}
    </div>
  );
};

export default ActiveUsers;
