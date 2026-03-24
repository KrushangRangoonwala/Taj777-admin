import React from "react";

export function LastResults() {
    return (
        <div className="lottery-last-result d-none-desktop w-100">
            <div className="lottery-last-result-title">
                <div>Last Results</div>
            </div>
            {/* USE .MAP() */}
            <div className="lottery-result-group">
                <div className="lottery-result-icon">8</div>
                <div className="lottery-result-icon">9</div>
                <div className="lottery-result-icon">2</div>
            </div>
        </div>
    );
}

export default LastResults;
