// MainLayout.jsx

import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import {
    Toolbar,
    CssBaseline,
    Box,
} from '@mui/material';

import Sidebar from '../components/Sidebar';

import Topbar from '../components/Topbar';
import { SocketProvider } from '../contexts/SocketContext';
import { getAuth } from 'firebase/auth';
import CircularProgress from '@mui/material/CircularProgress';


function MainLayout() {
    const drawerWidth = 240;
    const [showSidebar, setShowSidebar] = useState(false);
    const auth = getAuth();
    const user = auth.currentUser;

    const [authLoaded, setAuthLoaded] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(() => {
            setAuthLoaded(true);
        });
        return unsubscribe;
    }, []);

    if (!authLoaded) return (<Box
        sx={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: '#f4f6f8',
        }}
    >
        <CircularProgress size={64} thickness={4} />
    </Box>);


    return (
        <SocketProvider tenantId={user?.email?.split('@')[0]}>
            <Box sx={{ display: 'flex' }} className="main-layout">
                <CssBaseline />

                {/* Topbar */}
                <Topbar setShowSidebar={setShowSidebar} />

                {/* Sidebar */}
                <Sidebar showSidebar={showSidebar} onNavigate={() => setShowSidebar(false)} setShowSidebar={setShowSidebar} />

                {/* Main Content */}
                <Box
                    component="main"
                    className="main-content"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        ml: { lg: `${drawerWidth}px` },
                    }}
                >
                    <Toolbar />
                    <Outlet />
                </Box>
            </Box>
        </SocketProvider>
    );
}

export default React.memo(MainLayout);
