import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { login, logout } from '../store/slices/userSlice';
import { apiGetUpcomingFixtures, loginAdmin, changeUserLoginPassword } from '../api/API';
import dayjs from 'dayjs';
import { getBannerImages } from '../api/API_games';
import { errorToast, successToast } from '../utils/toast';
import { footerText } from '../utilies/helpers';
import LoginModal from '../components/LoginModal';

const AdminPage = () => {
  const { isJustLogoutPersisted } = useSelector((state) => state.user);
  const { isJustLogout } = useSelector((state) => state.notPersist);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({});
  const [loginTouched, setLoginTouched] = useState({ username: false, password: false });
  const [isLoading, setIsLoading] = useState(false);
  const [carouselBanners, setCarouselBanners] = useState([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [upcoming, setUpcoming] = useState([]);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordErrors, setChangePasswordErrors] = useState({});
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [touched, setTouched] = useState({ oldPassword: false, newPassword: false, confirmPassword: false });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, userData } = useSelector((state) => state.user);

  // useEffect(() => {
  //   if (isLoggedIn) {
  //     navigate('/admin/home');
  //   }
  // }, [isLoggedIn, navigate]);

  useEffect(() => {
    async function fetchBanners() {
      const banners = await getBannerImages();
      setCarouselBanners(banners);
    };

    async function upcomingApi() {
      const data = await apiGetUpcomingFixtures(dispatch);
      setUpcoming(data);
    };

    fetchBanners();
    upcomingApi();
  }, []);

  useEffect(() => {
    if (carouselBanners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % carouselBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselBanners]);

  const toggleLogin = () => setIsLoginOpen(!isLoginOpen);
  const toggleChangePassword = () => setIsChangePasswordOpen(!isChangePasswordOpen);

  useEffect(() => {
    const newErrors = {};
    if (!username) newErrors.username = 'The username field is required';
    if (!password) newErrors.password = 'The password field is required';
    setLoginErrors(prev => ({ ...newErrors }));
  }, [username, password]);

  function handleLogin(e) {
    e.preventDefault();
    setLoginTouched({ username: true, password: true });

    if (Object.keys(loginErrors).length > 0) return;

    if (isJustLogout) { // isJustLogoutPersisted
      errorToast("Please reload the page and retry!");
      return;
    }

    loginApi(e);
  }

  async function loginApi(e) {
    setIsLoading(true);

    try {
      const result = await loginAdmin(username, password);

      console.log("resss", result);

      if (result.status === "auth") {
        setTimeout(() => navigate("/admin/loginauth", { state: { user: result } }), 600);
        return;
      }

      if (result.status !== "error") {
        successToast("success");
        dispatch(login(result));
        sessionStorage.setItem('userdata', JSON.stringify(result));
        setIsLoginOpen(false);
        if (result.first_password_changed == "0") {
          setIsChangePasswordOpen(true);
        } else {
          setTimeout(() => {
            navigate('/admin/home', { replace: true });
          }, 500);
        }
      } else {
        errorToast(result.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'An error occurred during login. Please try again.';
      errorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.body.classList.add('login');
    return () => {
      document.body.classList.remove('login');
    }
  }, [])

  useEffect(() => {
    if (isLoginOpen || isChangePasswordOpen) {
      document.body.classList.add('right-bar-enabled');
    } else {
      document.body.classList.remove('right-bar-enabled');
    }
  }, [isLoginOpen, isChangePasswordOpen])

  useEffect(() => {
    const newErrors = {};
    if (!oldPassword) {
      newErrors.oldPassword = 'The OldPassword field is required';
    }
    if (!newPassword) {
      newErrors.newPassword = 'The NewPassword field is required';
    } else {
      const hasUpper = /[A-Z]/.test(newPassword);
      const hasLower = /[a-z]/.test(newPassword);
      const hasNumber = /[0-9]/.test(newPassword);
      if (!hasUpper || !hasLower || !hasNumber) {
        newErrors.newPassword = 'The password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number';
      } else if (newPassword.length < 8) {
        newErrors.newPassword = 'The NewPassword field must be at least 8 characters';
      }
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'The NewPassword field is required';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'The NewPassword confirmation does not match';
    }
    setChangePasswordErrors(newErrors);
  }, [oldPassword, newPassword, confirmPassword]);

  async function handleChangePassword(e) {
    e.preventDefault();

    // Mark all as touched on submit
    setTouched({ oldPassword: true, newPassword: true, confirmPassword: true });

    if (Object.keys(changePasswordErrors).length > 0) return;

    setChangePasswordLoading(true);
    try {
      const payload = {
        changepwd_user_id: userData?.user_id,
        changepwd_password: newPassword,
        changepwd_cpassword: confirmPassword,
        changepwd_master_password: oldPassword,
      };
      const response = await changeUserLoginPassword(payload);

      if (response.status === 'ok') {
        successToast("Welcome, You are logged in first time. Please change your password to continue.");
        dispatch(logout());
        sessionStorage.removeItem('userdata');
        setIsChangePasswordOpen(false);

        const transactionID = response.transaction_code;
        navigate(`/admin/change-password-success/${transactionID}`);
      } else {
        errorToast(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      errorToast('An error occurred while changing password');
    } finally {
      setChangePasswordLoading(false);
    }
  }

  // --- slide ---
  const latestCasinos = [
    { src: "https://sitethemedata.com/casino_icons/lc/worli3.gif", alt: "Matka" },
    { src: "https://sitethemedata.com/casino_icons/lc/teen62.gif", alt: "V VIP Teenpatti 1-day" },
    { src: "https://sitethemedata.com/casino_icons/lc/dolidana.gif", alt: "Dolidana" },
    { src: "https://sitethemedata.com/casino_icons/lc/mogambo.gif", alt: "Mogambo" },
    { src: "https://sitethemedata.com/casino_icons/lc/teen20v1.jpg", alt: "20-20 Teenpatti VIP1" },
    { src: "https://sitethemedata.com/casino_icons/lc/lucky5.jpg", alt: "Lucky 6" }
  ];

  const liveCasinos = [
    { src: "https://sitethemedata.com/casino_icons/lc/teen.jpg", alt: "Teenpatti 1-day" },
    { src: "https://sitethemedata.com/casino_icons/lc/teen20.jpg", alt: "20-20 Teenpatti" },
    { src: "https://sitethemedata.com/casino_icons/lc/teen9.jpg", alt: "Teenpatti Test" },
    { src: "https://sitethemedata.com/casino_icons/lc/teen8.jpg", alt: "Teenpatti Open" },
    { src: "https://sitethemedata.com/casino_icons/lc/poker.jpg", alt: "Poker 1-Day" },
    { src: "https://sitethemedata.com/casino_icons/lc/poker20.jpg", alt: "20-20 Poker" },
    { src: "https://sitethemedata.com/casino_icons/lc/poker6.jpg", alt: "Poker 6 Players" },
    { src: "https://sitethemedata.com/casino_icons/lc/baccarat.jpg", alt: "Baccarat" },
    { src: "https://sitethemedata.com/casino_icons/lc/baccarat2.jpg", alt: "Baccarat 2" },
    { src: "https://sitethemedata.com/casino_icons/lc/dt20.jpg", alt: "20-20 Dragon Tiger" },
    { src: "https://sitethemedata.com/casino_icons/lc/dt6.jpg", alt: "1 Day Dragon Tiger" },
    { src: "https://sitethemedata.com/casino_icons/lc/dtl20.jpg", alt: "20-20 D T L" },
    { src: "https://sitethemedata.com/casino_icons/lc/dt202.jpg", alt: "20-20 Dragon Tiger 2" },
    { src: "https://sitethemedata.com/casino_icons/lc/card32.jpg", alt: "32 Cards A" },
    { src: "https://sitethemedata.com/casino_icons/lc/card32eu.jpg", alt: "32 Cards B" },
    { src: "https://sitethemedata.com/casino_icons/lc/ab20.jpg", alt: "Andar Bahar" },
    { src: "https://sitethemedata.com/casino_icons/lc/abj.jpg", alt: "Andar Bahar 2" },
    { src: "https://sitethemedata.com/casino_icons/lc/lucky7.jpg", alt: "Lucky 7 - A" },
    { src: "https://sitethemedata.com/casino_icons/lc/lucky7eu.jpg", alt: "Lucky 7 - B" },
    { src: "https://sitethemedata.com/casino_icons/lc/3cardj.jpg", alt: "3 Cards Judgement" },
    { src: "https://sitethemedata.com/casino_icons/lc/war.jpg", alt: "Casino War" },
    { src: "https://sitethemedata.com/casino_icons/lc/worli.jpg", alt: "Worli Matka" },
    { src: "https://sitethemedata.com/casino_icons/lc/worli2.jpg", alt: "Instant Worli" },
    { src: "https://sitethemedata.com/casino_icons/lc/aaa.jpg", alt: "Amar Akbar Anthony" },
    { src: "https://sitethemedata.com/casino_icons/lc/btable.jpg", alt: "Bollywood Casino" },
    { src: "https://sitethemedata.com/casino_icons/lc/lottcard.jpg", alt: "Lottery" },
    { src: "https://sitethemedata.com/casino_icons/lc/cricketv3.jpg", alt: "5Five Cricket" },
    { src: "https://sitethemedata.com/casino_icons/lc/cmatch20.jpg", alt: "Cricket Match 20-20" },
    { src: "https://sitethemedata.com/casino_icons/lc/cmeter.jpg", alt: "Casino Meter" },
    { src: "https://sitethemedata.com/casino_icons/lc/teen6.jpg", alt: "Teenpatti - 2.0" },
    { src: "https://sitethemedata.com/casino_icons/lc/queen.jpg", alt: "Queen" },
    { src: "https://sitethemedata.com/casino_icons/lc/race20.jpg", alt: "Race20" },
    { src: "https://sitethemedata.com/casino_icons/lc/lucky7eu2.jpg", alt: "Lucky 7 - C" },
    { src: "https://sitethemedata.com/casino_icons/lc/superover.jpg", alt: "Super Over" },
    { src: "https://sitethemedata.com/casino_icons/lc/trap.jpg", alt: "The Trap" },
    { src: "https://sitethemedata.com/casino_icons/lc/patti2.jpg", alt: "2 Cards Teenpatti" },
    { src: "https://sitethemedata.com/casino_icons/lc/teensin.jpg", alt: "29Card Baccarat" },
    { src: "https://sitethemedata.com/casino_icons/lc/teenmuf.jpg", alt: "Muflis Teenpatti" },
    { src: "https://sitethemedata.com/casino_icons/lc/race17.jpg", alt: "Race To 17" },
    { src: "https://sitethemedata.com/casino_icons/lc/teen20b.jpg", alt: "20-20 Teenpatti B" },
    { src: "https://sitethemedata.com/casino_icons/lc/trio.jpg", alt: "Trio" },
    { src: "https://sitethemedata.com/casino_icons/lc/notenum.jpg", alt: "Note Number" },
    { src: "https://sitethemedata.com/casino_icons/lc/teen120.jpg", alt: "1 CARD 20-20" },
    { src: "https://sitethemedata.com/casino_icons/lc/teen1.jpg", alt: "1 CARD ONE-DAY" },
    { src: "https://sitethemedata.com/casino_icons/lc/ab3.jpg", alt: "ANDAR BAHAR 50 cards" },
    { src: "https://sitethemedata.com/casino_icons/lc/aaa2.jpg", alt: "Amar Akbar Anthony 2" },
    { src: "https://sitethemedata.com/casino_icons/lc/race2.jpg", alt: "Race to 2nd" },
    { src: "https://sitethemedata.com/casino_icons/lc/teen3.jpg", alt: "Instant Teenpatti" },
    { src: "https://sitethemedata.com/casino_icons/lc/dum10.jpg", alt: "Dus ka Dum" },
    { src: "https://sitethemedata.com/casino_icons/lc/cmeter1.jpg", alt: "1 Card Meter" },
    { src: "https://sitethemedata.com/casino_icons/lc/teen32.jpg", alt: "Instant Teenpatti 2.0" },
    { src: "https://sitethemedata.com/casino_icons/lc/ballbyball.jpg", alt: "Ball by Ball" },
    { src: "https://sitethemedata.com/casino_icons/lc/sicbo.jpg", alt: "Sic Bo" },
    { src: "https://sitethemedata.com/casino_icons/lc/teen33.jpg", alt: "Instant Teenpatti 3.0" },
    { src: "https://sitethemedata.com/casino_icons/lc/sicbo2.jpg", alt: "Sic Bo2" },
    { src: "https://sitethemedata.com/casino_icons/lc/teen42.jpg", alt: "Jack Top Open Teenpatti" },
    { src: "https://sitethemedata.com/casino_icons/lc/teen41.jpg", alt: "Queen Top Open Teenpatti" },
    { src: "https://sitethemedata.com/casino_icons/lc/superover2.jpg", alt: "Super Over2" },
    { src: "https://sitethemedata.com/casino_icons/lc/lucky15.jpg", alt: "Lucky 15" },
    { src: "https://sitethemedata.com/casino_icons/lc/ab4.jpg", alt: "ANDAR BAHAR 150 cards" },
    { src: "https://sitethemedata.com/casino_icons/lc/goal.jpg", alt: "Goal" },
    { src: "https://sitethemedata.com/casino_icons/lc/superover3.jpg", alt: "Mini Superover" },
    { src: "https://sitethemedata.com/casino_icons/lc/ourroullete.jpg", alt: "Unique Roulette" },
    { src: "https://sitethemedata.com/casino_icons/lc/btable2.jpg", alt: "Bollywood Casino 2" },
    { src: "https://sitethemedata.com/casino_icons/lc/teen20c.jpg", alt: "20-20 Teenpatti C" },
    { src: "https://sitethemedata.com/casino_icons/lc/joker1.jpg", alt: "Unlimited Joker Oneday" },
    { src: "https://sitethemedata.com/casino_icons/lc/joker20.jpg", alt: "Teenpatti Joker 20-20" },
    { src: "https://sitethemedata.com/casino_icons/lc/joker120.jpg", alt: "Unlimited Joker 20-20" },
    { src: "https://sitethemedata.com/casino_icons/lc/poison20.jpg", alt: "Teenpatti Poison 20-20" },
    { src: "https://sitethemedata.com/casino_icons/lc/teenunique.jpg", alt: "Unique Teenpatti" },
    { src: "https://sitethemedata.com/casino_icons/lc/poison.jpg", alt: "Teenpatti Poison One Day" },
    { src: "https://sitethemedata.com/casino_icons/lc/roulette11.jpg", alt: "Golden Roulette" },
    { src: "https://sitethemedata.com/casino_icons/lc/roulette13.jpg", alt: "Roulette" },
    { src: "https://sitethemedata.com/casino_icons/lc/roulette12.jpg", alt: "Beach Roulette" },
    { src: "https://sitethemedata.com/casino_icons/lc/lucky5.jpg", alt: "Lucky 6" },
    { src: "https://sitethemedata.com/casino_icons/lc/teen20v1.jpg", alt: "20-20 Teenpatti VIP1" },
    { src: "https://sitethemedata.com/casino_icons/lc/mogambo.gif", alt: "Mogambo" },
    { src: "https://sitethemedata.com/casino_icons/lc/dolidana.gif", alt: "Dolidana" },
    { src: "https://sitethemedata.com/casino_icons/lc/teen62.gif", alt: "V VIP Teenpatti 1-day" },
    { src: "https://sitethemedata.com/casino_icons/lc/worli3.gif", alt: "Matka" }
  ];

  return (
    <div data-v-019a5d71="">
      <div data-v-019a5d71="" className="wrapper home-new">
        <div data-v-019a5d71="" className="container">
          <div data-v-019a5d71="" className="home-new-header">
            <div data-v-019a5d71="" className="home-new-logo">
              <img data-v-019a5d71="" data-src={`/${import.meta.env.VITE_IMAGE_PATH}/logo.png`} src={`/${import.meta.env.VITE_IMAGE_PATH}/logo.png`} lazy="loaded" />
            </div>
            <div data-v-019a5d71="" className="home-new-header-bottom">
              <div data-v-019a5d71="" className="header-sport-list d-none-mobile">
                <marquee data-v-019a5d71="">
                  <div data-v-019a5d71="" className="all-sports-list"></div>
                </marquee>
              </div>
            </div>
            <div data-v-019a5d71="" className="header-right">
              <button data-v-019a5d71="" className="btn btn-primary login-btn" onClick={toggleLogin}>
                Login
              </button>
            </div>
          </div>
          <div data-v-019a5d71="" className="upcoming-fixure">
            <div data-v-019a5d71="" className="fixure-title">Upcoming Fixtures</div>
            <marquee data-v-019a5d71="">
              <div data-v-019a5d71="" className="fixure-box-container">
                {upcoming?.map((fx, i) => (
                  <div key={i} data-v-019a5d71="" className="fixure-box">
                    <div data-v-019a5d71="">
                      <i data-v-019a5d71="" className={`d-icon mr-2 icon-${fx.sport_type}`}></i>
                      {fx.event_name}
                    </div>
                    <div data-v-019a5d71="">{fx.date || "13/02/2026 06:30:00 (UTC-08:00)"}</div>
                  </div>
                ))}
              </div>
            </marquee>
          </div>
          <div data-v-019a5d71="" className="w-100 d-none-desktop">
            <marquee data-v-019a5d71="">
              <div data-v-019a5d71="" className="all-sports-list"></div>
            </marquee>
          </div>
          <div data-v-019a5d71="">
            <div data-v-019a5d71="" role="region" aria-busy="false" className="carousel carousal-23 slide" id="__BVID__16">
              <div role="list" className="carousel-inner" id="__BVID__16___BV_inner_">
                {carouselBanners.map((banner, index) => (
                  <div
                    key={index}
                    data-v-019a5d71=""
                    role="listitem"
                    className={`carousel-item ${index === activeBannerIndex ? 'active' : ''}`}
                    aria-current={index === activeBannerIndex}
                    aria-posinset={index + 1}
                    aria-setsize={carouselBanners.length}
                    id={`__BVID__${17 + index}`}
                    style={{ background: `url("${banner}")` }}
                    aria-hidden={index !== activeBannerIndex}
                  >
                    {/*  */}
                  </div>
                ))}
              </div>
              <ol aria-hidden="false" aria-label="Select a slide to display" className="carousel-indicators" id="__BVID__16___BV_indicators_" aria-owns="__BVID__16___BV_inner_">
                {carouselBanners.map((_, index) => (
                  <li
                    key={index}
                    role="button"
                    tabIndex="0"
                    aria-current={index === activeBannerIndex}
                    aria-label={`Goto slide ${index + 1}`}
                    className={index === activeBannerIndex ? 'active' : ''}
                    id={`__BVID__16___BV_indicator_${index + 1}_`}
                    aria-controls="__BVID__16___BV_inner_"
                    aria-describedby={`__BVID__${17 + index}`}
                    onClick={() => setActiveBannerIndex(index)}
                  ></li>
                ))}
              </ol>
            </div>
          </div>
          <div data-v-019a5d71="">
            <h4 data-v-019a5d71="" className="sport-list-title">Our Latest Casino</h4>
            <div data-v-019a5d71="" className="casino-banners-list mt-2 latest-casino">
              {latestCasinos.map((casino, index) => (
                <div key={index} data-v-019a5d71="" className="casino-banner-item login-hover" onClick={toggleLogin}>
                  <a data-v-019a5d71="" href="javascript:void(0);">
                    <img data-v-019a5d71="" src={casino.src} className="img-fluid" alt={casino.alt} />
                    <div data-v-019a5d71="" role="button" tabIndex="0">Login</div>
                  </a>
                </div>
              ))}
            </div>
            <div data-v-019a5d71="" className="container-fluid container-fluid-5">
              <div data-v-019a5d71="" className="row row5">
                <div data-v-019a5d71="" className="col-12 col-md">
                  <h4 data-v-019a5d71="" className="sport-list-title">Live Casinos</h4>
                  <div data-v-019a5d71="" className="casino-banners-list live-casinos mt-2">
                    {liveCasinos.map((casino, index) => (
                      <div key={index} data-v-019a5d71="" className="casino-banner-item login-hover" onClick={toggleLogin}>
                        <a data-v-019a5d71="" href="javascript:void(0);">
                          <img data-v-019a5d71="" src={casino.src} alt={casino.alt} className="img-fluid" />
                          <div data-v-019a5d71="" role="button" tabIndex="0">Login</div>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h4 data-v-019a5d71="" className="sport-list-title">Top Winners</h4>
          <footer data-v-019a5d71="" className="footer">
            <div data-v-019a5d71="" className="container-fluid container-fluid-5">
              <div data-v-019a5d71="" className="row row5">
                <div data-v-019a5d71="" className="col-lg-12 text-center">
                  <div data-v-019a5d71="" className="footer-bottom">
                    <span data-v-019a5d71="">{footerText}</span>
                  </div>
                  <div data-v-019a5d71="" className="mt-2 gt">
                    <a data-v-019a5d71="" href="javascript:void(0)" role="button">
                      <img data-v-019a5d71="" data-src="https://wver.sprintstaticdata.com/v208/static/front/img/18plus.png" src="https://wver.sprintstaticdata.com/v208/static/front/img/18plus.png" lazy="loaded" />
                    </a>
                    <a data-v-019a5d71="" href="https://www.gamcare.org.uk/" target="_blank">
                      <img data-v-019a5d71="" data-src="https://wver.sprintstaticdata.com/v208/static/front/img/gamecare.png" src="https://wver.sprintstaticdata.com/v208/static/front/img/gamecare.png" lazy="loaded" />
                    </a>
                    <a data-v-019a5d71="" href="https://www.gamblingtherapy.org/en" target="_blank">
                      <img data-v-019a5d71="" data-src="https://wver.sprintstaticdata.com/v208/static/front/img/gt.png" src="https://wver.sprintstaticdata.com/v208/static/front/img/gt.png" lazy="loaded" />
                    </a>
                  </div>
                  <div data-v-019a5d71="" className="mt-3">© Copyright 2021. All Rights Reserved.</div>
                </div>
              </div>
            </div>
          </footer>
        </div>
        {!isChangePasswordOpen && (
          <LoginModal toggleLogin={toggleLogin}>
            <div data-v-019a5d71="">
              <h3 data-v-019a5d71="" className="text-center mt-2 mb-0 text-secondary">
                Welcome to Admin Panel
              </h3>
              <p data-v-019a5d71="" className="text-center text-secondary">
                Enter your Username and Password
              </p>
              <form data-v-019a5d71="" autoComplete="off" data-vv-scope="form-login" onSubmit={handleLogin} className="p-2 mt-4">
                <div data-v-019a5d71="" id="input-group-1" role="group" className="form-group">
                  <div>
                    <input
                      data-v-019a5d71=""
                      id="input-1"
                      name="username"
                      type="text"
                      placeholder="Enter Username"
                      className="form-control-lg form-control"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onBlur={() => setLoginTouched(prev => ({ ...prev, username: true }))}
                      aria-invalid={loginTouched.username && loginErrors.username ? "true" : "false"}
                    />
                    {loginTouched.username && loginErrors.username && (
                      <span data-v-019a5d71="" className="error">
                        {loginErrors.username}
                      </span>
                    )}
                  </div>
                </div>
                <div data-v-019a5d71="" id="input-group-2" role="group" className="form-group">
                  <div>
                    <input
                      data-v-019a5d71=""
                      id="input-2"
                      name="password"
                      type="password"
                      placeholder="Enter password"
                      className="form-control-lg form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setLoginTouched(prev => ({ ...prev, password: true }))}
                      aria-invalid={loginTouched.password && loginErrors.password ? "true" : "false"}
                    />
                    {loginTouched.password && loginErrors.password && (
                      <span data-v-019a5d71="" className="error">
                        {loginErrors.password}
                      </span>
                    )}
                  </div>
                </div>
                <div data-v-019a5d71="" className="mt-3">
                  <button
                    data-v-019a5d71=""
                    type="submit"
                    className="btn btn-block btn-theme1 btn-lg btn-submit btn-secondary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                </div>
                <small data-v-019a5d71="" className="recaptchaTerms">This site is protected by reCAPTCHA and the Google
                  <a data-v-019a5d71="" href="https://policies.google.com/privacy"> Privacy Policy</a> and
                  <a data-v-019a5d71="" href="https://policies.google.com/terms"> Terms of Service</a> apply.
                </small>
              </form>
            </div>
          </LoginModal>
        )}

        {/* {isChangePasswordOpen || true && ( */}
        {isChangePasswordOpen && (
          <LoginModal toggleLogin={toggleChangePassword}>
            <div data-v-197edd3b="">
              <h3 data-v-197edd3b="" className="text-center mt-2 text-uppercase">Change Password</h3>
              <form data-v-197edd3b="" data-vv-scope="form-changepassword" className="change-form p-2" onSubmit={handleChangePassword}>
                <div data-v-197edd3b="" className="form-group">
                  <label data-v-197edd3b="" className="user-email-text">Old Password</label>
                  <input
                    data-v-197edd3b=""
                    type="password"
                    name="OldPassword"
                    className="form-control"
                    aria-required="true"
                    aria-invalid={touched.oldPassword && changePasswordErrors.oldPassword ? "true" : "false"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, oldPassword: true }))}
                  />
                  {touched.oldPassword && changePasswordErrors.oldPassword && (
                    <span data-v-197edd3b="" className="error">
                      {changePasswordErrors.oldPassword}
                    </span>
                  )}
                </div>
                <div data-v-197edd3b="" className="form-group">
                  <label data-v-197edd3b="" className="user-email-text">New Password</label>
                  <input
                    data-v-197edd3b=""
                    type="password"
                    name="NewPassword"
                    className="form-control"
                    aria-required="true"
                    aria-invalid={touched.newPassword && changePasswordErrors.newPassword ? "true" : "false"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, newPassword: true }))}
                  />
                  {touched.newPassword && changePasswordErrors.newPassword && (
                    <span data-v-197edd3b="" className="error">
                      {changePasswordErrors.newPassword}
                    </span>
                  )}
                </div>
                <div data-v-197edd3b="" className="form-group">
                  <label data-v-197edd3b="" className="user-email-text">Confirm Password</label>
                  <input
                    data-v-197edd3b=""
                    type="password"
                    name="ConfirmNewPassword"
                    data-vv-as="NewPassword"
                    className="form-control"
                    aria-required="true"
                    aria-invalid={touched.confirmPassword && changePasswordErrors.confirmPassword ? "true" : "false"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                  />
                  {touched.confirmPassword && changePasswordErrors.confirmPassword && (
                    <span data-v-197edd3b="" className="error">
                      {changePasswordErrors.confirmPassword}
                    </span>
                  )}
                </div>
                <div data-v-197edd3b="" className="form-group mb-0">
                  <button data-v-197edd3b="" type="submit" className="btn-block btn-theme1 btn-lg btn-submit" disabled={changePasswordLoading}>
                    {changePasswordLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </LoginModal>
        )}

      </div>
    </div>
  );
};

export default AdminPage;

