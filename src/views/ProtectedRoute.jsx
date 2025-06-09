import { Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useAutoLogout from '../hooks/useAutoLogout';
import { getIdTokenResult, getAuth } from 'firebase/auth';

import { handleGoogleSignIn } from '../utils/handleGoogleSignIn'; // Adjust path if needed

const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();
    const auth = getAuth();

    let showCountdown = false;
    let countdown = 0;
    if (currentUser) {
        ({ showCountdown, countdown } = useAutoLogout());
    }

    // useEffect(() => {
    //     const validateToken = async () => {
    //         try {
    //             if (auth.currentUser) {
    //                 await getIdTokenResult(auth.currentUser, true); // force refresh
    //             }
    //         } catch (err) {
    //             console.warn('Access token invalid or expired, re-signing in...');
    //             try {
    //                 await handleGoogleSignIn(auth);
    //             } catch (signInErr) {
    //                 console.error('Failed to re-authenticate:', signInErr);
    //             }
    //         }
    //     };
    //     validateToken();
    // }, []);

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
                            You will be logged out in {countdown} seconds due to inactivity.
                        </Typography>
                    </DialogContent>
                </Dialog>
            )}
            {children}
        </>
    );
};

export default ProtectedRoute;