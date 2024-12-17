import { Session } from '@supabase/supabase-js';

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
