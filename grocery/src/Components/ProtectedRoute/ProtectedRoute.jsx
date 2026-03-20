import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { tokenStorage, jwtUtils } from "../../utils/auth";

const ProtectedRoute = () => {
  const location = useLocation();
  const { user, loading, restoreSession } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [initialAuthCheck, setInitialAuthCheck] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setCheckingAuth(true);

      try {

        const tokens = tokenStorage.getTokens();

        if (!tokens?.accessToken) {

          setCheckingAuth(false);
          setInitialAuthCheck(false);
          return;
        }

        if (jwtUtils.isTokenExpired(tokens.accessToken)) {

          await restoreSession();
          setCheckingAuth(false);
          setInitialAuthCheck(false);
          return;
        }

        if (!user) {
          await restoreSession();
        }

        setCheckingAuth(false);
        setInitialAuthCheck(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        setCheckingAuth(false);
        setInitialAuthCheck(false);
      }
    };

    const timeoutId = setTimeout(checkAuthStatus, 100);

    return () => clearTimeout(timeoutId);
  }, [restoreSession, user]);

  if ((loading || checkingAuth) && initialAuthCheck) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;
