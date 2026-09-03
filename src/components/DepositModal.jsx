import React, { useState, useEffect } from 'react';
import { accountTransaction, apiBalance } from "../api/API";
import { useDispatch, useSelector } from 'react-redux';
import { errorToast, successToast } from '../utils/toast';

const DepositModal = ({ user, onClose, onSuccess }) => {
  console.log("DepositModal user:", user); // debug
  const dispatch = useDispatch();
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

  // =========================
  // INPUT AMOUNT
  // =========================
  const enteredAmount = Number(formData.amount || 0);

  // =========================
  // PARENT BALANCE
  // =========================
  const parentCurrent = Number(useramount || 0);

  const parentAvailable = parentCurrent;

  const parentAfterDeposit = formData.amount
    ? (parentCurrent - enteredAmount)
    : parentAvailable;

  // =========================
  // CHILD BALANCE
  // =========================
  const childCurrent = Number(
    user.balance ||
    user.point ||
    user.amount ||
    user.availablePts ||
    0
  );

  const childAfterDeposit = formData.amount
    ? (childCurrent + enteredAmount)
    : 0;

  // =========================
  // PROFIT / LOSS
  // =========================
  const clientPL = Number(user.clientPL || 0);

  const plSecondBox = formData.amount
    ? (clientPL + enteredAmount)
    : 0;

  // =========================
  // INPUT HANDLER
  // =========================
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
      if (!/^\d*\.?\d*$/.test(value)) return;
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

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.amount) newErrors.amount = true;
    if (!formData.remark) newErrors.remark = true;
    if (!formData.mpassword) newErrors.mpassword = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        user_name: user.id,
        transaction_type: 1,
        transaction_points: Number(formData.amount),
        remark: formData.remark,
        master_password: formData.mpassword
      };

      const res = await accountTransaction(payload);

      if (res.status === "ok") {
        successToast(res.message || "Deposit successful");

        onSuccess();

        setFormData({
          amount: '',
          remark: '',
          mpassword: '',
        });

        await apiBalance(dispatch);
        onClose();

      } else {
        errorToast(res.message || "Something went wrong");
      }

    } catch (err) {
      console.log(err);
      errorToast("API error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, overflowY: 'auto' }} tabIndex="-1" role="dialog" onClick={onClose}>
      <div className="modal-dialog" role="document" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">

          <header className="modal-header bg-success">
            <h5 className="modal-title text-uppercase text-white">Deposit</h5>
            <button onClick={onClose} className="close text-white">×</button>
          </header>

          <div className="modal-body">

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
                      Deposit
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

                    {/* ================= PARENT ================= */}
                    <div className="form-group row">
                      <label className="col-4">{username}</label>
                      <div className="col-8">
                        <div className="row">

                          <div className="col-6">
                            <input
                              readOnly
                              className="form-control txt-right"
                              value={parentAvailable.toLocaleString()}
                            />
                          </div>

                          <div className="col-6">
                            <input
                              readOnly
                              className="form-control txt-right"
                              value={parentAfterDeposit === 0 ? "0" : parentAfterDeposit.toLocaleString()}
                            />
                          </div>

                        </div>

                      </div>
                    </div>

                    {/* ================= CHILD ================= */}
                    <div className="form-group row">
                      <label className="col-4">
                        {user.username || user.name}
                      </label>

                      <div className="col-8">
                        <div className="row">
                          <div className="col-6">
                            <input
                              readOnly
                              className="form-control txt-right"
                              value={childCurrent.toLocaleString()}
                            />
                          </div>

                          <div className="col-6">
                            <input
                              readOnly
                              className="form-control txt-right"
                              value={childAfterDeposit.toLocaleString()}
                            />
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* ================= P/L ================= */}
                    <div className="form-group row">
                      <label className="col-4">Profit/Loss</label>

                      <div className="col-8">
                        <div className="row">
                            <div className="col-6">
                              <input
                                readOnly
                                className="form-control txt-right"
                                value={clientPL.toLocaleString()}
                              />
                            </div>

                            <div className="col-6">
                              <input
                                readOnly
                                className="form-control txt-right"
                                value={plSecondBox.toLocaleString()}
                              />
                            </div>

                        </div>

                      </div>
                    </div>

                    {/* ================= AMOUNT ================= */}
                    <div className="form-group row">
                      <label className="col-4">Amount</label>
                      <div className="col-8">
                        <input
                          name="amount"
                          placeholder="Amount"
                          value={formData.amount}
                          onChange={handleInputChange}
                          className={`form-control txt-right ${errors.amount ? 'is-invalid' : ''}`}
                        />
                      </div>
                    </div>

                    {/* ================= REMARK ================= */}
                    <div className="form-group row">
                      <label className="col-4">Remark</label>
                      <div className="col-8">
                        <textarea
                          name="remark"
                          placeholder="Remark"
                          value={formData.remark}
                          onChange={handleInputChange}
                          className={`form-control ${errors.remark ? 'is-invalid' : ''}`}
                        />
                      </div>
                    </div>

                    {/* ================= PASSWORD ================= */}
                    <div className="form-group row">
                      <label className="col-4">Transaction Code</label>
                      <div className="col-8">
                        <input
                          type="password"
                          placeholder="Transaction Code"
                          name="mpassword"
                          value={formData.mpassword}
                          onChange={handleInputChange}
                          className={`form-control ${errors.mpassword ? 'is-invalid' : ''}`}
                        />
                      </div>
                    </div>

                    {/* ================= SUBMIT ================= */}
                    
                    <div className="form-group row">

                      <div className="col-12 text-right">

                        <button
                          onClick={handleSubmit}
                          className="btn btn-success"
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
  );
};

export default DepositModal;