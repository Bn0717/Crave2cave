import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, where, Timestamp, writeBatch, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { isToday } from '../utils/isToday';

// This is the NEW, CORRECT configuration for your new project "crave2cave-20c81"
const firebaseConfig = {
  apiKey: "AIzaSyAutoUXgR5v9QSjEsDPkaEBxNzhrVd5r1c",
  authDomain: "crave2cave-20c81.firebaseapp.com",
  projectId: "crave2cave-20c81",
  storageBucket: "crave2cave-20c81.appspot.com", // Use the .appspot.com version for consistency
  messagingSenderId: "291986862315",
  appId: "1:291986862315:web:5d4c3ee036c175ffa10eae",
  measurementId: "G-JGR0HQV7SQ"
};

// Initialize Firebase with the new config
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// --- All your other functions are correct and remain below ---

export const savePrebookUser = async (user) => {
    try {
        const now = new Date();
        const malaysiaDateStr = now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" });
        const malaysiaDate = new Date(malaysiaDateStr);
        const todayString = malaysiaDate.toISOString().split('T')[0];
        
        const userWithDate = {
            ...user,
            email: "", // Initialize the email field
            registrationDate: todayString,
            timestamp: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'prebookUsers'), userWithDate);
        return docRef.id;
    } catch (e) { console.error('Error adding document: ', e); throw e; }
};

export const uploadFileToStorage = async (file) => {
    const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
    try {
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    } catch (e) { console.error("Error uploading file:", e); throw e; }
};

export const updatePrebookUser = async (userId, updates) => {
    try {
        const userRef = doc(db, 'prebookUsers', userId);
        await updateDoc(userRef, updates);
    } catch (e) { console.error('Error updating user: ', e); throw e; }
};

export const updateUserEmail = async (userId, email) => {
    try {
        const userRef = doc(db, 'prebookUsers', userId);
        await updateDoc(userRef, { email: email });
        console.log("User email updated successfully");
    } catch (e) { console.error('Error updating user email: ', e); throw e; }
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
    } catch (e) { console.error('Error getting users: ', e); return []; }
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
    } catch (e) { console.error('Error saving order: ', e); throw e; }
};

export const getOrders = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) { console.error('Error getting orders: ', e); return []; }
};

export const getHistoryData = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'history'));
        const history = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return history.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (e) { console.error('Error getting history: ', e); return []; }
};

export const updateOrdersStatus = async (orderIds, newStatus) => {
  const batch = writeBatch(db);
  orderIds.forEach(orderId => {
    const orderRef = doc(db, "orders", orderId);
    batch.update(orderRef, { status: newStatus, statusLastUpdatedAt: Timestamp.now() });
  });
  await batch.commit();
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
    } catch (error) { console.error('Error updating daily history:', error); }
};