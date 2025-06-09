// src/components/Sidebar.jsx
export const drawerWidth = 240;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Toolbar, Box,
    useMediaQuery, useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { routes } from '../routes';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({ showSidebar, onNavigate }) {
    const { currentUser } = useAuth();
    const theme = useTheme();
    const isMdDown = useMediaQuery(theme.breakpoints.down('lg'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
    const [isPortrait, setIsPortrait] = useState(
        typeof window !== 'undefined'
            ? window.matchMedia('(orientation: portrait)').matches
            : false
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mediaQuery = window.matchMedia('(orientation: portrait)');
        const handleOrientationChange = () => setIsPortrait(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleOrientationChange);
        return () => mediaQuery.removeEventListener('change', handleOrientationChange);
    }, []);

    const isTabletPortrait = isMdDown && isPortrait;

    const listItem = (routes) => {
        return routes.map((route) => {
            if (route.sidebar === true) {
                return (
                    <ListItem component={Link} to={route.path} key={route.name} onClick={onNavigate}>
                        <ListItemIcon>
                            <route.icon />
                        </ListItemIcon>
                        <ListItemText primary={route.name} />
                    </ListItem>
                );
            }
            return null;
        });
    };

    const renderList = () => (
        <List>
            <ListItem>
                <ListItemText primary="Menu" />
            </ListItem>
            <Divider />
            {currentUser ? listItem(routes) : (
                <ListItem component={Link} to="/login" onClick={onNavigate}>
                    <ListItemText primary="Login" />
                </ListItem>
            )}
            <Divider />
        </List>
    );

    return (
        <>
            {/* Mobile Temporary Drawer */}
            <Drawer
                variant="temporary"
                open={showSidebar}
                onClose={onNavigate}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: isTabletPortrait ? 'block' : 'none' },
                    '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <IconButton onClick={onNavigate} sx={{ ml: 'auto', mt: 1, mr: 1 }}>
                    <CloseIcon />
                </IconButton>
                <Box sx={{ overflow: 'auto' }}>
                    {renderList()}
                </Box>
            </Drawer>

            {/* Desktop Permanent Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: isTabletPortrait ? 'none' : 'block' },
                    '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', position: isTablet ? 'relative' : 'fixed' },
                }}
                open
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    {renderList()}
                </Box>
            </Drawer>
        </>
    );
}