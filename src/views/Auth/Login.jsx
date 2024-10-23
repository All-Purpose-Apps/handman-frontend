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
        // Request additional scopes


        provider.addScope('https://www.googleapis.com/auth/contacts');
        provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
        provider.addScope('https://www.googleapis.com/auth/calendar.events');
        provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
        provider.addScope('https://www.googleapis.com/auth/gmail.send');
        provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
        provider.addScope('https://www.googleapis.com/auth/gmail.modify');
        provider.addScope('https://www.googleapis.com/auth/cloud-platform');
        provider.addScope('https://www.googleapis.com/auth/devstorage.read_only');

        try {
            const result = await signInWithPopup(auth, provider);

            // Get the OAuth credential
            const credential = GoogleAuthProvider.credentialFromResult(result);

            if (credential) {
                // This gives you a Google Access Token.
                const accessToken = credential.accessToken;

                // Store the access token in local storage or state management
                localStorage.setItem('accessToken', accessToken);

                navigate('/'); // Redirect to the protected route
            } else {
                console.error('No credential returned from Google sign-in.');
            }
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