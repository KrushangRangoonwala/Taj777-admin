import React from 'react'
import { getImage } from '../../../utilies/helpers'
import { useGetFileData } from '../../../hooks/useGetFileData'

const Result_cards = ({ cardList }) => {
    const { result_image } = useGetFileData();
    return (
        <div className="col-12 col-lg-6 d-flex-center-xy">
            <div className="casino-result-content">
                <div className="casino-result-content-item text-center w-100">
                    <div className="casino-result-cards">
                        {cardList?.map((card, index) => (
                            <div key={index} className="casino-result-cards-item">
                                <img src={getImage(card, result_image)} alt={card} style={{ marginLeft: '0px', marginRight: '0px' }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Result_cards