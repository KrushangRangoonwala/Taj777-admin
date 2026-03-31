import React from 'react';

const Result_details = ({ data = [] }) => {
    return (
        <div className="col-12 col-lg-5">
            <div className="casino-result-desc">
                {data?.map((item, index) => (
                    <div className="casino-result-desc-item" key={index}>
                        <div>{item.name}</div>
                        <div>{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Result_details;
