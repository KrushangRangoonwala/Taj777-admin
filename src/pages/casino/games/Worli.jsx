import React from 'react'
import CasinoVideo from './components/CasinoVideo'
import { useGetFileData } from '../../../hooks/useGetFileData'
import { getCardImage, getValueAfterDot } from '../../../utilies/helpers'
import CasinoRightSidebar from './components/CasinoRightSidebar'

const Worli = ({ gameData, lastResults, exposureData }) => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const currentGame = gameData?.t1?.[0];
    const communityCards = [
        currentGame?.C1 || "1",
        currentGame?.C2 || "1",
        currentGame?.C3 || "1",
    ];

    function VideoCards() {
        return (
            <>
                <div>
                    {communityCards.map((card, idx) => (
                        <span key={`community-${idx}`}>
                            <img src={getCardImage(card)} alt="card" />
                        </span>
                    ))}
                </div>
            </>
        )
    }

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="detail-page-container">
                <div className="center-main-container">
                    <div className="center-content">
                        <div className="casino-container">
                            <div className="casino-table worli">
                                <div className="container-fluid container-fluid-5">
                                    <div className="row row5">
                                        <div className="col-xl-12">
                                            <CasinoVideo
                                                gameName={game_name}
                                                roundId={getValueAfterDot(currentGame?.mid)}
                                                videoSrc={iframe_url}
                                                results={lastResults}
                                                timeLeft={currentGame?.lt || 0}
                                                totalTime={currentGame?.ft || 30}
                                                resultPath={phpFile}
                                                CardsComponent={VideoCards}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <CasinoRightSidebar />
                </div>
            </div>
        </div>
    )
}

export default Worli;