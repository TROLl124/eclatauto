import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { verifyAdminAuth } from '../../../lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID required' });
  }

  try {
    const galleryPath = path.join(process.cwd(), 'data', 'galleryData.json');
    const data = fs.readFileSync(galleryPath, 'utf-8');
    const galleryData = JSON.parse(data);

    galleryData.images = galleryData.images.filter((img: any) => img.id !== id);
    fs.writeFileSync(galleryPath, JSON.stringify(galleryData, null, 2));

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete image' });
  }
}
