import React, { createContext, useContext, useState } from 'react';

const UnreadMessagesContext = createContext();

export const useUnreadMessages = () => {
  const context = useContext(UnreadMessagesContext);
  if (!context) {
    throw new Error('useUnreadMessages must be used within an UnreadMessagesProvider');
  }
  return context;
};

export const UnreadMessagesProvider = ({ children }) => {
  const [unreadMessages, setUnreadMessages] = useState({});

  const updateUnreadMessages = (friendId, count) => {
    setUnreadMessages(prev => ({
      ...prev,
      [friendId]: count
    }));
  };

  const getTotalUnreadMessages = () => {
    return Object.values(unreadMessages).reduce((sum, count) => sum + count, 0);
  };

  const markAllAsRead = (friendId) => {
    setUnreadMessages(prev => ({
      ...prev,
      [friendId]: 0
    }));
  };

  return (
    <UnreadMessagesContext.Provider value={{
      unreadMessages,
      updateUnreadMessages,
      getTotalUnreadMessages,
      markAllAsRead
    }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
};
