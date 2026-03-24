import React, { useState, useEffect, useRef } from "react";
import { fetchCasinoExposureApi } from "../../api/api";
import { useSocket } from "../../components/Socket/useSocket";
import { getImage, getValueAfterDot, getValueBeforeDot } from "../../utilies/helpers";
import { useGetFileData } from "../../hooks/useGetFileData";
import "./kk.css";
import CasinoVideo from "./components/CasinoVideo";

import s1 from "../../assets/cards_new/s1-icon.png";
import s2 from "../../assets/cards_new/s2-icon.png";
import s3 from "../../assets/cards_new/s3-icon.png";
import s4 from "../../assets/cards_new/s4-icon.png";
import s5 from "../../assets/cards_new/s5-icon.png";
import s6 from "../../assets/cards_new/s6-icon.png";
import uniqueCardBack from "../../assets/cards_new/uniqueteenpatti.jpg";

const badgeImages = { 1: s1, 2: s2, 3: s3, 4: s4, 5: s5, 6: s6 };

const TeenUnique = ({ onBetSelection, lastBetTime, exposureTrigger }) => {
  const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
  const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(true);
  const [gameData, setGameData] = useState(null);
  const [exposureData, setExposureData] = useState([]);

  // Selection State
  const [selectedCards, setSelectedCards] = useState([]);

  const getCardImage = (card) => {
    if (!card || card === "1")
      return "https://wver.sprintstaticdata.com/v65/static/front/img/cards/1.png";
    return `https://wver.sprintstaticdata.com/v196/static/front/img/cards/${card}.png`;
  };

  useEffect(() => {
    const fetchExposure = async () => {
      const mid = gameData?.t1?.[0]?.mid;
      if (!mid) return;
      try {
        const response = await fetchCasinoExposureApi({
          markettype: CODE,
          main_event_id: getValueAfterDot(mid),
          curPageName: phpFile,
        });
        if (Array.isArray(response?.data)) {
          setExposureData(response.data);
        }
      } catch (error) {
        console.error("Error fetching exposure:", error);
      }
    };
    fetchExposure();
  }, [gameData?.t1?.[0]?.mid, lastBetTime, exposureTrigger]);

  const socket = useSocket("casino");
  useEffect(() => {
    if (!socket) return;

    const handleData = (data) => {
      try {
        const payload = Array.isArray(data) ? data[0] : data;
        if (payload) {
          setGameData((prevData) => ({ ...prevData, ...payload }));
        }
      } catch (error) {
        console.error("Error processing game data:", error);
      }
    };

    const handleConnect = () => {
      console.log(`✅ ${game_type} Connected:`, socket.id);
      socket.emit("Room", game_type);
    };

    const handleDisconnect = (reason) => {
      console.log(`⚠️ ${game_type} Disconnected:`, reason);
    };

    const handleConnectError = (error) => {
      console.error("🔴 Connection Error:", error.message);
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);
    socket.on(game_type, handleData);
    socket.on("game", handleData);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off(game_type, handleData);
      socket.off("game", handleData);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [socket, game_type]);

  const handleCardClick = (cardIndex) => {
    if (selectedCards.includes(cardIndex)) {
      // Deselect
      setSelectedCards(selectedCards.filter((c) => c !== cardIndex));
    } else {
      // Select if less than 3
      if (selectedCards.length < 3) {
        setSelectedCards([...selectedCards, cardIndex]);
      }
    }
  };

  const handleReset = () => {
    setSelectedCards([]);
  };

  const handlePlaceBet = () => {
    if (selectedCards.length !== 3) return;

    // Construct bet data
    // We need to map the selected cards (1-6) to the actual runner/market
    // Assumption: The user selects 3 cards, which forms a "hand".
    // This might correspond to a specific market runner or just a custom selection passed to PlaceBet.

    // However, standard PlaceBet expects teamName, odds, marketId etc.
    // If this is a unique custom game, we might need to find the correct valid market from gameData.

    // Let's assume there's a market for "User Selection" or we pass the selection as `teamName` or `selectionId`.
    // Since I don't have the exact API specs for "Unique Teenpatti" betting, I'll pass a constructed object.

    // Looking at gameData structure for other teenpatti games, usually t2 has runners.
    // For "Unique", maybe we are betting on a combination?

    // Using a generic odds for now or finding from t2 if possible.
    const defaultOdds = "1.98";
    const marketId = gameData?.t2?.[0]?.sid || "unique_market";

    const selectionName = `Cards: ${selectedCards.sort().join(",")}`;

    if (onBetSelection) {
      onBetSelection({
        teamName: selectionName,
        odds: defaultOdds,
        minBet: gameData?.t1?.[0]?.min || 100,
        maxBet: gameData?.t1?.[0]?.max || 25000,
        isBack: true,
        marketId: marketId,
        eventId: getValueAfterDot(gameData?.t1?.[0]?.mid),
        marketType: "UNIQUE",
        selectedCards: selectedCards,
      });
    }
  };

  const currentGame = gameData?.t1?.[0];

  // Helper to get open card value for a slot (1-6)
  // According to data: C1, C2, C3, C4, C5, C6 are the keys in t1
  const getSlotCard = (slotNum) => {
    const cardKey = `C${slotNum}`;
    const val = currentGame?.[cardKey];
    return val && val !== "1" ? val : null;
  };

  // Check global suspended status. Usually if any main market is suspended, we lock.
  // Sample data shows t2 items. Let's check the first one or if any are suspended.
  // User said "keep that suspended status lock part".
  // Let's check status of first market in t2 as a proxy, or general gstatus if available elsewhere.
  // Sample data t2 element: { gstatus: "SUSPENDED" }
  // We can treat game as suspended if the first market is suspended.
  const isGameSuspended = gameData?.t2?.[0]?.gstatus === "SUSPENDED";

  // Check if a specific card/slot is open
  const isCardOpen = (slotNum) => !!getSlotCard(slotNum);


  // Render
  return (
    <>
      <style jsx>{`
        .unique-tp-container {
          // background-color: #2e3439;
          padding: 10px;
          text-align: center;
          color: #fff;
        }
        .card-selection-row {
          display: flex;
          justify-content: center;
          gap: 8px; /* Slightly increased gap */
          margin: 20px 0; /* More margin */
        }
        .card-slot-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        }
        .card-number-badge {
          width: 24px;
          height: 24px;
          background-color: #d1d5db; /* Greyish */
          color: #000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 5px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        .card-slot {
          width: 45px;
          height: 60px;
          // border: 2px solid transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #3b4146;
          position: relative;
          border-radius: 4px; /* Slight radius */
          overflow: hidden;
          transition: transform 0.1s;
        }
        .card-slot.selected {
          border-color: #fdcf13;
          transform: scale(1.05); /* Slight pop */
        }
        /* Default non-selected state also needs border color if per image? 
               Image shows yellow borders on all slots, maybe? 
               Lets assume selected has the distinct yellow border, or all have it.
               The user image shows blueish card backs inside yellow frames. 
               Let's give all a yellow frame but 'selected' maybe stronger or different?
               Actually, in the user image, ALL frames are yellow. 
               Let's make default border yellow #fdcf13. 
            */

        .card-slot img {
          width: 100%;
          height: 100%;
          object-fit: contain; /* Ensure fit */
        }

        /* Overlay for selected state to darken/highlight?
               User said: "123456 number should bw on nanoube th ecards" -> numbers above.
               Does selection change appearance? Usually yes.
               Let's keep the opacity logic or checkmark overlay?
               Image provided is static, doesn't show "selected" vs "unselected" explicitly, 
               but probably the interface logic remains.
               Current logic: selected -> full opacity, unselected -> ? 
               Or maybe selected -> checkmark?
               
               Let's stick to current logic: selectedCards.includes(num)
               Previous code had opacity: 0.5 for selected?? 
               Wait: 
               {selectedCards.includes(num) ? <img ... style={{opacity: 0.5}} ... /> : ... }
               Usually selected items are highlighted (full opacity) and unselected are dimmed?
               Or vice versa?
               Let's assume selected = Highlighted. 
               Ill remove opacity for selected, and maybe add opacity for unselected if needed, 
               or just keep it simple.
            */

        .selection-display {
          display: flex;
          gap: 5px;
          margin-top: 10px;
          height: 40px;
        }
        .selected-item {
          width: 30px;
          height: 40px;
          background: #ddd;
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          border: 1px solid #999;
        }

        .action-buttons {
          margin-top: 10px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .btn-reset {
          background-color: #ff4d4d;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
        }
        .btn-place {
          background-color: #009933;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
        }
        .btn-disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .instruction-text {
          background: rgba(0, 0, 0, 0.5);
          padding: 5px;
          font-size: 12px;
          margin-bottom: 5px;
        }

        .result-history-row {
          display: flex;
          gap: 2px;
          justify-content: center;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        .result-bubble {
          width: 25px;
          height: 25px;
          background: #000;
          color: #fdcf13;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }
      `}</style>

      <div className="casino-table teenunique kk">
        <CasinoVideo
          gameName="Unique Teenpatti"
          roundId={currentGame?.mid}
          videoSrc={iframe_url}
          isCardDrawerOpen={isCardDrawerOpen}
          setIsCardDrawerOpen={setIsCardDrawerOpen}
          autotime={currentGame?.autotime}
          totalTime={currentGame?.ft} />

        <div className="casino-detail">
          <div className="unique-tp-container">
            <div className="instruction-text">
              Select any 3 cards of your choice and experience TeenPatti in a
              unique way.
            </div>

            {/* 1-6 Card Slots */}
            <div className="card-selection-row" style={{ position: 'relative' }}>
              {/* Global Lock Overlay if Suspended */}


              {[1, 2, 3, 4, 5, 6].map((num) => {
                const openCardVal = getSlotCard(num);
                const isOpen = !!openCardVal;

                return (
                  <div
                    key={num}
                    className="card-slot-container"
                    onClick={() => !isGameSuspended && !isOpen && handleCardClick(num)} // Disable click if suspended or card already open? Or maybe open card is the result?
                  // If card is open, usually means round is resulting or done.
                  >
                    {/* Badge Image */}
                    <img
                      src={badgeImages[num]}
                      alt={`${num}`}
                      className="card-number-badge-img"
                      style={{ width: "30px", marginBottom: "5px" }}
                    />

                    <div
                      className={`card-slot ${selectedCards.includes(num) ? "selected" : ""}`}
                    >
                      {isOpen ? (
                        // Show actual card if open
                        <img
                          src={getCardImage(openCardVal)}
                          alt={`Card ${num}`}
                          style={{
                            opacity: 1, // Open cards always visible full opacity
                          }}
                        />
                      ) : (
                        // Show back if closed
                        <img
                          src={uniqueCardBack}
                          alt={`Card ${num}`}
                          style={{
                            opacity: selectedCards.includes(num) ? 0.5 : 1,
                          }}
                        />
                      )}

                      {/* Checkmark for selected */}
                      {selectedCards.includes(num) && !isOpen && !isGameSuspended && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(0,0,0,0.3)",
                          }}
                        >
                          <i
                            className="fas fa-check"
                            style={{ color: "#fff", fontSize: "20px" }}
                          ></i>
                        </div>
                      )}

                      {/* Individual Lock Overlay if Suspended and Card NOT Open */}
                      {isGameSuspended && !isOpen && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <i className="fas fa-lock" style={{ color: '#fff', fontSize: '14px' }}></i>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {selectedCards.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                {/* Selected Display */}
                <div className="selection-display">
                  {selectedCards.map((num, i) => (
                    <div key={i} className="selected-item">
                      {num}
                    </div>
                  ))}
                  {/* Empty placeholders if needed to keep layout stable */}
                  {[...Array(3 - selectedCards.length)].map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="selected-item"
                      style={{ opacity: 0.3 }}
                    ></div>
                  ))}
                </div>

                {/* Buttons */}
                <div className="action-buttons">
                  <button className="btn-reset" onClick={handleReset}>
                    Reset
                  </button>
                  <button
                    className={`btn-place ${selectedCards.length !== 3 ? "btn-disabled" : ""}`}
                    onClick={handlePlaceBet}
                    disabled={selectedCards.length !== 3}
                  >
                    PlaceBet
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TeenUnique;
