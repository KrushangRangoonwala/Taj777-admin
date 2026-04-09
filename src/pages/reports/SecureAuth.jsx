import React, { useState } from 'react'
import PageNamePath from '../../../rough/CasinoGames/components/PageNamePath'

const SecureAuth = () => {
    const [tab, setTab] = useState(0);
    return (
        <div>
            <div className="security-auth">
                <PageNamePath
                    pageName="Secure Auth Verification"
                    pathArr={[{ path: "/admin/home", name: "Home" }, { path: "", name: "Secure Auth" }]}
                />

                <div>
                    <div className="card-body">

                        <div className="text-center">
                            <b>Secure Auth Verification Status:</b>{" "}
                            <span className="badge badge-danger">Disabled</span>
                        </div>

                        <div className="mt-2 text-center">
                            Please select below option to enable secure auth verification
                        </div>

                        <div className="casino-report-tabs mt-3">
                            <ul className="nav nav-tabs">
                                <li className="nav-item pointer">
                                    <a className={`nav-link ${tab == 1 ? "active" : ""}`} onClick={() => setTab(1)}>Enable Using Mobile App</a>
                                </li>
                                <li className="nav-item pointer">
                                    <a className={`nav-link ${tab == 2 ? "active" : ""}`} onClick={() => setTab(2)}>Enable Using Telegram</a>
                                </li>
                            </ul>
                        </div>

                        <div className="tab-content mt-4">
                            {tab == 1 &&
                                <div className="tab-content mt-4">
                                    <div className="tab-pane mobile-app active">
                                        <div className="text-center">

                                            <div className="mt-3">
                                                Please enter below auth code in your 'Secure Auth Verification App'.
                                            </div>

                                            <div className="mt-3">
                                                <div className="verify-code">162374</div>
                                            </div>

                                            <div className="mt-3">
                                                <b>
                                                    If you haven't downloaded,<br />
                                                    please download 'Secure Auth Verification App' from below link.
                                                </b>
                                            </div>

                                            <div className="mt-3">
                                                Using this app you will receive auth code during login authentication
                                            </div>

                                            <div className="mt-3">
                                                <a
                                                    href="https://sitethemedata.com/auth_apk/SecureAuthApp-2.0.apk"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <button className="btn btn-primary">
                                                        <i className="fab fa-android"></i>{" "}
                                                        <span>Download on the Android</span>
                                                    </button>
                                                </a>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            }

                            {tab == 2 &&
                                <div className="tab-content mt-4">
                                    <div className="tab-pane telegram active">
                                        <div className="text-center">

                                            <b>Please enter your login password to continue</b>

                                            <div className="form-group mt-3 secure-password">
                                                <input
                                                    type="password"
                                                    placeholder="Enter your login password"
                                                    className="form-control"
                                                />

                                                <button className="btn btn-primary ml-2 vt">
                                                    Get Connection ID
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            }
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}

export default SecureAuth