import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { isToday } from '../utils/isToday';

const firebaseConfig = {
    apiKey: "AIzaSyBg56oKPkkQBHZYlqDe86gNKuM6CU9o0no",
    authDomain: "crave-2-cave.firebaseapp.com",
    projectId: "crave-2-cave",
    storageBucket: "crave-2-cave.firebasestorage.app",
    messagingSenderId: "328846262825",
    appId: "1:328846262825:web:149f44152723bdc62d9238"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export const savePrebookUser = async (user) => {
    try {
        const now = new Date();
        const malaysiaDateStr = now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" });
        const malaysiaDate = new Date(malaysiaDateStr);
        const todayString = malaysiaDate.toISOString().split('T')[0];
        const userWithDate = {
            ...user,
            registrationDate: todayString,
            timestamp: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'prebookUsers'), userWithDate);
        return docRef.id;
    } catch (e) {
        console.error('Error adding document: ', e);
        throw e;
    }
};

export const uploadFileToStorage = async (file) => {
    const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
    try {
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    } catch (e) {
        console.error("Error uploading file:", e);
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