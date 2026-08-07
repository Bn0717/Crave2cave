const { defineSecret } = require("firebase-functions/params");
// TEMP: HitPay disabled (HITPAY_API_KEY secret not set, route unused by frontend) — re-enable by uncommenting below
// const HITPAY_API_KEY = defineSecret("HITPAY_API_KEY");
const ADMIN_PASSCODE = defineSecret("ADMIN_PASSCODE");
const DRIVER_PASSCODE = defineSecret("DRIVER_PASSCODE");
const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");
const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

setGlobalOptions({
  region: "asia-southeast1",
  maxInstances: 10,
});

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Route: Verify admin/driver passcode server-side and stamp a custom claim
// on the caller's (anonymous) Firebase Auth account. Rate-limited by IP so
// the passcode can't be brute-forced with scripted guesses.
const RATE_LIMIT_MAX_ATTEMPTS = 10;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

app.post("/verify-passcode", async (req, res) => {
  try {
    const { passcode, role, uid } = req.body;

    if (!uid || (role !== "admin" && role !== "driver")) {
      return res.status(400).json({ success: false, error: "Missing or invalid uid/role" });
    }

    const ip = (req.headers["x-forwarded-for"] || req.ip || "unknown").split(",")[0].trim();
    const rateLimitId = ip.replace(/[^a-zA-Z0-9.:_-]/g, "_") || "unknown";
    const rateLimitRef = admin.firestore().collection("rateLimits").doc(rateLimitId);
    const now = Date.now();
    const rateLimitSnap = await rateLimitRef.get();
    const rateLimitData = rateLimitSnap.exists ? rateLimitSnap.data() : null;
    const withinWindow = rateLimitData && now - rateLimitData.windowStart < RATE_LIMIT_WINDOW_MS;

    if (withinWindow && rateLimitData.count >= RATE_LIMIT_MAX_ATTEMPTS) {
      return res.status(429).json({ success: false, error: "Too many attempts, please try again later" });
    }

    const correctPasscode = role === "admin" ? ADMIN_PASSCODE.value() : DRIVER_PASSCODE.value();

    if (passcode !== correctPasscode) {
      await rateLimitRef.set({
        count: withinWindow ? rateLimitData.count + 1 : 1,
        windowStart: withinWindow ? rateLimitData.windowStart : now,
      });
      return res.status(401).json({ success: false });
    }

    // Run in parallel — both are independent; saves ~100-150ms
    await Promise.all([
      admin.auth().setCustomUserClaims(uid, { [role]: true }),
      rateLimitRef.delete().catch(() => {}),
    ]);
    res.json({ success: true });
  } catch (error) {
    console.error("VERIFY-PASSCODE ERROR:", error);
    res.status(500).json({ success: false, error: "Verification failed" });
  }
});

// TEMP: HitPay route disabled — re-enable once HITPAY_API_KEY secret is set
// and the defineSecret import above is uncommented.
// app.post("/create-payment", async (req, res) => {
//   try {
//     const { amount, order_id } = req.body;
//
//     if (!amount || !order_id) {
//       return res.status(400).json({ error: "Missing amount or order_id" });
//     }
//
//     const response = await axios.post(
//       "https://api.hit-pay.com/v1/payment-requests",
//       {
//         amount,
//         currency: "MYR",
//         payment_methods: ["touch_n_go"],
//         reference_number: order_id,
//         redirect_url: "https://your-frontend.com/payment-success",
//       },
//       {
//         headers: {
//           "X-BUSINESS-API-KEY": HITPAY_API_KEY.value(),
//           "Content-Type": "application/json",
//         },
//       }
//     );
//
//     res.json({
//       payment_url: response.data.url || response.data.payment_request?.url
//     });
//   } catch (error) {
//     console.error("HITPAY ERROR:");
//     console.error(error.response?.data || error);
//
//     return res.status(500).json({
//       error: "Failed to create payment",
//       hitpay: error.response?.data || null
//     });
//   }
// });

// Callable: email a student when their order status changes (e.g. driver
// marks it as picked up / on the way). Gmail credentials are Firebase
// Secrets, never stored in a file.
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER.value(),
      pass: GMAIL_APP_PASSWORD.value(),
    },
    pool: true,
    maxConnections: 1,
    rateDelta: 20000,
    rateLimit: 5,
  });
};

exports.sendDeliveryEmail = onCall(
  {
    region: "asia-southeast1",
    memory: "256MiB",
    timeoutSeconds: 60,
    maxInstances: 10,
    secrets: ["GMAIL_USER", "GMAIL_APP_PASSWORD"],
  },
  async (request) => {
    try {
      const data = request.data || {};
      const userEmail = data.userEmail || data.email;
      const { orderNumber, orderTotal, studentName } = data;

      const requiredFields = { userEmail, orderNumber, studentName };
      const missingFields = Object.entries(requiredFields)
        .filter(([, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        throw new HttpsError("invalid-argument", `Missing required parameters: ${missingFields.join(", ")}`);
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail)) {
        throw new HttpsError("invalid-argument", `Invalid email format: ${userEmail}`);
      }

      const transporter = createTransporter();
      const gmailUser = GMAIL_USER.value();

      const mailOptions = {
        from: `"Crave2Cave Orders" <${gmailUser}>`,
        to: userEmail,
        subject: `🚚 Order #${orderNumber} is On the Way!`,
        text: `Hi ${studentName},\n\nThe driver has picked up your order #${orderNumber}.\n\nOrder Details:\n- Order Number: ${orderNumber}\n- Total: RM${orderTotal || 'N/A'}\n- Status: In 30 minutes\n\nThank you for choosing Crave2Cave!`,
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
              </ul>
            </div>
            <p>If you have any questions, feel free to contact us at
              <a href="mailto:${gmailUser}" style="color: #3b82f6;">${gmailUser}</a>.
            </p>
            <p>Thank you for choosing <strong style="color: #3b82f6;">Crave2Cave</strong>!</p>
          </div>
        `,
      };

      const emailPromise = transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email send timeout")), 30000)
      );
      await Promise.race([emailPromise, timeoutPromise]);

      return {
        success: true,
        message: `Email sent successfully to ${userEmail} for order #${orderNumber}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("sendDeliveryEmail error:", error);
      if (error instanceof HttpsError) throw error;
      if (error.message?.includes("timeout")) {
        throw new HttpsError("deadline-exceeded", "Email send timeout - please try again");
      }
      throw new HttpsError("internal", "Failed to send email", error.message);
    }
  }
);

// Export cloud function
exports.api = onRequest(
  {
    secrets: ["ADMIN_PASSCODE", "DRIVER_PASSCODE"],
  },
  app
);

