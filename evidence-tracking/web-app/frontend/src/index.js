import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './themes/themes.css';
import App from './App';
import { ThemeProvider } from './themes/ThemeContext';

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
); 