import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';

interface PhotoData {
  name: string;
  data: string;
  type: string;
}

interface ReservationData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  service: string;
  date: string;
  time: string;
  notes: string;
  photos: string[];
  status: string;
  createdAt: string;
}

async function loadReservations(): Promise<ReservationData[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'reservations.json');
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveReservations(reservations: ReservationData[]): Promise<void> {
  const filePath = path.join(process.cwd(), 'data', 'reservations.json');
  await fs.writeFile(filePath, JSON.stringify(reservations, null, 2), 'utf-8');
}

async function savePhoto(photo: PhotoData, reservationId: string): Promise<string> {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Create uploads directory if it doesn't exist
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // Extract base64 data and determine file extension
    const base64Data = photo.data.split(',')[1] || photo.data;
    const ext = photo.type.split('/')[1] || 'jpg';
    const filename = `${reservationId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // Decode and save the file
    const buffer = Buffer.from(base64Data, 'base64');
    await fs.writeFile(filepath, new Uint8Array(buffer));

    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error saving photo:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        postalCode,
        service,
        date,
        time,
        notes,
        photos = []
      } = req.body as {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        postalCode: string;
        service: string;
        date: string;
        time: string;
        notes: string;
        photos?: PhotoData[];
      };

      // Validate required fields
      if (!firstName || !lastName || !email || !phone || !address || !service || !date || !time) {
        return res.status(400).json({ 
          message: 'Missing required fields' 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          message: 'Invalid email format' 
        });
      }

      // Validate phone format (basic validation)
      const phoneRegex = /^[\d\-\s\+\(\)]+$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        return res.status(400).json({ 
          message: 'Invalid phone format' 
        });
      }

      // Create reservation object with unique ID
      const reservationId = `res_${Date.now()}`;
      
      // Save photos if provided
      const photoUrls: string[] = [];
      if (Array.isArray(photos) && photos.length > 0) {
        for (const photo of photos) {
          try {
            const photoUrl = await savePhoto(photo, reservationId);
            photoUrls.push(photoUrl);
          } catch (photoError) {
            console.error('Error saving individual photo:', photoError);
            // Continue with other photos if one fails
          }
        }
      }

      const reservation: ReservationData = {
        id: reservationId,
        firstName,
        lastName,
        email,
        phone,
        address,
        city: city || '',
        postalCode: postalCode || '',
        service,
        date,
        time,
        notes: notes || '',
        photos: photoUrls,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Load existing reservations
      const reservations = await loadReservations();

      // Add new reservation
      reservations.push(reservation);

      // Save updated reservations
      await saveReservations(reservations);

      return res.status(201).json({
        message: 'Reservation created successfully',
        reservation,
      });
    } catch (error) {
      console.error('Error creating reservation:', error);
      return res.status(500).json({ 
        message: 'Error creating reservation' 
      });
    }
  } else if (req.method === 'GET') {
    // Get all reservations (optional - for admin)
    try {
      const reservations = await loadReservations();
      return res.status(200).json(reservations);
    } catch (error) {
      return res.status(500).json({ 
        message: 'Error fetching reservations' 
      });
    }
  }

  res.setHeader('Allow', ['POST', 'GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
