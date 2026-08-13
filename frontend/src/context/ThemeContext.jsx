import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Apply theme to DOM immediately whenever darkMode changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  // Load theme from database on mount (only if user is logged in)
  useEffect(() => {
    const loadThemeFromSettings = async () => {
      if (!localStorage.getItem('token')) {
        setIsInitialized(true);
        return;
      }

      try {
        const data = await settingsService.getSettings();
        // Only use database value if it exists and user is logged in
        if (data.settings?.dark_mode !== undefined) {
          setDarkMode(data.settings.dark_mode);
        }
      } catch (error) {
        // If settings fail (user not logged in or API error), use localStorage value
        console.warn('Could not load theme from settings, using localStorage');
      } finally {
        setIsInitialized(true);
      }
    };

    loadThemeFromSettings();
  }, []);

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    // Update in database (fire and forget, don't block UI)
    settingsService.updateSettings({ dark_mode: newMode }).catch(error => {
      console.error('Failed to save theme preference:', error);
      // Don't revert - localStorage is the source of truth for UI
    });
  };

  const setDarkModeDirect = (mode) => {
    setDarkMode(mode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, setDarkMode: setDarkModeDirect, isInitialized }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
