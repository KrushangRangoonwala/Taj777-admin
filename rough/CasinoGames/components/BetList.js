import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import Modal_wrapper from "./Modal_wrapper";
import BetListMobNew from "../../../pages/BetListMobNew";

function is_runs_and_odds(bet) {
    const market_type = bet?.market_type || bet?.event_type;
    const market_name = bet?.market_name;
    return (
        (market_type.includes("MOGAMBO") && market_name.includes("3 CARD TOTAL"))
        || (market_type.includes("PATTI2") && market_name.includes("TOTAL"))
        || (market_type.includes("TRIO") && market_name.includes("Session"))
        || (market_type.includes("PATTI2") && market_name.includes("Total"))
    )
}

function isValue(bet) {
    const market_type = bet?.market_type || bet?.event_type;
    return (
        (market_type.includes("RACE_20") && (bet?.market_id == 5 || bet?.market_id == 6))
        // || 
    )
}

const BetList = ({
    isMobile,
    openBets,
    isOpen,
    onOpen,
    onClose,
}) => {
    // console.log('@@ openBets', openBets)
    const isLottery = openBets?.[0]?.event_type === "LOTTCARD";
    const isSuperOver = openBets?.[0]?.event_type?.includes("SUPER_OVER") || openBets?.[0]?.event_type?.includes("FIVE_5_CRICKET");

    if (openBets.length === 0) return (<div></div>);

    if (isMobile) {
        return (
            <>
                {openBets.length > 0 && (
                    <div
                        className="market-show-icon d-none-desktop"
                        role="button"
                        tabIndex={0}
                        onClick={onOpen}
                    >
                        <span>{openBets.length}</span>
                    </div>
                )}

                {isSuperOver
                    ? <BetListMobNew
                        onClose={onClose}
                        isOpen={isOpen}
                        isCasinoSuperover={true}
                        superoverOpenBets={openBets}
                    />

                    : <Modal_wrapper
                        isModalOpen={isOpen}
                        title={`My Bets`}
                        onClose={onClose}
                        isBetList={true}
                    >
                        {isLottery
                            ?
                            <>
                                <div className="casino-my-bet">
                                    <div className="lottery-my-bets">
                                        {openBets.length > 0 ? (
                                            openBets.map((bet, idx) => (
                                                <div
                                                    className="lottery-my-bet-box"
                                                    key={idx}
                                                    style={{ backgroundImage: "url(/assets/images/lottery-pattern.png)" }}
                                                >
                                                    <div><span style={{ textTransform: "capitalize" }}>{bet?.market_name?.split(" ")[0]}</span> <span> - </span> <span>{bet?.market_name?.split(" ")[1]}</span></div>
                                                    <div>{bet.bet_stack || bet.stake}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-bets">No Active Bets</div>
                                        )}
                                    </div>
                                </div>
                            </>
                            : <>
                                {/* HEADER */}
                                <div className="casino-place-bet-header">
                                    <div>Matched Bets</div>
                                    <div>Odds</div>
                                    <div>Stake</div>
                                </div>

                                {/* BODY */}
                                <div className="casino-place-bet-body">
                                    {openBets.length > 0 ? (
                                        openBets.map((bet, index) => {
                                            const run = is_runs_and_odds(bet) ? bet.bet_odds : null;
                                            const odds = is_runs_and_odds(bet) ? bet.bet_runs : bet.bet_odds || bet.odds;
                                            const stack = bet.bet_stack || bet.stake;
                                            const aa = isValue(bet) ? ` / ${bet.bet_margin_used}` : ''; // race20 - total card/points market

                                            return (
                                                <div
                                                    key={index}
                                                    className={`casino-place-bet-row ${(bet.bet_type || "back").toLowerCase() === "back"
                                                        ? "back-border"
                                                        : "lay-border"
                                                        }`}
                                                >
                                                    <div>{bet.market_name}{run ? ` - ${run}` : ''}{aa}</div>
                                                    <div>{odds}</div>
                                                    <div>{stack}</div>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className="no-bets">No Active Bets</div>
                                    )}
                                </div>
                            </>}
                    </Modal_wrapper >}
            </>
        );
    } else {
        return (
            <div className="mt-2">
                {/* Title */}
                <div
                    style={{
                        maxWidth: "375px",
                        margin: "16px auto 6px",
                        fontWeight: "600",
                        color: "#aaafb5",
                        fontSize: "13px",
                    }}
                >
                    MY BETS
                </div>

                {/* Container */}
                <div
                    style={{
                        maxWidth: "375px",
                        margin: "0 auto",
                        backgroundColor: "#1a202c",
                        borderRadius: "4px",
                        overflow: "hidden",
                        border: "1px solid #2d3748",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "3fr 1fr 1fr",
                            backgroundColor: "#1a6a48",
                            color: "#ffffff",
                            fontSize: "12px",
                            padding: "6px 8px",
                            borderBottom: "1px solid #2d3748",
                        }}
                    >
                        <div>Matched Bets</div>
                        <div style={{ textAlign: "right" }}>Odds</div>
                        <div style={{ textAlign: "right" }}>Stake</div>
                    </div>

                    {/* Bets List */}
                    <div
                        style={{
                            maxHeight: "200px",
                            overflowY: "auto",
                            scrollbarWidth: "thin",
                            scrollbarColor: "#4a5568 #2d3748",
                        }}
                    >
                        {/* <h5 style={{ color: "white" }}>{openBets.length}</h5> */}
                        {openBets.map((bet, index) => {
                            const betType = (bet.bet_type || "back").toLowerCase();

                            return (
                                <div
                                    key={bet.bet_id || index}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "3fr 1fr 1fr",
                                        fontSize: "13px",
                                        padding: "8px",
                                        borderBottom: "1px solid #2d3748",
                                        backgroundColor:
                                            index % 2 === 0 ? "#1a202c" : "#1f2937",
                                        color: "#e2e8f0",
                                        borderLeft: `5px solid ${betType === "back" ? "#72bbef" : "#f994ba"
                                            }`,
                                    }}
                                >
                                    {/* Bet Info */}
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <div
                                            style={{
                                                color: "#ffffff",
                                                fontWeight: "500",
                                                fontSize: "14px",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {bet.market_name} –{" "}
                                            <span style={{ fontWeight: "600" }}>
                                                {bet.bet_type || "Back"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Odds */}
                                    <div style={{ textAlign: "right" }}>
                                        {bet.bet_odds}
                                    </div>

                                    {/* Stake */}
                                    <div style={{ textAlign: "right" }}>
                                        {bet.bet_stack}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        )
    }
};

export default BetList;
