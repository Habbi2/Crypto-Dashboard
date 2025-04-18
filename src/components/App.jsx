import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import ThemeToggle from './ThemeToggle';
import Notification from './Notification';

const App = () => {
    const [darkMode, setDarkMode] = useState(
        // Check for saved preference or use system preference
        localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
    
    const [notifications, setNotifications] = useState([]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    // Method to add a new notification
    const addNotification = (notification) => {
        setNotifications(prev => [
            ...prev,
            { 
                id: Date.now(), 
                ...notification 
            }
        ]);
    };
    
    // Method to dismiss a notification
    const dismissNotification = (id) => {
        setNotifications(prev => prev.filter(note => note.id !== id));
    };
    
    // Apply theme changes to HTML
    useEffect(() => {
        // Update data-theme attribute
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        
        // Save preference to localStorage
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    return (
        <div className="App">
            <div className="header-container">
                <h1>Cryptocurrency Dashboard</h1>
                <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </div>
            
            <Dashboard 
                onPriceAlert={(currency, message, type) => {
                    addNotification({
                        title: `${currency} Alert`,
                        message,
                        type
                    });
                }}
            />
            
            <Notification 
                notifications={notifications} 
                onDismiss={dismissNotification} 
            />
        </div>
    );
};

export default App;