import React, { useState } from "react";
import lastResultTextMap from "./LastResultTextMap";
import { useGetFileData } from "../../../../hooks/useGetFileData";
import Result_parent from "./Result_parent";

const LastResult = ({ results = [], isOpen = true }) => {
    const [mid, setMid] = useState(false);
    const { game_type, isBgTransparent } = useGetFileData();
    // const { getResultTxt, getColorClass } = lastResultTextMap[game_type] || lastResultTextMap.DEFAULT;
    const getResultTxt = lastResultTextMap[game_type]?.getResultTxt || lastResultTextMap.DEFAULT.getResultTxt;
    const getColorClass = lastResultTextMap[game_type]?.getColorClass || lastResultTextMap.DEFAULT.getColorClass;


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

            <Result_parent mid={mid} setMid={setMid} game_type={game_type} />
        </div>
    );
};

export default LastResult;
