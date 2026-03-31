
const aaa = ["A", "B", "C", "D"];

const suitMap = {
    "1": "spade",
    "2": "heart",
    "3": "club",
    "4": "diamond",
};

const lastResultTextMap = { // BY PATH_NAME
    DEFAULT: { // NOT MAPPED
        getResultTxt: (win) => (win === "1" ? "A" : "B"),
        getColorClass: null,
    },

    goal: {
        getResultTxt: () => "R",
        getColorClass: () => "resulttie",
    },

    cmeter: {
        getResultTxt: (win) => (win === "2" ? "H" : win === "1" ? "L" : "T"),
        getColorClass: () => "resultb",
    },

    cmeter1: {
        getResultTxt: (win) => (win === "1" ? "A" : win === "2" ? "B" : "T"),
    },

    dt20: {
        getResultTxt: (r) => (r === "2" ? "T" : r === "1" ? "D" : "T"),
        getColorClass: (w) =>
            w === "2" ? "resultb" : w === "1" ? "resulta" : "resulttie",
    },

    dt202: {
        getResultTxt: (r) => (r === "2" ? "T" : r === "1" ? "D" : "T"),
        getColorClass: (w) =>
            w === "2" ? "resultb" : w === "1" ? "resulta" : "resulttie",
    },

    dt6: {
        getResultTxt: (r) => (r === "2" ? "T" : r === "1" ? "D" : "T"),
        getColorClass: (w) =>
            w === "2" ? "resultb" : w === "1" ? "resulta" : "resulttie",
    },

    dtl20: {
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

    teen1: {
        getResultTxt: (w) => (w === "1" ? "P" : "D"),
        getColorClass: (w) => (w === "1" ? "resulta" : "resultb"),
    },

    teen120: {
        getResultTxt: (w) => (w === "1" ? "P" : "D"),
        getColorClass: (w) => (w === "1" ? "resulta" : "resultb"),
    },

    superover: {
        getResultTxt: (w) => (w === "1" ? "E" : w === "2" ? "R" : "R"),
    },

    superover2: {
        getResultTxt: (w) => (w === "1" ? "I" : w === "2" ? "E" : "R"),
    },

    superover3: {
        getResultTxt: (w) => (w === "1" ? "I" : w === "2" ? "A" : "R"),
    },

    cricketv3: {
        getResultTxt: (w) => (w === "1" ? "A" : w === "2" ? "I" : "T"),
    },

    poker: {
        getResultTxt: (w) => (w === "1" ? "A" : "B"),
    },

    poker20: {
        getResultTxt: (w) => (w === "1" ? "A" : "B"),
    },

    poker6: {
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

    ab20: {
        getResultTxt: (w) => (w === "1" ? "A" : w === "2" ? "B" : "R"),
        getColorClass: (w) => (w === "1" ? "resulta" : "resultb"),
    },

    abj: {
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

    War: {
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
    },
    race17: {
        getResultTxt: (w) => w == 1 ? "Y" : w == 0 ? "N" : w,
        getColorClass: (w) => w == 1 ? "resulta" : w == 0 ? "" : "",
    },
    teen9: {
        getResultTxt: (win) => (win === "11" ? "T" : win === "21" ? "L" : win === "31" ? "D" : "R"),
        getColorClass: (aaa) => (aaa === "11" ? "resulta" : aaa === "21" ? "resultb" : aaa === "31" ? "resultc" : "resulttie"),
    },
    teen8: {
        getResultTxt: (win) => "R",
        getColorClass: (win) => {
            if (!win) return "";
            let str = win.toString();
            if (str.includes(",")) str = str.split(",")[0];
            if (str.includes(" ")) str = str.split(" ")[0];
            const winner = str.trim();
            return `result-circle player-${winner}`;
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
    },
    patti2: {
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
    },
    teensin: {
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
    teen41: {
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
    teen42: {
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
    joker20: {
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
    joker120: {
        getResultTxt: (win) => "R",
        getColorClass: (win) => "resulttie",
    },
    joker1: {
        getResultTxt: (win) => "R",
        getColorClass: (win) => "resulttie",
    },
    teen20c: {
        getResultTxt: (win) => {
            return "R";
        },
        getColorClass: (win) => {
            return `result-circle player-A`;
        },
        // BetList
    },
    btable2: {
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
    btable: {
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
    teen: {
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
    card32: {
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
    card32eu: {
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
    teenpattioneday62: { // NOT MAPPED
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
    teen3: {
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
    teen32: {
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
    teen33: {
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
    teen20: {
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
    },
    teen20b: {
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
    },
    teen20c: {
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
        // TopComponent: Statistics_BeachRoulette,
    },
    roulette11: { // NOT MAPPED
        getResultTxt: (win) => win,
        getColorClass: (win) => {
            const num = parseInt(win);
            const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
            if (num === 0) return "resulttie";
            if (redNumbers.includes(num)) return "resulta";
            return "resultb";
        },
        // TopComponent: Statistics_GoldenRoulette,
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
        // TopComponent: Statistics_Roulette13,
    },
    ourroullete: {
        getResultTxt: (win) => win,
        getColorClass: (win) => {
            const num = parseInt(win);
            const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
            if (num === 0) return "resulttie";
            if (redNumbers.includes(num)) return "resulta";
            return "resultb";
        },
        // TopComponent: Statistics_UniqueRoulette,
    },
    dum10: {
        getResultTxt: (win) => win == "1" ? "Y" : "N",
        getColorClass: (win) => win == "1" ? "resulta" : "resultb"
    },
    kbc: {
        getResultTxt: (win) => "R",
        getColorClass: (win) => "resultb",
    },
    worli3: {
        getResultTxt: (win) => "R",
        getColorClass: (win) => "resulta",
    },
    worli2: {
        getResultTxt: (win) => "R",
        getColorClass: (win) => "resultb",
    },
    worli: {
        getResultTxt: (win) => "R",
        getColorClass: (win) => "resultb",
    },
    mogambo: {
        getResultTxt: (win) => (win === "1" ? "W" : "L"),
        getColorClass: (win) => (win === "1" ? "resultb" : "resulta"),
    },

    ballbyball: {
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
    "3cardj": {
        getResultTxt: (win) => 'R',
        getColorClass: (win) => "resultb",
    },
    dolidana: {
        getResultTxt: (win) => 'R',
        getColorClass: (win) => "resulttie",
        isRulesFirst: true,
    }

};

export default lastResultTextMap;