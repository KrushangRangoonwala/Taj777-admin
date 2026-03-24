import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    balance: {
        point: 0,
        exposure: 0,
    },
    betList: null,

};

const betSlice = createSlice({
    name: "bet",
    initialState,
    reducers: {
        setBalance: (state, action) => {
            state.balance = action.payload;
        },
        setBetList: (state, action) => {
            state.betList = action.payload;
        },
        resetBetSlice: (state, action) => {
            state = initialState;
        },
    },
});

export const { setBalance, setBetList, resetBetSlice } = betSlice.actions;
export default betSlice.reducer;
