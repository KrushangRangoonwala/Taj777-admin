import axiosInstance from "./axiosConfig";

export function getDefaultParams() {
  const aa = JSON.parse(sessionStorage.getItem("userdata") || null);
  return {
    is_app: 1,
    auth_key: aa?.login_auth_key,
    login_user_id: aa?.user_id,
  };
}


export function isApiSuccess(response) {
  return (
    response?.data?.status?.toLowerCase() === "ok" ||
    response?.status?.toLowerCase() === "ok" ||
    response?.data === "Login success"
  );
}

export const loginAdmin = async (email, password) => {
  const params = new URLSearchParams();
  params.append('login-email', email);
  params.append('login-password', password);

  try {
    const response = await axiosInstance.post('login.php', params);
    
    if (response.data.status === "ok") {
      return {
        status: "ok",
        data: {
          user_name: response.data.user_name || email,
          role: response.data.role || "admin",
          login_auth_key: response.data.login_auth_key,
          user_id: response.data.login_id,
          ...response.data
        }
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

export const fetchCasinoList = async () => {
  try {
    const response = await axiosInstance.get('http://159.65.143.49/~sevennew/ajaxfiles/casino_list.php');
    return response.data;
  } catch (error) {
    console.error('Error fetching casino list:', error);
    throw error;
  }
};

export async function fetchCasinoExposureApi(payload) {
  const { markettype, main_event_id, curPageName } = payload;
  const fullPayload = {
    markettype,
    main_event_id: splitByDot(String(main_event_id)) || "",
    curPageName,
    ...getDefaultParams(),
  };
  try {
    const { data } = await axiosInstance.post(
      "get_casino_on_page_exposure",
      fullPayload
    );
    return data;
  } catch (error) {
    console.error("Error fetching exposure:", error);
    throw error;
  }
}

export async function getAccountStatement(extraPayload = {}) {
  try {
    const payload = { ...getDefaultParams(), ...extraPayload };
    const { data } = await axiosInstance.post(
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
    const { data } = await axiosInstance.post("get_clients.php", payload);

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
    const { data } = await axiosInstance.post("profit_loss", fullPayload);
    return data;
  } catch (error) {
    console.error("Error fetching profit loss:", error);
    throw error;
  }
}