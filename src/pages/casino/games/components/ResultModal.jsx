import React from 'react';
import { Modal } from 'react-bootstrap';

const ResultModal = ({ show, handleClose, resultData }) => {
    // For now, we are using static data as requested, ignoring resultData
    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="xl"
            className="casino-result-modal"
        >
            <Modal.Header>
                <Modal.Title>Teenpatti Joker 20-20 Result</Modal.Title>
                <button type="button" className="btn-close" aria-label="Close" onClick={handleClose}>x</button>
            </Modal.Header>
            <Modal.Body>
                <div className="casino-result-round">
                    <div>Round-ID: 169260328162119</div>
                    <div>
                        Match Time: <span>28/03/2026 03:51:19</span>
                    </div>
                </div>

                <div className="row row5">
                    <div className="col-12 col-lg-7">
                        <div className="casino-result-content joker-result">
                            {/* Joker Section */}
                            <div className="casino-result-content-item text-center">
                                <div className="casino-result-cards">
                                    <div className="d-inline-block">
                                        <h4 className="text-playerb">Joker</h4>
                                        <div className="casino-result-cards-item">
                                            <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/9HH.png" alt="Joker" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="casino-result-content-diveder d-none-mobile"></div>

                            {/* Player A Section */}
                            <div className="casino-result-content-item text-center">
                                <div className="casino-result-cards">
                                    <div className="d-inline-block">
                                        <h4>Player A</h4>
                                        <div className="casino-result-cards-item">
                                            <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/6CC.png" alt="Card" />
                                        </div>
                                        <div className="casino-result-cards-item">
                                            <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/7CC.png" alt="Card" />
                                        </div>
                                        <div className="casino-result-cards-item">
                                            <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/JDD.png" alt="Card" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="casino-result-content-diveder"></div>

                            {/* Player B Section */}
                            <div className="casino-result-content-item text-center">
                                <div className="casino-result-cards">
                                    <div className="casino-result-cards-item">
                                        <img
                                            src="https://wver.sprintstaticdata.com/v209/static/front/img/winner.png"
                                            className="winner-icon"
                                            alt="Winner"
                                        />
                                    </div>
                                    <div className="d-inline-block">
                                        <h4>Player B</h4>
                                        <div className="casino-result-cards-item">
                                            <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/6HH.png" alt="Card" />
                                        </div>
                                        <div className="casino-result-cards-item">
                                            <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/7SS.png" alt="Card" />
                                        </div>
                                        <div className="casino-result-cards-item">
                                            <img src="https://wver.sprintstaticdata.com/v209/static/front/img/cards/5HH.png" alt="Card" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-lg-5">
                        <div className="casino-result-desc">
                            <div className="casino-result-desc-item">
                                <div>Winner</div>
                                <div>Player B</div>
                            </div>
                            <div className="casino-result-desc-item">
                                <div>Odd/Even</div>
                                <div>Odd</div>
                            </div>
                            <div className="casino-result-desc-item">
                                <div>Color</div>
                                <div>Red</div>
                            </div>
                            <div className="casino-result-desc-item">
                                <div>Suit</div>
                                <div>Heart</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ResultModal;
