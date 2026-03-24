import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { fetchCasinoExposureApi, fetchOpenBetsApi } from "../../api/api";
import Modal from "react-modal";
import useIsMobile from "../../hooks/useIsMobile";
import CasinoVideo from "./components/CasinoVideo";
import Result_AAA2 from "./results/Result_AAA2";
import { getImage } from "../../utilies/helpers";
import { useGetFileData } from "../../hooks/useGetFileData";
import { useSocket } from "../Socket/useSocket";

// Helper function to get card image URL
const getCardImage = (cardCode) => {
  if (!cardCode)
    return "https://wver.sprintstaticdata.com/v67/static/front/img/cards/1.png";

  const baseUrl =
    "https://wver.sprintstaticdata.com/v67/static/front/img/cards";
  const cardMap = {
    A: "A",
    J: "J",
    Q: "Q",
    K: "K",
  };

  // Check if it's a face card or number card
  const cardValue = cardMap[cardCode] || cardCode;
  return `${baseUrl}/${cardValue}.png`;
};

// Helper to extract rank (value) out of a C1 code like "10SS", "7HH", "AS", etc.
const parseCardFromC1 = (c1) => {
  if (!c1) return null;
  const match = c1.match(/(10|[2-9]|[AJQK])/i);
  return match ? match[1].toUpperCase() : null;
};

const AAA2 = ({ isVisible, onBetSelection, lastBetTime }) => {
  const { CODE, game_type, phpFile, placeBetApi, matchName, game_name, iframe_url, result_image } = useGetFileData();
  const theme = useSelector((state) => state.action.theme);
  const isLight = theme === "light";
  const [gameData, setGameData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(false);
  const [exposureData, setExposureData] = useState([]);
  const socketRef = useRef(null);
  const currentRound = gameData?.t1?.[0];

  const fetchExposure = async () => {
    try {
      const response = await fetchCasinoExposureApi({
        markettype: CODE,
        main_event_id: gameData?.t1?.[0]?.mid,
        curPageName: phpFile,
      });
      if (Array.isArray(response?.data)) {
        setExposureData(response.data);
      } else {
        setExposureData([]);
      }
    } catch (error) {
      console.error("Error fetching exposure:", error);
    }
  };

  useEffect(() => {
    fetchExposure();
  }, [gameData?.t1?.[0]?.mid, lastBetTime, CODE, phpFile]);

  const getExposure = (sid) => {
    if (!Array.isArray(exposureData)) return 0;
    const market = exposureData.find(
      (item) => String(item.market_id) === String(sid)
    );
    return market ? market.win_loss || market.total_exposure : 0;
  };

  const renderExposure = (sid, customStyle = {}) => {
    const exposure = getExposure(sid);
    if (exposure === 0) return null;
    return (
      <span className={`mr-1 ${exposure > 0 ? "book-green" : "book-red"}`} style={{ ...customStyle }}>
        {exposure}
      </span>
    )
  };

  const socket = useSocket("casino");
  useEffect(() => {
    if (!socket) return;

    const handleGameData = (data) => {
      try {
        const payload = Array.isArray(data) ? data[0] : data;
        if (payload) {
          setGameData(payload);
        }
      } catch (error) {
        console.error("Error processing Trap data:", error);
      }
    };

    const handleConnect = () => {
      socket.emit("Room", game_type);
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);
    socket.on("game", handleGameData);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("game", handleGameData);
    };
  }, [socket, game_type]);

  // Extract game data from Bollywood structure
  // const currentRound = gameData?.t1?.[0]; // Moved to top
  const bettingOptions = gameData?.t2 || [];

  // Get the card value from Bollywood data structure
  const cardValue = currentRound?.C1;

  // Group betting options by their types
  const mainOptions = bettingOptions.filter((opt) =>
    ["1", "2", "3"].includes(String(opt.sid))
  );

  const evenOption = bettingOptions.find((opt) => String(opt.sid) === "4");
  const oddOption = bettingOptions.find((opt) => String(opt.sid) === "5");
  const redOption = bettingOptions.find((opt) => String(opt.sid) === "6"); // Red
  const blackOption = bettingOptions.find((opt) => String(opt.sid) === "7"); // Black
  const under7Option = bettingOptions.find((opt) => String(opt.sid) === "21");
  const over7Option = bettingOptions.find((opt) => String(opt.sid) === "22");

  const cardOptions = bettingOptions.filter(
    (opt) => parseInt(opt.sid) >= 8 && parseInt(opt.sid) <= 20
  );


  // Get the card image URL using the card value
  const cardImageUrl = getCardImage(cardValue);

  // Get timer color class based on time left
  const getTimerColorClass = () => {
    const timerValue = parseInt(timeLeft) || 0;
    if (timerValue <= 5) return "red";
    if (timerValue <= 10) return "orange";
    return "green";
  };

  // Get odds by sid
  const getOddsBySid = (sid) => {
    return gameData?.t2?.find((item) => item.sid === sid);
  };

  // Handle odds click with market data
  const handleOddsClick = (marketName, odds, sid, isBack) => {
    const market = getOddsBySid(sid);
    if (!market) return;

    if (
      !odds ||
      odds === "0" ||
      odds === "0.00" ||
      odds === 0 ||
      market.gstatus === "SUSPENDED" ||
      market.gstatus === "suspended"
    ) {
      return;
    }

    const min = market?.min || 100;
    const max = market?.max || 25000;

    if (onBetSelection) {
      onBetSelection({
        teamName: marketName,
        odds: isBack ? market.b1 : market.l1,
        minBet: min,
        maxBet: max,
        isBack,
        marketId: sid,
        eventId: currentRound?.mid,
      });
    }
  };

  // Timer countdown based on t1[0].autotime
  const isSuspended = (status) => {
    if (!status) return false;
    const s = status.toString().toUpperCase();
    return (
      s === "SUSPENDED" || s === "0" || s === "BALL RUNNING" || s === "LOCKED"
    );
  };
  useEffect(() => {
    const initialTime = currentRound?.autotime
      ? parseInt(currentRound.autotime, 10)
      : 0;
    if (!initialTime || isNaN(initialTime)) {
      setTimeLeft(0);
      return;
    }

    setTimeLeft(initialTime);

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRound?.mid, currentRound?.autotime]);



  function WholeCardDrawer() {
    return (
      <div>
        <span>
          <img
            src={cardImageUrl}
            alt={cardValue || "Card"}
          // style={{
          //   width: "60px",
          //   height: "60px",
          //   objectFit: "contain",
          //   borderRadius: "4px",
          // }}
          />
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="casino-table aaa">
        {/* VIDEO SECTION */}
        <CasinoVideo
          gameName={game_name}
          roundId={currentRound?.mid}
          videoSrc={iframe_url}
          isCardDrawerOpen={isCardDrawerOpen}
          setIsCardDrawerOpen={setIsCardDrawerOpen}
          autotime={currentRound?.autotime}
          totalTime={currentRound?.ft}
          cards={[currentRound?.C1]}
          CardsComponent={WholeCardDrawer}
        />
        <div className="casino-detail">
          <div className="container-fluid container-fluid-5">
            {/* Mobile Main Market Row */}
            <div className="row row5 d-none-big">
              {mainOptions.map((option, index) => (
                <div className="casino-bl-box kk-box" key={option.sid}>
                  <div className="casino-bl-box-item casino-odds-name">
                    <b>{String.fromCharCode(65 + index)}. {option.nat}</b>
                    {renderExposure(option.sid, { width: '100%', textAlign: 'left' })}
                  </div>
                  <div
                    className={`back casino-bl-box-item ${option.b1 === "0.00" || option.b1 === 0 || isSuspended(option.gstatus) ? "suspended" : ""}`}
                    onClick={() => handleOddsClick(option.nat, option.b1, option.sid, true)}
                  >
                    <span className="casino-box-odd">{option.b1 || "0.00"}</span>
                  </div>
                  <div
                    className={`lay casino-bl-box-item ${option.l1 === "0.00" || option.l1 === 0 || isSuspended(option.gstatus) ? "suspended" : ""}`}
                    onClick={() => handleOddsClick(option.nat, option.l1, option.sid, false)}
                  >
                    <span className="casino-box-odd">{option.l1 || "0.00"}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Main Market Row */}
            <div className="row row5 d-none-small">
              {mainOptions.map((option, index) => (
                <div className="col-4" key={option.sid}>
                  <div className="casino-box-row">
                    <div className="casino-nation-name">
                      <b>{String.fromCharCode(65 + index)}. {option.nat}</b>
                    </div>
                    <div className="casino-bl-box">
                      <div
                        className={`back casino-bl-box-item ${option.b1 === "0.00" || option.b1 === 0 || isSuspended(option.gstatus) ? "suspended" : ""}`}
                        onClick={() => handleOddsClick(option.nat, option.b1, option.sid, true)}
                        style={{ backgroundColor: isLight ? "#eef6fb" : undefined }}
                      >
                        <span className="casino-box-odd">
                          {option.b1 === "0.00" || option.b1 === 0 ? (
                            <img src={getImage('lock', 'images', 'svg')} alt="lock" style={{ width: '15px', filter: isLight ? 'none' : 'brightness(0) invert(1)' }} />
                          ) : option.b1}
                        </span>
                      </div>
                      <div
                        className={`lay casino-bl-box-item ${option.l1 === "0.00" || option.l1 === 0 || isSuspended(option.gstatus) ? "suspended" : ""}`}
                        onClick={() => handleOddsClick(option.nat, option.l1, option.sid, false)}
                        style={{ backgroundColor: isLight ? "#eef6fb" : undefined }}
                      >
                        <span className="casino-box-odd">
                          {option.l1 === "0.00" || option.l1 === 0 ? (
                            <img src={getImage('lock', 'images', 'svg')} alt="lock" style={{ width: '15px', filter: isLight ? 'none' : 'brightness(0) invert(1)' }} />
                          ) : option.l1}
                        </span>
                      </div>
                    </div>
                    <div className="casino-nation-name">
                      {renderExposure(option.sid)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row row5 aaa-oe">
              <div className="col-lg-4 col-12">
                <div className="casino-box-row">
                  <div className="casino-bl-box"><b>{evenOption?.b1 || "0"}</b></div>
                  <div className="casino-bl-box"><b>{oddOption?.b1 || "0"}</b></div>
                </div>
                <div className="casino-box-row">
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${evenOption?.b1 === "0.00" || evenOption?.b1 === 0 || isSuspended(evenOption?.gstatus) ? `suspended ${Boolean(Number(getExposure(evenOption?.sid))) ? "lock-top" : ""}` : ""}`}
                      onClick={() => handleOddsClick(evenOption?.nat, evenOption?.b1, evenOption?.sid, true)}
                    >
                      <span className="casino-box-odd">Even</span>
                      {renderExposure(evenOption?.sid)}
                    </div>
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${oddOption?.b1 === "0.00" || oddOption?.b1 === 0 || isSuspended(oddOption?.gstatus) ? `suspended ${Boolean(Number(getExposure(oddOption?.sid))) ? "lock-top" : ""}` : ""}`}
                      onClick={() => handleOddsClick(oddOption?.nat, oddOption?.b1, oddOption?.sid, true)}
                    >
                      <span className="casino-box-odd">Odd</span>
                      {renderExposure(oddOption?.sid)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-12">
                <div className="casino-box-row">
                  <div className="casino-bl-box"><b>{blackOption?.b1 || "0"}</b></div>
                  <div className="casino-bl-box"><b>{redOption?.b1 || "0"}</b></div>
                </div>
                <div className="casino-box-row">
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item casino-card-img ${blackOption?.b1 === "0.00" || blackOption?.b1 === 0 || isSuspended(blackOption?.gstatus) ? `suspended ${Boolean(Number(getExposure(blackOption?.sid))) ? "lock-top" : ""}` : ""}`}
                      onClick={() => handleOddsClick("Black", blackOption?.b1, blackOption?.sid, true)}
                    >
                      <span>
                        <img src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/spade.png" alt="S" />
                        <img src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/club.png" alt="C" />
                      </span>
                      {renderExposure(blackOption?.sid)}
                    </div>
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item casino-card-img ${redOption?.b1 === "0.00" || redOption?.b1 === 0 || isSuspended(redOption?.gstatus) ? `suspended ${Boolean(Number(getExposure(redOption?.sid))) ? "lock-top" : ""}` : ""}`}
                      onClick={() => handleOddsClick("Red", redOption?.b1, redOption?.sid, true)}
                    >
                      <span>
                        <img src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/heart.png" alt="H" />
                        <img src="https://wver.sprintstaticdata.com/v67/static/front/img/cards/diamond.png" alt="D" />
                      </span>
                      {renderExposure(redOption?.sid)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-12">
                <div className="casino-box-row">
                  <div className="casino-bl-box"><b>{(under7Option?.b1 || "0").toString().replace(".00", "")}</b></div>
                  <div className="casino-bl-box"><b>{(over7Option?.b1 || "0").toString().replace(".00", "")}</b></div>
                </div>
                <div className="casino-box-row">
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${under7Option?.b1 === "0.00" || under7Option?.b1 === 0 || isSuspended(under7Option?.gstatus) ? "suspended" : ""}`}
                      onClick={() => handleOddsClick(under7Option?.nat, under7Option?.b1, under7Option?.sid, true)}
                    >
                      <span className="casino-box-odd">Under 7</span>
                      {renderExposure(under7Option?.sid)}
                    </div>
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${over7Option?.b1 === "0.00" || over7Option?.b1 === 0 || isSuspended(over7Option?.gstatus) ? "suspended" : ""}`}
                      onClick={() => handleOddsClick(over7Option?.nat, over7Option?.b1, over7Option?.sid, true)}
                    >
                      <span className="casino-box-odd">Over 7</span>
                      {renderExposure(over7Option?.sid)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <div className="text-center w-100">
                <div className="casino-bl-box casino-cards-odds-title">
                  <div className="casino-bl-box-item">
                    <b>{cardOptions.length > 0 && isSuspended(getOddsBySid(cardOptions[0].sid)?.gstatus) ? "0" : "12"}</b>
                  </div>
                </div>
              </div>
              <div className="casino-cards text-center mt-1">
                {cardOptions.map((card) => {
                  const cardCode = card.nat.split(" ")[1] || card.nat;
                  const market = getOddsBySid(card.sid);
                  const odds = market ? market.b1 || market.rate || market.odds : "";
                  const suspended = market ? isSuspended(market.gstatus) : true;

                  return (
                    <div
                      className={`casino-card-item ${suspended ? "suspended" : ""}`}
                      key={card.sid}
                      onClick={() => !suspended && handleOddsClick(card.nat, odds || "12", card.sid, true)}
                    >
                      <div className="card-image">
                        <img src={getCardImage(cardCode)} alt={cardCode} />
                      </div>
                      {renderExposure(card.sid, { display: 'block' })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AAA2;
