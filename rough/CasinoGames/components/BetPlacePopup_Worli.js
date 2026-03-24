import React from "react";
import useIsMobile from "../../../hooks/useIsMobile";
import { formatNumber, getAndarBaharPopupBgColor, getImage, normalizeNumber } from "../../../utilies/helpers";
import { useGamePathName } from "../../../hooks/useGetFileData";
import { BetPopupCss } from "./CssStyle";
import Loader from "../../Loader/Loader";
import Modal_wrapper from "./Modal_wrapper";

const diffBgColorGames = ["andarbahar1", "andarbahar3", "ab4"];
const betButtons = [25, 50, 100, 200, 500, 1000];

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
    const pathName = useGamePathName();
    const isTab = useIsMobile(768);
    console.log("$$$ betData", betData);
    if (!betData) return null;

    const isValidAmount = () => {
        if (!betData) return false;
        const betAmount = parseInt(amount);
        return amount && betAmount >= betData.minBet && betAmount <= betData.maxBet;
    };

    const isDiffColor = diffBgColorGames.includes(pathName);
    const bgColor = getAndarBaharPopupBgColor(betData.isBack, isDiffColor ? betData.side : "");

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
                <div>
                    <div className={`casino-place-bet-box ${betData.isBack ? 'back' : 'lay'}`}>
                        <div className="bet-slip pl-0 pr-0">
                            <div className="bet-team mt-0">
                                <span className="bet-team-name">
                                    {betData.teamName}
                                </span>
                                <span className="float-right">{normalizeNumber(betData.odds)}</span>
                            </div>
                        </div>

                        <div className="casino-place-bet-info">
                            <div className={`bet-input ml-0 ${betData.isBack ? 'back-border' : 'lay-border'}`}>
                                <input
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
                            <button
                                className="btn btn-primary"
                                // disabled={!isValidAmount() || isLoading}
                                onClick={handleSubmit}
                                disabled={!Boolean(amount)}
                            >
                                Submit
                            </button>
                        </div>
                    </div>

                    <div className="casino-place-bet-box">
                        <h6 className="mt-2">Total Pana (10)</h6>

                        <div className="worli-cards-container mt-1">
                        {[
                            134, 234, 334, 340, 344,
                            345, 346, 347, 348, 349,
                        ].map((num) => (
                            <div key={num} className="worli-cards-block">
                            <span>{num}</span>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </Modal_wrapper>
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

                <div className={`casino-place-bet-box ${betData.isBack ? 'back' : 'lay'}`}>
                    <div className="casino-place-bet-info">
                        <div className="bet-player">
                            <span>{betData.teamName}</span>
                        </div>

                        <div className="odds-box">
                            <input
                                type="text"
                                className="form-control"
                                disabled
                                value={betData.odds}
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
                                type="text"
                                className="form-control input-stake"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                onKeyPress={(e) =>
                                    e.charCode >= 48 && e.charCode <= 57
                                }
                            />
                        </div>

                        <div>{Math.floor(betData.odds * amount - amount)}</div>
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
                            disabled={!Boolean(amount)}
                            onClick={handleSubmit}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BetPopupNew;
