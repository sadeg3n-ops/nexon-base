import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { cookieConsentManager } from './lib/cookie-consent';
import { LanguageProvider } from './lib/language';
import './index.css';

try {
  cookieConsentManager.init();
} catch (error) {
  console.error('Cookie consent manager failed to initialize.', error);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>
);
