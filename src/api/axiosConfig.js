import axios from "axios";
import { store } from "../store/store";
import { logout, setIsSessionExpired } from "../store/slices/userSlice";

const axiosInstance = axios.create({
    baseURL: "http://159.65.143.49/~sevennew/ajax_adm/",
    withCredentials: true,
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

function handleUnauthorized() {
    console.log("🚫 Unauthorized Access detected");

    sessionStorage.setItem('userdata', '');
    store.dispatch(logout());
    store.dispatch(setIsSessionExpired(true));
    window.location.href = "/admin";
}

// 🔸 Response Interceptor — handles errors globally
axiosInstance.interceptors.response.use(
    (response) => {
        if (response?.data?.message === "Unauthorised Access") {
            handleUnauthorized();
        }
        return response;
    },
    (error) => {
        const message = error?.response?.data?.message;

        if (message === "Unauthorised Access") {
            handleUnauthorized();
        }

        // Handle token expiry or unauthorized access
        if (error.response && error.response.status === 401) {
            handleUnauthorized();
        }

        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default axiosInstance;
