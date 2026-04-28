import React, { useState } from 'react';

const Bank = () => {
  const [formData, setFormData] = useState({
    masterPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "masterPassword":
        if (!value.trim()) {
          error = "true";
        }
        break;
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
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const dummyData = [
    {
      username: 'Arpit528',
      fullName: 'Arpit',
      cr: '10,000',
      pts: '20,000',
      clientPL: '10,000',
      exposure: '0',
      availablePts: '20,000',
      accountType: 'Master',
      status: '',
    },
    {
      username: 'Ras44',
      fullName: 'Apapap',
      cr: '5,000',
      pts: '1,573',
      clientPL: '-3,427',
      exposure: '0',
      availablePts: '1,573',
      accountType: 'User',
      status: '',
    },
    {
      username: 'Ras45',
      fullName: 'Apapapp',
      cr: '5,000',
      pts: '5,000',
      clientPL: '0',
      exposure: '0',
      availablePts: '5,000',
      accountType: 'Agent',
      status: '',
    },
    {
      username: 'Ras46',
      fullName: 'Ras46',
      cr: '5,000',
      pts: '2,128.75',
      clientPL: '-2,871.25',
      exposure: '0',
      availablePts: '2,128.75',
      accountType: 'User',
      status: '',
    },
    {
      username: 'Ras48',
      fullName: 'Apapap',
      cr: '5,000',
      pts: '1,936',
      clientPL: '-3,064',
      exposure: '0',
      availablePts: '1,936',
      accountType: 'User',
      status: '',
    },
    {
      username: 'Ras49',
      fullName: 'Rasg',
      cr: '5,100',
      pts: '1,518',
      clientPL: '-3,582',
      exposure: '0',
      availablePts: '1,518',
      accountType: 'User',
      status: '',
    },
    {
      username: 'Ras52',
      fullName: 'Apapapap',
      cr: '1,000',
      pts: '9,295',
      clientPL: '8,295',
      exposure: '0',
      availablePts: '9,295',
      accountType: 'User',
      status: '',
    },
  ];

  const emptyData = []

  const data = emptyData;
  // const data = dummyData;

  return (
    <div data-v-5a10e370="">
      <div data-v-5a10e370="">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-flex align-items-center justify-content-between">
              <h4 className="mb-0 font-size-18">Bank</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <a href="/admin/home" className="" target="_self">Home</a>
                  </li>
                  <li className="breadcrumb-item active">
                    <span aria-current="location">Bank</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        <div className="row bank-panel">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="report-form mb-1">
                  <div className="row row5">
                    <div className="col-md-6 mb-2 search-form">
                      <form method="post" className="ajaxFormSubmit">
                        <div className="d-inline-block form-group form-group-feedback form-group-feedback-right" style={{ marginRight: '0.2rem' }}>
                          <input type="text" name="searchKey" placeholder="Search User" className="form-control" />
                        </div>
                        <div className="d-inline-block">
                          <button type="submit" id="submit" className="btn btn-primary">
                            Load
                          </button>
                          <button type="button" id="reset" className="btn btn-light ml-1">
                            Reset
                          </button>
                        </div>
                      </form>
                    </div>
                    <div className="col-md-6 text-right">
                      <div className="d-inline-block">
                        <div id="export_1774256324601" className="d-inline-block" style={{ marginRight: '0.2rem' }}>
                          <button type="button" className="btn mr-1 btn-success">
                            <i className="fas fa-file-excel"></i>
                          </button>
                        </div>
                        <button type="button" className="btn btn-danger">
                          <i className="fas fa-file-pdf"></i>
                        </button>
                      </div>
                      <form data-vv-scope="transferAll" method="post" className="d-inline-block ml-2">
                        <div className="d-inline-block form-group form-group-feedback form-group-feedback-right" style={{ marginRight: '0.2rem' }}>
                          <input
                            type="password"
                            name="masterPassword"
                            placeholder="Transaction Code"
                            className={`form-control ${touched.masterPassword && errors.masterPassword ? 'is-invalid' : ''}`}
                            value={formData.masterPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />

                        </div>
                        <div className="d-inline-block">
                          <button type="submit" id="transferSubmit" className="btn btn-primary">
                            Transfer All
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-6">
                    <div id="tickets-table_length" className="dataTables_length">
                      <label className="d-inline-flex align-items-center">
                        Show&nbsp;
                        <select className="custom-select custom-select-sm" id="__BVID__2355">
                          <option value="25">25</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                          <option value="250">250</option>
                          <option value="500">500</option>
                          <option value="750">750</option>
                          <option value="1000">1000</option>
                        </select>
                        &nbsp;entries
                      </label>
                    </div>
                  </div>
                </div>
                <div className="table-responsive mb-0">
                  <div className="table no-footer table-hover table-responsive-sm">
                    <table id="eventsListTbl" role="table" aria-busy="false" aria-colcount="9" className="table b-table">
                      <colgroup>
                        <col style={{ width: '200px' }} />
                        <col style={{ width: 'auto' }} />
                        <col style={{ width: 'auto' }} />
                        <col style={{ width: 'auto' }} />
                        <col style={{ width: 'auto' }} />
                        <col style={{ width: 'auto' }} />
                        <col style={{ width: 'auto' }} />
                        <col style={{ width: '250px' }} />
                        <col style={{ width: '200px' }} />
                      </colgroup>
                      <thead role="rowgroup">
                        <tr role="row">
                          <th role="columnheader" scope="col" aria-colindex="1"><div>User Name</div></th>
                          <th role="columnheader" scope="col" aria-colindex="2" className="text-right"><div>CR</div></th>
                          <th role="columnheader" scope="col" aria-colindex="3" className="text-right"><div>pts</div></th>
                          <th role="columnheader" scope="col" aria-colindex="4" className="text-right"><div>Client(P/L)</div></th>
                          <th role="columnheader" scope="col" aria-colindex="5" className="text-right"><div>Exposure</div></th>
                          <th role="columnheader" scope="col" aria-colindex="6" className="text-right"><div>Available pts</div></th>
                          <th role="columnheader" scope="col" aria-colindex="7"><div>Account Type</div></th>
                          <th role="columnheader" scope="col" aria-colindex="8"><div>Action</div></th>
                          <th role="columnheader" scope="col" aria-colindex="9"><div>Status</div></th>
                        </tr>
                      </thead>
                      <tbody role="rowgroup">
                        {/* {dummyData.map((user, idx) => ( */}

                        {data?.length > 0 ? (
                          data?.map((user, idx) => (
                            <tr key={idx} role="row">
                              <td aria-colindex="1" role="cell">
                                <span title={`${user.username} (${user.fullName})`} className="text-ellipsis">{user.username}</span>
                              </td>
                              <td aria-colindex="2" role="cell">
                                <p className="text-right mb-0">{user.cr}</p>
                              </td>
                              <td aria-colindex="3" role="cell">
                                <p className="text-right mb-0">{user.pts}</p>
                              </td>
                              <td aria-colindex="4" role="cell">
                                <p className="text-right mb-0">{user.clientPL}</p>
                              </td>
                              <td aria-colindex="5" role="cell">
                                <p className="text-right mb-0">{user.exposure}</p>
                              </td>
                              <td aria-colindex="6" role="cell">
                                <p className="text-right mb-0">{user.availablePts}</p>
                              </td>
                              <td aria-colindex="7" role="cell">{user.accountType}</td>
                              <td aria-colindex="8" role="cell">
                                <a href="javascript:void(0)" className="text-success">All <i className="fas fa-arrow-right"></i></a>
                                <input type="number" name="amount" placeholder="0" className="form-control form-control-sm transfer-amt d-inline-block mx-1" style={{ width: '122px' }} />
                                <button className="btn btn-info btn-sm">
                                  Submit
                                </button>
                              </td>
                              <td aria-colindex="9" role="cell">{user.status}</td>
                            </tr>
                          ))
                        ) : (
                          <tr role="row" className="b-table-empty-row">
                            <td colSpan="9" role="cell">
                              <div role="alert" aria-live="polite">
                                <div className="text-center my-2">
                                  {/* {loading
                                      ? "Loading..."
                                      // ? "There are no records to show"
                                      : search?.length
                                        ? "There are no records matching your request"
                                        : "There are no records to show"} */}
                                  There are no records to show
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="row pt-3">
                  <div className="col">
                    <div className="dataTables_paginate paging_simple_numbers float-right">
                      <ul className="pagination pagination-rounded mb-0">
                        <ul role="menubar" aria-disabled="false" aria-label="Pagination" className="pagination dataTables_paginate paging_simple_numbers my-0 b-pagination justify-content-end">
                          <li role="presentation" aria-hidden="true" className="page-item disabled">
                            <span role="menuitem" aria-label="Go to first page" aria-disabled="true" className="page-link">«</span>
                          </li>
                          <li role="presentation" aria-hidden="true" className="page-item disabled">
                            <span role="menuitem" aria-label="Go to previous page" aria-disabled="true" className="page-link">‹</span>
                          </li>
                          <li role="presentation" className="page-item active">
                            <button role="menuitemradio" type="button" aria-label="Go to page 1" aria-checked="true" aria-posinset="1" aria-setsize="1" tabIndex="0" className="page-link">1</button>
                          </li>
                          <li role="presentation" aria-hidden="true" className="page-item disabled">
                            <span role="menuitem" aria-label="Go to next page" aria-disabled="true" className="page-link">›</span>
                          </li>
                          <li role="presentation" aria-hidden="true" className="page-item disabled">
                            <span role="menuitem" aria-label="Go to last page" aria-disabled="true" className="page-link">»</span>
                          </li>
                        </ul>
                      </ul>
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

export default Bank;


//aaaaaaaaaabbbbbbbbbbbccccccccccc
//10000000000000000000000000000