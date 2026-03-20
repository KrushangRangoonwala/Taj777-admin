import React, { useState, useEffect, useRef } from "react";
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

function useMenuTransition(isOpen) {
    const [status, setStatus] = useState(isOpen ? "OPENED" : "CLOSED");
    const contentRef = useRef(null);

    useEffect(() => {
        if (isOpen && status === "CLOSED") {
            setStatus("OPENING");
            if (contentRef.current) {
                contentRef.current.style.height = "0px";
                contentRef.current.offsetHeight; 
                contentRef.current.style.height = contentRef.current.scrollHeight + "px";
            }
            const timer = setTimeout(() => {
                setStatus("OPENED");
                if (contentRef.current) contentRef.current.style.height = "";
            }, 300);
            return () => clearTimeout(timer);
        } else if (!isOpen && status === "OPENED") {
            setStatus("CLOSING");
            if (contentRef.current) {
                contentRef.current.style.height = contentRef.current.scrollHeight + "px";
                contentRef.current.offsetHeight; 
                contentRef.current.style.height = "0px";
            }
            const timer = setTimeout(() => {
                setStatus("CLOSED");
                if (contentRef.current) contentRef.current.style.height = "";
            }, 300);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    let liClass = "";
    let aClass = "has-arrow mm-collapsed";
    let aExpanded = "false";
    let ulClass = "sub-menu mm-collapse";

    if (status === "OPENED") {
        liClass = "mm-active";
        aClass = "has-arrow";
        aExpanded = "true";
        ulClass = "sub-menu mm-collapse mm-show";
    } else if (status === "OPENING") {
        liClass = "mm-active";
        aClass = "has-arrow";
        aExpanded = "true";
        ulClass = "sub-menu mm-collapsing mm-collapse mm-show";
    } else if (status === "CLOSING") {
        liClass = "";
        aClass = "has-arrow mm-collapsed";
        aExpanded = "false";
        ulClass = "sub-menu mm-collapsing";
    } else {
        liClass = "";
        aClass = "has-arrow mm-collapsed";
        aExpanded = "false";
        ulClass = "sub-menu mm-collapse";
    }

    return { liClass, aClass, aExpanded, ulClass, contentRef };
}

const MenuItem = ({ item, isOpen, onClick }) => {
    if (!item.subItems) {
        return (
            <li className={item.liClassName || ""}>
                <a href={item.href} aria-current={item.ariaCurrent} className={item.linkClasses}>
                    {item.badge && <span className="badge badge-pill badge-success float-right">{item.badge}</span>}
                    <i className={item.icon}></i> <span>{item.label}</span>
                </a>
            </li>
        );
    }

    const { liClass, aClass, aExpanded, ulClass, contentRef } = useMenuTransition(isOpen);

    return (
        <li className={`${item.liClassName || ""} ${liClass}`.trim()}>
            <a
                href="javascript:void(0);"
                className={aClass}
                aria-expanded={aExpanded}
                onClick={onClick}
            >
                <i className={item.icon}></i>
                <span>{item.label}</span>
            </a>
            <ul ref={contentRef} aria-expanded="false" className={ulClass}>
                {item.subItems.map((subItem, idx) => (
                    <li key={idx}>
                        <a href={subItem.href} className="side-nav-link-ref">
                            {subItem.label}
                        </a>
                    </li>
                ))}
            </ul>
        </li>
    );
};

const LeagueItem = ({ league, isOpen, onClick }) => {
    const { liClass, aClass, aExpanded, ulClass, contentRef } = useMenuTransition(isOpen);
    return (
        <li className={`text-dark ${liClass}`.trim()}>
            <a href="javascript:void(0)" className={aClass} aria-expanded={aExpanded} onClick={onClick}>
                <span>{league.leagueName}</span> {league.count && <span> {league.count}</span>}
            </a>
            {league.matches && league.matches.length > 0 && (
                <ul ref={contentRef} aria-expanded="false" className={ulClass}>
                    {league.matches.map((match, mIdx) => (
                        <li key={mIdx} className="text-dark">
                            <a href={match.href} className="side-nav-link-ref">
                                <span>{match.matchName}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
};

const SportItem = ({ sport, sIdx, openLeague, setOpenLeague, isOpen, onClick }) => {
    const { liClass, aClass, aExpanded, ulClass, contentRef } = useMenuTransition(isOpen);
    return (
        <li className={liClass}>
            <a href="javascript:void(0)" className={`${sport.className || ""} ${aClass}`.trim()} aria-expanded={aExpanded} onClick={onClick}>
                <span>{sport.sportName}</span> {sport.count && <span> {sport.count}</span>}
            </a>
            {sport.leagues && sport.leagues.length > 0 && (
                <ul ref={contentRef} aria-expanded="false" className={ulClass}>
                    {sport.leagues.map((league, lIdx) => {
                        const leagueKey = `${sIdx}-${lIdx}`;
                        return (
                            <LeagueItem 
                                key={lIdx} 
                                league={league} 
                                isOpen={openLeague === leagueKey} 
                                onClick={(e) => { e.preventDefault(); setOpenLeague(openLeague === leagueKey ? null : leagueKey); }}
                            />
                        );
                    })}
                </ul>
            )}
        </li>
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

    const { liClass: evLiClass, aClass: evAClass, aExpanded: evAExpanded, ulClass: evUlClass, contentRef: evContentRef } = useMenuTransition(eventsOpen);

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
                                                {menuItems.map((item, index) => (
                                                    <MenuItem 
                                                        key={index}
                                                        item={item}
                                                        isOpen={openMenuIndex === index}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            toggleMenu(index);
                                                        }}
                                                    />
                                                ))}
                                                <li id="event-tree" className={`menu-box ${evLiClass}`.trim()}>
                                                    <a
                                                        href="javascript:void(0);"
                                                        className={evAClass}
                                                        aria-expanded={evAExpanded}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setEventsOpen(!eventsOpen);
                                                        }}
                                                    >
                                                        <i className="bx bxs-calendar-event"></i>{" "}
                                                        <span>Events</span>
                                                    </a>
                                                    <ul ref={evContentRef} aria-expanded="false" className={evUlClass}>
                                                        {sidebarEvents.map((sport, sIdx) => (
                                                            <SportItem 
                                                                key={sIdx}
                                                                sport={sport}
                                                                sIdx={sIdx}
                                                                openLeague={openLeague}
                                                                setOpenLeague={setOpenLeague}
                                                                isOpen={openSport === sIdx}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setOpenSport(openSport === sIdx ? null : sIdx);
                                                                }}
                                                            />
                                                        ))}
                                                    </ul>
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
