import React, { useState } from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import useIsMobile from "../../../hooks/useIsMobile";
import Result_Parent from "./Result_Parent";

const LastResults = ({
    hideResults,
    lastResults,
    getResultTxt,
    getColorClass,

    config,
    formatResultFn,
    ResultModal,
    onResultClick
}) => {
    const [mid, setMid] = useState();
    const details = useGetFileData();
    if (details) {
        var { CODE, game_name, game_type } = details;
    } else {
        var { marketType: CODE, socketRoom: game_type, modalTitle: game_name, } = config;
    }

    const isMobile = useIsMobile();

    if (hideResults) return null;

    const onSpanClick = (e, result) => {
        e.preventDefault();
        setMid(result.mid);
    }

    function Box() {
        return (
            <div className="lottery-result-group">
                <div className="lottery-result-icon">8</div>
                <div className="lottery-result-icon">9</div>
                <div className="lottery-result-icon">2</div>
            </div>
        )
    }


    return (
        <div className="lottery-last-result d-none-desktop w-100">
            <div className="lottery-last-result-title">
                <div>Last Results</div>
            </div>

            {lastResults && lastResults.length > 0 ? (
                <Box />
            ) : (
                <span className="text-white text-center w-100">
                    No results available
                </span>
            )}
        </div>
    );
};

export default LastResults;
