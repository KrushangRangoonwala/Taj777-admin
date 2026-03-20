import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div id="app">
      <div id="layout-wrapper">
        <Header />
        <Sidebar />
        <div className="main-content">
          <div className="page-content">
            {/* Child pages will render here */}
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
