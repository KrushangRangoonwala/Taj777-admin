import React, { useState, useEffect } from 'react';
import { changeUserStatus } from "../api/API";
import { errorToast, successToast } from '../utils/toast';

const ChangeUserStatusModal = ({ user, onClose, onSuccess }) => {

  console.log("Selected user for status change:", user);

  const [lockForm, setLockForm] = useState({
    accout_status: "0",
    master_password: "",
  });

  const [lockErrors, setLockErrors] = useState({});
  const [lockLoading, setLockLoading] = useState(false);

  // ✅ set selected user data into form
  useEffect(() => {
    if (user) {
      setLockForm({
        accout_status: user?.status == 1 ? "1" : "0",
        master_password: "",
      });
    }
  }, [user]);

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  if (!user) return null;

  const handleLockChange = (e) => {
    const { name, value } = e.target;

    setLockForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (lockErrors[name]) {
      setLockErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleUserLockSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!lockForm.master_password?.trim()) {
      newErrors.master_password = "Transaction code is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setLockErrors(newErrors);
      return;
    }

    try {
      setLockLoading(true);

      const payload = {
        id: user?.id || user?.Id,
        accout_status: lockForm.accout_status,
        master_password: lockForm.master_password,
      };

      const res = await changeUserStatus(payload);

      if (res?.status === "ok") {
        successToast(res?.msg || "Status updated successfully");

        setLockForm((prev) => ({
          ...prev,
          master_password: "",
        }));

        if (onSuccess) {
          onSuccess();
        }

        onClose();
      } else {
        errorToast(res?.msg || res?.message || "Failed to update status");
      }

    } catch (error) {
      console.error(error);
      errorToast("Something went wrong");
    } finally {
      setLockLoading(false);
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
      onClick={onClose}
    >
      <div className="modal-dialog modal-md" role="document" onClick={(e) => e.stopPropagation()}>

        <div className="modal-content">

          <header className="modal-header bg-primary">
            <h5 className="modal-title text-uppercase text-white">
              Change User Status
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
                opacity: '.5'
              }}
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>

          <div className="modal-body theme-bg">

            <form onSubmit={handleUserLockSubmit}>

              {/* User lock */}
              <div className="form-group row">
                <label className="col-form-label col-4">User lock</label>
                <div className="mb-1 custom-control custom-switch">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="user-lock"
                    name="accout_status"
                    checked={lockForm.accout_status === "1"}
                    onChange={(e) =>
                      setLockForm((prev) => ({
                        ...prev,
                        accout_status: e.target.checked ? "1" : "0",
                      }))
                    }
                  />
                  <label className="custom-control-label" htmlFor="user-lock"></label>
                </div>
              </div>

              {/* Transaction Code */}
              <div className="form-group row">
                <label className="col-form-label col-4">Transaction Code</label>
                <div className="col-8 form-group-feedback-right pl-0">
                  <input
                    placeholder="Transaction Code"
                    type="password"
                    name="master_password"
                    className={`form-control ${lockErrors.master_password ? "is-invalid" : ""}`}
                    value={lockForm.master_password}
                    onChange={handleLockChange}
                  />

                  {lockErrors.master_password && (
                    <small className="error text-danger">
                      {lockErrors.master_password}
                    </small>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="form-group row">
                <div className="col-12 text-right">
                  <button type="submit" className="btn btn-primary" disabled={lockLoading}>
                    {lockLoading ? "Submitting..." : "submit"}
                    <i className="fas fa-sign-in-alt ml-1"></i>
                  </button>
                </div>
              </div>

            </form>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ChangeUserStatusModal;