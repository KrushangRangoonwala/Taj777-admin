import React, { useState, useEffect } from 'react';
import { Collapse } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SafeIframe from '../../../components/SafeIframe';
import ViewMoreModal from './ViewMoreModal';
import { isPageAtTop } from '../../../utilies/helpers';
import useIsMobile from '../../../hooks/useIsMobile';
import { getViewMoreMatch } from '../../../api/API';

function getBetType(betData) {
    const type = betData?.bet_type?.toLowerCase();
    if (type == 'lay' || type == 'no') return "lay";
    if (type == 'back' || type == 'yes') return "back";
    return 'back';
}

const EventRightSidebar = ({ tvUrl, liveScoreData, isLive, activeBets, event_id }) => {
    const [isTvOn, setIsTvOn] = useState(false);
    const [showViewMore, setShowViewMore] = useState(false);
    const [betList, setBetList] = useState([]);
    const [viewMoreLoading, setViewMoreLoading] = useState(false);
    const [viewMoreData, setViewMoreData] = useState([]);
    const [isSticky, setIsSticky] = useState(false);
    const isMobile = useIsMobile(1279)

    useEffect(() => {
        setBetList(activeBets);
    }, [activeBets]);

    console.log("ACTIVE BETS IN SIDEBAR", activeBets);

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(!isPageAtTop());
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const openViewMoreModal = async () => {

        try {

            setShowViewMore(true);
            setViewMoreLoading(true);

            const payload = {
                event_id: event_id || "",
                page: 1,
                limit: 100
            };

            const response = await getViewMoreMatch(payload);

            if (response?.status === "ok") {

                setViewMoreData(
                    response?.data || []
                );

            } else {

                setViewMoreData([]);
            }

        } catch (error) {

            console.log("VIEW MORE API ERROR", error);

            setViewMoreData([]);

        } finally {

            setViewMoreLoading(false);
        }
    };

    return (
        <div className={`right-sidebar ${isSticky && !isMobile ? 'sticky' : ''}`} data-simplebar="true">
            {isLive &&
                <div className="card m-b-10">
                    <div data-toggle="collapse" data-target=".video-tv" aria-expanded="true" className="card-header pointer" onClick={() => setIsTvOn(!isTvOn)}>
                        <h6 className="card-title">
                            <Link to="" title="">
                                <img src={`/${import.meta.env.VITE_IMAGE_PATH}/assets/images/arrow-down.svg`} className="mr-1" />
                            </Link>
                            Live Match
                        </h6>
                    </div>
                    <Collapse in={isTvOn}>
                        <div className="video-tv">
                            <SafeIframe allow="autoplay" src={tvUrl} />
                        </div>
                    </Collapse>
                </div>}

            <div className="card m-b-10">
                {liveScoreData && (
                    <>
                        <div className="scorecard p-2">
                            <div className="scorecard-row">
                                <div className="score-top-row">
                                    <div className="score-team">
                                        <b>{liveScoreData.activenation1 === '1' ? liveScoreData.spnnation2 : liveScoreData.spnnation1}</b>
                                    </div>
                                    <div className="score-rr"></div>
                                </div>
                            </div>
                            <div className="scorecard-row">
                                <div className="score-top-row">
                                    <div className="score-team">
                                        <b>{liveScoreData.activenation1 === '1' ? liveScoreData.spnnation1 : liveScoreData.spnnation2}</b>{' '}
                                        {liveScoreData.activenation1 === '1' ? liveScoreData.score1 : liveScoreData.score2}
                                    </div>
                                    <div className="score-rr">
                                        {liveScoreData.activenation1 === '1' ? (
                                            liveScoreData.spnrunrate1 && <span> CRR {liveScoreData.spnrunrate1}</span>
                                        ) : (
                                            liveScoreData.spnrunrate2 && <span> CRR {liveScoreData.spnrunrate2}</span>
                                        )}
                                    </div>
                                    <div className="score-message">
                                        {liveScoreData.balls && liveScoreData.balls.map((ball, index) => (
                                            <span key={index} className={`ball-runs mr-1 ${ball.toLowerCase().includes('w') ? 'wicket' : ''}`}>
                                                {ball}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div id="my-game-bets" className="card m-b-10 my-bet">
                <div className="card-header">
                    <h6 className="card-title float-left">My Bets</h6>
                        <a
                        href="javascript:void(0)"
                        className="btn btn-back float-right"
                        onClick={openViewMoreModal}
                        >
                        View More
                        </a>
                </div>
                <div className="card-body">
                    <div className="tabs">
                        <ul role="tablist" className="nav nav-tabs small">
                            <li role="presentation" className="nav-item">
                                <a role="tab" aria-selected="true" href="#" target="_self" className="nav-link active">Matched Bets</a>
                            </li>
                        </ul>
                        <div className="tab-content">
                            <div role="tabpanel" className="tab-pane active">
                                <div className="table-responsive">
                                    <table className="table coupon-table mb-0">
                                        <thead>
                                            <tr>
                                                <th style={{ minWidth: '90px' }}>UserName</th>
                                                <th style={{ minWidth: '90px' }}>Nation</th>
                                                <th className="text-right" style={{ minWidth: '50px' }}>Rate</th>
                                                <th className="text-right" style={{ minWidth: '70px' }}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {betList.length > 0 ? (
                                                betList.map((bet, index) => (
                                                    <React.Fragment key={index}>
                                                        <tr className={`${getBetType(bet)}-border`}>
                                                            <td colSpan="4"><b>{bet.display_market_type}</b> <span className="float-right">{bet.bet_time}</span></td>
                                                        </tr>
                                                        <tr className={`${getBetType(bet)}-border`}>
                                                            <td className="bt0">{bet.email}</td>
                                                            <td className="bt0">
                                                                {bet.marketName}
                                                            </td>
                                                            <td className="text-right bt0">{bet.odd}</td>
                                                            <td className="text-right bt0">{bet.bet_stack}</td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan="4" style={{ height: '3px', padding: '0px' }}></td>
                                                        </tr>
                                                    </React.Fragment>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center">No records found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ViewMoreModal
                show={showViewMore}
                onHide={() => setShowViewMore(false)}
                betList={viewMoreData}
                loading={viewMoreLoading}
            />
        </div>
    );
};

export default EventRightSidebar;
