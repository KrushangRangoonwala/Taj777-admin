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