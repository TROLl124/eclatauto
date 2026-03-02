import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY || 'your-secret-key-change-this';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export interface AuthPayload {
  isAdmin: boolean;
  email: string;
  iat: number;
}

export const generateToken = (email: string): string => {
  return jwt.sign({ isAdmin: true, email }, SECRET_KEY, { expiresIn: '24h' });
};

export const verifyToken = (token: string): AuthPayload | null => {
  try {
    return jwt.verify(token, SECRET_KEY) as AuthPayload;
  } catch {
    return null;
  }
};

export const verifyAdminAuth = (req: NextApiRequest): boolean => {
  const token = req.cookies.adminToken;
  return token ? verifyToken(token) !== null : false;
};

export const getAdminToken = (email: string, password: string): string | null => {
  if (password === ADMIN_PASSWORD) {
    return generateToken(email);
  }
  return null;
};
