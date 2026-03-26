import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter, createHashHistory } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import './index.css';

// Use hash-based routing so Kodi's static web server can serve the SPA
const hashHistory = createHashHistory();

// Create the router instance
const router = createRouter({ routeTree, history: hashHistory });

// Register things for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
