import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { fetchResultById } from '../../../../api/API';
import { useSelector } from 'react-redux';
import useIsMobile from '../../../../hooks/useIsMobile';
// import showToast from '../../../../utilies/toaster';
import { getGameNameFromType, getValueAfterDot } from '../../../../utilies/helpers';

import Result_BetData from './Result_BetData';

function ResultModalNotFound() {
    return (
        <div className="text-center" style={{ fontFamily: "monospace", fontSize: "18px" }}>Result Modal not found</div>
    )
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


const Result_instantTeenpatti = lazy(() => import('../results/Result_instantTeenpatti'));
const Result_one = lazy(() => import('../results/Result_one'));

const resultMap = { // BY GAME_TYPE
    "teen3": Result_one,
    "teen32": Result_one,
    "teen33": Result_one,
}

const Result_parent = ({ mid, game_type, setMid }) => {
    console.log('### game_type', game_type);
    const midToPass = getValueAfterDot(mid);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resultData, setResultData] = useState();
    const ResultComponent = resultMap[game_type] || ResultModalNotFound;
    const casino_list = useSelector(state => state.casino.casino_list);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [time, setTime] = useState('');

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

                {betData && betData.length > 0 &&
                    <Result_BetData
                        betData={betData}
                        selectedFilter={selectedFilter}
                        setSelectedFilter={setSelectedFilter}
                    />}

            </Modal.Body>
        </Modal>
    );
};

export default Result_parent;
