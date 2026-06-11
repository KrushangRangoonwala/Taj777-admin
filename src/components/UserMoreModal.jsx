import React, { useState, useEffect } from 'react';
import { changeUserPassword, changeUserStatus, editUserProfile } from "../api/API";
import { errorToast, successToast } from '../utils/toast';

const UserMoreModal = ({ user, onClose, userdata, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('Profile');
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
    masterPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [lockForm, setLockForm] = useState({
  bet_status: user?.bst ? "1" : "0",
  accout_status: user?.ust ? "1" : "0",
  master_password: "",
});
  const [lockErrors, setLockErrors] = useState({});
  const [lockLoading, setLockLoading] = useState(false);

  console.log("UserMoreModal user:", userdata);

  const [editForm, setEditForm] = useState({
    fname: user?.fullName || user?.full_name || "",
    is_password_lock: user?.is_password_lock ? true : false,
    mpass: ""
  });

  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const UparentPartnership =
  (parseFloat(userdata?.user_partnership || 0) -
   parseFloat(user?.partnership || 0));

  const canProfile =
    userdata?.user_type != 8 ||
    userdata?.privileges?.includes("User Info");

  const canPasswordChange =
    userdata?.user_type != 8 ||
    userdata?.privileges?.includes("User Password Change");
    
  const canUserLock =
    userdata?.user_type != 8 ||
    userdata?.privileges?.includes("User Lock");

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  useEffect(() => {
    if (user) {
      setEditForm({
        fname: user.fullName || user.full_name || "",
        is_password_lock: user.is_password_lock ? true : false,
        mpass: ""
      });
    }
  }, [user]);

  const tabs = [
    { name: 'Profile', shortName: 'Profile' },
     Number(user.parent_id) === Number(userdata?.user_id) && canPasswordChange && { name: 'Change Password', shortName: 'C Pass' },
    canUserLock && { name: 'User lock', shortName: 'Lock' },
     Number(user.parent_id) === Number(userdata?.user_id) && { name: 'Account history', shortName: 'Acc history' },
     Number(user.parent_id) === Number(userdata?.user_id) && { name: 'Edit Profile', shortName: 'Edit Profile' },
  ].filter(Boolean);

  if (!user) return null;

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (password.length < 8) {
      return "The Password field must be at least 8 characters";
    }

    if (!regex.test(password)) {
      return "The password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number";
    }

    return "";
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    let error = "";

    if (name === "password") {
      if (!value.trim()) {
        error = "The Password field is required";
      } else {
        error = validatePassword(value.trim());
      }
    }

    if (name === "confirmPassword") {
      if (!value.trim()) {
        error = "The Confirm Password field is required";
      } else if (passwordForm.confirmPassword.trim().length < 8) {
          error = "The Confirm Password field must be at least 8 characters";
        }else if (
        passwordForm.password.trim() &&
        passwordForm.password.trim() !== value.trim()
      ) {
        error =
          "The Confirm Password confirmation does not match";
      }
    }

    if (name === "masterPassword") {
      if (!value.trim()) {
        error = "The Transaction Code field is required";
      }
    }

    setPasswordErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();

    const errors = {
      password: "",
      confirmPassword: "",
      masterPassword: "",
    };

    // Password
    if (!passwordForm.password.trim()) {
      errors.password = "The Password field is required";
    } else {
      errors.password = validatePassword(passwordForm.password.trim());
    }

    // Confirm Password
    if (!passwordForm.confirmPassword.trim()) {
      errors.confirmPassword =
        "The Confirm Password field is required";
    } else if (
      passwordForm.password.trim() !==
      passwordForm.confirmPassword.trim()
    ) {
      errors.confirmPassword =
        "The Confirm Password confirmation does not match";
    }

    // Transaction Code
    if (!passwordForm.masterPassword.trim()) {
      errors.masterPassword =
        "The Transaction Code field is required";
    }

    if (
      errors.password ||
      errors.confirmPassword ||
      errors.masterPassword
    ) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setPasswordLoading(true);

      const payload = {
        changepwd_user_id: user.id || user.Id,
        changepwd_password: passwordForm.password,
        changepwd_cpassword: passwordForm.confirmPassword,
        changepwd_master_password: passwordForm.masterPassword,
      };

      const res = await changeUserPassword(payload);

      if (res.status === "ok") {
        successToast(res.message || "Password changed successfully");

        onSuccess(); // Call the success callback

        setPasswordForm({
          password: "",
          confirmPassword: "",
          masterPassword: "",
        });

        setPasswordErrors({
          password: "",
          confirmPassword: "",
          masterPassword: "",
        });

        setActiveTab("Profile");
      } else {
        errorToast(res.message || "Failed to change password");
      }
    } catch (error) {
      console.error(error);
      errorToast("Something went wrong");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLockChange = (e) => {
    const { name, value, type, checked } = e.target;

    setLockForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
            ? "1"
            : "0"
          : value,
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
        accout_status: lockForm.accout_status == 1 ? 0 : 1,
        bet_status: lockForm.bet_status == 1 ? 0 : 1,
        master_password: lockForm.master_password,
      };

      // replace with your api function
      const res = await changeUserStatus(payload);

      if (res?.status === "ok") {
        successToast(res?.msg || "Status updated successfully");

        onSuccess(); // Call the success callback

        setLockForm((prev) => ({
          ...prev,
          master_password: "",
        }));

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

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    const val = type === "checkbox" ? checked : value;

    setEditForm((prev) => ({
      ...prev,
      [name]: val
    }));

    // 🔴 validation on change
    if (name === "fname" || name === "mpass") {
      setEditErrors((prev) => ({
        ...prev,
        [name]: val ? "" : "required"
      }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const errors = {};

    if (!editForm.fname.trim()) {
      errors.fname = "required";
    }

    if (!editForm.mpass.trim()) {
      errors.mpass = "required";
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    try {
      setEditLoading(true);

      const payload = {
        id: user?.id || user?.Id,
        full_name: editForm.fname,
        is_password_lock: editForm.is_password_lock ? 1 : 0,
        master_password: editForm.mpass
      };

      const res = await editUserProfile(payload);

      if (res?.status === "ok") {
        successToast(res.msg || "Profile updated successfully");
        onSuccess(); // Call the success callback
        onClose();
      } else {
        errorToast(res.msg || "Failed to update");
      }

    } catch (err) {
      console.error(err);
      errorToast("Something went wrong");
    } finally {
      setEditLoading(false);
    }
  };

  console.log("Rendering UserMoreModal with user:", user);

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, overflowY: 'auto' }} tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-xl" role="document">
        <div id="__BVID__3181___BV_modal_content_" tabIndex="-1" className="modal-content">
          <header id="__BVID__3181___BV_modal_header_" className="modal-header bg-primary">
            <h5 className="modal-title text-uppercase text-white">
              {user.username}
            </h5>
            <button type="button" aria-label="Close" className="close text-white" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', fontWeight: '700', lineHeight: '1', color: '#000', textShadow: '0 1px 0 #fff', opacity: '.5' }}>
              <span aria-hidden="true">×</span>
            </button>
          </header>
          <div id="__BVID__3181___BV_modal_body_" className="modal-body theme-bg">
            <div className="tabs" id="__BVID__3209">
              <div className="">
                <ul role="tablist" className="nav nav-tabs" id="__BVID__3209__BV_tab_controls_">
                  {tabs.map((tab) => (
                    <li key={tab.name} role="presentation" className="nav-item">
                      <a
                        role="tab"
                        aria-selected={activeTab === tab.name}
                        href="#"
                        target="_self"
                        className={`nav-link ${activeTab === tab.name ? 'active tab-bg-primary' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab(tab.name);
                        }}
                      >
                        <span className="d-inline-block d-sm-none">{tab.shortName}</span>
                        <span className="d-none d-sm-inline-block">{tab.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="tab-content text-muted" id="__BVID__3209__BV_tab_container_">
                {/* Profile Tab */}
                <div role="tabpanel" aria-hidden={activeTab !== 'Profile'} className={`tab-pane ${activeTab === 'Profile' ? 'active' : ''}`} style={{ display: activeTab === 'Profile' ? 'block' : 'none' }}>
                  <></>
                  { canProfile && (
                    <div className="row">
                      <div className="col-xl-6">
                        <div className="card text-center">
                          <div className="card-body p-2">
                            <div className="avatar-sm mx-auto mb-1">
                              <span className="avatar-title rounded-circle bg-soft-primary text-primary font-size-16 text-uppercase">
                                {user.username.charAt(0)}
                              </span>
                            </div>
                            <h5 className="font-size-15">
                              <a href="javascript: void(0);" className="text-dark">{user.username}</a>
                            </h5>
                            <p className="text-muted mb-1">{user.fullName}</p>
                          </div>
                          <div className="card-footer bg-transparent border-top">
                            <div className="contact-links d-flex font-size-20">
                              <div className="flex-fill">
                                <a title="" href="javascript: void(0);"><i className="bx bx-phone-call"></i></a>
                              </div>
                              <div className="flex-fill">
                                <a title={`City: ${user.fullName}`} href="javascript: void(0);"><i className="bx bxs-city"></i></a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="card personalinfo-card">
                          <div className="card-body">
                            <h4 className="card-title mb-4">Partnership Information</h4>
                            <div className="table-responsive mb-0">
                              <table className="table">
                                <tbody>
                                  <tr>
                                    <th scope="row" className="br-0">
                                      Partnership Name:
                                    </th>
                                    <td className="br-0">
                                      Partnership With No Return
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="row" className="br-0">User Part:</th>
                                    <td className="br-0">
                                      {parseFloat(user?.partnership || 0)}
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="row" className="br-0">Our Part:</th>
                                    <td className="br-0">
                                      {UparentPartnership}
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="row" className="br-0">Remark:</th>
                                    <td className="br-0">
                                      {user.remark || '-'}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-xl-6">
                        <div className="card">
                          <div className="card-body">
                            <h4 className="card-title mb-4">Additional Information</h4>
                            <div className="table-responsive mb-0">
                              <table className="table">
                                <tbody>
                                  {[
                                    {
                                      label: "User Name:",
                                      value: user.username || user.user_name || "-"
                                    },
                                    {
                                      label: "Full Name:",
                                      value: user.fullName || user.full_name || "-"
                                    },
                                    {
                                      label: "Mobile Number:",
                                      value: user.mobile || user.mobile_no || "-"
                                    },
                                    {
                                      label: "City:",
                                      value: user.city || "-"
                                    },
                                    {
                                      label: "Credit pts:",
                                      value: user.cr || user.credit || "0"
                                    },
                                    {
                                      label: "pts:",
                                      value: user.pts || user.points || "0"
                                    },
                                    {
                                      label: "Available pts:",
                                      value: user.availablePts || user.available_points || "0"
                                    },
                                    {
                                      label: "Client P/L:",
                                      value: user.clientPL || user.client_pl || "0"
                                    },
                                    {
                                      label: "Exposure:",
                                      value: user.exposure || "0"
                                    },
                                    {
                                      label: "Casino pts:",
                                      value: user.casino_pts || "0"
                                    },
                                    {
                                      label: "Sports pts:",
                                      value: user.sports_pts || "0"
                                    },
                                    {
                                      label: "Third Party pts:",
                                      value: user.third_party_pts || "0"
                                    },
                                    {
                                      label: "Created Date:",
                                      value: user.created_at || user.created_date || "-"
                                    }
                                  ].map((item, idx) => (
                                    <tr key={idx}>
                                      <th scope="row" className="br-0">{item.label}</th>
                                      <td className="br-0">{item.value}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Change Password Tab */}
                {canPasswordChange && (
                  <div role="tabpanel" aria-hidden={activeTab !== 'Change Password'} className={`tab-pane ${activeTab === 'Change Password' ? 'active' : ''}`} style={{ display: activeTab === 'Change Password' ? 'block' : 'none' }}>
                    <form data-vv-scope="UserChangePassword" method="post" onSubmit={handleChangePasswordSubmit}>
                      <div className="form-group row">
                        <label className="col-form-label col-4">Password</label>
                        <div className="col-8 form-group-feedback form-group-feedback-right">
                          <input
                            placeholder="Password"
                            type="password"
                            name="password"
                            className={`form-control ${passwordErrors.password ? "is-invalid" : ""}`}
                            value={passwordForm.password}
                            onChange={handlePasswordChange}
                          />
                          {passwordErrors.password && (
                            <small className="error">
                              {passwordErrors.password}
                            </small>
                          )}
                        </div>
                      </div>
                      <div className="form-group row">
                        <label className="col-form-label col-4">Confirm Password</label>
                        <div className="col-8 form-group-feedback form-group-feedback-right">
                          <input
                            placeholder="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            className={`form-control ${passwordErrors.confirmPassword ? "is-invalid" : ""}`}
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                          />
                          {passwordErrors.confirmPassword && (
                            <small className="error">
                              {passwordErrors.confirmPassword}
                            </small>
                          )}
                        </div>
                      </div>
                      <div className="form-group row">
                        <label className="col-form-label col-4">Transaction Code</label>
                        <div className="col-8 form-group-feedback form-group-feedback-right">
                          <input
                            placeholder="Transaction Code"
                            type="password"
                            name="masterPassword"
                            className={`form-control ${passwordErrors.masterPassword ? "is-invalid" : ""}`}
                            value={passwordForm.masterPassword}
                            onChange={handlePasswordChange}
                          />
                          {passwordErrors.masterPassword && (
                            <small className="error">
                              {passwordErrors.masterPassword}
                            </small>
                          )}
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col-12 text-right">
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={passwordLoading}
                          >
                            {passwordLoading ? "Submitting..." : "submit"}
                            <i className="fas fa-sign-in-alt ml-1"></i>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* User Lock Tab */}
                {canUserLock && (
                  <div role="tabpanel" aria-hidden={activeTab !== 'User lock'} className={`tab-pane ${activeTab === 'User lock' ? 'active' : ''}`} style={{ display: activeTab === 'User lock' ? 'block' : 'none' }}>
                    <form data-vv-scope="UserLock" method="post" onSubmit={handleUserLockSubmit}>
                      <div className="form-group row">
                        <label className="col-form-label col-4">Bet lock</label>
                        <div className="mb-1 custom-control custom-switch">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id="bet-lock"
                            name="bet_status"
                            checked={lockForm.bet_status === "1"}
                            onChange={handleLockChange}
                          />
                          <label className="custom-control-label" htmlFor="bet-lock"></label>
                        </div>
                      </div>
                      <div className="form-group row">
                        <label className="col-form-label col-4">User lock</label>
                        <div className="mb-1 custom-control custom-switch">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id="user-lock"
                            name="accout_status"
                            checked={lockForm.accout_status === "1"}
                            onChange={handleLockChange}
                          />
                          <label className="custom-control-label" htmlFor="user-lock"></label>
                        </div>
                      </div>
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
                )}

                {/* Account history Tab */}
                <div role="tabpanel" aria-hidden={activeTab !== 'Account history'} className={`tab-pane ${activeTab === 'Account history' ? 'active' : ''}`} style={{ display: activeTab === 'Account history' ? 'block' : 'none' }}>
                  <div className="table-responsive">
                    <div className="table no-footer table-responsive-sm">
                      <table id="eventsListTbl" role="table" className="table b-table">
                        <thead>
                          <tr role="row">
                            <th>Super User</th>
                            <th>User</th>
                            <th>Transfer From</th>
                            <th className="text-right">Amount</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody role="rowgroup">
                          <tr role="row">
                            <td>{userdata.user_name || "-"}</td>
                            <td>{user.username || "-"}</td>
                            <td>{userdata.user_name || "-"}</td>
                            <td><p className="text-right mb-0">{user.cr || "0"}</p></td>
                            <td><div>18/03/2026 12:39:30</div></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Edit Profile Tab */}
                <div role="tabpanel" aria-hidden={activeTab !== 'Edit Profile'} className={`tab-pane ${activeTab === 'Edit Profile' ? 'active' : ''}`} style={{ display: activeTab === 'Edit Profile' ? 'block' : 'none' }}>
                  <form data-vv-scope="editprofile" method="post" onSubmit={handleEditSubmit}>
                    <div className="form-group row">
                      <label className="col-form-label col-4">Full Name</label>
                      <div className="col-8 form-group-feedback-right pl-0">
                        <input
                          placeholder="Full Name"
                          type="text"
                          name="fname"
                          value={editForm.fname}
                          onChange={handleEditChange}
                          className={`form-control ${editErrors.fname ? "is-invalid" : ""}`}
                        />
                      </div>
                    </div>
                    <div className="form-group row align-items-center">
                      <label className="col-form-label col-4">Change Password Lock</label>
                      <div className="mb-1 custom-control custom-switch">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="password-lock"
                          name="is_password_lock"
                          checked={editForm.is_password_lock}
                          onChange={handleEditChange}
                        />
                        <label className="custom-control-label" htmlFor="password-lock"></label>
                      </div>
                    </div>
                    <div className="form-group row align-items-center">
                      <label className="col-form-label col-4">Favorite Master</label>
                      <div className="mb-1 custom-control custom-switch">
                        <input type="checkbox" className="custom-control-input" value="true" id="favorite-master" />
                        <label className="custom-control-label" htmlFor="favorite-master"></label>
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-form-label col-4">Transaction Code</label>
                      <div className="col-8 form-group-feedback-right pl-0">
                        <input
                          placeholder="Transaction Code"
                          type="password"
                          name="mpass"
                          value={editForm.mpass}
                          onChange={handleEditChange}
                          className={`form-control ${editErrors.mpass ? "is-invalid" : ""}`}
                        />
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-12 text-right">
                        <button type="submit" className="btn btn-primary" disabled={editLoading}>
                          {editLoading ? "Submitting..." : "submit"}
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

export default UserMoreModal;
