import React, { lazy, Suspense, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchCasinoExposureApi } from '../../api/API_games';
import { useGetFileData } from '../../hooks/useGetFileData';
import useSocket from '../../api/Socket/useSocket';

const DragonTiger20 = lazy(() => import('./games/DragonTiger20'));
const Poker1day = lazy(() => import('./games/Poker1day'));
const Poker20 = lazy(() => import('./games/Poker20'));
const Poker6 = lazy(() => import('./games/Poker6'));
const OneCard1day = lazy(() => import('./games/OneCard1day')); const TeenPatti1Day = lazy(() => import('./games/TeenPatti1Day'));
const VIPTeenPatti1Day = lazy(() => import('./games/VIPTeenPatti1Day'));
const InstantTeenPatti3 = lazy(() => import('./games/InstantTeenPatti3'));
const InstantTeenPatti2 = lazy(() => import('./games/InstantTeenPatti2'));
const InstantTeenPatti = lazy(() => import('./games/InstantTeenPatti'));
const QueenTopOpenTeenPatti = lazy(() => import('./games/QueenTopOpenTeenPatti'));
const JackTopOpenTeenPatti = lazy(() => import('./games/JackTopOpenTeenPatti'));
const UnlimitedJoker2020 = lazy(() => import('./games/UnlimitedJoker2020'));
const UnlimitedJokerOneDay = lazy(() => import('./games/UnlimitedJokerOneDay'));
const TeenPattiJoker2020 = lazy(() => import('./games/TeenPattiJoker2020'));
const AAA = lazy(() => import('./games/AAA'));
const UniqueTeenPatti = lazy(() => import('./games/UniqueTeenPatti'));
const AAA2 = lazy(() => import('./games/AAA2'));
const BollywoodCasino = lazy(() => import('./games/BollywoodCasino'));
const BollywoodCasino2 = lazy(() => import('./games/BollywoodCasino2'));
const CasinoWar = lazy(() => import('./games/CasinoWar'));
const Baccarat = lazy(() => import('./games/Baccarat'));
const Baccarat2 = lazy(() => import('./games/Baccarat2'));
const Lucky7A = lazy(() => import('./games/Lucky7A'));
const Lucky7B = lazy(() => import('./games/Lucky7B'));
const Lucky7C = lazy(() => import('./games/Lucky7C'));
const Lucky6 = lazy(() => import('./games/Lucky6'));
const Queen = lazy(() => import('./games/Queen'));
const AndarBahar50 = lazy(() => import('./games/AndarBahar50'));
const AndarBahar150 = lazy(() => import('./games/AndarBahar150'));
const RaceTo2nd = lazy(() => import('./games/RaceTo2nd'));
const Race20 = lazy(() => import('./games/Race20'));
const RaceTo17 = lazy(() => import('./games/RaceTo17'));
const TeenPattiPoison2020 = lazy(() => import('./games/TeenPattiPoison2020'));
const TeenPattiPoison1Day = lazy(() => import('./games/TeenPattiPoison1Day'));
const Mogambo = lazy(() => import('./games/Mogambo'));
const Trio = lazy(() => import('./games/Trio'));
const SuperOver = lazy(() => import('./games/SuperOver'));
const BallByBall = lazy(() => import('./games/BallByBall'));
const DragonTiger1Day = lazy(() => import('./games/DragonTiger1Day'));
const Card32A = lazy(() => import('./games/Card32A'));
const Card32B = lazy(() => import('./games/Card32B'));
const TeenPatti2cards = lazy(() => import('./games/TeenPatti2cards'));
const MuflisTeenPatti = lazy(() => import('./games/MuflisTeenPatti'));
const TeenPattiOpen = lazy(() => import('./games/TeenPattiOpen'));
const TwentyNineCardBaccarat = lazy(() => import('./games/29CardBaccarat'));
const TeenPatti2020C = lazy(() => import('./games/TeenPatti2020C'));
const TeenPattiTest = lazy(() => import('./games/TeenPattiTest'));
const BeachRoulette = lazy(() => import('./games/BeachRoulette'));
const TeenPatti20 = lazy(() => import('./games/TeenPatti2.0'));
const DTL20 = lazy(() => import('./games/2020DTL'));
const Sicbo = lazy(() => import("./games/Sicbo"));
const ThreeCardsJudgement = lazy(() => import("./games/ThreeCardsJudgement"));
const Cricket20 = lazy(() => import("./games/Cricket20"));
const Cmeter1 = lazy(() => import("./games/Cmeter1"));
const Cmeter_1card = lazy(() => import("./games/Cmeter_1card"));
const Goal = lazy(() => import("./games/Goal"));
const Dolidana = lazy(() => import("./games/Dolidana"));
const Dum10 = lazy(() => import("./games/Dum10"));
const OneCard2020 = lazy(() => import("./games/OneCard2020"));
const Notenum = lazy(() => import("./games/Notenum"));
const Trap = lazy(() => import("./games/Trap"));
const Lottery = lazy(() => import("./games/Lottery"));
const AndarBahar = lazy(() => import("./games/AndarBahar"));
const Worli = lazy(() => import("./games/Worli"));
const AndarBahar2 = lazy(() => import("./games/AndarBahar2"));

const gamePath_To_Component = {
    "sicbo": Sicbo,
    "sicbo2": Sicbo,
    "pokeroneday": Poker1day,
    "pokert20": Poker20,
    "poker6player": Poker6,
    "3cardsjudgement": ThreeCardsJudgement,
    "1card1day": OneCard1day,
    "dragontigert20": DragonTiger20,
    "dragontigert202": DragonTiger20,
    "dragontigeroneday": DragonTiger1Day,

    "odi_teenpatti": TeenPatti1Day,
    "teen62": VIPTeenPatti1Day,
    "instantteenpatti3": InstantTeenPatti3,
    "instantteenpatti2": InstantTeenPatti3,
    "instantteenpatti": InstantTeenPatti3,
    "teenpatti41": QueenTopOpenTeenPatti,
    "teenpatti42": JackTopOpenTeenPatti,
    "jokerteenpatti120": UnlimitedJoker2020,
    "jokerteenpatti1": UnlimitedJokerOneDay,
    "jokerteenpatti20": TeenPattiJoker2020,
    "unique_teenpatti": UniqueTeenPatti,
    "aaa": AAA,
    "aaa2": AAA2,
    "bollywoodtable": BollywoodCasino,
    "bollywoodtable2": BollywoodCasino2,
    "war": CasinoWar,
    "casinowar": CasinoWar,
    "baccarat": Baccarat,
    "baccarat2": Baccarat2,
    "lucky7": Lucky7A,
    "lucky7eu": Lucky7A,
    "lucky7eu2": Lucky7A,
    "lucky5": Lucky6,
    "queen": Queen,
    "ab3": AndarBahar50,
    "ab4": AndarBahar150,
    "race2": RaceTo2nd,
    "race20": Race20,
    "raceto17": RaceTo17,
    "poisonteenpatti20": TeenPattiPoison2020,
    "poisonteenpatti": TeenPattiPoison1Day,
    "mogambo": Mogambo,
    "trio": Trio,
    "dolidana": Dolidana,
    "lottery": Lottery,

    "superover": SuperOver,
    "superover2": SuperOver,
    "superover3": SuperOver,
    "5fivecricket": SuperOver,
    "cricket-match-2020": Cricket20,
    "cmeter": Cmeter1,
    "1cardmeter": Cmeter_1card,
    "goal": Goal,
    "ball_by_ball": BallByBall,
    "lucky15": BallByBall,

    "dum10": Dum10,
    "1card2020": OneCard2020,
    "notenum": Notenum,
    "trap": Trap,

    "card32-A": Card32A,
    "card32-B": Card32B,
    "teenpatti2cards": TeenPatti2cards,
    "teenmuf": MuflisTeenPatti,
    "teenpattiopen": TeenPattiOpen,
    "29cardbaccarat": TwentyNineCardBaccarat,
    "teenpattit20c": TeenPatti2020C,
    "teenpattit20b": TeenPatti2020C,
    "teenpattit20": TeenPatti2020C,
    "teenpattitest": TeenPattiTest,
    "roulette12": BeachRoulette,
    "roulette13": BeachRoulette,
    "roulette11": BeachRoulette,
    "our-roulette": BeachRoulette,
    "teen6": TeenPatti20,
    "dragontigerliont20": DTL20,
    "andarbahar": AndarBahar,
    "andarbahar2": AndarBahar2,

    "instant_worli": Worli,
    "worli_matka": Worli,
    "matka_market": Worli,
}

const CasinoCenter = () => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const path = useParams().casinoPath;
    const Component = gamePath_To_Component[path];
    const [gameData, setGameData] = useState(null);
    const [exposureData, setExposureData] = useState([]);
    const [lastResults, setLastResults] = useState([]);

    if (!Component) {
        return <div>Game not found</div>
    }

    const socket = useSocket("casino");
    useEffect(() => {
        if (!socket) return;

        const handleData = (data) => {
            try {
                const payload = Array.isArray(data) ? data[0] : data;
                if (payload) {
                    setGameData(payload);
                }
            } catch (error) {
                console.error("Error processing OneCard1day data:", error);
            }
        };

        const handleConnect = () => {
            console.log(`✅ ${game_type} Connected:`, socket.id);
            socket.emit("Room", game_type);
        };

        const handleLastResults = (data) => {
            const payload = data?.res || data?.data || [];
            setLastResults(payload);
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on("game", handleData);
        socket.on("gameResult", handleLastResults);
        socket.on(game_type, handleData);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game", handleData);
            socket.off("gameResult", handleLastResults);
            socket.off(game_type, handleData);
        };
    }, [socket, game_type]);

    useEffect(() => {
        const fetchExposure = async () => {
            if (!gameData?.t1?.[0]?.mid) return;
            try {
                const response = await fetchCasinoExposureApi({
                    markettype: CODE,
                    main_event_id: gameData.t1[0].mid,
                    curPageName: phpFile,
                });
                if (Array.isArray(response?.data)) {
                    setExposureData(response.data);
                }
            } catch (error) {
                console.error("Error fetching exposure:", error);
            }
        };
        fetchExposure();
    }, [gameData?.t1?.[0]?.mid, CODE, phpFile]);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Component gameData={gameData} exposureData={exposureData} lastResults={lastResults} />
        </Suspense>
    )
}

export default CasinoCenter


// -------------------------------------------------------------------


export function getExposure(exposureData, marketId) {
    if (!Array.isArray(exposureData)) return 0;
    const market = exposureData.find((item) => item.market_id == marketId);
    return market ? Number(market.win_loss) || Number(market.total_exposure) : 0;
}

export function Exposure({ className = "", data, id, isInlineColor = false }) {
    const exposure = getExposure(data, id);
    // if (exposure === 0) return null;
    const exposureClass = exposure > 0 ? "book-red" : exposure < 0 ? "book-green" : "book-black";
    const exposureColor = exposure > 0 ? "red" : exposure < 0 ? "green" : "black";

    return (
        <>
            <span
                className={`${className} ${isInlineColor ? '' : exposureClass}`}
                style={{ color: isInlineColor ? exposureColor : '' }}
            >
                {exposure}
            </span>

            {/* <span className="badge badge-dark book-per">0.98%</span> */}
        </>
    )
}