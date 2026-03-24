import React, { useCallback } from "react";
import useIsMobile from "../../../hooks/useIsMobile";
import { formatNumber, getAndarBaharPopupBgColor, getImage, normalizeNumber } from "../../../utilies/helpers";
import { useGamePathName } from "../../../hooks/useGetFileData";
import { BetPopupCss } from "./CssStyle";
import Loader from "../../Loader/Loader";
import Modal_wrapper from "./Modal_wrapper";

const diffBgColorGames = ["andarbahar", "andarbahar1", "ab3", "ab4"];
const betButtons = [25, 50, 100, 200, 500, 1000];

// Helper function to format the bet title dynamically for Andar Bahar
const formatBetTitle = (teamName, side, denominator, marketId, pathName) => {
    // Logic for andarbahar2
    if (pathName === "andarbahar2") {
        if (!teamName) return "";
        // Handle SA/SB (sid 1 and 4)
        if (marketId === "1") return "SA";
        if (marketId === "4") return "SB";

        // Handle First Bet (sid 2 for A, sid 5 for B)
        if (marketId === "2" || marketId === "5") return "1st Bet";

        // Handle Second Bet (sid 3 for A, sid 6 for B)
        if (marketId === "3" || marketId === "6") return "2nd Bet";

        // For all other bets (Joker cards, suits, odd/even), return the teamName as is
        return teamName;
    }

    if (pathName === "teenpattioneday62" || pathName === "teen62") {
        if (String(marketId) === "1" && teamName === "Player A") return "Player A Main";
        if (String(marketId) === "2" && teamName === "Player B") return "Player B Main";

        // Consecutive Bets
        if (String(marketId) === "17" && teamName === "Player A") return "Player A Consecutive";
        if (String(marketId) === "18" && teamName === "Player B") return "Player B Consecutive";

        if (teamName && teamName.includes("Card")) {
            return teamName.replace(" -", "");
        }
    }

    if (!teamName) return "";
    if (!side) return teamName;

    const formattedSide =
        side.charAt(0).toUpperCase() + side.slice(1).toLowerCase();

    const sidePattern = new RegExp(`^(Andar|Ander|Bahar|${side})\\s*`, 'i');
    let rank = teamName.replace(sidePattern, '').trim();

    // Ensure rank is uppercase (e.g. for "A", "J", etc.)
    rank = rank.toUpperCase();

    const result = rank ? `${formattedSide} ${rank}` : formattedSide;

    const finalDenominator = denominator || "";

    if (!finalDenominator) return result;

    return `${result}/${finalDenominator}`;
};

const BetPopupNew = ({
    isMobile,
    betData,
    amount,
    setAmount,
    onClose,
    handleQuickBet,
    handleClear,
    handleSubmit,
    isLoading,
}) => {
    const amoountRef = useCallback((node) => {
        if (node !== null) {
            node.focus();
        }
    }, []);

    const pathName = useGamePathName();
    const isTab = useIsMobile(768);
    // console.log("$$$ betData", betData);
    if (!betData || betData.odds == 0) return null;

    const isValidAmount = () => {
        if (!betData) return false;
        const betAmount = parseInt(amount);
        return amount && betAmount >= betData.minBet && betAmount <= betData.maxBet;
    };

    const isDiffColor = diffBgColorGames.includes(pathName);
    // const isSpecialAB = pathName === "andarbahar3" || pathName === "ab4";
    const bgColor = getAndarBaharPopupBgColor(betData.isBack, isDiffColor ? betData.side : "");
    // const bgColor = isSpecialAB
    //     ? (betData.side === "ANDAR" ? "#fc424280" : betData.side === "BAHAR" ? "#fdcf1380" : getAndarBaharPopupBgColor(betData.isBack, ""))
    //     : getAndarBaharPopupBgColor(betData.isBack, isDiffColor ? betData.side : "");

    const isABGame = pathName.startsWith("andarbahar") || pathName === "ab4" || pathName === "ab3";
    const displayOdds = isABGame && (normalizeNumber(betData.odds) === 1 || normalizeNumber(betData.odds) === 0) ? 2 : betData?.shown_odds ?? betData.odds;

    return isMobile ? (
        <>
            <BetPopupCss />

            <Modal_wrapper
                isModalOpen={Boolean(betData)}
                // setIsModalOpen={setIsModalOpen}
                title="Place Bet"
                onClose={onClose}
                title2={<span className="casino-min-max ml-2" style={{ color: 'white' }}>
                    Range:
                    <span>{formatNumber(betData.minBet)}</span> - <span>{formatNumber(betData.maxBet)}</span>
                </span >}
            >
                {isLoading && <Loader position="absolute" />}
                <div
                    className={`casino-place-bet-box ${betData.isBack ? 'back' : 'lay'}`}
                    style={{ backgroundColor: bgColor, borderTop: isABGame ? "1px solid #ccc" : "none" }}
                >
                    <div className="bet-slip pl-0 pr-0">
                        <div className="bet-team mt-0">
                            <span className="bet-team-name">
                                {pathName.startsWith("andarbahar") || pathName === "ab4" || pathName === "teenpattioneday62" || pathName === "teen62"
                                    ? formatBetTitle(betData.teamName, betData.side, null, betData.marketId, pathName)
                                    : betData.teamName}
                            </span>
                            {!betData.hideOdds && <span className="float-right">{displayOdds ? normalizeNumber(displayOdds) : ""}</span>}
                        </div>
                    </div>

                    <div className="casino-place-bet-info">
                        <div className={`bet-input ml-0 ${betData.isBack ? 'back-border' : 'lay-border'}`}>
                            <input
                                ref={amoountRef}
                                type="number"
                                // maxLength={9}
                                placeholder="Amount"
                                className="form-control input-stake"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                onKeyPress={(e) =>
                                    e.charCode >= 48 && e.charCode <= 57
                                }
                            />
                        </div>

                        {betData?.selectedCard_Url &&
                            <span className="float-right">
                                <img src={betData?.selectedCard_Url} />
                            </span>}
                    </div>

                    <div className="casino-place-bet-button-container">
                        {betButtons.map((val) => (
                            <button key={val} className="btn btn-bet" onClick={() => handleQuickBet(val)}>
                                <span>+{val}</span>
                            </button>
                        ))}

                        <button className="bet-clear-btn btn btn-sm btn-link text-dark flex-fill text-right w-auto mw-auto" onClick={handleClear}>
                            Clear
                        </button>
                    </div>

                    <div className="casino-place-bet-action-buttons">
                        <button
                            className="btn btn-primary"
                            // disabled={!isValidAmount() || isLoading}
                            onClick={handleSubmit}
                            disabled={!Boolean(Number(amount)) || isLoading}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </Modal_wrapper>

            <style>
                {`
                    .input-stake::placeholder {
                        color: #000 !important;
                    }
                `}
            </style>
        </>

    ) : (
        <>
            <BetPopupCss />

            <div className="casino-place-bet" style={{ position: "relative" }}>
                {isLoading && <Loader position="absolute" />}

                <div className="casino-place-bet-title">
                    <span>Place Bet</span>
                    <span className="float-right casino-min-max">
                        Range:<span>{formatNumber(betData.minBet)}</span>-<span>{formatNumber(betData.maxBet)}</span>
                    </span>
                </div>

                <div className="casino-place-bet-header">
                    {["(Bet For)", "Odds", "Stake", "Profit"].map((label) => (
                        <div key={label}>{label}</div>
                    ))}
                </div>

                <div className={`casino-place-bet-box ${betData.isBack ? 'back' : 'lay'}`} style={{ backgroundColor: bgColor, borderTop: isABGame ? "1px solid #ccc" : "none" }}>
                    <div className="casino-place-bet-info">
                        <div className="bet-player">
                            <span>
                                {pathName.startsWith("andarbahar") || pathName === "ab4" || pathName === "teenpattioneday62" || pathName === "teen62"
                                    ? formatBetTitle(betData.teamName, betData.side, null, betData.marketId, pathName)
                                    : betData.teamName}
                            </span>
                        </div>

                        <div className="odds-box">
                            <input
                                type="text"
                                className="form-control"
                                disabled
                                value={displayOdds}
                            />
                            <img
                                src="/assets/images/arrow-down.svg"
                                className="arrow-up"
                                alt="arrow up"
                            />
                            <img
                                src="/assets/images/arrow-down.svg"
                                className="arrow-down"
                                alt="arrow down"
                            />
                        </div>

                        <div className={`bet-input ${betData.isBack ? 'back-border' : 'lay-border'}`}>
                            <input
                                ref={amoountRef}
                                type="text"
                                className="form-control input-stake"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                onKeyPress={(e) =>
                                    e.charCode >= 48 && e.charCode <= 57
                                }
                            />
                        </div>

                        <div>{Math.floor(displayOdds * amount - amount)}</div>

                        <span className="float-right"><img src="https://wver.sprintstaticdata.com/v207/static/front/img/joker1/9.png" /></span>
                    </div>

                    <div className="casino-place-bet-button-container">
                        {betButtons.map((val) => (
                            <button key={val} className="btn btn-bet" onClick={() => handleQuickBet(val)}>
                                <span>+{val}</span>
                            </button>
                        ))}

                        <button className="btn btn-sm btn-link text-dark flex-fill text-right w-auto mw-auto" onClick={handleClear}>
                            Clear
                        </button>
                    </div>

                    <div className="casino-place-bet-action-buttons">
                        <button className="btn btn-reset" onClick={handleClear}>
                            Reset
                        </button>

                        <button
                            className="btn btn-primary"
                            // disabled={!isValidAmount() || isLoading}
                            disabled={!Boolean(Number(amount)) || isLoading}
                            onClick={handleSubmit}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>

            <style>
                {`
                    .input-stake::placeholder {
                        color: #000 !important;
                    }
                `}
            </style>
        </>
    );
};

export default BetPopupNew;
