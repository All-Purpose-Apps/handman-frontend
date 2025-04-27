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
import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { app } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationAsRead } from '../store/notificationSlice';
import dayjs from 'dayjs'; // For formatting timestamps

export default function Topbar() {
    const auth = getAuth(app);
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const dispatch = useDispatch();

    // Get notifications from Redux store
    const notifications = useSelector((state) => state.notifications.notifications);
    const status = useSelector((state) => state.notifications.status);
    const error = useSelector((state) => state.notifications.error);

    // State for the notification menu
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // Fetch notifications from the Redux store
    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchNotifications());
        }
    }, [status, dispatch]);

    // Compute unread count dynamically
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    // Handle opening the notification menu
    const handleNotificationClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Handle closing the notification menu
    const handleNotificationClose = () => {
        setAnchorEl(null);
    };

    // Handle marking a notification as read
    const handleNotificationRead = (notificationId) => {
        dispatch(markNotificationAsRead(notificationId));
        dispatch(fetchNotifications());

    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
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
                {currentUser && <IconButton color="inherit" onClick={handleNotificationClick}>
                    <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>}

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
                    [...notifications]
                        .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort notifications by date descending
                        .map((notification) => (
                            <MenuItem
                                key={notification._id}
                                onClick={() => handleNotificationRead(notification._id)}
                                style={{
                                    backgroundColor: notification.isRead ? '#ffffff' : '#f0f0f0',
                                }}
                            >
                                <div>
                                    <Typography variant="body2">{notification.message}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {dayjs(notification.date).format('MMM D, YYYY h:mm A')}
                                    </Typography>
                                </div>
                            </MenuItem>
                        ))
                ) : (
                    <MenuItem onClick={handleNotificationClose}>
                        No new notifications
                    </MenuItem>
                )}
            </Menu>
        </AppBar>
    );
}