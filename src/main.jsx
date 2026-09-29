import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { installAppearanceSync } from './themePreferences'
import './index.css'
import './responsive.css'
import './accessibility.css'
import './dark-theme-complete.css'
import App from './App.jsx'

installAppearanceSync()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
