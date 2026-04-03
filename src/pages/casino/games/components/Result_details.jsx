import React from 'react';

const Result_details = ({ data = [], col = 5 }) => {
    return (
        <div className={`col-12 col-lg-${col}`}>
            <div className="casino-result-desc">
                {data?.map((item, index) => (
                    <div className="casino-result-desc-item" key={index}>
                        <div>{item.label}</div>
                        <div>{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Result_details;
