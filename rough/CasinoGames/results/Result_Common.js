import React from 'react';
import styles from "./Result_Superover3.module.css";
import Modal_wrapper from '../components/Modal_wrapper';

const Result_Common = ({
    isModalOpen,
    setIsModalOpen,
    title,
    onClose,
    roundInfo,
    children,
    showNoDataMessage = false
}) => {

    return (
        <Modal_wrapper
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            title={title}
            onClose={onClose}
            isResult={true}
        >
            {showNoDataMessage
                ? <div style={{ textAlign: "center", margin: '20px' }}>No Result data Found</div>
                : <div className={styles['modal-body']}>
                    <div>
                        <div className={styles['casino-result-round']}>
                            <div>Round ID: {roundInfo?.rid}</div>

                            <div>
                                Match Time:
                                <span>
                                    {roundInfo?.mtime}
                                </span>
                            </div>
                        </div>

                        {children}
                    </div>
                </div>
            }
        </Modal_wrapper>
    )
};

export default Result_Common;
