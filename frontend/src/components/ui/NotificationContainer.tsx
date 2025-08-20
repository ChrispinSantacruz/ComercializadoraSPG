import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationToast, { Notification } from './NotificationToast';

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showSuccess: (title: string, message: string, action?: Notification['action']) => void;
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000, // 5 segundos por defecto
    };

    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const showSuccess = useCallback((title: string, message: string, action?: Notification['action']) => {
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

  const contextValue: NotificationContextType = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Contenedor de notificaciones */}
      <div className="fixed top-6 right-6 z-50 space-y-3 max-w-sm">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className="transform transition-all duration-300 ease-out"
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            <NotificationToast
              notification={notification}
              onClose={removeNotification}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider; 