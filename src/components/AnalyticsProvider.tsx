import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, setUserId } from '../services/analytics';
import { useAuth } from '../context/AuthContext';

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Track page views on route change
    trackPageView(location.pathname + location.search);
  }, [location]);

  useEffect(() => {
    // Set user ID when user logs in
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user]);

  return <>{children}</>;
};
