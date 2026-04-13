import React, { useState,useEffect } from 'react';
import { insertUser } from "../../api/API";

const InsertUser = () => {

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
    spart1: '',
    remark: '',
    mpassword: '',
    changePasswordLock: false,
  });

  const [loginUserPower, setLoginUserPower] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const renderAccountTypeOptions = () => {
    if (!loginUser) return null;

    console.log("loginUser",loginUser);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    // Required validations
    if (!formData.username.trim()) {
      newErrors.username = 'The User Name field is required';
    }

    if (!formData.fullname.trim()) {
      newErrors.fullname = 'The Full Name field is required';
    }

    if (!formData.password) {
      newErrors.password = 'The Password field is required';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        'Password must be at least 8 characters and contain uppercase, lowercase and number';
    }

    if (!formData.cpassword) {
      newErrors.cpassword = 'The Confirm Password field is required';
    } else if (formData.password !== formData.cpassword) {
      newErrors.cpassword =
        'The Confirm Password confirmation does not match';
    }

    if (!formData.newlvlno || formData.newlvlno === '0') {
      newErrors.newlvlno = 'Please select User Type';
    }

    if (!formData.mpassword.trim()) {
      newErrors.mpassword = 'Transaction Code field is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
      };

      const res = await insertUser(payload);

      if (res?.status === 'ok') {
        alert(res?.message || 'User created successfully');

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

        setErrors({});
      } else {
        alert(res?.message || 'Failed to create user');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong');
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
                    <a href="/admin/home" className="" target="_self">Home</a>
                  </li>
                  <li className="breadcrumb-item">
                    <a href="/admin/activeusers" className="" target="_self">Users</a>
                  </li>
                  <li className="breadcrumb-item active">
                    <span aria-current="location">Create Account</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <form data-vv-scope="InserUserAccount" method="post" onSubmit={handleSubmit}>
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
                      className={`form-control animation ${errors.username ? 'is-invalid' : ''}`}
                      aria-required="true"
                      aria-invalid={!!errors.username}
                      value={formData.username}
                      onChange={handleChange}
                    />
                    {errors.username && (
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
                      className={`form-control animation ${errors.fullname ? 'is-invalid' : ''}`}
                      aria-required="true"
                      aria-invalid={!!errors.fullname}
                      value={formData.fullname}
                      onChange={handleChange}
                    />
                    {errors.fullname && (
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
                      className={`form-control animation ${errors.password ? 'is-invalid' : ''}`}
                      aria-required="true"
                      aria-invalid={!!errors.password}
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {errors.password && (
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
                      className={`form-control animation ${errors.cpassword ? 'is-invalid' : ''}`}
                      aria-required="true"
                      aria-invalid={!!errors.cpassword}
                      value={formData.cpassword}
                      onChange={handleChange}
                    />
                    {errors.cpassword && (
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
                      className="form-control animation"
                      aria-required="false"
                      aria-invalid="false"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Mobile Number:</label>
                    <input
                      placeholder="Mobile Number"
                      type="text"
                      data-vv-as="Mobile Number"
                      name="mono"
                      maxLength="15"
                      className="form-control animation"
                      aria-required="false"
                      aria-invalid="false"
                      value={formData.mono}
                      onChange={handleChange}
                    />
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
                      data-vv-as="Credit Amount"
                      name="camt"
                      className="form-control"
                      aria-required="false"
                      aria-invalid="false"
                      value={formData.camt}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group tag-select">
                    <label>User Type: <span className="text-danger">*</span></label>
                      <select
                        name="newlvlno"
                        className="form-control"
                        value={formData.newlvlno}
                        onChange={handleChange}
                      >
                        {renderAccountTypeOptions()}
                      </select>
                      {errors.newlvlno && (
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
                            type="text"
                            name="spart1"
                            data-vv-as="Partnership With No Return"
                            maxLength="4"
                            className="form-control animation"
                            aria-required="true"
                            aria-invalid="false"
                            value={formData.spart1}
                            onChange={handleChange}
                          />
                          <p className="help is-success m-0 d-inline-block">
                            Our : 77.5 | Down Line: 0
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
                      className="form-control"
                      aria-required="false"
                      aria-invalid="false"
                      value={formData.remark}
                      onChange={handleChange}
                    ></textarea>
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
                      className={`form-control ${errors.mpassword ? 'is-invalid' : ''}`}
                      aria-required="true"
                      aria-invalid={!!errors.mpassword}
                      value={formData.mpassword}
                      onChange={handleChange}
                    />
                    {errors.mpassword && (
                      <small className="error d-block mt-1">
                        {errors.mpassword}
                      </small>
                    )}
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
