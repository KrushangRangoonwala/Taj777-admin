import React, { useState, useEffect } from 'react';
import UserMoreModal from '../../components/UserMoreModal';
import DepositModal from '../../components/DepositModal';
import WithdrawModal from '../../components/WithdrawModal';
import { getUserList } from "../../api/API";
import { Link, useLocation, useParams } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { setIsLoading } from '../../store/slices/actionSlice';
import { useDispatch } from 'react-redux';

const AccountList = () => {
  const dispatch = useDispatch();
  const pathName = useLocation().pathname;
  const isChild = pathName.includes("child");
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [searchKey, setSearchKey] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('none');

  const totalPages = Math.ceil(total / limit) || 1;

  const changePage = (pageNo) => {
    if (pageNo >= 1 && pageNo <= totalPages) {
      fetchUserList(searchKey, pageNo);
    }
  };

  useEffect(() => {
    if (isChild) {  // IF `CHILD` URL, THEN ONLY RECOVER sessionStorage from localStorage
      const data = localStorage.getItem("SESSION_TRANSFER");

      if (data) {
        const parsed = JSON.parse(data);

        Object.keys(parsed).forEach((key) => {
          sessionStorage.setItem(key, parsed[key]);
        });

        localStorage.removeItem("SESSION_TRANSFER"); // cleanup
      }
    }
  }, []);

  function openWithSession(url) {
    const sessionData = {};

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      sessionData[key] = sessionStorage.getItem(key);
    }

    localStorage.setItem("SESSION_TRANSFER", JSON.stringify(sessionData));

    window.open(url, "_blank");

    setTimeout(() => {    // AFTER OPENING, CLEANUP
      localStorage.removeItem("SESSION_TRANSFER");
    }, 1000);
  }

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

    return pages?.length > 0 ? pages : [1];
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

  const fetchUserList = async (search = "", pageNo = page) => {
    dispatch(setIsLoading(true));
    try {
      const payload = {
        user_status: "1",
        searchKey: search,
        page: pageNo,
        limit: limit,
        isChild: isChild,
        childId: id
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
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(setIsLoading(false));
    }
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

  useEffect(() => {
    fetchUserList();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUserList(searchKey);
  };

  const handleReset = () => {
    setSearchKey("");
    fetchUserList("");
  };

  return (
    <div data-v-5a10e370="">
      <div data-v-5a10e370="">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-flex align-items-center justify-content-between">
              <h4 className="mb-0 font-size-18">Account List</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <Link to="/admin/home">Home</Link>
                  </li>
                  <li className="breadcrumb-item active">
                    <span aria-current="location">Account List</span>
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
                        fetchUserList(searchKey, 1);   // 🔥 LOAD with search
                      }}
                    >
                      <div
                        className="d-inline-block form-group form-group-feedback form-group-feedback-right"
                        style={{ marginRight: '0.2rem' }}
                      >
                        <input
                          type="text"
                          name="searchKey"
                          placeholder="Search User"
                          className="form-control"
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
                            fetchUserList("", 1);   // reload all data
                          }}
                        >
                          Reset
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="col-md-6 text-right mb-2">
                    <div className="d-inline-block mr-2">
                      <div
                        id="export_1774244501791"
                        className="d-inline-block"
                        style={{ marginRight: '0.2rem' }}
                      >
                        <button type="button" className="btn mr-1 btn-success">
                          <i className="fas fa-file-excel"></i>
                        </button>
                      </div>

                      <button type="button" className="btn btn-danger">
                        <i className="fas fa-file-pdf"></i>
                      </button>{' '}
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
                          onChange={(e) => {
                            const newLimit = Number(e.target.value);
                            setLimit(newLimit);
                            fetchUserList(searchKey, 1);
                          }}
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
                    <Table
                      id="eventsListTbl"
                      role="table"
                      aria-busy="false"
                      aria-colcount="7"
                      className="b-table"
                    // bordered
                    >
                      <thead>
                        <tr role="row">
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="1" aria-sort={sortColumn === 1 ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort(1)}>
                            <div>User Name</div><span className="sr-only"> (Click to sort {getSortValueText(1)})</span>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="2" aria-sort={sortColumn === 2 ? sortDirection : 'none'} className="position-relative text-right" onClick={() => handleSort(2)}>
                            <div>CR</div><span className="sr-only"> (Click to sort {getSortValueText(2)})</span>
                          </th>
                          <th><div>B st</div></th>
                          <th><div>U st</div></th>
                          <th><div>PName</div></th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="6" aria-sort={sortColumn === 6 ? sortDirection : 'none'} className="position-relative" onClick={() => handleSort(6)}>
                            <div>Account Type</div><span className="sr-only"> (Click to sort {getSortValueText(6)})</span>
                          </th>
                          <th><div>Action</div></th>
                        </tr>
                      </thead>

                      <tbody role="rowgroup">
                        {users.length > 0 ? (
                          users.map((user, index) => (
                            <tr key={index} role="row" tabIndex="0" aria-rowindex={(page - 1) * limit + index + 1} className="nocursor">

                              <td aria-colindex="1" role="cell">
                                {user.accountType.toLowerCase() !== "user" ? (
                                  <Link
                                    onClick={() => openWithSession(`/admin/child/${user.id}`)}
                                    // onClick={() => openWithSession(`/admin_new/admin/child/${user.id}`)}
                                    className="wrape-text"
                                    title={user.fullName}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <span>{user.username}</span>
                                  </Link>
                                ) : (
                                  <span title={user.fullName}>
                                    {user.username}
                                  </span>
                                )}
                              </td>

                              <td aria-colindex="2" role="cell">
                                <p className="text-right mb-0 cp text-warning">
                                  {user.cr}
                                </p>
                              </td>

                              <td aria-colindex="3" role="cell">
                                <div className="mb-1 custom-control custom-switch">
                                  <input
                                    type="checkbox"
                                    disabled
                                    checked={user.bst}
                                    className="custom-control-input"
                                    id={`bst-${user.id}`}
                                  />
                                  <label
                                    className="custom-control-label"
                                    htmlFor={`bst-${user.id}`}
                                  ></label>
                                </div>
                              </td>

                              <td aria-colindex="4" role="cell">
                                <div className="mb-1 custom-control custom-switch">
                                  <input
                                    type="checkbox"
                                    disabled
                                    checked={user.ust}
                                    className="custom-control-input"
                                    id={`ust-${user.id}`}
                                  />
                                  <label
                                    className="custom-control-label"
                                    htmlFor={`ust-${user.id}`}
                                  ></label>
                                </div>
                              </td>

                              <td aria-colindex="5" role="cell">
                                <p className="text-left mb-0">{user.pname}</p>
                              </td>

                              <td aria-colindex="6" role="cell">
                                {user.accountType}
                              </td>

                              <td aria-colindex="7" role="cell">
                                <div role="group" className="btn-group">
                                  <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={() => handleDepositClick(user)}
                                  >
                                    D
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => handleWithdrawClick(user)}
                                  >
                                    W
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-info"
                                    onClick={() => handleMoreClick(user)}
                                  >
                                    More
                                  </button>
                                </div>
                              </td>

                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center">
                              No records found
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
        />
      )}

      {showDepositModal && (
        <DepositModal
          user={selectedUser}
          onClose={() => setShowDepositModal(false)}
        />
      )}

      {showWithdrawModal && (
        <WithdrawModal
          user={selectedUser}
          onClose={() => setShowWithdrawModal(false)}
        />
      )}
    </div>
  );
};

export default AccountList;