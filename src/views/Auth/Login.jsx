// src/components/Login.jsx
import React from 'react';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { app } from '../../utils/firebase';
import { handleGoogleSignIn } from '../../utils/handleGoogleSignIn';

const Login = () => {
    const auth = getAuth(app);
    const navigate = useNavigate();

    const handleClick = async () => {
        await handleGoogleSignIn(auth, navigate);
        navigate('/dashboard');
    }

    return (
        <div>
            <h2>Login</h2>
            <button onClick={handleClick}>
                Sign in with Google
            </button>
        </div>
    );
};

export default Login;