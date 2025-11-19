import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress noisy errors coming from browser extensions (e.g. Zotero)
// that cause unhandled promise rejections in the console but are
// unrelated to the app's runtime. This prevents the console spam
// while preserving other error reporting.
window.addEventListener('unhandledrejection', (event) => {
  try {
    const reason = event && event.reason ? String(event.reason) : ''
    if (/A listener indicated an asynchronous response|getTranslators|chrome-extension:\/\/ekhagklcjbdpajgpjgmbionohlpdbjgc/.test(reason)) {
      event.preventDefault()
    }
  } catch (e) {
    // swallowing errors from our handler to avoid recursion
  }
})

window.addEventListener('error', (event) => {
  try {
    const msg = event && event.message ? String(event.message) : ''
    if (/A listener indicated an asynchronous response|getTranslators|chrome-extension:\/\/ekhagklcjbdpajgpjgmbionohlpdbjgc/.test(msg)) {
      event.preventDefault()
    }
  } catch (e) {
    // swallow
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
