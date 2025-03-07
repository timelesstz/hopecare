// Supabase import removed - using Firebase instead;
import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export const SESSION_DURATION = 3600; // 1 hour in seconds
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION = 900; // 15 minutes in seconds

interface SecurityState {
  loginAttempts: { [key: string]: number };
  lockoutTimestamp: { [key: string]: number };
}

class SecurityManager {
  private static instance: SecurityManager;
  private state: SecurityState = {
    loginAttempts: {},
    lockoutTimestamp: {},
  };

  private constructor() {}

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  public checkLoginAttempts(email: string): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    const lockoutTime = this.state.lockoutTimestamp[email] || 0;

    if (currentTime - lockoutTime < LOCKOUT_DURATION) {
      throw new Error('Account temporarily locked. Please try again later.');
    }

    const attempts = this.state.loginAttempts[email] || 0;
    return attempts < MAX_LOGIN_ATTEMPTS;
  }

  public recordLoginAttempt(email: string, success: boolean): void {
    if (success) {
      delete this.state.loginAttempts[email];
      delete this.state.lockoutTimestamp[email];
      return;
    }

    const attempts = (this.state.loginAttempts[email] || 0) + 1;
    this.state.loginAttempts[email] = attempts;

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      this.state.lockoutTimestamp[email] = Math.floor(Date.now() / 1000);
    }
  }

  public validateSession(session: Session | null): boolean {
    if (!session) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    const expiryTime = new Date(session.expires_at!).getTime() / 1000;

    return currentTime < expiryTime;
  }

  public clearLoginAttempts(email: string): void {
    delete this.state.loginAttempts[email];
    delete this.state.lockoutTimestamp[email];
  }
}

export const securityManager = SecurityManager.getInstance();

export const securityHeaders = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    );
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );

    // CSRF Protection
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const csrfToken = req.headers['x-csrf-token'];
      const storedToken = req.cookies['csrf-token'];

      if (!csrfToken || !storedToken || csrfToken !== storedToken) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
      }
    }

    // Generate new CSRF token for GET requests
    if (req.method === 'GET') {
      const newToken = crypto.randomBytes(32).toString('hex');
      res.setHeader('Set-Cookie', `csrf-token=${newToken}; Path=/; HttpOnly; Secure; SameSite=Strict`);
      res.setHeader('X-CSRF-Token', newToken);
    }

    // Input validation for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers['content-type'];
      if (!contentType?.includes('application/json')) {
        return res.status(415).json({ error: 'Unsupported Media Type' });
      }

      try {
        // Basic input sanitization
        const sanitizedBody = sanitizeInput(req.body);
        req.body = sanitizedBody;
      } catch (error) {
        return res.status(400).json({ error: 'Invalid input' });
      }
    }

    return handler(req, res);
  };
};

const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    // Remove potential XSS vectors
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
};

// Virus scanning for file uploads
export const scanFile = async (buffer: Buffer): Promise<boolean> => {
  try {
    // Implement virus scanning logic here
    // This is a placeholder - you should integrate with a proper antivirus service
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
    
    // Example integration with ClamAV or similar service
    // const scanner = new NodeClam();
    // const {isInfected, viruses} = await scanner.scanBuffer(buffer);
    // return !isInfected;
    
    return true;
  } catch (error) {
    console.error('File scanning error:', error);
    return false;
  }
};
