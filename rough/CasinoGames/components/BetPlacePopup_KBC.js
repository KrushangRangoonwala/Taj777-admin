import React from "react";
import useIsMobile from "../../../hooks/useIsMobile";
import { getAndarBaharPopupBgColor } from "../../../utilies/helpers";
import { useGamePathName } from "../../../hooks/useGetFileData";
import { KbcBetPopupCss } from "./CssStyle";
import Loader from "../../Loader/Loader";

const diffBgColorGames = ["andarbahar1", "andarbahar3", "ab4"];

const betItems = ["Black", "Even", "Up", "456", "Heart"];
const betButtons = [25, 50, 100, 200, 500, 1000];

const BetPlacePopup_KBC = ({
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
    console.log("betData", betData);
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
            <KbcBetPopupCss />

            <div className="modal-content place-modal" tabIndex={-1} style={{ position: "relative" }}>
                {isLoading && <Loader position="absolute" />}

                <header className="modal-header">
                    <h5 className="modal-title">
                        Place Bet
                        <span className="casino-min-max ml-2">
                            Range:<span>{betData.minBet}</span>-<span>{betData.maxBet}</span>
                        </span>
                    </h5>
                    <button type="button" className="close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </header>

                <div className="modal-body">
                    <div className={`casino-place-bet-box ${betData.isBack ? 'back' : 'lay'}`}>
                        <div className="casino-place-bet-box">
                            <div className="kbcbtesbox">
                                {betItems.map((item) => (
                                    <div className="bet-box" key={item}>
                                        <span>{item}</span>
                                        <i className="float-right fas fa-times"></i>
                                    </div>
                                ))}

                                <div className={`bet-input ${betData.isBack ? 'back-border' : 'lay-border'}`}>
                                    <input
                                        type="number"
                                        placeholder="Amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="form-control input-stake"
                                        onKeyPress={(e) =>
                                            e.charCode >= 48 && e.charCode <= 57
                                        }
                                    />
                                </div>
                            </div>

                            <div className="hfquitbtns w-100">
                                <button className="btn btn-primary hbtn selected">
                                    4 Cards Quit
                                </button>
                                <button className="btn btn-primary fbtn">
                                    50-50 Quit
                                </button>
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

                            <div className="casino-place-bet-action-buttons mt-2">
                                <button
                                    className="btn btn-primary"
                                    // disabled={!isValidAmount() || isLoading}
                                    disabled={!Boolean(amount)}
                                    onClick={handleSubmit}
                                >
                                    Submit
                                </button>
                                <button className="btn btn-reset mt-1" onClick={handleClear}>
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    ) : (
        <>
            <div style={{ position: "relative" }}>
                {isLoading && <Loader position="absolute" />}

                <KbcBetPopupCss />
                <div className="casino-place-bet-title" >
                    <span>Place Bet</span>
                    <span className="float-right casino-min-max">
                        Range:<span>{betData.minBet}</span>-<span>{betData.maxBet}</span>
                    </span>
                    <span className="float-right" onClick={onClose} style={{ cursor: 'pointer' }}>
                        <i className="fas fa-times"></i>
                    </span>
                </div>

                <div className={`casino-place-bet-box ${betData.isBack ? 'back' : 'lay'}`}>
                    <div className="kbcbtesbox">
                        <div className="bet-box">
                            <span>{betData.teamName}</span>
                            <i className="float-right fas fa-times" onClick={onClose}></i>
                        </div>

                        <div className="bet-box">{/* empty */}</div>

                        <div className="bet-box">
                            <span>Up</span>
                            <i className="float-right fas fa-times"></i>
                        </div>

                        <div className="bet-box">
                            <span>456</span>
                            <i className="float-right fas fa-times"></i>
                        </div>

                        <div className="bet-box">
                            <span>Club</span>
                            <i className="float-right fas fa-times"></i>
                        </div>

                        <div className="bet-input back-border">
                            <input
                                type="text"
                                id="placebetAmountWeb"
                                maxLength={9}
                                onKeyPress={(e) =>
                                    e.charCode >= 48 && e.charCode <= 57
                                }
                                className="form-control input-stake"
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

export default BetPlacePopup_KBC;
