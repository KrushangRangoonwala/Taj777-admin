import React, { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

const Poker1day = lazy(() => import('./games/Poker1day'));
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
    const path = useParams().casinoPath;
    const Component = gamePath_To_Component[path];
    if (!Component) {
        return <div>Game not found</div>
    }
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Component />
        </Suspense>
    )
}

export default CasinoCenter