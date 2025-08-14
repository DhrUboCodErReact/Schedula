// ToastNotification.tsx
import { useEffect } from 'react';

interface ToastNotification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface ToastProps {
  toast: ToastNotification;
  onRemove: (id: number) => void;
}

const Toast = ({ toast, onRemove }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const getToastStyles = (type: string) => {
    const styles = {
      success: {
        bg: 'bg-green-50 border-l-4 border-green-400',
        icon: '✅',
        iconColor: 'text-green-500',
        titleColor: 'text-green-800',
        messageColor: 'text-green-600',
        buttonColor: 'text-green-400 hover:bg-green-100 focus:ring-green-600'
      },
      error: {
        bg: 'bg-red-50 border-l-4 border-red-400',
        icon: '❌',
        iconColor: 'text-red-500',
        titleColor: 'text-red-800',
        messageColor: 'text-red-600',
        buttonColor: 'text-red-400 hover:bg-red-100 focus:ring-red-600'
      },
      warning: {
        bg: 'bg-yellow-50 border-l-4 border-yellow-400',
        icon: '⚠️',
        iconColor: 'text-yellow-500',
        titleColor: 'text-yellow-800',
        messageColor: 'text-yellow-600',
        buttonColor: 'text-yellow-400 hover:bg-yellow-100 focus:ring-yellow-600'
      },
      info: {
        bg: 'bg-blue-50 border-l-4 border-blue-400',
        icon: 'ℹ️',
        iconColor: 'text-blue-500',
        titleColor: 'text-blue-800',
        messageColor: 'text-blue-600',
        buttonColor: 'text-blue-400 hover:bg-blue-100 focus:ring-blue-600'
      }
    };
    return styles[type as keyof typeof styles] || styles.info;
  };

  const style = getToastStyles(toast.type);

  return (
    <div className={`w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden transform transition-all duration-300 ease-in-out animate-slideInRight ${style.bg}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className={`${style.iconColor} text-xl`}>{style.icon}</span>
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-semibold ${style.titleColor}`}>
              {toast.title}
            </p>
            <p className={`mt-1 text-sm ${style.messageColor}`}>
              {toast.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${style.buttonColor}`}
              onClick={() => onRemove(toast.id)}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ToastContainer = ({ 
  toasts, 
  removeToast 
}: { 
  toasts: ToastNotification[]; 
  removeToast: (id: number) => void; 
}) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] space-y-2 w-full max-w-md px-4">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export type { ToastNotification };