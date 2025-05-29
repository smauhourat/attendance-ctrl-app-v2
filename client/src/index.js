import React from 'react';
import ReactDOM from 'react-dom';
import './styles/App.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// Registra el Service Worker para la funcionalidad PWA
serviceWorkerRegistration.register();