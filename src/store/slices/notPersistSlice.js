import { createSlice } from "@reduxjs/toolkit";
import { logout } from "./userSlice";

const initialState = {
    isJustLogout: false,

};

const notPersistSlice = createSlice({
    name: "notPersist",
    initialState,
    reducers: {
        setIsJustLogout: (state) => {
            state.isJustLogout = true;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(logout, (state) => {
            state.isJustLogout = true;
        });
    },

});

export const { setIsJustLogout } = notPersistSlice.actions;
export default notPersistSlice.reducer;
