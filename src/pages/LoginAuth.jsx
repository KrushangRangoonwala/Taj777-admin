import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { ajax_adm, ajax_files } from '../api/axiosConfig';
import { errorToast, successToast } from '../utils/toast';
import { login, setIsAfterLoginImagePopupOpen, setIsLoginModalOpen } from '../store/slices/userSlice';
import { setIsLoading } from '../store/slices/actionSlice';
import OtpInput from '../components/OtpInput';
import Loading from '../components/Loading';

const LoginAuth = () => {
    const isLoading = useSelector((state) => state.action.isLoading);
    const [noAttempt, setNoAttempt] = useState(5);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = location.state || {};
    console.log('user', user);

    useEffect(() => {
        if (!location.state) {
            navigate("/login");
        }
    }, []);

    const checkOtp = async (otp) => {
        dispatch(setIsLoading(true));
        if (noAttempt <= 0) {
            // errorToast("token code not valid.You have 0attempt left")
            return;
        }

        if (otp.length !== 6) return;

        try {

            const res = await ajax_adm.post(
                "/auth_verify_code.php",
                {
                    is_app: 1,
                    auth_key: user.login_auth_key,
                    login_user_id: user.user_id,
                    code: otp,
                    auth_login_id: user.user_id,
                }
            );

            const response = res.data;

            if (response.status === "error") {

                const msg =
                    response.message === "Code expired!" || response.message === "Code does not matched!"
                        ? `token code not valid.You have ${noAttempt}attempt left`
                        : response.message || "Invalid OTP";
                // errorToast(msg)
                setNoAttempt(noAttempt - 1);

                return;
            }

            if (response.status === "ok") {

                dispatch(login(response));
                // dispatch(updateUserData(response));

                // const sss = JSON.parse(sessionStorage.getItem("userdata"))
                // sessionStorage.setItem("userdata", JSON.stringify({ ...sss, ...response }));
                sessionStorage.setItem("userdata", JSON.stringify(response));

                dispatch(setIsLoginModalOpen(false));

                // resetState();

                setTimeout(() => navigate(`/admin/home`), 500);
                // setTimeout(() => navigate("/sport"), 9000);

                // setTimeout(() => dispatch(setIsAfterLoginImagePopupOpen(true)), 1000);
            }

        } catch (err) {
            console.error(err);
        } finally {
            dispatch(setIsLoading(false));
        }
    };

    return (
        <div class="login-auth">
            {isLoading && <Loading />}
            <div class="loginInner1 authentication">
                <div class="log-logo m-b-20 text-center">
                    <img src="https://sitethemedata.com/sitethemes/world777.com/front/logo.png" class="logo-login" />
                </div>
                <div class="featured-box-login featured-box-secundary default">
                    <h3 class="text-center">
                        {user?.auth_user_verification_type === "Telegram"
                            ? "Security Code Verification Using Telegram App"
                            : "Security Code Verification"
                        }
                    </h3>
                    <div class="mt-3 text-center">
                        {user?.auth_user_verification_type === "Telegram"
                            ? "Enter 6-digit code from your telegram bot Resent Code"
                            : "Enter 6-digit code from your security auth verification App"
                        }
                    </div>
                    <form role="form" autoComplete="off" method="post" className="mt-3">
                        <OtpInput onComplete={checkOtp} />
                    </form>
                </div>
            </div>
        </div>
    )
}

export default LoginAuth