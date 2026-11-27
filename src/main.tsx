import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './Components/ErrorBoundary.tsx'
// Polices hébergées avec l'appli (plus de requête vers Google Fonts)
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import '@fontsource/lato/400.css'
import '@fontsource/lato/700.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

// Service worker (installation sur téléphone + mode hors-ligne) : uniquement dans la version publiée, pas pendant "npm run dev"
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => console.error('Service worker non enregistré :', error))
  })
}
