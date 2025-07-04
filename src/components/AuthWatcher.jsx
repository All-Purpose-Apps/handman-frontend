import { useEffect, useMemo } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';

const auth = getAuth();

const AuthWatcher = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isPublicPath = useMemo(() => {
        const publicPaths = ['/login', '/sign']; // Add paths for public routes
        return publicPaths.some((path) => location.pathname.startsWith(path));
    }, [location.pathname]);

    useEffect(() => {
        const checkToken = async () => {
            if (isPublicPath) return; // Allow access to public routes without redirection

            const user = auth.currentUser;

            if (!user) {
                // Redirect to login if the user is not authenticated
                signOut(auth).then(() => navigate('/login'));
                return;
            }

            try {
                // Attempt to get a valid token, triggering a refresh if needed
                await user.getIdToken(true);
            } catch (error) {
                console.error("Failed to refresh token:", error);

                // If token refresh fails, redirect to login
                signOut(auth).then(() => navigate('/login'));
            }
        };

        // Initial token check on mount and on every route change
        checkToken();

        // Set up a periodic token refresh check
        const intervalId = setInterval(checkToken, 5 * 60 * 1000); // Check every 5 minutes

        // Listen for changes in authentication state
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user && !isPublicPath) {
                navigate('/login');
            }
        });

        // Clean up the interval and listener on component unmount
        return () => {
            clearInterval(intervalId);
            unsubscribe();
        };
    }, [navigate, location.pathname, isPublicPath]);

    return null;
};

export default AuthWatcher;