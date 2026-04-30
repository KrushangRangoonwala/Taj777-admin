import React, { useState } from "react";
import SmoothMenu from "./SmoothMenu";
import SidebarEventsTree from "./SidebarEventsTree";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useIsMobile from "../hooks/useIsMobile";
import { toggleSidebar } from "./Header";
import { menuItems } from "./SidebarPages";

const EVENT_IDX = 20; // JUST RANDOM NUMBER 

const privileges = ["dashboard", "account-list", "market-analysis"]  //  backend key array 

export default function Sidebar() {
    const isMobile = useIsMobile(992)
    const dispatch = useDispatch();
    const isCollapsed = useSelector((state) => state.action.isSidebarCollapse);
    const toggleSidebar2 = () => setTimeout(() => isMobile && toggleSidebar(dispatch, isMobile, isCollapsed), 100)

    const [openMenuIndex, setOpenMenuIndex] = useState(null);
    const [openSport, setOpenSport] = useState(null);
    const [openLeague, setOpenLeague] = useState(null);

    const toggleMenu = (index) => {
        setOpenMenuIndex(openMenuIndex === index ? null : index);
    };

    const filterdMenuItems = menuItems.filter((item) => (privileges || []).includes(item.backend_key));

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


                                                {/* {filterdMenuItems.map((item, index) => {  */}
                                                {menuItems.map((item, index) => {  // 📌 USE ABOVE LINE WHEN BACKEND SENDS PRIVILEGES ARRAY
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
                                                                                    onClick={toggleSidebar2}
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
                                                                    to={item.href || "#"}
                                                                    onClick={toggleSidebar2}
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
