import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, where, Timestamp, writeBatch, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { isToday } from '../utils/isToday';
import { getFunctions, httpsCallable } from 'firebase/functions'; // Add this import

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
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app); // Initialize Functions

// Existing functions (unchanged)
export const savePrebookUser = async (user) => {
  try {
    const now = new Date();
    const malaysiaDateStr = now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" });
    const malaysiaDate = new Date(malaysiaDateStr);
    const todayString = malaysiaDate.toISOString().split('T')[0];

    const userWithDate = {
      ...user,
      email: user.email || "no-email@crave2cave.com",
      registrationDate: todayString,
      timestamp: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'prebookUsers'), userWithDate);
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

export const getPrebookUsers = async () => {
  try {
    const now = new Date();
    const malaysiaDateStr = now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" });
    const malaysiaDate = new Date(malaysiaDateStr);
    const todayString = malaysiaDate.toISOString().split('T')[0];
    const usersQuery = query(collection(db, 'prebookUsers'), where("registrationDate", "==", todayString));
    const querySnapshot = await getDocs(usersQuery);
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, firestoreId: doc.id, ...doc.data() }));
    return users.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  } catch (e) {
    console.error('Error getting users: ', e);
    return [];
  }
};

export const saveOrder = async (order) => {
  try {
    const orderWithTimestamp = {
      ...order,
      timestamp: new Date().toISOString(),
      status: 'pending',
      orderDate: new Date().toLocaleDateString("en-US", { timeZone: "Asia/Kuala_Lumpur" })
    };
    const docRef = await addDoc(collection(db, 'orders'), orderWithTimestamp);
    await updateDailyHistory();
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

// In firebase.js (add this function)
export const getOrderByUserId = async (userId) => {
  try {
    const ordersQuery = query(collection(db, 'orders'), where('userId', '==', userId));
    const querySnapshot = await getDocs(ordersQuery);
    if (!querySnapshot.empty) {
      const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Return the most recent order based on timestamp
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

export const updateDailyHistory = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const usersSnapshot = await getDocs(collection(db, 'prebookUsers'));
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, firestoreId: doc.id, ...doc.data() }));
    const allOrders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const todayOrdersTemp = allOrders.filter(order => isToday(order.timestamp));
    const todayUserIds = new Set(todayOrdersTemp.map(order => order.userId));
    const todayUsersTemp = allUsers.filter(user => isToday(user.timestamp) || todayUserIds.has(user.firestoreId));
    const todayRevenue = todayUsersTemp.filter(u => u.commitmentPaid).length * 10 +
      todayOrdersTemp.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);
    const driverCost = todayOrdersTemp.length > 0 ? 30 : 0;
    const todayProfit = todayRevenue - driverCost;
    const historyQuery = query(collection(db, 'history'), where('date', '==', today));
    const historySnapshot = await getDocs(historyQuery);
    const historyDataPayload = {
      date: today,
      timestamp: new Date().toISOString(),
      orders: todayOrdersTemp,
      users: todayUsersTemp,
      totalOrders: todayOrdersTemp.length,
      totalUsers: todayUsersTemp.length,
      registeredUsers: todayUsersTemp.filter(u => isToday(u.timestamp)).length,
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

// New functions for App.js
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

// Updated sendDeliveryEmail function with enhanced error handling and validation
export const sendDeliveryEmail = async ({ userId, userEmail, orderNumber, orderTotal, studentName }) => {
  try {
    console.log('🔍 Starting sendDeliveryEmail with parameters:', {
      userId: userId ? `${userId} (${typeof userId})` : 'MISSING',
      userEmail: userEmail ? `${userEmail} (${typeof userEmail})` : 'MISSING',
      orderNumber: orderNumber ? `${orderNumber} (${typeof orderNumber})` : 'MISSING',
      orderTotal: `${orderTotal} (${typeof orderTotal})`,
      studentName: studentName ? `${studentName} (${typeof studentName})` : 'MISSING'
    });

    // Validate parameters before sending
    const missingParams = [];
    if (!userId || typeof userId !== 'string' || userId.trim() === '') missingParams.push('userId');
    if (!userEmail || typeof userEmail !== 'string' || userEmail.trim() === '') missingParams.push('userEmail');
    if (!orderNumber || typeof orderNumber !== 'string' || orderNumber.trim() === '') missingParams.push('orderNumber');
    if (!studentName || typeof studentName !== 'string' || studentName.trim() === '') missingParams.push('studentName');

    if (missingParams.length > 0) {
      const errorMsg = `❌ Missing or invalid required parameters: ${missingParams.join(', ')}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail.trim())) {
      const errorMsg = `❌ Invalid email format: ${userEmail}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Prepare the payload with proper type conversion
    const emailPayload = {
      userId: String(userId).trim(),
      userEmail: String(userEmail).trim(),
      orderNumber: String(orderNumber).trim(),
      orderTotal: Number(orderTotal) || 0,
      studentName: String(studentName).trim()
    };

    console.log('📧 Calling Firebase function with payload:', emailPayload);

    const sendEmailFunction = httpsCallable(functions, 'sendDeliveryEmail');
    const result = await sendEmailFunction(emailPayload);
    
    console.log('✅ Email function result:', result.data);
    return result.data;

  } catch (error) {
    console.error('❌ Error in sendDeliveryEmail:', {
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack
    });
    
    // Return a structured error response instead of throwing
    return { 
      success: false, 
      message: error.message || 'Failed to send email',
      error: error.code || 'unknown-error',
      details: error.details || null
    };
  }
};