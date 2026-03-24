import React from "react";

const TeenPatti = ({ isVisible }) => {

    return (
        <>
            <div className="casino-table teenpatti1day">
                <div className="casino-video">

                    <div className="casino-video-title"><span className="casino-name">Instant Teenpatti 3.0</span> <span className="casino-video-rid">Round ID: 157240821130027</span></div>
                    <div className="video-box-container">
                        <div className="video-box">
                            <iframe src="/mediaplayer/teen33/7b47ec89-e58e-497b-9497-e8b4cf46de98">
                                <div id="EjMPCVOJqR"><video disableremoteplayback="" id="h5live-EjMPCVOJqR" playsinline="" poster="https://wver.sprintstaticdata.com/v65/static/videoplayer/nplayer/js/videobg.jpg"><source src="blob:https://wolf777.com/1cf25757-f250-4ecc-832e-51a647ae361b" /></video></div>
                            </iframe>
                        </div>
                    </div>
                    <div className="casino-video-cards">
                        <div className="casino-cards-shuffle"><i className="fas fa-grip-lines-vertical"></i></div>
                        <div className="casino-video-cards-container">
                            <div>
                                <span><img src="https://wver.sprintstaticdata.com/v65/static/front/img/cards/9CC.png" /></span>
                                <span><img src="https://wver.sprintstaticdata.com/v65/static/front/img/cards/8HH.png" /></span>
                                <span><img src="https://wver.sprintstaticdata.com/v65/static/front/img/cards/6SS.png" /></span>
                            </div>
                            <div>
                                <span><img src="https://wver.sprintstaticdata.com/v65/static/front/img/cards/9DD.png" /></span>
                                <span><img src="https://wver.sprintstaticdata.com/v65/static/front/img/cards/5CC.png" /></span>
                                <span><img src="https://wver.sprintstaticdata.com/v65/static/front/img/cards/1.png" /></span>
                            </div>
                        </div>
                    </div>
                    <div className="casino-timer d-none-mobile">
                        <div className="base-timer">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="base-timer__svg">
                                <g className="base-timer__circle">
                                    <circle cx="50" cy="50" r="45" className="base-timer__path-elapsed"></circle>
                                    <path stroke-dasharray="48 283" d="
                                    M 50, 50
                                    m -45, 0
                                    a 45,45 0 1,0 90,0
                                    a 45,45 0 1,0 -90,0
                                    " className="base-timer__path-remaining orange"></path>
                                </g>
                            </svg>
                            <span className="base-timer__label orange"><span className="component-fade-enter-active component-fade-enter-to">5</span></span>
                        </div>
                    </div>

                    <div className="casino-video-right-icons">
                        <div title="Home" className="casino-video-home-icon"><a href="/owncasino" className=""><i className="fas fa-home"></i></a></div>
                        <div title="Rules" className="casino-video-rules-icon"><i className="fas fa-info-circle"></i></div>

                    </div>

                </div>
                <div className="casino-detail">
                    <div className="teen1daycasino-container d-none-small">
                        <div className="teen1dayleft">
                            <div className="casino-box-row">
                                <div className="casino-nation-name no-border casino-bl-box-title">
                                    <div className="playera">Player A</div>
                                </div>
                                <div className="casino-bl-box casino-bl-box-title">
                                    <div className="casino-bl-box-item"><b>Back</b></div>
                                    <div className="casino-bl-box-item"><b>Lay</b></div>
                                </div>
                            </div>
                            <div className="casino-box-row">
                                <div className="casino-nation-name">
                                    <b>Main</b>
                                    <div className="float-right"><span className="mr-2 d-none"></span></div>
                                </div>
                                <div className="casino-bl-box">
                                    <div className="back casino-bl-box-item"><span className="casino-box-odd">1.88</span></div>
                                    <div className="lay casino-bl-box-item"><span className="casino-box-odd">1.92</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="teen1daycenter"></div>
                        <div className="teen1dayright">
                            <div className="casino-box-row">
                                <div className="casino-nation-name no-border casino-bl-box-title">
                                    <div className="playerb">Player B</div>
                                </div>
                                <div className="casino-bl-box casino-bl-box-title">
                                    <div className="casino-bl-box-item"><b>Back</b></div>
                                    <div className="casino-bl-box-item"><b>Lay</b></div>
                                </div>
                            </div>
                            <div className="casino-box-row">
                                <div className="casino-nation-name">
                                    <b>Main</b>
                                    <div className="float-right"><span className="mr-2 d-none"></span></div>
                                </div>
                                <div className="casino-bl-box">
                                    <div className="back casino-bl-box-item suspended"><span className="casino-box-odd">0</span></div>
                                    <div className="lay casino-bl-box-item suspended"><span className="casino-box-odd">0</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </>

    );
};

export default TeenPatti;
