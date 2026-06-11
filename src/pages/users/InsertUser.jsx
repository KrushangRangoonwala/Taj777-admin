import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { insertUser, getRemainingPercentage, checkUsername } from "../../api/API";
import { errorToast, successToast } from '../../utils/toast';

const InsertUser = () => {

  const navigate = useNavigate();
  const [loginUser, setLoginUser] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("userdata");
    if (storedUser) {
      setLoginUser(JSON.parse(storedUser));
    }
  }, []);

  const [formData, setFormData] = useState({
    username: '',
    fullname: '',
    password: '',
    cpassword: '',
    city: '',
    mono: '',
    camt: '',
    newlvlno: '0',
    spart1: '0',
    remark: '',
    mpassword: '',
    changePasswordLock: false,
  });

  const [loginUserPower, setLoginUserPower] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [usernameTimer, setUsernameTimer] = useState(null);
  const [isUsernameTaken, setIsUsernameTaken] = useState(0);

  const [percentageData, setPercentageData] = useState({
    remaining: 0,
    totalUsed: 0,
  });

  useEffect(() => {
    const fetchPercentage = async () => {
      try {
        const res = await getRemainingPercentage();

        if (res?.status === "ok") {
          const remainingPercentage = Number(
            res.data.remaining_percentage
          );

          setPercentageData({
            remaining: remainingPercentage,
            totalUsed: Number(res.data.total_used_percentage),
          });

          // set default partnership value
          setFormData((prev) => ({
            ...prev,
            spart1: remainingPercentage
          }));
        }else {
          errorToast(res?.msg || res?.message || "Failed to fetch percentage data");
        }
      } catch (err) {
        console.error("Percentage API error", err);
      }
    };

    fetchPercentage();
  }, []);

  const maxPartnership = Number(
    percentageData.remaining || 0
  );

  const enteredPartnership = Number(
    formData.spart1 || 0
  );

  // OUR %
  const remaining = enteredPartnership;

  // DOWNLINE %
  const downline =
    maxPartnership - enteredPartnership;

  const renderAccountTypeOptions = () => {
    if (!loginUser) return null;

    // console.log("loginUser", loginUser);

    const power = Number(loginUser.user_type);

    return (
      <>
        <option value="0">Select User Type</option>

        {/* Super Master */}
        {power === 7 && (
          <option value="4">Super Master</option>
        )}

        {/* Master */}
        {(power < 5 || power === 7) && power >= 4 && (
          <option value="3">Master</option>
        )}

        {/* Agent */}
        {(power < 5 || power === 7) && power >= 3 && (
          <option value="2">Agent</option>
        )}

        {/* User */}
        {(power < 5 || power === 7) && (
          <option value="1">User</option>
        )}

        {/* King Admin */}
        {power === 5 && (
          <option value="7">King Admin</option>
        )}
      </>
    );
  };

  const validateField = (name, value, currentFormData = formData) => {
    let error = "";
    switch (name) {
      case "username":
        if (!value.trim()) {
          error = "The User Name field is required";
        } else if (value.length < 4) {
          error = "The User Name field must be at least 4 characters";
        } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
          error = "The User Name field may only contain alpha-numeric characters";
        } else if (value.length > 15) {
          error = "The User Name field may not be greater than 15 characters";
        }
        break;
      case "fullname":
        if (!value.trim()) {
          error = "The Full Name field is required";
        } else if (value.length < 4) {
          error = "The Full Name field must be at least 4 characters";
        } else if (value.length > 50) {
          error = "The Full Name field may not be greater than 50 characters";
        }
        break;
      case "password":
        if (value.length > 20) {
          error = "The Password field may not be greater than 20 characters";
        } else if (!value.trim()) {
          error = "The password field is required";
        } else if (value.length < 8) {
          error = "The Password field must be at least 8 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = "The password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number";
        }
        break;
      case "cpassword":
        if (!value.trim()) {
          error = "The Confirm Password field is required";
        } else if (value !== currentFormData.password) {
          error = "The Confirm Password confirmation does not match";
        }
        break;
      case "spart1":
        if (!String(value)) {
          error = "The Partnership With No Return field is required";
        }
        break;
      case "mpassword":
        if (!value.trim()) {
          error = "true";
        }
        break;
      case "city":
        if (value?.length === 0) break; // if field is empty, don't show error
        if (value?.length < 3) {
          error = "The City field must be at least 3 characters";
        } else if (value?.length > 20) {
          error = "The City field may not be greater than 20 characters";
        }
        break;
      case "mono":
        if (value?.length === 0) break; // if field is empty, don't show error
        if (!/^\d+$/.test(value)) {
          error = "The Mobile Number field may only contain numeric characters";
        } else if (value?.length < 10) {
          error = "The Mobile Number field must be at least 10 characters";
        }
        break;
      case "camt":
        if (value?.length > 20) {
          error = "The Credit Amount field may not be greater than 20 characters";
        }
        break;
      case "remark":
        if (value?.length > 500) {
          error = "The Remark field may not be greater than 500 characters";
        }
        break;
      // case "newlvlno":
      //   if (!value || value === "0") {
      //     error = "Please select User Type";
      //   }
      //   break;
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

    let updatedValue = value;

    // PARTNERSHIP CLAMP
    // setTimeout(() => {
    if (name === "spart1") {
      // let num = Number(value);
      let num = value;
      // console.log("##### ", num, percentageData.remaining)
      // if (isNaN(num)) num = 0;
      if (num > percentageData.remaining) num = percentageData.remaining;
      if (num < 0) num = 0;

      updatedValue = num;
    }
    // }, 400)

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: updatedValue,
      };

      const error = validateField(name, updatedValue, newData);
      setErrors((prevErr) => ({
        ...prevErr,
        [name]: error,
      }));

      // Special case for password change: validate cpassword as well
      if (name === "password" && touched.cpassword) {
        const cError = validateField("cpassword", prev.cpassword, newData);
        setErrors((prevErr) => ({
          ...prevErr,
          cpassword: cError,
        }));
      }

      return newData;
    });

    if (name === "username") {
      if (usernameTimer) {
        clearTimeout(usernameTimer);
      }

      const timer = setTimeout(async () => {
        if (!updatedValue.trim()) {
          setIsUsernameTaken(0);
          return;
        }

        try {
          const res = await checkUsername({
            username: updatedValue,
          });

          if (res?.exists) {
            setIsUsernameTaken(-1);
          } else {
            setIsUsernameTaken(1);
          }
        } catch (err) {
          console.error("Username check error", err);
        }
      }, 500);

      setUsernameTimer(timer);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const newTouched = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
      newTouched[key] = true;
    });

    setTouched(newTouched);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        user_full_name: formData.fullname,
        user_username: formData.username,
        user_password: formData.password,
        user_cpassword: formData.cpassword,
        user_phone: formData.mono || '',
        user_city: formData.city || '',
        user_account_type: formData.newlvlno,
        user_credit_reference: formData.camt || 0,
        user_exposure_limit: 0,
        min_stake: 0,
        max_stake: 0,
        partnership: formData.spart1 || 0,
        master_password: formData.mpassword,
        changePasswordLock: formData.changePasswordLock ? 1 : 0,
        remark: formData.remark || '',
      };

      const res = await insertUser(payload);

      if (res?.status === 'ok') {
        successToast(res?.message || 'User created successfully');

        setFormData({
          username: '',
          fullname: '',
          password: '',
          cpassword: '',
          city: '',
          mono: '',
          camt: '',
          newlvlno: '0',
          spart1: '',
          remark: '',
          mpassword: '',
        });
        navigate("/admin/activeusers");

        setErrors({});
      } else {
        errorToast(res?.message || 'Failed to create user');
      }
    } catch (error) {
      console.error(error);
      errorToast('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const isUserTypeSelected = String(formData.newlvlno) === "1";

  return (
    <div data-v-5a10e370="">
      <div data-v-5a10e370="">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-flex align-items-center justify-content-between">
              <h4 className="mb-0 font-size-18">Create Account</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <Link to="/admin/home" className="" target="_self">Home</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/admin/activeusers" className="" target="_self">Users</Link>
                  </li>
                  <li className="breadcrumb-item active">
                    <span aria-current="location">Create Account</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <form data-vv-scope="InserUserAccount" className="dark-placeholder" method="post" onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">General Information</h4>

                  <div className="form-group">
                    <label>User name: <span className="text-danger">*</span></label>
                    <input
                      placeholder="User Name"
                      type="text"
                      name="username"
                      data-vv-as="User Name"
                      autoComplete="new-password"
                      className={`form-control animation 
                        ${isUsernameTaken == -1 || (touched.username && errors.username)
                          ? 'is-invalid'
                          : isUsernameTaken == 1
                            ? 'is-valid'
                            : ''}`
                      } // if username exist then apply 'is-invalid' or if username exist and username have no error then apply 'is-valid'
                      aria-required="true"
                      aria-invalid={!!errors.username}
                      value={formData.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.username && errors.username && (
                      <small className="error">{errors.username}</small>
                    )}

                  </div>

                  <div className="form-group">
                    <label>Full Name: <span className="text-danger">*</span></label>
                    <input
                      placeholder="Full Name"
                      data-vv-as="Full Name"
                      type="text"
                      name="fullname"
                      className={`form-control animation ${touched.fullname && errors.fullname ? 'is-invalid' : ''}`}
                      aria-required="true"
                      aria-invalid={!!errors.fullname}
                      value={formData.fullname}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.fullname && errors.fullname && (
                      <small className="error">{errors.fullname}</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Password: <span className="text-danger">*</span></label>
                    <input
                      placeholder="Password"
                      type="password"
                      data-vv-as="Password"
                      name="password"
                      className={`form-control animation ${touched.password && errors.password ? 'is-invalid' : ''}`}
                      aria-required="true"
                      aria-invalid={!!errors.password}
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.password && errors.password && (
                      <small className="error">{errors.password}</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Confirm Password: <span className="text-danger">*</span></label>
                    <input
                      placeholder="Confirm Password"
                      type="password"
                      data-vv-as="Confirm Password"
                      name="cpassword"
                      className={`form-control animation ${touched.cpassword && errors.cpassword ? 'is-invalid' : ''}`}
                      aria-required="true"
                      aria-invalid={!!errors.cpassword}
                      value={formData.cpassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.cpassword && errors.cpassword && (
                      <small className="error">{errors.cpassword}</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>City:</label>
                    <input
                      placeholder="City"
                      type="text"
                      data-vv-as="City"
                      name="city"
                      className={`form-control animation ${touched.city && errors.city ? 'is-invalid' : ''}`}
                      aria-required="false"
                      aria-invalid={!!errors.city}
                      value={formData.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.city && errors.city && (
                      <small className="error">{errors.city}</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Mobile Number:</label>
                    <input
                      placeholder="Mobile Number"
                      type="text"
                      data-vv-as="Mobile Number"
                      name="mono"
                      maxLength="15"
                      className={`form-control animation ${touched.mono && errors.mono ? 'is-invalid' : ''}`}
                      aria-required="false"
                      aria-invalid={!!errors.mono}
                      value={formData.mono}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.mono && errors.mono && (
                      <small className="error">{errors.mono}</small>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <div className="form-group">
                    <label>Credit Amount:</label>
                    <input
                      placeholder="Credit Amount"
                      type="number"
                      step="1"
                      min={Math.floor(formData.camt)}
                      // max={Math.ceil(formData.camt)}
                      max={99999999999999999999}
                      data-vv-as="Credit Amount"
                      name="camt"
                      className={`form-control animation ${touched.camt && errors.camt ? 'is-invalid' : ''}`}
                      aria-required="false"
                      aria-invalid={!!errors.camt}
                      value={formData.camt}
                      onChange={handleChange}
                    />
                    {touched.camt && errors.camt && (
                      <small className="error">{errors.camt}</small>
                    )}
                  </div>

                  <div className="form-group tag-select">
                    <label>User Type: <span className="text-danger">*</span></label>
                    <select
                      name="newlvlno"
                      className={`form-control animation ${touched.newlvlno && errors.newlvlno ? 'is-invalid' : ''}`}
                      value={formData.newlvlno}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      {renderAccountTypeOptions()}
                    </select>
                    {touched.newlvlno && errors.newlvlno && (
                      <small className="error">{errors.newlvlno}</small>
                    )}
                  </div>

                  {!isUserTypeSelected && (
                    <>
                      <h4 className="card-title">Partnership Information</h4>
                      <div>
                        <div className="form-group">
                          <label>Partnership With No Return:</label>
                          <input
                            placeholder="Partnership With No Return"
                            type="number"
                            name="spart1"
                            data-vv-as="Partnership With No Return"
                            maxLength="4"
                            className="form-control animation"
                            aria-required="true"
                            aria-invalid="false"
                            value={formData.spart1}
                            onChange={handleChange}
                          />
                          {errors.spart1 && (
                            <small className="error">{errors.spart1}{' '}</small>
                          )}
                          <p className="help is-success m-0 d-inline-block">
                            Our : {remaining} | Down Line: {downline >= 0 ? downline : 0}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label>Remark:</label>
                    <textarea
                      placeholder="Remark"
                      data-vv-as="Remark"
                      name="remark"
                      className={`form-control animation ${touched.remark && errors.remark ? 'is-invalid' : ''}`}
                      aria-required="false"
                      aria-invalid={!!errors.remark}
                      value={formData.remark}
                      onChange={handleChange}
                    ></textarea>
                    {touched.remark && errors.remark && (
                      <small className="error">{errors.remark}</small>
                    )}
                  </div>

                  {isUserTypeSelected && (
                    <div className="form-group mb-3">
                      <div className="mb-2 custom-control custom-switch">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="change-password-lock"
                          checked={formData.changePasswordLock || false}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              changePasswordLock: e.target.checked,
                            })
                          }
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="change-password-lock"
                        >
                          Change Password Lock
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="d-flex justify-content-end align-items-center">
                    <input
                      placeholder="Transaction Code"
                      type="password"
                      name="mpassword"
                      className={`form-control ${touched.mpassword && errors.mpassword ? 'is-invalid' : ''}`}
                      aria-required="true"
                      aria-invalid={!!errors.mpassword}
                      value={formData.mpassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {/* {errors.mpassword && (
                      <small className="error d-block mt-1">
                        {errors.mpassword}
                      </small>
                    )} */}
                    <button
                      type="submit"
                      id="spinner-dark-8"
                      className="btn btn-primary ml-2"
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InsertUser;
