import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Grommet } from 'grommet';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Grommet>
      <App />
    </Grommet>
  </StrictMode>,
)
