import React, { useState, useEffect } from 'react';

const Notification = ({ notifications, onDismiss }) => {
  const [notificationQueue, setNotificationQueue] = useState([]);

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      // Add new notifications to the queue
      setNotificationQueue(prev => [...prev, ...notifications]);
    }
  }, [notifications]);

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (notificationQueue.length > 0) {
      const timer = setTimeout(() => {
        dismissNotification(notificationQueue[0].id);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notificationQueue]);

  const dismissNotification = (id) => {
    setNotificationQueue(prev => prev.filter(note => note.id !== id));
    if (onDismiss) onDismiss(id);
  };

  if (notificationQueue.length === 0) return null;

  return (
    <div className="notification-container">
      {notificationQueue.map(note => (
        <div 
          key={note.id} 
          className={`notification ${note.type || 'info'}`}
        >
          <div className="notification-content">
            <div className="notification-title">{note.title}</div>
            <div className="notification-message">{note.message}</div>
          </div>
          <button 
            className="notification-dismiss" 
            onClick={() => dismissNotification(note.id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notification;