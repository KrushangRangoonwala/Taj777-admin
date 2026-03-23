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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/admin/home" replace />} />
          <Route path="admin/home" element={<Dashboard />} />
          {/* Add more routes based on your sidebar links here */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
