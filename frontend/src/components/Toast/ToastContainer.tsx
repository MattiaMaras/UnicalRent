import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast } from "../../contexts/ToastContext.tsx";

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default: return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (toasts.length === 0) return null;

  return (
      <div className="fixed top-4 right-4 z-50 space-y-3 w-[320px]">
        {toasts.map((toast) => (
            <div
                key={toast.id}
                className={`w-full border rounded-lg p-4 shadow-md transform transition-all duration-300 ease-in-out ${getToastStyles(toast.type)}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  {getToastIcon(toast.type)}
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <p className="text-sm font-medium break-words">{toast.message}</p>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <button
                      onClick={() => removeToast(toast.id)}
                      className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
        ))}
      </div>
  );
};

export default ToastContainer;