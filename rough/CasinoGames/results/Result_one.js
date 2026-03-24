import React, { useMemo, useState } from "react";
import { getImage } from "../../../utilies/helpers";
import Result_details from "./Result_details";
import Result_cards from "./Result_cards";
import showToast from "../../../utilies/toaster";

const getDetailsMap = { // FROM GAME_TYPE
    "lucky7": (response) => {
        const descParts_ = response.desc || response.desc_remakrs || response.desc_remarks || ""
        const descParts = descParts_.split("#");
        return [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd/Even", value: descParts[1] || "" },
            { label: "Color", value: descParts[2] || "" },
            { label: "Card", value: descParts[3].split(" ").filter(Boolean).pop() || "" },
            { label: "Line", value: descParts[4] || "" },
        ];
    },
    "lucky7eu": (response) => {
        const descParts_ = response.desc || response.desc_remakrs || response.desc_remarks || ""
        const descParts = descParts_.split("#");
        return [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd/Even", value: descParts[1] || "" },
            { label: "Color", value: descParts[2] || "" },
            { label: "Card", value: descParts[3].split(" ").filter(Boolean).pop() || "" },
            { label: "Line", value: descParts[4] || "" },
        ];
    },
    "lucky7eu2": (response) => {
        const descParts_ = response.desc || response.desc_remakrs || response.desc_remarks || ""
        const descParts = descParts_.split("#");
        return [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd/Even", value: descParts[1] || "" },
            { label: "Color", value: descParts[2] || "" },
            { label: "Card", value: descParts[3].split(" ").filter(Boolean).pop() || "" },
            { label: "Line", value: descParts[4] || "" },
        ];
    },
    "lucky5": (response) => {
        const descParts_ = response.desc || response.desc_remakrs || response.desc_remarks || ""
        const descParts = descParts_.split("#");
        return [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd/Even", value: descParts[1] || "" },
            { label: "Color", value: descParts[2] || "" },
            { label: "Card", value: descParts[3].split(" ").filter(Boolean).pop() || "" },
        ];
    },
    "race17": (response) => {
        const descParts_ = response?.desc || response?.desc_remakrs || response?.desc_remarks || ""
        const descParts = descParts_.split("#");
        return [
            { label: "Race to 17", value: descParts[0] || "" },
            { label: "Big Card", value: descParts[1] || "" },
            { label: "Zero Card", value: descParts[2] || "" },
            { label: "One Zero Card", value: descParts[3] || "" },
        ];
    },
    trio: (response) => {
        const descParts_ = response?.desc || response?.desc_remakrs || response?.desc_remarks || ""
        const descParts = descParts_.split("#");
        return [
            { label: "Session (21)", value: descParts[0] || "" },
            { label: "1 2 4 / J Q K", value: descParts[1] || "" },
            { label: "Red/Black", value: descParts[2] || "" },
            { label: "Odd/Even", value: descParts[3].split(" ").filter(Boolean).pop() || "" },
            { label: "Pattern", value: descParts[4] || "" },
        ];
    },
    "lottcard": () => {
        return null;
    },
    "3cardj": (response) => {
        const cards = JSON.parse(response?.cards || "[]");
        const win = cards.map(val => val?.slice(0, -2)).join(" ");
        const resultDetails = [{ label: "Result", value: win || "" }];
        return resultDetails;
    },
    "notenum": (response) => {
        const descParts_ = response?.desc || response?.desc_remakrs || response?.desc_remarks || ""
        const descParts = descParts_.split("#");
        return [
            { label: "Odd/Even", value: descParts[0] || "" },
            { label: "Red/Black", value: descParts[1] || "" },
            { label: "Low/High", value: descParts[2] || "" },
            { label: "Card", value: descParts[3] || "" },
            { label: "Baccarat", value: descParts[4] || "" },
        ];
    },
    "dolidana": (response) => {
        const descParts_ = response?.desc || response?.desc_remakrs || response?.desc_remarks || ""
        const descParts = descParts_.split("#");
        if (descParts.length > 2) {
            return [
                { label: "Turn", value: descParts[0] || "" },
                { label: "Any Pair", value: descParts[1] || "" },
                { label: "Particulat Pair", value: descParts[2] || "" },
                { label: "Sum Total", value: descParts[3] || "" },
                { label: "Odd/Even", value: descParts[4] || "" },
                { label: "Lucky 7", value: descParts[5] || "" },
            ];
        } else {
            return [
                { label: "Turn", value: descParts[0] || "" },
                { label: "Win", value: descParts[1] || "" },
            ];
        }
    },
    "lottcard": (response) => {
        const descParts_ = response?.desc || response?.desc_remakrs || response?.desc_remarks || ""
        return [
            { label: "Result", value: descParts_ || "" },
        ];
    },
    "cmatch20": (response) => {
        const descParts_ = response?.desc || response?.desc_remakrs || response?.desc_remarks || ""
        return [
            { label: "Result", value: descParts_ || "" },
        ];
    },
}

const getCardList = {
    dolidana: (cards) => {
        return cards.map(no => `dice${no}`);
    },
    race17: (cards) => {
        return cards.filter((c) => c && c != "1");
    }
}

const Result_one = ({ modalContent: response }) => {
    const modalContent = useMemo(() => {
        const cardList = JSON.parse(response.cards || "[]");
        const resultData = getDetailsMap[response.game_type](response);

        const cardList_ = getCardList[response.game_type]?.(cardList) ?? cardList;

        if (!resultData) {
            return {
                cardList: [],
                resultData: [],
            };
        }

        return {
            cardList: cardList_,
            resultData,
        };
    }, [response]);

    const { cardList, resultData } = modalContent;
    console.log('cardList, resultData', cardList, resultData);

    return (
        <div className="row row5 worli-result">
            <Result_cards cardList={cardList} />
            <Result_details resultData={resultData} />
        </div>
    );
};

export default Result_one;

// 562 -> 187.33
// 394 -> 131.33
// 791 -> 259.66