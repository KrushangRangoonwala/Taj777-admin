import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { fetchResultById } from '../../../../api/API';
import { useSelector } from 'react-redux';
import useIsMobile from '../../../../hooks/useIsMobile';
// import showToast from '../../../../utilies/toaster';
import { getGameNameFromType, getValueAfterDot } from '../../../../utilies/helpers';

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

function ResultModalNotFound() {
    return (
        <div className="text-center" style={{ fontFamily: "monospace", fontSize: "18px" }}>Result Modal not found</div>
    )
}

const Result_instantTeenpatti = lazy(() => import('../results/Result_instantTeenpatti'));

const resultMap = { // BY GAME_TYPE
    "teen3": Result_instantTeenpatti,
    "teen32": Result_instantTeenpatti,
    "teen33": Result_instantTeenpatti,
}

function getGameName(type, casino_list) {
    if (type.includes("superover")) {
        return "Result";
    } else if (type.includes("cricketv3")) {
        return "Result";
    } else if (type === "teen62") {
        return "V VIP Teenpatti 1-day Result";
    } else if (type === "lottcard") {
        return "Details";
    } else if (type === "btable") {
        return "Bollywood Casino Result";
    } else if (type === "card32") {
        return "32 Cards A Result";
    } else if (type === "card32eu") {
        return "32 Cards B Result";
    } else {
        return `${getGameNameFromType(type, casino_list)} Result`;
    }
}

const Result_parent = ({ mid, game_type, setMid }) => {
    console.log('### game_type', game_type);
    const midToPass = getValueAfterDot(mid);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resultData, setResultData] = useState();
    const ResultComponent = resultMap[game_type] || ResultModalNotFound;
    const casino_list = useSelector(state => state.casino.casino_list);
    const [time, setTime] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [betData, setBetData] = useState([]);
    const gameName = getGameName(game_type, casino_list);

    const isMatchTimeDown = useIsMobile(470) && !game_type.includes("superover") && !game_type.includes("cricketv3");

    async function getResultDataApi() {
        setIsLoading(true);
        try {
            const response = await fetchResultById(midToPass, game_type);

            const data = response.data;
            setTime(data?.result_time);
            if (data) {
                setResultData(data);
                setBetData(response?.betdata || []);
            } else {
                // showToast({ isSuccess: false, message: response.message || "Details not available" })
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

    const showNoDataMessage = false;

    const filteredBets = betData.filter(bet =>
        selectedFilter === 'all' || bet.bet_type === selectedFilter
    );

    const totalBets = filteredBets.length;
    const totalWin = filteredBets.reduce((sum, bet) => sum + Number(bet.bet_result || 0), 0);



    return (
        <Modal
            show={isModalOpen}
            onHide={onClose}
            size="xl"
            className="casino-result-modal"
        >
            <Modal.Header>
                <Modal.Title as="h5">{gameName}</Modal.Title>
                <button type="button" className="btn-close result-modal-close-btn" aria-label="Close" onClick={onClose}>x</button>
            </Modal.Header>
            <Modal.Body>
                <div className="casino-result-round">
                    <div>Round-ID: {midToPass}</div>
                    <div>
                        Match Time: <span>{time}</span>
                    </div>
                </div>

                <Suspense fallback={<div>Loading...</div>}>
                    <ResultComponent resultData={resultData} />
                </Suspense>

                {betData && betData.length > 0 && (
                    <div>
                        <div className="mt-4">
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
                            <div className="custom-control-inline float-right">
                                <h5>Total Bets: <span className="text-success mr-2">{totalBets}</span> Total Win: <span
                                    className={totalWin >= 0 ? "text-success" : "text-danger"}>{totalWin}</span></h5>
                            </div>
                        </div>
                        <div className="table-responsive report-table">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="user-name">
                                            <div>Username</div>
                                        </th>
                                        <th className="event-name">
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
                                        <th>
                                            <div>IP</div>
                                        </th>
                                        <th>
                                            <div>B Details</div>
                                        </th>
                                        <th className="text-right">
                                            <div>Action</div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBets.length > 0 ? (
                                        filteredBets.map((bet, index) => (
                                            <tr key={index} className={bet.bet_type?.toLowerCase() === 'back' ? 'back-border' : 'lay-border'}>
                                                <td className="user-name"><span>{bet.user_name}</span></td>
                                                <td className="event-name">
                                                    <div>{bet.market_name}</div>
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
                                                <td><a href="javascript:void(0)">{bet.bet_ip_address}</a></td>
                                                <td>
                                                    <a
                                                        href="javascript:void(0)"
                                                        title={bet.bet_user_agent}
                                                        className="text-success"
                                                    >
                                                        Detail
                                                    </a>
                                                </td>
                                                <td className="text-right">
                                                    <div className="custom-control custom-checkbox">
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
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr className="no-record">
                                            <td colSpan="9">no records found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </Modal.Body>
        </Modal>
    );
};

export default Result_parent;
