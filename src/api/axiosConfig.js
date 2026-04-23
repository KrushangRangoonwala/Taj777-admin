import axios from "axios";
import { store } from "../store/store";
import { logout, setIsSessionExpired } from "../store/slices/userSlice";

function handleUnauthorized() {
    console.log("🚫 Unauthorized Access detected");

    sessionStorage.setItem('userdata', '');
    store.dispatch(logout());
    store.dispatch(setIsSessionExpired(true));
    window.location.href = "/admin";
}

const createApiInstance = (baseURL) => {
    const instance = axios.create({
        baseURL,
        withCredentials: true,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    instance.interceptors.response.use(
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

            if (error.response?.status === 401) {
                handleUnauthorized();
            }

            console.error("API Error:", error.response?.data || error.message);
            return Promise.reject(error);
        }
    );

    return instance;
};

export const ajax_adm = createApiInstance("http://159.65.143.49/~sevennew/ajax_adm/");
export const ajax_files = createApiInstance("http://159.65.143.49/~sevennew/ajaxfiles/");

// export const ajax_adm = createApiInstance("https://worlds777.app/ajax_adm/"); // admin_new
// export const ajax_files = createApiInstance("https://worlds777.app/ajaxfiles/");
