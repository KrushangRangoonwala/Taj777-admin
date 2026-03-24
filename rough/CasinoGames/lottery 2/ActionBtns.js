import React from "react";

export function ActionBtns() {
    return (
        <div className="lottery-buttons d-none-big w-100 mb-3">
            <div className="lottery-buttons-top">
                <button className="lottery-btn active">Repeat</button>
                <button className="lottery-btn active">Clear</button>
                <button className="lottery-btn active">Remove</button>
            </div>
        </div>
    );
}

export default ActionBtns;
