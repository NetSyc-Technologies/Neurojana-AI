import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  isAuthorizedAdmin,
  AUTHORIZED_ADMIN_EMAILS,
} from '../services/firebase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const authorized = isAuthorizedAdmin(currentUser);
        setIsAdmin(authorized);
        if (!authorized) {
          // Gracefully record warning for unauthorized Google accounts
          setAuthError(`Account (${currentUser.email}) is not on the administrator allowlist.`);
        } else {
          setAuthError(null);
        }
      } else {
        setIsAdmin(false);
        setAuthError(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const authorized = isAuthorizedAdmin(result.user);
      if (!authorized) {
        const email = result.user.email;
        await signOut(auth);
        setUser(null);
        setIsAdmin(false);
        throw new Error(`Access Denied: The Google account "${email}" is not authorized for administration. Only allowlisted admin emails may sign in.`);
      }
      return result.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    setAuthError(null);
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        authError,
        loginWithGoogle,
        logout,
        authorizedAdminEmails: AUTHORIZED_ADMIN_EMAILS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
