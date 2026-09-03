const getEnv = (key) => {
    const value = import.meta?.env?.[key] ?? (typeof process !== "undefined" ? process?.env?.[key] : undefined);
    return value || "";
};

export const SOCKETS = {
    CASINO: getEnv("VITE_GAME_IP") || "https://allpanelexch.fyi:2053",
    SPORTS: getEnv("VITE_SPORTS_IP") || "https://allpanelexch.fyi:8443",
    // MINING: "https://mininginfo.org:2053",
};

export const getSocketUrl = (type = "casino") => {
    if (type === "sports") return SOCKETS.SPORTS;
    return SOCKETS.CASINO;
};
