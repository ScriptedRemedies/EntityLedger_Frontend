import { createContext, useContext, useState, useCallback } from 'react';
import '../styles/Toast.scss';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto-dismiss the alert after 3 seconds
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}

            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast-message toast-${toast.type} animation-slide-in-toast`}>
                        {/* Wrapper to keep the text and button aligned */}
                        <div className="toast-content">
                            <span className="inter-text-small text-white">{toast.message}</span>
                            <button onClick={() => removeToast(toast.id)} className="toast-close">✕</button>
                        </div>
                        {/* The animated countdown bar */}
                        <div className="toast-progress"></div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
