import { useLocation, useNavigate } from "react-router-dom";
import { gamePath_MapTo_gametype, getCasinoDetailsByPathName } from "../utilies/casinoDeatils_byType";
import { useSelector } from "react-redux";
import { useEffect } from "react";
// import { fetchCasinoList, isApiSuccess } from "../api/api";
// import { useEffect, useState } from "react";
const default_ = {
    CODE: "",
    game_type: "",
    phpFile: "",
    placeBetApi: "",
    game_name: "",
    matchName: "",
    hide_result: ""
}

export const data = {
    "superover3": {
        CODE: "SUPER_OVER3",
        game_type: "superover3",
        phpFile: "live_superover3.php",
        placeBetApi: "bet_place_super_over_3.php",
        matchName: "IND vs AUS",
    },
    "superover2": {
        CODE: "SUPER_OVER2",
        game_type: "superover2",
        phpFile: "live_superover2.php",
        placeBetApi: "bet_place_super_over_2.php",
        matchName: "ENG VS RSA",
    },
    "superover": {
        CODE: "SUPER_OVER",
        game_type: "superover",
        phpFile: "live_superover.php",
        placeBetApi: "bet_place_super_over_.php",
    },
    "5fivecricket": {
        CODE: "FIVE_5_CRICKET",
        game_type: "cricketv3",
        phpFile: "live_5_cricket.php",
        placeBetApi: "bet_place_five_cricket.php",
    },
    "cricket-match-2020": {
        CODE: "2020_CRICKET_MATCH",
        game_type: "cmatch20",
        phpFile: "live_cc20.php",
        placeBetApi: "bet_place_2020_cricket_match.php",

        game_name: "Cricket Match 20-20",
        iframe_url: "https://casino.diamondcricketid.com/swiftdizire/?id=3045",
        result_image: "/cards_new/"
    },
    "goal": {
        CODE: "GOAL",
        game_type: "goal",
        phpFile: "live_goal.php",
        placeBetApi: "bet_place_goal.php",

        game_name: "Goal",
        iframe_url: "https://casino.diamondcricketid.com/swiftdizire/?id=3087",
        result_image: "/cards/soccer-ball.png"
    },
    "cmeter": {
        CODE: "CASINO_METER",
        game_type: "cmeter",
        phpFile: "live_cmeter.php",
        placeBetApi: "bet_place_casino_meter.php",

        game_name: "Casino Meter",
        iframe_url: "https://casino.diamondcricketid.com/swiftdizire/?id=3046",
        result_image: "/cards_new/"
    },
    "1cardmeter": {
        CODE: "CMETER1",
        game_type: "cmeter1",
        phpFile: "live_cmeter1.php",
        placeBetApi: "bet_place_cmeter1.php",

        game_name: "1 Card Meter",
        iframe_url: "https://casino.diamondcricketid.com/swiftdizire/?id=3089",
        result_image: "/cards_new/"
    },
    "dragontigert20": {
        CODE: "2020_DRAGON_TIGER",
        game_type: "dt20",
        phpFile: "live_20_dragon_tiger.php",
        placeBetApi: "bet_place_20_dragon_tiger.php",

        game_name: "20-20 Dragon Tiger",
        iframe_url: "https://casino.diamondcricketid.com/swiftdizire/?id=3035",
        result_image: "/cards/"
    },
    "dragontigert202": {
        CODE: "2020_DRAGON_TIGER2",
        game_type: "dt202",
        phpFile: "live_dt202.php",
        placeBetApi: "bet_place_20_dragon_tiger2.php",

        game_name: "20-20 Dragon Tiger 2",
        iframe_url: "https://casino.diamondcricketid.com/swiftdizire/?id=3059",
        result_image: "/cards/"
    },
    "dragontigeroneday": {
        CODE: "ODI_DRAGON_TIGER",
        game_type: "dt6",
        phpFile: "live_odi_dragon_tiger.php",
        placeBetApi: "bet_place_odi_dragon_tiger.php",

        game_name: "1 Day Dragon Tiger",
        iframe_url: "https://casino.diamondcricketid.com/swiftdizire/?id=3057",
        result_image: "/cards/"
    },
    "dragontigerliont20": {
        CODE: "DTL20",
        game_type: "dtl20",
        phpFile: "live_dtl20.php",
        placeBetApi: "bet_place_dtl20.php",

        game_name: "20-20 D T L",
        iframe_url: "https://casino.diamondcricketid.com/swiftdizire/?id=3047",
        result_image: "/cards_new/"
    },
    "sicbo": {
        CODE: "SICBO",
        game_type: "sicbo",
        phpFile: "live_sicbo.php",
        placeBetApi: "bet_place_sicbo.php",

        game_name: "Sic Bo",
        iframe_url: "https://casino.diamondcricketid.com/swiftdizire/?id=3094",
        result_image: "/cards_new/"
    },
    "sicbo2": {
        CODE: "SICBO2",
        game_type: "sicbo2",
        phpFile: "live_sicbo2.php",
        placeBetApi: "bet_place_sicbo2.php",

        game_name: "Sic Bo 2",
        iframe_url: "https://casino.diamondcricketid.com/swiftdizire/?id=3095",
        result_image: "/cards_new/"
    },
    "1card1day": {
        CODE: "TEEN1",
        game_type: "teen1",
        phpFile: "live_teen1.php",
        placeBetApi: "bet_place_teen1.php",

        game_name: "1 CARD ONE-DAY",
        iframe_url: "https://casino.diamondcricketid.com/swiftdizire/?id=3097",
        result_image: "/cards_new/"
    },
    "1card2020": {
        CODE: "TEEN120",
        phpFile: "live_teen120.php",
        placeBetApi: "bet_place_teen120.php",

        game_type: "teen120",
        game_name: "1 CARD 20-20",
        iframe_url: "https://casino.diamondcricketid.com/swiftdizire/?id=3098",
        result_image: "/cards_new/"
    },
}

export function useGamePathName() {
    const location = useLocation().pathname;
    const path = location.split('/').pop();
    return path;
}

export function useGetFileData() { // BY URL PATH
    const navigate = useNavigate();
    const location = useLocation().pathname;

    const casino_list = useSelector((state) => state.casino.casino_list);
    if (casino_list.length === 0) {
        navigate("/owncasino");
        return default_;
    } else {
        const path = location.split('/').pop();

        const type = gamePath_MapTo_gametype[path] ?? path;
        const gg = casino_list[type] ?? default_;
        console.log("game data", gg);
        return gg;
    }
}

export function useOutsideClick(ref, callback) {
    useEffect(() => {
        function handleClick(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        }

        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [ref, callback]);
}