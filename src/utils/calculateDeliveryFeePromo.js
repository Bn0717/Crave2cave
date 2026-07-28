// src/utils/calculateDeliveryFeePromo.js
// TEMPORARY flat delivery fee promo (RM6 for everyone, regardless of order total).
// Does NOT replace calculateDeliveryFee.js — that file is untouched and stays as the
// permanent tiered logic. Set FLAT_DELIVERY_FEE_TEMP to false (in this file) to make
// every caller fall back to the original tiered calculateDeliveryFee automatically.

export const FLAT_DELIVERY_FEE_TEMP = true;

const FLAT_FEE_AMOUNT = 6;

export const calculateDeliveryFeePromo = () => FLAT_FEE_AMOUNT;
