// src/components/Login.jsx
import React from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { app } from '../../utils/firebase';

const Login = () => {
    const auth = getAuth(app);
    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            navigate('/'); // Redirect to the protected route
        } catch (error) {
            console.error('Error signing in with Google:', error);
            // Optionally display an error message to the user
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <button onClick={handleGoogleSignIn}>
                Sign in with Google
            </button>
        </div>
    );
};

export default Login;