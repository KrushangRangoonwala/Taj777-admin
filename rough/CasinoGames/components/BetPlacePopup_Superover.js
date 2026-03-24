import React, { useCallback, useEffect, useRef } from "react";
import styles from './aa.module.css';
import Modal_wrapper from "./Modal_wrapper";
import { formatNumber } from "../../../utilies/helpers";
import { useGamePathName } from "../../../hooks/useGetFileData";
// import { useGamePathName } from "../../../hooks/useGamePathName";

const BetPlacePopup_Superover = ({
    isMobile,
    betData,
    amount,
    setAmount,
    onClose,
    handleQuickBet,
    handleClear,
    handleSubmit,
    isValidAmount,
    isLoading,
}) => {
    const game_path = useGamePathName();
    const is_5FiveCricket = game_path === "5fivecricket";

    const amoountRef = useCallback((node) => {
        if (node !== null) {
            node.focus();
        }
    }, []);

    if (!betData) return null;
    console.log("betData", betData);
    const { isBottomShown, team_1, team_2, game_name } = betData;

    if (isMobile) {
        return (
            <Modal_wrapper
                isModalOpen={Boolean(betData)}
                // setIsModalOpen={setIsModalOpen}
                title="Bet Slip"
                onClose={onClose}
            >
                <div>
                    <div className={`${styles['bet-slip-box']} ${betData.isBack ? styles.back : styles.lay}`} style={{ position: 'relative' }}>
                        <div className={styles['bet-slip']}>
                            <div className={styles['bet-nation']}><span>{game_name}</span></div>
                            <div className={styles['match-result']}>
                                {betData.marketTitle || "Market"}
                            </div>
                            <div className={styles['bet-team']}>
                                <span className={styles['bet-team-name']}>{betData.teamName}</span>
                                <span className={styles['float-right']}>{betData.odds}</span>
                            </div>
                        </div>

                        <div className={`${styles['bet-input']} ${betData.isBack ? styles['back-border'] : styles['lay-border']}`} style={{ zIndex: 999999 }}>
                            <input
                                ref={amoountRef}
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Amount"
                                className={styles['form-control']}
                            />
                            {/* <span style={{ position: 'absolute', right: '-50px', top: '1px' }}>Profit: 19</span> */}
                        </div>

                        {/* <span style={{ position: 'absolute', right: '240px', top: '61px' }}>Profit: 19</span> */}

                        <div className={styles['bet-buttons']}>
                            {[25, 50, 100, 200, 500, 1000].map(v => (
                                <button key={v} className={`${styles.btn} ${styles['btn-primary']}`} onClick={() => handleQuickBet(v)}>
                                    <span>+{v}</span>
                                </button>
                            ))}
                            <button className={`${styles.btn} ${styles['btn-sm']} ${styles['btn-link']} ${styles['text-dark']} ${styles['flex-fill']} ${styles['text-right']} ${styles['w-auto']} mw-auto`} onClick={handleClear}>
                                Clear
                            </button>
                        </div>

                        {is_5FiveCricket &&
                            <div className={`${styles['confirm-bets']} confirm-bets`}>
                                <div className={`${styles['custom-control']} ${styles['custom-switch']}`}>
                                    <input id="autocon-2" type="checkbox" name="autocon-2" className={`${styles['custom-control-input']} custom-control-input`} value="true" />
                                    <label for="autocon-2" className={`${styles['custom-control-label']} custom-control-label`}>
                                        Auto Confirm Bet
                                    </label>
                                </div>
                            </div>}

                    </div>
                    <div className={styles['place-bet-btn']}>
                        <button
                            className={`${styles.btn} ${styles['btn-primary']} ${styles['btn-block']}`}
                            disabled={!isValidAmount() || isLoading}
                            onClick={handleSubmit}
                        >
                            <span>{isLoading ? "Placing..." : "Place Bet"}</span>
                        </button>
                    </div>

                    {isBottomShown &&
                        <div className={styles['container-fluid']}>
                            <div className={`${styles.row} ${styles.row5} ${styles['mt-2']}`}>
                                <div className={styles['col-4']}><span>{team_1}</span></div>
                                <div className={`${styles['col-4']} ${styles['text-center']} ${styles['text-success']}`}><span></span></div>
                                <div className={`${styles['col-4']} ${styles['text-right']} ${styles['text-danger']}`}><span></span></div>
                            </div>
                            <div className={`${styles.row} ${styles.row5} ${styles['mt-2']}`}>
                                <div className={styles['col-4']}><span>{team_2}</span></div>
                                <div className={`${styles['col-4']} ${styles['text-center']} ${styles['text-success']}`}><span></span></div>
                                <div className={`${styles['col-4']} ${styles['text-right']} ${styles['text-danger']}`}><span></span></div>
                            </div>
                        </div>}
                </div>
            </Modal_wrapper>
        );
    }

    return (
        <div className={styles['bet-slip-container']}>
            <div>
                <h4 className={`${styles['mb-0']} ${styles['bet-slip-title']}`}>Bet Slip</h4>
            </div>
            <div className={`${styles['bet-slip-box']} ${betData.isBack ? styles.back : styles.lay}`}>
                <div className={styles['bet-slip']}>
                    <div className={styles['bet-nation']}>
                        <span>Mini SuperOver</span>
                        <a href="javascript:void(0)" className={`${styles['close-bet']} ${styles['float-right']}`} onClick={onClose}>
                            <img src="https://wver.sprintstaticdata.com/v194/static/front/img/close.svg" alt="close" />
                        </a>
                    </div>
                    <div className={styles['match-result']}>
                        {betData.marketTitle || "Market"}
                    </div>
                    <div className={styles['bet-team']}>
                        <span title={betData.teamName} className={styles['bet-team-name']}>
                            {betData.teamName}
                        </span>
                        <span className={styles['float-right']}>{betData.odds}</span>
                    </div>
                </div>
                <div className={`${styles['bet-input']} ${betData.isBack ? styles['back-border'] : styles['lay-border']}`}>
                    <input
                        ref={amoountRef}
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Amount"
                        className={styles['form-control']}
                    />
                </div>
                <div className={styles['bet-buttons']}>
                    {[25, 50, 100, 200, 500, 1000].map(v => (
                        <button key={v} className={`${styles.btn} ${styles['btn-primary']}`} onClick={() => handleQuickBet(v)}>
                            <span>+{v}</span>
                        </button>
                    ))}
                    <button className={`${styles.btn} ${styles['btn-sm']} ${styles['btn-link']} ${styles['text-dark']} ${styles['flex-fill']} ${styles['text-right']} ${styles['w-auto']} mw-auto`} onClick={handleClear}>
                        Clear
                    </button>
                </div>
                <div className={styles['place-bet-btn']}>
                    <button
                        className={`${styles.btn} ${styles['btn-primary']} ${styles['btn-block']}`}
                        disabled={!isValidAmount() || isLoading}
                        onClick={handleSubmit}
                    >
                        <span>{isLoading ? "Placing..." : "Place Bet"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BetPlacePopup_Superover;
