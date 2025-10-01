import { Redis } from '@upstash/redis';

// Initialize the Redis client directly.
// It will automatically find the connection keys from your Vercel project settings.
const redis = Redis.fromEnv();

export default async function handler(req, res) {
    // Set CORS headers to allow any website to fetch this data.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle the browser's preflight OPTIONS request.
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // Fetch the stored rates data directly from Upstash Redis.
        // The data is stored as a string.
        const dataString = await redis.get('current_rates');

        if (!dataString) {
            // If no data has been saved yet, return a helpful error.
            return res.status(404).json({ message: 'Rates not found. Please update them via the admin panel.' });
        }

        // Parse the JSON string back into a JavaScript object before sending.
        const data = JSON.parse(dataString);

        // Send the final data object back to the client.
        return res.status(200).json(data);

    } catch (error) {
        console.error('Error fetching rates from Redis:', error);
        return res.status(500).json({ message: 'Failed to fetch rates.' });
    }
}

