import React, { useState } from "react";
import { getImage } from "../../../../utilies/helpers";
import ResultModal from "./ResultModal";

const LastResult = ({ results = [], gameName = "", resultPath = "", className = "", showRawLabel = false, showImage = false, imagePath = "cards", isResultModalOpen, setIsResultModalOpen }) => {
    const renderResultLabel = (res) => {
        if (showImage) {
            let imgName = res;
            if (gameName?.toLowerCase().includes("race 20") || resultPath?.includes("race20")) {
                const mapping = { "1": "spade", "2": "heart", "3": "club", "4": "diamond" };
                imgName = mapping[res] || res;
            }
            return <img src={getImage(imgName, imagePath)} alt={res} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />;
        }
        if (showRawLabel) return res;

        if (resultPath?.startsWith("btable")) {
            const mapping = { "1": "A", "2": "B", "3": "C", "4": "D", "5": "E", "6": "F" };
            return mapping[res] || res;
        }
        const isAB = gameName?.toLowerCase().includes("andar bahar") || resultPath?.includes("ab3") || resultPath?.includes("ab4") || resultPath?.includes("ab204");
        if (isAB || resultPath === "trio" || resultPath === "Trio") return "R";

        if (resultPath === "war") return "R";
        if (resultPath?.startsWith("baccarat") || gameName?.toLowerCase().includes("baccarat")) {
            const mapping = { "1": "P", "2": "B", "3": "T", "P": "P", "B": "B", "T": "T" };
            return mapping[String(res).trim()] || res;
        }

        if (gameName?.toLowerCase().includes("amar akbar anthony")) {
            if (res === "1" || res === "A") return "A";
            if (res === "2" || res === "B") return "B";
            if (res === "3" || res === "C") return "C";
        }
        if (gameName?.toLowerCase().includes("teen") || gameName?.toLowerCase().includes("one-day") || gameName?.toLowerCase().includes("1card")) {
            if (res === "B") return "D";
            if (res === "A") return "P";
            if (res === "T" || res === "R") return "R";
        }
        if (gameName?.toLowerCase().includes("race to 2nd") || resultPath?.includes("race2")) {
            const mapping = { "1": "A", "2": "B", "3": "C", "4": "D", "A": "A", "B": "B", "C": "C", "D": "D" };
            return mapping[String(res).trim()] || res;
        }
        if (gameName?.toLowerCase().includes("race to 17") || resultPath?.includes("race17") || resultPath?.includes("raceto17")) {
            const mapping = { "1": "Y", "0": "N" };
            return mapping[String(res).trim()] || res;
        }
        if (gameName?.toLowerCase().includes("queen") || resultPath?.includes("queen")) {
            const val = parseInt(res);
            return isNaN(val) ? res : (val - 1).toString();
        }
        if (resultPath === "mogambo") {
            const mapping = { "1": "W", "2": "L" };
            return mapping[String(res).trim()] || res;
        }
        if (resultPath?.includes("superover")) {
            const mapping = { "1": "E", "2": "R", "3": "T", "T": "T" };
            return mapping[String(res).trim()] || res;
        }
        return res;
    };

    const renderResultClass = (res) => {
        if (showImage) return "vresultimg";
        if (resultPath === "war" || resultPath?.startsWith("btable")) return "resultb";

        const isBaccarat = resultPath?.startsWith("baccarat") || gameName?.toLowerCase().includes("baccarat");
        const code = String(res).trim();

        const isQueen = gameName?.toLowerCase().includes("queen") || resultPath?.includes("queen");
        const isRace2 = gameName?.toLowerCase().includes("race to 2nd") || resultPath?.includes("race2");
        const isAB = gameName?.toLowerCase().includes("andar bahar") || resultPath?.includes("ab3") || resultPath?.includes("ab4") || resultPath?.includes("ab204");
        if (isQueen || isRace2 || isAB) return "resultb";

        const isLucky7 = gameName?.toLowerCase().includes("lucky 7") || resultPath?.includes("lucky7");
        if (code === "B" || code === "2" || (isLucky7 && code === "H")) return isLucky7 ? "resulthigh" : "resultb";
        if (code === "A" || code === "1" || code === "P" || code === "L" || (isLucky7 && code === "L")) return isLucky7 ? "resultlow" : "resulta";
        if (isBaccarat && (code === "3" || code === "T")) return "resulttie";
        if (code === "C" || code === "3" || code === "H") return "resultc";
        if (code === "T" || code === "R" || (isLucky7 && code === "T")) return "resulttie";
        if (resultPath === "mogambo") {
            return code === "1" || code === "W" ? "resultb" : "resulta";
        }
        if (resultPath?.includes("superover")) {
            return code === "1" ? "resulta" : code === "2" ? "resultb" : "resulttie";
        }
        return "";
    };

    return (
        <div className={`casino-video-last-results ${className}`}>
            {results.map((result, index) => {
                const resultCode = result.win || result.res;
                return (
                    <span key={index} className={renderResultClass(resultCode)} onClick={() => setIsResultModalOpen(true)}>
                        {renderResultLabel(resultCode)}
                    </span>
                );
            })}
            <a href={`/admin/reports/casinoresult/${resultPath || "poker"}`} className="result-more">
                <b>...</b>
            </a>
        </div>
    );
};

export default LastResult;
