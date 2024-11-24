import React, { useState, useEffect } from 'react';
import {
    AppBar,
    IconButton,
    Toolbar,
    Typography,
    Button,
    Badge,
    Menu,
    MenuItem,
} from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { app } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function Topbar() {
    const auth = getAuth(app);
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // State for notifications
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // State for the notification menu
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // Fetch notifications from the backend
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications`); // Replace with your API endpoint
                setNotifications(response.data);
                // Assuming each notification has an 'isRead' property
                setUnreadCount(response.data.filter((n) => !n.isRead).length);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, []);

    // Handle opening the notification menu
    const handleNotificationClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Handle closing the notification menu
    const handleNotificationClose = () => {
        setAnchorEl(null);
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
            // Optionally display an error message to the user
        }
    };

    return (
        <AppBar
            position="fixed"
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    edge="start"
                    sx={{ mr: 2, display: { sm: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                    Han-D-Man Pro
                </Typography>

                {/* Notification Bell Icon */}
                <IconButton color="inherit" onClick={handleNotificationClick}>
                    <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>

                {currentUser && (
                    <Button color="inherit" onClick={handleLogout}>
                        Logout
                    </Button>
                )}
            </Toolbar>

            {/* Notification Dropdown Menu */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleNotificationClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <MenuItem
                            key={notification.id}
                            onClick={() => {
                                // Handle notification click (e.g., mark as read, navigate)
                                handleNotificationClose();
                            }}
                        >
                            {notification.message}
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem onClick={handleNotificationClose}>No new notifications</MenuItem>
                )}
            </Menu>
        </AppBar>
    );
}