// src/utils/calculateDeliveryFee.js
export const calculateDeliveryFee = (amount) => {
    if (amount < 50) return 10;
    if (amount >= 50 && amount < 100) return 17;
    if (amount >= 100 && amount < 150) return 25;
    if (amount >= 150 && amount < 200) return 30;
    return Math.min(amount * 0.15, 55);
};