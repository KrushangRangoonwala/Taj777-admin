import React from 'react';

const AccountStatement = () => {
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

  return (
    <div>
      <div>
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-flex align-items-center justify-content-between">
              <h4 className="mb-0 font-size-18">Account Statement</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <a href="/admin/home">Home</a>
                  </li>
                  <li className="breadcrumb-item active">
                    <span aria-current="location">Account Statement</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">

                <div className="report-form mb-3">
                  <form method="post" className="ajaxFormSubmit">
                    <div className="row row5">

                      <div className="col-lg-3">
                        <div className="form-group user-lock-search" style={{ position: "relative" }}>
                          <label>Search By Client Name</label>
                          <div className="multiselect">
                            <div className="multiselect__select"></div>
                            <div className="multiselect__tags">
                              <div className="multiselect__tags-wrap" style={{ display: "none" }}></div>
                              <div className="multiselect__spinner" style={{ display: "none" }}></div>
                              <input
                                type="text"
                                autoComplete="off"
                                spellCheck="false"
                                placeholder="Select option"
                                className="multiselect__input"
                                style={{ width: "0px", position: "absolute", padding: "0px" }}
                              />
                              <span className="multiselect__placeholder">
                                Select option
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-3">
                        <label>Select Date Range</label>
                        <div className="mb-3 mx-datepicker mx-datepicker-range">
                          <div className="mx-input-wrapper">
                            <input type="text" className="mx-input" />
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-2">
                        <div className="form-group">
                          <label>Type</label>
                          <select className="form-control">
                            <option value="1">Deposit/Withdraw Report</option>
                            <option value="2">Sports Report</option>
                            <option value="3">Casino Report</option>
                            <option value="4">Third Party Casino Report</option>
                            <option value="5">Sportbook</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-lg-2">
                        <div className="form-group">
                          <label>Statement</label>
                          <select className="form-control">
                            <option value="all">All</option>
                            <option value="allcredit">Credit - All</option>
                            <option value="creditupper">Credit - Upper</option>
                            <option value="creditdown">Credit - Down</option>
                            <option value="allbalance">pts - All</option>
                            <option value="balanceupper">pts - Upper</option>
                            <option value="balancedown">pts - Down</option>
                          </select>
                        </div>
                      </div>

                    </div>

                    <div className="row row5">
                      <div className="col-lg-3">
                        <button type="submit" className="btn btn-primary">Load</button>
                        <button type="button" className="btn btn-light">Reset</button>
                        <button type="button" className="btn btn-success">
                          <i className="fas fa-file-excel"></i>
                        </button>
                        <button type="button" className="btn btn-danger">
                          <i className="fas fa-file-pdf"></i>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="row">
                  <div className="col-6">
                    <label>
                      Show
                      <select className="custom-select custom-select-sm">
                        <option>25</option>
                        <option>50</option>
                        <option>75</option>
                        <option>100</option>
                        <option>125</option>
                        <option>150</option>
                      </select>
                      entries
                    </label>
                  </div>
                  <div className="col-6 text-right">
                    <input type="search" placeholder="Search..." className="form-control form-control-sm" />
                  </div>
                </div>

                <div className="table-responsive mb-0">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th className="text-right">Sr No</th>
                        <th className="text-right">Credit</th>
                        <th className="text-right">Debit</th>
                        <th className="text-right">pts</th>
                        <th>Remark</th>
                        <th>Fromto</th>
                      </tr>
                    </thead>
                    <tbody>

                      <tr>
                        <td>17/03/2026 00:00:00</td>
                        <td className="text-right">1</td>
                        <td className="text-right text-success">62,900</td>
                        <td className="text-right"></td>
                        <td className="text-right text-success">62,900</td>
                        <td>Opening pts</td>
                        <td></td>
                      </tr>

                      <tr>
                        <td>18/03/2026 12:39:30</td>
                        <td className="text-right">2</td>
                        <td></td>
                        <td className="text-right text-danger">-2,000</td>
                        <td className="text-right text-success">60,900</td>
                        <td>a</td>
                        <td>Arpit526/Ras44</td>
                      </tr>

                      <tr>
                        <td>18/03/2026 15:20:57</td>
                        <td className="text-right">3</td>
                        <td></td>
                        <td className="text-right text-danger">-2,000</td>
                        <td className="text-right text-success">58,900</td>
                        <td>a</td>
                        <td>Arpit526/Ras49</td>
                      </tr>

                      <tr>
                        <td>23/03/2026 12:21:16</td>
                        <td className="text-right">4</td>
                        <td></td>
                        <td className="text-right text-danger">-10,000</td>
                        <td className="text-right text-success">48,900</td>
                        <td>User creation</td>
                        <td>Arpit526/Arpit528</td>
                      </tr>

                      <tr>
                        <td>23/03/2026 12:21:56</td>
                        <td className="text-right">5</td>
                        <td></td>
                        <td className="text-right text-danger">-10,000</td>
                        <td className="text-right text-success">38,900</td>
                        <td>a</td>
                        <td>Arpit526/Arpit528</td>
                      </tr>

                      <tr>
                        <td>23/03/2026 16:29:55</td>
                        <td className="text-right">6</td>
                        <td></td>
                        <td className="text-right text-danger">-10,000</td>
                        <td className="text-right text-success">28,900</td>
                        <td>User creation</td>
                        <td>Arpit526/Arpit56565</td>
                      </tr>

                      <tr>
                        <td>23/03/2026 18:57:39</td>
                        <td className="text-right">7</td>
                        <td></td>
                        <td className="text-right text-danger">-2,000</td>
                        <td className="text-right text-success">26,900</td>
                        <td>A</td>
                        <td>Arpit526/Ras49</td>
                      </tr>

                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AccountStatement;
