import React from 'react';

const RouletteChips = ({
    selectedChip,
    setSelectedChip,
    handleBetAction,
    isLocked,
    getChipColor,
    showUndo = true,
    showRepeat = true,
    showClear = true,
    chips = [25, 50, 100, 200, 500, 1000]
}) => {
    return (
        <div
            style={{
                width: "60px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1px",
                paddingTop: "0px",
                // backgroundColor: "#2e3439",
            }}
        >
            {!isLocked && (
                <>
                    {/* Chips */}
                    {chips.map((val) => (
                        <div
                            key={val}
                            className={`casino-coin ${selectedChip === val ? "active" : ""}`}
                            onClick={() => setSelectedChip(val)}
                            style={{
                                transform: selectedChip === val ? "scale(1.3)" : "scale(1)",
                                transition: "all 0.2s ease",
                                cursor: "pointer",
                                margin: selectedChip === val ? "6px 0" : "2px 0",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: selectedChip === val ? 100 : 1,
                                position: "relative",
                            }}
                        >
                            <div
                                className="bet-chip-holder"
                                style={{
                                    "--g-chip-inner-color": getChipColor(val),
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <div className="bet-chip" style={{ margin: 0 }}>
                                    <div className="bet-chip-front"></div>
                                    <div className="bet-chip-top"></div>
                                    <div className="bet-chip-amount">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 108 108"
                                            className="bet-chip-amount-in"
                                        >
                                            <text
                                                x="50%"
                                                y="53.5%"
                                                dominantBaseline="middle"
                                                textAnchor="middle"
                                                fill="#fff"
                                                fontSize="32"
                                                fontWeight="700"
                                                className="bet-chip-amount-label"
                                            >
                                                {val}
                                            </text>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Action Buttons */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            marginTop: "10px",
                            // gap: "5px",
                        }}
                    >
                        {/* Undo */}
                        {showUndo && (
                            <>
                                <div
                                    onClick={() => handleBetAction("undo")}
                                    style={{
                                        backgroundColor: "#d0021b",
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        cursor: "pointer",
                                    }}
                                >
                                    <i className="fas fa-undo" style={{ color: "#fff" }}></i>
                                </div>
                                <span
                                    style={{
                                        fontSize: "12px",
                                        color: "#AAAFB5",
                                        textAlign: "center",
                                        // marginBottom: "5px"
                                    }}
                                >
                                    Undo Bet
                                </span>
                            </>
                        )}

                        {/* Repeat */}
                        {showRepeat && (
                            <>
                                <div
                                    onClick={() => handleBetAction("repeat")}
                                    style={{
                                        backgroundColor: "#f18521",
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        cursor: "pointer",
                                    }}
                                >
                                    <i className="fas fa-redo" style={{ color: "#fff" }}></i>
                                </div>
                                <span
                                    style={{
                                        fontSize: "12px",
                                        color: "#AAAFB5",
                                        textAlign: "center",
                                        // marginBottom: "5px"
                                    }}
                                >
                                    Repeat
                                </span>
                            </>
                        )}

                        {/* Clear */}
                        {showClear && (
                            <>
                                <div
                                    onClick={() => handleBetAction("clear")}
                                    style={{
                                        backgroundColor: "#b59920",
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        cursor: "pointer",
                                    }}
                                >
                                    <i className="fas fa-trash" style={{ color: "black" }}></i>
                                </div>
                                <span
                                    style={{
                                        fontSize: "12px",
                                        color: "#AAAFB5",
                                        textAlign: "center",
                                    }}
                                >
                                    Clear
                                </span>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default RouletteChips;
