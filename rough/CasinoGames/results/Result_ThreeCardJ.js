import React from 'react'
import { getImage } from '../../../utilies/helpers';
import { useGetFileData } from '../../../hooks/useGetFileData';
import Result_details from './Result_details';

const Result_ThreeCardJ = ({ modalContent }) => {
    const { result_image } = useGetFileData();
    if (!modalContent) return null;

    const resultData_ = JSON.parse(modalContent.data);
    console.log("resultData_", resultData_);
    const resultData = resultData_?.t1 || resultData_?.[0];
    const cards = resultData?.cards.split(",");

    const win = cards?.map(val => val?.slice(0, -2)).join(" ");
    const resultDetails = [{ label: "Winner", value: win || "" }];
    return (
        <div className="row row5">
            <div className="col-12">
                <div className="casino-result-content">
                    <div className="casino-result-content-item text-center w-100">
                        <div className="casino-result-cards">
                            <div className="d-inline-block">
                                {/* <h4>Result Cards</h4> */}
                                <div className="d-flex justify-content-center">
                                    {cards?.map((c, i) => (
                                        <div
                                            key={i}
                                            className="casino-result-cards-item"
                                        // style={{ margin: "0 5px" }}
                                        >
                                            <img
                                                src={getImage(c, result_image)}
                                                alt={`Result Card ${i + 1}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Result_details resultData={resultDetails} />
        </div>

    )
}

export default Result_ThreeCardJ;
