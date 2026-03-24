import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    casino_list: [],
    casino_list_by_category: [],

    cmeter: {
        betOn: null,
    },
};

const casinoSlice = createSlice({
    name: "casino",
    initialState,
    reducers: {
        setAllCasinoGames: (state, action) => {
            state.casino_list = action.payload;
        },
        setCmeterBetOn: (state, action) => {
            state.cmeter.betOn = action.payload;
        },
    },
});

export const { setAllCasinoGames, setCmeterBetOn } = casinoSlice.actions;
export default casinoSlice.reducer;
