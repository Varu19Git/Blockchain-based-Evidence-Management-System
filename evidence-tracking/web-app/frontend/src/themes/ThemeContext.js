import React, { createContext, useState, useEffect } from 'react';

// Define available themes
export const themes = {
  default: 'default',
  dark: 'dark',
  blue: 'blue',
  highContrast: 'high-contrast',
  custom: 'custom'
};

// Create Theme Context
export const ThemeContext = createContext({
  theme: themes.default,
  setTheme: () => {},
});

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  // Try to get saved theme from localStorage
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('evidence-tracking-theme');
    return savedTheme || themes.default;
  });

  // Effect to apply theme class to body and save to localStorage
  useEffect(() => {
    // Remove all theme classes
    document.body.classList.remove(
      themes.default, 
      themes.dark, 
      themes.blue, 
      themes.highContrast, 
      themes.custom
    );
    
    // Add current theme class
    document.body.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('evidence-tracking-theme', theme);
  }, [theme]);

  // Provider value
  const contextValue = {
    theme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 