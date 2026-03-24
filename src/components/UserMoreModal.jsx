import React, { useState, useEffect } from 'react';

const UserMoreModal = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('Profile');

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const tabs = [
    { name: 'Profile', shortName: 'Profile' },
    { name: 'Change Password', shortName: 'C Pass' },
    { name: 'User lock', shortName: 'Lock' },
    { name: 'Account history', shortName: 'Acc history' },
    { name: 'Edit Profile', shortName: 'Edit Profile' },
  ];

  if (!user) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, overflowY: 'auto' }} tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-xl" role="document" style={{ width: '90%', maxWidth: '1140px' }}>
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
                                  <th scope="row" className="br-0">Remark:</th>
                                  <td className="br-0">Dep</td>
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
                                  { label: 'User Name:', value: user.username },
                                  { label: 'Full Name:', value: user.fullName },
                                  { label: 'Mobile Number:', value: '' },
                                  { label: 'City:', value: user.fullName },
                                  { label: 'Credit pts:', value: user.cr },
                                  { label: 'pts:', value: user.pts || '0' },
                                  { label: 'Available pts:', value: user.availablePts || '0' },
                                  { label: 'Client P/L:', value: user.clientPL || '0' },
                                  { label: 'Exposure:', value: user.exposure || '0' },
                                  { label: 'Casino pts:', value: '-5,427' },
                                  { label: 'Sports pts:', value: '0' },
                                  { label: 'Third Party pts:', value: '0' },
                                  { label: 'Created Date :', value: '31/12/2025 12:42:53' },
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
                </div>

                {/* Change Password Tab */}
                <div role="tabpanel" aria-hidden={activeTab !== 'Change Password'} className={`tab-pane ${activeTab === 'Change Password' ? 'active' : ''}`} style={{ display: activeTab === 'Change Password' ? 'block' : 'none' }}>
                  <form data-vv-scope="UserChangePassword" method="post">
                    <div className="form-group row">
                      <label className="col-form-label col-4">Password</label>
                      <div className="col-8 form-group-feedback form-group-feedback-right">
                        <input placeholder="Password" type="password" name="userchangepasswordpassword" className="form-control" />
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-form-label col-4">Confirm Password</label>
                      <div className="col-8 form-group-feedback form-group-feedback-right">
                        <input placeholder="Confirm Password" type="password" name="userchangepasswordcpassword" className="form-control" />
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-form-label col-4">Transaction Code</label>
                      <div className="col-8 form-group-feedback form-group-feedback-right">
                        <input placeholder="Transaction Code" type="password" name="userchangepasswordmpassword" className="form-control" />
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-12 text-right">
                        <button type="submit" className="btn btn-primary">
                          submit
                          <i className="fas fa-sign-in-alt ml-1"></i>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* User Lock Tab */}
                <div role="tabpanel" aria-hidden={activeTab !== 'User lock'} className={`tab-pane ${activeTab === 'User lock' ? 'active' : ''}`} style={{ display: activeTab === 'User lock' ? 'block' : 'none' }}>
                  <form data-vv-scope="UserLock" method="post">
                    <div className="form-group row">
                      <label className="col-form-label col-4">Bet lock</label>
                      <div className="mb-1 custom-control custom-switch">
                        <input type="checkbox" className="custom-control-input" value="true" id="bet-lock" />
                        <label className="custom-control-label" htmlFor="bet-lock"></label>
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-form-label col-4">User lock</label>
                      <div className="mb-1 custom-control custom-switch">
                        <input type="checkbox" className="custom-control-input" value="true" id="user-lock" />
                        <label className="custom-control-label" htmlFor="user-lock"></label>
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-form-label col-4">Transaction Code</label>
                      <div className="col-8 form-group-feedback-right pl-0">
                        <input placeholder="Transaction Code" type="password" name="UserLockMpassword" className="form-control" />
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-12 text-right">
                        <button type="submit" className="btn btn-primary">
                          submit
                          <i className="fas fa-sign-in-alt ml-1"></i>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

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
                            <td>Arpit526</td>
                            <td>{user.username}</td>
                            <td>Arpit526</td>
                            <td><p className="text-right mb-0">2,000</p></td>
                            <td><div>18/03/2026 12:39:30</div></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Edit Profile Tab */}
                <div role="tabpanel" aria-hidden={activeTab !== 'Edit Profile'} className={`tab-pane ${activeTab === 'Edit Profile' ? 'active' : ''}`} style={{ display: activeTab === 'Edit Profile' ? 'block' : 'none' }}>
                  <form data-vv-scope="editprofile" method="post">
                    <div className="form-group row">
                      <label className="col-form-label col-4">Full Name</label>
                      <div className="col-8 form-group-feedback-right pl-0">
                        <input placeholder="Full Name" type="text" name="fname" defaultValue={user.fullName} className="form-control" />
                      </div>
                    </div>
                    <div className="form-group row align-items-center">
                      <label className="col-form-label col-4">Change Password Lock</label>
                      <div className="mb-1 custom-control custom-switch">
                        <input type="checkbox" className="custom-control-input" value="true" id="password-lock" />
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
                        <input placeholder="Transaction Code" type="password" name="mpass" className="form-control" />
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-12 text-right">
                        <button type="submit" className="btn btn-primary">
                          submit
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
