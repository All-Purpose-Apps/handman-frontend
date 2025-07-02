// src/components/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import {
    Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider,
    Toolbar, Box, useMediaQuery, useTheme, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { routes } from '../routes';
import { useAuth } from '../contexts/AuthContext';
export const drawerWidth = 240;

// Custom NavLink wrapper for MUI ListItemButton
const RouterNavLink = React.forwardRef((props, ref) => (
    <NavLink
        ref={ref}
        {...props}
        className={({ isActive }) =>
            `${props.className ?? ''} ${isActive ? 'Mui-selected' : ''}`
        }
    />
));

export default function Sidebar({ showSidebar, onNavigate }) {
    const { currentUser } = useAuth();
    const theme = useTheme();
    const isMdDown = useMediaQuery(theme.breakpoints.down('lg'));
    const isPortrait = useMediaQuery('(orientation: portrait)');
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
    const isTabletPortrait = isMdDown && isPortrait;

    const renderList = () => (
        <List>
            <ListItemText primary="Menu" sx={{ pl: 2, pt: 1 }} />
            <Divider />
            {currentUser
                ? routes.map((route) =>
                    route.sidebar ? (
                        <ListItemButton
                            key={route.name}
                            component={RouterNavLink}
                            to={route.path}
                            onClick={onNavigate}
                            sx={{
                                pl: 2,
                                '&.Mui-selected': { backgroundColor: 'info.main', color: 'white' },
                                '&.Mui-selected:hover': { backgroundColor: 'text.disabled' },
                                '&:hover': { backgroundColor: 'text.disabled' },
                            }}
                        >
                            <ListItemIcon>
                                <route.icon />
                            </ListItemIcon>
                            <ListItemText primary={route.name} />
                        </ListItemButton>
                    ) : null
                )
                : (
                    <ListItemButton
                        component={RouterNavLink}
                        to="/login"
                        onClick={onNavigate}
                        sx={{ pl: 2 }}
                    >
                        <ListItemText primary="Login" />
                    </ListItemButton>
                )}
            <Divider />
        </List>
    );

    return (
        <>
            {/* Mobile Drawer */}
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
                <IconButton onClick={onNavigate} sx={{ ml: 'auto', m: 1 }}>
                    <CloseIcon />
                </IconButton>
                <Box sx={{ overflow: 'auto' }}>{renderList()}</Box>
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                open
                sx={{
                    display: { xs: 'none', sm: isTabletPortrait ? 'none' : 'block' },
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        position: isTablet ? 'relative' : 'fixed',
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>{renderList()}</Box>
            </Drawer>
        </>
    );
}