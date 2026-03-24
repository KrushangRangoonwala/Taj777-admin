import React from "react";
import useIsMobile from "../../../hooks/useIsMobile";

const Result_UniqueRoulette = ({ modalContent }) => {
    const isMobile = useIsMobile();

    if (!modalContent) return null;

    const winner = modalContent.winner || modalContent.win || modalContent.result || "N/A";
    const num = parseInt(winner);

    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    let bgColor = "#111";
    if (num === 0) bgColor = "#1a6a48";
    else if (redNumbers.includes(num)) bgColor = "#d0021b";

    return (
        <div style={{ padding: "20px", textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: "18px", marginBottom: "15px" }}>Winner Number</div>
            <div
                style={{
                    display: "inline-flex",
                    width: "80px",
                    height: "80px",
                    backgroundColor: bgColor,
                    borderRadius: "50%",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "36px",
                    fontWeight: "bold",
                    border: "4px solid #fff",
                    boxShadow: "0 0 15px rgba(0,0,0,0.5)"
                }}
            >
                {winner}
            </div>
        </div>
    );
};

export default Result_UniqueRoulette;
