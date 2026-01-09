const { defineSecret } = require("firebase-functions/params");
const HITPAY_API_KEY = defineSecret("HITPAY_API_KEY");
const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const express = require("express");
const axios = require("axios");

setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
});

const app = express();

// Middleware
app.use(express.json());

// Route: Create HitPay payment
app.post("/create-payment", async (req, res) => {
  try {
    const { amount, order_id } = req.body;

    if (!amount || !order_id) {
      return res.status(400).json({ error: "Missing amount or order_id" });
    }

    const response = await axios.post(
      "https://api.hit-pay.com/v1/payment-requests",
      {
        amount,
        currency: "MYR",
        payment_methods: ["touch_n_go"],
        reference_number: order_id,
        redirect_url: "https://your-frontend.com/payment-success",
      },
      {
        headers: {
          "X-BUSINESS-API-KEY": HITPAY_API_KEY.value(),
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
    payment_url: response.data.url || response.data.payment_request?.url
    });


  } catch (error) {
  console.error("HITPAY ERROR:");
  console.error(error.response?.data || error);

  return res.status(500).json({
    error: "Failed to create payment",
    hitpay: error.response?.data || null
  });
}
});

// Export cloud function
exports.api = onRequest(
  {
    secrets: ["HITPAY_API_KEY"],
  },
  app
);

