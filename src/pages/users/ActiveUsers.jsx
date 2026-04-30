import React, { useState, useEffect } from 'react';
import UserMoreModal from '../../components/UserMoreModal';
import DepositModal from '../../components/DepositModal';
import WithdrawModal from '../../components/WithdrawModal';
import { getUserList } from "../../api/API";
import { Link } from 'react-router-dom';
import { setIsLoading } from '../../store/slices/actionSlice';
import { useDispatch } from 'react-redux';

const ActiveUsers = () => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchKey, setSearchKey] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

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
        user_status: "0",
        searchKey: search,
        page: pageNo,
        limit: limit
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

  useEffect(() => {
    fetchUserList();
  }, []);
  const dummyData = [
    {
      id: '1',
      username: 'Ras44',
      fullName: 'Apapap',
      cr: '5,000',
      pts: '1,573',
      clientPL: '-3,427',
      clientPLPercent: '-',
      exposure: '0',
      availablePts: '1,573',
      bst: true,
      ust: true,
      pname: '0 PNR',
      accountType: 'User',
    },
    {
      id: '2',
      username: 'Ras46',
      fullName: 'Ras46',
      cr: '5,000',
      pts: '2,128.75',
      clientPL: '-2,871.25',
      clientPLPercent: '-',
      exposure: '0',
      availablePts: '2,128.75',
      bst: true,
      ust: true,
      pname: '0 PNR',
      accountType: 'User',
    },
    {
      id: '3',
      username: 'Ras48',
      fullName: 'Apapap',
      cr: '5,000',
      pts: '1,936',
      clientPL: '-3,064',
      clientPLPercent: '-',
      exposure: '0',
      availablePts: '1,936',
      bst: true,
      ust: true,
      pname: '0 PNR',
      accountType: 'User',
    },
    {
      id: '4',
      username: 'Ras49',
      fullName: 'Rasg',
      cr: '5,100',
      pts: '1,444',
      clientPL: '-3,656',
      clientPLPercent: '-',
      exposure: '0',
      availablePts: '1,444',
      bst: true,
      ust: true,
      pname: '0 PNR',
      accountType: 'User',
    },
    {
      id: '5',
      username: 'Ras52',
      fullName: 'Apapapap',
      cr: '1,000',
      pts: '9,295',
      clientPL: '8,295',
      clientPLPercent: '-',
      exposure: '0',
      availablePts: '9,295',
      bst: true,
      ust: true,
      pname: '0 PNR',
      accountType: 'User',
    },
  ];

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
                        <button type="button" className="btn mr-1 btn-success" style={{ marginRight: 'calc(1rem)' }}>
                          <i className="fas fa-file-excel"></i>
                        </button>
                      </div>
                      <button type="button" className="btn btn-danger">
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
                        <select className="custom-select custom-select-sm" id="__BVID__2629">
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
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="1" aria-sort="none" className="position-relative">
                            <div>User Name</div>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="2" aria-sort="none" className="position-relative text-right">
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
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="11" aria-sort="none" className="position-relative">
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
                              <p className="text-right mb-0 cp text-warning">{user.cr}</p>
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
                              <p className="text-left mb-0">{user.pname}</p>
                            </td>
                            <td aria-colindex="11" role="cell">
                              {user.accountType}
                            </td>
                            <td aria-colindex="12" role="cell">
                              <div role="group" className="btn-group">
                                <button type="button" className="btn btn-success" onClick={() => handleDepositClick(user)}>D</button>
                                <button type="button" className="btn btn-danger" onClick={() => handleWithdrawClick(user)}>W</button>
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

export default ActiveUsers;
