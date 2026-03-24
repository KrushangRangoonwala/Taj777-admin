import axiosInstance from "./axiosConfig";

// export function getDefaultParams() {
//   const aa = JSON.parse(sessionStorage.getItem("userdata") || null);
//   return {
//     is_app: 1,
//     auth_key: aa?.login_auth_key,
//     login_user_id: aa?.user_id,
//   };
// }

// const isApp = {
//   is_app: 1,
//   auth_key: '',
//   login_user_id: '',
// }

// export function isApiSuccess(response) {
//   return (
//     response?.data?.status?.toLowerCase() === "ok" ||
//     response?.status?.toLowerCase() === "ok"
//   );
// }

export const fetchCasinoList = async () => {
  try {
    const response = await axiosInstance.get('casino_list.php');
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