import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { changeUserPassword } from '../api/API';
import { errorToast, successToast } from '../utils/toast';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/userSlice';

const ChangePasswordModal = ({ show, onHide }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userData } = useSelector((state) => state.user);
    const [formData, setFormData] = useState({
        password: '', // Transaction Code (as per name attribute in snippet)
        NewPassword: '',
        ConfirmNewPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.password) newErrors.password = "The Transaction Code field is required";
        if (!formData.NewPassword) newErrors.NewPassword = "The New Password field is required";
        if (!formData.ConfirmNewPassword) newErrors.ConfirmNewPassword = "The Confirm Password field is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (formData.NewPassword !== formData.ConfirmNewPassword) {
            setErrors({
                ConfirmNewPassword: "Passwords and Confirm Password do not match"
            });
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
                /* onHide();
                setFormData({ password: '', NewPassword: '', ConfirmNewPassword: '' }); */
                dispatch(logout());
                sessionStorage.removeItem('userdata');
                navigate('/admin');
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
                <form data-vv-scope="ChangePassword" method="post" onSubmit={handleSubmit}>
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
                                className={`form-control dark-placeholder ${errors[field.name] ? 'is-invalid' : ''}`}
                                aria-required={field["aria-required"]}
                                aria-invalid={errors[field.name] ? "true" : "false"}
                            />
                            {errors[field.name] && (
                                <div className="invalid-feedback text-left">
                                    {errors[field.name]}
                                </div>
                            )}
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
