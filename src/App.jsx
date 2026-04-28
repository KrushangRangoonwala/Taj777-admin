import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import Layout from './components/Layout'
import 'boxicons/css/boxicons.min.css';

import './styles/all.css'
import './styles/app.css'
// import './styles/custome.css'
import './styles/styles__ltr.css'
import './styles/styles.css'
import './styles/custome.css' // NEWLY ADDED IN THIS LINE : PREVIOUSLY IT IS ON ABOVE COMMENT LINE
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
import UserHistory from './pages/reports/UserHistory'
import GeneralLock from './pages/reports/GeneralLock'
import CasinoResult from './pages/reports/CasinoResult'
import LiveCasinoResult from './pages/reports/LiveCasinoResult'
import SportBookReport from './pages/reports/SportBookReport'
import AuthList from './pages/reports/AuthList'
import Turnover from './pages/reports/Turnover'
import UserRegisterDetail from './pages/reports/UserRegisterDetail'
import TotalProfitLoss from './pages/reports/TotalProfitLoss'
import SecureAuth from './pages/reports/SecureAuth'
import { logout } from './store/slices/userSlice'
import UserWinLoss from './pages/reports/UserWinLoss'
import { apiBalance, sendUserInfoAPI } from './api/API'
import FirstTimeLogin from './pages/users/FirstTimeLogin'
import VirtualCasino from './pages/casino/VirtualCasino'
import VipCasino from './pages/casino/VipCasino'
import PremiumCasino from './pages/casino/PremiumCasino'
import TemboCasino from './pages/casino/TemboCasino'
import AssignAgent from './pages/users/AssignAgent'

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
  const location = useLocation();
  const { isLoggedIn } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const socket = useSocket("casino");
  const activeTab = useSelector(state => state.match.activeTab);
  const userdata = useSelector(state => state.user.userData);
  const game_id = activeTab?.id;
  const game_name = activeTab?.label;

  const [initialSocketData, setInitialSocketData] = useState();
  const [socketData, setSocketData] = useState();
  const [willCall, setWillCall] = useState(false);

  useEffect(() => {
    console.log('admi location.pathname', location.pathname)
  }, [location.pathname])

  useEffect(() => {
    if (userdata?.user_type == 1) { // IT SHOULD NOT BE USER (user_type = 1 for role : User)
      dispatch(logout());
    }
  }, [])

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

  useEffect(() => {
    if (isLoggedIn) {
      setTimeout(() => apiBalance(dispatch), 300);
    }
  }, [isLoggedIn])

  return (
    <Routes>
      <Route element={<AuthGuard />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/admin/home" replace />} />
          <Route path="admin/home" element={<Dashboard />} />
          <Route path="admin/secureauth" element={<SecureAuth />} />
          <Route path="admin/users" element={<AccountList />} />
          <Route path="admin/child/:id" element={<AccountList />} />
          <Route path="admin/activeusers" element={<ActiveUsers />} />
          <Route path="admin/users/insertuser" element={<InsertUser />} />
          <Route path="admin/assign-agent" element={<AssignAgent />} />
          <Route path="admin/reports/bank" element={<Bank />} />
          <Route path="admin/reports/accountstatement" element={<AccountStatement />} />
          <Route path="admin/reports/profitloss" element={<ProfitLoss />} />
          <Route path="admin/reports/userhistory" element={<UserHistory />} />
          <Route path="admin/reports/currentbets" element={<CurrentBets />} />
          <Route path="admin/reports/userlock" element={<GeneralLock />} />
          <Route path="admin/reports/casinoresult" element={<CasinoResult />} />
          <Route path="admin/reports/livecasinoreport" element={<LiveCasinoResult />} />
          <Route path="admin/reports/sportbookreport" element={<SportBookReport />} />
          <Route path="admin/reports/turnover" element={<Turnover />} />
          <Route path="admin/reports/authlist" element={<AuthList />} />
          <Route path="admin/reports/userregisterdetail" element={<UserRegisterDetail />} />
          <Route path="admin/reports/totalprofitloss" element={<TotalProfitLoss />} />
          <Route path="admin/reports/userwinloss" element={<UserWinLoss />} />
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
          <Route path="admin/casino/vip" element={<VipCasino />} />
          <Route path="admin/vcasino/list" element={<VirtualCasino />} />
          <Route path="admin/pcasino/list" element={<PremiumCasino />} />
          <Route path="admin/tcasino/list" element={<TemboCasino />} />
          <Route path="admin/casino/:casinoPath" element={<CasinoCenter />} />
          <Route path="admin/market-analysis" element={<MarketAnalysis />} />
        </Route>
      </Route>
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/change-password-success/:id" element={<FirstTimeLogin />} />
    </Routes>
  );
}

function App() {
  return (
    // <BrowserRouter basename="/admin_new/">
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App

// WHEN BUILD, GLOBAL SEARCH `admin_new` REMOVE COMMENT AND COMMENT OUT `admin` 

// "List is empty." -> WROKED PERFACTLY IN GENERAL LOCK

// getUserList