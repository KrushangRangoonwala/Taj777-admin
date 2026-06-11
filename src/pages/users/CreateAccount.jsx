import React, { useEffect, useState } from 'react';
import { checkUsername, createAccountApi, updateAccountApi, getPrivilegesApi, getMultiLoginUsersApi } from "../../api/API";
import { errorToast, successToast } from '../../utils/toast';
import { Link } from 'react-router-dom';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import ChangeUserStatusModal from '../../components/ChangeUserStatusModal';

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    uname: '',
    fullname: '',
    password: '',
    cpass: '',
    mpass: '',
  });

  const [usernameTimer, setUsernameTimer] = useState(null);
  const [isUsernameTaken, setIsUsernameTaken] = useState(0);

  const [privileges, setPrivileges] = useState([]); // ✅ dynamic
  const [selectedPrivileges, setSelectedPrivileges] = useState([]);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const [users, setUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedPasswordUser, setSelectedPasswordUser] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatusUser, setSelectedStatusUser] = useState(null);

  // ✅ label mapping
  const privilegeLabelMap = {
    "dashboard": "DashBoard",
    "account list": "User List",
    "create account": "Insert User",
    "our casino result": "Casino Result",
    "account list for active users": "active user",
    "multi login account": "Login User creation",
    "user register detail": "User Register Report",
    "total profit loss": "Total Profitloss",
    "user win loss": "User Winloss",
  };

  // ✅ fetch privileges
  useEffect(() => {
    fetchPrivileges();
    fetchUsers();
  }, []);

  const fetchPrivileges = async () => {
    try {
      const res = await getPrivilegesApi();

      if (res?.status === "ok") {
        const formatted = res.data.map((p) => ({
          id: String(p.id), // ensure string (important)
          name: privilegeLabelMap[p.name?.toLowerCase()] || p.name
        }));

        setPrivileges(formatted);
      }
    } catch (err) {
      console.error("Privileges fetch error", err);
    }
  };

  const fetchUsers = async () => {
    try {

      const res = await getMultiLoginUsersApi();

      if (res?.status === "ok") {

        const formattedUsers = res.data.map((u) => ({
          ...u,
          privileges: u.privileges.map((p) =>
            privilegeLabelMap[p?.toLowerCase()] || p
          )
        }));

        setUsers(formattedUsers);
      }

    } catch (err) {
      console.error("Users fetch error", err);
    }
  };

  const validateField = (name, value, currentFormData = formData) => {
    let error = "";
    switch (name) {
      case "uname":
        if (!value.trim()) error = "The User Name field is required";
        else if (value.length < 4) error = "The User Name field must be at least 4 characters";
        else if (!/^[a-zA-Z0-9]+$/.test(value)) error = "The User Name field may only contain alpha-numeric characters";
        else if (value.length > 15) error = "The User Name field may not be greater than 15 characters";
        break;

      case "fullname":
        if (!value.trim()) error = "The Full Name field is required";
        else if (value.length < 4) error = "The Full Name field must be at least 4 characters";
        else if (value.length > 50) error = "The Full Name field may not be greater than 50 characters";
        break;

      case "password":

        if (!isEdit) {

          if (value.length > 20)
            error = "The Password field may not be greater than 20 characters";

          else if (!value.trim())
            error = "The password field is required";

          else if (value.length < 8)
            error = "The Password field must be at least 8 characters";

          else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value))
            error = "The password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number";
        }

        break;

      case "cpass":

        if (!isEdit) {

          if (!value.trim())
            error = "The Confirm Password field is required";

          else if (value !== currentFormData.password)
            error = "The Confirm Password confirmation does not match";
        }

        break;

      case "mpass":
        if (!value.trim()) error = "Transaction Code field is required";
        break;

      default:
        break;
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({ ...prev, [name]: true }));

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      const error = validateField(name, value, newData);

      setErrors((prevErr) => ({ ...prevErr, [name]: error }));

      if (name === "password" && touched.cpass) {
        const cError = validateField("cpass", prev.cpass, newData);
        setErrors((prevErr) => ({ ...prevErr, cpass: cError }));
      }
      return newData;
    });

    // username check
    if (name === "uname") {
      if (usernameTimer) clearTimeout(usernameTimer);

      const timer = setTimeout(async () => {
        if (!value.trim()) {
          setIsUsernameTaken(0);
          return;
        }

        try {
          const res = await checkUsername({ username: value });
          setIsUsernameTaken(res?.exists ? -1 : 1);
        } catch (err) {
          console.error("Username check error", err);
        }
      }, 500);

      setUsernameTimer(timer);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // ✅ changed: use id
  const handlePrivilegeChange = (id) => {
    let updated;

    if (selectedPrivileges.includes(id)) {
      updated = selectedPrivileges.filter((p) => p !== id);
    } else {
      updated = [...selectedPrivileges, id];
    }

    setSelectedPrivileges(updated);

    setErrors({
      ...errors,
      privileges: updated.length === 0 ? 'The Privileges field is required' : null
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPrivileges(privileges.map((p) => p.id));
      setErrors({ ...errors, privileges: null });
    } else {
      setSelectedPrivileges([]);
      setErrors({ ...errors, privileges: 'The Privileges field is required' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const newErrors = {};
    const newTouched = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
      newTouched[key] = true;
    });

    if (selectedPrivileges.length === 0) {
      newErrors.privileges = 'The Privileges field is required';
    }

    setTouched(newTouched);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      errorToast("Please fill required fields");
      return;
    }

    try {
      const payload = {
        user_id: editUserId,
        user_full_name: formData.fullname,
        user_username: formData.uname,
        user_password: formData.password,
        master_password: formData.mpass,
        user_account_type: 8,
        privileges: selectedPrivileges.join(","),
      };

      const result = isEdit
        ? await updateAccountApi(payload)
        : await createAccountApi(payload);

      if (result.status === "ok") {
        successToast(result.message);

        resetForm();
        fetchUsers();

        setFormData({
          uname: '',
          fullname: '',
          password: '',
          cpass: '',
          mpass: '',
        });
        setSelectedPrivileges([]);
        setErrors({});
        setTouched({});
        setSubmitted(false);

      } else {
        setErrors({ api: result.message });
        errorToast(result.message);
      }

    } catch (err) {
      console.error(err);
      setErrors({ api: "API Error" });
      errorToast("API Error");
    }
  };

  const handleEditUser = (user) => {

    setIsEdit(true);

    setEditUserId(user.id);

    setFormData({
      uname: user.username,
      fullname: user.name,
      password: '',
      cpass: '',
      mpass: ''
    });

    // convert privilege names back to ids
    const selectedIds = privileges
      .filter((p) => user.privileges.includes(p.name))
      .map((p) => p.id);

    setSelectedPrivileges(selectedIds);

    setErrors({});
    setTouched({});
  };

  const resetForm = () => {

    setIsEdit(false);

    setEditUserId(null);

    setFormData({
      uname: '',
      fullname: '',
      password: '',
      cpass: '',
      mpass: '',
    });

    setSelectedPrivileges([]);
    setErrors({});
    setTouched({});
    setSubmitted(false);
  };

  return (
    <>

    <div data-v-5a10e370="">
      <div data-v-5a10e370="">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-flex align-items-center justify-content-between">
              <h4 className="mb-0 font-size-18">Multi Login Account</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <Link to="/admin/home">Home</Link>
                  </li>
                  <li className="breadcrumb-item active">
                    <span aria-current="location">Multi Login Account</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body create-account-container">
                <form method="post" data-vv-scope="userInsert" onSubmit={handleSubmit}>
                  <div className="create-account-form">
                    <div>
                      <h5 className="mb-0">Personal Information</h5>
                      <div className="row">
                        <div className="col-md-3 form-group">
                          <label>Client ID</label>
                          <input
                            type="text"
                            name="uname"
                            className={`form-control animation 
                              ${isUsernameTaken == -1 || (touched.uname && errors.uname)
                                ? 'is-invalid'
                                : isUsernameTaken == 1
                                  ? 'is-valid'
                                  : ''}`
                            }
                            value={formData.uname}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            disabled={isEdit}
                          />
                          {touched.uname && errors.uname && <small className="error">{errors.uname}</small>}
                        </div>
                        <div className="col-md-3 form-group">
                          <label>Full Name</label>
                          <input
                            type="text"
                            name="fullname"
                            className={`form-control ${touched.fullname && errors.fullname ? 'is-invalid' : ''}`}
                            value={formData.fullname}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                          />
                          {touched.fullname && errors.fullname && <small className="error">{errors.fullname}</small>}
                        </div>
                        {!isEdit && (
                          <div className="col-md-3 form-group">
                            <label>Password</label>

                            <input
                              type="password"
                              name="password"
                              className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`}
                              value={formData.password}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                            />

                            {touched.password && errors.password && (
                              <small className="error">{errors.password}</small>
                            )}
                          </div>
                        )}
                        {!isEdit && (
                          <div className="col-md-3 form-group">

                            <label>Confirm Password</label>

                            <input
                              type="password"
                              name="cpass"
                              className={`form-control ${touched.cpass && errors.cpass ? 'is-invalid' : ''}`}
                              value={formData.cpass}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                            />

                            {touched.cpass && errors.cpass && (
                              <small className="error">{errors.cpass}</small>
                            )}

                          </div>
                        )}

                      </div>
                    </div>

                    <div className="mt-2 previlages">
                      <h5 className="mb-0">Privileges</h5>
                      <div className="previlage-box">
                        <div className="previlage-item">
                          <div>
                            <div className="custom-control custom-checkbox">
                              <input
                                type="checkbox"
                                className="custom-control-input"
                                id="select-all"
                                onChange={handleSelectAll}
                                checked={selectedPrivileges.length === privileges.length}
                              />
                              <label className="custom-control-label" htmlFor="select-all">All</label>
                            </div>
                          </div>
                        </div>
                        <br />
                        {privileges.map((p) => (
                          <div key={p.id} className="previlage-item">
                            <div>
                              <div className={`custom-control custom-checkbox ${errors.privileges ? 'is-invalid' : ''}`}>
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  id={p.id}
                                  checked={selectedPrivileges.includes(p.id)}
                                  onChange={() => handlePrivilegeChange(p.id)}
                                />
                                <label className="custom-control-label" htmlFor={p.id}>{p.name}</label>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {errors.privileges && <small className="error">{errors.privileges}</small>}

                      <div className="previlage-master mt-2">
                        <div className="form-group mb-0 ml-3px-child">
                          <input
                            type="password"
                            name="mpass"
                            placeholder="Transaction Code"
                            className={`form-control dark-placeholder mpass-text ${touched.mpass && errors.mpass ? 'is-invalid' : ''}`}
                            value={formData.mpass}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                          />

                          <button type="submit" className="btn btn-success ml-3px-child">Submit</button>
                          <button
                            type="button"
                            className="btn btn-light ml-3px-child"
                            onClick={resetForm}
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="outer mt-4">
                  <div className="inner">
                    {/* <div className="table table-bordered"> */}
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th className="fixed-col-1">Action</th>
                          <th className="fixed-col-2">Username</th>
                          <th className="fixed-col-3">IsAuth</th>
                          <th className="fixed-col-4">Full Name</th>

                          {privileges.map((p) => (
                            <th key={p.id} style={{ alignContent: "center" }}>
                              {p.name}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>

                        {users.length > 0 ? (
                          users.map((user) => (

                            <tr key={user.id}>

                              <td className="fixed-col-1">

                                <a
                                  href="javascript:void(0)"
                                  className="text-white btn btn-primary"
                                  onClick={() => handleEditUser(user)}
                                >
                                  U
                                </a>{" "}

                                <a
                                  href="javascript:void(0)"
                                  className="text-white btn btn-info"
                                  onClick={() => {
                                    setSelectedStatusUser(user);
                                    setShowStatusModal(true);
                                  }}
                                >
                                  S
                                </a>{" "}

                                <a
                                  href="javascript:void(0)"
                                  className="text-white btn btn-success"
                                  onClick={() => {

                                      setSelectedPasswordUser(user);

                                      setShowPasswordModal(true);
                                  }}
                              >
                                  P
                              </a>

                              </td>

                              <td className="fixed-col-2">

                                {user.username}

                                <i className="text-success fas fa-check pl-2"></i>

                              </td>

                              <td className="fixed-col-3">

                                {user.status == 1 ? "Active" : "Inactive"}

                              </td>

                              <td className="fixed-col-4">

                                {user.name}

                              </td>

                              {privileges.map((p) => {

                                const hasPrivilege = user.privileges.includes(p.name);

                                return (
                                  <td
                                    key={p.id}
                                    className="text-center"
                                  >
                                    <i
                                      className={
                                        hasPrivilege
                                          ? "fas fa-check-circle"
                                          : "far fa-circle"
                                      }
                                    ></i>
                                  </td>
                                );
                              })}

                            </tr>

                          ))
                        ) : (

                          <tr>
                            <td
                              colSpan={4 + privileges.length}
                              className="text-center"
                            >
                              No Data Found
                            </td>
                          </tr>

                        )}

                      </tbody>
                    </table>
                    {/* </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <ChangePasswordModal
          show={showPasswordModal}
          onHide={() => {

              setShowPasswordModal(false);

              setSelectedPasswordUser(null);
          }}
          selectedUserId={selectedPasswordUser?.id}
          isMultiUser={true}
      />

      {showStatusModal && (
        <ChangeUserStatusModal
          user={selectedStatusUser}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedStatusUser(null);
          }}
          onSuccess={() => {
            fetchUsers();
          }}
        />
      )}
    </>
  );
};

export default CreateAccount;