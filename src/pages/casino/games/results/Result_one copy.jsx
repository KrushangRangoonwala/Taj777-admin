import React, { useMemo } from 'react'
import Result_details from '../components/Result_details';
import Result_cards from '../components/Result_cards';
import Result_poker1day from './Result_poker1day';

function CardComponentNotFound() {
    return (
        <div>Card Component Not Found</div>
    )
}

const ErrorDetails = () => <Result_details data={[{ label: "error", value: "Details Not Mapped in Result_one.jsx" }]} />

function getDescPartsBy(saperator = "#") {
    return (response) => {
        const descParts_ = response.desc || response.desc_remakrs || response.desc_remarks || ""
        const descParts__ = descParts_.split(saperator);

        const descParts = descParts__?.map((item) => {
            // if (typeof item.value === 'string' && item.value.includes('~')) {
            //     const parts = item.value.split('~');
            //     return {
            //         ...item,
            //         value: parts.map((p, i) => i === 0 ? p : [<br key={i} />, p])
            //     };
            // }
            return item;
        })

        console.log('descParts', descParts);

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

const getCardComponent = { // BY GAME_TYPE
    "poker": (cards, win) =>
        <Result_poker1day
            cardList1={cards?.slice(0, 2)}
            cardList2={cards?.slice(2, 4)}
            cardList3={cards?.slice(4)}
            title1={"Player A"}
            title2={"Player B"}
            title3={"Board"}
            winner={win}
        />,

    "teen": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 3)}
            cardList2={cards?.slice(3, 6)}
            title1={"Player A"}
            title2={"Player B"}
            winner={win}
        />,
    "teen62": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 3)}
            cardList2={cards?.slice(3, 6)}
            title1={"Player A"}
            title2={"Player B"}
            winner={win}
        />,
    "teen20b": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 3)}
            cardList2={cards?.slice(3, 6)}
            title1={"Player A"}
            title2={"Player B"}
            winner={win}
        />,
    "teen20c": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 3)}
            cardList2={cards?.slice(3, 6)}
            title1={"Player A"}
            title2={"Player B"}
            winner={win}
        />,
    "teen6": (
        cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 3)}
            cardList2={cards?.slice(3, 6)}
            title1={"Player A"}
            title2={"Player B"}
            winner={win}
        />,
    "teen20": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 3)}
            cardList2={cards?.slice(3, 6)}
            title1={"Player A"}
            title2={"Player B"}
            winner={win}
        />,
    "teenmuf": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 3)}
            cardList2={cards?.slice(3, 6)}
            title1={"Player A"}
            title2={"Player B"}
            winner={win}
        />,
    "teen3": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 3)}
            cardList2={cards?.slice(3, 6)}
            title1={"Player A"}
            title2={"Player B"}
            winner={win}
        />,
    "teen32": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 3)}
            cardList2={cards?.slice(3, 6)}
            title1={"Player A"}
            title2={"Player B"}
            winner={win}
        />,
    "teen33": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 3)}
            cardList2={cards?.slice(3, 6)}
            title1={"Player A"}
            title2={"Player B"}
            winner={win}
        />,
    "patti2": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 2)}
            cardList2={cards?.slice(2, 6)}
            title1={"Player A"}
            title2={"Player B"}
            winner={win}
        />,
    "btable2": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 3)}
        />,
    "btable": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 3)}
        />,
    "aaa": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 3)}
        />,
    "aaa2": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 3)}
        />,
    "lucky7": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 3)}
        />,
    "lucky7eu": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 3)}
        />,
    "lucky7eu2": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 3)}
        />,
    "lucky5": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 3)}
        />,
    "dt20": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 1)}
            cardList2={cards?.slice(1, 6)}
            title1={"Dragon"}
            title2={"Tiger"}
            winner={win == "D" ? "1" : win == "T" ? "2" : "0"}
        />,
    "dt6": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 1)}
            cardList2={cards?.slice(1, 6)}
            title1={"Dragon"}
            title2={"Tiger"}
            winner={win == "D" ? "1" : win == "T" ? "2" : "0"}
        />,
    "dtl20": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 1)}
            cardList2={cards?.slice(1, 2)}
            cardList3={cards?.slice(2, 6)}
            title1={"Dragon"}
            title2={"Tiger"}
            title3={"Lion"}
            winner={win == "D" ? "1" : win == "T" ? "2" : "0"}
        />,
    "dt202": (cards, win) =>
        <Result_cards
            cardList1={cards?.slice(0, 1)}
            cardList2={cards?.slice(1, 2)}
            title1={"Dragon"}
            title2={"Tiger"}
            // col={6}
            winner={win == "D" ? "1" : win == "T" ? "2" : "0"}
        />,
    "notenum": (cards) => <Result_cards cardList1={cards} />,
    "dolidana": (cards) => <Result_cards cardList1={cards} cardFolder="cards_new" />,
}

const getResultDetals = { // BY GAME_TYPE
    "poker": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Main", value: descParts[0] || "" },
            { label: "2 Card", value: descParts[1] || "" },
            { label: "7 Card", value: descParts[2] || "" }
        ];
        return <Result_details data={data} />
    },
    "teen": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd/Even", value: descParts[2] || "" },
            { label: "Consecutive", value: descParts[2] || "" }
        ];
        return <Result_details data={data} />
    },
    "teen62": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd/Even", value: descParts[2] || "" },
            { label: "Consecutive", value: descParts[3] || "" }
        ];
        return <Result_details data={data} />
    },
    "teen3": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
        ];
        return <Result_details data={data} />
    },
    "teen20b": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "3 Baccarat", value: descParts[1] || "" },
            { label: "Total", value: descParts[2] || "" },
            { label: "Pair Plus", value: descParts[3] || "" },
            { label: "Color", value: descParts[4] || "" }
        ];
        return <Result_details data={data} />
    },
    "teen20": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "3 Baccarat", value: descParts[1] || "" },
            { label: "Total", value: descParts[2] || "" },
            { label: "Pair Plus", value: descParts[3] || "" },
            { label: "Color", value: descParts[4] || "" }
        ];
        return <Result_details data={data} />
    },
    "teen6": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Suit", value: descParts[1] || "" },
            { label: "Odd/Even", value: descParts[2] || "" },
            { label: "Cards", value: descParts[3] || "" },
            { label: "Under/Over", value: descParts[4] || "" }
        ];
        return <Result_details data={data} />
    },
    "teen20c": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "3 Baccarat", value: descParts[1] || "" },
            { label: "Total", value: descParts[2] || "" },
            { label: "Pair Plus", value: descParts[3] || "" },
            { label: "Color", value: descParts[4] || "" }
        ];
        return <Result_details data={data} />
    },
    "teenmuf": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Top 9", value: descParts[1] || "" },
            { label: "M Baccarat", value: descParts[2] || "" }
        ];
        return <Result_details data={data} />
    },
    "teen32": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [{ label: "Winner", value: descParts[0] || "" },];
        return <Result_details data={data} />
    },
    "teen33": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [{ label: "Winner", value: descParts[0] || "" },];
        return <Result_details data={data} />
    },
    "patti2": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Mini Baccarat", value: descParts[1] || "" },
            { label: "Total", value: descParts[2] || "" },
            { label: "Color Plus", value: descParts[3] || "" }
        ];
        return <Result_details data={data} />
    },
    "btable2": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd", value: descParts[1] || "" },
            { label: "Dulha Dulhan/Barati", value: descParts[2] || "" },
            { label: "Color", value: descParts[3] || "" },
            { label: "Card", value: descParts[4] || "" }
        ];
        return <Result_details data={data} />
    },
    "btable": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd", value: descParts[1] || "" },
            { label: "Dulha Dulhan/Barati", value: descParts[2] || "" },
            { label: "Color", value: descParts[3] || "" },
            { label: "Card", value: descParts[4] || "" }
        ];
        return <Result_details data={data} />
    },
    "aaa2": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd/Even", value: descParts[1] || "" },
            { label: "Color", value: descParts[2] || "" },
            { label: "Under/Over", value: descParts[3] || "" },
            { label: "Card", value: descParts[4] || "" }
        ];
        return <Result_details data={data} />
    },
    "lucky7": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd/Even", value: descParts[1] || "" },
            { label: "Color", value: descParts[2] || "" },
            { label: "Card", value: descParts[3] || "" },
            { label: "Line", value: descParts[4] || "" }
        ];
        return <Result_details data={data} />
    },
    "lucky7eu": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd/Even", value: descParts[1] || "" },
            { label: "Color", value: descParts[2] || "" },
            { label: "Card ", value: descParts[3] || "" },
            { label: "Line", value: descParts[4] || "" }
        ];
        return <Result_details data={data} />
    },
    "lucky5": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd/Even", value: descParts[1] || "" },
            { label: "Color", value: descParts[2] || "" },
            { label: "Card ", value: descParts[3] || "" }
        ];
        return <Result_details data={data} />
    },
    "dt20": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Pair", value: descParts[1] || "" },
            { label: "Odd/Even", value: descParts[2] || "" },
            { label: "Color ", value: descParts[3] || "" },
            { label: "Card", value: descParts[4] || "" }
        ];
        return <Result_details data={data} />
    },
    "dt6": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Pair", value: descParts[1] || "" },
            { label: "Odd/Even", value: descParts[2] || "" },
            { label: "Color ", value: descParts[3] || "" },
            { label: "Suit", value: descParts[4] || "" }
        ];
        return <Result_details data={data} />
    },
    "dtl20": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Red/Black", value: descParts[1] || "" },
            { label: "Odd/Even", value: descParts[2] || "" },
            { label: "Card ", value: descParts[3] || "" }
        ];
        return <Result_details data={data} />
    },
    "dt202": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Pair", value: descParts[1] || "" },
            { label: "Odd/Even", value: descParts[2] || "" },
            { label: "Color ", value: descParts[3] || "" },
            { label: "Card", value: descParts[4] || "" }
        ];
        return <Result_details data={data} />
    },
    "notenum": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Odd/Even", value: descParts[0] || "" },
            { label: "Red/Black", value: descParts[1] || "" },
            { label: "Low/High", value: descParts[2] || "" },
            { label: "Cards", value: descParts[3] || "" },
            { label: "Baccarat", value: descParts[4] || "" },
        ];
        return <Result_details data={data} />
    },
    "dolidana": (response) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Turn", value: descParts[0] || "" },
            { label: "Any Pair", value: descParts[1] || "" },
            { label: "Particulat Pair", value: descParts[2] || "" },
            { label: "Sum Total", value: descParts[3] || "" },
            { label: "Odd/Even", value: descParts[4] || "" },
            { label: "Lucky 7", value: descParts[5] || "" },
        ];
        return <Result_details data={data} />
    },
}

const Result_one = ({ resultData }) => {
    const data = useMemo(() => {
        const game_type = resultData?.game_type;
        const cardList_ = JSON.parse(resultData?.cards || "[]");

        const DetailsComponent = getResultDetals[game_type]?.(resultData) ?? ErrorDetails;
        const cardsList = getCardList[game_type]?.(cardList_) ?? cardList_;
        const CardsComponent = getCardComponent[game_type]?.(cardsList, resultData?.result_status) ?? <CardComponentNotFound />

        return {
            DetailsComponent,
            CardsComponent
        }
    }, [resultData])

    const DetailsComponent = data?.DetailsComponent || null;
    const CardsComponent = data?.CardsComponent || null;

    return (
        <div className="row row5">
            {CardsComponent}
            {DetailsComponent}
        </div>
    )
}

export default Result_one

const resultMap = { // BY GAME_TYPE
    "DEFAULT": Result_one,
    
    "poker": Result_one,
    "teen3": Result_one,
    "teen32": Result_one,
    "teen33": Result_one,
    "notenum": Result_one,
    "dolidana": Result_one,
    "teen": Result_one,
    "teen62": Result_one,
    "teen20b": Result_one,
    "teenmuf": Result_one,
    "teen20": Result_one,
    "teen6": Result_one,
    "teen20c": Result_one,
    "patti2": Result_one,
    "btable2": Result_one,
    "btable": Result_one,
    "aaa": Result_one,
    "aaa2": Result_one,
    "lucky7": Result_one,
    "lucky7eu": Result_one,
    "lucky7eu2": Result_one,
    "lucky5": Result_one,
    "dt20": Result_one,
    "dt6": Result_one,
    "dtl20": Result_one,
    "dt202": Result_one,
    "trio": Result_one,
    "teen1": Result_one,
}