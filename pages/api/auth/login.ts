import type { NextApiRequest, NextApiResponse } from 'next';
import { getAdminToken } from '../../../lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const token = getAdminToken(email, password);

  if (!token) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.setHeader('Set-Cookie', `adminToken=${token}; Path=/; HttpOnly; Max-Age=86400`);
  return res.status(200).json({ success: true, message: 'Logged in successfully' });
}
