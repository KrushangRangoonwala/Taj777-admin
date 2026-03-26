import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import 'boxicons/css/boxicons.min.css';

import './styles/all.css'
import './styles/app.css'
import './styles/custome.css'
import './styles/styles__ltr.css'
import './styles/styles.css'
import './styles/responsive.css'
import './styles/theme.css'

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

function App() {
  return (
    <BrowserRouter>
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
            <Route path="admin/createaccount" element={<CreateAccount />} />
            <Route path="admin/game/details" element={<EventPage />} />
            <Route path="admin/casino/list" element={<CasinoList />} />
            <Route path="admin/casino/:casinoPath" element={<CasinoCenter />} />
            <Route path="admin/market-analysis" element={<MarketAnalysis />} />
          </Route>
        </Route>
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
