import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import 'lang'
import 'theme/global.css'
import App from './App'

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <App />
    </StrictMode>
)
