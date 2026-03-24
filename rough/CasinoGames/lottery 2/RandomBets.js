import React, { memo } from "react";
import { getIsSuspended } from "../../../utilies/helpers";
import SelectedCard from "./SelectedCard";

const RandomBets = memo(
    ({ market }) => {
        console.log("RandomBets......");

        const isSuspended = getIsSuspended(market);
        const bets = [5, 10, 15, 20, 25, 50, 75];

        return (
            <div className="lottery-place-balls">
                <SelectedCard />
                <div className={`random-bets ${isSuspended ? "suspended" : ""}`}>
                    <h4 className="w-100 text-center">Random Bets</h4>
                    {bets.map((n) => (
                        <button key={n} className="lottery-btn active">
                            {n}
                        </button>
                    ))}
                </div>
            </div>
        );
    },
    (prev, next) => prev.market === next.market
);

export default RandomBets;
