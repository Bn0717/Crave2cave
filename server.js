// server.js - FINAL HYBRID-PARSING VERSION (WITH CORRECT TEXT RECONSTRUCTION)

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const port = 3001;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Your Nanonets Credentials
const NANONETS_API_KEY = "9548d0f9-501f-11f0-8702-2a35bf3217c7";
const NANONETS_MODEL_ID = "4db52121-ad52-4675-9c9b-99b1a1e00311";

app.post('/api/scan', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded." });
    }
    if (NANONETS_API_KEY === "PASTE_YOUR_API_KEY_HERE" || !NANONETS_MODEL_ID) {
        return res.status(500).json({ success: false, message: "Server is not configured. Missing Nanonets credentials." });
    }

    try {
        const formData = new FormData();
        formData.append('file', req.file.buffer, { filename: req.file.originalname });

        const url = `https://app.nanonets.com/api/v2/OCR/Model/${NANONETS_MODEL_ID}/LabelFile/`;

        console.log("Sending image to Nanonets API...");

        const response = await axios.post(url, formData, {
            headers: { ...formData.getHeaders() },
            auth: { username: NANONETS_API_KEY, password: '' },
            timeout: 60000
        });
        
        console.log("--- Full Nanonets Response ---");
        console.log(JSON.stringify(response.data, null, 2));
        console.log("--- End of Full Response ---");

        const result = response.data.result[0];
        if (!result) {
            return res.status(500).json({ success: false, message: "OCR failed to return a valid result." });
        }

        const prediction = result.prediction;
        
        // --- HYBRID DATA EXTRACTION ---
        let orderTotal = "0.00";
        let orderNumber = "";

        // 1. Get Order Total from structured data (Reliable)
        const totalField = prediction.find(field => field.label === 'Total_Amount');
        if (totalField) {
            orderTotal = String(totalField.ocr_text);
        }

        // 2. Get Order Number by parsing raw text (More Accurate for this field)
        let rawText = result.page_data?.[0]?.raw_text;
        
        // --- THIS IS THE CORRECTED RECONSTRUCTION LOGIC ---
        if (!rawText) {
            // If raw_text isn't provided, build it from the prediction pieces WITH THEIR LABELS
            rawText = prediction.map(p => `${p.label}: ${p.ocr_text}`).join('\n');
            console.log("--- Reconstructed Raw Text for Parsing ---");
            console.log(rawText);
        }
        
        orderNumber = findOrderNumberInRawText(rawText);

        // --- NEW FALLBACK: If regex fails, use the misidentified Receipt_Number ---
        if (!orderNumber) {
            const receiptNumberField = prediction.find(p => p.label === 'Receipt_Number');
            if (receiptNumberField) {
                console.log("Fallback: Using Receipt_Number field from Nanonets.");
                orderNumber = receiptNumberField.ocr_text;
            }
        }

        console.log(`\n=== FINAL PARSED RESULTS ===`);
        console.log(`Order Number: "${orderNumber}"`);
        console.log(`Order Total: "${orderTotal}"`);
        console.log(`============================\n`);

        res.json({
            success: true,
            orderTotal: orderTotal || "",
            orderNumber: orderNumber || ""
        });

    } catch (error) {
        console.error("Error calling Nanonets:", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: "An error occurred while processing the receipt." });
    }
});


// Helper function to find the order number from raw text
function findOrderNumberInRawText(rawText) {
    if (!rawText) return "";
    
    // This regex looks for "ORDER NUMBER" or "RECEIPT_NUMBER" and captures what follows.
    const regex = /(?:ORDER NUMBER|RECEIPT_NUMBER):[\s\r\n]*([^\r\n]+)/i;
    const match = rawText.match(regex);
    
    if (match && match[1]) {
        let potentialNumber = match[1].trim();
        potentialNumber = potentialNumber.split(' ')[0]; 
        return potentialNumber.replace(/[^a-zA-Z0-9-]/g, '').trim();
    }
    return "";
}


app.listen(port, () => {
    console.log(`Proxy server for OCR is listening at http://localhost:3001`);
});