// src/components/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Toolbar, Box,
} from '@mui/material';
import { routes } from '../routes';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function Sidebar() {
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
                    <ListItem component={Link} to={route.path} key={route.name}>
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

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 240,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 240,
                    boxSizing: 'border-box',
                },
                display: { xs: 'none', sm: 'block' },
            }}
        >
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    <ListItem>
                        <ListItemText primary="Menu" />
                    </ListItem>
                    <Divider />

                    {user ? (
                        // User is signed in, show sidebar items
                        listItem(routes)
                    ) : (
                        // User is not signed in, show "Login" item
                        <ListItem component={Link} to="/login">
                            <ListItemText primary="Login" />
                        </ListItem>
                    )}

                </List>
                <Divider />
            </Box>
        </Drawer>
    );
}