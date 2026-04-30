import { createSlice } from "@reduxjs/toolkit";

const defaultEventBetBtns = [1000, 2000, 5000, 10000, 20000, 25000, 50000, 75000];
const defaultCasinoBetBtns = [25, 50, 100, 200, 500, 1000];

const initialState = {
    name: "",
    userData: {},
    isLoggedIn: false,
    isLoginModalOpen: false,
    isSessionExpired: false,

    isAfterLoginImagePopupOpen: false,
    afterLoginImagePopup: [],

    placeBetBtns: {
        eventBetBtns: defaultEventBetBtns,
        casinoBetBtns: defaultCasinoBetBtns,
    },
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        login: (state, action) => {
            state.name = action.payload.user_name;
            state.userData = action.payload;
            state.isLoggedIn = action.payload.user_type != 1; // IT SHOULD NOT USER(user_type = 1 for role : User)
        },
        logout: (state) => {
            state.name = "";
            state.userData = {};
            state.isLoggedIn = false;
            state.isAfterLoginImagePopupOpen = false;
        },
        setIsLoginModalOpen: (state, action) => {
            state.isLoginModalOpen = action.payload
        },
        setIsSessionExpired: (state, action) => {
            state.isSessionExpired = action.payload
        },

        setIsAfterLoginImagePopupOpen: (state, action) => {
            state.isAfterLoginImagePopupOpen = action.payload;
        },
        setAfterLoginImagePopup: (state, action) => {
            state.afterLoginImagePopup = action.payload;
        },

        setPlaceBetBtns: (state, action) => {
            const eventBetBtns = action.payload.eventBetBtns || [];
            const casinoBetBtns = action.payload.casinoBetBtns || [];
            state.placeBetBtns = {
                eventBetBtns: eventBetBtns.length ? eventBetBtns : defaultEventBetBtns,
                casinoBetBtns: casinoBetBtns.length ? casinoBetBtns : defaultCasinoBetBtns,
            };
        },
    },
});

export const { login, logout, setIsLoginModalOpen, setIsSessionExpired, setIsAfterLoginImagePopupOpen, setAfterLoginImagePopup, setPlaceBetBtns } = userSlice.actions;
export default userSlice.reducer;
