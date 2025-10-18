import React, { createContext, useContext, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { createSDK, OpenAskSDK } from '@openask/sdk';

interface SDKContextType {
  sdk: OpenAskSDK;
}

export const SDKContext = createContext<SDKContextType | null>(null);

export const SDKProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getAccessTokenSilently, loginWithRedirect } = useAuth0();

  const sdk = useMemo(() => {
    return createSDK({
      baseUrl: import.meta.env.VITE_API_BASE_URL,
      getToken: async () => {
        try {
          return await getAccessTokenSilently();
        } catch (error) {
          return null;
        }
      },
      onUnauthorized: () => {
        loginWithRedirect();
      },
    });
  }, [getAccessTokenSilently, loginWithRedirect]);

  return <SDKContext.Provider value={{ sdk }}>{children}</SDKContext.Provider>;
};

export const useSDK = (): OpenAskSDK => {
  const context = useContext(SDKContext);
  if (!context) {
    throw new Error('useSDK must be used within SDKProvider');
  }
  return context.sdk;
};
