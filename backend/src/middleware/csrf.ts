import { Request, Response, NextFunction } from 'express';

export function csrfCheck(req: Request, res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF check for login and register routes
  // Note: when mounted at /api, req.path is relative (e.g. /auth/login)
  // req.originalUrl keeps the full path for matching
  if (
    (req.originalUrl.includes('/auth/login') || req.originalUrl.includes('/auth/register')) &&
    req.method === 'POST'
  ) {
    return next();
  }

  const clientToken = req.headers['x-csrf-token'];
  const sessionToken = req.session?.csrfToken;

  if (!clientToken || !sessionToken || clientToken !== sessionToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
}
