import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useIsMobile from "../../hooks/useIsMobile";
import CasinoVideo from "./components/CasinoVideo";
import { fetchCasinoExposureApi } from "../../api/api";
import "./kk.css";

const RaceTo17 = ({ isVisible, onBetSelection, exposureTrigger }) => {
  const [gameData, setGameData] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
  const [exposureData, setExposureData] = useState([]);
  const isMobileView = useIsMobile();

  const socketRef = useRef(null);
  const formatId = (id) => {
    if (!id) return "";
    const strId = String(id);
    return strId.includes(".") ? strId.split(".")[1] : strId;
  };

  const getCardImage = (cardCode) => {
    if (!cardCode || cardCode === "1") return "/assets/cards_new/1.png";

    let formattedCode = cardCode.toUpperCase();
    if (formattedCode.length > 1) {
      const lastChar = formattedCode.slice(-1);
      const secondLastChar = formattedCode.slice(-2, -1);

      if (
        ["S", "H", "D", "C"].includes(lastChar) &&
        lastChar !== secondLastChar
      ) {
        formattedCode = formattedCode + lastChar;
      }
    }
    return `/assets/cards_new/${formattedCode}.png`;
  };

  const t1 = gameData?.t1?.[0];
  const allCards = [
    t1?.C1,
    t1?.C2,
    t1?.C3,
    t1?.C4,
    t1?.C5,
    t1?.C6,
    t1?.C7,
    t1?.C8,
    t1?.C9,
    t1?.C10,
    t1?.C11,
    t1?.C12,
  ].filter((c) => c !== undefined && c !== "");

  const VideoCards = () => {
    if (!t1) return null;

    const getRankValue = (card) => {
      if (!card || card === "1") return 0;
      const r = card.replace(/[SHDC]+$/i, "");
      if (r === "A") return 1;
      if (r === "10") return 0;
      if (r === "J") return 0;
      if (r === "Q") return 0;
      if (r === "K") return 0;
      return parseInt(r) || 0;
    };

    const total = allCards.reduce((sum, card) => sum + getRankValue(card), 0);

    return (
      <>
        <div className="race-total">Total: {total}</div>
        {allCards.map((card, idx) => (
          <div><span><img src={getCardImage(card)} alt={card} /></span></div>
        ))}
      </>
    )
  };

  useEffect(() => {
    const socket = io("https://trubet9.bet:2053", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ RaceTo17 connected to socket:", socket.id);
      setIsConnected(true);
      socket.emit("Room", "race17");
    });

    const handleSocketData = (data) => {
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      const gamePayload = parsedData?.data || parsedData;

      if (gamePayload) {
        setGameData((prev) => ({
          ...prev,
          ...gamePayload,
        }));
      }
    };

    socket.on("race17", handleSocketData);
    socket.on("game", handleSocketData);
    socket.on("message", handleSocketData);

    return () => {
      socket.off("race17", handleSocketData);
      socket.off("game", handleSocketData);
      socket.off("message", handleSocketData);
      socket.disconnect();
    };
  }, []);

  const fetchExposure = async () => {
    if (!gameData.t1?.[0]?.mid) return;
    try {
      const response = await fetchCasinoExposureApi({
        markettype: "RACE17",
        main_event_id: formatId(gameData.t1[0].mid),
        curPageName: "live_race17.php",
      });
      if (Array.isArray(response?.data)) {
        setExposureData(response.data);
      } else if (typeof response?.data === 'object' && response?.data !== null) {
        setExposureData(Object.values(response.data));
      } else {
        setExposureData([]);
      }
    } catch (error) {
      console.error("Error fetching exposure:", error);
    }
  };

  useEffect(() => {
    fetchExposure();
  }, [exposureTrigger, gameData.t1?.[0]?.mid]);

  const getExposure = (sid) => {
    if (!Array.isArray(exposureData)) return 0;
    const market = exposureData.find(
      (item) => String(item.market_id) === String(sid)
    );
    return market ? market.win_loss || market.total_exposure : 0;
  };

  const renderExposure = (sid) => {
    const exposure = getExposure(sid);
    if (exposure === 0) return null;
    return (
      <span className={`mr-1 ${exposure > 0 ? "book-green" : "book-red"}`}>
        {exposure}
      </span>
    );
  };

  const handleBet = (market, teamName, isBack = true) => {
    console.log("##@@ market", market);
    const globalStatus = gameData?.gstatus ?? gameData?.t1?.[0]?.gstatus;
    const isGlobalSuspended =
      globalStatus === "SUSPENDED" ||
      globalStatus === "suspended" ||
      globalStatus === 0 ||
      globalStatus === "0";
    if (isGlobalSuspended) return;

    if (
      !market ||
      market.gstatus === "SUSPENDED" ||
      market.gstatus === "suspended" ||
      market.gstatus === 0 ||
      market.gstatus === "0"
    ) {
      return;
    }

    if (onBetSelection) {
      onBetSelection({
        ...market,
        teamName,
        isBack,
        minBet: market.min || 100,
        maxBet: market.max || 100000,
        odds: isBack ? market.b1 : market.l1,
        marketId: market.sid,
        eventId: formatId(gameData.t1?.[0]?.mid),
      });
    }
  };

  const renderExposureByNat = (nat) => {
    const market = gameData.t2?.find((m) => m.nat.includes(nat));
    return market ? renderExposure(market.sid) : null;
  };

  const renderMarketBox = (nat, type) => {
    const market = gameData.t2?.find((m) => m.nat.includes(nat));
    const isSuspended =
      market &&
      (market.gstatus === "SUSPENDED" ||
        market.gstatus === "suspended" ||
        market.gstatus === 0 ||
        market.gstatus === "0");

    const odds = type === "back" ? market?.b1 : market?.l1;
    const isLocked = !market || !odds || odds === "0" || odds === "0.00" || odds === 0;
    // console.log("nat, odds, isLocked, isSuspended", nat, odds, isLocked, isSuspended)
    return (
      <div
        className={`${type} casino-bl-box-item ${isSuspended || isLocked ? "suspended" : ""}`}
        onClick={() => !isLocked && !isSuspended && handleBet(market, market?.nat, type === "back")}
      >
        <span className="casino-box-odd">
          {isLocked || isSuspended ? 0 : odds}
        </span>
      </div>
    );
  };

  return (
    <>


      <div className="casino-table raceto17">
        <CasinoVideo
          gameName="Race to 17"
          roundId={formatId(gameData?.t1?.[0]?.mid)}
          videoSrc="https://casino.diamondcricketid.com/swiftdizire/?id=3093"
          autotime={gameData?.t1?.[0]?.autotime}
          totalTime={gameData?.t1?.[0]?.ft}
          isCardDrawerOpen={isCardDrawerOpen}
          setIsCardDrawerOpen={setIsCardDrawerOpen}
          cards={allCards}
          CardsComponent={VideoCards}
        // drawerHeight={isMobileView ? "180px" : "300px"}
        // drawerStyle={{
        //   top: isMobileView ? "40px" : "20px",
        //   width: "auto",
        //   left: "0",
        //   transform: "none",
        //   display: "flex",
        //   alignItems: "flex-start",
        //   justifyContent: "flex-start",
        //   zIndex: "2000",
        //   overflow: "hidden",
        // }}
        />

        <div
          className="casino-detail"
          style={{ zIndex: '999', position: 'relative' }}  // by this, card window hides behind this div
        >
          {/* MOBILE VIEW */}
          <div className="row row5 d-none-big">
            {[
              { label: "Main Bet", nat: "Race to 17" },
              { label: "Big Card", nat: "Big Card" },
              { label: "Zero Card", nat: "Zero Card" },
              { label: "Any Zero Card", nat: "Any Zero" },
            ].map((item) => (
              <div key={item.label} className="casino-bl-box" style={{ paddingLeft: 0, paddingRight: 0, flexWrap: 'nowrap' }}>
                <div
                  className="casino-bl-box-item casino-odds-name"
                // style={{ alignItems: 'start' }} 
                >
                  <b>{item.label}</b>
                  <span className="float-right text-success">{renderExposureByNat(item.nat)}</span>
                </div>
                {renderMarketBox(item.nat, "back")}
                {renderMarketBox(item.nat, "lay")}
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW */}
          <div className="row row5 d-none-small">
            {[
              { nat: "Race to 17", label: "Race to 17" },
              { nat: "Big Card", label: "Big Card (7,8,9) - 3" },
              { nat: "Zero Card", label: "Zero Card - 3" },
              { nat: "Any Zero", label: "Any Zero" },
            ].map((item) => (
              <div key={item.nat} className="col-3">
                <div className="casino-box-row">
                  <div className="casino-nation-name">
                    <b>{item.label}</b>
                  </div>
                  <div className="casino-bl-box">
                    {renderMarketBox(item.nat, "back")}
                    {renderMarketBox(item.nat, "lay")}
                  </div>
                  <div className="casino-nation-name">{renderExposureByNat(item.nat)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default RaceTo17;
