import React, { useState } from 'react';

const InsertUser = () => {
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
  });

  const [errors, setErrors] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.username) newErrors.username = 'The User Name field is required';
    if (!formData.fullname) newErrors.fullname = 'The Full Name field is required';
    if (!formData.password) newErrors.password = 'The Password field is required';
    if (!formData.cpassword) newErrors.cpassword = 'The Confirm Password field is required';
    if (!formData.mpassword) newErrors.mpassword = 'Transaction Code field is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Form Submitted:', formData);
    // Add submission logic here
  };

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
                      label="label"
                      data-vv-as="User Type"
                      className="form-control"
                      aria-required="true"
                      aria-invalid="false"
                      value={formData.newlvlno}
                      onChange={handleChange}
                    >
                      <option value="0">Select User Type</option>
                      <option value="4">Super Master</option>
                      <option value="5">Master</option>
                      <option value="6">Agent</option>
                      <option value="7">User</option>
                    </select>
                  </div>

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
                    <button type="submit" id="spinner-dark-8" className="btn btn-primary ml-2">
                      Submit
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
