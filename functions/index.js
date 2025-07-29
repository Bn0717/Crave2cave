const {onDocumentUpdated} = require("firebase-functions/v2/firestore");
const {logger} = require("firebase-functions");
const {defineSecret} = require("firebase-functions/params");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();

// Define the secret. This is the only function that will use it.
const SENDGRID_API_KEY = defineSecret("sendgrid-api-key");

// This is the ONLY function you need in this file.
exports.notifyUserOnDeliveryStart = onDocumentUpdated(
  {
    document: "orders/{orderId}",
    secrets: [SENDGRID_API_KEY], // Tell the function it needs this secret
  },
  async (event) => {
    // Access the secret's value inside the function
    sgMail.setApiKey(SENDGRID_API_KEY.value());

    const newData = event.data.after.data();
    const oldData = event.data.before.data();

    // The trigger condition remains the same:
    // Only send when the status changes TO "in-progress".
    if (newData.status === "in-progress" && oldData.status !== "in-progress") {
        const orderId = event.params.orderId;
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
            logger.warn(`No email address found for user: ${newData.userId}. Cannot send notification.`);
            return; // No email, so just stop.
        }

        // --- THIS IS THE MODIFIED EMAIL CONTENT ---
        const msg = {
            to: userEmail,
            from: { name: "Crave 2 Cave", email: "crave2cave@gmail.com" }, // Your verified sender
            subject: `✅ Your Crave 2 Cave Order #${newData.orderNumber} is Confirmed & On Its Way!`,
            html: `
              <h1>Hi ${userName},</h1>
              <p>Great news! Your order has been confirmed by our team and is now out for delivery.</p>
              <p>You can expect it to arrive shortly.</p>
              <br>
              <p>Thank you for choosing Crave 2 Cave!</p>
            `,
        };
        // --- END OF MODIFIED CONTENT ---

        try {
            await sgMail.send(msg);
            logger.log(`Delivery notification sent successfully to ${userEmail}.`);
        } catch (error) {
            logger.error("Error sending email via SendGrid:", error.toString());
            if (error.response) {
                logger.error(error.response.body);
            }
        }
    }
  },
);