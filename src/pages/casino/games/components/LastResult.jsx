import React from "react";

const LastResult = ({ results = [], gameName = "", resultPath = "", className = "", showRawLabel = false }) => {
    const renderResultLabel = (res) => {
        if (showRawLabel) return res;
        if (gameName?.toLowerCase().includes("teen") || gameName?.toLowerCase().includes("one-day") || gameName?.toLowerCase().includes("1card")) {
            if (res === "B") return "D";
            if (res === "A") return "P";
        }
        return res;
    };

    const renderResultClass = (res) => {
        if (res === "B") return "resultb";
        if (res === "A") return "resulta";
        if (res === "T") return "resulttie";
        return "";
    };

    return (
        <div className={`casino-video-last-results ${className}`}>
            {results.map((result, index) => (
                <span key={index} className={renderResultClass(result.res)}>
                    {renderResultLabel(result.res)}
                </span>
            ))}
            <a href={`/admin/reports/casinoresult/${resultPath || "poker"}`} className="result-more">
                <b>...</b>
            </a>
        </div>
    );
};

export default LastResult;
