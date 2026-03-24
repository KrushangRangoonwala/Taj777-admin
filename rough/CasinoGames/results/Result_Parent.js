import React, { useEffect, useState, memo } from 'react'
// import Result_Common from './Result_Common'
// import Modal from "react-modal";
import { Suspense } from "react";
import styles from "./Result_Superover3.module.css";
import { fetchResultById } from '../../../api/api';
import useIsMobile from '../../../hooks/useIsMobile';
import { formatToUTCMinus8, getGameNameFromType, getValueAfterDot } from '../../../utilies/helpers';
import { toast } from 'react-toastify';
import { lazy } from "react";
import Modal_wrapper from '../components/Modal_wrapper';
import showToast from '../../../utilies/toaster';
import { useSelector } from 'react-redux';
import { ResultBetTable } from '../components/CssStyle';

const DataNotFound = () => {
    return <div className="text-center" style={{ fontFamily: "monospace", fontSize: "18px" }}> Data Not Found </div>;
}
const Loading = () => {
    return <div className="text-center" style={{ fontSize: "18px" }}> Loading... </div>;
}

const ResultComponentMap = {  // BY GAME_TYPE
    // "cmatch20": lazy(() => import("./Result_Cricket2020")),
    "cmatch20": lazy(() => import("./Result_one")),
    "goal": lazy(() => import("./Result_Goal")),
    "cmeter": lazy(() => import("./Result_cmeter")),
    "cmeter1": lazy(() => import("./Result_Cmeter_1card")),
    "mogambo": lazy(() => import("./Result_mogambo")),

    "dt20": lazy(() => import("./Result_DragonTiger")),
    "dt202": lazy(() => import("./Result_DragonTiger")),
    "dt6": lazy(() => import("./Result_DragonTiger")),
    "dtl20": lazy(() => import("./Result_DTL20")),

    "sicbo": lazy(() => import("./Result_Sicbo")),
    "sicbo2": lazy(() => import("./Result_Sicbo")),
    "teen1": lazy(() => import("./Result_OneCardOneDay")),
    "teen120": lazy(() => import("./Result_OneCard2020")),

    "superover": lazy(() => import("./Result_Superover3")),
    "superover2": lazy(() => import("./Result_Superover3")),
    "superover3": lazy(() => import("./Result_Superover3")),
    "cricketv3": lazy(() => import("./Result_Superover3")),

    "baccarat": lazy(() => import("./Result_Baccarat")),
    "baccarat2": lazy(() => import("./Result_Baccarat")),
    "teensin": lazy(() => import("./Result_29CardBaccarat")),

    "poker": lazy(() => import("./Result_PokerOneDay")),
    "poker20": lazy(() => import("./Result_PokerOneDay")),
    "poker6": lazy(() => import("./Result_poker6player_new")),

    "ab20": lazy(() => import("./Result_AndarBahar1")),
    "ab3": lazy(() => import("./Result_AndarBahar")),
    "ab4": lazy(() => import("./Result_AndarBahar")),
    // "abj": lazy(() => import("./Result_AndarBahar1")),
    "abj": lazy(() => import("./Result_AndarBahar2")),


    "War": lazy(() => import("./Result_Casinowars")),
    "queen": lazy(() => import("./Result_Queen")),

    "race2": lazy(() => import("./Result_Race2")),
    "race20": lazy(() => import("./Result_Race20")),
    "race17": lazy(() => import("./Result_one")),
    "teen9": lazy(() => import("./Result_TeenpattiTest")),
    "teen6": lazy(() => import("./Result_TeenPatti2")),
    "teen8": lazy(() => import("./Result_TeenPattiOpen")),
    "teenmuf": lazy(() => import("./Result_MuflisTeenPatti")),
    "muflisteenpatti": lazy(() => import("./Result_MuflisTeenPatti")),
    "patti2": lazy(() => import("./Result_TeenPatti2Cards")),
    "teen41": lazy(() => import("./Result_TeenPatti41")),
    "teen42": lazy(() => import("./Result_TeenPatti42")),
    "joker20": lazy(() => import("./Result_TeenPattiJoker20")),
    "poison": lazy(() => import("./Result_TeenPattiPoison")),
    "poisonteenpatti20": lazy(() => import("./Result_TeenPattiPoison20")),

    // "joker1": lazy(() => import("./Result_JokerTeenPatti1")),
    "joker1": lazy(() => import("./Result_JokerTeenPattiOneDay")),
    "joker120": lazy(() => import("./Result_JokerTeenPattiOneDay")),

    "teen20c": lazy(() => import("./Result_TeenUnique")),

    "btable": lazy(() => import("./Result_BollyWoodTable")),
    "btable2": lazy(() => import("./Result_BollywoodCasino2")),

    "teen": lazy(() => import("./Result_OdiTeenPatti")),

    "card32": lazy(() => import("./Result_Card32")),
    "card32eu": lazy(() => import("./Result_Card32")),

    "aaa": lazy(() => import("./Result_AAA")),
    "aaa2": lazy(() => import("./Result_AAA2")),
    "teen62": lazy(() => import("./Result_Teen62")),

    "teen3": lazy(() => import("./Result_InstantTeenPatti")),
    "teen32": lazy(() => import("./Result_InstantTeenPatti")),
    "teen33": lazy(() => import("./Result_InstantTeenPatti")),

    "teen20": lazy(() => import("./Result_Teenpatti20")),
    "teen20b": lazy(() => import("./Result_Teenpatti20")),
    "teen20c": lazy(() => import("./Result_Teenpatti20")),

    "dum10": lazy(() => import("./Result_Dum10")),
    "kbc": lazy(() => import("./Result_KBC")),
    "worli2": lazy(() => import("./Result_InstantWorli")),
    "worli": lazy(() => import("./Result_InstantWorli")),
    "ballbyball": lazy(() => import("./Result_BallByBall")),
    "lucky15": lazy(() => import("./Result_BallByBall")),

    // "trio": lazy(() => import("./Result_TeenPattiPoison")),
    "trio": lazy(() => import("./Result_one")),
    "notenum": lazy(() => import("./Result_one")),
    "dolidana": lazy(() => import("./Result_one")),

    "lucky7": lazy(() => import("./Result_one")),
    "lucky7eu": lazy(() => import("./Result_one")),
    "lucky7eu2": lazy(() => import("./Result_one")),
    "lucky5": lazy(() => import("./Result_one")),

    "trap": lazy(() => import("./Result_Trap")),

    "lottcard": lazy(() => import("./Result_one")),
    "3cardj": lazy(() => import("./Result_one")),

    "poison": lazy(() => import("./Result_Poison")),
    "poison20": lazy(() => import("./Result_Poison")),
};

const RadioFilter = ({ id, label, value, checked, onChange, name = "example" }) => {
    return (
        <div className="custom-control custom-radio custom-control-inline">
            <input
                type="radio"
                id={id}
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                className="custom-control-input"
            />
            <label htmlFor={id} className="custom-control-label">{label}</label>
        </div>
    );
};


const Result_Parent = memo(({ mid, type, setMid }) => {
    console.log('### type', type); // output : goal
    const [isLoading, setIsLoading] = useState(false);
    const isMobile = useIsMobile();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resultData, setResultData] = useState();
    const [roundDetails, setRoundDetails] = useState();
    const Component = ResultComponentMap[type];
    const casino_list = useSelector(state => state.casino.casino_list);
    const [time, setTime] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [betData, setBetData] = useState([]);
    let gameName;

    if (type.includes("superover")) {
        gameName = "Result";
    } else if (type.includes("cricketv3")) {
        gameName = "Result";
    } else if (type === "teen62") {
        gameName = "V VIP Teenpatti 1-day Result";
    } else if (type === "lottcard") {
        gameName = "Details";
    } else if (type === "btable") {
        gameName = "Bollywood Casino Result";
    } else if (type === "card32") {
        gameName = "32 Cards A Result";
    } else if (type === "card32eu") {
        gameName = "32 Cards B Result";
    } else {
        gameName = `${getGameNameFromType(type, casino_list)} Result`;
    }

    const isMatchTimeDown = useIsMobile(470) && !type.includes("superover") && !type.includes("cricketv3");

    const roundId__ = roundDetails?.rid || roundDetails?.roundId || roundDetails?.mid;
    const roundId = getValueAfterDot(roundId__);

    const matchTime = roundDetails?.mtime || roundDetails?.matchTime || roundDetails?.time;

    async function getResultDataApi() {
        const midToPass = getValueAfterDot(mid);
        setIsLoading(true);
        try {
            const response = await fetchResultById(midToPass, type);

            const data = response.data;
            setTime(data?.result_time);
            if (data) {
                setResultData(data);
                const parsed = JSON.parse(data.data);
                console.log('parsed', parsed);
                setRoundDetails(parsed?.t1 || parsed?.[0]);
                setBetData(response.betdata || []);
            } else {
                showToast({ isSuccess: false, message: response.message || "Details not available" })
            }
        } catch (error) {
            console.log('error', error);
        }
        setIsLoading(false);
    }

    useEffect(() => {
        console.log('## mid', mid);
        if (mid) {
            getResultDataApi();
            setIsModalOpen(true);
        }
    }, [mid]);

    const onClose = () => {
        setIsModalOpen(false);
        setResultData(null);
        setBetData([]);
        setSelectedFilter('all');
        setMid?.(null);
    };

    if (!Component) return showToast({ isSuccess: false, message: "Result file not found" });// still show this
    const showNoDataMessage = false;

    const filteredBets = betData.filter(bet =>
        selectedFilter === 'all' || bet.bet_type === selectedFilter
    );

    const totalBets = filteredBets.length;
    const totalWin = filteredBets.reduce((sum, bet) => sum + Number(bet.bet_result || 0), 0);

    return (
        <Modal_wrapper
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            title={gameName}
            onClose={onClose}
            isResult={true}
        // roundInfo={{ rid: roundId, mtime: matchTime }}
        // showNoDataMessage={!resultData?.rid}
        >
            {isLoading
                ? <Loading />
                : !resultData || !resultData?.game_type
                    ? <DataNotFound />
                    : <div className='result-popup'>
                        <div
                            className={styles['casino-result-round']}
                            style={{
                                flexDirection: isMatchTimeDown ? 'column' : 'row',
                                alignItems: isMatchTimeDown ? 'start' : 'center',
                            }}
                        >
                            <div>Round ID: {roundId}</div>

                            <div>
                                Match Time:
                                {/* <span>{formatToUTCMinus8(matchTime)}</span> */}
                                <span>{' '}{time}</span>
                            </div>
                        </div>

                        <Suspense fallback={<div>Loading result...</div>}>
                            <Component modalContent={resultData} />
                        </Suspense>

                        {betData && betData.length > 0 && (
                            <div>
                                <ResultBetTable />
                                <div className="mt-2">
                                    <RadioFilter
                                        id="soda-all"
                                        label="All"
                                        value="all"
                                        checked={selectedFilter === 'all'}
                                        onChange={() => setSelectedFilter('all')}
                                    />
                                    <RadioFilter
                                        id="soda-back"
                                        label="Back"
                                        value="Back"
                                        checked={selectedFilter === 'Back'}
                                        onChange={() => setSelectedFilter('Back')}
                                    />
                                    <RadioFilter
                                        id="soda-lay"
                                        label="Lay"
                                        value="Lay"
                                        checked={selectedFilter === 'Lay'}
                                        onChange={() => setSelectedFilter('Lay')}
                                    />
                                    <RadioFilter
                                        id="soda-deleted"
                                        label="Deleted"
                                        value="Deleted"
                                        checked={selectedFilter === 'Deleted'}
                                        onChange={() => setSelectedFilter('Deleted')}
                                    />

                                    <div className="custom-control-inline total-soda">
                                        <div>
                                            Total Bets:{' '}
                                            <span className="text-success mr-2">{totalBets}</span> Total Win:{' '}
                                            <span className={totalWin >= 0 ? 'text-success' : 'text-danger'}>{totalWin}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="table-responsive report-table-modal mt-2 report-table">
                                    <table className="table kk-table" style={{ background: 'transparent' }}>
                                        <thead>
                                            <tr>
                                                <th className="bet-nation">
                                                    <div>Nation</div>
                                                </th>
                                                <th className="text-right bet-user-rate">
                                                    <div>Rate</div>
                                                </th>
                                                <th className="text-right bet-amount">
                                                    <div>Amount</div>
                                                </th>
                                                <th className="text-right bet-amount">
                                                    <div>Win</div>
                                                </th>
                                                <th className="bet-date">
                                                    <div>Date</div>
                                                </th>
                                                <th className="bet-ip">
                                                    <div>Ip Address</div>
                                                </th>
                                                <th className="bet-remark">
                                                    <div>Browser Details</div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredBets.length > 0 ? (
                                                filteredBets.map((bet, index) => (
                                                    <tr key={index} className={bet.bet_type?.toLowerCase() === 'back' ? 'back-border' : 'lay-border'}>
                                                        <td className="bet-nation">
                                                            <div>
                                                                <div className="d-inline-block vm custom-control custom-checkbox">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="custom-control-input"
                                                                        value="0"
                                                                        id={`bet-check-${index}`}
                                                                    />
                                                                    <label
                                                                        className="custom-control-label"
                                                                        htmlFor={`bet-check-${index}`}
                                                                    ></label>
                                                                </div>
                                                                {' '}
                                                                <span className="d-inline">{bet.market_name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="text-right bet-user-rate">
                                                            <div>{bet.bet_odds}</div>
                                                        </td>
                                                        <td className="text-right bet-amount">
                                                            <div>{bet.bet_stack}</div>
                                                        </td>
                                                        <td className="text-right bet-amount">
                                                            <div className={Number(bet.bet_result) >= 0 ? 'text-success' : 'text-danger'}>
                                                                {bet.bet_result}
                                                            </div>
                                                        </td>
                                                        <td className="bet-date">
                                                            <div>{bet.bet_time}</div>
                                                        </td>
                                                        <td className="bet-ip">
                                                            <div>{bet.bet_ip_address}</div>
                                                        </td>
                                                        <td className="bet-remark">
                                                            <u title={bet.bet_user_agent} style={{ cursor: 'pointer' }}>Detail</u>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr className="no-record">
                                                    <td colSpan="7">no records found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}


                    </div>
            }
        </Modal_wrapper>
    )
})

export default Result_Parent


// andarbahar 150
// teenpatti one day
// teenpatti 1 day