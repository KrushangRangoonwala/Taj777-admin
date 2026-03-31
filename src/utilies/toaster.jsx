import { toast } from "react-toastify";
import styles from "./toaster.module.css";

const ToastUI = ({ isSuccess, message }) => {
  return (
    <>
      <div className={styles["casino-toast"] + " " + (isSuccess ? styles.success : styles.error)} data-kk>
        <div className={styles["toast-icon"]}>
          <i className={`fas ${isSuccess ? "fa-check-circle" : "fa-times-circle"}`} />
          {/* <i className={`fas ${isSuccess ? "fa-check-circle" : "fa-times-circle"}`} /> */}
        </div>
        <div className={styles["toast-text"]}>{message}</div>
      </div>
    </>
  );
};

export default function showToast({ isSuccess, message }) {
  toast(<ToastUI isSuccess={isSuccess} message={message} />, {
    position: "top-center",
    autoClose: 3000,
    closeButton: false,
    hideProgressBar: true,
    draggable: false,
    pauseOnHover: false,
    className: "casino-toast-wrapper",
  });
};
