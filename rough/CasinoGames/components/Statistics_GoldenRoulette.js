import React, { useMemo } from "react";
import useIsMobile from "../../../hooks/useIsMobile";

const redNumbers = [
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];

const calculateStats = (results) => {
    const total = results.length;
    if (total === 0) return null;

    let stats = {
        first12: 0,
        second12: 0,
        third12: 0,
        col1: 0,
        col2: 0,
        col3: 0,
        red: 0,
        black: 0,
        odd: 0,
        even: 0,
        low: 0,
        high: 0,
    };

    results.forEach((r) => {
        const num = parseInt(r.result || r.winner || r.win || "0");
        if (isNaN(num)) return;
        if (num === 0) return;

        if (num >= 1 && num <= 12) stats.first12++;
        else if (num >= 13 && num <= 24) stats.second12++;
        else if (num >= 25 && num <= 36) stats.third12++;

        if (num % 3 === 1) stats.col1++;
        else if (num % 3 === 2) stats.col2++;
        else if (num % 3 === 0) stats.col3++;

        if (redNumbers.includes(num)) stats.red++;
        else stats.black++;

        if (num % 2 !== 0) stats.odd++;
        else stats.even++;

        if (num >= 1 && num <= 18) stats.low++;
        else if (num >= 19 && num <= 36) stats.high++;
    });

    const getPct = (val) => ((val / total) * 100).toFixed(0) + "%";

    return {
        first12: getPct(stats.first12),
        second12: getPct(stats.second12),
        third12: getPct(stats.third12),
        col1: getPct(stats.col1),
        col2: getPct(stats.col2),
        col3: getPct(stats.col3),
        red: getPct(stats.red),
        black: getPct(stats.black),
        odd: getPct(stats.odd),
        even: getPct(stats.even),
        low: getPct(stats.low),
        high: getPct(stats.high),
    };
};

const Statistics_GoldenRoulette = ({ socketData, lastResults }) => {
    const isMobile = useIsMobile();

    const stats = useMemo(() => {
        if (socketData?.g) {
            const serverStats = socketData.g;
            return {
                first12: serverStats.C1st12 ? serverStats.C1st12 + "%" : "0%",
                second12: serverStats.C2nd12 ? serverStats.C2nd12 + "%" : "0%",
                third12: serverStats.C3rd12 ? serverStats.C3rd12 + "%" : "0%",
                col1: serverStats.R1st ? serverStats.R1st + "%" : "0%",
                col2: serverStats.R2nd ? serverStats.R2nd + "%" : "0%",
                col3: serverStats.R3rd ? serverStats.R3rd + "%" : "0%",
                red: serverStats.Red ? serverStats.Red + "%" : "0%",
                black: serverStats.Blk ? serverStats.Blk + "%" : "0%",
                odd: serverStats.Odd ? serverStats.Odd + "%" : "0%",
                even: serverStats.Evn ? serverStats.Evn + "%" : "0%",
                low: serverStats.T01to18 ? serverStats.T01to18 + "%" : "0%",
                high: serverStats.T19to36 ? serverStats.T19to36 + "%" : "0%",
            };
        }
        return calculateStats(lastResults || []);
    }, [socketData, lastResults]);

    if (!stats || isMobile) return null;

    return (
        <div className="casino-place-bet" style={{ marginBottom: "10px" }}>
            <div className="casino-place-bet-title">
                <span>Statistics</span>
            </div>
            <div
                style={{
                    backgroundColor: "#2e3439",
                    padding: "0",
                    border: "1px solid #4b5563",
                    marginRight: "5px",
                    marginLeft: "5px",
                }}
            >
                {/* Row 1: Dozens */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        borderBottom: "1px solid #4b5563",
                    }}
                >
                    <StatBox label="1st12" value={stats.first12} border />
                    <StatBox label="2nd12" value={stats.second12} border />
                    <StatBox label="3rd12" value={stats.third12} />
                </div>
                {/* Row 2: Columns */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        borderBottom: "1px solid #4b5563",
                    }}
                >
                    <StatBox label="1-34" value={stats.col1} border />
                    <StatBox label="2-35" value={stats.col2} border />
                    <StatBox label="3-36" value={stats.col3} />
                </div>
                {/* Row 3: Colors */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        borderBottom: "1px solid #4b5563",
                    }}
                >
                    <StatBox label="Red" value={stats.red} border />
                    <StatBox label="Black" value={stats.black} />
                </div>
                {/* Row 4: Odd/Even */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        borderBottom: "1px solid #4b5563",
                    }}
                >
                    <StatBox label="Odd" value={stats.odd} border />
                    <StatBox label="Even" value={stats.even} />
                </div>
                {/* Row 5: High/Low */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                    <StatBox label="1to18" value={stats.low} border />
                    <StatBox label="19to36" value={stats.high} />
                </div>
            </div>
        </div>
    );
};

const StatBox = ({ label, value, border }) => (
    <div
        style={{
            padding: "5px",
            color: "#a4a8ae",
            fontSize: "12px",
            borderRight: border ? "1px solid #4b5563" : "none",
        }}
    >
        {label}:{" "}
        <span
            style={{
                float: "right",
                color: "white",
                fontWeight: "bold",
            }}
        >
            {value}
        </span>
    </div>
);

export default Statistics_GoldenRoulette;
