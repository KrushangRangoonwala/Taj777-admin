import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import SmoothMenu from "./SmoothMenu";
import { setSelectedMatch } from "../store/slices/matchSlice";
import useIsMobile from "../hooks/useIsMobile";
import { toggleSidebar } from "./Header";

const const_sportData = [
    { key: 40, sportLabel: 'Politics', sportIcon: 'politics', sportClass: 'sport40', path: '/' },
    { key: 4, sportLabel: 'Cricket', sportIcon: 'cricket', sportClass: 'sport4' },
    { key: 1, sportLabel: 'Football', sportIcon: 'football', sportClass: 'sport1' },
    { key: 2, sportLabel: 'Tennis', sportIcon: 'tennis', sportClass: 'sport2', path: '/' },
    { key: 10, sportLabel: 'Horse Racing', sportIcon: 'horse-racing', sportClass: 'sport10', path: '/' },
    { key: 65, sportLabel: 'Greyhound Racing', sportIcon: 'greyhound-racing', sportClass: 'sport65', path: '/' },
    { key: 8, sportLabel: 'Table Tennis', sportIcon: 'table-tennis', sportClass: 'sport8', path: '/' },
    { key: 22, sportLabel: 'Badminton', sportIcon: 'badminton', sportClass: 'sport22', path: '/' },
    { key: 68, sportLabel: 'Esoccer', sportIcon: 'e-socker', sportClass: 'sport68', path: '/' },
    { key: 15, sportLabel: 'Basketball', sportIcon: 'basketball', sportClass: 'sport15', path: '/' },
    { key: 18, sportLabel: 'Volleyball', sportIcon: 'vollyball', sportClass: 'sport18', path: '/' },
    { key: 59, sportLabel: 'Snooker', sportIcon: 'snooker', sportClass: 'sport59', path: '/' },
    { key: 19, sportLabel: 'Ice Hockey', sportIcon: 'ice-hockey', sportClass: 'sport19', path: '/' },
    { key: 11, sportLabel: 'E Games', sportIcon: 'e-games', sportClass: 'sport11', path: '/' },
    { key: 9, sportLabel: 'Futsal', sportIcon: 'futsal', sportClass: 'sport9', path: '/' },
    { key: 39, sportLabel: 'Handball', sportIcon: 'handball', sportClass: 'sport39', path: '/' },
    { key: 66, sportLabel: 'Kabaddi', sportIcon: 'kabaddi', sportClass: 'sport66', path: '/' },
    { key: 5, sportLabel: 'Golf', sportIcon: 'golf', sportClass: 'sport5', path: '/' },
    { key: 55, sportLabel: 'Rugby League', sportIcon: 'rugby-league', sportClass: 'sport55', path: '/' },
    { key: 6, sportLabel: 'Boxing', sportIcon: 'boxing', sportClass: 'sport6', path: '/' },
    { key: 7, sportLabel: 'Beach Volleyball', sportIcon: 'beach-volleyball', sportClass: 'sport7', path: '/' },
    { key: 3, sportLabel: 'Mixed Martial Arts', sportIcon: 'mma', sportClass: 'sport3', path: '/' },
    { key: 16, sportLabel: 'MotoGP', sportIcon: 'moto-gp', sportClass: 'sport16', path: '/' },
    { key: 17, sportLabel: 'Chess', sportIcon: 'chess', sportClass: 'sport17', path: '/' },
    { key: 29, sportLabel: 'Cycling', sportIcon: 'cycling', sportClass: 'sport29', path: '/' },
    { key: 32, sportLabel: 'Motorbikes', sportIcon: 'motorbikes', sportClass: 'sport32', path: '/' },
    { key: 33, sportLabel: 'Athletics', sportIcon: 'athletics', sportClass: 'sport33', path: '/' },
    { key: 35, sportLabel: 'Basketball 3X3', sportIcon: 'basketball-3-3', sportClass: 'sport35', path: '/' },
    { key: 37, sportLabel: 'Sumo', sportIcon: 'sumo', sportClass: 'sport37', path: '/' },
    { key: 38, sportLabel: 'Virtual sports', sportIcon: 'virtual-sports', sportClass: 'sport38', path: '/' },
    { key: 52, sportLabel: 'Motor Sports', sportIcon: 'motor-sports', sportClass: 'sport52', path: '/' },
    { key: 53, sportLabel: 'Baseball', sportIcon: 'baseball', sportClass: 'sport53', path: '/' },
    { key: 54, sportLabel: 'Rugby Union', sportIcon: 'rugby-union', sportClass: 'sport54', path: '/' },
    { key: 57, sportLabel: 'Darts', sportIcon: 'darts', sportClass: 'sport57', path: '/' },
    { key: 58, sportLabel: 'American Football', sportIcon: 'american-football', sportClass: 'sport58', path: '/' },
    { key: 62, sportLabel: 'Soccer', sportIcon: 'soccer', sportClass: 'sport62', path: '/' },
    { key: 64, sportLabel: 'Esports', sportIcon: 'esports', sportClass: 'sport64', path: '/' },
    { key: 67, sportLabel: 'Boat Racing', sportIcon: 'boat-racing', sportClass: 'sport67', path: '/' },
    { key: 69, sportLabel: 'Wrestling', sportIcon: 'wrestling', sportClass: 'sport69', path: '/' },
];

const DIcon = ({ name }) => (
    <i className={`d-icon ${name} ${name}-color`} style={{ fontSize: '18px', marginRight: '8px' }} />
);

const SPORT_ICON_CLASS_MAP = {
    cricket: "cricket",
    cardcricket: "card-cricket",
    tennis: "tennis",
    soccer: "e-socker",
    football: "football",
    rugby: "rugby",
    "basket ball": "basketball",
    basketball: "basketball",
    golf: "golf",
    "ice hockey": "ice-hockey",
    election: "politics",
};

export function getIcon(sportName = "") {
    const key = sportName.toLowerCase().trim();
    return SPORT_ICON_CLASS_MAP[key] || key;
}

export function bgColor(label) {
    return `var(--${getIcon(label)},var(--default-color))`;
}
export function bgColor_leagues(label) {
    return `var(--${getIcon(label)}_75,var(--default-color))`;
}
export function bgColor_matches(label) {
    return `var(--${getIcon(label)}_50,var(--default-color))`;
}

const SidebarEventsTree = ({
    isEventopen,
    toggleMenu,
    eventIdx,
    openSport,
    setOpenSport,
    openLeague,
    setOpenLeague
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isMobile = useIsMobile(992)
    const isCollapsed = useSelector((state) => state.action.isSidebarCollapse);
    const toggleSidebar2 = () => setTimeout(() => isMobile && toggleSidebar(dispatch, isMobile, isCollapsed), 100)

    const liveDataBySport = useSelector(state => state.match.liveDataBySport);
    const selectedMatch = useSelector(state => state.match.selectedMatch);
    const [sportData, setSportData] = useState(const_sportData);

    useEffect(() => {
        const keys = Object.keys(liveDataBySport);
        keys.forEach(sport_id => {
            var leagues = {};
            const matches = liveDataBySport[sport_id]?.sportData?.body || [];

            matches.forEach(match => {
                const leagues_name = match.cname.trim();
                if (!leagues[leagues_name]) {
                    leagues[leagues_name] = [];
                }
                leagues[leagues_name].push(match);
            });

            setSportData(prev => {
                return prev.map(sport => {
                    if (sport.key == sport_id) {
                        return {
                            ...sport,
                            leagues
                        }
                    }
                    return sport;
                })
            })
        })
    }, [liveDataBySport]);

    const handleMatchClick = (match) => {
        toggleSidebar2();
        sessionStorage.setItem('selectedMatch', JSON.stringify(match));
        dispatch(setSelectedMatch(match));

        setTimeout(() => {
            navigate(`/admin/game/${match.SportId}`, { state: { match } });
        }, 500);
    };

    return (
        <li id="event-tree" className={`menu-box ${isEventopen ? "mm-active" : ""}`}>
            <Link
                href="javascript:void(0);"
                className={`has-arrow ${!isEventopen ? "mm-collapsed" : ""}`}
                aria-expanded={isEventopen ? "true" : "false"}
                onClick={(e) => {
                    e.preventDefault();
                    toggleMenu(eventIdx);
                }}
            >
                <i className="bx bxs-calendar-event"></i>{" "}
                <span>Events</span>
            </Link>
            <SmoothMenu isOpen={isEventopen} className="sub-menu" isEvent={true}>
                {sportData.map((sport) => {
                    const isSportOpen = openSport === sport.key;
                    const sportCount = sport.leagues
                        ? Object.values(sport.leagues).reduce((acc, games) => acc + games.length, 0)
                        : 0;

                    return (
                        <li key={sport.key} className={isSportOpen ? "show" : ""}>
                            <Link
                                href="javascript:void(0)"
                                className={`${sportCount > 0 ? "has-arrow" : ""} ${sport.sportClass}`}
                                aria-expanded={isSportOpen ? "true" : "false"}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setOpenSport(isSportOpen ? null : sport.key);
                                    setOpenLeague(null);
                                }}
                                style={{
                                    backgroundColor: isSportOpen ? bgColor(sport.sportLabel) : "",
                                }}
                            >
                                {/* <DIcon name={sport.sportIcon} /> */}
                                <span>{sport.sportLabel}</span>{" "}
                                {sportCount > 0 && <span> ({sportCount})</span>}
                            </Link>
                            {sport.leagues && (
                                <SmoothMenu isOpen={isSportOpen} className="sub-menu" isEvent={true}>
                                    {Object.entries(sport.leagues).map(([leagueLabel, games]) => {
                                        const isLeagueOpen = openLeague === leagueLabel;
                                        return (
                                            <li key={leagueLabel} className={`text-dark ${isLeagueOpen ? "show" : ""}`}>
                                                <Link
                                                    href="javascript:void(0)"
                                                    className={`has-arrow ${isLeagueOpen ? "active" : ""}`}
                                                    aria-expanded={isLeagueOpen ? "true" : "false"}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setOpenLeague(isLeagueOpen ? null : leagueLabel);
                                                    }}
                                                    style={{
                                                        backgroundColor: isLeagueOpen ? bgColor_leagues(sport.sportLabel) : "",
                                                    }}
                                                >
                                                    <span className="ifTooltip">{leagueLabel}</span>{" "}
                                                    {games.length > 0 && (
                                                        <span> ({games.length})</span>
                                                    )}
                                                </Link>
                                                {games && games.length > 0 && (
                                                    <SmoothMenu isOpen={isLeagueOpen} className="sub-menu" isEvent={true}>
                                                        {games.map((match, mIdx) => (
                                                            <li
                                                                key={mIdx}
                                                                className="text-dark"
                                                            >
                                                                <Link
                                                                    href="javascript:void(0)"
                                                                    className="side-nav-link-ref"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleMatchClick(match);
                                                                    }}
                                                                    style={{
                                                                        backgroundColor: selectedMatch?.matchid === match?.matchid ? bgColor_matches(sport.sportLabel) : "",
                                                                    }}
                                                                >
                                                                    <span className="ifTooltip">
                                                                        {match.matchName.trim()}
                                                                    </span>
                                                                </Link>
                                                            </li>
                                                        ))}
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
    );
};

export default SidebarEventsTree;
