// This tells Node.js we need tools for handling files and paths.
const fs = require('fs').promises;
const path = require('path');

// This is where we will store our data. Vercel provides a temporary '/tmp' folder we can use.
const dataPath = path.join('/tmp', 'rates.json');

// This is the main function that Vercel will run when someone visits .../api/rates
module.exports = async (req, res) => {
    try {
        // These headers are important! They tell browsers that it's okay for your
        // frontend website (on a different domain) to request data from this API.
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        // Read the contents of the rates.json file.
        const data = await fs.readFile(dataPath, 'utf8');
        const rates = JSON.parse(data); // Turn the text into a real JavaScript object.

        // Send the data back as a JSON response.
        res.status(200).json(rates);

    } catch (error) {
        // If the file doesn't exist yet (e.g., first time running), we send back some default data
        // so the frontend doesn't crash.
        if (error.code === 'ENOENT') {
            return res.status(200).json({
                success: true,
                message: "No rates uploaded yet. Serving default data.",
                quotes: { "USDALL": 93.50 }
            });
        }
        // If any other error happens, we send a server error message.
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};