import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import Layout from './components/Layout'
import 'boxicons/css/boxicons.min.css';

import './styles/all.css'
import './styles/app.css'
import './styles/custome.css'
import './styles/styles__ltr.css'
import './styles/styles.css'
import './styles/responsive.css'
import './styles/theme.css'
import './styles/our.css'

import Dashboard from './pages/Dashboard'
import InsertUser from './pages/users/InsertUser'
import CreateAccount from './pages/users/CreateAccount'
import AccountList from './pages/users/AccountList'
import ActiveUsers from './pages/users/ActiveUsers'
import Bank from './pages/reports/Bank'
import EventPage from './pages/game/EventPage'
import CasinoList from './pages/casino/CasinoList'
import AdminPage from './pages/AdminPage'
import MarketAnalysis from './pages/reports/MarketAnalysis'
import CasinoCenter from './pages/casino/CasinoCenter';
import AccountStatement from './pages/reports/AccountStatement';
import AuthGuard from './components/AuthGuard';
import ProfitLoss from './pages/reports/ProfitLoss';
import CurrentBets from './pages/reports/CurrentBets';
import useSocket from './api/Socket/useSocket'
import { setLiveDataBySport } from './store/slices/matchSlice'

function putLiveFirst(arr) {
  if (arr && Array.isArray(arr)) {
    return [
      ...arr.filter(item => item.inPlay === true),
      ...arr.filter(item => item.inPlay !== true),
    ];
  }
  return arr;
}

function AppContent() {
  const dispatch = useDispatch();
  const socket = useSocket("mining");
  const activeTab = useSelector(state => state.match.activeTab);
  const game_id = activeTab?.id;
  const game_name = activeTab?.label;

  const [initialSocketData, setInitialSocketData] = useState();
  const [socketData, setSocketData] = useState();
  const [willCall, setWillCall] = useState(false);

  const handleLiveEventName = (data) => {
    if (data?.sportId && data?.sport?.body?.length > 0) {
      const sortedData = {
        body: putLiveFirst(data?.sport?.body),
      };

      const payload = {
        sportData: sortedData,
        sportId: data.sportId,
      };

      dispatch(setLiveDataBySport({ sportId: String(data.sportId), data: payload }));
    }
  };

  const handleFancyData = (data) => {
    setInitialSocketData(data?.body?.data);
  };

  const handleFancyDataAll = (data) => {
    setSocketData(data);
  };

  const handleLiveOdds = (data) => {
    console.log("📥 eventGetLiveOdds:", data);
  };

  const handleConnectError = (err) => {
    console.log("❌ Socket Connect Error:", err.message);
  };

  const requestOdds = (eventId) => {
    console.log('socket, eventId', socket, eventId)
    setSocketData(null); // remove prev data before getting new data
    if (socket && socket.connected && eventId) {
      console.log('🔥 EVENT Emitted : "getOddData" for eventId:', eventId);
      socket.emit('getOddData', { eventId: `${eventId}` });
    } else {
      setWillCall(eventId);
    }
  };

  async function getMatchData() {
    if (!game_name) return;
    const name = game_name.toLowerCase() === "football" ? "Soccer" : game_name;
    try {
      const res = await axios.get(`https://trubet9.bet:2053/get${name}Matches`);
      handleLiveEventName(res?.data);
    } catch (error) {
      console.log("error fetching match data", error);
    }
  }

  // HTTP Initial/Fallback Fetch
  useEffect(() => {
    getMatchData();
  }, [game_id]);

  useEffect(() => {
    if (!socket) return;

    setInitialSocketData(null);

    socket.emit("getMatches", { eventType: [4, 1, 2] });

    console.log('🔥 EVENT Emitted : "getMatches"');

    socket.on("eventGetLiveEventName", handleLiveEventName);
    socket.on("eventGetLiveEventFancyData", handleFancyData);
    socket.on("eventGetLiveEventsFancyData", handleFancyDataAll);
    socket.on("eventGetLiveOdds", handleLiveOdds);
    socket.on("connect_error", handleConnectError);

    if (willCall) {
      socket.emit("getOddData", { eventId: `${willCall}` });
      setWillCall(false);
    }

    return () => {
      console.log("Cleanup socket listeners");
      socket.off("eventGetLiveEventName", handleLiveEventName);
      socket.off("eventGetLiveEventFancyData", handleFancyData);
      socket.off("eventGetLiveEventsFancyData", handleFancyDataAll);
      socket.off("eventGetLiveOdds", handleLiveOdds);
      socket.off("connect_error", handleConnectError);
    };
  }, [socket, game_id]);

  return (
    <Routes>
      <Route element={<AuthGuard />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/admin/home" replace />} />
          <Route path="admin/home" element={<Dashboard />} />
          <Route path="admin/users" element={<AccountList />} />
          <Route path="admin/activeusers" element={<ActiveUsers />} />
          <Route path="admin/users/insertuser" element={<InsertUser />} />
          <Route path="admin/reports/bank" element={<Bank />} />
          <Route path="admin/reports/accountstatement" element={<AccountStatement />} />
          <Route path="admin/reports/profitloss" element={<ProfitLoss />} />
          <Route path="admin/reports/currentbets" element={<CurrentBets />} />
          <Route path="admin/createaccount" element={<CreateAccount />} />
          <Route path="admin/game/details" element={
            <EventPage
              socketData={socketData}
              setSocketData={setSocketData}
              initialSocketData={initialSocketData}
              requestOdds={requestOdds}
            />
          }
          />
          <Route path="admin/game/:id" element={
            <EventPage
              socketData={socketData}
              setSocketData={setSocketData}
              initialSocketData={initialSocketData}
              requestOdds={requestOdds}
            />
          }
          />
          <Route path="admin/casino/list" element={<CasinoList />} />
          <Route path="admin/casino/:casinoPath" element={<CasinoCenter />} />
          <Route path="admin/market-analysis" element={<MarketAnalysis />} />
        </Route>
      </Route>
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
