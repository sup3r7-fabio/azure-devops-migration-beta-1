import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

type RequiredEnv = 'AZDO_PAT' | 'AZDO_ORG' | 'AAD_CLIENT_ID' | 'AAD_TENANT_ID';

interface Config {
  azdo: {
    pat: string;
    org: string;
    project?: string;
    baseUrl: string;
  };
  auth: {
    aadClientId: string;
    aadTenantId: string;
    issuer: string; // https://login.microsoftonline.com/<tenantId>/v2.0
    audiences: string[]; // accepted audiences (by default includes client id)
    jwksUri: string; // derived from tenant for quick reference
  };
  server: {
    port: number;
    logLevel: string;
    allowedOrigins: string[];
    nodeEnv: string;
  };
}

function getEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function assertRequired(vars: RequiredEnv[]): void {
  const missing = vars.filter(v => !getEnv(v));
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

assertRequired(['AZDO_PAT', 'AZDO_ORG', 'AAD_CLIENT_ID', 'AAD_TENANT_ID']);

const org = getEnv('AZDO_ORG')!; // validated
const project = getEnv('AZDO_PROJECT');
const aadClientId = getEnv('AAD_CLIENT_ID')!; // validated
const aadTenantId = getEnv('AAD_TENANT_ID')!; // validated

// Allow override issuer / audiences; compute sensible defaults
const explicitIssuer = getEnv('AAD_ISSUER');
const issuer = explicitIssuer || `https://login.microsoftonline.com/${aadTenantId}/v2.0`;

// Accept multiple audiences separated by comma; always include client id fallback
const configuredAudiences = (getEnv('AAD_ALLOWED_AUDIENCES') || '')
  .split(',')
  .map(a => a.trim())
  .filter(Boolean);
const audiences = Array.from(new Set([aadClientId, ...configuredAudiences]));

// JWKS URI pattern for Microsoft identity platform v2.0
// https://login.microsoftonline.com/{tenant}/discovery/v2.0/keys
const jwksUri = `https://login.microsoftonline.com/${aadTenantId}/discovery/v2.0/keys`;

// Azure DevOps REST API base
const baseUrl = `https://dev.azure.com/${org}`;

const config: Config = {
  azdo: {
    pat: getEnv('AZDO_PAT')!, // validated
    org,
    project,
    baseUrl
  },
  auth: {
    aadClientId,
    aadTenantId,
    issuer,
    audiences,
    jwksUri
  },
  server: {
    port: Number(getEnv('PORT') || 4000),
    logLevel: getEnv('LOG_LEVEL') || 'info',
    allowedOrigins: (getEnv('ALLOWED_ORIGINS') || '').split(',').map(o => o.trim()).filter(Boolean),
    nodeEnv: getEnv('NODE_ENV') || 'development'
  }
};

export default config;
