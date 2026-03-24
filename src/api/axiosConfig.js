import axios from "axios";
// import { store } from "../store/store";
// import { logout, setIsSessionExpired } from "../store/slices/userSlice";
// import { toast } from "react-toastify";
// import { getAuthToken, removeAuthToken } from "../utils/auth";

const axiosInstance = axios.create({
    // baseURL: process.env.API_BASE_URL || "https://worlds777.app/ajaxfiles/",
    baseURL: "https://worlds777.app/ajaxfiles/",

    // timeout: 10000, // 10 seconds : it allows you to define a maximum waiting time (in milliseconds) for each request.
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});


// function handleUnauthorized() {
//     console.log("🚫 Unauthorized Access detected");

//     sessionStorage.setItem('userdata', '');
//     store.dispatch(logout());
//     store.dispatch(setIsSessionExpired(true));
// }


// // 🔸 Response Interceptor — handles errors globally
// axiosInstance.interceptors.response.use(
//     (response) => {
//         if (response?.data?.message === "Unauthorised Access") {
//             handleUnauthorized();
//         }

//         return response;
//     },

//     (error) => {
//         const message = error?.response?.data?.message;

//         if (message === "Unauthorised Access") {
//             handleUnauthorized();
//         }

//         // Handle token expiry or unauthorized access
//         if (error.response && error.response.status === 401) {
//             // removeAuthToken();
//             // window.location.href = "/login"; // redirect to login
//         }

//         // Log error or send to monitoring service
//         console.error("API Error:", error.response?.data || error.message);

//         // Optionally show a message (you can use toast/snackbar here)
//         return Promise.reject(error);
//     }
// );

export default axiosInstance;
