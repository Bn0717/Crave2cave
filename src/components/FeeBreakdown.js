import React from 'react';
import { calculateDeliveryFee } from '../utils/calculateDeliveryFee';

const FeeBreakdown = ({ orderTotal, userIndex, isCommitmentFeePaid, registrationOrder, selectedUserId }) => {
    const userOrder = registrationOrder.find(order => order.userId === selectedUserId);
    const isFourthOrLaterUser = userOrder ? userOrder.order >= 4 : userIndex >= 3;

    const deliveryFee = calculateDeliveryFee(orderTotal);
    const commitmentFeeDeducted = (!isFourthOrLaterUser && userIndex < 3 && isCommitmentFeePaid && deliveryFee > 0) ? 10 : 0;
    const actualDeliveryFee = Math.max(0, deliveryFee - commitmentFeeDeducted);

    return (
        <div style={{
            backgroundColor: '#fef3c7',
            padding: '24px',
            borderRadius: '16px',
            border: '2px solid #fbbf24',
            marginBottom: '20px'
        }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#92400e', fontSize: '18px' }}>Fee Breakdown</h4>
            <p style={{ margin: '6px 0' }}>Order Total: RM{orderTotal.toFixed(2)}</p>
            <p style={{ margin: '6px 0' }}>Delivery Fee: RM{deliveryFee.toFixed(2)}</p>
            {commitmentFeeDeducted > 0 && (
                <p style={{ margin: '6px 0', color: '#059669' }}>Commitment Fee Deduction: -RM{commitmentFeeDeducted.toFixed(2)}</p>
            )}
            <hr style={{ margin: '12px 0', borderColor: '#fbbf24' }} />
            <p style={{ margin: '6px 0', fontSize: '18px' }}>
                <strong>Amount to Pay: RM{actualDeliveryFee.toFixed(2)}</strong>
            </p>
        </div>
    );
};

export default FeeBreakdown;