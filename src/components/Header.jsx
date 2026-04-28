import React, { useEffect, useRef, useState } from 'react';
import SliderRaw from 'react-slick';
import SelectRaw from 'react-select';
import Dropdown from 'react-bootstrap/Dropdown';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/userSlice';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { apiGetUpcomingFixtures, getUserList } from '../api/API';
import ChangePasswordModal from './ChangePasswordModal';
import MarketAnalysisModal from './MarketAnalysisModal';
import useIsMobile from '../hooks/useIsMobile';
import RulesModal from './RulesModal';
import { formatNumAfterDot } from '../utilies/helpers';
import { setIsSidebarCollapse } from '../store/slices/actionSlice';

const Slider = SliderRaw && typeof SliderRaw === 'object' && SliderRaw.default ? SliderRaw.default : SliderRaw;
const Select = SelectRaw && typeof SelectRaw === 'object' && SelectRaw.default ? SelectRaw.default : SelectRaw;

export const toggleSidebar = (dispatch, isMobile, isCollapsed) => {
    // document.body.classList.toggle('sidebar-enable');
    // document.body.classList.toggle('vertical-collpsed');
    if (isCollapsed) {
        document.body.classList.remove('sidebar-enable');
        !isMobile && document.body.classList.add('vertical-collpsed');
    } else {
        document.body.classList.add('sidebar-enable');
        !isMobile && document.body.classList.remove('vertical-collpsed');
    }
    dispatch(setIsSidebarCollapse(!isCollapsed));
};

export const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        borderRadius: state.menuIsOpen ? '4px 4px 0 0' : '4px',
        border: '1px solid #ced4da',
        boxShadow: 'none',
        '&:hover': {
            borderColor: '#ced4da'
        },
        minHeight: '38px',
    }),
    menu: (provided) => ({
        ...provided,
        marginTop: '-1px',
        borderRadius: '0 0 4px 4px',
        border: '1px solid #ced4da',
        boxShadow: 'none',
        position: 'absolute',
        zIndex: 99,
    }),
    menuList: (provided) => ({
        ...provided,
        padding: 0
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#495057',
    }),
    placeholder: (provided, state) => ({
        ...provided,
        color: state.isFocused ? '#495057' : '#ced4da',
    }),
    input: (provided) => ({
        ...provided,
        color: '#495057',
    }),
    noOptionsMessage: (provided) => ({
        ...provided,
        textAlign: 'left',
        padding: '8px 12px',
        color: '#495057',
        fontSize: '14px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        overflow: 'auto'
    })
};

export const customSelectStylesWithOption = {
    ...customSelectStyles,
    option: (provided, state) => ({
        ...provided,
        color: state.isFocused ? 'white' : '#495057',
        // backgroundColor: state.isSelected ? '#eee' : state.isFocused ? '#556ee6' : 'white',
        backgroundColor: state.isFocused ? '#556ee6' : state.isSelected ? '#eee' : 'white',
        // whiteSpace: 'nowrap',
        // overflow: 'auto'
    })
};

function SearchUserDropDown({
    search,
    setSearch,
    searchList,
    setSearchList,
    selectedOption,
    setSelectedOption,
    selectRef,
    setShowMarketAnalysisModal
}) {
    return (
        <Select
            ref={selectRef}
            options={searchList}
            placeholder="Search User"
            className="react-select-container custome-css-select border-radios-5px"
            classNamePrefix="react-select"
            components={{
                DropdownIndicator: () => null,
                IndicatorSeparator: () => null
            }}
            noOptionsMessage={() => search.length ? "No elements found" : "List is empty."}
            styles={customSelectStylesWithOption}
            onInputChange={(value) => setSearch(value)}
            onChange={(option) => {
                setSelectedOption(option)
                setShowMarketAnalysisModal(true)
            }}
            onBlur={(e) => {
                setSearch("");
                setSelectedOption([]);
                setSearchList([]);
            }}
            value={selectedOption}
        />
    );
}

export default function Header() {
    const [showRulesModal, setShowRulesModal] = useState(false);
    const isMobile = useIsMobile(992)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { name } = useSelector((state) => state.user);
    const { point, exposure } = useSelector((state) => state.bet.balance);
    const [upcoming, setUpcoming] = useState([]);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showMarketAnalysisModal, setShowMarketAnalysisModal] = useState(false);
    // const [isCollapsed, setIsCollapsed] = useState(false);
    const isCollapsed = useSelector((state) => state.action.isSidebarCollapse);
    const [search, setSearch] = useState("");
    const [selectedOption, setSelectedOption] = useState(null);
    const [searchList, setSearchList] = useState([]);
    const selectRef = useRef(null);
    const toggleSidebar2 = () => toggleSidebar(dispatch, isMobile, isCollapsed)

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                selectRef.current?.blur(); // 👈 when TAB change, remove focus
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        sessionStorage.removeItem('userdata');
        navigate('/admin');
    };

    const toggleSidebar3 = () => {
        // document.body.classList.toggle('sidebar-enable');
        // document.body.classList.toggle('vertical-collpsed');
        if (isCollapsed) {
            document.body.classList.remove('sidebar-enable');
            !isMobile && document.body.classList.add('vertical-collpsed');
        } else {
            document.body.classList.add('sidebar-enable');
            !isMobile && document.body.classList.remove('vertical-collpsed');
        }
        dispatch(setIsSidebarCollapse(!isCollapsed));
    };

    const sliderSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        vertical: true,
        verticalSwiping: true,
        autoplay: true,
        autoplaySpeed: 3000,
    };

    const fixtures = [
        { title: "Alexandra Park", date: "20/03/2026 00:04:00", icon: "icon-10" },
        { title: "New Zealand v South Africa", date: "19/03/2026 23:15:00", icon: "icon-4" },
        { title: "Mikolaj Szymanowski - Giovanni Toti", date: "20/03/2026 01:00:00", icon: "icon-22" },
        { title: "Western Sydney Wanderers v Adelaide United", date: "20/03/2026 01:35:00", icon: "icon-1" },
        { title: "Ushkyn-kokshetau-ll U21 - Zhajyk 2 U21", date: "20/03/2026 03:00:00", icon: "icon-18" },
        { title: "NRG Esports - B8 Esports", date: "20/03/2026 04:00:00", icon: "icon-11" },
        { title: "Jiangsu Dragons - Guangdong Southern Tigers", date: "20/03/2026 04:35:00", icon: "icon-15" }
    ];

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    async function upcomingApi() {
        const data = await apiGetUpcomingFixtures(dispatch);
        setUpcoming(data);
    };

    useEffect(() => {
        upcomingApi();
    }, [])

    async function fetchUserList(search = "") {
        try {
            const payload = {
                user_status: "1",
                searchKey: search
            };
            const res = await getUserList(payload);
            if (res.status === "ok") {
                const formatData = res.data.map(item => {
                    return {
                        value: item.id,
                        label: item.username
                    }
                });
                setSearchList(formatData);
            } else {
                setSearchList([]);
            }
        } catch (err) {
            console.error(err);
            setSearchList([]);
        }
    };

    useEffect(() => {
        search?.length > 2 && fetchUserList(search);
    }, [search]);

    return (
        <header data-v-5a10e370="" id="page-topbar">
            <div className="navbar-header">
                <div className="d-flex">
                    <div className="navbar-brand-box"><Link to="/admin/home" aria-current="page"
                        className="logo logo-light router-link-exact-active router-link-active"><span
                            className="logo-sm"><img
                                src="https://wver.sprintstaticdata.com/v207/static/admin/img/icon.png" alt=""
                                height="22" /></span> <span className="logo-lg"><img
                                    src="https://sitethemedata.com/sitethemes/world777.com/front/logo.png" alt=""
                                    className="site-logo" /></span></Link></div>
                    <button
                        id="vertical-menu-btn"
                        type="button"
                        className="btn btn-sm px-3 font-size-16 header-item"
                        onClick={toggleSidebar2}
                    >
                        <i className="fa fa-fw fa-bars"></i>
                    </button>

                    <div className="site-searchbox mt-3 d-none d-lg-inline-block" style={{ width: '250px' }}>
                        <SearchUserDropDown
                            search={search}
                            setSearch={setSearch}
                            searchList={searchList}
                            setSearchList={setSearchList}
                            selectedOption={selectedOption}
                            setSelectedOption={setSelectedOption}
                            selectRef={selectRef}
                            setShowMarketAnalysisModal={setShowMarketAnalysisModal}
                        />
                    </div>
                </div>

                <div className="w-100">
                    <div className="upcoming-fixure fixture-nav">
                        <div className="fixure-title">Upcoming Fixtures</div>
                        <div className="fixure-box-container1" style={{ height: '41px', overflow: 'hidden' }}>
                            <Slider {...sliderSettings} className="slick-slider slick-vertical">
                                {upcoming.map((f, i) => (
                                    <div key={i} style={{ outline: 'none', width: '255px' }}>
                                        <a href="#" style={{ width: '100%', display: 'inline-block' }}>
                                            <div className="fixure-box">
                                                <div className="f-title"><i className={`d-icon mr-2 icon-${f.sport_type}`}></i>
                                                    {f.event_name}
                                                </div>
                                                <div>{f.date || "13/02/2026 06:30:00 (UTC-08:00)"}</div>
                                            </div>
                                        </a>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    </div>
                </div>

                <div className="d-flex">
                    <div className="d-inline-block d-lg-none ml-2 btn-group">
                        <Dropdown>
                            <Dropdown.Toggle variant="black" className="header-item noti-icon" id="__BVID__14__BV_toggle_">
                                <i className="mdi mdi-magnify"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="dropdown-menu-lg p-0 dropdown-menu-right">
                                <form className="p-3">
                                    <div className="form-group m-0">
                                        <div className="input-group">
                                            <SearchUserDropDown
                                                search={search}
                                                setSearch={setSearch}
                                                searchList={searchList}
                                                setSearchList={setSearchList}
                                                selectedOption={selectedOption}
                                                setSelectedOption={setSelectedOption}
                                                selectRef={selectRef}
                                                setShowMarketAnalysisModal={setShowMarketAnalysisModal}
                                            />
                                        </div>
                                    </div>
                                </form>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>

                    <div className="dropdown d-none d-lg-inline-block ml-1" onClick={toggleFullscreen}>
                        <button type="button" className="btn header-item noti-icon"><i className="bx bx-fullscreen"></i></button>
                    </div>
                    <div className="d-none d-sm-inline-block rules-icon nowrap" onClick={() => setShowRulesModal(true)}>
                        <span className="main-rules">
                            <Link to="#">
                                <i className="fas fa-info-circle mr-1"></i>Rules
                            </Link>
                        </span>
                    </div>
                    <div className="dropdown d-none d-sm-inline-block ml-1">
                        <button type="button" className="btn header-item noti-icon">
                            <span className="balance nowrap">
                                pts:{' '}<span className="balance-value"><b>{formatNumAfterDot(point)}</b></span>
                                {Number(exposure) ? <>{' | '}<span className="balance-value">{exposure}</span></> : ''}
                            </span>
                        </button>
                    </div>

                    <Dropdown className="btn-group" id="__BVID__18" align="end">
                        <Dropdown.Toggle variant="black" className="header-item" id="__BVID__18__BV_toggle_">
                            <span className="ml-1">{name || "Admin"}</span> <i className="mdi mdi-chevron-down"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <div className="dropdown d-sm-none ml-1 mr-1">
                                <div className="bal-box"><span className="balance nowrap">pts:{' '}
                                    <span className="balance-value"><b>{point}</b></span> </span></div>
                            </div>
                            <Dropdown.Item href="javascript: void(0);" className="d-sm-none">
                                <i className="fas fa-info-circle mr-1"></i> Rules
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate("/admin/secureauth")} className="hover-blue">
                                <i className="bx bx-lock-open font-size-16 align-middle mr-1"></i> Secure Auth
                            </Dropdown.Item>
                            <Dropdown.Item href="javascript: void(0);" onClick={() => setShowChangePasswordModal(true)}>
                                <i className="bx bx-wallet font-size-16 align-middle mr-1"></i> Change Password
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item href="javascript:void(0)" className="text-danger" onClick={handleLogout}>
                                <i className="bx bx-power-off font-size-16 align-middle mr-1 text-danger"></i> Logout
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
            {showChangePasswordModal && <ChangePasswordModal show={showChangePasswordModal} onHide={() => setShowChangePasswordModal(false)} />}
            {showMarketAnalysisModal && <MarketAnalysisModal show={showMarketAnalysisModal} onHide={() => setShowMarketAnalysisModal(false)} />}

            <RulesModal show={showRulesModal} onHide={() => setShowRulesModal(false)} />
        </header>
    );
}