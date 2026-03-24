import React, { useEffect, useState } from "react";
import Collapse from "react-bootstrap/Collapse";
import { useSelector } from "react-redux";
import { isBlue } from "../../utilies/helpers";
import "./TeenPattiBetList.css";

export function convertTeenPattiBetListFormat(bets) {
    const result = {
        'Open Bets': [],
        'Matched Bets': [],
        'Unmatched Bets': []
    };

    // Process bets and categorize them
    bets.forEach((bet) => {
        const betItem = {
            type: bet.bet_type,  // back/lay
            title: bet.market_name || 'Teen Patti ODI',
            rate: bet.odds || '0.00',
            stake: bet.stake || '0.00',
            status: bet.status || 'open',
            placedAt: bet.placed_at || new Date().toISOString()
        };

        // Categorize based on status
        if (bet.status === 'matched') {
            result['Matched Bets'].push(betItem);
        } else if (bet.status === 'unmatched') {
            result['Unmatched Bets'].push(betItem);
        } else {
            result['Open Bets'].push(betItem);
        }
    });

    return result;
}

const TeenPattiBetList = () => {
    const [openSections, setOpenSections] = useState({});
    const bets = useSelector((state) => state.bet.teenPattiBets || []);
    const [betList, setBetList] = useState({
        'Open Bets': [],
        'Matched Bets': [],
        'Unmatched Bets': []
    });

    useEffect(() => {
        if (bets && bets.length > 0) {
            const formattedBets = convertTeenPattiBetListFormat(bets);
            setBetList(formattedBets);
            
            // Auto-expand sections with bets
            const sectionsToOpen = {};
            Object.keys(formattedBets).forEach(section => {
                if (formattedBets[section].length > 0) {
                    sectionsToOpen[section] = true;
                }
            });
            setOpenSections(sectionsToOpen);
        } else {
            setBetList({
                'Open Bets': [],
                'Matched Bets': [],
                'Unmatched Bets': []
            });
        }
    }, [bets]);

    const toggleSection = (key) => {
        setOpenSections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="teenpatti-betlist-container">
            <h4 className="mb-0 bet-slip-title">My Teen Patti Bets</h4>

            {Object.entries(betList).map(([sectionKey, bets]) => (
                bets.length > 0 && (
                    <div key={sectionKey} className="teenpatti-bet-section">
                        {/* Header */}
                        <div
                            className={`teenpatti-bet-section-header ${!openSections[sectionKey] ? 'collapsed' : ''}`}
                            onClick={() => toggleSection(sectionKey)}
                        >
                            <span className="section-title">
                                {sectionKey} ({bets.length})
                            </span>
                            <span className="section-toggle">
                                {openSections[sectionKey] ? '−' : '+'}
                            </span>
                        </div>

                        {/* Collapse Body */}
                        <Collapse in={openSections[sectionKey]}>
                            <div className="teenpatti-bet-items">
                                {bets.map((bet, index) => (
                                    <div 
                                        key={index} 
                                        className={`teenpatti-bet-item ${isBlue(bet.type) ? 'back-border' : 'lay-border'}`}
                                    >
                                        <div className="bet-header">
                                            <span className="bet-time">{formatTime(bet.placedAt)}</span>
                                            <span className={`bet-status ${bet.status}`}>{bet.status}</span>
                                        </div>
                                        <div className="bet-content">
                                            <div className="bet-title" title={bet.title}>
                                                {bet.title}
                                            </div>
                                            <div className="bet-details">
                                                <div className="bet-odds">
                                                    <span>Odds:</span>
                                                    <strong>{bet.rate}</strong>
                                                </div>
                                                <div className="bet-stake">
                                                    <span>Stake:</span>
                                                    <strong>{bet.stake}</strong>
                                                </div>
                                            </div>
                                            {bet.potentialWin && (
                                                <div className="bet-potential">
                                                    <span>Potential Win:</span>
                                                    <strong>{bet.potentialWin}</strong>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Collapse>
                    </div>
                )
            ))}
        </div>
    );
};

export default TeenPattiBetList;
