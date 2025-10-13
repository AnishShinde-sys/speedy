import React from 'react';
import { createRoot } from 'react-dom/client';
import Sidepanel from './Sidepanel';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <div className="chat-container">
      <Sidepanel />
    </div>
  </React.StrictMode>
);

