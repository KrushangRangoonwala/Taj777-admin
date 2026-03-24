import React, { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

const Poker1day = lazy(() => import('./games/Poker1day'));
const OneCard1day = lazy(() => import('./games/OneCard1day'));

const gamePath_To_Component = {
    "pokeroneday": Poker1day,
    "1card1day": OneCard1day,
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