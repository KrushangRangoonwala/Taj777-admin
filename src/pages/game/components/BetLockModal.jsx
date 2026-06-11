import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { getUserBlock, updateUserBlock } from '../../../api/API';
import { errorToast, successToast } from '../../../utils/toast';

const BetLockModal = ({ show, onHide, event_id, bet_market_type, market_odd_name }) => {

    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tCode, setTCode] = useState("");

    const fetchAccounts = async () => {
        try {
            setLoading(true);

            const payload = {
                event_id: event_id,
                market_type: bet_market_type,
            };

            const res = await getUserBlock(payload); // FIXED

            /* console.log("API response:", res); // debug */

            const result =
                res?.data?.results ||
                res?.results ||
                [];

            const formatted = result.map((item, index) => ({
                id: index,
                uid: item.userid,
                name: item.username,
                checked: item.status === 1
            }));

            setAccounts(formatted);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) {
            fetchAccounts();
        }
    }, [show]);

    // 🔹 Handle checkbox change (optional for future use)
    const handleCheckboxChange = async (index) => {

        // Do not allow if no transaction code
        if (!tCode) {
            errorToast("Please enter transaction code");
            return;
        }

        const selectedUser = accounts[index];
        const newStatus = selectedUser.checked ? 0 : 1; // toggle

        try {
            setLoading(true);

            const payload = {
                usersid: selectedUser.uid, // user ID
                users: selectedUser.name, // username
                event_id: event_id,
                status: newStatus,
                tpassword: tCode,
                market_type: bet_market_type,
            };

            const res = await updateUserBlock(payload);

            console.log("Update API response:--------", res); // debug

            if (res?.status === 1 || res?.data?.status === 1) {
                // update UI only if success
                const updated = [...accounts];
                updated[index].checked = !updated[index].checked;
                setAccounts(updated);
                successToast(res?.message || res?.data?.message || "Status updated");
            } else {
                errorToast(res?.message || res?.data?.message || "Something went wrong");
                onHide(); // close modal on failure
            }

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} dialogClassName="modal-md">

            <Modal.Header>
                <Modal.Title as="h5">Bet Lock</Modal.Title>
                <button type="button" className="close" onClick={onHide}>×</button>
            </Modal.Header>

            <Modal.Body>

                <div className="row">
                    <div className="col-8"></div>
                    <div className="col-4">
                        <div className="form-group">
                            <input
                                type="password"
                                placeholder="Transaction Code"
                                className="form-control"
                                value={tCode}
                                onChange={(e) => setTCode(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>
                                    <div className="custom-control custom-checkbox">
                                        <input type="checkbox" className="custom-control-input" id="selectAll" />
                                        <label className="custom-control-label" htmlFor="selectAll"></label>
                                    </div>
                                </th>
                                <th>All Account</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="2" className="text-center">Loading...</td>
                                </tr>
                            ) : (
                                accounts.map((account, index) => {
                                    const checkboxId = `chk_${index}`;
                                    return (
                                        <tr key={index}>
                                            <td>
                                                <div className="custom-control custom-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        className="custom-control-input"
                                                        id={checkboxId}
                                                        checked={account.checked}
                                                        onChange={() => handleCheckboxChange(index)}
                                                    />
                                                    <label className="custom-control-label" htmlFor={checkboxId}></label>
                                                </div>
                                            </td>
                                            <td>{account.name}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

            </Modal.Body>
        </Modal>
    );
};

export default BetLockModal;