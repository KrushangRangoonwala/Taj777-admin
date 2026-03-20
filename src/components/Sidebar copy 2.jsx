//  dropdown animation by "mm-collapsing" class

import React, { useState } from "react";
import sidebarEvents from "../data/sidebarEvents.json";

const menuItems = [
    {
        label: "Dashboard",
        href: "/admin/home",
        icon: "bx bx-home-circle",
        liClassName: "mm-active",
        linkClasses: "side-nav-link-ref router-link-exact-active router-link-active active",
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
            { label: "General Lock", href: "/admin/settings/userlock" },
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
        href: "/admin/casino/vip",
        icon: "mdi mdi-cards-playing-outline",
        linkClasses: "side-nav-link-ref",
        badge: "New",
    },
    {
        label: "Virtual Casino",
        href: "/admin/vcasino/list",
        icon: "mdi mdi-cards-playing-outline",
        linkClasses: "side-nav-link-ref",
        badge: "New",
    },
    {
        label: "Premium Casino",
        href: "/admin/pcasino/list",
        icon: "mdi mdi-cards-playing-outline",
        linkClasses: "side-nav-link-ref",
        badge: "New",
    },
    {
        label: "Tembo Casino",
        href: "/admin/tcasino/list",
        icon: "mdi mdi-cards-playing-outline",
        linkClasses: "side-nav-link-ref",
        badge: "New",
    },
];

const SmoothMenu = ({ isOpen, className, children }) => {
    const contentRef = React.useRef(null);
    const [height, setHeight] = React.useState(isOpen ? 'auto' : '0px');
    const [isCollapsing, setIsCollapsing] = React.useState(false);
    const [show, setShow] = React.useState(isOpen);
    const prevIsOpen = React.useRef(isOpen);

    React.useEffect(() => {
        if (prevIsOpen.current === isOpen) return;
        const el = contentRef.current;
        if (!el) return;

        if (isOpen) {
            setShow(true);
            setHeight('0px');
            setIsCollapsing(true);

            // Double requestAnimationFrame ensures the DOM updates to 0px height before transitioning to scrollHeight
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setHeight(el.scrollHeight + 'px');
                });
            });

            const timer = setTimeout(() => {
                setIsCollapsing(false);
                setHeight('auto');
            }, 350);
            prevIsOpen.current = isOpen;
            return () => clearTimeout(timer);
        } else {
            setHeight(el.scrollHeight + 'px');

            // Double requestAnimationFrame ensures the DOM updates to fixed scrollHeight before transitioning to 0px
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsCollapsing(true);
                    setHeight('0px');
                });
            });

            const timer = setTimeout(() => {
                setIsCollapsing(false);
                setShow(false);
            }, 350);
            prevIsOpen.current = isOpen;
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const stateClass = isCollapsing ? "mm-collapsing" : `mm-collapse ${show ? "mm-show" : ""}`;

    return (
        <ul
            ref={contentRef}
            aria-expanded={isOpen ? "true" : "false"}
            className={`${className || ""} ${stateClass}`.trim()}
            style={{
                height,
                // overflow: isCollapsing ? 'hidden' : 'visible',
                // transition: isCollapsing ? 'height 0.35s ease' : 'none'
            }}
        >
            {children}
        </ul>
    );
};

export default function Sidebar() {
    const [openMenuIndex, setOpenMenuIndex] = useState(null);
    const [eventsOpen, setEventsOpen] = useState(false);
    const [openSport, setOpenSport] = useState(null);
    const [openLeague, setOpenLeague] = useState(null);

    const toggleMenu = (index) => {
        setOpenMenuIndex(openMenuIndex === index ? null : index);
    };

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
                                    style={{ height: "100%", overflow: "hidden" }}
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
                                                                    <a
                                                                        href="javascript:void(0);"
                                                                        className={`has-arrow ${isOpen ? "mm-active" : ""}`}
                                                                        aria-expanded={isOpen ? "true" : "false"}
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            toggleMenu(index);
                                                                        }}
                                                                    >
                                                                        <i className={item.icon}></i>
                                                                        <span>{item.label}</span>
                                                                    </a>
                                                                    <SmoothMenu isOpen={isOpen} className="sub-menu">
                                                                        {item.subItems.map((subItem, subIndex) => (
                                                                            <li key={subIndex}>
                                                                                <a
                                                                                    href={subItem.href}
                                                                                    className="side-nav-link-ref"
                                                                                >
                                                                                    {subItem.label}
                                                                                </a>
                                                                            </li>
                                                                        ))}
                                                                    </SmoothMenu>
                                                                </>
                                                            ) : (
                                                                <a
                                                                    href={item.href}
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
                                                                </a>
                                                            )}
                                                        </li>
                                                    )
                                                })}
                                                <li id="event-tree" className={`menu-box ${eventsOpen ? "mm-active" : ""}`}>
                                                    <a
                                                        href="javascript:void(0);"
                                                        className={`has-arrow ${eventsOpen ? "mm-active" : ""}`}
                                                        aria-expanded={eventsOpen ? "true" : "false"}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setEventsOpen(!eventsOpen);
                                                        }}
                                                    >
                                                        <i className="bx bxs-calendar-event"></i>{" "}
                                                        <span>Events</span>
                                                    </a>
                                                    <SmoothMenu isOpen={eventsOpen} className="sub-menu">
                                                        {sidebarEvents.map((sport, sIdx) => {
                                                            const isSportOpen = openSport === sIdx;
                                                            return (
                                                                <li key={sIdx} className={isSportOpen ? "mm-active" : ""}>
                                                                    <a
                                                                        href="javascript:void(0)"
                                                                        className={`has-arrow ${sport.className || ""} ${isSportOpen ? "mm-active" : ""}`.trim()}
                                                                        aria-expanded={isSportOpen ? "true" : "false"}
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            setOpenSport(isSportOpen ? null : sIdx);
                                                                        }}
                                                                    >
                                                                        <span>{sport.sportName}</span>{" "}
                                                                        {sport.count && <span> {sport.count}</span>}
                                                                    </a>
                                                                    {sport.leagues && sport.leagues.length > 0 && (
                                                                        <SmoothMenu isOpen={isSportOpen} className="sub-menu">
                                                                            {sport.leagues.map((league, lIdx) => {
                                                                                const leagueKey = `${sIdx}-${lIdx}`;
                                                                                const isLeagueOpen = openLeague === leagueKey;
                                                                                return (
                                                                                    <li key={lIdx} className={`text-dark ${isLeagueOpen ? "mm-active" : ""}`}>
                                                                                        <a
                                                                                            href="javascript:void(0)"
                                                                                            className={`has-arrow ${isLeagueOpen ? "mm-active" : ""}`}
                                                                                            aria-expanded={isLeagueOpen ? "true" : "false"}
                                                                                            onClick={(e) => {
                                                                                                e.preventDefault();
                                                                                                setOpenLeague(isLeagueOpen ? null : leagueKey);
                                                                                            }}
                                                                                        >
                                                                                            <span>{league.leagueName}</span>{" "}
                                                                                            {league.count && (
                                                                                                <span> {league.count}</span>
                                                                                            )}
                                                                                        </a>
                                                                                        {league.matches &&
                                                                                            league.matches.length > 0 && (
                                                                                                <SmoothMenu isOpen={isLeagueOpen} className="sub-menu">
                                                                                                    {league.matches.map(
                                                                                                        (match, mIdx) => (
                                                                                                            <li
                                                                                                                key={mIdx}
                                                                                                                className="text-dark"
                                                                                                            >
                                                                                                                <a
                                                                                                                    href={match.href}
                                                                                                                    className="side-nav-link-ref"
                                                                                                                >
                                                                                                                    <span>
                                                                                                                        {match.matchName}
                                                                                                                    </span>
                                                                                                                </a>
                                                                                                            </li>
                                                                                                        ),
                                                                                                    )}
                                                                                                </SmoothMenu>
                                                                                            )}
                                                                                    </li>
                                                                                )
                                                                            })}
                                                                        </SmoothMenu>
                                                                    )}
                                                                </li>
                                                            )
                                                        })}
                                                    </SmoothMenu>
                                                </li>
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
