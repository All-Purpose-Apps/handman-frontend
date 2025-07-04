import React, { useState, useEffect, useMemo } from 'react';
import {
    AppBar,
    IconButton,
    Toolbar,
    Typography,
    Button,
    Badge,
    Menu,
    MenuItem,
    Box,
    Divider,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
} from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { app } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationAsRead, clearNotifications, markAllNotificationsAsRead } from '../store/notificationSlice';
import dayjs from 'dayjs'; // For formatting timestamps
import { useSocket } from '../contexts/SocketContext';


function Topbar({ setShowSidebar }) {

    const auth = getAuth(app);
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const dispatch = useDispatch();

    const tenantId = currentUser?.email?.split('@')[0];
    const socket = useSocket();

    // Get notifications from Redux store
    const notifications = useSelector((state) => state.notifications.notifications);
    const status = useSelector((state) => state.notifications.status);
    const error = useSelector((state) => state.notifications.error);

    // State for the notification menu
    const [anchorEl, setAnchorEl] = useState(null);
    const [showAllNotifications, setShowAllNotifications] = useState(false);
    const open = Boolean(anchorEl);


    // Listen for newNotification event from socket.io and fetch notifications
    useEffect(() => {
        if (!currentUser || !socket) return;

        const handleNewNotification = (notification) => {
            dispatch(fetchNotifications());
        };

        socket.on('newNotification', handleNewNotification);

        return () => {
            socket.off('newNotification', handleNewNotification);
        };
    }, [currentUser, dispatch, socket]);

    useEffect(() => {
        if (currentUser) {
            dispatch(fetchNotifications());
        }
    }, [currentUser, dispatch]);

    // Compute unread count dynamically with useMemo
    const unreadCount = useMemo(() => {
        return notifications.filter((n) => !n.isRead).length;
    }, [notifications]);

    // Handle opening the notification menu
    const handleNotificationClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Handle closing the notification menu
    const handleNotificationClose = () => {
        setAnchorEl(null);
        setShowAllNotifications(false);
        dispatch(markAllNotificationsAsRead()).then(() => {
            dispatch(fetchNotifications());
        });
    };

    // Handle marking a notification as read (unused in new code, kept if needed elsewhere)
    const handleNotificationRead = (notificationId) => {
        dispatch(markNotificationAsRead(notificationId));
        dispatch(fetchNotifications());
    };

    // Handler for dismissing a single notification
    const handleNotificationDismiss = (notificationId) => {
        dispatch(markNotificationAsRead(notificationId)).then(() => {
            dispatch(fetchNotifications());
        }
        );
    };

    // Handler to clear all notifications
    const handleClearAllNotifications = () => {
        dispatch(clearNotifications()).then(() => {
            dispatch(fetchNotifications());
        });
        handleNotificationClose();
    };

    // State to control showing all notifications


    // Memoize displayedNotifications and slicedNotifications
    const displayedNotifications = useMemo(() => {
        return [...notifications].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [notifications]);

    const slicedNotifications = useMemo(() => {
        return showAllNotifications ? displayedNotifications : displayedNotifications.slice(0, 5);
    }, [displayedNotifications, showAllNotifications]);

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
        <>
            <style>
                {`
          @keyframes fadeIn {
            to {
              opacity: 1;
            }
          }
        `}
            </style>
            <AppBar
                position="fixed"
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() => setShowSidebar((prev) => !prev)}
                        sx={{ mr: 2, display: { xs: 'block', sm: 'block', md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        {currentUser ? `Welcome, ${currentUser.displayName || currentUser.email}` : 'Welcome'}
                    </Typography>

                    {/* Notification Bell Icon */}
                    {currentUser && <IconButton color="inherit" onClick={handleNotificationClick}>
                        <Badge badgeContent={unreadCount} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>}

                    {currentUser && (
                        <>
                            <Button color="inherit" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
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
                    slotProps={{
                        paper: {
                            sx: {
                                minWidth: 320,
                                maxWidth: 'unset',
                            },
                        },
                    }}
                >
                    {notifications.length > 0 ? (
                        <>
                            <MenuItem onClick={handleClearAllNotifications}>
                                <Typography variant="body2" color="primary">
                                    Clear All Notifications
                                </Typography>
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={() => dispatch(markAllNotificationsAsRead()).then(() => dispatch(fetchNotifications()))}>
                                <Typography variant="body2" color="primary">
                                    Mark All as Read
                                </Typography>
                            </MenuItem>
                            <Divider />
                            {slicedNotifications.map((notification) => (
                                <MenuItem
                                    key={notification._id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        backgroundColor: notification.isRead ? '#ffffff' : '#e3f2fd',
                                        gap: 1,
                                        px: 2,
                                        py: 1.5,
                                        borderBottom: '1px solid #f0f0f0',
                                        opacity: 0,
                                        animation: 'fadeIn 0.5s ease-in forwards',
                                        textWrap: 'auto',
                                        maxWidth: { sm: '400px', md: '500px' },
                                    }}
                                >
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: notification.isRead ? 'normal' : 'bold' }}>
                                            {notification.message}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {dayjs(notification.date).format('MMM D, YYYY h:mm A')}
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleNotificationDismiss(notification._id)}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </MenuItem>
                            ))}
                            {notifications.length > 5 && (
                                <MenuItem onClick={() => setShowAllNotifications((prev) => !prev)}>
                                    <Typography variant="body2" color="primary">
                                        {showAllNotifications ? 'Show Less' : 'View All Notifications'}
                                    </Typography>
                                </MenuItem>
                            )}
                        </>
                    ) : (
                        <MenuItem onClick={handleNotificationClose}>
                            No new notifications
                        </MenuItem>
                    )}
                </Menu>
            </AppBar>
        </>
    );
}

export default React.memo(Topbar);