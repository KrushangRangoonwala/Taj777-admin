import React from 'react';
import { getCardImage } from '../../../../utilies/helpers';
import { useGetFileData } from '../../../../hooks/useGetFileData';

const Result_teenunique = ({
    cardList1 = [],
    col = 7,
}) => {
    const { result_image } = useGetFileData();
    const seatIcons = [
        "https://wver.sprintstaticdata.com/v211/static/admin/img/s1-icon.png",
        "https://wver.sprintstaticdata.com/v211/static/admin/img/s2-icon.png",
        "https://wver.sprintstaticdata.com/v211/static/admin/img/s3-icon.png",
        "https://wver.sprintstaticdata.com/v211/static/admin/img/s4-icon.png",
        "https://wver.sprintstaticdata.com/v211/static/admin/img/s5-icon.png",
        "https://wver.sprintstaticdata.com/v211/static/admin/img/s6-icon.png"
    ];

    return (
        <div className={`col-12 col-lg-${col}`}>
            <div className="casino-result-content">
                <div className="casino-result-content-item text-center w-100">
                    <div className="casino-result-cards unique-teen20-box">
                        {cardList1?.slice(0, 6).map((src, index) => (
                            <div className="unique-teen20-card casino-result-cards-item" key={index}>
                                <img src={seatIcons[index]} alt={`seat-${index + 1}`} />
                                <img src={getCardImage(src, result_image)} alt="card" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result_teenunique;
