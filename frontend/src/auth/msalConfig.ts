import { Configuration, LogLevel } from '@azure/msal-browser';

// Environment-driven settings (fallbacks help during initial setup)
const tenantId = process.env.REACT_APP_AAD_TENANT_ID || 'common';
const clientId = process.env.REACT_APP_AAD_CLIENT_ID || 'YOUR_CLIENT_ID';
const authorityHost = process.env.REACT_APP_AAD_AUTHORITY_HOST || 'https://login.microsoftonline.com';
const authority = `${authorityHost}/${tenantId}`;
const redirectUri = process.env.REACT_APP_AAD_REDIRECT_URI || window.location.origin;

// Scopes you can expand later (user.read for MS Graph basic profile)
export const defaultScopes = (process.env.REACT_APP_AAD_DEFAULT_SCOPES || 'User.Read').split(',').map(s => s.trim());

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
    navigateToLoginRequestUrl: true
  },
  cache: {
    cacheLocation: 'memoryStorage', // Avoid local/session storage for tokens (mitigate XSS token theft)
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error('[MSAL]', message);
            return;
          case LogLevel.Warning:
            console.warn('[MSAL]', message);
            return;
          case LogLevel.Info:
            console.info('[MSAL]', message);
            return;
          case LogLevel.Verbose:
            // verbose omitted by default
            return;
        }
      }
    }
  }
};

// Request templates
export const loginRequest = {
  scopes: defaultScopes
};

export const silentRequest = {
  scopes: defaultScopes
};
