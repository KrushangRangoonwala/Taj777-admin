import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import 'boxicons/css/boxicons.min.css';
import './styles/all.css'
import './styles/app.css'
import './styles/custome.css'
import './styles/responsive.css'
import './styles/styles__ltr.css'
import './styles/styles.css'

function Dashboard() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-flex align-items-center justify-content-between">
            <h4 className="mb-0 font-size-18">Dashboard Content</h4>
          </div>
        </div>
      </div>
    </div>
  )
}

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
