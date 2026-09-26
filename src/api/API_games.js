import axios from "axios";
import { ajax_adm, ajax_files } from "./axiosConfig";
import { getDefaultParams } from "./API";
import { format_casino_list } from "../utilies/helpers";
import { store } from "../store/store";
import { setAllCasinoGames } from "../store/slices/casinoSlice";
import { setPlaceBetBtns } from "../store/slices/userSlice";

export function isApiSuccess(response) {
    return (
        response?.data?.status?.toLowerCase() === "ok" ||
        response?.status?.toLowerCase() === "ok" ||
        response?.data === "Login success"
    );
}

export const fetchCasinoList = async () => {
    try {
        const { data } = await ajax_files.get('/casino_list.php');
        if (data.status === 'ok') {
            const formated_casino_list = format_casino_list(data.all_data || []);
            store.dispatch(setAllCasinoGames(formated_casino_list));
        }
        return data;
    } catch (error) {
        console.error('Error fetching casino list:', error);
        throw error;
    }
};

export const apiGetSports = async () => {
    try {
        const payload = { ...getDefaultParams() };
        const response = await ajax_files.post('/sport_list.php', payload);
        return response.data;
    } catch (error) {
        console.error('Error fetching list:', error);
        throw error;
    }
};

export const apiGetGameType = async () => {
    try {
        const payload = { ...getDefaultParams() };
        const response = await ajax_files.post('/game_type_list.php', payload);
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
        const { data } = await ajax_files.post(
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
        const { data } = await ajax_files.post("get_dashboard_data.php", payload);  // DUMMY URL
        return data;
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw error;
    }
}

export async function fetchResultById(eventId, gameType, userId = "") {
    try {
        const requestBody = {
            event_id: eventId || "",
            game_type: gameType || "teen",
            userid: userId || "",
            ...getDefaultParams(),
        };

        const { data } = await ajax_files.post("/teenpatti_result", requestBody);
        isApiSuccess(data);
        return data;
    } catch (error) {
        console.error("Error fetching teenpatti results:", error);
        return null;
    }
}


export async function getBannerImages() {
    try {
        const payload = getDefaultParams();
        const { data } = await ajax_files.post("/main_slider", payload);

        const imgArr = [];
        data.data?.forEach((item) => {
            imgArr.push(item.image);
        });
        return imgArr || [];
    } catch (error) {
        console.error("Error fetching banner images:", error);
        return [];
    }
}

export async function getEventActiveBets(eventId) {
    try {
        const { data } = await ajax_adm.post("events_active_bets", { ...getDefaultParams(), eventId });
        // console.log('data', data)
        return data || [];
    } catch (error) {
        console.error("Error fetching event active bets:", error);
        throw error;
    }
}


export async function getButtonValuesApi(extraPayload = {}) {
    try {
        const payload = { ...getDefaultParams(), ...extraPayload };
        const { data } = await ajax_files.post("/get_stake_button", payload);

        const res = {
            eventBetBtns: data?.data?.map(v => Number(v)),
            casinoBetBtns: data?.casino_data?.map(v => Number(v)),
        }

        store.dispatch(setPlaceBetBtns(res));
    } catch (error) {
        throw error;
    }
}


export async function updateButtonValuesApi(extraPayload = {}) {
    try {
        const payload = { ...getDefaultParams(), ...extraPayload };

        const { data } = await axiosInstance.post("/button_value_change", payload);
        return data;
    } catch (error) {
        throw error;
    }
}


/** Downline aggregated exposure for current casino round (ajax_adm). */
export async function fetchCasinoDownlineExposureApi(payload) {
    const { markettype, main_event_id, event_id } = payload;
    const roundId = splitByDot(String(main_event_id ?? event_id ?? "")) || "";
    const fullPayload = {
        markettype,
        event_id: roundId,
        main_event_id: roundId,
        ...getDefaultParams(),
    };
    try {
        const { data } = await ajax_adm.post(
            "get_casino_event_exposure.php",
            fullPayload
        );
        return data;
    } catch (error) {
        console.error("Error fetching casino downline exposure:", error);
        throw error;
    }
}

/** Active downline bets for current casino round (ajax_adm). */
export async function fetchCasinoDownlineActiveBetsApi(payload) {
    const { markettype, main_event_id, event_id, limit = 10 } = payload;
    const roundId = splitByDot(String(main_event_id ?? event_id ?? "")) || "";
    const fullPayload = {
        markettype,
        event_id: roundId,
        eventId: roundId,
        limit,
        ...getDefaultParams(),
    };
    try {
        const { data } = await ajax_adm.post(
            "get_casino_event_active_bets.php",
            fullPayload
        );
        return data;
    } catch (error) {
        console.error("Error fetching casino downline active bets:", error);
        throw error;
    }
}