import React from 'react';
import { createRoot } from 'react-dom/client';
import { view } from '@forge/bridge';
import AtlaskitAppProvider from '@atlaskit/app-provider';
import '@atlaskit/css-reset';
import App from './app/App';
import { AppProvider } from './app/AppContext';

view.theme.enable();

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <AtlaskitAppProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </AtlaskitAppProvider>
  </React.StrictMode>
);