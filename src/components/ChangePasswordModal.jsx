import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { changeUserPassword } from '../api/API';
import { errorToast, successToast } from '../utils/toast';

const ChangePasswordModal = ({ show, onHide }) => {
    console.log('show', show);
    // const { userData } = useSelector((state) => state.user);
    const [formData, setFormData] = useState({
        password: '', // Transaction Code (as per name attribute in snippet)
        NewPassword: '',
        ConfirmNewPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.password || !formData.NewPassword || !formData.ConfirmNewPassword) {
            errorToast("Please fill in all fields");
            return;
        }

        if (formData.NewPassword !== formData.ConfirmNewPassword) {
            errorToast("New Password and Confirm New Password do not match");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                changepwd_user_id: userData?.user_id,
                changepwd_password: formData.NewPassword,
                changepwd_cpassword: formData.ConfirmNewPassword,
                changepwd_master_password: formData.password,
            };

            const response = await changeUserPassword(payload);

            if (response.status === "ok") {
                successToast(response.message || "Password changed successfully");
                onHide();
                setFormData({ password: '', NewPassword: '', ConfirmNewPassword: '' });
            } else {
                errorToast(response.message || "Failed to change password");
            }
        } catch (error) {
            console.error('Change password error:', error);
            errorToast("An error occurred while changing password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            id="__BVID__22"
            role="dialog"
            aria-describedby="__BVID__22___BV_modal_body_"
            className="modal fade show"
            aria-modal="true"
            dialogClassName="modal-md"
            contentClassName="modal-content"
        >
            <Modal.Header id="__BVID__22___BV_modal_header_" className="bg-default">
                <Modal.Title as="h5" className="text-uppercase">Change Password</Modal.Title>
                <button type="button" data-dismiss="modal" className="close" onClick={onHide}>
                    ×
                </button>
            </Modal.Header>
            <Modal.Body id="__BVID__22___BV_modal_body_">
                <form data-vv-scope="ChangePassword" method="post" onSubmit={(e) => e.preventDefault()}>{/* onSubmit={handleSubmit} */}
                    {[
                        { placeholder: "Transaction Code", "data-vv-as": "Transaction Code", type: "password", name: "password", "aria-required": "true", "aria-invalid": "true" },
                        { placeholder: "New Password", "data-vv-as": "New Password", type: "password", name: "NewPassword", "aria-required": "false", "aria-invalid": "false" },
                        { placeholder: "Confirm New Password", "data-vv-as": "Confirm Password", type: "password", name: "ConfirmNewPassword", "aria-required": "true", "aria-invalid": "true" }
                    ].map((field, index) => (
                        <div key={index} className="form-group">
                            <input
                                placeholder={field.placeholder}
                                data-vv-as={field["data-vv-as"]}
                                type={field.type}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                className="form-control"
                                aria-required={field["aria-required"]}
                                aria-invalid={field["aria-invalid"]}
                            />
                        </div>
                    ))}
                    <div className="form-group">
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? "Changing..." : "Change Password"}
                            {!loading && <i className="fas fa-chevron-circle-right ml-2"></i>}
                        </button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
};

export default ChangePasswordModal;
