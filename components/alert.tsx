import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  CircleAlert,
  InfoIcon,
  X,
} from "lucide-react";

const Alert = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: string;
  onClose?: () => void;
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsFadingOut(true);
        // Allow time for fade-out animation before unmounting
        const fadeOutTimer = setTimeout(() => {
          setIsVisible(false);
          onClose?.(); // Call optional onClose handler
        }, 500); // Assuming 500ms for fade-out animation
        return () => clearTimeout(fadeOutTimer);
      }, 5000); // 5 seconds auto-close
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const handleClose = () => {
    setIsFadingOut(true);
    const fadeOutTimer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 500); // Assuming 500ms for fade-out animation
    return () => clearTimeout(fadeOutTimer);
  };

  const getIcon = (alertType: string) => {
    switch (alertType) {
      case "success":
        return <CheckCircle size={20} />;
      case "error":
        return <CircleAlert size={20} />;
      case "warning":
        return <AlertTriangle size={20} />;
      case "info":
        return <InfoIcon size={20} />;
      default:
        return null;
    }
  };

  const getStyles = (alertType: string) => {
    switch (alertType) {
      case "success":
        return "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/70 dark:text-green-300 dark:border-green-800";
      case "error":
        return "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/70 dark:text-red-300 dark:border-red-800";
      case "warning":
        return "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/70 dark:text-yellow-300 dark:border-yellow-800";
      case "info":
        return "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/70 dark:text-blue-300 dark:border-blue-800";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all duration-500 ${
        isFadingOut
          ? "opacity-0 translate-y-[10px]"
          : "opacity-100 translate-y-0"
      } ${getStyles(type)}`}
      role="alert"
    >
      <span className="shrink-0">{getIcon(type)}</span>
      <span className="text-sm font-medium">{message}</span>
      <button
        className="shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        onClick={handleClose}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Alert;
