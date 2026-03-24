import React, { useState } from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import useIsMobile from "../../../hooks/useIsMobile";
import Result_Parent from "./Result_Parent";
import { useNavigate } from "react-router-dom";
// import styles from "./YourStyles.module.css";

// const balls = [7, 1, 1, 4, 8, 8, 7, 6, 5, 6];

// export function LastResults11() {
//     return (
//         <div className={styles["casino-video-last-results"]}>
// {balls.map((ball, index) => (
//                 <span
//                     key={index}
//                     className={styles["cricket20lastresult"]}
//                 >
//                     <img
//                         src={`https://wver.sprintstaticdata.com/v196/static/front/img/balls/ball${ball}.png`}
//                         alt={`Ball ${ball}`}
//                     />
//                 </span>
//             ))}

//             <a
//                 href="/report/casinoresult/cmatch20"
//                 className={styles["result-more"]}
//             >
//                 ...
//             </a>
//         </div>
//     );
// }

const LastResults = ({
    hideResults,
    lastResults,
    getResultTxt,
    getColorClass,
    isBgTransparent,

    config,
    formatResultFn,
    ResultModal,
    onResultClick
}) => {
    const navigate = useNavigate();
    const [mid, setMid] = useState();
    const details = useGetFileData();
    if (details) {
        var { CODE, game_name, game_type } = details;
    } else {
        var { marketType: CODE, socketRoom: game_type, modalTitle: game_name, } = config;
    }


    const isBallBox = CODE === "2020_CRICKET_MATCH";
    const isMobile = useIsMobile();

    if (hideResults) return null;

    function defaultColorClassFn(aaa) {
        return aaa === "1" ? "resulta" : aaa === "2" ? "resultb" : "resulttie"
    }

    const colorClassFn = getColorClass ?? defaultColorClassFn;

    const onSpanClick = (e, result) => {
        e.preventDefault();
        setMid(result.mid);
    }

    function Box({ aaa, index, result }) {
        return (
            <span
                key={index}
                className={colorClassFn(aaa)}
                onClick={(e) => onResultClick ? onResultClick(index, e) : onSpanClick(e, result)}
                style={{ backgroundColor: isBgTransparent ? "transparent" : "", boxShadow: isBgTransparent ? "none" : "" }}
            >
                {getResultTxt(aaa)}
            </span>
        )
    }

    function BallBox({ ball, index, result }) {
        return (
            <span
                key={index}
                className="cricket20lastresult"
                onClick={(e) => onSpanClick(e, result)}
            >
                <img
                    src={`/assets/cards_new/balls/ball${ball}.png`}
                    alt={`Ball ${ball}`}
                    style={{ width: !isMobile ? '28px' : '' }}
                />
            </span>
        )
    }

    return (
        <div className={isBallBox ? "cricket20" : "casino-place-bet"}>

            {mid && <Result_Parent name={game_name} mid={mid} type={game_type} setMid={setMid} />}

            {!isMobile && (
                <div className="casino-place-bet-title">
                    <span>Last Results</span>
                </div>
            )}

            <div className={`casino-video-last-results ee2211 ${game_name === 'Mogambo' ? 'mogambo-class' : ''}`}>
                {lastResults && lastResults.length > 0 ? (
                    <>
                        {lastResults.map((result, index) => {
                            const aaa = result.win ?? result.result;

                            if (isBallBox) return (<BallBox ball={aaa} index={index} result={result} />)

                            return (<Box aaa={aaa} index={index} result={result} />)
                        })}

                        <a
                            href="/report/casinoresult/poker"
                            className="result-more"
                            style={{ textDecoration: "none" }}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(`/report/casinoresult/${game_type}`);
                            }}
                        >
                            ...
                        </a>
                    </>
                ) : (
                    <span className="text-white text-center w-100">
                        No results available
                    </span>
                )}
            </div>
        </div>
    );
};

export default LastResults;
