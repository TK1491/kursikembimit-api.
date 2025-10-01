import fs from 'fs/promises';
import path from 'path';

// Helper function to parse the JSON body from the request
async function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', (err) => {
            reject(err);
        });
    });
}


// This is the main function Vercel will run when this endpoint is called.
export default async function handler(req, res) {
    // We only accept POST requests for updating data.
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Manually parse the JSON data from the request body
        const body = await parseJsonBody(req);
        const { rates } = body;

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
        console.error('Error updating rates:', error);
        return res.status(500).json({ message: 'Failed to update rates.' });
    }
}

