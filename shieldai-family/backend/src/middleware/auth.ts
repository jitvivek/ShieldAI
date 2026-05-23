import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')),
  });
}

export interface AuthRequest extends Request {
  uid?: string;
  parentId?: string;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    req.parentId = decoded.uid;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
