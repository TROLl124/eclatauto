import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { verifyAdminAuth } from '../../../lib/auth';

interface Reservation {
  id: string;
  email: string;
  service: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed';
  notes?: string;
  invoice?: string;
  pictures?: string[];
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

  if (req.method === 'GET') {
    const reservations = loadReservations();
    return res.status(200).json(reservations);
  }

  if (req.method === 'POST') {
    const { email, service, date, notes } = req.body;

    if (!email || !service || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const reservations = loadReservations();
    const newReservation: Reservation = {
      id: Date.now().toString(),
      email,
      service,
      date,
      status: 'pending',
      notes,
    };

    reservations.push(newReservation);
    saveReservations(reservations);

    return res.status(201).json(newReservation);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
