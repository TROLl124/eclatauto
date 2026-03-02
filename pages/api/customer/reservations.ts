import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

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
  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email required' });
  }

  if (req.method === 'GET') {
    const reservations = loadReservations();
    const customerReservations = reservations.filter((r) => r.email === email);
    return res.status(200).json(customerReservations);
  }

  if (req.method === 'POST') {
    const { service, date, notes } = req.body;

    if (!service || !date) {
      return res.status(400).json({ error: 'Service and date required' });
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
