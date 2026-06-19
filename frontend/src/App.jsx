import React from 'react'
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { AppContextProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { initializeLanguage } from './utility/language';
import { getAuthToken, decodeToken, removeAuthToken } from './utility/helpers';
import './themes/theme.css';

// import components
import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login';
import Home from './pages/Home';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import QuickSave from './pages/QuickSave';
import Settings from './pages/other/Settings';
import Security from './pages/other/Security';
import PasswordVault from './pages/password-manager/PasswordVault';
import ExpenseVault from './pages/expense-manager/ExpenseVault';
import InvestmentVault from './pages/investment-manager/InvestmentVault';
import ThemeTest from './themes/ThemeTest';
import PlannerVault from './pages/planning-manager/PlannerVault';

initializeLanguage();

export default function App() {
    return (
        <ChakraProvider>
        <ThemeProvider>
        <AppContextProvider>
            
            <BrowserRouter>
                <Routes>
                    {/* Authentication Routes */}
                    <Route path='/' element={ <AvoidAuthIfLoggedIn component={<Landing />} /> } />
                    <Route path='/signup' element={ <AvoidAuthIfLoggedIn component={<Signup />} /> } />
                    <Route path='/login' element={ <AvoidAuthIfLoggedIn component={<Login />} /> } />
                    {/* <Route path='/reset-password' element={<ResetPassword />} /> */}
                    {/* <Route path='/reset-pin' element={<ProtectedComponent component={<ResetPin />} />} /> */}
                    {/* <Route path='/' element={</>} /> */}

                    {/* Main Routes */}
                    <Route path='/home' element={ <ProtectedComponent component={<Home />} /> } />
                    <Route path='/password-manager' element={<ProtectedComponent component={<PasswordVault />} />} />
                    <Route path='/expense-manager' element={<ProtectedComponent component={<ExpenseVault />} />} />
                    <Route path='/investment-manager' element={<ProtectedComponent component={<InvestmentVault />} />} />
                    <Route path='/active-sessions' element={<ProtectedComponent component={<Security />} />} />
                    <Route path='/planning-manager' element={<ProtectedComponent component={<PlannerVault />} />} />
                    {/* <Route path='/vault/task' element={<ProtectedComponent component={<TaskVault />} />} /> */}
                    {/* <Route path='/access-control' element={<ProtectedAdminComponent component={<AccessControlPage />} />} /> */}
                    <Route path='/settings' element={<ProtectedComponent component={<Settings />} />} />
                    {/* <Route path='/about' element={<ProtectedComponent component={<About />} />} /> */}
                    <Route path='/quick-save' element={<ProtectedComponent component={<QuickSave />} />} />
                    {/* <Route path='/' element={</>} /> */}

                    {/* Theme Test */}
                    <Route path='/theme-test' element={<ThemeTest />} />

                    {/* Fallback Route */}
                    <Route path='*' element={<NotFound />} />
                </Routes>
            </BrowserRouter> 

            <Toaster
                position={window.innerWidth < 768 ? 'top-center' : 'top-right'}
                toastOptions={{
                    style: { fontSize: "15px", height: '55px', width: '400px', borderRadius: '6px', fontWeight: 500 },
                    success: {style: { border: '1px solid #22c55e', borderLeft: "8px solid #22c55e", backgroundColor: "#d3f8e1", color: '#22c55e' }},
                    error: {style: { border: "1px solid #ef4444", borderLeft: "8px solid #ef4444", backgroundColor: "#fde8e8", color: '#ef4444' }},
                    loading : {style: { border: "1px solid #2c323a", borderLeft: "8px solid #2c323a", backgroundColor: "#e2e5e9", color: '#2c323a' }}
                }}
            />

        </AppContextProvider>
        </ThemeProvider>
        </ChakraProvider>
    )
}


const AvoidAuthIfLoggedIn = ({component}) =>{
    const decodedToken = decodeToken(getAuthToken());
    if(decodedToken && decodedToken.id && decodedToken.sessionId && decodedToken.email && decodedToken.name && decodedToken.privilege){
        return <Navigate to='/home' />
    }
    else{
        return component
    }
}


const ProtectedComponent = ({component}) =>{
    const decodedToken = decodeToken(getAuthToken());
    if(decodedToken && decodedToken.id && decodedToken.sessionId){
        return component;
    }
    removeAuthToken();
    return <Navigate to='/login' />;
}


const ProtectedAdminComponent = ({component}) =>{
    const decodedToken = decodeToken(getAuthToken());
    if(decodedToken && decodedToken.id && decodedToken.sessionId && decodedToken.privilege === "admin"){
        return component;
    }
    removeAuthToken();
    return <Navigate to='/login' />;
}
