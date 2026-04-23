import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const AuthGuard = () => {
    const { isLoggedIn } = useSelector((state) => state.user);
    const user_type = useSelector((state) => state?.user?.userdata?.user_type);
    const first_password_changed = useSelector((state) => state?.user?.userdata?.first_password_changed);
    if (!isLoggedIn || user_type == 1 || first_password_changed == "0") {
        return <Navigate to="/admin" replace />;
    }

    return <Outlet />;
};

export default AuthGuard;
