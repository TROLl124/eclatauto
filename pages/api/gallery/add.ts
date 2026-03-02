import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { verifyAdminAuth } from '../../../lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { url, title, description } = req.body;

  if (!url || !title) {
    return res.status(400).json({ error: 'URL and title required' });
  }

  try {
    const galleryPath = path.join(process.cwd(), 'data', 'galleryData.json');
    const data = fs.readFileSync(galleryPath, 'utf-8');
    const galleryData = JSON.parse(data);

    const newImage = {
      id: Math.max(...galleryData.images.map((img: any) => img.id)) + 1,
      url,
      title,
      description: description || '',
    };

    galleryData.images.push(newImage);
    fs.writeFileSync(galleryPath, JSON.stringify(galleryData, null, 2));

    return res.status(201).json(newImage);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add image' });
  }
}
