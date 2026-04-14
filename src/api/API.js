import axios from "axios";
import { ajax_adm, ajax_files } from "./axiosConfig";
import { successToast } from "../utils/toast";

export const isApp = {
  is_app: 1,
  auth_key: '',
  login_user_id: '',
}

export function getDefaultParams() {
  const aa = JSON.parse(sessionStorage.getItem("userdata") || null);
  return {
    is_app: 1,
    auth_key: aa?.login_auth_key,
    login_user_id: aa?.user_id,
  };
}

export const loginAdmin = async (email, password) => {
  const params = new URLSearchParams();
  params.append('login-email', email);
  params.append('login-password', password);

  try {
    const response = await ajax_adm.post('login.php', params);

    if (response.data.status === "ok") {
      successToast("success");
      return {
        status: "ok",
        data: response.data
      };
    } else {
      const errorMessage = response.data?.message || response.data?.error || "Login failed";
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Login API error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }

};

export async function getAccountStatement(extraPayload = {}) {
  try {
    const payload = { ...getDefaultParams(), ...extraPayload };
    const { data } = await ajax_adm.post(
      "get_account_statement",
      payload
    );
    return data;
  } catch (error) {
    console.error("Error fetching accontstatements:", error);
    throw error;
  }
}

export async function getClients(search = "") {
  try {
    const payload = {
      search,
      ...getDefaultParams(),
    };
    const { data } = await ajax_adm.post("get_clients.php", payload);

    return data;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }
}

export async function getProfitLoss(payload) {
  try {
    const fullPayload = {
      ...payload,
      ...getDefaultParams(),
    };
    const { data } = await ajax_adm.post("profit_loss", fullPayload);
    return data;
  } catch (error) {
    console.error("Error fetching profit loss:", error);
    throw error;
  }
}

export async function getCurrentBets(payload) {
  try {
    const fullPayload = {
      ...payload,
      ...getDefaultParams(),
    };
    const { data } = await ajax_adm.post("current_bets", fullPayload);
    return data;
  } catch (error) {
    console.error("Error fetching profit loss:", error);
    throw error;
  }
}

export async function getUserHistory(payload) {
  try {
    const fullPayload = {
      ...payload,
      ...getDefaultParams(),
    };
    const { data } = await ajax_adm.post("user_history", fullPayload);
    return data;
  } catch (error) {
    console.error("Error fetching history:", error);
    throw error;
  }
}
export async function getCasinoResult(payload) {
  try {
    const fullPayload = {
      ...payload,
      ...getDefaultParams(),
    };
    const { data } = await ajax_adm.post("casino_result", fullPayload);
    return data;
  } catch (error) {
    console.error("Error fetching history:", error);
    throw error;
  }
}
export async function checkUserLockPwd(payload) {
  try {
    const fullPayload = {
      ...payload,
      ...getDefaultParams(),
    };
    const { data } = await ajax_adm.post("check_pwd", fullPayload);
    return data;
  } catch (error) {
    console.error("Error fetching history:", error);
    throw error;
  }
}
export async function updateUserLockStatus(payload) {
  try {
    const fullPayload = {
      ...payload,
      ...getDefaultParams(),
    };
    const { data } = await ajax_adm.post("update_status", fullPayload);
    return data;
  } catch (error) {
    console.error("Error fetching history:", error);
    throw error;
  }
}
export async function getAuthList(payload) {
  try {
    const fullPayload = {
      ...payload,
      ...getDefaultParams(),
    };
    const { data } = await ajax_adm.post("auth_list", fullPayload);
    return data;
  } catch (error) {
    console.error("Error fetching history:", error);
    throw error;
  }
}
export async function getUserRegisterDetail(payload) {
  try {
    const fullPayload = {
      ...payload,
      ...getDefaultParams(),
    };
    const { data } = await ajax_adm.post("get_user_register_detail", fullPayload);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
export async function getTurnover(payload) {
  try {
    const fullPayload = {
      ...payload,
      ...getDefaultParams(),
    };
    const { data } = await ajax_adm.post("get_turnover", fullPayload);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
export async function getTotalProfitLoss(payload) {
  try {
    const fullPayload = {
      ...payload,
      ...getDefaultParams(),
    };
    const { data } = await ajax_adm.post("total_profit_loss", fullPayload);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
export async function getUserList(payload) {
  try {
    const fullPayload = {
      ...payload,
      ...getDefaultParams(),
    };
    const { data } = await ajax_adm.post("get_user_list", fullPayload);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
export async function accountTransaction(payload) {
  try {
    const fullPayload = {
      ...payload,
      ...getDefaultParams(),
    };
    const { data } = await ajax_adm.post("account_transaction", fullPayload);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
export async function changeUserPassword(payload) {
  try {
    const fullPayload = {
      ...payload,
      ...getDefaultParams(),
    };
    const { data } = await ajax_adm.post("change_password", fullPayload);
    return data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
}
export async function changeUserStatus(payload) {
  try {
    const fullPayload = {
      ...payload,
      ...getDefaultParams(),
    };
    const { data } = await ajax_adm.post("change_status", fullPayload);
    return data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
}
export async function insertUser(payload) {
  try {
    const fullPayload = {
      ...payload,
      ...getDefaultParams(),
    };
    const { data } = await ajax_adm.post("add_user", fullPayload);
    return data;
  } catch (error) {
    console.error("Error changing password:", error);
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

    const { data } = await ajax_adm.post("teenpatti_result", requestBody);
    isApiSuccess(data);
    return data;
  } catch (error) {
    console.error("Error fetching teenpatti results:", error);
    return null;
  }
}

export async function apiGetUpcomingFixtures(dispatch) {
  try {
    const { data } = await ajax_files.post("/upcoming_fixture", isApp);
    return data?.all_data || [];
  } catch (error) {
    console.log('error', error);
    return [];
  }
};


export async function fetchExposureList({ eventId, exposureType }) {
  try {
    const payload = { ...getDefaultParams(), ...(eventId && { eventId }), exposureType };
    const { data } = await ajax_adm.post("/exposure_list", payload);
    return data || [];
  } catch (error) {
    console.error("Error fetching exposure list:", error);
    throw error;
  }
}

export const getEventPage_Exposure = (eventId) => fetchExposureList({ eventId, exposureType: "eventsList" })

export const getMarketPage_Exposure = () => fetchExposureList({ exposureType: "marketList" })

