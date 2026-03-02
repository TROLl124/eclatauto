import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Customer {
  email: string;
  password: string;
}

const customersFile = path.join(process.cwd(), 'data', 'customers.json');

const loadCustomers = (): Customer[] => {
  try {
    if (fs.existsSync(customersFile)) {
      const data = fs.readFileSync(customersFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading customers:', error);
  }
  return [];
};

const saveCustomers = (customers: Customer[]) => {
  const dir = path.dirname(customersFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(customersFile, JSON.stringify(customers, null, 2));
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const customers = loadCustomers();
  const customer = customers.find((c) => c.email === email && c.password === password);

  if (!customer) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // On success, just return the email (client stores it in localStorage)
  return res.status(200).json({ success: true, email });
}
