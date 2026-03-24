import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const AuthGuard = () => {
    const { isLoggedIn } = useSelector((state) => state.user);

    if (!isLoggedIn) {
        return <Navigate to="/admin" replace />;
    }

    return <Outlet />;
};

export default AuthGuard;
