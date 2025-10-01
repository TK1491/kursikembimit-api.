import { Redis } from '@upstash/redis';

// Initialize the Redis client directly.
// It will automatically find the connection keys from your Vercel project settings.
const redis = Redis.fromEnv();

// Helper function to safely read and parse the raw request body.
function getJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('error', err => {
      reject(err);
    });
    req.on('end', () => {
      if (!body) return reject(new Error('Request body is empty.'));
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON format.'));
      }
    });
  });
}

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const body = await getJsonBody(req);
        const { rates } = body;

        if (!rates || Object.keys(rates).length === 0) {
            return res.status(400).json({ message: 'No valid rates data in request.' });
        }

        const dataToSave = {
            timestamp: new Date().toISOString(),
            rates: rates,
        };
        
        // Save the data to Upstash Redis using the direct SDK.
        await redis.set('current_rates', JSON.stringify(dataToSave));

        return res.status(200).json({ message: 'Rates updated successfully!' });

    } catch (error) {
        console.error('Error during rate update:', error.message);
        return res.status(400).json({ message: error.message || 'An internal server error occurred.' });
    }
}

