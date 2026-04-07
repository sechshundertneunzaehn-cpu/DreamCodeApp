import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'material-icons/iconfont/material-icons.css';
import './index.css';

// Affiliate tracking - URL param detection
const urlParams = new URLSearchParams(window.location.search);
const refCode = urlParams.get('ref');
if (refCode) {
  localStorage.setItem('affiliate_ref', refCode);
  localStorage.setItem('affiliate_ref_date', Date.now().toString());
  fetch('/api/affiliate/click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: refCode }),
  }).catch(() => {});
}

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<React.StrictMode><App /></React.StrictMode>);
}
