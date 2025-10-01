const { createWorker } = require('tesseract.js');
const busboy = require('busboy');
const fs = require('fs').promises;
const path = require('path');

// The same path as our other file, pointing to the temporary storage
const dataPath = path.join('/tmp', 'rates.json');

// This function parses the image file from the request
const parseMultipartForm = (req) => new Promise((resolve, reject) => {
    const bb = busboy({ headers: req.headers });
    let fileBuffer;

    bb.on('file', (fieldname, file) => {
        const chunks = [];
        file.on('data', (chunk) => chunks.push(chunk));
        file.on('end', () => {
            fileBuffer = Buffer.concat(chunks);
        });
    });

    bb.on('close', () => {
        if (fileBuffer) {
            resolve(fileBuffer);
        } else {
            reject(new Error('No file uploaded.'));
        }
    });
    
    bb.on('error', err => reject(err));

    req.pipe(bb);
});

// Main function for the /api/update-rates endpoint
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        const imageBuffer = await parseMultipartForm(req);
        
        console.log('Image received, starting OCR process...');
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(imageBuffer);
        await worker.terminate();
        console.log('OCR Result:', text);

        // --- PARSING LOGIC ---
        // This is where you'll need to be clever. This is a simple example.
        // It looks for lines containing currency codes and extracts numbers.
        const lines = text.split('\n');
        const quotes = {};
        const currencies = ['USD', 'EUR', 'CHF', 'GBP', 'CAD', 'JPY']; // Add all you need

        lines.forEach(line => {
            for (const currency of currencies) {
                if (line.includes(currency)) {
                    // Find numbers in the line (this is a simple regex)
                    const numbers = line.match(/\d+\.\d+|\d+/g);
                    if (numbers && numbers.length >= 2) {
                        // Assuming the first number is BUY and second is SELL
                        // We will store the average as the mid-market rate for now.
                        const midMarketRate = (parseFloat(numbers[0]) + parseFloat(numbers[1])) / 2;
                        // For our API structure, we need USD-based rates.
                        // THIS PART IS A SIMPLIFICATION. A real implementation would be more complex.
                        // Let's assume the photo gives us ALL per 1 unit of foreign currency.
                        // We will need to convert this to a USD base.
                        // For now, let's just save the ALL-based rates for simplicity.
                        quotes[currency] = midMarketRate;
                    }
                    break; 
                }
            }
        });
        
        // We will create a simplified JSON structure for now
        const outputData = {
            success: true,
            timestamp: Math.floor(Date.now() / 1000),
            source: 'PHOTO_UPLOAD',
            quotes: quotes
        };

        // Save the new data to the file, overwriting the old one.
        await fs.writeFile(dataPath, JSON.stringify(outputData, null, 2));
        console.log('Successfully wrote new rates to rates.json');

        res.status(200).json({ success: true, message: 'Rates updated successfully!', extractedData: outputData });

    } catch (error) {
        console.error('Error updating rates:', error);
        res.status(500).json({ success: false, message: `Internal Server Error: ${error.message}` });
    }
};
