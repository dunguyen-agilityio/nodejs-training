import { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

/**
 * Custom hook to access toast functionality
 * @returns {Object} Toast context
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

/**
 * Toast Provider Component
 * Manages toast notifications throughout the app
 */
export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  /**
   * Show a success toast
   * @param {string} message - Success message
   */
  const showSuccess = useCallback((message) => {
    setToast({ message, type: 'success' });
  }, []);

  /**
   * Show an error toast
   * @param {string} message - Error message
   */
  const showError = useCallback((message) => {
    setToast({ message, type: 'error' });
  }, []);

  /**
   * Show an info toast
   * @param {string} message - Info message
   */
  const showInfo = useCallback((message) => {
    setToast({ message, type: 'info' });
  }, []);

  /**
   * Show a warning toast
   * @param {string} message - Warning message
   */
  const showWarning = useCallback((message) => {
    setToast({ message, type: 'warning' });
  }, []);

  /**
   * Close the current toast
   */
  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showSuccess,
        showError,
        showInfo,
        showWarning,
        closeToast,
      }}
    >
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
          duration={3000}
        />
      )}
    </ToastContext.Provider>
  );
};
