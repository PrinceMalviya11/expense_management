import { useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import './Notification.css';

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle />;
      case 'error':
        return <FiAlertCircle />;
      case 'warning':
        return <FiAlertTriangle />;
      default:
        return <FiInfo />;
    }
  };

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          <div className="notification-icon">{getIcon(notification.type)}</div>
          <div className="notification-message">{notification.message}</div>
          <button
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
          >
            <FiX />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;

