  const {onCall, HttpsError} = require('firebase-functions/v2/https');
  const {setGlobalOptions} = require('firebase-functions/v2');
  const admin = require('firebase-admin');
  const nodemailer = require('nodemailer');
  const {onSchedule} = require('firebase-functions/v2/scheduler');
const {getStorage} = require('firebase-admin/storage');

  // Set global options for all functions
  setGlobalOptions({
    region: 'us-central1', // or your preferred region
    maxInstances: 10,
  });

  // Initialize Firebase Admin
  if (!admin.apps.length) {
    admin.initializeApp();
  }

  // Create transporter function to avoid connection issues
  const createTransporter = () => {
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    
    if (!gmailUser || !gmailAppPassword) {
      throw new Error('Gmail credentials not configured in environment variables');
    }

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword
      },
      pool: true, // Use connection pooling
      maxConnections: 1,
      rateDelta: 20000,
      rateLimit: 5
    });
  };

  exports.sendDeliveryEmail = onCall({
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
    maxInstances: 10
  }, async (request) => {
    try {
      console.log('=== Email Function Called ===');
      console.log('Request data:', JSON.stringify(request.data, null, 2));
      
      // Extract parameters from request data with flexible field names
      const data = request.data || {};
      const userId = data.userId;
      const userEmail = data.userEmail || data.email; // Support both field names
      const orderNumber = data.orderNumber;
      const orderTotal = data.orderTotal;
      const studentName = data.studentName;

      console.log('Extracted parameters:', {
        userId: userId || 'MISSING',
        userEmail: userEmail || 'MISSING', 
        orderNumber: orderNumber || 'MISSING',
        orderTotal: orderTotal || 'MISSING',
        studentName: studentName || 'MISSING'
      });

      // Validate required parameters
      const requiredFields = { userId, userEmail, orderNumber, studentName };
      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        const errorMsg = `Missing required parameters: ${missingFields.join(', ')}`;
        console.error('❌', errorMsg);
        throw new HttpsError('invalid-argument', errorMsg);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail)) {
        const errorMsg = `Invalid email format: ${userEmail}`;
        console.error('❌', errorMsg);
        throw new HttpsError('invalid-argument', errorMsg);
      }

      console.log('✅ All validations passed, preparing email...');

      // Create transporter
      const transporter = createTransporter();

      // Prepare email content
      const mailOptions = {
  from: `"Crave2Cave Orders" <${process.env.GMAIL_USER}>`,
  to: userEmail,
  subject: `🚚 Order #${orderNumber} is On the Way!`,
  text: `Hi ${studentName},

  The driver has picked up your order #${orderNumber}.

  Order Details:
  - Order Number: ${orderNumber}
  - Total: RM${orderTotal || 'N/A'}
  - Status: In 30 minutes
  - Vendor: Domino's Pizza

  To ensure you receive all future order updates, please whitelist crave2cave@gmail.com by adding us to your contacts.

  Thank you for choosing Crave2Cave!`,
  html: `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 16px; max-width: 600px;">

      <h2 style="color: #3b82f6;">🚚 The driver has picked up your order #${orderNumber}</h2>
      <p>Hi <strong>${studentName}</strong>,</p>
      <p>Good news! Your order is now in progress and will arrive soon.</p>
      
      <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">📦 Order Details</h3>
        <ul style="list-style: none; padding-left: 0; margin: 0;">
          <li style="padding: 4px 0;"><strong>Order Number:</strong> ${orderNumber}</li>
          <li style="padding: 4px 0;"><strong>Total:</strong> RM${orderTotal || 'N/A'}</li>
          <li style="padding: 4px 0;"><strong>Status:</strong> <span style="color: #28a745;">In 30 minutes</span></li>
          <li style="padding: 4px 0;"><strong>Vendor:</strong> Domino's Pizza</li>
        </ul>
      </div>

      <p>If you have any questions, feel free to contact us at
        <a href="mailto:crave2cave@gmail.com" style="color: #3b82f6;">crave2cave@gmail.com</a>.
      </p>
      <p>Thank you for choosing <strong style="color: #3b82f6;">Crave2Cave</strong>!</p>
      
      <div style="background-color: #fff3cd; padding: 12px; border-radius: 4px; border-left: 4px solid #ffc107; margin: 20px 0;">
        <p style="margin: 0;">
          <strong>📋 Important:</strong> To ensure future order updates don't end up in your spam folder, please
          <strong> add <span style="color: #3b82f6;">crave2cave@gmail.com</span> to your contacts</strong>.
        </p>
      </div>
      <div style="text-align: center;">
  <img src="https://i.imgur.com/8o7gXys.png" alt="Crave2Cave Logo" style="width: 160px; margin-bottom: 24px;" />
</div>
    </div>
  `
};


      console.log('📧 Sending email to:', userEmail);

      // Send the email with timeout
      const emailPromise = transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout')), 30000)
      );

      await Promise.race([emailPromise, timeoutPromise]);
      
      console.log('✅ Email sent successfully!');

      // Log success to Firestore (non-blocking)
      setImmediate(async () => {
        try {
          await admin.firestore().collection('emailLogs').add({
            userId,
            userEmail,
            orderNumber,
            studentName,
            orderTotal: orderTotal || 0,
            status: 'success',
            sentAt: admin.firestore.Timestamp.now()
          });
          console.log('✅ Success logged to Firestore');
        } catch (logError) {
          console.error('Failed to log success to Firestore:', logError);
        }
      });

      return {
        success: true,
        message: `Email sent successfully to ${userEmail} for order #${orderNumber}`,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Function error:', error);

      // Log error to Firestore (non-blocking)
      setImmediate(async () => {
        try {
          await admin.firestore().collection('emailErrorLogs').add({
            error: error.message || 'Unknown error',
            code: error.code || 'unknown',
            userId: request.data?.userId || 'unknown',
            userEmail: request.data?.userEmail || 'unknown',
            orderNumber: request.data?.orderNumber || 'unknown',
            timestamp: admin.firestore.Timestamp.now(),
            stack: error.stack
          });
          console.log('✅ Error logged to Firestore');
        } catch (logError) {
          console.error('Failed to log error to Firestore:', logError);
        }
      });

      // Re-throw appropriate errors
      if (error instanceof HttpsError) {
        throw error;
      } else if (error.message.includes('Gmail credentials')) {
        throw new HttpsError('failed-precondition', 'Email service not configured properly');
      } else if (error.message.includes('timeout')) {
        throw new HttpsError('deadline-exceeded', 'Email send timeout - please try again');
      } else {
        throw new HttpsError('internal', 'Failed to send email', error.message);
      }
    }
  });

  exports.cleanupOldFiles = onSchedule({
  schedule: 'every day 02:00',
  timeZone: 'Asia/Kuala_Lumpur',
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 300
}, async (event) => {
  try {
    console.log('🧹 Starting cleanup of files older than 14 days...');
    
    const bucket = getStorage().bucket();
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    console.log(`📅 Cutoff date: ${fourteenDaysAgo.toISOString()}`);
    
    // Get all files in uploads folder
    const [uploadFiles] = await bucket.getFiles({
      prefix: 'uploads/'
    });
    
    // Get all files in orders folder
    const [orderFiles] = await bucket.getFiles({
      prefix: 'orders/'
    });
    
    const allFiles = [...uploadFiles, ...orderFiles];
    let deletedCount = 0;
    let totalSize = 0;
    const deletedFiles = [];
    
    console.log(`📂 Found ${allFiles.length} files to check`);
    
    for (const file of allFiles) {
      try {
        const [metadata] = await file.getMetadata();
        const createdDate = new Date(metadata.timeCreated);
        
        if (createdDate < fourteenDaysAgo) {
          const fileSize = parseInt(metadata.size) || 0;
          await file.delete();
          deletedCount++;
          totalSize += fileSize;
          deletedFiles.push({
            name: file.name,
            createdDate: createdDate.toISOString(),
            size: fileSize
          });
          console.log(`🗑️ Deleted: ${file.name} (${(fileSize / 1024).toFixed(2)} KB)`);
        }
      } catch (fileError) {
        console.error(`❌ Error processing file ${file.name}:`, fileError);
      }
    }
    
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log(`✅ Cleanup complete! Deleted ${deletedCount} files, freed ${totalSizeMB} MB`);
    
    // Log cleanup results to Firestore
    const cleanupResult = {
      deletedCount,
      totalSizeBytes: totalSize,
      totalSizeMB: parseFloat(totalSizeMB),
      runDate: admin.firestore.Timestamp.now(),
      cutoffDate: fourteenDaysAgo.toISOString(),
      deletedFiles: deletedFiles.slice(0, 100), // Limit to first 100 files for storage
      success: true
    };
    
    await admin.firestore().collection('cleanupLogs').add(cleanupResult);
    
    return {
      success: true,
      message: `Deleted ${deletedCount} files, freed ${totalSizeMB} MB`,
      deletedCount,
      totalSizeMB: parseFloat(totalSizeMB)
    };
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    
    // Log error to Firestore
    await admin.firestore().collection('cleanupLogs').add({
      success: false,
      error: error.message,
      runDate: admin.firestore.Timestamp.now(),
      cutoffDate: fourteenDaysAgo.toISOString()
    });
    
    throw error;
  }
});