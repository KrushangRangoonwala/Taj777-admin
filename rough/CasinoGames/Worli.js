import React from "react";

const Worli = ({ isVisible }) => {

    return (
        <>
            <div className="casino-table worli">
                <div className="casino-video">

                    <div className="casino-video-title">
                        <span className="casino-name">Worli Matka</span>
                        <div className="casino-video-rid">Round ID: 126240828112220</div>
                    </div>
                    <div className="video-box-container">
                        <div className="video-box"><iframe src="/mediaplayer/worli/4c75a2f8-6587-4716-b0b1-d3fbeec0db10"></iframe></div>
                    </div>
                    <div className="casino-video-cards">
                        <div className="casino-cards-shuffle"><i className="fas fa-grip-lines-vertical"></i></div>
                        <div className="casino-video-cards-container">
                            <div><span><img src="https://wver.sprintstaticdata.com/v65/static/front/img/cards/9SS.png" /></span> <span><img src="https://wver.sprintstaticdata.com/v65/static/front/img/cards/9HH.png" /></span> <span><img src="https://wver.sprintstaticdata.com/v65/static/front/img/cards/6CC.png" /></span></div>
                        </div>
                    </div>
                    <div className="casino-timer d-none-small">
                        <div className="base-timer">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="base-timer__svg">
                                <g className="base-timer__circle">
                                    <circle cx="50" cy="50" r="45" className="base-timer__path-elapsed"></circle>
                                    <path stroke-dasharray="-94 283" d="
                                        M 50, 50
                                        m -45, 0
                                        a 45,45 0 1,0 90,0
                                        a 45,45 0 1,0 -90,0
                                        " className="base-timer__path-remaining red"></path>
                                </g>
                            </svg>
                            <span className="base-timer__label red"><span>0</span></span>
                        </div>
                    </div>

                    <div className="casino-video-right-icons">
                        <div title="Home" className="casino-video-home-icon"><a href="/owncasino" className=""><i className="fas fa-home"></i></a></div>
                    </div>
                </div>
                <div className="casino-detail">
                    <div className="casino-tabs">
                        <ul className="nav nav-tabs">
                            <li className="nav-item"><a href="#single" data-toggle="tab" className="nav-link active">Single</a></li>
                            <li className="nav-item"><a href="#pana" data-toggle="tab" className="nav-link">Pana</a></li>
                            <li className="nav-item"><a href="#sp" data-toggle="tab" className="nav-link">SP</a></li>
                            <li className="nav-item"><a href="#dp" data-toggle="tab" className="nav-link">DP</a></li>
                            <li className="nav-item"><a href="#trio" data-toggle="tab" className="nav-link">Trio</a></li>
                            <li className="nav-item"><a href="#cycle" data-toggle="tab" className="nav-link">Cycle</a></li>
                            <li className="nav-item"><a href="#motorsp" data-toggle="tab" className="nav-link">Motor SP</a></li>
                            <li className="nav-item"><a href="#card56" data-toggle="tab" className="nav-link">56 Charts</a></li>
                            <li className="nav-item"><a href="#card64" data-toggle="tab" className="nav-link">64 Charts</a></li>
                            <li className="nav-item"><a href="#abr" data-toggle="tab" className="nav-link">ABR</a></li>
                            <li className="nav-item"><a href="#commonsp" data-toggle="tab" className="nav-link">Common SP</a></li>
                            <li className="nav-item"><a href="#commondp" data-toggle="tab" className="nav-link">Common DP</a></li>
                            <li className="nav-item"><a href="#colordp" data-toggle="tab" className="nav-link">Color DP</a></li>
                        </ul>
                    </div>
                    <div className="casino-box tab-content">
                        <div id="single" className="tab-pane active single">
                            <div className="worlibox suspended">
                                <div className="worli-left">
                                    <div className="worli-box-title"><b>9.5</b></div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">1</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">2</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">3</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">4</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">5</span></div>
                                    </div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">6</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">7</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">8</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">9</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">0</span></div>
                                    </div>
                                </div>
                                <div className="worli-right">
                                    <div className="worli-box-title"><b>9.5</b></div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">LINE 1</span> <span className="d-block">1|2|3|4|5</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">ODD</span> <span className="d-block">1|3|5|7|9</span></div>
                                    </div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">LINE 2</span> <span className="d-block">6|7|8|9|0</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">EVEN</span> <span className="d-block">2|4|6|8|0</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="pana" className="tab-pane fade pana">
                            <div className="worlibox suspended">
                                <div className="worli-full">
                                    <div className="worli-box-title"><b>SP:0 | DP:0
                                        | TP:0</b>
                                    </div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">1</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">2</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">3</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">4</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">5</span></div>
                                    </div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">6</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">7</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">8</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">9</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">0</span></div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div id="sp" className="tab-pane fade sp">
                            <div className="worlibox suspended">
                                <div className="worli-box-title"><b>0</b></div>
                                <div className="worli-left">
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">1</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">2</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">3</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">4</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">5</span></div>
                                    </div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">6</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">7</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">8</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">9</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">0</span></div>
                                    </div>
                                </div>
                                <div className="worli-right">
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">SP ALL</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="dp" className="tab-pane fade dp suspended">
                            <div className="worlibox">
                                <div className="worli-box-title"><b>0</b></div>
                                <div className="worli-left">
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">1</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">2</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">3</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">4</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">5</span></div>
                                    </div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">6</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">7</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">8</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">9</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">0</span></div>
                                    </div>
                                </div>
                                <div className="worli-right">
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">DP ALL</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="trio" className="tab-pane fade trio suspended">
                            <div className="worlibox">
                                <div className="worli-full">
                                    <div className="worli-box-title"><b>0</b></div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">ALL TRIO</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="cycle" className="tab-pane fade cycle suspended">
                            <div className="worlibox">
                                <div className="worli-box-title"><b>&nbsp;</b></div>
                                <div className="worli-full">
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">1</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">2</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">3</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">4</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">5</span></div>
                                    </div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">6</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">7</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">8</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">9</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">0</span></div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div id="motorsp" className="tab-pane fade motorsp">
                            <div className="worlibox suspended">
                                <div className="worli-full">
                                    <div className="worli-box-title"><b>0</b></div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">1</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">2</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">3</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">4</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">5</span></div>
                                    </div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">6</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">7</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">8</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">9</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">0</span></div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div id="card56" className="tab-pane fade card56">
                            <div className="worlibox suspended">
                                <div className="worli-box-title"><b>0</b></div>
                                <div className="worli-left">
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">1</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">2</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">3</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">4</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">5</span></div>
                                    </div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">6</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">7</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">8</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">9</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">0</span></div>
                                    </div>
                                </div>
                                <div className="worli-right">
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">56 ALL</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="card64" className="tab-pane fade card64">
                            <div className="worlibox suspended">
                                <div className="worli-box-title"><b>0</b></div>
                                <div className="worli-left">
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">1</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">2</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">3</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">4</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">5</span></div>
                                    </div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">6</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">7</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">8</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">9</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">0</span></div>
                                    </div>
                                </div>
                                <div className="worli-right">
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">64 ALL</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="abr" className="tab-pane fade abr">
                            <div className="worlibox suspended">
                                <div className="worli-box-title"><b>0</b></div>
                                <div className="worli-left">
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">A</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">B</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">R</span></div>
                                    </div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">AB</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">AR</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">BR</span></div>
                                    </div>
                                </div>
                                <div className="worli-right">
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">ABR</span></div>
                                    </div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">ABR CUT</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="commonsp" className="tab-pane fade commonsp">
                            <div className="worlibox suspended">
                                <div className="worli-full">
                                    <div className="worli-box-title"><b>0</b></div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">1</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">2</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">3</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">4</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">5</span></div>
                                    </div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">6</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">7</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">8</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">9</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">0</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="commondp" className="tab-pane fade commondp">
                            <div className="worlibox suspended">
                                <div className="worli-full">
                                    <div className="worli-box-title"><b>0</b></div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">1</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">2</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">3</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">4</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">5</span></div>
                                    </div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">6</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">7</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">8</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">9</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">0</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="colordp" className="tab-pane fade colordp">
                            <div className="worlibox suspended">
                                <div className="worli-box-title"><b>0</b></div>
                                <div className="worli-left">
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">1</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">2</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">3</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">4</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">5</span></div>
                                    </div>
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">6</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">7</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">8</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">9</span></div>
                                        <div className="worli-odd-box back"><span className="worli-odd">0</span></div>
                                    </div>
                                </div>
                                <div className="worli-right">
                                    <div className="worli-box-row">
                                        <div className="worli-odd-box back"><span className="worli-odd">COLOR DP ALL</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </>

    );
};

export default Worli;
