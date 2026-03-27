/**
 * Cancellation and Refund Policy
 * 
 * Time-based refund percentages:
 * - 24+ hours before: 100% refund
 * - 6-24 hours before: 75% refund
 * - 2-6 hours before: 50% refund
 * - Less than 2 hours: 25% refund
 * - After departure: No refund
 */

export interface RefundCalculation {
  isEligible: boolean;
  refundPercentage: number;
  refundAmount: number;
  originalAmount: number;
  reason: string;
  hoursUntilDeparture: number;
}

/**
 * Calculate refund amount based on cancellation time
 */
export function calculateRefund(
  departureTime: Date,
  totalPrice: number,
  cancellationTime: Date = new Date()
): RefundCalculation {
  const msUntilDeparture = departureTime.getTime() - cancellationTime.getTime();
  const hoursUntilDeparture = msUntilDeparture / (1000 * 60 * 60);

  // No refund if already departed
  if (hoursUntilDeparture <= 0) {
    return {
      isEligible: false,
      refundPercentage: 0,
      refundAmount: 0,
      originalAmount: totalPrice,
      reason: "Ride has already departed. No refund available.",
      hoursUntilDeparture,
    };
  }

  let refundPercentage = 0;
  let reason = "";

  if (hoursUntilDeparture >= 24) {
    refundPercentage = 100;
    reason = "Full refund: Cancelled 24+ hours in advance";
  } else if (hoursUntilDeparture >= 6) {
    refundPercentage = 75;
    reason = "75% refund: Cancelled 6-24 hours in advance";
  } else if (hoursUntilDeparture >= 2) {
    refundPercentage = 50;
    reason = "50% refund: Cancelled 2-6 hours in advance";
  } else {
    refundPercentage = 25;
    reason = "25% refund: Cancelled less than 2 hours in advance";
  }

  const refundAmount = Math.floor((totalPrice * refundPercentage) / 100);

  return {
    isEligible: true,
    refundPercentage,
    refundAmount,
    originalAmount: totalPrice,
    reason,
    hoursUntilDeparture,
  };
}

/**
 * Format refund message for users
 */
export function formatRefundMessage(refund: RefundCalculation): string {
  if (!refund.isEligible) {
    return refund.reason;
  }

  const hours = Math.floor(refund.hoursUntilDeparture);
  const mins = Math.floor((refund.hoursUntilDeparture - hours) * 60);
  
  return `${refund.reason}. You will receive ₦${(refund.refundAmount / 100).toLocaleString()} (${refund.refundPercentage}% of ₦${(refund.originalAmount / 100).toLocaleString()}) within 5-7 business days.`;
}
