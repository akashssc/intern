import React, { createContext, useContext, useState } from 'react';

interface NotificationContextType {
  notificationCount: number;
  messageCount: number;
  clearNotifications: () => void;
  clearMessages: () => void;
  setNotificationCount: React.Dispatch<React.SetStateAction<number>>;
  setMessageCount: React.Dispatch<React.SetStateAction<number>>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to 1 for demo: one unseen notification and one unread message
  const [notificationCount, setNotificationCount] = useState(1);
  const [messageCount, setMessageCount] = useState(1);

  const clearNotifications = () => setNotificationCount(0);
  const clearMessages = () => setMessageCount(0);

  return (
    <NotificationContext.Provider value={{ notificationCount, messageCount, clearNotifications, clearMessages, setNotificationCount, setMessageCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
}; 