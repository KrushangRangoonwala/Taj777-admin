import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    activeTab: { id: '4', label: 'Cricket' },
    selectedMatch: null,
    liveDataBySport: {}, // { sportId: { data } }
};

const matchSlice = createSlice({
    name: "match",
    initialState,
    reducers: {
        setActiveTab: (state, action) => {
            state.activeTab = action.payload ?? 4;
        },
        setSelectedMatch: (state, action) => {
            state.selectedMatch = action.payload;
        },
        setLiveDataBySport: (state, action) => {
            const { sportId, data } = action.payload;
            if (!state.liveDataBySport) {
                state.liveDataBySport = {};
            }
            state.liveDataBySport[sportId] = data;
        },
    },
});

export const { setSelectedMatch, setActiveTab, setLiveDataBySport } = matchSlice.actions;
export default matchSlice.reducer;
