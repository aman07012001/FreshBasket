import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      ...options
    };

    setToasts(prev => [...prev, toast]);

    if (options.autoDismiss !== false) {
      const duration = options.duration || 5000;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message, options = {}) => {
    return addToast(message, 'success', options);
  };

  const error = (message, options = {}) => {
    return addToast(message, 'error', options);
  };

  const warning = (message, options = {}) => {
    return addToast(message, 'warning', options);
  };

  const info = (message, options = {}) => {
    return addToast(message, 'info', options);
  };

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-md mx-auto mt-4 space-y-2 px-4">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onRemove={() => onRemove(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

function Toast({ id, message, type, onRemove }) {
  const typeClasses = {
    success: 'bg-green-500 border-green-600 text-white',
    error: 'bg-red-500 border-red-600 text-white',
    warning: 'bg-yellow-500 border-yellow-600 text-white',
    info: 'bg-blue-500 border-blue-600 text-white'
  };

  return (
    <div
      className={`pointer-events-auto border-l-4 shadow-lg rounded-lg p-4 transform transition-all duration-300 translate-x-0 opacity-100 ${
        typeClasses[type]
      }`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-1">
          <p className="text-sm font-medium">
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onRemove}
            className="inline-flex text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 11-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414L10 4.293l4.293 4.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export const toast = {
  success: (message, options) => {

    console.warn('toast.success() called outside ToastProvider context');
    return null;
  },
  error: (message, options) => {
    console.warn('toast.error() called outside ToastProvider context');
    return null;
  },
  warning: (message, options) => {
    console.warn('toast.warning() called outside ToastProvider context');
    return null;
  },
  info: (message, options) => {
    console.warn('toast.info() called outside ToastProvider context');
    return null;
  }
};

export default ToastProvider;