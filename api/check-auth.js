// Helper function to safely read and parse the request body
function getJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const body = await getJsonBody(req);
        const { password } = body;
        
        // Retrieve the real password from Vercel Environment Variables
        const correctPassword = process.env.ADMIN_PASSWORD;

        if (password === correctPassword) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(401).json({ success: false });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
}
