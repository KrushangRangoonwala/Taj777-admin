import React from "react";
import lastResultTextMap from "./LastResultTextMap";
import { useGetFileData } from "../../../../hooks/useGetFileData";

const LastResult = ({ results = [], isOpen, mid, setMid }) => {
    const { game_type, isBgTransparent } = useGetFileData();
    const { getResultTxt, getColorClass } = lastResultTextMap[game_type] || lastResultTextMap.DEFAULT;

    return (
        <div className={`casino-video-last-results ${isOpen ? "" : "hide-lr"}`}>
            {results.map((result, index) => {
                const resultCode = result.win || result.res;
                return (
                    <span
                        key={index}
                        className={getColorClass(resultCode) || ""}
                        onClick={() => setMid(result?.mid)}
                        style={{ backgroundColor: isBgTransparent ? "transparent" : "", boxShadow: isBgTransparent ? "none" : "" }}
                    >
                        {String(getResultTxt(resultCode)) || resultCode}
                    </span>
                );
            })}
            <a href={`/admin/reports/casinoresult/${game_type}`} className="result-more">
                <b>...</b>
            </a>
        </div>
    );
};

export default LastResult;
