import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import '../../assets/styles/tailwind.css';
import App from '../../components/App';

const container = document.getElementById('app-container');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} 