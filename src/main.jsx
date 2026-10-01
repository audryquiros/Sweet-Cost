import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { installAppearanceSync } from './context/themePreferences'
import { AuthProvider } from './context/authContext'
import './index.css'
import './styles/responsive.css'
import './styles/accessibility.css'
import './styles/dark-theme-complete.css'
import './styles/actions.css'
import App from './App.jsx'

installAppearanceSync()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
