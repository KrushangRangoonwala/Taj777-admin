import React, { useEffect, useState } from 'react';
import { checkUsername, createAccountApi } from "../../api/API";

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
  const [selectedPrivileges, setSelectedPrivileges] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateField = (name, value, currentFormData = formData) => {
    let error = "";
    switch (name) {
      case "uname":
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
      case "cpass":
        if (!value.trim()) {
          error = "The Confirm Password field is required";
        } else if (value !== currentFormData.password) {
          error = "The Confirm Password confirmation does not match";
        }
        break;
      case "mpass":
        if (!value.trim()) {
          error = "Transaction Code field is required";
        }
        break;
      default:
        break;
    }
    return error;
  };


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


    if (name === "uname") {
      if (usernameTimer) {
        clearTimeout(usernameTimer);
      }

      const timer = setTimeout(async () => {
        if (!value.trim()) {
          setIsUsernameTaken(0);
          return;
        }

        try {
          const res = await checkUsername({
            username: value,
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

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };


  const handlePrivilegeChange = (value) => {
    let aa;
    if (selectedPrivileges.includes(value)) {
      aa = selectedPrivileges.filter((p) => p !== value);
    } else {
      aa = [...selectedPrivileges, value];
    }
    console.log("aa", aa)
    setSelectedPrivileges(aa);

    if (aa?.length === 0) {
      setErrors({ ...errors, privileges: 'The Privileges field is required' });
    } else {
      setErrors({ ...errors, privileges: null });
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPrivileges(privileges.map((p) => p.value));
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
      if (error) {
        newErrors[key] = error;
      }
      newTouched[key] = true;
    });

    if (selectedPrivileges.length === 0) {
      newErrors.privileges = 'The Privileges field is required';
      newTouched.privileges = true;
    }

    setTouched(newTouched);


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
        setTouched({});
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
                          {touched.password && errors.password && <small className="error">{errors.password}</small>}
                        </div>
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
                          {touched.cpass && errors.cpass && <small className="error">{errors.cpass}</small>}
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
                            onClick={() => {
                              setFormData({ uname: '', fullname: '', password: '', cpass: '', mpass: '' });
                              setSelectedPrivileges([]);
                              setErrors({});
                              setTouched({});
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
                    {/* <div className="table table-bordered"> */}
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th className="fixed-col-1">Action</th>
                          <th className="fixed-col-2">Username</th>
                          <th className="fixed-col-3">IsAuth</th>
                          <th style={{ alignContent: "center" }}>Full Name</th>
                          {privileges.map((p) => (
                            <th key={p.id} style={{ alignContent: "center" }}>{p.name}</th>
                          ))}
                        </tr>
                      </thead>
                      {/* <tbody>
                           Table rows would go here 
                        </tbody> */}
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
  );
};

export default CreateAccount;
