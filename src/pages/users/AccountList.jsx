import React from 'react';

const AccountList = () => {
  const dummyData = [
    {
      id: '1',
      username: 'Ras44',
      fullName: 'Apapap',
      cr: '5,000',
      bst: true,
      ust: true,
      pname: '0 PNR',
      accountType: 'User',
      isLink: false,
    },
    {
      id: '8e005f22-55bf-4bdf-b949-27d97b8a035b',
      username: 'Ras45',
      fullName: 'Apapapp',
      cr: '5,000',
      bst: true,
      ust: true,
      pname: '0 PNR',
      accountType: 'Agent',
      isLink: true,
    },
    {
      id: '3',
      username: 'Ras46',
      fullName: 'Ras46',
      cr: '5,000',
      bst: true,
      ust: true,
      pname: '0 PNR',
      accountType: 'User',
      isLink: false,
    },
    {
      id: '4',
      username: 'Ras48',
      fullName: 'Apapap',
      cr: '5,000',
      bst: true,
      ust: true,
      pname: '0 PNR',
      accountType: 'User',
      isLink: false,
    },
    {
      id: '5',
      username: 'Ras49',
      fullName: 'Rasg',
      cr: '5,100',
      bst: true,
      ust: true,
      pname: '0 PNR',
      accountType: 'User',
      isLink: false,
    },
  ];

  return (
    <div data-v-5a10e370="">
      <div data-v-5a10e370="">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-flex align-items-center justify-content-between">
              <h4 className="mb-0 font-size-18">Account List</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <a href="/admin/home" className="" target="_self">Home</a>
                  </li>
                  <li className="breadcrumb-item active">
                    <span aria-current="location">Account List</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="row account-list">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="row row5">
                  <div className="col-md-6 mb-2 search-form">
                    <form method="post" className="ajaxFormSubmit">
                      <div className="d-inline-block form-group form-group-feedback form-group-feedback-right">
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
                  <div className="col-md-6 text-right mb-2">
                    <div className="d-inline-block mr-2">
                      <div id="export_1774244501791" className="d-inline-block">
                        <button type="button" className="btn mr-1 btn-success">
                          <i className="fas fa-file-excel"></i>
                        </button>
                      </div>
                      <button type="button" className="btn btn-danger">
                        <i className="fas fa-file-pdf"></i>
                      </button>
                    </div>
                    <div className="d-inline-block">
                      <a href="/admin/users/insertuser" className="btn btn-success">
                        <i aria-hidden="true" className="fa fa-plus"></i> CREATE ACCOUNT
                      </a>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-12 col-md-6">
                    <div id="tickets-table_length" className="dataTables_length">
                      <label className="d-inline-flex align-items-center">
                        Show&nbsp;
                        <select className="custom-select custom-select-sm" id="__BVID__2581">
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
                  <div className="table no-footer table-responsive-sm">
                    <table id="eventsListTbl" role="table" aria-busy="false" aria-colcount="7" className="table b-table">
                      <thead>
                        <tr role="row">
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="1" aria-sort="none" className="position-relative">
                            <div>User Name</div>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="2" aria-sort="none" className="position-relative text-right">
                            <div>CR</div>
                          </th>
                          <th role="columnheader" scope="col" aria-colindex="3" className="">
                            <div>B st</div>
                          </th>
                          <th role="columnheader" scope="col" aria-colindex="4" className="">
                            <div>U st</div>
                          </th>
                          <th role="columnheader" scope="col" aria-colindex="5" className="">
                            <div>PName</div>
                          </th>
                          <th role="columnheader" scope="col" tabIndex="0" aria-colindex="6" aria-sort="none" className="position-relative">
                            <div>Account Type</div>
                          </th>
                          <th role="columnheader" scope="col" aria-colindex="7" className="">
                            <div>Action</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody role="rowgroup">
                        {dummyData.map((user) => (
                          <tr key={user.id} role="row">
                            <td aria-colindex="1" role="cell">
                              {user.isLink ? (
                                <a href={`/admin/child/${user.id}`} className="wrape-text" title={user.fullName} target="_blank" rel="noopener noreferrer">
                                  <span>{user.username}</span>
                                </a>
                              ) : (
                                <span title={user.fullName}>{user.username}</span>
                              )}
                            </td>
                            <td aria-colindex="2" role="cell">
                              <p className="text-right mb-0 cp text-warning">{user.cr}</p>
                            </td>
                            <td aria-colindex="3" role="cell">
                              <div className="mb-1 custom-control custom-switch">
                                <input type="checkbox" disabled checked={user.bst} className="custom-control-input" id={`bst-${user.id}`} />
                                <label className="custom-control-label" htmlFor={`bst-${user.id}`}></label>
                              </div>
                            </td>
                            <td aria-colindex="4" role="cell">
                              <div className="mb-1 custom-control custom-switch">
                                <input type="checkbox" disabled checked={user.ust} className="custom-control-input" id={`ust-${user.id}`} />
                                <label className="custom-control-label" htmlFor={`ust-${user.id}`}></label>
                              </div>
                            </td>
                            <td aria-colindex="5" role="cell">
                              <p className="text-left mb-0">{user.pname}</p>
                            </td>
                            <td aria-colindex="6" role="cell">
                              {user.accountType}
                            </td>
                            <td aria-colindex="7" role="cell">
                              <div role="group" className="btn-group">
                                <button type="button" className="btn btn-success">D</button>
                                <button type="button" className="btn btn-danger">W</button>
                                <button type="button" className="btn btn-info">More</button>
                              </div>
                            </td>
                          </tr>
                        ))}
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

export default AccountList;
