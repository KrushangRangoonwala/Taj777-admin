import React, { memo } from "react";
import { getIsSuspended, getCardImage } from "../../../utilies/helpers";
import { imgPath } from "./constants";

const LotteryBox = memo(
    ({ market, handleOddsClick }) => {
        const isSuspended = getIsSuspended(market);
        const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

        return (
            <div className={`lottery-box ${isSuspended ? "suspended" : ""}`}>
                {cards.map((c) => (
                    <div
                        key={c}
                        className="lottery-card"
                        onClick={() => handleOddsClick(c)}
                    >
                        <img src={getCardImage(c, imgPath)} alt={c} />
                    </div>
                ))}
            </div>
        );
    },
    (prev, next) => prev.market === next.market
);

export default LotteryBox;
