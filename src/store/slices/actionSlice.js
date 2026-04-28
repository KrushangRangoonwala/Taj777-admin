import { createSlice } from "@reduxjs/toolkit";
import { changeTheme } from "../../utilies/helpers";

const initialState = {
    isLoading: false,
    marque: "",
    isSettingOpen: false,
    theme: localStorage.getItem("theme") || "dark",
    isSidebarCollapse: false,
};

const actionSlice = createSlice({
    name: "action",
    initialState,
    reducers: {
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setMarque: (state, action) => {
            state.marque = action.payload;
        },
        setIsSettingOpen: (state, action) => {
            state.isSettingOpen = action.payload;
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem("theme", action.payload);
            changeTheme(action.payload);
        },
        setIsSidebarCollapse: (state, action) => {
            state.isSidebarCollapse = action.payload;
        },
    },
});

export const { setIsLoading, setMarque, setIsSettingOpen, setTheme, setIsSidebarCollapse } = actionSlice.actions;
export default actionSlice.reducer;
