import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBankDetail, accountTransaction, apiBalance } from '../../api/API';
import { useDispatch } from 'react-redux';

const Bank = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    masterPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKey, setSearchKey] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / limit);

  const [amounts, setAmounts] = useState({});
  const [rowStatus, setRowStatus] = useState({});
  const [rowLoading, setRowLoading] = useState({});

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "masterPassword":
        if (!value.trim()) {
          error = "true";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleAmountChange = (id, value) => {
    setAmounts((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const fetchBankData = async (
    currentPage = page,
    currentLimit = limit,
    currentSearch = searchKey
  ) => {
    try {
      setLoading(true);

      const payload = {
        page: currentPage,
        limit: currentLimit,
        searchKey: currentSearch,
        user_status: "1",
      };

      const response = await getBankDetail(payload);

      if (response?.status === "ok") {
        setData(response.data || []);
        setTotal(response.total || 0);
      } else {
        setData([]);
      }
    } catch (error) {
      console.log("Bank API Error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankData();
  }, [page, limit]);

  const handleTransfer = async (user) => {

    const amount = Number(amounts[user.id]);

    // Master password validation
    if (!formData.masterPassword.trim()) {
      setRowStatus((prev) => ({
        ...prev,
        [user.id]: "Please enter master password",
      }));
      return;
    }

    // Amount validation
    if (!amount || amount === 0) {
      setRowStatus((prev) => ({
        ...prev,
        [user.id]: "Please enter valid amount",
      }));
      return;
    }

    try {

      setRowLoading((prev) => ({
        ...prev,
        [user.id]: true,
      }));

      setRowStatus((prev) => ({
        ...prev,
        [user.id]: "Processing...",
      }));

      // (+) deposit
      // (-) withdraw
      const transactionType = amount > 0 ? 1 : 2;

      const payload = {
        user_name: user.id,
        transaction_type: transactionType,
        transaction_points: Math.abs(amount),
        remark: "Bank Transfer",
        master_password: formData.masterPassword,
      };

      const response = await accountTransaction(payload);

      setRowStatus((prev) => ({
        ...prev,
        [user.id]: response.message,
      }));

      // Refresh data after success
      if (response.status === "ok") {
        fetchBankData();
        handleAmountChange(user.id, 0); // reset amount input
        const Totbal = await apiBalance(dispatch);
      }

    } catch (error) {

      setRowStatus((prev) => ({
        ...prev,
        [user.id]: "Something went wrong",
      }));

    } finally {

      setRowLoading((prev) => ({
        ...prev,
        [user.id]: false,
      }));
    }
  };

  const handleTransferAll = async (e) => {

    e.preventDefault();

    // Master password validation
    if (!formData.masterPassword.trim()) {
      setTouched((prev) => ({
        ...prev,
        masterPassword: true,
      }));

      setErrors((prev) => ({
        ...prev,
        masterPassword: "true",
      }));

      return;
    }

    for (const user of data) {

      const amount = Number(amounts[user.id]);

      // Skip invalid amount rows
      if (!amount || amount === 0) {

        /* setRowStatus((prev) => ({
          ...prev,
          [user.id]: "Amount should not be 0",
        })); */

        continue;
      }

      await handleTransfer(user);
    }
  };

  return (
    <div data-v-5a10e370="">
      <div data-v-5a10e370="">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-flex align-items-center justify-content-between">
              <h4 className="mb-0 font-size-18">Bank</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <Link to="/admin/home">Home</Link>
                  </li>
                  <li className="breadcrumb-item active">
                    <span aria-current="location">Bank</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        <div className="row bank-panel">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="report-form mb-1">
                  <div className="row row5">
                    <div className="col-md-6 mb-2 search-form">
                      <form
                        method="post"
                        className="ajaxFormSubmit"
                        onSubmit={(e) => {
                          e.preventDefault();
                          setPage(1);
                          fetchBankData(1, limit, searchKey);
                        }}
                      >
                        <div className="d-inline-block form-group form-group-feedback form-group-feedback-right" style={{ marginRight: '0.2rem' }}>
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
                              setSearchKey('');
                              setPage(1);

                              // Reset all amount fields to 0
                              const resetAmounts = {};
                              data.forEach((user) => {
                                resetAmounts[user.id] = 0;
                              });
                              setAmounts(resetAmounts);

                              fetchBankData(1, limit, '');
                            }}
                          >
                            Reset
                          </button>
                        </div>
                      </form>
                    </div>
                    <div className="col-md-6 text-right">
                      <div className="d-inline-block">
                        <div id="export_1774256324601" className="d-inline-block" style={{ marginRight: '0.2rem' }}>
                          <button type="button" className="btn mr-1 btn-success">
                            <i className="fas fa-file-excel"></i>
                          </button>
                        </div>
                        <button type="button" className="btn btn-danger">
                          <i className="fas fa-file-pdf"></i>
                        </button>
                      </div>
                      <form
                        data-vv-scope="transferAll"
                        method="post"
                        className="d-inline-block ml-1"
                        onSubmit={handleTransferAll}
                      >
                        <div className="d-inline-block form-group form-group-feedback form-group-feedback-right" style={{ marginRight: '0.2rem' }}>
                          <input
                            type="password"
                            name="masterPassword"
                            placeholder="Transaction Code"
                            className={`form-control ${touched.masterPassword && errors.masterPassword ? 'is-invalid' : ''}`}
                            value={formData.masterPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />

                        </div>
                        <div className="d-inline-block">
                          <button type="submit" id="transferSubmit" className="btn btn-primary">
                            Transfer All
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-6">
                    <div id="tickets-table_length" className="dataTables_length">
                      <label className="d-inline-flex align-items-center">
                        Show&nbsp;
                        <select
                          className="custom-select custom-select-sm"
                          id="__BVID__2355"
                          value={limit}
                          onChange={(e) => {
                            setLimit(Number(e.target.value));
                            setPage(1);
                          }}
                        >
                          <option>25</option>
                          <option>50</option>
                          <option>75</option>
                          <option>100</option>
                          <option>125</option>
                          <option>150</option>
                        </select>
                        &nbsp;entries
                      </label>
                    </div>
                  </div>
                </div>
                <div className="table-responsive mb-0">
                  <div className="table no-footer table-hover table-responsive-sm">
                    <table id="eventsListTbl" role="table" aria-busy="false" aria-colcount="9" className="table b-table">
                      <colgroup>
                        <col style={{ width: '200px' }} />
                        <col style={{ width: 'auto' }} />
                        <col style={{ width: 'auto' }} />
                        <col style={{ width: 'auto' }} />
                        <col style={{ width: 'auto' }} />
                        <col style={{ width: 'auto' }} />
                        <col style={{ width: 'auto' }} />
                        <col style={{ width: '250px' }} />
                        <col style={{ width: '200px' }} />
                      </colgroup>
                      <thead role="rowgroup">
                        <tr role="row">
                          <th role="columnheader" scope="col" aria-colindex="1"><div>User Name</div></th>
                          <th role="columnheader" scope="col" aria-colindex="2" className="text-right"><div>CR</div></th>
                          <th role="columnheader" scope="col" aria-colindex="3" className="text-right"><div>pts</div></th>
                          <th role="columnheader" scope="col" aria-colindex="4" className="text-right"><div>Client(P/L)</div></th>
                          <th role="columnheader" scope="col" aria-colindex="5" className="text-right"><div>Exposure</div></th>
                          <th role="columnheader" scope="col" aria-colindex="6" className="text-right"><div>Available pts</div></th>
                          <th role="columnheader" scope="col" aria-colindex="7"><div>Account Type</div></th>
                          <th role="columnheader" scope="col" aria-colindex="8"><div>Action</div></th>
                          <th role="columnheader" scope="col" aria-colindex="9"><div>Status</div></th>
                        </tr>
                      </thead>
                      <tbody role="rowgroup">
                        {/* {dummyData.map((user, idx) => ( */}

                        {data?.length > 0 ? (
                          data?.map((user, idx) => (
                            <tr key={idx} role="row">
                              <td aria-colindex="1" role="cell">
                                <span title={`${user.username} (${user.fullName})`} className="text-ellipsis">{user.username}</span>
                              </td>
                              <td aria-colindex="2" role="cell">
                                <p className="text-right mb-0">{user.cr}</p>
                              </td>
                              <td aria-colindex="3" role="cell">
                                <p className="text-right mb-0">{user.pts}</p>
                              </td>
                              <td aria-colindex="4" role="cell">
                                <p className="text-right mb-0">{user.clientPL}</p>
                              </td>
                              <td aria-colindex="5" role="cell">
                                <p className="text-right mb-0">{user.exposure}</p>
                              </td>
                              <td aria-colindex="6" role="cell">
                                <p className="text-right mb-0">{user.availablePts}</p>
                              </td>
                              <td aria-colindex="7" role="cell">{user.accountType}</td>
                              <td aria-colindex="8" role="cell">
                                <a
                                  href="javascript:void(0)"
                                  className="text-success"
                                  onClick={() =>
                                    handleAmountChange(
                                      user.id,
                                      Number(user.clientPL) > 0
                                        ? -Math.abs(Number(user.clientPL))
                                        : Math.abs(Number(user.clientPL))
                                    )
                                  }
                                >
                                  All <i className="fas fa-arrow-right"></i>
                                </a>
                                <input
                                  type="number"
                                  name="amount"
                                  placeholder="0"
                                  value={amounts[user.id] ?? 0}
                                  onChange={(e) =>
                                    handleAmountChange(user.id, e.target.value)
                                  }
                                  className="form-control form-control-sm transfer-amt d-inline-block mx-1"
                                  style={{ width: '122px' }}
                                />
                                <button
                                  className="btn btn-info btn-sm"
                                  type="button"
                                  onClick={() => handleTransfer(user)}
                                  disabled={rowLoading[user.id]}
                                >
                                  {rowLoading[user.id] ? "Loading..." : "Submit"}
                                </button>
                              </td>
                              <td aria-colindex="9" role="cell">
                                <span
                                  className={
                                    rowStatus[user.id]?.toLowerCase().includes("success")
                                      ? "text-success"
                                      : "text-danger"
                                  }
                                >
                                  {rowStatus[user.id]}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr role="row" className="b-table-empty-row">
                            <td colSpan="9" role="cell">
                              <div role="alert" aria-live="polite">
                                <div className="text-center my-2">
                                  {loading
                                    ? "Loading..."
                                    : searchKey
                                      ? "There are no records matching your request"
                                      : "There are no records to show"}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="row pt-3">
                  <div className="col">
                    <div className="dataTables_paginate paging_simple_numbers float-right">
                      <ul className="pagination pagination-rounded mb-0 float-right">

                        {/* First */}
                        <li
                          className={`page-item ${page === 1 ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                          >
                            «
                          </button>
                        </li>

                        {/* Previous */}
                        <li
                          className={`page-item ${page === 1 ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                          >
                            ‹
                          </button>
                        </li>

                        {/* Page Numbers */}
                        {[...Array(totalPages)].map((_, index) => {
                          const pageNumber = index + 1;

                          return (
                            <li
                              key={pageNumber}
                              className={`page-item ${page === pageNumber ? "active" : ""}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setPage(pageNumber)}
                              >
                                {pageNumber}
                              </button>
                            </li>
                          );
                        })}

                        {/* Next */}
                        <li
                          className={`page-item ${page === totalPages ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                          >
                            ›
                          </button>
                        </li>

                        {/* Last */}
                        <li
                          className={`page-item ${page === totalPages ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setPage(totalPages)}
                            disabled={page === totalPages}
                          >
                            »
                          </button>
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

export default Bank;
