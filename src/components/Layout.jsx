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
          <footer className="footer">
            <div className="container-fluid">
              <div className="row">
                <div className="col-sm-6">2026 </div>
                <div className="col-sm-6">
                  <div className="text-sm-right d-none d-sm-block"></div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
      <div></div>
    </div>
  );
}
