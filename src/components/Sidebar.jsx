import React, { useState } from "react";
import SmoothMenu from "./SmoothMenu";
import SidebarEventsTree from "./SidebarEventsTree";
import { Link } from "react-router-dom";

const EVENT_IDX = 20; // JUST RANDOM NUMBER 

const menuItems = [
    {
        label: "Dashboard",
        href: "/admin/home",
        icon: "bx bx-home-circle",
        liClassName: "mm-active",
        linkClasses: "side-nav-link-ref router-link-exact-active router-link-active ", // active    
        ariaCurrent: "page",
    },
    {
        label: "Market Analysis",
        href: "/admin/market-analysis",
        icon: "bx bxs-bar-chart-alt-2",
        linkClasses: "side-nav-link-ref",
    },
    {
        label: "Multi Login Account",
        href: "/admin/createaccount",
        icon: "bx bx-user-plus",
        linkClasses: "side-nav-link-ref",
    },
    {
        label: "Account",
        icon: "bx bx-user-circle",
        subItems: [
            { label: "Account List For Active Users", href: "/admin/activeusers" },
            { label: "Account List", href: "/admin/users" },
            { label: "Create Account", href: "/admin/users/insertuser" },
        ],
    },
    {
        label: "Assign Agent",
        href: "/admin/assign-agent",
        icon: "bx bx-user",
        linkClasses: "side-nav-link-ref",
    },
    {
        label: "Bank",
        href: "/admin/reports/bank",
        icon: "bx bxs-bank",
        linkClasses: "side-nav-link-ref",
    },
    {
        label: "Reports",
        icon: "bx bx-file",
        subItems: [
            { label: "Account Statement", href: "/admin/reports/accountstatement" },
            { label: "Party Win Loss", href: "/admin/reports/profitloss" },
            { label: "Current Bets", href: "/admin/reports/currentbets" },
            { label: "User History", href: "/admin/reports/userhistory" },
            { label: "General Lock", href: "/admin/reports/userlock" },
            { label: "Our Casino Result", href: "/admin/reports/casinoresult" },
            { label: "Live Casino Result", href: "/admin/reports/livecasinoreport" },
            { label: "Sportbook Report", href: "/admin/reports/sportbookreport" },
            { label: "Turn Over", href: "/admin/reports/turnover" },
            { label: "User Authentication", href: "/admin/reports/authlist" },
            { label: "User Register Detail", href: "/admin/reports/userregisterdetail" },
            { label: "Total Profit Loss", href: "/admin/reports/totalprofitloss" },
            { label: "User Win Loss", href: "/admin/reports/userwinloss" },
        ],
    },
    {
        label: "Our Casino",
        href: "/admin/casino/list",
        icon: "mdi mdi-cards-playing-outline",
        linkClasses: "side-nav-link-ref",
    },
    {
        label: "Vip Casino",
        // href: "/admin/casino/vip",
        icon: "mdi mdi-cards-playing-outline",
        linkClasses: "side-nav-link-ref",
        badge: "New",
    },
    {
        label: "Virtual Casino",
        // href: "/admin/vcasino/list",
        icon: "mdi mdi-cards-playing-outline",
        linkClasses: "side-nav-link-ref",
        badge: "New",
    },
    {
        label: "Premium Casino",
        // href: "/admin/pcasino/list",
        icon: "mdi mdi-cards-playing-outline",
        linkClasses: "side-nav-link-ref",
        badge: "New",
    },
    {
        label: "Tembo Casino",
        // href: "/admin/tcasino/list",
        icon: "mdi mdi-cards-playing-outline",
        linkClasses: "side-nav-link-ref",
        badge: "New",
    },
];


export default function Sidebar() {
    const [openMenuIndex, setOpenMenuIndex] = useState(null);
    const [openSport, setOpenSport] = useState(null);
    const [openLeague, setOpenLeague] = useState(null);

    const toggleMenu = (index) => {
        setOpenMenuIndex(openMenuIndex === index ? null : index);
    };

    const isEventopen = openMenuIndex === EVENT_IDX;
    return (
        <>
            <div data-v-5a10e370="" className="vertical-menu">
                <div settings="[object Object]" className="h-100" data-simplebar="init">
                    <div className="simplebar-wrapper" style={{ margin: "0px" }}>
                        <div className="simplebar-height-auto-observer-wrapper">
                            <div className="simplebar-height-auto-observer"></div>
                        </div>
                        <div className="simplebar-mask">
                            <div
                                className="simplebar-offset"
                                style={{ right: "0px", bottom: "0px" }}
                            >
                                <div
                                    className="simplebar-content-wrapper"
                                    tabIndex="0"
                                    role="region"
                                    aria-label="scrollable content"
                                    style={{ height: "100%", overflow: "hidden scroll" }}
                                // style={{
                                //     height: "100%",
                                //     overflow: "hidden auto",
                                //     scrollbarWidth: "thin",
                                //     scrollbarColor: "#666666 #333333"
                                // }}
                                >
                                    <div className="simplebar-content" style={{ padding: "0px" }}>
                                        <div id="sidebar-menu">
                                            <ul id="side-menu" className="metismenu list-unstyled">
                                                {menuItems.map((item, index) => {
                                                    const isOpen = openMenuIndex === index;
                                                    return (
                                                        <li key={index} className={`${item.liClassName || ""} ${isOpen ? "mm-active" : ""}`.trim()}>
                                                            {item.subItems ? (
                                                                <>
                                                                    <Link
                                                                        href="javascript:void(0);"
                                                                        className="has-arrow"
                                                                        aria-expanded={isOpen ? "true" : "false"}
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            toggleMenu(index);
                                                                        }}
                                                                    >
                                                                        <i className={item.icon}></i>
                                                                        <span style={{ marginLeft: "4px" }}>{item.label}</span>
                                                                    </Link>
                                                                    <SmoothMenu isOpen={isOpen} className="sub-menu">
                                                                        {item.subItems.map((subItem, subIndex) => (
                                                                            <li key={subIndex}>
                                                                                <Link
                                                                                    to={subItem.href || "#"}
                                                                                    className="side-nav-link-ref"
                                                                                >
                                                                                    {subItem.label}
                                                                                </Link>
                                                                            </li>
                                                                        ))}
                                                                    </SmoothMenu>
                                                                </>
                                                            ) : (
                                                                <Link
                                                                    to={item.href}
                                                                    aria-current={item.ariaCurrent}
                                                                    className={item.linkClasses}
                                                                >
                                                                    {item.badge && (
                                                                        <span className="badge badge-pill badge-success float-right">
                                                                            {item.badge}
                                                                        </span>
                                                                    )}
                                                                    <i className={item.icon}></i>{" "}
                                                                    <span>{item.label}</span>
                                                                </Link>
                                                            )}
                                                        </li>
                                                    )
                                                })}

                                                {/* EVENT GAMES */}
                                                <SidebarEventsTree
                                                    isEventopen={isEventopen}
                                                    toggleMenu={toggleMenu}
                                                    eventIdx={EVENT_IDX}
                                                    openSport={openSport}
                                                    setOpenSport={setOpenSport}
                                                    openLeague={openLeague}
                                                    setOpenLeague={setOpenLeague}
                                                />
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            className="simplebar-placeholder"
                            style={{ width: "auto", height: "624px" }}
                        ></div>
                    </div>
                    <div
                        className="simplebar-track simplebar-horizontal"
                        style={{ visibility: "hidden" }}
                    >
                        <div
                            className="simplebar-scrollbar"
                            style={{ width: "0px", display: "none" }}
                        ></div>
                    </div>
                    <div
                        className="simplebar-track simplebar-vertical"
                        style={{ visibility: "hidden" }}
                    >
                        <div
                            className="simplebar-scrollbar"
                            style={{
                                height: "0px",
                                transform: "translate3d(0px, 0px, 0px)",
                                display: "none",
                            }}
                        ></div>
                    </div>
                </div>
            </div>
        </>
    );
}
