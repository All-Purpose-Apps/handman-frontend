import { Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useAutoLogout from '../hooks/useAutoLogout';

const ProtectedRoute = ({ children }) => {
    const { showCountdown, countdown } = useAutoLogout(); // Set auto logout timeout to 15 minutes
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return (
        <>
            <Dialog open={showCountdown}>
                <DialogTitle>Session Expiring</DialogTitle>
                <DialogContent>
                    <Typography>
                        You will be logged out in {countdown} seconds due to inactivity.
                    </Typography>
                </DialogContent>
            </Dialog>
            {children}
        </>
    );
};

export default ProtectedRoute;