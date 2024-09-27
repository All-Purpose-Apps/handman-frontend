// MainLayout.jsx

import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
    Toolbar,
    CssBaseline,
    Box,
} from '@mui/material';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function MainLayout() {
    const drawerWidth = 240;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            {/* Topbar */}
            <Topbar />

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}