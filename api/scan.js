// /api/scan.js

import axios from 'axios';
import { Formidable } from 'formidable';
import fs from 'fs';

// Your Nanonets Credentials (Moved to Environment Variables!)
const NANONETS_API_KEY = process.env.NANONETS_API_KEY;
const NANONETS_MODEL_ID = process.env.NANONETS_MODEL_ID;

// Disable Vercel's default body parser for this route
export const config = {
    api: {
        bodyParser: false,
    },
};

// Helper function (same as yours)
function findOrderNumberInRawText(rawText) {
    if (!rawText) return "";
    const regex = /(?:ORDER NUMBER|RECEIPT_NUMBER):[\s\r\n]*([^\r\n]+)/i;
    const match = rawText.match(regex);
    if (match && match[1]) {
        let potentialNumber = match[1].trim().split(' ')[0];
        return potentialNumber.replace(/[^a-zA-Z0-9-]/g, '').trim();
    }
    return "";
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    if (!NANONETS_API_KEY || !NANONETS_MODEL_ID) {
        console.error("Server is not configured. Missing Nanonets credentials.");
        return res.status(500).json({ success: false, message: "Server is not configured." });
    }

    const form = new Formidable();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error("Error parsing form data:", err);
            return res.status(500).json({ success: false, message: "Error processing uploaded file." });
        }

        const file = files.file?.[0]; // formidable v3 puts it in an array
        if (!file) {
            return res.status(400).json({ success: false, message: "No file uploaded." });
        }

        try {
            // Nanonets expects a buffer or stream. We read the temp file.
            const fileBuffer = fs.readFileSync(file.filepath);

            const formData = new FormData();
            formData.append('file', fileBuffer, { filename: file.originalFilename });

            const url = `https://app.nanonets.com/api/v2/OCR/Model/${NANONETS_MODEL_ID}/LabelFile/`;
            console.log("Sending image to Nanonets API...");

            const response = await axios.post(url, formData, {
                headers: {
                    // NOTE: axios with FormData sets the correct headers automatically
                },
                auth: { username: NANONETS_API_KEY, password: '' },
                timeout: 60000,
            });

            console.log("--- Full Nanonets Response ---");
            console.log(JSON.stringify(response.data, null, 2));

            const result = response.data.result[0];
            if (!result) {
                return res.status(500).json({ success: false, message: "OCR failed to return a valid result." });
            }

            const prediction = result.prediction;
            let orderTotal = "0.00";
            let orderNumber = "";

            const totalField = prediction.find(field => field.label === 'Total_Amount');
            if (totalField) {
                orderTotal = String(totalField.ocr_text);
            }

            let rawText = result.page_data?.[0]?.raw_text;
            if (!rawText) {
                rawText = prediction.map(p => `${p.label}: ${p.ocr_text}`).join('\n');
            }

            orderNumber = findOrderNumberInRawText(rawText);
            if (!orderNumber) {
                const receiptNumberField = prediction.find(p => p.label === 'Receipt_Number');
                if (receiptNumberField) {
                    orderNumber = receiptNumberField.ocr_text;
                }
            }

            console.log(`\n=== FINAL PARSED RESULTS ===`);
            console.log(`Order Number: "${orderNumber}"`);
            console.log(`Order Total: "${orderTotal}"`);
            console.log(`============================\n`);

            res.status(200).json({
                success: true,
                orderTotal: orderTotal || "",
                orderNumber: orderNumber || ""
            });

        } catch (error) {
            console.error("Error calling Nanonets:", error.response ? JSON.stringify(error.response.data) : error.message);
            res.status(500).json({ success: false, message: "An error occurred while processing the receipt." });
        } finally {
            // Clean up the temporary file
            fs.unlinkSync(file.filepath);
        }
    });
}