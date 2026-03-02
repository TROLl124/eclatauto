import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { verifyAdminAuth } from '../../../../lib/auth';

interface Reservation {
  id: string;
  email: string;
  service: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed';
  notes?: string;
  invoice?: string;
  pictures?: string[];
  comments?: string;
  technician?: string;
}

const reservationsFile = path.join(process.cwd(), 'data', 'reservations.json');

const loadReservations = (): Reservation[] => {
  try {
    if (fs.existsSync(reservationsFile)) {
      const data = fs.readFileSync(reservationsFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading reservations:', error);
  }
  return [];
};

const saveReservations = (reservations: Reservation[]) => {
  const dir = path.dirname(reservationsFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(reservationsFile, JSON.stringify(reservations, null, 2));
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID required' });
  }

  if (req.method === 'PATCH') {
    const { status, invoice, pictures, comments, technician } = req.body;

    const reservations = loadReservations();
    const index = reservations.findIndex((r) => r.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (status) {
      reservations[index].status = status;
    }
    if (invoice !== undefined) {
      reservations[index].invoice = invoice;
    }
    if (pictures !== undefined) {
      reservations[index].pictures = pictures;
    }
    if (comments !== undefined) {
      reservations[index].comments = comments;
    }
    if (technician !== undefined) {
      reservations[index].technician = technician;
    }

    saveReservations(reservations);
    return res.status(200).json(reservations[index]);
  }

  if (req.method === 'DELETE') {
    const reservations = loadReservations();
    const filtered = reservations.filter((r) => r.id !== id);

    if (filtered.length === reservations.length) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    saveReservations(filtered);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
