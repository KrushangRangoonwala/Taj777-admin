import React, { useState, useEffect, useRef } from "react";
import { fetchCasinoExposureApi } from "../../api/api";
import { io } from "socket.io-client";
import "./kk.css";
import CasinoVideo from "./components/CasinoVideo";

const WorliMatka = ({ onBetSelection, lastBetTime, exposureTrigger }) => {
  const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
  const [gameData, setGameData] = useState(null);
  const [exposureData, setExposureData] = useState([]);
  const socketRef = useRef(null);
  const [activeTab, setActiveTab] = useState("Single");
  const [activeInlineBet, setActiveInlineBet] = useState([]);
  const [selectedSid, setSelectedSid] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const handleChange = (e) => {
      setIsMobile(e.matches);
    };

    // Set initial value
    setIsMobile(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);


  /* ================= EXPOSURE ================= */
  useEffect(() => {
    const fetchExposure = async () => {
      if (!gameData?.t1?.[0]?.mid) return;
      try {
        const response = await fetchCasinoExposureApi({
          markettype: "WORLI_MATKA",
          main_event_id:
            gameData?.t1?.[0]?.mid == 0
              ? 0
              : String(gameData?.t1?.[0]?.mid).includes(".")
                ? String(gameData.t1[0].mid).split(".")[1]
                : String(gameData.t1[0].mid),
          curPageName: "live_worli_matka.php",
        });
        if (Array.isArray(response?.data)) {
          setExposureData(response.data);
        }
      } catch (error) {
        console.error("Exposure error:", error);
      }
    };
    fetchExposure();
  }, [gameData?.t1?.[0]?.mid, lastBetTime, exposureTrigger]);

  const getExposure = (marketId) => {
    const market = exposureData.find(
      (item) => String(item.market_id) === String(marketId)
    );
    return market ? market.win_loss || market.total_exposure : 0;
  };

  const renderExposure = (marketId) => {
    const exposure = getExposure(marketId);
    if (!exposure) return null;
    return (
      <span style={{ marginLeft: 5, color: exposure >= 0 ? "green" : "red" }}>
        {exposure}
      </span>
    );
  };

  /* ================= SOCKET ================= */
  useEffect(() => {
    const socket = io("https://trubet9.bet:2053", {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("Room", "worli");
    });

    socket.on("game", (data) => {
      const targetData = Array.isArray(data) ? data[0] : data;
      if (targetData) setGameData(targetData);
      /* console.log("dataa1",targetData) */
    });

    return () => socket.disconnect();
  }, []);

  const getCardImage = (cardCode) => {
    if (!cardCode || cardCode === "1")
      return "https://wver.sprintstaticdata.com/v65/static/front/img/cards/1.png";
    return `https://wver.sprintstaticdata.com/v65/static/front/img/cards/${cardCode}.png`;
  };

  const currentGame = gameData?.t1?.[0];
  const worliMarkets = Array.isArray(gameData?.t2) ? gameData.t2 : [];

  const getMarket = (sid) =>
    worliMarkets.find((m) => String(m.sid) === String(sid));


  /* ================= BET CLICK ================= */
  const handleOddsClick = (teamName, odds, marketId, inlineSelections = null, tabName = null) => {
    const min = currentGame?.min || 100;
    const max = currentGame?.max || 25000;
    const fullMid = String(currentGame?.mid || "");
    const eventId = fullMid.includes(".")
      ? fullMid.split(".")[1]
      : fullMid;

      // ✅ If inline selections exist (desktop multi-select case)
    if (inlineSelections && tabName) {
      const sortedBets = [...inlineSelections].sort((a, b) => a.sid - b.sid);
      const oddsToPlace = calculateOdds(tabName, sortedBets);

      const digitsOnly = sortedBets
        .map((b) => {
          const match = b.teamName.match(/\d+/);
          return match ? Number(match[0]) : null;
        })
        .filter((v) => v !== null)
        .sort((a, b) => a - b)   // ✅ ascending order
        .join("");

      const finalTeamName = `${digitsOnly} ${tabName}`;

      console.log("finalTeamName",finalTeamName);

      onBetSelection?.({
          teamName: finalTeamName,
          odds: oddsToPlace,
          minBet: min,
          maxBet: max,
          isBack: true,
          marketId,
          eventId,
        });

        return;
      }

    onBetSelection?.({
      teamName,
      odds,
      minBet: min,
      maxBet: max,
      isBack: true,
      marketId,
      eventId,
    });
  };

  const isWorliSuspended = () => {
    if (!Array.isArray(worliMarkets)) return false;
    return worliMarkets.some(
      (m) => m?.gstatus === "SUSPENDED" || m?.gstatus === "0"
    );
  };


  /* ================= WORLI BOX ================= */

  const TAB_SELECTION_RULES = {
    Pana: { min: 3, max: 3 },
    Cycle: { min: 2, max: 2 },
    "Motor SP": { min: 4, max: 9 },
  };

  const handleInlineSelect = (teamName, sid, tab) => {
      setActiveInlineBet((prev) => {
        const tabRules = TAB_SELECTION_RULES[tab];
        const tabBets = prev.filter((b) => b.tab === tab);

        // Count how many times this odd is already selected
        const sameOddCount = tabBets.filter((b) => b.sid === sid).length;

        // Prevent selecting more than max times for a single odd
        if (tabRules && sameOddCount >= tabRules.max) return prev;

        // Add the selection
        return [...prev, { teamName, sid, tab }];
      });
    };



  const INLINE_TABS = ["Pana", "Cycle", "Motor SP"]; // add more if needed


  const renderWorliBox = (label, sid, teamSuffix = "", openMode = "MODAL") => {
    const market = getMarket(sid);
    const tabName = activeTab;
    const isSuspended =
      market?.gstatus === "SUSPENDED" || market?.gstatus === "0";

    const odds = WORLI_ODDS_MAP[sid] ?? 0;
    const teamName = `${label}${teamSuffix}`.trim();
    const selectionId = `${tabName}-${sid}-${label}`;

    const extraTextMap = {
      "LINE 1": "1|2|3|4|5",
      "LINE 2": "6|7|8|9|0",
      ODD: "1|3|5|7|9",
      EVEN: "2|4|6|8|0",
    };

     const isSelected =
      Array.isArray(activeInlineBet) &&
      activeInlineBet.some(
        (b) =>
          b.sid === sid &&
          b.tab === tabName &&
          parseInt(b.teamName) === parseInt(label)
      );

     const handleClick = () => {
        if (isSuspended) return;

        if (openMode !== "INLINE") {
          // ✅ Normal tabs (Single, SP, DP, etc.)
          setSelectedSid(teamName);
          handleOddsClick(teamName, odds, sid);
          return;
        }

        // INLINE mode tabs only
        if (isMobile) {
          handleInlineSelect(teamName, sid, tabName);
          return;
        }

        // ✅ Desktop INLINE multi-select logic
        setActiveInlineBet((prev) => {
          const tabRules = TAB_SELECTION_RULES[tabName];
          const tabSelections = prev.filter((b) => b.tab === tabName);

          const teamNameTrimmed = teamName;

          const exists = tabSelections.some(
            (b) =>
              b.sid === sid &&
              b.teamName === teamNameTrimmed
          );

          let updatedSelections;

          if (exists) {
            // ✅ Toggle remove
            updatedSelections = tabSelections.filter(
              (b) =>
                !(b.sid === sid && b.teamName === teamNameTrimmed)
            );
          } else {
            // ✅ Check max limit for total selections
            if (tabRules && tabSelections.length >= tabRules.max) {
              return prev; // 🚫 block if max reached
            }

            updatedSelections = [
              ...tabSelections,
              { teamName: teamNameTrimmed, sid, tab: tabName }
            ];
          }

          console.log("updatedSelections",updatedSelections);

          // 🔥 Only open popup if minimum requirement satisfied
          if (!tabRules || updatedSelections.length >= tabRules.min) {
            handleOddsClick(
              null,
              null,
              sid,
              updatedSelections,
              tabName
            );
          }

          return [
            ...prev.filter((b) => b.tab !== tabName),
            ...updatedSelections
          ];
        });
      };

    return (
      <div
        className={`worli-odd-box back ${isSelected ? "selected" : ""}`}
        onClick={handleClick}
        style={{ cursor: isSuspended ? "default" : "pointer", backgroundColor: selectedSid === teamName ? "#03b37f" : "", }}
      >
        <span className="worli-odd">{label}</span>
        {teamSuffix === " Single" && extraTextMap[label] && (
          <span className="d-block">{extraTextMap[label]}</span>
        )}

        {renderExposure(sid)}
      </div>
    );
  };

  const calculateOdds = (tab, bets) => {
      if (tab === "Pana") {
        const counts = {}; // count of each number
        bets.forEach(b => {
          const num = parseInt(b.teamName); // extract the number
          counts[num] = (counts[num] || 0) + 1;
        });

        const countValues = Object.values(counts);

        if (countValues.includes(3)) return 700; // Trio: same number selected 3 times
        if (countValues.includes(2)) return 240; // Double Pana: any number selected twice
        return 140; // Single Pana: all different numbers
      }

      if (tab === "Motor SP") {
        return 140; // default odds
      }

      // default: sum odds
      return bets.reduce((sum, bet) => sum + (WORLI_ODDS_MAP[bet.sid] ?? 0), 0);
    };



  const renderInlineCard = (tab) => {
    if (!INLINE_TABS.includes(tab)) return null;

    const rules = TAB_SELECTION_RULES[tab];
    const selectedBets = activeInlineBet.filter((b) => b.tab === tab);

    if (selectedBets.length === 0) return null;

    // 🔹 sort by 'sid' for display
    const sortedBets = [...selectedBets].sort((a, b) => a.sid - b.sid);

    const canPlaceBet = rules ? selectedBets.length >= rules.min : true;

    return (
      <div className="d-none-desktop card-clear-box">
        <div>
          {(() => {
            const sortedDigits = [...sortedBets].sort((a, b) => {
              const aNum = parseInt(a.teamName);
              const bNum = parseInt(b.teamName);
              return aNum - bNum;
            });

            const digitsOnly = sortedBets
              .map((b) => {
                const match = b.teamName.match(/\d+/);
                return match ? Number(match[0]) : null;
              })
              .filter((v) => v !== null)
              .sort((a, b) => a - b)   // ✅ ascending order
              .join("");

            return (
              <span className="mr-1">
                {digitsOnly} {tab}
              </span>
            );
          })()}
        </div>

        <div>
          <button
            className="btn btn-danger"
            onClick={() =>
              setActiveInlineBet((prev) =>
                prev.filter((b) => b.tab !== tab)
              )
            }
          >
            Clear
          </button>

          <button
            className="btn btn-success ml-1"
            disabled={!canPlaceBet}
            onClick={() => {
              const sortedBets = [...selectedBets].sort((a, b) => {
                const aNum = parseInt(a.teamName);
                const bNum = parseInt(b.teamName);
                return aNum - bNum;
              });

              const oddsToPlace = calculateOdds(tab, sortedBets);

              // 🔥 Extract digits only
              const digitsOnly = sortedBets
                .map((b) => {
                  const match = b.teamName.match(/\d+/);
                  return match ? Number(match[0]) : null;
                })
                .filter((v) => v !== null)
                .sort((a, b) => a - b)   // ✅ ascending order
                .join("");

              const finalTeamName = `${digitsOnly} ${tab}`;

              onBetSelection?.({
                teamName: finalTeamName,
                odds: oddsToPlace,
                marketId: sortedBets[0]?.sid,
                eventId: currentGame?.mid,
                minBet: currentGame?.min,
                maxBet: currentGame?.max,
                isBack: true,
              });

              // Clear only this tab selections after placing bet
              setActiveInlineBet((prev) =>
                prev.filter((b) => b.tab !== tab)
              );
            }}
          >
            Place Bet
          </button>
        </div>

        {/* Optional helper text */}
        {rules && selectedBets.length < rules.min && (
          <small className="text-muted d-block mt-1">
            Select minimum {rules.min} odds
          </small>
        )}
      </div>
    );
  };



  const communityCards = [
    currentGame?.C1,
    currentGame?.C2,
    currentGame?.C3,
  ];

  function VideoCards() {
    return (
      <>
        <div>
          {communityCards.map((card, idx) => (
            <span key={`community-${idx}`}>
              <img src={getCardImage(card)} alt="card" />
            </span>
          ))}
        </div>
      </>
    )
  }

  const WORLI_ODDS_MAP = {
    1: 9.5,    // Single
    2: 0,
    3: 140,   // SP
    4: 240,   // DP
    5: 700,   // TP
    6: 0,     // Trio
    7: 140,   // Cycle
    8: 140,
    9: 140,
    10: 140,
    11: 140,
    12: 240,
    13: 240,
  };


  const tabs = [
    "Single",
    "Pana",
    "SP",
    "DP",
    "Trio",
    "Cycle",
    "Motor SP",
    "56 Charts",
    "64 Charts",
    "ABR",
    "Common SP",
    "Common DP",
    "Color DP",
  ];

  // 1. Generate all 000-999 numbers
const generateAllPanas = () => {
  const result = [];

  for (let i = 0; i <= 999; i++) {
    const str = i.toString().padStart(3, "0");
    const digits = str.split("").map(Number);

    // Determine type
    const uniqueCount = new Set(digits).size;
    let type = "";
    if (uniqueCount === 3) type = "SP"; // Single Pana
    else if (uniqueCount === 2) type = "DP"; // Double Pana
    else type = "TP"; // Triple Pana

    result.push({ number: str, digits, type });
  }

  return result;
};

const allPanas = generateAllPanas();


    // 2. Filter based on user selection
const filterPanasBySelection = (tab, selectedDigits) => {
  if (!selectedDigits || selectedDigits.length === 0) return [];

  // Sort selection ascending
  const sortedSelection = [...selectedDigits].sort((a, b) => a - b);

  return allPanas.filter((pana) => {
    const digits = pana.digits;

    // Tab-specific type check
    if (tab === "SP" && pana.type !== "SP") return false;
    if (tab === "DP" && pana.type !== "DP") return false;
    if (tab === "TP" && pana.type !== "TP") return false;
    // For Pana tab, allow all types

    // Check if every selected digit is present in the number
    return sortedSelection.every((d) => digits.includes(d));
  });
};


   // 3. Extract digits from activeInlineBet
const selectedDigits = activeInlineBet
  .filter((b) => b.tab === activeTab)
  .map((b) => {
    // Strip non-digit characters from teamName (e.g., "1 Pana" => "1")
    const match = b.teamName.match(/\d/);
    return match ? Number(match[0]) : null;
  })
  .filter((v) => v !== null);

const totalPanas = filterPanasBySelection(activeTab, selectedDigits);



  const renderTabContent = (tab) => {
  switch (tab) {

    /* ================= SINGLE ================= */
    case "Single":
      return (
        <>
          {/* LEFT */}
          <div className="worli-left">
            <div className="worli-box-title"><b>9.5</b></div>

            <div className="worli-box-row">
              {[1, 2, 3, 4, 5].map((n) =>
                renderWorliBox(n, 1, " Single")
              )}
            </div>

            <div className="worli-box-row">
              {[6, 7, 8, 9, 0].map((n) =>
                renderWorliBox(n, 1, " Single")
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="worli-right">
            <div className="worli-box-title"><b>9.5</b></div>

            <div className="worli-box-row">
              {renderWorliBox("LINE 1", 1, " Single")}
              {renderWorliBox("ODD", 1, " Single")}
            </div>

            <div className="worli-box-row">
              {renderWorliBox("LINE 2", 1, " Single")}
              {renderWorliBox("EVEN", 1, " Single")}
            </div>
          </div>
        </>
      );

    /* ================= PANA ================= */
    case "Pana":
      return (
        <div className="worli-full">
          <div className="worli-box-title">
            <b>SP:140 | DP:240 | TP:700</b>
          </div>

          <div className="worli-box-row">
            {[1,2,3,4,5].map((n) =>
              renderWorliBox(n, 2, " Pana", "INLINE")
            )}
          </div>

          <div className="worli-box-row">
            {[6,7,8,9,0].map((n) =>
              renderWorliBox(n, 2, " Pana", "INLINE")
            )}
          </div>
        </div>
      );

    /* ================= SP ================= */
    case "SP":
      return (
        <>
          <div className="worli-box-title"><b>140</b></div>

          <div className="worli-left">
            <div className="worli-box-row">
              {[1,2,3,4,5].map((n) =>
                renderWorliBox(n, 3, " SP")
              )}
            </div>

            <div className="worli-box-row">
              {[6,7,8,9,0].map((n) =>
                renderWorliBox(n, 3, " SP")
              )}
            </div>
          </div>

          <div className="worli-right">
            <div className="worli-box-row">
              {renderWorliBox("SP ALL", 3, " SP")}
            </div>
          </div>
        </>
      );

    /* ================= DP ================= */
    case "DP":
      return (
        <>
          <div className="worli-box-title"><b>240</b></div>

          <div className="worli-left">
            <div className="worli-box-row">
              {[1,2,3,4,5].map((n) =>
                renderWorliBox(n, 4, " DP")
              )}
            </div>

            <div className="worli-box-row">
              {[6,7,8,9,0].map((n) =>
                renderWorliBox(n, 4, " DP")
              )}
            </div>
          </div>

          <div className="worli-right">
            <div className="worli-box-row">
              {renderWorliBox("DP ALL", 4, " DP")}
            </div>
          </div>
        </>
      );

    /* ================= TRIO ================= */
    case "Trio":
      return (
        <div className="worli-full">
          <div className="worli-box-title"><b>700</b></div>
          <div className="worli-box-row">
            {renderWorliBox("ALL TRIO", 5, " Trio")}
          </div>
        </div>
      );

    /* ================= CYCLE ================= */
    case "Cycle":
      return (
        <div className="worli-full">
          <div className="worli-box-row">
            {[1,2,3,4,5,6,7,8,9,0].map((n) =>
              renderWorliBox(n, 7, " Cycle", "INLINE")
            )}
          </div>
        </div>
      );

    case "Motor SP":
      return (
        <div className="worli-full">
          <div className="worli-box-title"><b>140</b></div>

          <div className="worli-box-row">
            {[1,2,3,4,5].map((n) =>
              renderWorliBox(n, 8, " Motor SP", "INLINE")
            )}
          </div>

          <div className="worli-box-row">
            {[6,7,8,9,0].map((n) =>
              renderWorliBox(n, 8, " Motor SP", "INLINE")
            )}
          </div>
        </div>
      );

    case "56 Charts":
      return (
        <>
          <div className="worli-box-title"><b>140</b></div>

          <div className="worli-left">
            <div className="worli-box-row">
              {[1,2,3,4,5].map((n) =>
                renderWorliBox(n, 9, " 56 Charts")
              )}
            </div>

            <div className="worli-box-row">
              {[6,7,8,9,0].map((n) =>
                renderWorliBox(n, 9, " 56 Charts")
              )}
            </div>
          </div>

          <div className="worli-right">
            <div className="worli-box-row">
              {renderWorliBox("56 ALL", 9, " 56 Charts")}
            </div>
          </div>
        </>
      );

    case "64 Charts":
      return (
        <>
          <div className="worli-box-title"><b>140</b></div>

          <div className="worli-left">
            <div className="worli-box-row">
              {[1,2,3,4,5].map((n) =>
                renderWorliBox(n, 10, " 64 Charts")
              )}
            </div>

            <div className="worli-box-row">
              {[6,7,8,9,0].map((n) =>
                renderWorliBox(n, 10, " 64 Charts")
              )}
            </div>
          </div>

          <div className="worli-right">
            <div className="worli-box-row">
              {renderWorliBox("64 ALL", 10, " 64 Charts")}
            </div>
          </div>
        </>
      );

    case "ABR":
      return (
        <>
          <div className="worli-box-title"><b>140</b></div>

          <div className="worli-left">
            <div className="worli-box-row">
              {["A","B","R"].map((v) =>
                renderWorliBox(v, 11, " ABR")
              )}
            </div>

            <div className="worli-box-row">
              {["AB","AR","BR"].map((v) =>
                renderWorliBox(v, 11, " ABR")
              )}
            </div>
          </div>

          <div className="worli-right">
            <div className="worli-box-row">
              {renderWorliBox("ABR", 11, " ABR")}
            </div>
            <div className="worli-box-row">
              {renderWorliBox("ABR CUT", 11, " ABR")}
            </div>
          </div>
        </>
      );

    case "Common SP":
      return (
        <div className="worli-full">
          <div className="worli-box-title"><b>140</b></div>

          <div className="worli-box-row">
            {[1,2,3,4,5].map((n) =>
              renderWorliBox(n, 3, " Common SP")
            )}
          </div>

          <div className="worli-box-row">
            {[6,7,8,9,0].map((n) =>
              renderWorliBox(n, 3, " Common SP")
            )}
          </div>
        </div>
      );

    case "Common DP":
      return (
        <div className="worli-full">
          <div className="worli-box-title"><b>240</b></div>

          <div className="worli-box-row">
            {[1,2,3,4,5].map((n) =>
              renderWorliBox(n, 12, " Common DP")
            )}
          </div>

          <div className="worli-box-row">
            {[6,7,8,9,0].map((n) =>
              renderWorliBox(n, 12, " Common DP")
            )}
          </div>
        </div>
      );

    case "Color DP":
      return (
        <>
          <div className="worli-box-title"><b>240</b></div>

          <div className="worli-left">
            <div className="worli-box-row">
              {[1,2,3,4,5].map((n) =>
                renderWorliBox(n, 13, " Color DP")
              )}
            </div>

            <div className="worli-box-row">
              {[6,7,8,9,0].map((n) =>
                renderWorliBox(n, 13, " Color DP")
              )}
            </div>
          </div>

          <div className="worli-right">
            <div className="worli-box-row">
              {renderWorliBox("COLOR DP ALL", 13, " Color DP")}
            </div>
          </div>
        </>
      );



    /* ================= DEFAULT ================= */
    default:
      return <div className="text-muted p-3">Coming soon</div>;
  }
};





  /* ================= UI ================= */
  return (
    <>
      <style jsx>{`
      @media only screen and (min-width: 1280px) and (max-width: 1599px) {
        .casino-video-cards.open {
          height: 250px !important;
          width: 140px !important;
        }
      }
        .casino-video-cards.open .casino-video-cards-container {
          padding: 8px 5px !important;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .casino-video-cards.open .player-block {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .casino-video-cards.open .dealer-name {
          font-size: 10px;
          font-weight: bold;
          color: #fff;
          text-transform: uppercase;
          margin-bottom: 3px;
          letter-spacing: 0.5px;
        }
        .casino-video-cards.open .cards-row {
          display: flex;
          justify-content: center;
          gap: 3px;
        }
        .casino-video-cards.open img {
          width: 32px !important;
          height: 45px !important;
          border-radius: 2px;
        }
        .casino-video-cards.closed {
          height: 250px !important;
        }
      `}</style>
      <div className="casino-table worli kk">
        <CasinoVideo
          gameName="Worli Matka"
          roundId={currentGame?.mid}
          videoSrc="/mediaplayer/worli_matka/95bba40e-0623-4fe3-a007-0b71f467e211"
          isCardDrawerOpen={isCardDrawerOpen}
          setIsCardDrawerOpen={setIsCardDrawerOpen}
          autotime={currentGame?.autotime}
          totalTime={currentGame?.ft}CardsComponent={VideoCards}
          isRuleIcon={false}
          cards={communityCards}
        />

        <div className="casino-detail">
          <div className="casino-tabs">
            <ul className="nav nav-tabs">
              {tabs.map((tab) => (
                <li key={tab} className="nav-item">
                  <a
                    href=""
                    className={`nav-link ${activeTab === tab ? "active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault(); // 🚫 stop page jump
                      setActiveTab(tab);
                      setActiveInlineBet([]);
                      setSelectedSid(null);
                    }}
                  >
                    {tab}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="casino-box tab-content">
            {tabs.map((tab) => (
              <div
                key={tab}
                className={`tab-pane ${tab == "56 Charts" ? "charts-56" : ""} ${tab == "64 Charts" ? "charts-64" : ""} ${activeTab === tab ? "active" : ""} ${tab
                  .toLowerCase()
                  .replace(/\s/g, "-")}`}
              >
                {/* Worli Box - left and right sections */}
                <div className={`worlibox ${isWorliSuspended() ? "suspended" : ""}`}>
                  {renderTabContent(tab)}
                </div>

                {renderInlineCard(tab)}

              </div>
            ))}
          </div>
        </div>
      </div>

      <style>
        {`

          .casino-tabs .nav-tabs .nav-item .nav-link:hover, .casino-tabs .nav-tabs .nav-item .nav-link:focus {
              opacity: 1;
              background-color: #444;
          }

          @media only screen and (min-width: 1280px) and (max-width: 1599px) {
              .worli .casino-video-cards {
                  height: 70px;
              }
          }

          .worli-left {
            width: calc(60% - 2px);
            margin-right: 4px;
            display: flex;
            flex-wrap: wrap;
          }

          .worli-right {
              width: calc(40% - 2px);
              display: flex;
              flex-wrap: wrap;
          }

          .worli-full {
              width: 100%;
              display: flex;
              flex-wrap: wrap;
          }

          .sp .worli-right .worli-odd-box, .dp .worli-right .worli-odd-box, .charts-56 .worli-right .worli-odd-box, .charts-64 .worli-right .worli-odd-box, .color-dp .worli-right .worli-odd-box {
              height: 142px;
              width: 100%;
          }

          .trio .worli-full .worli-odd-box {
              width: 100%;
          }

          .abr .worli-left .worli-odd-box {
              width: calc(33.33% - 2px);
          }

          .abr .worli-right .worli-odd-box {
              width: 100%;
          }

          .worli .casino-tabs .nav-tabs .nav-item .nav-link {
              padding: 6px;
              background-color: #444;
              color: #ddd;
          }

          .worli .casino-tabs .nav-tabs .nav-item .nav-link .active {
              border-bottom: 0;
              color: var(--text-highlight);
          }

          .worli-odd-box.back.selected {
              background-color: var(--bg-success);
          }

          @media only screen and (min-width: 320px) and (max-width: 767px) {
            .d-none-small {
              display: none !important;
            }

            .report-box {
              padding: 0;
            }

            .report-name {
              margin-bottom: 8px;
              font-size: 16px;
              font-weight: bold;
            }

            .report-row {
              padding: 4px 8px;
            }

            .report-form {
              padding: 4px;
            }

            .report-title {
              display: block;
              padding: 4px 4px 0;
            }

            .report-title input {
              width: 100%;
            }

            .report-page-count {
              margin-top: 4px;
              margin-bottom: 4px;
              padding: 0 4px;
              flex-wrap: wrap;
              position: relative;
            }

            .report-page-count .form-group {
              margin-bottom: 4px;
            }

            .report-page-count > div {
              margin-top: 4px;
            }

            .report-page-count .custom-control-inline h6 {
              font-size: var(--font-small);
            }

            .report-page-count .file-icons {
              position: absolute;
              right: 0;
              top: 0;
            }

            .loading-box {
              width: 280px;
            }

            .game-header {
              padding: 6px;
              line-height: 1;
            }

            .detail-page-container .market-2,
            .detail-page-container .market-3,
            .detail-page-container .market-4,
            .detail-page-container .market-5,
            .detail-page-container .market-6,
            .detail-page-container .market-9,
            .detail-page-container .market-10,
            .detail-page-container .market-11,
            .detail-page-container .market-12,
            .detail-page-container .market-13,
            .detail-page-container .market-14 {
              min-width: calc(100% - 6px);
            }

            .detail-page-container .market-4.width-75,
            .detail-page-container .market-2.width-25,
            .detail-page-container .market-12.width-75,
            .detail-page-container .market-13.width-75,
            .detail-page-container .market-14.width-75 {
              min-width: calc(100% - 6px);
            }

            .login-footer .footer-box {
              width: 100%;
            }

            .casino-small-icon {
              width: 32%;
              margin-right: 1% !important;
            }

            .casino-small-icon img {
              height: 56px;
            }

            .casino-small-icon:nth-child(3n) {
              margin-right: 0 !important;
            }

            .casino-video-cards span img {
              width: 22px;
              margin-right: 5px;
            }

            .teenpattitest .casino-video-cards span img {
              width: 25px;
            }

            .teenpattitest .casino-video-cards-container .dealer-name {
              font-size: var(--font-11);
              line-height: 12px;
            }

            .teenpattitest .casino-video-cards {
              height: 170px;
              width: 110px;
              top: 40px;
            }

            .lucky7 .casino-video-cards {
              width: 45px;
              height: 45px;
            }

            .casino-video-cards .card-close {
              height: 30px;
              width: 19px;
            }

            .base-timer {
              height: 60px;
              width: 60px;
            }

            .base-timer__label {
              height: 60px;
              width: 60px;
              font-size: 30px;
            }

            .base-timer__label > span {
              min-width: 12px;
            }

            .casino-bl-box-item span {
              font-size: var(--font-small);
              width: auto;
            }

            .poker20 .casino-bl-box-item.casino-odds-name span {
              font-size: 10px;
            }

            .teenpattiopen .casino-box-header .casino-bl-box-item span {
              width: auto;
              display: inline-block;
            }

            .casino-bl-box-item .casino-box-odd {
              font-size: var(--font-caption);
            }

            .player-card {
              width: auto;
              margin-left: 2px;
            }

            .player-card span {
              width: auto;
            }

            .player-card img {
              width: 20px;
            }

            .poker6player .pattern .poker6box .casino-nation-name b {
              font-size: var(--font-11);
            }

            .casino-col-container {
              width: 49%;
              margin-right: 1%;
            }

            .casino-col-container:nth-child(2n) {
              margin-right: 0;
            }

            .casino-col-container:nth-child(3n) {
              margin-right: 1%;
            }

            .poker6player .pattern .casino-col-container {
              width: 32.66%;
              margin-right: 1%;
            }

            .poker6player .pattern .casino-col-container.fullbox {
              width: 32.66% !important;
            }

            .poker6player .pattern .casino-col-container:nth-child(2n) {
              margin-right: 1%;
            }

            .poker6player .pattern .casino-col-container:nth-child(3n) {
              margin-right: 0;
            }

            .poker-result-board img {
              height: 25px;
            }

            .casino-video-cards span {
              line-height: 16px;
            }

            .lucky7 .casino-detail .casino-box.low-high-box,
            .lucky7 .casino-detail .casino-box.sidebets-box,
            .lucky7 .casino-detail .casino-box.cards-box {
              width: 100%;
              margin-right: 0;
              margin-bottom: 10px;
            }

            .lucky7 .casino-detail .casino-box .low-odds,
            .lucky7 .casino-detail .casino-box .high-odds {
              width: 40%;
            }

            .lucky7-card {
              width: 20%;
            }

            .lucky7 .casino-detail .cards-top {
              width: 100%;
            }

            .casino-card-item .card-image img {
              height: auto;
            }

            .lucky7 .casino-detail .casino-box .low-odds {
              border-radius: 0;
            }

            .lucky7 .casino-detail .casino-box .high-odds {
              border-radius: 0;
            }

            .low-odds.suspended::after {
              border-radius: 0;
            }

            .high-odds.suspended::after {
              border-radius: 0;
            }

            .logo-login img {
              width: 150px;
            }

            .new-laucnh-icon {
              top: -6px;
            }

            .new-laucnh-icon img {
              height: 45px;
            }

            .carousel-control-next,
            .carousel-control-prev {
              width: 42px;
              height: 42px;
            }

            .footer {
              justify-content: space-between;
            }

            .footer-top {
              margin-top: 0;
              padding-bottom: 10px;
            }

            .footer-logo {
              max-width: 100%;
              flex: auto;
            }

            .footer-logo img {
              max-height: 30px;
            }

            .footer .footer-social {
              flex: auto;
              display: flex;
              position: relative;
              top: unset;
              transform: unset;
              justify-content: center;
              align-items: center;
              right: unset;
              margin-top: 0;
            }

            .footer .support > div:first-child b {
              font-size: 18px;
            }

            .footer-menu {
              margin-top: 0;
            }

            .footer-box {
              width: 100%;
              margin: 0 auto;
            }

            .footer-top .secure-logo > div:last-child {
              text-align: left;
            }

            .total-soda {
              float: unset;
            }

            .banner .game-header {
              top: 10px;
              font-size: var(--font-v-small);
            }

            .scorecard {
              font-size: var(--font-v-small);
            }

            .scorecard-header {
              font-size: var(--font-v-small);
            }

            .ball-runs {
              height: 22px;
              line-height: 22px;
              width: 22px;
              font-size: 9px;
            }

            .broser-block-text {
              margin-left: 0;
              margin-top: 30px;
              line-height: 1;
            }

            .teenpatti20 .casino-nation-name {
              width: calc(100% - 78%);
            }

            .teenpatti20 .casino-bl-box-item {
              width: calc(50% - 3px);
            }

            .teenpatti20 .odds-min-max {
              width: calc(100% - 3px);
            }

            .casino-detail .casino-box-header .casino-bl-box-item {
              display: block;
              height: auto !important;
            }

            .teenpattiopen .casino-nation-name {
              width: calc(100% - 75%);
              display: flex;
              flex-wrap: wrap;
              background-color: transparent;
              padding: 0 4px;
            }

            .teenpattiopen .casino-nation-name > div {
              border-bottom: 1px solid var(--bg-tabs);
              padding-bottom: 5px;
            }

            .teenpattiopen .casino-nation-name b {
              line-height: 16px;
              display: block;
              width: 100%;
            }

            .teenpattiopen .casino-nation-name img {
              height: 25px;
            }

            .teenpattiopen .casino-bl-box {
              width: 75%;
            }

            .teenpattiopen .casino-bl-box-item {
              width: calc(33.33% - 4px);
            }

            .teenpattiopen .teenopenother .casino-bl-box-item {
              height: 70px;
            }

            .teenpattiopen .teenopenother .casino-bl-box-item .casino-box-odd {
              height: auto;
            }

            .teenpattiopen .odds-min-max {
              width: 32%;
            }

            .teenpattiopen .casino-min-max {
              white-space: normal;
              line-height: 1.2;
              word-break: break-all;
            }

            .statistics {
              width: 100%;
            }

            .baccarat .baccarat-bets-odds {
              width: 100%;
              margin-top: 6px;
            }

            .open-statistics {
              color: var(--bg-success);
              cursor: pointer;
            }

            .statistics-content {
              display: none;
            }

            .baccarat .statistics-title {
              margin-bottom: 0;
            }

            .baccarat .baccarat-odds {
              padding: 15px 5px 0;
              margin-bottom: 0;
            }

            .baccarat .baccarat-odd-block .baccarat-odd-name {
              line-height: 14px;
            }

            .baccarat .baccarat-odd-block {
              margin-right: 4px;
            }

            .baccarat .baccarat-bets {
              padding: 0 5px;
              margin-top: 30px;
              height: 110px;
            }

            .baccarat .baccarat-bets-name {
              height: 100%;
              font-size: var(--font-v-small);
              padding-left: 0;
            }

            .baccarat .player .baccarat-bets-name {
              border-top-left-radius: 6px;
              border-bottom-left-radius: 6px;
              padding-left: 5px;
            }

            .baccarat .banker .baccarat-bets-name {
              border-top-right-radius: 6px;
              border-bottom-right-radius: 6px;
              padding-right: 5px;
            }

            .baccarat .player-pair .baccarat-bets-name {
              border-radius: 4px 0 0 4px;
            }

            .baccarat .banker-pair .baccarat-bets-name {
              border-radius: 0 4px 4px 0;
            }

            .baccarat .player-pair {
              margin-right: 2px;
              width: 15%;
              height: 60px;
            }

            .baccarat .player,
            .baccarat .banker {
              width: 35%;
              height: 90px;
            }

            .baccarat .tie {
              height: 90px;
              width: 90px;
              top: 0;
            }

            .baccarat .banker-pair {
              margin-right: 2px;
              width: 15%;
              height: 60px;
            }

            .baccarat .baccarat-bets-name div {
              line-height: 14px !important;
              margin-bottom: 2px !important;
            }

            .baccarat .player img,
            .baccarat .banker img {
              height: 30px;
            }

            .baccarat .player span,
            .baccarat .banker span {
              margin-left: 3px;
            }

            .l-rotate,
            .r-rotate {
              width: 20px;
            }

            .casino-result-cards-item .l-rotate,
            .casino-result-cards-item .r-rotate {
              width: 40px;
            }

            .baccarat .baccarat-min-max {
              padding-bottom: 6px;
              padding-right: 10px;
              font-size: 10px;
            }

            .casino-video-title {
              padding: 5px;
              left: 0;
              top: 0;
              min-width: unset;
            }

            .casino-video-title .casino-name {
              font-size: var(--font-small);
              line-height: 12px;
            }

            .casino-video-cards {
              top: 80px;
              transform: unset;
              width: 95px;
              padding: 5px 10px 5px 5px;
              height: 75px;
            }

            .teenpatti1day .casino-video-cards.no-video {
              width: 135px;
              height: 105px;
            }

            .teenpatti1day .casino-video-cards.no-video span img {
              width: 33px;
            }

            .baccarat .casino-detail .book-red,
            .baccarat .casino-detail .book-green {
              font-size: 8.5px;
            }

            .poker1day .casino-detail {
              align-items: flex-start;
            }

            .poker1day .playerabox,
            .poker1day .playerbbox {
              width: 35%;
            }

            .poker1day .playerabcardbox {
              width: 30%;
              border-radius: 4px;
              flex-direction: column;
              height: 190px;
            }

            .poker1day .playerafabcy,
            .poker1day .playerbfabcy {
              padding: 2px;
              min-height: 105px;
            }

            .poker1day .casino-nation-name {
              width: 100%;
            }

            .poker1day .casino-bl-box-item {
              width: calc(50% - 3px);
            }

            .poker1day .playerabcardbox .poker-icon img {
              width: 80px;
            }

            .poker1day .playerabcardbox img {
              width: 32px;
            }

            .poker1day .dealer-name {
              font-size: var(--font-small);
            }

            .poker1day .playerabcardbox .col-12 {
              text-align: center !important;
            }

            .poker1day .casino-bl-box-item .casino-box-odd {
              font-size: var(--font-11);
              height: auto;
            }

            .poker1day .poker1dayother .casino-bl-box-item {
              height: 60px;
            }

            .poker1day .poker1dayother .casino-bl-box-item .book-green,
            .poker1day .poker1dayother .casino-bl-box-item .book-red {
              font-size: 9px;
            }

            .teenpattiopen .casino-video-cards {
              height: 70px;
            }

            .casino-cards-shuffle {
              font-size: 22px;
              right: 2px;
            }

            .casino-video-cards-container .dealer-name {
              font-size: var(--font-caption);
            }

            .casino-video-right-icons {
              flex-direction: column;
            }

            .casino-video-lr-icon {
              display: none;
            }

            .casino-video .casino-video-last-results {
              display: none;
            }

            .casino-video-lr-icon,
            .casino-video-home-icon,
            .casino-video-rules-icon {
              height: 25px;
              width: 25px;
              margin-right: 0;
              margin-bottom: 5px;
            }

            .casino-video-home-icon.net-icon i {
              font-size: 13px;
            }

            .casino-video-lr-icon i,
            .casino-video-home-icon i,
            .casino-video-rules-icon i {
              font-size: var(--font-body);
            }

            .casino-video-right-icons {
              right: 3px;
            }

            .teenpatti20 .casino-bl-box-item {
              width: calc(33.33% - 3px);
            }

            .casino-bl-box-title .casino-bl-box-item {
              width: calc(33.33% - 3px);
              height: 18px !important;
              text-transform: uppercase;
              font-size: var(--font-small);
            }

            .teenpatti20 .casino-rb-box {
              padding: 0;
            }

            .casino-odds-name {
              color: #ddd;
              text-transform: uppercase;
              font-weight: bold;
              flex-direction: row;
              justify-content: space-between;
              background-color: #444;
              padding: 0 4px 0 4px;
              border-radius: 0;
              margin-right: 0;
              height: 36px !important;
              position: relative;
            }

            .casino-odds-name i {
              color: #eee;
              font-size: var(--font-body);
            }

            .casino-odds-name img {
              height: 25px;
              max-height: 25px;
              margin-left: 3px;
              width: 25px;
            }

            .casino-bl-box {
              margin-bottom: 4px;
            }

            .teenpatti20 .casino-rb-box {
              width: calc(33.33% - 3px);
              margin-right: 3px;
            }

            .teenpatti20 .casino-rb-box:last-child {
              margin-right: 0;
            }

            .teenpatti20 .casino-rb-box-player > div {
              padding: 0 2px;
            }

            .casino-bl-box-item .casino-box-odd,
            .casino-rb-box-player .casino-box-odd {
              font-size: var(--font-13);
            }

            .teenpatti20 .casino-rb-box-player {
              text-align: center;
              flex-wrap: wrap;
            }

            .casino-video-last-results {
              position: relative;
              top: 0;
              background-color: transparent;
              justify-content: center;
              width: 100%;
              right: 0;
              padding: 0;
              margin-top: 4px;
              height: auto;
              margin-left: 0;
            }

            .casino-video-last-results span {
              height: 30px;
              width: 30px;
              line-height: 30px;
              margin-right: 2px;
              margin-left: 0;
              background-color: #000;
              box-shadow: 0 0 2px #646464;
            }

            .casino-video-last-results a.result-more {
              width: 30px;
              height: 30px;
              margin-left: 0;
              line-height: 25px;
              margin-right: 0;
              margin-bottom: 0;
              background-color: #000;
              box-shadow: 0 0 2px #646464;
            }

            .header-top {
              display: none;
            }

            .sidebar-left ~ .main-container {
              padding-top: 5px;
            }

            .header {
              top: 50px;
            }

            .teenpattiopen .casino-detail .casino-box-header .casino-bl-box-item {
              height: auto !important;
              display: flex;
              justify-content: center;
              flex-direction: row;
              position: relative;
            }

            .casino-result-cards-item .winner-icon {
              height: auto;
            }

            .casino-result-cards-item img {
              width: 25px;
              margin-bottom: 5px;
            }

            .ab4-result .abj-title {
              font-size: 14px;
            }

            .ab2-result.ab4-result .casino-result-cards-item img {
              width: 25px !important;
            }

            .ab2-result.ab4-result .casino-result-cards-item {
              text-align: center;
            }

            .card32result .casino-result-cards-item img {
              width: 20px;
            }

            .card32result .casino-result-cards-item .winner-icon {
              height: auto;
              width: 40px;
              position: absolute;
              right: 0;
              top: 0;
            }

            .ab4-result .hooper-navigation button {
              padding: 0px;
            }

            .card32result .casino-result .bet-nation {
              width: 200px;
            }

            .casino-result .bet-rate {
              width: 70px;
            }

            .casino-result .bet-amount {
              width: 80px;
            }

            .casino-result .bet-date {
              width: 140px;
            }

            .casino-result .bet-ip {
              width: 100px;
            }

            .casino-result .bet-remark {
              width: 120px;
            }

            .player-pair .suspended:after {
              border-radius: 4px 0 0 4px;
            }

            .banker-pair .suspended:after {
              border-radius: 0 4px 4px 0;
            }

            .player .suspended:after {
              border-radius: 4px 0 0 4px;
            }

            .tie .suspended:after {
              border-radius: 50%;
            }

            .banker .suspended:after {
              border-radius: 0 4px 4px 0;
            }

            .teenpatti1day .casino-bl-box {
              width: 100%;
            }

            .teenpatti1day .casino-bl-box-item {
              width: calc(33.33% - 3px);
              font-size: 11px;
            }

            .teen1daycasino-container .casino-box-row {
              width: 100%;
            }

            .teenpatti1day .teen1dayother .casino-nation-name {
              width: 100%;
            }

            .teenpatti1day .teen1dayother .casino-bl-box {
              width: 16.66%;
            }

            .teen1dayodev .casino-bl-box-item {
              height: 40px;
            }

            .teenpatti1day .casino-bl-box-title .casino-bl-box-item:first-child {
              flex-direction: row;
              justify-content: space-between;
              position: relative;
            }

            .teenpatti1day .casino-card-img img {
              height: 18px;
              margin-left: 0;
            }

            .poker1day .casino-bl-box {
              width: 100%;
            }

            .poker1dayother {
              width: 100%;
            }

            .poker1day .casino-bl-box-title .casino-bl-box-item:first-child {
              flex-direction: row;
              justify-content: space-between;
              position: relative;
            }

            .teenpattitest .casino-bl-box {
              width: 100%;
            }

            .teenpattitest .casino-bl-box-item {
              width: calc(25% - 3px);
              position: relative;
            }

            .teenpattitest .casino-bl-box-item.casino-odds-name {
              padding: 0 0 0 2px;
            }

            .teenpattitest .casino-bl-box-item.casino-odds-name span {
              text-align: left;
              font-size: 10px;
              max-width: calc(100% - 25px);
            }

            .teenpattitest .casino-bl-box-item.casino-odds-name .fa-info-circle {
              position: absolute;
              right: 0;
              top: 50%;
              transform: translateY(-50%);
            }

            .login-wrapper {
              padding-bottom: 30px;
            }

            .login-wrapper .footer-menu {
              position: absolute;
            }

            .login-form {
              min-height: unset;
            }

            .modal-body {
              max-height: calc(100vh - 146px);
            }

            .place-modal .modal-body {
              padding: 0;
            }

            .cards-top .cards-top-box {
              height: 80px;
            }

            .detail-page-container .banner.scorestats iframe {
              width: 95%;
            }

            .login-footer {
              height: auto;
            }

            .footer-top > diV {
              width: 100%;
              text-align: center;
              margin-top: 10px;
            }

            .payments img {
              max-height: 25px;
              max-width: 80px;
              margin-right: 0;
              margin-bottom: 10px;
            }

            .footer-menu ul {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
            }

            .casino-container {
              min-height: unset;
            }

            .center-container .detail-page-container,
            .center-container .home-container,
            .center-container .casino-container,
            .center-container.casino-list-container {
              min-height: unset;
            }

            .center-container.casino-list-container {
              /* margin-top: 60px; */
            }

            .home-container .home-casiono-icons {
              margin-top: 5px;
              padding: 5px 0;
              padding-bottom: 0;
              color: var(--text-table-header-new);
              flex-wrap: wrap;
            }

            .home-container .home-casiono-icons h4 {
              font-size: 16px;
              background-color: var(--bg-table-header-new);
              color: var(--text-table-header-new);
              width: 100%;
              padding: 5px;
              margin-bottom: 0;
              font-weight: bold;
            }

            .home-container .home-casiono-icons h4 span {
              animation: new-launch 1s linear infinite;
            }

            @keyframes new-launch {
              50% {
                opacity: 0;
              }
            }

            .home-container .home-casiono-icons .home-casino-icon-item {
              margin-right: 5px;
              width: calc(50% - 2.5px);
              margin-bottom: 0;
              padding: 0;
            }

            .poker1day .casino-video-cards {
              width: 150px;
              height: 65px;
            }

            .poker20 .casino-video-cards {
              width: 162px;
              height: 140px;
            }

            .poker1day .casino-video-cards span img,
            .poker20 .casino-video-cards span img {
              width: 22px;
            }

            .poker1day .casino-video-cards-container .dealer-name,
            .poker20 .casino-video-cards-container .dealer-name {
              font-size: 10px;
            }

            .cards32a .casino-video-cards,
            .cards32b .casino-video-cards {
              width: 115px;
              height: 140px;
            }

            .cards32a .casino-video-cards span,
            .cards32b .casino-video-cards span {
              line-height: unset;
            }

            .cards32a .casino-video-cards span img,
            .cards32b .casino-video-cards span img {
              width: 15px;
            }

            .cards32a .casino-video-cards-container > div,
            .cards32b .casino-video-cards-container > div {
              margin-bottom: 0;
            }

            .cards32a .casino-video-cards-container .dealer-name,
            .cards32b .casino-video-cards-container .dealer-name {
              font-size: 10px;
              line-height: 10px;
              margin-bottom: 0 !important;
              justify-content: flex-start;
            }

            .cards32b .cards32bextra .casino-bl-box .casino-bl-box-item {
              width: calc(20% - 4px);
            }

            .bet-types-container {
              width: 100%;
              display: block;
            }

            .custom-control-label {
              line-height: unset;
            }

            .dt1day .teen1dayleft,
            .dt1day .teen1dayright,
            .dt20 .teen1dayleft,
            .dt20 .teen1dayright {
              width: 100%;
            }

            .dt1day .teen1daycenter {
              display: none;
            }

            .dt1day .casino-bl-box-title .casino-bl-box-item {
              width: calc(50% - 2px);
            }

            .dt1day .teen1dayother .casino-nation-name {
              width: 32%;
            }

            .dt1day .teen1dayother .casino-bl-box {
              width: 17%;
            }

            .dt1day .casino-card-img img {
              width: 30px;
            }

            .dt1day .casino-video-cards,
            .dt20 .casino-video-cards {
              width: 70px;
              height: 40px;
            }

            .dt1day .teen1dayother {
              margin-top: 0;
            }

            .dt1day .dragonfancy,
            .dt1day .tigerfancy {
              width: 35%;
            }

            .dt1day .pairfancy {
              width: 28%;
            }

            .dt1day .dt1dayfancy .casino-nation-name,
            .dt1day .dt1dayfancy .casino-bl-box {
              width: 100%;
            }

            .dt20 .dragon-box,
            .dt20 .tiger-box {
              width: 50%;
            }

            .dt20 .tiebox {
              left: 50%;
              height: 70px;
              width: 70px;
              top: 15px;
            }

            .dt20 .tiebox > div:first-child {
              font-size: 18px;
              margin-bottom: 3px;
              line-height: 1;
            }

            .dt20 .tiebox > div:last-child {
              line-height: 1;
            }

            .dt20 .dragon-box b,
            .dt20 .tiger-box b {
              font-size: var(--font-small);
            }

            .dt20 .dragon-box {
              padding-right: 35px;
            }

            .dt20 .tiger-box {
              padding-left: 35px;
            }

            .dt20 .pair-box {
              width: 100%;
              margin-left: 0;
              margin-top: 10px;
            }

            .dt20 .casino-bl-box-item {
              height: 48px;
            }

            .dt20 .casino-card-img img {
              width: 16px;
              height: auto;
            }

            .dt20 .dt20mainbet .teen1dayleft,
            .dt20 .dt20mainbet .teen1dayright {
              width: 100%;
            }

            .dt20 .dt20mainbet .teen1daycenter {
              display: none;
            }

            .dtl20 .casino-video-cards {
              height: 60px;
              width: 135px;
            }

            .dtl20 .casino-video-cards span img {
              width: 35px;
            }

            .dtl20 .casino-nation-name {
              width: 50%;
            }

            .dtl20 .casino-bl-box {
              width: calc(50% - 4px);
            }

            .dtl20 .casino-card-img img {
              margin-left: 0;
              width: 25px;
            }

            .dtl20 .casino-tabs {
              height: 36px;
              background-color: #444;
              margin-bottom: 10px;
              justify-content: flex-start;
              border-radius: 0;
              width: 100%;
            }

            .dtl20 .casino-tabs .nav-tabs .nav-link {
              color: #ddd;
              opacity: 1;
            }

            .dtl20 .casino-tabs .nav-tabs .nav-link.active {
              color: #fff;
              font-weight: bold;
            }

            .dtl20 .casino-tabs ul {
              width: 100%;
            }

            .dtl20 .nav-tabs .nav-item {
              flex: 1 1 0;
            }

            .dtl20 .casino-tabs .nav-tabs {
              margin: 0;
            }

            .dtl20 .dtl20info {
              width: 50%;
            }

            .poker6player .casino-video-cards span img {
              width: 16px;
            }

            .poker6player .casino-video-cards {
              height: 35px;
              width: 120px;
            }

            .poker6result .casino-result-content-item {
              width: 100%;
            }

            .poker6result .casino-result-content-diveder {
              display: none;
            }

            .teenpatti2 .teen1dayleft,
            .teenpatti2 .teen1dayright {
              width: 100%;
            }

            .teenpatti2 .teen2uo .casino-nation-name,
            .teenpatti2 .teen2uo .casino-bl-box {
              width: 50%;
              margin-right: 0;
              padding-left: 5px;
            }

            .teenpatti2 .teen2uo .teen1dayleft,
            .teenpatti2 .teen2uo .teen1dayright {
              margin-top: 0;
            }

            .aaa .casino-video-cards {
              height: 40px;
              width: 42px;
            }

            .aaa .casino-bl-box-item {
              width: calc(25% - 2px);
            }

            .aaa .casino-bl-box-item.casino-odds-name {
              width: calc(50% - 2px);
              font-size: 10px;
            }

            .aaa .casino-bl-box-item.casino-odds-name > span.book-green,
            .aaa .casino-bl-box-item.casino-odds-name > span.book-red {
              width: 100%;
              text-align: left;
              display: block;
            }

            .dtl20-result .casino-result-cards-item .winner-icon {
              position: absolute;
              right: 0;
              bottom: 0;
            }

            .casino-war .casino-tabs {
              height: 36px;
              background-color: #444;
              margin-bottom: 10px;
              justify-content: flex-start;
              border-radius: 0;
              width: 100%;
            }

            .casino-war .casino-tabs .nav-tabs .nav-link {
              color: #ddd;
              opacity: 1;
            }

            .casino-war .casino-tabs .nav-tabs .nav-link.active {
              color: #fff;
            }

            .casino-war .casino-tabs .nav-tabs {
              width: 100%;
              margin: 0;
            }

            .casino-war .nav-tabs .nav-item {
              flex: 1 1 0;
            }

            .casino-war .teen1daycasino-container {
              width: 100%;
            }

            .casino-war .casino-war-container.casino-war-cards .casino-bl-box {
              width: 16.66%;
            }

            .casino-war .casino-war-container .casino-nation-name {
              width: 50%;
            }

            .casino-war .casino-war-container .casino-bl-box {
              width: 50%;
            }

            .casino-war .casino-war-container .casino-card-img img {
              width: 18px;
            }

            .casino-war .casino-war-container.casino-war-cards .casino-card-img img {
              width: 28px;
            }

            .casino-war .casino-video-cards {
              height: 40px;
              width: 40px;
            }

            /*Worli*/
            .worli .casino-video-cards {
              height: 40px;
            }

            .worli .casino-tabs {
                height: auto;
                padding: 0;
                border-radius: 0;
            }

            .worli .casino-tabs .nav-tabs .nav-item .nav-link {
                font-size: 12px;
            }

            .worli-left,
            .worli-right {
              width: 100%;
              margin: 0;
            }

            .worli-full {
                width: 100%;
                display: flex;
                flex-wrap: wrap;
            }

            .worli-odd-box {
              height: 60px;
            }

            .worli-odd-box .worli-odd {
              font-size: 30px;
              height: 30px;
            }

            .worli-odd-box.back.selected {
                background-color: var(--bg-success);
            }

            .worli-box-title {
              margin-bottom: 0;
              margin-top: 10px;
            }

            .56-charts .worli-right .worli-box-row .worli-odd-box {
                height: 142px;
                width: 100%;
            }

            .sp .worli-right .worli-odd-box,
            .dp .worli-right .worli-odd-box,
            .charts-56 .worli-right .worli-odd-box,
            .charts-64 .worli-right .worli-odd-box,
            .color-dp .worli-right .worli-odd-box {
              height: 60px;
              margin-top: 10px;
              width: 100%;
            }

            .abr .worli-right {
              margin-top: 10px;
            }

            .abr .worli-left .worli-odd-box {
                width: calc(33.33% - 2px);
            }
                
            .abr .worli-right .worli-odd-box {
                width: 100%;
            }

            .worli-cards-block {
              width: calc(25% - 9px);
              font-size: var(--font-caption);
              padding: 10px 5px;
              margin-right: 10px !important;
            }

            .worli-cards-block:nth-child(4n) {
              margin-right: 0 !important;
            }

            .card-clear-box {
              display: flex;
              justify-content: space-between;
              padding: 5px 14px;
              align-items: center;
              flex-wrap: wrap;
              background-color: #444;
              color: #ddd;
              font-weight: bold;
              font-size: var(--font-body);
              margin-top: 10px;
              border-radius: 0;
          }

            .trio .worli-full .worli-odd-box {
                width: 100%;
            }

            .cmeter-card-box {
              border-radius: 8px;
            }

            .cmeter .teen1dayleft,
            .cmeter .teen1dayright {
              width: 100%;
              margin-bottom: 10px;
              padding: 2px 10px;
            }

            .cmeter-card-low,
            .cmeter-card-high {
              margin-top: 0;
            }

            .cmeter .casino-card-item .card-image img {
              width: 35px;
            }

            .cmeter-card-low > div,
            .cmeter-card-high > div {
              width: 100%;
              text-align: center;
              margin: 0;
            }

            .cmeter-card-box img {
              width: 20px;
              margin-right: 3px;
            }

            .cmeter .teen1dayleft > div:first-child,
            .cmeter .teen1dayright > div:first-child {
              min-height: unset;
            }

            .casino-queen .casino-video-cards {
              height: 140px;
              width: 75px;
            }

            .casino-queen .casino-video-cards-container .dealer-name {
              height: 14px;
            }

            .casino-queen .casino-video-cards-container > div {
              margin-bottom: 0;
            }

            .casino-queen .casino-video-cards-container .dealer-name {
              font-size: 10px;
              justify-content: flex-start;
              margin-bottom: 0 !important;
            }

            .casino-queen .casino-video-cards span img {
              width: 13px;
            }

            .casino-queen .casino-nation-name,
            .casino-queen .casino-bl-box {
              width: 100%;
            }

            .casino-queen .casino-bl-box-item.casino-odds-name {
              width: calc(50% - 2px);
              font-size: 10px;
            }

            .casino-queen .casino-bl-box-item {
              width: calc(25% - 2px);
            }

            .five-cricket .casino-video-cards {
              height: 170px;
              width: auto;
              top: 0;
              margin-top: 0;
              z-index: 1;
            }

            .five-cricket .casino-video .video-box-container {
              max-width: 100%;
            }

            .five-cricket .casino-video-cards span img {
              width: 16px;
            }

            .five-cricket-nation,
            .five-cricket-date {
              font-size: var(--font-small);
              top: 10%;
            }

            .detail-page-container.five-cricket .banner {
              height: auto;
            }

            .detail-page-container.five-cricket .banner .scorecard {
              position: relative;
              margin: 10px 0;
              padding: 0 5px;
            }

            .detail-page-container.five-cricket .banner .scorecard .scorecard-row {
              padding: 2px;
            }

            .threecardj-title {
              width: 100%;
              height: auto;
              justify-content: space-between;
              flex-direction: row;
              padding: 5px;
            }

            .threecardj-cards {
              width: 100%;
            }

            .threecardj-bl-box {
              height: auto;
              align-items: flex-start;
              width: 100%;
            }

            .threecardj-cards .casino-cards {
              flex-wrap: nowrap;
              overflow-x: hidden;
            }

            .threecardj-cards .casino-card-item .card-image img {
              height: auto;
              width: 42px;
              margin: 0 auto;
            }

            .threecardj-cards .casino-min-max {
              font-size: 11px;
            }

            .threecardj-cards .owl-carousel {
              width: 90%;
              margin: 0 auto;
            }

            .threecardj-cards .casino-card-item {
              margin-bottom: 0;
            }

            .threecardj-cards .casino-card-item .card-image {
              display: block;
            }

            .threecardj-cards .casino-card-item {
              border: 0;
            }

            .threecardj-cards .casino-card-item.selected {
              border: 0;
            }

            .threecardj-cards .casino-card-item img {
              border: 2px solid transparent;
            }

            .threecardj-cards .casino-card-item img.selected {
              border: 2px solid var(--bg-success);
            }

            .threecardj-cards .owl-carousel .owl-nav button.owl-next,
            .threecardj-cards .owl-carousel .owl-nav button.owl-prev {
              position: absolute;
              top: 0;
              height: 100%;
              font-size: 30px;
              width: 20px;
              margin: 0;
            }

            .threecardj-cards .owl-carousel .owl-nav button.owl-prev {
              left: -20px;
            }

            .threecardj-cards .owl-carousel .owl-nav button.owl-next {
              right: -20px;
            }

            .threecardj .suspended:after {
              z-index: 100;
            }

            .cricket20 .score-box {
              margin-top: 15px;
              margin-bottom: 35px;
            }

            .cricket20 .casino-remark {
              margin: 0;
            }

            .cricket20 .teen20left,
            .cricket20 .teen20right {
              width: 100%;
            }

            .cricket20 .ball-icon {
              top: -15px;
            }

            .cricket20 .ball-icon img {
              height: 40px;
            }

            .cricket20 .blbox {
              width: 95px;
            }

            .cricket20 .casino-video-cards {
              width: 60px;
              height: 75px;
            }

            .cricket20 .casino-video-cards-container .dealer-name {
              font-size: 10px;
            }

            .cricket20 .casino-video-cards-container > div:last-child {
              justify-content: center;
            }

            .cricket20 .casino-video-cards span img {
              width: 30px;
            }

            .race20 .casino-video-cards {
              width: 142px;
              height: 105px;
            }

            .race20 .casino-video-cards span:first-child img {
              width: 20px;
            }

            .race20 .casino-video-cards span img {
              width: 12px;
            }

            .race20 .casino-bl-box-item {
              width: calc(30.33% - 3px);
            }

            .race20 .casino-bl-box-item.casino-odds-name {
              width: calc(40% - 3px);
            }

            .race20 .casino-bl-box-item.casino-odds-name {
              font-weight: normal;
            }

            .race20 .casino-bl-box-title {
              height: 30px;
            }

            .race20 .casino-bl-box-title .casino-odds-name {
              height: 30px !important;
            }

            .race20 .casino-bl-box-title .casino-bl-box-item.casino-odds-name {
              background: transparent;
            }

            .race20 .casino-odds-name {
              height: 40px !important;
            }

            .race20 .casino-odds-name img {
              width: 20px;
              height: auto;
              max-height: unset;
            }

            .race20 .casino-bl-box-item > div {
              line-height: 14px;
            }

            .race20 .casino-nation-name:last-child {
              line-height: 14px;
            }

            .race20 .win-with .casino-nation-name {
              font-size: 11px;
            }

            .race20 .win-with .fa-info-circle {
              font-size: var(--font-small);
            }

            .race20 .total-points {
              margin: 0;
              justify-content: space-between;
            }

            .race20 .total-points > div {
              padding: 2px 10px;
            }

            .andar-bahar .casino-video .owl-carousel .owl-nav button.owl-next {
              left: -15px;
            }

            .andar-bahar .casino-detail .owl-carousel .owl-nav button.owl-prev {
              left: 0;
            }

            .andar-bahar .casino-video .owl-carousel .owl-nav button.owl-prev {
              right: -15px;
            }

            .andar-bahar .casino-detail .owl-carousel .owl-nav button.owl-next {
              right: 0;
            }

            .andar-bahar .casino-video-cards span img {
              height: auto;
              width: 20px;
            }

            .andar-bahar .casino-video-cards {
              height: 80px;
              width: 140px;
            }

            .andar-bahar .casino-video-cards .next-count {
              font-size: 10px;
            }

            .andar-bahar2 .teen20left,
            .andar-bahar2 .teen20right {
              width: 100%;
            }

            .andar-bahar2 .teen20right {
              padding-top: 25px;
            }

            .ab-title {
              width: 20%;
              position: relative;
            }

            .ab-title .ab-info {
              position: absolute;
              width: 100%;
              top: 0;
              text-align: right;
            }

            .ab-title .ab-info .icon-range {
              font-family: "Noto Sans";
            }

            .ab-title.bahar-title {
              border-right: 0;
            }

            .ab-cards {
              width: 80%;
            }

            .ab-bg {
              padding: 5px;
            }

            .andar-cards-box {
              margin-bottom: 5px;
            }

            .andar-cards-box,
            .bahar-cards-box {
              width: 100%;
            }

            .andar-bahar .casino-cards > div {
              display: flex;
              width: auto;
              flex-direction: column;
              justify-content: center;
            }

            .ab-result {
              max-width: 90%;
              margin: 0 auto;
              position: relative;
              text-align: center;
            }

            .ab-result.owl-theme .owl-nav {
              margin: 0;
            }

            .ab-result.owl-carousel .owl-nav button.owl-next,
            .ab-result.owl-carousel .owl-nav button.owl-prev {
              position: absolute;
              top: 0;
              margin: 0;
              height: 100%;
              width: 30px;
              font-size: 30px;
            }

            .ab-result.owl-carousel .owl-nav button.owl-next {
              right: -20px;
            }

            .ab-result.owl-carousel .owl-nav button.owl-prev {
              left: -20px;
            }

            .ab-result .casino-result-cards-item img {
              margin-bottom: 0;
            }

            .home-modal-title h4 {
              font-size: 18px;
            }

            .home-modal .modal-content {
              max-width: 300px;
              margin: 0 auto;
              max-height: 100vh;
            }

            .home-modal .modal-body {
              max-height: calc(100vh - 30px);
            }

            .home-modal .close-home-modal {
              top: -10px;
              right: -10px;
            }

            .cricket20videobanner {
              height: 90px;
              padding: 6px;
              width: 70%;
              font-size: 16px;
            }

            .cricket20bannertitle {
              top: -15px;
              padding: 5px;
              border-radius: 10px 10px 0 0;
              font-size: 14px;
            }

            .cricket20balls {
              bottom: -15px;
            }

            .cricket20balls img {
              width: 19px;
              margin-right: 5px;
            }

            .cricket20ballpopup img {
              width: 80px;
            }

            .cricket20 .casino-video-right-icons {
              right: 85px;
              flex-direction: row;
            }

            .cricket20 .casino-video-lr-icon,
            .cricket20 .casino-video-home-icon,
            .cricket20 .casino-video-rules-icon {
              margin-right: 5px;
            }

            .cricket20books {
              right: 5px;
              top: 5px;
            }

            .cricket20books > div {
              line-height: 14px;
            }

            .cricket20 .casino-timer {
              right: unset;
              left: 5px;
              bottom: 15px;
            }

            .cricket20 .casino-timer .base-timer {
              height: 50px;
              width: 50px;
            }

            .cricket20 .casino-timer .base-timer__label {
              font-size: 20px;
              height: 50px;
              width: 50px;
            }

            .cricket20 .casino-video-last-results {
              top: unset;
              right: unset;
              width: 100%;
              height: auto;
            }

            .andar-bahar2 .sa-sb-box {
              margin-bottom: 5px;
            }

            .casino-card-item {
              min-width: 50px;
              min-width: 70px;
            }

            .casino-card-item .card-image img {
              width: 35px;
            }

            .lottery .casino-detail .lottery-left {
              width: 100%;
              margin-top: 10px;
            }

            .lottery-bet-buttons > div {
              height: 50px;
              width: 50px;
              font-size: 10px;
            }

            .lottery-bet-buttons > div img {
              width: 40px;
            }

            .lottery .casino-detail .lottery-right {
              width: 100%;
              margin-top: 10px;
            }

            .lottery-box {
              width: 100%;
            }

            .lottery .single .lottery-box {
              width: 100%;
            }

            .lottery .single .lottery-box .lottery-card {
              width: 20%;
            }

            .lottery .lottery-place-balls {
              width: 100% !important;
            }

            .lottery-box .lottery-card img {
              width: 45px;
            }

            .lottery .single .lottery-place-balls img {
              width: 50px;
            }

            .lottery .double .lottery-place-balls,
            .lottery .tripple .lottery-place-balls {
              width: 100%;
            }

            .random-bets button {
              min-width: 40px;
              height: 40px;
              padding: 0;
              margin-right: 3px;
              border-radius: 4px;
              font-size: 16px;
            }

            .random-bets h4 {
              font-size: 16px;
            }

            .lottery .casino-video-cards {
              height: 40px;
            }

            .lottery-result-icon {
              height: 28px;
              width: 28px;
              line-height: 28px;
            }

            .fullwidthcasino-container .casino-container,
            .fullwidthdetail-container .casino-container {
              width: 100%;
              margin: 0;
            }

            .lottery .suspended:after {
              font-size: 32px;
            }

            .lottery-rules-title-name {
              width: 30%;
            }

            .lottery-rules-cards {
              width: 70%;
            }

            .lottery-rules-cards .lottery-card img {
              width: 30px;
            }

            .animate-text {
              font-size: 13px;
              height: 42px;
              padding: 10px;
            }

            /*Home New*/
            .home-new .casino-banners-list .casino-banner-item,
            .home-new .casino-banners-list.live-casinos .casino-banner-item,
            .home-new .casino-banners-list.fantasy-games .casino-banner-item {
              width: calc(50% - 4px);
              margin-right: 5px;
              margin-bottom: 5px;
            }

            .home-new .casino-banners-list .casino-banner-item:nth-child(2n),
            .home-new .casino-banners-list.live-casinos .casino-banner-item:nth-child(2n),
            .home-new
              .casino-banners-list.fantasy-games
              .casino-banner-item:nth-child(2n) {
              margin-right: 0 !important;
            }

            .home-new
              .casino-banners-list.live-casinos
              .casino-banner-item:nth-child(3n) {
              margin-right: 5px !important;
            }

            .home-new
              .casino-banners-list.live-casinos
              .casino-banner-item:nth-child(6n) {
              margin-right: 0 !important;
            }

            .sport-list-item {
              width: calc(25% - 4px);
              margin-right: 5px;
              margin-bottom: 5px;
            }

            .sport-list-item:nth-child(4n) {
              margin-right: 0;
            }

            .home-new .sport-list-title {
              font-size: 16px;
              margin-top: 10px;
            }

            .home-new .footer {
              display: block;
              padding: 8px 0;
              padding-bottom: 60px;
            }

            .home-new-logo img {
              max-height: 22px;
            }

            .home-new .navbar {
              display: none;
            }

            .home-new-header-bottom {
              justify-content: flex-end;
            }

            .home-new-header-bottom > div {
              text-align: right;
            }

            .home-new-header-bottom > div a,
            .home-new-header-bottom > div button {
              display: inline-block;
            }

            .home-new-header-bottom > div a {
              padding: 0 !important;
              font-size: 11px;
            }

            .home-new-header-bottom > div a i {
              margin-right: 5px !important;
            }

            .home-new-header-bottom > div button {
              margin-left: 5px !important;
            }

            /* .home-new-header-bottom .btn {
            min-width: unset;
            border-radius: 0;
            height: auto;
            line-height: 15px;
            background-color: transparent;
            color: var(--btn-primary);
            border: 0;
            font-size: 12px;
            font-weight: bold;
            padding: 0 5px;
            margin: 0 !important;
            width: auto;
          } */
            .home-new-header-bottom .btn.register-btn {
              display: block;
            }

            .home-new-logo {
              display: inline-block;
            }

            .home-new-header {
              padding-top: 10px;
              padding-bottom: 10px;
            }

            .home-new .upcoming-fixure {
              margin-top: 49px;
              height: 42px;
              flex: auto;
              width: 100%;
              margin: 5px auto 0px;
              max-width: 100%;
            }

            .home-new .fixure-title::after {
              width: 42px;
              height: 42px;
              border-top: 21px solid transparent;
              border-left: 21px solid var(--bg-table-header-new);
              border-bottom: 21px solid transparent;
              right: -42px;
            }

            .home-new .fixure-box-container {
              height: 42px;
            }

            .home-new .carousel img {
              height: auto;
            }

            .login-mobile-menu {
              display: none;
              position: fixed;
              height: 100%;
              width: 100%;
              z-index: 1100;
              overflow: auto;
              background-color: var(--bg-sidebar);
              padding: 20px;
            }

            .login-mobile-menu a {
              color: var(--text-sidebar);
              padding: 10px;
            }

            .home-new .casino-banners-list,
            .all-sports-list,
            .top-winners-list-container {
              margin-top: 0 !important;
              padding-top: 0;
              padding-bottom: 0;
            }

            .home-new .footer .footer-link {
              margin-top: 15px;
              text-align: center;
            }

            .home-new .payments {
              margin-top: 15px;
              text-align: center;
            }

            .home-new .payments ul {
              display: flex;
              justify-content: center;
              flex-wrap: wrap;
            }

            .home-new .footer h4 {
              margin-bottom: 5px;
            }

            .home-new .footer .gt {
              margin-top: 15px;
              text-align: center;
            }

            .home-new .footer .footer-social {
              margin-top: 0;
              text-align: center;
            }

            .home-new .footer .img-logo {
              width: 170px;
            }

            .modal-login-new .modal-body label {
              font-size: 12px;
              margin-bottom: 0;
            }

            .center-main-content .upcoming-fixure {
              width: calc(100% - 20px);
              flex: unset;
              margin: 5px auto 10px;
              display: none;
            }

            .fantasy-desc-container .btn {
              min-width: 100%;
            }

            .fantasy-desc-container .casino-tabs .nav-tabs .nav-link {
              font-size: 10px;
              padding: 15px 0;
            }

            .modal-body .main-rules-container {
              max-height: calc(100vh - 230px);
            }

            .modal-body .main-rules-container .menu-box {
              margin-top: 0;
            }

            .lottery .single,
            .lottery .double,
            .lottery .tripple {
              height: auto;
            }

            .andar-bahar .ab-slider,
            .andar-bahar2 .ab-slider {
              width: 75%;
            }

            .ab2-result .ab-slider {
              width: 85%;
            }

            .race20 .casino-bl-box .icon-range,
            .race20 .casino-nation-name .icon-range {
              top: 45px;
            }

            .security-auth .verify-code {
              padding-left: 20px;
              font-size: 36px;
              letter-spacing: 20px;
            }

            .security-auth .casino-report-tabs .nav-tabs .nav-link {
              font-size: 10px;
            }

            .security-auth .secure-password .form-control {
              margin-bottom: 10px;
            }

            .mybetsmodal .casino-place-bet-header > div,
            .mybetsmodal .casino-place-bet-row > div {
              width: 33%;
              padding-right: 10px;
            }

            .mybetsmodal .casino-place-bet-header > div:nth-child(2n),
            .mybetsmodal .casino-place-bet-header > div:nth-child(3n),
            .mybetsmodal .casino-place-bet-row > div:nth-child(2n),
            .mybetsmodal .casino-place-bet-row > div:nth-child(3n) {
              text-align: right;
            }

            .cards32b .casino-nation-name {
              font-size: 10px;
            }

            .casino-place-bet-info .bet-input,
            .input-stake {
              width: 140px;
            }

            input.input-stake::-webkit-outer-spin-button,
            input.input-stake::-webkit-inner-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }

            input.input-stake[type="number"] {
              -moz-appearance: textfield;
            }

            .user-dropdown {
              max-height: calc(100vh - 55px);
              overflow: auto;
            }

            .animate-on .user-dropdown {
              max-height: calc(100vh - 105px);
            }

            .home-new-header-bottom .login-box:last-child {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
            }

            /* .home-new-header-bottom .login-box:last-child .btn-primary {
            background: transparent;
            border: 0;
            right: 0;
            bottom: -20px;
            color: var(--text-green);
            text-decoration: underline;
            font-weight: bold;
            text-transform: capitalize;
            font-size: 12px;
          } */
            .register-btn {
              /* right: 100px !important; */
            }

            .home-new-header-bottom .download-apk {
              position: absolute;
              right: 12px;
              bottom: -12px;
            }

            .error-page {
              padding: 20px;
            }

            .error-page h2 {
              font-size: 20px;
            }

            .change-theme {
              left: 115px;
              width: auto;
              font-size: 12px;
            }

            .casino-banner-item .slot-title {
              font-size: 12px;
              line-height: 1;
            }

            .casino-detail .book-red,
            .casino-detail .book-green {
              font-size: 11px;
            }

            .casino-cards-odds-title {
              font-size: var(--font-body);
            }

            .faq-container .col-md-6 {
              border: 0;
            }

            .faq-container .faq-question-box {
              position: relative;
            }

            .faq-container .faq-question-box:after {
              position: absolute;
              content: "";
              left: 50%;
              top: 100%;
              background-color: var(--text-table);
              height: 1px;
              width: 70%;
              transform: translateX(-50%);
            }

            .l-rotate img,
            .r-rotate img {
              margin-right: 0;
            }

            .error-page h1 {
              font-size: 22px;
            }

            .race-result-box img {
              width: 30px;
            }

            .race-result-box .video-winner-text {
              right: 25px;
            }

            .race-result-box .result-image.k-image {
              right: -20px;
            }

            :root[data-theme="light"] .casino-table.race20 .total-points .text-playerb {
              color: var(--text-black);
            }

            .casino-queen .casino-bl-box-item {
              height: 36px;
            }

            .modal-open .modal {
              padding-right: 0 !important;
            }

            body.modal-open {
              padding-right: 0 !important;
            }

            .animated-header {
              height: 34px;
            }

            .animate-on .sidebar-left ~ .main-container {
              margin-top: 34px;
            }

            .animate-on .header {
              top: 34px;
            }

            .animated-header .fa-times {
              right: 10px;
            }

            .header {
              top: 0;
            }

            .animate-on .sidebar-left {
              top: 0;
            }

            .animate-on .modal {
              top: 106px;
            }

            .pasa-box {
              width: 50%;
            }

            .pasa .casino-bl-box-item {
              height: 50px;
            }

            .pasa-box .casino-bl-box {
              margin-bottom: -10px;
            }

            .pasa .casino-video-title {
              background-color: rgba(0, 0, 0, 0.6);
              min-width: unset;
            }

            .pasa .casino-video-title .casino-name {
              font-size: 12px;
            }

            .pasa .casino-video-rid {
              font-size: 10px;
            }

            .pasa .casino-video .video-box-container {
              max-width: 100%;
            }

            .pasa .casino-video-cards {
              height: 45px;
              top: 50%;
              transform: translateY(-50%);
              width: 105px;
            }

            .pasa .pasa-other-bets {
              justify-content: center;
            }

            .pasa .pasa-other-bet {
              width: 31%;
              margin-right: 2%;
            }

            .pasa .casino-nation-name {
              line-height: 1;
            }

            .super-over .casino-video-cards {
              height: 170px;
            }

            .five-cricket-casino .casino-video-cards {
              height: 140px;
            }

            .super-over .casino-video-cards span img {
              width: 23px;
            }

            .five-cricket-casino .casino-video-cards span img {
              width: 23px;
            }

            .super-over .game-header,
            .five-cricket-casino .game-header {
              flex-wrap: wrap;
            }

            .super-over .game-header .game-header-name,
            .five-cricket-casino .game-header .game-header-name {
              max-width: 100%;
            }

            .super-over .game-header .game-header-date,
            .five-cricket-casino .game-header .game-header-date {
              width: 100%;
            }

            .home-new-logo img {
              max-height: 50px;
            }

            .logo img {
              /* max-height: 28px; */
              height: auto;
              max-width: 75px;
            }

            .home-new-header-bottom .download-apk {
              bottom: 0;
            }

            .trap .casino-video-cards {
              height: 170px;
              width: 70px;
            }

            .trap .teen1dayleft,
            .trap .teen1dayright {
              width: 100%;
            }

            .trap .seven-up-down-box {
              margin-bottom: 20px;
            }

            .trap .casino-video-cards-container > div {
              margin-bottom: 2px;
            }

            .trap .casino-video-cards .col-6 {
              line-height: 1;
            }

            .trap .casino-video-cards span {
              line-height: 10px;
              font-size: 10px;
            }

            .trap .casino-video-cards span img {
              width: 13px;
            }

            .casino-video .video-box-container {
              max-width: 100%;
              margin-left: auto;
            }

            .teenpatti2cards .casino-video-cards {
              width: 75px;
            }

            .aaa-oe .casino-bl-box .casino-bl-box-item {
              width: 96%;
            }

            .casino-box-tabs ul {
              overflow: hidden;
              white-space: nowrap;
              flex-wrap: nowrap;
              scroll-behavior: smooth;
              overflow-x: auto;
            }

            .casino-tabs-menu {
              width: 100%;
            }

            .frame-open .casino-tabs-menu {
              width: 100%;
            }

            .casino-tabs {
              height: auto;
            }

            .casino-box .casino-search {
              height: 34px;
              width: 50px;
              display: flex;
            }

            .casino-search.open-search {
              width: 200px;
            }

            .casino-tabs .casino-tabs-menu {
              width: 100%;
              max-width: 100%;
              padding: 0;
            }

            .facncy-provider {
              padding: 5px;
            }

            .facncy-provider ul {
              justify-content: flex-start;
            }

            .facncy-provider li {
              width: calc(33.33% - 3px);
              margin-right: 3px;
              margin-bottom: 3px;
            }

            .slot .facncy-provider li {
              height: 35px;
            }

            .facncy-provider li a.active span {
              color: var(--text-body);
            }

            .facncy-provider li a > div {
              text-align: center;
              width: 100%;
            }

            .facncy-provider li a span {
              width: 100%;
              display: block;
              font-size: 11px;
              line-height: 1;
              font-weight: bold;
              max-width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .facncy-provider li a img {
              height: 25px;
              max-height: 25px;
              max-width: 50px;
              margin-bottom: 5px;
            }

            .facncy-provider li:nth-child(3n) {
              margin-right: 0;
            }

            .casino-box-tabs {
              top: 50px;
              padding: 3px 0;
            }

            .casino-box-tabs .nav-pills .nav-link {
              min-height: unset;
              border-radius: 12px;
              padding: 5px;
            }

            .casino-box-tabs ul {
              margin: 0 5px;
              -ms-overflow-style: none;
              scrollbar-width: none;
            }

            .casino-box-tabs ul::-webkit-scrollbar {
              display: none;
            }

            .casino-box-tabs .nav-pills .nav-item img {
              height: 20px;
            }

            .animate-on .casino-box-tabs {
              top: 85px;
            }

            .teenpatti2cards .casino-video .video-box-container {
              max-width: 100%;
              margin-left: auto;
            }

            .teenpatti2cards .casino-video-last-results span,
            .teenpatti2cards .casino-video-last-results a {
              flex: 1 1 0;
            }

            .teenpatti2-rule-modal .casino-vieo-rules {
              position: relative;
              max-width: 100%;
              width: 100%;
              top: 0;
              height: 100%;
            }

            .teenpatti2-rule-modal .casino-vieo-rules .rules-body {
              text-align: left;
              height: 100%;
            }

            .disconnected-message {
              padding: 5px;
              font-size: 11px;
              line-height: 1.2;
            }

            .disconnected-message i {
              font-size: 14px;
            }

            .disconnected-message b {
              font-size: 12px;
            }

            .disconnected-buttons .btn {
              padding: 4px;
            }

            .sin-khal .casino-video .video-box-container {
              max-width: 100%;
            }

            .sin-khal .casino-video-title {
              background-color: rgba(0, 0, 0, 0.6);
            }

            .sin-khal .casino-bl-box-item {
              width: calc(100% - 3px);
            }

            .sin-khal .casino-nation-name {
              width: 100%;
              text-align: center;
              font-size: 14px;
            }

            .sin-khal .casino-bl-box-item:nth-child(odd) {
              height: 26px;
              margin-top: 10px;
            }

            .sin-khal-box img {
              height: 70px;
            }

            .sin-khal-box .casino-bl-box-item {
              width: 80px !important;
              height: 40px !important;
              margin-top: 0 !important;
            }

            .sin-khal-box .casino-bl-box-item.back {
              margin-left: -4px;
            }

            .sin-khal .casino-video-title .casino-name {
              font-size: 12px;
            }

            .sin-khal .casino-video-rid {
              font-size: 10px;
            }

            .muflis .casino-video .video-box-container {
              max-width: 100%;
            }

            .muflis .casino-detail .casino-nation-name.no-border {
              width: 100%;
            }

            .muflis .casino-bl-box-item {
              width: 100%;
            }

            .muflis .muflis-box {
              width: 100%;
              margin-left: 0;
              margin-top: 20px;
            }

            .muflis .muflis-box img {
              height: 80px;
            }

            .muflis .casino-video-title .casino-name {
              font-size: 12px;
            }

            .muflis .casino-video-rid {
              font-size: 10px;
            }

            /*.casino-vieo-rules img
            {
                height: 22px;
                margin-right: 2px;
            }*/
            .muflis .casino-video-title {
              background-color: rgba(0, 0, 0, 0.6);
            }

            .live-casino-banners .casino-banner-item {
              width: calc(50% - 7.5px);
              margin-right: 10px !important;
            }

            .live-casino-banners .casino-banner-item:nth-child(2n) {
              margin-right: 0 !important;
            }

            .raceto17 .casino-video-cards {
              width: 75px;
              height: 170px;
            }

            .raceto17 .casino-video-cards-container > div {
              margin-bottom: 2px;
            }

            .raceto17 .race-total {
              font-size: 12px;
              line-height: 1;
            }

            .raceto17 .casino-video-cards span img {
              width: 20px;
            }

            .raceto17 .casino-bl-box-item.casino-odds-name {
              width: calc(50% - 2px);
              font-size: 10px;
              padding-left: 10px;
            }

            .raceto17 .casino-bl-box-item {
              height: 40px;
            }

            .raceto17 .casino-bl-box-item {
              width: calc(25% - 2px);
            }

            .raceto17 .casino-video-title {
              background-color: rgba(0, 0, 0, 0.6);
            }

            .raceto17 .casino-video-title .casino-name {
              font-size: 12px;
            }

            .raceto17 .casino-video-rid {
              font-size: 10px;
            }

            .raceto17 .casino-video .video-box-container {
              max-width: 100%;
            }

            .muf-res .casino-result-content {
              align-items: flex-end;
            }

            .casino-video .video-box-container {
              max-width: 100%;
            }

            .casino-video-title {
              background-color: rgba(0, 0, 0, 0.6);
            }

            .casino-video-title .casino-name {
              font-size: 12px;
            }

            .casino-video-rid {
              font-size: 10px;
              line-height: 12px;
            }

            .teenpatti20b .casino-video-title,
            .teenpatti20 .casino-video-title {
              background-color: rgba(0, 0, 0, 0.6);
            }

            .teenpatti20b .casino-video-title .casino-name,
            .teenpatti20 .casino-video-title .casino-name {
              font-size: 10px;
            }

            .teenpatti20b .casino-video-rid,
            .teenpatti20 .casino-video-rid {
              font-size: 10px;
            }

            .teenpatti20b .casino-bl-box-item,
            .teenpatti20 .casino-bl-box-item {
              width: calc(33.33% - 3px);
            }

            .super-over .casino-video-cards {
              height: 135px;
              width: auto;
            }

            .five-cricket-casino .casino-video-cards {
              height: 160px;
              width: auto;
              top: 10px;
            }

            .super-over .casino-video-cards span img {
              width: 15px;
            }

            .five-cricket-casino .casino-video-cards span img {
              width: 15px;
            }

            .five-cricket-casino .scorecard,
            .super-over .scorecard {
              position: relative;
              background: var(--bg-sidebar);
            }

            .note .casino-video-cards {
              width: 40px;
              height: 170px;
            }

            .note .casino-video-cards span img {
              width: 16px;
            }

            .note .casino-bl-box-item.casino-odds-name {
              width: calc(50% - 2px);
              font-size: 10px;
            }

            .note .casino-bl-box-item {
              width: calc(25% - 2px);
            }

            .note .note-baccarat {
              display: flex;
              flex-wrap: wrap;
              justify-content: space-between;
              flex-direction: row;
            }

            .note .note-baccarat .casino-box-row {
              width: 49%;
            }

            .note .oe-cards img {
              height: 15px;
              width: auto;
              margin: 0;
            }

            .note .note-baccarat .casino-nation-name {
              flex-wrap: wrap;
            }

            .note .note-baccarat .casino-nation-name b,
            .note .note-baccarat .casino-nation-name span {
              width: 100%;
            }

            .teenpatti2024 .casino-bl-box {
              width: 100%;
            }

            .teenpatti2024 .casino-bl-box-item {
              width: calc(25% - 3px);
              font-size: 10px;
              font-weight: normal;
            }

            .teenpatti2024 .casino-bl-box-item span {
              font-weight: normal;
            }

            .teenpatti2024 .casino-bl-box-item.casino-odds-name {
              width: calc(50% - 3px);
              text-align: left;
              align-items: center;
              flex-wrap: wrap;
            }

            .teenpatti2024 .casino-bl-box-item.casino-odds-name img {
              height: 18px;
              width: auto;
              margin: 0;
            }

            .teenpatti2024 .casino-bl-box-title .casino-bl-box-item:first-child {
              width: calc(50% - 3px);
              text-align: left;
              justify-content: flex-start;
            }

            .teenpatti2024 .casino-detail .casino-nation-name.no-border > div {
              flex-wrap: wrap;
            }

            .kbc .casino-video .video-box-container {
              max-width: 100%;
            }

            .kbc .casino-video-cards-container > div {
              margin-bottom: 2px;
            }

            .kbc .casino-video-cards {
              height: 170px;
              width: 45px;
            }

            .kbc .casino-video-cards span img {
              width: 22px;
            }

            .kbc .kbc-btns.kbcothers .btn {
              padding: 0;
            }

            .recaptchaTerms {
              font-size: 100%;
            }

            .threecardj .casino-video-cards {
              height: 40px;
            }

            .teen1oneday .teen1dayleft,
            .teen1oneday .teen1dayright {
              width: 100%;
            }

            .teen1oneday .teen1dayleft.w-50,
            .teen1oneday .teen1dayright.w-50 {
              width: 35% !important;
              text-align: center !important;
            }

            .teen1oneday .seven-up-down-box {
              border: 0;
            }

            .teen1oneday .up-box,
            .teen1oneday .down-box {
              width: 35%;
              border: 2px solid #72bbef;
              margin-bottom: 2px;
            }

            .teen1oneday .seven-box {
              top: 10px;
            }

            .teen1oneday .up-box {
              padding-right: 10px;
            }

            .teen1oneday .down-box {
              padding-left: 10px;
            }

            .teen1oneday .casino-video-cards,
            .teen1t20 .casino-video-cards {
              height: 140px;
            }

            .teen1t20 .dragon-box,
            .teen1t20 .tiger-box {
              width: 50%;
            }

            .teen1t20 .dragon-box {
              padding-right: 35px;
            }

            .teen1t20 .tiebox {
              left: 50%;
              height: 70px;
              width: 70px;
              top: 15px;
            }

            .teen1t20 .tiger-box {
              padding-left: 35px;
            }

            .teen1t20 .pair-box {
              width: 100%;
              margin-left: 0;
              margin-top: 10px;
            }

            .teen1t20 .dragon-box b,
            .teen1t20 .tiger-box b {
              font-size: var(--font-small);
            }

            .news-bar marquee {
              width: calc(100% - 25px);
            }

            .news-bar .news-title img {
              width: 22px;
            }

            .home-modal-title {
              justify-content: space-between;
            }

            .home-modal-title img {
              height: 30px;
            }

            .home-modal-title > div {
              font-size: 16px;
            }

            .blink-message {
              padding: 3px;
            }

            .blink-message > div {
              /* font-size: 10px; */
            }

            .nvcasino .vcasino-icon img {
              height: 14px;
            }

            .vtrap .vtrap-seven .casino-bl-box-item {
              height: 8vh;
            }

            .vtrap .main-odds {
              margin-top: -60px;
              transform: perspective(900px) rotateX(30deg) scale(1) translateZ(-100px);
            }

            .twod-layout .main-odds {
              margin-top: 0.5vh;
            }

            .nvcasino.vdtl .main-odds {
              margin-top: 0;
              width: 100%;
              position: relative;
            }

            .nvcasino.vdtl .nav {
              position: unset;
              top: unset;
              margin: 5px 0 0 5px;
            }

            .nvcasino.vdtl .nav-pills .nav-link {
              padding: 8px 10px;
            }

            .nvcasino.vdtl .main-odds-left,
            .nvcasino.vdtl .main-odds-right {
              width: 95%;
              margin-top: 1vh;
            }

            .nvcasino.vdtl .main-odds .v-odd-row {
              margin-bottom: 0;
              justify-content: space-around;
            }

            .nvcasino.vdtl .main-odds-left .v-odd-box,
            .nvcasino.vdtl .main-odds-left .v-odd-box:first-child,
            .nvcasino.vdtl .main-odds-right .v-odd-box {
              width: 19%;
            }

            .nvcasino.vdtl .main-odds .tab-content {
              margin-top: 0;
            }

            .nvcasino.vdtl .casino-bl-box-item.back {
              height: 6.2vh;
            }

            .nvcasino.vdtl .casino-bl-box-item .casino-box-odd {
              margin-bottom: 0;
            }

            .vdtl-title {
              left: 0;
            }

            .vdtl-trophy {
              left: 0;
            }

            .vdtl-trophy img {
              height: 60px;
            }

            .vdtl-trophy {
              top: -40%;
            }

            .vdtl .virtual-coin-icon {
              bottom: unset;
              right: 5px;
              top: 5px;
            }

            .v1card1day .vodds-box,
            .v1card20 .vodds-box {
              width: 49%;
            }

            .v1card1day .vdtl-title,
            .v1card20 .vdtl-title {
              top: -10px;
              height: 100%;
            }

            .v1card1day .vdtl-trophy img,
            .v1card20 .vdtl-trophy img {
              width: 70px;
            }

            .v1card1day .main-odds {
              margin-top: -20px;
            }

            .v1card1day .vtrap-seven .casino-bl-box-item {
              flex-direction: row;
            }

            .v1card1day .vtrap-seven .casino-bl-box-item span:nth-child(2n) {
              margin-top: 0;
            }

            .v1card1day .vtrap-seven .casino-bl-box-item:last-child {
              margin-bottom: 0;
            }

            .v1card1day .vodds-box .casino-bl-box-item {
              height: 6vh;
            }

            .v1card1day .nvtimer.casino-timer,
            .v1card20 .nvtimer.casino-timer {
              top: 24%;
              left: 22%;
            }

            .v1card1day .vtrap-seven .vtrap-img {
              height: 5vh;
            }

            .v1card20 .main-odds {
              margin-top: -10px;
            }

            .v1card20.twod-layout .main-odds {
              margin-top: 10px;
            }

            .home-new-logo .download-apk {
              font-size: 10px;
              color: #000;
              padding: 0 !important;
            }

            .andar-bahar-3 .casino-video .video-box-container {
              max-width: 100%;
            }

            .andar-bahar-3 .casino-detail .casino-video-cards {
              height: auto;
              position: relative;
              top: 0;
              width: 100%;
              background-color: #444;
            }

            .horse-table .game-icons {
              display: inline-block;
              vertical-align: middle;
              line-height: 1;
            }

            .horse-table .bet-table-row-header-mobile .team-name {
              display: inline-block;
              line-height: 1;
              vertical-align: middle;
            }

            .horse-table .bet-table-row-header-mobile .team-name.team-event {
              display: inline-block;
            }

            .horse-time-detail {
              padding: 5px;
              width: auto;
            }

            .horse-table .bet-table-row-header-mobile .game-name {
              width: 100%;
            }

            .sport-tabs .arrow-tabs {
              display: none;
            }

            .arrow-tabs {
              display: none;
            }

            .fullwidthdetail-container .footer {
              width: 100%;
            }

            .horse-detail .nation-name label > div:last-child {
              width: calc(100% - 54px);
              font-weight: bold;
              display: flex;
              flex-direction: column;
            }

            .horse-detail .nation-name label > div:first-child {
              width: 20px;
              font-size: 10px;
              margin-right: 2px;
            }

            .horse-detail .nation-name label img {
              height: 20px;
            }

            .horse-detail .nation-name label > div:last-child div {
              line-height: 1;
              font-size: 10px;
              position: unset;
              transform: unset;
            }

            .lottery .casino-tabs {
              height: 50px;
            }

            .horse-detail .scorecard p {
              font-size: 14px;
              line-height: 1;
            }

            .horse-detail .scorecard h5 {
              font-size: 12px;
              line-height: 1;
            }

            .horse-detail .scorecard > div:first-child {
              bottom: 0;
              left: 0;
              font-size: 12px;
              position: absolute;
            }

            .horse-detail .scorecard .horse-timer {
              position: absolute;
              right: 0;
              flex-direction: row;
              bottom: 0;
              font-size: 12px;
            }

            .horse-detail .scorecard .time-detail {
              position: absolute;
              top: 0;
              font-size: 11px;
              left: 50%;
              transform: translateX(-50%);
              width: 100%;
              text-align: center;
            }

            .horse-detail .scorecard .horse-timer > span:last-child {
              /* display: none; */
              margin-left: 5px;
              font-size: 12px;
            }

            .horse-detail .scorecard .horse-timer small {
              font-size: 12px;
            }

            .horse-detail .scorecard > span {
              position: absolute;
              bottom: 0;
              left: 40px;
              font-size: 14px;
              color: #fff;
            }

            /* .horse-detail .scorecard span {
                position: absolute;
                right: 10px;
                bottom: 15px;
                font-size: 16px;
                color: #fff;
            } */
            /* .horse-detail .scorecard>div:nth-child(2) {
                position: absolute;
                bottom: 0;
                text-align: right;
            }
            .horse-detail .scorecard .horse-timer {
                position: absolute;
                right: 5px;
                top: 5px;
            } */
            .horse-detail .nation-name label div:last-child > span:first-child {
              font-size: 10px;
            }

            .horse-detail
              .nation-name
              label
              div:last-child
              > span:first-child
              > span:first-child {
              display: inline-block;
              max-width: calc(100% - 20px);
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .horse-detail .jockey-mobile {
              background-color: #444;
              color: #ddd;
              width: 100%;
              padding: 3px;
            }

            .horse-detail .horse-attr {
              font-size: 10px;
              margin-bottom: 0;
              background-color: transparent;
              padding: 0;
              margin-top: 3px;
              width: 100%;
              display: block;
            }

            .casino-detail .book-red,
            .casino-detail .book-green {
              font-size: 12px !important;
            }

            .scorecard-row .col-6 > div:first-child {
              line-height: normal;
            }

            .scorecard-row .col-6 > div:last-child {
              line-height: normal;
              margin-top: 3px;
            }

            .new-event .new-event-item {
              padding: 5px;
              background-repeat: repeat;
              background-size: contain;
              min-width: calc(40% - 10px);
              margin: 0 2px;
            }

            .new-event span {
              font-size: 12px;
              line-height: normal;
            }

            .casino-fantasy .casino-banners .col-6 {
              margin-bottom: 10px;
            }

            .banner-toggle {
              background-color: #666;
              width: 50%;
              margin: 0 auto;
              padding: 5px;
              text-align: center;
              color: #ddd;
              font-size: 14px;
              cursor: pointer;
              border-radius: 0;
            }

            .coupon-banners .coupon-box {
              width: 100%;
            }

            .roulette-table-box > div:first-child {
              max-width: 100%;
              width: 100%;
            }

            .deposit-option ul {
              width: 100%;
            }

            .deposit-option ul li {
              width: auto;
              flex: 1 1 auto;
            }

            .deposit-option .nav-pills .nav-link {
              padding: 5px;
              text-align: center;
            }

            .deposit-option .nav-pills .nav-item:first-child .nav-link {
              border-radius: 0px 8px 8px 0;
              -webkit-border-radius: 0px 8px 8px 0;
              -moz-border-radius: 0px 8px 8px 0;
              -ms-border-radius: 0px 8px 8px 0;
              -o-border-radius: 0px 8px 8px 0;
            }

            .deposit-option .nav-pills .nav-item:last-child .nav-link {
              border-radius: 8px 0px 0px 8px;
              -webkit-border-radius: 8px 0px 0px 8px;
              -moz-border-radius: 8px 0px 0px 8px;
              -ms-border-radius: 8px 0px 0px 8px;
              -o-border-radius: 8px 0px 0px 8px;
            }

            .deposit-option .tab-content {
              width: 100%;
              margin-top: 10px;
              padding: 10px;
            }

            .deposit-icons {
              justify-content: flex-start;
            }

            .crypto-icons img {
              height: 40px;
              max-width: 110px;
              margin-bottom: 10px;
            }

            .deposit-icons .deposit-icon-box > div,
            .deposit-icons .deposit-icon-box > div:first-child {
              width: 100%;
            }

            /* .deposit-page {
            width: 95%;
          } */
            .deposit-icons .deposit-icon-box {
              padding-right: 10px;
            }

            .deposit-icons .deposit-icon-box > div:first-child > div:first-child {
              font-size: 16px;
              justify-content: center;
            }

            .btn-add-container {
              height: auto;
              justify-content: center;
            }

            .report-box.deposit .form-group.depo-amount {
              margin-bottom: 30px !important;
            }

            .report-box.deposit .payment-new .form-group.depo-amount {
              margin-bottom: 0 !important;
            }

            .deposit-icons .deposit-icon-box > div:first-child > div:last-child {
              justify-content: center;
            }

            .contact-whatsapp .no-payment {
              flex-wrap: wrap;
            }

            .no-payment .deposit-whatsapp {
              margin-top: 10px;
            }

            .duskadum .casino-video-current-card img,
            .duskadum .casino-video-cards img {
              width: 22px;
            }

            .duskadum .casino-video-cards {
              height: 45px;
              top: 90px;
              width: 130px;
            }

            .duskadum .casino-video-current-card {
              top: 90px;
              transform: unset;
              -webkit-transform: unset;
              -moz-transform: unset;
              -ms-transform: unset;
              -o-transform: unset;
              left: 135px;
            }

            .duskadum .casino-video-cards span img {
              width: 22px;
            }

            .duskadum .dum-slider {
              width: 75%;
            }

            .dum-result .dum-slider {
              width: 85%;
            }

            .dum-result .casino-result-cards-item img {
              width: 35px;
            }

            .duskadum .casino-nation-name b {
              max-width: calc(100% - 75px);
              font-size: 10px;
            }

            .duskadum .casino-detail .book-red,
            .duskadum .casino-detail .book-green {
              font-size: 10px !important;
              line-height: normal;
            }

            .duskadum .dkd-other {
              margin-top: 20px !important;
            }

            .duskadum .dkd-other::before {
              width: 80%;
            }

            .modal-login-new .modal-body {
              padding: 8px;
            }

            .modal-login-new .modal-content {
              max-height: calc(100vh - 0px);
            }

            .modal-login-new .form-group.regi-half {
              width: 100%;
            }

            .modal-login-new .form-group.regi-half.pass-half {
              width: 48%;
            }

            .deposit-page h4 {
              font-size: 16px;
            }

            .deposit-page h5 {
              font-size: 15px;
            }

            .deposit-page
              .payment-icons
              .payment-icon-box-container
              .payment-icon-box
              img {
              display: none;
            }

            .deposit-page
              .payment-icons
              .payment-icon-box-container
              .payment-icon-box
              .crypto-icons
              img {
              display: block;
            }

            .deposit-page
              .payment-icons.crypto-icons-box
              .payment-icon-box-container
              .payment-icon-box {
              justify-content: center;
            }

            .deposit-page .payment-icons .payment-icon-box-container .payment-icon-box {
              padding: 15px 10px;
              height: 100%;
              text-align: center;
            }

            .deposit-page
              .payment-icons
              .payment-icon-box-container
              .payment-icon-box
              h4 {
              font-size: 11px;
              margin-top: 0;
            }

            .deposit-page .payment-icons::after {
              width: 100%;
            }

            .deposit-page .deposit-options {
              padding: 0 5px;
            }

            .deposit-page
              .payment-icons.crypto-icons-box
              .payment-icon-box-container
              .payment-icon-box
              > div
              > div:first-child {
              font-size: 16px;
              font-weight: bold;
              text-align: center;
            }

            .deposit-page
              .payment-icons
              .payment-icon-box-container
              .payment-icon-box
              .crypto-icons
              img {
              height: 40px;
              max-width: 110px;
              margin-bottom: 10px;
            }

            .deposit-page .deposit-options .col-md-4.text-right {
              text-align: center !important;
            }

            .deposit-page .payment-icons.crypto-icons-box .payment-icon-box-container {
              margin-bottom: 20px;
            }

            .one-card-meter .casino-video-cards {
              height: 42px;
              width: 70px;
            }

            .one-card-meter .meter-btns .meter-btn {
              width: 100%;
            }

            .one-card-meter .meter-btns .meter-btn:not(:last-child) {
              margin-bottom: 20px;
            }

            .one-card-meter .meter-btns .meter-btn .btn-fighter-1 img {
              transform: rotate(180deg);
              -webkit-transform: rotate(180deg);
              -moz-transform: rotate(180deg);
              -ms-transform: rotate(180deg);
              -o-transform: rotate(180deg);
            }

            .one-card-meter .meter-btns .meter-btn .btn-fighter-2 img {
              transform: rotate(0);
              -webkit-transform: rotate(0);
              -moz-transform: rotate(0);
              -ms-transform: rotate(0);
              -o-transform: rotate(0);
            }

            .banner-iframe .slot-header {
              padding: 5px 10px;
              height: 40px;
            }

            .banner-iframe iframe {
              min-height: calc(var(--app-height) - 40px);
            }

            .deposit-page .payment-ions-container .payment-icons {
              width: 100%;
              margin-right: 0;
            }

            .payment-icons.auto-pay .deposit-options p {
              font-size: 14px;
            }

            .payment-ions-container {
              margin: 0;
            }

            .pay-now-mobile {
              display: flex;
              flex-wrap: wrap;
              justify-content: flex-end;
            }

            .pay-now-mobile p {
              margin-bottom: 0;
            }

            .deposit-page .payment-icon-box-container .btn-primary,
            .deposit-options .btn-primary {
              width: 120px;
            }

            .add-new-detail {
              width: 100%;
            }

            .account-detail .form-check {
              width: 100%;
              margin-right: 10px;
              margin-bottom: 10px;
            }

            .payment-new .account-detail .form-check {
              width: 100%;
              margin-top: 10px;
            }

            .account-detail {
              min-height: 60px;
              padding: 5px;
            }

            .deposit-page .payment-icons.whatsapp-box .deposit-options {
              min-height: 155px;
            }

            .deposit-page .payment-icons.whatsapp-box,
            .withdraw-request .deposit-page .payment-icons.whatsapp-box {
              min-height: 120px;
            }

            .print-page {
              margin-top: 0;
              margin-bottom: 20px;
            }

            /*New Fancy Design*/
            .fancy-provider-list {
              padding: 0 5px;
              margin-bottom: 0;
              position: relative;
            }

            .fancy-provider-title {
              padding: 2px 5px;
              margin-bottom: 5px;
              height: 40px;
              display: flex;
              align-items: center;
              width: 100%;
            }

            .fancy-provider-title a {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              justify-content: space-between;
              color: var(--text-table);
            }

            .fancy-provider-title a div {
              width: 100px;
              display: none;
            }

            .fancy-provider-title a img {
              max-width: 200px;
              max-height: 35px;
              display: flex;
            }

            .fancy-provider-title a span {
              font-size: 14px;
              text-transform: uppercase;
              font-weight: bold;
              color: var(--text-fancy);
            }

            .fancy-provider-title.new-launch-title a span {
              color: var(--text-green);
            }

            /* .fancy-provider-title a span:last-child {
                color: var(--bg-success);
                text-decoration: underline;
                font-size: 12px;
                text-transform: unset;
            } */
            .facncy-provider li a {
              height: auto;
            }

            .fancy-page .casino-banners {
              margin-top: 5px;
            }

            .casino-banners-fancy {
              display: flex;
              flex-wrap: wrap;
            }

            .fancy-page .casino-banner-item {
              width: 33.33%;
              margin-right: 0;
              margin-bottom: 0;
              padding: 2px;
            }

            .casino-banners-fancy.all {
              display: flex;
              flex-wrap: wrap;
            }

            .casino-banners-fancy.all .casino-banner-item {
              width: 33.33%;
            }

            .casino-banners-fancy.all .casino-banner-item:nth-child(3n) {
              margin-right: 0;
            }

            .fancy-page .casino-banner-item:nth-child(2n) {
              margin-right: 0;
            }

            .fancy-provider-list .slick-slide {
              margin: 0 2px;
            }

            .fancy-provider-list .slick-prev,
            .fancy-provider-list .slick-next {
              display: none !important;
            }

            .fancy-provider-sorting-btns {
              position: fixed;
              top: calc(100vh - 50px);
              width: 100%;
              z-index: 1000000;
              padding: 5px;
              height: 50px;
              display: flex;
              flex-wrap: wrap;
              justify-content: space-between;
              align-items: center;
            }

            .fancy-provider-sorting-btns .btn {
              width: 100%;
            }

            .fancy-provider-list .slick-dots li {
              width: 10px;
            }

            .fancy-provider-list .slick-dots li button::before {
              color: #fff !important;
              width: 10px !important;
            }

            .fancy-provider-list .slick-dots li.slick-active button::before {
              color: #fff !important;
            }

            .horse-detail .nation-name label::before,
            .horse-detail .nation-name label::after {
              top: 50%;
              transform: translateY(-50%);
            }

            .horse-detail-arrow {
              font-size: 14px !important;
              position: absolute;
              right: 0;
              top: 0;
            }

            .whatsapp-box {
              padding: 4px 8px;
              margin-bottom: 5px;
            }

            .whatsapp-box > div:first-child h4 {
              margin-top: 0;
              margin-bottom: 0;
              font-size: 14px;
            }

            .create-whatsapp-link {
              margin-top: 5px;
            }

            .modal-login-new .form-group {
              margin-bottom: 10px;
            }

            .modal-login-new .form-group {
              margin-bottom: 15px;
            }

            .modal-login-new .form-control {
              height: 36px;
              font-size: 14px;
            }

            .create-account-seperator {
              margin-bottom: 0;
            }

            .bet-input-box {
              align-items: center;
            }

            .bet-input {
              margin: 0;
            }

            .sicbo-middle-left {
              width: 100%;
              display: flex;
              flex-wrap: wrap;
              flex-direction: row;
            }

            .sicbo-middle-left .sicbo-cube-box-container {
              width: 100%;
            }

            .sicbo-middle-left .sicbo-cube-box {
              margin-bottom: 2px;
            }

            .sicbo-middle-left .sicbo-title-box {
              font-size: 9px;
              padding: 0px 2px;
            }

            .sicbo-middle-top-row {
              width: 100%;
              align-content: flex-start;
            }

            .sicbo-middle-right {
              width: 100%;
              display: flex;
              flex-wrap: wrap;
              justify-content: space-between;
            }

            .sicbo-middle-top-row .sicbo-title-box {
              width: calc(50% - 2px);
              display: inline-block;
            }

            .sicbo-middle-top-row .sicbo-square-box.any-tripple {
              width: calc(50% - 2px);
              text-align: center;
            }

            .sicbo-middle-top-row .sicbo-square-box {
              margin: 1px;
              width: calc(14% - 2px);
              height: 50px;
            }

            .sicbo-title-box {
              min-width: unset;
              padding: 0 3px;
              font-size: 10px;
            }

            .sicbo-middle-middle-row {
              width: 100%;
              align-content: flex-start;
              margin-top: 0;
            }

            /* .sicbo-middle-middle-row .sicbo-cube-box {
                width: calc(50% - 2px);
            } */
            .sicbo-middle-middle-row .sicbo-cube-box-container {
              width: 32%;
              margin-bottom: 5px;
            }

            .sicbo-bottom {
              width: 100%;
            }

            .sicbo-bottom .sicbo-cube-box-container {
              width: 100%;
            }

            .sicbo-bottom .sicbo-cube-box-group {
              flex-direction: row;
              justify-content: space-between;
            }

            .sicbo-bottom .sicbo-cube-box {
              width: auto;
              height: auto;
              margin-bottom: 5px;
              flex-direction: row;
              width: 19%;
            }

            .sicbo-bottom .cube-row-group,
            .sicbo-bottom .cube-column-group {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
            }

            .sicbo-bottom .cube-row-group .sicbo-cube-box {
              flex-direction: row;
            }

            .sicbo-bottom .cube-column-group .sicbo-cube-box {
              flex-direction: column;
              height: 55px;
            }

            /* .sicbo-bottom .sicbo-cube-box {
                flex-direction: row;
                width: auto;
            }
            .sicbo-bottom .sicbo-cube-box:nth-child(4),
            .sicbo-bottom .sicbo-cube-box:nth-child(5),
            .sicbo-bottom .sicbo-cube-box:nth-child(9),
            .sicbo-bottom .sicbo-cube-box:nth-child(10),
            .sicbo-bottom .sicbo-cube-box:nth-child(14),
            .sicbo-bottom .sicbo-cube-box:nth-child(15) {
                flex-direction: column;
            } */
            .sicbo-middle {
              flex-wrap: wrap;
            }

            .cricket20ballpopup img {
              width: 100px;
            }

            .cricket20ballpopup span {
              font-size: 24px;
            }

            .ball-by-ball .casino-video {
              position: sticky;
              width: 100%;
              z-index: 10;
              top: 94px;
            }

            .ball-by-ball-timer {
              position: sticky;
              top: 88px;
              z-index: 1;
            }

            .lastCards img {
              height: auto;
              width: 22px;
            }

            .lastCards-result .hooper-list {
              width: 75%;
            }

            .lastCards .hooper-next {
              left: -26px !important;
              padding: 0px !important;
            }

            .lastCards .hooper-prev {
              right: -26px !important;
              padding: 0px !important;
            }

            .threeCardJ .lastCards .hooper-next {
              right: -24px !important;
              left: unset !important;
              padding: 0px !important;
            }

            .threeCardJ .lastCards .hooper-prev {
              left: -24px !important;
              right: unset !important;
              padding: 0px !important;
            }

            .threeCardJ.lastCards-container {
              width: 80% !important;
            }

            .login-form .error,
            .withdraw-request .error,
            .change-form .error {
              font-size: 10px;
              margin-top: 3px;
            }

            .detail-page-container.five-cricket,
            .detail-page-container.five-cricket-casino {
              margin-top: 5px;
            }

            .five-cricket-casino .banner,
            .super-over .banner {
              margin-top: 0;
            }

            .footer .support > div:first-child {
              justify-content: flex-start;
            }

            .footer .support > div:first-child > div {
              text-align: left !important;
            }

            .scorecard-new {
              font-size: 12px !important;
            }

            .scorecard-new .team img {
              height: 15px;
            }

            .scorecard-new .team-name {
              font-size: 12px;
            }

            .badla-icon {
              position: unset;
              margin-left: 4px;
            }

            .depo-number-desc-box {
              max-width: 100%;
            }

            .teenpatti-joker .teen1dayleft,
            .teenpatti-joker .teen1dayright,
            .teenpatti-joker1 .teen1dayleft,
            .teenpatti-joker1 .teen1dayright {
              width: 100%;
            }

            .joker1-other-cards {
              gap: 4px;
            }

            .joker1-other-cards img {
              height: 46px;
            }

            .teenpatti-joker .casino-video-cards {
              height: 155px;
              top: 35px;
            }

            .teenpatti-joker1 .casino-video-cards {
              top: 135px;
            }

            .teenpatti-joker1 .joker-card span img {
              width: 40px;
            }

            .scorecard-new {
              max-width: 100%;
            }

            .login-auth input {
              width: 40px;
              height: 40px;
              margin: 0 5px;
              line-height: 1;
              font-size: 20px;
            }

            .login-auth .featured-box-login h3 {
              font-size: 22px;
            }

            .casino-list-container .home-casiono-icons {
              margin-top: 10px;
              padding: 10px 0 0 10px;
              flex-wrap: wrap;
              display: flex;
              justify-content: space-between;
            }

            .casino-list-container .home-casiono-icons h4 {
              font-size: var(--font-18);
              color: var(--text-table-header-new);
              width: 100%;
            }

            .casino-list-container .home-casiono-icons .home-casino-icon-item {
              margin-right: 10px;
              width: calc(49% - 10px);
              margin-bottom: 10px;
            }

            .battle-result {
              width: 100%;
              overflow: auto;
            }

            .battle-result-container {
              min-width: 1000px;
              width: 100%;
            }

            .fixure-box {
              height: 40px;
            }

            .table.kbc-soda-table {
              table-layout: fixed;
            }

            .kbc-soda-table .casino-result .bet-nation {
              width: 200px;
            }

            .roulette-result-box {
              width: 32%;
              justify-content: center;
            }

            .roulette-result-box > span:first-child {
              border-bottom: 0;
            }

            .home-casiono-icons .home-casino-icon-item {
              padding-top: 20px;
              padding-right: 10px;
            }

            .new-laucnh-icon {
              top: 9px;
              right: 0px;
            }

            :root[data-theme="light"] .casino-nation-name {
              background-color: #dddddd;
            }

            :root[data-theme="light"] .pasa .casino-nation-name {
              background-color: transparent;
            }

            :root[data-theme="light"] .note .note-baccarat .casino-nation-name {
              background-color: transparent;
            }

            :root[data-theme="light"] .note .casino-bl-box-item.casino-odds-name {
              background-color: #ddd;
            }

            :root[data-theme="light"] .bet-table-box {
              border-bottom: 0;
              background-color: #ddd;
            }

            :root[data-theme="blue"] .race20 .total-points > div {
              border: 1px solid var(--text-black);
            }

            :root[data-theme="blue"] .race20 .total-points .text-playerb {
              color: var(--text-black);
              font-weight: bold;
            }

            .teenpatti-joker1 .teen1dayright .casino-box-row {
              width: 100%;
            }

            .scorecard-new .score-total {
              font-size: 12px;
            }

            /*Doli Dana*/
            .doli-main .players-bet {
              width: 100%;
            }

            .doli-main .side-bets {
              width: 100%;
            }

            .doli-main .any-pair {
              width: 100%;
            }

            .doli-main .side-bets .odd-even-pair {
              width: calc(40% - 5px);
            }

            .doli-main .side-bets .lucky7-pair {
              width: calc(60% - 5px);
            }

            .doli-other-bets .particular-pair {
              width: 100%;
            }

            .doli-other-bets .particular-pair .bets-box .doli-odds-box {
              width: calc(16.66% - 5px);
            }

            .doli-other-bets .sum-odds {
              width: 100%;
            }

            .doli-dana .odd-name {
              font-size: 9px;
            }

            .doli-dana .casino-video-cards {
              height: 40px;
              width: 80px;
            }

            .unique-teen20-box .unique-teen20-card img {
              width: 50px;
              height: auto;
            }

            .unique-teen20-last-results {
              padding: 5px;
            }

            .unique-teen20-result-group {
              margin-right: 5px;
              background-color: var(--bg-sidebar);
              color: var(--text-sidebar);
              flex-direction: row;
            }

            .unique-teen20-place-balls {
              width: 100%;
              justify-content: space-between;
            }

            .unique-teen20-place-balls .casino-place-bet-action-buttons,
            .unique-teen20-place-balls .casino-place-bet-action-buttons .btn {
              width: auto;
            }

            .deposit-left-payment > div {
              margin-bottom: 3px;
            }

            .deposit-page .payment-detail-box span {
              font-size: 11px;
            }

            .deposit-page .deposit-form .btn-add-container .btn-add {
              padding: 5px 4px;
              font-size: 10px;
            }

            .roulette.roulette11 .transfer-board {
              justify-content: center;
              position: absolute;
              top: 30px;
              z-index: 1000;
            }

            .roulette.roulette11 .transfer-board h4 {
              font-size: 14px;
              position: absolute;
              left: 5px;
              top: 0;
              text-transform: uppercase;
              border-bottom: 1px solid #fff;
              color: #fff;
            }

            .teenpatti2cards.mogambo .casino-video-cards {
              width: 80px;
              height: 120px;
            }

            ♠ .teenpatti2cards.mogambo .casino-video-cards-container h5 {
              font-size: 12px;
            }

            .mogambo .casino-video-cards-container .card-devider {
              transform: unset;
              left: 26px;
            }

            .mogambo .casino-video-cards-container > div > span img {
              margin-right: 10px;
            }

            .matka .matka-tabs {
              margin-top: 0;
              padding: 4px;
              position: sticky;
              top: 88px;
              background: var(--bg-body);
              z-index: 100;
            }

            .matka .matka-coins {
              padding: 4px;
              gap: 0 10px;
              justify-content: center;
              position: sticky;
              top: 134px;
              background: var(--bg-body);
              z-index: 1000;
            }

            .matka .matka-coins .matka-total-coin {
              /* width: calc(25% - 2px); */
              gap: 6px;
            }

            .matka .matka-coins .matka-coin-title span {
              font-size: 11px;
              width: 100%;
              text-align: center;
              order: 2;
            }

            .matka .matka-coins .matka-coin-title {
              padding: 0;
              width: 100%;
            }

            .matka .matka-coins .matka-coin-title .btn {
              position: unset;
              padding: 2px 8px;
              font-size: 11px;
            }

            .matka .matka-coins .matka-other-coins {
              /* width: calc(75% - 2px); */
              gap: 4px;
              justify-content: flex-end;
            }

            .matka .matka-coins .matka-total-coin .matka-coin-title {
              font-size: 11px;
              display: none;
            }

            .matka .matka-coins .matka-total-coin .casino-coin {
              /* padding-left: 45px; */
            }

            .matka .matka-coins .matka-total-coin .bet-chip-holder {
              height: 35px;
              width: 35px;
            }

            .matka .matka-coins .matka-total-coin .btn {
              font-size: 11px;
              padding: 4px;
            }

            .matka .matka-coins .matka-total-coin .casino-coin img {
              height: 50px;
            }

            .matka .matka-coins .matka-other-coins .casino-coin img {
              height: 35px;
            }

            .matka .matka-coins .matka-total-coin .casino-coin span {
              font-size: 13px;
            }

            .matka .matka-coins .matka-other-coins .casino-coin span {
              font-size: 11px;
            }

            .matka .matka-coins .bet-chip-holder {
              width: 35px;
              height: 35px;
              flex: 0 0 35px;
            }

            .matka.worli .jodi .worli-full .worli-odd-box,
            .matka.worli .pana .worli-full .worli-odd-box {
              width: calc(20% - 2px);
              height: 40px;
            }
            .matka.worli .pana .worli-full .worli-odd-box {
              height: auto;
              width: calc(20% - 7px);
            }
            .worli.matka .pana .worli-sub-odd-box-container .worli-sub-odd-box span {
              height: 24px;
              font-size: 22px;
            }
            .matka.worli .worli-odd-box,
            .matka.worli .worli-odd-box {
              /* width: calc(20% - 2px); */
              /* height: 40px !important; */
            }

            .matka.worli .worli-odd-box .worli-odd {
              font-size: 24px;
            }

            .matka.worli .jodi .worli-left .worli-odd-box:nth-child(5n),
            .matka.worli .jodi .worli-full .worli-odd-box:nth-child(5n),
            .matka.worli .pana .worli-left .worli-odd-box:nth-child(5n),
            .matka.worli .pana .worli-full .worli-odd-box:nth-child(5n) {
              margin-right: 0;
            }

            .matka.worli .pana .tab-content h4 {
              font-size: 14px;
            }

            .matka.worli .pana .nav-pills .nav-link {
              padding: 6px 12px;
            }

            .matka .matka-tabs .nav-pills .nav-link {
              font-size: 11px;
            }

            .matka .matka-tabs .remaining-time img {
              height: 13px;
            }

            .matka .matka-tabs .remaining-time span {
              font-size: 10px;
            }

            .matka-result-calendar {
              overflow-x: auto;
              display: flex;
              align-items: flex-start;
              flex-wrap: wrap;
            }

            .matka-result-calendar .result-calendar-title .result-calendar-title-item,
            .matka-result-calendar .result-calendar-desc .result-calendar-desc-box {
              min-width: 90px;
            }

            .matka-result-calendar .result-calendar-desc .result-calendar-desc-box {
              min-height: 120px;
            }

            .matka-result-calendar
              .result-calendar-desc
              .result-calendar-desc-box
              .result-matka-number {
              font-size: 22px;
              margin-top: 10px;
            }

            .matka-result-calendar
              .result-calendar-desc
              .result-calendar-desc-box
              .result-matka-oc {
              gap: 0;
              padding: 0 6px;
            }

            .matka-result-calendar
              .result-calendar-desc
              .result-calendar-desc-box
              .result-calendar-desc-date {
              top: 15px;
              font-size: 20px;
              height: 30px;
              width: 30px;
            }
          }

          @media only screen and (min-width: 1280px) and (max-width: 1599px) {
              .casino-video-cards {
                  width: 172px;
                  height: 135px;
              }
          }

          .casino-video-cards .hide-cards {
              width: 0 !important;
          }

          .teenpattitest .casino-video-cards-container > div {
              flex-wrap: wrap;
          }

          .teenpattitest .casino-video-cards-container > div > div > div {
              display: flex;
              flex-wrap: nowrap;
          }

          .casino-video-cards-container .dealer-name {
              font-weight: bold;
              text-transform: uppercase;
              font-size: var(--font-small);
              justify-content: center;
              white-space: nowrap;
              color: var(--text-white);
          }

          .worli-odd-box .worli-odd~span {
                font-family: "Noto Sans";
            }

        `}
      </style>

    </>
  );
};

export default WorliMatka;
