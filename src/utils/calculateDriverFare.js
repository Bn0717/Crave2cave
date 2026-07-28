// src/utils/calculateDriverFare.js
// TEMPORARY driver-fare formula. Does NOT replace calculateDeliveryFee.js
// (the student-facing delivery fee) — this only calculates what the driver is paid.

const BASE_FARE = 30;
const MAX_FARE = 59;

// Surcharge applied once per DISTINCT vendor visited that day (not per order).
const VENDOR_SURCHARGE = {
  mixue: 1,
  family_mart: 2,
  mcd: 2,
  kfc: 3,
  douglas_street: 3,
  zus_coffee: 3,
  // dominos, ayam_gepuk, bakers_cottage: no surcharge
};

// Only the highest-qualifying bonus applies (checked highest-first).
const BONUS_TIERS = [
  { minOrders: 20, bonus: 15 },
  { minOrders: 15, bonus: 11 },
  { minOrders: 10, bonus: 7 },
  { minOrders: 7, bonus: 4 },
];

export const calculateDriverFare = (orders = []) => {
  const distinctVendors = new Set(
    orders.map((order) => order.vendor?.toLowerCase()).filter(Boolean)
  );

  const vendorSurcharge = [...distinctVendors].reduce(
    (sum, vendor) => sum + (VENDOR_SURCHARGE[vendor] || 0),
    0
  );

  const orderCount = orders.length;
  const bonusTier = BONUS_TIERS.find((tier) => orderCount >= tier.minOrders);
  const bonus = bonusTier ? bonusTier.bonus : 0;

  const totalFare = BASE_FARE + vendorSurcharge + bonus;
  return Math.min(totalFare, MAX_FARE);
};
