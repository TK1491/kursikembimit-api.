import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // We only accept POST requests for updating data.
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Vercel's built-in parser will work because the client is now sending the correct 'Content-Type' header.
        const { rates } = req.body;

        if (!rates || Object.keys(rates).length === 0) {
            return res.status(400).json({ message: 'No valid rates data found in the request body.' });
        }

        const dataToSave = {
            timestamp: new Date().toISOString(),
            rates: rates,
        };
        
        // Save the clean data to the Vercel KV store using the key 'current_rates'.
        await kv.set('current_rates', JSON.stringify(dataToSave));

        // Send a success response.
        return res.status(200).json({ message: 'Rates updated successfully in Vercel KV.' });

    } catch (error) {
        // This block will catch any errors, including if req.body is not valid JSON.
        console.error('Error during rate update:', error);
        return res.status(500).json({ message: 'An internal server error occurred.' });
    }
}

