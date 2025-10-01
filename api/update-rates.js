// ULTIMATE DEBUGGING VERSION
// This code does NOT read the request body. It only checks the request method
// and immediately sends a response to test if the function can run at all.

export default async function handler(req, res) {
    // Set CORS headers to allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Vercel sends an OPTIONS request first for CORS preflight. We need to handle it.
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        try {
            // We do nothing with the request body here.
            // We just log that we received the request and send success.
            console.log("POST request received. Immediately sending success response.");
            
            return res.status(200).json({ message: 'ULTIMATE DEBUG SUCCESS: The API endpoint is running.' });

        } catch (error) {
            console.error('This should not happen:', error);
            return res.status(500).json({ message: 'An unexpected error occurred.' });
        }
    } else {
        // If it's not a POST or OPTIONS request, deny it.
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}

