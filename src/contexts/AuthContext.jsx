// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { handleGoogleSignIn } from '../utils/handleGoogleSignIn';
import { app } from '../utils/firebase'; // Ensure you have initialized Firebase

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const auth = getAuth(app);
  const accessToken = localStorage.getItem('accessToken');

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!localStorage.getItem('accessToken')) {
        if (user) {
          // If user is signed in but no access token, sign them out
          await auth.signOut();
        }
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, [auth]);

  return <AuthContext.Provider value={{ currentUser }}>{!loading && children}</AuthContext.Provider>;
};
