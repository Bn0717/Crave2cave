import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, addDoc, query, where, Timestamp, writeBatch, doc, updateDoc, limit, orderBy, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { isToday } from '../utils/isToday';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAutoUXgR5v9QSjEsDPkaEBxNzhrVd5r1c",
  authDomain: "crave-2-cave.firebaseapp.com",
  projectId: "crave-2-cave",
  storageBucket: "crave-2-cave.firebasestorage.app",
  messagingSenderId: "291986862315",
  appId: "1:291986862315:web:5d4c3ee036c175ffa10eae",
  measurementId: "G-JGR0HQV7SQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Export db for direct use
const storage = getStorage(app);
const functions = getFunctions(app);

export const savePrebookUser = async (user) => {
  try {
    // The user object passed in already contains the correct deliveryDate
    const userToSave = {
      ...user,
      email: user.email || "no-email@crave2cave.com",
      timestamp: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'prebookUsers'), userToSave);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

export const uploadFileToStorage = async (file) => {
  if (!file || !(file instanceof File)) {
    console.error('Invalid file: File object is required');
    throw new Error('Invalid file: Please select a valid file');
  }
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageRef = ref(storage, `uploads/${Date.now()}_${sanitizedFileName}`);
  console.log('Uploading to:', storageRef.fullPath);
  try {
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    console.log('File uploaded successfully:', downloadURL);
    return downloadURL;
  } catch (e) {
    console.error('Upload error:', e);
    throw e;
  }
};

export const updatePrebookUser = async (userId, updates) => {
  try {
    console.log('updatePrebookUser called with userId:', userId, 'type:', typeof userId);
    if (!userId || typeof userId !== 'string') {
      throw new Error(`Invalid userId: ${userId} (type: ${typeof userId})`);
    }
    const userRef = doc(db, 'prebookUsers', userId);
    await updateDoc(userRef, updates);
  } catch (e) {
    console.error('Error updating user: ', e);
    throw e;
  }
};

export const updateUserEmail = async (userId, email) => {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId provided');
    }
    const userRef = doc(db, 'prebookUsers', userId);
    await updateDoc(userRef, { email: email });
    console.log("User email updated successfully");
  } catch (e) {
    console.error('Error updating user email: ', e);
    throw e;
  }
};

export const getPrebookUsers = async (dateString) => {
  try {
    // No longer generates its own date! It uses the one passed from App.js.
    const usersQuery = query(collection(db, 'prebookUsers'), where("deliveryDate", "==", dateString));
    
    const querySnapshot = await getDocs(usersQuery);
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, firestoreId: doc.id, ...doc.data() }));
    return users.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  } catch (e) {
    console.error(`Error getting users for delivery date ${dateString}: `, e);
    return [];
  }
};

export const saveOrder = async (order) => {
  try {
    // The order object passed in already has the correct deliveryDate
    const orderToSave = {
      ...order,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };
    const docRef = await addDoc(collection(db, 'orders'), orderToSave);
    await updateDailyHistory(order.deliveryDate); // ✅ Pass the actual delivery date
    return docRef.id;
  } catch (e) {
    console.error('Error saving order: ', e);
    throw e;
  }
};

export const getOrders = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error('Error getting orders: ', e);
    return [];
  }
};

export const getHistoryData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'history'));
    const history = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (e) {
    console.error('Error getting history: ', e);
    return [];
  }
};

export const getOrderByUserId = async (userId) => {
  try {
    const ordersQuery = query(collection(db, 'orders'), where('userId', '==', userId));
    const querySnapshot = await getDocs(ordersQuery);
    if (!querySnapshot.empty) {
      const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return orders.reduce((latest, current) =>
        latest.timestamp > current.timestamp ? latest : current
      );
    }
    return null;
  } catch (error) {
    console.error('Error fetching order by user ID:', error);
    throw error;
  }
};

export const updateOrdersStatus = async (orderIds, status) => {
  try {
    const batch = writeBatch(db);
    orderIds.forEach(orderId => {
      const orderRef = doc(db, 'orders', orderId);
      batch.update(orderRef, { status, lastUpdated: new Date().toISOString() });
    });
    await batch.commit();
    console.log(`Updated status to ${status} for orders:`, orderIds);
  } catch (e) {
    console.error('Error updating orders status:', e);
    throw e;
  }
};

export const updateDailyHistory = async (targetDeliveryDate) => {
  try {
    // ✅ CHANGE: Accept the delivery date as a parameter instead of using "today"
    // This ensures we only update history for actual delivery dates
    if (!targetDeliveryDate) {
      console.log('No delivery date provided, skipping history update');
      return;
    }

    // Fetch only users and orders for the TARGET delivery date
    const usersQuery = query(collection(db, 'prebookUsers'), where("deliveryDate", "==", targetDeliveryDate));
    const ordersQuery = query(collection(db, 'orders'), where("deliveryDate", "==", targetDeliveryDate));

    const [usersSnapshot, ordersSnapshot] = await Promise.all([
      getDocs(usersQuery),
      getDocs(ordersQuery)
    ]);

    const todayUsersTemp = usersSnapshot.docs.map(doc => ({ id: doc.id, firestoreId: doc.id, ...doc.data() }));
    const todayOrdersTemp = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Now all calculations are correctly based on the delivery date
    const todayRevenue = todayUsersTemp.filter(u => u.commitmentPaid).length * 10 +
      todayOrdersTemp.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);
    const driverCost = todayOrdersTemp.length > 0 ? 30 : 0;
    const todayProfit = todayRevenue - driverCost;

    const historyQuery = query(collection(db, 'history'), where('date', '==', targetDeliveryDate));
    const historySnapshot = await getDocs(historyQuery);

    const historyDataPayload = {
      date: targetDeliveryDate,
      timestamp: new Date().toISOString(),
      orders: todayOrdersTemp, // Storing filtered orders
      users: todayUsersTemp, // Storing filtered users
      totalOrders: todayOrdersTemp.length,
      totalUsers: todayUsersTemp.length,
      registeredUsers: todayUsersTemp.length, // This is now correct
      paidUsers: todayUsersTemp.filter(u => u.commitmentPaid).length,
      totalRevenue: todayRevenue,
      driverCost: driverCost,
      profit: todayProfit,
      commitmentFees: todayUsersTemp.filter(u => u.commitmentPaid).length * 10,
      deliveryFees: todayOrdersTemp.reduce((sum, order) => sum + (order.deliveryFee || 0), 0)
    };

    if (historySnapshot.empty) {
      await addDoc(collection(db, 'history'), historyDataPayload);
    } else {
      const docId = historySnapshot.docs[0].id;
      await updateDoc(doc(db, 'history', docId), historyDataPayload);
    }
  } catch (error) {
    console.error('Error updating daily history:', error);
  }
};

export const uploadOrderImage = async (orderId, file) => {
  if (!file || !(file instanceof File)) {
    console.error('Invalid file: File object is required');
    throw new Error('Invalid file: Please select a valid file');
  }
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageRef = ref(storage, `orders/${orderId}/${Date.now()}_${sanitizedFileName}`);
  try {
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Order image uploaded successfully:', downloadURL);
    return downloadURL;
  } catch (e) {
    console.error('Order image upload error:', e);
    throw e;
  }
};

export const updateOrderDetails = async (orderId, updates) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      ...updates,
      lastUpdated: new Date().toISOString()
    });
    console.log(`Order ${orderId} updated successfully`);
  } catch (e) {
    console.error('Error updating order details:', e);
    throw e;
  }
};

export const sendDeliveryEmail = async ({ userId, userEmail, orderNumber, orderTotal, studentName }) => {
  try {
    console.log('🔍 Starting sendDeliveryEmail with parameters:', { userId: userId ? `${userId} (${typeof userId})` : 'MISSING', userEmail: userEmail ? `${userEmail} (${typeof userEmail})` : 'MISSING', orderNumber: orderNumber ? `${orderNumber} (${typeof orderNumber})` : 'MISSING', orderTotal: `${orderTotal} (${typeof orderTotal})`, studentName: studentName ? `${studentName} (${typeof studentName})` : 'MISSING' });
    const missingParams = [];
    if (!userId || typeof userId !== 'string' || userId.trim() === '') missingParams.push('userId');
    if (!userEmail || typeof userEmail !== 'string' || userEmail.trim() === '') missingParams.push('userEmail');
    if (!orderNumber || typeof orderNumber !== 'string' || orderNumber.trim() === '') missingParams.push('orderNumber');
    if (!studentName || typeof studentName !== 'string' || studentName.trim() === '') missingParams.push('studentName');
    if (missingParams.length > 0) { const errorMsg = `❌ Missing or invalid required parameters: ${missingParams.join(', ')}`; console.error(errorMsg); throw new Error(errorMsg); }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail.trim())) { const errorMsg = `❌ Invalid email format: ${userEmail}`; console.error(errorMsg); throw new Error(errorMsg); }
    const emailPayload = { userId: String(userId).trim(), userEmail: String(userEmail).trim(), orderNumber: String(orderNumber).trim(), orderTotal: Number(orderTotal) || 0, studentName: String(studentName).trim() };
    console.log('📧 Calling Firebase function with payload:', emailPayload);
    const sendEmailFunction = httpsCallable(functions, 'sendDeliveryEmail');
    const result = await sendEmailFunction(emailPayload);
    console.log('✅ Email function result:', result.data);
    return result.data;
  } catch (error) {
    console.error('❌ Error in sendDeliveryEmail:', { message: error.message, code: error.code, details: error.details, stack: error.stack });
    return { success: false, message: error.message || 'Failed to send email', error: error.code || 'unknown-error', details: error.details || null };
  }
};

export const getTodaysOrderByUserId = async (userId) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  try {
    const q = query(collection(db, 'orders'), where('userId', '==', userId), where('timestamp', '>=', startOfDay), where('timestamp', '<=', endOfDay), orderBy('timestamp', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      console.log("Found an existing order for today:", doc.id);
      return { orderId: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching today's order by user ID:", error);
    throw error;
  }
};

// --- NEW FUNCTIONS FOR FEEDBACK TAB ---

/**
 * Adds a new feedback document to the 'feedbacks' collection.
 * @param {object} feedbackData - The feedback object { rating, comment }.
 * @returns {Promise<DocumentReference>} A reference to the newly created document.
 */
export const addFeedback = async (feedbackData) => {
  try {
    const feedbackWithTimestamp = {
      ...feedbackData,
      timestamp: Date.now(), // Use a numeric timestamp for easier sorting
    };
    const docRef = await addDoc(collection(db, 'feedbacks'), feedbackWithTimestamp);
    return docRef;
  } catch (e) {
    console.error("Error adding feedback: ", e);
    throw e;
  }
};

/**
 * Fetches the 20 most recent feedback entries from Firestore.
 * @returns {Promise<Array<object>>} An array of feedback objects.
 */
export const getFeedbacks = async () => {
  try {
    const feedbackCollection = collection(db, 'feedbacks');
    const q = query(feedbackCollection, orderBy('timestamp', 'desc'), limit(20));
    const feedbackSnapshot = await getDocs(q);
    const feedbackList = feedbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return feedbackList;
  } catch (error) {
    console.error("Error fetching feedbacks: ", error);
    return []; // Return empty array on error
  }
};

export const updateHistoryEntry = async (historyDocId, updates) => {
  try {
    if (!historyDocId || typeof historyDocId !== 'string') {
      throw new Error('Invalid or missing history document ID');
    }
    const historyRef = doc(db, 'history', historyDocId);
    // Make sure to convert numbers to numbers, as form inputs are strings
    const numericUpdates = {
      ...updates,
      totalRevenue: Number(updates.totalRevenue) || 0,
      profit: Number(updates.profit) || 0,
      totalOrders: Number(updates.totalOrders) || 0,
    };
    await updateDoc(historyRef, numericUpdates);
    console.log(`Successfully updated history entry: ${historyDocId}`);
  } catch (e) {
    console.error("Error updating history entry: ", e);
    throw e;
  }
};

export const extendSystemCutoff = async (deliveryDate, newCutoffTime) => {
  try {
    const settingsRef = doc(db, 'dailySettings', deliveryDate);
    await setDoc(settingsRef, {
      extendedCutoffTime: newCutoffTime,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`System extended until ${newCutoffTime} for ${deliveryDate}`);
  } catch (error) {
    console.error('Error extending system cutoff:', error);
    throw error;
  }
};

// Emergency Loss Management Functions
export const addEmergencyLoss = async (lossData) => {
  try {
    const lossEntry = {
      ...lossData,
      timestamp: new Date().toISOString(),
      date: lossData.date || new Date().toLocaleDateString('en-CA')
    };
    const docRef = await addDoc(collection(db, 'emergencyLosses'), lossEntry);
    return docRef.id;
  } catch (e) {
    console.error('Error adding emergency loss: ', e);
    throw e;
  }
};

export const getEmergencyLosses = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'emergencyLosses'));
    const losses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return losses.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (e) {
    console.error('Error getting emergency losses: ', e);
    return [];
  }
};

export const updateEmergencyLoss = async (lossId, updates) => {
  try {
    if (!lossId || typeof lossId !== 'string') {
      throw new Error('Invalid loss ID');
    }
    const lossRef = doc(db, 'emergencyLosses', lossId);
    await updateDoc(lossRef, {
      ...updates,
      lastUpdated: new Date().toISOString()
    });
    console.log(`Emergency loss ${lossId} updated successfully`);
  } catch (e) {
    console.error('Error updating emergency loss: ', e);
    throw e;
  }
};

export const deleteEmergencyLoss = async (lossId) => {
  try {
    if (!lossId || typeof lossId !== 'string') {
      throw new Error('Invalid loss ID');
    }
    const lossRef = doc(db, 'emergencyLosses', lossId);
    await deleteDoc(lossRef);
    console.log(`Emergency loss ${lossId} deleted successfully`);
  } catch (e) {
    console.error('Error deleting emergency loss: ', e);
    throw e;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    await deleteDoc(doc(db, 'orders', orderId));
    console.log('Order deleted successfully:', orderId);
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    await deleteDoc(doc(db, 'prebookUsers', userId));
    console.log('User deleted successfully:', userId);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const deleteHistoryEntry = async (entryId) => {
  try {
    await deleteDoc(doc(db, 'history', entryId));
    console.log('History entry deleted successfully:', entryId);
  } catch (error) {
    console.error('Error deleting history entry:', error);
    throw error;
  }
};