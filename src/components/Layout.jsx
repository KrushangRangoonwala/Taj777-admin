import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Loading from './Loading';
import { useSelector } from 'react-redux';

export default function Layout() {
  const isLoading = useSelector((state) => state.action.isLoading);

  return (
    <div id="app">
      <div id="layout-wrapper">
        <Header />
        <Sidebar />
        <div className="main-content event-page">
          <div className="page-content">
            {isLoading && <Loading />}
            <Outlet />
          </div>
          <Footer />
        </div>
      </div>
      <div></div>
    </div>
  );
}
