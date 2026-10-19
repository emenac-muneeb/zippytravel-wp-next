import { toast } from "react-toastify";

export const showToast = (message, status, options) => {
  const toastOptions = {
    type: status,
    position: "top-right",
    autoClose: true,
    hideProgressBar: false,
    closeOnClick: false,
    draggable: true,
    pauseOnHover: true,
    newestOnTop: true,
    rtl: false,
    pauseOnFocusLoss: true,
    theme: "light",
    ...options,
  };

  return toast(message, toastOptions);
};