import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storageSession from "redux-persist/es/storage/session";
import userReducer from "./slices/userSlice";
import actionSlice from "./slices/actionSlice";
import matchSlice from "./slices/matchSlice";
import betSlice from "./slices/betSlice";
import casinoReducer from "./slices/casinoSlice";
import notPersistReducer from "./slices/notPersistSlice";

const rootReducer = combineReducers({
    action: actionSlice,
    user: userReducer,
    match: matchSlice,
    bet: betSlice,
    casino: casinoReducer,
    notPersist: notPersistReducer,
});

const persistConfig = {
    key: "root",
    storage: storageSession,
    whitelist: ["user", "action", "match", "bet", "casino", "casino_games"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);
