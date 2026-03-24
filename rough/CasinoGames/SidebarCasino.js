import React from "react";
import { useNavigate } from 'react-router-dom';
import CasinoSideMenu from "./CasinoSideMenu";

const Sidebar = () => {

    const navigate = useNavigate();

    const handleNavigate = (path, id) => {
        // navigate(path);
        navigate(path, { state: { id } });
    };

    return (
        <div className="sidebar-left d-none-mobile">



            <CasinoSideMenu handleNavigate={handleNavigate} />

        </div>
    );
};

export default Sidebar;
