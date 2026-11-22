import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppStateProvider } from './context/AppState.jsx';
import './styles/app.css';

// HashRouter keeps every screen reachable on GitHub Pages (no server-side routing needed).
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <AppStateProvider>
        <App />
      </AppStateProvider>
    </HashRouter>
  </StrictMode>,
);
