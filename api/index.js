const { defineSecret } = require("firebase-functions/params");
// TEMP: HitPay disabled (HITPAY_API_KEY secret not set, route unused by frontend) — re-enable by uncommenting below
// const HITPAY_API_KEY = defineSecret("HITPAY_API_KEY");
const ADMIN_PASSCODE = defineSecret("ADMIN_PASSCODE");
const DRIVER_PASSCODE = defineSecret("DRIVER_PASSCODE");
const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const admin = require("firebase-admin");

admin.initializeApp();

setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
});

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Route: Verify admin/driver passcode server-side and stamp a custom claim
// on the caller's (anonymous) Firebase Auth account.
app.post("/verify-passcode", async (req, res) => {
  try {
    const { passcode, role, uid } = req.body;

    if (!uid || (role !== "admin" && role !== "driver")) {
      return res.status(400).json({ success: false, error: "Missing or invalid uid/role" });
    }

    const correctPasscode = role === "admin" ? ADMIN_PASSCODE.value() : DRIVER_PASSCODE.value();

    if (passcode !== correctPasscode) {
      return res.status(401).json({ success: false });
    }

    await admin.auth().setCustomUserClaims(uid, { [role]: true });
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

// Export cloud function
exports.api = onRequest(
  {
    secrets: ["ADMIN_PASSCODE", "DRIVER_PASSCODE"],
  },
  app
);

