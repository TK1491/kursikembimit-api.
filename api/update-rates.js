import fs from 'fs/promises';
import path from 'path';

// Helper function to safely read and parse the raw request body.
// This removes reliance on Vercel's automatic parser, which seems to be causing issues.
function getJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('error', err => reject(err));
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString();
        // If the body is empty, resolve with an empty object
        if (!body) {
            resolve({});
            return;
        }
        resolve(JSON.parse(body));
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
        // Manually get and parse the JSON data from the request.
        const body = await getJsonBody(req);
        const { rates } = body;

        if (!rates || Object.keys(rates).length === 0) {
            return res.status(400).json({ message: 'No valid rates data found in the request.' });
        }

        const dataToSave = {
            timestamp: new Date().toISOString(),
            rates: rates,
        };

        const filePath = path.join('/tmp', 'rates.json');
        
        await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2));

        return res.status(200).json({ message: 'Rates updated successfully.' });

    } catch (error) {
        console.error('Error during rate update:', error);
        // Now, if the JSON is invalid, this catch block will execute correctly.
        if (error instanceof SyntaxError) {
            return res.status(400).json({ message: 'Invalid JSON format received from client.' });
        }
        return res.status(500).json({ message: 'An internal server error occurred.' });
    }
}

