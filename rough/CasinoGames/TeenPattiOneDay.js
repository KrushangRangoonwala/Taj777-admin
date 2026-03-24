import React from "react";

const TeenPattiOneDay = ({ isVisible }) => {

    return (
        <>
            <div className="casino-table teenpatti1day">
                <div className="casino-video">

                    <div className="casino-video-title"><span className="casino-name">Teenpatti 1-day</span> <span className="casino-video-rid">Round ID: 101240827120847</span></div>
                    <div className="video-box-container">
                        <div className="video-box"><iframe src="/mediaplayer/teen/d22969f5-f212-416b-b3ea-7e7936397a53"></iframe></div>
                    </div>
                    <div className="casino-video-cards">
                        <div className="casino-cards-shuffle"><i className="fas fa-grip-lines-vertical"></i></div>
                        <div className="casino-video-cards-container">
                            <div><span><img src="https://wver.sprintstaticdata.com/v65/static/front/img/cards/4HH.png" /></span> <span><img src="https://wver.sprintstaticdata.com/v65/static/front/img/cards/4SS.png" /></span> <span><img src="https://wver.sprintstaticdata.com/v65/static/front/img/cards/1.png" /></span></div>
                            <div><span><img src="https://wver.sprintstaticdata.com/v65/static/front/img/cards/KSS.png" /></span> <span><img src="https://wver.sprintstaticdata.com/v65/static/front/img/cards/10HH.png" /></span> <span><img src="https://wver.sprintstaticdata.com/v65/static/front/img/cards/1.png" /></span></div>
                        </div>
                    </div>
                    <div className="casino-timer d-none-mobile">
                        <div className="base-timer">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="base-timer__svg">
                                <g className="base-timer__circle">
                                    <circle cx="50" cy="50" r="45" className="base-timer__path-elapsed"></circle>
                                    <path stroke-dasharray="152 283" d="
                                        M 50, 50
                                        m -45, 0
                                        a 45,45 0 1,0 90,0
                                        a 45,45 0 1,0 -90,0
                                        " className="base-timer__path-remaining green"></path>
                                </g>
                            </svg>
                            <span className="base-timer__label green"><span>2</span><span className="component-fade-enter-active component-fade-enter-to">2</span></span>
                        </div>
                    </div>

                    <div className="casino-video-right-icons">
                        <div className="casino-video-home-icon net-icon"><i className="fas fa-video-slash"></i></div>
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
                                    <div className="back casino-bl-box-item"><span className="casino-box-odd">1.13</span></div>
                                    <div className="lay casino-bl-box-item"><span className="casino-box-odd">1.16</span></div>
                                </div>
                            </div>
                            <div className="casino-box-row">
                                <div className="casino-nation-name casino-card-img">
                                    <b>Consecutive</b>
                                    <div className="float-right"><span className="mr-2 d-none">0</span></div>
                                </div>
                                <div className="casino-bl-box">
                                    <div className="back casino-bl-box-item suspended"><span className="casino-box-odd">0</span></div>
                                    <div className="lay casino-bl-box-item suspended"><span className="casino-box-odd">0</span></div>
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
                            <div className="casino-box-row">
                                <div className="casino-nation-name casino-card-img">
                                    <b>Consecutive</b>
                                    <div className="float-right"><span className="mr-2 d-none">0</span></div>
                                </div>
                                <div className="casino-bl-box">
                                    <div className="back casino-bl-box-item suspended"><span className="casino-box-odd">0</span></div>
                                    <div className="lay casino-bl-box-item suspended"><span className="casino-box-odd">0</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="teen1dayother">
                            <div className="casino-box-row">
                                <div className="casino-nation-name no-border"></div>
                                <div className="casino-bl-box">
                                    <div className="casino-bl-box-item"><b>Card 1</b></div>
                                </div>
                                <div className="casino-bl-box">
                                    <div className="casino-bl-box-item"><b>Card 2</b></div>
                                </div>
                                <div className="casino-bl-box">
                                    <div className="casino-bl-box-item"><b>Card 3</b></div>
                                </div>
                                <div className="casino-bl-box">
                                    <div className="casino-bl-box-item"><b>Card 4</b></div>
                                </div>
                                <div className="casino-bl-box">
                                    <div className="casino-bl-box-item"><b>Card 5</b></div>
                                </div>
                                <div className="casino-bl-box">
                                    <div className="casino-bl-box-item"><b>Card 6</b></div>
                                </div>
                            </div>
                            <div className="casino-box-row">
                                <div className="casino-nation-name"><b>Odd</b></div>
                                <div className="casino-bl-box">
                                    <div className="back casino-bl-box-item suspended"><span className="casino-box-odd">0</span> <span className="d-none">0</span></div>

                                </div>
                                <div className="casino-bl-box">
                                    <div className="back casino-bl-box-item suspended"><span className="casino-box-odd">0</span> <span className="d-none">0</span></div>

                                </div>
                                <div className="casino-bl-box">
                                    <div className="back casino-bl-box-item suspended"><span className="casino-box-odd">0</span> <span className="d-none">0</span></div>

                                </div>
                                <div className="casino-bl-box">
                                    <div className="back casino-bl-box-item suspended"><span className="casino-box-odd">0</span> <span className="d-none">0</span></div>

                                </div>
                                <div className="casino-bl-box">
                                    <div className="back casino-bl-box-item"><span className="casino-box-odd">1.75</span> <span className="d-none">0</span></div>

                                </div>
                                <div className="casino-bl-box">
                                    <div className="back casino-bl-box-item suspended"><span className="casino-box-odd">0</span> <span className="d-none">0</span></div>

                                </div>
                            </div>
                            <div className="casino-box-row">
                                <div className="casino-nation-name"><b>Even</b></div>
                                <div className="casino-bl-box">

                                    <div className="back casino-bl-box-item suspended"><span className="casino-box-odd">0</span> <span className="d-none">0</span></div>
                                </div>
                                <div className="casino-bl-box">

                                    <div className="back casino-bl-box-item suspended"><span className="casino-box-odd">0</span> <span className="d-none">0</span></div>
                                </div>
                                <div className="casino-bl-box">

                                    <div className="back casino-bl-box-item suspended"><span className="casino-box-odd">0</span> <span className="d-none">0</span></div>
                                </div>
                                <div className="casino-bl-box">

                                    <div className="back casino-bl-box-item suspended"><span className="casino-box-odd">0</span> <span className="d-none">0</span></div>
                                </div>
                                <div className="casino-bl-box">

                                    <div className="back casino-bl-box-item"><span className="casino-box-odd">2.25</span> <span className="d-none">0</span></div>
                                </div>
                                <div className="casino-bl-box">

                                    <div className="back casino-bl-box-item suspended"><span className="casino-box-odd">0</span> <span className="d-none">0</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="casino-remark mt-1">
                        <div className="remark-icon"><img src="https://wver.sprintstaticdata.com/v65/static/front/img/icons/remark.png" /></div>
                        <marquee> </marquee>
                    </div>

                </div>

            </div>
        </>

    );
};

export default TeenPattiOneDay;
