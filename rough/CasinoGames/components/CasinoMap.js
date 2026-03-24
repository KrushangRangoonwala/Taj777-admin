import Superover_Rules from './Superover_Rules';
import BetPlacePopup_Superover from './BetPlacePopup_Superover';
import Rules from './Rules';
import RulesHeader from './RulesHeader';
import Statistics_BeachRoulette from './Statistics_BeachRoulette';
import Statistics_GoldenRoulette from './Statistics_GoldenRoulette';
import Statistics_Roulette13 from './Statistics_Roulette13';
import Statistics_UniqueRoulette from './Statistics_UniqueRoulette';
import BetPlacePopup_KBC from './BetPlacePopup_KBC';
import BetPlacePopup_Worli from './BetPlacePopup_Worli';
import BetPlacePopup from './BetPlacePopup';
import Dolidana_Rules from './Dolidana_Rules';

const aaa = ["A", "B", "C", "D"];

const suitMap = {
    "1": "spade",
    "2": "heart",
    "3": "club",
    "4": "diamond",
};

const teenpattit20_Rules = [
    { label: "Pair", value: "1 TO 1" },
    { label: "Flush", value: "1 TO 4" },
    { label: "Straight", value: "1 TO 6" },
    { label: "Trio", value: "1 TO 30" },
    { label: "Straight Flush", value: "1 TO 40" },
];

export const GameConfig = { // BY PATH_NAME
    DEFAULT: {
        getResultTxt: (win) => (win === "1" ? "A" : "B"),
        getColorClass: null,
        RulesComponent: null,
        BetPopupComponent: null,
    },

    goal: {
        getResultTxt: () => "R",
        getColorClass: () => "resulttie",
    },

    cmeter: {
        getResultTxt: (win) => (win === "2" ? "H" : win === "1" ? "L" : "T"),
        getColorClass: () => "resultb",
    },

    "1cardmeter": {
        getResultTxt: (win) => (win === "1" ? "A" : win === "2" ? "B" : "T"),
    },

    dragontigert20: {
        getResultTxt: (r) => (r === "2" ? "T" : r === "1" ? "D" : "T"),
        getColorClass: (w) =>
            w === "2" ? "resultb" : w === "1" ? "resulta" : "resulttie",
    },

    dragontigert202: {
        getResultTxt: (r) => (r === "2" ? "T" : r === "1" ? "D" : "T"),
        getColorClass: (w) =>
            w === "2" ? "resultb" : w === "1" ? "resulta" : "resulttie",
    },

    dragontigeroneday: {
        getResultTxt: (r) => (r === "2" ? "T" : r === "1" ? "D" : "T"),
        getColorClass: (w) =>
            w === "2" ? "resultb" : w === "1" ? "resulta" : "resulttie",
    },

    dragontigerliont20: {
        getResultTxt: (r) => (r === "1" ? "D" : r === "21" ? "T" : "L"),
        getColorClass: (r) =>
            r === "1" ? "resulta" : r === "21" ? "resultb" : "resultc",
    },

    sicbo: {
        getResultTxt: (r) => r,
        getColorClass: () => "resulta",
    },

    sicbo2: {
        getResultTxt: (r) => r,
        getColorClass: () => "resulta",
    },

    "1card1day": {
        getResultTxt: (w) => (w === "1" ? "P" : "D"),
        getColorClass: (w) => (w === "1" ? "resulta" : "resultb"),
    },

    "1card2020": {
        getResultTxt: (w) => (w === "1" ? "P" : "D"),
        getColorClass: (w) => (w === "1" ? "resulta" : "resultb"),
    },

    superover: {
        getResultTxt: (w) => (w === "1" ? "E" : w === "2" ? "R" : "R"),
        RulesComponent: Superover_Rules,
        BetPopupComponent: BetPlacePopup_Superover,
    },

    superover2: {
        getResultTxt: (w) => (w === "1" ? "I" : w === "2" ? "E" : "R"),
        BetPopupComponent: BetPlacePopup_Superover,
    },

    superover3: {
        getResultTxt: (w) => (w === "1" ? "I" : w === "2" ? "A" : "R"),
        RulesComponent: Superover_Rules,
        BetPopupComponent: BetPlacePopup_Superover,
    },

    "5fivecricket": {
        getResultTxt: (w) => (w === "1" ? "A" : w === "2" ? "I" : "T"),
        BetPopupComponent: BetPlacePopup_Superover,
    },

    pokeroneday: {
        getResultTxt: (w) => (w === "1" ? "A" : "B"),
        RulesComponent: () => {
            const ruleList = [
                { label: "Pair (2-10)", value: "1 TO 3" },
                { label: "A/Q or A/J Off Suited", value: "1 TO 5" },
                { label: "Pair (J/Q/K)", value: "1 TO 10" },
                { label: "A/K Off Suited", value: "1 TO 15" },
                { label: "A/Q or A/J Suited", value: "1 TO 20" },
                { label: "A/K Suited", value: "1 TO 25" },
                { label: "A/A", value: "1 TO 30" },
            ];
            const ruleList2 = [
                { label: "Three of a Kind", value: "1 TO 3" },
                { label: "Straight", value: "1 TO 4" },
                { label: "Flush", value: "1 TO 6" },
                { label: "Full House", value: "1 TO 8" },
                { label: "Four of a Kind", value: "1 TO 30" },
                { label: "Straight Flush", value: "1 TO 50" },
                { label: "Royal Flush", value: "1 TO 100" },
            ];

            return (
                <>
                    <RulesHeader />
                    <Rules header="Bonus 1 (2 Cards Bonus)" rules={ruleList} />
                    <Rules header="Bonus 2 (7 Cards Bonus)" rules={ruleList2} />
                </>
            );
        },
    },

    pokert20: {
        getResultTxt: (w) => (w === "1" ? "A" : "B"),
    },

    poker6player: {
        getResultTxt: (w) => (w ? (w == "0" ? "T" : String(w)[1]) : ""),
    },

    baccarat: {
        getResultTxt: (w) => (w === "1" ? "P" : w === "2" ? "B" : "T"),
        getColorClass: (w) =>
            w === "1"
                ? "baccarat-resulta"
                : w === "2"
                    ? "baccarat-resultb"
                    : "baccarat-resulttie",
    },

    baccarat2: {
        getResultTxt: (w) => (w === "1" ? "P" : w === "2" ? "B" : "T"),
        getColorClass: (w) =>
            w === "1"
                ? "baccarat-resulta"
                : w === "2"
                    ? "baccarat-resultb"
                    : "baccarat-resulttie",
    },

    andarbahar: {
        getResultTxt: (w) => (w === "1" ? "A" : w === "2" ? "B" : "R"),
        getColorClass: (w) => (w === "1" ? "resulta" : "resultb"),
    },

    andarbahar2: {
        getResultTxt: (w) => (w === "1" ? "A" : w === "2" ? "B" : "R"),
        getColorClass: (w) => (w === "1" ? "resulta" : "resultb"),
    },

    ab3: {
        getResultTxt: (w) => (w === "1" ? "A" : w === "2" ? "B" : "R"),
        getColorClass: (w) => (w === "1" ? "resulta" : "resultb"),
    },

    ab4: {
        getResultTxt: (w) => (w === "1" ? "A" : w === "2" ? "B" : "R"),
        getColorClass: (w) => (w === "1" ? "resulta" : "resultb"),
    },

    queen: {
        getResultTxt: (w) => {
            if (!w) return "";
            const val = Number(w);
            return !isNaN(val) ? val - 1 : w;
        },
        getColorClass: (w) => "resultb",
    },

    war: {
        getResultTxt: (w) => "R",
        getColorClass: (w) => "resultb",
    },

    race2: {
        getResultTxt: (w) => aaa[Number(w) - 1] || w,
        getColorClass: (w) => "resultb",
    },
    race20: {
        getResultTxt: (w) => {
            if (suitMap[w]) {
                return (
                    <img
                        src={`/assets/cards_new/${suitMap[w]}.png`}
                        alt={suitMap[w]}
                        style={{ width: "35px", height: "auto" }}
                    />
                );
            }
            return w;
        },
        getColorClass: (w) => "result-black",
        isBgTransparent: true,
    },
    raceto17: {
        getResultTxt: (w) => w == 1 ? "Y" : w == 0 ? "N" : w,
        getColorClass: (w) => w == 1 ? "resulta" : w == 0 ? "" : "",
    },
    teenpattitest: {
        getResultTxt: (win) => (win === "11" ? "T" : win === "21" ? "L" : win === "31" ? "D" : "R"),
        getColorClass: (aaa) => (aaa === "11" ? "resulta" : aaa === "21" ? "resultb" : aaa === "31" ? "resultc" : "resulttie"),
    },
    teenpattiopen: {
        getResultTxt: (win) => "R",
        getColorClass: (win) => {
            if (!win) return "";
            let str = win.toString();
            if (str.includes(",")) str = str.split(",")[0];
            if (str.includes(" ")) str = str.split(" ")[0];
            const winner = str.trim();
            return `result-circle player-${winner}`;
        },
        RulesComponent: () => {
            return (
                <>
                    <RulesHeader />
                    <Rules header="Pair Plus" rules={teenpattit20_Rules} />
                </>
            );
        },
    },
    teenmuf: {
        getResultTxt: (win) => {
            const w = String(win).trim().toUpperCase();
            const n = Number(w);
            if (n === 1 || w === "A") return "A";
            if (n === 2 || w === "B") return "B";
            return "T";
        },
        getColorClass: (win) => {
            const w = String(win).trim().toUpperCase();
            const n = Number(w);
            if (n === 1 || w === "A") return "resulta";
            if (n === 2 || w === "B") return "resultb";
            return "resulttie";
        },
        RulesComponent: () => {
            const ruleList = [
                { label: "Card 9", value: "1 TO 3" },
                { label: "Card 8", value: "1 TO 4" },
                { label: "Card 7", value: "1 TO 5" },
                { label: "Card 6", value: "1 TO 8" },
                { label: "Card 5", value: "1 TO 30" },
            ];
            return (
                <>
                    <RulesHeader />
                    <Rules header="Top 9" rules={ruleList} />
                </>
            );
        },
    },
    muflisteenpatti: {
        getResultTxt: (win) => {
            const w = String(win).trim().toUpperCase();
            const n = Number(w);
            if (n === 1 || w === "A") return "A";
            if (n === 2 || w === "B") return "B";
            return "T";
        },
        getColorClass: (win) => {
            const w = String(win).trim().toUpperCase();
            const n = Number(w);
            if (n === 1 || w === "A") return "resulta";
            if (n === 2 || w === "B") return "resultb";
            return "resulttie";
        },
        RulesComponent: () => {
            const ruleList = [
                { label: "Card 9", value: "1 TO 3" },
                { label: "Card 8", value: "1 TO 4" },
                { label: "Card 7", value: "1 TO 5" },
                { label: "Card 6", value: "1 TO 8" },
                { label: "Card 5", value: "1 TO 30" },
            ];
            return (
                <>
                    <RulesHeader />
                    <Rules header="Top 9" rules={ruleList} />
                </>
            );
        },
    },
    teenpatti2cards: {
        getResultTxt: (win) => {
            const w = String(win).trim();
            if (w === "1") return "A";
            if (w === "2") return "B";
            return "T";
        },
        getColorClass: (win) => {
            const w = String(win).trim();
            if (w === "1") return "resulta";
            if (w === "2") return "resultb";
            return "resulttie";
        },
        RulesComponent: () => {
            const ruleList = [
                { label: "Three card Sequence", value: "1 TO 3" },
                { label: "Four card color", value: "1 TO 9" },
                { label: "Four card Sequence", value: "1 TO 9" },
                { label: "Three of a kind", value: "1 TO 12" },
                { label: "Three card pure Sequence", value: "1 TO 15" },
                { label: "Four card pure Sequence", value: "1 TO 150" },
                { label: "Four of a kind", value: "1 TO 200" },
            ];
            return (
                <>
                    <RulesHeader />
                    <Rules header="Color Plus Rules" rules={ruleList} />
                </>
            );
        },
    },
    '29cardbaccarat': {
        getResultTxt: (win) => {
            const w = String(win).trim().toUpperCase();
            const n = Number(w);
            if (n === 1 || w === "A") return "A";
            if (n === 2 || w === "B") return "B";
            return "T";
        },
        getColorClass: (win) => {
            const w = String(win).trim().toUpperCase();
            const n = Number(w);
            if (n === 1 || w === "A") return "resulta";
            if (n === 2 || w === "B") return "resultb";
            return "resulttie";
        },
        RulesComponent: () => {
            const ruleList = [
                { label: "Straight", value: "1 TO 2" },
                { label: "Flush", value: "1 TO 5" },
                { label: "Trio", value: "1 TO 20" },
                { label: "Straight Flush", value: "1 TO 30" },
            ];
            return (
                <>
                    <RulesHeader />
                    <Rules header="Color Plus Rules" rules={ruleList} />
                </>
            );
        },
    },
    teenpatti41: {
        getResultTxt: (win) => {
            const w = String(win).trim().toUpperCase();
            const n = Number(w);
            if (n === 1 || w === "A") return "A";
            if (n === 2 || w === "B") return "B";
            return "T";
        },
        getColorClass: (win) => {
            const w = String(win).trim().toUpperCase();
            const n = Number(w);
            if (n === 1 || w === "A") return "resulta";
            if (n === 2 || w === "B") return "resultb";
            return "resulttie";
        },
    },
    teenpatti42: {
        getResultTxt: (win) => {
            const w = String(win).trim().toUpperCase();
            const n = Number(w);
            if (n === 1 || w === "A") return "A";
            if (n === 2 || w === "B") return "B";
            return "T";
        },
        getColorClass: (win) => {
            const w = String(win).trim().toUpperCase();
            const n = Number(w);
            if (n === 1 || w === "A") return "resulta";
            if (n === 2 || w === "B") return "resultb";
            return "resulttie";
        },
    },
    jokerteenpatti20: {
        getResultTxt: (win) => {
            const w = String(win).trim().toUpperCase();
            const n = Number(w);
            if (n === 1 || w === "A") return "A";
            if (n === 2 || w === "B") return "B";
            return "T";
        },
        getColorClass: (win) => {
            const w = String(win).trim().toUpperCase();
            const n = Number(w);
            if (n === 1 || w === "A") return "resulta";
            if (n === 2 || w === "B") return "resultb";
            return "resulttie";
        },
    },
    jokerteenpatti120: {
        getResultTxt: (win) => "R",
        getColorClass: (win) => "resulttie",
    },
    jokerteenpatti1: {
        getResultTxt: (win) => "R",
        getColorClass: (win) => "resulttie",
    },
    unique_teenpatti: {
        getResultTxt: (win) => {
            return "R";
        },
        getColorClass: (win) => {
            return `result-circle player-A`;
        },
        RulesComponent: () => {
            return (
                <>
                    <RulesHeader />
                </>
            );
        },
    },
    bollywoodtable2: {
        getResultTxt: (win) => {
            if (win === "1" || win === "A") return "A";
            if (win === "2" || win === "B") return "B";
            if (win === "3" || win === "C") return "C";
            if (win === "4" || win === "D") return "D";
            if (win === "5" || win === "E") return "E";
            if (win === "6" || win === "F") return "F";
            return win;
        },
        getColorClass: (win) => {
            return "resultb";
        },
    },
    bollywoodtable: {
        getResultTxt: (win) => {
            if (win === "1" || win === "A") return "A";
            if (win === "2" || win === "B") return "B";
            if (win === "3" || win === "C") return "C";
            if (win === "4" || win === "D") return "D";
            if (win === "5" || win === "E") return "E";
            if (win === "6" || win === "F") return "F";
            return win;
        },
        getColorClass: (win) => {
            return "resultb";
        },
    },
    odi_teenpatti: {
        getResultTxt: (win) => {
            const w = String(win).trim().toUpperCase();
            if (w === "1" || w === "A") return "A";
            if (w === "2" || w === "B") return "B";
            return "T";
        },
        getColorClass: (win) => {
            const w = String(win).trim().toUpperCase();
            if (w === "1" || w === "A") return "resulta";
            if (w === "2" || w === "B") return "resultb";
            return "resulttie";
        },
    },
    'card32-A': {
        getResultTxt: (win) => {
            const w = String(win).trim();
            if (w === "1") return "8";
            if (w === "2") return "9";
            if (w === "3") return "10";
            if (w === "4") return "11";
            return w;
        },
        getColorClass: (win) => {
            return "resultb";
        },
    },
    'card32-B': {
        getResultTxt: (win) => {
            const w = String(win).trim();
            if (w === "1") return "8";
            if (w === "2") return "9";
            if (w === "3") return "10";
            if (w === "4") return "11";
            return w;
        },
        getColorClass: (win) => {
            return "resultb";
        },
    },
    aaa: {
        getResultTxt: (win) => {
            const w = String(win).trim();
            if (w === "1") return "A";
            if (w === "2") return "B";
            if (w === "3") return "C";
            return w;
        },
        getColorClass: (win) => {
            const w = String(win).trim();
            if (w === "1") return "resulta";
            if (w === "2") return "resultb";
            if (w === "3") return "resultc";
            return "resulta";
        },
    },
    aaa2: {
        getResultTxt: (win) => {
            const w = String(win).trim();
            if (w === "1") return "A";
            if (w === "2") return "B";
            if (w === "3") return "C";
            return w;
        },
        getColorClass: (win) => {
            const w = String(win).trim();
            if (w === "1") return "resulta";
            if (w === "2") return "resultb";
            if (w === "3") return "resultc";
            return "resulta";
        },
    },
    teenpattioneday62: {
        getResultTxt: (win) => {
            const w = String(win).trim();
            if (w === "1") return "A";
            if (w === "2") return "B";
            return w;
        },
        getColorClass: (win) => {
            const w = String(win).trim();
            if (w === "1") return "resulta";
            if (w === "2") return "resultb";
            return "resulta";
        },
    },
    instantteenpatti: {
        getResultTxt: (win) => {
            const w = String(win).trim();
            if (w === "1") return "A";
            if (w === "2") return "B";
            return w;
        },
        getColorClass: (win) => {
            const w = String(win).trim();
            if (w === "1") return "resulta";
            if (w === "2") return "resultb";
            return "resulta";
        },
    },
    instantteenpatti2: {
        getResultTxt: (win) => {
            const w = String(win).trim();
            if (w === "1") return "A";
            if (w === "2") return "B";
            return w;
        },
        getColorClass: (win) => {
            const w = String(win).trim();
            if (w === "1") return "resulta";
            if (w === "2") return "resultb";
            return "resulta";
        },
    },
    instantteenpatti3: {
        getResultTxt: (win) => {
            const w = String(win).trim();
            if (w === "1") return "A";
            if (w === "2") return "B";
            return w;
        },
        getColorClass: (win) => {
            const w = String(win).trim();
            if (w === "1") return "resulta";
            if (w === "2") return "resultb";
            return "resulta";
        },
    },
    teenpattit20: {
        getResultTxt: (win) => {
            const w = String(win).trim();
            if (w === "1") return "A";
            if (w === "2") return "B";
            return "R";
        },
        getColorClass: (win) => {
            const w = String(win).trim();
            if (w === "1") return "resulta";
            if (w === "2") return "resultb";
            return "resultc";
        },
        RulesComponent: () => {
            return (
                <>
                    <RulesHeader />
                    <Rules header="Pair Plus" rules={teenpattit20_Rules} />
                </>
            );
        },
    },
    teenpattit20b: {
        getResultTxt: (win) => {
            const w = String(win).trim();
            if (w === "1") return "A";
            if (w === "2") return "B";
            return "R";
        },
        getColorClass: (win) => {
            const w = String(win).trim();
            if (w === "1") return "resulta";
            if (w === "2") return "resultb";
            return "resultc";
        },
        RulesComponent: () => {
            return (
                <>
                    <RulesHeader />
                    <Rules header="Pair Plus" rules={teenpattit20_Rules} />
                </>
            );
        },
    },
    teenpattit20c: {
        getResultTxt: (win) => {
            const w = String(win).trim();
            if (w === "1") return "A";
            if (w === "2") return "B";
            return "R";
        },
        getColorClass: (win) => {
            const w = String(win).trim();
            if (w === "1") return "resulta";
            if (w === "2") return "resultb";
            return "resultc";
        },
        RulesComponent: () => {
            return (
                <>
                    <RulesHeader />
                    <Rules header="Pair Plus" rules={teenpattit20_Rules} />
                </>
            );
        },
    },

    roulette12: {
        getResultTxt: (win) => win,
        getColorClass: (win) => {
            const num = parseInt(win);
            const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
            if (num === 0) return "resulttie";
            if (redNumbers.includes(num)) return "resulta";
            return "resultb";
        },
        TopComponent: Statistics_BeachRoulette,
    },
    roulette11: {
        getResultTxt: (win) => win,
        getColorClass: (win) => {
            const num = parseInt(win);
            const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
            if (num === 0) return "resulttie";
            if (redNumbers.includes(num)) return "resulta";
            return "resultb";
        },
        TopComponent: Statistics_GoldenRoulette,
    },
    roulette13: {
        getResultTxt: (win) => win,
        getColorClass: (win) => {
            const num = parseInt(win);
            const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
            if (num === 0) return "resulttie";
            if (redNumbers.includes(num)) return "resulta";
            return "resultb";
        },
        TopComponent: Statistics_Roulette13,
    },
    "our-roulette": {
        getResultTxt: (win) => win,
        getColorClass: (win) => {
            const num = parseInt(win);
            const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
            if (num === 0) return "resulttie";
            if (redNumbers.includes(num)) return "resulta";
            return "resultb";
        },
        TopComponent: Statistics_UniqueRoulette,
    },
    dum10: {
        getResultTxt: (win) => win == "1" ? "Y" : "N",
        getColorClass: (win) => win == "1" ? "resulta" : "resultb"
    },
    kbc: {
        getResultTxt: (win) => "R",
        getColorClass: (win) => "resultb",
        BetPopupComponent: BetPlacePopup_KBC,
    },
    matka_market: {
        getResultTxt: (win) => "R",
        getColorClass: (win) => "resulta",
    },
    instant_worli: {
        getResultTxt: (win) => "R",
        getColorClass: (win) => "resultb",
    },
    worli_matka: {
        getResultTxt: (win) => "R",
        getColorClass: (win) => "resultb",
        BetPopupComponent: BetPlacePopup_Worli,
    },
    mogambo: {
        getResultTxt: (win) => (win === "1" ? "W" : "L"),
        getColorClass: (win) => (win === "1" ? "resultb" : "resulta"),
    },

    ball_by_ball: {
        getResultTxt: (win) => "R",
        getColorClass: (win) => "resulttie",
    },
    lucky15: {
        getResultTxt: (win) => {
            if (win == "1") return "0";
            if (win == "2") return "1";
            if (win == "3") return "2";
            if (win == "4") return "4";
            if (win == "5") return "6";
            if (win == "6") return "W";
            return "T";
        },
        getColorClass: (win) => "resultb",
    },
    trio: {
        getResultTxt: (win) => (win == "0" || win == 0 ? "R" : win),
        getColorClass: (win) => "resulttie",
    },
    lucky5: {
        getResultTxt: (win) => (win === "2" ? "H" : win === "1" ? "L" : "T"),
        getColorClass: (win) => (win === "1" ? "resultlow" : win === "2" ? "resulthigh" : "resulttie"),
    },
    lucky7: {
        getResultTxt: (win) => (win === "2" ? "H" : win === "1" ? "L" : "T"),
        getColorClass: (win) => (win === "1" ? "resultlow" : win === "2" ? "resulthigh" : "resulttie"),
    },
    lucky7eu: {
        getResultTxt: (win) => (win === "2" ? "H" : win === "1" ? "L" : "T"),
        getColorClass: (win) => (win === "1" ? "resultlow" : win === "2" ? "resulthigh" : "resulttie"),
    },
    lucky7eu2: {
        getResultTxt: (win) => (win === "2" ? "H" : win === "1" ? "L" : "T"),
        getColorClass: (win) => (win === "1" ? "resultlow" : win === "2" ? "resulthigh" : "resulttie"),
    },
    notenum: {
        getResultTxt: (win) => 'R',
        getColorClass: (win) => "resultb",
    },
    '3cardsjudgement': {
        getResultTxt: (win) => 'R',
        getColorClass: (win) => "resultb",
    },
    dolidana: {
        getResultTxt: (win) => 'R',
        getColorClass: (win) => "resulttie",
        RulesComponent: () => {
            return (
                <>
                    <div className='mt-12 casino-rules-table doli-dana-rules d-none-big'>
                        <RulesHeader />
                        <Dolidana_Rules />
                    </div>
                </>
            );
        },
        isRulesFirst: true,
    }
};

export default GameConfig;