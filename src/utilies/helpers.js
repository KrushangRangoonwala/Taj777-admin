import { gameType_To_details } from "./casinoDeatils_byType";

export function formatIndianNumber(num) {
    return Number(num).toLocaleString("en-IN");
}

export function normalizeNumber(value) {
    const q = Number(parseFloat(value).toString());
    return isNaN(q) ? '-' : q;
}

export function formatWithTimezone(dateString, showUTC = false) {
    if (!dateString) return '';
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const h = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, "0");
    const m = String(Math.abs(offsetMinutes) % 60).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${showUTC ? `(UTC${sign}${h}:${m})` : ''}`;
}

// console.log("@@@@@@@@@@@@@@@@@@", formatWithTimezone("2/12/2026 2:00:17 AM"));

export function formatNumber(num, fix = 1) {
    if (num === undefined || num === null || isNaN(num)) {
        return "";
    }
    const n = Number(num);
    if (n >= 100000) {
        // Convert to Lakhs
        return (n / 100000).toFixed(fix).replace(/\.?0+$/, "") + "L";
    } else if (n >= 1000) {
        // Convert to Thousands
        return (n / 1000).toFixed(fix).replace(/\.?0+$/, "") + "K";
    } else {
        // Less than 1000, return as is
        return n.toString();
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
        return `/admin/assets/${bb}/1.png`;
    return `/admin/assets/${bb}/${cardCode}.${extension}`
};

export function getCardImage(cardCode, folders_) {
    const folders = folders_ ? folders_ : 'cards_new';
    if (!cardCode || cardCode == "1") return getImage(cardCode, folders);
    var formattedCode = String(cardCode);
    if (formattedCode?.length > 1 && !formattedCode?.toLowerCase()?.includes("dice")) {
        formattedCode = formattedCode.toUpperCase();
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

export const getMarketBySid = (data, sid) => {
    return data.find((m) => String(m.sid) === String(sid));
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

export const gameCodeMap = {
    // IF U CHANGE GAME_PATH, ALSO CHANGE IT IN CasinoCenterContent.JS , gamePath_MapTo_gametype IN casinoDeatils_byType.js , Casinomap.js
    "casino_war": "war",
    '32_cards-a': 'card32-A',
    '32_cards-b': 'card32-B',
    'ab204': 'ab4',
    'ab202': 'andarbahar2',
    'ab20': 'andarbahar',
    'baccarat': 'baccarat',
    'baccarat2': 'baccarat2',
    'teensin': '29cardbaccarat',
    'aaa': 'aaa',
    'aaa2': 'aaa2',
    '20_teenpatti': 'teenpattit20',
    'teen20c': 'teenpatti20c',
    'teen20b': 'teenpatti20b',
    'teen33': 'instantteenpatti3',
    'teen32': 'instantteenpatti2',
    'test_teenpatti': 'teenpattitest',
    'open_teenpatti': 'teenpattiopen',
    'teenmuf': 'teenmuf',
    'patti2': 'teenpatti2cards',
    'race17': 'raceto17',
    '1day_poker': 'pokeroneday',
    '6player_poker': 'poker6player',
    '20poker': 'pokert20',
    'teen3': 'instantteenpatti',
    'teen62': 'teen62',
    'cmeter1': '1cardmeter',
    'teen1': '1card1day',
    'teen120': '1card2020',
    '20_dragon_tiger': 'dragontigert20',
    'odi_dragon_tiger': 'dragontigeroneday',
    'dtl20': 'dragontigerliont20',
    'dt202': 'dragontigert202',
    '5_cricket': '5fivecricket',
    'cc20': 'cricket-match-2020',
    'teen41': 'teenpatti41',
    'teen42': 'teenpatti42',
    'joker20': 'jokerteenpatti20',
    'joker1': 'jokerteenpatti1',
    'joker120': 'jokerteenpatti120',
    'teenunique': 'unique_teenpatti',
    'btable2': 'bollywoodtable2',
    'poison20': 'poisonteenpatti20',
    'ddb': 'bollywoodtable',
    "teen20": "teenpattit20",
    "teen20b": "teenpattit20b",
    "teen20c": "teenpattit20c",
    "ballbyball": "ball_by_ball",
    "thetrap": "trap",
    "lottcard": "lottery",
    "3cardj": "3cardsjudgement",
    "worli3": "matka_market",
    "dolidana": "dolidana",
    "mogambo": "mogambo",
    "lucky5": "lucky5",
    "roulette12": "roulette12",
    "roulette13": "roulette13",
    "roulette11": "roulette11",
    "poison": "poisonteenpatti",
    "ourroullete": "our-roulette",
    "superover3": "superover3",
    "goal": "goal",
    "lucky15": "lucky15",
    "superover2": "superover2",
    "sicbo2": "sicbo2",
    "sicbo": "sicbo",
    "teen": "odi_teenpatti",
};

export function sanitizeNumber(val) {
    return isNaN(val) || val === null ? 0 : Number(val);
}

export function capitalize_1st_letter(str) {
    return str
        ?.toLowerCase()
        ?.split(" ")
        ?.map(word => word.charAt(0).toUpperCase() + word.slice(1))
        ?.join(" ");
}