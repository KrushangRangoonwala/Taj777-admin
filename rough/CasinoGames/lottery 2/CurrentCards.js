import React from "react";
import { getCardImage } from "../../../utilies/helpers";
import { imgPath } from "./constants";

function CurrentCards() {
    return (
        <>
            <span><img src={getCardImage('ADD', imgPath + 'cards')} alt="card" /></span>
            <span><img src={getCardImage('ADD', imgPath + 'cards')} alt="card" /></span>
            <span><img src={getCardImage('ADD', imgPath + 'cards')} alt="card" /></span>
        </>
    );
}

export default CurrentCards;
