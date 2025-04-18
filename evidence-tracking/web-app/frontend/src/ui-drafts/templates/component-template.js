import React, { useState, useEffect } from 'react';
import { useTheme } from '../../themes/ThemeContext';
import './component-template.css';

/**
 * Component Template
 * 
 * This is a template for creating new UI components.
 * Replace this documentation with a description of your component.
 * 
 * @param {Object} props Component properties
 * @param {string} props.title Component title
 * @param {Array} props.data Data to display
 * @param {Function} props.onAction Callback function for actions
 */
const ComponentTemplate = ({ title = 'Component Title', data = [], onAction = () => {} }) => {
  // Use the theme context
  const { theme } = useTheme();
  
  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  
  // Example effect hook
  useEffect(() => {
    // Initialize component, load data, etc.
    console.log('Component mounted with theme:', theme);
    
    // Cleanup function (optional)
    return () => {
      console.log('Component unmounted');
    };
  }, [theme]);
  
  // Example event handler
  const handleItemClick = (item) => {
    setActiveItem(item);
    onAction(item);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="component-loading">
        <div className="component-loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="component-template">
      <div className="component-header">
        <h2 className="component-title">{title}</h2>
        <div className="component-actions">
          <button 
            className="component-button" 
            onClick={() => onAction('refresh')}
            aria-label="Refresh data"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="component-content">
        {data.length === 0 ? (
          <div className="component-empty-state">
            <p>No items to display</p>
          </div>
        ) : (
          <ul className="component-list">
            {data.map((item, index) => (
              <li 
                key={item.id || index}
                className={`component-list-item ${activeItem === item ? 'active' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                <div className="component-item-title">{item.title || 'Untitled'}</div>
                <div className="component-item-description">{item.description || 'No description'}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="component-footer">
        <p className="component-status">
          Showing {data.length} items
        </p>
      </div>
    </div>
  );
};

export default ComponentTemplate; 