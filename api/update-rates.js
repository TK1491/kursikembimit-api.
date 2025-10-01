// This is a temporary debugging file.
// We have removed all database logic to isolate the problem.

function getJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        if (!body) return resolve({});
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON format.'));
      }
    });
  });
}

export default async function handler(req, res) {
    console.log("Update-rates function started."); // First log

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const body = await getJsonBody(req);
        console.log("Received data:", JSON.stringify(body, null, 2)); // Log the received data

        // We are NOT saving to the database in this version.
        // We are just pretending it worked.

        console.log("Skipping database save. Sending success response."); // Final log before sending

        // Immediately send a success response.
        return res.status(200).json({ message: 'DEBUG SUCCESS: The API received your data correctly.' });

    } catch (error) {
        console.error('CRITICAL ERROR:', error.message);
        return res.status(400).json({ message: error.message });
    }
}

