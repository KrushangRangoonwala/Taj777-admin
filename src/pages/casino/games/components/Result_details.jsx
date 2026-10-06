import React from 'react';

const Result_details = ({ data = [], defaultCol = 12, col = 5 }) => {
    return (
        <div className={`col-${defaultCol} col-lg-${col}`}>
            <div className="casino-result-desc">
                {data?.map((item, index) => {
                    const arr = item?.value?.split("~") || [];

                    return (
                        <>
                            <div className="casino-result-desc-item" key={index}>
                                <div>{item.label}</div>
                                <div>{arr[0] || ""}</div>
                            </div>

                            {arr[1] && <div className="casino-result-desc-item" key={index}>
                                <div></div>
                                <div>{arr[1] || ""}</div>
                            </div>}
                        </>
                    )
                })}
            </div>
        </div>
    );
};

export default Result_details;
