import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './themes/theme.css';
import App from './App.jsx'

import { ChakraProvider } from '@chakra-ui/react';
import AppProvider from './context/AppContext.jsx';
import ThemeProvider from './context/ThemeContext.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>

        <ChakraProvider>
        <ThemeProvider>
        <AppProvider>

            <App />
            
        </AppProvider>
        </ThemeProvider>
        </ChakraProvider>

    </StrictMode>,
)
