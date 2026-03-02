import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';

interface Settings {
  promotion: {
    name: string;
    active: boolean;
    description: string;
  };
  formulas: Array<{
    id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
    featured: boolean;
    order: number;
  }>;
  businessHours: {
    start: number;
    end: number;
    lunchStart: number;
    lunchEnd: number;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
  };
}

async function loadSettings(): Promise<Settings> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'settings.json');
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error('Failed to load settings');
  }
}

async function saveSettings(settings: Settings): Promise<void> {
  const filePath = path.join(process.cwd(), 'data', 'settings.json');
  await fs.writeFile(filePath, JSON.stringify(settings, null, 2), 'utf-8');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const settings = await loadSettings();
      return res.status(200).json(settings);
    } catch (error) {
      return res.status(500).json({ message: 'Error loading settings' });
    }
  } else if (req.method === 'PUT') {
    try {
      const settings = req.body as Settings;

      // Validate required fields
      if (!settings.promotion || !settings.formulas || !Array.isArray(settings.formulas)) {
        return res.status(400).json({ message: 'Invalid settings structure' });
      }

      // Sort formulas by order
      settings.formulas.sort((a, b) => a.order - b.order);

      await saveSettings(settings);
      return res.status(200).json({
        message: 'Settings updated successfully',
        settings
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating settings' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
