import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

export const AuthCallback: React.FC = () => {
  const { isLoading, error, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Redirect to home or the page they were trying to access
      const returnTo = sessionStorage.getItem('returnTo') || '/';
      sessionStorage.removeItem('returnTo');
      navigate(returnTo);
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div
          className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"
          role="status"
          aria-label="Loading"
        ></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};
