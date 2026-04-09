import Swal from 'sweetalert2';

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    // timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
    customClass: {
        container: 'swal2-container swal2-top-end swal2-backdrop-show',
        popup: 'swal2-popup swal2-toast swal2-show',
        title: 'swal2-title swal2-theme-title',
        htmlContainer: 'swal2-html-container'
    }
});

export const successToast = (message) => {
    Toast.fire({
        icon: 'success',
        html: message,
    });
};

export const errorToast = (message) => {
    Toast.fire({
        icon: 'error',
        html: message,
    });
};


export default Toast;
