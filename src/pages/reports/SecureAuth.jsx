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
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/userSlice';
import { useDispatch } from 'react-redux';
import OtpInput from '../../components/OtpInput';
import { setIsLoading } from '../../store/slices/actionSlice';

function MobileAppDownload() {
    return (
        <>
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
                <Link to={`${import.meta.env.VITE_BACKEND_BASE_URL}/apk/auth_v1.apk`} rel="noopener noreferrer">
                    <button className="btn btn-primary">
                        <i className="fab fa-android"></i>{" "}
                        <span>Download on the Android</span>
                    </button>
                </Link>
            </div>
        </>
    )
}

const SecureAuth = () => {
    const chkAuthRef = useRef("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);
    const [authStatus, setAuthStatus] = useState(false);
    const [verificationType, setVerificationType] = useState("");
    const [otpBoxHtml, setOtpBoxHtml] = useState(null);
    const [telegramPassword, setTelegramPassword] = useState("");

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

    /* ================= AUTO STATUS CHECK ================= */
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await checkAuthStatusApi({
                    auth_status: authStatus
                });

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
    // const handleOtpChange = async (e, index) => {
    //     const value = e.target.value;

    //     if (!/^[0-9]?$/.test(value)) {
    //         e.target.value = "";
    //         return;
    //     }

    //     const nextInput = inputsRef.current[index + 1];
    //     const prevInput = inputsRef.current[index - 1];

    //     if (value && nextInput) nextInput.focus();
    //     if (!value && prevInput) prevInput.focus();

    //     const otpArr = inputsRef.current.map(i => i?.value).filter(Boolean);

    //     if (otpArr.length !== 6) return;

    //     const otp = otpArr.join("");

    //     try {
    //         const res = await disableAuthApi({ code: otp });
    //         successToast(res?.message || "Success")
    //     } catch (err) {
    //         errorToast(err?.response?.data?.message || "Sorry for inconvenience! You will see statement of 10 days date range in 3 months timeslot.");
    //     }
    // };

    /* ================= OTP INPUT ================= */
    const checkOtp = async (otp) => {
        if (otp.length !== 6) return;

        try {
            const res = await disableAuthApi({
                code: otp
            });
            if (res?.status === "ok") {
                // showToast({ message: "2-Step Verification is disabled for your account.", isSuccess: true });
                successToast("Token Valid.")
                dispatch(logout());
                setTimeout(() => navigate("/"), 500);
            } else {
                // showToast({ message: res?.message || "Invalid Code", isSuccess: false });
            }
        } catch (err) {
            // showToast({ message: err?.response?.data?.message || "Invalid Code", isSuccess: false });
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

                        <MobileAppDownload />

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
                <div className="mt-3">
                    <b>Please follow below instructions for the telegram 2-step verification</b>
                    <p>
                        Find{' '}
                        <Link
                            target="_blank"
                            to={`https://t.me/${import.meta.env.VITE_TELEGRAM_LINK}?start`}
                            className="text-primary"
                        >
                            {import.meta.env.VITE_TELEGRAM_BOT}
                        </Link>
                        in your telegram and type
                        <kbd>/start</kbd>
                        command. Bot will respond you.
                    </p>
                    <p className="text-dark">
                        After this type
                        <kbd>/connect {code}</kbd> and send it
                        to BOT.
                    </p>
                    <p>
                        Now your telegram account will be linked with your
                        website account and 2-Step veriication will be enabled.
                    </p> <hr />
                </div>
            );

        } catch (err) {
            errorToast("Telegram auth failed");
        }
    };

    /* ================= DISABLE ================= */

    const showDisableOtp = async () => {
        dispatch(setIsLoading(true));
        try {
            // if (verificationType === "Telegram") {
            const res = await telegramOtpGenerationApi();
            if (res?.status === "ok") {
                successToast("Successfully Code Generate.");
                setOtpBoxHtml(
                    <div className="tab-pane active">
                        <div className='mt-2 mb-3 login-auth'>
                            <h3 className="text-center">Security Code Verification</h3>
                            <div className="mt-3 text-center">
                                Enter 6-digit code from your security auth verification App
                            </div>
                            <div className="mt-2 mb-3 login-auth">
                                <OtpInput onComplete={checkOtp} />
                            </div>
                        </div>
                    </div>
                );
            }
            // }
        } catch (err) {
            errorToast("Failed to generate OTP");
        } finally {
            dispatch(setIsLoading(false));
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
                        <span className="badge badge-danger p-2">Disabled</span>
                    )}
                </div>

                {verificationType === "Mobile" && authStatus &&
                    <div className='text-center'>
                        <MobileAppDownload />
                    </div>
                }

                {!authStatus && (
                    <>
                        <div className="mt-2 text-center">
                            Please select below option to enable secure auth verification
                        </div>

                        <div className="casino-report-tabs mt-3">
                            <ul className="nav nav-tabs">

                                <li className="nav-item pointer">
                                    <Link
                                        to="#"
                                        className={`nav-link ${tab === 1 ? "active" : ""}`}
                                        onClick={() => {
                                            setTab(1);
                                            setOtpBoxHtml(null);
                                            enableMobile();
                                        }}
                                    >
                                        Enable Using Mobile App
                                    </Link>
                                </li>

                                <li className="nav-item pointer">
                                    <Link
                                        to="#"
                                        className={`nav-link ${tab === 2 ? "active" : ""}`}
                                        onClick={() => {
                                            setTab(2);
                                            setOtpBoxHtml(null);
                                        }}
                                    >
                                        Enable Using Telegram
                                    </Link>
                                </li>

                                <li className="nav-item pointer">
                                    <Link
                                        to="#"
                                        // disabled
                                        className={`nav-link ${tab === 3 ? "active" : ""}`}
                                        onClick={() => {
                                            setTab(3);
                                            setOtpBoxHtml(null);
                                        }}
                                    >
                                        Enable Using Google Auth
                                    </Link>
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
                            {tab === 3 &&
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
                                            Submit
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