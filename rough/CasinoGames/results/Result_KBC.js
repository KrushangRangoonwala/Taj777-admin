import React, { useMemo } from "react";
import { getImage } from "../../../utilies/helpers";
import Result_details from "./Result_details";
import Result_cards from "./Result_cards";

const Result_KBC = ({ modalContent: response }) => {
    const modalContent = useMemo(() => {
        if (!response) return null;

        // Parse cards from JSON string
        const cardList = JSON.parse(response.cards || "[]");

        // Parse desc_remakrs: "Red#Even#Up#A  2  3#Diamond"
        const descParts = (response.desc_remakrs || response.desc_remarks || "").split("#");

        // Map the 5 questions to their results
        const resultData = [
            { label: "[Q1] Red-Black", value: descParts[0] || "" },
            { label: "[Q2] Odd-Even", value: descParts[1] || "" },
            { label: "[Q3] 7 Up-7 Down", value: descParts[2] || "" },
            { label: "[Q4] 3 Card Judgement", value: descParts[3] || "" },
            { label: "[Q5] Suits", value: descParts[4] || "" },
        ];

        return {
            cardList,
            resultData,
        };
    }, [response]);

    if (!modalContent) return null;

    const { cardList, resultData } = modalContent;

    return (
        <div className="row row5 worli-result">
            <Result_cards cardList={cardList} />
            <Result_details resultData={resultData} />
        </div>
    );
};

export default Result_KBC;
