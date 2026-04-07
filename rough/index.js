// ./src/components/CenterContainer/SportsCenterContainer.js
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import ImageSlider from "../CenterContainer/ImageSlider";
import Tabs from "../CenterContainer/Tabs";
import Footer from "../CenterContainer/Footer";
import SwitchTheme from "../CenterContainer/Mobile/SwitchTheme";
import UpcomingFixture from "../CenterContainer/Mobile/UpcomingFixture";
import PointMenu from "../CenterContainer/Mobile/PointMenu";
import NewLaunchMob from "../CenterContainer/Mobile/NewLaunchMob";
import MenuTabsMob from "../CenterContainer/Mobile/MenuTabsMob";
import OurCasinoMob from "../CenterContainer/Mobile/OurCasinoMob";
// import PlaceBetPopup from "./PlaceBetPopup"
import OurCasinoImage from "../CenterContainer/Mobile/OurCasinoImage";
import WinnerAnnouncementMob from "../CenterContainer/Mobile/WinnerAnnouncementMob";
import { capitalize_1st_letter, formatNumber, formatWithTimezone, getSportName } from "../../utilies/helpers";
import Collapse from "react-bootstrap/Collapse";
import useIsMobile from "../../hooks/useIsMobile";
import { useDispatch, useSelector } from "react-redux";
import { setIsLoginModalOpen } from "../../store/slices/userSlice";
import { useNavigate } from 'react-router-dom';
import './blink.css'
import Loader from "../Loader/Loader";
import { bgColor } from "../CenterContainer/Tab";
import { getTitle } from "./BetSlip";
import { MatkaLink } from "../../pages/sport";
import { useSocket } from "../Socket/useSocket";
import LiveScoreCard from "./LiveScoreCard";
import { getIPv4, runAmountApi } from "../../api/api";
import SafeIframe from "../Common/SafeIframe";
import Modal_wrapper from "../CasinoGames/components/Modal_wrapper";
import { RunAmountTableCss } from "../CasinoGames/components/CssStyle";

const runstyle_td = {
  backgroundColor: "var(--bg-table)",
  color: "var(--text-table)",
}

function isSuspended(item) {
  return item?.status && item.status !== "ACTIVE" && item.status !== "OPEN";
}
const format = (num) => Number(parseFloat(num).toFixed(2)).toString();

function normalizeBookmakerSmall(session = []) {
  return session
    .slice()
    .sort((a, b) => a.SelectionId - b.SelectionId)
    .map(item => ({
      id: item.SelectionId,
      name: item.RunnerName,
      status: item.GameStatus,
      Min: item.Min,
      Max: item.Max,

      back: [
        { price: item.BackPrice1, size: item.BackSize1 },
        { price: item.BackPrice2, size: item.BackSize2 },
        { price: item.BackPrice3, size: item.BackSize3 },
      ],

      lay: [
        { price: item.LayPrice1, size: item.LaySize1 },
        { price: item.LayPrice2, size: item.LaySize2 },
        { price: item.LayPrice3, size: item.LaySize3 },
      ],
    }));
}


function filterRecord(session, isReverse = true) {
  const data =
    session
      .filter(item =>
        item.SelectionId &&
        !["OFFLINE", "CLOSED"].includes(
          (item.GameStatus || "").toUpperCase()
        )
      )
  return isReverse ? data.reverse() : data;
}

function getSuspendedStatus(item) {
  const status = (item.GameStatus || "").toUpperCase();

  if (
    status === "BALL_RUN" ||
    status === "SUSPEND" ||
    status === "CLOSED" ||
    status === "OFFLINE"
  ) {
    return true;
  }
  return false;
}

function getSuspendedStatusForBm1(item) {
  const status = (item.GameStatus || "").toUpperCase();

  if (status != "ACTIVE" || (item.back[0]?.price == 0 && item.lay[0]?.price == 0)) {
    return true;
  } else {
    return false;
  }
}

export function sanitizeNumber(val) {
  return isNaN(val) || val === null ? 0 : Number(val);
}

function findExposureValue(marketObj, targetId) {
  if (!marketObj?.market_ids || !marketObj?.exposure) return null;
  const targetIdStr = String(targetId);
  for (const teamKey in marketObj.market_ids) {
    if (String(marketObj.market_ids[teamKey]) === targetIdStr) {
      return marketObj.exposure[teamKey] ?? null;
    }
  }
  return null;
}

export function getExposureByMarketId__({ data, marketId, isBookmaker = false, key }) {
  if (!data) return;
  const targetId = String(marketId);

  if (isBookmaker) {
    return findExposureValue(data?.BOOKMAKER_ODDS, targetId);
  }

  if (marketId == 721690) console.log('marketId', marketId);

  const data_ = { ...data };
  delete data_?.BOOKMAKER_ODDS;
  for (const marketType of Object.values(data_)) {
    // Case 1: Array (like FANCY_ODDS)
    if (Array.isArray(marketType)) {
      for (const item of marketType) {
        const exposure = findExposureValue(item, targetId);
        if (exposure !== null) return exposure;
      }
    }
    // Case 2: Object (like MATCH_ODDS)
    else {
      const exposure = findExposureValue(marketType, targetId);
      if (exposure !== null) return exposure;
    }
  }

  return null; // not found
}

export function getExposureByMarketId({ data, marketId, key }) {
  // key === "BOOKMAKER_ODDS" && console.log('data?.[key]', key, marketId, data?.[key]);

  const marketType = data?.[key];
  const targetId = String(marketId);

  if (Array.isArray(marketType)) {
    for (const item of marketType) {
      const exposure = findExposureValue(item, targetId);
      if (exposure !== null) return format(exposure);
    }
  }

  else {
    const exposure = findExposureValue(marketType, targetId);
    if (exposure !== null) return format(exposure);
  }
}

function getExposureCss(exposure) {
  // color: exposure < 0
  //   ? "var(--book-red, #f7505e) !important"
  //   : "var(--book-green, #39ff39) !important",
  return {
    color: exposure < 0 ? "rgb(247, 80, 94)" : "rgb(57, 255, 57)",
    fontWeight: 500,
  }
}

/**
 * Processes main match data (Match Odds and Tied Match).
 * @param {Array} rawData - The raw market data from the socket.
 * @returns {Object} { matchOdds, tiedMatch }
 */
function processMainMarketData(rawData) {
  if (!rawData) return { matchOdds: null, tiedMatch: null };
  const groups = Array.isArray(rawData[0]) ? rawData : [rawData];
  const firstGroup = groups?.[0] || [];
  // console.log('firstGroup', firstGroup);

  const matchOdds = firstGroup.find(
    m => m.marketName?.toLowerCase() === "match odds"
      || m.marketName?.toLowerCase() === "match_odds"
      || m.market_name?.toLowerCase() === "match odds"
      || m.market_name?.toLowerCase() === "match_odds"
  );

  const tiedMatch = firstGroup.find(
    m => m.marketName?.toLowerCase() === "tied match"
      || m.marketName?.toLowerCase() === "tied_match"
      || m.market_name?.toLowerCase() === "tied match"
      || m.market_name?.toLowerCase() === "tied_match"
  );

  // console.log('##### main', { matchOdds, tiedMatch });
  return { matchOdds, tiedMatch };
}

/**
 * Processes other markets data (all markets and bookmakers map).
 * @param {Array} rawData - The raw market data from the socket.
 * @returns {Object} { allMarkets, allBookmakers }
 */
function processOtherMarketData(rawData) {
  if (!rawData) return { allMarkets: [], allBookmakers: {} };
  const groups = Array.isArray(rawData[0]) ? rawData : [rawData];

  let allMarkets = [];
  let allBookmakers = {};

  groups.forEach((marketGroup, groupIndex) => {
    marketGroup.forEach(market => {
      const key = market.marketName ? "marketName" : "market_name";
      const marketNameKey = market[key]?.toLowerCase()?.replace(/\s+/g, "_");

      allMarkets.push({
        ...market,
        key: marketNameKey + "_" + groupIndex
      });

      if (marketNameKey === "match_odds") {
        allBookmakers[marketNameKey + "_" + groupIndex] = {
          bookmaker: market.bookmaker || [],
          bookmaker_tied: market.bookmaker_tied || []
        };
      }
    });
  });

  // console.log('##### other', { allMarkets, allBookmakers });
  return { allMarkets, allBookmakers };
}

const SportsCenterContainer = ({
  socketData,
  setSocketData,
  initialSocketData,
  requestOdds,
  popupContent,
  setPopupContent,
  livePoints,
  openedBetPoint,
  liveURLForMatch,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const matchFromState = location.state?.match;
  const [runAmountModal, setRunAmountModal] = useState(null);

  const dispatch = useDispatch();
  const selectedMatchRedux = useSelector(store => store.match.selectedMatch);
  const selectedMatch = matchFromState || selectedMatchRedux;
  // const [selectedMatch, setSelectedMatch] = useState(); // DONT USE "selectedMatch" of redux store, takes time load
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const [bookmaker_odds, setBookmaker_odds] = useState();
  const [bookmaker_tied_odds, setBookmaker_tied_odds] = useState();
  const [bookmaker_tied, setBookmaker_tied] = useState();
  const [bookmaker_tied_tied, setBookmaker_tied_tied] = useState();
  const [normalData, setNormalData] = useState();
  const [fancy1, setFancy1] = useState();
  const [oddEven, setOddEven] = useState();
  const [overByOver, setOverByOver] = useState();
  const [ballByBall, setBallByBall] = useState();
  const [khado, setKhado] = useState();
  const [meter, setMeter] = useState();
  const [cricketcasino, setCricketcasino] = useState();
  const [match_Odds, setMatch_Odds] = useState();
  const [tied_match, setTied_match] = useState();
  const [bookmakerSmall, setBookmakerSmall] = useState()
  const isMobile = useIsMobile();
  const prevSocketData = useRef([]);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [liveScoreData, setLiveScoreData] = useState(null);
  const socket = useSocket("casino");
  const isCricket = selectedMatch?.SportId == 4;
  const [isTvOn, setIsTvOn] = useState(false);
  const isLeague = selectedMatch?.matchName?.toLowerCase()?.includes("league");
  const leagueName = selectedMatch?.cname?.split(" ")?.map((item) => item[0]?.toUpperCase())?.join("");
  const isTv = selectedMatch?.tv;
  const [scoreCardOrTv, setScoreCardOrTv] = useState("scorecard");
  // const [isTvActive, setIsTvActive] = useState(false);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (activeTooltip && !e.target.closest('.nation-title-text')) {
        setActiveTooltip(null);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [activeTooltip]);


  // useEffect(() => {
  //   console.log('@@ popupContent', popupContent);
  // }, [popupContent]);

  // useEffect(() => {
  //   return () => {
  //     console.log("setSocketData(null);");
  //     setSocketData(null); // remove prev data when page changes
  //   };
  // }, []);

  // fetch('https://ipv4.icanhazip.com').then(res => res.text()).then(ip => console.log(ip.trim()));
  useEffect(() => {
    // console.log('socketData', socketData);
  }, [socketData]);

  useEffect(() => {
    if (!socket || !selectedMatch?.inPlay || selectedMatch?.SportId != 4) return;

    const handleLiveScore = (data) => {
      // data is ["liveScore", { type: 1, data: { ... } }]
      // console.log('22 data', data)
      if (data?.data) {
        setLiveScoreData(data.data);
      }
    };

    socket.on("liveScore", handleLiveScore);

    return () => {
      socket.off("liveScore", handleLiveScore);
    };
  }, [socket, selectedMatch?.inPlay, selectedMatch?.SportId]);

  async function getLiveVideoUrl() {
    const ip = await getIPv4();
    socket?.emit("getLiveVideoUrl", { eventId: selectedMatch?.marketid, ipAddress: ip });
  }

  useEffect(() => {
    if (selectedMatch?.marketid) {
      // setTimeout(() => {
      requestOdds(selectedMatch?.marketid)
      if (selectedMatch?.inPlay) {
        getLiveVideoUrl();
      }

      // }, 1000)
    } else {
      navigate('/');
    }
  }, [selectedMatch, socket])

  const [cricketMarkets, setCricketMarkets] = useState([]); // array of all markets
  const [marketBookmakers, setMarketBookmakers] = useState({}); // { marketName: { bookmaker, bookmaker_tied } }

  useEffect(() => {
    if (socketData) {
      setNormalData(filterRecord(socketData?.body?.session?.[0]?.value?.session, false));
      setFancy1(filterRecord(socketData?.body?.session1?.[0]?.value?.session, false));
      setOddEven(filterRecord(socketData?.body?.oddEven?.[0]?.value?.session));
      setOverByOver(filterRecord(socketData?.body?.overByOver?.[0]?.value?.session));
      setBallByBall(filterRecord(socketData?.body?.ballByBall?.[0]?.value?.session));
      setKhado(filterRecord(socketData?.body?.khado?.[0]?.value?.session, false));
      setMeter(filterRecord(socketData?.body?.meter?.[0]?.value?.session));
      setCricketcasino(socketData?.body?.cricketcasino?.[0]?.value?.session);

      const bmSession = socketData?.body?.bm1?.[0]?.value?.session;
      if (bmSession) {
        setBookmakerSmall(normalizeBookmakerSmall(bmSession));
      }

      // Markets data processing ----------------------------------------------------

      const marketSource = socketData?.body?.cricket;

      // Task 1: Main Match Data (Match Odds & Tied Match)
      const mainData = processMainMarketData(marketSource);
      setMatch_Odds(mainData.matchOdds);
      setTied_match(mainData.tiedMatch);
      setBookmaker_odds(mainData.matchOdds?.bookmaker || []);
      setBookmaker_tied_odds(mainData.matchOdds?.bookmaker_tied || []);

      // Task 2: Other Markets Data
      const otherData = processOtherMarketData(marketSource);
      setCricketMarkets(otherData.allMarkets);
      setMarketBookmakers(otherData.allBookmakers);
    }
  }, [socketData]);


  useEffect(() => {
    // console.log('11 initialSocketData', initialSocketData);
    if (!socketData && initialSocketData) {

      const marketSource = initialSocketData;

      const mainData = processMainMarketData(marketSource);
      // console.log('11 mainData', mainData)
      setMatch_Odds(mainData?.matchOdds);
      setTied_match(mainData?.tiedMatch);
      setBookmaker_odds(mainData?.matchOdds?.bookmaker || []);
      setBookmaker_tied_odds(mainData?.matchOdds?.bookmaker_tied || []);

      const otherData = processOtherMarketData(marketSource);
      // console.log('11 otherData', otherData)
      setCricketMarkets(otherData?.allMarkets);
      setMarketBookmakers(otherData?.allBookmakers);
    }
  }, [initialSocketData]);

  // console.log('qq cricketcasino', cricketcasino);
  // console.log("qq normalData", normalData);
  // console.log("qq fancy1", fancy1);
  // console.log("qq oddEven", oddEven);
  // console.log("qq overByOver", overByOver);
  // console.log("qq ballByBall", ballByBall);
  // console.log("qq khado", khado);
  // console.log("qq meter", meter);
  // console.log('qq bookmakerSmall', bookmakerSmall)
  // console.log('qq cricketMarkets', cricketMarkets)
  // console.log('qq marketBookmakers', marketBookmakers)

  // console.log('qq bookmaker_odds', bookmaker_odds);

  const getHeaderName = () => {
    if (selectedMatch) {
      // return `${getSportName(selectedMatch.SportId)} > ${selectedMatch.matchName}`;
      if (selectedMatch.cname) return `${selectedMatch.cname} > ${selectedMatch.matchName}`;
      else return `${selectedMatch.matchName}`;
    }
    return "Loading Match Details...";
  };

  const getHeaderDate = () => {
    if (selectedMatch && selectedMatch.matchdate) {
      return formatWithTimezone(selectedMatch.matchdate);
    }

    return "Date Not Available";
  };


  const [openSections, setOpenSections] = useState({
    market0: true, market1: true, market2: true, market3: true, market33: true, market333: true, market3333: true, market33333: true, market4: true, market5: true, market6: true, market7: true, market8: true, market9: true, market10: true, market11: true, combined0: true, market91: true, market92: true, market93: true, market94: true, market81: true, market3334: true
  });
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

  function addSectionIfNotExist(sectionId) {
    if (sectionId in openSections) {
      return null;
    } else {
      setOpenSections(prev => ({ ...prev, [sectionId]: true }));
    }
  }

  const toggleSection = (section) => {
    // console.log('!openSections[', section, ']', !openSections[section]);
    setOpenSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  function Header({ title, sectionId, min, max, isCashout }) {
    return (
      <div
        onClick={() => toggleSection(sectionId)}
        aria-expanded={openSections[sectionId]}
        className="bet-table-header"
      >
        <div className="nation-name">
          <span title={title} className="nation-title-text" style={{ position: 'relative' }}
          // onClick={(e) => {
          //   e.stopPropagation();
          //   setActiveTooltip(activeTooltip === sectionId ? null : sectionId);
          // }}
          >
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              title=""
            >
              <img
                src="https://wver.sprintstaticdata.com/v57/static/front/img/arrow-down.svg"
                className="mr-1"
              />
            </a>
            {title}
            {/* {activeTooltip === sectionId && (
              <div className="custom-header-tooltip">
                {title}
              </div>
            )} */}
          </span>
          {isCashout &&
            <button
              disabled="disabled"
              className="btn btn-success btn-sm"
            >
              Cashout
            </button>}
          <MinMax min={min} max={max} none_class={"d-none-desktop"} />
        </div>
      </div>
    )
  }

  function MinMax({ min, max, none_class }) {
    const m_in = formatNumber(sanitizeNumber(min))
    const m_ax = formatNumber(sanitizeNumber(max))
    return (
      <>
        <span className={`max-bet ${none_class ? none_class : ''}`} style={{ color: 'var(--text-table-header-new)' }}>
          {(min || min == 0) && <span>Min:<span style={{ marginRight: '10px' }}>{formatNumber(m_in)}</span></span>}
          {(max || max == 0) && <span>Max:<span>{formatNumber(m_ax)}</span></span>}
        </span>
      </>
    )
  }

  function BoxContent({ price, size, animateColor }) {
    const safePrice = sanitizeNumber(price);
    const safeSize = sanitizeNumber(size);
    // const animateColor2 = "red";
    // console.log("animateColor", animateColor);

    return (
      <>
        {animateColor && (<span className={`flash-overlay ${animateColor}`} />)}

        {safePrice || safeSize ? (
          <>
            <span className="d-block odds" style={{ color: "black" }}>
              {formatNumber(safePrice)}
            </span>
            <span className="d-block">
              {formatNumber(safeSize)}
            </span>
          </>
        ) : (
          <span
            className="d-block odds no-val"
            style={{ color: "#666" }}
          >
            —
          </span>
        )}
      </>
    );
  }


  function conditions_for_Popup(data, item, allTeamData) {
    if (!isLoggedIn) {
      setPopupContent(false);
      dispatch(setIsLoginModalOpen(true));
      return;
    }

    const price = sanitizeNumber(data.price);
    const size = sanitizeNumber(data.size);

    if (price > 0 && size > 0) {
      console.log("item", item)
      setPopupContent({
        ...data,
        marketName: item.marketName || item.market_name,
        bet_market_type: item.bet_market_type,
        market_odd_name: item.market_odd_name,
        allTeamData: allTeamData,
      });
    }
  }


  function Boxes_2({ isAllBackBox, item, title, bet_market_type, market_odd_name, isSuspended, allTeamData, isLayFirst, is_1_OddBox = false, isPassLayPara = false }) {
    // blink color logic
    let back_color = false;
    let lay_color = false;

    if (prevSocketData.current) {
      const idx = prevSocketData.current.findIndex(val => val.SelectionId === item.SelectionId);
      if (idx !== -1) {
        const prevData = prevSocketData.current[idx];

        if (Number(item.BackPrice1) > Number(prevData.BackPrice1)) {
          back_color = 'green';
        } else if (Number(item.BackPrice1) < Number(prevData.BackPrice1)) {
          back_color = 'red';
        }

        if (Number(item.LayPrice1) > Number(prevData.LayPrice1)) {
          lay_color = 'green';
        } else if (Number(item.LayPrice1) < Number(prevData.LayPrice1)) {
          lay_color = 'red';
        }

        prevSocketData.current[idx] = { ...item };
      } else {
        prevSocketData.current.push({ ...item });
      }
    }

    function BackBox() {
      return (
        <div
          className={`bl-box back ${is_1_OddBox ? "single-odd-box" : ""}`}
          style={{ width: isSuspended && isMobile && "49%" }}
          onClick={() =>
            conditions_for_Popup(
              {
                name: item.RunnerName,
                price: item.BackPrice1,
                size: item.BackSize1,
                title,
                runner: item.RunnerName,
                SelectionId: item.SelectionId,
              },
              { ...item, bet_market_type, market_odd_name },
              allTeamData,
            )
          }
        >
          <BoxContent
            price={item.BackPrice1}
            size={item.BackSize1}
            animateColor={back_color}
          />
        </div>
      )
    }

    function LayBox() {
      if (!is_1_OddBox) {
        return (
          <div
            className={`bl-box ${isAllBackBox ? "back" : "lay"
              } no-val`}
            style={{ width: isSuspended && isMobile && "49%" }}
            onClick={() =>
              conditions_for_Popup(
                {
                  name: item.RunnerName,
                  price: item.LayPrice1,
                  size: item.LaySize1,
                  isRed: !isAllBackBox, // isPassLayPara ?? !isAllBackBox,
                  title,
                  runner: item.RunnerName,
                  SelectionId: item.SelectionId,
                },
                { ...item, bet_market_type, market_odd_name },
                allTeamData,
              )
            }
          >
            <BoxContent
              price={item.LayPrice1}
              size={item.LaySize1}
              animateColor={lay_color}
            />
          </div>
        )
      }
    }

    if (isLayFirst) {
      return (
        <>
          <LayBox />
          <BackBox />
        </>
      )
    }

    return (
      <>
        <BackBox />
        <LayBox />
      </>
    );
  }


  function Boxes_6({ data, title, bet_market_type, market_odd_name, allTeamData }) {
    const back = data?.back || [];
    const lay = data?.lay || [];

    // blink color logic
    let back_color = [false, false, false];
    let lay_color = [false, false, false];

    if (prevSocketData.current) {
      const idx = prevSocketData.current.findIndex(val => val.selectionId === data.selectionId);
      if (idx !== -1) {
        const prevData = prevSocketData.current[idx];
        prevSocketData.current[idx] = data;

        prevData.back.forEach((v, i) => {
          if (data.back[i]?.price > prevData.back[i]?.price) {
            back_color[i] = 'green';
          } else if (data.back[i]?.price < prevData.back[i]?.price) {
            back_color[i] = 'red';
          }

          if (data.lay[i]?.price > prevData.lay[i]?.price) {
            lay_color[i] = 'green';
          } else if (data.lay[i]?.price < prevData.lay[i]?.price) {
            lay_color[i] = 'red';
          }
          // console.log("back_color[" + i + "]", back_color[i])
          // console.log("lay_color[" + i + "]", lay_color[i])
        });
      } else {
        prevSocketData.current.push(data);
      }
    }

    return (
      <>
        <div className="bl-box back back2 odds-down">
          <BoxContent price={back[2]?.price} size={back[2]?.size} animateColor={back_color[2]} />
        </div>

        <div className="bl-box back back1 odds-down">
          <BoxContent price={back[1]?.price} size={back[1]?.size} animateColor={back_color[1]} />
        </div>

        <div
          className="bl-box back odds-down"
          onClick={() =>
            conditions_for_Popup({
              name: data.name,
              price: back[0]?.price,
              size: back[0]?.size,
              title,
              runner: data.name,
              SelectionId: data.selectionId,
            }, { ...data, bet_market_type, market_odd_name }
              , allTeamData
            )}
        >
          <BoxContent price={back[0]?.price} size={back[0]?.size} animateColor={back_color[0]} />
        </div>

        <div
          className="bl-box lay odds-down"
          onClick={() =>
            conditions_for_Popup({
              name: data.name,
              price: lay[0]?.price,
              size: lay[0]?.size,
              isRed: true,
              title,
              runner: data.name,
              SelectionId: data.selectionId,
            }, { ...data, bet_market_type, market_odd_name },
              allTeamData
            )}
        >
          <BoxContent price={lay[0]?.price} size={lay[0]?.size} animateColor={lay_color[0]} />
        </div>

        <div className="bl-box lay lay1 odds-down">
          <BoxContent price={lay[1]?.price} size={lay[1]?.size} animateColor={lay_color[1]} />
        </div>

        <div className="bl-box lay lay2 odds-down">
          <BoxContent price={lay[2]?.price} size={lay[2]?.size} animateColor={lay_color[2]} />
        </div>
      </>
    );
  }

  function ColumnName({ isAllBackBox, isLayFirst }) {
    if (isAllBackBox) {
      return (<>
        <div className="back bl-title back-title">Odd</div>
        <div className="back bl-title back-title">Even</div>
      </>)
    } else {
      if (isLayFirst) {
        return (<>
          <div className="lay bl-title lay-title">Lay</div>
          <div className="back bl-title back-title">Back</div>
        </>)
      } else {
        return (<>
          <div className="back bl-title back-title">Back</div>
          <div className="lay bl-title lay-title">Lay</div>
        </>)
      }
    }
  }

  async function getRunAmountApi({ eventId, marketId }) {
    const res = await runAmountApi({ eventId, marketId });
    console.log("res", res);
    setRunAmountModal(res?.data);
  }

  function Double_Column_Section({ title, isCasino, sectionId, data, isAllBackBox, bet_market_type, market_odd_name, isLayFirst, is_1_OddBox, isCashout, isMinMax = true, isCommonMinMax = false, min, max, marketClass = "market-6", isRunAmountEnable = false, isPassLayPara = false }) {
    // isCasino && console.log("## ", title, 'data', data);
    addSectionIfNotExist(sectionId);
    if (data?.length) {
      return (
        <div className={marketClass} id={`goto-${sectionId}`}>
          <div className="bet-table">

            <Header
              isCashout={isCashout}
              title={title}
              sectionId={sectionId}
              // isCommonMinMax={isCommonMinMax}
              min={min}
              max={max}
            />

            {/* <div data-title="SUSPENDED" className="bet-table-row suspendedtext"> */}
            <Collapse in={openSections[sectionId]}>
              <div id="market33" data-title="OPEN" className="bet-table-body container-fluid container-fluid-5">
                <div className="row row5 d-none-mobile">
                  <div className="col-12 col-md-6 ">
                    <div className="fancy-tripple">
                      <div className="bet-table-row">
                        <div className="nation-name"></div>
                        <ColumnName isAllBackBox={isAllBackBox} isLayFirst={isLayFirst} />
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6 ">
                    <div className="fancy-tripple">
                      <div className="bet-table-row">
                        <div className="nation-name"></div>
                        <ColumnName isAllBackBox={isAllBackBox} isLayFirst={isLayFirst} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row row5">
                  {data?.map((item, index) => {
                    let exposure = getExposureByMarketId({ data: openedBetPoint, marketId: item.marketId, key: bet_market_type });
                    if (!exposure) exposure = getExposureByMarketId({ data: livePoints, marketId: item.marketId, key: bet_market_type });
                    // !!exposure && console.log('exposure', exposure);

                    var statusLabel = item.Active;
                    var isSuspended = false;
                    if (statusLabel != "") {
                      isSuspended = true;
                    }

                    function OddsBox() {
                      return (
                        <Boxes_2
                          item={item}
                          isAllBackBox={isAllBackBox}
                          isPassLayPara={isPassLayPara}
                          title={title}
                          bet_market_type={bet_market_type}
                          market_odd_name={market_odd_name}
                          isSuspended={isSuspended}
                          isLayFirst={isLayFirst}
                          is_1_OddBox={is_1_OddBox}
                        />
                      )
                    }

                    return (
                      <div className="col-12 col-md-6 " key={index}>
                        <div className="fancy-tripple">

                          {/* Mobile Row */}
                          <div className="bet-table-mobile-row d-none-desktop">
                            <div className="bet-table-mobile-team-name">
                              <span
                                onClick={() => {
                                  if (isRunAmountEnable && !isSuspended && exposure && exposure != 0) {
                                    getRunAmountApi({ eventId: selectedMatch?.matchid, marketId: item.SelectionId })
                                  }
                                }}
                              >
                                {item.RunnerName}</span>
                              <span></span>
                            </div>
                            {isCasino && <p className="mb-0" style={{ ...getExposureCss(exposure), fontWeight: "600 !important" }}>{exposure ?? ''}</p>}
                          </div>

                          {/* Main Row */}
                          {/* <div data-title="" className="bet-table-row"> */}
                          <div
                            // data-title={isSuspended ? statusLabel : ""}
                            // className={`bet-table-row ${isSuspended ? "suspendedtext2" : ""}`}
                            className={`bet-table-row`}
                          >
                            <div className="nation-name d-none-mobile">
                              <p className="two-line-text">{item.RunnerName}</p>
                              <div
                                className="mb-0"
                                style={{ ...getExposureCss(exposure) }}
                              >
                                {exposure ?? ''}
                              </div>
                            </div>

                            {isSuspended ? (
                              <div data-title={statusLabel} className={`${isCasino ? "suspended w-100" : "suspendedtext2"}`}>
                                <OddsBox />
                              </div>
                            ) : (
                              <OddsBox />
                            )}

                            {/* Min Max */}
                            {isMinMax && <div className="fancy-min-max" style={{ position: 'relative' }}>
                              <span className="mobile-point2 d-none-desktop" style={{ ...getExposureCss(exposure) }}>{exposure ?? ''}</span>
                              Min:<span>{formatNumber(sanitizeNumber(item.Min))}</span> Max:<span>{formatNumber(sanitizeNumber(item.Max))}</span>
                            </div>}
                          </div>
                          <div className="remark">{item.Remark}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Collapse>
          </div>
        </div>
      )
    } else {
      return <></>;
    }
  }

  function Helper_for_Comp3({ runners, title, isBookMaker, bet_market_type, market_odd_name }) {
    // console.log(title, '@@runners', runners);
    return (
      <>
        {runners?.map((d, idx) => {
          let exposure = getExposureByMarketId({ data: openedBetPoint, marketId: d.id, key: bet_market_type });
          if (!exposure) exposure = getExposureByMarketId({ data: livePoints, marketId: d.id, key: bet_market_type });
          !!exposure && console.log('exposure', bet_market_type, exposure);

          var statusLabel = d.status;
          var isSuspended = false;
          if (!isBookMaker) {
            if (statusLabel != "ACTIVE" && statusLabel != "OPEN") {
              isSuspended = true;
            }
          } else {
            if (statusLabel != "ACTIVE") {
              isSuspended = true;
            }
          }

          return (
            <React.Fragment key={idx}>
              <div className="bet-table-mobile-row d-none-desktop">
                <div className="bet-table-mobile-team-name">
                  <span>{d.name}</span> <span style={{ ...getExposureCss(exposure) }}>{exposure}</span>
                </div>
              </div>

              <div data-title="ACTIVE" className="bet-table-row">
                {/* <div
              data-title={isSuspended(d) ? "SUSPENDED" : ""}
              className={`bet-table-row ${isSuspended(d) ? "suspendedtext2" : ""}`}
            > */}
                <div className="nation-name d-none-mobile">
                  <p>
                    <span>{d.name}</span>
                    <span className="float-right"></span>
                  </p>
                  <div className="mb-0 point2" style={{ ...getExposureCss(exposure) }}>{exposure}</div>
                </div>
                {isSuspended
                  ? <div data-title={statusLabel} className={`suspendedtext2 ${isMobile && "w-100"}`}>
                    <Boxes_6
                      data={d}
                      title={title}
                      bet_market_type={bet_market_type}
                      market_odd_name={market_odd_name}
                      allTeamData={runners}
                    />
                  </div>
                  : <Boxes_6
                    data={d}
                    title={title}
                    bet_market_type={bet_market_type}
                    market_odd_name={market_odd_name}
                    allTeamData={runners}
                  />
                }
              </div>
            </React.Fragment>
          )
        })
        }
      </>
    );
  }

  function Single_Column_Section({ title, data, min, max, sectionId, isCommonMinMax, isBookMaker = false, bet_market_type, market_odd_name, isCashout }) {
    // console.log("## ", title, 'data', data);
    const data2 = isCommonMinMax ? data?.runners : data;
    const title_ = data2?.length > 3 ? "TOURNAMENT_WINNER" : title ?? data?.market_name ?? data?.marketName;
    addSectionIfNotExist(sectionId);
    if (data2?.length) {
      return (
        <div className="market-4" id={`goto-${sectionId}`}>
          <div className="bet-table">

            <Header
              min={min}
              max={max}
              title={title_}
              sectionId={sectionId}
              isCashout={isCashout}
            />

            <Collapse in={openSections[sectionId]}>
              <div
                id="market0"
                data-title="OPEN"
                className="bet-table-body"
              >
                <div className="bet-table-row d-none-mobile">
                  <div className="nation-name">
                    <MinMax min={min} max={max} />
                  </div>
                  <div
                    translate="no"
                    className="back bl-title back-title"
                  >
                    Back
                  </div>
                  <div translate="no" className="lay bl-title lay-title">
                    Lay
                  </div>
                </div>
                <Helper_for_Comp3 runners={data2} title={title_} isBookMaker={isBookMaker} bet_market_type={bet_market_type} market_odd_name={market_odd_name} />
                {!!data.remark && <div className="remark" style={{ position: 'relative', top: '5px' }}>{data.remark}</div>}
              </div>
            </Collapse>
          </div>
        </div>
      )
    }
  }

  function Bookmaker({ title, isSameTitle, data, sectionId, min, max, isSmall = false, bet_market_type, market_odd_name, isCashout }) {
    var title2 =
      (isSmall || isSameTitle)
        ? title
        : data?.length > 3
          ? "ICC Mens T20 World Cup Winner Bookmaker"
          : getTitle(title);
    addSectionIfNotExist(sectionId);

    const getIsSuspended = (b, status) => {
      if (isSmall) {
        const backPrice = b.back?.[0]?.price || 0;
        const layPrice = b.lay?.[0]?.price || 0;
        return (status !== "ACTIVE" && status !== "OPEN") || (backPrice == 0 && layPrice == 0);
      }
      return status !== "ACTIVE" && status !== "OPEN";
    };

    const isWholeSuspended = (data?.every((b) => getIsSuspended(b, b.status)) && !isCricket);
    // console.log('isWholeSuspended', isWholeSuspended);
    // const isWholeSuspended = false; // remove THIS WHEN NEEDED

    if (data?.length) {
      return (
        <div className="market-2" id={`goto-${sectionId}`}>
          <div className="bet-table">
            <Header
              min={min}
              max={max}
              title={title2}
              sectionId={sectionId}
              isCashout={isCashout}
            />
            <Collapse in={openSections[sectionId]}>
              <div
                id={sectionId}
                data-title={isWholeSuspended ? "SUSPENDED" : "OPEN"}
                className={`bet-table-body ${isWholeSuspended ? "suspendedfull" : ""}`}
              >
                <div className="bet-table-row d-none-mobile">
                  <div className="nation-name">
                    <MinMax
                      min={min}
                      max={max}
                    />
                  </div>
                  <div className="back bl-title back-title">Back</div>
                  <div className="lay bl-title lay-title">Lay</div>
                </div>

                {data?.map((b, idx) => {
                  const status = b.status || b.Active; // Fallback
                  const isSuspended = isWholeSuspended ? false : getIsSuspended(b, status);

                  const selectionId = b.id || b.selectionId || b.SelectionId;

                  let exposure = getExposureByMarketId({ data: openedBetPoint, marketId: selectionId, isBookmaker: true, key: bet_market_type }) ?? getExposureByMarketId({ data: livePoints, marketId: selectionId, isBookmaker: true, key: bet_market_type });

                  return (
                    <React.Fragment key={idx}>
                      {/* Mobile Row */}
                      <div className="bet-table-mobile-row d-none-desktop">
                        <div className="bet-table-mobile-team-name">
                          <span>{b.name || b.RunnerName}</span>
                          <span style={{ ...getExposureCss(exposure) }}>{exposure}</span>
                        </div>
                      </div>

                      {/* Main Row */}
                      <div
                        // data-title={status}
                        // className={`bet-table-row ${isSuspended ? "suspendedtext w-100" : ""}`}
                        className={`bet-table-row`}
                      >
                        <div className="nation-name d-none-mobile">
                          <p>
                            <span>{b.name || b.RunnerName}</span>
                            <span className="float-right"></span>
                          </p>
                          <div className="mb-0 point2" style={{ ...getExposureCss(exposure) }}>{exposure ?? ""}</div>
                        </div>

                        {isSuspended ? (
                          <div data-title={status} className="suspendedtext2 ww-100">
                            <Boxes_2
                              title={title2}
                              isAllBackBox={false}
                              item={{
                                RunnerName: b.name || b.RunnerName,
                                SelectionId: selectionId,
                                LayPrice1: b.lay[0]?.price,
                                LaySize1: b.lay[0]?.size,
                                BackPrice1: b.back[0]?.price,
                                BackSize1: b.back[0]?.size,
                                GameStatus: status,
                              }}
                              bet_market_type={bet_market_type}
                              market_odd_name={market_odd_name}
                              isSuspended={isSuspended}
                              allTeamData={data}
                            />
                          </div>
                        ) : (
                          <Boxes_2
                            title={title2}
                            isAllBackBox={false}
                            item={{
                              RunnerName: b.name || b.RunnerName,
                              SelectionId: selectionId,
                              LayPrice1: b.lay[0]?.price,
                              LaySize1: b.lay[0]?.size,
                              BackPrice1: b.back[0]?.price,
                              BackSize1: b.back[0]?.size,
                              GameStatus: status,
                            }}
                            bet_market_type={bet_market_type}
                            market_odd_name={market_odd_name}
                            isSuspended={isSuspended}
                            allTeamData={data}
                          />
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </Collapse>
          </div>
        </div>
      )
    }
  }

  // YET TO TEST, NEEDS "bm1" SOCKETDATA TO TEXT

  // bet-table-body collapse show suspendedfull
  const nn = getSportName(Number(selectedMatch?.SportId)).toLowerCase();
  const color = bgColor(nn);

  function CricketMarkets({ isTied = false }) {
    // console.log('qq aa')
    // if (selectedMatch?.SportId == 4) return <></>;
    const aa =
      isTied
        ? cricketMarkets.filter((market) => market.marketName === "Tied Match")
        : cricketMarkets.filter((market) => market.marketName !== "Tied Match");
    return (
      aa.map((market) => {
        // console.log('qq market', market);
        const key_ = market.marketName ? "marketName" : "market_name"
        // console.log('11 market', key_, market[key_], market)
        const key = market.key;
        const bookmakers = marketBookmakers[key_] || {};


        const market_selectionId = `market_${key}`;
        const bookmaker_selectionId = `market_${key}_bookmaker`;
        const bookmaker_tied_selectionId = `market_${key}_bookmaker_tied`;
        addSectionIfNotExist(market_selectionId);
        addSectionIfNotExist(bookmaker_selectionId);
        addSectionIfNotExist(bookmaker_tied_selectionId);

        return (
          <React.Fragment key={key}>
            <Bookmaker
              title={market[key_] === "Match Odds" ? "MATCH_ODDS" : capitalize_1st_letter(market[key_])}
              isSmall={true}
              data={market.runners}
              sectionId={market_selectionId}
              min={market?.minBet}
              max={market?.maxBet}
              bet_market_type={getTitle(market[key_])}
              market_odd_name={getTitle(market[key_])}
            />

            <Bookmaker
              // title={`${market[key_]} bookmaker tied`}
              title="Tied Match"
              data={bookmakers.bookmaker_tied}
              sectionId={bookmaker_tied_selectionId}
              bet_market_type="BOOKMAKER_TIED_ODDS"
              market_odd_name="BOOKMAKER_TIED_ODDS"
            />

            <Single_Column_Section
              // title={`${market[key_]} bookmaker`}
              title="Bookmaker"
              data={bookmakers.bookmaker}
              sectionId={bookmaker_selectionId}
              min={market?.min}
              max={market?.max}
              bet_market_type="BOOKMAKER_ODDS"
              market_odd_name="BOOKMAKER_ODDS"
              isBookMaker={true}
              isSmall={true}
              isCashout={true}
            />
          </React.Fragment>
        );
      })
    )
  }

  const scroreCardBannerClass = isCricket ? 'scorecard-banner' : 'scorestats mobtog';
  const scoreBgImg = `url(/images/events-banner/${selectedMatch?.SportId}.png)`

  const oldgameId = initialSocketData?.[0]?.oldGameId;
  const tvUrl = `https://e765432.diamondcricketid.com/tvd247.php?1=1&sportid=${selectedMatch?.SportId}&gmid=${oldgameId}`
  const scoreCardUrl = `https://e765432.diamondcricketid.com/anm.php?type=scorecard&eventid=${oldgameId}&sportid=${selectedMatch?.SportId}`

  // score - saf - https://e765432.diamondcricketid.com/anm.php?type=scorecard&eventid=876870220&sportid=2
  // score - our - https://e765432.diamondcricketid.com/anm.php?type=scorecard&eventid=876870220&sportid=2

  return (
    <>
      <SwitchTheme />
      {!isLoggedIn && <UpcomingFixture />}

      <div className={`center-container sport-center-container ${isLoggedIn ? 'container-width' : ''} event-kk`}>
        <div className="horse-detail">
          <div className="detail-page-container cricket-detail">

            {isLoggedIn && isMobile && <MatkaLink />}

            {isLoggedIn && selectedMatch?.inPlay && !isLeague && isCricket &&
              <div className="banner scorecard-banner" style={{ backgroundImage: scoreBgImg }}>
                <LiveScoreCard data={liveScoreData} />
              </div>}

            {isLoggedIn && selectedMatch?.inPlay && !isLeague && !isCricket &&
              <>
                {scoreCardOrTv.toLocaleLowerCase() !== "tv" &&
                  <div className="banner scorestats mobtog" style={{ backgroundImage: scoreBgImg }}>
                    <SafeIframe frameBorder={0} src={scoreCardUrl} />
                  </div>}

                {scoreCardOrTv.toLocaleLowerCase() === "tv" &&
                  <div className="video-tv mt-1 d-none-desktop" style={{}}>
                    <SafeIframe allow="autoplay" src={tvUrl} />
                  </div>}
              </>
            }

            {isTvOn &&
              <div className="video-tv d-none-desktop">
                <SafeIframe allow="autoplay" src={tvUrl} />
              </div>}

            <div className="game-header d-none-mobile sport4" style={{ backgroundColor: color }}>
              <span className="game-header-name">{getHeaderName()}</span>
              <span className="game-header-date">{getHeaderDate()}</span>
            </div>

            <div className="game-header d-none-desktop sport4" style={{ backgroundColor: color, paddingTop: '4px' }}>
              <span className="game-header-name">
                {getHeaderName()}
                <div><small>{getHeaderDate()}</small></div>
              </span>

              {isLoggedIn && isTv &&
                <span>
                  {isCricket
                    ? <i className="fas fa-tv" onClick={() => setIsTvOn(!isTvOn)}></i>
                    :
                    <>
                      <i
                        className={`fas fa-eye ${scoreCardOrTv !== "tv" ? "active-tab" : ""}`}
                        style={{ fontSize: '21px' }}
                        onClick={() => setScoreCardOrTv("scorecard")}
                      ></i>
                      <i
                        className={`fas fa-tv ml-1 ${scoreCardOrTv === "tv" ? "active-tab" : ""}`}
                        style={{ fontSize: '18px' }}
                        onClick={() => setScoreCardOrTv("tv")}
                      ></i>
                    </>
                  }
                </span>}
            </div>

            {socketData || initialSocketData ?
              <>
                {!isCricket && <CricketMarkets isTied={false} />}

                {isCricket &&
                  <Single_Column_Section
                    sectionId="match_odds"
                    title={"MATCH_ODDS"}
                    data={match_Odds}
                    isCommonMinMax={true}
                    bet_market_type={getTitle(match_Odds?.marketName)}
                    market_odd_name={getTitle(match_Odds?.marketName)}
                    min={match_Odds?.minBet}
                    max={match_Odds?.maxBet}
                    isCashout={true}
                  />}

                {isCricket && !isLeague &&
                  <Single_Column_Section
                    sectionId="bookmaker_odds"
                    title={"Bookmaker"}
                    data={bookmaker_odds}
                    // isCommonMinMax={true}
                    bet_market_type="BOOKMAKER_ODDS"
                    market_odd_name="BOOKMAKER_ODDS"
                    min={match_Odds?.min}
                    max={match_Odds?.max}
                    isCashout={true}
                  />}

                {isCricket && isLeague &&
                  <Bookmaker
                    sectionId="league_bookmaker_odds"
                    title={`${leagueName} Cup Winner Bookmaker`}
                    isSameTitle={true}
                    data={bookmaker_odds}
                    // isCommonMinMax={true}
                    bet_market_type="BOOKMAKER_ODDS"
                    market_odd_name="BOOKMAKER_ODDS"
                    min={match_Odds?.min}
                    max={match_Odds?.max}
                  // isCashout={true}
                  />
                }

                {isCricket &&
                  <Bookmaker
                    sectionId="bookmaker_tied_odds"
                    title={"Tied Match"}
                    data={bookmaker_tied_odds}
                    // isCommonMinMax={true}
                    bet_market_type="BOOKMAKER_TIED_ODDS"
                    market_odd_name="BOOKMAKER_TIED_ODDS"
                    min={match_Odds?.min_tied}
                    max={match_Odds?.max_tied}
                    isCashout={true}
                  />}

                <Bookmaker
                  title={"Bookmaker 2"}
                  data={bookmakerSmall}
                  sectionId="market6"
                  min={bookmakerSmall?.Min}
                  max={bookmakerSmall?.Max}
                  isSmall={true}
                  bet_market_type="BOOKMAKERSMALL_ODDS" // ??
                  market_odd_name="BOOKMAKERSMALL_ODDS" // ??
                />

                <Double_Column_Section
                  title={"Normal"}
                  sectionId="market2"
                  data={normalData}
                  isAllBackBox={false}
                  bet_market_type="FANCY_ODDS"
                  market_odd_name="FANCY_ODDS"
                  isLayFirst={true}
                  isRunAmountEnable={true}
                />

                <Double_Column_Section
                  title={"Oddeven"}
                  sectionId="market3"
                  data={oddEven}
                  isAllBackBox={true}
                  bet_market_type="FANCY_ODDS"
                  market_odd_name="ODDEVEN_ODDS"
                />

                <Double_Column_Section
                  title={"OverByOver"}
                  sectionId="market33"
                  data={overByOver}
                  isAllBackBox={true}
                  bet_market_type="FANCY_ODDS"
                  market_odd_name="FANCY_ODDS"
                  isRunAmountEnable={true}
                  isPassLayPara={true}
                />

                <Double_Column_Section
                  title={"BallByBall"}
                  sectionId="market333"
                  data={ballByBall}
                  isAllBackBox={true}
                  bet_market_type="FANCY_ODDS"
                  market_odd_name="BALL_ODDS"
                />
                <Double_Column_Section
                  title={"Fancy1"}
                  sectionId="market3334"
                  data={fancy1}
                  isAllBackBox={false}
                  bet_market_type="FANCY_ODDS"
                  market_odd_name="FANCY_ODDS"
                // isLayFirst={true}
                />

                <Double_Column_Section
                  title={"Khado"}
                  sectionId="market3333"
                  data={khado}
                  isAllBackBox={true}
                  bet_market_type="KHADO_ODDS"
                  market_odd_name="KHADO_ODDS"
                  is_1_OddBox={true}
                />

                <Double_Column_Section
                  title={"Meter"}
                  sectionId="market33333"
                  data={meter}
                  // isAllBackBox={true}
                  bet_market_type="METER_ODDS"
                  market_odd_name="METER_ODDS"
                  isLayFirst={true}
                />

                {!isCricket && <CricketMarkets isTied={true} />}


                {cricketcasino?.map((section) => {
                  return (
                    <Double_Column_Section
                      isCasino={true}
                      isMinMax={false}
                      isCommonMinMax={true}
                      min={section?.[0].Min}
                      max={section?.[0].Max}
                      marketClass={"market-9"}
                      title={section?.[0].header}
                      sectionId={getTitle(section?.[0].header)}
                      data={section}
                      // isAllBackBox={true}
                      bet_market_type={getTitle(section?.[0].header)}
                      market_odd_name={getTitle(section?.[0].header)}
                      is_1_OddBox={true}
                    />
                  )
                })}

                {isCricket &&
                  <Single_Column_Section
                    sectionId="tied_match"
                    title={tied_match?.marketName}
                    data={tied_match}
                    isCommonMinMax={true}
                    bet_market_type="TIED_MATCH"
                    market_odd_name="TIED_MATCH"
                    min={tied_match?.minBet}
                    max={tied_match?.maxBet}
                    isCashout={true}
                  />
                }
              </>
              :
              <div
                // className="bet-table"
                style={{
                  position: 'relative',
                  color: 'white',
                  width: '100%',
                  textAlign: 'center',
                  margin: '0px 10px',
                  // minHeight: "calc(100vh - 60px)",
                }}
              >
                Loading data...
                {/* <Loader /> */}
              </div>
            }
          </div>
          <Footer />
        </div>
      </div>

      <Modal_wrapper
        isModalOpen={!!runAmountModal}
        title="Run Amount"
        onClose={() => setRunAmountModal(null)}
        id="runAmountModal"
        isRunAmount={true}
      >
        <RunAmountTableCss />
        <div className="table-responsive run-amount-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ color: "rgb(238, 238, 238)" }}>Run</th>
                <th style={{ color: "rgb(238, 238, 238)" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {runAmountModal?.map((item, index) => (
                <tr key={index}>
                  <td style={runstyle_td}>{item.label}</td>
                  <td style={runstyle_td} className={item.expo > 0 ? "text-success" : item.expo < 0 ? "text-danger" : ""}>{item.expo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal_wrapper>
    </>
  );
};

export default SportsCenterContainer;


// https://worlds777.app/Images/newlaunched/1733733913274.jpg
// https://worlds777.app/storage//home_mob.jpeg

// https://e765432.diamondcricketid.com/tvd247.php?1=1&sportid=2&gmid=643604506 tv saffron
// https://e765432.diamondcricketid.com/anm.php?type=scorecard&eventid=643604506&sportid=2 scorecard saffron


// 5ea63a42