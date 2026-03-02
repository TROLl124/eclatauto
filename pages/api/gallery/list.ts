import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const galleryPath = path.join(process.cwd(), 'data', 'galleryData.json');
    const data = fs.readFileSync(galleryPath, 'utf-8');
    const galleryData = JSON.parse(data);
    return res.status(200).json(galleryData.images);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load gallery' });
  }
}
