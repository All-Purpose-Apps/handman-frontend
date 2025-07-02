// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { app } from '../utils/firebase'; // Ensure you have initialized Firebase
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import useAutoLogout from '../hooks/useAutoLogout';
import { Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const auth = getAuth(app);
  const { showCountdown, countdown } = useAutoLogout();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeState = onAuthStateChanged(auth, async (user) => {
      const hasToken = localStorage.getItem('accessToken');
      const isRedirected = sessionStorage.getItem('logoutRedirected');

      if (!user) {
        setCurrentUser(null);
        navigate('/login');
        setLoading(false);
        return;
      }

      if (!hasToken && user && !isRedirected) {
        sessionStorage.setItem('logoutRedirected', 'true');
        await auth.signOut();
        setCurrentUser(null);
        navigate('/login');
        setLoading(false);
        return;
      }

      sessionStorage.removeItem('logoutRedirected');
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribeState();
  }, [auth, navigate]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (auth.currentUser) {
        try {
          await auth.currentUser.getIdToken(true);
        } catch (error) {
          console.error("Token refresh failed:", error);
          await auth.signOut();
        }
      }
    }, 10 * 60 * 1000); // Refresh token every 10 minutes

    return () => clearInterval(intervalId);
  }, [auth]);

  const value = useMemo(() => ({ currentUser, setCurrentUser }), [currentUser]);
  return (
    <AuthContext.Provider value={value}>
      {!loading && (
        <>
          {children}
          {showCountdown && (
            <Dialog open>
              <DialogTitle>Session Expiring Soon</DialogTitle>
              <DialogContent>
                <Typography>
                  Your session will expire in {Math.floor(countdown / 60)} minute{Math.floor(countdown / 60) !== 1 ? 's' : ''} and {countdown % 60} second{countdown % 60 !== 1 ? 's' : ''}.
                </Typography>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </AuthContext.Provider>
  );
};
