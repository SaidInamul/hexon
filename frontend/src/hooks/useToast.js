// src/hooks/useToast.js
import { toast } from "react-toastify";

const useToast = () => {
  const showSuccess = (message, options = {}) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  };

  const showError = (message, options = {}) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  };

  const showInfo = (message, options = {}) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 3000,
      ...options,
    });
  };

  const showWarning = (message, options = {}) => {
    toast.warn(message, {
      position: "top-right",
      autoClose: 3000,
      ...options,
    });
  };

  return { showSuccess, showError, showInfo, showWarning };
};

export default useToast;
