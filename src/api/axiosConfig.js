import axios from "axios";
import { store } from "../store/store";
import { logout, setIsSessionExpired } from "../store/slices/userSlice";

function handleUnauthorized() {
    console.log("🚫 Unauthorized Access detected");

    sessionStorage.setItem('userdata', '');
    store.dispatch(logout());
    store.dispatch(setIsSessionExpired(true));
    sessionStorage.removeItem('userdata');
    window.location.href = "/admin";
    /* window.location.href = "/admin_new"; */
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
            const data = response?.data || {};

            const message = (
                data?.message ||
                data?.msg ||
                data?.error ||
                ""
            ).toLowerCase();

            const code = data?.code || "";

            const shouldLogout =
                code === "UNAUTHORIZED" ||
                code === "ACCOUNT_BLOCKED" ||
                code === "SESSION_EXPIRED" ||

                message.includes("unauthorized") ||
                message.includes("unauthorised") ||
                message.includes("account blocked") ||
                message.includes("not logged in") ||
                message.includes("session expired");

            if (shouldLogout) {
                handleUnauthorized();
                return Promise.reject(response);
            }

            return response;
        },
        (error) => {
            const data = error?.response?.data || {};

            console.log("API Error Response:", data);

            const message = (
                data?.message ||
                data?.msg ||
                data?.error ||
                ""
            ).toLowerCase();

            const code = data?.code || "";

            const shouldLogout =
                code === "UNAUTHORIZED" ||
                code === "ACCOUNT_BLOCKED" ||
                code === "SESSION_EXPIRED" ||

                message.includes("unauthorised") ||
                message.includes("unauthorized") ||
                message.includes("account blocked") ||
                message.includes("not logged in") ||
                message.includes("session expired");

            if (shouldLogout) {
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

// export const ajax_adm = createApiInstance("http://159.65.143.49/~sevennew/ajax_adm/");
// export const ajax_files = createApiInstance("http://159.65.143.49/~sevennew/ajaxfiles/");

// export const ajax_adm = createApiInstance("http://159.65.143.49/~worlds7/ajax_adm/");
// export const ajax_files = createApiInstance("http://159.65.143.49/~worlds7/ajaxfiles/");

// const base_url = import.meta.env.VITE_IMAGE_PATH === "admin_new" ? "https://worlds777.app/" : "http://159.65.143.49/~sevennew/";
const base_url = "https://worlds777.app/";

export const ajax_adm = createApiInstance(base_url + "ajax_adm/");
export const ajax_files = createApiInstance(base_url + "ajaxfiles/");