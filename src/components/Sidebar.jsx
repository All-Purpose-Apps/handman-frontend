// src/components/Sidebar.jsx
export const drawerWidth = 240;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Toolbar, Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { routes } from '../routes';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function Sidebar({ showSidebar, onNavigate }) {
    const [user, setUser] = useState(null);
    const auth = getAuth();

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

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
            {user ? listItem(routes) : (
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
                    display: { xs: 'block', sm: 'none' },
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
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
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