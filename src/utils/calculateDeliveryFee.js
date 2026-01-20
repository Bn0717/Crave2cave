// src/utils/calculateDeliveryFee.js
export const calculateDeliveryFee = (amount) => {
    if (amount < 50) return 7;
    if (amount >= 50 && amount < 100) return 14;
    if (amount >= 100 && amount < 150) return 22;
    if (amount >= 150 && amount < 200) return 37;
    if (amount >= 200 && amount < 300) return 47;
    if (amount >= 300) return 57;
};