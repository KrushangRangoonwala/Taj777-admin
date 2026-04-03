import React, { useMemo } from 'react'
import Result_details from '../components/Result_details';
import Result_cards from '../components/Result_cards';
import Result_poker1day from './Result_poker1day';
import Result_Poker6 from './Result_Poker6';
import Result_DTL20 from './Result_DTL20';
import Result_war from './Result_war';
import Result_Joker from './Result_Joker';

function CardComponentNotFound() {
    return (
        <div>Card Component Not Found</div>
    )
}

function ResultModalNotFound() {
    return (
        <div className="text-center" style={{ fontFamily: "monospace", fontSize: "18px" }}>Result Modal not found</div>
    )
}

const ErrorDetails = () => <Result_details data={[{ label: "error", value: "Details Not Mapped in Result_one.jsx" }]} />

function getDescPartsBy(saperator = "#", saperator2) {
    return (response) => {
        const descParts_ = response.desc || response.desc_remakrs || response.desc_remarks || ""
        const descParts__ = descParts_.split(saperator);

        const descParts = descParts__?.map((item) => {
            if (saperator2 && typeof item === 'string' && item.includes(saperator2)) {
                const parts = item.split(saperator2);
                return parts
            }
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

function getClass(game_type) {
    if (game_type === "poker6") {
        return "poker6result"
    }
    if (game_type === "dtl20") {
        return "dtl20-result text-center"
    }
    if (game_type === "war") {
        return "war-result"
    }
    return ""
}

const getGameResultContent = { // BY GAME_TYPE
    "poker": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Main", value: descParts[0] || "" },
            { label: "2 Card", value: descParts[1] || "" },
            { label: "7 Card", value: descParts[2] || "" }
        ];
        return (
            <>
                <Result_poker1day
                    cardList1={cards?.slice(0, 2)}
                    cardList2={cards?.slice(2, 4)}
                    cardList3={cards?.slice(4)}
                    title1={"Player A"}
                    title2={"Player B"}
                    title3={"Board"}
                    winner={win === "B" ? 2 : win === "A" ? 1 : 0}
                />
                <Result_details data={data} col={3} />
            </>
        )
    },

    "poker20": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Main", value: descParts[0] || "" },
            { label: "Other", value: descParts[1] || "" },
        ];
        return (
            <>
                <Result_poker1day
                    cardList1={cards?.slice(0, 2)}
                    cardList2={cards?.slice(2, 4)}
                    cardList3={cards?.slice(4)}
                    title1={"Player A"}
                    title2={"Player B"}
                    title3={"Board"}
                    winner={win === "B" ? 2 : win === "A" ? 1 : 0}
                />
                <Result_details data={data} col={3} />
            </>
        )
    },
    "poker6": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Player", value: descParts[0] || "" },
            { label: "Pattern", value: descParts[1] || "" },
        ];
        return (
            <>
                <Result_Poker6
                    cardList={cards}
                    winner={response?.result_status}
                />
                <Result_details data={data} col={4} />
            </>
        )
    },

    "teen": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd/Even", value: descParts[2] || "" },
            { label: "Consecutive", value: descParts[2] || "" }
        ];
        return (
            <>
                <Result_cards
                    cardList1={cards?.slice(0, 3)}
                    cardList2={cards?.slice(3, 6)}
                    title1={"Player A"}
                    title2={"Player B"}
                    winner={win}
                />
                <Result_details data={data} />
            </>
        )
    },
    "teen62": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd/Even", value: descParts[2] || "" },
            { label: "Consecutive", value: descParts[3] || "" }
        ];
        return (
            <>
                <Result_cards
                    cardList1={cards?.slice(0, 3)}
                    cardList2={cards?.slice(3, 6)}
                    title1={"Player A"}
                    title2={"Player B"}
                    winner={win}
                />
                <Result_details data={data} />
            </>
        )
    },
    "teen20b": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "3 Baccarat", value: descParts[1] || "" },
            { label: "Total", value: descParts[2] || "" },
            { label: "Pair Plus", value: descParts[3] || "" },
            { label: "Color", value: descParts[4] || "" }
        ];
        return (
            <>
                <Result_cards
                    cardList1={cards?.slice(0, 3)}
                    cardList2={cards?.slice(3, 6)}
                    title1={"Player A"}
                    title2={"Player B"}
                    winner={win}
                />
                <Result_details data={data} />
            </>
        )
    },
    "teen20c": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "3 Baccarat", value: descParts[1] || "" },
            { label: "Total", value: descParts[2] || "" },
            { label: "Pair Plus", value: descParts[3] || "" },
            { label: "Color", value: descParts[4] || "" }
        ];
        return (
            <>
                <Result_cards
                    cardList1={cards?.slice(0, 3)}
                    cardList2={cards?.slice(3, 6)}
                    title1={"Player A"}
                    title2={"Player B"}
                    winner={win}
                />
                <Result_details data={data} />
            </>
        )
    },
    "teen6": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Suit", value: descParts[1] || "" },
            { label: "Odd/Even", value: descParts[2] || "" },
            { label: "Cards", value: descParts[3] || "" },
            { label: "Under/Over", value: descParts[4] || "" }
        ];
        return (
            <>
                <Result_cards
                    cardList1={cards?.slice(0, 3)}
                    cardList2={cards?.slice(3, 6)}
                    title1={"Player A"}
                    title2={"Player B"}
                    winner={win}
                />
                <Result_details data={data} />
            </>
        )
    },
    "teen20": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "3 Baccarat", value: descParts[1] || "" },
            { label: "Total", value: descParts[2] || "" },
            { label: "Pair Plus", value: descParts[3] || "" },
            { label: "Color", value: descParts[4] || "" }
        ];
        return (
            <>
                <Result_cards
                    cardList1={cards?.slice(0, 3)}
                    cardList2={cards?.slice(3, 6)}
                    title1={"Player A"}
                    title2={"Player B"}
                    winner={win}
                />
                <Result_details data={data} />
            </>
        )
    },
    "teenmuf": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Top 9", value: descParts[1] || "" },
            { label: "M Baccarat", value: descParts[2] || "" }
        ];
        return (
            <>
                <Result_cards
                    cardList1={cards?.slice(0, 3)}
                    cardList2={cards?.slice(3, 6)}
                    title1={"Player A"}
                    title2={"Player B"}
                    winner={win}
                />
                <Result_details data={data} />
            </>
        )
    },
    "teen3": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
        ];
        return (
            <>
                <Result_cards
                    cardList1={cards?.slice(0, 3)}
                    cardList2={cards?.slice(3, 6)}
                    title1={"Player A"}
                    title2={"Player B"}
                    winner={win}
                />
                <Result_details data={data} />
            </>
        )
    },
    "teen32": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [{ label: "Winner", value: descParts[0] || "" },];
        return (
            <>
                <Result_cards
                    cardList1={cards?.slice(0, 3)}
                    cardList2={cards?.slice(3, 6)}
                    title1={"Player A"}
                    title2={"Player B"}
                    winner={win}
                />
                <Result_details data={data} />
            </>
        )
    },
    "teen33": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [{ label: "Winner", value: descParts[0] || "" },];
        return (
            <>
                <Result_cards
                    cardList1={cards?.slice(0, 3)}
                    cardList2={cards?.slice(3, 6)}
                    title1={"Player A"}
                    title2={"Player B"}
                    winner={win}
                />
                <Result_details data={data} />
            </>
        )
    },
    "teensin": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "High Card", value: descParts[1] || "" },
            { label: "Pair", value: descParts[0] || "" },
            { label: "Color Plus", value: descParts[1] || "" },
            { label: "Lucky 9", value: descParts[0] || "" },
        ];
        return (
            <>
                <Result_cards
                    cardList1={cards?.slice(0, 3)}
                    cardList2={cards?.slice(3, 6)}
                    title1={"Player A"}
                    title2={"Player B"}
                    winner={win}
                />
                <Result_details data={data} />
            </>
        )
    },
    "patti2": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Mini Baccarat", value: descParts[1] || "" },
            { label: "Total", value: descParts[2] || "" },
            { label: "Color Plus", value: descParts[3] || "" }
        ];
        return (
            <>
                <Result_cards
                    cardList1={cards?.slice(0, 2)}
                    cardList2={cards?.slice(2, 6)}
                    title1={"Player A"}
                    title2={"Player B"}
                    winner={win}
                />
                <Result_details data={data} />
            </>
        )
    },
    "btable2": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd", value: descParts[1] || "" },
            { label: "Dulha Dulhan/Barati", value: descParts[2] || "" },
            { label: "Color", value: descParts[3] || "" },
            { label: "Card", value: descParts[4] || "" }
        ];
        return (
            <>
                <Result_cards cardList1={cards?.slice(0, 3)} />
                <Result_details data={data} />
            </>
        )
    },
    "btable": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd", value: descParts[1] || "" },
            { label: "Dulha Dulhan/Barati", value: descParts[2] || "" },
            { label: "Color", value: descParts[3] || "" },
            { label: "Card", value: descParts[4] || "" }
        ];
        return (
            <>
                <Result_cards cardList1={cards?.slice(0, 3)} />
                <Result_details data={data} />
            </>
        )
    },
    "aaa": (response, cards, win) => {
        return (
            <>
                <Result_cards cardList1={cards?.slice(0, 3)} />
            </>
        )
    },
    "aaa2": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd/Even", value: descParts[1] || "" },
            { label: "Color", value: descParts[2] || "" },
            { label: "Under/Over", value: descParts[3] || "" },
            { label: "Card", value: descParts[4] || "" }
        ];
        return (
            <>
                <Result_cards cardList1={cards?.slice(0, 3)} />
                <Result_details data={data} />
            </>
        )
    },
    "lucky7": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd/Even", value: descParts[1] || "" },
            { label: "Color", value: descParts[2] || "" },
            { label: "Card", value: descParts[3] || "" },
            { label: "Line", value: descParts[4] || "" }
        ];
        return (
            <>
                <Result_cards cardList1={cards?.slice(0, 3)} />
                <Result_details data={data} />
            </>
        )
    },
    "lucky7eu": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd/Even", value: descParts[1] || "" },
            { label: "Color", value: descParts[2] || "" },
            { label: "Card ", value: descParts[3] || "" },
            { label: "Line", value: descParts[4] || "" }
        ];
        return (
            <>
                <Result_cards cardList1={cards?.slice(0, 3)} />
                <Result_details data={data} />
            </>
        )
    },
    "lucky7eu2": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd/Even", value: descParts[1] || "" },
            { label: "Color", value: descParts[2] || "" },
            { label: "Card ", value: descParts[3] || "" },
            { label: "Line", value: descParts[4] || "" }
        ];
        return (
            <>
                <Result_cards cardList1={cards?.slice(0, 3)} />
                <Result_details data={data} />
            </>
        )
    },
    "lucky5": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd/Even", value: descParts[1] || "" },
            { label: "Color", value: descParts[2] || "" },
            { label: "Card ", value: descParts[3] || "" }
        ];
        return (
            <>
                <Result_cards cardList1={cards?.slice(0, 3)} />
                <Result_details data={data} />
            </>
        )
    },
    "dt20": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Pair", value: descParts[1] || "" },
            { label: "Odd/Even", value: descParts[2] || "" },
            { label: "Color ", value: descParts[3] || "" },
            { label: "Card", value: descParts[4] || "" }
        ];
        return (
            <>
                <Result_cards
                    cardList1={cards?.slice(0, 1)}
                    cardList2={cards?.slice(1, 6)}
                    title1={"Dragon"}
                    title2={"Tiger"}
                    winner={win == "D" ? "1" : win == "T" ? "2" : "0"}
                />
                <Result_details data={data} />
            </>
        )
    },
    "dt6": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Pair", value: descParts[1] || "" },
            { label: "Odd/Even", value: descParts[2] || "" },
            { label: "Color ", value: descParts[3] || "" },
            { label: "Suit", value: descParts[4] || "" }
        ];
        return (
            <>
                <Result_cards
                    cardList1={cards?.slice(0, 1)}
                    cardList2={cards?.slice(1, 6)}
                    title1={"Dragon"}
                    title2={"Tiger"}
                    winner={win == "D" ? "1" : win == "T" ? "2" : "0"}
                />
                <Result_details data={data} />
            </>
        )
    },
    "dtl20": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Red/Black", value: descParts[1] || "" },
            { label: "Odd/Even", value: descParts[2] || "" },
            { label: "Card ", value: descParts[3] || "" }
        ];
        return (
            <>
                <Result_DTL20 cardList={cards} winner={response?.result_status} />
                <Result_details data={data} col={6} />
            </>
        )
    },
    "dt202": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Pair", value: descParts[1] || "" },
            { label: "Odd/Even", value: descParts[2] || "" },
            { label: "Color ", value: descParts[3] || "" },
            { label: "Card", value: descParts[4] || "" }
        ];
        return (
            <>
                <Result_cards
                    cardList1={cards?.slice(0, 1)}
                    cardList2={cards?.slice(1, 2)}
                    title1={"Dragon"}
                    title2={"Tiger"}
                    winner={win == "D" ? "1" : win == "T" ? "2" : "0"}
                />
                <Result_details data={data} />
            </>
        )
    },
    "teen1": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "7 Up - 7 Down", value: descParts[1] || "" },
        ];
        return (
            <>
                <Result_cards
                    cardList1={cards?.slice(0, 1)}
                    cardList2={cards?.slice(1, 2)}
                    title1={"Player"}
                    title2={"Dealer"}
                    winner={win}
                />
                <Result_details data={data} />
            </>
        )
    },
    "teen120": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Pair", value: descParts[1] || "" },
        ];
        return (
            <>
                <Result_cards
                    cardList1={cards?.slice(0, 1)}
                    cardList2={cards?.slice(1, 2)}
                    title1={"Player"}
                    title2={"Dealer"}
                    winner={win}
                />
                <Result_details data={data} />
            </>
        )
    },
    "trio": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Odd/Even", value: descParts[0] || "" },
            { label: "Red/Black", value: descParts[1] || "" },
            { label: "Low/High", value: descParts[2] || "" },
            { label: "Cards", value: descParts[3] || "" },
            { label: "Baccarat", value: descParts[4] || "" },
        ];
        return (
            <>
                <Result_cards cardList1={cards} />
                <Result_details data={data} />
            </>
        )
    },
    "notenum": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Red/Black", value: descParts[1] || "" },
            { label: "Low/High", value: descParts[2] || "" },
            { label: "Cards", value: descParts[3] || "" },
            { label: "Baccarat", value: descParts[4] || "" },
        ];
        return (
            <>
                <Result_cards
                    cardList1={cards?.slice(0, 6)}
                />
                <Result_details data={data} />
            </>
        )
    },
    "dolidana": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [
            { label: "Turn", value: descParts[0] || "" },
            { label: "Any Pair", value: descParts[1] || "" },
            { label: "Particulat Pair", value: descParts[2] || "" },
            { label: "Sum Total", value: descParts[3] || "" },
            { label: "Odd/Even", value: descParts[4] || "" },
            { label: "Lucky 7", value: descParts[5] || "" },
        ];
        return (
            <>
                <Result_cards cardList1={cards} cardFolder="cards_new" />
                <Result_details data={data} />
            </>
        )
    },
    "3cardj": (response, cards, win) => {
        const descParts = getDescPartsBy("#")(response);
        const data = [{ label: "Result", value: descParts[0] || "" },];
        return (
            <>
                <Result_cards cardList1={cards} />
                <Result_details data={data} />
            </>
        )
    },
    "war": (response, cards, win) => {
        const descParts = getDescPartsBy("#", "~")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Color", value: descParts[1][0] || "" },
            { label: "", value: descParts[1][1] || "" },
            { label: "Odd/Even", value: descParts[2][0] || "" },
            { label: "", value: descParts[2][1] || "" },
            { label: "Suit", value: descParts[3][0] || "" },
            { label: "", value: descParts[3][1] || "" },
        ];
        return (
            <>
                <Result_war winner={response?.result_status} cardList={cards} />
                <Result_details data={data} col={6} />
            </>
        )
    },
    "joker20": (response, cards, win) => {
        const descParts = getDescPartsBy("#", "~")(response);
        const data = [
            { label: "Winner", value: descParts[0] || "" },
            { label: "Odd/Even", value: descParts[1] || "" },
            { label: "Color", value: descParts[2] || "" },
            { label: "Suit", value: descParts[3] || "" },
        ];
        return (
            <>
                <Result_Joker
                    title1="Joker"
                    title2="Player A"
                    title3="Player B"
                    cardList1={cards?.slice(0, 1)}
                    cardList2={cards?.slice(1, 4)}
                    cardList3={cards?.slice(4, 7)}
                    winner={response?.result_status}
                />
                <Result_details data={data} />
            </>
        )
    },
}

const Result_one = ({ resultData }) => {
    const content = useMemo(() => {
        const game_type = resultData?.game_type;
        const cardList_ = JSON.parse(resultData?.cards || "[]");
        const cardsList = getCardList[game_type]?.(cardList_) ?? cardList_;

        return getGameResultContent[game_type]?.(resultData, cardsList, resultData?.result_status) ?? <ResultModalNotFound />;
    }, [resultData])

    return (
        <div className={`row row5 ${getClass(resultData?.game_type)}`}>
            {content}
        </div>
    )
}

export default Result_one