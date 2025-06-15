import { Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useAutoLogout from '../hooks/useAutoLogout';

const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();

    const { showCountdown, countdown } = useAutoLogout();

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return (
        <>
            {showCountdown && (
                <Dialog open>
                    <DialogTitle>Session Expiring</DialogTitle>
                    <DialogContent>
                        <Typography>
                            You will be logged out in {Math.floor(countdown / 60)} minute{Math.floor(countdown / 60) !== 1 ? 's' : ''} and {Math.round(countdown % 60)} second{Math.round(countdown % 60) !== 1 ? 's' : ''} due to inactivity.
                        </Typography>
                    </DialogContent>
                </Dialog>
            )}
            {children}
        </>
    );
};

export default ProtectedRoute;