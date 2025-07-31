const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

admin.initializeApp();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendDeliveryEmail = functions.https.onCall(async (data, context) => {
  // Remove authentication requirement for now, or make it optional
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  // }

  const { userId, orderNumber, userEmail } = data;
  
  if (!userId || !orderNumber || !userEmail) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
  }

  const msg = {
  to: userEmail,
  from: {
    email: 'crave2cave@gmail.com',
    name: 'Crave2Cave Orders'
  },
  subject: `🚚 Order #${orderNumber} is On the Way!`,
  text: `Hi there,

Your order #${orderNumber} is now on the way!

Order Details:
- Order Number: ${orderNumber}
- Total: RM${orderTotal}
- Status: In Progress
- Vendor: Domino's Pizza

To ensure you receive all future order updates, please whitelist crave2cave@gmail.com by adding us to your contacts.

Thank you for choosing Crave2Cave!

- The Crave2Cave Team`,
  html: `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 16px;">
      <h2>🚚 Your Order #${orderNumber} is On the Way!</h2>
      <p>Hi there,</p>
      <p>Good news! Your order is now in progress and will arrive soon.</p>

      <h3 style="margin-top: 24px;">📦 Order Details</h3>
      <ul style="list-style: none; padding-left: 0;">
        <li><strong>Order Number:</strong> ${orderNumber}</li>
        <li><strong>Total:</strong> RM${orderTotal}</li>
        <li><strong>Status:</strong> In Progress</li>
        <li><strong>Vendor:</strong> Domino's Pizza</li>
      </ul>

      <p style="margin-top: 20px;">
        To ensure future order updates don’t end up in your spam folder, please
        <strong>add crave2cave@gmail.com to your contacts</strong> or whitelist us in your email provider.
      </p>

      <p>If you have any questions, feel free to contact us at 
        <a href="mailto:crave2cave@gmail.com">crave2cave@gmail.com</a>.
      </p>

      <br>
      <p>Thank you for choosing <strong>Crave2Cave</strong>!</p>
      <p style="color: #888;">— The Crave2Cave Team</p>
    </div>
  `
};


  try {
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${userEmail} for order #${orderNumber}`);
    return { success: true, message: `Email sent to ${userEmail} for order #${orderNumber}` };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('unknown', 'Failed to send email', error.message);
  }
});