import { NextApiRequest, NextApiResponse } from 'next';
// Supabase client import removed - using Firebase instead
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp 
} from 'firebase/firestore';
import { getAuth, verifyIdToken } from 'firebase-admin/auth';
import { rateLimit } from '../utils/rateLimit';
import { verifyToken } from '../utils/jwt';
import { userService } from '../services/userService';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    role: string;
    permissions: string[];
  };
}

export const withAuth = (
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>,
  options: {
    requiredRole?: string;
    requiredPermissions?: string[];
    rateLimit?: {
      windowMs?: number;
      max?: number;
    };
  } = {}
) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // Apply rate limiting
      if (options.rateLimit) {
        const limiter = rateLimit({
          windowMs: options.rateLimit.windowMs || 15 * 60 * 1000, // 15 minutes
          max: options.rateLimit.max || 100
        });
        await limiter(req, res);
      }

      // Check for authentication token
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing authentication token' });
      }

      const token = authHeader.split(' ')[1];
      
      try {
        // Verify Firebase ID token
        const decodedToken = await getAuth().verifyIdToken(token);
        const uid = decodedToken.uid;
        
        // Check if session is valid in Firestore
        const sessionsCollection = collection(db, 'user_sessions');
        const sessionQuery = query(
          sessionsCollection,
          where('user_id', '==', uid),
          where('revoked', '==', false)
        );
        
        const sessionSnapshot = await getDocs(sessionQuery);
        
        if (sessionSnapshot.empty) {
          return res.status(401).json({ error: 'No valid session found' });
        }
        
        // Check if any session is still valid
        const now = new Date();
        const validSession = sessionSnapshot.docs.find(doc => {
          const session = doc.data();
          return new Date(session.expires_at) > now;
        });
        
        if (!validSession) {
          return res.status(401).json({ error: 'Session expired' });
        }

        // Get user details and permissions
        const user = await userService.getUserWithProfile(uid);
        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }

        // Check user status
        if (user.status !== 'ACTIVE') {
          return res.status(403).json({ error: 'Account is not active' });
        }

        // Check required role
        if (options.requiredRole && user.role !== options.requiredRole) {
          return res.status(403).json({ error: 'Insufficient role permissions' });
        }

        // Get and check required permissions
        const permissions = await userService.getUserPermissions(user.id);
        if (options.requiredPermissions) {
          const hasPermissions = options.requiredPermissions.every(
            permission => permissions.includes(permission)
          );
          if (!hasPermissions) {
            return res.status(403).json({ error: 'Insufficient permissions' });
          }
        }

        // Attach user to request
        req.user = {
          id: user.id,
          role: user.role,
          permissions
        };

        // Log activity
        await userService.logActivity(user.id, {
          action: 'api_access',
          entity_type: 'endpoint',
          entity_id: req.url,
          metadata: {
            method: req.method,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            user_agent: req.headers['user-agent']
          }
        });

        // Call the handler
        return handler(req, res);
      } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ error: 'Invalid token' });
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}; 