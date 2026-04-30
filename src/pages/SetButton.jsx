import React, { useEffect, useState } from 'react'
import PageNamePath from '../components/PageNamePath'
import { useSelector } from 'react-redux';
import { getButtonValuesApi, updateButtonValuesApi } from '../api/API_games';
import { formatNumber } from '../utilies/helpers';
import { errorToast, successToast } from '../utils/toast';


const ButtonTable = ({ title, buttonValues }) => {
    const [localValues, setLocalValues] = useState([]);

    useEffect(() => {
        if (buttonValues) {
            setLocalValues(buttonValues);
        }
    }, [buttonValues]);

    const handleValueChange = (index, newValue) => {
        const updatedValues = [...localValues];
        updatedValues[index] = newValue;
        setLocalValues(updatedValues);
    };

    // const handleUpdate = async (type) => {
    //     try {
    //         const values = type === "casino" ? casinoButtons : gameButtons;
    //         const res = await updateButtonValuesApi({ type, all_button_value: values.join(","), });

    //         res.status === "ok" ? successToast("Sucessfully Update") : errorToast(res.message);
    //     } catch (err) {
    //         console.error(err);
    //         errorToast("Some error occured!");
    //     }
    // };


    return (
        <div className="col-md-6">
            <div className="card">
                <div className="card-body">
                    <h4 className="card-title">{title}</h4>
                    <div className="table-responsive">
                        <table className="table button-value">
                            <thead>
                                <tr>
                                    <th>Button Label</th>
                                    <th>Button Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {localValues?.map((value, index) => (
                                    <tr key={index}>
                                        <td>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formatNumber(value) || ''}
                                                readOnly
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={value === 0 ? 0 : value || ''}
                                                onChange={(e) => handleValueChange(index, e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleUpdate(index)}
                                            >
                                                Update
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SetButton = () => {
    const { eventBetBtns, casinoBetBtns } = useSelector((state) => state.user.placeBetBtns);

    useEffect(() => {
        getButtonValuesApi();
    }, []);

    return (
        <>
            <PageNamePath
                // pageName="Set Deposit Withdraw Buttons"
                pageName="Set Deposit Withdraw Buttons <Dummy data>"  // Integrated Api is correct or not, don't know.
                pathArr={[
                    { path: "/admin/home", name: "Home" },
                    { path: "", name: "Set Buttons" }
                ]}
            />

            <div className="row">
                <ButtonTable title="Depsoit Buttons" buttonValues={eventBetBtns} />
                <ButtonTable title="Withdraw Buttons" buttonValues={casinoBetBtns} />
            </div>
        </>
    )
}

export default SetButton