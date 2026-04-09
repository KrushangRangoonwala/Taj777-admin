import React, { useEffect, useState } from 'react';
import SliderRaw from 'react-slick';
import SelectRaw from 'react-select';
import Dropdown from 'react-bootstrap/Dropdown';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/userSlice';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { apiGetUpcomingFixtures } from '../api/API';
import ChangePasswordModal from './ChangePasswordModal';

const Slider = SliderRaw && typeof SliderRaw === 'object' && SliderRaw.default ? SliderRaw.default : SliderRaw;
const Select = SelectRaw && typeof SelectRaw === 'object' && SelectRaw.default ? SelectRaw.default : SelectRaw;

const customSelectStyles = {
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
    placeholder: (provided) => ({
        ...provided,
        color: '#ced4da',
    }),
    noOptionsMessage: (provided) => ({
        ...provided,
        textAlign: 'left',
        padding: '8px 12px',
        color: '#74788d',
        fontSize: '14px'
    })
};

export default function Header() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { name } = useSelector((state) => state.user);
    const [upcoming, setUpcoming] = useState([]);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        sessionStorage.removeItem('userdata');
        navigate('/admin');
    };

    const toggleSidebar = () => {
        document.body.classList.toggle('sidebar-enable');
        document.body.classList.toggle('vertical-collpsed');
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
                        onClick={toggleSidebar}
                    >
                        <i className="fa fa-fw fa-bars"></i>
                    </button>

                    <div className="site-searchbox mt-3 d-none d-lg-inline-block" style={{ width: '250px' }}>
                        <Select
                            options={[]}
                            placeholder="Search User"
                            className="react-select-container"
                            classNamePrefix="react-select"
                            components={{
                                DropdownIndicator: () => null,
                                IndicatorSeparator: () => null
                            }}
                            noOptionsMessage={() => "List is empty."}
                            styles={customSelectStyles}
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
                                            <Select
                                                options={[]}
                                                placeholder="Search User"
                                                components={{
                                                    DropdownIndicator: () => null,
                                                    IndicatorSeparator: () => null
                                                }}
                                                noOptionsMessage={() => "List is empty."}
                                                styles={customSelectStyles}
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
                    <div className="d-none d-sm-inline-block rules-icon nowrap"><span className="main-rules"><a
                        href="javascript:void(0)"><i className="fas fa-info-circle mr-1"></i>Rules</a></span>
                    </div>
                    <div className="dropdown d-none d-sm-inline-block ml-1"><button type="button"
                        className="btn header-item noti-icon"><span className="balance nowrap">pts:{' '}
                            <span className="balance-value"><b>58,900</b></span> </span></button></div>

                    <Dropdown className="btn-group" id="__BVID__18" align="end">
                        <Dropdown.Toggle variant="black" className="header-item" id="__BVID__18__BV_toggle_">
                            <span className="ml-1">{name || "Admin"}</span> <i className="mdi mdi-chevron-down"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <div className="dropdown d-sm-none ml-1 mr-1">
                                <div className="bal-box"><span className="balance nowrap">pts:{' '}
                                    <span className="balance-value"><b>58,900</b></span> </span></div>
                            </div>
                            <Dropdown.Item href="javascript: void(0);" className="d-sm-none">
                                <i className="fas fa-info-circle mr-1"></i> Rules
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate("/admin/secureauth")}>
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
        </header>
    );
}