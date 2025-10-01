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
        
        // Fetch the stored rates data directly from Upstash Redis.
        const dataString = await redis.get('current_rates');
        
        // --- ADDED FOR DEBUGGING ---
        // Log the raw data we received from the database to Vercel's logs.
        console.log("Raw dataString from Redis:", dataString);

        if (!dataString) {
            console.log("No data found in Redis for key 'current_rates'.");
            return res.status(404).json({ message: 'Rates not found. Please update them via the admin panel.' });
        }

        // Parse the JSON string back into a JavaScript object before sending.
        const data = JSON.parse(dataString);
        
        console.log("Successfully parsed data. Sending to client.");

        // Send the final data object back to the client.
        return res.status(200).json(data);

    } catch (error) {
        // --- ADDED FOR DEBUGGING ---
        // Log the specific error to Vercel's logs for better insight.
        console.error('Error in /api/rates:', error);
        return res.status(500).json({ message: 'Failed to fetch rates.' });
    }
}

