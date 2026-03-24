import React from "react";
import CurrentCards from "./CurrentCards";

function CardsMobile() {
    return (
        <div className="casino-video-cards d-none-desktop">
            <div className="casino-video-cards-container">
                <div>
                    <CurrentCards />
                </div>
            </div>
        </div>
    );
}

export default CardsMobile;
