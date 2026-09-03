import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

import {
    authStatusApi,
    enableMobileAuthApi,
    enableTelegramAuthApi,
    disableAuthApi,
    checkAuthStatusApi,
    telegramOtpGenerationApi
} from "../../api/API";
import Loader from "../Loader/Loader";
import showToast from "../../utilies/toaster";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { getSocketUrl } from "../../api/Socket/socketConfig";

const SOCKET_URL = getSocketUrl("casino");
const TELEGRAM_BOT = process.env.VITE_TELEGRAM_BOT;
const TELEGRAM_LINK = process.env.VITE_TELEGRAM_LINK;

console.log(SOCKET_URL, "SOCKET_URL");

const SecurityAuthVerification = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [authStatus, setAuthStatus] = useState(false);
    const [verificationType, setVerificationType] = useState("");
    const [activeTab, setActiveTab] = useState("");
    const [otpBoxHtml, setOtpBoxHtml] = useState(null);
    const [telegramPassword, setTelegramPassword] = useState("");
    const inputsRef = useRef([]);
    const chkAuthRef = useRef("");

    /* ================= LOAD STATUS ================= */

    useEffect(() => {
        const loadStatus = async () => {
            try {
                const res = await authStatusApi();

                const status = res?.user_verification_status;
                const type = res?.user_verification_type;

                setAuthStatus(status === "ENABLED");
                setVerificationType(type);
            } catch (err) {
                console.error(err);
            }
        };

        loadStatus();
    }, []);

    /* ================= SOCKET ================= */

    useEffect(() => {
        const socket = io(SOCKET_URL, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        socket.on("authDisableVerifiedSuccessfully", (data) => {
            if (data.status === "DISABLED" || data.status === "ENABLED") {
                window.location.href = "/logout";
            }
        });

        return () => socket.disconnect();
    }, []);

    /* ================= AUTO STATUS CHECK ================= */
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await checkAuthStatusApi({
                    auth_status: authStatus
                });

                // if (res?.refresh) {
                //   window.location.href = "/logout";
                // }
                // console.log('@@ chkAuth, res?.user_verification_status', chkAuth, "AAA", res?.user_verification_status, chkAuth === "DISABLED", res?.user_verification_status === "ENABLED")
                console.log('chkAuthRef', chkAuthRef.current, chkAuthRef.current === "DISABLED");
                if (chkAuthRef.current === "DISABLED" && res?.user_verification_status === "ENABLED") {
                    dispatch(logout());
                    setTimeout(() => navigate("/", { replace: true }), 500);
                }
                chkAuthRef.current = res?.user_verification_status;
            } catch (err) {
                console.error(err);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [authStatus]);

    /* ================= OTP INPUT ================= */

    const checkOtp = async () => {
        const otpArr = inputsRef.current.map((i) => i?.value).filter(Boolean);

        if (otpArr.length !== 6) return;

        const otp = otpArr.join("");

        try {
            const res = await disableAuthApi({
                code: otp
            });
            if (res?.status === "ok") {
                showToast({ message: "2-Step Verification is disabled for your account.", isSuccess: true });
                dispatch(logout());
                setTimeout(() => navigate("/"), 500);
            } else {
                showToast({ message: res?.message || "Invalid Code", isSuccess: false });
            }
        } catch (err) {
            showToast({ message: err?.response?.data?.message || "Invalid Code", isSuccess: false });
        }
    };

    const handleOtpChange = (e, index) => {
        const value = e.target.value;

        if (!/^[0-9]?$/.test(value)) {
            e.target.value = "";
            return;
        }

        if (value && inputsRef.current[index + 1]) {
            inputsRef.current[index + 1].focus();
        }

        checkOtp();
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !e.target.value && inputsRef.current[index - 1]) {
            inputsRef.current[index - 1].focus();
        } else if (e.key === "ArrowLeft" && inputsRef.current[index - 1]) {
            inputsRef.current[index - 1].focus();
        } else if (e.key === "ArrowRight" && inputsRef.current[index + 1]) {
            inputsRef.current[index + 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
        if (pastedData) {
            pastedData.split("").forEach((char, i) => {
                if (inputsRef.current[i]) {
                    inputsRef.current[i].value = char;
                }
            });
            const focusIndex = Math.min(pastedData.length, 5);
            inputsRef.current[focusIndex].focus();
            checkOtp();
        }
    };

    /* ================= DISABLE CLICK ================= */

    const showDisableOtp = async () => {

        try {

            // if (verificationType === "Telegram") {
            const res = await telegramOtpGenerationApi();
            if (res?.status === "ok") {
                showToast({ message: "Successfully Code Generate.", isSuccess: true });
                setOtpBoxHtml(
                    <>
                        {/* <div className="mt-3">
                <b>
                  If you haven't downloaded,<br />
                  please download 'Secure Auth Verification App' from below link.
                </b>
              </div>

              <div className="mt-3">
                Using this app you will receive auth code during login authentication
              </div>

              <div className="mt-3">
                <button type="button" className="btn btn-primary" onClick={() => window.location.href = `${import.meta.env.VITE_BACKEND_BASE_URL}/apk/auth_v1.apk`}>
                  <i className="fab fa-android"></i>{" "}
                  <span>Download on the Android</span>
                </button>
              </div> */}

                        <div className="mt-2 mb-3 login-auth">
                            <h3 className="text-center" style={{ fontSize: "28px" }}>Security Code Verification</h3>

                            <div className="mt-3 text-center">
                                Enter 6-digit code from your security auth verification App
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    width: "300px",
                                    position: "relative",
                                    left: "55px",
                                }}
                                className="inputs mt-3"
                            >
                                {[...Array(6)].map((_, index) => (
                                    <input
                                        key={index}
                                        style={{ width: "40px", height: "40px", margin: "0 5px", color: "#000", fontSize: "20px" }}
                                        ref={(el) => (inputsRef.current[index] = el)}
                                        type="tel"
                                        maxLength="1"
                                        pattern="[0-9]"
                                        className="otp-input"
                                        onChange={(e) => handleOtpChange(e, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        onPaste={handlePaste}
                                        onFocus={(e) => e.target.select()}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                );
            }
            // }
        } catch (err) {

            toastr.error("Failed to generate OTP");

        }
    };

    /* ================= ENABLE MOBILE ================= */
    const enableMobile = async () => {
        setIsLoading(true);
        try {

            const res = await enableMobileAuthApi();

            const code = res?.verification_code || res?.data?.verification_code;

            setOtpBoxHtml(
                <>
                    {/* <div className="text-center mt-3">
            <h6 className="mb-2">
              Please enter below auth code in your 'Secure Auth Verification App'.
            </h6>

            <div className="text-center row mt-2 mb-2 align-items-center">
              <div className="col-12 d-flex justify-content-center align-items-center">
                <div className="verify-code d-inline-block">{code}</div>
              </div>
            </div>

            <h4 className="mb-2">
              If you haven't downloaded,
              <br />
              please download 'Secure Auth Verification App' from below link.
            </h4>

            <h6 className="mb-2">
              Using this app you will receive auth code during login authentication
            </h6>

            <a href="apk/auth_v1.apk" className="btn btn-download btn-lg mt-3">
              <div className="row5 row align-items-center">
                <div className="col-4 text-center">
                  <i className="fab fa-android"></i>
                </div>

                <div className="col-8 text-left">
                  <h4 className="mb-0">Download</h4>
                  <div className="mt-0 dtext">on the android</div>
                </div>
              </div>
            </a>
          </div> */}

                    <div className="tab-content" style={{ fontSize: "12px", position: 'relative' }}> {/* height: isLoading ? "200px" : ""  */}
                        {/* {isLoading && <Loader position="absolute" />} */}
                        {/* {activeTab === "mobile" && ( */}
                        <div className="tab-pane mobile-app active">
                            <div className="text-center">
                                <div className="mt-3">
                                    Please enter below auth code in your 'Secure Auth Verification App'.
                                </div>

                                <div className="mt-3">
                                    <div className="verify-code">{code}</div>
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
                                    <button type="button" className="btn btn-primary" onClick={() => window.location.href = `${import.meta.env.VITE_BACKEND_BASE_URL}/apk/auth_v1.apk`}>
                                        <i className="fab fa-android"></i>{" "}
                                        <span>Download on the Android</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* )} */}
                    </div>
                </>
            );

        } catch (err) {

            toastr.error(err?.response?.data?.message || "Failed to enable mobile auth");

        } finally {
            setIsLoading(false);
        }
    };

    /* ================= ENABLE TELEGRAM ================= */

    const enableTelegram = async (password) => {

        try {

            const res = await enableTelegramAuthApi({
                password
            });

            if (res.status === "error") {
                const msg = res?.message == "Invalid password" ? "User Password Not Valid." : res?.message;
                showToast({ isSuccess: false, message: msg || "Telegram auth failed" });
                return;
            }
            const code = res?.verification_code || res?.data?.verification_code;

            setOtpBoxHtml(
                <>
                    {/* <div className="mt-3 follow-instruction">

          <h4 className="mb-3">
            <b>Please follow below instructions for the telegram 2-step verification</b>
          </h4>

          <p>
            Find
            <a
              target="_blank"
              href={`https://t.me/${TELEGRAM_LINK}?start`}
              className="text-primary"
              rel="noreferrer"
            >
              {TELEGRAM_BOT}
            </a>
            in your telegram and type <kbd>/start</kbd>.
          </p>

          <p>
            After this type <kbd>/connect {code}</kbd> and send it to BOT.
          </p>

          <p>
            Now your telegram account will be linked with your website account
            and 2-Step verification will be enabled.
          </p>

        </div> */}

                    <div className="mt-3 follow-instruction">
                        <b>Please follow below instructions for the telegram 2-step verification</b>
                        <p>
                            Find{" "}
                            <a
                                target="_blank"
                                href={`https://t.me/${TELEGRAM_LINK}?start`}
                                className="text-primary"
                                rel="noreferrer"
                            >
                                {TELEGRAM_BOT}
                            </a>{" "}
                            in your telegram and type <kbd>/start</kbd> command. Bot will
                            respond you.
                        </p>
                        <p>
                            After this type <kbd>/connect {code}</kbd> and send it to BOT.
                        </p>
                        <p>
                            Now your telegram account will be linked with your website
                            account and 2-Step verification will be enabled.
                        </p>
                        <hr />
                    </div>
                </>
            );

        } catch (err) {
            showToast({ isSuccess: false, message: err?.response?.data?.message || "Telegram auth failed" });
        }
    };

    /* ================= UI ================= */

    return (
        <>
            <style>
                {`

            body {
                color: var(--text-body);
            }

            .report-box {
                background-color: var(--bg-table);
                padding: 8px;
                min-height: calc(100vh - 60px);
            }

            .report-title {
                display: flex;
                display: -webkit-flex;
                justify-content: space-between;
                align-items: center;
            }

            .report-name {
                height: 43px;
                font-size: var(--font-24);
            }

            .badge {
                display: inline-block;
                padding: .25em .4em;
                font-size: 75%;
                font-weight: 700;
                line-height: 1;
                text-align: center;
                white-space: nowrap;
                vertical-align: baseline;
                border-radius: .25rem;
                transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
            }

            .badge-danger {
                color: #fff;
                background-color: #dc3545;
            }

            .badge {
                vertical-align: middle;
                padding: 5px 10px;
            }

            .casino-report-tabs {
                padding: 10px 0;
                background-color: #222;
                margin-top: 16px;
                display: flex;
                display: -webkit-flex;
                justify-content: center;
                align-items: center;
                margin-bottom: 10px;
            }

            .casino-report-tabs .nav-tabs {
                border: 0;
            }

            .casino-report-tabs .nav-tabs .nav-link {
                color: #ccc;
                padding-top: 0;
                padding-bottom: 4px;
                padding-left: 12px;
                padding-right: 12px;
                border: 0;
                cursor: pointer;
            }

            .casino-report-tabs .nav-tabs .nav-item .nav-link.active {
                color: #eee;
                border-bottom: 1px solid var(--text-table-header-new);
                background-color: transparent;
            }

            .tab-content {
                font-size: 13px;
            }

            .security-auth .verify-code {
                width: auto;
                font-size: var(--font-56);
                line-height: 1;
                color: #eee;
                background: #222;
                padding: 10px;
                border-radius: 0;
                display: inline-block;
                letter-spacing: 40px;
                font-weight: bold;
                padding-left: 40px;
            }

            .form-control {
                background-color: #444;
                height: 36px;
                border-radius: 0;
                border: 1px solid #555;
                color: #ddd;
                font-size: 13px;
            }

            .form-control:focus, .form-control:hover {
                  box-shadow: 0 0 4px var(--text-body);
                  background-color: var(--bg-body);
                  border: 1px solid var(--text-body);
                  color: var(--text-body);
                  box-shadow: none;
              }

            .security-auth .secure-password .form-control {
                height: 38px;
                display: inline-block;
                width: 194px;
            }

            .password-input::placeholder {
                  color: #fff;
                  opacity: 1;
              }

            .follow-instruction {
                background-color: #222;
                padding: 10px;
                color: #eee;
                display: inline-block;
                padding: 8px;
            }

            kbd {
                padding: .2rem .4rem;
                font-size: 87.5%;
                color: #fff;
                background-color: #212529;
                border-radius: .2rem;
            }

            hr {
                margin-top: 1rem;
                margin-bottom: 1rem;
                border: 0;
                border-top: 1px solid rgba(0,0,0,.1);
            }

            .login-auth input {
                width: 70px;
                height: 70px;
                padding: 5px;
                margin: 0 10px;
                font-size: 30px;
                border-radius: 4px;
                border: 1px solid rgba(0, 0, 0, 0.3);
                text-align: center;
            }

            @media only screen and (min-width: 320px) and (max-width: 1279px) {
                body {
                    font-size: var(--font-small);
                }

                .report-box {
                    width: 100%;
                    padding: 4px 0;
                }

                .report-title {
                    padding: 4px 4px 0;
                }

                .report-name {
                    font-size: var(--font-24);
                    height: auto;
                    line-height: normal;
                }
            }

            @media only screen and (min-width: 320px) and (max-width: 767px) {
                .report-box {
                    padding: 0;
                }

                .report-name {
                    margin-bottom: 8px;
                    font-size: 16px;
                    font-weight: bold;
                }

                .security-auth .casino-report-tabs .nav-tabs .nav-link {
                    font-size: 10px;
                }

                .security-auth .verify-code {
                    padding-left: 20px;
                    font-size: 36px;
                    letter-spacing: 20px;
                }

                .security-auth .secure-password .form-control {
                    margin-bottom: 10px;
                }
            }
        
        `}
            </style>
            <div className="report-box security-auth w-100">

                <div className="report-title">
                    <div className="report-name">Security Auth Verification</div>
                </div>

                <div className="text-center">

                    <b>Security Auth Verification Status:</b>{" "}

                    {authStatus ? (
                        <span
                            className="btn btn-success disabled_click"
                            onClick={showDisableOtp}
                            style={{ cursor: "pointer" }}
                        >
                            Enabled {/* ({verificationType}) */}
                        </span>
                    ) : (
                        <span className="badge badge-danger" style={{ padding: "8px" }}>Disabled</span>
                    )}

                </div>

                {!authStatus && (
                    <>

                        <div className="mt-2 text-center">
                            Please select below option to enable secure auth verification
                        </div>

                        <div className="casino-report-tabs mt-3">

                            <ul className="nav nav-tabs">

                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === "mobile" ? "active" : ""}`}
                                        style={{ fontSize: "10.5px", color: activeTab === "mobile" ? "" : "#ccc" }}
                                        onClick={() => {
                                            setActiveTab("mobile");
                                            setOtpBoxHtml(null);
                                            enableMobile();
                                        }}
                                    >
                                        Android App
                                    </button>
                                </li>

                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === "telegram" ? "active" : ""}`}
                                        style={{ fontSize: "10.5px", color: activeTab === "telegram" ? "" : "#ccc" }}
                                        onClick={() => {

                                            setActiveTab("telegram");
                                            setOtpBoxHtml(null);
                                            // setTelegramPassword("");

                                        }}
                                    >
                                        Telegram
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        disabled
                                        className={`nav-link ${activeTab === "googleAuth" ? "active" : ""}`}
                                        style={{ fontSize: "10.5px", color: activeTab === "googleAuth" ? "" : "#ccc" }}
                                        onClick={() => {

                                            setActiveTab("googleAuth");
                                            setOtpBoxHtml(null);
                                            // setTelegramPassword("");

                                        }}
                                    >
                                        Google Auth
                                    </button>
                                </li>

                            </ul>

                        </div>

                        {/* <div className="tab-content">

              {activeTab === "telegram" && (
                <div className="text-center mt-3">

                  <div className="mt-2">
                    Please enter your login password to continue
                  </div>

                  <div className="login-password mt-2">

                    <input
                      type="password"
                      className="form-control password-input"
                      placeholder="Enter your login password"
                      style={{ maxWidth: "300px" }}
                      value={telegramPassword}
                      onChange={(e) => setTelegramPassword(e.target.value)}
                    />

                    <button
                      className="btn btn-success ml-2"
                      disabled={!telegramPassword}
                      onClick={() => enableTelegram(telegramPassword)}
                    >
                      Get Connection ID
                    </button>

                  </div>

                  {otpBoxHtml}

                </div>
              )}

              {activeTab === "mobile" && otpBoxHtml}

            </div> */}

                        <div className="tab-content" style={{ fontSize: "12px" }}>

                            {activeTab === "telegram" && (
                                <div className="tab-pane telegram active">
                                    <div className="text-center">
                                        <b>Please enter your login password to continue</b>
                                        <div className="form-group mt-3 secure-password" style={{ margin: "0px" }}>
                                            <input
                                                type="password"
                                                className="form-control password-input"
                                                placeholder="Enter your login password"
                                                style={{ maxWidth: "300px", color: "#fff" }}
                                                value={telegramPassword}
                                                onChange={(e) => setTelegramPassword(e.target.value)}
                                            />
                                            <button className="btn btn-primary ml-2 vt" disabled={!telegramPassword} onClick={() => enableTelegram(telegramPassword)}>
                                                Get Connection ID
                                            </button>
                                        </div>

                                        {otpBoxHtml}

                                    </div>
                                </div>
                            )}

                            {activeTab === "googleAuth" && (
                                <div className="tab-pane telegram active">
                                    <div className="text-center">
                                        <b>Please enter your login password to continue</b>
                                        <div className="form-group mt-3 secure-password" style={{ margin: "0px" }}>
                                            <input
                                                type="password"
                                                className="form-control password-input"
                                                placeholder="Enter your login password"
                                                style={{ maxWidth: "300px", color: "#fff" }}
                                                value={telegramPassword}
                                                onChange={(e) => setTelegramPassword(e.target.value)}
                                            />
                                            <button className="btn btn-primary ml-2 vt" disabled={!telegramPassword} onClick={() => enableTelegram(telegramPassword)}>
                                                Submit
                                            </button>
                                        </div>

                                        {otpBoxHtml}

                                    </div>
                                </div>
                            )}

                            {activeTab === "mobile" && otpBoxHtml}
                        </div>

                    </>
                )}

                {authStatus && (
                    <div className="mt-3 text-center">
                        {otpBoxHtml}
                    </div>
                )}

            </div>
        </>
    );
};

export default SecurityAuthVerification;