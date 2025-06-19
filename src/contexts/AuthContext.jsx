// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { app } from '../utils/firebase'; // Ensure you have initialized Firebase
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const auth = getAuth(app);

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!localStorage.getItem('accessToken')) {
        if (user && !sessionStorage.getItem('logoutRedirected')) {
          sessionStorage.setItem('logoutRedirected', 'true');
          await auth.signOut();
        }
        setCurrentUser(null);
        setLoading(false);
        return;
      } else {
        sessionStorage.removeItem('logoutRedirected');
      }

      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, [auth]);

  const value = useMemo(() => ({ currentUser, setCurrentUser }), [currentUser]);
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
