import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    name: "",
    userData: {},
    isLoggedIn: false,
    isLoginModalOpen: false,
    isSessionExpired: false,

    isAfterLoginImagePopupOpen: false,
    afterLoginImagePopup: [],
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
    },
});

export const { login, logout, setIsLoginModalOpen, setIsSessionExpired, setIsAfterLoginImagePopupOpen, setAfterLoginImagePopup } = userSlice.actions;
export default userSlice.reducer;
