import React, { useEffect, useState, useRef } from 'react'
import PageNamePath from '../../components/PageNamePath'
import { errorToast, successToast } from '../../utils/toast';

import {
    authStatusApi,
    enableMobileAuthApi,
    enableTelegramAuthApi,
    disableAuthApi,
    checkAuthStatusApi,
    telegramOtpGenerationApi
} from "../../api/API";

const SecureAuth = () => {

    const [tab, setTab] = useState(0);
    const [authStatus, setAuthStatus] = useState(false);
    const [verificationType, setVerificationType] = useState("");
    const [otpBoxHtml, setOtpBoxHtml] = useState(null);
    const [telegramPassword, setTelegramPassword] = useState("");
    const inputsRef = useRef([]);

    /* ================= LOAD STATUS ================= */

    useEffect(() => {
        loadStatus();
    }, []);

    const loadStatus = async () => {
        try {
            const res = await authStatusApi();
            setAuthStatus(res?.user_verification_status === "ENABLED");
            setVerificationType(res?.user_verification_type);
        } catch (err) {
            console.error(err);
        }
    };

    /* ================= AUTO CHECK ================= */

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                await checkAuthStatusApi({ auth_status: authStatus });
            } catch (err) {
                console.error(err);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [authStatus]);

    /* ================= OTP INPUT ================= */

    const handleOtpChange = async (e, index) => {
        const value = e.target.value;

        if (!/^[0-9]?$/.test(value)) {
            e.target.value = "";
            return;
        }

        const nextInput = inputsRef.current[index + 1];
        const prevInput = inputsRef.current[index - 1];

        if (value && nextInput) nextInput.focus();
        if (!value && prevInput) prevInput.focus();

        const otpArr = inputsRef.current.map(i => i?.value).filter(Boolean);

        if (otpArr.length !== 6) return;

        const otp = otpArr.join("");

        try {
            const res = await disableAuthApi({ code: otp });
            successToast(res?.message || "Success")
        } catch (err) {
            errorToast(err?.response?.data?.message || "Sorry for inconvenience! You will see statement of 10 days date range in 3 months timeslot.");
        }
    };

    /* ================= ENABLE MOBILE ================= */

    const enableMobile = async () => {
        try {
            const res = await enableMobileAuthApi();
            const code = res?.verification_code || res?.data?.verification_code;

            setOtpBoxHtml(
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
                            <a href="https://sitethemedata.com/auth_apk/SecureAuthApp-2.0.apk" target="_blank" rel="noopener noreferrer">
                                <button className="btn btn-primary">
                                    <i className="fab fa-android"></i>{" "}
                                    <span>Download on the Android</span>
                                </button>
                            </a>
                        </div>

                    </div>
                </div>
            );

        } catch (err) {
            errorToast("Failed to enable mobile auth");
        }
    };

    /* ================= ENABLE TELEGRAM ================= */

    const enableTelegram = async () => {
        try {
            const res = await enableTelegramAuthApi({
                password: telegramPassword
            });

            const code = res?.verification_code || res?.data?.verification_code;

            setOtpBoxHtml(
                <div className="mt-3 follow-instruction text-center">
                    <b>Please follow instructions</b>

                    <p>Open your Telegram bot and send:</p>
                    <p><kbd>/connect {code}</kbd></p>
                </div>
            );

        } catch (err) {
            errorToast("Telegram auth failed");
        }
    };

    /* ================= DISABLE ================= */

    const showDisableOtp = async () => {
        try {

            if (verificationType === "Telegram") {
                await telegramOtpGenerationApi();
            }

            setOtpBoxHtml(
                <div className="text-center mt-3">

                    <div className="mt-3">Enter 6-digit code</div>

                    <div className="inputs mt-3" style={{ display: "flex", justifyContent: "center" }}>
                        {[...Array(6)].map((_, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputsRef.current[index] = el)}
                                type="tel"
                                maxLength="1"
                                className="otp-input"
                                onChange={(e) => handleOtpChange(e, index)}
                            />
                        ))}
                    </div>

                </div>
            );

        } catch {
            errorToast("OTP failed");
        }
    };

    return (
        <div className="security-auth">

            <PageNamePath
                pageName="Secure Auth Verification"
                pathArr={[
                    { path: "/admin/home", name: "Home" },
                    { path: "", name: "Secure Auth" }
                ]}
            />

            <div className="card-body">

                <div className="text-center">
                    <b>Secure Auth Verification Status:</b>{" "}

                    {authStatus ? (
                        <span
                            className="btn btn-success"
                            onClick={showDisableOtp}
                            style={{ cursor: "pointer" }}
                        >
                            Enabled
                        </span>
                    ) : (
                        <span className="badge badge-danger">Disabled</span>
                    )}
                </div>

                {!authStatus && (
                    <>
                        <div className="mt-2 text-center">
                            Please select below option to enable secure auth verification
                        </div>

                        <div className="casino-report-tabs mt-3">
                            <ul className="nav nav-tabs">

                                <li className="nav-item pointer">
                                    <a
                                        className={`nav-link ${tab === 1 ? "active" : ""}`}
                                        onClick={() => {
                                            setTab(1);
                                            setOtpBoxHtml(null);
                                            enableMobile();
                                        }}
                                    >
                                        Enable Using Mobile App
                                    </a>
                                </li>

                                <li className="nav-item pointer">
                                    <a
                                        className={`nav-link ${tab === 2 ? "active" : ""}`}
                                        onClick={() => {
                                            setTab(2);
                                            setOtpBoxHtml(null);
                                        }}
                                    >
                                        Enable Using Telegram
                                    </a>
                                </li>

                            </ul>
                        </div>

                        <div className="tab-content mt-4">

                            {tab === 1 && otpBoxHtml}

                            {tab === 2 &&
                                <div className="tab-pane telegram active text-center">

                                    <b>Please enter your login password to continue</b>

                                    <div className="form-group mt-3 secure-password">
                                        <input
                                            type="password"
                                            placeholder="Enter your login password"
                                            className="form-control"
                                            value={telegramPassword}
                                            onChange={(e) => setTelegramPassword(e.target.value)}
                                        />

                                        <button
                                            className="btn btn-primary ml-2 vt"
                                            disabled={!telegramPassword}
                                            onClick={enableTelegram}
                                        >
                                            Get Connection ID
                                        </button>
                                    </div>

                                    {otpBoxHtml}
                                </div>
                            }

                        </div>
                    </>
                )}

                {authStatus && (
                    <div className="text-center mt-3">
                        {otpBoxHtml}
                    </div>
                )}

            </div>
        </div>
    )
}

export default SecureAuth;