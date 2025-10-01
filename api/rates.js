import { Redis } from '@upstash/redis';

// Initialize the Redis client directly.
const redis = Redis.fromEnv();

export default async function handler(req, res) {
    // Set CORS headers to allow any website to fetch this data.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        console.log("Attempting to fetch 'current_rates' from Redis...");
        
        // Fetch the stored rates data. The Upstash SDK automatically parses it into an object.
        const data = await redis.get('current_rates');
        
        console.log("Raw data from Redis:", data);

        if (!data) {
            console.log("No data found in Redis for key 'current_rates'.");
            return res.status(404).json({ message: 'Rates not found. Please update them via the admin panel.' });
        }

        // FIX: We no longer need to parse the data, as the SDK does it for us.
        // const data = JSON.parse(dataString);
        
        console.log("Data is already an object. Sending to client.");

        // Send the final data object back to the client.
        return res.status(200).json(data);

    } catch (error) {
        console.error('Error in /api/rates:', error);
        return res.status(500).json({ message: 'Failed to fetch rates.' });
    }
}

