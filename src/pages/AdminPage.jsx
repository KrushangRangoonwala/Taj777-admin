import React, { useEffect, useState } from 'react';

const AdminPage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const toggleLogin = () => setIsLoginOpen(!isLoginOpen);

  useEffect(() => {
    document.body.classList.add('login');
    return () => {
      document.body.classList.remove('login');
    }
  }, [])

  useEffect(() => {
    if (isLoginOpen) {
      document.body.classList.add('right-bar-enabled');
    } else {
      document.body.classList.remove('right-bar-enabled');
    }
  }, [isLoginOpen])

  const carouselBanners = [
    "https://sitethemedata.com/sitethemes/world777.com/front/banners/1774237684677.webp",
    "https://sitethemedata.com/sitethemes/world777.com/front/banners/1774224933045.webp",
    "https://sitethemedata.com/sitethemes/world777.com/front/banners/1774242278412.webp",
    "https://sitethemedata.com/sitethemes/world777.com/front/banners/1774226663520.webp",
    "https://sitethemedata.com/sitethemes/world777.com/front/banners/1774226931993.webp",
    "https://sitethemedata.com/sitethemes/world777.com/front/banners/1774262353127.webp"
  ];
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
              <img data-v-019a5d71="" data-src="https://sitethemedata.com/sitethemes/world777.com/front/logo.png" src="https://sitethemedata.com/sitethemes/world777.com/front/logo.png" lazy="loaded" />
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
              <div data-v-019a5d71="" className="fixure-box-container"></div>
            </marquee>
          </div>
          <div data-v-019a5d71="" className="w-100 d-none-desktop">
            <marquee data-v-019a5d71="">
              <div data-v-019a5d71="" className="all-sports-list"></div>
            </marquee>
          </div>
          <div data-v-019a5d71="">
            <div data-v-019a5d71="" role="region" aria-busy="false" className="carousel carousal-23 slide" id="__BVID__5049">
              <div role="list" className="carousel-inner" id="__BVID__5049___BV_inner_">
                {carouselBanners.map((banner, index) => (
                  <div
                    key={index}
                    data-v-019a5d71=""
                    role="listitem"
                    className={`carousel-item ${index === carouselBanners.length - 1 ? 'active' : ''}`}
                    aria-current={index === carouselBanners.length - 1}
                    aria-posinset={index + 1}
                    aria-setsize={carouselBanners.length}
                    id={`__BVID__${5050 + index}`}
                    style={{ background: `url("${banner}")` }}
                    aria-hidden={index !== carouselBanners.length - 1}
                  >
                    {/*  */}
                  </div>
                ))}
              </div>
              <ol aria-hidden="false" aria-label="Select a slide to display" className="carousel-indicators" id="__BVID__5049___BV_indicators_" aria-owns="__BVID__5049___BV_inner_">
                {carouselBanners.map((_, index) => (
                  <li
                    key={index}
                    role="button"
                    tabIndex="0"
                    aria-current={index === carouselBanners.length - 1}
                    aria-label={`Goto slide ${index + 1}`}
                    className={index === carouselBanners.length - 1 ? 'active' : ''}
                    id={`__BVID__5049___BV_indicator_${index + 1}_`}
                    aria-controls="__BVID__5049___BV_inner_"
                    aria-describedby={`__BVID__${5050 + index}`}
                  ></li>
                ))}
              </ol>
            </div>
          </div>
          <div data-v-019a5d71="">
            <h4 data-v-019a5d71="" className="sport-list-title">Our Latest Casino</h4>
            <div data-v-019a5d71="" className="casino-banners-list mt-2 latest-casino">
              {latestCasinos.map((casino, index) => (
                <div key={index} data-v-019a5d71="" className="casino-banner-item login-hover">
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
                      <div key={index} data-v-019a5d71="" className="casino-banner-item login-hover">
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
        </div>
        <footer data-v-019a5d71="" className="footer">
          <div data-v-019a5d71="" className="container-fluid container-fluid-5">
            <div data-v-019a5d71="" className="row row5">
              <div data-v-019a5d71="" className="col-lg-12 text-center">
                <div data-v-019a5d71="" className="footer-bottom">
                  <span data-v-019a5d71="">
                    This website is owned and operated by (WORLD777.COM) Seven Investments America N.V.. registration number: 152581, registered address: Zuikertuintjeweg Z/N (Zuikertuin Tower), Curaçao. Contact us info@world7.com. world7.com is licensed and regulated by the Government of the Autonomous Island of Anjouan, Union of Comoros and operates under License No. ALSI-122310018-F16. world7.com has passed all regulatory compliance and is legally authorized to conduct gaming operations for any and all games of chance and wagering.
                  </span>
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
        <div data-v-019a5d71="">
          <div data-v-019a5d71="" className="right-bar">
            <div data-v-019a5d71="">
              <div data-v-019a5d71="" className="rightbar-title px-3 py-4">
                <a data-v-019a5d71="" href="javascript:void(0);" className="closebtn float-right" onClick={toggleLogin}></a>
                <h3 data-v-019a5d71="" className="m-0 text-light">ADMIN LOGIN</h3>
              </div>
              <hr data-v-019a5d71="" className="mt-0" />
              <div data-v-019a5d71="" className="p-4 mt-5">
                <div data-v-019a5d71="" className="overflow-hidden">
                  <div data-v-019a5d71="">
                    <h3 data-v-019a5d71="" className="text-center mt-2 mb-0 text-secondary">
                      Welcome to Admin Panel
                    </h3>
                    <p data-v-019a5d71="" className="text-center text-secondary">
                      Enter your Username and Password
                    </p>
                    <form data-v-019a5d71="" autoComplete="off" data-vv-scope="form-login" action="" method="POST" className="p-2 mt-4">
                      <div data-v-019a5d71="" id="input-group-1" role="group" className="form-group">
                        <div>
                          <input data-v-019a5d71="" id="input-1" name="username" type="text" placeholder="Enter Username" className="form-control-lg form-control" />
                          <span data-v-019a5d71="" className="error">
                            The username field is required
                          </span>
                        </div>
                      </div>
                      <div data-v-019a5d71="" id="input-group-2" role="group" className="form-group">
                        <div>
                          <input data-v-019a5d71="" id="input-2" name="password" type="password" placeholder="Enter password" className="form-control-lg form-control" />
                        </div>
                      </div>
                      <div data-v-019a5d71="" className="mt-3">
                        <button data-v-019a5d71="" type="submit" className="btn btn-block btn-theme1 btn-lg btn-submit btn-secondary">Sign In</button>
                      </div>
                      <small data-v-019a5d71="" className="recaptchaTerms">This site is protected by reCAPTCHA and the Google
                        <a data-v-019a5d71="" href="https://policies.google.com/privacy"> Privacy Policy</a> and
                        <a data-v-019a5d71="" href="https://policies.google.com/terms"> Terms of Service</a> apply.
                      </small>
                    </form>
                  </div>
                  <div data-v-019a5d71="" className="text-center text-secondary mt-2">
                    <div data-v-019a5d71="" className="mb-2">© Copyright 2021. All Rights Reserved.</div>
                    This website is owned and operated by (WORLD777.COM) Seven Investments America N.V.. registration number: 152581, registered address: Zuikertuintjeweg Z/N (Zuikertuin Tower), Curaçao. Contact us info@world7.com. world7.com is licensed and regulated by the Government of the Autonomous Island of Anjouan, Union of Comoros and operates under License No. ALSI-122310018-F16. world7.com has passed all regulatory compliance and is legally authorized to conduct gaming operations for any and all games of chance and wagering.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div data-v-019a5d71="" className="rightbar-overlay"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

