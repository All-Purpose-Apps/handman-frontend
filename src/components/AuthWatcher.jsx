import { useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const AuthWatcher = () => {
    const auth = getAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const checkToken = async () => {
            const user = auth.currentUser;
            if (!user) {
                // If there's no authenticated user, navigate to login
                signOut(auth).then(() => navigate('/login'));
                return;
            }

            try {
                // Attempt to get a valid token, triggering a refresh if needed
                await user.getIdToken(true);

            } catch (error) {
                console.error("Failed to refresh token:", error);

                // Sign out and navigate to login on failure to retrieve token
                signOut(auth).then(() => navigate('/login'));
            }
        };

        // Initial token check on mount and on every render
        checkToken();

        // Set up a periodic token refresh check
        const intervalId = setInterval(checkToken, 5 * 60 * 1000); // Check every 5 minutes

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                signOut(auth).then(() => navigate('/login'));
            }
        });

        // Clean up the interval and listener on component unmount
        return () => {
            clearInterval(intervalId);
            unsubscribe();
        };
    }, [auth, navigate]);

    return null;
};

export default AuthWatcher;