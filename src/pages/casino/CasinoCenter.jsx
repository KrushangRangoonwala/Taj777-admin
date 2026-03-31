import React, { lazy, Suspense, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchCasinoExposureApi } from '../../api/API';
import { useGetFileData } from '../../hooks/useGetFileData';
import useSocket from '../../api/Socket/useSocket';

const Poker1day = lazy(() => import('./games/Poker1day'));
const Poker20 = lazy(() => import('./games/Poker20'));
const OneCard1day = lazy(() => import('./games/OneCard1day'));

const TeenPatti1Day = lazy(() => import('./games/TeenPatti1Day'));
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


const gamePath_To_Component = {
    "pokeroneday": Poker1day,
    "pokert20": Poker20,
    "1card1day": OneCard1day,
    "odi_teenpatti": TeenPatti1Day,
    "teen62": VIPTeenPatti1Day,
    "instantteenpatti3": InstantTeenPatti3,
    "instantteenpatti2": InstantTeenPatti2,
    "instantteenpatti": InstantTeenPatti,
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
    "lucky7eu": Lucky7B,
    "lucky7eu2": Lucky7C,
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
    "superover": SuperOver,
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

export function Exposure({ className = "", data, id }) {
    const exposure = getExposure(data, id);
    const exposureClass = exposure > 0 ? "book-red" : exposure < 0 ? "book-green" : "book-black";

    return (
        <span className={`${className} ${exposureClass}`}>{exposure}</span>
    )
}