import { PublicClientApplication, AccountInfo, InteractionRequiredAuthError } from '@azure/msal-browser';
import { msalConfig, silentRequest } from './msalConfig';

const pca = new PublicClientApplication(msalConfig);

async function getAccount(): Promise<AccountInfo | undefined> {
  const accounts = pca.getAllAccounts();
  return accounts[0];
}

async function acquireToken() {
  const account = await getAccount();
  if (!account) throw new Error('No signed-in account');
  try {
    const result = await pca.acquireTokenSilent({ ...silentRequest, account });
    return result.accessToken;
  } catch (err) {
    if (err instanceof InteractionRequiredAuthError) {
      const result = await pca.acquireTokenPopup({ ...silentRequest, account });
      return result.accessToken;
    }
    throw err;
  }
}

export async function authorizedFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = await acquireToken();
  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  return fetch(input, { ...init, headers });
}
