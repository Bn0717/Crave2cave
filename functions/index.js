const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

admin.initializeApp();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendDeliveryEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const { userId, orderNumber, userEmail } = data;
  if (!userId || !orderNumber || !userEmail) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
  }

  const msg = {
    to: userEmail,
    from: 'your-email@example.com', // Replace with your verified SendGrid email
    subject: `Delivery Started - Order #${orderNumber}`,
    text: `Your order #${orderNumber} is now in progress. Expected delivery soon.`,
    html: `<p>Your order #${orderNumber} is now in progress. Expected delivery soon. Track your order via the app.</p>`,
  };

  try {
    await sgMail.send(msg);
    return { success: true, message: `Email sent to ${userEmail} for order #${orderNumber}` };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('unknown', 'Failed to send email', error);
  }
});