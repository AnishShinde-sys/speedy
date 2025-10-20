// New React-based overlay entry point
import React from 'react';
import ReactDOM from 'react-dom/client';
import { OverlayApp } from './OverlayApp';
import '../index.css';

// Create overlay container
const overlayContainer = document.createElement('div');
overlayContainer.id = 'speedy-react-overlay';
document.body.appendChild(overlayContainer);

// Render React app
const root = ReactDOM.createRoot(overlayContainer);
root.render(
  <React.StrictMode>
    <OverlayApp />
  </React.StrictMode>
);

console.log('✅ Speedy React Overlay loaded');

