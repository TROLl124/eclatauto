import type { NextApiRequest, NextApiResponse } from 'next';

const BUSINESS_HOURS = {
  start: 8,  // 8 AM
  end: 18    // 6 PM
};

const UNAVAILABLE_DATES: string[] = [
  // Add dates that are completely unavailable (vacations, holidays, etc.)
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      return res.status(400).json({ message: 'Date is required' });
    }

    try {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if date is in the past
      if (selectedDate < today) {
        return res.status(400).json({ message: 'Date is in the past' });
      }

      // Check if date is unavailable
      if (UNAVAILABLE_DATES.includes(date)) {
        return res.status(200).json({ availableTimes: [] });
      }

      // Check day of week (Monday = 1, Sunday = 0)
      // Unavailable on Sundays (0)
      if (selectedDate.getDay() === 0) {
        return res.status(200).json({ availableTimes: [] });
      }

      // Generate available times (every hour)
      const availableTimes: string[] = [];
      
      for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
        // Skip lunch hours (12:00 - 13:00)
        if (hour === 12) continue;
        
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        availableTimes.push(timeStr);
      }

      return res.status(200).json({ availableTimes });
    } catch (error) {
      return res.status(500).json({ message: 'Error checking availability' });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
