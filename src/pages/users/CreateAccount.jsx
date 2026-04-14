import React, { useState } from 'react';
import { createAccountApi } from "../../api/API";

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    uname: '',
    fullname: '',
    password: '',
    cpass: '',
    mpass: '',
  });

  const [selectedPrivileges, setSelectedPrivileges] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const privileges = [
    { id: '2386', name: 'DashBoard', value: '1' },
    { id: '2387', name: 'Market Analysis', value: '2' },
    { id: '2388', name: 'User List', value: '4' },
    { id: '2389', name: 'Insert User', value: '5' },
    { id: '2390', name: 'Bank', value: '6' },
    { id: '2391', name: 'Account Statement', value: '8' },
    { id: '2392', name: 'Party Win Loss', value: '9' },
    { id: '2393', name: 'Current Bets', value: '10' },
    { id: '2394', name: 'User History', value: '11' },
    { id: '2395', name: 'General Lock', value: '12' },
    { id: '2396', name: 'Casino Result', value: '13' },
    { id: '2397', name: 'Live Casino Result', value: '14' },
    { id: '2398', name: 'Our Casino', value: '15' },
    { id: '2399', name: 'Events', value: '16' },
    { id: '2400', name: 'Market Search Analysis', value: '17' },
    { id: '2401', name: 'Login User creation', value: '19' },
    { id: '2402', name: 'Withdraw', value: '54' },
    { id: '2403', name: 'Deposit', value: '55' },
    { id: '2404', name: 'Credit Reference', value: '56' },
    { id: '2405', name: 'User Info', value: '57' },
    { id: '2406', name: 'User Password Change', value: '58' },
    { id: '2407', name: 'User Lock', value: '59' },
    { id: '2408', name: 'Bet Lock', value: '60' },
    { id: '2409', name: 'TurnOver', value: '62' },
    { id: '2410', name: 'CouponReport', value: '90' },
    { id: '2411', name: 'active user', value: '91' },
    { id: '2412', name: 'fraud report', value: '94' },
    { id: '2413', name: 'Currency Permission', value: '95' },
    { id: '2414', name: 'Agent Assign', value: '106' },
    { id: '2415', name: 'User Register Report', value: '117' },
    { id: '2416', name: 'Total Profitloss', value: '118' },
    { id: '2417', name: 'User Winloss', value: '119' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handlePrivilegeChange = (value) => {
    if (selectedPrivileges.includes(value)) {
      setSelectedPrivileges(selectedPrivileges.filter((p) => p !== value));
    } else {
      setSelectedPrivileges([...selectedPrivileges, value]);
    }
    if (errors.privileges) {
      setErrors({ ...errors, privileges: null });
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPrivileges(privileges.map((p) => p.value));
    } else {
      setSelectedPrivileges([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const newErrors = {};
    if (!formData.uname) newErrors.uname = 'The Client ID field is required';
    if (!formData.fullname) newErrors.fullname = 'The Full Name field is required';
    if (!formData.password) newErrors.password = 'The Password field is required';
    if (!formData.cpass) newErrors.cpass = 'The Confirm Password field is required';
    if (selectedPrivileges.length === 0) newErrors.privileges = 'The Privileges field is required';
    if (!formData.mpass) newErrors.mpass = 'Transaction Code field is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const userdata = JSON.parse(sessionStorage.getItem("userdata"));

      const payload = {
        uname: formData.uname,
        fullname: formData.fullname,
        password: formData.password,
        cpass: formData.cpass,
        plist: selectedPrivileges,
      };

      const result = await createAccountApi(payload);

      if (result.status === "success") {
        alert(result.message);

        setFormData({
          uname: '',
          fullname: '',
          password: '',
          cpass: '',
          mpass: '',
        });
        setSelectedPrivileges([]);
        setErrors({});
        setSubmitted(false);

      } else {
        setErrors({ api: result.message });
      }

    } catch (err) {
      console.error(err);
      setErrors({ api: "API Error" });
    }
  };

  return (
    <div data-v-5a10e370="">
      <div data-v-5a10e370="">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-flex align-items-center justify-content-between">
              <h4 className="mb-0 font-size-18">Multi Login Account</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <a href="/admin/home" className="" target="_self">Home</a>
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
                            className={`form-control ${errors.uname ? 'is-invalid' : ''}`}
                            value={formData.uname}
                            onChange={handleInputChange}
                          />
                          {errors.uname && <small className="error">{errors.uname}</small>}
                        </div>
                        <div className="col-md-3 form-group">
                          <label>Full Name</label>
                          <input
                            type="text"
                            name="fullname"
                            className={`form-control ${errors.fullname ? 'is-invalid' : ''}`}
                            value={formData.fullname}
                            onChange={handleInputChange}
                          />
                          {errors.fullname && <small className="error">{errors.fullname}</small>}
                        </div>
                        <div className="col-md-3 form-group">
                          <label>Password</label>
                          <input
                            type="password"
                            name="password"
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            value={formData.password}
                            onChange={handleInputChange}
                          />
                          {errors.password && <small className="error">{errors.password}</small>}
                        </div>
                        <div className="col-md-3 form-group">
                          <label>Confirm Password</label>
                          <input
                            type="password"
                            name="cpass"
                            className={`form-control ${errors.cpass ? 'is-invalid' : ''}`}
                            value={formData.cpass}
                            onChange={handleInputChange}
                          />
                          {errors.cpass && <small className="error">{errors.cpass}</small>}
                        </div>
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
                                  value={p.value}
                                  checked={selectedPrivileges.includes(p.value)}
                                  onChange={() => handlePrivilegeChange(p.value)}
                                />
                                <label className="custom-control-label" htmlFor={p.id}>{p.name}</label>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {errors.privileges && <small className="error">{errors.privileges}</small>}

                      <div className="previlage-master mt-2">
                        <div className="form-group mb-0">
                          <input
                            type="password"
                            name="mpass"
                            placeholder="Transaction Code"
                            className={`form-control mpass-text ${errors.mpass ? 'is-invalid' : ''}`}
                            value={formData.mpass}
                            onChange={handleInputChange}
                          />
                          <button type="submit" className="btn btn-success ml-2">Submit</button>
                          <button
                            type="button"
                            className="btn btn-light ml-2"
                            onClick={() => {
                              setFormData({ uname: '', fullname: '', password: '', cpass: '', mpass: '' });
                              setSelectedPrivileges([]);
                              setErrors({});
                              setSubmitted(false);
                            }}
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
                    <div className="table table-bordered">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th className="fixed-col-1">Action</th>
                            <th className="fixed-col-2">Username</th>
                            <th className="fixed-col-3">isAuth</th>
                            {privileges.map((p) => (
                              <th key={p.id}>{p.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {/* Table rows would go here */}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
