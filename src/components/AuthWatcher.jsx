import { useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const AuthWatcher = () => {
    const auth = getAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                // User is signed out, handle logout
                signOut(auth).then(() => {
                    navigate('/login'); // Redirect to login page
                });
            }
        });

        // Clean up the listener on component unmount
        return () => unsubscribe();
    }, [auth, navigate]);

    return null;
};

export default AuthWatcher;