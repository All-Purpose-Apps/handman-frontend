// src/components/Login.jsx
import React from 'react';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { app } from '../../utils/firebase';
import { handleGoogleSignIn } from '../../utils/handleGoogleSignIn';
import { Box, Button, Typography, Paper } from '@mui/material';

const Login = () => {
    const auth = getAuth(app);
    const navigate = useNavigate();

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
            justifyContent="flex-start"
            alignItems="flex-start"
            height="100vh"
            bgcolor="#f5f5f5"
            p={4}
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