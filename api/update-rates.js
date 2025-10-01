import { kv } from '@vercel/kv';

// A robust helper function to manually read the raw data from the request,
// parse it as JSON, and handle any errors. This removes all reliance
// on Vercel's automatic body-parser which seems to be the source of the issue.
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
      // If the body is empty after all chunks are received, it's a bad request.
      if (!body) {
        return reject(new Error('Request body is empty.'));
      }
      try {
        // Try to parse the fully received body as JSON.
        resolve(JSON.parse(body));
      } catch (error) {
        // If parsing fails, it's an invalid JSON format.
        reject(new Error('Invalid JSON format.'));
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
        // We now explicitly call our robust helper function.
        const body = await getJsonBody(req);
        const { rates } = body;

        if (!rates || Object.keys(rates).length === 0) {
            return res.status(400).json({ message: 'No valid rates data found in the request.' });
        }

        const dataToSave = {
            timestamp: new Date().toISOString(),
            rates: rates,
        };
        
        // Save the clean data to the Vercel KV store.
        await kv.set('current_rates', JSON.stringify(dataToSave));

        // Send a success response.
        return res.status(200).json({ message: 'Rates updated successfully in Vercel KV.' });

    } catch (error) {
        // This catch block will now receive clear, specific errors from our helper function.
        console.error('Error during rate update:', error.message);
        return res.status(400).json({ message: error.message || 'An internal server error occurred.' });
    }
}

