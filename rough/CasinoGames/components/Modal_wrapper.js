import React from 'react';
import styles from "../results/Result_Superover3.module.css";
import ReactModal from 'react-modal';
import useIsMobile from '../../../hooks/useIsMobile';

const Modal_wrapper = ({
    isModalOpen,
    setIsModalOpen,
    title,
    onClose,
    children,
    title2,
    isBetList = false,
    isResult = false,
}) => {
    const isMobile = useIsMobile();

    return (
        <ReactModal
            isOpen={isModalOpen}
            onRequestClose={onClose}
            // contentLabel={gameName}
            style={{
                content: {
                    top: isMobile ? "50px" : "35px",
                    // bottom: "24%",
                    left: "49.5%",
                    transform: "translateX(-50%)", // ✅ only horizontal centering
                    width: isMobile ? "100vw" : "95vw",
                    margin: "0 auto",
                    maxWidth: "1140px",
                    // maxHeight: "230px",
                    height: "min-content",
                    padding: 0,
                    background: "transparent",
                    border: "none",
                    borderRadius: "4px",
                    overflow: "hidden",
                },
                overlay: {
                    backgroundColor: "rgba(0,0,0,0.5)",
                    zIndex: 12000,
                },
            }}
        >
            <div tabIndex={-1} className={`${styles['modal-content']} ${isBetList ? 'mybetsmodal' : ''}`}>
                <header className={styles['modal-header']}>
                    <h5 className={styles['modal-title']} >
                        {title}
                        {title2}
                    </h5>

                    <button
                        type="button"
                        aria-label="Close"
                        className={styles['close']}
                        onClick={onClose}
                        style={{ padding: '17px', fontSize: '21px' }}
                    >
                        ×
                    </button>
                </header>

                <div className={styles['modal-body']} style={{ padding: (isBetList || isResult) ? "" : "0" }}>
                    {children}
                </div>

            </div>
        </ReactModal>
    );
};

export default Modal_wrapper;
