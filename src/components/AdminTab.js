import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  History, 
  Loader2, 
  AlertCircle,
  UserCheck,
  Store,
  Crown,
  Camera,
  Image,
  Edit,
  Clock
} from 'lucide-react';

import AuthScreen from './AuthScreen';
import SimpleChart from './SimpleChart';
import EditHistoryModal from './EditHistoryModal';
import * as firebaseService from '../services/firebase';
import RechartsCharts from './SimpleChart';

const AdminTab = ({
  prebookUsers,
  todayOrders,
  todayUsers,
  historyData,
  loadingUsers,
  loadingOrders,
  loadingHistory,
  windowWidth,
  setSelectedImage,
  isAuthenticated,
  onAuth,
  resetAuth,
  showSuccessAnimation,    // ADD THIS
  showLoadingAnimation,    // ADD THIS  
  hideLoadingAnimation, 
  setShowImageCarousel,
  setSelectedImages,
  systemAvailability,
  driverCost,
  setDriverCost,
  dailySettings,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [timePeriod, setTimePeriod] = useState('months');
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
const [extendUntilTime, setExtendUntilTime] = useState('16:30');
const [adminPasscodeInput, setAdminPasscodeInput] = useState('');
const [emergencyLosses, setEmergencyLosses] = useState([]);
const [loadingLosses, setLoadingLosses] = useState(true);
const [showLossModal, setShowLossModal] = useState(false);
const [showLossList, setShowLossList] = useState(false);
const [editingLoss, setEditingLoss] = useState(null);
const [lossFormData, setLossFormData] = useState({
  amount: '',
  reason: '',
  date: new Date().toLocaleDateString('en-CA')
});
const [lossPasscode, setLossPasscode] = useState('');
const [visibleLossCount, setVisibleLossCount] = useState(3);
const [showCustomDriverCost, setShowCustomDriverCost] = useState(false);
const [customDriverCostInput, setCustomDriverCostInput] = useState('');
const [selectedOrderForAction, setSelectedOrderForAction] = useState(null);
const [showOrderActionModal, setShowOrderActionModal] = useState(false);
const [showOpenSystemModal, setShowOpenSystemModal] = useState(false);
const [openSystemPasscode, setOpenSystemPasscode] = useState('');
const [moneyDistributions, setMoneyDistributions] = useState([]);
const [loadingDistributions, setLoadingDistributions] = useState(true);
const [showDistributionModal, setShowDistributionModal] = useState(false);
const [showDistributionList, setShowDistributionList] = useState(false);
const [editingDistribution, setEditingDistribution] = useState(null);
const [showAdminNameModal, setShowAdminNameModal] = useState(false);
const [systemSettings, setSystemSettings] = useState({
  adminName: 'Admin',
  coFounders: ['Bryan Ngu', 'Yiek Siew Hao', 'Yeoh Sheng Ze', 'Charmaine Yong']
});
const [tempAdminName, setTempAdminName] = useState('');
const [adminNamePasscode, setAdminNamePasscode] = useState('');
const [distributionFormData, setDistributionFormData] = useState({
  totalAmount: '',
  adminName: '',
  distributions: {
    admin: { name: '', amount: 0, percentage: 5 },
    coFounder1: { name: 'Bryan Ngu', amount: 0, percentage: 20 },
    coFounder2: { name: 'Yiek Siew Hao', amount: 0, percentage: 20 },
    coFounder3: { name: 'Yeoh Sheng Ze', amount: 0, percentage: 20 },
    coFounder4: { name: 'Charmaine Yong', amount: 0, percentage: 20 },
    systemReserve: { name: 'Reserve Fund', amount: 0, percentage: 15 }
  },
  date: new Date().toLocaleDateString('en-CA')
});
const [distributionPasscode, setDistributionPasscode] = useState('');

  const VENDOR_MAP = {
  'mixue': { name: 'Mixue', icon: '🧋' },
  'dominos': { name: 'Dominos', icon: '🍕' },
  'ayam_gepuk': { name: 'Ayam Gepuk', icon: '🍗' },
  'family_mart': { name: 'Family Mart', icon: '🏪' },
  'bakers_cottage': { name: 'Baker\'s Cottage', icon: '🥐' },
  'zus_coffee': { name: 'Zus Coffee', icon: '☕' },
};

  const VENDOR_CATEGORIES = {
    'mixue': 1, 'dominos': 1, 'ayam_gepuk': 1, 'bakers_cottage': 1,
    'family_mart': 2,
    'zus_coffee': 3,
  };

  const calculateSuggestedDriverCost = (orders) => {
    if (!orders || orders.length === 0) return 0;
    const uniqueCategories = new Set(orders.map(order => VENDOR_CATEGORIES[order.vendor] || null).filter(Boolean));
    const categoryCount = uniqueCategories.size;
    if (categoryCount === 0) return 0;
    if (categoryCount === 1) return 30;
    if (categoryCount === 2) return 33;
    if (categoryCount >= 3) return 36;
    return 30;
  };

  const handleOpenSystem = async () => {
  if (openSystemPasscode !== 'byycky') {
    showSuccessAnimation(
      'Invalid Passcode',
      'Please enter the correct admin passcode.',
      null,
      2500,
      true
    );
    return;
  }

  const paidUsersCount = todayUsers.filter(u => u.commitmentPaid).length;
  
  if (paidUsersCount >= 3) {
    showSuccessAnimation(
      'System Already Active',
      'System is already open with 3 or more paid users.',
      null,
      2500,
      true
    );
    return;
  }

  if (paidUsersCount === 0) {
    showSuccessAnimation(
      'No Paid Users',
      'There must be at least 1 paid user to open the system early.',
      null,
      2500,
      true
    );
    return;
  }

  showLoadingAnimation('Opening system early...');
  
  try {
    // Set a flag in dailySettings to indicate early opening
    await firebaseService.setEarlySystemOpen(systemAvailability.deliveryDate, true);
    
    hideLoadingAnimation();
    setShowOpenSystemModal(false);
    setOpenSystemPasscode('');
    
    showSuccessAnimation(
      'System Opened Early!',
      `System is now open for ${paidUsersCount} paid user${paidUsersCount > 1 ? 's' : ''} to submit orders. Third user will need to pay deposit.`,
      null,
      4000
    );
  } catch (error) {
    hideLoadingAnimation();
    showSuccessAnimation(
      'Failed to Open System',
      error.message || 'Could not open system early. Please try again.',
      null,
      3000,
      true
    );
  }
};

  const handleExtendSystem = async () => {
  // Check if today is actually a delivery day
  const todayString = new Date().toLocaleDateString('en-CA', { timeZone: "Asia/Kuala_Lumpur" });
  const todayDate = new Date(todayString + 'T00:00:00');
  const todayDayOfWeek = todayDate.getDay();
  const DELIVERY_DAYS = [2, 5]; // Tuesday=2, Friday=5
  
  if (!DELIVERY_DAYS.includes(todayDayOfWeek)) {
    showSuccessAnimation(
      'Not a Delivery Day',
      'System extension is only available on delivery days (Tuesday and Friday).',
      null,
      3000,
      true
    );
    return;
  }

  if (adminPasscodeInput !== 'byycky') {
    showSuccessAnimation(
      'Invalid Passcode',
      'Please enter the correct admin passcode.',
      null,
      2500,
      true
    );
    return;
  }

  if (!extendUntilTime) {
    showSuccessAnimation(
      'No Time Selected',
      'Please select an extension time.',
      null,
      2500,
      true
    );
    return;
  }

  const [hours, minutes] = extendUntilTime.split(':').map(Number);
  
  if (hours < 15 || (hours === 15 && minutes === 0) || hours > 16 || (hours === 16 && minutes > 30)) {
    showSuccessAnimation(
      'Invalid Time Range',
      'Extension time must be between 3:01 PM and 4:30 PM.',
      null,
      2500,
      true
    );
    return;
  }

  showLoadingAnimation('Extending system...');
  
  try {
    await firebaseService.extendSystemCutoff(systemAvailability.deliveryDate, extendUntilTime);
    hideLoadingAnimation();
    setShowExtendModal(false);
    setAdminPasscodeInput('');
    setExtendUntilTime('16:30');
    
    const displayTime = new Date(`2000-01-01T${extendUntilTime}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    showSuccessAnimation(
      'System Extended!',
      `System will now remain open until ${displayTime} today.`,
      null,
      3000
    );
  } catch (error) {
    hideLoadingAnimation();
    showSuccessAnimation(
      'Extension Failed',
      error.message || 'Could not extend system. Please try again.',
      null,
      3000,
      true
    );
  }
};

  const profit = (todayUsers.filter(u => u.commitmentPaid).length * 10 + 
    todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0) - 
    (todayOrders.length > 0 ? driverCost : 0));

  const [localHistoryData, setLocalHistoryData] = useState(historyData);


  const handleAddLoss = () => {
  setEditingLoss(null);
  setLossFormData({
    amount: '',
    reason: '',
    date: new Date().toLocaleDateString('en-CA')
  });
  setLossPasscode('');
  setShowLossModal(true);
};

const handleResetHistoryEntry = async (entryId) => {
  const passcode = prompt('Enter admin passcode to reset this entry to live data:');
  if (passcode !== 'byyc') {
    showSuccessAnimation('Invalid Passcode', 'Incorrect admin passcode.', null, 2500, true);
    return;
  }

  if (!window.confirm('This will delete the manual edits and show live data instead. Continue?')) {
    return;
  }

  showLoadingAnimation('Resetting to live data...');
  try {
    // Call the new, safer function
    await firebaseService.resetHistoryEntryToLive(entryId);
    
    // Instead of filtering, we need to refetch or manually update the local state
    // For simplicity, we'll just visually remove the "edited" state locally
    setLocalHistoryData(prevHistory => 
      prevHistory.map(entry => 
        entry.id === entryId 
          ? { ...entry, totalRevenue: liveRevenue, profit: liveProfit, totalOrders: liveOrders, registeredUsers: liveRegisteredUsers } 
          : entry
      )
    );

    hideLoadingAnimation();
    showSuccessAnimation('Reset Complete!', 'Now showing live data for today.', null, 2500);
  } catch (error) {
    hideLoadingAnimation();
    showSuccessAnimation('Error', 'Failed to reset entry.', null, 2500, true);
    console.error('Reset error:', error);
  }
};

const handleEditLoss = (loss) => {
  setEditingLoss(loss);
  setLossFormData({
    amount: loss.amount.toString(),
    reason: loss.reason,
    date: loss.date
  });
  setLossPasscode('');
  setShowLossModal(true);
};

const handleDeleteLoss = async (lossId) => {
  const passcode = prompt('Enter admin passcode to delete this loss:');
  if (passcode !== 'byycky') {
    showSuccessAnimation('Invalid Passcode', 'Incorrect admin passcode.', null, 2500, true);
    return;
  }

  if (!window.confirm('Are you sure you want to delete this emergency loss entry?')) {
    return;
  }

  showLoadingAnimation('Deleting loss entry...');
  try {
    await firebaseService.deleteEmergencyLoss(lossId);
    const updatedLosses = emergencyLosses.filter(loss => loss.id !== lossId);
    setEmergencyLosses(updatedLosses);
    hideLoadingAnimation();
    showSuccessAnimation('Deleted!', 'Emergency loss entry has been removed.', null, 2500);
  } catch (error) {
    hideLoadingAnimation();
    showSuccessAnimation('Error', 'Failed to delete loss entry.', null, 2500, true);
  }
};

const handleSaveLoss = async () => {
  if (lossPasscode !== 'byycky') {
    showSuccessAnimation('Invalid Passcode', 'Incorrect admin passcode.', null, 2500, true);
    return;
  }

  if (!lossFormData.amount || !lossFormData.reason) {
    showSuccessAnimation('Missing Information', 'Please fill in all fields.', null, 2500, true);
    return;
  }

  const amount = parseFloat(lossFormData.amount);
  if (isNaN(amount) || amount <= 0) {
    showSuccessAnimation('Invalid Amount', 'Please enter a valid amount.', null, 2500, true);
    return;
  }

  showLoadingAnimation(editingLoss ? 'Updating loss...' : 'Adding loss...');
  
  try {
    if (editingLoss) {
      await firebaseService.updateEmergencyLoss(editingLoss.id, {
        amount: amount,
        reason: lossFormData.reason.trim(),
        date: lossFormData.date
      });
      const updatedLosses = emergencyLosses.map(loss =>
        loss.id === editingLoss.id
          ? { ...loss, amount, reason: lossFormData.reason.trim(), date: lossFormData.date }
          : loss
      );
      setEmergencyLosses(updatedLosses);
    } else {
      const lossId = await firebaseService.addEmergencyLoss({
        amount: amount,
        reason: lossFormData.reason.trim(),
        date: lossFormData.date
      });
      const newLoss = {
        id: lossId,
        amount,
        reason: lossFormData.reason.trim(),
        date: lossFormData.date,
        timestamp: new Date().toISOString()
      };
      setEmergencyLosses([newLoss, ...emergencyLosses]);
    }
    
    hideLoadingAnimation();
    setShowLossModal(false);
    setLossPasscode('');
    showSuccessAnimation(
      editingLoss ? 'Updated!' : 'Added!',
      `Emergency loss has been ${editingLoss ? 'updated' : 'recorded'}.`,
      null,
      2500
    );
  } catch (error) {
    hideLoadingAnimation();
    showSuccessAnimation('Error', 'Failed to save emergency loss.', null, 2500, true);
  }
};

const calculateDistributions = (totalAmount, adminName) => {
  const total = parseFloat(totalAmount) || 0;
  
  return {
    admin: { 
      name: adminName || 'Admin', 
      amount: total * 0.05, 
      percentage: 5 
    },
    coFounder1: { 
      name: 'Bryan Ngu', 
      amount: total * 0.20, 
      percentage: 20 
    },
    coFounder2: { 
      name: 'Yiek Siew Hao', 
      amount: total * 0.20, 
      percentage: 20 
    },
    coFounder3: { 
      name: 'Yeoh Sheng Ze', 
      amount: total * 0.20, 
      percentage: 20 
    },
    coFounder4: { 
      name: 'Charmaine Yong', 
      amount: total * 0.20, 
      percentage: 20 
    },
    systemReserve: { 
      name: 'Reserve Fund', 
      amount: total * 0.15, 
      percentage: 15 
    }
  };
};

const handleAddDistribution = () => {
  setEditingDistribution(null);
  setDistributionFormData({
    totalAmount: '',
    adminName: systemSettings.adminName,
    distributions: calculateDistributions(0, systemSettings.adminName),
    date: new Date().toLocaleDateString('en-CA')
  });
  setDistributionPasscode('');
  setShowDistributionModal(true);
};

const handleEditDistribution = (distribution) => {
  setEditingDistribution(distribution);
  setDistributionFormData({
    totalAmount: distribution.totalAmount.toString(),
    adminName: distribution.adminName,
    distributions: distribution.distributions,
    date: distribution.date
  });
  setDistributionPasscode('');
  setShowDistributionModal(true);
};

const handleDeleteDistribution = async (distributionId) => {
  const passcode = prompt('Enter admin passcode to delete this distribution:');
  if (passcode !== 'byycky') {
    showSuccessAnimation('Invalid Passcode', 'Incorrect admin passcode.', null, 2500, true);
    return;
  }

  if (!window.confirm('Are you sure you want to delete this money distribution entry?')) {
    return;
  }

  showLoadingAnimation('Deleting distribution entry...');
  try {
    await firebaseService.deleteMoneyDistribution(distributionId);
    const updatedDistributions = moneyDistributions.filter(dist => dist.id !== distributionId);
    setMoneyDistributions(updatedDistributions);
    hideLoadingAnimation();
    showSuccessAnimation('Deleted!', 'Money distribution entry has been removed.', null, 2500);
  } catch (error) {
    hideLoadingAnimation();
    showSuccessAnimation('Error', 'Failed to delete distribution entry.', null, 2500, true);
  }
};

const handleTotalAmountChange = (value) => {
  const newDistributions = calculateDistributions(value, distributionFormData.adminName);
  setDistributionFormData({
    ...distributionFormData,
    totalAmount: value,
    distributions: newDistributions
  });
};

const handleSaveDistribution = async () => {
  if (distributionPasscode !== 'byycky') {
    showSuccessAnimation('Invalid Passcode', 'Incorrect admin passcode.', null, 2500, true);
    return;
  }

  const totalAmount = parseFloat(distributionFormData.totalAmount);
  if (isNaN(totalAmount) || totalAmount <= 0) {
    showSuccessAnimation('Invalid Amount', 'Please enter a valid total amount.', null, 2500, true);
    return;
  }

  // ✅ NEW: Check if distribution amount exceeds available balance
  const availableBalance = getTotalHistoryStats().totalProfit - 
    moneyDistributions.reduce((sum, dist) => sum + (dist.totalAmount || 0), 0);
  
  if (!editingDistribution && totalAmount > availableBalance) {
    showSuccessAnimation(
      'Insufficient Balance',
      `Cannot distribute RM${totalAmount.toFixed(2)}. Available balance: RM${availableBalance.toFixed(2)}`,
      null,
      3500,
      true
    );
    return;
  }

  // If editing, check adjusted balance
  if (editingDistribution) {
    const adjustedBalance = availableBalance + editingDistribution.totalAmount;
    if (totalAmount > adjustedBalance) {
      showSuccessAnimation(
        'Insufficient Balance',
        `Cannot distribute RM${totalAmount.toFixed(2)}. Available balance: RM${adjustedBalance.toFixed(2)}`,
        null,
        3500,
        true
      );
      return;
    }
  }

  showLoadingAnimation(editingDistribution ? 'Updating distribution...' : 'Recording distribution...');
  
  try {
    const distributionData = {
      totalAmount: totalAmount,
      adminName: distributionFormData.adminName,
      distributions: distributionFormData.distributions,
      date: distributionFormData.date
    };

    if (editingDistribution) {
      await firebaseService.updateMoneyDistribution(editingDistribution.id, distributionData);
      // ✅ Update local state
      const updatedDistributions = moneyDistributions.map(dist =>
        dist.id === editingDistribution.id
          ? { ...dist, ...distributionData }
          : dist
      );
      setMoneyDistributions(updatedDistributions);
    } else {
      const distributionId = await firebaseService.addMoneyDistribution(distributionData);
      // ✅ Update local state
      const newDistribution = {
        id: distributionId,
        ...distributionData,
        timestamp: new Date().toISOString()
      };
      setMoneyDistributions([newDistribution, ...moneyDistributions]);
    }
    
    hideLoadingAnimation();
    setShowDistributionModal(false);
    setDistributionPasscode('');
    showSuccessAnimation(
      editingDistribution ? 'Updated!' : 'Recorded!',
      `Money distribution has been ${editingDistribution ? 'updated' : 'recorded'}.`,
      null,
      2500
    );
  } catch (error) {
    hideLoadingAnimation();
    showSuccessAnimation('Error', 'Failed to save money distribution.', null, 2500, true);
  }
};

const handleChangeAdminName = () => {
  setTempAdminName(systemSettings.adminName);
  setAdminNamePasscode('');
  setShowAdminNameModal(true);
};

const handleSaveAdminName = async () => {
  if (adminNamePasscode !== 'byycky') {
    showSuccessAnimation('Invalid Passcode', 'Incorrect admin passcode.', null, 2500, true);
    return;
  }

  if (!tempAdminName.trim()) {
    showSuccessAnimation('Invalid Name', 'Please enter a valid admin name.', null, 2500, true);
    return;
  }

  showLoadingAnimation('Updating admin name...');
  
  try {
    await firebaseService.updateAdminName(systemSettings.id, tempAdminName.trim());
    
    const updatedSettings = {
      ...systemSettings,
      adminName: tempAdminName.trim()
    };
    setSystemSettings(updatedSettings);
    
    // Update current distribution form if open
    setDistributionFormData(prev => ({
      ...prev,
      adminName: tempAdminName.trim(),
      distributions: {
        ...prev.distributions,
        admin: { ...prev.distributions.admin, name: tempAdminName.trim() }
      }
    }));
    
    hideLoadingAnimation();
    setShowAdminNameModal(false);
    setAdminNamePasscode('');
    showSuccessAnimation(
      'Admin Name Updated!',
      `Admin name has been changed to ${tempAdminName.trim()}.`,
      null,
      2500
    );
  } catch (error) {
    hideLoadingAnimation();
    showSuccessAnimation('Error', 'Failed to update admin name.', null, 2500, true);
  }
};

const handleDeleteOrder = async (orderId) => {
  const passcode = prompt('Enter admin passcode to delete this order:');
  if (passcode !== 'byycky') {
    showSuccessAnimation('Invalid Passcode', 'Incorrect admin passcode.', null, 2500, true);
    return;
  }

  if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
    return;
  }

  showLoadingAnimation('Deleting order...');
  try {
    await firebaseService.deleteOrder(orderId, systemAvailability.deliveryDate);
    hideLoadingAnimation();
    showSuccessAnimation('Order Deleted!', 'The order has been removed from the system.', null, 2500);
    setShowOrderActionModal(false);
    setSelectedOrderForAction(null);
  } catch (error) {
    hideLoadingAnimation();
    showSuccessAnimation('Error', 'Failed to delete order.', null, 2500, true);
    console.error('Delete order error:', error);
  }
};

const handleDeleteUser = async (userId) => {
  const passcode = prompt('Enter admin passcode to delete this user:');
  if (passcode !== 'byycky') {
    showSuccessAnimation('Invalid Passcode', 'Incorrect admin passcode.', null, 2500, true);
    return;
  }

  if (!window.confirm('Are you sure you want to delete this user? This will also delete any associated orders.')) {
    return;
  }

  showLoadingAnimation('Deleting user...');
  try {
    // First, find and delete any orders associated with this user
    const userOrders = todayOrders.filter(order => order.userId === userId);
    for (const order of userOrders) {
      await firebaseService.deleteOrder(order.id);
    }
    
    // Then delete the user
    await firebaseService.deleteUser(userId, systemAvailability.deliveryDate);
    
    hideLoadingAnimation();
    showSuccessAnimation('User Deleted!', 'The user and their orders have been removed from the system.', null, 2500);
    setShowOrderActionModal(false);
    setSelectedOrderForAction(null);
  } catch (error) {
    hideLoadingAnimation();
    showSuccessAnimation('Error', 'Failed to delete user.', null, 2500, true);
    console.error('Delete user error:', error);
  }
};

  useEffect(() => {
  setLocalHistoryData(historyData);
}, [historyData, driverCost]); // Add driverCost here


useEffect(() => {
  const fetchEmergencyLosses = async () => {
    if (!isAuthenticated) return;
    
    setLoadingLosses(true);
    try {
      const losses = await firebaseService.getEmergencyLosses();
      setEmergencyLosses(losses);
    } catch (error) {
      console.error('Error fetching emergency losses:', error);
    } finally {
      setLoadingLosses(false);
    }
  };

  fetchEmergencyLosses();
}, [isAuthenticated]);

useEffect(() => {
  const fetchSystemSettings = async () => {
    if (!isAuthenticated) return;
    
    try {
      const settings = await firebaseService.getSystemSettings();
      setSystemSettings(settings);
      
      // Update distribution form with current admin name
      setDistributionFormData(prev => ({
        ...prev,
        adminName: settings.adminName,
        distributions: {
          ...prev.distributions,
          admin: { ...prev.distributions.admin, name: settings.adminName }
        }
      }));
    } catch (error) {
      console.error('Error fetching system settings:', error);
    }
  };

  fetchSystemSettings();
}, [isAuthenticated]);

useEffect(() => {
  const fetchMoneyDistributions = async () => {
    if (!isAuthenticated) return;
    
    setLoadingDistributions(true);
    try {
      const distributions = await firebaseService.getMoneyDistributions();
      setMoneyDistributions(distributions);
    } catch (error) {
      console.error('Error fetching money distributions:', error);
    } finally {
      setLoadingDistributions(false);
    }
  };

  fetchMoneyDistributions();
}, [isAuthenticated]);

const todayHistoryEntry = localHistoryData.find(entry => entry.date === systemAvailability.deliveryDate);

const liveRegisteredUsers = todayUsers.length;
const liveOrders = todayOrders.length;
const firstThreePaidCount = Math.min(todayUsers.filter(u => u.commitmentPaid).length, 3);
const liveCommitmentFees = firstThreePaidCount * 10;
const liveDeliveryFees = todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);
const liveRevenue = liveCommitmentFees + liveDeliveryFees;

// This is the profit displayed on screen, which reacts to the driverCost buttons.
const liveProfit = liveRevenue - driverCost;

// --- Smart `isEdited` Check ---
const isEdited = (() => {
  if (!todayHistoryEntry) return false;

  // 1. Check foundational numbers. If these are edited, the warning must show.
  const usersEdited = todayHistoryEntry.registeredUsers !== liveRegisteredUsers;
  const ordersEdited = todayHistoryEntry.totalOrders !== liveOrders;
  const revenueEdited = todayHistoryEntry.totalRevenue !== liveRevenue;

  if (usersEdited || ordersEdited || revenueEdited) {
    return true;
  }

  // 2. Smart profit check. This is the key fix.
  // We check if the stored profit is consistent with the stored revenue and stored driver cost.
  // This detects if an admin ONLY changed the profit field in the modal.
  const storedDriverCost = todayHistoryEntry.driverCost || 30; // Use stored cost, or default to 30
  const expectedProfitFromStoredValues = todayHistoryEntry.totalRevenue - storedDriverCost;
  
  // Use a small tolerance for floating point comparisons
  const profitManuallyOverridden = Math.abs(todayHistoryEntry.profit - expectedProfitFromStoredValues) > 0.01;

  return profitManuallyOverridden;
})();

// Display values (use edited if available, otherwise use live)
const displayRegisteredUsers = todayHistoryEntry?.registeredUsers ?? liveRegisteredUsers;
const displayOrders = todayHistoryEntry?.totalOrders ?? liveOrders;
const displayRevenue = todayHistoryEntry?.totalRevenue ?? liveRevenue;
const displayProfit = isEdited ? (todayHistoryEntry?.profit ?? liveProfit) : liveProfit;

// For the breakdown display, always show live fees unless revenue was manually edited
const displayCommitmentFees = liveCommitmentFees;
const displayDeliveryFees = liveDeliveryFees;

  const styles = {
    card: { 
      backgroundColor: 'white', 
      borderRadius: '20px', 
      padding: '32px', 
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', 
      marginBottom: '24px', 
      border: '1px solid #f1f5f9' 
    },
    cardHeader: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px', 
      marginBottom: '24px' 
    },
    cardTitle: { 
      fontSize: '24px', 
      fontWeight: '700', 
      margin: 0, 
      color: '#1e293b' 
    },
    button: { 
      width: '100%', 
      padding: '16px 32px', 
      borderRadius: '12px', 
      fontWeight: '600', 
      border: 'none', 
      cursor: 'pointer', 
      fontSize: '16px', 
      transition: 'all 0.3s ease', 
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)' 
    },
    statCard: { 
      backgroundColor: 'white', 
      padding: '28px', 
      borderRadius: '16px', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '20px', 
      transition: 'all 0.3s ease', 
      cursor: 'pointer', 
      border: '1px solid #f1f5f9' 
    },
    statIcon: { 
      width: '64px', 
      height: '64px', 
      borderRadius: '16px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      flexShrink: 0 
    },
    statContent: { flex: 1, minWidth: 0 },
    statLabel: { 
      fontSize: '14px', 
      color: '#64748b', 
      marginBottom: '4px', 
      fontWeight: '500' 
    },
    statValue: { 
      fontSize: '28px', 
      fontWeight: 'bold', 
      color: '#1e293b', 
      lineHeight: '1.2' 
    }
  };

  const handleEditClick = (entry) => {
    setEditingEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleSaveChanges = async (entryId, updatedData) => {
    try {
      showLoadingAnimation('Updating history...');
      await firebaseService.updateHistoryEntry(entryId, updatedData);
      // Refresh data to show changes
      setLocalHistoryData(prevHistory => 
      prevHistory.map(entry => 
        entry.id === entryId ? { ...entry, ...updatedData } : entry
      )
    );
      hideLoadingAnimation();
      showSuccessAnimation('Success!', 'History entry has been updated.');
    } catch (error) {
      hideLoadingAnimation();
      alert('Failed to update history. Check console for errors.');
      console.error(error);
    }
  };

  const getTotalHistoryStats = () => {
    const totalRegistered = historyData.reduce((sum, entry) => sum + (entry.registeredUsers || 0), 0);
    const totalRevenue = historyData.reduce((sum, entry) => sum + (entry.totalRevenue || 0), 0);
    const totalOrders = historyData.reduce((sum, entry) => sum + (entry.totalOrders || 0), 0);
    
    // 1. Calculate the sum of historical profits from the history collection
    const grossProfit = historyData.reduce((sum, entry) => sum + (entry.profit || 0), 0);
    
    // 2. Calculate the sum of all emergency losses
    const totalEmergencyLosses = emergencyLosses.reduce((sum, loss) => sum + (loss.amount || 0), 0);

    // 3. Subtract losses from the profit to get the true net profit
    const netTotalProfit = grossProfit - totalEmergencyLosses;

    return { totalRegistered, totalRevenue, totalProfit: netTotalProfit, totalOrders };
  };
  // NEW: Get most ordered merchant
  const getMostOrderedMerchant = () => {
    const merchantCounts = {};
    todayOrders.forEach(order => {
      const merchant = order.vendor || order.merchant || 'Unknown';
      merchantCounts[merchant] = (merchantCounts[merchant] || 0) + 1;
    });

    historyData.forEach(entry => {
      if (entry.orders && Array.isArray(entry.orders)) {
        entry.orders.forEach(order => {
          const merchant = order.vendor || order.merchant || 'Unknown';
          merchantCounts[merchant] = (merchantCounts[merchant] || 0) + 1;
        });
      }
    });
    const sortedMerchants = Object.entries(merchantCounts).sort((a, b) => b[1] - a[1]);
    return sortedMerchants.length > 0 ? { name: sortedMerchants[0][0], orders: sortedMerchants[0][1] } : { name: 'N/A', orders: 0 };
  }//remeber to remove this shit and move it to the end of edits
  // NEW: Get highest spender
  const mostOrderedMerchant = getMostOrderedMerchant();
  const getHighestSpender = () => {
    const userSpending = {};
    todayOrders.forEach(order => {
      const userId = order.userId || order.studentId;
      const userName = order.userName || 'Unknown';
      const amount = order.orderTotal || 0;

      if (!userSpending[userId]) {
        userSpending[userId] = { name: userName, total: 0 };
      }
      userSpending[userId].total += amount;
    });

    const sortedSpenders = Object.values(userSpending).sort((a, b) => b.total - a.total);
    return sortedSpenders.length > 0 ? sortedSpenders[0] : { name: 'N/A', total: 0 };
  };

  // UPDATED: Get time series average profit data
  const getTimSeriesProfitData = (period) => {
    const data = {};

    historyData.forEach(entry => {
      const entryDate = new Date(entry.date);
      let label;

      if (period === 'weeks') {
        // Calculate week number or a consistent week label
        const startOfWeek = new Date(entryDate);
        startOfWeek.setDate(entryDate.getDate() - entryDate.getDay()); // Sunday as start of week
        label = `Week of ${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1}`;
      } else { // 'months'
        label = entryDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }

      if (!data[label]) {
        data[label] = { totalProfit: 0, count: 0 };
      }
      data[label].totalProfit += entry.profit || 0;
      data[label].count += 1;
    });

    // Calculate averages and format for chart
    const averagedData = Object.entries(data).map(([label, { totalProfit, count }]) => ({
      label,
      value: (totalProfit / count).toFixed(2), // Calculate average and format to 2 decimal places
      color: (totalProfit / count) >= 0 ? '#10b981' : '#ef4444'
    }));

    // Sort by date (important for line charts)
    averagedData.sort((a, b) => {
      const dateA = new Date(a.label.replace('Week of ', ''));
      const dateB = new Date(b.label.replace('Week of ', ''));
      return dateA - dateB;
    });

    // Limit to last 6 months or 7 weeks (adjust as needed)
    if (period === 'weeks') {
      return averagedData.slice(-7);
    } else {
      return averagedData.slice(-6);
    }
  };


  // NEW: Get merchant order distribution for all time
  const getMerchantDistribution = () => {
    const merchantCounts = {};

    historyData.forEach(entry => {
      if (entry.orders && Array.isArray(entry.orders)) {
        entry.orders.forEach(order => {
          const merchant = order.vendor || order.merchant || 'Unknown';
          merchantCounts[merchant] = (merchantCounts[merchant] || 0) + 1;
        });
      }
    });

    // Add today's orders if not in history
    const todayString = new Date().toISOString().split('T')[0];
    const todayInHistory = historyData.some(entry => entry.date === todayString);

    if (!todayInHistory) {
      todayOrders.forEach(order => {
        const merchant = order.vendor || order.merchant || 'Unknown';
        merchantCounts[merchant] = (merchantCounts[merchant] || 0) + 1;
      });
    }

    return Object.entries(merchantCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        label: name,
        value: count,
        color: '#8b5cf6'
      }));
  };

  // NEW: Get average order price by merchant (all time)
  const getAverageOrderPriceByMerchant = () => {
    const merchantStats = {}; // { merchantName: { totalRevenue: 0, orderCount: 0 } }

    // Process today's orders
    todayOrders.forEach(order => {
      const merchant = order.vendor || order.merchant || 'Unknown';
      const orderTotal = order.orderTotal || 0;

      if (!merchantStats[merchant]) {
        merchantStats[merchant] = { totalRevenue: 0, orderCount: 0 };
      }
      merchantStats[merchant].totalRevenue += orderTotal;
      merchantStats[merchant].orderCount += 1;
    });

    // Process historical orders
    historyData.forEach(entry => {
      if (entry.orders && Array.isArray(entry.orders)) {
        entry.orders.forEach(order => {
          const merchant = order.vendor || order.merchant || 'Unknown';
          const orderTotal = order.orderTotal || 0;

          if (!merchantStats[merchant]) {
            merchantStats[merchant] = { totalRevenue: 0, orderCount: 0 };
          }
          merchantStats[merchant].totalRevenue += orderTotal;
          merchantStats[merchant].orderCount += 1;
        });
      }
    });

    // Calculate average and format for chart
    const chartData = Object.entries(merchantStats)
      .filter(([, stats]) => stats.orderCount > 0) // Only include merchants with at least one order
      .map(([merchantName, stats]) => ({
        label: merchantName,
        value: (stats.totalRevenue / stats.orderCount).toFixed(2), // Average order price
        color: '#84cc16' // A nice green color for this chart
      }))
      .sort((a, b) => b.value - a.value); // Sort by average price descending

    return chartData.slice(0, 7); // Show top 7 merchants by average order price
  };
    if (!isAuthenticated) {
    // This wrapper will center the AuthScreen component
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh' // Ensures vertical centering
      }}>
        <AuthScreen title="Admin Dashboard" onAuth={onAuth} />
      </div>
    );
  }

  if (loadingUsers || loadingOrders || loadingHistory) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px', 
        backgroundColor: 'white', 
        borderRadius: '20px', 
        marginBottom: '32px' 
      }}>
        <Loader2 size={56} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '24px', color: '#64748b', fontSize: '18px' }}>
          Loading dashboard data...
        </p>
      </div>
    );
  }

  const paidUsers = todayUsers.filter(u => u.commitmentPaid).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return (
    <div>
      {!showHistory ? (
        <>
          {/* Header */}
<div style={{ 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: windowWidth > 1024 ? 'center' : 'flex-start',
  marginBottom: '32px', 
  flexDirection: windowWidth > 1024 ? 'row' : 'column',
  gap: windowWidth > 1024 ? '24px' : '16px'
}}>
  <div style={{ flex: windowWidth > 1024 ? '1' : 'none' }}>
    <h2 style={{ 
      margin: 0, 
      fontSize: windowWidth <= 480 ? '24px' : windowWidth <= 768 ? '28px' : '32px', 
      color: '#1e293b',
      fontWeight: '700'
    }}>
      Admin Dashboard
    </h2>
    <div>
  <p style={{ 
    margin: '8px 0 0 0', 
    color: '#64748b', 
    fontSize: windowWidth <= 480 ? '14px' : '16px' 
  }}>
    Delivery Date: {new Date(systemAvailability.deliveryDate + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}
  </p>
  {dailySettings?.extendedCutoffTime && (
    <p style={{
      margin: '4px 0 0 0',
      color: '#64748b',
      fontSize: windowWidth <= 480 ? '13px' : '15px',
      fontWeight: '600'
    }}>
      ⏰ Extended until {new Date(`2000-01-01T${dailySettings.extendedCutoffTime}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })} today
    </p>
  )}
</div>
  </div>
  
  <div style={{ 
    display: 'flex', 
    gap: windowWidth <= 480 ? '8px' : windowWidth <= 768 ? '10px' : '12px',
    flexWrap: windowWidth <= 768 ? 'wrap' : 'nowrap',
    width: windowWidth <= 768 ? '100%' : 'auto',
    flexShrink: 0
  }}>
    <button 
      onClick={() => setShowHistory(true)} 
      style={{ 
        ...styles.button, 
        flex: windowWidth <= 768 ? '1 1 calc(50% - 4px)' : '0 0 auto',
        minWidth: windowWidth <= 768 ? '0' : '140px',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 
        color: 'white', 
        padding: windowWidth <= 480 ? '12px 16px' : windowWidth <= 768 ? '12px 20px' : '14px 24px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '8px',
        fontSize: windowWidth <= 480 ? '14px' : '15px',
        whiteSpace: 'nowrap',
        width: windowWidth <= 768 ? 'auto' : 'auto'
      }}
    >
      <History size={windowWidth <= 480 ? 18 : 20} /> 
      {windowWidth <= 480 ? 'History' : 'View History'}
    </button>

    <button 
      onClick={() => setShowExtendModal(true)} 
      style={{ 
        ...styles.button, 
        flex: windowWidth <= 768 ? '1 1 calc(50% - 4px)' : '0 0 auto',
        minWidth: windowWidth <= 768 ? '0' : '120px',
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
        color: 'white', 
        padding: windowWidth <= 480 ? '12px 16px' : windowWidth <= 768 ? '12px 20px' : '14px 24px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '8px',
        fontSize: windowWidth <= 480 ? '14px' : '15px',
        whiteSpace: 'nowrap',
        width: windowWidth <= 768 ? 'auto' : 'auto'
      }}
    >
      <Clock size={windowWidth <= 480 ? 18 : 20} /> 
      Extend
    </button>

    <button 
  onClick={() => setShowOpenSystemModal(true)} 
  style={{ 
    ...styles.button, 
    flex: windowWidth <= 768 ? '1 1 calc(50% - 4px)' : '0 0 auto',
    minWidth: windowWidth <= 768 ? '0' : '140px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
    color: 'white', 
    padding: windowWidth <= 480 ? '12px 16px' : windowWidth <= 768 ? '12px 20px' : '14px 24px',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: '8px',
    fontSize: windowWidth <= 480 ? '14px' : '15px',
    whiteSpace: 'nowrap',
    width: windowWidth <= 768 ? 'auto' : 'auto'
  }}
>
  <UserCheck size={windowWidth <= 480 ? 18 : 20} /> 
  Open System
</button>
    
    <button 
      onClick={() => setShowConfirmPopup(true)}
      style={{ 
        ...styles.button, 
        flex: windowWidth <= 768 ? '1 1 100%' : '0 0 auto',
        minWidth: windowWidth <= 768 ? '0' : '140px',
        backgroundColor: '#ef4444', 
        color: 'white', 
        padding: windowWidth <= 480 ? '12px 16px' : windowWidth <= 768 ? '12px 20px' : '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: windowWidth <= 480 ? '14px' : '15px',
        whiteSpace: 'nowrap',
        width: windowWidth <= 768 ? '100%' : 'auto'
      }}
    >
      {windowWidth <= 480 ? 'Clear Sessions' : 'Clear All Sessions'}
    </button>
  </div>
</div>

          {/* Statistics Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: windowWidth <= 480 
              ? 'repeat(2, 1fr)' 
              : windowWidth <= 768 
              ? 'repeat(2, 1fr)' 
              : 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: windowWidth <= 480 ? '10px' : windowWidth <= 768 ? '16px' : '24px',
            marginBottom: windowWidth <= 480 ? '24px' : '40px' 
          }}>
            <div style={{
              ...styles.statCard,
              ...(windowWidth <= 768 ? {
                padding: windowWidth <= 480 ? '12px' : '16px',
                gap: windowWidth <= 480 ? '10px' : '12px',
              } : {})
            }}>
              <div style={{ 
                ...styles.statIcon, 
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                ...(windowWidth <= 768 ? {
                  width: windowWidth <= 480 ? '40px' : '48px',
                  height: windowWidth <= 480 ? '40px' : '48px',
                } : {})
              }}>
                <Users size={windowWidth <= 480 ? 20 : windowWidth <= 768 ? 24 : 32} color="#3b82f6" />
              </div>
              <div style={styles.statContent}>
                <p style={{
                  ...styles.statLabel,
                  ...(windowWidth <= 480 ? { fontSize: '11px' } : {})
                }}>Today's Registered</p>
                <p style={{
                  ...styles.statValue,
                  ...(windowWidth <= 480 ? { fontSize: '18px' } : {})
                }}>{displayRegisteredUsers}</p>
              </div>
            </div>

            <div style={{
              ...styles.statCard,
              ...(windowWidth <= 768 ? {
                padding: windowWidth <= 480 ? '12px' : '16px',
                gap: windowWidth <= 480 ? '10px' : '12px',
              } : {})
            }}>
              <div style={{ 
                ...styles.statIcon, 
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                ...(windowWidth <= 768 ? {
                  width: windowWidth <= 480 ? '40px' : '48px',
                  height: windowWidth <= 480 ? '40px' : '48px',
                } : {})
              }}>
                <Package size={windowWidth <= 480 ? 20 : windowWidth <= 768 ? 24 : 32} color="#ef4444" />
              </div>
              <div style={styles.statContent}>
                <p style={{
                  ...styles.statLabel,
                  ...(windowWidth <= 480 ? { fontSize: '11px' } : {})
                }}>Today's Orders</p>
                <p style={{
                  ...styles.statValue,
                  ...(windowWidth <= 480 ? { fontSize: '18px' } : {})
                }}>{displayOrders}</p>
              </div>
            </div>

            <div style={{
              ...styles.statCard,
              ...(windowWidth <= 768 ? {
                padding: windowWidth <= 480 ? '12px' : '16px',
                gap: windowWidth <= 480 ? '10px' : '12px',
              } : {})
            }}>
              <div style={{ 
                ...styles.statIcon, 
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                ...(windowWidth <= 768 ? {
                  width: windowWidth <= 480 ? '40px' : '48px',
                  height: windowWidth <= 480 ? '40px' : '48px',
                } : {})
              }}>
                <DollarSign size={windowWidth <= 480 ? 20 : windowWidth <= 768 ? 24 : 32} color="#f59e0b" />
              </div>
              <div style={styles.statContent}>
                <p style={{
                  ...styles.statLabel,
                  ...(windowWidth <= 480 ? { fontSize: '11px' } : {})
                }}>Today's Revenue</p>
                <p style={{
                  ...styles.statValue,
                  ...(windowWidth <= 480 ? { fontSize: '18px' } : {})
                }}>
                  RM{displayRevenue.toFixed(2)}
                </p>
              </div>
            </div>

            <div style={{
              ...styles.statCard,
              ...(windowWidth <= 768 ? {
                padding: windowWidth <= 480 ? '12px' : '16px',
                gap: windowWidth <= 480 ? '10px' : '12px',
              } : {})
            }}>
              <div style={{ 
                ...styles.statIcon, 
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                ...(windowWidth <= 768 ? {
                  width: windowWidth <= 480 ? '40px' : '48px',
                  height: windowWidth <= 480 ? '40px' : '48px',
                } : {})
              }}>
                <TrendingUp size={windowWidth <= 480 ? 20 : windowWidth <= 768 ? 24 : 32} color="#10b981" />
              </div>
              <div style={styles.statContent}>
                <p style={{
                  ...styles.statLabel,
                  ...(windowWidth <= 480 ? { fontSize: '11px' } : {})
                }}>Today's Profit</p>
                <p style={{
                  ...styles.statValue,
                  ...(windowWidth <= 480 ? { fontSize: '18px' } : {})
                }}>
                  RM{displayProfit.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Profit Breakdown - Add responsive wrapper */}
<div style={{
  ...styles.card,
  padding: windowWidth <= 480 ? '16px' : windowWidth <= 768 ? '20px' : '32px'
}}>
  {/* Driver Cost Selector */}
  <div style={{
    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    border: '2px solid #3b82f6',
    borderRadius: '16px',
    padding: windowWidth <= 480 ? '16px' : windowWidth <= 768 ? '20px' : '24px',
    marginBottom: windowWidth <= 480 ? '16px' : '24px',
    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.15)'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: windowWidth <= 480 ? '8px' : '12px',
      marginBottom: windowWidth <= 480 ? '12px' : '16px',
      flexWrap: windowWidth <= 480 ? 'wrap' : 'nowrap'
    }}>
      <div style={{ flex: 1, minWidth: windowWidth <= 480 ? '100%' : '0' }}>
        <h4 style={{
          margin: 0,
          fontSize: windowWidth <= 480 ? '15px' : windowWidth <= 768 ? '16px' : '18px',
          color: '#1e40af',
          fontWeight: '700'
        }}>
          Driver Cost
        </h4>
        <p style={{
          margin: '4px 0 0 0',
          fontSize: windowWidth <= 480 ? '13px' : windowWidth <= 768 ? '12px' : '13px',
          color: '#3b82f6',
          fontWeight: '600'
        }}>
          Current: RM{driverCost.toFixed(2)}
        </p>
      </div>
    </div>
    
    <div style={{
  display: 'grid',
  gridTemplateColumns: windowWidth <= 480 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
  gap: windowWidth <= 480 ? '8px' : windowWidth <= 768 ? '10px' : '12px'
}}>
  <button
    onClick={() => {
      setDriverCost(30);
      setShowCustomDriverCost(false);
    }}
    style={{
      padding: windowWidth <= 480 ? '14px 8px' : windowWidth <= 768 ? '16px 12px' : '22px 16px',
      borderRadius: windowWidth <= 480 ? '10px' : '12px',
      border: driverCost === 30 && !showCustomDriverCost ? '3px solid #3b82f6' : '2px solid #cbd5e1',
      backgroundColor: driverCost === 30 && !showCustomDriverCost ? '#ffffff' : '#f8fafc',
      color: driverCost === 30 && !showCustomDriverCost ? '#1e40af' : '#64748b',
      fontWeight: '700',
      cursor: 'pointer',
      fontSize: windowWidth <= 480 ? '13px' : windowWidth <= 768 ? '15px' : '17px',
      transition: 'all 0.2s ease',
      boxShadow: driverCost === 30 && !showCustomDriverCost ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: windowWidth <= 480 ? '4px' : '8px',
      minHeight: windowWidth <= 480 ? '70px' : windowWidth <= 768 ? '80px' : '95px'
    }}
  >
    <span style={{ fontSize: windowWidth <= 480 ? '16px' : windowWidth <= 768 ? '18px' : '22px', lineHeight: '1' }}>
      RM30
    </span>
    <span style={{ fontSize: windowWidth <= 480 ? '9px' : windowWidth <= 768 ? '10px' : '12px', fontWeight: '500', opacity: 0.7, lineHeight: '1.2' }}>
      1 Category
    </span>
  </button>
  
  <button
    onClick={() => {
      setDriverCost(33);
      setShowCustomDriverCost(false);
    }}
    style={{
      padding: windowWidth <= 480 ? '14px 8px' : windowWidth <= 768 ? '16px 12px' : '22px 16px',
      borderRadius: windowWidth <= 480 ? '10px' : '12px',
      border: driverCost === 33 && !showCustomDriverCost ? '3px solid #3b82f6' : '2px solid #cbd5e1',
      backgroundColor: driverCost === 33 && !showCustomDriverCost ? '#ffffff' : '#f8fafc',
      color: driverCost === 33 && !showCustomDriverCost ? '#1e40af' : '#64748b',
      fontWeight: '700',
      cursor: 'pointer',
      fontSize: windowWidth <= 480 ? '13px' : windowWidth <= 768 ? '15px' : '17px',
      transition: 'all 0.2s ease',
      boxShadow: driverCost === 33 && !showCustomDriverCost ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: windowWidth <= 480 ? '4px' : '8px',
      minHeight: windowWidth <= 480 ? '70px' : windowWidth <= 768 ? '80px' : '95px'
    }}
  >
    <span style={{ fontSize: windowWidth <= 480 ? '16px' : windowWidth <= 768 ? '18px' : '22px', lineHeight: '1' }}>
      RM33
    </span>
    <span style={{ fontSize: windowWidth <= 480 ? '9px' : windowWidth <= 768 ? '10px' : '12px', fontWeight: '500', opacity: 0.7, lineHeight: '1.2' }}>
      2 Categories
    </span>
  </button>
  
  <button
    onClick={() => {
      setDriverCost(36);
      setShowCustomDriverCost(false);
    }}
    style={{
      padding: windowWidth <= 480 ? '14px 8px' : windowWidth <= 768 ? '16px 12px' : '22px 16px',
      borderRadius: windowWidth <= 480 ? '10px' : '12px',
      border: driverCost === 36 && !showCustomDriverCost ? '3px solid #3b82f6' : '2px solid #cbd5e1',
      backgroundColor: driverCost === 36 && !showCustomDriverCost ? '#ffffff' : '#f8fafc',
      color: driverCost === 36 && !showCustomDriverCost ? '#1e40af' : '#64748b',
      fontWeight: '700',
      cursor: 'pointer',
      fontSize: windowWidth <= 480 ? '13px' : windowWidth <= 768 ? '15px' : '17px',
      transition: 'all 0.2s ease',
      boxShadow: driverCost === 36 && !showCustomDriverCost ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: windowWidth <= 480 ? '4px' : '8px',
      minHeight: windowWidth <= 480 ? '70px' : windowWidth <= 768 ? '80px' : '95px'
    }}
  >
    <span style={{ fontSize: windowWidth <= 480 ? '16px' : windowWidth <= 768 ? '18px' : '22px', lineHeight: '1' }}>
      RM36
    </span>
    <span style={{ fontSize: windowWidth <= 480 ? '9px' : windowWidth <= 768 ? '10px' : '12px', fontWeight: '500', opacity: 0.7, lineHeight: '1.2' }}>
      3+ Categories
    </span>
  </button>

  <button
    onClick={() => setShowCustomDriverCost(!showCustomDriverCost)}
    style={{
      padding: windowWidth <= 480 ? '14px 8px' : windowWidth <= 768 ? '16px 12px' : '22px 16px',
      borderRadius: windowWidth <= 480 ? '10px' : '12px',
      border: showCustomDriverCost ? '3px solid #ef4444' : '2px solid #cbd5e1',
      backgroundColor: showCustomDriverCost ? '#ffffff' : '#f8fafc',
      color: showCustomDriverCost ? '#991b1b' : '#64748b',
      fontWeight: '700',
      cursor: 'pointer',
      fontSize: windowWidth <= 480 ? '13px' : windowWidth <= 768 ? '15px' : '17px',
      transition: 'all 0.2s ease',
      boxShadow: showCustomDriverCost ? '0 4px 12px rgba(239, 68, 68, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: windowWidth <= 480 ? '4px' : '8px',
      minHeight: windowWidth <= 480 ? '70px' : windowWidth <= 768 ? '80px' : '95px'
    }}
  >
    <span style={{ fontSize: windowWidth <= 480 ? '16px' : windowWidth <= 768 ? '18px' : '22px', lineHeight: '1' }}>
      Custom
    </span>
    <span style={{ fontSize: windowWidth <= 480 ? '9px' : windowWidth <= 768 ? '10px' : '12px', fontWeight: '500', opacity: 0.7, lineHeight: '1.2' }}>
      Emergency
    </span>
  </button>
</div>

{showCustomDriverCost && (
  <div style={{
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#fef2f2',
    borderRadius: '12px',
    border: '2px solid #ef4444'
  }}>
    <label style={{
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#991b1b'
    }}>
      Enter Custom Driver Cost (RM):
    </label>
    <div style={{ display: 'flex', gap: '8px' }}>
      <input
        type="number"
        min="0"
        value={customDriverCostInput}
        onChange={(e) => setCustomDriverCostInput(e.target.value)}
        placeholder="e.g., 40"
        style={{
          flex: 1,
          padding: '12px',
          borderRadius: '8px',
          border: '2px solid #fecaca',
          fontSize: '16px',
          fontWeight: '600'
        }}
      />
      <button
        onClick={() => {
          const amount = parseFloat(customDriverCostInput);
          if (!isNaN(amount) && amount >= 0) {
            setDriverCost(amount);
            showSuccessAnimation(
              'Driver Cost Updated',
              `Driver cost set to RM${amount.toFixed(2)}`,
              null,
              2000
            );
          } else {
            showSuccessAnimation(
              'Invalid Amount',
              'Please enter a valid number',
              null,
              2000,
              true
            );
          }
        }}
        style={{
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#ef4444',
          color: 'white',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        Set
      </button>
    </div>
  </div>
)}
  </div>
  
  <h3 style={{ 
    fontSize: windowWidth <= 480 ? '16px' : windowWidth <= 768 ? '18px' : '20px', 
    marginBottom: windowWidth <= 480 ? '12px' : '20px',
    fontWeight: '700',
    color: '#1e293b'
  }}>
    Today's Profit Calculation
  </h3>
  
  {isEdited && (
  <div style={{
    backgroundColor: '#fef3c7',
    border: '2px solid #f59e0b',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Edit size={20} color="#d97706" />
      <span style={{
        fontSize: '14px',
        fontWeight: '600',
        color: '#92400e'
      }}>
        ⚠️ This calculation has been manually edited by admin
      </span>
    </div>
    <button
      onClick={() => handleResetHistoryEntry(todayHistoryEntry.id)}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#3b82f6',
        color: 'white',
        fontWeight: '600',
        fontSize: '13px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M3 21v-5h5"/>
      </svg>
      Reset to Live Data
    </button>
  </div>
)}

            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: windowWidth <= 480 ? '12px' : windowWidth <= 768 ? '16px' : '24px', 
              borderRadius: '16px',
              marginBottom: windowWidth <= 480 ? '16px' : '24px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span style={{ 
                  fontSize: windowWidth <= 480 ? '13px' : '16px',
                  lineHeight: '1.4'
                }}>
                  Commitment Fees ({firstThreePaidCount} × RM10):
                </span>
                <span style={{ 
                  fontWeight: 'bold', 
                  fontSize: windowWidth <= 480 ? '13px' : '16px' 
                }}>
                  +RM{displayCommitmentFees.toFixed(2)}
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span style={{ 
                  fontSize: windowWidth <= 480 ? '13px' : '16px',
                  lineHeight: '1.4'
                }}>
                  Delivery Fees ({liveOrders} order{liveOrders !== 1 ? 's' : ''}):
                </span>
                <span style={{ 
                  fontWeight: 'bold', 
                  fontSize: windowWidth <= 480 ? '13px' : '16px' 
                }}>
                  +RM{displayDeliveryFees.toFixed(2)}
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                borderTop: '2px solid #e2e8f0',
                paddingTop: '12px',
                marginTop: '12px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span style={{ 
                  fontSize: windowWidth <= 480 ? '14px' : '16px',
                  lineHeight: '1.4'
                }}>
                  Total Revenue:
                </span>
                <span style={{ 
                  fontWeight: 'bold', 
                  fontSize: windowWidth <= 480 ? '14px' : '16px',
                  color: isEdited ? '#f59e0b' : '#1e293b'
                }}>
                  RM{displayRevenue.toFixed(2)}
                  {isEdited && <span style={{ fontSize: '12px', marginLeft: '4px' }}>*</span>}
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginTop: '12px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span style={{ 
                  fontSize: windowWidth <= 480 ? '13px' : '16px',
                  lineHeight: '1.4'
                }}>
                  Driver Cost:
                </span>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: '#dc2626', 
                  fontSize: windowWidth <= 480 ? '13px' : '16px' 
                }}>
                  -RM{driverCost.toFixed(2)}
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                borderTop: '2px solid #1e293b',
                paddingTop: '12px',
                marginTop: '12px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span style={{ 
                  fontSize: windowWidth <= 480 ? '16px' : '20px', 
                  fontWeight: 'bold',
                  lineHeight: '1.4'
                }}>
                  Today's Profit:
                </span>
                <span style={{ 
                  fontSize: windowWidth <= 480 ? '16px' : '20px', 
                  fontWeight: 'bold', 
                  color: displayProfit >= 0 ? '#059669' : '#dc2626' 
                }}>
                  RM{displayProfit.toFixed(2)}
                  {isEdited && <span style={{ fontSize: '14px', marginLeft: '4px' }}>*</span>}
                </span>
              </div>

              {isEdited && (
                <p style={{
                  fontSize: '12px',
                  color: '#92400e',
                  marginTop: '12px',
                  marginBottom: 0,
                  fontStyle: 'italic'
                }}>
                  * Values marked with asterisk have been manually edited by admin
                </p>
              )}
              </div>
                          </div>

          {/* Awaiting Orders Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <UserCheck color="#f59e0b" size={28} />
              <h2 style={styles.cardTitle}>Awaiting Order Submission (First three users only)</h2>
            </div>
            
            {(() => {
  // Get first 3 paid users who haven't ordered
  const firstThreePaidUsers = todayUsers
    .filter(u => u.commitmentPaid)
    .sort((a, b) => new Date(a.receiptUploadTime || a.timestamp) - new Date(b.receiptUploadTime || b.timestamp))
    .slice(0, 3);
  
  const awaitingUsers = firstThreePaidUsers.filter(user => !user.orderSubmitted);
  
  return awaitingUsers.length > 0 ? (
              <div style={{ 
                display: 'grid', 
                gap: '12px', 
                marginTop: '16px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
              }}>
                {awaitingUsers.map(user => {
  const vendorInfo = VENDOR_MAP[user.vendor] || { name: user.vendor || 'No vendor', icon: '🏪' };
  
  return (
    <div key={user.id} style={{ 
      padding: '12px', 
      backgroundColor: '#fffbeb', 
      border: '1px solid #fef3c7', 
      borderRadius: '8px',
      display: 'flex',                    // ADD THIS
  justifyContent: 'space-between',    // ADD THIS
  alignItems: 'center'
    }}>
      <div>
      <p style={{ margin: 0, fontWeight: '600', color: '#92400e' }}>{user.name}</p>
      <p style={{margin: '2px 0 0 0', fontSize: windowWidth <= 480 ? '11px' : '12px', color: '#b45309', fontWeight: '500'}}>Contact: {user.contactNumber || 'Not provided'}</p>
      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#78350f', textTransform: 'uppercase' }}>{user.vendor || 'No vendor'}</p>
      </div>
      
      {/* Vendor badge */}
      <div style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        backgroundColor: '#eef2ff',
        color: '#b45309',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: '600',
        border: '1px solid #c7d2fe',
        flexShrink: 0
      }}>
        <span>{vendorInfo.icon}</span>
        <span>{windowWidth <= 480 ? vendorInfo.name.substring(0, 10) : vendorInfo.name}</span>
      </div>
    </div>
  );
})}
          </div>
        ) : (
          <p style={{ marginTop: '20px', color: '#64748b', textAlign: 'center' }}>
            All first 3 paid users have submitted their orders.
          </p>
        );
      })()}
          </div>

          {/* Payment & Order Verification Card */}
<div style={styles.card}>
  <div style={styles.cardHeader}>
    <Camera color="#8b5cf6" size={28} />
    <h2 style={styles.cardTitle}>Payment & Order Verification</h2>
  </div>
  
  {todayUsers.length > 0 ? (
    <div style={{
      display: 'grid',
      gridTemplateColumns: windowWidth <= 480 
  ? '1fr' 
  : windowWidth <= 768 
  ? 'repeat(auto-fit, minmax(280px, 1fr))' 
  : windowWidth <= 1200
  ? 'repeat(auto-fit, minmax(320px, 1fr))'
  : 'repeat(3, 1fr)',
      gap: windowWidth <= 480 ? '12px' : '16px'
    }}>
      {todayUsers.map((user, userIndex) => {
        const userOrder = todayOrders.find(order => order.userId === user.firestoreId);
// Get the first 3 users who PAID (by payment time, not registration time)
const firstThreePaidUsers = todayUsers
  .filter(u => u.commitmentPaid) // <-- CORRECTED: Removed isToday()
  .sort((a, b) => new Date(a.receiptUploadTime || a.timestamp) - new Date(b.receiptUploadTime || b.timestamp))
  .slice(0, 3);

const isFirstThreeUser = firstThreePaidUsers.some(paidUser => paidUser.firestoreId === user.firestoreId);
        
        return (
          <div key={user.id} style={{
            backgroundColor: '#f8fafc',
            border: user.commitmentPaid 
              ? '2px solid #10b981' 
              : '2px solid #f59e0b',
            borderRadius: '16px',
            padding: windowWidth <= 480 ? '16px' : '20px',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}>
            {/* First Three Users Badge - Only for users who are actually in first 3 paid */}
{isFirstThreeUser && (
  <div style={{
    position: 'absolute',
    top: '-8px',
    right: '16px',
    backgroundColor: '#7c3aed',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: windowWidth <= 480 ? '10px' : '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)'
  }}>
    First 3 Paid User
  </div>
)}

            {/* User Header with Combined Info */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: windowWidth <= 480 ? '14px' : '16px',
              marginBottom: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              {/* User Basic Info Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: userOrder ? '12px' : '0'
              }}>
                <div>
                  <h4 style={{
                    margin: 0,
                    fontSize: windowWidth <= 480 ? '15px' : '17px',
                    color: '#1e293b',
                    fontWeight: '700'
                  }}>
                    {user.name}
                  </h4>
                  <p style={{
  margin: '2px 0 0 0',
  fontSize: windowWidth <= 480 ? '11px' : '12px',
  color: '#64748b',
  fontWeight: '500'
}}>
  Contact: {user.contactNumber || 'Not provided'}
</p>
                  <p style={{
  margin: '2px 0 0 0',
  fontSize: windowWidth <= 480 ? '10px' : '11px',
  color: '#1e293b',
  fontWeight: '600',
  textTransform: 'uppercase'
}}>
  {user.vendor || 'No vendor'}
</p>
                </div>
                
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: windowWidth <= 480 ? '10px' : '11px',
                  fontWeight: '700',
                  backgroundColor: user.commitmentPaid ? '#d1fae5' : '#fef3c7',
                  color: user.commitmentPaid ? '#065f46' : '#92400e',
                  border: `2px solid ${user.commitmentPaid ? '#86efac' : '#fcd34d'}`
                }}>
                  {user.commitmentPaid ? 'PAID' : 'PENDING'}
                </div>
              </div>

              {/* Order Summary (if order exists) */}
              {userOrder && (
                <div style={{
                  backgroundColor: '#f1f5f9',
                  borderRadius: '8px',
                  padding: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
  <span style={{
    fontSize: windowWidth <= 480 ? '11px' : '12px',
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }}>
    Order #{userOrder.orderNumber}
  </span>
  <span style={{
    fontSize: windowWidth <= 480 ? '10px' : '11px',
    color: '#64748b',
    fontWeight: '500'
  }}>
    Submitted: {new Date(userOrder.timestamp).toLocaleString('en-MY', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })}
  </span>
</div>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: windowWidth <= 480 ? '1fr 1fr' : '1fr 1fr 1fr',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      textAlign: 'center',
                      padding: '8px',
                      backgroundColor: 'white',
                      borderRadius: '6px'
                    }}>
                      <div style={{
                        fontSize: windowWidth <= 480 ? '10px' : '11px',
                        color: '#64748b',
                        marginBottom: '2px'
                      }}>
                        Order Total
                      </div>
                      <div style={{
                        fontSize: windowWidth <= 480 ? '13px' : '14px',
                        fontWeight: 'bold',
                        color: '#059669'
                      }}>
                        RM{userOrder.orderTotal.toFixed(2)}
                      </div>
                    </div>
                    
                    <div style={{
                      textAlign: 'center',
                      padding: '8px',
                      backgroundColor: 'white',
                      borderRadius: '6px'
                    }}>
                      <div style={{
                        fontSize: windowWidth <= 480 ? '10px' : '11px',
                        color: '#64748b',
                        marginBottom: '2px'
                      }}>
                        Delivery Fee
                      </div>
                      <div style={{
                        fontSize: windowWidth <= 480 ? '13px' : '14px',
                        fontWeight: 'bold',
                        color: '#f59e0b'
                      }}>
                        RM{userOrder.deliveryFee.toFixed(2)}
                      </div>
                    </div>
                    
                    <div style={{
                      textAlign: 'center',
                      padding: '8px',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '6px',
                      border: '1px solid #bbf7d0',
                      gridColumn: windowWidth <= 480 ? '1 / -1' : 'auto'
                    }}>
                      <div style={{
                        fontSize: windowWidth <= 480 ? '10px' : '11px',
                        color: '#166534',
                        marginBottom: '2px'
                      }}>
                        Total with Delivery
                      </div>
                      <div style={{
                        fontSize: windowWidth <= 480 ? '14px' : '16px',
                        fontWeight: 'bold',
                        color: '#166534'
                      }}>
                        RM{(userOrder.totalWithDelivery + (isFirstThreeUser ? 10 : 0)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Photo Verification Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: windowWidth <= 768 
                ? (isFirstThreeUser ? 'repeat(2, 1fr)' : '1fr 1fr')
                : (isFirstThreeUser ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)'),
              gap: '8px'
            }}>
              {/* Base Delivery Fee (Only for first 3 paid users OR unpaid users when system not active) */}
{(isFirstThreeUser || (!user.commitmentPaid && prebookUsers.filter(u => u.commitmentPaid).length < 3)) && (
  <button
    onClick={() => {
      if (user.receiptURL) {
        setSelectedImage(user.receiptURL);
      } else {
        alert('No base delivery fee payment photo available');
      }
    }}
    style={{
      backgroundColor: user.receiptURL ? '#dbeafe' : '#f3f4f6',
      border: `2px solid ${user.receiptURL ? '#3b82f6' : '#d1d5db'}`,
      borderRadius: '8px',
      padding: windowWidth <= 480 ? '10px' : '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      ...(windowWidth <= 768 && isFirstThreeUser ? { gridColumn: '1 / -1' } : {})
    }}
  >
    <Camera size={16} color={user.receiptURL ? '#3b82f6' : '#9ca3af'} />
    <span style={{
      fontSize: windowWidth <= 480 ? '10px' : '11px',
      fontWeight: '600',
      color: user.receiptURL ? '#1e40af' : '#6b7280',
      textAlign: 'center'
    }}>
      Base Fee (RM10)
    </span>
  </button>
)}

              {/* Order Receipt */}
              <button
                // Replace this onClick:
onClick={() => {
  const orderImages = userOrder?.orderImageURLs;
  if (orderImages && orderImages.length > 0) {
    if (orderImages.length === 1) {
      setSelectedImage(orderImages[0]);
    } else {
      setSelectedImages(orderImages);
      setShowImageCarousel(true);
    }
  } else {
    alert('No order receipt photo available');
  }
}}
                style={{
                  backgroundColor: (userOrder?.orderImageURLs && userOrder.orderImageURLs.length > 0) ? '#fef3c7' : '#f3f4f6',
border: `2px solid ${(userOrder?.orderImageURLs && userOrder.orderImageURLs.length > 0) ? '#f59e0b' : '#d1d5db'}`,
                  borderRadius: '8px',
                  padding: windowWidth <= 480 ? '10px' : '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Image size={16} color={(userOrder?.orderImageURLs && userOrder.orderImageURLs.length > 0) ? '#f59e0b' : '#9ca3af'} />
                <span style={{
                  fontSize: windowWidth <= 480 ? '10px' : '11px',
                  fontWeight: '600',
                  color: (userOrder?.orderImageURLs && userOrder.orderImageURLs.length > 0) ? '#92400e' : '#6b7280',
                  textAlign: 'center'
                }}>
                  Order Receipt
                </span>
                {(userOrder?.orderImageURLs && userOrder.orderImageURLs.length > 0) && (
                  <span style={{
                    fontSize: '9px',
                    color: '#059669',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                  </span>
                )}
              </button>

              {/* Delivery Fee Payment */}
              <button
                onClick={() => {
  const deliveryPayment = userOrder?.paymentProofURL;
  if (deliveryPayment) {
    setSelectedImage(deliveryPayment);
  } else {
    alert('No delivery fee payment photo available');
  }
}}
                style={{
                  backgroundColor: userOrder?.paymentProofURL ? '#d1fae5' : '#f3f4f6',
border: `2px solid ${userOrder?.paymentProofURL ? '#10b981' : '#d1d5db'}`,
                  borderRadius: '8px',
                  padding: windowWidth <= 480 ? '10px' : '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Camera size={16} color={userOrder?.paymentProofURL ? '#10b981' : '#9ca3af'} />
                <span style={{
                  fontSize: windowWidth <= 480 ? '10px' : '11px',
                  fontWeight: '600',
                  color: (userOrder?.deliveryPaymentPhoto || userOrder?.deliveryPayment || userOrder?.deliveryFeePhoto) ? '#065f46' : '#6b7280',
                  textAlign: 'center'
                }}>
                  Delivery Payment
                </span>
                {(userOrder?.deliveryPaymentPhoto || userOrder?.deliveryPayment || userOrder?.deliveryFeePhoto) && (
                  <span style={{
                    fontSize: '9px',
                    color: '#059669',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    VIEW
                  </span>
                )}
              </button>
            </div>

            {/* Summary Footer - FIXED CALCULATION */}
            <div style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: user.commitmentPaid ? '#f0fdf4' : '#fffbeb',
              borderRadius: '8px',
              border: `1px solid ${user.commitmentPaid ? '#bbf7d0' : '#fde68a'}`
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: windowWidth <= 480 ? '11px' : '12px',
                  fontWeight: '600',
                  color: user.commitmentPaid ? '#166534' : '#92400e'
                }}>
                  Total Paid to System:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
  <span style={{
  fontSize: windowWidth <= 480 ? '14px' : '16px',
  fontWeight: 'bold',
  color: user.commitmentPaid ? '#166534' : '#92400e'
}}>
  RM{(() => {
    let total = 0;
    // ✅ CHANGE: Use the same firstThreePaidUsers logic
    const isAmongFirstThreePaid = firstThreePaidUsers.some(paidUser => paidUser.firestoreId === user.firestoreId);
    if (isAmongFirstThreePaid) {
      total += 10; // Base delivery fee
    }
    if (userOrder?.deliveryFee) {
      total += userOrder.deliveryFee;
    }
    return total.toFixed(2);
  })()}
</span>
{(() => {
  const isAmongFirstThreePaid = firstThreePaidUsers.some(paidUser => paidUser.firestoreId === user.firestoreId);  
  return isAmongFirstThreePaid ? (
    <span style={{
      fontSize: windowWidth <= 480 ? '9px' : '10px',
      color: '#166534',
      fontWeight: '500',
      marginTop: '2px',
      textAlign: 'right'
    }}>
      (incl. RM10 base fee)
    </span>
  ) : null;
})()}
</div>
              </div>
            </div>
            {/* Manage User Button - Always visible */}
<div style={{
  marginTop: '16px',
  padding: '12px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  display: 'flex',
  gap: '8px'
}}>
  <button
    onClick={() => {
      setSelectedOrderForAction(userOrder || user);
      setShowOrderActionModal(true);
    }}
    style={{
      flex: 1,
      padding: '10px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: userOrder ? '#ef4444' : '#64748b',
      color: 'white',
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px'
    }}
  >
    <AlertCircle size={16} />
    {userOrder ? 'Manage Order' : 'Manage User'}
  </button>
</div>
          </div>
        );
      })}
    </div>
  ) : (
    <div style={{ 
      textAlign: 'center', 
      padding: '60px',
      color: '#64748b'
    }}>
      <Camera size={56} style={{ marginBottom: '20px' }} />
      <p style={{ fontSize: '18px' }}>No registered users today.</p>
    </div>
  )}
</div>
          
          {/* Charts */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: windowWidth <= 768 
              ? '1fr' 
              : 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: windowWidth <= 480 ? '12px' : '20px', 
            marginBottom: '32px',
            width: '100%',
            overflow: 'hidden'
          }}>
            <RechartsCharts
              type="bar"
              title="Today's Order Distribution by Amount"
              data={[
                { label: '<RM50', value: todayOrders.filter(o => o.orderTotal < 50).length, color: '#3b82f6' },
                { label: 'RM50-100', value: todayOrders.filter(o => o.orderTotal >= 50 && o.orderTotal < 100).length, color: '#10b981' },
                { label: 'RM100-150', value: todayOrders.filter(o => o.orderTotal >= 100 && o.orderTotal < 150).length, color: '#f59e0b' },
                { label: '>RM150', value: todayOrders.filter(o => o.orderTotal >= 150).length, color: '#ef4444' }
              ]}
            />

            <RechartsCharts
              type="pie"
              title="Today's Revenue Breakdown"
              data={[
                { label: 'Commitment Fees', value: todayUsers.filter(u => u.commitmentPaid).length * 10 },
                { label: 'Delivery Fees', value: todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0) }
              ]}
            />
          </div>
        </>
      ) : (
        <>
          {/* History View */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '32px', color: '#1e293b' }}>History Overview</h2>
              <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '16px' }}>
                All-time data and analytics
              </p>
            </div>
            <button
              onClick={() => setShowHistory(false)}
              style={{
                ...styles.button,
                width: 'auto',
                backgroundColor: '#64748b',
                color: 'white',
                padding: '14px 28px'
              }}
            >
              Back to Today
            </button>
          </div>

          {/* History Statistics */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: windowWidth <= 480 
              ? 'repeat(2, 1fr)' 
              : windowWidth <= 768 
              ? 'repeat(2, 1fr)' 
              : 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: windowWidth <= 480 ? '8px' : windowWidth <= 768 ? '12px' : '20px',
            marginBottom: windowWidth <= 480 ? '24px' : '32px' 
          }}>
            <div style={{
              ...styles.statCard,
              padding: windowWidth <= 480 ? '12px' : windowWidth <= 768 ? '16px' : '24px',
              gap: windowWidth <= 480 ? '8px' : '12px'
            }}>
              <div style={{ 
                ...styles.statIcon, 
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                width: windowWidth <= 480 ? '32px' : windowWidth <= 768 ? '40px' : '56px',
                height: windowWidth <= 480 ? '32px' : windowWidth <= 768 ? '40px' : '56px'
              }}>
                <Users size={windowWidth <= 480 ? 16 : windowWidth <= 768 ? 20 : 28} color="#3b82f6" />
              </div>
              <div style={styles.statContent}>
                <p style={{
                  ...styles.statLabel,
                  fontSize: windowWidth <= 480 ? '10px' : '12px'
                }}>Total Registered</p>
                <p style={{
                  ...styles.statValue,
                  fontSize: windowWidth <= 480 ? '16px' : windowWidth <= 768 ? '20px' : '24px'
                }}>{getTotalHistoryStats().totalRegistered}</p>
              </div>
            </div>

            <div style={{
              ...styles.statCard,
              padding: windowWidth <= 480 ? '12px' : windowWidth <= 768 ? '16px' : '24px',
              gap: windowWidth <= 480 ? '8px' : '12px'
            }}>
              <div style={{ 
                ...styles.statIcon, 
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                width: windowWidth <= 480 ? '32px' : windowWidth <= 768 ? '40px' : '56px',
                height: windowWidth <= 480 ? '32px' : windowWidth <= 768 ? '40px' : '56px'
              }}>
                <Package size={windowWidth <= 480 ? 16 : windowWidth <= 768 ? 20 : 28} color="#ef4444" />
              </div>
              <div style={styles.statContent}>
                <p style={{
                  ...styles.statLabel,
                  fontSize: windowWidth <= 480 ? '10px' : '12px'
                }}>Total Orders</p>
                <p style={{
                  ...styles.statValue,
                  fontSize: windowWidth <= 480 ? '16px' : windowWidth <= 768 ? '20px' : '24px'
                }}>{getTotalHistoryStats().totalOrders}</p>
              </div>
            </div>

            <div style={{
              ...styles.statCard,
              padding: windowWidth <= 480 ? '12px' : windowWidth <= 768 ? '16px' : '24px',
              gap: windowWidth <= 480 ? '8px' : '12px'
            }}>
              <div style={{ 
                ...styles.statIcon, 
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                width: windowWidth <= 480 ? '32px' : windowWidth <= 768 ? '40px' : '56px',
                height: windowWidth <= 480 ? '32px' : windowWidth <= 768 ? '40px' : '56px'
              }}>
                <DollarSign size={windowWidth <= 480 ? 16 : windowWidth <= 768 ? 20 : 28} color="#f59e0b" />
              </div>
              <div style={styles.statContent}>
                <p style={{
                  ...styles.statLabel,
                  fontSize: windowWidth <= 480 ? '10px' : '12px'
                }}>Total Revenue</p>
                <p style={{
                  ...styles.statValue,
                  fontSize: windowWidth <= 480 ? '16px' : windowWidth <= 768 ? '20px' : '24px'
                }}>
                  RM{getTotalHistoryStats().totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>

            <div style={{
              ...styles.statCard,
              padding: windowWidth <= 480 ? '12px' : windowWidth <= 768 ? '16px' : '24px',
              gap: windowWidth <= 480 ? '8px' : '12px'
            }}>
              <div style={{ 
                ...styles.statIcon, 
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                width: windowWidth <= 480 ? '32px' : windowWidth <= 768 ? '40px' : '56px',
                height: windowWidth <= 480 ? '32px' : windowWidth <= 768 ? '40px' : '56px'
              }}>
                <TrendingUp size={windowWidth <= 480 ? 16 : windowWidth <= 768 ? 20 : 28} color="#10b981" />
              </div>
              <div style={styles.statContent}>
                <p style={{
                  ...styles.statLabel,
                  fontSize: windowWidth <= 480 ? '10px' : '12px'
                }}>Total Profit</p>
                <p style={{
                  ...styles.statValue,
                  fontSize: windowWidth <= 480 ? '16px' : windowWidth <= 768 ? '20px' : '24px'
                }}>
                  RM{getTotalHistoryStats().totalProfit.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px',
            gap: '12px'
          }}>
            <button
              onClick={() => setTimePeriod('weeks')}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                backgroundColor: timePeriod === 'weeks' ? '#8b5cf6' : '#e2e8f0',
                color: timePeriod === 'weeks' ? 'white' : '#64748b',
                transition: 'all 0.3s ease'
              }}
            >
              By Weeks
            </button>
            <button
              onClick={() => setTimePeriod('months')}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                backgroundColor: timePeriod === 'months' ? '#8b5cf6' : '#e2e8f0',
                color: timePeriod === 'months' ? 'white' : '#64748b',
                transition: 'all 0.3s ease'
              }}
            >
              By Months
            </button>
          </div>

          {/* NEW: Time Series AVERAGE Profit Chart */}
          <div style={{ marginBottom: '32px' }}>
            <RechartsCharts // Changed to RechartsCharts
              type="line"
              title={`Average Profit Trend (${timePeriod === 'weeks' ? 'Last 7 Weeks' : 'Last 6 Months'})`}
              data={getTimSeriesProfitData(timePeriod)}
            />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(2, 1fr)',
            gap: '24px',
            marginBottom: '32px'
          }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                {/* Ensure 'Store' is imported from your icon library (e.g., lucide-react) */}
                <Store color="#8b5cf6" size={28} />
                <h3 style={{ ...styles.cardTitle, fontSize: '20px' }}>Most Ordered Merchant</h3>
              </div>
              <div style={{
                backgroundColor: '#f5f3ff',
                padding: '24px',
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                {/* Ensure 'mostOrderedMerchant' variable is defined in your component */}
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6', margin: 0 }}>
                  {mostOrderedMerchant.name}
                </p>
                <p style={{ fontSize: '18px', color: '#64748b', marginTop: '8px' }}>
                  {mostOrderedMerchant.orders} orders
                </p>
              </div>
            </div>
          </div>

{/* Money Distribution Section */}
<div style={styles.card}>
  <div style={styles.cardHeader}>
    <h2 style={{
      ...styles.cardTitle,
      fontSize: windowWidth <= 480 ? '18px' : windowWidth <= 768 ? '20px' : '24px'
    }}>
      Money Distribution Tracker
    </h2>
  </div>

  {/* Admin Name Display & Change Button */}
  <div style={{
    backgroundColor: '#f0f9ff',
    border: '2px solid #3b82f6',
    borderRadius: '12px',
    padding: windowWidth <= 480 ? '12px' : '16px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px'
  }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ 
        margin: '0 0 4px 0', 
        fontSize: windowWidth <= 480 ? '10px' : '13px', 
        color: '#64748b', 
        fontWeight: '600' 
      }}>
        Current Admin
      </p>
      <p style={{ 
        margin: 0, 
        fontSize: windowWidth <= 480 ? '14px' : '18px', 
        fontWeight: '700', 
        color: '#1e40af',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {systemSettings.adminName}
      </p>
    </div>
    <button
      onClick={handleChangeAdminName}
      style={{
        padding: windowWidth <= 480 ? '8px 12px' : '10px 20px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#3b82f6',
        color: 'white',
        fontWeight: '600',
        fontSize: windowWidth <= 480 ? '11px' : '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        whiteSpace: 'nowrap',
        flexShrink: 0
      }}
    >
      <Edit size={windowWidth <= 480 ? 14 : 16} />
      {windowWidth <= 480 ? 'Change' : 'Change Admin'}
    </button>
  </div>

  <div style={{
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  }}>
    <button
      onClick={handleAddDistribution}
      style={{
        flex: windowWidth <= 480 ? '1 1 100%' : '0 0 auto',
        padding: windowWidth <= 480 ? '12px 16px' : '14px 24px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        fontWeight: '600',
        fontSize: windowWidth <= 480 ? '14px' : '15px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
      }}
    >
      <span style={{ fontSize: '18px' }}>+</span> Record Distribution
    </button>

    <button
      onClick={() => setShowDistributionList(!showDistributionList)}
      style={{
        flex: windowWidth <= 480 ? '1 1 100%' : '0 0 auto',
        padding: windowWidth <= 480 ? '12px 16px' : '14px 24px',
        borderRadius: '12px',
        border: '2px solid #e5e7eb',
        background: 'white',
        color: '#64748b',
        fontWeight: '600',
        fontSize: windowWidth <= 480 ? '14px' : '15px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
    >
      {showDistributionList ? 'Hide' : 'View'} All Distributions ({moneyDistributions.length})
    </button>
  </div>

  {/* Summary Cards */}
  <div style={{
    display: 'grid',
    gridTemplateColumns: windowWidth <= 480 ? '1fr' : 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '20px'
  }}>
    {/* Total Distributed */}
<div style={{
  background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
  border: '2px solid #10b981',
  borderRadius: '12px',
  padding: windowWidth <= 480 ? '12px' : '16px'
}}>
  <div style={{
    fontSize: windowWidth <= 480 ? '11px' : '13px',
    color: '#065f46',
    fontWeight: '600',
    marginBottom: '6px'
  }}>
    Total Distributed
  </div>
  <div style={{
    fontSize: windowWidth <= 480 ? '18px' : '22px',
    fontWeight: 'bold',
    color: '#047857',
    wordBreak: 'break-word'
  }}>
    RM{moneyDistributions.reduce((sum, dist) => sum + (dist.totalAmount || 0), 0).toFixed(2)}
  </div>
</div>

{/* Available Balance */}
<div style={{
  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
  border: '2px solid #3b82f6',
  borderRadius: '12px',
  padding: windowWidth <= 480 ? '12px' : '16px'
}}>
  <div style={{
    fontSize: windowWidth <= 480 ? '11px' : '13px',
    color: '#1e40af',
    fontWeight: '600',
    marginBottom: '6px'
  }}>
    Available Balance
  </div>
  <div style={{
    fontSize: windowWidth <= 480 ? '18px' : '22px',
    fontWeight: 'bold',
    color: '#1e40af',
    wordBreak: 'break-word'
  }}>
    RM{(getTotalHistoryStats().totalProfit - 
        moneyDistributions.reduce((sum, dist) => sum + (dist.totalAmount || 0), 0)).toFixed(2)}
  </div>
</div>

{/* System Reserve Total */}
<div style={{
  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  border: '2px solid #f59e0b',
  borderRadius: '12px',
  padding: windowWidth <= 480 ? '12px' : '16px',
  gridColumn: windowWidth <= 768 && windowWidth > 480 ? 'span 2' : 'auto'
}}>
  <div style={{
    fontSize: windowWidth <= 480 ? '11px' : '13px',
    color: '#92400e',
    fontWeight: '600',
    marginBottom: '6px'
  }}>
    System Reserve (15%)
  </div>
  <div style={{
    fontSize: windowWidth <= 480 ? '18px' : '22px',
    fontWeight: 'bold',
    color: '#b45309',
    wordBreak: 'break-word'
  }}>
    RM{moneyDistributions.reduce((sum, dist) => 
      sum + (dist.distributions?.systemReserve?.amount || 0), 0
    ).toFixed(2)}
  </div>
</div>
  </div>

      {/* Distribution List */}
{showDistributionList && (
  <div style={{
    maxHeight: '500px',
    overflowY: 'auto',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: windowWidth <= 480 ? '12px' : '16px'
  }}>
    {loadingDistributions ? (
      <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '12px' }}>Loading distributions...</p>
      </div>
    ) : moneyDistributions.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
        <DollarSign size={48} style={{ marginBottom: '16px' }} />
        <p>No money distributions recorded yet.</p>
      </div>
    ) : (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {moneyDistributions.slice(0, visibleLossCount).map((distribution) => (
            <div
              key={distribution.id}
              style={{
                backgroundColor: '#f8fafc',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                padding: windowWidth <= 480 ? '12px' : '16px'
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div>
                  <span style={{
                    fontSize: windowWidth <= 480 ? '13px' : '18px',
                    color: '#64748b',
                    fontWeight: '500',
                    display: 'block',
                    marginBottom: '4px'
                  }}>
                    {new Date(distribution.date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span style={{
                    fontSize: windowWidth <= 480 ? '10px' : '15px',
                    color: '#94a3b8',
                    fontStyle: 'italic'
                  }}>
                    Admin: {distribution.adminName || 'N/A'}
                  </span>
                </div>
                <span style={{
                  fontSize: windowWidth <= 480 ? '18px' : '22px',
                  fontWeight: 'bold',
                  color: '#10b981'
                }}>
                  RM{distribution.totalAmount.toFixed(2)}
                </span>
              </div>

              {/* Compact Distribution Summary */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '12px'
              }}>
                {/* Admin */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: windowWidth <= 480 ? '8px 10px' : '10px 12px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '8px',
                  border: '1px solid #bfdbfe'
                }}>
                  <span style={{ 
                    fontSize: windowWidth <= 480 ? '12px' : '14px', 
                    color: '#1e40af',
                    fontWeight: '600'
                  }}>
                    Admin (5%)
                  </span>
                  <span style={{ 
                    fontSize: windowWidth <= 480 ? '13px' : '14px', 
                    fontWeight: '700', 
                    color: '#1e40af' 
                  }}>
                    RM{(distribution.distributions?.admin?.amount || 0).toFixed(2)}
                  </span>
                </div>

                {/* Co-Founders Combined */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: windowWidth <= 480 ? '8px 10px' : '10px 12px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <span style={{ 
                    fontSize: windowWidth <= 480 ? '11px' : '14px', 
                    color: '#64748b',
                    fontWeight: '600'
                  }}>
                    Founders (20% each)
                  </span>
                  <span style={{ 
                    fontSize: windowWidth <= 480 ? '12px' : '14px', 
                    fontWeight: '700', 
                    color: '#1e293b' 
                  }}>
                    RM{(
                      (distribution.distributions?.coFounder1?.amount || 0) 
                    ).toFixed(2)} x 4
                  </span>
                </div>

                {/* System Reserve */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: windowWidth <= 480 ? '8px 10px' : '10px 12px',
                  backgroundColor: '#fefce8',
                  borderRadius: '8px',
                  border: '2px solid #fbbf24'
                }}>
                  <span style={{ 
                    fontSize: windowWidth <= 480 ? '11px' : '13px', 
                    color: '#92400e',
                    fontWeight: '600'
                  }}>
                    System Reserve (15%)
                  </span>
                  <span style={{ 
                    fontSize: windowWidth <= 480 ? '12px' : '14px', 
                    fontWeight: '700', 
                    color: '#b45309' 
                  }}>
                    RM{(distribution.distributions?.systemReserve?.amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end',
                paddingTop: '12px',
                borderTop: '1px solid #e2e8f0',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => handleEditDistribution(distribution)}
                  style={{
                    padding: windowWidth <= 480 ? '8px 12px' : '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #3b82f6',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    cursor: 'pointer',
                    fontSize: windowWidth <= 480 ? '12px' : '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flex: windowWidth <= 480 ? '1' : '0'
                  }}
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteDistribution(distribution.id)}
                  style={{
                    padding: windowWidth <= 480 ? '8px 12px' : '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #ef4444',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    cursor: 'pointer',
                    fontSize: windowWidth <= 480 ? '12px' : '13px',
                    fontWeight: '600',
                    flex: windowWidth <= 480 ? '1' : '0'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {moneyDistributions.length > visibleLossCount && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={() => setVisibleLossCount(prev => prev + 3)}
              style={{
                padding: windowWidth <= 480 ? '10px 20px' : '12px 24px',
                borderRadius: '10px',
                border: '2px solid #3b82f6',
                backgroundColor: 'white',
                color: '#3b82f6',
                fontWeight: '600',
                fontSize: windowWidth <= 480 ? '13px' : '14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Load More ({moneyDistributions.length - visibleLossCount} remaining)
            </button>
          </div>
        )}

        {/* Show Less Button */}
        {visibleLossCount > 3 && (
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <button
              onClick={() => setVisibleLossCount(3)}
              style={{
                padding: windowWidth <= 480 ? '8px 16px' : '10px 20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                color: '#64748b',
                fontWeight: '600',
                fontSize: windowWidth <= 480 ? '12px' : '13px',
                cursor: 'pointer'
              }}
            >
              Show Less
            </button>
          </div>
        )}
      </>
    )}
  </div>
)}
</div>

{/* Distribution Modal */}
{showDistributionModal && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    padding: '20px'
  }}>
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: windowWidth <= 480 ? '20px' : '32px',
      maxWidth: '700px',
      width: '100%',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <DollarSign size={28} color="#10b981" />
        <h3 style={{
          margin: 0,
          fontSize: windowWidth <= 480 ? '20px' : '24px',
          color: '#1e293b',
          fontWeight: '700'
        }}>
          {editingDistribution ? 'Edit' : 'Record'} Money Distribution
        </h3>
      </div>

      {/* Info Box */}
      <div style={{
        backgroundColor: '#f0f9ff',
        border: '2px solid #3b82f6',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#1e40af', fontWeight: '600' }}>
          💡 Smart Distribution
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: '#0c4a6e', lineHeight: '1.6' }}>
          Enter the total amount, and the system will automatically calculate:
          <br/>• Admin: <strong>5%</strong>
          <br/>• Each Co-Founder: <strong>20%</strong> (4 people)
          <br/>• Reserve Fund: <strong>15%</strong> (emergency fund)
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '8px',
          fontSize: windowWidth <= 480 ? '14px' : '15px'
        }}>
          Total Amount to Distribute (RM):
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={distributionFormData.totalAmount}
          onChange={(e) => handleTotalAmountChange(e.target.value)}
          placeholder="Enter total amount (e.g., 1000)"
          style={{
            width: '100%',
            padding: windowWidth <= 480 ? '14px' : '16px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            fontSize: windowWidth <= 480 ? '16px' : '18px',
            boxSizing: 'border-box',
            fontWeight: '600'
          }}
        />
      </div>

      {/* Auto-Calculated Distribution Preview */}
      {distributionFormData.totalAmount && parseFloat(distributionFormData.totalAmount) > 0 && (
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#1e293b' }}>
            📊 Distribution Breakdown
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Admin */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 12px',
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #bfdbfe'
            }}>
              <span style={{ fontSize: '14px', color: '#1e40af' }}>
                {distributionFormData.distributions.admin.name} (5%)
              </span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e40af' }}>
                RM{distributionFormData.distributions.admin.amount.toFixed(2)}
              </span>
            </div>

            {/* Co-Founders */}
            {['coFounder1', 'coFounder2', 'coFounder3', 'coFounder4'].map((key) => (
              <div key={key} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>
                  {distributionFormData.distributions[key].name} (20%)
                </span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                  RM{distributionFormData.distributions[key].amount.toFixed(2)}
                </span>
              </div>
            ))}

            {/* Reserve Fund */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px',
              backgroundColor: '#fefce8',
              borderRadius: '8px',
              border: '2px solid #fbbf24'
            }}>
              <span style={{ fontSize: '14px', color: '#92400e', fontWeight: '600' }}>
                💰 Reserve Fund (15%)
              </span>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#b45309' }}>
                RM{distributionFormData.distributions.systemReserve.amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '8px',
          fontSize: windowWidth <= 480 ? '14px' : '15px'
        }}>
          Date:
        </label>
        <input
          type="date"
          value={distributionFormData.date}
          onChange={(e) => setDistributionFormData({ 
            ...distributionFormData, 
            date: e.target.value 
          })}
          style={{
            width: '100%',
            padding: windowWidth <= 480 ? '12px' : '14px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            fontSize: windowWidth <= 480 ? '15px' : '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '8px',
          fontSize: windowWidth <= 480 ? '14px' : '15px'
        }}>
          Admin Passcode:
        </label>
        <input
          type="password"
          value={distributionPasscode}
          onChange={(e) => setDistributionPasscode(e.target.value)}
          placeholder="Enter admin passcode"
          style={{
            width: '100%',
            padding: windowWidth <= 480 ? '12px' : '14px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            fontSize: windowWidth <= 480 ? '15px' : '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        flexDirection: windowWidth <= 480 ? 'column' : 'row'
      }}>
        <button
          onClick={() => {
            setShowDistributionModal(false);
            setDistributionPasscode('');
          }}
          style={{
            flex: 1,
            padding: windowWidth <= 480 ? '14px' : '16px',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            backgroundColor: 'white',
            color: '#64748b',
            fontWeight: '600',
            fontSize: windowWidth <= 480 ? '15px' : '16px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSaveDistribution}
          style={{
            flex: 1,
            padding: windowWidth <= 480 ? '14px' : '16px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            fontWeight: '600',
            fontSize: windowWidth <= 480 ? '15px' : '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          {editingDistribution ? 'Update' : 'Record'} Distribution
        </button>
      </div>
    </div>
  </div>
)}

{/* Admin Name Change Modal */}
{showAdminNameModal && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10001,
    padding: '20px'
  }}>
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: windowWidth <= 480 ? '20px' : '32px',
      maxWidth: '500px',
      width: '100%',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <Edit size={28} color="#3b82f6" />
        <h3 style={{
          margin: 0,
          fontSize: windowWidth <= 480 ? '20px' : '24px',
          color: '#1e293b',
          fontWeight: '700'
        }}>
          Change Admin Name
        </h3>
      </div>

      <div style={{
        backgroundColor: '#fef3c7',
        border: '2px solid #f59e0b',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '20px'
      }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#92400e', lineHeight: '1.5' }}>
          ⚠️ This will change the admin name for all future distributions. 
          Past distributions will retain their original admin name.
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '8px',
          fontSize: '15px'
        }}>
          New Admin Name:
        </label>
        <input
          type="text"
          value={tempAdminName}
          onChange={(e) => setTempAdminName(e.target.value)}
          placeholder="Enter new admin name"
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '8px',
          fontSize: '15px'
        }}>
          Admin Passcode:
        </label>
        <input
          type="password"
          value={adminNamePasscode}
          onChange={(e) => setAdminNamePasscode(e.target.value)}
          placeholder="Enter admin passcode"
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        flexDirection: windowWidth <= 480 ? 'column' : 'row'
      }}>
        <button
          onClick={() => {
            setShowAdminNameModal(false);
            setAdminNamePasscode('');
          }}
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            backgroundColor: 'white',
            color: '#64748b',
            fontWeight: '600',
            fontSize: '15px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSaveAdminName}
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: '#3b82f6',
            color: 'white',
            fontWeight: '600',
            fontSize: '15px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}

          {/* History Charts */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: windowWidth <= 768 
              ? '1fr' 
              : 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: windowWidth <= 480 ? '12px' : '20px', 
            marginBottom: '32px',
            width: '100%',
            overflow: 'hidden'
          }}>
            <RechartsCharts
              type="bar"
              title="Daily Orders Trend (Last 7 Days)"
              data={historyData.slice(0, 7).reverse().map(entry => ({
                label: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: entry.totalOrders || 0,
                color: '#3b82f6'
              }))}
            />

            <RechartsCharts
              type="bar"
              title="Daily Profit Trend (Last 7 Days)"
              data={historyData.slice(0, 7).reverse().map(entry => ({
                label: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: entry.profit || 0,
                color: entry.profit >= 0 ? '#10b981' : '#ef4444'
              }))}
            />
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: windowWidth <= 768 
              ? '1fr' 
              : 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: windowWidth <= 480 ? '12px' : '20px', 
            marginBottom: '32px',
            width: '100%',
            overflow: 'hidden'
          }}>
            <RechartsCharts
              type="bar"
              title="Monthly Order Trends"
              data={(() => {
                const monthlyData = {};
                historyData.forEach(entry => {
                  const month = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  if (!monthlyData[month]) {
                    monthlyData[month] = 0;
                  }
                  monthlyData[month] += entry.totalOrders || 0;
                });
                
                return Object.entries(monthlyData)
                  .slice(-6)
                  .map(([month, orders]) => ({
                    label: month,
                    value: orders,
                    color: '#3b82f6'
                  }));
              })()}
            />

            <RechartsCharts
              type="bar"
              title="Monthly Profit Trends"
              data={(() => {
                const monthlyData = {};
                historyData.forEach(entry => {
                  const month = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  if (!monthlyData[month]) {
                    monthlyData[month] = 0;
                  }
                  monthlyData[month] += entry.profit || 0;
                });
                
                return Object.entries(monthlyData)
                  .slice(-6)
                  .map(([month, profit]) => ({
                    label: month,
                    value: profit,
                    color: profit >= 0 ? '#10b981' : '#ef4444'
                  }));
              })()}
            />
          </div>
          <div style={{ marginBottom: '32px' }}>
            <RechartsCharts
              type="bar" // Use a bar chart for this
              title="Average Order Price by Merchant (All Time)"
              data={getAverageOrderPriceByMerchant()}
            />
          </div>

          {/* Emergency Loss */}
<div style={styles.card}>
  <div style={styles.cardHeader}>
    <AlertCircle color="#ef4444" size={28} />
    <h2 style={styles.cardTitle}>Emergency Loss</h2>
  </div>

  <div style={{
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  }}>
    <button
      onClick={handleAddLoss}
      style={{
        flex: windowWidth <= 480 ? '1 1 100%' : '0 0 auto',
        padding: windowWidth <= 480 ? '12px 16px' : '14px 24px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: 'white',
        fontWeight: '600',
        fontSize: windowWidth <= 480 ? '14px' : '15px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
      }}
    >
      <span style={{ fontSize: '18px' }}>+</span> Add Emergency Loss
    </button>

    <button
      onClick={() => setShowLossList(!showLossList)}
      style={{
        flex: windowWidth <= 480 ? '1 1 100%' : '0 0 auto',
        padding: windowWidth <= 480 ? '12px 16px' : '14px 24px',
        borderRadius: '12px',
        border: '2px solid #e5e7eb',
        background: 'white',
        color: '#64748b',
        fontWeight: '600',
        fontSize: windowWidth <= 480 ? '14px' : '15px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
    >
      {showLossList ? 'Hide' : 'View'} All Losses ({emergencyLosses.length})
    </button>
  </div>

  {/* Emergency Loss Summary */}
  <div style={{
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    border: '2px solid #ef4444',
    borderRadius: '12px',
    padding: windowWidth <= 480 ? '16px' : '20px',
    marginBottom: '20px'
  }}>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      <div>
        <p style={{
          margin: 0,
          fontSize: windowWidth <= 480 ? '13px' : '14px',
          color: '#991b1b',
          fontWeight: '600'
        }}>
          Total Emergency Losses
        </p>
        <p style={{
          margin: '4px 0 0 0',
          fontSize: windowWidth <= 480 ? '11px' : '12px',
          color: '#dc2626'
        }}>
          {emergencyLosses.length} entries recorded
        </p>
      </div>
      <div style={{
        fontSize: windowWidth <= 480 ? '16px' : '24px',
        fontWeight: 'bold',
        color: '#991b1b'
      }}>
        -RM{emergencyLosses.reduce((sum, loss) => sum + (loss.amount || 0), 0).toFixed(2)}
      </div>
    </div>
  </div>

  {/* Loss List */}
  {showLossList && (
    <div style={{
      maxHeight: '400px',
      overflowY: 'auto',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: windowWidth <= 480 ? '12px' : '16px'
    }}>
      {loadingLosses ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '12px' }}>Loading losses...</p>
        </div>
      ) : emergencyLosses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <AlertCircle size={48} style={{ marginBottom: '16px' }} />
          <p>No emergency losses recorded yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {emergencyLosses.map((loss) => (
            <div
              key={loss.id}
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: windowWidth <= 480 ? '12px' : '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <span style={{
                    fontSize: windowWidth <= 480 ? '12px' : '13px',
                    color: '#64748b',
                    fontWeight: '500'
                  }}>
                    {new Date(loss.date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span style={{
                    fontSize: windowWidth <= 480 ? '16px' : '18px',
                    fontWeight: 'bold',
                    color: '#ef4444'
                  }}>
                    -RM{loss.amount.toFixed(2)}
                  </span>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: windowWidth <= 480 ? '13px' : '14px',
                  color: '#1e293b',
                  fontWeight: '500',
                  wordBreak: 'break-word'
                }}>
                  {loss.reason}
                </p>
              </div>
              <div style={{
                display: 'flex',
                gap: '8px',
                flexShrink: 0
              }}>
                <button
                  onClick={() => handleEditLoss(loss)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #3b82f6',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteLoss(loss.id)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #ef4444',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}
</div>

          {/* History Table */}
          <div style={styles.card}>
            <h3 style={{ fontSize: '22px', marginBottom: '24px' }}>Daily History</h3>
            {historyData.length === 0 ? (
  <div style={{ 
    textAlign: 'center', 
    padding: '60px',
    color: '#64748b'
  }}>
    <History size={56} style={{ marginBottom: '20px' }} />
    <p style={{ fontSize: '18px' }}>No history data available yet.</p>
  </div>
) : (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  }}>
    {localHistoryData
  .filter(entry => {
    // Only show entries for actual delivery days
    const entryDate = new Date(entry.date + 'T00:00:00');
    const dayOfWeek = entryDate.getDay();
    
    // Don't show future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (entryDate > today) {
      return false; // Hide future entries
    }
    
    return [2, 5].includes(dayOfWeek); // Only Tuesday and Friday
  })
  .map((entry, index) => (
      <div key={index} style={{
        backgroundColor: '#f8fafc',
        border: '2px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        transition: 'all 0.3s ease',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h4 style={{ 
            margin: 0, 
            fontSize: '18px', 
            color: '#1e293b',
            fontWeight: '600'
          }}>
            {new Date(entry.date).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </h4>
          <span style={{
            backgroundColor: entry.profit >= 0 ? '#d1fae5' : '#fee2e2',
            color: entry.profit >= 0 ? '#065f46' : '#991b1b',
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            {entry.profit >= 0 ? 'Profit' : 'Loss'}
          </span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: '8px'
          }}>
            <span style={{ color: '#64748b', fontSize: '14px' }}>Orders</span>
            <span style={{ fontWeight: '600', color: '#1e293b' }}>{entry.totalOrders || 0}</span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: '8px'
          }}>
            <span style={{ color: '#64748b', fontSize: '14px' }}>Revenue</span>
            <span style={{ fontWeight: '600', color: '#059669' }}>
              RM{(entry.totalRevenue || 0).toFixed(2)}
            </span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: entry.profit >= 0 ? '#f0fdf4' : '#fef2f2',
            borderRadius: '8px',
            border: `2px solid ${entry.profit >= 0 ? '#86efac' : '#fecaca'}`
          }}>
            <span style={{ 
              color: entry.profit >= 0 ? '#047857' : '#991b1b', 
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Profit
            </span>
            <span style={{ 
              fontWeight: 'bold', 
              color: entry.profit >= 0 ? '#047857' : '#991b1b'
            }}>
              RM{(entry.profit || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={() => handleEditClick(entry)}
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
          }}
        >
          <Edit size={18} />
          Edit Data
        </button>
      </div>
    ))}
  </div>
)}
          </div>
        </>
      )}
      {showConfirmPopup && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  }}>
    <div style={{
      backgroundColor: '#fff',
      padding: '24px',
      borderRadius: '12px',
      maxWidth: '90%',
      width: '320px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
    }}>
      <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>
        Clear all saved sessions?
      </h3>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
        This will log out all users. Are you sure?
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          style={{
            backgroundColor: '#ef4444',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Confirm
        </button>
        <button
          onClick={() => setShowConfirmPopup(false)}
          style={{
            backgroundColor: '#f1f5f9',
            color: '#334155',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
{showExtendModal && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    padding: '20px'
  }}>
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: windowWidth <= 480 ? '20px' : '32px',
      maxWidth: '500px',
      width: '100%',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <Clock size={28} color="#f59e0b" />
        <h3 style={{
          margin: 0,
          fontSize: windowWidth <= 480 ? '20px' : '24px',
          color: '#1e293b',
          fontWeight: '700'
        }}>
          Extend System Hours
        </h3>
      </div>

      <div style={{
        backgroundColor: '#fef3c7',
        border: '2px solid #f59e0b',
        borderRadius: '12px',
        padding: windowWidth <= 480 ? '12px' : '16px',
        marginBottom: '20px'
      }}>
        <p style={{
          margin: 0,
          fontSize: windowWidth <= 480 ? '13px' : '14px',
          color: '#92400e',
          lineHeight: '1.5'
        }}>
          ⚠️ This will keep the system open beyond the normal 3:00 PM cutoff. Maximum extension: 4:30 PM.
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
  <label style={{
    display: 'block',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
    fontSize: windowWidth <= 480 ? '14px' : '15px'
  }}>
    Extend Until (Time):
  </label>
  <select
    value={extendUntilTime}
    onChange={(e) => setExtendUntilTime(e.target.value)}
    style={{
      width: '100%',
      padding: windowWidth <= 480 ? '12px' : '14px',
      borderRadius: '10px',
      border: '2px solid #e2e8f0',
      fontSize: windowWidth <= 480 ? '15px' : '16px',
      fontWeight: '600',
      boxSizing: 'border-box',
      backgroundColor: 'white',
      cursor: 'pointer'
    }}
  >
    <option value="15:15">3:15 PM</option>
    <option value="15:30">3:30 PM</option>
    <option value="15:45">3:45 PM</option>
    <option value="16:00">4:00 PM</option>
    <option value="16:15">4:15 PM</option>
    <option value="16:30">4:30 PM</option>
  </select>
        <p style={{
          margin: '8px 0 0 0',
          fontSize: '14px',
          color: '#64748b'
        }}>
          Select a time between 3:00 PM and 4:30 PM
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '8px',
          fontSize: windowWidth <= 480 ? '14px' : '15px'
        }}>
          Admin Passcode:
        </label>
        <input
          type="password"
          value={adminPasscodeInput}
          onChange={(e) => setAdminPasscodeInput(e.target.value)}
          placeholder="Enter admin passcode"
          style={{
            width: '100%',
            padding: windowWidth <= 480 ? '12px' : '14px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            fontSize: windowWidth <= 480 ? '15px' : '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        flexDirection: windowWidth <= 480 ? 'column' : 'row'
      }}>
        <button
          onClick={() => {
            setShowExtendModal(false);
            setAdminPasscodeInput('');
          }}
          style={{
            flex: 1,
            padding: windowWidth <= 480 ? '14px' : '16px',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            backgroundColor: 'white',
            color: '#64748b',
            fontWeight: '600',
            fontSize: windowWidth <= 480 ? '15px' : '16px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleExtendSystem}
          style={{
            flex: 1,
            padding: windowWidth <= 480 ? '14px' : '16px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            fontWeight: '600',
            fontSize: windowWidth <= 480 ? '15px' : '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}
        >
          Extend System
        </button>
      </div>
    </div>
  </div>
)}
{showOpenSystemModal && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    padding: '20px'
  }}>
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: windowWidth <= 480 ? '20px' : '32px',
      maxWidth: '500px',
      width: '100%',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <UserCheck size={28} color="#10b981" />
        <h3 style={{
          margin: 0,
          fontSize: windowWidth <= 480 ? '20px' : '24px',
          color: '#1e293b',
          fontWeight: '700'
        }}>
          Open System Early
        </h3>
      </div>

      <div style={{
        backgroundColor: '#d1fae5',
        border: '2px solid #10b981',
        borderRadius: '12px',
        padding: windowWidth <= 480 ? '12px' : '16px',
        marginBottom: '20px'
      }}>
        <p style={{
          margin: '0 0 12px 0',
          fontSize: windowWidth <= 480 ? '13px' : '14px',
          color: '#065f46',
          lineHeight: '1.5',
          fontWeight: '600'
        }}>
          ⚠️ Current Status:
        </p>
        <p style={{
          margin: 0,
          fontSize: windowWidth <= 480 ? '13px' : '14px',
          color: '#065f46',
          lineHeight: '1.5'
        }}>
          • Paid Users: <strong>{todayUsers.filter(u => u.commitmentPaid).length}</strong><br/>
          • This will allow paid users to submit orders before reaching 3 users<br/>
          • 3rd user joining will need to pay RM10 deposit (with RM10 deducted from delivery)<br/>
          • 4th+ users join normally (no deposit, no deduction)
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '8px',
          fontSize: windowWidth <= 480 ? '14px' : '15px'
        }}>
          Admin Passcode:
        </label>
        <input
          type="password"
          value={openSystemPasscode}
          onChange={(e) => setOpenSystemPasscode(e.target.value)}
          placeholder="Enter admin passcode"
          style={{
            width: '100%',
            padding: windowWidth <= 480 ? '12px' : '14px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            fontSize: windowWidth <= 480 ? '15px' : '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        flexDirection: windowWidth <= 480 ? 'column' : 'row'
      }}>
        <button
          onClick={() => {
            setShowOpenSystemModal(false);
            setOpenSystemPasscode('');
          }}
          style={{
            flex: 1,
            padding: windowWidth <= 480 ? '14px' : '16px',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            backgroundColor: 'white',
            color: '#64748b',
            fontWeight: '600',
            fontSize: windowWidth <= 480 ? '15px' : '16px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleOpenSystem}
          style={{
            flex: 1,
            padding: windowWidth <= 480 ? '14px' : '16px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            fontWeight: '600',
            fontSize: windowWidth <= 480 ? '15px' : '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          Open System
        </button>
      </div>
    </div>
  </div>
)}
<EditHistoryModal
      isOpen={isEditModalOpen}
      onClose={() => setIsEditModalOpen(false)}
      entry={editingEntry}
      onSave={handleSaveChanges}
      adminPasscode={'byycky'} // Your admin passcode
    />

    {/* Emergency Loss Modal */}
{showLossModal && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    padding: '20px'
  }}>
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: windowWidth <= 480 ? '20px' : '32px',
      maxWidth: '500px',
      width: '100%',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <AlertCircle size={28} color="#ef4444" />
        <h3 style={{
          margin: 0,
          fontSize: windowWidth <= 480 ? '20px' : '24px',
          color: '#1e293b',
          fontWeight: '700'
        }}>
          {editingLoss ? 'Edit' : 'Add'} Emergency Loss
        </h3>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '8px',
          fontSize: windowWidth <= 480 ? '14px' : '15px'
        }}>
          Loss Amount (RM):
        </label>
        <input
          type="number"
          min="0"
          value={lossFormData.amount}
          onChange={(e) => setLossFormData({ ...lossFormData, amount: e.target.value })}
          placeholder="Enter amount"
          style={{
            width: '100%',
            padding: windowWidth <= 480 ? '12px' : '14px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            fontSize: windowWidth <= 480 ? '15px' : '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '8px',
          fontSize: windowWidth <= 480 ? '14px' : '15px'
        }}>
          Reason:
        </label>
        <textarea
          value={lossFormData.reason}
          onChange={(e) => setLossFormData({ ...lossFormData, reason: e.target.value })}
          placeholder="Describe the emergency loss..."
          rows="4"
          style={{
            width: '100%',
            padding: windowWidth <= 480 ? '12px' : '14px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            fontSize: windowWidth <= 480 ? '15px' : '16px',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '8px',
          fontSize: windowWidth <= 480 ? '14px' : '15px'
        }}>
          Date:
        </label>
        <input
          type="date"
          value={lossFormData.date}
          onChange={(e) => setLossFormData({ ...lossFormData, date: e.target.value })}
          style={{
            width: '100%',
            padding: windowWidth <= 480 ? '12px' : '14px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            fontSize: windowWidth <= 480 ? '15px' : '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '8px',
          fontSize: windowWidth <= 480 ? '14px' : '15px'
        }}>
          Admin Passcode:
        </label>
        <input
          type="password"
          value={lossPasscode}
          onChange={(e) => setLossPasscode(e.target.value)}
          placeholder="Enter admin passcode"
          style={{
            width: '100%',
            padding: windowWidth <= 480 ? '12px' : '14px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            fontSize: windowWidth <= 480 ? '15px' : '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        flexDirection: windowWidth <= 480 ? 'column' : 'row'
      }}>
        <button
          onClick={() => {
            setShowLossModal(false);
            setLossPasscode('');
          }}
          style={{
            flex: 1,
            padding: windowWidth <= 480 ? '14px' : '16px',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            backgroundColor: 'white',
            color: '#64748b',
            fontWeight: '600',
            fontSize: windowWidth <= 480 ? '15px' : '16px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSaveLoss}
          style={{
            flex: 1,
            padding: windowWidth <= 480 ? '14px' : '16px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            fontWeight: '600',
            fontSize: windowWidth <= 480 ? '15px' : '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
          }}
        >
          {editingLoss ? 'Update' : 'Add'} Loss
        </button>
      </div>
    </div>
  </div>
)}
{/* Order Action Modal */}
{showOrderActionModal && selectedOrderForAction && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    padding: '20px'
  }}>
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: windowWidth <= 480 ? '20px' : '32px',
      maxWidth: '500px',
      width: '100%',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <AlertCircle size={28} color="#ef4444" />
        <h3 style={{
          margin: 0,
          fontSize: windowWidth <= 480 ? '20px' : '24px',
          color: '#1e293b',
          fontWeight: '700'
        }}>
          {selectedOrderForAction.orderNumber ? `Manage Order #${selectedOrderForAction.orderNumber}` : `Manage User: ${selectedOrderForAction.name}`}
        </h3>
      </div>

      <div style={{
        backgroundColor: '#f8fafc',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          <strong>Student:</strong> {selectedOrderForAction.userName || selectedOrderForAction.name}
        </p>
        {selectedOrderForAction.orderTotal && (
          <>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Order Total:</strong> RM{selectedOrderForAction.orderTotal.toFixed(2)}
            </p>
            <p style={{ margin: '0' }}>
              <strong>Vendor:</strong> {selectedOrderForAction.vendor}
            </p>
          </>
        )}
        {!selectedOrderForAction.orderTotal && (
          <p style={{ margin: '0', color: '#64748b' }}>
            This user has not submitted an order yet.
          </p>
        )}
      </div>

      <div style={{
        backgroundColor: '#fef2f2',
        border: '2px solid #ef4444',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <p style={{
          margin: 0,
          fontSize: '13px',
          color: '#991b1b',
          lineHeight: '1.5'
        }}>
          ⚠️ <strong>Warning:</strong> {selectedOrderForAction.orderNumber 
            ? 'Deleting this order will remove it from the driver\'s view and all system records. This action cannot be undone.'
            : 'Deleting this user will remove their registration and any associated order data. This action cannot be undone.'}
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        flexDirection: windowWidth <= 480 ? 'column' : 'row'
      }}>
        <button
          onClick={() => {
            setShowOrderActionModal(false);
            setSelectedOrderForAction(null);
          }}
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            backgroundColor: 'white',
            color: '#64748b',
            fontWeight: '600',
            fontSize: '15px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (selectedOrderForAction.orderNumber) {
              handleDeleteOrder(selectedOrderForAction.id);
            } else {
              handleDeleteUser(selectedOrderForAction.firestoreId);
            }
          }}
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            fontWeight: '600',
            fontSize: '15px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
          }}
        >
          {selectedOrderForAction.orderNumber ? 'Delete Order' : 'Delete User'}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default AdminTab;