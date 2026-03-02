import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

const calendarId = process.env.CALENDAR_ID || '';

async function insertEvent(data: {
  lavage: string;
  vehicule: string;
  datetime: string;
  nom: string;
  telephone: string;
  email: string;
}) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

  const calendar = google.calendar({ version: 'v3', auth });

  const eventStart = new Date(data.datetime).toISOString();
  const eventEnd = new Date(new Date(data.datetime).getTime() + 60 * 60 * 1000).toISOString();

  const event = {
    summary: `Réservation – ${data.lavage} / ${data.vehicule}`,
    description: `Nom: ${data.nom}\nTéléphone: ${data.telephone}\nCourriel: ${data.email}`,
    start: { dateTime: eventStart, timeZone: 'America/Toronto' },
    end: { dateTime: eventEnd, timeZone: 'America/Toronto' }
  };

  const res = await calendar.events.insert({
    calendarId,
    requestBody: event
  });

  return res.data;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { lavage, vehicule, datetime, nom, telephone, email } = req.body;

  try {
    await insertEvent({ lavage, vehicule, datetime, nom, telephone, email });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Google Calendar insert failed', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
}
