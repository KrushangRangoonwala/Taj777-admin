import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

const PlaceBetModal = ({ isOpen, onClose, betData, onSubmit }) => {
    const [amount, setAmount] = useState('');
    const [profit, setProfit] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setAmount('');
            setProfit(0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (amount && betData?.odds) {
            const calculatedProfit = (parseFloat(amount) * (parseFloat(betData.odds) - 1)).toFixed(2);
            setProfit(calculatedProfit);
        } else {
            setProfit(0);
        }
    }, [amount, betData]);

    if (!betData) return null;

    const { teamName, odds, minBet, maxBet, isBack } = betData;

    const handleQuickBet = (value) => {
        const currentAmount = parseInt(amount) || 0;
        setAmount((currentAmount + value).toString());
    };

    const handleClear = () => {
        setAmount('');
        setProfit(0);
    };

    const handleSubmit = () => {
        const betAmount = parseInt(amount);
        if (betAmount >= minBet && betAmount <= maxBet) {
            onSubmit({
                ...betData,
                amount: betAmount,
                profit: profit
            });
            onClose();
        }
    };

    const isValidAmount = () => {
        const betAmount = parseInt(amount);
        return amount !== '' && betAmount >= minBet && betAmount <= maxBet;
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Place Bet Modal"
            style={{
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    padding: '0',
                    maxWidth: '400px',
                    width: '90%',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#1a202c',
                },
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    zIndex: 99999,
                },
            }}
        >
            <div style={{ backgroundColor: '#1a202c', color: '#fff' }}>
                {/* Header */}
                <div style={{
                    backgroundColor: '#2d3748',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: '8px 8px 0 0'
                }}>
                    <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#aaafb5' }}>
                        PLACE BET
                    </h5>
                    <span style={{ fontSize: '13px', color: '#aaafb5' }}>
                        Range: <span style={{ color: '#fff' }}>{minBet}</span>-<span style={{ color: '#fff' }}>{maxBet / 1000}K</span>
                    </span>
                </div>

                {/* Bet Details Table */}
                <div style={{ padding: '16px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#2d5f4e', color: '#fff' }}>
                                <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>(Bet For)</th>
                                <th style={{ padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>Odds</th>
                                <th style={{ padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>Stake</th>
                                <th style={{ padding: '8px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold' }}>Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ backgroundColor: isBack ? '#e3f2fd' : '#fce4ec' }}>
                                <td style={{ padding: '8px', fontSize: '13px', color: '#000', fontWeight: '500' }}>{teamName}</td>
                                <td style={{ padding: '8px', textAlign: 'center', fontSize: '13px', color: '#000' }}>
                                    <div style={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #ddd',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        display: 'inline-block'
                                    }}>
                                        {odds}
                                    </div>
                                </td>
                                <td style={{ padding: '8px', textAlign: 'center' }}>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder=""
                                        style={{
                                            width: '60px',
                                            padding: '4px 8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            textAlign: 'center',
                                            fontSize: '13px',
                                            backgroundColor: '#fff',
                                            color: '#000'
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.charCode < 48 || e.charCode > 57) {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                </td>
                                <td style={{ padding: '8px', textAlign: 'right', fontSize: '13px', color: '#000', fontWeight: '500' }}>
                                    {profit}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Quick Bet Buttons */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '8px',
                        marginBottom: '12px'
                    }}>
                        {[25, 50, 100, 200, 500, 1000].map((value) => (
                            <button
                                key={value}
                                onClick={() => handleQuickBet(value)}
                                style={{
                                    backgroundColor: '#2d7a5f',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#236b51'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#2d7a5f'}
                            >
                                +{value}
                            </button>
                        ))}
                    </div>

                    {/* Clear Button */}
                    <div style={{ textAlign: 'right', marginBottom: '12px' }}>
                        <button
                            onClick={handleClear}
                            style={{
                                backgroundColor: 'transparent',
                                color: '#4299e1',
                                border: 'none',
                                padding: '4px 8px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            Clear
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <button
                            onClick={handleClear}
                            style={{
                                backgroundColor: '#e53e3e',
                                color: '#fff',
                                border: 'none',
                                padding: '12px',
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#c53030'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#e53e3e'}
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!isValidAmount()}
                            style={{
                                backgroundColor: isValidAmount() ? '#38b2ac' : '#4a5568',
                                color: '#fff',
                                border: 'none',
                                padding: '12px',
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                cursor: isValidAmount() ? 'pointer' : 'not-allowed',
                                transition: 'background-color 0.2s',
                                opacity: isValidAmount() ? 1 : 0.6
                            }}
                            onMouseEnter={(e) => {
                                if (isValidAmount()) e.target.style.backgroundColor = '#2c7a7b';
                            }}
                            onMouseLeave={(e) => {
                                if (isValidAmount()) e.target.style.backgroundColor = '#38b2ac';
                            }}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default PlaceBetModal;
