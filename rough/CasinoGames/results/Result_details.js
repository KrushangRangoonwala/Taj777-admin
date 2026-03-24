import React from 'react'

const Result_details = ({ resultData }) => {
    console.log("resultData", resultData);
    return (
        <div className="col-12 col-lg-6">
            <div className="casino-result-desc">
                {resultData?.map((item, index) => (
                    <div className="casino-result-desc-item" key={index}>
                        <div>{item.label}</div>
                        <div>{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Result_details