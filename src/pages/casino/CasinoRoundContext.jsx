import React, { createContext, useContext } from 'react';

const CasinoRoundContext = createContext({
    roundId: null,
    markettype: '',
    activeBets: [],
    viewMoreLimit: 100,
});

export function CasinoRoundProvider({ value, children }) {
    return (
        <CasinoRoundContext.Provider value={value}>
            {children}
        </CasinoRoundContext.Provider>
    );
}

export function useCasinoRound() {
    return useContext(CasinoRoundContext);
}

export default CasinoRoundContext;
