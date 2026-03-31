import React, { useMemo } from 'react'
import Result_details from '../components/Result_details';
import Result_cards_3x3Divided from '../components/Result_cards_3x3Divided';

function CardComponentNotFound() {
    return (
        <div>Card Component Not Found</div>
    )
}

const errorDetails = [{ label: "error", value: "Details Not Mapped in Result_one.jsx" }]

function getDescPartsBy(saperator = "#") {
    return (response) => {
        const descParts_ = response.desc || response.desc_remakrs || response.desc_remarks || ""
        const descParts = descParts_.split(saperator);
        return descParts;
    }
}

const getCardList = {
    dolidana: (cards) => {
        return cards.map(no => `dice${no}`);
    },
    race17: (cards) => {
        return cards.filter((c) => c && c != "1");
    }
}

const getCardComponent = {
    "teen3": (cards) =>
        <Result_cards_3x3Divided cardList1={cards?.slice(0, 3)} cardList2={cards?.slice(3, 6)} title1={"Player A"} title2={"Player B"} />,
    "teen32": (cards) =>
        <Result_cards_3x3Divided cardList1={cards?.slice(0, 3)} cardList2={cards?.slice(3, 6)} title1={"Player A"} title2={"Player B"} />,
    "teen33": (cards) =>
        <Result_cards_3x3Divided cardList1={cards?.slice(0, 3)} cardList2={cards?.slice(3, 6)} title1={"Player A"} title2={"Player B"} />,
}

const getResultDetals = { // BY GAME_TYPE
    "teen3": (response) => {
        const descParts = getDescPartsBy("#")(response);
        return [{ label: "Winner", value: descParts[0] || "" },];
    },
    "teen32": (response) => {
        const descParts = getDescPartsBy("#")(response);
        return [{ label: "Winner", value: descParts[0] || "" },];
    },
    "teen33": (response) => {
        const descParts = getDescPartsBy("#")(response);
        return [{ label: "Winner", value: descParts[0] || "" },];
    },
}

const Result_one = ({ resultData }) => {
    const data = useMemo(() => {
        const game_type = resultData?.game_type;
        const cardList_ = JSON.parse(resultData?.cards || "[]");

        const resultDetals = getResultDetals[game_type]?.(resultData) ?? errorDetails;
        const cardsList = getCardList[game_type]?.(cardList_) ?? cardList_;
        const CardsComponent = getCardComponent[game_type]?.(cardsList) ?? <CardComponentNotFound />

        return {
            resultDetals,
            cardsList,
            CardsComponent
        }
    }, [resultData])

    const cardList = data?.cardsList || [];
    const resultDetals = data?.resultDetals || [];
    const CardsComponent = data?.CardsComponent || null;

    return (
        <div className="row row5">
            {CardsComponent}
            <Result_details data={resultDetals} />
        </div>
    )
}

export default Result_one