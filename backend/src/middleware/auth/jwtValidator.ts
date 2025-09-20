import { NextFunction, Request, Response } from 'express';
import config from '../../config/env';

// Lazy loaded JOSE helpers to avoid ESM/CJS interop issues with 'type': 'commonjs'
let jwksInitialized = false;
let JWKS: ReturnType<any>;
async function ensureJwks() {
  if (!jwksInitialized) {
    const { createRemoteJWKSet } = await import('jose');
    JWKS = createRemoteJWKSet(new URL(config.auth.jwksUri));
    jwksInitialized = true;
  }
}

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    oid?: string;
    name?: string;
    preferred_username?: string;
    roles?: string[];
    groups?: string[];
    [key: string]: any; // additional claims
  };
}

function extractToken(req: Request): string | undefined {
  const auth = req.headers['authorization'];
  if (!auth) return undefined;
  const [scheme, value] = auth.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !value) return undefined;
  return value.trim();
}

export async function jwtValidator(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  try {
    const { issuer, audiences } = config.auth;
    await ensureJwks();
    const { jwtVerify } = await import('jose');
    const verification = await jwtVerify(token, JWKS, { issuer, audience: audiences });

  const claims = verification.payload as any;

    // Basic additional defense-in-depth checks
    if (!claims.sub) {
      return res.status(401).json({ error: 'Invalid token: missing sub claim' });
    }

    req.user = {
      sub: claims.sub,
      oid: claims.oid,
      name: claims.name || claims['name'],
      preferred_username: claims.preferred_username || claims['preferred_username'],
      roles: (claims.roles || claims['roles']) as string[] | undefined,
      groups: (claims.groups || claims['groups']) as string[] | undefined,
      ...claims
    };

    return next();
  } catch (err: any) {
    const message = err?.message || 'Token validation failed';
    return res.status(401).json({ error: 'Unauthorized', detail: message });
  }
}

// Optional role guard for future use
export function requireRole(role: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const roles = req.user?.roles;
    if (!roles || !roles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden', requiredRole: role });
    }
    next();
  };
}
