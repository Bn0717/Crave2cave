// /api/google-vision-scan.js

const { ImageAnnotatorClient } = require('@google-cloud/vision');
const { formidable } = require('formidable');
const fs = require('fs'); // IMPORTANT: We need the file system module for cleanup

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const client = new ImageAnnotatorClient();
  let tempFilePath = null; // To store the path for cleanup

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    
    const imageFile = files.file?.[0];
    if (!imageFile) {
      return res.status(400).json({ success: false, message: 'No file was uploaded.' });
    }

    // Store the path so we can delete it in the 'finally' block
    tempFilePath = imageFile.filepath;

    const [result] = await client.textDetection(tempFilePath);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return res.status(404).json({ success: false, message: 'Could not find any text in the image.' });
    }

    const fullText = detections[0].description;
    
    // --- PARSING LOGIC FOR RAW TEXT ---
    // This is now the most critical part. You will need to add more regex
    // patterns here to handle different receipt formats from your vendors.
    let orderNumber = null;
    let orderTotal = null;

    // Pattern 1: Look for "Order #" followed by numbers/letters
    let match = fullText.match(/Order #?([\w-]+)/i);
    if (match) orderNumber = match[1];

    // Pattern 2 (fallback): Look for "Order No"
    if (!orderNumber) {
      match = fullText.match(/Order No[:\s]+(\S+)/i);
      if (match) orderNumber = match[1];
    }
    
    // Pattern 3 (fallback): Look for "Receipt No"
    if (!orderNumber) {
        match = fullText.match(/Receipt No[:\s]+(\S+)/i);
        if (match) orderNumber = match[1];
    }


    // --- Finding the Total ---
    // Look for lines containing "Total" and a clear currency amount.
    // The `m` flag allows `^` to match the start of each line.
    match = fullText.match(/^(?=.*Total).*\b(\d+\.\d{2})\b/im);
    if (match) {
        orderTotal = match[1];
    } else {
        // Fallback: If no "Total" line found, grab the largest number
        // that looks like a price. This is less reliable.
        const priceMatches = fullText.match(/\d+\.\d{2}/g) || [];
        if (priceMatches.length > 0) {
            orderTotal = priceMatches.map(parseFloat).sort((a, b) => b - a)[0].toFixed(2);
        }
    }
    
    res.status(200).json({
      success: true,
      orderNumber,
      orderTotal,
    });

  } catch (error) {
    console.error('Error processing image with Google Vision:', error);
    res.status(500).json({ success: false, message: 'An error occurred on the server.' });
  } finally {
    // --- CRITICAL CLEANUP STEP ---
    // This block will run whether the try block succeeded or failed.
    // It ensures we always delete the temporary file from Vercel's server.
    if (tempFilePath) {
      fs.unlinkSync(tempFilePath);
      console.log(`Cleaned up temporary file: ${tempFilePath}`);
    }
  }
};