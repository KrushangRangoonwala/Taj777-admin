import axios from "axios";
import { apiGames } from "./axiosConfig";
import { getDefaultParams } from "./API";

export function isApiSuccess(response) {
    return (
        response?.data?.status?.toLowerCase() === "ok" ||
        response?.status?.toLowerCase() === "ok" ||
        response?.data === "Login success"
    );
}

export const fetchCasinoList = async () => {
    try {
        const response = await apiGames.get('/casino_list.php');
        return response.data;
    } catch (error) {
        console.error('Error fetching casino list:', error);
        throw error;
    }
};

export const apiGetSports = async () => {
    try {
        const payload = { ...getDefaultParams() };
        const response = await apiGames.post('/sport_list.php',payload);
        return response.data;
    } catch (error) {
        console.error('Error fetching list:', error);
        throw error;
    }
};

export const apiGetGameType = async () => {
    try {
        const payload = { ...getDefaultParams() };
        const response = await apiGames.post('/game_type_list.php',payload);
        return response.data;
    } catch (error) {
        console.error('Error fetching list:', error);
        throw error;
    }
};

export function splitByDot(value, idx = 1) {
    return value.includes(".") ? value.split(".")[idx] : value;
}

export async function fetchCasinoExposureApi(payload) {
    const { markettype, main_event_id, curPageName } = payload;
    const fullPayload = {
        markettype,
        main_event_id: splitByDot(String(main_event_id)) || "",
        curPageName,
        ...getDefaultParams(),
    };
    try {
        const { data } = await apiGames.post(
            "get_casino_on_page_exposure",
            fullPayload
        );
        return data;
    } catch (error) {
        console.error("Error fetching exposure:", error);
        throw error;
    }
}


export async function fetchDashboardData() {
    try {
        const payload = { ...getDefaultParams() };
        const { data } = await apiGames.post("get_dashboard_data.php", payload);  // DUMMY URL
        return data;
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw error;
    }
}

export async function fetchResultById(eventId, gameType) {
    try {
        const requestBody = {
            event_id: eventId || "",
            game_type: gameType || "teen",
            ...getDefaultParams(),
        };

        const { data } = await apiGames.post("/teenpatti_result", requestBody);
        isApiSuccess(data);
        return data;
    } catch (error) {
        console.error("Error fetching teenpatti results:", error);
        return null;
    }
}