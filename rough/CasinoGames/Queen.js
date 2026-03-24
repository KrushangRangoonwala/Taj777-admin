import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useIsMobile from "../../hooks/useIsMobile";
import CasinoVideo from "./components/CasinoVideo";
import { fetchCasinoExposureApi } from "../../api/api";
import "./kk.css";
import RemarkMarquee from "./components/RemarkMarquee";

const Queen = ({ isVisible, onBetSelection, exposureTrigger }) => {
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

  const VideoCards = () => {
    const t1 = gameData?.t1?.[0];
    if (!t1) return null;

    const rdesc = t1.rdesc || "";
    const allCards = rdesc.split(",").filter((c) => c && c !== "");

    const getCardValue = (card) => {
      if (!card || card === "1") return 0;
      // Rank is usually "2", "3", "4", "5", "6", "10", "Q", etc.
      // Slice off the last character (suit) unless it's a 10
      const rank = card.length === 3 ? card.slice(0, 2) : card.slice(0, 1);
      if (rank === "Q") return 0; // handled separately
      const val = parseInt(rank);
      return isNaN(val) ? 0 : val;
    };

    const getCardsForPosition = (pos) => {
      const cards = [];
      for (let i = 0; i < 4; i++) {
        const cardIndex = pos + i * 4;
        if (allCards[cardIndex] && allCards[cardIndex] !== "1") {
          cards.push(allCards[cardIndex]);
        }
      }
      return cards;
    };

    const rowData = [0, 1, 2, 3].map((pos) => {
      const cards = getCardsForPosition(pos);
      const sum = cards.reduce((s, c) => s + getCardValue(c), 0);
      const hasQueen = cards.some((c) => c.toUpperCase().startsWith("Q"));
      const calculatedTotal = sum + pos;
      return {
        pos,
        cards,
        hasQueen,
        calculatedTotal,
        // Win priority: Queen is highest, then highest calculated total
        winPriority: hasQueen ? 1000 : calculatedTotal,
      };
    });

    const maxPriority = Math.max(...rowData.map((r) => r.winPriority));

    return (
      <>
        {rowData.map((row) => {
          // Green if current row has the max win priority
          // Initially (all 0), Total 0 might be green as per user reference
          const isMax =
            row.winPriority === maxPriority &&
            (maxPriority > 0 || row.pos === 0);
          const labelColor = isMax ? "#22c55e" : "#fff";

          return (
            <div key={row.pos}>
              <div className="dealer-name w-100" style={{ color: labelColor, display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '2px', paddingRight: '2px' }}>
                <span>TOTAL {row.pos}:</span>
                <span style={{ color: "#ffc107" }}>
                  {row.hasQueen ? "Q" : row?.cards?.length > 0 ? row.calculatedTotal : "0"}
                </span>
              </div>
              <div className="w-100">
                {row.cards.map((card, idx) => (
                  <span key={idx}>
                    <img src={getCardImage(card)} alt={card} />
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </>
    );
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
      console.log("✅ Queen connected to socket:", socket.id);
      setIsConnected(true);
      socket.emit("Room", "queen");
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

    socket.on("queen", handleSocketData);
    socket.on("game", handleSocketData);
    socket.on("message", handleSocketData);

    return () => {
      socket.off("queen", handleSocketData);
      socket.off("game", handleSocketData);
      socket.off("message", handleSocketData);
      socket.disconnect();
    };
  }, []);

  const fetchExposure = async () => {
    if (!gameData.t1?.[0]?.mid) return;
    try {
      const response = await fetchCasinoExposureApi({
        markettype: "QUEEN",
        main_event_id: formatId(gameData.t1[0].mid),
        curPageName: "live_queen.php",
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
      <span className={`float-right ${exposure >= 0 ? "text-success" : "text-danger"}`}>
        {exposure}
      </span>
    );
  };

  const handleBet = (market, teamName, isBack = true) => {
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

  const renderBetBox = (nat, type = "back") => {
    const market = gameData.t2?.find((m) => m.nat === nat);

    const isSuspended =
      market &&
      (market.gstatus === "SUSPENDED" ||
        market.gstatus === "suspended" ||
        market.gstatus === 0 ||
        market.gstatus === "0");

    const odds = type === "back" ? market?.b1 : market?.l1;
    const isLocked =
      !market || odds === null || odds === undefined || odds === "";

    return (
      <div
        className={`${type} casino-bl-box-item ${isSuspended || isLocked ? "suspended" : ""
          }`}
        onClick={() =>
          !isLocked && !isSuspended && handleBet(market, nat, type === "back")
        }
      >
        <span className="casino-box-odd">
          {isLocked || isSuspended ? (
            <i className="fas fa-lock"></i>
          ) : (
            parseFloat(odds)
          )}
        </span>
      </div>
    );
  };


  return (
    <>
      <div className="casino-table casino-queen kk">
        <CasinoVideo
          gameName="Queen"
          roundId={formatId(gameData.t1?.[0]?.mid)}
          videoSrc="https://casino.diamondcricketid.com/swiftdizire/?id=3037"
          autotime={gameData.t1?.[0]?.autotime}
          totalTime={gameData.t1?.[0]?.ft} isCardDrawerOpen={isCardDrawerOpen}
          setIsCardDrawerOpen={setIsCardDrawerOpen}
          isRuleIcon={false}
          cards={(gameData?.t1?.[0]?.rdesc || "").split(",").filter((c) => c && c !== "")}
          CardsComponent={VideoCards}
          drawerHeight={isMobileView ? "160px" : "280px"}
          drawerStyle={{
            top: isMobileView ? "60px" : "20px",
            width: "auto",
            left: "0",
            transform: "none",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            zIndex: "2000",
          }}
        />

        <div className="casino-detail">
          <div className="container-fluid container-fluid-5">
            {!isMobileView ? (
              <div className="row d-none-small">
                {[0, 1, 2, 3].map((num) => {
                  const nat = `Total ${num}`;
                  const market = gameData.t2?.find((m) => m.nat === nat);
                  return (
                    <div key={num} className="col-3">
                      <div className="casino-box-row">
                        <div className="casino-nation-name">
                          <b>{nat}</b>
                        </div>
                        <div className="casino-bl-box">
                          {renderBetBox(nat, "back")}
                          {renderBetBox(nat, "lay")}
                        </div>
                        {market && renderExposure(market.sid)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="row row5 d-none-big">
                {[0, 1, 2, 3].map((num) => {
                  const nat = `Total ${num}`;
                  const market = gameData.t2?.find((m) => m.nat === nat);
                  return (
                    <div key={num} className="casino-bl-box kk-box">
                      <div className="casino-bl-box-item casino-odds-name">
                        <b>{nat}</b>
                        {market && renderExposure(market.sid)}
                      </div>
                      {renderBetBox(nat, "back")}
                      {renderBetBox(nat, "lay")}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* <div className="remark-container">
            <div className="remark-icon">
              <img
                src="https://wver.sprintstaticdata.com/v65/static/front/img/icons/remark.png"
                style={{ width: "20px", height: "20px" }}
              />
            </div>
            <marquee>
              {gameData.t1?.[0]?.ramark ||
                "This is 21 cards game 2,3,4,5,6 x 4 =20 and 1 Queen. Minimum total 10 or queen is required to win."}
            </marquee>
          </div> */}

          <RemarkMarquee message={gameData.t1?.[0]?.ramark ||
            "This is 21 cards game 2,3,4,5,6 x 4 =20 and 1 Queen. Minimum total 10 or queen is required to win."} />

          <div className="mt-2">
            {gameData?.t3 && gameData.t3.length > 0 && (
              <div
                className="d-flex flex-row overflow-auto pb-2"
                style={{ gap: "5px" }}
              >
                {gameData.t3.map((res, index) => (
                  <div key={index} className="result-circle">
                    {res.result || res.win}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Queen;
