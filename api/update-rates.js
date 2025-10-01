import fs from 'fs/promises';
import path from 'path';

// This is the main function Vercel will run when this endpoint is called.
// We have removed the manual parseJsonBody helper and will rely on Vercel's built-in parser.
export default async function handler(req, res) {
    // We only accept POST requests for updating data.
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Vercel automatically parses the JSON body and makes it available here.
        const { rates } = req.body;

        if (!rates || Object.keys(rates).length === 0) {
            return res.status(400).json({ message: 'No rates data provided.' });
        }

        const dataToSave = {
            timestamp: new Date().toISOString(),
            rates: rates,
        };

        // In Vercel, /tmp is the only writable directory.
        const filePath = path.join('/tmp', 'rates.json');
        
        // Write the new data to the file, overwriting the old data.
        await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2));

        // Send a success response.
        return res.status(200).json({ message: 'Rates updated successfully.' });

    } catch (error) {
        // If req.body is not valid JSON, the error will be caught here.
        console.error('Error updating rates:', error);
        return res.status(500).json({ message: 'Failed to update rates. Please check server logs.' });
    }
}

