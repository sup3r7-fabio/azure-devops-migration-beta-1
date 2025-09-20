import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { IPublicClientApplication, PublicClientApplication, AuthenticationResult, AccountInfo } from '@azure/msal-browser';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { msalConfig, loginRequest, silentRequest } from './msalConfig';

interface AuthContextValue {
  account: AccountInfo | null;
  roles: string[];
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
  getAccessToken: (scopes?: string[]) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Utility to extract roles from ID token claims (app roles or groups if mapped)
const extractRoles = (account: AccountInfo | null): string[] => {
  if (!account) return [];
  const idTokenClaims: any = account.idTokenClaims || {};
  const roles: string[] = [];
  if (Array.isArray(idTokenClaims.roles)) {
    roles.push(...idTokenClaims.roles);
  }
  if (Array.isArray(idTokenClaims.groups)) {
    // Optionally map groups to role-like semantics
    roles.push(...idTokenClaims.groups);
  }
  return Array.from(new Set(roles));
};

const InnerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { instance, accounts } = useMsal();
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      const primary = accounts[0];
      setAccount(primary);
      setRoles(extractRoles(primary));
    } else {
      setAccount(null);
      setRoles([]);
    }
  }, [accounts]);

  const login = useCallback(async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (e) {
      console.error('Login failed', e);
    }
  }, [instance]);

  const logout = useCallback(() => {
    instance.logoutPopup({});
  }, [instance]);

  const getAccessToken = useCallback(async (scopes?: string[]) => {
    if (!account) return null;
    try {
      const result: AuthenticationResult = await instance.acquireTokenSilent({
        ...(silentRequest as any),
        scopes: scopes || silentRequest.scopes,
        account
      });
      return result.accessToken;
    } catch (silentErr) {
      console.warn('Silent token acquisition failed, attempting interactive', silentErr);
      try {
        const interactive = await instance.acquireTokenPopup({
          ...(loginRequest as any),
          scopes: scopes || loginRequest.scopes
        });
        return interactive.accessToken;
      } catch (interactiveErr) {
        console.error('Interactive token acquisition failed', interactiveErr);
        return null;
      }
    }
  }, [account, instance]);

  const value: AuthContextValue = {
    account,
    roles,
    isAuthenticated: !!account,
    login,
    logout,
    getAccessToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// Top-level provider that creates the MSAL instance once.
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pca] = useState<IPublicClientApplication>(() => new PublicClientApplication(msalConfig));
  return (
    <MsalProvider instance={pca}>
      <InnerAuthProvider>{children}</InnerAuthProvider>
    </MsalProvider>
  );
};

export default AuthProvider;
