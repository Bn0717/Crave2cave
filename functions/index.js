const {onDocumentUpdated} = require("firebase-functions/v2/firestore");
const {logger, config} = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();

// Get the SendGrid API key from the Firebase configuration
const SENDGRID_API_KEY = config().sendgrid?.key; // Use optional chaining `?.`

// This is a critical check. It prevents the function from crashing on startup.
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  logger.info("SendGrid API Key successfully configured.");
} else {
  logger.warn("SendGrid API Key not found. Email notifications will be disabled.");
}

exports.notifyUserOnDeliveryStart = onDocumentUpdated("orders/{orderId}", async (event) => {
  // First, check if the API key was even available.
  if (!SENDGRID_API_KEY) {
    logger.error("Function cannot execute: SendGrid API Key is not configured.");
    return;
  }

  const newData = event.data.after.data();
  const oldData = event.data.before.data();
  const orderId = event.params.orderId;

  if (newData.status === "in-progress" && oldData.status !== "in-progress") {
    logger.log(`Processing order: ${orderId} for user: ${newData.userId}`);

    const userRef = admin.firestore().collection("prebookUsers").doc(newData.userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      logger.error(`User document not found for userId: ${newData.userId}`);
      return;
    }

    const userEmail = userDoc.data().email;
    const userName = newData.userName;

    if (!userEmail) {
      logger.error(`No email address found for user: ${newData.userId}`);
      return;
    }

    const msg = {
      to: userEmail,
      from: {
        name: "Crave 2 Cave",
        email: "crave2cave@gmail.com", // Your verified SendGrid sender
      },
      subject: `✅ Your Crave 2 Cave Order #${newData.orderNumber} is on its way!`,
      html: `
        <p>Hi ${userName},</p>
        <p>Great news! Your delivery is on its way.</p>
        <p>Thank you for using Crave 2 Cave!</p>
      `,
    };

    try {
      await sgMail.send(msg);
      logger.log(`Delivery notification sent successfully to ${userEmail}.`);
    } catch (error) {
      logger.error("Error sending email via SendGrid:", error);
      if (error.response) {
        logger.error(error.response.body);
      }
    }
  }

  return null;
});