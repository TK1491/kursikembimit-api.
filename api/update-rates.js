import { kv } from '@vercel/kv';

// Helper function to safely read and parse the raw request body.
function getJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('error', err => reject(err));
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString();
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const body = await getJsonBody(req);
        const { rates } = body;

        if (!rates || Object.keys(rates).length === 0) {
            return res.status(400).json({ message: 'No valid rates data found.' });
        }

        const dataToSave = {
            timestamp: new Date().toISOString(),
            rates: rates,
        };

        // Save the data to Vercel's KV store instead of a file.
        // We use a key, 'current_rates', to store and retrieve the data.
        await kv.set('current_rates', JSON.stringify(dataToSave));

        return res.status(200).json({ message: 'Rates updated successfully in Vercel KV.' });

    } catch (error) {
        console.error('Error during rate update:', error);
        return res.status(500).json({ message: 'An internal server error occurred.' });
    }
}

