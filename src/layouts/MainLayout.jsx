// MainLayout.jsx

import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
    Toolbar,
    CssBaseline,
    Box,
} from '@mui/material';

import Sidebar from '../components/Sidebar';

import Topbar from '../components/Topbar';

function MainLayout() {
    const drawerWidth = 240;
    const [showSidebar, setShowSidebar] = useState(false);

    return (
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
    );
}

export default React.memo(MainLayout);