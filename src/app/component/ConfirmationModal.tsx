interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning"
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      icon: "⚠️",
      confirmBg: "bg-yellow-500 hover:bg-yellow-600",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600"
    },
    danger: {
      icon: "🚨",
      confirmBg: "bg-red-500 hover:bg-red-600",
      iconBg: "bg-red-100",
      iconColor: "text-red-600"
    },
    info: {
      icon: "ℹ️",
      confirmBg: "bg-blue-500 hover:bg-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    }
  };

  const style = typeStyles[type];

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-slideUp">
        <div className="flex items-center mb-4">
          <div className={`w-12 h-12 rounded-full ${style.iconBg} flex items-center justify-center mr-4`}>
            <span className="text-2xl">{style.icon}</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-medium transition-all duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 ${style.confirmBg} text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};