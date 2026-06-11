import React, { useEffect, useState } from "react";

import {
  creditReferenceTransaction,
  creditReferenceHistory,
  apiBalance
} from "../api/API";

import {
  useDispatch,
  useSelector
} from "react-redux";

import {
  errorToast,
  successToast
} from "../utils/toast";

const CRModal = ({ user, onClose, onSuccess }) => {

  const dispatch = useDispatch();

  // ============================================
  // REDUX DATA
  // ============================================

  const username = useSelector(
    store => store.user.name
  );

  const useramount = useSelector(
    store => store.bet.balance.point
  );

  // ============================================
  // STATES
  // ============================================

  const [activeTab, setActiveTab] =
    useState("deposit");

  const [loading, setLoading] =
    useState(false);

  const [history, setHistory] =
    useState([]);

  const [formData, setFormData] =
    useState({
      amount: "",
      remark: "",
      mpassword: "",
    });

  // ============================================
  // EFFECT
  // ============================================

  useEffect(() => {

    document.body.classList.add("modal-open");

    fetchHistory();

    return () => {
      document.body.classList.remove("modal-open");
    };

  }, []);

  if (!user) return null;

  // ============================================
  // LIVE CALCULATIONS
  // ============================================

  const enteredAmount =
    Number(formData.amount || 0);

  // parent current
  const parentCurrent =
    Number(useramount || 0);

  // child current
  const childCurrent =
    Number(
      user.credit_reference ||
      user.cr ||
      0
    );

  // parent after
  const parentAfter =
    activeTab === "deposit"
      ? parentCurrent - enteredAmount
      : parentCurrent + enteredAmount;

  // child after
  const childAfter =
    activeTab === "deposit"
      ? childCurrent + enteredAmount
      : childCurrent - enteredAmount;

  // ============================================
  // FETCH HISTORY
  // ============================================

  const fetchHistory = async () => {

    try {

      const res =
        await creditReferenceHistory({
          user_id: user.id
        });

      if (res.status === "ok") {

        setHistory(res.data || []);
      }

    } catch (err) {

      console.log(err);
    }
  };

  // ============================================
  // INPUT CHANGE
  // ============================================

  const handleInputChange = (e) => {

    const { name, value } = e.target;

    // only numbers for amount
    if (name === "amount") {

      if (!/^\d*\.?\d*$/.test(value)) {
        return;
      }
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (
      !formData.amount ||
      !formData.remark ||
      !formData.mpassword
    ) {

      errorToast("All fields required");
      return;
    }

    try {

      setLoading(true);

      const payload = {

        user_name: user.id,

        transaction_type:
          activeTab === "deposit"
            ? 1
            : 2,

        transaction_points:
          Number(formData.amount),

        remark: formData.remark,

        master_password:
          formData.mpassword
      };

      const res =
        await creditReferenceTransaction(
          payload
        );

      if (res.status === "ok") {

        successToast(
          res.message ||
          "Success"
        );

        onSuccess();

        setFormData({
          amount: "",
          remark: "",
          mpassword: "",
        });

        await apiBalance(dispatch);

        fetchHistory();

      } else {

        errorToast(
          res.message ||
          "Something went wrong"
        );
      }

    } catch (err) {

      console.log(err);

      errorToast("API Error");

    } finally {

      setLoading(false);
    }
  };

  return (

    <div
      id="__BVID__3873"
      role="dialog"
      aria-describedby="__BVID__3873___BV_modal_body_"
      className="modal fade show"
      aria-modal="true"
      style={{ display: "block" }}
    >

      <div className="modal-dialog modal-lg">

        <span tabIndex="0"></span>

        <div
          id="__BVID__3873___BV_modal_content_"
          tabIndex="-1"
          className="modal-content"
        >

          {/* HEADER */}

          <header
            id="__BVID__3873___BV_modal_header_"
            className="modal-header bg-warning"
          >

            <h5 className="modal-title text-uppercase text-white">
              Credit Activity
            </h5>

            <button
              type="button"
              className="close text-white"
              onClick={onClose}
            >
              ×
            </button>

          </header>

          {/* BODY */}

          <div
            id="__BVID__3873___BV_modal_body_"
            className="modal-body credit-mdl"
          >

            <div className="tabs">

              {/* TABS */}

              <div>

                <ul
                  role="tablist"
                  className="nav nav-tabs"
                >

                  <li
                    role="presentation"
                    className="nav-item"
                  >

                    <a
                      href="#"
                      className={`nav-link ${
                        activeTab === "deposit"
                          ? "active tab-bg-warning"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("deposit");
                      }}
                    >
                      <span>
                        Credit Deposit
                      </span>
                    </a>

                  </li>

                  <li
                    role="presentation"
                    className="nav-item"
                  >

                    <a
                      href="#"
                      className={`nav-link ${
                        activeTab === "withdraw"
                          ? "active tab-bg-warning"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("withdraw");
                      }}
                    >
                      <span>
                        Credit Withdraw
                      </span>
                    </a>

                  </li>

                  <li
                    role="presentation"
                    className="nav-item"
                  >

                    <a
                      href="#"
                      className={`nav-link ${
                        activeTab === "history"
                          ? "active tab-bg-warning"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("history");
                      }}
                    >
                      <span>
                        Credit History
                      </span>
                    </a>

                  </li>

                </ul>

              </div>

              {/* CONTENT */}

              <div className="tab-content text-muted">

                {/* ============================================
                    DEPOSIT / WITHDRAW
                ============================================ */}

                {(activeTab === "deposit" ||
                  activeTab === "withdraw") && (

                  <div
                    role="tabpanel"
                    className="tab-pane active"
                  >

                    <form
                      method="post"
                      onSubmit={handleSubmit}
                    >

                      {/* PARENT */}

                      <div className="form-group row">

                        <label className="col-form-label col-4">
                          {username}
                        </label>

                        <div className="col-8">

                          <div className="row">

                            {/* CURRENT */}

                            <div className="col-6">

                              <input
                                placeholder="Amount"
                                type="text"
                                readOnly
                                className="form-control txt-right"
                                value={parentCurrent.toLocaleString()}
                              />

                            </div>

                            {/* AFTER */}

                            <div className="col-6">

                              <input
                                placeholder="Amount"
                                type="text"
                                readOnly
                                className="form-control txt-right"
                                value={parentAfter.toLocaleString()}
                              />

                            </div>

                          </div>

                        </div>

                      </div>

                      {/* CHILD */}

                      <div className="form-group row">

                        <label className="col-form-label col-4">
                          {user.username ||
                            user.user_name ||
                            user.name}
                        </label>

                        <div className="col-8">

                          <div className="row">

                            {/* CURRENT */}

                            <div className="col-6">

                              <input
                                placeholder="Amount"
                                type="text"
                                readOnly
                                className="form-control txt-right"
                                value={childCurrent.toLocaleString()}
                              />

                            </div>

                            {/* AFTER */}

                            <div className="col-6">

                              <input
                                placeholder="Amount"
                                type="text"
                                readOnly
                                className="form-control txt-right"
                                value={childAfter.toLocaleString()}
                              />

                            </div>

                          </div>

                        </div>

                      </div>

                      {/* AMOUNT */}

                      <div className="form-group row">

                        <label className="col-form-label col-4">
                          Amount
                        </label>

                        <div className="col-8 form-group-feedback form-group-feedback-right">

                          <input
                            placeholder="Amount"
                            type="text"
                            name="amount"
                            className="form-control txt-right"
                            value={formData.amount}
                            onChange={handleInputChange}
                          />

                        </div>

                      </div>

                      {/* REMARK */}

                      <div className="form-group row">

                        <label className="col-form-label col-4">
                          Remark
                        </label>

                        <div className="col-8 form-group-feedback form-group-feedback-right">

                          <textarea
                            placeholder="Remark"
                            name="remark"
                            className="form-control"
                            value={formData.remark}
                            onChange={handleInputChange}
                          ></textarea>

                        </div>

                      </div>

                      {/* TRANSACTION CODE */}

                      <div className="form-group row">

                        <label className="col-form-label col-4">
                          Transaction Code
                        </label>

                        <div className="col-8 form-group-feedback form-group-feedback-right">

                          <input
                            placeholder="Transaction Code"
                            name="mpassword"
                            type="password"
                            className="form-control"
                            value={formData.mpassword}
                            onChange={handleInputChange}
                          />

                        </div>

                      </div>

                      {/* BUTTON */}

                      <div className="form-group row">

                        <div className="col-12 text-right">

                          <button
                            type="submit"
                            disabled={loading}
                            className={`btn ${
                              activeTab === "deposit"
                                ? "btn-warning"
                                : "btn-danger"
                            }`}
                          >

                            {loading
                              ? "Please Wait..."
                              : activeTab === "deposit"
                              ? "Submit"
                              : "Withdraw"}

                            <i className="fas fa-sign-in-alt ml-1"></i>

                          </button>

                        </div>

                      </div>

                    </form>

                  </div>
                )}

                {/* ============================================
                    HISTORY
                ============================================ */}

                {activeTab === "history" && (

                  <div
                    role="tabpanel"
                    className="tab-pane active"
                  >

                    <div className="table-responsive">

                      <div className="table no-footer table-responsive-sm">

                        <table
                          role="table"
                          className="table b-table"
                        >

                          <thead>

                            <tr>

                              <th>
                                <div>Super User</div>
                              </th>

                              <th>
                                <div>User</div>
                              </th>

                              <th>
                                <div>Transfer From</div>
                              </th>

                              <th className="text-right">
                                <div>Amount</div>
                              </th>

                              <th>
                                <div>Date</div>
                              </th>

                            </tr>

                          </thead>

                          <tbody>

                            {history.length > 0 ? (

                              history.map(
                                (item, index) => (

                                <tr key={index}>

                                  <td>
                                    {item.from_user}
                                  </td>

                                  <td>
                                    {item.to_user}
                                  </td>

                                  <td>
                                    {item.from_user}
                                  </td>

                                  <td className="text-right">

                                    <p
                                      className={`mb-0 ${
                                        Number(item.amount) >= 0
                                          ? "text-success"
                                          : "text-danger"
                                      }`}
                                    >

                                      {Number(
                                        item.amount
                                      ).toLocaleString()}

                                    </p>

                                  </td>

                                  <td>

                                    <p className="mb-0">
                                      {item.datetime}
                                    </p>

                                  </td>

                                </tr>
                              ))

                            ) : (

                              <tr>

                                <td
                                  colSpan="5"
                                  className="text-center"
                                >
                                  No History Found
                                </td>

                              </tr>
                            )}

                          </tbody>

                        </table>

                      </div>

                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

        <span tabIndex="0"></span>

      </div>

    </div>
  );
};

export default CRModal;