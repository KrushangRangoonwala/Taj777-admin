import React, { useState, useEffect } from 'react';
import { accountTransaction } from "../api/API";

const DepositModal = ({ user, onClose }) => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

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
        user_name: user.id, // ✅ correct
        transaction_type: 1, // ✅ deposit
        transaction_points: Number(formData.amount),
        remark: formData.remark,
        master_password: formData.mpassword
      };

      const res = await accountTransaction(payload);

      if (res.status === "ok") {
        alert(res.message || "Deposit successful");

        // reset form
        setFormData({
          amount: '',
          remark: '',
          mpassword: '',
        });

        onClose();
      } else {
        alert(res.message || "Something went wrong");
      }

    } catch (err) {
      console.log(err);
      alert("API error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, overflowY: 'auto' }} tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document" style={{ width: '500px', maxWidth: '500px' }}>
        <div id="__BVID__3055___BV_modal_content_" tabIndex="-1" className="modal-content">
          <header id="__BVID__3055___BV_modal_header_" className="modal-header bg-success">
            <h5 className="modal-title text-uppercase text-white">Deposit</h5>
            <button type="button" aria-label="Close" className="close text-white" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', fontWeight: '700', lineHeight: '1', color: '#000', textShadow: '0 1px 0 #fff', opacity: '.5' }}>
              <span aria-hidden="true">×</span>
            </button>
          </header>
          <div id="__BVID__3055___BV_modal_body_" className="modal-body">
            <div className="tabs" id="__BVID__3083">
              <div className="">
                <ul role="tablist" className="nav nav-tabs" id="__BVID__3083__BV_tab_controls_">
                  <li role="presentation" className="nav-item">
                    <a role="tab" aria-selected="true" href="#" target="_self" className="nav-link active tab-bg-success" id="__BVID__3084___BV_tab_button__">Deposit</a>
                  </li>
                </ul>
              </div>
              <div className="tab-content text-muted" id="__BVID__3083__BV_tab_container_">
                <div role="tabpanel" aria-hidden="false" className="tab-pane active" id="__BVID__3084">
                  <form data-vv-scope="userdepositeMDL" method="post" onSubmit={handleSubmit}>
                    <div className="form-group row">
                      <label className="col-form-label col-4">Arpit526</label>
                      <div className="col-8">
                        <div className="row">
                          <div className="col-6">
                            <input placeholder="Amount" type="text" readOnly name="userDipositeloginusramount" className="form-control txt-right" defaultValue="2,000" />
                          </div>
                          <div className="col-6">
                            <input placeholder="Amount" type="text" readOnly name="userDipositeloginusrNamount" className="form-control txt-right" defaultValue="2,000" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-form-label col-4">{user.username}</label>
                      <div className="col-8">
                        <div className="row">
                          <div className="col-6">
                            <input placeholder="Amount" type="text" readOnly name="userDipositeusrnameamount" className="form-control txt-right" defaultValue={user.cr} />
                          </div>
                          <div className="col-6">
                            <input placeholder="Amount" type="text" readOnly name="userDipositeusrnameNamount" className="form-control txt-right" defaultValue={user.cr} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-form-label col-4">Profit/Loss</label>
                      <div className="col-8">
                        <div className="row">
                          <div className="col-6">
                            <input placeholder="P/L" type="text" readOnly name="userDipositepl" className="form-control txt-right" defaultValue="0" />
                          </div>
                          <div className="col-6">
                            <input placeholder="P/L" type="text" readOnly name="userDipositeplnew" className="form-control txt-right" defaultValue="0" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-form-label col-4">Amount</label>
                      <div className="col-8 form-group-feedback form-group-feedback-right">
                        <input
                          placeholder="Amount"
                          type="text"
                          name="amount"
                          className={`form-control txt-right ${errors.amount ? 'is-invalid' : ''}`}
                          value={formData.amount}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-form-label col-4">Remark</label>
                      <div className="col-8 form-group-feedback form-group-feedback-right">
                        <textarea
                          placeholder="Remark"
                          name="remark"
                          className={`form-control ${errors.remark ? 'is-invalid' : ''}`}
                          value={formData.remark}
                          onChange={handleInputChange}
                        ></textarea>
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-form-label col-4">Transaction Code</label>
                      <div className="col-8 form-group-feedback form-group-feedback-right">
                        <input
                          placeholder="Transaction Code"
                          name="mpassword"
                          type="password"
                          className={`form-control ${errors.mpassword ? 'is-invalid' : ''}`}
                          value={formData.mpassword}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-12 text-right">
                        <button type="submit" className="btn btn-success" disabled={loading}>
                          {loading ? "Processing..." : "submit"}
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

export default DepositModal;
