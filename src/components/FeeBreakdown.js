import React from 'react';
// IMPORT your specific delivery fee logic from the correct file.
import { calculateDeliveryFee } from '../utils/calculateDeliveryFee';

const FeeBreakdown = ({
  orderTotal,
  isEligibleForDeduction // It accepts the simple true/false value from StudentTab
}) => {
  
  // --- This is the corrected logic ---
  // It now uses YOUR imported function.
  const deliveryFee = calculateDeliveryFee(orderTotal);

  // ✅ FIX: The typo is removed. It now correctly uses the prop.
  const commitmentFeeDeducted = (isEligibleForDeduction && deliveryFee > 0) ? 10 : 0;
  
  const amountToPay = Math.max(0, deliveryFee - commitmentFeeDeducted);
  // --- End of corrected logic ---

  return (
    <div style={{
        backgroundColor: '#fffbeb',
        padding: '24px',
        borderRadius: '16px',
        border: '2px solid #fbbf24',
        marginBottom: '20px'
    }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#92400e', fontSize: '18px' }}>Fee Breakdown</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0' }}>
            <span>Order Total:</span>
            <span>RM{orderTotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0' }}>
            <span>Delivery Fee:</span>
            <span>RM{deliveryFee.toFixed(2)}</span>
        </div>

        {commitmentFeeDeducted > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0', color: '#059669', fontWeight: 'bold' }}>
                <span>Base Fee Deduction:</span>
                <span>- RM{commitmentFeeDeducted.toFixed(2)}</span>
            </div>
        )}

        <hr style={{ margin: '16px 0 12px 0', border: 0, borderTop: '2px dashed #fbbf24' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0', fontSize: '18px', fontWeight: 'bold' }}>
            <span>Amount to Pay:</span>
            <span>RM{amountToPay.toFixed(2)}</span>
        </div>
    </div>
  );
};

export default FeeBreakdown;