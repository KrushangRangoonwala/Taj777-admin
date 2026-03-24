import { gameType_To_details } from "./casinoDeatils_byType";

export function formatIndianNumber(num) {
    return Number(num).toLocaleString("en-IN");
}

export function normalizeNumber(value) {
    const q = Number(parseFloat(value).toString());
    return isNaN(q) ? '-' : q;
}

export function formatToUTCMinus8(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);

    // Convert to UTC-08:00
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
    const targetTime = new Date(utcTime - (8 * 60 * 60000));

    const day = String(targetTime.getDate()).padStart(2, "0");
    const month = String(targetTime.getMonth() + 1).padStart(2, "0");
    const year = targetTime.getFullYear();

    const hours = String(targetTime.getHours()).padStart(2, "0");
    const minutes = String(targetTime.getMinutes()).padStart(2, "0");
    const seconds = String(targetTime.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} (UTC-08:00)`;
}

// console.log("@@@@@@@@@@@@@@@@@@", formatToUTCMinus8("2/12/2026 2:00:17 AM"));


export function formatNumber(num) {
    if (num >= 100000) {
        // Convert to Lakhs
        return (num / 100000).toFixed(1).replace(/\.0$/, "") + "L";
    } else if (num >= 1000) {
        // Convert to Thousands
        return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    } else {
        // Less than 1000, return as is
        return num.toString();
    }
}

export const getSportName = (sportId) => {
    switch (sportId) {
        case 4:
            return "Cricket";
        case 1:
            return "Football";
        case 2:
            return "Tennis";
        // Add more cases as needed
        default:
            return "Sport";
    }
};

export function format_casino_list(casino_list) {
    let casinoDetails = {};

    casino_list?.forEach((item) => {
        const game_type = item.game_socket;
        const details = gameType_To_details[game_type];
        casinoDetails[game_type] = {
            ...item,
            game_type: game_type,
            ...details,
        }
    })

    return casinoDetails;
}


export function isBlue(type) {
    const lowerType = type.toLowerCase();
    return lowerType === "back" || lowerType === "yes";
}

export function hasKeys(obj, keys = []) {
    if (!obj || typeof obj !== "object") return false;

    return keys.every(key => key in obj);
}

export function convertToLowerString() {

}

export const getImage = (cardCode, folders, extension_) => {
    const extension = extension_ ?? 'png';
    const aa = folders ? folders : 'cards_new';
    const bb = aa.split('/').filter(val => val !== '').join('/');

    if (!cardCode || cardCode === "1")
        return `/assets/${bb}/1.png`;
    return `/assets/${bb}/${cardCode}.${extension}`
};

export function getCardImage(cardCode, folders_) {
    const folders = folders_ ? folders_ : 'cards_new';
    if (!cardCode || cardCode === "1") return getImage(cardCode, folders);
    let formattedCode = cardCode.toUpperCase();
    if (formattedCode.length > 1) {
        const lastChar = formattedCode.slice(-1);
        const secondLastChar = formattedCode.slice(-2, -1);

        if (
            ["S", "H", "D", "C"].includes(lastChar) &&
            lastChar !== secondLastChar
        ) {
            formattedCode = formattedCode + lastChar;
        }
    }
    return getImage(formattedCode, folders);
}

export const getDefaultCardImage = (cardCode) => !cardCode ? getImage('1', 'cards_new') : getImage(cardCode, 'cards_new');

export const trophyUrl = getImage('winner', 'images');

export function getValue(value, beforeDot = false) {
    if (!value) return "";
    const str = String(value);
    if (!str.includes(".")) return str;

    return str.split(".")[beforeDot ? 0 : 1];
}

export const getValueAfterDot = (value) => {
    return getValue(value, false);
};

export const getValueBeforeDot = (value) => {
    return getValue(value, true);
};

export const getMarketByNation = (data, nation, keyName = 'nation') => {
    return data.find((m) => m[keyName] === nation);
};

export const isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);

export const getIsSuspended = (market) => {
    if (isObject(market)) {
        return market?.gstatus == "0" || market?.gstatus === "suspended" || market?.gstatus === "SUSPENDED";
    } else {
        return market == "0" || market === "suspended" || market === "SUSPENDED";
    }
};

export function getGameNameFromType(type, casino_list) {
    return casino_list[type]?.game_name ?? type;
}

export function getAndarBaharPopupBgColor(isBack, side) {
    return (
        side === "ANDAR"
            ? "#953b3d"
            : side === "BAHAR"
                ? "#968226"
                : isBack
                    ? "#72bbef"
                    : "#f994ba"
    )
}

export const formatId = (id) => {
    if (!id) return "";
    const strId = String(id);
    return strId.includes(".") ? strId.split(".")[1] : strId;
};

export const suits = ["S", "H", "C", "D"];
export const suitNames = { S: "spade", H: "heart", C: "club", D: "diamond" };


export const getExposureClass = (exposure) => {
    if (exposure > 0) return "book-green";
    if (exposure < 0) return "book-red";
    return "";
}

export function getSuspendedClass(market, getExposure) {
    const exposure = getExposure(market?.sid);
    return getIsSuspended(market) ? exposure != 0 ? "suspended lock-top" : "suspended" : "";
}

export const changeTheme = (theme) => {
    const aa = theme === "light" ? theme : ""; // dark theme has empty string to this attribute
    document.documentElement.setAttribute("data-theme", aa);
};

export const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");

    const newTheme = currentTheme === "light" ? "dark" : "light";

    document.documentElement.setAttribute("data-theme", newTheme);
};

export const getCardValue = (card) => {
    if (!card || card === "1") return 0;
    const r = card.replace(/[SHDC]+$/i, "");
    if (r === "A") return 1;
    if (r === "J") return 11;
    if (r === "Q") return 12;
    if (r === "K") return 13;
    return parseInt(r) || 0;
};

export function getCards_Sum(cards) {
    if (!cards || cards.length === 0) return 0;
    return cards.reduce((sum, card) => sum + getCardValue(card), 0);
}