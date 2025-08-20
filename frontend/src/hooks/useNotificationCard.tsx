import { useState, useCallback } from 'react';
import NotificationCard from '../components/ui/NotificationCard';

export interface NotificationCardData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  showProgress?: boolean;
  duration?: number;
}

export const useNotificationCard = () => {
  const [notifications, setNotifications] = useState<NotificationCardData[]>([]);

  const showNotification = useCallback((notification: Omit<NotificationCardData, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationCardData = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, message: string, action?: NotificationCardData['action']) => {
    showNotification({
      type: 'success',
      title,
      message,
      action,
      duration: 4000,
    });
  }, [showNotification]);

  const showError = useCallback((title: string, message: string) => {
    showNotification({
      type: 'error',
      title,
      message,
      duration: 6000,
    });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string) => {
    showNotification({
      type: 'warning',
      title,
      message,
      duration: 5000,
    });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string) => {
    showNotification({
      type: 'info',
      title,
      message,
      duration: 4000,
    });
  }, [showNotification]);

  const NotificationCardContainer: React.FC = () => (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          action={notification.action}
          onClose={() => removeNotification(notification.id)}
          showProgress={notification.showProgress}
          duration={notification.duration}
        />
      ))}
    </div>
  );

  return {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    NotificationCardContainer
  };
}; 