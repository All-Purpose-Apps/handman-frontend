// src/components/Login.jsx
import React from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { app } from '../../utils/firebase';
import { handleGoogleSignIn } from '../../utils/handleGoogleSignIn';
import { Box, Button, Typography, Paper } from '@mui/material';

const Login = () => {
    const auth = getAuth(app);
    const navigate = useNavigate();

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate('/dashboard');
            }
        });

        return () => unsubscribe();
    }, []);

    const handleClick = async () => {
        if (sessionStorage.getItem('loginInProgress')) return;

        try {
            sessionStorage.setItem('loginInProgress', 'true');
            await handleGoogleSignIn(auth, navigate);
            navigate('/dashboard');
        } finally {
            sessionStorage.removeItem('loginInProgress');
        }
    }

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="flex-start"
            bgcolor="#f5f5f5"
            id="login-container"
            p={{ xs: 4, md: 10 }}
            m={2}
        >
            <Paper elevation={3} sx={{ padding: 4, borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    Welcome Back
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                    Sign in to continue to HandmanPro
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleClick}
                    sx={{ marginTop: 2 }}
                >
                    Sign in with Google
                </Button>
            </Paper>
        </Box>
    );
};

export default Login;