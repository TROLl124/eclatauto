import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import { verifyAdminAuth } from '../../../lib/auth';

// Augmenter la limite à 50 MB pour les uploads d'images
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

interface FileData {
  name: string;
  data: string; // base64 data URL
  type: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { files } = req.body as { files: FileData[] };

  if (!files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'No files provided' });
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'admin');
  await fs.mkdir(uploadsDir, { recursive: true });

  const urls: string[] = [];

  for (const file of files) {
    const base64Data = file.data.split(',')[1] || file.data;
    const ext = file.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const filename = `admin_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const filepath = path.join(uploadsDir, filename);
    const buffer = Buffer.from(base64Data, 'base64');
    await fs.writeFile(filepath, new Uint8Array(buffer));
    urls.push(`/uploads/admin/${filename}`);
  }

  return res.status(200).json({ urls });
}
