const {onSchedule} = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
admin.initializeApp();

// Delete all docs in 'prebookUsers' and 'orders' every day at midnight UTC
exports.dailyReset = onSchedule(
    {
      schedule: "0 0 * * *",
      // Every day at midnight UTC
      timeZone: "UTC",
      // Use 'Asia/Kuala_Lumpur' for Malaysia local time, if you want
    },
    async (event) => {
      const db = admin.firestore();
      try {
      // Delete all documents in 'prebookUsers'
        const usersSnapshot = await db.collection("prebookUsers").get();
        const userDeletes = usersSnapshot.docs.map((doc) => doc.ref.delete());
        await Promise.all(userDeletes);

        // Delete all documents in 'orders'
        const ordersSnapshot = await db.collection("orders").get();
        const orderDeletes = ordersSnapshot.docs.map((doc) => doc.ref.delete());
        await Promise.all(orderDeletes);

        console.log("Database reset successful!");
        return null;
      } catch (error) {
        console.error("Error resetting database:", error);
        return null;
      }
    },
);
