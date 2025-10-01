import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Set CORS headers to allow requests from any origin.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request for CORS.
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // Fetch the stored rates data from Vercel KV.
        const data = await kv.get('current_rates');

        if (!data) {
            return res.status(404).json({ message: 'Rates not found. Please update them via the admin panel.' });
        }

        // Send the data back to the client.
        return res.status(200).json(data);

    } catch (error) {
        console.error('Error fetching rates from KV:', error);
        return res.status(500).json({ message: 'Failed to fetch rates.' });
    }
}

