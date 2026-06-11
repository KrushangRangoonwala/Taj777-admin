import React, { useState, useEffect } from 'react';
import { accountTransaction, apiBalance } from "../api/API";
import { useDispatch, useSelector } from 'react-redux';
import { errorToast, successToast } from '../utils/toast';

const WithdrawModal = ({ user, onClose }) => {

  const dispatch = useDispatch();

  // PARENT USER DATA
  const username = useSelector(store => store.user.name);
  const useramount = useSelector(store => store.bet.balance.point);

  const [formData, setFormData] = useState({
    amount: '',
    remark: '',
    mpassword: '',
  });

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    document.body.classList.add('modal-open');

    return () => {
      document.body.classList.remove('modal-open');
    };

  }, []);

  if (!user) return null;

  // ============================================
  // LIVE AMOUNT CALCULATION
  // ============================================

  const enteredAmount = Number(formData.amount || 0);

  // PARENT
  const parentCurrent = Number(useramount || 0);

  const parentAvailable = parentCurrent;

  // Withdraw = parent gets amount
  const parentAfterWithdraw = formData.amount
    ? (parentCurrent + enteredAmount)
    : parentAvailable;

  // CHILD
  const childCurrent =
    Number(user.availablePts || user.cr || 0);

  // Withdraw = child loses amount
  const childAfterWithdraw = formData.amount
    ? (childCurrent - enteredAmount)
    : 0;

  // =========================
  // PROFIT / LOSS
  // =========================
    const clientPL = Number(user.clientPL || 0);

    const plSecondBox = formData.amount
      ? (clientPL - enteredAmount)
      : 0;

  // ============================================
  // INPUT CHANGE
  // ============================================

  const handleInputChange = (e) => {

    const { name, value } = e.target;

    // ALLOW ONLY NUMBER
    if (name === "amount") {

      if (!/^\d*\.?\d*$/.test(value)) {
        return;
      }
    }

    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {

      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    const newErrors = {};

    if (!formData.amount)
      newErrors.amount = true;

    if (!formData.remark)
      newErrors.remark = true;

    if (!formData.mpassword)
      newErrors.mpassword = true;

    if (Object.keys(newErrors).length > 0) {

      setErrors(newErrors);

      return;
    }

    try {

      setLoading(true);

      const payload = {

        user_name: user.id,

        transaction_type: 2, // WITHDRAW

        transaction_points: Number(formData.amount),

        remark: formData.remark,

        master_password: formData.mpassword
      };

      const res = await accountTransaction(payload);

      if (res.status === "ok") {

        successToast(
          res.message || "Withdraw successful"
        );

        setFormData({
          amount: '',
          remark: '',
          mpassword: '',
        });

        await apiBalance(dispatch);

        onClose();

      } else {

        errorToast(
          res.message || "Something went wrong"
        );
      }

    } catch (err) {

      console.error(err);

      errorToast("Server error");

    } finally {

      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show"
      style={{
        display: 'block',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1050,
        overflowY: 'auto'
      }}
      tabIndex="-1"
      role="dialog"
    >

      <div
        className="modal-dialog"
        role="document"
      >

        <div
          id="__BVID__3116___BV_modal_content_"
          tabIndex="-1"
          className="modal-content"
        >

          {/* HEADER */}

          <header
            id="__BVID__3116___BV_modal_header_"
            className="modal-header bg-danger"
          >

            <h5 className="modal-title text-uppercase text-white">
              Withdraw
            </h5>

            <button
              type="button"
              aria-label="Close"
              className="close text-white"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                fontWeight: '700',
                lineHeight: '1',
                color: '#000',
                textShadow: '0 1px 0 #fff',
                opacity: '.5'
              }}
            >
              <span aria-hidden="true">×</span>
            </button>

          </header>

          {/* BODY */}

          <div
            id="__BVID__3116___BV_modal_body_"
            className="modal-body"
          >

            <div className="tabs" id="__BVID__3203">

              <div>

                <ul
                  role="tablist"
                  className="nav nav-tabs"
                  id="__BVID__3203__BV_tab_controls_"
                >

                  <li
                    role="presentation"
                    className="nav-item"
                  >

                    <a
                      role="tab"
                      aria-selected="true"
                      href="#"
                      target="_self"
                      className="nav-link active"
                      id="__BVID__3204___BV_tab_button__"
                    >
                      Withdraw
                    </a>

                  </li>

                </ul>

              </div>

              <div
                className="tab-content text-muted"
                id="__BVID__3203__BV_tab_container_"
              >

                <div
                  role="tabpanel"
                  aria-hidden="false"
                  className="tab-pane active"
                  id="__BVID__3204"
                >

                  <form
                    data-vv-scope="userWithdrawFrm"
                    method="post"
                    onSubmit={handleSubmit}
                  >

                    {/* PARENT USER */}

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
                              name="userWithdrawFrmloginusramount"
                              className="form-control txt-right"
                              value={parentCurrent.toLocaleString()}
                            />

                          </div>

                          {/* AFTER WITHDRAW */}

                          <div className="col-6">

                            <input
                              placeholder="Amount"
                              type="text"
                              readOnly
                              name="userWithdrawFrmloginusrNamount"
                              className="form-control txt-right"
                              value={parentAfterWithdraw.toLocaleString()}
                            />

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* CHILD USER */}

                    <div className="form-group row">

                      <label className="col-form-label col-4">
                        {user.username}
                      </label>

                      <div className="col-8">

                        <div className="row">

                          {/* CURRENT */}

                          <div className="col-6">

                            <input
                              placeholder="Amount"
                              type="text"
                              readOnly
                              name="userWithdrawFrmusrnameamount"
                              className="form-control txt-right"
                              value={childCurrent.toLocaleString()}
                            />

                          </div>

                          {/* AFTER WITHDRAW */}

                          <div className="col-6">

                            <input
                              placeholder="Amount"
                              type="text"
                              readOnly
                              name="userWithdrawFrmusrnameNamount"
                              className="form-control txt-right"
                              value={childAfterWithdraw.toLocaleString()}
                            />

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* PROFIT LOSS */}

                    <div className="form-group row">

                      <label className="col-form-label col-4">
                        Profit/Loss
                      </label>

                      <div className="col-8">

                        <div className="row">

                          <div className="col-6">

                            <input
                              placeholder="P/L"
                              type="text"
                              readOnly
                              name="userDipositepl"
                              className="form-control txt-right"
                              value={clientPL.toLocaleString()}
                            />

                          </div>

                          <div className="col-6">

                            <input
                              placeholder="P/L"
                              type="text"
                              readOnly
                              name="userDipositeplnew"
                              className="form-control txt-right"
                              value={plSecondBox.toLocaleString()}
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
                          className={`form-control txt-right ${errors.amount ? 'is-invalid' : ''
                            }`}
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
                          className={`form-control ${errors.remark ? 'is-invalid' : ''
                            }`}
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
                          className={`form-control ${errors.mpassword ? 'is-invalid' : ''
                            }`}
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
                          className="btn btn-danger"
                          disabled={loading}
                        >

                          {loading
                            ? "Processing..."
                            : "submit"}

                          <i className="fas fa-sign-in-alt ml-1"></i>

                        </button>

                      </div>

                    </div>

                  </form>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default WithdrawModal;