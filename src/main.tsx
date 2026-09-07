import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'

// NOTE: temporary bootstrap placeholder — replaced with the src/app composition
// root in Step 9 (App shell + routing) once src/app/App.tsx exists.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div />
  </StrictMode>,
)
