import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { apiGetMarketAnalysis } from '../api/API'; // <-- create/use this API

const MarketAnalysisModal = ({ show, onHide, selectedUser }) => {

    const [loading, setLoading] = useState(false);

    const [userDetail, setUserDetail] = useState(null);
    const [userLock, setUserLock] = useState([]);
    const [gameLock, setGameLock] = useState([]);
    const [events, setEvents] = useState([]);

    const [iplTeams, setIplTeams] = useState([]);

    // ==============================
    // API CALL
    // ==============================
    const fetchData = async () => {
        if (!selectedUser?.value) return;

        try {
            setLoading(true);

            const res = await apiGetMarketAnalysis({
                uid: selectedUser.value
            });

            if (res?.status === "ok") {

                const ud = res.user_detail || {};

                setUserDetail(ud);
                console.log("User Detail:", ud);
                setUserLock(res.user_lock || []);
                setGameLock(res.game_lock || []);
                setEvents(res.events || []);

                // dynamic fallback for teams
                const eventTeams =
                    res.events?.[0]?.teams ||
                    res.events?.[0]?.markets ||
                    [];

                setIplTeams(
                    eventTeams.map(t => ({
                        name: t.name || t.team_name || "-",
                        value: t.value ?? t.odds ?? "-"
                    }))
                );
            }

        } catch (err) {
            console.log("Market Analysis API error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show && selectedUser) {
            fetchData();
        }
    }, [show, selectedUser]);

    // ==============================
    // KEEP YOUR UI EXACT SAME
    // ==============================
    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            dialogClassName="modal-big"
            contentClassName="modal-content"
            aria-labelledby="market-analysis-modal-title"
        >
            <Modal.Header className="modal-header">
                <Modal.Title id="market-analysis-modal-title" as="h5" className="modal-title">
                    Market Analysis
                </Modal.Title>

                <button type="button" aria-label="Close" className="close" onClick={onHide}>×</button>
            </Modal.Header>

            <Modal.Body className="modal-body">

                <div className="search-analysis">
                    <div className="row row5">

                        {/* ================= GAME DETAIL ================= */}
                        <div className="col-md-3">
                            <div className="block-title"><span>Game Detail</span></div>

                            <div className="analysis-detail">

                                <div className="row row5">
                                    <label className="col-md-6"><b>Username</b></label>
                                    <div className="col-md-6 text-right">
                                        <b>{userDetail?.username || "-"}</b>
                                    </div>
                                </div>

                                <div className="row row5">
                                    <label className="col-md-6">Account Type</label>
                                    <div className="col-md-6 text-right">
                                        {userDetail?.account_type || "-"}
                                    </div>
                                </div>

                                <div className="row row5">
                                    <label className="col-md-6">General</label>
                                    <div className="col-md-6 text-right">
                                        {userDetail?.general ?? "-"}
                                    </div>
                                </div>

                                <div className="row row5">
                                    <label className="col-md-6">Exposure</label>
                                    <div className="col-md-6 text-right">
                                        {userDetail?.exposure ?? "-"}
                                    </div>
                                </div>

                                <div className="row row5">
                                    <label className="col-md-6">Credit Reference</label>
                                    <div className="col-md-6 text-right">
                                        {userDetail?.credit_reference ?? "-"}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* ================= USER LOCK ================= */}
                        <div className="col-md-4">
                            <div className="block-title"><span>User Lock</span></div>

                            <div className="search-analysis-table mb-3">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Master Name</th>
                                            <th className="text-center">User Act</th>
                                            <th className="text-center">Bet Active</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {userLock.length ? userLock.map((u, i) => (
                                            <tr key={i}>
                                                <td>{u.master_name || "-"}</td>
                                                <td className="text-center">
                                                    {u.user_act ? "✔" : "✖"}
                                                </td>
                                                <td className="text-center">
                                                    {u.bet_active ? "✔" : "✖"}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3" className="text-center">No records found</td>
                                            </tr>
                                        )}
                                    </tbody>

                                </table>
                            </div>
                        </div>

                        {/* ================= GAME LOCK ================= */}
                        <div className="col-md-5">
                            <div className="block-title"><span>Game Lock</span></div>

                            <div className="search-analysis-table mb-3">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>S.No.</th>
                                            <th>Master Name</th>
                                            <th className="text-center">Bet Lock</th>
                                            <th>Event Name</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {gameLock.length ? gameLock.map((g, i) => (
                                            <tr key={i}>
                                                <td>{i + 1}</td>
                                                <td>{g.master_name || "-"}</td>
                                                <td className="text-center">
                                                    {g.bet_lock ? "✔" : "✖"}
                                                </td>
                                                <td>{g.event_name || "-"}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="text-center">No records found</td>
                                            </tr>
                                        )}
                                    </tbody>

                                </table>
                            </div>
                        </div>

                    </div>

                    {/* ================= EVENTS ================= */}
                    <div className="market-analysis-container">

                        <div className="market-analysis-title">
                            <div>
                                <a href="javascript:void(0)">
                                    {events?.[0]?.event_name || "Event"}
                                </a>
                            </div>

                            <div>
                                {events?.[0]?.event_date || "-"}
                            </div>
                        </div>

                        <div className="market-analysis-content">

                            <div className="row row5">
                                <div className="col-md-4">

                                    <div className="market-analysis-content-detail">

                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th colSpan="2">
                                                        IPL Cup Winner Bookmaker
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {iplTeams.length ? iplTeams.map((team, index) => (
                                                    <tr key={index}>
                                                        <td>{team.name}</td>
                                                        <td className="text-right">{team.value}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="2" className="text-center">
                                                            No data
                                                        </td>
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

            </Modal.Body>
        </Modal>
    );
};

export default MarketAnalysisModal;