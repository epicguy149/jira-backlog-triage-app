import React from 'react';
import { createRoot } from 'react-dom/client';
import { view } from '@forge/bridge';
import AppProvider from '@atlaskit/app-provider';
import '@atlaskit/css-reset';
import App from './App';

view.theme.enable();

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);